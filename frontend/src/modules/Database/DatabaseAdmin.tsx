import { useEffect, useMemo, useState } from 'react';
import { api, type ApiField, type ApiTable } from '../../services/api';

type Row = Record<string, unknown>;
type Props = { onDataChanged: () => void };

export function DatabaseAdmin({ onDataChanged }: Props) {
  const [tables, setTables] = useState<ApiTable[]>([]);
  const [selectedName, setSelectedName] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [references, setReferences] = useState<Record<string, Row[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const activeTable = tables.find((table) => table.nombre === selectedName) ?? null;

  useEffect(() => {
    api.getTables()
      .then((definitions) => {
        setTables(definitions);
        setSelectedName(definitions[0]?.nombre ?? '');
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeTable) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    api.getTable(activeTable.nombre)
      .then((data) => { if (!cancelled) setRows(data); })
      .catch((err: Error) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeTable?.nombre]);

  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es');
    return rows.filter((row) => Object.values(row)
      .some((value) => String(value ?? '').toLocaleLowerCase('es').includes(normalizedQuery)));
  }, [rows, query]);

  async function loadReferences(table: ApiTable) {
    const referenceTables = [...new Set(table.campos.flatMap((field) =>
      field.referencia ? [field.referencia.tabla] : [],
    ))];
    const entries = await Promise.all(referenceTables.map(async (name) => [name, await api.getTable(name)] as const));
    setReferences(Object.fromEntries(entries));
  }

  async function openCreate() {
    if (!activeTable) return;
    setEditing(null);
    setForm(Object.fromEntries(activeTable.campos
      .filter((field) => !field.clavePrimaria)
      .map((field) => [field.nombre, ''])));
    try {
      await loadReferences(activeTable);
      setError('');
      setModalOpen(true);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function openEdit(row: Row) {
    if (!activeTable) return;
    setEditing(row);
    setForm(Object.fromEntries(activeTable.campos.map((field) => {
      const value = row[field.nombre];
      return [field.nombre, field.tipo === 'fecha' && value ? String(value).slice(0, 10) : String(value ?? '')];
    })));
    try {
      await loadReferences(activeTable);
      setError('');
      setModalOpen(true);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function createPayload(table: ApiTable) {
    return Object.fromEntries(table.campos
      .filter((field) => !field.clavePrimaria && form[field.nombre] !== '')
      .map((field) => {
        const value = form[field.nombre];
        return [field.nombre, field.tipo === 'entero' || field.tipo === 'decimal' ? Number(value) : value];
      }));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeTable) return;
    setSaving(true);
    setError('');
    try {
      const payload = createPayload(activeTable);
      const id = Number(editing?.[activeTable.clavePrimaria]);
      if (editing) await api.updateRecord(activeTable.nombre, id, payload);
      else await api.createRecord(activeTable.nombre, payload);
      setModalOpen(false);
      setRows(await api.getTable(activeTable.nombre));
      onDataChanged();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: Row) {
    if (!activeTable) return;
    const id = Number(row[activeTable.clavePrimaria]);
    if (!window.confirm(`¿Eliminar el registro ${id} de ${activeTable.etiqueta}?`)) return;
    setError('');
    try {
      await api.deleteRecord(activeTable.nombre, id);
      setRows((current) => current.filter((item) => Number(item[activeTable.clavePrimaria]) !== id));
      onDataChanged();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function referenceOptions(field: ApiField) {
    const parent = tables.find((table) => table.nombre === field.referencia?.tabla);
    const referencedField = field.referencia;
    if (!parent || !referencedField) return [];
    return (references[parent.nombre] ?? []).map((row) => ({
      id: String(row[parent.clavePrimaria]),
      label: `${String(row[referencedField.campo] ?? row[parent.clavePrimaria])} · ${String(row[parent.clavePrimaria])}`,
    }));
  }

  function displayValue(field: ApiField, row: Row) {
    const value = row[field.nombre];
    if (value === undefined || value === null || value === '') return '—';
    if (field.referencia) {
      const parent = tables.find((table) => table.nombre === field.referencia?.tabla);
      const related = (references[field.referencia.tabla] ?? []).find((item) =>
        String(item[parent?.clavePrimaria ?? '']) === String(value),
      );
      if (related && parent) return String(related[field.referencia.campo] ?? value);
    }
    return field.tipo === 'fecha' ? String(value).slice(0, 10) : String(value);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-amber-600">Mantenimiento</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Base de datos</h1>
          <p className="mt-2 text-sm text-slate-500">CRUD directo sobre las tablas del esquema Oracle.</p>
        </div>
        <button onClick={openCreate} disabled={!activeTable || loading} className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-400 disabled:opacity-50">Nuevo registro</button>
      </section>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
        <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_auto]">
          <label className="grid gap-1 text-xs font-bold text-slate-500">Tabla Oracle
            <select value={selectedName} onChange={(event) => { setSelectedName(event.target.value); setQuery(''); }} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-amber-500">
              {tables.map((table) => <option key={table.nombre} value={table.nombre}>{table.etiqueta} · {table.tablaOracle}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-bold text-slate-500">Buscar registros
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar..." className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-800 outline-none focus:border-amber-500" />
          </label>
          <div className="flex items-end pb-3 text-xs text-slate-500">{loading ? 'Cargando...' : `${visibleRows.length} / ${rows.length} registros`}</div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-black text-slate-900">{activeTable?.etiqueta ?? 'Registros'}</h2>
          <p className="mt-1 text-xs text-slate-500">Clave primaria: {activeTable?.clavePrimaria ?? '—'} · Se genera automáticamente como MAX(ID) + 1.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400"><tr>{activeTable?.campos.map((field) => <th key={field.nombre} className="px-4 py-3">{field.etiqueta}</th>)}<th className="px-4 py-3 text-right">Acciones</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={(activeTable?.campos.length ?? 0) + 1} className="px-5 py-12 text-center text-sm text-slate-400">Consultando Oracle...</td></tr>
                : visibleRows.length === 0 ? <tr><td colSpan={(activeTable?.campos.length ?? 0) + 1} className="px-5 py-12 text-center text-sm text-slate-400">{rows.length ? 'No hay resultados para esta búsqueda.' : 'La tabla no tiene registros.'}</td></tr>
                  : visibleRows.map((row) => <tr key={String(row[activeTable?.clavePrimaria ?? ''])} className="border-t border-slate-100 text-sm text-slate-600">{activeTable?.campos.map((field) => <td key={field.nombre} className={`max-w-64 truncate px-4 py-3 ${field.clavePrimaria ? 'font-bold text-slate-800' : ''}`} title={displayValue(field, row)}>{displayValue(field, row)}</td>)}<td className="whitespace-nowrap px-4 py-3 text-right"><button onClick={() => void openEdit(row)} className="rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100">Editar</button><button onClick={() => void remove(row)} className="rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">Eliminar</button></td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && activeTable && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={(event) => event.target === event.currentTarget && setModalOpen(false)}><section role="dialog" aria-modal="true" aria-labelledby="database-modal-title" className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"><header className="border-b border-slate-100 px-6 py-5"><p className="text-xs font-bold uppercase tracking-widest text-amber-600">{activeTable.tablaOracle}</p><h2 id="database-modal-title" className="mt-1 text-xl font-black text-slate-900">{editing ? 'Editar registro' : 'Nuevo registro'}</h2></header><form onSubmit={save} className="flex max-h-[78vh] flex-col"><div className="grid gap-4 overflow-y-auto p-6 sm:grid-cols-2">{activeTable.campos.filter((field) => !field.clavePrimaria).map((field) => <label key={field.nombre} className="grid min-w-0 gap-1.5 text-xs font-bold text-slate-600">{field.etiqueta}{field.referencia ? <select value={form[field.nombre] ?? ''} onChange={(event) => setForm({ ...form, [field.nombre]: event.target.value })} className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-amber-500"><option value="">Seleccionar...</option>{referenceOptions(field).map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select> : <input type={field.tipo === 'fecha' ? 'date' : field.tipo === 'texto' ? 'text' : 'number'} step={field.tipo === 'decimal' ? 'any' : field.tipo === 'entero' ? '1' : undefined} maxLength={field.longitud} value={form[field.nombre] ?? ''} onChange={(event) => setForm({ ...form, [field.nombre]: event.target.value })} className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-amber-500" placeholder={field.tipo === 'texto' ? 'Opcional' : '0'} />}</label>)}</div><footer className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4"><button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Cancelar</button><button type="submit" disabled={saving} className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-black text-slate-950 disabled:opacity-50">{saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear registro'}</button></footer></form></section></div>}
    </div>
  );
}