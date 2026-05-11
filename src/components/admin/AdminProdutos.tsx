import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Produto, getLojaLabel, getCategoriaLabel, formatBRL } from "@/lib/produto";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, RefreshCw, Pencil, Trash2, Search, Sparkles } from "lucide-react";

export function AdminProdutos() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [platFilter, setPlatFilter] = useState<string>("todos");
  const [editing, setEditing] = useState<Produto | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncReport, setSyncReport] = useState<{ total: number; disponiveis: number; indisponiveis: number; erros: number } | null>(null);
  const [categorizing, setCategorizing] = useState<Set<string>>(new Set());
  const [bulkCategorizing, setBulkCategorizing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ["admin-produtos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("criado_em", { ascending: false });
      if (error) throw error;
      return data as Produto[];
    },
  });

  const filtrados = useMemo(() => {
    return produtos.filter((p) => {
      if (platFilter !== "todos" && p.plataforma !== platFilter) return false;
      if (search && !p.nome.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [produtos, platFilter, search]);

  const categoriasExistentes = useMemo(() => {
    const cats = new Set(produtos.map((p) => p.categoria).filter(Boolean));
    return Array.from(cats).sort();
  }, [produtos]);

  const lojasExistentes = useMemo(() => {
    const stores = new Set(produtos.map((p) => p.plataforma).filter(Boolean));
    return Array.from(stores).sort();
  }, [produtos]);



  // Auto-categoriza um único produto via Edge Function
  const autoCategorizar = async (produto: Produto) => {
    setCategorizing((prev) => new Set(prev).add(produto.id));
    try {
      const { data, error } = await supabase.functions.invoke("categorize-produto", {
        body: { nome: produto.nome, produto_id: produto.id },
      });
      if (error) throw error;
      toast.success(`Categorizado como "${getCategoriaLabel(data.categoria)}"`  , {
        description: produto.nome.slice(0, 60),
      });
      qc.invalidateQueries({ queryKey: ["admin-produtos"] });
    } catch (err) {
      toast.error("Erro ao categorizar", {
        description: err instanceof Error ? err.message : "Erro desconhecido",
      });
    } finally {
      setCategorizing((prev) => {
        const next = new Set(prev);
        next.delete(produto.id);
        return next;
      });
    }
  };

  // Auto-categoriza todos os produtos com categoria 'outros'
  const autoCategoriarTodos = async () => {
    const semCategoria = produtos.filter((p) => !p.categoria || p.categoria === "outros");
    if (semCategoria.length === 0) {
      toast.info("Nenhum produto sem categoria!");
      return;
    }
    setBulkCategorizing(true);
    setBulkProgress(0);
    let ok = 0;
    for (let i = 0; i < semCategoria.length; i++) {
      const p = semCategoria[i];
      try {
        await supabase.functions.invoke("categorize-produto", {
          body: { nome: p.nome, produto_id: p.id },
        });
        ok++;
      } catch {
        // ignora erros individuais
      }
      setBulkProgress(Math.round(((i + 1) / semCategoria.length) * 100));
    }
    setBulkCategorizing(false);
    setBulkProgress(0);
    toast.success("Auto-categorização concluída", {
      description: `${ok} de ${semCategoria.length} produtos categorizados`,
    });
    qc.invalidateQueries({ queryKey: ["admin-produtos"] });
  };

  const toggleField = async (id: string, field: "ativo" | "disponivel" | "destaque", value: boolean) => {
    const updates: { ativo?: boolean; disponivel?: boolean; destaque?: boolean } = { [field]: value };
    const { error } = await supabase.from("produtos").update(updates).eq("id", id);
    if (error) toast.error("Erro ao atualizar", { description: error.message });
    else qc.invalidateQueries({ queryKey: ["admin-produtos"] });
  };

  const deleteProduto = async (id: string) => {
    if (!confirm("Excluir este produto? Esta ação não pode ser desfeita.")) return;
    const { error } = await supabase.from("produtos").delete().eq("id", id);
    if (error) toast.error("Erro", { description: error.message });
    else {
      toast.success("Produto excluído");
      qc.invalidateQueries({ queryKey: ["admin-produtos"] });
    }
  };

  const saveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    const fd = new FormData(e.currentTarget);
    const updates = {
      nome: fd.get("nome") as string,
      preco: parseFloat(fd.get("preco") as string),
      preco_original: fd.get("preco_original") ? parseFloat(fd.get("preco_original") as string) : null,
      imagem_url: fd.get("imagem_url") as string,
      link_short: fd.get("link_short") as string || null,
      link_afiliado: fd.get("link_afiliado") as string,
      plataforma: fd.get("plataforma") as string,
      copy_gemini: fd.get("copy_gemini") as string || null,
      categoria: fd.get("categoria") as any,
    };

    const { error } = await supabase.from("produtos").update(updates).eq("id", editing.id);
    if (error) toast.error("Erro", { description: error.message });
    else {
      toast.success("Produto atualizado");
      qc.invalidateQueries({ queryKey: ["admin-produtos"] });
      setEditing(null);
    }
  };

  const sincronizar = async () => {
    setSyncing(true);
    setSyncProgress(15);
    setSyncReport(null);
    const interval = setInterval(() => setSyncProgress((p) => Math.min(p + 5, 90)), 800);
    try {
      const { data, error } = await supabase.functions.invoke("sync-produtos");
      clearInterval(interval);
      setSyncProgress(100);
      if (error) throw error;
      setSyncReport(data);
      toast.success("Sincronização concluída", {
        description: `${data.disponiveis} disponíveis · ${data.indisponiveis} indisponíveis · ${data.erros} erros`,
      });
      qc.invalidateQueries({ queryKey: ["admin-produtos"] });
    } catch (err) {
      clearInterval(interval);
      toast.error("Erro na sincronização", {
        description: err instanceof Error ? err.message : "Erro desconhecido",
      });
    } finally {
      setTimeout(() => { setSyncing(false); setSyncProgress(0); }, 1500);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={platFilter} onValueChange={setPlatFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as Lojas</SelectItem>
              {lojasExistentes.map((loja) => (
                <SelectItem key={loja} value={loja}>{getLojaLabel(loja)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={sincronizar} disabled={syncing} variant="hero" className="gap-1.5">
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Sincronizar todos
          </Button>

          <Button
            onClick={autoCategoriarTodos}
            disabled={bulkCategorizing}
            variant="outline"
            className="gap-1.5"
          >
            {bulkCategorizing
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Sparkles className="h-4 w-4 text-violet-500" />}
            Auto-categorizar
          </Button>
        </div>
        {syncing && (
          <div className="mt-3">
            <Progress value={syncProgress} />
            <p className="mt-1 text-xs text-muted-foreground">Verificando links dos produtos...</p>
          </div>
        )}
        {bulkCategorizing && (
          <div className="mt-3">
            <Progress value={bulkProgress} className="[&>div]:bg-violet-500" />
            <p className="mt-1 text-xs text-muted-foreground">Classificando com IA... {bulkProgress}%</p>
          </div>
        )}
        {syncReport && (
          <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm">
            <strong>Relatório:</strong> {syncReport.disponiveis} disponíveis · {syncReport.indisponiveis} indisponíveis · {syncReport.erros} erros (de {syncReport.total} total)
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Loja</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="text-center">Cliques</TableHead>
                <TableHead className="text-center">Destaque</TableHead>
                <TableHead className="text-center">Ativo</TableHead>
                <TableHead className="text-center">Disp.</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="py-8 text-center text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : filtrados.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="py-8 text-center text-muted-foreground">Nenhum produto</TableCell></TableRow>
              ) : (
                filtrados.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <img src={p.imagem_url ?? "/placeholder.svg"} alt="" className="h-12 w-12 rounded-md object-cover" />
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="line-clamp-2 text-sm font-medium">{p.nome}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{getLojaLabel(p.plataforma)}</Badge></TableCell>
                    <TableCell>
                      <Badge
                        variant={p.categoria && p.categoria !== "outros" ? "secondary" : "outline"}
                        className="text-xs whitespace-nowrap"
                      >
                        {getCategoriaLabel(p.categoria)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{formatBRL(p.preco)}</TableCell>
                    <TableCell className="text-center text-sm">{p.cliques}</TableCell>
                    <TableCell className="text-center">
                      <Switch checked={p.destaque} onCheckedChange={(v) => toggleField(p.id, "destaque", v)} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch checked={p.ativo} onCheckedChange={(v) => toggleField(p.id, "ativo", v)} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch checked={p.disponivel} onCheckedChange={(v) => toggleField(p.id, "disponivel", v)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Auto-categorizar com IA"
                          onClick={() => autoCategorizar(p)}
                          disabled={categorizing.has(p.id)}
                        >
                          {categorizing.has(p.id)
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Sparkles className="h-3.5 w-3.5 text-violet-500" />}
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setEditing(p)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteProduto(p.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Editar produto</DialogTitle></DialogHeader>
          {editing && (
            <form onSubmit={saveEdit} className="space-y-3">
              <div><Label>Nome</Label><Input name="nome" defaultValue={editing.nome} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Preço</Label><Input name="preco" type="number" step="0.01" defaultValue={editing.preco} required /></div>
                <div><Label>Preço original</Label><Input name="preco_original" type="number" step="0.01" defaultValue={editing.preco_original ?? ""} /></div>
              </div>
              <div><Label>Imagem URL</Label><Input name="imagem_url" defaultValue={editing.imagem_url ?? ""} required /></div>
              <div><Label>Link afiliado</Label><Input name="link_afiliado" defaultValue={editing.link_afiliado} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Loja</Label>
                  <Input name="plataforma" list="lojas-list" defaultValue={editing.plataforma} required />
                  <datalist id="lojas-list">
                    {lojasExistentes.map((l) => (
                      <option key={l} value={l}>{getLojaLabel(l)}</option>
                    ))}
                  </datalist>
                </div>
                <div><Label>Link short</Label><Input name="link_short" defaultValue={editing.link_short ?? ""} /></div>
              </div>


              <div><Label>Categoria</Label>
                <Input name="categoria" list="categorias-list" defaultValue={editing.categoria} required />
                <datalist id="categorias-list">
                  {categoriasExistentes.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </datalist>
              </div>
              <div><Label>Copy</Label><Textarea name="copy_gemini" defaultValue={editing.copy_gemini ?? ""} rows={2} /></div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                <Button type="submit" variant="hero">Salvar</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
