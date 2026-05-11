import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Produto, Plataforma } from "@/lib/produto";
import { ProdutoCard } from "@/components/ProdutoCard";
import { StatsBar } from "@/components/StatsBar";
import { AdSlot } from "@/components/AdSlot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { MusicPlayer } from "@/components/MusicPlayer";
import { Categoria, getLojaLabel, getCategoriaLabel } from "@/lib/produto";
import { MasonryGrid } from "@/components/MasonryGrid";
import { Label } from "@/components/ui/label";

type Sort = "menor_preco" | "maior_preco" | "recentes" | "maior_desconto";
type Filtro = Plataforma | "todos";




interface AdConfig {
  id: string;
  posicao: "topo" | "rodape" | "entre_cards" | "sidebar";
  codigo: string | null;
  ativo: boolean;
}

export default function Index() {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<Categoria | "todas">("todas");
  const [sort, setSort] = useState<Sort>("maior_desconto");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Debounce manual da busca
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ["produtos-publicos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("criado_em", { ascending: false });
      if (error) throw error;
      return data as Produto[];
    },
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const { data: ads = [] } = useQuery({
    queryKey: ["ads-publicos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads_config")
        .select("id, posicao, codigo, ativo")
        .eq("ativo", true);
      if (error) throw error;
      return data as AdConfig[];
    },
  });

  const adTopo = ads.find((a) => a.posicao === "topo");
  const adRodape = ads.find((a) => a.posicao === "rodape");

  const { lowestByPlatform } = useMemo(() => {
    const low: Record<string, string> = {};
    const groups: Record<string, Produto[]> = {};
    produtos.forEach((p) => {
      groups[p.plataforma] = groups[p.plataforma] || [];
      groups[p.plataforma].push(p);
    });
    Object.entries(groups).forEach(([plat, list]) => {
      if (list.length < 2) return;
      const sorted = [...list].sort((a, b) => a.preco - b.preco);
      low[plat] = sorted[0].id;
    });
    return { lowestByPlatform: low };
  }, [produtos]);

  const categoriasDinamicas = useMemo(() => {
    const cats = new Set(produtos.map((p) => p.categoria).filter(Boolean));
    return Array.from(cats).sort();
  }, [produtos]);

  const lojasDinamicas = useMemo(() => {
    const stores = new Set(produtos.map((p) => p.plataforma).filter(Boolean));
    return Array.from(stores).sort();
  }, [produtos]);


  const filtrados = useMemo(() => {
    let r = produtos;
    if (filtro !== "todos") r = r.filter((p) => p.plataforma === filtro);
    if (filtroCategoria !== "todas") r = r.filter((p) => p.categoria === filtroCategoria);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      r = r.filter((p) => p.nome.toLowerCase().includes(q));
    }
    const sorted = [...r];
    switch (sort) {
      case "menor_preco": sorted.sort((a, b) => a.preco - b.preco); break;
      case "maior_preco": sorted.sort((a, b) => b.preco - a.preco); break;
      case "maior_desconto":
        sorted.sort((a, b) => (b.desconto_pct ?? 0) - (a.desconto_pct ?? 0)); break;
      case "recentes":
      default:
        sorted.sort((a, b) => +new Date(b.criado_em) - +new Date(a.criado_em));
    }
    return sorted;
  }, [produtos, filtro, filtroCategoria, debouncedSearch, sort]);

  const destaques = useMemo(() => produtos.filter((p) => p.destaque), [produtos]);

  const handleView = useCallback(async (p: Produto) => {
    supabase.from("cliques").insert({
      produto_id: p.id,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    }).then(() => {});
    const url = p.link_short || p.link_afiliado;
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 flex flex-col">
      <MusicPlayer />

      {/* HEADER - Pinterest Style */}
      <header className="sticky top-0 z-40 bg-background/95 py-4 backdrop-blur-md border-b border-border/50">
        <div className="container flex items-center gap-4">
          <Link to="/" className="flex shrink-0 items-center gap-3 transition-transform hover:scale-105 active:scale-95">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary p-2">
              <Heart className="h-6 w-6 fill-white text-white" />
            </div>
            <span className="hidden font-bold tracking-tighter text-foreground sm:block text-xl">Promo das Primas</span>
          </Link>
          
          <div className="relative flex-1 max-w-2xl mx-auto">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar as melhores ofertas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full rounded-full border-none bg-secondary pl-12 text-base ring-offset-transparent focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>

          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className={cn("rounded-full", showFilters && "bg-secondary")}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container flex gap-8 py-8 flex-1">
        {/* SIDEBAR - Filtros e Lojas */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col gap-8 sticky top-24 h-fit">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <SlidersHorizontal className="h-4 w-4" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Filtros</h3>
            </div>
            
            <div className="space-y-6">
              {/* LOJAS NA SIDEBAR */}

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Lojas</Label>
                <div className="flex flex-col gap-1.5">
                  <Button
                    size="sm"
                    variant={filtro === "todos" ? "default" : "ghost"}
                    onClick={() => setFiltro("todos")}
                    className="justify-start rounded-xl font-medium h-9"
                  >
                    Todas as Lojas
                  </Button>
                  {lojasDinamicas.map((loja) => (
                    <Button
                      key={loja}
                      size="sm"
                      variant={filtro === loja ? "default" : "ghost"}
                      onClick={() => setFiltro(loja)}
                      className="justify-start rounded-xl font-medium h-9 text-left"
                    >
                      {getLojaLabel(loja)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* CATEGORIAS NA SIDEBAR */}
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Categorias</Label>
                <div className="flex flex-col gap-1.5">
                  <Button
                    size="sm"
                    variant={filtroCategoria === "todas" ? "default" : "ghost"}
                    onClick={() => setFiltroCategoria("todas")}
                    className="justify-start rounded-xl font-medium h-9"
                  >
                    Todas Categorias
                  </Button>
                  {categoriasDinamicas.map((cat) => (
                    <Button
                      key={cat}
                      size="sm"
                      variant={filtroCategoria === cat ? "default" : "ghost"}
                      onClick={() => setFiltroCategoria(cat)}
                      className="justify-start rounded-xl font-medium h-9 text-left"
                    >
                      {getCategoriaLabel(cat)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* ORDENAÇÃO NA SIDEBAR */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Ordenar por</Label>
                <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
                  <SelectTrigger className="w-full rounded-xl bg-secondary/50 border-none font-medium h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maior_desconto">Maior desconto</SelectItem>
                    <SelectItem value="menor_preco">Menor preço</SelectItem>
                    <SelectItem value="maior_preco">Maior preço</SelectItem>
                    <SelectItem value="recentes">Mais recentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Espaço para info extra ou apenas respiro */}
          <div className="mt-auto pt-8 text-[10px] text-muted-foreground uppercase tracking-widest text-center opacity-50">
            Curadoria Exclusiva
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {/* STATS */}
          <div className="mb-8">
            <StatsBar produtos={produtos} />
          </div>


        {/* OFERTAS EM DESTAQUE */}
        {destaques.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <h2 className="text-xl font-bold tracking-tight">Ofertas em Destaque</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
              {destaques.slice(0, 5).map((p) => (
                <ProdutoCard
                  key={p.id}
                  produto={p}
                  isLowestInPlatform={lowestByPlatform[p.plataforma] === p.id}
                  onView={handleView}
                />
              ))}
            </div>
          </section>
        )}

        {/* AD TOPO */}
        {adTopo && (
          <div className="mb-8">
            <AdSlot codigo={adTopo.codigo} posicao="topo" />
          </div>
        )}

        {/* MASONRY GRID */}
        <div>
          <div className="mb-6 flex items-center gap-3">
             <h2 className="text-xl font-bold tracking-tight">Todas as Ofertas</h2>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 15 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] w-full rounded-[2rem]" />
              ))}
            </div>
          ) : filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 rounded-full bg-secondary p-6">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-xl font-bold">Ops! Nenhuma oferta encontrada</p>
              <p className="mt-2 text-muted-foreground">Tente ajustar seus filtros ou busca.</p>
            </div>
          ) : (
            <MasonryGrid>
              {filtrados.map((p) => (
                <ProdutoCard
                  key={p.id}
                  produto={p}
                  isLowestInPlatform={lowestByPlatform[p.plataforma] === p.id}
                  onView={handleView}
                />
              ))}
            </MasonryGrid>
          )}
        </div>

        {/* AD RODAPÉ */}
        {adRodape && (
          <div className="mt-12 py-4">
            <AdSlot codigo={adRodape.codigo} posicao="rodape" />
          </div>
        )}
        </main>
      </div>

      {/* FOOTER */}

      <footer className="py-16 border-t border-border bg-secondary/30">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <Heart className="h-4 w-4 fill-white text-white" />
                </div>
                <span className="font-bold tracking-tight">Promo das Primas</span>
              </div>
              <p className="text-sm text-muted-foreground">
                As melhores ofertas da internet, garimpadas diariamente para você economizar com segurança.
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground">Institucional</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/sobre" className="hover:text-primary transition-colors">Sobre Nós</Link></li>
                <li><Link to="/contato" className="hover:text-primary transition-colors">Contato</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/termos" className="hover:text-primary transition-colors">Termos de Uso</Link></li>
                <li><Link to="/privacidade" className="hover:text-primary transition-colors">Privacidade</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-center md:flex-row md:text-left">
            <p className="text-xs text-muted-foreground">
              © 2026 Promo das Primas. Todos os direitos reservados.
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
              Alguns links podem gerar comissão de afiliado
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

