// Edge Function: sync-produtos
// Verifica se o link_afiliado de cada produto ativo ainda está acessível.
// Faz GET com User-Agent de browser, timeout 8s.
// Status != 200 → marca disponivel = false. Usa service_role (bypassa RLS).

import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

interface Produto {
  id: string;
  link_afiliado: string;
  nome: string;
  disponivel: boolean;
}

async function checkLink(url: string): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": BROWSER_UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    });
    clearTimeout(timeout);
    // consume body to free resources
    try { await res.text(); } catch (_) { /* ignore */ }
    return { ok: res.status === 200, status: res.status };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Auth check: only admins can trigger
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: claims.claims.sub,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: produtos, error } = await supabase
      .from("produtos")
      .select("id, link_afiliado, nome, disponivel")
      .eq("ativo", true)
      .returns<Produto[]>();

    if (error) throw error;

    const total = produtos?.length ?? 0;
    let disponiveis = 0;
    let indisponiveis = 0;
    let erros = 0;
    const detalhes: Array<{ id: string; nome: string; status?: number; ok: boolean; error?: string }> = [];

    // Concurrency control
    const CONCURRENCY = 5;
    const queue = [...(produtos ?? [])];

    async function worker() {
      while (queue.length) {
        const p = queue.shift();
        if (!p) break;
        const result = await checkLink(p.link_afiliado);
        detalhes.push({ id: p.id, nome: p.nome, status: result.status, ok: result.ok, error: result.error });
        if (result.ok) {
          disponiveis++;
          if (!p.disponivel) {
            await supabase.from("produtos").update({ disponivel: true }).eq("id", p.id);
          }
        } else if (result.error) {
          erros++;
          // erro de rede — não desativa para evitar falso-positivo
        } else {
          indisponiveis++;
          await supabase.from("produtos").update({ disponivel: false }).eq("id", p.id);
        }
      }
    }

    await Promise.all(Array.from({ length: CONCURRENCY }, worker));

    return new Response(
      JSON.stringify({ total, disponiveis, indisponiveis, erros, detalhes }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    console.error("[sync-produtos] erro:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
