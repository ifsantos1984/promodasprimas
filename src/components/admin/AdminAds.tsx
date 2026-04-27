import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Megaphone, Layout, Sidebar as SidebarIcon, ArrowDown, Layers } from "lucide-react";

type Posicao = "topo" | "rodape" | "entre_cards" | "sidebar";
type PlataformaAds = "adsense" | "adsterra";

interface Ad {
  id: string;
  plataforma: PlataformaAds;
  slot_id: string | null;
  posicao: Posicao;
  ativo: boolean;
  codigo: string | null;
}

const POSICAO_INFO: Record<Posicao, { label: string; icon: typeof Layout; desc: string }> = {
  topo: { label: "Topo", icon: Layout, desc: "Banner abaixo do header" },
  entre_cards: { label: "Entre cards", icon: Layers, desc: "Inserido a cada 8 produtos" },
  sidebar: { label: "Sidebar", icon: SidebarIcon, desc: "Coluna lateral (desktop)" },
  rodape: { label: "Rodapé", icon: ArrowDown, desc: "Banner antes do footer" },
};

export function AdminAds() {
  const qc = useQueryClient();
  const { data: ads = [] } = useQuery({
    queryKey: ["admin-ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads_config")
        .select("*")
        .order("posicao");
      if (error) throw error;
      return data as Ad[];
    },
  });

  const update = async (id: string, updates: Partial<Ad>) => {
    const { error } = await supabase.from("ads_config").update(updates).eq("id", id);
    if (error) toast.error("Erro", { description: error.message });
    else qc.invalidateQueries({ queryKey: ["admin-ads"] });
  };

  const onSaveCode = async (e: React.FocusEvent<HTMLTextAreaElement>, ad: Ad) => {
    if (e.target.value === (ad.codigo ?? "")) return;
    await update(ad.id, { codigo: e.target.value || null });
    toast.success("Código salvo");
  };

  const onSaveSlot = async (e: React.FocusEvent<HTMLInputElement>, ad: Ad) => {
    if (e.target.value === (ad.slot_id ?? "")) return;
    await update(ad.id, { slot_id: e.target.value || null });
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <Megaphone className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <h3 className="font-display text-base font-bold">Anúncios na vitrine</h3>
            <p className="text-sm text-muted-foreground">
              Configure os slots do AdSense e Adsterra. Cada posição renderiza dinamicamente o código que você colar.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {ads.map((ad) => {
          const info = POSICAO_INFO[ad.posicao];
          const Icon = info.icon;
          return (
            <Card key={ad.id} className="p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-gradient-hero p-2 text-primary-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-display text-base font-bold">{info.label}</h4>
                    <p className="text-xs text-muted-foreground">{info.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={ad.ativo}
                  onCheckedChange={(v) => update(ad.id, { ativo: v })}
                />
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Plataforma</Label>
                    <Select
                      value={ad.plataforma}
                      onValueChange={(v) => update(ad.id, { plataforma: v as PlataformaAds })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adsense">Google AdSense</SelectItem>
                        <SelectItem value="adsterra">Adsterra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Slot ID</Label>
                    <Input
                      defaultValue={ad.slot_id ?? ""}
                      onBlur={(e) => onSaveSlot(e, ad)}
                      placeholder="ex: 1234567890"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Código do anúncio (HTML/JS)</Label>
                  <Textarea
                    defaultValue={ad.codigo ?? ""}
                    onBlur={(e) => onSaveCode(e, ad)}
                    placeholder='<script async src="..."></script>'
                    rows={4}
                    className="font-mono text-xs"
                  />
                </div>
                <div>
                  <Badge variant={ad.ativo ? "default" : "outline"} className={ad.ativo ? "bg-price-low text-price-low-foreground" : ""}>
                    {ad.ativo ? "ATIVO na vitrine" : "Inativo"}
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
