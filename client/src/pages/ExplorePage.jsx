import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RefreshCw } from 'lucide-react';
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
  const [error, setError] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
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
      setError(err.message || 'Unable to load items right now. Please try again.');
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
    <div className="explore-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* Header */}
      <div>
        <p className="section-kicker">Shared by people nearby</p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Explore items</h1>
        <p className="mt-1 text-sm text-slate-400">Find something useful in your community.</p>
      </div>

      {/* Main Search & Quick Category Bar */}
      <div className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="explore-search">
          <div className="explore-search-input">
            <Search className="h-5 w-5 shrink-0 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for an item"
              aria-label="Search items"
            />
          </div>
          <button type="submit" className="button-primary">Search</button>
        </form>

        {/* Category Pills */}
        <div className="explore-categories" aria-label="Filter by category">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            aria-pressed={selectedCategory === 'All'}
            className={`category-chip${selectedCategory === 'All' ? ' category-chip-active' : ''}`}
          >
            All items
          </button>

          {categories.map((cat) => (
            <button
              type="button"
              key={cat.id || cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              aria-pressed={selectedCategory === cat.name}
              className={`category-chip${selectedCategory === cat.name ? ' category-chip-active' : ''}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Filters Bar */}
      <div className="explore-filters">
        <div className="flex flex-wrap items-center gap-3">
          {/* Borrow vs Rent */}
          <div className="explore-type-filter" aria-label="Filter by borrowing type">
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              aria-pressed={selectedType === 'all'}
              className={selectedType === 'all' ? 'filter-option filter-option-active' : 'filter-option'}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('borrow')}
              aria-pressed={selectedType === 'borrow'}
              className={selectedType === 'borrow' ? 'filter-option filter-option-active' : 'filter-option'}
            >
              Free to borrow
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('rent')}
              aria-pressed={selectedType === 'rent'}
              className={selectedType === 'rent' ? 'filter-option filter-option-active' : 'filter-option'}
            >
              Paid
            </button>
          </div>

          {/* Condition Dropdown */}
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="explore-select"
            aria-label="Filter by item condition"
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
            placeholder="Neighborhood"
            aria-label="Filter by location"
            className="explore-location"
          />
        </div>

        {/* Reset button */}
        <button
          onClick={handleResetFilters}
          className="explore-reset"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Item Results Grid */}
      {loading ? (
        <Loader text="Finding matching community items..." />
      ) : error ? (
        <div className="empty-state" role="alert">{error}</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p className="font-semibold text-slate-100">No items found</p>
          <p className="mx-auto max-w-md text-sm text-slate-400">
            Try another search or clear your filters to see more community listings.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="button-secondary"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4 text-sm text-slate-400">
            {items.length} {items.length === 1 ? 'item' : 'items'} available
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <ItemCard key={item.id || item._id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
