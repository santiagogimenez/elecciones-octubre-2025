'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { dequeueAll, hasPending } from '@/lib/offlineQueue';

export default function PendingQueueSync() {
  const [pending, setPending] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setPending(hasPending());
    
    const onOnline = async () => {
      setSyncing(true);
      const batch = dequeueAll();
      for (const item of batch) {
        await upsertPayload(item).catch(() => {});
      }
      setPending(hasPending());
      setSyncing(false);
    };
    
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  if (syncing) {
    return <span className="badge bg-blue-700 animate-pulse">Sincronizando...</span>;
  }

  return (
    <span className={`badge ${pending ? 'bg-amber-700 animate-pulse' : 'bg-emerald-700'}`}>
      {pending ? '⚠️ Pendientes' : '✓ Sincronizado'}
    </span>
  );
}

async function upsertPayload(d: any) {
  // circuito
  let circuitoId: string | null = null;
  if (d.circuito_codigo) {
    const { data: c0 } = await supabase.from('circuitos').select('id').eq('codigo', d.circuito_codigo).maybeSingle();
    if (c0?.id) circuitoId = c0.id;
  }
  if (!circuitoId) {
    const { data: c1 } = await supabase.from('circuitos')
      .insert({ nombre: d.circuito_nombre, codigo: d.circuito_codigo || null })
      .select('id').single();
    circuitoId = c1?.id ?? null;
    if (!circuitoId) {
      const { data: c2 } = await supabase.from('circuitos').select('id').eq('nombre', d.circuito_nombre).maybeSingle();
      circuitoId = c2?.id ?? null;
    }
  }
  if (!circuitoId) throw new Error('Circuito no disponible');

  // mesa
  const { data: m0 } = await supabase.from('mesas').select('id')
    .eq('numero', d.mesa_numero).eq('circuito_id', circuitoId).maybeSingle();
  let mesaId = m0?.id as string | undefined;
  if (!mesaId) {
    const { data: m1 } = await supabase.from('mesas')
      .insert({ numero: d.mesa_numero, circuito_id: circuitoId })
      .select('id').single();
    mesaId = m1?.id;
  }
  if (!mesaId) throw new Error('Mesa no disponible');

  // acta
  const { error: e1 } = await supabase.from('actas').upsert({
    mesa_id: mesaId,
    blancos: d.blancos,
    nulos: d.nulos,
    recurridos: d.recurridos,
    total_escrutados: d.total_escrutados
  });
  if (e1) throw e1;

  // resultados
  for (const v of d.votos) {
    const { error: e2 } = await supabase.from('resultados').upsert({
      mesa_id: mesaId, partido_id: v.partido_id, votos: v.votos
    });
    if (e2) throw e2;
  }
}
