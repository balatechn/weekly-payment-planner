import { useEffect, useState } from 'react';
import {
  Building2, Plus, Pencil, Trash2, X, Save,
  ToggleLeft, ToggleRight, Search, AlertTriangle
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ── Modal: Add / Edit ──────────────────────────────────────────────────────
function EntityModal({ entity, onClose, onSaved }) {
  const isEdit = !!entity;
  const [form, setForm] = useState({
    name:        entity?.name        || '',
    code:        entity?.code        || '',
    description: entity?.description || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/entities/${entity.id}`, form);
        toast.success('Entity updated');
      } else {
        await api.post('/entities', form);
        toast.success('Entity created');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save entity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 animate-scale-in">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {isEdit ? 'Edit Entity' : 'Add New Entity'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEdit ? `Editing: ${entity.name}` : 'Create a new business entity'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
              Entity Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Junobo Hotels Pvt Ltd"
              className="input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
              Short Code <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="e.g. JH"
              maxLength={10}
              className="input"
            />
            <p className="text-[11px] text-slate-400 mt-1">Unique short identifier, max 10 characters</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of this entity…"
              rows={3}
              className="input resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              <Save className="w-4 h-4" />
              {loading ? 'Saving…' : isEdit ? 'Update Entity' : 'Create Entity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal: Delete Confirm ──────────────────────────────────────────────────
function DeleteModal({ entity, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/entities/${entity.id}`);
      toast.success(`"${entity.name}" deleted`);
      onDeleted();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete entity');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 animate-scale-in p-6">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Delete Entity?</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              <span className="font-semibold text-slate-700 dark:text-slate-200">"{entity.name}"</span> will be
              permanently removed. Payments linked to this entity may be affected.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
          <button onClick={handleDelete} disabled={loading} className="btn btn-danger flex-1">
            {loading ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function EntityManagement() {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalEntity, setModalEntity] = useState(undefined); // undefined=closed, null=add, obj=edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toggling, setToggling] = useState(null);

  useEffect(() => { fetchEntities(); }, []);

  const fetchEntities = async () => {
    try {
      const res = await api.get('/entities');
      setEntities(res.data);
    } catch {
      toast.error('Failed to load entities');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (entity) => {
    setToggling(entity.id);
    try {
      const res = await api.patch(`/entities/${entity.id}/toggle-status`);
      setEntities(prev => prev.map(e => e.id === entity.id ? res.data : e));
      toast.success(`${entity.name} ${res.data.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to toggle status');
    } finally {
      setToggling(null);
    }
  };

  const filtered = entities.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.code.toLowerCase().includes(search.toLowerCase()) ||
    (e.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const active   = entities.filter(e => e.isActive).length;
  const inactive = entities.length - active;

  return (
    <>
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Entity Management</h1>
            <p className="page-subtitle">Manage business entities used in payment requests</p>
          </div>
          <button onClick={() => setModalEntity(null)} className="btn btn-primary shadow-lg shadow-blue-500/25">
            <Plus className="w-4 h-4" /> Add Entity
          </button>
        </div>

        {/* Summary chips */}
        <div className="flex gap-3 flex-wrap">
          {[
            { label: 'Total',    value: entities.length, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40' },
            { label: 'Active',   value: active,          color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40' },
            { label: 'Inactive', value: inactive,        color: 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${color}`}>
              <span className="font-bold text-lg leading-none">{value}</span>
              <span className="opacity-70">{label}</span>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="card !p-0 overflow-hidden">

          {/* Search bar */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by name, code or description…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-6 space-y-3">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="skeleton w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-48 rounded" />
                    <div className="skeleton h-2.5 w-32 rounded" />
                  </div>
                  <div className="skeleton h-6 w-16 rounded-full" />
                  <div className="skeleton h-8 w-20 rounded-lg" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                {search ? 'No entities match your search' : 'No entities yet'}
              </p>
              {!search && (
                <button onClick={() => setModalEntity(null)} className="btn btn-primary mt-4 text-xs">
                  Add First Entity
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400">Entity</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400">Code</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400">Description</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-widest text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {filtered.map((entity, i) => (
                    <tr
                      key={entity.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-700/40 transition-colors group animate-fade-in"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      {/* Entity name + avatar */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center shrink-0">
                            <span className="text-[12px] font-bold text-blue-700 dark:text-blue-300">
                              {entity.code?.slice(0, 2)}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {entity.name}
                          </span>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 tracking-widest">
                          {entity.code}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {entity.description || <span className="italic text-slate-300 dark:text-slate-600">No description</span>}
                      </td>

                      {/* Status toggle */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggle(entity)}
                          disabled={toggling === entity.id}
                          className="flex items-center gap-2 group/toggle"
                          title={entity.isActive ? 'Click to deactivate' : 'Click to activate'}
                        >
                          {entity.isActive
                            ? <ToggleRight className="w-6 h-6 text-emerald-500 group-hover/toggle:text-emerald-600 transition-colors" />
                            : <ToggleLeft  className="w-6 h-6 text-slate-300 dark:text-slate-600 group-hover/toggle:text-slate-400 transition-colors" />
                          }
                          <span className={`text-xs font-semibold ${entity.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                            {toggling === entity.id ? '…' : entity.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setModalEntity(entity)}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                            title="Edit entity"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(entity)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                            title="Delete entity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Row count */}
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400">
                Showing {filtered.length} of {entities.length} entities
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit modal */}
      {modalEntity !== undefined && (
        <EntityModal
          entity={modalEntity}
          onClose={() => setModalEntity(undefined)}
          onSaved={() => { setModalEntity(undefined); fetchEntities(); }}
        />
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <DeleteModal
          entity={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => { setDeleteTarget(null); fetchEntities(); }}
        />
      )}
    </>
  );
}
