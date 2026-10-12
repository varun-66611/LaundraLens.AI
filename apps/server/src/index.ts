import cors from '@fastify/cors';
import Fastify from 'fastify';
import { z } from 'zod';
import { runTrace } from './engine.js';

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });
app.get('/health', async () => ({ status: 'ok', service: 'LaundraLens TRACE API' }));
app.get('/api/datasets', async () => ([
  { id: 'all', name: 'All intelligence', description: 'Combined seeded portfolio' },
  { id: 'northstar', name: 'Northstar retail', description: 'Domestic retail and business accounts' },
  { id: 'correspondent', name: 'Correspondent pilot', description: 'Cross-border correspondent transfers' },
]));

const filtersSchema = z.object({
  dataset: z.enum(['all', 'northstar', 'correspondent']).default('all'),
  window: z.enum(['7d', '30d', 'all']).default('30d'),
  minAmount: z.number().min(0).max(1_000_000).default(0),
});

app.post('/api/trace', async (request, reply) => {
  const parsed = filtersSchema.safeParse(request.body ?? {});
  if (!parsed.success) return reply.status(400).send({ error: 'Invalid analysis filters', details: parsed.error.flatten() });
  return runTrace(parsed.data);
});

const port = Number(process.env.PORT ?? 4000);
await app.listen({ port, host: '0.0.0.0' });
