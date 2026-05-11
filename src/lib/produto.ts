export type Plataforma = string;
export type Categoria = string;

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

export const LOJA_LABEL: Record<string, string> = {
  shopee: "Shopee",
  mercado_livre: "Mercado Livre",
  amazon: "Amazon",
  shein: "Shein",
  outros: "Outros",
};

export const LOJA_COLOR_CLASS: Record<string, string> = {
  shopee: "bg-shopee text-shopee-foreground",
  mercado_livre: "bg-mercado-livre text-mercado-livre-foreground",
  amazon: "bg-amazon text-amazon-foreground",
  shein: "bg-shein text-shein-foreground",
};

export const CATEGORIA_LABEL: Record<string, string> = {
  celulares: "📱 Celulares",
  eletronicos: "🖥️ Eletrônicos",
  informatica: "💻 Informática",
  eletrodomesticos: "🏠 Eletrodomésticos",
  moda: "👗 Moda",
  calcados: "👟 Calçados",
  beleza: "💄 Beleza",
  casa: "🛋️ Casa",
  esportes: "⚽ Esportes",
  brinquedos: "🧸 Brinquedos",
  alimentos: "🍫 Alimentos",
  livros: "📚 Livros",
  games: "🎮 Games",
  ferramentas: "🔧 Ferramentas",
  pet: "🐾 Pet Shop",
  saude: "💊 Saúde",
  outros: "📦 Outros",
};

export function getLojaLabel(loja: string) {
  if (!loja) return "Outros";
  return LOJA_LABEL[loja] || loja.charAt(0).toUpperCase() + loja.slice(1).replace(/_/g, " ");
}

export function getCategoriaLabel(categoria: string) {
  if (!categoria) return "📦 Outros";
  return CATEGORIA_LABEL[categoria] || categoria.charAt(0).toUpperCase() + categoria.slice(1);
}

export function getLojaColor(loja: string) {
  return LOJA_COLOR_CLASS[loja] || "bg-muted text-muted-foreground";
}

export function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
