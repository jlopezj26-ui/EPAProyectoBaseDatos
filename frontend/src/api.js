const API_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = Array.isArray(body?.message)
      ? body.message.join('. ')
      : body?.message;
    throw new Error(message || `Error ${response.status}: no se pudo completar la solicitud.`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const productosApi = {
  list: () => request('/productos'),
  create: (producto) => request('/productos', {
    method: 'POST',
    body: JSON.stringify(producto),
  }),
  update: (id, producto) => request(`/productos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(producto),
  }),
  remove: (id) => request(`/productos/${id}`, { method: 'DELETE' }),
};