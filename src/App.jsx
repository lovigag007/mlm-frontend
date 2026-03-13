import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout';

import {
  PortalLanding,
  SuperAdminLogin, TenantLogin, TenantRegister, MemberLogin, MemberRegister,
} from './components/auth/LoginPages';

import { SADashboard, SATenants, SAIncomePlans } from './components/superadmin/Pages';

import {
  TenantDashboard, TenantMembers, TenantProducts, TenantWithdrawals,
  TenantIncomeReports, TenantIncomePlan, TenantKYC, TenantSupport,
  TenantAnnouncements, TenantSettings,
} from './components/tenant/Pages';

import {
  MemberDashboard, MemberNetwork, MemberIncome, MemberWalletPage,
  MemberBankAccounts, MemberShop, MemberOrders, MemberKYC,
  MemberNotifications, MemberSupport, MemberProfile,
} from './components/member/Pages';

// Redirect logged-in users to their dashboard; guests stay on the portal page
const RootRoute = () => {
  const { token, role } = useAuthStore();
  if (!token) return <PortalLanding />;
  if (role === 'superadmin') return <Navigate to="/superadmin/dashboard" replace />;
  if (role === 'tenant')     return <Navigate to="/tenant/dashboard"     replace />;
  if (role === 'member')     return <Navigate to="/member/dashboard"     replace />;
  return <PortalLanding />;
};

// Redirect auth pages if already logged in
const GuestRoute = ({ children, defaultRedirect }) => {
  const { token, role } = useAuthStore();
  if (!token) return children;
  if (role === 'superadmin') return <Navigate to="/superadmin/dashboard" replace />;
  if (role === 'tenant')     return <Navigate to="/tenant/dashboard"     replace />;
  if (role === 'member')     return <Navigate to="/member/dashboard"     replace />;
  return children;
};

// Protect dashboard routes — unauthenticated go to portal, wrong role goes to portal
const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, role } = useAuthStore();
  if (!token) return <Navigate to="/" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      {/* Portal — shows role-selection landing or redirects logged-in users */}
      <Route path="/" element={<RootRoute />} />

      {/* ── Auth (redirect away if already logged in) ─────── */}
      <Route path="/superadmin/login"  element={<GuestRoute><SuperAdminLogin /></GuestRoute>} />
      <Route path="/tenant/login"      element={<GuestRoute><TenantLogin /></GuestRoute>} />
      <Route path="/tenant/register"   element={<GuestRoute><TenantRegister /></GuestRoute>} />
      <Route path="/member/login"      element={<GuestRoute><MemberLogin /></GuestRoute>} />
      <Route path="/member/register"   element={<GuestRoute><MemberRegister /></GuestRoute>} />

      {/* ── Super Admin ───────────────────────────────────── */}
      <Route path="/superadmin" element={
        <ProtectedRoute requiredRole="superadmin"><Layout /></ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"    element={<SADashboard />} />
        <Route path="tenants"      element={<SATenants />} />
        <Route path="income-plans" element={<SAIncomePlans />} />
        <Route path="stats"        element={<SADashboard />} />
      </Route>

      {/* ── Tenant ───────────────────────────────────────── */}
      <Route path="/tenant" element={
        <ProtectedRoute requiredRole="tenant"><Layout /></ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"      element={<TenantDashboard />} />
        <Route path="members"        element={<TenantMembers />} />
        <Route path="products"       element={<TenantProducts />} />
        <Route path="orders"         element={<TenantWithdrawals />} />
        <Route path="withdrawals"    element={<TenantWithdrawals />} />
        <Route path="income-reports" element={<TenantIncomeReports />} />
        <Route path="income-plan"    element={<TenantIncomePlan />} />
        <Route path="kyc"            element={<TenantKYC />} />
        <Route path="support"        element={<TenantSupport />} />
        <Route path="announcements"  element={<TenantAnnouncements />} />
        <Route path="settings"       element={<TenantSettings />} />
        <Route path="branding"       element={<TenantSettings />} />
      </Route>

      {/* ── Member ───────────────────────────────────────── */}
      <Route path="/member" element={
        <ProtectedRoute requiredRole="member"><Layout /></ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<MemberDashboard />} />
        <Route path="network"       element={<MemberNetwork />} />
        <Route path="income"        element={<MemberIncome />} />
        <Route path="wallet"        element={<MemberWalletPage />} />
        <Route path="bank-accounts" element={<MemberBankAccounts />} />
        <Route path="shop"          element={<MemberShop />} />
        <Route path="orders"        element={<MemberOrders />} />
        <Route path="kyc"           element={<MemberKYC />} />
        <Route path="notifications" element={<MemberNotifications />} />
        <Route path="support"       element={<MemberSupport />} />
        <Route path="profile"       element={<MemberProfile />} />
      </Route>

      {/* 404 → back to portal */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
