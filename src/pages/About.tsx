import { motion } from "framer-motion";
import { Heart, Sparkles, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <header className="container py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-primary">
          <Heart className="h-6 w-6 fill-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">Promo das Primas</span>
        </Link>
      </header>

      <main className="container max-w-3xl py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Sua dose diária de <span className="text-primary italic">garimpo</span> digital.
          </h1>
          
          <div className="mt-12 space-y-8 text-lg leading-relaxed text-muted-foreground">
            <p>
              O <strong>Promo das Primas</strong> nasceu de uma ideia simples: por que gastar horas procurando a melhor oferta se alguém pode fazer isso por você?
            </p>
            
            <p>
              Nós não somos apenas um robô de busca. Somos curadores. Analisamos preço, reputação do vendedor e histórico para garantir que o que chega na sua tela seja, de fato, uma oportunidade real.
            </p>

            <div className="grid gap-6 py-8 md:grid-cols-2">
              <div className="rounded-[2rem] bg-secondary p-8">
                <Sparkles className="mb-4 h-8 w-8 text-primary" />
                <h3 className="mb-2 font-bold text-foreground">Curadoria Real</h3>
                <p className="text-sm">Cada oferta passa por um filtro de qualidade antes de ser publicada.</p>
              </div>
              <div className="rounded-[2rem] bg-secondary p-8">
                <ShieldCheck className="mb-4 h-8 w-8 text-primary" />
                <h3 className="mb-2 font-bold text-foreground">Segurança</h3>
                <p className="text-sm">Linkamos apenas lojas oficiais e vendedores verificados em marketplaces.</p>
              </div>
            </div>

            <p>
              Nossa missão é democratizar o acesso às melhores ofertas das grandes plataformas como Shopee, Mercado Livre, Amazon e Shein, ajudando você a economizar de verdade, sem pegadinhas.
            </p>
          </div>
        </motion.div>
      </main>

      <footer className="container py-12 text-center text-sm text-muted-foreground">
        <Link to="/" className="hover:underline">Voltar para ofertas</Link>
      </footer>
    </div>
  );
}
