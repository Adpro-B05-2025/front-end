'use client';

import { Inter } from 'next/font/google';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';
import { AuthProvider, useAuth } from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

// Navbar Component that uses Auth Context
function NavBar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/register');
  if (isAuthPage) return null;

  return (
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="flex items-center">
                  <span className="text-2xl font-bold text-blue-600">🐼</span>
                  <span className="ml-2 text-xl font-semibold text-gray-800">PandaCare</span>
                </Link>
              </div>

              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/dashboard" className={`${pathname === '/dashboard' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Dashboard
                </Link>

                <Link href="/doctors" className={`${pathname === '/doctors' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Find Doctors
                </Link>

                <Link href="/consultations" className={`${pathname === '/consultations' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Consultations
                </Link>

                {user?.roles?.includes('ROLE_CAREGIVER') && (
                    <Link href="/schedule-management" className={`${pathname === '/schedule-management' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                      Manage Schedule
                    </Link>
                )}

                <Link href="/chat" className={`${pathname === '/chat' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Chat
                </Link>
              </div>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {isAuthenticated ? (
                  <div className="ml-3 relative">
                    <button onClick={() => setIsOpen(!isOpen)} className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800">
                        {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <span className="ml-2 text-gray-700">{user.name || user.email}</span>
                      <svg className="ml-2 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {isOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                          <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsOpen(false)}>Your Profile</Link>
                          <button onClick={() => { logout(); setIsOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</button>
                        </div>
                    )}
                  </div>
              ) : (
                  <div className="flex items-center">
                    <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-800 mr-4">Sign in</Link>
                    <Link href="/register/pacillian" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Register
                    </Link>
                  </div>
              )}
            </div>

            <div className="flex items-center sm:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                    <svg className="block h-6 w-6" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                    <svg className="block h-6 w-6" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
            <div className="sm:hidden">
              <div className="pt-2 pb-3 space-y-1">
                <Link href="/dashboard" className={`${pathname === '/dashboard' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`} onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
                <Link href="/doctors" className={`${pathname === '/doctors' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`} onClick={() => setIsOpen(false)}>
                  Find Doctors
                </Link>
                <Link href="/consultations" className={`${pathname === '/consultations' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`} onClick={() => setIsOpen(false)}>
                  Consultations
                </Link>
                {user?.roles?.includes('ROLE_CAREGIVER') && (
                    <Link href="/schedule-management" className={`${pathname === '/schedule-management' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`} onClick={() => setIsOpen(false)}>
                      Manage Schedule
                    </Link>
                )}
                <Link href="/chat" className={`${pathname === '/chat' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`} onClick={() => setIsOpen(false)}>
                  Chat
                </Link>
              </div>
            </div>
        )}
      </nav>
  );
}

// Layout Content Component
function LayoutContent({ children }) {
  const pathname = usePathname();
  const { loading } = useAuth();
  
  // Check if current path is auth related
  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/register');
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer - Hide on auth pages */}
      {!isAuthPage && (
        <footer className="bg-white border-t border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <span className="text-2xl font-bold text-blue-600">🐼</span>
                <span className="ml-2 text-xl font-semibold text-gray-800">PandaCare</span>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm text-gray-500">
                  © {new Date().getFullYear()} PandaCare. All rights reserved.
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  E-Health Consultation for Fasilkom UI
                </p>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

// Root Layout - Main export
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ToastContainer position="top-right" autoClose={3000} />
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}