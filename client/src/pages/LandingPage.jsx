import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Home, Search, ShieldCheck, Sprout, Wrench } from 'lucide-react';
import { itemAPI } from '../services/api';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';

const categoryIcon = (name) => {
  const category = name.toLowerCase();
  if (category.includes('book')) return BookOpen;
  if (category.includes('home') || category.includes('house')) return Home;
  if (category.includes('garden') || category.includes('outdoor')) return Sprout;
  return Wrench;
};

export const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredItems, setFeaturedItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [itemsResponse, categoriesResponse] = await Promise.all([
          itemAPI.getAll({ status: 'active' }),
          itemAPI.getCategories()
        ]);
        if (itemsResponse.data?.success) setFeaturedItems(itemsResponse.data.data.slice(0, 4));
        if (categoriesResponse.data?.success) setCategories(categoriesResponse.data.data.slice(0, 6));
      } catch (err) {
        setError(err.message || 'We could not load community listings right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/explore?search=${encodeURIComponent(query)}` : '/explore');
  };

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <span className="home-eyebrow"><Sprout className="h-4 w-4" /> A little more sharing, a little less buying</span>
          <h1>Need something? <span>Borrow it nearby.</span></h1>
          <p>Find useful things around you. Borrow more, buy less.</p>

          <form onSubmit={handleSearchSubmit} className="home-search">
            <Search className="h-5 w-5 shrink-0 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search available items"
              placeholder="What are you looking for?"
            />
            <button type="submit" className="button-primary">Search</button>
          </form>

          <Link to="/explore" className="home-explore-link">
            Explore available items <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="home-trust-note">
            <ShieldCheck className="h-4 w-4" />
            Borrow from your community, one useful thing at a time.
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Find what you need</p>
            <h2>Browse by category</h2>
          </div>
          <Link to="/explore" className="section-link">All items <ArrowRight className="h-4 w-4" /></Link>
        </div>
        {categories.length > 0 ? (
          <div className="category-list">
            {categories.map((category) => {
              const Icon = categoryIcon(category.name);
              return (
                <Link
                  key={category.id || category.name}
                  to={`/explore?category=${encodeURIComponent(category.name)}`}
                  className="category-chip"
                >
                  <Icon className="h-4 w-4" /> {category.name}
                </Link>
              );
            })}
          </div>
        ) : !loading && !error ? (
          <p className="text-sm text-slate-400">Categories will appear as neighbors add listings.</p>
        ) : null}
      </section>

      <section className="home-section home-featured">
        <div className="section-heading">
          <div>
            <p className="section-kicker">From your community</p>
            <h2>Things worth sharing</h2>
          </div>
          <Link to="/explore" className="section-link">Explore everything <ArrowRight className="h-4 w-4" /></Link>
        </div>

        {loading ? (
          <Loader text="Finding items near you..." />
        ) : error ? (
          <div className="empty-state" role="alert">{error}</div>
        ) : featuredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredItems.map((item) => <ItemCard key={item.id || item._id} item={item} />)}
          </div>
        ) : (
          <div className="empty-state">
            <p>There are no active listings yet.</p>
            <Link to="/explore" className="section-link">Explore all listings <ArrowRight className="h-4 w-4" /></Link>
          </div>
        )}
      </section>

      <section className="home-section home-how-it-works">
        <div>
          <p className="section-kicker">Simple by design</p>
          <h2>Good things are better shared.</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Find what you need nearby, send a request, and coordinate directly through a clear borrowing process.
          </p>
        </div>
        <div className="mt-7 grid gap-6 sm:grid-cols-3">
          {[
            ['01', 'Find it nearby', 'Search real listings shared by people in your community.'],
            ['02', 'Request to borrow', 'Choose the dates you need and send the owner a request.'],
            ['03', 'Return with care', 'Keep track of your borrowing and arrange a smooth return.']
          ].map(([number, title, description]) => (
            <div key={number} className="how-step">
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
        <Link to="/explore" className="button-primary mt-7">Start exploring <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </div>
  );
};

export default LandingPage;
