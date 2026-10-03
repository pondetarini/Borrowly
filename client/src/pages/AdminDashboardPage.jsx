import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Package,
  Repeat,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Flag,
  BarChart3,
  TrendingUp,
  Activity,
  UserCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { adminAPI, reportAPI } from '../services/api';
import Loader from '../components/Loader';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [riskFlags, setRiskFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, reportsRes, flagsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        reportAPI.getAll(),
        adminAPI.getRiskFlags()
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (usersRes.data?.success) setUsers(usersRes.data.data);
      if (reportsRes.data?.success) setReports(reportsRes.data.data);
      if (flagsRes.data?.success) setRiskFlags(flagsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update role');
    }
  };

  const handleReportAction = async (reportId, status, adminAction) => {
    try {
      await reportAPI.update(reportId, { status, adminAction });
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update report');
    }
  };

  const handleRiskFlagAction = async (flagId, status, notes) => {
    try {
      await adminAPI.updateRiskFlag(flagId, { status, adminNotes: notes });
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update risk flag');
    }
  };

  const handleRunAiRiskScan = async () => {
    try {
      setScanLoading(true);
      setScanMessage('');
      const res = await adminAPI.runRiskScan();
      setScanMessage(res.data?.message || 'Scan completed.');
      await loadAdminData();
    } catch (err) {
      setScanMessage('Risk scan failed: ' + err.message);
    } finally {
      setScanLoading(false);
    }
  };

  if (loading) return <Loader text="Loading Borrowly Admin & Moderation Console..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            Platform Administration & AI Moderation Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            System Overview & Trust Moderation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor community health, resolve member reports, and inspect AI-assisted risk patterns.
          </p>
        </div>

        {/* AI Scan Trigger Button */}
        <button
          onClick={handleRunAiRiskScan}
          disabled={scanLoading}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/25 transition-all"
        >
          <Sparkles className="w-4 h-4 text-purple-200" />
          <span>{scanLoading ? 'Analyzing Patterns...' : 'Run AI Risk Scan (FR12)'}</span>
        </button>
      </div>

      {scanMessage && (
        <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            {scanMessage}
          </span>
          <button onClick={() => setScanMessage('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Community Members</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{stats?.totalUsers || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Registered & verified</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Catalog Items</span>
            <Package className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{stats?.totalItems || 0}</div>
          <div className="text-[11px] text-emerald-400 mt-1">{stats?.activeListings || 0} active listings</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Borrowings</span>
            <Repeat className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{stats?.activeBorrowings || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Currently in circulation</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pending Moderation Flags</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2">
            {(stats?.pendingReports || 0) + (stats?.pendingRiskFlags || 0)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Requires admin review</div>
        </div>
      </div>

      {/* Analytics Charts with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Listing Distribution by Category
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.categoryStats || []}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Status Breakdown */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Borrowing Status Distribution
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.transactionStatusStats || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(stats?.transactionStatusStats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI-Assisted Risk Flags (FR12) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              AI-Assisted Risk Flags Queue (FR12)
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            {riskFlags.filter(f => f.status === 'PENDING').length} pending review
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs text-slate-300 leading-relaxed">
          <strong className="text-purple-300">Guiding Principle (HLD 1.3):</strong> "AI risk flags advise human admins; they never label a user."
          The AI scans for repeated late returns, unusual cancellation bursts, or rapid borrowing spikes to assist human decision-making.
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Detected Pattern</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {riskFlags.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No risk flags recorded. Community activity is healthy.
                    </td>
                  </tr>
                ) : (
                  riskFlags.map(flag => (
                    <tr key={flag.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {flag.userName}
                        <span className="block text-[11px] text-slate-400 font-normal">{flag.userEmail}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          flag.severity === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                          flag.severity === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        }`}>
                          {flag.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs leading-relaxed">
                        {flag.reason}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                          {flag.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {flag.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => handleRiskFlagAction(flag.id, 'REVIEWED', 'Verified by Admin. Low risk.')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-[11px] font-semibold"
                              >
                                Mark Reviewed
                              </button>
                              <button
                                onClick={() => handleRiskFlagAction(flag.id, 'DISMISSED', 'False positive.')}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px]"
                              >
                                Dismiss
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-500 italic">Decided</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Community Reports Moderation (FR11) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Community Moderation Reports (FR11)
            </h2>
          </div>
          <span className="text-xs text-slate-400">{reports.length} total reports</span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Reporter</th>
                  <th className="py-3.5 px-4">Target</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No member reports found.
                    </td>
                  </tr>
                ) : (
                  reports.map(rep => (
                    <tr key={rep.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">{rep.reporterName}</td>
                      <td className="py-3.5 px-4">{rep.targetTitle || rep.targetId}</td>
                      <td className="py-3.5 px-4 text-amber-400 font-semibold">{rep.reason}</td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-400">{rep.description}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rep.status === 'PENDING' ? 'bg-amber-500/20 text-amber-300' :
                          rep.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {rep.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {rep.status === 'PENDING' ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleReportAction(rep.id, 'RESOLVED', 'Listing verified and owner notified.')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleReportAction(rep.id, 'DISMISSED', 'No violation found.')}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px]"
                            >
                              Dismiss
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Management & RBAC Role Assignment */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          User Roles & Access Control (RBAC)
        </h2>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Member</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Trust Rating</th>
                  <th className="py-3.5 px-4">Current Role</th>
                  <th className="py-3.5 px-4">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full bg-slate-800" />
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{u.email}</td>
                    <td className="py-3.5 px-4">{u.location || '—'}</td>
                    <td className="py-3.5 px-4 text-amber-400 font-semibold">
                      ★ {u.reputation?.rating || 5.0} ({u.reputation?.count || 0})
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-rose-500/20 text-rose-300' :
                        u.role === 'owner' ? 'bg-teal-500/20 text-teal-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="borrower">Borrower</option>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
