import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({ baseURL: '/api/v1', timeout: 30000 });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use((r) => r, (err) => {
  if (err.response?.status === 401 && err.response?.data?.code === 'TOKEN_EXPIRED')
    useAuthStore.getState().logout();
  return Promise.reject(err);
});

export const saApi = {
  login: (d) => api.post('/auth/superadmin/login', d),
  getDashboard: () => api.get('/superadmin/dashboard'),
  getStats: () => api.get('/superadmin/stats'),
  getTenants: (p) => api.get('/superadmin/tenants', { params: p }),
  getTenant: (id) => api.get(`/superadmin/tenants/${id}`),
  updateTenantStatus: (id, d) => api.patch(`/superadmin/tenants/${id}/status`, d),
  getIncomePlans: () => api.get('/superadmin/income-plans'),
  getIncomePlan: (id) => api.get(`/superadmin/income-plans/${id}`),
  createIncomePlan: (d) => api.post('/superadmin/income-plans', d),
  updateIncomePlan: (id, d) => api.put(`/superadmin/income-plans/${id}`, d),
  deleteIncomePlan: (id) => api.delete(`/superadmin/income-plans/${id}`),
};

export const tenantApi = {
  register: (d) => api.post('/auth/tenant/register', d),
  login: (d) => api.post('/auth/tenant/login', d),
  getProfile: () => api.get('/tenant/profile'),
  getDashboard: () => api.get('/tenant/dashboard'),
  updateBranding: (d) => api.put('/tenant/branding', d),
  updateSettings: (d) => api.put('/tenant/settings', d),
  getMembers: (p) => api.get('/tenant/members', { params: p }),
  getMember: (id) => api.get(`/tenant/members/${id}`),
  updateMemberStatus: (id, d) => api.patch(`/tenant/members/${id}/status`, d),
  getMemberTree: (id) => api.get(`/tenant/members/${id}/tree`),
  getWithdrawals: (p) => api.get('/tenant/withdrawals', { params: p }),
  processWithdrawal: (id, d) => api.patch(`/tenant/withdrawals/${id}`, d),
  getIncomeReports: (p) => api.get('/tenant/income/reports', { params: p }),
  // ✅ FIX: Tenant fetches templates via their own authenticated endpoint
  getPlanTemplates: () => api.get('/tenant/income/plan-templates'),
  selectIncomePlan: (d) => api.post('/tenant/income/select-plan', d),
  distributeIncome: () => api.post('/tenant/income/distribute'),
  getProducts: (p) => api.get('/tenant/products', { params: p }),
  createProduct: (d) => api.post('/tenant/products', d),
  updateProduct: (id, d) => api.put(`/tenant/products/${id}`, d),
  deleteProduct: (id) => api.delete(`/tenant/products/${id}`),
  getOrders: (p) => api.get('/tenant/orders', { params: p }),
};

export const memberApi = {
  register: (d) => api.post('/auth/member/register', d),
  login: (d) => api.post('/auth/member/login', d),
  getProfile: () => api.get('/member/profile'),
  updateProfile: (d) => api.patch('/member/profile', d),
  getDashboard: () => api.get('/member/dashboard'),
  getTree: () => api.get('/member/tree'),
  getTransactions: (p) => api.get('/member/transactions', { params: p }),
  requestWithdrawal: (d) => api.post('/member/withdrawal', d),
  getWithdrawals: () => api.get('/member/withdrawals'),
  getBankAccounts: () => api.get('/member/bank-accounts'),
  addBankAccount: (d) => api.post('/member/bank-accounts', d),
  deleteBankAccount: (id) => api.delete(`/member/bank-accounts/${id}`),
  getNotifications: (p) => api.get('/member/notifications', { params: p }),
  markNotificationsRead: () => api.post('/member/notifications/read-all'),
  getProducts: (p) => api.get('/member/products', { params: p }),
  purchase: (d) => api.post('/member/purchase', d),
  getOrders: (p) => api.get('/member/orders', { params: p }),
  getKYCDocs: () => api.get('/member/kyc'),
  submitKYC: (d) => api.post('/member/kyc', d),
  getTickets: () => api.get('/member/support'),
  createTicket: (d) => api.post('/member/support', d),
  getAnnouncements: () => api.get('/member/announcements'),
};

export const publicApi = {
  getTenantInfo: (subdomain) => api.get(`/public/tenant/${subdomain}`),
};

export default api;

// Additional convenience methods used by TenantKYC, TenantSupport, TenantAnnouncements pages
// These avoid raw fetch calls in those pages
export const getAuthToken = () => {
  try {
    return JSON.parse(localStorage.getItem('mlm-auth') || '{}')?.state?.token || '';
  } catch { return ''; }
};

export const authFetch = (url, options = {}) =>
  fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
      ...(options.headers || {}),
    },
  }).then(r => r.json());

// Extend tenantApi dynamically to avoid code duplication in pages
// These are imported and used in tenant pages
export const tenantExtApi = {
  getKYCList: (params) => api.get('/tenant/kyc', { params }),
  reviewKYC: (id, d) => api.patch(`/tenant/kyc/${id}/review`, d),
  getSupportTickets: (params) => api.get('/tenant/support', { params }),
  replyTicket: (id, d) => api.patch(`/tenant/support/${id}/reply`, d),
  getAnnouncements: () => api.get('/tenant/announcements'),
  createAnnouncement: (d) => api.post('/tenant/announcements', d),
  updateAnnouncement: (id, d) => api.put(`/tenant/announcements/${id}`, d),
  deleteAnnouncement: (id) => api.delete(`/tenant/announcements/${id}`),
};
