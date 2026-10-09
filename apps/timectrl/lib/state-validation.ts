import { z } from 'zod';

const entry = z.object({ id: z.string().min(1).max(200), projectId: z.string().min(1).max(200), start: z.number().finite().nonnegative(), end: z.number().finite().nonnegative().optional() }).refine(v => v.end === undefined || v.end >= v.start);
export const stateSchema = z.object({
  projects: z.array(z.object({ id: z.string().min(1).max(200), name: z.string().min(1).max(300), color: z.string().regex(/^#[0-9a-fA-F]{6}$/) })).max(500),
  entries: z.array(entry).max(3000), active: entry.nullable(), undo: z.string().max(100000).nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), updatedAt: z.number().int().nonnegative().max(8640000000000000),
  reportSettings: z.object({ enabled: z.boolean(), email: z.string().max(254), time: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/), timezone: z.literal('Europe/Oslo').optional() }),
  reportRecipientSeeded: z.boolean().optional(),
});
export type StoredState = z.infer<typeof stateSchema>;
