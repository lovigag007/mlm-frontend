import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantApi, tenantExtApi } from '../../services/api';
import { StatCard, Table, Badge, Modal, PageLoader, Pagination, FormField, Select, EmptyState } from '../ui';
import { fmt, getErrMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import {
  Users, Package, DollarSign, ShoppingCart, Wallet, CheckCircle, XCircle,
  Plus, Edit2, Trash2, Eye, Settings, Layers, BarChart3, Megaphone,
  FileCheck, Ticket, TrendingUp, ArrowUpRight, Bell
} from 'lucide-react';

// ── Dashboard ─────────────────────────────────────────────────
export const TenantDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['t-dashboard'],
    queryFn: () => tenantApi.getDashboard().then(r => r.data.data),
  });
  if (isLoading) return <PageLoader />;
  const s = data?.stats;

  const chartData = (data?.monthlyIncome || []).map(m => ({
    name: `${m.month}/${m.year}`,
    income: parseFloat(m.total || 0),
  }));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Business Dashboard</h1>
        <p className="page-subtitle">Your MLM business overview</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={Users}       label="Total Members"     value={fmt.num(s?.totalMembers)}      color="brand" />
        <StatCard icon={CheckCircle} label="Active Members"    value={fmt.num(s?.activeMembers)}     color="emerald" />
        <StatCard icon={Package}     label="Products"          value={fmt.num(s?.totalProducts)}     color="violet" />
        <StatCard icon={ShoppingCart}label="Total Orders"      value={fmt.num(s?.totalOrders)}       color="sky" />
        <StatCard icon={Wallet}      label="Pending Withdrawals" value={fmt.num(s?.pendingWithdrawals)} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card lg:col-span-2">
          <div className="card-header"><h2 className="font-semibold text-sm">Monthly Income Flow</h2></div>
          <div className="p-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => fmt.currency(v)} />
                  <Bar dataKey="income" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center text-sm text-slate-400">No income data yet</div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2 className="font-semibold text-sm">Income by Type</h2></div>
          <div className="p-4 space-y-3">
            {(data?.incomeByType || []).slice(0, 6).map(t => (
              <div key={t.type} className="flex justify-between items-center">
                <span className="text-xs text-slate-500 capitalize">{t.type?.replace(/_/g, ' ')}</span>
                <span className="text-xs font-semibold">{fmt.currency(t.total)}</span>
              </div>
            ))}
            {!data?.incomeByType?.length && <p className="text-xs text-slate-400 text-center py-4">No data yet</p>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold text-sm">Recent Members</h2>
        </div>
        <Table columns={[
          { label: 'Member', key: 'fullName', render: (v, r) => <div><p className="font-medium text-sm">{v}</p><p className="text-xs text-slate-400">#{r.memberId}</p></div> },
          { label: 'Email', key: 'email' },
          { label: 'Rank', key: 'rank' },
          { label: 'Direct', key: 'directCount', render: v => fmt.num(v) },
          { label: 'Joined', key: 'createdAt', render: v => fmt.datetime(v) },
          { label: 'Status', key: 'status', render: v => <Badge status={v}>{v}</Badge> },
        ]} data={data?.recentMembers || []} emptyMsg="No members yet" />
      </div>
    </div>
  );
};

