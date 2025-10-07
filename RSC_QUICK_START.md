# Quick Start: RSC + TanStack Query Hidratação

## 🎯 Guia Rápido para Adicionar Nova Fonte de Dados

Este guia mostra como adicionar uma nova funcionalidade usando React Server Components (RSC) + TanStack Query v5 com hidratação.

---

## 📋 Checklist de Implementação

### ✅ 1. Definir Schema Zod

Adicione em `src/lib/schemas.ts`:

```typescript
export const MeuDadoSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  valor: z.number(),
  data: z.string().datetime().optional(),
})

export type MeuDado = z.infer<typeof MeuDadoSchema>
```

### ✅ 2. Criar Server Component (Fetch)

Crie `src/app/minha-pagina/page.tsx`:

```typescript
import { Suspense } from 'react'
import { apiGet } from '@/lib/api'
import { parseArray, MeuDadoSchema } from '@/lib/schemas'
import type { MeuDado } from '@/lib/schemas'
import MinhaPaginaClient from './MinhaPaginaClient'
import MinhaPaginaSkeleton from './MinhaPaginaSkeleton'

async function getMeusDados() {
  try {
    const data = await apiGet<MeuDado[]>(
      '/api/meus-dados',
      {},
      {
        nextTags: ['meus-dados'],
        revalidate: 30  // Cache por 30s
      }
    )
    return parseArray(MeuDadoSchema.array(), data)
  } catch (error) {
    console.error('[MinhaPagina] Erro:', error)
    return []
  }
}

async function MinhaPaginaContent() {
  const dados = await getMeusDados()
  return <MinhaPaginaClient dados={dados} />
}

export default function MinhaPagina() {
  return (
    <Suspense fallback={<MinhaPaginaSkeleton />}>
      <MinhaPaginaContent />
    </Suspense>
  )
}
```

### ✅ 3. Criar Client Component (UI)

Crie `src/app/minha-pagina/MinhaPaginaClient.tsx`:

```typescript
'use client'

import { useState, useMemo } from 'react'
import type { MeuDado } from '@/lib/schemas'

interface MinhaPaginaClientProps {
  dados: MeuDado[]
}

export default function MinhaPaginaClient({ dados }: MinhaPaginaClientProps) {
  const [filtro, setFiltro] = useState('')

  const dadosFiltrados = useMemo(() => {
    if (!filtro) return dados
    return dados.filter(d =>
      d.titulo.toLowerCase().includes(filtro.toLowerCase())
    )
  }, [dados, filtro])

  return (
    <div>
      <input
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
        placeholder="Buscar..."
      />

      {dadosFiltrados.map(dado => (
        <div key={dado.id}>
          <h3>{dado.titulo}</h3>
          <p>{dado.valor}</p>
        </div>
      ))}
    </div>
  )
}
```

### ✅ 4. Criar Skeleton (Loading)

Crie `src/app/minha-pagina/MinhaPaginaSkeleton.tsx`:

```typescript
export default function MinhaPaginaSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
      ))}
    </div>
  )
}
```

---

## 🔄 Padrões de Fetch

### Fetch Simples

```typescript
const dados = await apiGet<MeuTipo>('/api/endpoint')
```

### Com Cache Tags

```typescript
const dados = await apiGet<MeuTipo>(
  '/api/endpoint',
  {},
  { nextTags: ['tag1', 'tag2'], revalidate: 60 }
)
```

### Fetch Múltiplo (Paralelo)

```typescript
const [dados1, dados2] = await Promise.all([
  apiGet<Tipo1>('/api/endpoint1'),
  apiGet<Tipo2>('/api/endpoint2'),
])
```

### Com Tratamento de Erro

```typescript
async function getDados() {
  try {
    const data = await apiGet<Tipo[]>('/api/endpoint')
    return parseArray(Schema.array(), data)
  } catch (error) {
    console.error('Erro:', error)
    return []  // Fallback seguro
  }
}
```

---

## 🎨 Quando Usar Client vs Server

### ✅ Use Server Component quando:

- Fazer fetch de dados
- Acessar recursos do servidor (DB, filesystem)
- Usar secrets/API keys
- Reduzir bundle JavaScript

### ✅ Use Client Component quando:

