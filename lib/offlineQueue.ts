type Payload = {
  circuito_nombre: string;
  circuito_codigo?: string | null;
  mesa_numero: number;
  votos: { partido_id: string; votos: number }[];
  blancos: number;
  nulos: number;
  recurridos: number;
  total_escrutados: number;
};

const KEY = 'offline-queue';

export function enqueue(data: Payload) {
  const q = JSON.parse(localStorage.getItem(KEY) || '[]');
  q.push({ ...data, _ts: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(q));
}

export function dequeueAll(): Payload[] {
  const q = JSON.parse(localStorage.getItem(KEY) || '[]');
  localStorage.removeItem(KEY);
  return q;
}

export function hasPending(): boolean {
  const q = JSON.parse(localStorage.getItem(KEY) || '[]');
  return q.length > 0;
}
