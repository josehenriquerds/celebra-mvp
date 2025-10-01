import { z } from 'zod';

export const vendorCategories = [
  'Buffet',
  'DJ',
  'Decoração',
  'Fotografia',
  'Filmagem',
  'Doces',
  'Convites',
  'Iluminação',
  'Música ao vivo',
  'Espaço',
  'Cerimonial',
  'Segurança',
  'Bolo',
  'Bebidas',
  'Som',
  'Flores',
  'Maquiagem',
  'Cabelo',
  'Vestido/Traje',
  'Transporte',
  'Atrações',
] as const;

// Schema para cadastro público
export const vendorApplySchema = z.object({
  contactName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  companyName: z.string().min(2, 'Nome da empresa obrigatório'),
  instagramHandle: z.string().optional(),
  phoneE164: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Telefone deve estar no formato E.164 (+5527999999999)'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().length(2, 'Use a sigla do estado (ex: ES)'),
  country: z.string().optional().default('BR'),
  serviceRadiusKm: z.number().int().positive().optional(),
  categories: z.array(z.string()).min(1, 'Selecione pelo menos uma categoria'),
  priceFromCents: z.number().int().positive('Preço deve ser positivo').optional(),
  descriptionShort: z.string().max(280, 'Descrição curta deve ter no máximo 280 caracteres').optional(),
  descriptionLong: z.string().min(50, 'Descrição completa deve ter pelo menos 50 caracteres').optional(),
  websiteUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  whatsappUrl: z.string().url('URL do WhatsApp inválida').optional().or(z.literal('')),
  consentText: z.string().min(10, 'Você deve concordar com os termos'),
});

export type VendorApplyInput = z.infer<typeof vendorApplySchema>;

// Schema para listagem e filtros
export const vendorListSchema = z.object({
  status: z.enum(['pending_review', 'approved', 'rejected', 'suspended']).optional(),
  q: z.string().optional(), // busca por nome/empresa
  city: z.string().optional(),
  state: z.string().optional(),
  category: z.string().optional(),
  priceFromMin: z.number().int().optional(),
  priceFromMax: z.number().int().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type VendorListQuery = z.infer<typeof vendorListSchema>;

// Schema para mudança de status
export const vendorStatusChangeSchema = z.object({
  action: z.enum(['approve', 'reject', 'suspend', 'reactivate']),
  reason: z.string().optional(),
  actorUserId: z.string().optional(),
});

export type VendorStatusChangeInput = z.infer<typeof vendorStatusChangeSchema>;

// Schema para nota interna
export const vendorNoteSchema = z.object({
  noteText: z.string().min(3, 'Nota deve ter pelo menos 3 caracteres'),
  authorUserId: z.string(),
});

export type VendorNoteInput = z.infer<typeof vendorNoteSchema>;

// Schema para atualização (admin/vendor dono)
export const vendorUpdateSchema = vendorApplySchema.partial().omit({ consentText: true });

export type VendorUpdateInput = z.infer<typeof vendorUpdateSchema>;