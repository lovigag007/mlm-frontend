export const fmt = {
  currency: (n, symbol = '₹') => `${symbol}${parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  date: (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
  datetime: (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—',
  num: (n) => parseFloat(n || 0).toLocaleString('en-IN'),
};

export const getErrMsg = (err) =>
  err?.response?.data?.message || err?.response?.data?.errors?.[0]?.message || err?.message || 'Something went wrong';

export const statusBadge = (status) => {
  const map = {
    active: 'badge-active', approved: 'badge-active', completed: 'badge-active', paid: 'badge-active',
    pending: 'badge-pending', under_review: 'badge-pending', pending_approval: 'badge-pending',
    inactive: 'badge-inactive', cancelled: 'badge-inactive',
    blocked: 'badge-blocked', suspended: 'badge-blocked', rejected: 'badge-blocked',
  };
  return map[status] || 'badge-inactive';
};
