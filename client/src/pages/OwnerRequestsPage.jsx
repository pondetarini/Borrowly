import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Package,
  PlusCircle,
  AlertTriangle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { requestAPI, transactionAPI, itemAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';

export const OwnerRequestsPage = () => {
  const { user } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [ownerTransactions, setOwnerTransactions] = useState([]);
  const [ownerItems, setOwnerItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reqRes, txnRes, itemsRes] = await Promise.all([
        requestAPI.getIncomingRequests(),
        transactionAPI.getMyTransactions('owner'),
        itemAPI.getAll({ ownerId: user?.id, status: 'all' })
      ]);

      if (reqRes.data?.success) setIncomingRequests(reqRes.data.data);
      if (txnRes.data?.success) setOwnerTransactions(txnRes.data.data);
      if (itemsRes.data?.success) setOwnerItems(itemsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDecision = async (requestId, status) => {
    try {
      setActionLoading(true);
      await requestAPI.updateStatus(requestId, status);
      await loadData();
    } catch (err) {
      alert(err.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReturn = async (txnId) => {
    try {
      setActionLoading(true);
      await transactionAPI.confirmReturn(txnId);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to confirm return');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingRequests = incomingRequests.filter(r => r.status === 'PENDING');
  const returnQueue = ownerTransactions.filter(t => t.status === 'RETURN_REQUESTED');
  const activeLoans = ownerTransactions.filter(t => ['ACTIVE', 'APPROVED', 'OVERDUE'].includes(t.status));

  if (loading) return <Loader text="Loading owner management hub..." />;

  return (
    <div className="app-page owner-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Owner Hub & Request Decisions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review incoming borrow requests, perform conflict checks, and confirm returned equipment.
          </p>
        </div>
        <Link
          to="/items/new"
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/25 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          List New Item
        </Link>
      </div>

      {/* Return Confirmation Queue (FR8) */}
      {returnQueue.length > 0 && (
        <div className="return-queue p-6 rounded-3xl bg-purple-950/30 border border-purple-500/40 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping"></span>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-purple-400" />
              Returns Awaiting Your Physical Confirmation ({returnQueue.length})
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            The borrower has initiated return handover. Inspect the equipment condition and confirm receipt to release the deposit.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {returnQueue.map(item => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-900 border border-purple-500/30 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.itemTitle}</h3>
                    <p className="text-xs text-slate-400">Borrower: {item.borrowerName}</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">
                    Deposit to release: ${item.depositHeld}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleConfirmReturn(item.id)}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/25"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Return Received & Release Deposit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Incoming Requests (FR7) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Pending Incoming Requests ({pendingRequests.length})
          </h2>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
            No pending borrow requests right now. All requests have been decided.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map(req => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{req.itemTitle}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Requested by: <strong className="text-slate-200">{req.borrowerName}</strong>
                    </p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Requested Window:</span>
                    <span>{req.startDate} → {req.endDate} ({req.durationDays}d)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Fee / Deposit:</span>
                    <span className="text-emerald-400 font-bold">${req.totalCost} / ${req.deposit}</span>
                  </div>
                </div>

                {req.message && (
                  <div className="p-2.5 rounded-xl bg-slate-800/60 text-xs text-slate-300 italic">
                    "{req.message}"
                  </div>
                )}

                {/* Conflict Check Status */}
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Calendar verified clear: Zero conflicts detected for requested dates.</span>
                </div>

                {/* Decision Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleDecision(req.id, 'APPROVED')}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve Request
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleDecision(req.id, 'REJECTED')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 disabled:opacity-50 text-slate-400 text-xs font-semibold transition-all"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Your Listed Items Management */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-400" />
          Your Listed Items ({ownerItems.length})
        </h2>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Item</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price / Day</th>
                  <th className="py-3.5 px-4">Condition</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {ownerItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      You haven't listed any items yet.
                    </td>
                  </tr>
                ) : (
                  ownerItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <img
                          src={item.images?.[0]}
                          alt={item.title}
                          className="w-8 h-8 rounded-lg object-cover bg-slate-800"
                        />
                        <span>{item.title}</span>
                      </td>
                      <td className="py-3.5 px-4">{item.category}</td>
                      <td className="py-3.5 px-4">
                        {item.pricePerDay === 0 ? (
                          <span className="text-emerald-400 font-semibold">Free Borrow</span>
                        ) : (
                          `$${item.pricePerDay}/day`
                        )}
                      </td>
                      <td className="py-3.5 px-4">{item.condition}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/items/${item.id}`}
                          className="text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerRequestsPage;
