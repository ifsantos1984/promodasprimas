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

    // Clear existing content
    ref.current.innerHTML = "";

    // Adsterra and other ad networks often need script execution.
    // contextualFragment is good, but manually recreating scripts is safer in some browsers.
    const container = document.createElement("div");
    container.innerHTML = codigo;

    const scripts = container.querySelectorAll("script");
    const nonScripts = Array.from(container.childNodes).filter(n => n.nodeName !== "SCRIPT");

    // Append non-script elements (like <div> containers for ads)
    nonScripts.forEach(node => ref.current?.appendChild(node.cloneNode(true)));

    // Append and execute scripts
    scripts.forEach(oldScript => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
      if (oldScript.innerHTML) {
        newScript.innerHTML = oldScript.innerHTML;
      }
      ref.current?.appendChild(newScript);
    });
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
