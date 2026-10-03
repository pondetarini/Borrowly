import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Repeat,
  PlusCircle,
  Package,
  Clock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Star,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { itemAPI, requestAPI, transactionAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import Modal from '../components/Modal';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [listedItems, setListedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Return modal state
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [reqRes, txnRes, itemRes] = await Promise.all([
        requestAPI.getMyRequests(),
        transactionAPI.getMyTransactions('borrower'),
        itemAPI.getAll({ ownerId: user?.id, status: 'all' })
      ]);

      if (reqRes.data?.success) setRequests(reqRes.data.data);
      if (txnRes.data?.success) setTransactions(txnRes.data.data);
      if (itemRes.data?.success) setListedItems(itemRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInitiateReturn = async () => {
    if (!selectedTxn) return;
    try {
      setActionLoading(true);
      await transactionAPI.initiateReturn(selectedTxn.id);
      setActionSuccess('Return request submitted! The owner has been notified to inspect and confirm receipt.');
      setTimeout(() => {
        setReturnModalOpen(false);
        setActionSuccess('');
        loadData();
      }, 1500);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const activeLoans = transactions.filter(t => ['ACTIVE', 'APPROVED', 'OVERDUE'].includes(t.status));
  const completedLoans = transactions.filter(t => t.status === 'COMPLETED');
  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (loading) return <Loader text="Loading your dashboard..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="avatar-image h-16 w-16" />
          ) : (
            <span className="avatar-initials h-16 w-16 text-xl">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                {greeting}, {user?.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              {user?.location && <span>{user.location}</span>}
              {user?.location && user?.reputation?.rating && <span>•</span>}
              {user?.reputation?.rating && (
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  {user.reputation.rating} Community Rating
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Link
            to="/ai-search"
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            AI Item Search
          </Link>
          <Link
            to="/items/new"
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            List an Item
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Borrowings</span>
            <Repeat className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{activeLoans.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Items in your possession</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{pendingRequests.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Awaiting owner approval</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>My Listed Items</span>
            <PlusCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">{listedItems.length}</div>
          <Link to="/owner/requests" className="text-[11px] text-slate-500 mt-1 inline-block hover:text-emerald-700">Manage your listings</Link>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Completed Loans</span>
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{completedLoans.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Successfully returned</div>
        </div>
      </div>

      {/* Active Borrowing Cards Section (FR8) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            Currently Borrowed Items
          </h2>
          <span className="text-xs text-slate-400">{activeLoans.length} active</span>
        </div>

        {activeLoans.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-3">
            <p className="text-sm text-slate-400">You don't have any items currently checked out.</p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 text-xs font-semibold hover:bg-emerald-600/30 transition-colors"
            >
              Browse items in your neighborhood <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLoans.map(loan => (
              <div
                key={loan.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{loan.itemTitle}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Lender: <span className="text-slate-300 font-medium">{loan.ownerName}</span>
                    </p>
                  </div>
                  <StatusBadge status={loan.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950/60 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Loan Dates:</span>
                    <span>{loan.startDate} → {loan.endDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Security Deposit:</span>
                    <span className="text-emerald-400 font-semibold">${loan.depositHeld} (Held safe)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Link
                    to={`/items/${loan.itemId}`}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    Item Page <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  {loan.status === 'ACTIVE' || loan.status === 'OVERDUE' ? (
                    <button
                      onClick={() => {
                        setSelectedTxn(loan);
                        setReturnModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Initiate Return
                    </button>
                  ) : loan.status === 'RETURN_REQUESTED' ? (
                    <span className="text-xs text-purple-300 font-medium italic">
                      Return initiated — awaiting owner verification
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outgoing Requests History Table (FR6 & FR8) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Your Borrow Requests
          </h2>
          <Link to="/requests" className="text-xs text-emerald-400 hover:underline">
            View full history
          </Link>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Item</th>
                  <th className="py-3.5 px-4">Owner</th>
                  <th className="py-3.5 px-4">Requested Dates</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No requests made yet.
                    </td>
                  </tr>
                ) : (
                  requests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {req.itemTitle}
                      </td>
                      <td className="py-3.5 px-4">{req.ownerName}</td>
                      <td className="py-3.5 px-4">{req.startDate} to {req.endDate}</td>
                      <td className="py-3.5 px-4">{req.durationDays} day(s)</td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize">{req.type}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={req.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Initiate Return (FR8) */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title="Initiate Item Return"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Ready to return <strong className="text-white">{selectedTxn?.itemTitle}</strong> to{' '}
            <strong className="text-white">{selectedTxn?.ownerName}</strong>?
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Security Deposit:</span>
              <span className="text-emerald-400 font-bold">${selectedTxn?.depositHeld}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Upon physical handover and owner confirmation, your deposit will be released in full.
            </div>
          </div>

          {actionSuccess ? (
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold text-center">
              {actionSuccess}
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReturnModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInitiateReturn}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
              >
                {actionLoading ? 'Submitting...' : 'Confirm Return Handover'}
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default DashboardPage;
