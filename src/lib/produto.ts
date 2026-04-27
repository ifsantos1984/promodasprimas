export type Plataforma = "shopee" | "mercado_livre" | "amazon" | "shein" | "outros";
export type Categoria = "eletronicos" | "moda" | "casa" | "beleza" | "outros";

export interface Produto {
  id: string;
  plataforma: Plataforma;
  categoria: Categoria;
  nome: string;
  preco: number;
  preco_original: number | null;
  desconto_pct: number | null;
  imagem_url: string | null;
  link_afiliado: string;
  link_short: string | null;
  copy_gemini: string | null;
  disponivel: boolean;
  ativo: boolean;
  destaque: boolean;
  cliques: number;
  criado_em: string;
  atualizado_em: string;
}

export const PLATAFORMA_LABEL: Record<Plataforma, string> = {
  shopee: "Shopee",
  mercado_livre: "Mercado Livre",
  amazon: "Amazon",
  shein: "Shein",
  outros: "Outros",
};

export const CATEGORIA_LABEL: Record<Categoria, string> = {
  eletronicos: "Eletrônicos",
  moda: "Moda",
  casa: "Casa",
  beleza: "Beleza",
  outros: "Outros",
};

export const PLATAFORMA_COLOR_CLASS: Record<Plataforma, string> = {
  shopee: "bg-shopee text-shopee-foreground",
  mercado_livre: "bg-mercado-livre text-mercado-livre-foreground",
  amazon: "bg-amazon text-amazon-foreground",
  shein: "bg-shein text-shein-foreground",
  outros: "bg-muted text-muted-foreground",
};

export function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
