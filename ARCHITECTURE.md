# ProductStudio - Arquitetura Técnica

## 🏗️ Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                         USUÁRIO                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  - Interface glassmorphism dark blue                         │
│  - Upload de imagens via drag & drop                         │
│  - Seleção de 15 estilos predefinidos                        │
│  - Campo de prompt customizado                               │
│  - Visualização em tempo real                                │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/REST
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     Auth     │  │   Upload     │  │  Generation  │      │
│  │   JWT/Hash   │  │   Multer     │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
└─────┬──────────────────────────────────────────────────┬────┘
      │                                                   │
      ▼                                                   ▼
┌─────────────────┐                           ┌─────────────────┐
│   PostgreSQL    │                           │   AI Services   │
│                 │                           │                 │
│  - users        │                           │  ┌───────────┐  │
│  - generations  │                           │  │ Clipdrop  │  │
│  - credits      │                           │  │  (Remove  │  │
│  - styles       │                           │  │    BG)    │  │
└─────────────────┘                           │  └───────────┘  │
                                              │                 │
                                              │  ┌───────────┐  │
                                              │  │  DALL-E 3 │  │
                                              │  │ (Generate │  │
                                              │  │    BG)    │  │
                                              │  └───────────┘  │
                                              └─────────────────┘
```

## 🔄 Fluxo de Processamento

```
1. UPLOAD
   └─> Usuário faz upload da imagem do produto
       └─> Validação (tipo, tamanho)
           └─> Salvo temporariamente em /uploads

2. SELEÇÃO
   └─> Usuário escolhe estilo OU digita prompt customizado
       └─> Sistema busca template do estilo no banco

3. VALIDAÇÃO
   └─> Verifica créditos do usuário
       └─> Se trial expirado, rejeita
           └─> Se sem créditos, rejeita

4. PROCESSAMENTO (Assíncrono - ~20-30s)
   
   4a. REMOÇÃO DE FUNDO
       └─> Envia imagem para Clipdrop API
           └─> Recebe imagem sem fundo (PNG transparente)
   
   4b. GERAÇÃO DE FUNDO
       └─> Envia prompt para DALL-E 3
           └─> Recebe imagem de fundo profissional
   
   4c. COMPOSIÇÃO
       └─> Usa Sharp para combinar:
           - Produto sem fundo (camada superior)
           - Novo fundo (camada inferior)
       └─> Ajusta dimensões e qualidade
       └─> Salva resultado final

5. FINALIZAÇÃO
   └─> Atualiza status no banco (completed/failed)
       └─> Deduz 1 crédito do usuário
           └─> Retorna URL da imagem final

6. DOWNLOAD
   └─> Usuário baixa imagem gerada
```

## 📊 Modelo de Dados

### Users
```sql
- id (UUID)
- email (unique)
- password_hash
- name
- credits (integer)
- trial_used (boolean)
- trial_expires_at (timestamp)
```

### Generations
```sql
- id (UUID)
- user_id (FK)
- original_image_url
- generated_image_url
- style_preset (slug)
- custom_prompt
- cost_credits
- status (processing/completed/failed)
- created_at
```

### Style Presets
```sql
- id
- name
- slug
- category
- prompt_template
- display_order
```

### Credit Transactions
```sql
- id (UUID)
- user_id (FK)
- amount (+ ou -)
- transaction_type (purchase/trial/generation/refund)
- generation_id (FK, nullable)
```

## 🎨 Design System

### Cores
```css
Primary Blue:   #0056e0
Dark BG:        #0a0e1a
Glass Effect:   bg-white/5 + backdrop-blur-xl
Accent:         Gradients azul
```

### Componentes Principais
- **GlassCard**: Efeito glassmorphism reutilizável
- **Navbar**: Navegação com info de créditos
- **StyleGrid**: Grid de seleção de estilos
- **UploadZone**: Drag & drop de imagens
- **GenerationPreview**: Preview com loading state

## 🔐 Segurança

### Autenticação
- JWT com expiração de 7 dias
- Senhas com bcrypt (10 rounds)
- Tokens em localStorage (client-side)

### Validação
- Joi para validação de entrada
- Multer para validação de upload
- Sanitização de prompts

### Rate Limiting
- TODO: Implementar express-rate-limit
- Limite de gerações por hora

## 💳 Sistema de Créditos

### Trial
- 3 créditos gratuitos
- Válido por 7 dias
- Expiração automática

### Compra (TODO)
- Integração Stripe/Mercado Pago
- Pacotes: 10, 50, 100 créditos
- Desconto progressivo

### Custo
- 1 crédito = 1 geração
- API cost: ~$0.09
- Preço sugerido: $0.50-2.00

## 📈 Métricas de Performance

### Tempo de Processamento
- Upload: <1s
- Remoção de fundo: ~5-8s
- Geração DALL-E: ~10-15s
- Composição: ~1-2s
- **Total: ~20-30s**

### Limites
- Tamanho máximo: 10MB
- Formatos: JPG, PNG, WebP
- Concorrência: Limitada pelo plano OpenAI

## 🚀 Otimizações Futuras

1. **Fila de Processamento**
   - Bull + Redis
   - Processar em background workers
   - Notificações em tempo real (WebSocket)

2. **Cache**
   - Redis para estilos frequentes
   - CDN para imagens geradas

3. **Batch Processing**
   - Processar múltiplas imagens
   - Desconto para lote

4. **API Pública**
   - Endpoints REST para integração
   - Rate limiting por API key

## 🎯 Roadmap

**Fase 1: MVP** ✅
- [x] Sistema de autenticação
- [x] Upload e processamento
- [x] 15 estilos predefinidos
- [x] Trial de 7 dias

**Fase 2: Monetização**
- [ ] Integração Stripe
- [ ] Pacotes de créditos
- [ ] Sistema de assinaturas

**Fase 3: Escala**
- [ ] Fila de processamento
- [ ] Dashboard analytics
- [ ] Sistema de referral

**Fase 4: Features Avançadas**
- [ ] Edição manual de fundo
- [ ] Múltiplas variações
- [ ] Templates salvos
- [ ] API pública

---

**Documentação completa em:** `SETUP.md` e `README.md`
