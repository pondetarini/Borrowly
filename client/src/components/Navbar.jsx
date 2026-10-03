import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Home,
  LogOut,
  Menu,
  Package,
  Plus,
  Repeat,
  Search,
  Shield,
  Star,
  UserRound,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout, switchDemoRole } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRoleSwitch = async (role) => {
    await switchDemoRole(role);
    setUserDropdownOpen(false);
    navigate(role === 'admin' ? '/admin' : role === 'owner' ? '/owner/requests' : '/dashboard');
  };

  const closeMenus = () => {
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const linkClass = (path) =>
    `nav-link${location.pathname === path ? ' nav-link-active' : ''}`;

  return (
    <header className="site-header sticky top-0 z-50 border-b border-slate-800 bg-slate-900">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" onClick={closeMenus} className="brand-link flex shrink-0 items-center gap-2.5">
          <span className="brand-mark"><Repeat className="h-5 w-5" /></span>
          <span className="text-xl font-bold tracking-tight">
            Borrow<span className="text-emerald-400">ly</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          <Link to="/explore" className={linkClass('/explore')}>Explore</Link>
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className={linkClass('/dashboard')}>My Borrowings</Link>
              {(user?.role === 'owner' || user?.role === 'admin') && (
                <Link to="/owner/requests" className={linkClass('/owner/requests')}>My Listings</Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" className={linkClass('/admin')}>
                  <Shield className="h-4 w-4" /> Admin
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/items/new" className="button-primary hidden sm:inline-flex">
                <Plus className="h-4 w-4" /> List an Item
              </Link>
              <Link to="/items/new" className="button-primary button-icon sm:hidden" aria-label="List an item">
                <Plus className="h-5 w-5" />
              </Link>

              <div className="relative">
                <button
                  type="button"
                  className="icon-button relative"
                  aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                  aria-expanded={notifDropdownOpen}
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setUserDropdownOpen(false);
                  }}
                >
                  <Bell className="h-[19px] w-[19px]" />
                  {unreadCount > 0 && <span className="notification-dot" />}
                </button>
                {notifDropdownOpen && (
                  <div className="popover right-0 w-[min(20rem,calc(100vw-2rem))]">
                    <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                      <span className="text-sm font-semibold">Notifications</span>
                      {unreadCount > 0 && (
                        <button type="button" onClick={markAllAsRead} className="text-xs text-emerald-400">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-slate-400">No notifications yet</p>
                      ) : notifications.slice(0, 5).map((notification) => (
                        <button
                          type="button"
                          key={notification.id}
                          onClick={() => {
                            markAsRead(notification.id);
                            if (notification.link) navigate(notification.link);
                            setNotifDropdownOpen(false);
                          }}
                          className={`notification-row${notification.isRead ? '' : ' notification-unread'}`}
                        >
                          <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                            {notification.title}
                            {!notification.isRead && <span className="notification-dot" />}
                          </span>
                          <span className="mt-1 block text-xs leading-relaxed text-slate-400">{notification.message}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative hidden sm:block">
                <button
                  type="button"
                  className="profile-trigger"
                  aria-expanded={userDropdownOpen}
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setNotifDropdownOpen(false);
                  }}
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="avatar-image" />
                  ) : (
                    <span className="avatar-initials">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  )}
                  <span className="hidden max-w-28 truncate text-sm font-medium lg:block">{user?.name}</span>
                </button>
                {userDropdownOpen && (
                  <div className="popover right-0 w-64">
                    <div className="border-b border-slate-800 px-4 py-3">
                      <p className="text-sm font-semibold">{user?.name}</p>
                      <p className="truncate text-xs text-slate-400">{user?.email}</p>
                      {user?.reputation?.rating && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                          <Star className="h-3 w-3 fill-current" /> {user.reputation.rating}
                        </p>
                      )}
                    </div>
                    <div className="border-b border-slate-800 p-3">
                      <p className="mb-2 text-xs text-slate-400">Switch demo role</p>
                      <div className="grid grid-cols-3 gap-1">
                        {['borrower', 'owner', 'admin'].map((role) => (
                          <button
                            type="button"
                            key={role}
                            onClick={() => handleRoleSwitch(role)}
                            className={`role-button${user?.role === role ? ' role-button-active' : ''}`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Link to="/profile" onClick={closeMenus} className="popover-link">
                      <UserRound className="h-4 w-4" /> Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        closeMenus();
                        navigate('/');
                      }}
                      className="popover-link text-rose-600"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="icon-button sm:hidden"
                aria-label="Open account menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="button-secondary hidden sm:inline-flex">Sign in</Link>
              <Link to="/register" className="button-primary hidden sm:inline-flex">Join Borrowly</Link>
              <button
                type="button"
                className="icon-button sm:hidden"
                aria-label="Open menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu md:hidden">
          <Link to="/ai-search" onClick={closeMenus}>AI-assisted search</Link>
          {isAuthenticated ? (
            <>
              <Link to="/owner/requests" onClick={closeMenus}>My Listings & Requests</Link>
              <Link to="/profile" onClick={closeMenus}>Profile</Link>
              {user?.role === 'admin' && <Link to="/admin" onClick={closeMenus}>Admin</Link>}
              <button
                type="button"
                onClick={() => {
                  logout();
                  closeMenus();
                  navigate('/');
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenus}>Sign in</Link>
              <Link to="/register" onClick={closeMenus}>Create an account</Link>
            </>
          )}
        </div>
      )}

      <nav className="mobile-bottom-nav md:hidden" aria-label="Mobile navigation">
        <Link to="/" className={`mobile-nav-item${location.pathname === '/' ? ' mobile-nav-active' : ''}`}>
          <Home className="h-5 w-5" /><span>Home</span>
        </Link>
        <Link to="/explore" className={`mobile-nav-item${location.pathname === '/explore' ? ' mobile-nav-active' : ''}`}>
          <Search className="h-5 w-5" /><span>Explore</span>
        </Link>
        <Link to={isAuthenticated ? '/dashboard' : '/login'} className={`mobile-nav-item${location.pathname === '/dashboard' ? ' mobile-nav-active' : ''}`}>
          <Package className="h-5 w-5" /><span>Borrowings</span>
        </Link>
        <Link to={isAuthenticated ? '/profile' : '/login'} className={`mobile-nav-item${location.pathname === '/profile' ? ' mobile-nav-active' : ''}`}>
          <UserRound className="h-5 w-5" /><span>{isAuthenticated ? 'Profile' : 'Sign in'}</span>
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
