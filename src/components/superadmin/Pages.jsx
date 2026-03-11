import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saApi } from '../../services/api';
import { StatCard, Table, Badge, Modal, PageLoader, ErrorState, Pagination, FormField, Select } from '../ui';
import { fmt, getErrMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Users, Building2, DollarSign, UserCheck, Plus, Edit2, Trash2, Eye, CheckCircle, XCircle, Layers, BarChart3 } from 'lucide-react';

// ── Dashboard ─────────────────────────────────────────────────
export const SADashboard = () => {
  const { data, isLoading } = useQuery({ queryKey: ['sa-dashboard'], queryFn: () => saApi.getDashboard().then(r=>r.data.data) });
  if (isLoading) return <PageLoader />;
  const s = data?.stats;
  return (
    <div>
      <div className="page-header"><h1 className="page-title">Platform Dashboard</h1></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Building2} label="Total Tenants" value={fmt.num(s?.total)} color="brand" />
        <StatCard icon={UserCheck} label="Active Tenants" value={fmt.num(s?.active)} color="emerald" />
        <StatCard icon={Users} label="Pending Approval" value={fmt.num(s?.pending)} color="amber" />
        <StatCard icon={DollarSign} label="Total Members" value={fmt.num(s?.totalMembers)} color="violet" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header"><h2 className="font-semibold text-sm">Recent Tenants</h2></div>
          <Table columns={[
            { label:'Business', key:'businessName' },
            { label:'Subdomain', key:'subdomain' },
            { label:'Status', key:'status', render:(v)=><Badge status={v}>{v}</Badge> },
            { label:'Joined', key:'createdAt', render:(v)=>fmt.date(v) },
          ]} data={data?.recentTenants||[]} />
        </div>
        <div className="card">
          <div className="card-header"><h2 className="font-semibold text-sm">Recent Members</h2></div>
          <Table columns={[
            { label:'Name', key:'fullName' },
            { label:'ID', key:'memberId' },
            { label:'Rank', key:'rank' },
            { label:'Status', key:'status', render:(v)=><Badge status={v}>{v}</Badge> },
          ]} data={data?.recentMembers||[]} />
        </div>
      </div>
    </div>
  );
};

// ── Tenants ───────────────────────────────────────────────────
export const SATenants = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['sa-tenants', page, statusFilter],
    queryFn: () => saApi.getTenants({ page, status: statusFilter || undefined }).then(r=>r.data),
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => saApi.updateTenantStatus(id, { status }),
    onSuccess: () => { qc.invalidateQueries(['sa-tenants']); toast.success('Status updated'); },
    onError: (e) => toast.error(getErrMsg(e)),
  });

  const columns = [
    { label:'Business', key:'businessName', render:(v,row)=><div><p className="font-medium text-sm">{v}</p><p className="text-xs text-slate-400">{row.subdomain}</p></div> },
    { label:'Owner', key:'ownerName' },
    { label:'Email', key:'email' },
    { label:'Plan', key:'subscription', render:(v)=><span className="capitalize text-xs font-medium">{v}</span> },
    { label:'Members', key:'memberCount', render:(v)=>fmt.num(v) },
    { label:'Status', key:'status', render:(v)=><Badge status={v}>{v}</Badge> },
    { label:'Joined', key:'createdAt', render:(v)=>fmt.date(v) },
    { label:'Actions', key:'id', render:(_, row) => (
      <div className="flex gap-2">
        {row.status === 'pending' && <button onClick={()=>statusMutation.mutate({id:row.id,status:'active'})} className="btn-primary !py-1 !px-2 text-xs"><CheckCircle size={12}/> Approve</button>}
        {row.status === 'active' && <button onClick={()=>statusMutation.mutate({id:row.id,status:'suspended'})} className="btn-danger !py-1 !px-2 text-xs">Suspend</button>}
        {row.status === 'suspended' && <button onClick={()=>statusMutation.mutate({id:row.id,status:'active'})} className="btn-primary !py-1 !px-2 text-xs">Restore</button>}
      </div>
    )},
  ];

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div><h1 className="page-title">Tenants</h1><p className="page-subtitle">Manage all business owners</p></div>
        <Select value={statusFilter} onChange={setStatusFilter} className="!w-40"
          options={[{value:'',label:'All Status'},{value:'active',label:'Active'},{value:'pending',label:'Pending'},{value:'suspended',label:'Suspended'}]} />
      </div>
      <div className="card">
        <Table columns={columns} data={data?.data||[]} loading={isLoading} />
        {data?.pagination && <Pagination current={page} total={data.pagination.total} pages={data.pagination.pages} onChange={setPage} />}
      </div>
    </div>
  );
};

// ── Income Plans ──────────────────────────────────────────────
const defaultPlan = { name:'', description:'', networkType:'unilevel', directBonusEnabled:true, directBonusType:'percentage', directBonusValue:10, roiEnabled:false, roiPercentage:0, maxDepth:7, levels:[] };

