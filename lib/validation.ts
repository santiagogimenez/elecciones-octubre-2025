import { z } from 'zod';

export const cargaSchema = z.object({
  circuito_nombre: z.string().min(2),
  circuito_codigo: z.string().min(1).optional().nullable(),
  mesa_numero: z.number().int().min(1),
  votos: z.array(z.object({
    partido_id: z.string().uuid(),
    votos: z.number().int().min(0)
  })).min(1),
  blancos: z.number().int().min(0).default(0),
  nulos: z.number().int().min(0).default(0),
  recurridos: z.number().int().min(0).default(0),
  total_escrutados: z.number().int().min(0)
}).refine((d) => {
  const sumaListas = d.votos.reduce((acc, v) => acc + (v.votos || 0), 0);
  const suma = sumaListas + d.blancos + d.nulos + d.recurridos;
  return suma === d.total_escrutados;
}, {
  message: 'La suma de listas + blancos + nulos + recurridos debe igualar el total escrutado',
  path: ['total_escrutados']
});
