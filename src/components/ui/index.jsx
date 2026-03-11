import { Loader2, AlertCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';

export const Spinner = ({ size = 20 }) => <Loader2 size={size} className="animate-spin text-brand-600" />;

export const PageLoader = () => (
  <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>
);

export const ErrorState = ({ message = 'Something went wrong' }) => (
  <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
    <AlertCircle size={32} className="text-red-400" />
    <p className="text-sm">{message}</p>
  </div>
);

export const Badge = ({ status, children }) => {
  const map = {
    active:'badge-active', approved:'badge-active', completed:'badge-active', paid:'badge-active',
    pending:'badge-pending', under_review:'badge-pending', pending_approval:'badge-pending',
    inactive:'badge-inactive', cancelled:'badge-inactive',
    blocked:'badge-blocked', suspended:'badge-blocked', rejected:'badge-blocked',
  };
  return <span className={map[status] || 'badge-inactive'}>{children || status}</span>;
};

export const StatCard = ({ icon: Icon, label, value, sub, color = 'brand' }) => {
  const colors = {
    brand: 'bg-brand-50 text-brand-600', emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600', red: 'bg-red-50 text-red-600',
    violet: 'bg-violet-50 text-violet-600', sky: 'bg-sky-50 text-sky-600',
  };
  return (
    <div className="stat-card">
      <div className={`flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center ${colors[color] || colors.brand}`}>
        {Icon && <Icon size={20} />}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500 truncate">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

export const Table = ({ columns, data = [], loading, emptyMsg = 'No data found', onRowClick }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-surface-secondary border-b border-surface-border">
        <tr>
          {columns.map((col) => (
            <th key={col.key || col.label} className="table-th">{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr><td colSpan={columns.length} className="text-center py-12"><Spinner /></td></tr>
        ) : data.length === 0 ? (
          <tr><td colSpan={columns.length} className="text-center py-12 text-sm text-slate-400">{emptyMsg}</td></tr>
        ) : data.map((row, i) => (
          <tr key={row.id || i} className={`table-row ${onRowClick ? 'cursor-pointer' : ''}`} onClick={() => onRowClick?.(row)}>
            {columns.map((col) => (
              <td key={col.key || col.label} className="table-td">
                {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Pagination = ({ current, total, pages, onChange }) => (
  <div className="flex items-center justify-between px-4 py-3 border-t border-surface-border text-sm text-slate-600">
    <span>Showing {Math.min((current-1)*20+1, total)}–{Math.min(current*20, total)} of {total}</span>
    <div className="flex gap-1">
      <button onClick={() => onChange(current-1)} disabled={current<=1} className="btn-secondary !px-2 !py-1 disabled:opacity-40">
        <ChevronLeft size={14} />
      </button>
      <span className="px-3 py-1 rounded bg-brand-50 text-brand-700 font-medium">{current}</span>
      <button onClick={() => onChange(current+1)} disabled={current>=pages} className="btn-secondary !px-2 !py-1 disabled:opacity-40">
        <ChevronRight size={14} />
      </button>
    </div>
  </div>
);

export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  const sizes = { sm:'max-w-sm', md:'max-w-lg', lg:'max-w-2xl', xl:'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export const FormField = ({ label, error, children, required }) => (
  <div>
    {label && <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export const Select = ({ value, onChange, options, className = '', placeholder }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className={`input ${className}`}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    {Icon && <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4"><Icon size={24} className="text-slate-400" /></div>}
    <h3 className="text-sm font-medium text-slate-900">{title}</h3>
    {description && <p className="text-sm text-slate-400 mt-1 max-w-xs">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
