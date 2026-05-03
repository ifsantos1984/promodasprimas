import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Privacy() {
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
            Política de Privacidade
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Última atualização: 28 de Abril de 2026</p>
          
          <div className="mt-12 space-y-8 text-base leading-relaxed text-muted-foreground">
            <section>
              <h2 className="mb-4 text-xl font-bold text-foreground">1. Coleta de Informações</h2>
              <p>
                Coletamos informações básicas de navegação (como cookies) para entender o desempenho das ofertas e melhorar a experiência do usuário. Não coletamos dados sensíveis ou informações de pagamento.
              </p>
            </section>
            
            <section>
              <h2 className="mb-4 text-xl font-bold text-foreground">2. Uso de Cookies</h2>
              <p>
                Utilizamos cookies para rastrear cliques em links de afiliados e para ferramentas de análise (como o Google Analytics). Você pode desativar os cookies nas configurações do seu navegador a qualquer momento.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-bold text-foreground">3. Links para Terceiros</h2>
              <p>
                Nossa política de privacidade aplica-se apenas ao nosso site. Ao clicar em um link e ser redirecionado para uma loja externa, você estará sujeito à política de privacidade dela.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-bold text-foreground">4. Contato</h2>
              <p>
                Se você tiver qualquer dúvida sobre como tratamos seus dados, entre em contato através da nossa página de contato.
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
