'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apartmentAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import { Loader2, ArrowLeft } from 'lucide-react';
import styles from './edit-apartment.module.css';
import type { Apartment, Developer, Compound } from '@/types';

const EditApartment = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        setLoading(true);
        setError('');
        const id = params.id as string;
        if (!id) {
          setError('No apartment ID provided');
          setLoading(false);
          return;
        }
        const response = await apartmentAPI.getById(id);
        setApartment(response.data);
      } catch (err) {
        console.error('Error fetching apartment:', err);
        setError('Failed to load apartment details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchApartment();
    }
  }, [params.id]);

  useEffect(() => {
    if (apartment && !redirecting) {
      setRedirecting(true);
      // Store the apartment data in sessionStorage for the create page to use
      sessionStorage.setItem('editApartmentData', JSON.stringify(apartment));
      router.push('/admin/create-apartment?mode=edit');
    }
  }, [apartment, redirecting, router]);

  if (loading) {
    return (
      <ProtectedRoute requiredRole="agent">
        <div className={styles.loadingContainer}>
          <Loader2 className={styles.spinner} />
          <p>Loading apartment details...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !apartment) {
    return (
      <ProtectedRoute requiredRole="agent">
        <div className={styles.errorContainer}>
          <h2>Apartment Not Found</h2>
          <p>{error || 'The apartment you are looking for does not exist.'}</p>
          <button onClick={() => router.push('/my-listings')} className={styles.backButton}>
            <ArrowLeft size={16} />
            Back to My Listings
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="agent">
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} />
        <p>Preparing edit form...</p>
      </div>
    </ProtectedRoute>
  );
};

export default EditApartment; 