import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout';

// Auth pages
import {
  SuperAdminLogin, TenantLogin, TenantRegister, MemberLogin, MemberRegister,
} from './components/auth/LoginPages';

// SuperAdmin pages
import { SADashboard, SATenants, SAIncomePlans } from './components/superadmin/Pages';

// Tenant pages
import {
  TenantDashboard, TenantMembers, TenantProducts, TenantWithdrawals,
  TenantIncomeReports, TenantIncomePlan, TenantKYC, TenantSupport,
  TenantAnnouncements, TenantSettings,
} from './components/tenant/Pages';

// Member pages
import {
  MemberDashboard, MemberNetwork, MemberIncome, MemberWalletPage,
  MemberBankAccounts, MemberShop, MemberOrders, MemberKYC,
  MemberNotifications, MemberSupport, MemberProfile,
} from './components/member/Pages';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, role } = useAuthStore();
  if (!token) return <Navigate to="/" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;
  return children;
};

const RootRedirect = () => {
  const { token, role } = useAuthStore();
  if (!token) return <Navigate to="/superadmin/login" replace />;
  if (role === 'superadmin') return <Navigate to="/superadmin/dashboard" replace />;
  if (role === 'tenant') return <Navigate to="/tenant/dashboard" replace />;
  if (role === 'member') return <Navigate to="/member/dashboard" replace />;
  return <Navigate to="/superadmin/login" replace />;
};

export default function App() {
  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<RootRedirect />} />

      {/* Auth */}
      <Route path="/superadmin/login" element={<SuperAdminLogin />} />
      <Route path="/tenant/login"     element={<TenantLogin />} />
      <Route path="/tenant/register"  element={<TenantRegister />} />
      <Route path="/member/login"     element={<MemberLogin />} />
      <Route path="/member/register"  element={<MemberRegister />} />

      {/* SuperAdmin */}
      <Route path="/superadmin" element={<ProtectedRoute requiredRole="superadmin"><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"    element={<SADashboard />} />
        <Route path="tenants"      element={<SATenants />} />
        <Route path="income-plans" element={<SAIncomePlans />} />
        <Route path="stats"        element={<SADashboard />} />
      </Route>

      {/* Tenant */}
      <Route path="/tenant" element={<ProtectedRoute requiredRole="tenant"><Layout /></ProtectedRoute>}>
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

      {/* Member */}
      <Route path="/member" element={<ProtectedRoute requiredRole="member"><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"    element={<MemberDashboard />} />
        <Route path="network"      element={<MemberNetwork />} />
        <Route path="income"       element={<MemberIncome />} />
        <Route path="wallet"       element={<MemberWalletPage />} />
        <Route path="bank-accounts" element={<MemberBankAccounts />} />
        <Route path="shop"         element={<MemberShop />} />
        <Route path="orders"       element={<MemberOrders />} />
        <Route path="kyc"          element={<MemberKYC />} />
        <Route path="notifications" element={<MemberNotifications />} />
        <Route path="support"      element={<MemberSupport />} />
        <Route path="profile"      element={<MemberProfile />} />
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
