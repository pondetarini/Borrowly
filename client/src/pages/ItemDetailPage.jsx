import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  Shield,
  Star,
  Tag,
  AlertCircle,
  Flag,
  Share2,
  CheckCircle2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { itemAPI, requestAPI, reportAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import Modal from '../components/Modal';

export const ItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Request Borrow Modal State
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState('');
  const [requestError, setRequestError] = useState('');

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Inaccurate Details');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const res = await itemAPI.getById(id);
        if (res.data?.success) {
          setItem(res.data.data);
          // Set default start/end dates (tomorrow to +2 days)
          const today = new Date();
          const d1 = new Date(today);
          d1.setDate(today.getDate() + 1);
          const d2 = new Date(today);
          d2.setDate(today.getDate() + 3);

          setStartDate(d1.toISOString().split('T')[0]);
          setEndDate(d2.toISOString().split('T')[0]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load item.');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  // Duration calculation
  const calculateDuration = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 1;
    const diff = Math.abs(end - start);
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const durationDays = calculateDuration();
  const isFree = Number(item?.pricePerDay) === 0;
  const totalCost = isFree ? 0 : (item?.pricePerDay * durationDays);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setRequestError('');
    setRequestLoading(true);

    try {
      await requestAPI.create({
        itemId: item.id,
        startDate,
        endDate,
        message,
        type: isFree ? 'borrow' : 'rent'
      });

      setRequestSuccess('Request sent to owner! You will be notified once approved.');
      setTimeout(() => {
        setRequestModalOpen(false);
        navigate('/dashboard');
      }, 1800);
    } catch (err) {
      setRequestError(err.message || 'Failed to submit request.');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await reportAPI.create({
        targetType: 'item',
        targetId: item.id,
        targetTitle: item.title,
        reason: reportReason,
        description: reportDesc
      });
      setReportSuccess('Report submitted for admin moderation review.');
      setTimeout(() => {
        setReportModalOpen(false);
        setReportSuccess('');
      }, 1500);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <Loader text="Loading item specifications..." />;
  if (error || !item) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Item not found</h2>
        <p className="text-xs text-slate-400">{error || 'This listing may have been removed.'}</p>
        <Link to="/explore" className="inline-block px-4 py-2 rounded-xl bg-slate-800 text-white text-xs">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isOwnItem = user?.id === item.ownerId;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/explore"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image and Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Photo Gallery */}
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-800 border border-slate-700/80 shadow-2xl">
            {item.images?.[0] ? (
              <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                <span className="text-sm">No photo added for this item</span>
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/90 backdrop-blur-md text-white border border-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                {item.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white">
                {item.condition} Condition
              </span>
            </div>
          </div>

          {/* Title & Location Header */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {item.title}
            </h1>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-emerald-400" />
                {item.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Shared by a neighbor
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              About this Item
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>

          {/* Lending Rules & Safety guidelines */}
          {item.rules && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                Owner's Borrowing Guidelines
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.rules}
              </p>
            </div>
          )}

          {/* Reviews Section (FR9) */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                Community Reviews ({item.reviews?.length || 0})
              </h2>
            </div>

            {(!item.reviews || item.reviews.length === 0) ? (
              <p className="text-xs text-slate-500 italic">
                No borrower reviews yet. Be the first neighbor to borrow and review this item!
              </p>
            ) : (
              <div className="space-y-3 divide-y divide-slate-800/80">
                {item.reviews.map((rev) => (
                  <div key={rev.id} className="pt-3 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{rev.reviewerName}</span>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing & Booking Card */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl sticky top-24 space-y-6">
            {/* Price Header */}
            <div>
              <span className="text-xs text-slate-400 block mb-1">Borrow Rate:</span>
              {isFree ? (
                <div className="text-2xl font-black text-emerald-400 flex items-center gap-2">
                  🌱 Free Community Borrow
                </div>
              ) : (
                <div className="text-3xl font-black text-white flex items-baseline gap-1">
                  ${item.pricePerDay}
                  <span className="text-xs font-normal text-slate-400">/ day</span>
                </div>
              )}
              <div className="text-xs text-slate-400 mt-1">
                Refundable Deposit: <strong className="text-emerald-400">${item.deposit || 0}</strong>
              </div>
            </div>

            {/* Owner Info Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              {item.owner?.avatar ? (
                <img src={item.owner.avatar} alt="" className="avatar-image h-12 w-12 rounded-xl" />
              ) : (
                <span className="avatar-initials h-12 w-12 rounded-xl">
                  {(item.owner?.name || item.ownerName || 'N').charAt(0).toUpperCase()}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-white truncate block">
                  {item.owner?.name || item.ownerName}
                </span>
                <span className="text-[11px] text-slate-400 block">Community Lender</span>
                {item.owner?.reputation?.rating && (
                  <div className="flex items-center gap-1 text-[11px] text-amber-600 mt-0.5">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span>{item.owner.reputation.rating} Community rating</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            {isOwnItem ? (
              <div className="p-3 rounded-xl bg-slate-800 text-center text-xs text-slate-400 font-medium">
                This is your listing.
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setRequestModalOpen(true)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-102 flex items-center justify-center gap-2"
              >
                <span>Request to Borrow</span>
              </button>
            )}

            {/* Guarantees */}
            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Double Booking Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Deposit held safely until return confirmed</span>
              </div>
            </div>

            {/* Report listing button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center justify-center gap-1 mx-auto transition-colors"
              >
                <Flag className="w-3 h-3" /> Report inappropriate listing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Borrow / Rent Request (FR6) */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="Select Borrowing Dates"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleRequestSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400 block">Item:</span>
            <span className="text-white font-bold">{item.title}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Pick Up Date</label>
              <input
                type="date"
                value={startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Return Date</label>
              <input
                type="date"
                value={endDate}
                min={startDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Note to Owner (Optional)</label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell the owner what project you're working on..."
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Pricing Breakdown */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Duration:</span>
              <span className="font-bold text-white">{durationDays} day(s)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Rental Fee:</span>
              <span className="font-bold text-white">${totalCost}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Refundable Deposit:</span>
              <span className="font-bold text-emerald-400">${item.deposit}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
              <span>Total Deposit + Fee:</span>
              <span className="text-emerald-400">${totalCost + item.deposit}</span>
            </div>
          </div>

          {requestError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{requestError}</span>
            </div>
          )}

          {requestSuccess ? (
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold text-center">
              {requestSuccess}
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRequestModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={requestLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
              >
                {requestLoading ? 'Submitting Request...' : 'Send Request to Owner'}
              </button>
            </div>
          )}
        </form>
      </Modal>

      {/* Modal: Report Listing (FR11) */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Inappropriate Listing"
      >
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Report</label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
            >
              <option value="Inaccurate Details">Inaccurate Details / Condition Discrepancy</option>
              <option value="Prohibited Item">Prohibited or Dangerous Item</option>
              <option value="Suspected Fraud">Suspected Fraud or Scam</option>
              <option value="Inappropriate Content">Inappropriate Images or Content</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={reportDesc}
              onChange={(e) => setReportDesc(e.target.value)}
              placeholder="Describe the issue for admin moderation review..."
              required
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500"
            />
          </div>

          {reportSuccess ? (
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold text-center">
              {reportSuccess}
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Submit Report
              </button>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default ItemDetailPage;
