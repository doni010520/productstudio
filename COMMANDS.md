# ProductStudio - Comandos Úteis

## 🛠️ Desenvolvimento Local

### Iniciar Projeto
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev

# Terminal 3 - Database (se usando Docker)
docker-compose up -d
```

### Parar Tudo
```bash
# CTRL+C nos terminais
# Parar banco Docker:
docker-compose down
```

---

## 🗄️ Banco de Dados

### PostgreSQL com Docker
```bash
# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f postgres

# Parar
docker-compose down

# Resetar (CUIDADO - apaga dados!)
docker-compose down -v
docker-compose up -d
```

### Conectar ao Banco
```bash
# Via psql
psql postgresql://productstudio:productstudio_password@localhost:5432/productstudio

# Comandos úteis no psql:
\dt              # Listar tabelas
\d users         # Ver estrutura da tabela users
SELECT * FROM users;
SELECT * FROM generations;
```

### Executar Schema
```bash
psql postgresql://productstudio:productstudio_password@localhost:5432/productstudio < database/schema.sql
```

---

## 📦 NPM Commands

### Backend
```bash
cd server

# Desenvolvimento (hot reload)
npm run dev

# Produção
npm start

# Instalar dependência
npm install nome-do-pacote
```

### Frontend
```bash
cd client

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Instalar dependência
npm install nome-do-pacote
```

---

## 🐛 Debug

### Ver Logs Backend
```bash
cd server
npm run dev

# Ou em produção
pm2 logs productstudio-api
```

### Ver Logs Frontend
```bash
# Browser Console (F12)
# Ou terminal onde está rodando npm run dev
```

### Testar API Manualmente
```bash
# Registrar usuário
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@exemplo.com",
    "password": "senha123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "senha123"
  }'

# Buscar estilos
curl http://localhost:5000/api/styles

# Health check
curl http://localhost:5000/health
```

---

## 🚀 Deploy

### Build para Produção
```bash
# Frontend
cd client
npm run build
# Arquivos em: client/dist/

# Backend já está pronto, só precisa do npm start
```

### Deploy no Easypanel
```bash
# 1. Commitar mudanças
git add .
git commit -m "Descrição da mudança"
git push origin main

# 2. Easypanel fará deploy automático
# Ou clique em "Redeploy" no painel
```

### PM2 (se não estiver usando Easypanel)
```bash
# Instalar PM2
npm install -g pm2

# Iniciar backend
cd server
pm2 start src/server.js --name productstudio-api

# Ver processos
pm2 list

# Ver logs
pm2 logs productstudio-api

# Restart
pm2 restart productstudio-api

# Parar
pm2 stop productstudio-api
```

---

## 🔧 Manutenção

### Limpar Uploads Antigos
```bash
# Apagar imagens com mais de 7 dias
find server/uploads -type f -mtime +7 -delete
```

### Backup do Banco
```bash
# Backup
pg_dump postgresql://user:pass@localhost:5432/productstudio > backup.sql

# Restore
psql postgresql://user:pass@localhost:5432/productstudio < backup.sql
```

### Adicionar Créditos Manualmente
```sql
-- Conecte ao banco e execute:
UPDATE users 
SET credits = credits + 10 
WHERE email = 'usuario@exemplo.com';
```

### Ver Gerações Recentes
```sql
SELECT 
  u.email,
  g.status,
  g.created_at
FROM generations g
JOIN users u ON g.user_id = u.id
ORDER BY g.created_at DESC
LIMIT 10;
```

---

## 🧪 Testing

### Testar APIs Manualmente
```bash
# Use Postman, Insomnia ou curl

# Health Check
curl http://localhost:5000/health

# Estilos (sem auth)
curl http://localhost:5000/api/styles
```

### Testar Upload
```bash
# Primeiro faça login e pegue o token
TOKEN="seu-jwt-token-aqui"

# Upload e geração
curl -X POST http://localhost:5000/api/generate \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@/caminho/para/sua/imagem.jpg" \
  -F "stylePreset=white-clean"
```

---

## 📊 Monitoramento

### Ver Uso de Recursos
```bash
# CPU e memória
docker stats

# Espaço em disco
df -h

# Ver processos Node
ps aux | grep node
```

### Monitorar Logs em Tempo Real
```bash
# Backend
tail -f server/logs/app.log

# PostgreSQL (Docker)
docker-compose logs -f postgres

# Nginx (se aplicável)
tail -f /var/log/nginx/access.log
```

---

## 🔒 Segurança

### Gerar JWT Secret Seguro
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -hex 64
```

### Ver Variáveis de Ambiente
```bash
# Backend
cat server/.env

# Frontend
cat client/.env
```

---

## 🆘 Troubleshooting Rápido

### Port já em uso
```bash
# Linux/Mac - Matar processo na porta 5000
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <numero_do_pid> /F
```

### Resetar Node Modules
```bash
# Backend
cd server
rm -rf node_modules package-lock.json
npm install

# Frontend
cd client
rm -rf node_modules package-lock.json
npm install
```

### Limpar Cache do Vite
```bash
cd client
rm -rf node_modules/.vite
npm run dev
```

---

## 📝 Git Útil

### Commits Semânticos
```bash
git commit -m "feat: adiciona sistema de pagamentos"
git commit -m "fix: corrige erro de upload"
git commit -m "docs: atualiza README"
git commit -m "style: melhora UI do dashboard"
```

### Desfazer Mudanças
```bash
# Desfazer último commit (mantém mudanças)
git reset --soft HEAD~1

# Descartar mudanças locais
git checkout -- .

# Voltar a um commit específico
git reset --hard <commit-hash>
```

---

**Dica:** Salve este arquivo como referência rápida durante o desenvolvimento!
