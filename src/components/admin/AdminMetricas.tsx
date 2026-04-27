import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Produto, PLATAFORMA_LABEL } from "@/lib/produto";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { TrendingUp, MousePointerClick, Package, AlertTriangle } from "lucide-react";

interface Clique { id: string; produto_id: string; criado_em: string; }

export function AdminMetricas() {
  const { data: produtos = [] } = useQuery({
    queryKey: ["admin-produtos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("produtos").select("*");
      if (error) throw error;
      return data as Produto[];
    },
  });

  const { data: cliques = [] } = useQuery({
    queryKey: ["admin-cliques"],
    queryFn: async () => {
      const desde = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
      const { data, error } = await supabase
        .from("cliques")
        .select("id, produto_id, criado_em")
        .gte("criado_em", desde);
      if (error) throw error;
      return data as Clique[];
    },
  });

  // cliques por plataforma
  const porPlataforma = produtos.reduce<Record<string, number>>((acc, p) => {
    acc[p.plataforma] = (acc[p.plataforma] ?? 0) + p.cliques;
    return acc;
  }, {});
  const dataPlataforma = Object.entries(porPlataforma).map(([k, v]) => ({
    name: PLATAFORMA_LABEL[k as keyof typeof PLATAFORMA_LABEL] ?? k,
    cliques: v,
  }));

  // top 10 produtos
  const top10 = [...produtos].sort((a, b) => b.cliques - a.cliques).slice(0, 10);

  // cliques por dia (30d)
  const dataDias = (() => {
    const map: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 3600 * 1000);
      const key = d.toISOString().slice(0, 10);
      map[key] = 0;
    }
    cliques.forEach((c) => {
      const key = c.criado_em.slice(0, 10);
      if (map[key] !== undefined) map[key]++;
    });
    return Object.entries(map).map(([k, v]) => ({
      dia: k.slice(5),
      cliques: v,
    }));
  })();

  const semCliques = produtos.filter((p) => p.cliques === 0 && p.ativo);
  const totalCliques = produtos.reduce((s, p) => s + p.cliques, 0);

  const stats = [
    { icon: MousePointerClick, label: "Total cliques", value: totalCliques },
    { icon: Package, label: "Produtos ativos", value: produtos.filter((p) => p.ativo).length },
    { icon: TrendingUp, label: "Top hoje", value: top10[0]?.cliques ?? 0 },
    { icon: AlertTriangle, label: "Sem cliques", value: semCliques.length },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-hero p-2 text-primary-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-display text-xl font-bold">{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-3 font-display text-base font-bold">Cliques por plataforma</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dataPlataforma}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="cliques" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 font-display text-base font-bold">Cliques nos últimos 30 dias</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dataDias}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="dia" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="cliques" stroke="hsl(var(--secondary))" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-3 font-display text-base font-bold">Top 10 produtos</h3>
          <ul className="space-y-2">
            {top10.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-hero text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <img src={p.imagem_url ?? "/placeholder.svg"} alt="" className="h-9 w-9 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.nome}</p>
                  <p className="text-xs text-muted-foreground">{PLATAFORMA_LABEL[p.plataforma]}</p>
                </div>
                <span className="font-display text-sm font-bold text-primary">{p.cliques}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 font-display text-base font-bold">Sem cliques (candidatos a desativar)</h3>
          {semCliques.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Todos os ativos têm pelo menos 1 clique 🎉</p>
          ) : (
            <ul className="space-y-2 max-h-[300px] overflow-y-auto">
              {semCliques.map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50">
                  <img src={p.imagem_url ?? "/placeholder.svg"} alt="" className="h-9 w-9 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.nome}</p>
                    <p className="text-xs text-muted-foreground">{PLATAFORMA_LABEL[p.plataforma]}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