export const SAIncomePlans = () => {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // null | 'create' | plan object
  const [form, setForm] = useState(defaultPlan);
  const [levels, setLevels] = useState([]);
  const { data, isLoading } = useQuery({ queryKey:['sa-income-plans'], queryFn:()=>saApi.getIncomePlans().then(r=>r.data.data) });

  const saveMutation = useMutation({
    mutationFn: (d) => modal?.id ? saApi.updateIncomePlan(modal.id, d) : saApi.createIncomePlan(d),
    onSuccess: () => { qc.invalidateQueries(['sa-income-plans']); setModal(null); toast.success('Plan saved'); },
    onError: (e) => toast.error(getErrMsg(e)),
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => saApi.deleteIncomePlan(id),
    onSuccess: () => { qc.invalidateQueries(['sa-income-plans']); toast.success('Plan deleted'); },
    onError: (e) => toast.error(getErrMsg(e)),
  });

  const openCreate = () => { setForm(defaultPlan); setLevels([{level:1,label:'Level 1',percentage:10,type:'percentage'}]); setModal('create'); };
  const openEdit = (plan) => {
    setForm(plan);
    setLevels(plan.levels || []);
    setModal(plan);
  };

  const addLevel = () => setLevels(ls => [...ls, { level: ls.length+1, label:`Level ${ls.length+1}`, percentage:1, type:'percentage' }]);
  const removeLevel = (i) => setLevels(ls => ls.filter((_,j)=>j!==i));
  const updateLevel = (i, field, val) => setLevels(ls => ls.map((l,j)=>j===i?{...l,[field]:val}:l));

  const handleSave = () => saveMutation.mutate({ ...form, levels });

  const cols = [
    { label:'Name', key:'name', render:(v,row)=><div><p className="font-medium text-sm">{v}</p><p className="text-xs text-slate-400 capitalize">{row.networkType}</p></div> },
    { label:'Direct Bonus', key:'directBonusValue', render:(v,row)=>row.directBonusEnabled?`${v}%`:'—' },
    { label:'ROI', key:'roiPercentage', render:(v,row)=>row.roiEnabled?`${v}% (${row.roiFrequency})`:'—' },
    { label:'Levels', key:'levels', render:(v)=>v?.length||0 },
    { label:'Max Depth', key:'maxDepth' },
    { label:'Status', key:'isActive', render:(v)=><Badge status={v?'active':'inactive'}>{v?'Active':'Inactive'}</Badge> },
    { label:'Actions', key:'id', render:(_,row)=>(
      <div className="flex gap-2">
        <button onClick={()=>openEdit(row)} className="btn-secondary !py-1 !px-2 text-xs"><Edit2 size={12}/></button>
        <button onClick={()=>{ if(confirm('Delete?')) deleteMutation.mutate(row.id) }} className="btn-danger !py-1 !px-2 text-xs"><Trash2 size={12}/></button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div><h1 className="page-title">Income Plan Templates</h1><p className="page-subtitle">Create commission structures for tenants to choose from</p></div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16}/> New Plan</button>
      </div>
      <div className="card">
        <Table columns={cols} data={data||[]} loading={isLoading} emptyMsg="No plan templates. Create one to get started." />
      </div>

      <Modal open={!!modal} onClose={()=>setModal(null)} title={modal?.id ? 'Edit Income Plan' : 'Create Income Plan'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Plan Name" required>
              <input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Binary 7-Level" />
            </FormField>
            <FormField label="Network Type">
              <Select value={form.networkType} onChange={v=>setForm({...form,networkType:v})}
                options={[{value:'binary',label:'Binary'},{value:'unilevel',label:'Unilevel'},{value:'matrix',label:'Matrix'},{value:'hybrid',label:'Hybrid'}]} />
            </FormField>
          </div>
          <FormField label="Description">
            <textarea className="input" rows={2} value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} />
          </FormField>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Direct Bonus %">
              <input type="number" className="input" value={form.directBonusValue} onChange={e=>setForm({...form,directBonusValue:e.target.value})} />
            </FormField>
            <FormField label="Max Tree Depth">
              <input type="number" className="input" value={form.maxDepth} onChange={e=>setForm({...form,maxDepth:e.target.value})} />
            </FormField>
            <FormField label="ROI %">
              <input type="number" className="input" value={form.roiPercentage} onChange={e=>setForm({...form,roiPercentage:e.target.value,roiEnabled:e.target.value>0})} step="0.1" />
            </FormField>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="label mb-0">Commission Levels</p>
              <button onClick={addLevel} className="btn-secondary !py-1 !px-2 text-xs"><Plus size={12}/> Add Level</button>
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {levels.map((l, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-xs text-slate-500 w-6">L{l.level}</span>
                  <input className="input !py-1 text-xs flex-1" placeholder="Label" value={l.label||''} onChange={e=>updateLevel(i,'label',e.target.value)} />
                  <input type="number" className="input !py-1 text-xs w-20" placeholder="%" value={l.percentage} onChange={e=>updateLevel(i,'percentage',e.target.value)} step="0.1" />
                  <span className="text-xs text-slate-400">%</span>
                  <button onClick={()=>removeLevel(i)} className="text-red-400 hover:text-red-600"><Trash2 size={12}/></button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={()=>setModal(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saveMutation.isPending || !form.name} className="btn-primary">
              {saveMutation.isPending ? 'Saving…' : 'Save Plan'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
