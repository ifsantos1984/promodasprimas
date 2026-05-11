import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface Props {
  codigo: string | null;
  posicao: "topo" | "rodape" | "entre_cards" | "sidebar" | "global";
}

export function AdSlot({ codigo, posicao }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!codigo || !ref.current) return;
    // Inject script-aware ad code
    const range = document.createRange();
    const fragment = range.createContextualFragment(codigo);
    ref.current.innerHTML = "";
    ref.current.appendChild(fragment);
  }, [codigo]);

  if (!codigo) {
    // Placeholder de desenvolvimento
    const sizes: Record<Exclude<typeof posicao, "global">, string> = {
      topo: "h-20 md:h-24",
      rodape: "h-20 md:h-24",
      entre_cards: "h-32",
      sidebar: "h-[600px]",
    };
    if (posicao === "global") return null;
    return (
      <Card className={`flex items-center justify-center border-dashed bg-muted/40 text-xs text-muted-foreground ${sizes[posicao]}`}>
        Espaço de anúncio · {posicao}
      </Card>
    );
  }

  return <div ref={ref} className="ad-slot" data-posicao={posicao} />;
}
