
-- =========================================
-- ENUMS
-- =========================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.plataforma_produto AS ENUM ('shopee', 'mercado_livre', 'amazon', 'shein', 'outros');
CREATE TYPE public.plataforma_ads AS ENUM ('adsense', 'adsterra');
CREATE TYPE public.posicao_ads AS ENUM ('topo', 'rodape', 'entre_cards', 'sidebar');

-- =========================================
-- FUNÇÃO TIMESTAMPS
-- =========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

-- =========================================
-- TABELA PERFIS
-- =========================================
CREATE TABLE public.perfis (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

-- =========================================
-- TABELA USER_ROLES (separada para segurança)
-- =========================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função SECURITY DEFINER para checar role sem recursão
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- =========================================
-- TABELA PRODUTOS
-- =========================================
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plataforma plataforma_produto NOT NULL,
  nome TEXT NOT NULL,
  preco NUMERIC(10,2) NOT NULL,
  preco_original NUMERIC(10,2),
  desconto_pct INTEGER,
  imagem_url TEXT,
  link_afiliado TEXT NOT NULL,
  link_short TEXT,
  copy_gemini TEXT,
  disponivel BOOLEAN NOT NULL DEFAULT true,
  ativo BOOLEAN NOT NULL DEFAULT true,
  cliques INTEGER NOT NULL DEFAULT 0,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_produtos_ativo ON public.produtos(ativo, disponivel);
CREATE INDEX idx_produtos_plataforma ON public.produtos(plataforma);
CREATE INDEX idx_produtos_preco ON public.produtos(preco);

CREATE TRIGGER trg_produtos_updated
BEFORE UPDATE ON public.produtos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- TABELA CLIQUES
-- =========================================
CREATE TABLE public.cliques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  user_agent TEXT,
  referrer TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cliques ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_cliques_produto ON public.cliques(produto_id);
CREATE INDEX idx_cliques_data ON public.cliques(criado_em DESC);

-- Trigger para incrementar contador no produto
CREATE OR REPLACE FUNCTION public.incrementar_cliques()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.produtos SET cliques = cliques + 1 WHERE id = NEW.produto_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_cliques_inc
AFTER INSERT ON public.cliques
FOR EACH ROW
EXECUTE FUNCTION public.incrementar_cliques();

-- =========================================
-- TABELA ADS_CONFIG
-- =========================================
CREATE TABLE public.ads_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plataforma plataforma_ads NOT NULL,
  slot_id TEXT,
  posicao posicao_ads NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT false,
  codigo TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ads_config ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_ads_updated
BEFORE UPDATE ON public.ads_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- POLÍTICAS RLS
-- =========================================

-- PERFIS
CREATE POLICY "Usuários veem o próprio perfil"
ON public.perfis FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admin vê todos os perfis"
ON public.perfis FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Usuários atualizam o próprio perfil"
ON public.perfis FOR UPDATE TO authenticated
USING (auth.uid() = id);

-- USER_ROLES
CREATE POLICY "Usuários veem os próprios papéis"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admin gerencia papéis"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PRODUTOS
CREATE POLICY "Vitrine pública mostra produtos ativos"
ON public.produtos FOR SELECT TO anon, authenticated
USING (ativo = true AND disponivel = true AND imagem_url IS NOT NULL);

CREATE POLICY "Admin vê todos os produtos"
ON public.produtos FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin gerencia produtos"
ON public.produtos FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CLIQUES
CREATE POLICY "Qualquer um registra clique"
ON public.cliques FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admin lê cliques"
ON public.cliques FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ADS_CONFIG
CREATE POLICY "Vitrine lê anúncios ativos"
ON public.ads_config FOR SELECT TO anon, authenticated
USING (ativo = true);

CREATE POLICY "Admin vê todos os anúncios"
ON public.ads_config FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin gerencia anúncios"
ON public.ads_config FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- TRIGGER: novo usuário → perfil + role
-- =========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfis (id, email)
  VALUES (NEW.id, NEW.email);

  IF NEW.email = 'api.ifsantos@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
