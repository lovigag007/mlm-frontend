import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { saApi, tenantApi, memberApi } from '../../services/api';
import { getErrMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Layers, Eye, EyeOff, ArrowRight, Building2 } from 'lucide-react';

const AuthCard = ({ title, subtitle, onSubmit, loading, fields, footer, logo }) => {
  const [show, setShow] = useState({});
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 via-brand-700 to-violet-800 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-2xl shadow-lg mb-4">
            {logo || <Layers size={22} className="text-brand-600" />}
          </div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          <p className="text-sm text-white/70 mt-1">{subtitle}</p>
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
                    required
                    className="input pr-10"
                  />
                  {f.type === 'password' && (
                    <button type="button" onClick={() => setShow(s => ({ ...s, [f.name]: !s[f.name] }))}
                      className="absolute right-3 top-2.5 text-slate-400">
                      {show[f.name] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? 'Please wait…' : <><span>Continue</span><ArrowRight size={16} /></>}
            </button>
          </form>
          {footer && <div className="mt-4 text-center text-sm text-slate-500">{footer}</div>}
        </div>
      </div>
    </div>
  );
};

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
    } catch (err) { toast.error(getErrMsg(err)); } finally { setLoading(false); }
  };
  return <AuthCard title="Super Admin" subtitle="Platform administration" onSubmit={onSubmit} loading={loading}
    fields={[
      { name:'email', label:'Email', type:'email', placeholder:'superadmin@mlmplatform.com', defaultValue:'superadmin@mlmplatform.com' },
      { name:'password', label:'Password', type:'password', placeholder:'••••••••', defaultValue:'SuperAdmin@123' },
    ]}
  />;
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
    } catch (err) { toast.error(getErrMsg(err)); } finally { setLoading(false); }
  };
  return <AuthCard title="Business Owner Login" subtitle="Manage your MLM business" onSubmit={onSubmit} loading={loading}
    fields={[
      { name:'email', label:'Email', type:'email', placeholder:'owner@business.com' },
      { name:'password', label:'Password', type:'password', placeholder:'••••••••' },
    ]}
    footer={<>Don't have an account? <Link to="/tenant/register" className="text-brand-600 font-medium">Register</Link></>}
  />;
};

export const TenantRegister = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    setLoading(true);
    try {
      await tenantApi.register({ businessName: fd.get('businessName'), ownerName: fd.get('ownerName'), email: fd.get('email'), password: fd.get('password'), subdomain: fd.get('subdomain'), phone: fd.get('phone') });
      toast.success('Registration submitted! Awaiting admin approval.');
      navigate('/tenant/login');
    } catch (err) { toast.error(getErrMsg(err)); } finally { setLoading(false); }
  };
  return <AuthCard title="Register Your Business" subtitle="Start your MLM platform" onSubmit={onSubmit} loading={loading}
    fields={[
      { name:'businessName', label:'Business Name', placeholder:'Awesome Network' },
      { name:'ownerName', label:'Owner Name', placeholder:'John Doe' },
      { name:'email', label:'Email', type:'email', placeholder:'owner@business.com' },
      { name:'phone', label:'Phone', placeholder:'+91 9876543210' },
      { name:'subdomain', label:'Subdomain', placeholder:'mynetwork (lowercase, no spaces)' },
      { name:'password', label:'Password (min 8 chars)', type:'password', placeholder:'••••••••' },
    ]}
    footer={<>Already registered? <Link to="/tenant/login" className="text-brand-600 font-medium">Login</Link></>}
  />;
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
      const { data } = await memberApi.login({ email: fd.get('email'), password: fd.get('password'), subdomain: fd.get('subdomain') });
      setAuth(data.token, data.user);
      navigate('/member/dashboard');
    } catch (err) { toast.error(getErrMsg(err)); } finally { setLoading(false); }
  };
  return <AuthCard title="Member Login" subtitle="Access your account" onSubmit={onSubmit} loading={loading}
    fields={[
      { name:'subdomain', label:'Business ID (Subdomain)', placeholder:'mynetwork' },
      { name:'email', label:'Email', type:'email', placeholder:'member@email.com' },
      { name:'password', label:'Password', type:'password', placeholder:'••••••••' },
    ]}
    footer={<>New member? <Link to="/member/register" className="text-brand-600 font-medium">Register</Link></>}
  />;
};

export const MemberRegister = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    setLoading(true);
    try {
      await memberApi.register({ fullName: fd.get('fullName'), email: fd.get('email'), password: fd.get('password'), phone: fd.get('phone'), referralCode: fd.get('referralCode'), subdomain: fd.get('subdomain') });
      toast.success('Registered! Please login.');
      navigate('/member/login');
    } catch (err) { toast.error(getErrMsg(err)); } finally { setLoading(false); }
  };
  return <AuthCard title="Join the Network" subtitle="Create your member account" onSubmit={onSubmit} loading={loading}
    fields={[
      { name:'subdomain', label:'Business ID (Subdomain)', placeholder:'mynetwork' },
      { name:'fullName', label:'Full Name', placeholder:'John Doe' },
      { name:'email', label:'Email', type:'email', placeholder:'john@email.com' },
      { name:'phone', label:'Phone', placeholder:'+91 9876543210' },
      { name:'referralCode', label:'Referral Code (optional)', placeholder:'ABC12345' },
      { name:'password', label:'Password', type:'password', placeholder:'Min 6 characters' },
    ]}
    footer={<>Already a member? <Link to="/member/login" className="text-brand-600 font-medium">Login</Link></>}
  />;
};
