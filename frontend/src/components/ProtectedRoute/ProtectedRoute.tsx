'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import './ProtectedRoute.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'agent' | 'user';
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  redirectTo 
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User is not authenticated, redirect to signin
        router.push('/signin');
        return;
      }

      if (requiredRole && user.role !== requiredRole) {
        // Check if user has higher privileges (admin can access agent pages)
        if (requiredRole === 'agent' && user.role === 'admin') {
          // Admin can access agent pages
          return;
        }
        
        if (requiredRole === 'user' && (user.role === 'admin' || user.role === 'agent')) {
          // Admin and agent can access user pages
          return;
        }

        // User doesn't have the required role
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          // Default redirects based on user role
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
        return;
      }
    }
  }, [user, loading, requiredRole, redirectTo, router]);

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  if (requiredRole && user.role !== requiredRole) {
    // Check if user has higher privileges (admin can access agent pages)
    if (requiredRole === 'agent' && user.role === 'admin') {
      // Admin can access agent pages
      return <>{children}</>;
    }
    
    if (requiredRole === 'user' && (user.role === 'admin' || user.role === 'agent')) {
      // Admin and agent can access user pages
      return <>{children}</>;
    }
    
    return null; // Will redirect based on role
  }

  return <>{children}</>;
};

export default ProtectedRoute; 
 