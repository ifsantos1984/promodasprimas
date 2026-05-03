import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Produto,
  PLATAFORMA_LABEL,
  PLATAFORMA_COLOR_CLASS,
  formatBRL,
} from "@/lib/produto";
import { cn } from "@/lib/utils";

interface Props {
  produto: Produto;
  isLowestInPlatform?: boolean;
  isHighestInPlatform?: boolean;
  onView: (p: Produto) => void;
}

export function ProdutoCard({ produto, isLowestInPlatform, isHighestInPlatform, onView }: Props) {
  const desconto = produto.desconto_pct ??
    (produto.preco_original
      ? Math.round((1 - produto.preco / produto.preco_original) * 100)
      : null);

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="group relative cursor-zoom-in break-inside-avoid mb-6"
      onClick={() => onView(produto)}
    >
      {/* IMAGEM CONTAINER */}
      <div className="relative overflow-hidden rounded-[2rem] bg-muted shadow-sm ring-1 ring-black/5">
        <img
          src={produto.imagem_url ?? ""}
          alt={produto.nome}
          loading="lazy"
          className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* OVERLAY ON HOVER (Pinterest Style) */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-0 transition-opacity duration-300 group-hover:bg-black/10 group-hover:opacity-100">
          <div className="flex items-center justify-between gap-2">
            <Badge className={cn("rounded-full border-none px-3 font-bold shadow-md", PLATAFORMA_COLOR_CLASS[produto.plataforma])}>
              {PLATAFORMA_LABEL[produto.plataforma]}
            </Badge>
            
            {desconto && desconto > 0 && (
              <Badge className="bg-primary px-3 font-bold text-white shadow-md">
                -{desconto}%
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex h-10 flex-1 items-center justify-between rounded-full bg-white/95 px-4 py-1.5 backdrop-blur-sm shadow-lg">
              <span className="truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {produto.plataforma}
              </span>
              <ExternalLink className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
        </div>

        {/* Status Badges (Sempre Visíveis) */}
        <div className="pointer-events-none absolute bottom-3 left-3 flex flex-col gap-1.5 opacity-100 transition-opacity group-hover:opacity-0">
          {isLowestInPlatform && (
            <Badge className="gap-1 rounded-full border-none bg-price-low px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md">
              <TrendingDown className="h-3 w-3" />
              MELHOR PREÇO
            </Badge>
          )}
          {!produto.disponivel && (
            <Badge variant="destructive" className="gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-md">
              <AlertCircle className="h-3 w-3" /> INDISPONÍVEL
            </Badge>
          )}
        </div>
      </div>

      {/* TEXT CONTENT (Below Image) */}
      <div className="mt-2.5 px-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
          {produto.nome}
        </h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-bold text-foreground">
            {formatBRL(produto.preco)}
          </span>
          {produto.preco_original && produto.preco_original > produto.preco && (
            <span className="text-[10px] text-muted-foreground line-through">
              {formatBRL(produto.preco_original)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

