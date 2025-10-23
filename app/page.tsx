'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Mapeo de colores por nombre de partido (para garantizar consistencia)
const PARTY_COLORS: Record<string, string> = {
  'Juntos por la Libertad y la Republica': '#f59e0b',  // Amarillo
  'La Libertad Avanza': '#8b5cf6',                      // Violeta
  'Frente de la Victoria': '#3b82f6',                   // Azul
  'Partido del Obrero': '#ef4444',                      // Rojo
  'Principios y Conviccion': '#10b981'                  // Verde
};

export default function Dashboard() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMesas: 0,
    totalCircuitos: 0,
    blancos: 0,
    nulos: 0,
    recurridos: 0,
    mesasCerradas: 0,
    avanceEscrutinio: 0
  });
  const [viewMode, setViewMode] = useState<'cards' | 'pie' | 'bar'>('cards');
  
  const total = rows.reduce((a, r) => a + (r.total_votos || 0), 0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Totales por partido
      const { data } = await supabase.from('v_totales_partido').select('*');
      setRows(data || []);
      
      // Estadísticas generales
      const [mesasRes, circuitosRes, actasRes] = await Promise.all([
        supabase.from('mesas').select('id', { count: 'exact', head: true }),
        supabase.from('circuitos').select('id', { count: 'exact', head: true }),
        supabase.from('actas').select('blancos, nulos, recurridos, cerrada')
      ]);
      
      const actasData = actasRes.data || [];
      const totalBlancos = actasData.reduce((acc, a) => acc + (a.blancos || 0), 0);
      const totalNulos = actasData.reduce((acc, a) => acc + (a.nulos || 0), 0);
      const totalRecurridos = actasData.reduce((acc, a) => acc + (a.recurridos || 0), 0);
      const mesasCerradas = actasData.filter(a => a.cerrada).length;
      
      setStats({
        totalMesas: mesasRes.count || 0,
        totalCircuitos: circuitosRes.count || 0,
        blancos: totalBlancos,
        nulos: totalNulos,
        recurridos: totalRecurridos,
        mesasCerradas,
        avanceEscrutinio: mesasRes.count ? Math.round((actasData.length / mesasRes.count) * 100) : 0
      });
      
      setLoading(false);
    };
    fetchData();

    const channel = supabase.channel('realtime:resultados')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resultados' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'actas' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const chartData = rows.map((r) => ({
    name: r.nombre.length > 20 ? r.nombre.substring(0, 20) + '...' : r.nombre,
    fullName: r.nombre,
    value: r.total_votos,
    percentage: total ? ((r.total_votos / total) * 100).toFixed(1) : 0,
    color: PARTY_COLORS[r.nombre] || '#94a3b8'  // Color por nombre, no por índice
  }));

  const totalVotosEmitidos = total + stats.blancos + stats.nulos;
  const participacionData = [
    { name: 'Votos Válidos', value: total, color: '#10b981' },
    { name: 'Blancos', value: stats.blancos, color: '#94a3b8' },
    { name: 'Nulos', value: stats.nulos, color: '#ef4444' }
  ].filter(d => d.value > 0);

  return (
    <div className="flex flex-col gap-4 pb-6">
      <header className="sticky top-0 bg-[#0b1220] py-3 -mx-3 px-3 sm:mx-0 sm:px-0 z-10 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Dashboard de Control</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {loading ? 'Cargando...' : `${rows.length} ${rows.length === 1 ? 'partido' : 'partidos'}`}
          </p>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-slate-400">Cargando resultados...</div>
        </div>
      ) : rows.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">🗳️</div>
          <p className="text-slate-400">No hay resultados cargados aún</p>
        </div>
      ) : (
        <>
          {/* Estadísticas generales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card">
              <div className="text-xs text-slate-400 mb-1">Total Votos</div>
              <div className="text-2xl font-bold text-emerald-400">{totalVotosEmitidos.toLocaleString()}</div>
            </div>
            <div className="card">
              <div className="text-xs text-slate-400 mb-1">Mesas Cargadas</div>
              <div className="text-2xl font-bold text-blue-400">{stats.totalMesas}</div>
            </div>
            <div className="card">
              <div className="text-xs text-slate-400 mb-1">Circuitos</div>
              <div className="text-2xl font-bold text-purple-400">{stats.totalCircuitos}</div>
            </div>
            <div className="card">
              <div className="text-xs text-slate-400 mb-1">Escrutinio</div>
              <div className="text-2xl font-bold text-amber-400">{stats.avanceEscrutinio}%</div>
            </div>
          </div>

          {/* Botones de vista */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                viewMode === 'cards' ? 'bg-emerald-600' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              📊 Ranking
            </button>
            <button
              onClick={() => setViewMode('pie')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                viewMode === 'pie' ? 'bg-emerald-600' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              🥧 Gráfico Circular
            </button>
            <button
              onClick={() => setViewMode('bar')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                viewMode === 'bar' ? 'bg-emerald-600' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              📈 Gráfico de Barras
            </button>
          </div>

          {/* Vista de Cards (Ranking) */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 gap-3">
              {rows.sort((a, b) => b.total_votos - a.total_votos).map((r: any, index: number) => {
                const porcentaje = total ? ((r.total_votos / total) * 100).toFixed(1) : '0';
                const color = PARTY_COLORS[r.nombre] || '#94a3b8';
                return (
                  <div key={r.partido_id} className="card hover:bg-slate-900/90 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-lg sm:text-xl">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base sm:text-lg truncate">{r.nombre}</div>
                        <div className="text-xs sm:text-sm text-slate-400 mt-0.5">
                          {r.total_votos.toLocaleString()} votos
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-2xl sm:text-3xl font-bold" style={{ color }}>
                          {porcentaje}%
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500"
                        style={{ width: `${porcentaje}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Gráfico Circular */}
          {viewMode === 'pie' && (
            <div className="card">
              <h3 className="text-lg font-bold mb-4">Distribución de Votos</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percentage }) => `${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '2px solid #10b981', 
                      borderRadius: '0.75rem',
                      color: '#0f172a',
                      padding: '12px',
                      fontWeight: '600',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                    }}
                    labelStyle={{ color: '#0f172a', fontWeight: '700' }}
                    itemStyle={{ color: '#0f172a' }}
                    formatter={(value: any) => [`${value.toLocaleString()} votos`, '']}
                  />
                  <Legend 
                    formatter={(value, entry: any) => entry.payload.fullName}
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gráfico de Barras */}
          {viewMode === 'bar' && (
            <div className="card">
              <h3 className="text-lg font-bold mb-4">Comparativa de Votos</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '2px solid #10b981', 
                      borderRadius: '0.75rem',
                      color: '#0f172a',
                      padding: '12px',
                      fontWeight: '600',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                    }}
                    labelStyle={{ color: '#0f172a', fontWeight: '700' }}
                    itemStyle={{ color: '#0f172a' }}
                    formatter={(value: any) => [`${value.toLocaleString()} votos`, '']}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Desglose detallado */}
          <div className="card">
            <h3 className="text-lg font-bold mb-3">Desglose Completo</h3>
            <div className="space-y-2">
              {rows.sort((a, b) => b.total_votos - a.total_votos).map((r: any) => {
                const porcentaje = total ? ((r.total_votos / total) * 100).toFixed(2) : '0';
                const color = PARTY_COLORS[r.nombre] || '#94a3b8';
                return (
                  <div key={r.partido_id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-sm sm:text-base">{r.nombre}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{r.total_votos.toLocaleString()}</div>
                      <div className="text-xs text-slate-400">{porcentaje}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Votos especiales */}
          {(stats.blancos > 0 || stats.nulos > 0 || stats.recurridos > 0) && (
            <div className="card">
              <h3 className="text-lg font-bold mb-3">Votos Especiales</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-400">{stats.blancos.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 mt-1">Blancos</div>
                  <div className="text-xs text-slate-600">
                    {totalVotosEmitidos ? ((stats.blancos / totalVotosEmitidos) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{stats.nulos.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 mt-1">Nulos</div>
                  <div className="text-xs text-slate-600">
                    {totalVotosEmitidos ? ((stats.nulos / totalVotosEmitidos) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">{stats.recurridos.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 mt-1">Recurridos</div>
                  <div className="text-xs text-slate-600">
                    {totalVotosEmitidos ? ((stats.recurridos / totalVotosEmitidos) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gráfico de participación */}
          {participacionData.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-bold mb-4">Distribución Total</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={participacionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }: any) => `${name}: ${value.toLocaleString()}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {participacionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '2px solid #10b981', 
                      borderRadius: '0.75rem',
                      color: '#0f172a',
                      padding: '12px',
                      fontWeight: '600',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                    }}
                    labelStyle={{ color: '#0f172a', fontWeight: '700' }}
                    itemStyle={{ color: '#0f172a' }}
                    formatter={(value: any) => [`${value.toLocaleString()} votos`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="card bg-slate-800/50 border border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base text-slate-400">Total votos listas</span>
              <span className="text-xl sm:text-2xl font-bold">{total.toLocaleString()}</span>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-center text-slate-500">
            🔄 Actualización en tiempo real activa
          </div>
        </>
      )}
    </div>
  );
}
