# ProductStudio - Quick Start 🚀

## ⚡ Início Rápido (5 minutos)

### 1. Obtenha as API Keys

**OpenAI (DALL-E 3):**
1. Acesse: https://platform.openai.com/api-keys
2. Clique em "Create new secret key"
3. Copie a chave (começa com `sk-`)

**Clipdrop (Remoção de Fundo):**
1. Acesse: https://clipdrop.co/apis
2. Crie uma conta gratuita
3. Pegue sua API key no dashboard

### 2. Configure o Banco de Dados

```bash
# Inicie o PostgreSQL com Docker (mais fácil)
docker-compose up -d

# Aguarde 10 segundos para o banco inicializar
```

### 3. Configure as Variáveis de Ambiente

```bash
# Backend
cd server
cp .env.example .env
nano .env  # ou use seu editor favorito
```

Cole suas keys:
```env
OPENAI_API_KEY=sk-sua-chave-aqui
CLIPDROP_API_KEY=sua-chave-aqui
JWT_SECRET=qualquer-string-aleatoria-segura
```

### 4. Instale e Rode

```bash
# Backend (Terminal 1)
cd server
npm install
npm run dev

# Frontend (Terminal 2)
cd client
npm install
npm run dev
```

### 5. Acesse!

Abra: **http://localhost:5173**

- Crie uma conta
- Você ganhará **3 créditos gratuitos** (trial de 7 dias)
- Faça upload de uma imagem de produto
- Escolha um estilo
- Clique em "Gerar Background"
- Aguarde ~20 segundos
- Baixe sua imagem profissional! ✨

---

## 📁 Estrutura do Projeto

```
productstudio/
├── client/          # Frontend React
├── server/          # Backend Node.js
├── database/        # Schema SQL
├── SETUP.md         # Guia completo de deploy
└── README.md        # Documentação geral
```

---

## 🎨 Estilos Disponíveis

### E-commerce Geral
- Fundo Branco Puro
- Luxo Premium
- Minimalista Moderno

### Alimentos & Bebidas
- Mesa Rústica
- Cozinha Profissional
- Outdoor Natural

### Cosméticos & Beleza
- Spa Zen
- Glamour Dourado
- Natureza Botânica

### Moda & Acessórios
- Urbano Moderno
- Boutique Elegante

### Tecnologia
- Tech Futurista
- Escritório Corporativo

### Joias & Luxo
- Reflexo Espelhado
- Veludo Negro

---

## 💰 Custos da API

Por geração:
- Clipdrop: ~$0.01
- DALL-E 3: ~$0.08
- **Total: ~$0.09**

Você pode cobrar $0.50-2.00 por geração do usuário.

---

## 🐛 Problemas Comuns

**Erro de conexão ao banco:**
```bash
# Reinicie o Docker
docker-compose down
docker-compose up -d
```

**Porta já em uso:**
```bash
# Mude a porta no .env do server
PORT=5001
```

**CORS error:**
- Verifique se CLIENT_URL no backend aponta para http://localhost:5173

---

## 📚 Documentação Completa

Leia `SETUP.md` para:
- Deploy em produção
- Configuração de domínio
- Sistema de pagamentos
- Monitoramento
- Segurança

---

## ✅ Checklist Pré-Deploy

- [ ] API keys configuradas
- [ ] Banco de dados funcionando
- [ ] Aplicação rodando localmente
- [ ] Testou upload de imagem
- [ ] Testou geração de background
- [ ] Leu o SETUP.md para deploy

---

**Dúvidas?** Consulte o SETUP.md ou abra uma issue no GitHub.

**Boa sorte! 🎉**
