import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles, Search, ChevronDown, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Produto, Plataforma, PLATAFORMA_LABEL } from "@/lib/produto";
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
import { Categoria, CATEGORIA_LABEL } from "@/lib/produto";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

type Sort = "menor_preco" | "maior_preco" | "recentes" | "maior_desconto";
type Filtro = Plataforma | "todos";

const FILTROS: { value: Filtro; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "shopee", label: "Shopee" },
  { value: "mercado_livre", label: "Mercado Livre" },
  { value: "amazon", label: "Amazon" },
  { value: "shein", label: "Shein" },
];

const FILTROS_CATEGORIA: { value: Categoria | "todas"; label: string }[] = [
  { value: "todas", label: "Todas Categorias" },
  { value: "eletronicos", label: "Eletrônicos" },
  { value: "moda", label: "Moda" },
  { value: "casa", label: "Casa" },
  { value: "beleza", label: "Beleza" },
  { value: "outros", label: "Outros" },
];

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

  const pluginAutoplay = useRef(Autoplay({ delay: 3500, stopOnInteraction: true }));

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
    refetchInterval: 5 * 60 * 1000, // 5 min
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
  const adSidebar = ads.find((a) => a.posicao === "sidebar");
  const adEntreCards = ads.find((a) => a.posicao === "entre_cards");

  // mín/máx por plataforma para badges
  const { lowestByPlatform, highestByPlatform } = useMemo(() => {
    const low: Record<string, string> = {};
    const high: Record<string, string> = {};
    const groups: Record<string, Produto[]> = {};
    produtos.forEach((p) => {
      groups[p.plataforma] = groups[p.plataforma] || [];
      groups[p.plataforma].push(p);
    });
    Object.entries(groups).forEach(([plat, list]) => {
      if (list.length < 2) return;
      const sorted = [...list].sort((a, b) => a.preco - b.preco);
      low[plat] = sorted[0].id;
      high[plat] = sorted[sorted.length - 1].id;
    });
    return { lowestByPlatform: low, highestByPlatform: high };
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
    // registra clique (fire-and-forget)
    supabase.from("cliques").insert({
      produto_id: p.id,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    }).then(() => {});
    const url = p.link_short || p.link_afiliado;
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  return (
    <div className="min-h-screen">
      <MusicPlayer />
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero shadow-glow">
              <Heart className="h-5 w-5 fill-primary-foreground text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <h1 className="font-display text-lg font-bold">Promo das Primas</h1>
              <p className="hidden text-[10px] uppercase tracking-widest text-muted-foreground sm:block">
                Ofertas garimpadas a dedo
              </p>
            </div>
          </a>
          <div className="hidden flex-1 max-w-md items-center md:flex">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar oferta..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground">
            Admin
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-border/60 bg-gradient-hero py-10 text-primary-foreground md:py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3 w-3" /> Atualizado a cada 5 minutos
            </div>
            <h2 className="font-display text-4xl font-bold leading-tight md:text-6xl text-balance">
              Achados de quem entende de <span className="italic">promoção</span>.
            </h2>
            <p className="mt-3 text-base text-primary-foreground/90 md:text-lg max-w-2xl">
              As melhores ofertas da Shopee, Mercado Livre, Amazon e Shein —
              comparadas, garimpadas e prontinhas pra você economizar.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CARROSSEL DE DESTAQUES */}
      {destaques.length > 0 && (
        <section className="bg-muted/30 py-6 border-b border-border/60">
          <div className="container">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg font-bold">Ofertas em Destaque</h3>
            </div>
            <Carousel
              plugins={[pluginAutoplay.current]}
              opts={{ loop: true, align: "start" }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {destaques.map((d) => (
                  <CarouselItem key={d.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                    <ProdutoCard
                      produto={d}
                      onView={() => handleView(d)}
                      lowestId={lowestByPlatform[d.plataforma]}
                      highestId={highestByPlatform[d.plataforma]}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious className="-left-4 bg-background/80 hover:bg-background" />
                <CarouselNext className="-right-4 bg-background/80 hover:bg-background" />
              </div>
            </Carousel>
          </div>
        </section>
      )}

      {/* AD TOPO */}
      {adTopo && (
        <div className="container py-4">
          <AdSlot codigo={adTopo.codigo} posicao="topo" />
        </div>
      )}

      <main className="container py-8 md:py-10">
        {/* MOBILE SEARCH */}
        <div className="mb-5 md:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar oferta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* STATS */}
        <div className="mb-6">
          <StatsBar produtos={produtos} />
        </div>

        {/* FILTROS + SORT */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {FILTROS.map((f) => (
                <Button
                  key={f.value}
                  size="sm"
                  variant={filtro === f.value ? "default" : "outline"}
                  onClick={() => setFiltro(f.value)}
                  className={cn(
                    "rounded-full",
                    filtro === f.value && "bg-gradient-hero text-primary-foreground border-transparent shadow-md",
                  )}
                >
                  {f.label}
                </Button>
              ))}
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger className="w-[200px] rounded-full">
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

          <div className="flex flex-wrap gap-2">
            {FILTROS_CATEGORIA.map((f) => (
              <Button
                key={f.value}
                size="sm"
                variant={filtroCategoria === f.value ? "secondary" : "ghost"}
                onClick={() => setFiltroCategoria(f.value)}
                className="rounded-full text-xs font-medium"
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* GRID + SIDEBAR */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,300px]">
          <div>
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] w-full" />
                ))}
              </div>
            ) : filtrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
                <p className="font-display text-xl font-semibold">Nenhuma oferta encontrada</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tente outro filtro ou volte mais tarde — atualizamos toda hora!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {filtrados.map((p, idx) => (
                  <div key={p.id} className="contents">
                    <ProdutoCard
                      produto={p}
                      isLowestInPlatform={lowestByPlatform[p.plataforma] === p.id}
                      isHighestInPlatform={highestByPlatform[p.plataforma] === p.id}
                      onView={handleView}
                    />
                    {/* AD entre_cards a cada 8 */}
                    {adEntreCards && (idx + 1) % 8 === 0 && (
                      <div className="col-span-full">
                        <AdSlot codigo={adEntreCards.codigo} posicao="entre_cards" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          {adSidebar && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <AdSlot codigo={adSidebar.codigo} posicao="sidebar" />
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* AD RODAPÉ */}
      {adRodape && (
        <div className="container py-4">
          <AdSlot codigo={adRodape.codigo} posicao="rodape" />
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-border/60 bg-card/40 py-8">
        <div className="container flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
          <p className="font-display text-base font-bold text-foreground">
            Promo das Primas <span className="text-primary">♥</span>
          </p>
          <p>Promoções selecionadas a dedo · alguns links são de afiliados</p>
        </div>
      </footer>
    </div>
  );
}
