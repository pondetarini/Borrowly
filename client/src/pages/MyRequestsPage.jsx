import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCcw,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';
import { requestAPI, transactionAPI, reviewAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import Modal from '../components/Modal';

export const MyRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Return modal
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [returnLoading, setReturnLoading] = useState(false);

  // Review modal (FR9)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [reqRes, txnRes] = await Promise.all([
        requestAPI.getMyRequests(),
        transactionAPI.getMyTransactions('borrower')
      ]);
      if (reqRes.data?.success) setRequests(reqRes.data.data);
      if (txnRes.data?.success) setTransactions(txnRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReturnInitiate = async () => {
    if (!selectedTxn) return;
    try {
      setReturnLoading(true);
      await transactionAPI.initiateReturn(selectedTxn.id);
      setReturnModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setReturnLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTxn) return;
    setReviewError('');
    setReviewLoading(true);

    try {
      await reviewAPI.create({
        transactionId: selectedTxn.id,
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewSuccess('Review submitted! Reputation score updated.');
      setTimeout(() => {
        setReviewModalOpen(false);
        setReviewSuccess('');
        setReviewComment('');
        loadData();
      }, 1500);
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <Loader text="Loading your loan history..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          My Borrowing History & Active Loans
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Track return deadlines, deposit statuses, and rate verified lenders.
        </p>
      </div>

      {/* Active & Past Transactions (FR8) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Active & Past Loan Records
        </h2>

        {transactions.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
            No transactions found. Once an owner approves your request, your active transaction appears here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transactions.map((txn) => (
              <div
                key={txn.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{txn.itemTitle}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Lender: {txn.ownerName}</p>
                  </div>
                  <StatusBadge status={txn.status} />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Period:</span>
                    <span>{txn.startDate} to {txn.endDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Deposit Held:</span>
                    <span className="text-emerald-400 font-bold">${txn.depositHeld}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Link
                    to={`/items/${txn.itemId}`}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    View Item <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex items-center gap-2">
                    {['ACTIVE', 'OVERDUE'].includes(txn.status) && (
                      <button
                        onClick={() => {
                          setSelectedTxn(txn);
                          setReturnModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Initiate Return
                      </button>
                    )}

                    {txn.status === 'COMPLETED' && (
                      <button
                        onClick={() => {
                          setSelectedTxn(txn);
                          setReviewModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        Leave Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outgoing Requests Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">
          All Outgoing Borrow Requests
        </h2>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Item</th>
                  <th className="py-3.5 px-4">Lender</th>
                  <th className="py-3.5 px-4">Dates</th>
                  <th className="py-3.5 px-4">Fee / Deposit</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No requests sent yet.
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">{r.itemTitle}</td>
                      <td className="py-3.5 px-4">{r.ownerName}</td>
                      <td className="py-3.5 px-4">{r.startDate} to {r.endDate} ({r.durationDays}d)</td>
                      <td className="py-3.5 px-4">${r.totalCost} / ${r.deposit}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 italic truncate max-w-[200px]">
                        {r.message || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Initiate Return */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title="Initiate Return Handover"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Confirm that you are returning <strong className="text-white">{selectedTxn?.itemTitle}</strong> to lender{' '}
            <strong className="text-white">{selectedTxn?.ownerName}</strong>.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400">Security Deposit:</span>
            <div className="text-emerald-400 font-bold text-sm">${selectedTxn?.depositHeld}</div>
            <p className="text-[11px] text-slate-500 pt-1">
              Once the owner confirms receipt, the deposit will be immediately released.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setReturnModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReturnInitiate}
              disabled={returnLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
            >
              {returnLoading ? 'Processing...' : 'Confirm Return'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Leave a Review (FR9) */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Leave a Review for Lender"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs text-amber-400 font-bold ml-2">{reviewRating} Star(s)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Feedback on item condition and owner communication
            </label>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="e.g. Great tool, owner was super communicative and flexible..."
              required
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500"
            />
          </div>

          {reviewError && (
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{reviewError}</span>
            </div>
          )}

          {reviewSuccess ? (
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold text-center">
              {reviewSuccess}
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reviewLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
              >
                {reviewLoading ? 'Submitting...' : 'Post Review'}
              </button>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default MyRequestsPage;
