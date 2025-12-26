# ProductStudio - Guia de Setup e Deploy

## 🚀 Setup Local

### 1. Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL instalado (ou use Docker)
- Contas criadas:
  - OpenAI (para DALL-E 3): https://platform.openai.com/
  - Clipdrop (para remoção de fundo): https://clipdrop.co/apis

### 2. Clone e Instale Dependências

```bash
git clone <seu-repositorio>
cd productstudio

# Instalar dependências do servidor
cd server
npm install

# Instalar dependências do cliente
cd ../client
npm install
```

### 3. Configure o Banco de Dados

**Opção 1: Docker (Recomendado)**
```bash
# Na raiz do projeto
docker-compose up -d

# Isso criará automaticamente o banco com o schema
```

**Opção 2: PostgreSQL Local**
```bash
# Crie o banco de dados
createdb productstudio

# Execute o schema
psql -d productstudio -f database/schema.sql
```

### 4. Configure as Variáveis de Ambiente

**Server (.env)**
```bash
cd server
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
PORT=5000
DATABASE_URL=postgresql://productstudio:productstudio_password@localhost:5432/productstudio
JWT_SECRET=gere-uma-chave-secreta-aleatoria-aqui
OPENAI_API_KEY=sk-sua-chave-openai
CLIPDROP_API_KEY=sua-chave-clipdrop
CLIENT_URL=http://localhost:5173
```

**Client (.env)**
```bash
cd ../client
cp .env.example .env
```

O arquivo já está configurado para desenvolvimento local.

### 5. Inicie o Projeto

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Acesse: http://localhost:5173

---

## 🌐 Deploy na VPS com Easypanel

### 1. Preparar o Repositório

```bash
# Adicione todos os arquivos ao git
git add .
git commit -m "Initial commit"

# Crie um repositório no GitHub
# Suba o código
git remote add origin <seu-repositorio-github>
git push -u origin main
```

### 2. Configurar PostgreSQL na VPS

No Easypanel, crie um serviço PostgreSQL:
1. Clique em "Add Service" → "Database" → "PostgreSQL"
2. Configure um nome (ex: `productstudio-db`)
3. Anote a `DATABASE_URL` gerada

### 3. Deploy do Backend

1. No Easypanel, clique em "Add Service" → "App from GitHub"
2. Conecte seu repositório
3. Configure:
   - **Name**: `productstudio-api`
   - **Build Path**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Port**: `5000`

4. Adicione as variáveis de ambiente:
   - `PORT=5000`
   - `DATABASE_URL=<url-do-postgres-easypanel>`
   - `JWT_SECRET=<sua-chave-secreta>`
   - `OPENAI_API_KEY=<sua-chave-openai>`
   - `CLIPDROP_API_KEY=<sua-chave-clipdrop>`
   - `CLIENT_URL=https://seu-dominio.com`

5. Clique em "Deploy"

### 4. Executar Schema do Banco

Conecte via SSH na VPS e execute:
```bash
# Conecte ao PostgreSQL do Easypanel
psql <DATABASE_URL>

# Cole e execute o conteúdo de database/schema.sql
```

Ou use um cliente PostgreSQL como DBeaver ou pgAdmin.

### 5. Deploy do Frontend

1. No Easypanel, "Add Service" → "App from GitHub"
2. Configure:
   - **Name**: `productstudio-web`
   - **Build Path**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s dist -p 5173`
   - **Port**: `5173`

3. Adicione variável de ambiente:
   - `VITE_API_URL=https://sua-api.com/api`

4. Configure o domínio customizado no Easypanel
5. Clique em "Deploy"

### 6. Configurar Nginx (se necessário)

O Easypanel geralmente configura automaticamente, mas se precisar:

```nginx
# Frontend
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 💳 Configuração de Pagamentos (Futuro)

Para adicionar sistema de pagamentos:

1. **Stripe**: 
   - Crie conta em https://stripe.com
   - Adicione `STRIPE_SECRET_KEY` nas variáveis de ambiente
   - Implemente webhook para compra de créditos

2. **Mercado Pago** (Brasil):
   - Crie conta em https://www.mercadopago.com.br
   - Integre API para compra de créditos

---

## 📊 Monitoramento

### Logs
```bash
# Ver logs do backend no Easypanel
# Acesse o painel → Services → productstudio-api → Logs

# Ou via SSH:
docker logs -f <container-name>
```

### Custos Estimados de API

- **Clipdrop**: ~$0.002-0.01 por imagem
- **DALL-E 3**: ~$0.08 por imagem HD
- **Total**: ~$0.09 por geração

**Precificação sugerida:**
- 1 crédito = $0.50-2.00 para o usuário
- Margem: ~450-2100%

---

## 🔧 Troubleshooting

### Erro: "Database connection failed"
- Verifique se a `DATABASE_URL` está correta
- Confirme que o PostgreSQL está rodando
- Teste a conexão: `psql <DATABASE_URL>`

### Erro: "OpenAI API error"
- Verifique se sua chave está válida
- Confirme se há créditos na conta OpenAI
- Teste: https://platform.openai.com/api-keys

### Erro: "CORS error"
- Verifique se `CLIENT_URL` no backend está correto
- Confirme se `VITE_API_URL` no frontend aponta para a API correta

### Upload de imagem falha
- Verifique permissões da pasta `/uploads`
- Confirme limite de tamanho (10MB)

---

## 🔐 Segurança

- Nunca commite arquivos `.env` no Git
- Use HTTPS em produção
- Implemente rate limiting (use `express-rate-limit`)
- Adicione validação de entrada em todos os endpoints
- Monitore uso de API para evitar custos excessivos

---

## 📈 Próximos Passos

1. ✅ Deploy básico funcionando
2. ⬜ Adicionar sistema de pagamentos
3. ⬜ Implementar fila de processamento (Bull/Redis)
4. ⬜ Adicionar cache para estilos frequentes
5. ⬜ Sistema de referral para ganhar créditos
6. ⬜ Dashboard de analytics
7. ⬜ API pública para integração

---

## 📞 Suporte

- Issues: <seu-repositorio>/issues
- Email: seu-email@exemplo.com

---

**Boa sorte com o ProductStudio! 🚀**
