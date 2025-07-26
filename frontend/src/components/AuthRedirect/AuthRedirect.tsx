'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import './AuthRedirect.css';

const AuthRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // User is authenticated, redirect based on role
      switch (user.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'agent':
          router.push('/my-listings');
          break;
        case 'user':
          router.push('/');
          break;
        default:
          router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect based on role
  }

  return null; // Allow access to auth pages
};

export default AuthRedirect; 
 