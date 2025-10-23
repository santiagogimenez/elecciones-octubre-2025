'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import PendingQueueSync from '@/components/PendingQueueSync';
import { enqueue } from '@/lib/offlineQueue';
import { cargaSchema } from '@/lib/validation';

export default function CargaPage() {
  const [partidos, setPartidos] = useState<any[]>([]);
  const [votos, setVotos] = useState<Record<string, number>>({});
  const [blancos, setBlancos] = useState(0);
  const [nulos, setNulos] = useState(0);
  const [recurridos, setRecurridos] = useState(0);
  const [total, setTotal] = useState(0);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error' | 'pending' | ''>('');
  const [showSuccess, setShowSuccess] = useState(false);

  const [circuitoNombre, setCircuitoNombre] = useState('');
  const [circuitoCodigo, setCircuitoCodigo] = useState('');
  const [mesaNumero, setMesaNumero] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from('partidos').select('*').order('orden');
      setPartidos(p || []);
    })();
  }, []);

  const sumaListas = useMemo(
    () => partidos.reduce((acc, p) => acc + (votos[p.id] || 0), 0),
    [partidos, votos]
  );
  const sumaTotal = sumaListas + blancos + nulos + recurridos;
  const sumaOK = sumaTotal === total;

  const ensureCircuitoMesa = async (): Promise<string> => {
    let circuitoId: string | null = null;
    if (circuitoCodigo) {
      const { data: c0 } = await supabase.from('circuitos').select('id').eq('codigo', circuitoCodigo).maybeSingle();
      if (c0?.id) circuitoId = c0.id;
    }
    if (!circuitoId) {
      const { data: c1 } = await supabase.from('circuitos')
        .insert({ nombre: circuitoNombre, codigo: circuitoCodigo || null })
        .select('id').single();
      circuitoId = c1?.id ?? null;
      if (!circuitoId) {
        const { data: c2 } = await supabase.from('circuitos').select('id').eq('nombre', circuitoNombre).maybeSingle();
        circuitoId = c2?.id ?? null;
      }
    }
    if (!circuitoId) throw new Error('No se pudo crear/obtener el circuito');

    const { data: m0 } = await supabase.from('mesas').select('id')
      .eq('numero', mesaNumero).eq('circuito_id', circuitoId).maybeSingle();

    if (m0?.id) return m0.id;
    const { data: m1 } = await supabase.from('mesas').insert({ numero: mesaNumero, circuito_id: circuitoId }).select('id').single();
    if (!m1?.id) throw new Error('No se pudo crear la mesa');
    return m1.id;
  };

  const submit = async () => {
    setMsg('');
    setMsgType('');
    const payload = {
      circuito_nombre: circuitoNombre,
      circuito_codigo: circuitoCodigo || null,
      mesa_numero: mesaNumero,
      votos: partidos.map((p: any) => ({ partido_id: p.id, votos: votos[p.id] || 0 })),
      blancos, nulos, recurridos, total_escrutados: total
    };

    const parsed = cargaSchema.safeParse(payload);
    if (!parsed.success) {
      setMsg(parsed.error.issues[0]?.message || 'Datos inválidos');
      setMsgType('error');
      return;
    }

    let mesaId: string;
    try {
      mesaId = await ensureCircuitoMesa();
    } catch {
      enqueue(payload);
      setMsg('Sin conexión. Guardado para enviar luego.');
      setMsgType('pending');
      return;
    }

    try {
      // Verificar si la mesa ya fue cargada
      const { data: existingMesa } = await supabase
        .from('actas')
        .select('mesa_id')
        .eq('mesa_id', mesaId)
        .maybeSingle();
      
      if (existingMesa) {
        setMsg('⚠️ Esta mesa ya fue cargada anteriormente. No se puede sobrescribir.');
        setMsgType('error');
        return;
      }

      const { error: e1 } = await supabase.from('actas').insert({
        mesa_id: mesaId, blancos, nulos, recurridos, total_escrutados: total
      });
      if (e1) throw e1;

      for (const v of payload.votos) {
        const { error: e2 } = await supabase.from('resultados').insert({
          mesa_id: mesaId, partido_id: v.partido_id, votos: v.votos
        });
        if (e2) throw e2;
      }
      setMsg(`✓ Mesa ${mesaNumero} - ${circuitoNombre} cargada exitosamente`);
      setMsgType('success');
      setShowSuccess(true);
    } catch {
      enqueue(payload);
      setMsg('Sin conexión. Guardado para enviar luego.');
      setMsgType('pending');
    }
  };

  const resetForm = () => {
    setVotos({});
    setBlancos(0);
    setNulos(0);
    setRecurridos(0);
    setTotal(0);
    setCircuitoNombre('');
    setCircuitoCodigo('');
    setMesaNumero(0);
    setMsg('');
    setMsgType('');
    setShowSuccess(false);
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sticky top-0 bg-[#0b1220] py-3 -mx-3 px-3 sm:mx-0 sm:px-0 z-10 border-b border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold">Carga de Resultados</h1>
        <PendingQueueSync />
      </header>

      {showSuccess && (
        <div className="card bg-emerald-900/50 border-2 border-emerald-500 animate-in fade-in duration-300">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl sm:text-4xl">✓</span>
              <div className="flex-1">
                <div className="font-bold text-lg text-emerald-300 mb-1">¡Carga exitosa!</div>
                <div className="text-sm sm:text-base opacity-90 break-words">{msg}</div>
              </div>
            </div>
            <button 
              onClick={resetForm}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-colors w-full text-lg font-bold"
            >
              ✓ Cargar Nueva Mesa
            </button>
          </div>
        </div>
      )}

      {!showSuccess && (
        <>
          <div className="card">
            <div className="space-y-4">
              <div>
                <label>Circuito (nombre)</label>
                <input 
                  placeholder="Ej: Formosa Capital" 
                  value={circuitoNombre} 
                  onChange={e=>setCircuitoNombre(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div>
                <label>Código de circuito (opcional)</label>
                <input 
                  placeholder="Ej: FC" 
                  value={circuitoCodigo} 
                  onChange={e=>setCircuitoCodigo(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div>
                <label>Número de mesa</label>
                <input 
                  type="number" 
                  inputMode="numeric"
                  min={1} 
                  value={mesaNumero || ''} 
                  onChange={e=>setMesaNumero(parseInt(e.target.value||'0'))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 px-1">Votos por partido</h2>
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {partidos.map((p:any)=>(
                <div key={p.id} className="card">
                  <label className="text-sm sm:text-base font-medium mb-2">{p.nombre}</label>
                  <input 
                    type="number" 
                    inputMode="numeric"
                    min={0}
                    value={votos[p.id] ?? ''}
                    onChange={e=>setVotos(prev=>({ ...prev, [p.id]: parseInt(e.target.value || '0') }))}
                    placeholder="0" 
                  />
                </div>
              ))}
            </section>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 px-1">Otros votos</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="card">
                <label>Blancos</label>
                <input 
                  type="number" 
                  inputMode="numeric"
                  min={0} 
                  value={blancos} 
                  onChange={e=>setBlancos(+e.target.value||0)}
                  placeholder="0"
                />
              </div>
              <div className="card">
                <label>Nulos</label>
                <input 
                  type="number" 
                  inputMode="numeric"
                  min={0} 
                  value={nulos} 
                  onChange={e=>setNulos(+e.target.value||0)}
                  placeholder="0"
                />
              </div>
              <div className="card">
                <label>Recurridos</label>
                <input 
                  type="number" 
                  inputMode="numeric"
                  min={0} 
                  value={recurridos} 
                  onChange={e=>setRecurridos(+e.target.value||0)}
                  placeholder="0"
                />
              </div>
              <div className="card">
                <label>Total escrutados</label>
                <input 
                  type="number" 
                  inputMode="numeric"
                  min={0} 
                  value={total} 
                  onChange={e=>setTotal(+e.target.value||0)}
                  placeholder="0"
                />
                <div className="text-xs sm:text-sm mt-2 px-2 py-1 rounded-lg bg-slate-800/50">
                  Suma: <span className="font-bold">{sumaTotal}</span> {sumaOK ? '✓' : '✗'}
                </div>
              </div>
            </div>
          </div>

          {!sumaOK && total > 0 && (
            <div className="text-sm sm:text-base p-4 rounded-xl bg-amber-900/30 text-amber-300 border border-amber-700/50">
              ⚠️ La suma de votos ({sumaTotal}) debe igualar el total escrutado ({total})
            </div>
          )}

          <button 
            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full text-lg font-bold sticky bottom-0" 
            onClick={submit} 
            disabled={!sumaOK || !circuitoNombre || !mesaNumero}
          >
            {!sumaOK ? '⚠️ Revisar suma' : !circuitoNombre ? '⚠️ Falta circuito' : !mesaNumero ? '⚠️ Falta mesa' : '✓ Enviar Resultados'}
          </button>
          
          {msg && msgType !== 'success' && (
            <div className={`text-sm sm:text-base p-4 rounded-xl border ${
              msgType === 'error' ? 'bg-red-900/30 text-red-300 border-red-700/50' : 
              msgType === 'pending' ? 'bg-amber-900/30 text-amber-300 border-amber-700/50' : 
              'bg-slate-800/50 border-slate-700'
            }`}>
              {msg}
            </div>
          )}
        </>
      )}
    </div>
  );
}