- Gerenciar estado (useState, useReducer)
- Usar lifecycle hooks (useEffect)
- Interatividade (onClick, onChange)
- Usar browser APIs (window, localStorage)

---

## 🔥 Invalidação de Cache

### Em Server Action

```typescript
'use server'
import { revalidateTag } from 'next/cache'

export async function criarMeuDado(data: MeuDado) {
  await apiPost('/api/meus-dados', data)

  // Invalida cache
  revalidateTag('meus-dados')
}
```

### Em Route Handler

```typescript
// app/api/meus-dados/route.ts
import { revalidateTag } from 'next/cache'

export async function POST(request: Request) {
  const body = await request.json()
  // ... salvar dado

  revalidateTag('meus-dados')
  return Response.json({ success: true })
}
```

---

## 🧩 Integração com TanStack Query (Cliente)

Se precisar de interações otimistas ou estado mais complexo no cliente:

### 1. Criar Hook

```typescript
// src/hooks/useMeusDados.ts
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'

export function useMeusDados() {
  return useQuery({
    queryKey: queryKeys.meusDados.all(),
    queryFn: () => fetch('/api/meus-dados').then(r => r.json()),
  })
}
```

### 2. Usar no Cliente

```typescript
'use client'
import { useMeusDados } from '@/hooks'

export default function MinhaPaginaClient({ dadosIniciais }: Props) {
  const { data: dados = dadosIniciais } = useMeusDados()

  // dados vem do servidor (hidratado) ou do fetch do cliente
  return <div>{dados.length} itens</div>
}
```

---

## 📦 Estrutura de Diretórios

```
src/
├── lib/
│   ├── api.ts              # apiGet, apiPost, extractArray
│   ├── schemas.ts          # Schemas Zod + types
│   └── query-client.ts     # QueryClient config
├── hooks/
│   └── useMeusDados.ts     # TanStack Query hooks
└── app/
    └── minha-pagina/
        ├── page.tsx        # Server Component
        ├── Client.tsx      # Client Component
        └── Skeleton.tsx    # Loading state
```

---

## ⚡ Performance Tips

### 1. **Paralelizar Fetches**

❌ Sequencial (lento):
```typescript
const dados1 = await fetch1()
const dados2 = await fetch2()
```

✅ Paralelo (rápido):
```typescript
const [dados1, dados2] = await Promise.all([fetch1(), fetch2()])
```

### 2. **Memoizar Cálculos**

```typescript
const resultado = useMemo(() => {
  return dados.filter(...).map(...).reduce(...)
}, [dados])
```

### 3. **useCallback para Handlers**

```typescript
const handleClick = useCallback((id: string) => {
  // lógica
}, [])
```

### 4. **Suspense Boundaries**

```typescript
<Suspense fallback={<Skeleton />}>
  <ComponentePesado />
</Suspense>
```

---

## 🐛 Debugging

### Ver Cache Hits/Misses

```bash
# .env.local
NEXT_PRIVATE_DEBUG_CACHE=1
```

### Console Server vs Client

- Server logs → Terminal do `npm run dev`
- Client logs → Browser DevTools Console

### Verificar se é Server/Client

```typescript
// Server Component (sem 'use client')
console.log('Roda no servidor')

// Client Component (com 'use client')
'use client'
console.log('Roda no navegador')
```

---

## ❌ Erros Comuns

### 1. "useCallback is not defined"

**Problema:** Esqueceu `'use client'` em componente que usa hooks

**Solução:**
```typescript
'use client'
import { useCallback } from 'react'
```

### 2. "X is not a function"

**Problema:** Dado não é array mas código chama `.map()` / `.forEach()`

**Solução:**
```typescript
const lista = Array.isArray(dados) ? dados : []
lista.forEach(...)
```

### 3. "Can't use hooks in Server Component"

**Problema:** Tentou usar `useState`, `useEffect`, etc em Server Component

**Solução:** Mova lógica para Client Component com `'use client'`

---

## 📚 Referências

- [Next.js App Router](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [TanStack Query v5](https://tanstack.com/query/latest)
- [Zod](https://zod.dev/)

---

**Dúvidas?** Consulte [MIGRATION_NOTES.md](./MIGRATION_NOTES.md) para exemplos detalhados.
