import { Sparkles, TrendingDown, Package, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Produto, formatBRL } from "@/lib/produto";


export function StatsBar({ produtos }: { produtos: Produto[] }) {
  if (produtos.length === 0) return null;

  const total = produtos.length;
  const porPlataforma = produtos.reduce<Record<string, number>>((acc, p) => {
    acc[p.plataforma] = (acc[p.plataforma] ?? 0) + 1;
    return acc;
  }, {});
  const menor = Math.min(...produtos.map((p) => p.preco));
  const maior = Math.max(...produtos.map((p) => p.preco));

  const items = [
    { icon: Package, label: "Ofertas ativas", value: total.toString(), color: "from-primary to-primary-glow" },
    { icon: TrendingDown, label: "Menor preço", value: formatBRL(menor), color: "from-price-low to-emerald-500" },
    { icon: Tag, label: "Maior preço", value: formatBRL(maior), color: "from-secondary to-primary" },
    { icon: Sparkles, label: "Lojas", value: Object.keys(porPlataforma).length.toString(), color: "from-accent to-primary-glow" },

  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map(({ icon: Icon, label, value, color }) => (
        <Card key={label} className="relative overflow-hidden border-border/60 bg-card p-4 shadow-sm">
          <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br ${color} opacity-20 blur-xl`} />
          <div className="relative flex items-start gap-3">
            <div className={`rounded-lg bg-gradient-to-br ${color} p-2 text-primary-foreground shadow-sm`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <p className="truncate font-display text-lg font-bold">{value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