// ── Members ───────────────────────────────────────────────────
export const TenantMembers = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMember, setViewMember] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['t-members', page, search, statusFilter],
    queryFn: () => tenantApi.getMembers({ page, search: search || undefined, status: statusFilter || undefined, limit: 20 }).then(r => r.data),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => tenantApi.updateMemberStatus(id, { status }),
    onSuccess: () => { qc.invalidateQueries(['t-members']); toast.success('Status updated'); },
    onError: (e) => toast.error(getErrMsg(e)),
  });

  const columns = [
    { label: 'Member', key: 'fullName', render: (v, r) => <div><p className="font-medium text-sm">{v}</p><p className="text-xs text-slate-400">#{r.memberId}</p></div> },
    { label: 'Email', key: 'email' },
    { label: 'Sponsor', key: 'sponsor', render: (v) => v ? <span className="text-xs text-slate-500">{v.fullName}</span> : '—' },
    { label: 'Wallet', key: 'wallet', render: (v) => v ? <div className="text-xs"><span className="text-emerald-600 font-medium">{fmt.currency(v.incomeBalance)}</span></div> : '—' },
    { label: 'Rank', key: 'rank' },
    { label: 'KYC', key: 'kycStatus', render: v => <Badge status={v === 'approved' ? 'active' : v === 'rejected' ? 'blocked' : 'pending'}>{v}</Badge> },
    { label: 'Joined', key: 'createdAt', render: v => fmt.date(v) },
    { label: 'Status', key: 'status', render: v => <Badge status={v}>{v}</Badge> },
    {
      label: 'Actions', key: 'id', render: (_, r) => (
        <div className="flex gap-1">
          <button onClick={() => setViewMember(r)} className="btn-secondary !py-1 !px-2 text-xs"><Eye size={11} /></button>
          {r.status === 'active'
            ? <button onClick={() => statusMut.mutate({ id: r.id, status: 'blocked' })} className="btn-danger !py-1 !px-2 text-xs">Block</button>
            : <button onClick={() => statusMut.mutate({ id: r.id, status: 'active' })} className="btn-primary !py-1 !px-2 text-xs">Activate</button>
          }
        </div>
      )
    },
  ];

  return (
    <div>
      <div className="page-header flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="page-title">Members</h1><p className="page-subtitle">Manage your network members</p></div>
        <div className="flex gap-2">
          <input className="input !w-52" placeholder="Search name/email/ID…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <Select value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} className="!w-36"
            options={[{ value: '', label: 'All Status' }, { value: 'active', label: 'Active' }, { value: 'blocked', label: 'Blocked' }, { value: 'pending', label: 'Pending' }]} />
        </div>
      </div>
      <div className="card">
        <Table columns={columns} data={data?.data || []} loading={isLoading} emptyMsg="No members found" />
        {data?.pagination && <Pagination current={page} total={data.pagination.total} pages={data.pagination.pages} onChange={setPage} />}
      </div>

      <Modal open={!!viewMember} onClose={() => setViewMember(null)} title="Member Details" size="lg">
        {viewMember && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center text-xl font-bold text-brand-700">{viewMember.fullName?.[0]}</div>
              <div>
                <h3 className="font-bold text-lg">{viewMember.fullName}</h3>
                <p className="text-sm text-slate-400">#{viewMember.memberId} · {viewMember.email}</p>
                <Badge status={viewMember.status}>{viewMember.status}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Rank', viewMember.rank], ['KYC Status', viewMember.kycStatus],
                ['Direct Count', viewMember.directCount], ['Team Size', viewMember.teamSize],
                ['Total Earned', fmt.currency(viewMember.totalEarned)], ['Total Purchase', fmt.currency(viewMember.totalPurchase)],
                ['Joined', fmt.datetime(viewMember.joiningDate)], ['Phone', viewMember.phone || '—'],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">{k}</p>
                  <p className="font-medium mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ── Products ──────────────────────────────────────────────────
export const TenantProducts = () => {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', bv: '', stock: '', category: '', imageUrl: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['t-products'],
    queryFn: () => tenantApi.getProducts({ limit: 100 }).then(r => r.data.data),
  });

  const saveMut = useMutation({
    mutationFn: (d) => form.id ? tenantApi.updateProduct(form.id, d) : tenantApi.createProduct(d),
    onSuccess: () => { qc.invalidateQueries(['t-products']); setModal(false); toast.success('Product saved'); },
    onError: (e) => toast.error(getErrMsg(e)),
  });
  const delMut = useMutation({
    mutationFn: (id) => tenantApi.deleteProduct(id),
    onSuccess: () => { qc.invalidateQueries(['t-products']); toast.success('Deleted'); },
    onError: (e) => toast.error(getErrMsg(e)),
  });

  const openCreate = () => { setForm({ name: '', description: '', price: '', bv: '', stock: 99, category: 'general', imageUrl: '' }); setModal(true); };
  const openEdit = (p) => { setForm(p); setModal(true); };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div><h1 className="page-title">Products</h1></div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Product</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading ? <div className="col-span-full"><PageLoader /></div> :
          (data || []).map(p => (
            <div key={p.id} className="card overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-3xl">
                {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" alt={p.name} /> : '📦'}
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm truncate">{p.name}</p>
                <div className="flex gap-2 mt-1 text-xs text-slate-400">
                  <span>BV: {p.bv}</span>
                  <span>Stock: {p.stock}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-brand-700">{fmt.currency(p.price)}</span>
                  <Badge status={p.status === 'active' ? 'active' : 'inactive'}>{p.status}</Badge>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(p)} className="btn-secondary !py-1 !px-2 text-xs flex-1"><Edit2 size={11} /> Edit</button>
                  <button onClick={() => { if (confirm('Delete?')) delMut.mutate(p.id); }} className="btn-danger !py-1 !px-2 text-xs"><Trash2 size={11} /></button>
                </div>
              </div>
            </div>
          ))}
        {!isLoading && !data?.length && <div className="col-span-full"><EmptyState icon={Package} title="No products" description="Add your first product for members to purchase" /></div>}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={form.id ? 'Edit Product' : 'Add Product'}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Product Name" required>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </FormField>
            <FormField label="Category">
              <input className="input" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="general" />
            </FormField>
          </div>
          <FormField label="Description">
            <textarea className="input" rows={2} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Price (₹)" required>
              <input type="number" className="input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            </FormField>
            <FormField label="BV (Business Value)" required>
              <input type="number" className="input" value={form.bv} onChange={e => setForm({ ...form, bv: e.target.value })} />
            </FormField>
            <FormField label="Stock">
              <input type="number" className="input" value={form.stock || 99} onChange={e => setForm({ ...form, stock: e.target.value })} />
            </FormField>
          </div>
          <FormField label="Image URL">
            <input className="input" value={form.imageUrl || ''} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…" />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending || !form.name || !form.price} className="btn-primary">
              {saveMut.isPending ? 'Saving…' : 'Save Product'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ── Withdrawals ───────────────────────────────────────────────
export const TenantWithdrawals = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['t-withdrawals', page, statusFilter],
    queryFn: () => tenantApi.getWithdrawals({ page, status: statusFilter || undefined, limit: 20 }).then(r => r.data),
  });

  const processMut = useMutation({
    mutationFn: ({ id, status }) => tenantApi.processWithdrawal(id, { status, adminNote: note }),
    onSuccess: () => { qc.invalidateQueries(['t-withdrawals']); setSelected(null); setNote(''); toast.success('Withdrawal processed'); },
    onError: (e) => toast.error(getErrMsg(e)),
  });

  return (
    <div>
      <div className="page-header flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="page-title">Withdrawals</h1><p className="page-subtitle">Review and process member withdrawal requests</p></div>
        <Select value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} className="!w-40"
          options={[{ value: '', label: 'All' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }]} />
      </div>
      <div className="card">
        <Table columns={[
          { label: 'Request #', key: 'requestNumber', render: v => <span className="font-mono text-xs">{v}</span> },
          { label: 'Member', key: 'member', render: v => v ? <div><p className="text-sm font-medium">{v.fullName}</p><p className="text-xs text-slate-400">{v.email}</p></div> : '—' },
          { label: 'Requested', key: 'requestedAmount', render: v => fmt.currency(v) },
          { label: 'TDS', key: 'tdsAmount', render: v => fmt.currency(v) },
          { label: 'Net Payable', key: 'netPayableAmount', render: v => <span className="font-bold text-emerald-700">{fmt.currency(v)}</span> },
          { label: 'Bank', key: 'bankAccount', render: v => v ? <span className="text-xs">{v.bankName} ••{v.accountNumber?.slice(-4)}</span> : '—' },
          { label: 'Requested On', key: 'createdAt', render: v => fmt.datetime(v) },
          { label: 'Status', key: 'status', render: v => <Badge status={v}>{v}</Badge> },
          {
            label: 'Action', key: 'id', render: (_, r) => r.status === 'pending' ? (
              <button onClick={() => setSelected(r)} className="btn-primary !py-1 !px-2 text-xs">Review</button>
            ) : null
          },
        ]} data={data?.data || []} loading={isLoading} emptyMsg="No withdrawals found" />
        {data?.pagination && <Pagination current={page} total={data.pagination.total} pages={data.pagination.pages} onChange={setPage} />}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Process Withdrawal">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['Member', selected.member?.fullName], ['Amount', fmt.currency(selected.requestedAmount)], ['TDS', fmt.currency(selected.tdsAmount)], ['Net Payable', fmt.currency(selected.netPayableAmount)]].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-400">{k}</p><p className="font-semibold">{v}</p></div>
              ))}
            </div>
            <FormField label="Admin Note (optional)">
              <textarea className="input" rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Payment reference, reason for rejection…" />
            </FormField>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setSelected(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => processMut.mutate({ id: selected.id, status: 'rejected' })} disabled={processMut.isPending} className="btn-danger">
                Reject
              </button>
              <button onClick={() => processMut.mutate({ id: selected.id, status: 'approved' })} disabled={processMut.isPending} className="btn-primary">
                <CheckCircle size={14} /> Approve
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ── Income Reports ────────────────────────────────────────────
export const TenantIncomeReports = () => {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['t-income', page, typeFilter],
    queryFn: () => tenantApi.getIncomeReports({ page, limit: 25, type: typeFilter || undefined }).then(r => r.data),
  });
  return (
    <div>
      <div className="page-header flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="page-title">Income Reports</h1></div>
        <Select value={typeFilter} onChange={v => { setTypeFilter(v); setPage(1); }} className="!w-48"
          options={[
            { value: '', label: 'All Types' },
            { value: 'direct_bonus', label: 'Direct Bonus' },
            { value: 'level_commission', label: 'Level Commission' },
            { value: 'roi_income', label: 'ROI Income' },
            { value: 'matching_bonus', label: 'Matching Bonus' },
          ]}
        />
      </div>
      <div className="card">
        <Table columns={[
          { label: 'Type', key: 'type', render: v => <span className="capitalize text-xs font-medium bg-slate-100 px-2 py-0.5 rounded-full">{v?.replace(/_/g, ' ')}</span> },
          { label: 'Amount', key: 'amount', render: v => <span className={`font-bold ${parseFloat(v) >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{fmt.currency(v)}</span> },
          { label: 'Member', key: 'member', render: v => v ? `${v.fullName} (#${v.memberId})` : '—' },
          { label: 'Description', key: 'description', render: v => <span className="text-xs text-slate-500">{v}</span> },
          { label: 'Date', key: 'createdAt', render: v => fmt.datetime(v) },
        ]} data={data?.data || []} loading={isLoading} emptyMsg="No income records found" />
        {data?.pagination && <Pagination current={page} total={data.pagination.total} pages={data.pagination.pages} onChange={setPage} />}
      </div>
    </div>
  );
};

// ── Income Plan — ✅ FIXED: uses tenantApi.getPlanTemplates() ──
export const TenantIncomePlan = () => {
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);

  const { data: profile } = useQuery({ queryKey: ['t-profile'], queryFn: () => tenantApi.getProfile().then(r => r.data.data) });

  // ✅ FIX: tenant fetches templates via its own token-authenticated endpoint
  // (route: GET /api/v1/tenant/income/plan-templates — requires tenant JWT, not superadmin)
  const { data: templates, isLoading } = useQuery({
    queryKey: ['t-plan-templates'],
    queryFn: () => tenantApi.getPlanTemplates().then(r => r.data.data),
  });

  const selectMut = useMutation({
    mutationFn: (d) => tenantApi.selectIncomePlan(d),
    onSuccess: () => {
      qc.invalidateQueries(['t-profile']); qc.invalidateQueries(['t-plan-templates']);
      setSelected(null); toast.success('Income plan activated!');
    },
    onError: (e) => toast.error(getErrMsg(e)),
  });

  const distributeMut = useMutation({
    mutationFn: () => tenantApi.distributeIncome(),
    onSuccess: (r) => toast.success(`Income distributed! ${r.data?.data?.transactions || 0} transactions created.`),
    onError: (e) => toast.error(getErrMsg(e)),
  });

  const activePlanId = profile?.activePlanId;

  return (
    <div>
      <div className="page-header flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Income Plan</h1>
          <p className="page-subtitle">Select a commission structure for your network</p>
        </div>
        {activePlanId && (
          <button onClick={() => { if (confirm('Run manual income distribution?')) distributeMut.mutate(); }}
            disabled={distributeMut.isPending} className="btn-secondary">
            <TrendingUp size={16} /> {distributeMut.isPending ? 'Distributing…' : 'Distribute ROI Now'}
          </button>
        )}
      </div>

      {activePlanId && (
        <div className="card p-4 mb-6 bg-emerald-50 border-emerald-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-emerald-600" size={20} />
            <div>
              <p className="font-semibold text-emerald-800">Active Plan: {profile?.activePlan?.name}</p>
              <p className="text-xs text-emerald-600 capitalize">{profile?.activePlan?.networkType} · Max depth: {profile?.activePlan?.maxDepth}</p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? <PageLoader /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(templates || []).map(t => (
            <div key={t.id} className={`card p-5 cursor-pointer transition-all hover:shadow-md ${activePlanId === t.id ? 'ring-2 ring-emerald-500' : ''}`}
              onClick={() => setSelected(t)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm">{t.name}</h3>
                  <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full capitalize mt-1 inline-block">{t.networkType}</span>
                </div>
                {activePlanId && t.id && profile?.activePlan?.name === t.name && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Active</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-3 line-clamp-2">{t.description}</p>
              <div className="space-y-1.5 text-xs">
                {t.directBonusEnabled && <div className="flex justify-between"><span className="text-slate-400">Direct Bonus</span><span className="font-medium">{t.directBonusValue}%</span></div>}
                {t.roiEnabled && <div className="flex justify-between"><span className="text-slate-400">ROI</span><span className="font-medium">{t.roiPercentage}% / {t.roiFrequency}</span></div>}
                <div className="flex justify-between"><span className="text-slate-400">Max Depth</span><span className="font-medium">{t.maxDepth} levels</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Level Count</span><span className="font-medium">{t.levels?.length || 0} levels defined</span></div>
              </div>
              {t.levels?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-surface-border">
                  <p className="text-xs text-slate-400 mb-2">Commission Levels:</p>
                  <div className="flex flex-wrap gap-1">
                    {t.levels.map(l => (
                      <span key={l.level} className="text-xs bg-slate-100 px-2 py-0.5 rounded">L{l.level}: {l.percentage}%</span>
                    ))}
                  </div>
                </div>
              )}
              <button className="btn-primary w-full justify-center mt-4 !py-2">
                Select This Plan
              </button>
            </div>
          ))}
          {!templates?.length && <div className="col-span-full"><EmptyState icon={Layers} title="No plan templates available" description="The platform admin hasn't created any income plan templates yet. Contact support." /></div>}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Confirm Plan Selection">
        {selected && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <strong>⚠️ Note:</strong> Changing your income plan will affect all future commission calculations. Existing transactions will not be changed.
            </div>
            <p className="text-sm">Are you sure you want to activate <strong>{selected.name}</strong>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setSelected(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => selectMut.mutate({ planId: selected.id })} disabled={selectMut.isPending} className="btn-primary">
                {selectMut.isPending ? 'Activating…' : 'Activate Plan'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ── KYC Management ────────────────────────────────────────────
export const TenantKYC = () => {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [reviewing, setReviewing] = useState(null);
  const [reviewNote, setReviewNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['t-kyc', page, statusFilter],
    queryFn: () => tenantExtApi.getKYCList({ status: statusFilter, page, limit: 20 }).then(r => r.data),
  });

  const reviewMut = useMutation({
    mutationFn: ({ id, status }) => tenantExtApi.reviewKYC(id, { status, reviewNote }),
    onSuccess: () => { qc.invalidateQueries(['t-kyc']); setReviewing(null); setReviewNote(''); toast.success('KYC reviewed'); },
    onError: (e) => toast.error(getErrMsg(e)),
  });

  return (
    <div>
      <div className="page-header flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="page-title">KYC Verification</h1></div>
        <Select value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} className="!w-36"
          options={[{ value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }]} />
      </div>
      <div className="card">
        <Table columns={[
          { label: 'Member', key: 'member', render: v => v ? <div><p className="font-medium text-sm">{v.fullName}</p><p className="text-xs text-slate-400">{v.email}</p></div> : '—' },
          { label: 'Doc Type', key: 'docType', render: v => <span className="capitalize">{v?.replace('_', ' ')}</span> },
          { label: 'Doc Number', key: 'docNumber' },
          { label: 'Submitted', key: 'createdAt', render: v => fmt.datetime(v) },
          { label: 'Status', key: 'status', render: v => <Badge status={v === 'approved' ? 'active' : v === 'rejected' ? 'blocked' : 'pending'}>{v}</Badge> },
          {
            label: 'Actions', key: 'id', render: (_, r) => r.status === 'pending' ? (
              <div className="flex gap-1">
                <a href={r.docUrl} target="_blank" rel="noreferrer" className="btn-secondary !py-1 !px-2 text-xs"><Eye size={11} /> View</a>
                <button onClick={() => setReviewing(r)} className="btn-primary !py-1 !px-2 text-xs">Review</button>
              </div>
            ) : null
          },
        ]} data={data?.data || []} loading={isLoading} emptyMsg="No KYC documents found" />
        {data?.pagination && <Pagination current={page} total={data.pagination.total} pages={data.pagination.pages} onChange={setPage} />}
      </div>
      <Modal open={!!reviewing} onClose={() => setReviewing(null)} title="Review KYC Document">
        {reviewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-slate-400">Member</p><p className="font-medium">{reviewing.member?.fullName}</p></div>
              <div><p className="text-xs text-slate-400">Document Type</p><p className="font-medium capitalize">{reviewing.docType?.replace('_', ' ')}</p></div>
              <div><p className="text-xs text-slate-400">Document Number</p><p className="font-medium">{reviewing.docNumber || '—'}</p></div>
            </div>
            {reviewing.docUrl && <a href={reviewing.docUrl} target="_blank" rel="noreferrer" className="btn-secondary w-full justify-center"><Eye size={14} /> View Document</a>}
            <FormField label="Review Note"><textarea className="input" rows={2} value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder="Reason for rejection or approval note…" /></FormField>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setReviewing(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => reviewMut.mutate({ id: reviewing.id, status: 'rejected' })} disabled={reviewMut.isPending} className="btn-danger">Reject</button>
              <button onClick={() => reviewMut.mutate({ id: reviewing.id, status: 'approved' })} disabled={reviewMut.isPending} className="btn-primary"><CheckCircle size={14} /> Approve</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ── Support Tickets ───────────────────────────────────────────
export const TenantSupport = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('open');
  const [replying, setReplying] = useState(null);
  const [replyText, setReplyText] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['t-support', page, statusFilter],
    queryFn: () => tenantExtApi.getSupportTickets({ status: statusFilter || undefined, page, limit: 20 }).then(r => r.data),
  });

  const replyMut = useMutation({
    mutationFn: ({ id, status }) => tenantExtApi.replyTicket(id, { adminReply: replyText, status }),
    onSuccess: () => { qc.invalidateQueries(['t-support']); setReplying(null); setReplyText(''); toast.success('Reply sent'); },
    onError: (e) => toast.error(getErrMsg(e)),
  });

  return (
    <div>
      <div className="page-header flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="page-title">Support Tickets</h1></div>
        <Select value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} className="!w-40"
          options={[{ value: '', label: 'All' }, { value: 'open', label: 'Open' }, { value: 'in_progress', label: 'In Progress' }, { value: 'resolved', label: 'Resolved' }]} />
      </div>
      <div className="card">
        <Table columns={[
          { label: 'Ticket #', key: 'ticketNumber' },
          { label: 'Member', key: 'member', render: v => v?.fullName || '—' },
          { label: 'Subject', key: 'subject' },
          { label: 'Category', key: 'category', render: v => <span className="capitalize">{v}</span> },
          { label: 'Priority', key: 'priority', render: v => <Badge status={v === 'high' || v === 'urgent' ? 'blocked' : 'pending'}>{v}</Badge> },
          { label: 'Status', key: 'status', render: v => <Badge status={v === 'resolved' ? 'active' : 'pending'}>{v?.replace('_', ' ')}</Badge> },
          { label: 'Date', key: 'createdAt', render: v => fmt.date(v) },
          { label: 'Action', key: 'id', render: (_, r) => <button onClick={() => { setReplying(r); setReplyText(r.adminReply || ''); }} className="btn-primary !py-1 !px-2 text-xs">Reply</button> },
        ]} data={data?.data || []} loading={isLoading} emptyMsg="No support tickets" />
        {data?.pagination && <Pagination current={page} total={data.pagination.total} pages={data.pagination.pages} onChange={setPage} />}
      </div>
      <Modal open={!!replying} onClose={() => setReplying(null)} title="Reply to Ticket" size="lg">
        {replying && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="font-semibold text-sm">{replying.subject}</p>
              <p className="text-xs text-slate-500 mt-1">{replying.message}</p>
              <p className="text-xs text-slate-400 mt-2">From: {replying.member?.fullName} · {fmt.datetime(replying.createdAt)}</p>
            </div>
            <FormField label="Your Reply"><textarea className="input" rows={4} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your reply…" /></FormField>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setReplying(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => replyMut.mutate({ id: replying.id, status: 'in_progress' })} disabled={replyMut.isPending} className="btn-secondary">Send & Keep Open</button>
              <button onClick={() => replyMut.mutate({ id: replying.id, status: 'resolved' })} disabled={replyMut.isPending} className="btn-primary"><CheckCircle size={14} /> Reply & Resolve</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ── Announcements ─────────────────────────────────────────────
export const TenantAnnouncements = () => {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', type: 'info', audience: 'all', isPinned: false });

  const { data, isLoading } = useQuery({
    queryKey: ['t-announcements'],
    queryFn: () => tenantExtApi.getAnnouncements().then(r => r.data.data),
  });

  const saveMut = useMutation({
    mutationFn: (d) => form.id ? tenantExtApi.updateAnnouncement(form.id, d) : tenantExtApi.createAnnouncement(d),
    onSuccess: () => { qc.invalidateQueries(['t-announcements']); setModal(false); toast.success('Announcement saved'); },
    onError: (e) => toast.error(getErrMsg(e)),
  });

  const delMut = useMutation({
    mutationFn: (id) => tenantExtApi.deleteAnnouncement(id),
    onSuccess: () => { qc.invalidateQueries(['t-announcements']); toast.success('Deleted'); },
    onError: (e) => toast.error(getErrMsg(e)),
  });

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div><h1 className="page-title">Announcements</h1></div>
        <button onClick={() => { setForm({ title: '', body: '', type: 'info', audience: 'all', isPinned: false }); setModal(true); }} className="btn-primary"><Plus size={16} /> New Announcement</button>
      </div>
      <div className="space-y-3">
        {isLoading ? <PageLoader /> : (data || []).map(a => (
          <div key={a.id} className={`card p-4 border-l-4 ${a.type === 'success' ? 'border-emerald-500' : a.type === 'warning' ? 'border-amber-500' : a.type === 'promo' ? 'border-violet-500' : 'border-brand-500'}`}>
            <div className="flex items-start justify-between">
              <div><h3 className="font-semibold text-sm">{a.isPinned ? '📌 ' : ''}{a.title}</h3><p className="text-xs text-slate-500 mt-1">{a.body}</p><p className="text-xs text-slate-400 mt-2">{fmt.datetime(a.createdAt)} · {a.audience}</p></div>
              <div className="flex gap-1">
                <button onClick={() => { setForm(a); setModal(true); }} className="btn-secondary !py-1 !px-2 text-xs"><Edit2 size={11} /></button>
                <button onClick={() => { if (confirm('Delete?')) delMut.mutate(a.id); }} className="btn-danger !py-1 !px-2 text-xs"><Trash2 size={11} /></button>
              </div>
            </div>
          </div>
        ))}
        {!isLoading && !data?.length && <EmptyState icon={Megaphone} title="No announcements" description="Post updates and news for your members" />}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={form.id ? 'Edit Announcement' : 'New Announcement'}>
        <div className="space-y-3">
          <FormField label="Title" required><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Message" required><textarea className="input" rows={3} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Type">
              <Select value={form.type} onChange={v => setForm({ ...form, type: v })} options={[{ value: 'info', label: 'Info' }, { value: 'success', label: 'Success' }, { value: 'warning', label: 'Warning' }, { value: 'promo', label: 'Promo' }]} />
            </FormField>
            <FormField label="Audience">
              <Select value={form.audience} onChange={v => setForm({ ...form, audience: v })} options={[{ value: 'all', label: 'All Members' }, { value: 'rank', label: 'By Rank' }]} />
            </FormField>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isPinned} onChange={e => setForm({ ...form, isPinned: e.target.checked })} className="rounded" />
            Pin to top
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending || !form.title || !form.body} className="btn-primary">
              {saveMut.isPending ? 'Saving…' : 'Save Announcement'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ── Branding & Settings ───────────────────────────────────────
export const TenantSettings = () => {
  const qc = useQueryClient();
  const [branding, setBranding] = useState({});
  const [settings, setSettings] = useState({});
  const [tab, setTab] = useState('branding');
  const { data, isLoading } = useQuery({
    queryKey: ['t-profile'],
    queryFn: () => tenantApi.getProfile().then(r => r.data.data),
    onSuccess: (d) => { setBranding(d.branding || {}); setSettings(d.settings || {}); },
  });

  const brandingMut = useMutation({
    mutationFn: () => tenantApi.updateBranding(branding),
    onSuccess: () => { qc.invalidateQueries(['t-profile']); toast.success('Branding saved'); },
    onError: (e) => toast.error(getErrMsg(e)),
  });
  const settingsMut = useMutation({
    mutationFn: () => tenantApi.updateSettings(settings),
    onSuccess: () => { qc.invalidateQueries(['t-profile']); toast.success('Settings saved'); },
    onError: (e) => toast.error(getErrMsg(e)),
  });

  if (isLoading) return <PageLoader />;

  const tabs = [
    { id: 'branding', label: 'Branding' },
    { id: 'registration', label: 'Registration' },
    { id: 'withdrawal', label: 'Withdrawal' },
    { id: 'kyc', label: 'KYC' },
    { id: 'tds', label: 'TDS' },
  ];

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Settings</h1></div>
      <div className="flex gap-1 mb-6 bg-surface-secondary rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-white shadow text-brand-700' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'branding' && (
        <div className="card p-6 max-w-xl">
          <h2 className="font-semibold mb-4">Branding</h2>
          <div className="space-y-3">
            {[['logoUrl', 'Logo URL'], ['faviconUrl', 'Favicon URL'], ['primaryColor', 'Primary Color'], ['secondaryColor', 'Secondary Color'], ['tagline', 'Tagline'], ['supportEmail', 'Support Email'], ['supportPhone', 'Support Phone'], ['website', 'Website URL']].map(([k, l]) => (
              <FormField key={k} label={l}>
                <input className="input" value={branding[k] || ''} onChange={e => setBranding({ ...branding, [k]: e.target.value })} />
              </FormField>
            ))}
            <button onClick={() => brandingMut.mutate()} disabled={brandingMut.isPending} className="btn-primary">
              {brandingMut.isPending ? 'Saving…' : 'Save Branding'}
            </button>
          </div>
        </div>
      )}

      {tab === 'registration' && (
        <div className="card p-6 max-w-xl">
          <h2 className="font-semibold mb-4">Registration Settings</h2>
          <div className="space-y-4">
            {[
              ['registrationOpen', 'Registration Open'],
              ['referralRequired', 'Referral Code Required'],
              ['autoApproveMembers', 'Auto-Approve New Members'],
              ['emailNotifications', 'Email Notifications'],
              ['smsNotifications', 'SMS Notifications'],
            ].map(([k, l]) => (
              <label key={k} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium">{l}</span>
                <div onClick={() => setSettings(s => ({ ...s, [k]: !s[k] }))}
                  className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${settings[k] ? 'bg-brand-600' : 'bg-slate-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[k] ? 'translate-x-5' : ''}`} />
                </div>
              </label>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Member ID Prefix">
                <input className="input" value={settings.memberIdPrefix || 'MBR'} onChange={e => setSettings({ ...settings, memberIdPrefix: e.target.value })} />
              </FormField>
              <FormField label="Currency Symbol">
                <input className="input" value={settings.currencySymbol || '₹'} onChange={e => setSettings({ ...settings, currencySymbol: e.target.value })} />
              </FormField>
            </div>
            <button onClick={() => settingsMut.mutate()} disabled={settingsMut.isPending} className="btn-primary">
              {settingsMut.isPending ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}

      {tab === 'withdrawal' && (
        <div className="card p-6 max-w-xl">
          <h2 className="font-semibold mb-4">Withdrawal Settings</h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium">Withdrawals Enabled</span>
              <div onClick={() => setSettings(s => ({ ...s, walletWithdrawalEnabled: !s.walletWithdrawalEnabled }))}
                className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${settings.walletWithdrawalEnabled !== false ? 'bg-brand-600' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.walletWithdrawalEnabled !== false ? 'translate-x-5' : ''}`} />
              </div>
            </label>
            {[['minWithdrawalAmount', 'Min Withdrawal (₹)'], ['maxWithdrawalAmount', 'Max Withdrawal (₹)'], ['withdrawalCooldownDays', 'Cooldown Days']].map(([k, l]) => (
              <FormField key={k} label={l}><input type="number" className="input" value={settings[k] || ''} onChange={e => setSettings({ ...settings, [k]: e.target.value })} /></FormField>
            ))}
            <button onClick={() => settingsMut.mutate()} disabled={settingsMut.isPending} className="btn-primary">Save</button>
          </div>
        </div>
      )}

      {tab === 'kyc' && (
        <div className="card p-6 max-w-xl">
          <h2 className="font-semibold mb-4">KYC Settings</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium">KYC Required for Withdrawal</span>
              <div onClick={() => setSettings(s => ({ ...s, requireKYC: !s.requireKYC }))}
                className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${settings.requireKYC ? 'bg-brand-600' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.requireKYC ? 'translate-x-5' : ''}`} />
              </div>
            </label>
            <FormField label="Required Documents (comma separated)">
              <input className="input" value={settings.kycDocumentsRequired || 'aadhaar,pan'} onChange={e => setSettings({ ...settings, kycDocumentsRequired: e.target.value })} placeholder="aadhaar,pan,bank_statement" />
            </FormField>
            <button onClick={() => settingsMut.mutate()} disabled={settingsMut.isPending} className="btn-primary">Save KYC Settings</button>
          </div>
        </div>
      )}

      {tab === 'tds' && (
        <div className="card p-6 max-w-xl">
          <h2 className="font-semibold mb-4">TDS (Tax Deducted at Source)</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium">Enable TDS Deduction</span>
              <div onClick={() => setSettings(s => ({ ...s, tdsEnabled: !s.tdsEnabled }))}
                className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${settings.tdsEnabled ? 'bg-brand-600' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.tdsEnabled ? 'translate-x-5' : ''}`} />
              </div>
            </label>
            {[['tdsPercentage', 'TDS Percentage (%)'], ['tdsThreshold', 'TDS Annual Threshold (₹)']].map(([k, l]) => (
              <FormField key={k} label={l}><input type="number" className="input" step="0.1" value={settings[k] || ''} onChange={e => setSettings({ ...settings, [k]: e.target.value })} /></FormField>
            ))}
            <button onClick={() => settingsMut.mutate()} disabled={settingsMut.isPending} className="btn-primary">Save TDS Settings</button>
          </div>
        </div>
      )}
    </div>
  );
};
