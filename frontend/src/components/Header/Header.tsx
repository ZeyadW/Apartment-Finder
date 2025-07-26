'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Home, Search, LogOut, User, Heart, Building, Menu, X, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import './Header.css';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuBtnRef = useRef<HTMLButtonElement>(null);

  const handleLogout = () => {
    logout();
    // Redirect to signin page after logout
    router.push('/signin');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileMenuBtnRef.current &&
        !mobileMenuBtnRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    if (path === '/admin') {
      // Only mark admin as active if we're exactly on /admin, not /admin/create-apartment
      return pathname === '/admin';
    }
    return pathname.startsWith(path);
  };

  if (loading) return null;

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link href="/" className="header-logo" onClick={closeMenu}>
            <Home className="header-icon" />
            <span className="header-title">Apartment Finder</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="header-nav desktop-nav">
            {user ? (
              <>
                <span className="user-greeting">
                  Hello, {user.firstName}!
                </span>
                
                {/* Show different navigation based on user role */}
                {user.role === 'user' && (
                  <>
                    <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                      <Search className="nav-icon" />
                      Browse Apartments
                    </Link>
                    <Link href="/favorites" className={`nav-link ${isActive('/favorites') ? 'active' : ''}`}>
                      <Heart className="nav-icon" />
                      Favorites
                    </Link>
                  </>
                )}
                
                {(user.role === 'admin' || user.role === 'agent') && (
                  <>
                    <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                      <Search className="nav-icon" />
                      Browse Apartments
                    </Link>
                    <Link href="/my-listings" className={`nav-link ${isActive('/my-listings') ? 'active' : ''}`}>
                      <Building className="nav-icon" />
                      My Listings
                    </Link>
                    <Link href="/admin/create-apartment" className={`nav-link ${isActive('/admin/create-apartment') ? 'active' : ''}`}>
                      <User className="nav-icon" />
                      Create Apartment
                    </Link>
                  </>
                )}
                
                {user.role === 'admin' && (
                  <Link href="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                    <Settings className="nav-icon" />
                    Admin Panel
                  </Link>
                )}
                
                <button onClick={handleLogout} className="nav-link logout-btn">
                  <LogOut className="nav-icon" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                  <Search className="nav-icon" />
                  Browse Apartments
                </Link>
                <Link href="/signin" className={`nav-link ${isActive('/signin') ? 'active' : ''}`}>
                  <User className="nav-icon" />
                  Sign In
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            ref={mobileMenuBtnRef}
            className="mobile-menu-btn" 
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav 
          ref={mobileMenuRef}
          className={`header-nav mobile-nav ${isMenuOpen ? 'open' : ''}`}
        >
          {user ? (
            <>
              <span className="user-greeting mobile-greeting">
                Hello, {user.firstName}!
              </span>
              
              {/* Show different navigation based on user role */}
              {user.role === 'user' && (
                <>
                  <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={closeMenu}>
                    <Search className="nav-icon" />
                    Browse Apartments
                  </Link>
                  <Link href="/favorites" className={`nav-link ${isActive('/favorites') ? 'active' : ''}`} onClick={closeMenu}>
                    <Heart className="nav-icon" />
                    Favorites
                  </Link>
                </>
              )}
              
              {(user.role === 'admin' || user.role === 'agent') && (
                <>
                  <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={closeMenu}>
                    <Search className="nav-icon" />
                    Browse Apartments
                  </Link>
                  <Link href="/my-listings" className={`nav-link ${isActive('/my-listings') ? 'active' : ''}`} onClick={closeMenu}>
                    <Building className="nav-icon" />
                    My Listings
                  </Link>
                  <Link href="/admin/create-apartment" className={`nav-link ${isActive('/admin/create-apartment') ? 'active' : ''}`} onClick={closeMenu}>
                    <User className="nav-icon" />
                    Create Apartment
                  </Link>
                </>
              )}
              
              {user.role === 'admin' && (
                <Link href="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`} onClick={closeMenu}>
                  <Settings className="nav-icon" />
                  Admin Panel
                </Link>
              )}
              
              <button onClick={handleLogout} className="nav-link logout-btn">
                <LogOut className="nav-icon" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={closeMenu}>
                <Search className="nav-icon" />
                Browse Apartments
              </Link>
              <Link href="/signin" className={`nav-link ${isActive('/signin') ? 'active' : ''}`} onClick={closeMenu}>
                <User className="nav-icon" />
                Sign In
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header; 