import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, Users, DollarSign, Package, ShoppingCart, Settings,
  LogOut, Menu, X, Bell, Building2, BarChart3, Layers,
  Wallet, CreditCard, Network, FileText, User, FileCheck,
  Megaphone, Ticket, ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { memberApi } from '../../services/api';

const navConfig = {
  superadmin: [
    { label: 'Dashboard',     path: '/superadmin/dashboard',    icon: LayoutDashboard },
    { label: 'Tenants',       path: '/superadmin/tenants',       icon: Building2 },
    { label: 'Income Plans',  path: '/superadmin/income-plans',  icon: Layers },
    { label: 'Platform Stats',path: '/superadmin/stats',         icon: BarChart3 },
  ],
  tenant: [
    { label: 'Dashboard',       path: '/tenant/dashboard',        icon: LayoutDashboard },
    { label: 'Members',         path: '/tenant/members',          icon: Users },
    { label: 'Products',        path: '/tenant/products',         icon: Package },
    { label: 'Orders',          path: '/tenant/orders',           icon: ShoppingCart },
    { label: 'Withdrawals',     path: '/tenant/withdrawals',      icon: Wallet },
    { label: 'Income Reports',  path: '/tenant/income-reports',   icon: BarChart3 },
    { label: 'Income Plan',     path: '/tenant/income-plan',      icon: Layers },
    { label: 'KYC Review',      path: '/tenant/kyc',              icon: FileCheck },
    { label: 'Support Tickets', path: '/tenant/support',          icon: Ticket },
    { label: 'Announcements',   path: '/tenant/announcements',    icon: Megaphone },
    { label: 'Settings',        path: '/tenant/settings',         icon: Settings },
  ],
  member: [
    { label: 'Dashboard',     path: '/member/dashboard',        icon: LayoutDashboard },
    { label: 'My Network',    path: '/member/network',          icon: Network },
    { label: 'Income Ledger', path: '/member/income',           icon: DollarSign },
    { label: 'Shop',          path: '/member/shop',             icon: ShoppingCart },
    { label: 'My Orders',     path: '/member/orders',           icon: FileText },
    { label: 'Wallet',        path: '/member/wallet',           icon: Wallet },
    { label: 'Bank Accounts', path: '/member/bank-accounts',    icon: CreditCard },
    { label: 'KYC',           path: '/member/kyc',              icon: FileCheck },
    { label: 'Notifications', path: '/member/notifications',    icon: Bell },
    { label: 'Support',       path: '/member/support',          icon: Ticket },
    { label: 'Profile',       path: '/member/profile',          icon: User },
  ],
};

export default function Layout() {
  const { user, role, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navItems = navConfig[role] || [];
  const handleLogout = () => { logout(); navigate('/'); };

  const userName = user?.name || user?.ownerName || user?.fullName || 'User';

  return (
    <div className="flex h-screen overflow-hidden bg-surface-secondary">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} flex-shrink-0 bg-white border-r border-surface-border flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className={`flex items-center ${sidebarOpen ? 'justify-between px-4' : 'justify-center'} h-16 border-b border-surface-border flex-shrink-0`}>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center shadow-sm">
                <Layers size={15} className="text-white" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm leading-none">MLM Platform</span>
                <p className="text-[10px] text-slate-400 capitalize leading-none mt-0.5">{role}</p>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-surface-secondary transition-colors">
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {navItems.map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path} title={!sidebarOpen ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                 ${isActive
                   ? 'bg-brand-50 text-brand-700'
                   : 'text-slate-600 hover:text-slate-900 hover:bg-surface-secondary'
                 } ${!sidebarOpen ? 'justify-center' : ''}`
              }>
              <Icon size={16} className="flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-2 border-t border-surface-border flex-shrink-0">
          <div className={`flex items-center gap-3 px-2 py-2 rounded-lg ${!sidebarOpen ? 'justify-center' : ''}`}>
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-brand-700">{userName[0].toUpperCase()}</span>
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 truncate">{userName}</p>
                <p className="text-[10px] text-slate-400 capitalize">{role}</p>
              </div>
            )}
          </div>
          <button onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors ${!sidebarOpen ? 'justify-center' : ''}`}
            title={!sidebarOpen ? 'Logout' : undefined}>
            <LogOut size={16} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-surface-border flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <ChevronRight size={14} />
            <span className="capitalize text-slate-600 font-medium">{role}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{userName}</span>
            <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center">
              <span className="text-xs font-bold text-brand-600">{userName[0].toUpperCase()}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
