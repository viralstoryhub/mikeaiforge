import React, { useContext, useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { UserIcon, SearchIcon } from './icons/UtilityIcons';
import { useCommandPalette } from '../contexts/CommandPaletteContext';

const UserMenu: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    if (auth) {
      await auth.logout();
      setIsOpen(false);
      navigate('/');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!auth?.currentUser) return null;
  const { currentUser } = auth;
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-center w-10 h-10 bg-dark-secondary rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary focus:ring-offset-dark-primary">
        {currentUser.profilePictureUrl ? (
          <img src={currentUser.profilePictureUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
        ) : (
          <UserIcon className="w-6 h-6 text-light-secondary" />
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-dark-secondary rounded-md shadow-lg py-1 border border-border-dark z-10">
          <div className="px-4 py-2 border-b border-border-dark">
            <p className="text-sm font-medium text-light-primary truncate flex items-center">
                {currentUser.name || 'User'}
                {isAdmin && <span className="ml-2 text-xs font-bold text-white bg-purple-600 px-2 py-0.5 rounded-full">Admin</span>}
            </p>
            <p className="text-sm text-light-secondary truncate">{currentUser.email}</p>
          </div>
          <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-light-secondary hover:bg-dark-primary/50 hover:text-light-primary">
            My Dashboard
          </Link>
          {isAdmin && (
              <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-light-secondary hover:bg-dark-primary/50 hover:text-light-primary">
                Admin Panel
              </Link>
          )}
          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-dark-primary/50">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

const Header: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { open: openCommandPalette } = useCommandPalette();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'text-light-primary'
        : 'text-light-secondary hover:text-light-primary'
    }`;
    
  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
      isActive
        ? 'bg-brand-primary text-white'
        : 'text-light-secondary hover:bg-dark-secondary hover:text-light-primary'
    }`;

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleMobileLogout = async () => {
    if (auth) {
      await auth.logout();
      setIsMobileMenuOpen(false);
      navigate('/');
    }
  };
  
  const isAdmin = auth?.currentUser?.role === 'ADMIN';

  return (
    <header className="bg-dark-primary/80 backdrop-blur-md sticky top-0 z-50 border-b border-border-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <NavLink to="/" className="flex items-center space-x-2">
              <svg className="h-8 w-8 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 16v-2m0-8v4m-4-2h8m-8 4h8m-4-12h.01M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41M2 12h2m16 0h2" />
              </svg>
              <span className="text-xl font-bold text-light-primary">Mike's AI Forge</span>
            </NavLink>
          </div>
          <nav className="hidden md:flex items-center space-x-1">
              <NavLink to="/tools" className={navLinkClass}>
                AI Tools
              </NavLink>
              <NavLink to="/utilities" className={navLinkClass}>
                Utilities
              </NavLink>
              <NavLink to="/workflows" className={navLinkClass}>
                Workflows
              </NavLink>
              <NavLink to="/forum" className={navLinkClass}>
                Forum
              </NavLink>
              <NavLink to="/news" className={navLinkClass}>
                AI News
              </NavLink>
              <NavLink to="/content-studio" className={navLinkClass}>
                Content Studio
              </NavLink>
              <NavLink to="/chat" className={navLinkClass}>
                AI Assistant
              </NavLink>
              <NavLink to="/contact" className={navLinkClass} data-analytics-event="nav_click" data-analytics-props='{"link":"contact"}'>
                Contact
              </NavLink>
          </nav>
          <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={openCommandPalette} 
                className="flex items-center w-48 justify-between px-3 py-2 text-sm text-light-secondary bg-dark-secondary border border-border-dark rounded-md hover:text-light-primary hover:border-gray-600 transition-colors"
                aria-label="Open command palette"
              >
                <div className="flex items-center space-x-2">
                  <SearchIcon className="w-4 h-4" />
                  <span>Search...</span>
                </div>
                <kbd className="text-xs font-mono text-gray-500 border border-gray-600 rounded-sm px-1.5 py-0.5">⌘K</kbd>
              </button>
              {auth?.currentUser ? (
                <UserMenu />
              ) : (
                <>
                  <NavLink to="/login" className={navLinkClass}>
                    Login
                  </NavLink>
                  <NavLink to="/signup" className="bg-brand-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
                    Sign Up
                  </NavLink>
                </>
              )}
          </div>
          <div className="md:hidden flex items-center space-x-2">
            <button onClick={openCommandPalette} className="p-2 rounded-md text-light-secondary hover:bg-dark-secondary">
                <span className="sr-only">Search</span>
                <SearchIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-light-secondary hover:bg-dark-secondary focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-dark-primary/95 backdrop-blur-md z-40 shadow-lg" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <NavLink to="/tools" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>AI Tools Directory</NavLink>
                <NavLink to="/utilities" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Utilities</NavLink>
                <NavLink to="/workflows" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Workflow Vault</NavLink>
                <NavLink to="/forum" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Community Forum</NavLink>
                <NavLink to="/news" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>AI News</NavLink>
                <NavLink to="/content-studio" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Content Studio</NavLink>
                <NavLink to="/chat" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>AI Assistant</NavLink>
                <NavLink to="/contact" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)} data-analytics-event="nav_click" data-analytics-props='{"link":"contact"}'>Contact</NavLink>
            </div>
            <div className="pt-4 pb-3 border-t border-border-dark px-2 sm:px-3">
                {auth?.currentUser ? (
                    <div className="space-y-3">
                         <div className="flex items-center px-3">
                            <div className="flex-shrink-0">
                                {auth.currentUser.profilePictureUrl ? (
                                    <img src={auth.currentUser.profilePictureUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-dark-secondary flex items-center justify-center">
                                        <UserIcon className="w-6 h-6 text-light-secondary" />
                                    </div>
                                )}
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium text-light-primary flex items-center">
                                    {auth.currentUser.name || 'User'}
                                    {isAdmin && <span className="ml-2 text-xs font-bold text-white bg-purple-600 px-2 py-0.5 rounded-full">Admin</span>}
                                </div>
                                <div className="text-sm font-medium text-light-secondary">{auth.currentUser.email}</div>
                            </div>
                        </div>
                        <NavLink to="/dashboard" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>My Dashboard</NavLink>
                        {isAdmin && (
                            <NavLink to="/admin/dashboard" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Admin Panel</NavLink>
                        )}
                        <button onClick={handleMobileLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-dark-secondary">
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <NavLink to="/login" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Login</NavLink>
                        <NavLink to="/signup" className="block text-center bg-brand-primary text-white px-3 py-2 rounded-md text-base font-medium hover:opacity-90 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>
                          Sign Up
                        </NavLink>
                    </div>
                )}
            </div>
        </div>
      )}
    </header>
  );
};

export default Header;
