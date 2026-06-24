import { z } from 'zod';

export const localeSchema = z.enum(['en', 'ru']);
export const moodSchema = z.enum(['great', 'good', 'okay', 'low', 'rough']);

export const moodEntrySchema = z.object({
  mood: moodSchema,
  intensity: z.number().int().min(1).max(5),
  tags: z.array(z.string().trim().min(1).max(30)).max(6).default([]),
  note: z.string().trim().max(1000).optional(),
});

export const journalEntrySchema = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(20_000),
  promptId: z.string().trim().max(80).optional(),
});

export const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  sessionId: z
    .string()
    .uuid()
    .or(z.string().regex(/^demo-[a-z0-9-]{1,80}$/i)),
  locale: localeSchema.default('en'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(4000),
      }),
    )
    .max(12)
    .default([]),
  context: z
    .object({
      enabled: z.boolean(),
      recentMoods: z
        .array(
          z.object({
            mood: moodSchema,
            intensity: z.number().int().min(1).max(5),
            tags: z.array(z.string().trim().min(1).max(30)).max(4).default([]),
          }),
        )
        .max(5)
        .default([]),
    })
    .optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
