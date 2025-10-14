# Sistema de Fornecedores - Celebre MVP

## 📋 Visão Geral

Sistema completo de gestão de fornecedores com marketplace, sistema de leilão reverso e comparação de propostas, inspirado na UX do Casamentos.com.br mas com funcionalidades aprimoradas.

## 🎯 Funcionalidades Principais

### 1. **Marketplace de Fornecedores** (`/events/[id]/vendors/marketplace`)
- Grid de cards visual similar ao Casamentos.com.br
- Categorização por tipo de serviço (Buffet, Fotografia, DJ, etc.)
- Filtros avançados (preço, avaliação, localização)
- Sistema de favoritos
- Badges de status (Contratado, Com Propostas, Leilão Ativo)

### 2. **Sistema de Leilão Reverso**
- **Orçamento Direto**: Solicita proposta individual de um fornecedor
- **Leilão Reverso**: Múltiplos fornecedores competem com suas melhores ofertas
- Duração configurável (24h a 7 dias)
- Contador regressivo para criar urgência
- Notificações em tempo real

### 3. **Comparação de Propostas** (`/events/[id]/vendors/proposals/[proposalId]`)
- Visualização lado a lado
- Ranking por melhor preço
- Análise de economia vs orçamento máximo
- Portfolio dos fornecedores
- Avaliações e reviews

## 🏗️ Arquitetura

```
src/features/vendors/
├── components/
│   ├── VendorMarketplaceCard.tsx       # Card do fornecedor no marketplace
│   ├── RequestProposalModal.tsx        # Modal de solicitação de orçamento/leilão
│   └── index.ts                        # Exports
└── README.md

src/app/events/[id]/vendors/
├── page.tsx                            # Lista de fornecedores contratados (existente)
├── marketplace/
│   └── page.tsx                        # Marketplace de fornecedores
└── proposals/
    └── [proposalId]/
        └── page.tsx                    # Visualização de propostas
```

## 🎨 Componentes

### VendorMarketplaceCard

Card visual do fornecedor com suporte para:
- Imagem ou ícone de categoria (quando sem foto)
- Badge de favorito (coração)
- Badges de status dinâmicos
- Preço inicial e melhor oferta em leilão
- Botões de ação contextuais
- Animações suaves

**Props:**
```typescript
interface VendorMarketplaceCardProps {
  vendor: {
    id: string
    name: string
    category: string
    city?: string
    state?: string
    imageUrl?: string | null
    rating?: number
    reviewCount?: number
    priceFromCents?: number
    descriptionShort?: string
    isContracted?: boolean
    isFavorited?: boolean
    hasActiveProposal?: boolean
    proposalCount?: number
    lowestBidCents?: number
    auctionEndsAt?: Date
  }
  onFavorite?: (vendorId: string) => void
  onContact?: (vendorId: string) => void
  onRequestProposal?: (vendorId: string) => void
  onViewProposals?: (vendorId: string) => void
  variant?: 'marketplace' | 'contracted'
}
```

### RequestProposalModal

Modal para solicitação de orçamentos com 2 modos:

#### Modo 1: Orçamento Direto
- Solicita proposta personalizada de um fornecedor específico
- Resposta em até 24h
- Negociação direta

#### Modo 2: Leilão Reverso
- Múltiplos fornecedores competem
- Define orçamento máximo (os fornecedores veem e fazem ofertas menores)
- Duração configurável
- Melhor custo-benefício

**Props:**
```typescript
interface RequestProposalModalProps {
  vendor: {
    id: string
    name: string
    category: string
    priceFromCents?: number
  }
  eventDate?: Date
  guestCount?: number
  onClose: () => void
  onSubmit: (data: ProposalRequest) => void
}
```

## 📊 Fluxo de Uso

### Cenário 1: Orçamento Direto
```
1. Usuário navega no marketplace
2. Encontra um fornecedor específico
3. Clica em "Solicitar Orçamento"
4. Preenche detalhes do evento
5. Escolhe "Orçamento Direto"
6. Fornecedor recebe notificação
7. Fornecedor envia proposta
8. Usuário recebe e analisa
9. Aceita ou negocia
```

### Cenário 2: Leilão Reverso
```
1. Usuário quer comparar preços
2. Seleciona categoria (ex: Fotografia)
3. Clica em "Iniciar Leilão"
4. Define orçamento máximo e prazo
5. Sistema notifica fornecedores da categoria
6. Fornecedores competem com ofertas
7. Usuário vê propostas em tempo real
8. Compara ofertas lado a lado
9. Escolhe melhor custo-benefício
10. Aceita proposta
```

