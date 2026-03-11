import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import { saLogin, tenantLogin, tenantRegister, memberLogin, memberRegister } from '../../services/api'
import { Alert, Spinner } from '../ui'

const AuthCard = ({ title, subtitle, children }) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-surface-950">
    <div className="w-full max-w-md animate-slide-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black text-xl">M</div>
        <div>
          <p className="text-white font-bold">MLM Platform</p>
          <p className="text-xs text-slate-500">Multi-Tenant MLM SaaS</p>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <h1 className="text-xl font-bold text-white mb-1">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mb-6">{subtitle}</p>}
          {!subtitle && <div className="mb-6" />}
          {children}
        </div>
      </div>
    </div>
  </div>
)

const PwInput = ({ value, onChange, placeholder = 'Password', name = 'password', ...rest }) => {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input type={show ? 'text' : 'password'} value={value} onChange={onChange} name={name} placeholder={placeholder} className="input pr-10" {...rest} />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )
}

// ── Super Admin Login ─────────────────────────────────────────
export function SuperAdminLogin() {
  const [f, setF] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      const res = await saLogin(f)
      setAuth(res.user, res.accessToken)
      navigate('/superadmin')
    } catch (e) { setErr(e.response?.data?.message || 'Login failed') }
    finally { setLoading(false) }
  }

  return (
    <AuthCard title="Super Admin Login" subtitle="Platform administration portal">
      <form onSubmit={submit} className="space-y-4">
        <Alert type="error" message={err} />
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="admin@example.com" value={f.email} onChange={e => setF({...f, email: e.target.value})} required />
        </div>
        <div>
          <label className="label">Password</label>
          <PwInput value={f.password} onChange={e => setF({...f, password: e.target.value})} required />
        </div>
        <button className="btn-primary w-full justify-center py-2.5" disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Sign In'}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-4">
        <Link to="/" className="text-brand-400 hover:underline">← Back to home</Link>
      </p>
    </AuthCard>
  )
}

// ── Tenant Login ──────────────────────────────────────────────
export function TenantLogin() {
  const [f, setF] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      const res = await tenantLogin(f)
      setAuth({ ...res.user, role: 'tenant' }, res.accessToken)
      navigate('/tenant')
    } catch (e) { setErr(e.response?.data?.message || 'Login failed') }
    finally { setLoading(false) }
  }

  return (
    <AuthCard title="Business Owner Login" subtitle="Manage your MLM business">
      <form onSubmit={submit} className="space-y-4">
        <Alert type="error" message={err} />
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="owner@business.com" value={f.email} onChange={e => setF({...f, email: e.target.value})} required />
        </div>
        <div>
          <label className="label">Password</label>
          <PwInput value={f.password} onChange={e => setF({...f, password: e.target.value})} required />
        </div>
        <button className="btn-primary w-full justify-center py-2.5" disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Sign In'}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-4">
        Don't have an account? <Link to="/tenant/register" className="text-brand-400 hover:underline">Register</Link>
      </p>
    </AuthCard>
  )
}

