import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Sparkles, RefreshCw, X } from 'lucide-react';
import { itemAPI } from '../services/api';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';

export const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state initialized from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedCondition, setSelectedCondition] = useState(searchParams.get('condition') || 'All');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all'); // 'all', 'borrow', 'rent'
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedCondition !== 'All') params.condition = selectedCondition;
      if (selectedType !== 'all') params.type = selectedType;
      if (maxPrice) params.maxPrice = maxPrice;
      if (locationFilter) params.location = locationFilter;

      const [itemsRes, catRes] = await Promise.all([
        itemAPI.getAll(params),
        itemAPI.getCategories()
      ]);

      if (itemsRes.data?.success) setItems(itemsRes.data.data);
      if (catRes.data?.success) setCategories(catRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, selectedCondition, selectedType, locationFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedCondition('All');
    setSelectedType('all');
    setMaxPrice('');
    setLocationFilter('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Explore Community Items
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Discover available tools, appliances, outdoors gear, and event supplies in your neighborhood.
        </p>
      </div>

      {/* Main Search & Quick Category Bar */}
      <div className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by item name, keyword, or brand (e.g. DeWalt drill, tent, projector)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-md transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'All'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            All Categories
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id || cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.name
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Borrow vs Rent */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('borrow')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedType === 'borrow' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              🌱 Free Borrow
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('rent')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedType === 'rent' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Rental
            </button>
          </div>

          {/* Condition Dropdown */}
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Conditions</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>

          {/* Location input */}
          <input
            type="text"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder="Filter location (e.g. Brooklyn)..."
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Reset button */}
        <button
          onClick={handleResetFilters}
          className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors ml-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Item Results Grid */}
      {loading ? (
        <Loader text="Finding matching community items..." />
      ) : items.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <p className="text-base text-slate-300 font-semibold">No items match your filter criteria.</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try resetting your filters or use our AI natural search to match similar alternative items.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div>
          <div className="text-xs text-slate-400 mb-4">
            Showing <strong className="text-white">{items.length}</strong> available item(s)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