## 🎯 Diferencial vs Casamentos.com.br

### O que mantivemos:
- Grid visual com cards
- Categorização por tipo de serviço
- Sistema de favoritos
- Badges de status

### O que melhoramos:
- ✅ **Sistema de Leilão Reverso** - Fornecedores competem ativamente
- ✅ **Comparação de Propostas** - Ver lado a lado com métricas
- ✅ **Análise de Economia** - Calcular % de economia vs orçamento
- ✅ **Contador Regressivo** - Criar urgência em leilões
- ✅ **Portfolio Inline** - Ver trabalhos sem sair da página
- ✅ **Múltiplos Modos** - Orçamento direto OU leilão reverso
- ✅ **Melhor UX** - Animações, estados de loading, feedback visual

## 🔄 Integração com Backend

### Endpoints Necessários

```typescript
// Listar fornecedores do marketplace
GET /api/events/:eventId/vendors/marketplace
Query: category, search, minPrice, maxPrice, minRating

// Solicitar orçamento/leilão
POST /api/events/:eventId/vendors/proposals
Body: ProposalRequest

// Listar propostas de um leilão
GET /api/events/:eventId/vendors/proposals/:proposalId

// Aceitar proposta
POST /api/events/:eventId/vendors/proposals/:proposalId/accept

// Recusar proposta
POST /api/events/:eventId/vendors/proposals/:proposalId/decline

// Favoritar/desfavoritar
POST /api/events/:eventId/vendors/:vendorId/favorite
DELETE /api/events/:eventId/vendors/:vendorId/favorite
```

## 🎨 Melhorias Futuras

### Curto Prazo
- [ ] Sistema de chat integrado
- [ ] Upload de requisitos/briefing
- [ ] Notificações push
- [ ] Auto-matching por IA

### Médio Prazo
- [ ] Videoconferência integrada
- [ ] Sistema de reviews/avaliações
- [ ] Contratos digitais
- [ ] Pagamentos escrow

### Longo Prazo
- [ ] Marketplace de templates/pacotes
- [ ] Sistema de recomendação por ML
- [ ] Analytics para fornecedores
- [ ] Gamificação

## 📱 Responsividade

Todos os componentes foram desenvolvidos com mobile-first:
- Grid adaptativo (1 col mobile → 2 cols tablet → 3 cols desktop)
- Modais full-screen em mobile
- Touch-friendly (botões grandes, espaçamento adequado)
- Otimizado para telas pequenas

## 🚀 Como Usar

```typescript
// Exemplo de uso do VendorMarketplaceCard
import { VendorMarketplaceCard } from '@/features/vendors/components'

<VendorMarketplaceCard
  vendor={vendor}
  onFavorite={(id) => toggleFavorite(id)}
  onContact={(id) => openChat(id)}
  onRequestProposal={(id) => openProposalModal(id)}
  onViewProposals={(id) => router.push(`/proposals/${id}`)}
/>

// Exemplo de uso do RequestProposalModal
import { RequestProposalModal } from '@/features/vendors/components'

<RequestProposalModal
  vendor={selectedVendor}
  eventDate={event.date}
  guestCount={event.guestCount}
  onClose={() => setShowModal(false)}
  onSubmit={(data) => createProposal(data)}
/>
```

## 🎯 Métricas de Sucesso

- **Taxa de Conversão**: % de visualizações → solicitações de orçamento
- **Taxa de Aceitação**: % de propostas aceitas
- **Economia Média**: Valor economizado usando leilão vs orçamento original
- **Tempo até Primeira Proposta**: Tempo médio de resposta dos fornecedores
- **NPS**: Satisfação com o processo

## 📝 Notas de Implementação

- Todos os valores monetários são armazenados em centavos (int)
- Datas de leilão usam timestamps UTC
- Sistema de notificações deve ser implementado (ex: Pusher, Socket.io)
- Cache de propostas para performance
- Otimização de imagens (next/image)

## 🐛 Issues Conhecidos

- [ ] Tabs component precisa de @radix-ui/react-tabs instalado
- [ ] Modal de proposta pode precisar ajustes de z-index
- [ ] Loading states podem ser aprimorados
- [ ] Tradução i18n pendente

---

**Desenvolvido com ❤️ para o Celebre MVP**
