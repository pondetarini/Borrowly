import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Tag, MapPin, DollarSign, Shield, AlertCircle, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { itemAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CreateListingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Power Tools',
    description: '',
    condition: 'Like New',
    location: user?.location || '',
    isRentable: false,
    pricePerDay: 0,
    deposit: 0,
    imageUrl: '',
    tags: '',
    rules: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await itemAPI.create({
        ...formData,
        pricePerDay: formData.isRentable ? Number(formData.pricePerDay) : 0,
        deposit: Number(formData.deposit),
        images: formData.imageUrl.trim() ? [formData.imageUrl.trim()] : [],
        tags: formData.tags.split(',').map(t => t.trim())
      });

      if (res.data?.success) {
        navigate(`/items/${res.data.data.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to publish listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
          <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
          Community Listing (FR2)
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          List an Item to Share or Rent
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Publish gear you own so verified community members can borrow it safely with security deposits.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Item Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. DeWalt 20V Cordless Hammer Drill Kit"
            required
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Category & Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Power Tools">Power Tools</option>
              <option value="Camping & Outdoors">Camping & Outdoors</option>
              <option value="Electronics & AV">Electronics & AV</option>
              <option value="Lawn & Garden">Lawn & Garden</option>
              <option value="Party & Events">Party & Events</option>
              <option value="Sports & Fitness">Sports & Fitness</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Condition *
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Like New">Like New (Mint / rarely used)</option>
              <option value="Good">Good (Fully functional, minor wear)</option>
              <option value="Fair">Fair (Cosmetic wear, works fine)</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Pick-up Neighborhood / Location *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Your neighborhood or pickup area"
            required
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Description *
          </label>
          <textarea
            rows={4}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe what's included, capabilities, accessories, and handling requirements..."
            required
            className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Photo URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="Paste a link to an item photo"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Sharing Terms: Rent vs Free Borrow */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-white block">Rental Mode</span>
              <span className="text-xs text-slate-400">Charge a daily rate or offer as a free community gift</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isRentable"
                checked={formData.isRentable}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Daily Rate ($/day)
              </label>
              <input
                type="number"
                name="pricePerDay"
                disabled={!formData.isRentable}
                value={formData.isRentable ? formData.pricePerDay : 0}
                onChange={handleChange}
                min={0}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Refundable Deposit ($)
              </label>
              <input
                type="number"
                name="deposit"
                value={formData.deposit}
                onChange={handleChange}
                min={0}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white"
              />
            </div>
          </div>
        </div>

        {/* Rules */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Usage Guidelines & Rules
          </label>
          <input
            type="text"
            name="rules"
            value={formData.rules}
            onChange={handleChange}
            placeholder="e.g. Return batteries charged, dry tent before packing"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all hover:scale-102"
        >
          {loading ? 'Publishing Item Listing...' : 'Publish Item to Community'}
        </button>
      </form>
    </div>
  );
};

export default CreateListingPage;
