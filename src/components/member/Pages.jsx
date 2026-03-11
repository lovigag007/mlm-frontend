import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memberApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { StatCard, Table, Badge, Modal, PageLoader, Pagination, FormField, EmptyState, Select } from '../ui';
import { fmt, getErrMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  DollarSign, Wallet, Users, ShoppingCart, Copy, CheckCircle, Plus, Trash2,
  Network, CreditCard, Bell, Megaphone, Ticket, Package, Eye, ArrowDownToLine,
  TrendingUp, User, Lock, FileCheck
} from 'lucide-react';

const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="btn-secondary !py-1 !px-2 text-xs gap-1">
      {copied ? <CheckCircle size={12} className="text-emerald-500" /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
};

// ── Dashboard ─────────────────────────────────────────────────
export const MemberDashboard = () => {
  const { data, isLoading } = useQuery({ queryKey: ['m-dashboard'], queryFn: () => memberApi.getDashboard().then(r => r.data.data) });
  if (isLoading) return <PageLoader />;
  const wallet = data?.member?.wallet;
  return (
    <div>
      <div className="page-header flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Welcome back, {data?.member?.fullName?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">{data?.member?.memberId} · Rank: <span className="font-semibold text-brand-700">{data?.member?.rank}</span></p>
        </div>
        <div className="flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 px-4 py-2 rounded-xl text-sm">
          <span className="text-slate-500">Referral Code:</span>
          <span className="font-bold tracking-wider">{data?.member?.referralCode}</span>
          <CopyBtn text={data?.member?.referralCode || ''} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Wallet} label="Income Wallet" value={fmt.currency(wallet?.incomeBalance)} color="emerald" sub="Available to withdraw" />
        <StatCard icon={ShoppingCart} label="Shopping Wallet" value={fmt.currency(wallet?.shoppingBalance)} color="violet" sub="Use to buy products" />
        <StatCard icon={TrendingUp} label="Total Earned" value={fmt.currency(data?.member?.totalEarned)} color="brand" sub="All-time income" />
        <StatCard icon={Users} label="Direct Team" value={fmt.num(data?.directTeam)} color="sky" sub={`Team size: ${fmt.num(data?.member?.teamSize)}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold text-sm">Recent Transactions</h2>
          </div>
          <Table columns={[
            { label: 'Type', key: 'type', render: v => <span className="capitalize text-xs font-medium bg-slate-100 px-2 py-0.5 rounded-full">{v.replace(/_/g, ' ')}</span> },
            { label: 'Amount', key: 'amount', render: v => <span className={`font-semibold ${parseFloat(v) >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{parseFloat(v) >= 0 ? '+' : ''}{fmt.currency(v)}</span> },
            { label: 'Description', key: 'description', render: v => <span className="text-xs text-slate-500 truncate max-w-xs block">{v}</span> },
            { label: 'Date', key: 'createdAt', render: v => fmt.datetime(v) },
          ]} data={data?.recentTransactions || []} emptyMsg="No transactions yet" />
        </div>

        <div className="card">
          <div className="card-header"><h2 className="font-semibold text-sm">Quick Stats</h2></div>
          <div className="p-4 space-y-4">
            {[
              { label: 'Total Withdrawn', value: fmt.currency(wallet?.totalWithdrawn), color: 'text-red-600' },
              { label: 'TDS Deducted', value: fmt.currency(wallet?.totalTdsDeducted), color: 'text-orange-600' },
              { label: 'Total Purchases', value: fmt.currency(data?.member?.totalPurchase), color: 'text-violet-600' },
              { label: 'Pending Withdrawals', value: fmt.num(data?.pendingWithdrawals), color: 'text-amber-600' },
            ].map(s => (
              <div key={s.label} className="flex justify-between items-center py-2 border-b border-surface-border last:border-0">
                <span className="text-sm text-slate-500">{s.label}</span>
                <span className={`font-semibold text-sm ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Network Tree ──────────────────────────────────────────────
export const MemberNetwork = () => {
  const { data, isLoading } = useQuery({ queryKey: ['m-tree'], queryFn: () => memberApi.getTree().then(r => r.data.data) });
  if (isLoading) return <PageLoader />;

  const TreeNode = ({ node, depth = 0 }) => {
    const [expanded, setExpanded] = useState(depth < 2);
    const hasChildren = node.children?.length > 0;
    return (
      <div className={`${depth > 0 ? 'ml-8 pl-4 border-l-2 border-surface-border' : ''} mt-2`}>
        <div className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-surface-secondary transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {node.fullName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{node.fullName}</span>
              <span className="text-xs text-slate-400">#{node.memberId}</span>
              <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">{node.rank}</span>
            </div>
            <div className="flex gap-3 mt-0.5 text-xs text-slate-400">
              <span>Direct: {node.directCount}</span>
              <span>Team: {node.teamSize}</span>
              <span>Earned: {fmt.currency(node.totalEarned)}</span>
            </div>
          </div>
          <Badge status={node.status}>{node.status}</Badge>
          {hasChildren && (
            <button onClick={() => setExpanded(!expanded)} className="text-xs bg-brand-50 text-brand-700 px-3 py-1 rounded-full font-medium hover:bg-brand-100">
              {expanded ? '▲ Hide' : `▼ ${node.children.length}`}
            </button>
          )}
        </div>
        {expanded && hasChildren && node.children.map(child => <TreeNode key={child.id} node={child} depth={depth + 1} />)}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header"><h1 className="page-title">My Network</h1><p className="page-subtitle">Your MLM downline tree</p></div>
      <div className="card p-6">
        {data ? <TreeNode node={data} /> : <EmptyState icon={Network} title="No downline yet" description="Share your referral code to start building your team" />}
      </div>
    </div>
  );
};

// ── Income / Transactions ─────────────────────────────────────
export const MemberIncome = () => {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['m-transactions', page, typeFilter],
    queryFn: () => memberApi.getTransactions({ page, limit: 20, type: typeFilter || undefined }).then(r => r.data),
  });
  return (
    <div>
      <div className="page-header flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="page-title">Income Ledger</h1><p className="page-subtitle">All income and debit transactions</p></div>
        <Select value={typeFilter} onChange={v => { setTypeFilter(v); setPage(1); }} className="!w-48"
          options={[
            { value: '', label: 'All Types' },
            { value: 'direct_bonus', label: 'Direct Bonus' },
            { value: 'level_commission', label: 'Level Commission' },
            { value: 'roi_income', label: 'ROI Income' },
            { value: 'matching_bonus', label: 'Matching Bonus' },
            { value: 'rank_bonus', label: 'Rank Bonus' },
            { value: 'withdrawal', label: 'Withdrawal' },
          ]}
        />
      </div>
      <div className="card">
        <Table columns={[
          { label: 'Type', key: 'type', render: v => <span className="capitalize text-xs font-medium bg-slate-100 px-2 py-0.5 rounded-full">{v.replace(/_/g, ' ')}</span> },
          { label: 'Amount', key: 'amount', render: v => <span className={`font-bold ${parseFloat(v) >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{parseFloat(v) >= 0 ? '+' : ''}{fmt.currency(v)}</span> },
          { label: 'Balance After', key: 'balanceAfter', render: v => fmt.currency(v) },
          { label: 'Description', key: 'description', render: v => <span className="text-xs text-slate-500">{v}</span> },
          { label: 'Level', key: 'level', render: v => v ? `L${v}` : '—' },
          { label: 'Date', key: 'createdAt', render: v => fmt.datetime(v) },
          { label: 'Status', key: 'status', render: v => <Badge status={v}>{v}</Badge> },
        ]} data={data?.data || []} loading={isLoading} emptyMsg="No transactions found" />
        {data?.pagination && <Pagination current={page} total={data.pagination.total} pages={data.pagination.pages} onChange={setPage} />}
      </div>
    </div>
  );
};

