'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/authContext';
import ConfirmationModal from '@/components/ConfirmationModal';
import ThemeToggle from '@/components/ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">
          <Link href="/">TrueOrigin</Link>
        </div>
        <div className="nav-links flex gap-x-6">
          <ThemeToggle />
          {!user ? (
            <div className="flex items-center gap-4">
              <Link href="/login" className="btn btn-outline" style={{ padding: '0.6rem 1.2rem' }}>Login</Link>
              <Link href="/register" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem' }}>Sign Up</Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {user.role === 'admin' ? (
                <Link href="/dashboard/admin" className="nav-link">Dashboard (Admin)</Link>
              ) : (
                <Link href="/dashboard/user" className="nav-link">My Products</Link>
              )}
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="btn btn-outline"
                style={{ padding: '0.6rem 1.2rem' }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logout}
        title="Logout Confirmation"
        message="Are you sure you want to log out of your account?"
        confirmText="Logout"
        type="danger"
      />
    </>
  );
}
