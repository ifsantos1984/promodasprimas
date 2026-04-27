import { motion } from "framer-motion";
import { ExternalLink, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="group flex h-full flex-col overflow-hidden border-border/60 bg-gradient-card shadow-card transition-all duration-300 hover:shadow-glow">
        {/* IMAGEM */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={produto.imagem_url ?? ""}
            alt={produto.nome}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Plataforma badge */}
          <div className="absolute left-3 top-3">
            <Badge className={cn("font-semibold", PLATAFORMA_COLOR_CLASS[produto.plataforma])}>
              {PLATAFORMA_LABEL[produto.plataforma]}
            </Badge>
          </div>

          {/* Desconto */}
          {desconto && desconto > 0 && (
            <div className="absolute right-3 top-3">
              <Badge className="bg-gradient-promo font-bold text-primary-foreground shadow-md">
                -{desconto}%
              </Badge>
            </div>
          )}

          {/* low/high price */}
          {(isLowestInPlatform || isHighestInPlatform) && (
            <div className="absolute bottom-3 left-3">
              {isLowestInPlatform && (
                <Badge className="gap-1 bg-price-low text-price-low-foreground shadow-md">
                  <TrendingDown className="h-3 w-3" />
                  menor preço
                </Badge>
              )}
              {isHighestInPlatform && (
                <Badge className="gap-1 bg-price-high text-price-high-foreground shadow-md">
                  <TrendingUp className="h-3 w-3" />
                  maior preço
                </Badge>
              )}
            </div>
          )}

          {!produto.disponivel && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/60 backdrop-blur-sm">
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" /> Indisponível
              </Badge>
            </div>
          )}
        </div>

        {/* CONTEÚDO */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-balance">
            {produto.nome}
          </h3>

          {produto.copy_gemini && (
            <p className="line-clamp-2 text-xs italic text-muted-foreground">
              {produto.copy_gemini}
            </p>
          )}

          <div className="mt-auto space-y-2">
            <div className="flex items-baseline gap-2">
              {produto.preco_original && produto.preco_original > produto.preco && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatBRL(produto.preco_original)}
                </span>
              )}
            </div>
            <div className="font-display text-2xl font-bold text-primary">
              {formatBRL(produto.preco)}
            </div>
            <Button
              variant="hero"
              size="sm"
              className="w-full gap-1.5"
              onClick={() => onView(produto)}
              disabled={!produto.disponivel}
            >
              Ver oferta <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