// ── Wallet & Withdrawal ───────────────────────────────────────
export const MemberWalletPage = () => {
  const qc = useQueryClient();
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [wForm, setWForm] = useState({ amount: '', bankAccountId: '' });
  const { data: wallet, isLoading: wLoad } = useQuery({ queryKey: ['m-wallet'], queryFn: () => memberApi.getWallet().then(r => r.data.data) });
  const { data: bankAccounts } = useQuery({ queryKey: ['m-bank-accounts'], queryFn: () => memberApi.getBankAccounts().then(r => r.data.data) });
  const { data: withdrawals } = useQuery({ queryKey: ['m-withdrawals'], queryFn: () => memberApi.getWithdrawals().then(r => r.data.data) });

  const withdrawMut = useMutation({
    mutationFn: (d) => memberApi.requestWithdrawal(d),
    onSuccess: () => {
      qc.invalidateQueries(['m-wallet']); qc.invalidateQueries(['m-withdrawals']);
      setWithdrawModal(false); toast.success('Withdrawal request submitted!');
    },
    onError: (e) => toast.error(getErrMsg(e)),
  });

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Wallet</h1></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Wallet} label="Income Balance" value={fmt.currency(wallet?.incomeBalance)} color="emerald" sub="Available for withdrawal" />
        <StatCard icon={ShoppingCart} label="Shopping Balance" value={fmt.currency(wallet?.shoppingBalance)} color="violet" sub="Use to buy products" />
        <StatCard icon={DollarSign} label="On Hold" value={fmt.currency(wallet?.holdBalance)} color="amber" sub="Pending withdrawal lock" />
      </div>

      <div className="flex justify-end mb-4">
        <button onClick={() => setWithdrawModal(true)} className="btn-primary"><ArrowDownToLine size={16} /> Request Withdrawal</button>
      </div>

      <div className="card">
        <div className="card-header"><h2 className="font-semibold text-sm">Withdrawal History</h2></div>
        <Table columns={[
          { label: 'Request #', key: 'requestNumber' },
          { label: 'Requested', key: 'requestedAmount', render: v => fmt.currency(v) },
          { label: 'TDS', key: 'tdsAmount', render: v => fmt.currency(v) },
          { label: 'Net Payable', key: 'netPayableAmount', render: v => <span className="font-semibold text-emerald-700">{fmt.currency(v)}</span> },
          { label: 'Date', key: 'createdAt', render: v => fmt.datetime(v) },
          { label: 'Status', key: 'status', render: v => <Badge status={v}>{v}</Badge> },
          { label: 'Payment Ref', key: 'paymentRef', render: v => v || '—' },
        ]} data={withdrawals || []} emptyMsg="No withdrawal requests yet" />
      </div>

      <Modal open={withdrawModal} onClose={() => setWithdrawModal(false)} title="Request Withdrawal">
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-sm text-emerald-700">
            Available: <strong>{fmt.currency(wallet?.incomeBalance)}</strong>
          </div>
          <FormField label="Amount (₹)" required>
            <input type="number" className="input" value={wForm.amount} onChange={e => setWForm({ ...wForm, amount: e.target.value })} placeholder="Enter amount" min="1" />
          </FormField>
          <FormField label="Bank Account">
            <Select value={wForm.bankAccountId} onChange={v => setWForm({ ...wForm, bankAccountId: v })}
              placeholder="Select bank account"
              options={(bankAccounts || []).map(b => ({ value: b.id, label: `${b.bankName} - ${b.accountNumber.slice(-4)}` }))} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setWithdrawModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={() => withdrawMut.mutate(wForm)} disabled={withdrawMut.isPending || !wForm.amount} className="btn-primary">
              {withdrawMut.isPending ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ── Bank Accounts ─────────────────────────────────────────────
export const MemberBankAccounts = () => {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ accountHolder: '', bankName: '', accountNumber: '', ifscCode: '', accountType: 'savings', upiId: '' });
  const { data, isLoading } = useQuery({ queryKey: ['m-bank-accounts'], queryFn: () => memberApi.getBankAccounts().then(r => r.data.data) });

  const addMut = useMutation({
    mutationFn: (d) => memberApi.addBankAccount(d),
    onSuccess: () => { qc.invalidateQueries(['m-bank-accounts']); setModal(false); toast.success('Bank account added'); },
    onError: (e) => toast.error(getErrMsg(e)),
  });
  const delMut = useMutation({
    mutationFn: (id) => memberApi.deleteBankAccount(id),
    onSuccess: () => { qc.invalidateQueries(['m-bank-accounts']); toast.success('Removed'); },
    onError: (e) => toast.error(getErrMsg(e)),
  });

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div><h1 className="page-title">Bank Accounts</h1></div>
        <button onClick={() => setModal(true)} className="btn-primary"><Plus size={16} /> Add Account</button>
      </div>
      {isLoading ? <PageLoader /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data || []).map(acc => (
            <div key={acc.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><CreditCard size={18} className="text-blue-600" /></div>
                  <div><p className="font-semibold text-sm">{acc.bankName}</p><p className="text-xs text-slate-400 capitalize">{acc.accountType}</p></div>
                </div>
                <button onClick={() => { if (confirm('Remove?')) delMut.mutate(acc.id); }} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Account Holder</span><span className="font-medium">{acc.accountHolder}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Account Number</span><span className="font-mono">••••{acc.accountNumber.slice(-4)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">IFSC</span><span className="font-mono">{acc.ifscCode}</span></div>
                {acc.upiId && <div className="flex justify-between"><span className="text-slate-400">UPI</span><span>{acc.upiId}</span></div>}
              </div>
              {acc.isVerified && <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600"><CheckCircle size={12} /> Verified</div>}
            </div>
          ))}
          {!data?.length && <EmptyState icon={CreditCard} title="No bank accounts" description="Add a bank account to receive withdrawals" />}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Bank Account">
        <div className="space-y-3">
          {[['accountHolder', 'Account Holder Name'], ['bankName', 'Bank Name'], ['accountNumber', 'Account Number'], ['ifscCode', 'IFSC Code'], ['upiId', 'UPI ID (optional)']].map(([k, l]) => (
            <FormField key={k} label={l}>
              <input className="input" value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />
            </FormField>
          ))}
          <FormField label="Account Type">
            <Select value={form.accountType} onChange={v => setForm({ ...form, accountType: v })}
              options={[{ value: 'savings', label: 'Savings' }, { value: 'current', label: 'Current' }]} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={() => addMut.mutate(form)} disabled={addMut.isPending} className="btn-primary">Save Account</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ── Shop ──────────────────────────────────────────────────────
export const MemberShop = () => {
  const qc = useQueryClient();
  const [cart, setCart] = useState([]);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [search, setSearch] = useState('');
  const { data: wallet } = useQuery({ queryKey: ['m-wallet'], queryFn: () => memberApi.getWallet().then(r => r.data.data) });
  const { data, isLoading } = useQuery({
    queryKey: ['m-products', search],
    queryFn: () => memberApi.getProducts({ search: search || undefined, limit: 50 }).then(r => r.data.data),
  });

  const addToCart = (product) => {
    setCart(c => {
      const exists = c.find(i => i.productId === product.id);
      if (exists) return c.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...c, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };
  const cartTotal = cart.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);

  const purchaseMut = useMutation({
    mutationFn: (d) => memberApi.purchase(d),
    onSuccess: () => {
      qc.invalidateQueries(['m-wallet']); qc.invalidateQueries(['m-orders']);
      setCart([]); setCheckoutModal(false); toast.success('Order placed! Commissions are being processed.');
    },
    onError: (e) => toast.error(getErrMsg(e)),
  });

  return (
    <div>
      <div className="page-header flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="page-title">Shop</h1></div>
        <div className="flex gap-3 items-center">
          <input className="input !w-56" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
          {cart.length > 0 && (
            <button onClick={() => setCheckoutModal(true)} className="btn-primary relative">
              <ShoppingCart size={16} /> Checkout ({cart.length})
            </button>
          )}
        </div>
      </div>

      {isLoading ? <PageLoader /> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {(data || []).map(p => (
            <div key={p.id} className="card overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-4xl">
                {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" alt={p.name} /> : '📦'}
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm truncate">{p.name}</p>
                <p className="text-xs text-slate-400 mb-2">BV: {p.bv}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-700">{fmt.currency(p.price)}</span>
                  <button onClick={() => addToCart(p)} className="btn-primary !py-1 !px-3 text-xs"><Plus size={12} /></button>
                </div>
              </div>
            </div>
          ))}
          {!data?.length && <div className="col-span-full"><EmptyState icon={Package} title="No products available" description="Your upline hasn't added products yet" /></div>}
        </div>
      )}

      <Modal open={checkoutModal} onClose={() => setCheckoutModal(false)} title="Checkout" size="lg">
        <div className="space-y-4">
          <div className="divide-y divide-surface-border">
            {cart.map(item => (
              <div key={item.productId} className="py-3 flex items-center gap-3">
                <div className="flex-1"><p className="text-sm font-medium">{item.name}</p><p className="text-xs text-slate-400">{fmt.currency(item.price)} × {item.quantity}</p></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCart(c => c.map(i => i.productId === item.productId && i.quantity > 1 ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0))} className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm hover:bg-slate-200">−</button>
                  <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                  <button onClick={() => setCart(c => c.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i))} className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm hover:bg-brand-200">+</button>
                </div>
                <span className="text-sm font-bold w-20 text-right">{fmt.currency(parseFloat(item.price) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center py-3 border-t-2 border-surface-border">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold text-brand-700">{fmt.currency(cartTotal)}</span>
          </div>
          <div className="flex gap-2 items-center text-sm text-slate-500">
            <Wallet size={14} /> Shopping Wallet Balance: <strong className="text-slate-800">{fmt.currency(wallet?.shoppingBalance)}</strong>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setCheckoutModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={() => purchaseMut.mutate({ items: cart.map(i => ({ productId: i.productId, quantity: i.quantity })), paymentMethod: 'wallet' })}
              disabled={purchaseMut.isPending || cartTotal > parseFloat(wallet?.shoppingBalance || 0)} className="btn-primary">
              {purchaseMut.isPending ? 'Placing…' : 'Place Order (Wallet)'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ── Orders ────────────────────────────────────────────────────
export const MemberOrders = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['m-orders', page],
    queryFn: () => memberApi.getOrders({ page, limit: 15 }).then(r => r.data),
  });
  return (
    <div>
      <div className="page-header"><h1 className="page-title">My Orders</h1></div>
      <div className="card">
        <Table columns={[
          { label: 'Order #', key: 'orderNumber', render: v => <span className="font-mono text-xs">{v}</span> },
          { label: 'Amount', key: 'totalAmount', render: v => fmt.currency(v) },
          { label: 'BV', key: 'totalBV', render: v => fmt.num(v) },
          { label: 'Payment', key: 'paymentMethod', render: v => <span className="capitalize">{v}</span> },
          { label: 'Date', key: 'createdAt', render: v => fmt.datetime(v) },
          { label: 'Status', key: 'status', render: v => <Badge status={v}>{v}</Badge> },
        ]} data={data?.data || []} loading={isLoading} emptyMsg="No orders yet" />
        {data?.pagination && <Pagination current={page} total={data.pagination.total} pages={data.pagination.pages} onChange={setPage} />}
      </div>
    </div>
  );
};

// ── KYC ──────────────────────────────────────────────────────
export const MemberKYC = () => {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ docType: 'aadhaar', docNumber: '', docUrl: '', backUrl: '' });
  const { data: kycDocs, isLoading } = useQuery({ queryKey: ['m-kyc-docs'], queryFn: () => memberApi.getKYCDocs().then(r => r.data.data) });

  const submitMut = useMutation({
    mutationFn: (d) => memberApi.submitKYC(d),
    onSuccess: () => { qc.invalidateQueries(['m-kyc-docs']); setModal(false); toast.success('KYC submitted for review'); },
    onError: (e) => toast.error(getErrMsg(e)),
  });

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div><h1 className="page-title">KYC Verification</h1><p className="page-subtitle">Submit documents to unlock withdrawals</p></div>
        <button onClick={() => setModal(true)} className="btn-primary"><Plus size={16} /> Submit Document</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(kycDocs || []).map(doc => (
          <div key={doc.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div><p className="font-semibold capitalize">{doc.docType.replace('_', ' ')}</p><p className="text-xs text-slate-400">#{doc.docNumber}</p></div>
              <Badge status={doc.status}>{doc.status}</Badge>
            </div>
            {doc.reviewNote && <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded">{doc.reviewNote}</p>}
            <p className="text-xs text-slate-400 mt-2">{fmt.datetime(doc.createdAt)}</p>
          </div>
        ))}
        {!kycDocs?.length && <EmptyState icon={FileCheck} title="No documents submitted" description="Submit your KYC documents to enable withdrawals" />}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Submit KYC Document">
        <div className="space-y-3">
          <FormField label="Document Type">
            <Select value={form.docType} onChange={v => setForm({ ...form, docType: v })}
              options={[
                { value: 'aadhaar', label: 'Aadhaar Card' }, { value: 'pan', label: 'PAN Card' },
                { value: 'passport', label: 'Passport' }, { value: 'voter_id', label: 'Voter ID' },
                { value: 'driving_license', label: "Driver's License" },
              ]} />
          </FormField>
          <FormField label="Document Number"><input className="input" value={form.docNumber} onChange={e => setForm({ ...form, docNumber: e.target.value })} /></FormField>
          <FormField label="Front Image URL"><input className="input" value={form.docUrl} onChange={e => setForm({ ...form, docUrl: e.target.value })} placeholder="https://..." /></FormField>
          <FormField label="Back Image URL (optional)"><input className="input" value={form.backUrl} onChange={e => setForm({ ...form, backUrl: e.target.value })} placeholder="https://..." /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={() => submitMut.mutate(form)} disabled={submitMut.isPending} className="btn-primary">Submit for Review</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ── Profile ───────────────────────────────────────────────────
export const MemberProfile = () => {
  const qc = useQueryClient();
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({});
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const { data, isLoading } = useQuery({ queryKey: ['m-profile'], queryFn: () => memberApi.getProfile().then(r => r.data.data) });

  const updateMut = useMutation({
    mutationFn: (d) => memberApi.updateProfile(d),
    onSuccess: (r) => { qc.invalidateQueries(['m-profile']); toast.success('Profile updated'); },
    onError: (e) => toast.error(getErrMsg(e)),
  });
  const pwMut = useMutation({
    mutationFn: (d) => fetch('/api/v1/member/password', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAuthStore.getState().token}` }, body: JSON.stringify(d) }).then(r => r.json()).then(r => { if (!r.success) throw new Error(r.message); return r; }),
    onSuccess: () => { setPwForm({ currentPassword: '', newPassword: '' }); toast.success('Password changed'); },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <PageLoader />;
  const m = data;
  return (
    <div>
      <div className="page-header"><h1 className="page-title">My Profile</h1></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-3xl font-bold text-white mb-3">
            {m?.fullName?.[0]}
          </div>
          <h2 className="font-bold text-lg">{m?.fullName}</h2>
          <p className="text-sm text-slate-400">{m?.memberId}</p>
          <div className="mt-2 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-semibold">{m?.rank}</div>
          <div className="mt-4 w-full space-y-2 text-sm text-left">
            <div className="flex justify-between"><span className="text-slate-400">Email</span><span>{m?.email}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Phone</span><span>{m?.phone || '—'}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">KYC</span><Badge status={m?.kycStatus}>{m?.kycStatus}</Badge></div>
            <div className="flex justify-between"><span className="text-slate-400">Joined</span><span>{fmt.date(m?.joiningDate)}</span></div>
          </div>
        </div>
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-semibold mb-4">Edit Profile</h2>
          <div className="space-y-3">
            {[['fullName', 'Full Name'], ['phone', 'Phone'], ['profilePic', 'Profile Picture URL']].map(([k, l]) => (
              <FormField key={k} label={l}>
                <input className="input" defaultValue={m?.[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} />
              </FormField>
            ))}
            <button onClick={() => updateMut.mutate(form)} disabled={updateMut.isPending} className="btn-primary">
              {updateMut.isPending ? 'Saving…' : 'Update Profile'}
            </button>
          </div>
          <hr className="my-6 border-surface-border" />
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Lock size={16} /> Change Password</h2>
          <div className="space-y-3">
            <FormField label="Current Password">
              <input type="password" className="input" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
            </FormField>
            <FormField label="New Password (min 6 chars)">
              <input type="password" className="input" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} />
            </FormField>
            <button onClick={() => pwMut.mutate(pwForm)} disabled={pwMut.isPending} className="btn-secondary">
              {pwMut.isPending ? 'Updating…' : 'Change Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Notifications ─────────────────────────────────────────────
export const MemberNotifications = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['m-notifs'], queryFn: () => memberApi.getNotifications().then(r => r.data.data) });
  const markMut = useMutation({
    mutationFn: () => memberApi.markNotificationsRead(),
    onSuccess: () => qc.invalidateQueries(['m-notifs']),
  });
  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div><h1 className="page-title">Notifications</h1></div>
        {(data || []).some(n => !n.isRead) && <button onClick={() => markMut.mutate()} className="btn-secondary text-xs">Mark all read</button>}
      </div>
      <div className="card divide-y divide-surface-border">
        {isLoading ? <div className="p-8 text-center"><PageLoader /></div> :
          (data || []).length === 0 ? <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" /> :
            (data || []).map(n => (
              <div key={n.id} className={`p-4 flex gap-3 ${!n.isRead ? 'bg-brand-50/40' : ''}`}>
                <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 text-sm">{n.title[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!n.isRead ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{fmt.datetime(n.createdAt)}</p>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

// ── Support Tickets ───────────────────────────────────────────
export const MemberSupport = () => {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '', category: 'other', priority: 'medium' });
  const { data, isLoading } = useQuery({ queryKey: ['m-tickets'], queryFn: () => memberApi.getTickets().then(r => r.data.data) });

  const createMut = useMutation({
    mutationFn: (d) => memberApi.createTicket(d),
    onSuccess: () => { qc.invalidateQueries(['m-tickets']); setModal(false); toast.success('Ticket submitted!'); },
    onError: (e) => toast.error(getErrMsg(e)),
  });

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div><h1 className="page-title">Support Tickets</h1></div>
        <button onClick={() => setModal(true)} className="btn-primary"><Plus size={16} /> New Ticket</button>
      </div>
      <div className="card">
        <Table columns={[
          { label: 'Ticket #', key: 'ticketNumber' },
          { label: 'Subject', key: 'subject' },
          { label: 'Category', key: 'category', render: v => <span className="capitalize">{v}</span> },
          { label: 'Priority', key: 'priority', render: v => <Badge status={v === 'high' || v === 'urgent' ? 'blocked' : v === 'medium' ? 'pending' : 'inactive'}>{v}</Badge> },
          { label: 'Status', key: 'status', render: v => <Badge status={v === 'resolved' ? 'active' : v === 'open' ? 'pending' : 'inactive'}>{v}</Badge> },
          { label: 'Date', key: 'createdAt', render: v => fmt.datetime(v) },
        ]} data={data || []} loading={isLoading} emptyMsg="No support tickets" />
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Raise Support Ticket">
        <div className="space-y-3">
          <FormField label="Subject"><input className="input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Category">
              <Select value={form.category} onChange={v => setForm({ ...form, category: v })}
                options={[{ value: 'withdrawal', label: 'Withdrawal' }, { value: 'commission', label: 'Commission' }, { value: 'account', label: 'Account' }, { value: 'technical', label: 'Technical' }, { value: 'other', label: 'Other' }]} />
            </FormField>
            <FormField label="Priority">
              <Select value={form.priority} onChange={v => setForm({ ...form, priority: v })}
                options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }]} />
            </FormField>
          </div>
          <FormField label="Message"><textarea className="input" rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={() => createMut.mutate(form)} disabled={createMut.isPending} className="btn-primary">Submit Ticket</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