// ── Tenant Register ───────────────────────────────────────────
export function TenantRegister() {
  const [f, setF] = useState({ businessName: '', ownerName: '', email: '', password: '', phone: '', subdomain: '' })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      await tenantRegister(f)
      setDone(true)
    } catch (e) { setErr(e.response?.data?.message || 'Registration failed') }
    finally { setLoading(false) }
  }

  if (done) return (
    <AuthCard title="Registration Submitted">
      <Alert type="success" message="Your business registration has been submitted. Our team will review and activate your account within 24 hours." />
      <button className="btn-primary w-full justify-center mt-5" onClick={() => navigate('/tenant/login')}>Go to Login</button>
    </AuthCard>
  )

  return (
    <AuthCard title="Register Your Business" subtitle="Launch your branded MLM platform">
      <form onSubmit={submit} className="space-y-4">
        <Alert type="error" message={err} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Business Name *</label>
            <input className="input" placeholder="Acme MLM" value={f.businessName} onChange={e => setF({...f, businessName: e.target.value})} required />
          </div>
          <div>
            <label className="label">Owner Name *</label>
            <input className="input" placeholder="John Doe" value={f.ownerName} onChange={e => setF({...f, ownerName: e.target.value})} required />
          </div>
        </div>
        <div>
          <label className="label">Email *</label>
          <input className="input" type="email" placeholder="owner@business.com" value={f.email} onChange={e => setF({...f, email: e.target.value})} required />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" type="tel" placeholder="+91 9876543210" value={f.phone} onChange={e => setF({...f, phone: e.target.value})} />
        </div>
        <div>
          <label className="label">Subdomain *</label>
          <div className="flex items-center">
            <input className="input rounded-r-none" placeholder="mybusiness" value={f.subdomain} onChange={e => setF({...f, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} required />
            <span className="px-3 py-2.5 bg-surface-700 border border-l-0 border-surface-700 rounded-r-xl text-sm text-slate-500">.mlmplatform.com</span>
          </div>
        </div>
        <div>
          <label className="label">Password *</label>
          <PwInput value={f.password} onChange={e => setF({...f, password: e.target.value})} required />
        </div>
        <button className="btn-primary w-full justify-center py-2.5" disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Submit Registration'}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-4">
        Already registered? <Link to="/tenant/login" className="text-brand-400 hover:underline">Login</Link>
      </p>
    </AuthCard>
  )
}

// ── Member Login ──────────────────────────────────────────────
export function MemberLogin() {
  const [f, setF] = useState({ email: '', password: '', subdomain: '' })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      const res = await memberLogin(f)
      setAuth({ ...res.user, role: 'member' }, res.accessToken)
      navigate('/member')
    } catch (e) { setErr(e.response?.data?.message || 'Login failed') }
    finally { setLoading(false) }
  }

  return (
    <AuthCard title="Member Login" subtitle="Access your network and earnings">
      <form onSubmit={submit} className="space-y-4">
        <Alert type="error" message={err} />
        <div>
          <label className="label">Business Subdomain *</label>
          <div className="flex items-center">
            <input className="input rounded-r-none" placeholder="mybusiness" value={f.subdomain} onChange={e => setF({...f, subdomain: e.target.value.toLowerCase()})} required />
            <span className="px-3 py-2.5 bg-surface-700 border border-l-0 border-surface-700 rounded-r-xl text-sm text-slate-500">.mlmplatform.com</span>
          </div>
        </div>
        <div>
          <label className="label">Email *</label>
          <input className="input" type="email" placeholder="member@email.com" value={f.email} onChange={e => setF({...f, email: e.target.value})} required />
        </div>
        <div>
          <label className="label">Password *</label>
          <PwInput value={f.password} onChange={e => setF({...f, password: e.target.value})} required />
        </div>
        <button className="btn-primary w-full justify-center py-2.5" disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Sign In'}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-4">
        Not a member? <Link to="/member/register" className="text-brand-400 hover:underline">Register</Link>
      </p>
    </AuthCard>
  )
}

// ── Member Register ───────────────────────────────────────────
export function MemberRegister() {
  const [f, setF] = useState({ fullName: '', email: '', password: '', phone: '', referralCode: '', subdomain: '' })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      const res = await memberRegister(f)
      setAuth({ ...res.user, role: 'member' }, res.accessToken)
      navigate('/member')
    } catch (e) { setErr(e.response?.data?.message || 'Registration failed') }
    finally { setLoading(false) }
  }

  return (
    <AuthCard title="Join a Business" subtitle="Enter your referral code to get started">
      <form onSubmit={submit} className="space-y-4">
        <Alert type="error" message={err} />
        <div>
          <label className="label">Business Subdomain *</label>
          <div className="flex items-center">
            <input className="input rounded-r-none" placeholder="mybusiness" value={f.subdomain} onChange={e => setF({...f, subdomain: e.target.value.toLowerCase()})} required />
            <span className="px-3 py-2.5 bg-surface-700 border border-l-0 border-surface-700 rounded-r-xl text-sm text-slate-500">.mlmplatform.com</span>
          </div>
        </div>
        <div>
          <label className="label">Referral Code</label>
          <input className="input" placeholder="ABC123 (optional)" value={f.referralCode} onChange={e => setF({...f, referralCode: e.target.value.toUpperCase()})} />
        </div>
        <div>
          <label className="label">Full Name *</label>
          <input className="input" placeholder="John Doe" value={f.fullName} onChange={e => setF({...f, fullName: e.target.value})} required />
        </div>
        <div>
          <label className="label">Email *</label>
          <input className="input" type="email" placeholder="john@email.com" value={f.email} onChange={e => setF({...f, email: e.target.value})} required />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" type="tel" placeholder="+91 9876543210" value={f.phone} onChange={e => setF({...f, phone: e.target.value})} />
        </div>
        <div>
          <label className="label">Password *</label>
          <PwInput value={f.password} onChange={e => setF({...f, password: e.target.value})} required />
        </div>
        <button className="btn-primary w-full justify-center py-2.5" disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Create Account'}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-4">
        Already a member? <Link to="/member/login" className="text-brand-400 hover:underline">Login</Link>
      </p>
    </AuthCard>
  )
}
