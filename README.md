# Welcome to your Promo das Primas project

## Como fazer o deploy na Vercel

Este projeto está pronto para ser hospedado na Vercel. Siga os passos abaixo:

### 1. Preparação
Certifique-se de que o arquivo `vercel.json` está na raiz do projeto (já foi criado). Ele é necessário para que o React Router funcione corretamente.

### 2. Configurar Variáveis de Ambiente
No painel da Vercel, adicione as seguintes variáveis de ambiente:

- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`

Os valores podem ser encontrados no seu arquivo `.env` local.

### 3. Build Settings
A Vercel deve detectar automaticamente as configurações do Vite, mas caso precise configurar manualmente:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 4. Deploy
Conecte seu repositório GitHub à Vercel e o deploy será feito automaticamente a cada push na branch principal.
