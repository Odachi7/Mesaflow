# MesaFlow 🍽️

Sistema Multi-Tenant completo para gestão de restaurantes com arquitetura moderna e escalável.

## 🚀 Tecnologias

### Backend
- **NestJS** - Framework Node.js enterprise-grade
- **PostgreSQL** - Banco de dados relacional
- **Prisma ORM** - Type-safe database client
- **Redis** - Cache e pub/sub
- **Socket.io** - WebSocket para tempo real
- **JWT** - Autenticação segura

### Frontend
- **Next.js 15** - React framework com App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Estilização utility-first
- **Ant Design** - Biblioteca de componentes UI
- **React Query** - Cache e sincronização de dados
- **Zustand** - State management
- **Socket.io Client** - Comunicação tempo real

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Docker e Docker Compose
- Git

## 🛠️ Setup Local

### 1. Clonar o repositório

```bash
git clone <repository-url>
cd MesaFlow
```

### 2. Copiar arquivo de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações.

### 3. Instalar dependências

```bash
npm install
```

### 4. Subir containers Docker

```bash
npm run docker:up
```

Isso irá iniciar:
- PostgreSQL na porta 5432
- Redis na porta 6379

### 5. Configurar o banco de dados

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### 6. Iniciar aplicações

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend  
npm run dev:frontend
```

Ou usar concurrently:

```bash
npm run dev
```

## 🌐 Acessos

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs (Swagger)**: http://localhost:3001/api
- **Prisma Studio**: `npm run prisma:studio`

## 📁 Estrutura do Projeto

```
MesaFlow/
├── backend/          # API NestJS
│   ├── src/
│   │   ├── common/   # Guards, decorators, middleware
│   │   ├── config/   # Configurações
│   │   ├── database/ # Prisma service
│   │   └── modules/  # Módulos de negócio
│   └── prisma/       # Schema e migrations
├── frontend/         # App Next.js 15
│   └── src/
│       ├── app/      # App Router pages
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── store/
├── shared/           # Tipos TypeScript compartilhados
└── docker/           # Configurações Docker
```

## 🔐 Autenticação

O sistema usa autenticação JWT com identificação de tenant via header HTTP:

```bash
# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: {tenant-uuid}" \
  -d '{"email":"admin@example.com","password":"senha123"}'
```

## 🏗️ Arquitetura Multi-Tenant

- **Estratégia**: Shared Database, Shared Schema
- **Isolamento**: Por `tenant_id` em todas as tabelas
- **Identificação**: Header `X-Tenant-ID`
- **Segurança**: 
  - Middleware de tenant
  - Prisma middleware auto-inject
  - Row Level Security (RLS)
  - Guards de autorização

## 📦 Funcionalidades

### Fase 1 - MVP ✅
- [x] Multi-tenancy completo
- [x] Autenticação e autorização
- [x] Gestão de mesas
- [x] Sistema de pedidos/comandas
- [x] Cardápio (produtos e categorias)
- [x] Pagamentos múltiplos
- [x] Gestão de caixa
- [x] WebSocket tempo real
- [x] Dashboard com métricas

### Fase 2 - Core Features 🚧
- [ ] Gestão de estoque
- [ ] Receitas de produtos
- [ ] Relatórios avançados
- [ ] Chat interno
- [ ] Notificações push

### Fase 3 - Avançado 📅
- [ ] App mobile (React Native)
- [ ] QR Code self-service
- [ ] Sistema de reservas
- [ ] Delivery integrado
- [ ] Kitchen Display System

## 🧪 Testes

```bash
# Backend - Unit tests
cd backend
npm test

# Backend - E2E tests
npm run test:e2e

# Frontend - Component tests
cd frontend
npm test
```

## 📊 Scripts Úteis

```bash
# Docker
npm run docker:up      # Subir containers
npm run docker:down    # Parar containers
npm run docker:logs    # Ver logs

# Prisma
npm run prisma:migrate # Rodar migrations
npm run prisma:studio  # Abrir Prisma Studio

# Build
npm run build          # Build all workspaces
npm run build:backend  # Build apenas backend
npm run build:frontend # Build apenas frontend
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença ISC.

## 👥 Autores

- Desenvolvimento inicial - MesaFlow Team

## 🙏 Agradecimentos

- Arquitetura baseada em best practices de sistemas multi-tenant
- Inspirado em sistemas POS modernos
