'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import SearchFilter from '@/components/SearchFilter/SearchFilter';
import ApartmentCard from '@/components/ApartmentCard/ApartmentCard';
import { Loader2 } from 'lucide-react';
import { apartmentAPI } from '@/services/api';
import './page.css';
import type { Apartment } from '@/types';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const [filters, setFilters] = useState({});
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Apartments query
  const {
    data: apartmentsRaw,
    isLoading: apartmentsLoading,
    isError: apartmentsError,
    refetch: refetchApartments,
  } = useQuery<Apartment[]>({
    queryKey: ['apartments', filters],
    queryFn: () => apartmentAPI.getAll(filters),
    // keepPreviousData is not a valid option in v4, so remove it
  });
  const apartments: Apartment[] = Array.isArray(apartmentsRaw) ? apartmentsRaw : [];

  // Favorites query - only for regular users
  const userId = user && (user as any)._id;
  const {
    data: favoriteIdsRaw,
    isLoading: favoritesLoading,
  } = useQuery<string[]>({
    queryKey: ['favorites', userId],
    queryFn: () => userId ? apartmentAPI.getFavorites().then((favs: any[]) => favs.map((apt: any) => apt.id || apt._id)) : Promise.resolve([]),
    enabled: !!userId && user?.role === 'user',
  });
  const favoriteIds: string[] = Array.isArray(favoriteIdsRaw) ? favoriteIdsRaw : [];

  // Handle role-based redirects for authenticated users
  useEffect(() => {
    if (!authLoading && user) {
      const currentPath = window.location.pathname;
      if (currentPath === '/') {
        switch (user.role) {
          case 'admin':
          case 'agent':
          case 'user':
          default:
            break;
        }
      }
    }
  }, [user, authLoading, router]);

  const handleSearch = (newFilters: any) => {
    setFilters(newFilters);
    refetchApartments();
  };

  const handleApartmentClick = (apartmentId: string) => {
    router.push(`/apartment/${apartmentId}`);
  };

  if (authLoading || apartmentsLoading || (user?.role === 'user' && favoritesLoading)) {
    return (
      <div className="loading-container">
        <Loader2 className="loading-spinner" />
        <p>Loading apartments...</p>
      </div>
    );
  }

  if (apartmentsError) {
    return (
      <div className="loading-container">
        <Loader2 className="loading-spinner" />
        <p>Failed to load apartments. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="container">
          <h1 className="hero-title">Find Your Perfect Apartment</h1>
          <p className="hero-subtitle">
            Discover amazing apartments in prime locations with all the amenities you need
          </p>
        </div>
      </div>

      <SearchFilter onSearch={handleSearch} />

      <div className="container">
        {apartments.length === 0 && (
          <div className="no-results">
            <h2>No apartments found</h2>
            <p>Try adjusting your search criteria or browse all available apartments.</p>
          </div>
        )}

        {apartments.length > 0 && (
          <>
            <div className="results-header">
              <h2>Available Apartments</h2>
              <p>{apartments.length} apartment{apartments.length !== 1 ? 's' : ''} found</p>
            </div>

            <div className="apartments-grid">
              {apartments.map((apartment) => (
                <ApartmentCard
                  key={apartment._id}
                  apartment={apartment}
                  isFavorite={user?.role === 'user' ? favoriteIds.includes(apartment._id) : false}
                  onCardClick={() => handleApartmentClick(apartment._id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
