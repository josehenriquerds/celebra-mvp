import { z } from 'zod';

export const segmentRuleSchema = z.object({
  field: z.string(),
  operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'in', 'not_in']),
  value: z.any(),
  logic: z.enum(['AND', 'OR']).optional(),
});

export const segmentSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  ruleJson: z.string().refine(
    (val) => {
      try {
        const rules = JSON.parse(val);
        return Array.isArray(rules);
      } catch {
        return false;
      }
    },
    { message: 'Regras devem ser um JSON válido em formato de array' }
  ),
  isActive: z.boolean().default(true),
  autoUpdate: z.boolean().default(true),
});

export type SegmentFormData = z.infer<typeof segmentSchema>;

export const segmentUpdateSchema = segmentSchema.partial();
