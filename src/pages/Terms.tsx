import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Terms() {
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Termos de Uso
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Última atualização: 28 de Abril de 2026</p>
          
          <div className="mt-12 space-y-8 text-base leading-relaxed text-muted-foreground">
            <section>
              <h2 className="mb-4 text-xl font-bold text-foreground">1. Descrição do Serviço</h2>
              <p>
                O Promo das Primas é uma plataforma de curadoria de ofertas. Nós não vendemos produtos diretamente; nós agregamos links de terceiros (como Shopee, Amazon, etc) que oferecem promoções.
              </p>
            </section>
            
            <section>
              <h2 className="mb-4 text-xl font-bold text-foreground">2. Responsabilidade sobre Produtos</h2>
              <p>
                Qualquer transação de compra é realizada exclusivamente entre o usuário e a loja de destino. Não nos responsabilizamos por entregas, garantias, defeitos ou cancelamentos de pedidos feitos em sites terceiros.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-bold text-foreground">3. Links de Afiliados</h2>
              <p>
                Alguns links publicados em nossa plataforma podem gerar uma pequena comissão para o site. Isso não altera o preço final para você e ajuda a manter nosso serviço de curadoria gratuito.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-bold text-foreground">4. Alterações nos Preços</h2>
              <p>
                Os preços e a disponibilidade dos produtos podem mudar a qualquer momento sem aviso prévio pelas lojas parceiras. Sempre verifique o valor final no carrinho de compras da loja de destino.
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <footer className="container py-12 text-center text-sm text-muted-foreground">
        <Link to="/" className="hover:underline">Voltar para ofertas</Link>
      </footer>
    </div>
  );
}
