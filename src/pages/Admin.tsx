import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Package, BarChart3, Megaphone, Heart } from "lucide-react";
import { AdminProdutos } from "@/components/admin/AdminProdutos";
import { AdminMetricas } from "@/components/admin/AdminMetricas";
import { AdminAds } from "@/components/admin/AdminAds";

export default function Admin() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("produtos");

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero shadow-glow">
              <Heart className="h-5 w-5 fill-primary-foreground text-primary-foreground" />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight">Painel Admin</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Promo das Primas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
              <LogOut className="h-3.5 w-3.5" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 md:py-8">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6 h-auto rounded-full bg-card p-1 shadow-sm">
            <TabsTrigger value="produtos" className="gap-1.5 rounded-full px-4 py-2 data-[state=active]:bg-gradient-hero data-[state=active]:text-primary-foreground">
              <Package className="h-3.5 w-3.5" /> Produtos
            </TabsTrigger>
            <TabsTrigger value="metricas" className="gap-1.5 rounded-full px-4 py-2 data-[state=active]:bg-gradient-hero data-[state=active]:text-primary-foreground">
              <BarChart3 className="h-3.5 w-3.5" /> Métricas
            </TabsTrigger>
            <TabsTrigger value="ads" className="gap-1.5 rounded-full px-4 py-2 data-[state=active]:bg-gradient-hero data-[state=active]:text-primary-foreground">
              <Megaphone className="h-3.5 w-3.5" /> Anúncios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="produtos"><AdminProdutos /></TabsContent>
          <TabsContent value="metricas"><AdminMetricas /></TabsContent>
          <TabsContent value="ads"><AdminAds /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
