import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowUpRight,
  Boxes,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  LayoutDashboard,
  LoaderCircle,
  Package,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { productosApi } from './api.js';

const EMPTY_FORM = { nombre: '', descripcion: '', precio: '', stock: '' };
const money = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
});

function App() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  async function loadProductos() {
    setLoading(true);
    setError('');
    try {
      const data = await productosApi.list();
      setProductos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProductos();
  }, []);

  const visibleProductos = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es');
    return productos.filter((producto) => {
      const matchesQuery = `${producto.nombre} ${producto.descripcion || ''}`
        .toLocaleLowerCase('es')
        .includes(normalizedQuery);
      const matchesFilter = filter === 'Todos'
        || (filter === 'Bajo stock' && producto.stock <= 5)
        || (filter === 'Disponibles' && producto.stock > 5);
      return matchesQuery && matchesFilter;
    });
  }, [productos, query, filter]);

  const totalUnits = productos.reduce((total, producto) => total + producto.stock, 0);
  const inventoryValue = productos.reduce(
    (total, producto) => total + producto.precio * producto.stock,
    0,
  );
  const lowStock = productos.filter((producto) => producto.stock <= 5).length;

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(producto) {
    setEditing(producto);
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: String(producto.precio),
      stock: String(producto.stock),
    });
    setModalOpen(true);
  }

  async function saveProducto(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const producto = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: Number(form.precio),
      stock: Number(form.stock),
    };

    try {
      if (editing) {
        await productosApi.update(editing.id, producto);
      } else {
        await productosApi.create(producto);
      }
      setModalOpen(false);
      await loadProductos();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProducto(producto) {
    if (!window.confirm(`¿Eliminar "${producto.nombre}" del inventario?`)) return;
    setError('');
    try {
      await productosApi.remove(producto.id);
      setProductos((current) => current.filter((item) => item.id !== producto.id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app-shell min-h-screen bg-canvas text-ink">
      <aside className="sidebar">
        <a className="brand" href="#inicio" aria-label="EPA inicio">
          <span className="brand-mark"><Boxes size={21} strokeWidth={2.1} /></span>
          <span className="brand-copy"><strong>epa</strong><small>GESTIÓN SIMPLE</small></span>
        </a>

        <div className="sidebar-caption">ESPACIO DE TRABAJO</div>
        <nav className="sidebar-nav" aria-label="Navegación principal">
          <a className="nav-item active" href="#inventario"><LayoutDashboard size={18} />Inventario</a>
          <a className="nav-item" href="#productos"><Package size={18} />Productos</a>
        </nav>

        <div className="sidebar-bottom">
          <div className="help-box">
            <span className="help-icon"><CircleHelp size={17} /></span>
            <strong>¿Necesitas ayuda?</strong>
            <span>Consulta la documentación de la API.</span>
            <a href="http://localhost:3000/api/docs" target="_blank" rel="noreferrer">
              Abrir Swagger <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="profile-row">
            <div className="avatar">EP</div>
            <div><strong>EPA Admin</strong><span>Administrador</span></div>
            <ChevronDown size={16} className="profile-chevron" />
          </div>
        </div>
      </aside>

      <main id="inventario" className="main-content">
        <header className="topbar">
          <div className="breadcrumbs"><span>Espacio de trabajo</span><span className="crumb-divider">/</span><strong>Inventario</strong></div>
          <div className="topbar-right">
            <span className="live-status"><i />API conectada</span>
            <span className="topbar-date"><Clock3 size={15} /> Vista general</span>
          </div>
        </header>

        <div className="page-wrap">
          <section className="page-heading">
            <div>
              <div className="eyebrow">CONTROL DE EXISTENCIAS <span /></div>
              <h1>Inventario</h1>
              <p>Una vista clara de tus productos y existencias.</p>
            </div>
            <button className="button-primary" onClick={openCreate}>
              <Plus size={17} strokeWidth={2.4} /> Añadir producto
            </button>
          </section>

          {error && (
            <div className="error-banner" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button onClick={() => setError('')} aria-label="Cerrar aviso"><X size={17} /></button>
            </div>
          )}

          <section className="stats-grid" aria-label="Resumen del inventario">
            <article className="stat-block">
              <div className="stat-top"><span>Productos registrados</span><span className="stat-icon green"><Package size={17} /></span></div>
              <div className="stat-value">{loading ? '—' : productos.length}</div>
              <div className="stat-foot"><span className="stat-dot green-dot" />Catálogo actual</div>
            </article>
            <article className="stat-block">
              <div className="stat-top"><span>Unidades en stock</span><span className="stat-icon blue"><Boxes size={17} /></span></div>
              <div className="stat-value">{loading ? '—' : totalUnits.toLocaleString('es-ES')}</div>
              <div className="stat-foot">Suma de existencias</div>
            </article>
            <article className="stat-block">
              <div className="stat-top"><span>Valor del inventario</span><span className="stat-icon orange"><ArrowDownToLine size={17} /></span></div>
              <div className="stat-value">{loading ? '—' : money.format(inventoryValue)}</div>
              <div className="stat-foot">Precio × unidades</div>
            </article>
            <article className="stat-block">
              <div className="stat-top"><span>Stock bajo</span><span className="stat-icon rose"><AlertCircle size={17} /></span></div>
              <div className="stat-value">{loading ? '—' : lowStock}</div>
              <div className="stat-foot">{lowStock ? 'Revisar disponibilidad' : 'Todo al día'}</div>
            </article>
          </section>

          <section id="productos" className="inventory-section">
            <div className="section-heading">
              <div><h2>Todos los productos</h2><p>Gestiona los artículos de tu catálogo.</p></div>
              <button className="button-secondary" onClick={loadProductos} disabled={loading}>
                <ArrowDownToLine size={16} className={loading ? 'spin' : ''} /> Actualizar
              </button>
            </div>

            <div className="table-toolbar">
              <label className="search-field">
                <Search size={17} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar producto..." />
                {query && <button onClick={() => setQuery('')} aria-label="Limpiar búsqueda"><X size={15} /></button>}
              </label>
              <div className="filter-control">
                <SlidersHorizontal size={16} />
                <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filtrar productos">
                  <option>Todos</option>
                  <option>Disponibles</option>
                  <option>Bajo stock</option>
                </select>
                <ChevronDown size={14} className="select-chevron" />
              </div>
            </div>

            <div className="table-scroll">
              <table className={`product-table ${loading || visibleProductos.length === 0 ? 'compact-table' : ''}`}>
                <thead><tr>
                  <th>PRODUCTO</th><th>ID</th><th>PRECIO</th><th>STOCK</th><th>ESTADO</th><th><span className="sr-only">Acciones</span></th>
                </tr></thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="table-state"><LoaderCircle className="spin" size={22} />Cargando productos...</td></tr>
                  ) : visibleProductos.length === 0 ? (
                    <tr><td colSpan="6" className="table-state empty-state">
                      <div className="empty-icon"><Package size={23} /></div>
                      <strong>{productos.length ? 'No encontramos productos' : 'Tu inventario está vacío'}</strong>
                      <span>{productos.length ? 'Prueba con otro término o filtro.' : 'Añade un producto para empezar a organizar tu catálogo.'}</span>
                      {!productos.length && <button className="button-primary compact" onClick={openCreate}><Plus size={16} />Añadir producto</button>}
                    </td></tr>
                  ) : visibleProductos.map((producto, index) => (
                    <tr key={producto.id}>
                      <td><div className="product-cell"><span className={`product-icon product-color-${index % 4}`}><Package size={18} /></span><span><strong>{producto.nombre}</strong><small>{producto.descripcion || 'Sin descripción'}</small></span></div></td>
                      <td><span className="id-value">#{String(producto.id).padStart(4, '0')}</span></td>
                      <td className="price-value">{money.format(producto.precio)}</td>
                      <td><span className="stock-number">{producto.stock}<small> uds.</small></span></td>
                      <td><span className={`status-pill ${producto.stock <= 5 ? 'low' : 'available'}`}><i />{producto.stock <= 5 ? 'Stock bajo' : 'Disponible'}</span></td>
                      <td><div className="row-actions">
                        <button onClick={() => openEdit(producto)} title="Editar producto" aria-label={`Editar ${producto.nombre}`}><Pencil size={16} /></button>
                        <button className="delete-action" onClick={() => deleteProducto(producto)} title="Eliminar producto" aria-label={`Eliminar ${producto.nombre}`}><Trash2 size={16} /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="table-footer">
              <span>Mostrando <strong>{loading ? 0 : visibleProductos.length}</strong> de <strong>{productos.length}</strong> productos</span>
              <span className="data-source"><Check size={14} />Datos sincronizados con la API</span>
            </footer>
          </section>
          <footer className="app-footer"><span>EPA · Gestión de productos</span><span>API REST <b>v1.0</b></span></footer>
        </div>
      </main>

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setModalOpen(false)}>
          <section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <header className="modal-header">
              <div><span className="modal-kicker">CATÁLOGO DE PRODUCTOS</span><h2 id="modal-title">{editing ? 'Editar producto' : 'Añadir producto'}</h2></div>
              <button className="icon-button" onClick={() => setModalOpen(false)} aria-label="Cerrar"><X size={19} /></button>
            </header>
            <form onSubmit={saveProducto}>
              <label className="form-field">Nombre del producto
                <input autoFocus required minLength={2} maxLength={100} value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} placeholder="Ej. Teclado mecánico" />
              </label>
              <label className="form-field">Descripción <span className="optional">Opcional</span>
                <textarea maxLength={300} rows={3} value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} placeholder="Detalles del producto" />
              </label>
              <div className="form-row">
                <label className="form-field">Precio (€)
                  <input required type="number" min="0" step="0.01" value={form.precio} onChange={(event) => setForm({ ...form, precio: event.target.value })} placeholder="0,00" />
                </label>
                <label className="form-field">Unidades en stock
                  <input required type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} placeholder="0" />
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="button-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="button-primary" disabled={saving}>
                  {saving ? <LoaderCircle size={16} className="spin" /> : <Plus size={17} />}
                  {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear producto'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;