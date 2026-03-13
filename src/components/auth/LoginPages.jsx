import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { saApi, tenantApi, memberApi } from '../../services/api';
import { getErrMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  Layers, Eye, EyeOff, ArrowRight, Building2, Users, ShieldCheck,
  Network, TrendingUp, CheckCircle, ArrowLeft
} from 'lucide-react';

// ── Shared auth card ──────────────────────────────────────────
const AuthCard = ({ title, subtitle, onSubmit, loading, fields, footer, backTo }) => {
  const [show, setShow] = useState({});
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-brand-900 to-violet-900 p-4">
      <div className="w-full max-w-sm">
        {/* Back link */}
        <div className="mb-4">
          <Link to={backTo || '/'} className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors">
            <ArrowLeft size={14} /> Back
          </Link>
        </div>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur rounded-2xl mb-4 border border-white/20">
            <Layers size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-sm text-white/60 mt-1">{subtitle}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="label">{f.label}</label>
                <div className="relative">
                  <input
                    type={f.type === 'password' ? (show[f.name] ? 'text' : 'password') : f.type || 'text'}
                    placeholder={f.placeholder}
                    defaultValue={f.defaultValue || ''}
                    name={f.name}
                    required={f.required !== false}
                    className="input pr-10"
                  />
                  {f.type === 'password' && (
                    <button type="button" onClick={() => setShow(s => ({ ...s, [f.name]: !s[f.name] }))}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                      {show[f.name] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
                {f.hint && <p className="text-xs text-slate-400 mt-1">{f.hint}</p>}
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? 'Please wait…' : <><span>Continue</span><ArrowRight size={16} /></>}
            </button>
          </form>
          {footer && <div className="mt-4 text-center text-sm text-slate-500">{footer}</div>}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// PORTAL SELECTION — shown at "/" when not logged in
// ══════════════════════════════════════════════════════════════
export const PortalLanding = () => {
  const portals = [
    {
      icon: Building2,
      title: 'Business Owner',
      subtitle: 'Manage your MLM network, members, products and payouts',
      loginPath: '/tenant/login',
      registerPath: '/tenant/register',
      registerLabel: 'Register Business',
      color: 'from-blue-500 to-brand-600',
      features: ['Member management', 'Income plan setup', 'Product catalogue', 'Withdrawal approvals'],
    },
    {
      icon: Users,
      title: 'Member',
      subtitle: 'Access your earnings, team network, shop and wallet',
      loginPath: '/member/login',
      registerPath: '/member/register',
      registerLabel: 'Join as Member',
      color: 'from-violet-500 to-purple-600',
      features: ['Income ledger', 'Network tree', 'Shop & orders', 'Wallet & withdrawals'],
    },
    {
      icon: ShieldCheck,
      title: 'Platform Admin',
      subtitle: 'Super admin controls for platform management',
      loginPath: '/superadmin/login',
      registerPath: null,
      color: 'from-slate-600 to-slate-800',
      features: ['Tenant management', 'Income plan templates', 'Platform analytics'],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-900 to-violet-900 flex flex-col">
      {/* Header */}
      <div className="text-center pt-12 pb-8 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-5 border border-white/20">
          <Network size={30} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">MLM Platform</h1>
        <p className="text-white/60 mt-2 text-lg">Multi-level marketing infrastructure for growing businesses</p>
        <div className="flex items-center justify-center gap-6 mt-4 text-white/40 text-sm">
          <span className="flex items-center gap-1.5"><TrendingUp size={14} /> Multi-plan support</span>
          <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> KYC & compliance</span>
          <span className="flex items-center gap-1.5"><CheckCircle size={14} /> Automated commissions</span>
        </div>
      </div>

      {/* Portal cards */}
      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {portals.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 flex flex-col hover:bg-white/10 transition-all hover:border-white/20 hover:scale-[1.02]">
                {/* Icon + title */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h2 className="text-lg font-bold text-white mb-1">{p.title}</h2>
                <p className="text-sm text-white/50 mb-4 flex-1">{p.subtitle}</p>

                {/* Features */}
                <ul className="space-y-1.5 mb-6">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-white/60">
                      <CheckCircle size={11} className="text-emerald-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Actions */}
                <div className="space-y-2">
                  <Link to={p.loginPath}
                    className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 font-semibold text-sm py-2.5 px-4 rounded-xl hover:bg-white/90 transition-colors">
                    Login <ArrowRight size={14} />
                  </Link>
                  {p.registerPath && (
                    <Link to={p.registerPath}
                      className="w-full flex items-center justify-center gap-2 bg-white/10 text-white font-medium text-sm py-2.5 px-4 rounded-xl hover:bg-white/20 transition-colors border border-white/10">
                      {p.registerLabel}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// LOGIN / REGISTER FORMS
// ══════════════════════════════════════════════════════════════
export const SuperAdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    setLoading(true);
    try {
      const { data } = await saApi.login({ email: fd.get('email'), password: fd.get('password') });
      setAuth(data.token, data.user);
      navigate('/superadmin/dashboard');
    } catch (err) { toast.error(getErrMsg(err)); }
    finally { setLoading(false); }
  };
  return (
    <AuthCard
      title="Platform Admin"
      subtitle="Super administrator access"
      onSubmit={onSubmit}
      loading={loading}
      backTo="/"
      fields={[
        { name: 'email', label: 'Email', type: 'email', placeholder: 'superadmin@mlmplatform.com', defaultValue: 'superadmin@mlmplatform.com' },
        { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', defaultValue: 'SuperAdmin@123' },
      ]}
    />
  );
};

export const TenantLogin = () => {
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    setLoading(true);
    try {
      const { data } = await tenantApi.login({ email: fd.get('email'), password: fd.get('password') });
      setAuth(data.token, data.user);
      navigate('/tenant/dashboard');
    } catch (err) { toast.error(getErrMsg(err)); }
    finally { setLoading(false); }
  };
  return (
    <AuthCard
      title="Business Owner Login"
      subtitle="Manage your MLM network"
      onSubmit={onSubmit}
      loading={loading}
      backTo="/"
      fields={[
        { name: 'email', label: 'Email', type: 'email', placeholder: 'owner@business.com' },
        { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
      ]}
      footer={<>No account? <Link to="/tenant/register" className="text-brand-600 font-semibold hover:underline">Register your business</Link></>}
    />
  );
};

export const TenantRegister = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    setLoading(true);
    try {
      await tenantApi.register({
        businessName: fd.get('businessName'),
        ownerName: fd.get('ownerName'),
        email: fd.get('email'),
        password: fd.get('password'),
        subdomain: fd.get('subdomain'),
        phone: fd.get('phone'),
      });
      toast.success('Registration submitted! Awaiting admin approval.');
      navigate('/tenant/login');
    } catch (err) { toast.error(getErrMsg(err)); }
    finally { setLoading(false); }
  };
  return (
    <AuthCard
      title="Register Your Business"
      subtitle="Start your MLM platform today"
      onSubmit={onSubmit}
      loading={loading}
      backTo="/"
      fields={[
        { name: 'businessName', label: 'Business Name', placeholder: 'Awesome Network' },
        { name: 'ownerName', label: 'Owner Full Name', placeholder: 'John Doe' },
        { name: 'email', label: 'Email Address', type: 'email', placeholder: 'owner@business.com' },
        { name: 'phone', label: 'Phone Number', placeholder: '+91 9876543210' },
        { name: 'subdomain', label: 'Subdomain / Business ID', placeholder: 'mynetwork', hint: 'Lowercase letters, numbers and hyphens only. e.g. "my-network"' },
        { name: 'password', label: 'Password (min 8 chars)', type: 'password', placeholder: '••••••••' },
      ]}
      footer={<>Already registered? <Link to="/tenant/login" className="text-brand-600 font-semibold hover:underline">Login here</Link></>}
    />
  );
};

export const MemberLogin = () => {
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    setLoading(true);
    try {
      const { data } = await memberApi.login({
        email: fd.get('email'),
        password: fd.get('password'),
        subdomain: fd.get('subdomain'),
      });
      setAuth(data.token, data.user);
      navigate('/member/dashboard');
    } catch (err) { toast.error(getErrMsg(err)); }
    finally { setLoading(false); }
  };
  return (
    <AuthCard
      title="Member Login"
      subtitle="Access your network & earnings"
      onSubmit={onSubmit}
      loading={loading}
      backTo="/"
      fields={[
        { name: 'subdomain', label: 'Business ID', placeholder: 'your-business-subdomain', hint: 'The subdomain of the business you belong to' },
        { name: 'email', label: 'Your Email', type: 'email', placeholder: 'member@email.com' },
        { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
      ]}
      footer={<>New member? <Link to="/member/register" className="text-brand-600 font-semibold hover:underline">Create account</Link></>}
    />
  );
};

export const MemberRegister = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    setLoading(true);
    try {
      await memberApi.register({
        fullName: fd.get('fullName'),
        email: fd.get('email'),
        password: fd.get('password'),
        phone: fd.get('phone'),
        referralCode: fd.get('referralCode'),
        subdomain: fd.get('subdomain'),
      });
      toast.success('Account created! Please login.');
      navigate('/member/login');
    } catch (err) { toast.error(getErrMsg(err)); }
    finally { setLoading(false); }
  };
  return (
    <AuthCard
      title="Join the Network"
      subtitle="Create your member account"
      onSubmit={onSubmit}
      loading={loading}
      backTo="/"
      fields={[
        { name: 'subdomain', label: 'Business ID', placeholder: 'your-business-subdomain', hint: 'Ask your upline or business owner for this' },
        { name: 'fullName', label: 'Full Name', placeholder: 'John Doe' },
        { name: 'email', label: 'Email Address', type: 'email', placeholder: 'john@email.com' },
        { name: 'phone', label: 'Phone Number', placeholder: '+91 9876543210' },
        { name: 'referralCode', label: 'Referral Code', placeholder: 'ABC12345', required: false, hint: 'Optional — leave blank if you have none' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters' },
      ]}
      footer={<>Already a member? <Link to="/member/login" className="text-brand-600 font-semibold hover:underline">Login here</Link></>}
    />
  );
};
