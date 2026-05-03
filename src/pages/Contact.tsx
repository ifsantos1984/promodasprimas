import { motion } from "framer-motion";
import { Heart, Mail, MessageCircle, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Contact() {
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
          className="text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Vamos conversar?
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Dúvidas, parcerias ou apenas quer dar um oi? Escolha o canal que preferir.
          </p>
          
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <a 
              href="mailto:contato@promodasprimas.com.br"
              className="flex flex-col items-center gap-4 rounded-[2rem] bg-secondary p-8 transition-transform hover:scale-105"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold">E-mail</h3>
                <p className="text-xs text-muted-foreground">contato@...</p>
              </div>
            </a>

            <a 
              href="#" 
              className="flex flex-col items-center gap-4 rounded-[2rem] bg-secondary p-8 transition-transform hover:scale-105"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Instagram className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold">Instagram</h3>
                <p className="text-xs text-muted-foreground">@promodasprimas</p>
              </div>
            </a>

            <a 
              href="#" 
              className="flex flex-col items-center gap-4 rounded-[2rem] bg-secondary p-8 transition-transform hover:scale-105"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold">WhatsApp</h3>
                <p className="text-xs text-muted-foreground">Grupo de Ofertas</p>
              </div>
            </a>
          </div>

          <div className="mt-16 rounded-[2.5rem] bg-muted p-8 md:p-12">
            <h2 className="text-2xl font-bold">Ficou sabendo de uma promo imperdível?</h2>
            <p className="mt-2 text-muted-foreground">Mande pra gente e ajude as outras primas a economizarem!</p>
            <Button className="mt-6 rounded-full px-8 font-bold" size="lg">
              Enviar Sugestão
            </Button>
          </div>
        </motion.div>
      </main>

      <footer className="container py-12 text-center text-sm text-muted-foreground">
        <Link to="/" className="hover:underline">Voltar para ofertas</Link>
      </footer>
    </div>
  );
}
