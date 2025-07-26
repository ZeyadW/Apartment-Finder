"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { apartmentAPI } from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { Loader2, Heart } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from "./favorites.module.css";
import ApartmentCard from '@/components/ApartmentCard/ApartmentCard';
import type { Apartment } from '@/types';

const Favorites = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Query for favorites
  const {
    data: apartments = [],
    isLoading,
    error,
  } = useQuery<Apartment[]>({
    queryKey: ['favorites'],
    queryFn: () => apartmentAPI.getFavorites(),
  });

  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: (id: string) => apartmentAPI.addToFavorites(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: (error: any) => {
      console.error('Remove from favorites error:', error);
      let errorMessage = 'Failed to remove from favorites';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(errorMessage);
    },
  });

  const handleRemoveFavorite = async (id: string) => {
    removeFromFavoritesMutation.mutate(id);
  };

  const handleViewDetails = (id: string) => {
    router.push(`/apartment/${id}`);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} />
        <p>Loading your favorites...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="user">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>My Favorite Listings</h1>
          <button 
            onClick={() => router.push('/')}
            className={styles.browseButton}
          >
            Browse More Listings
          </button>
        </div>

        {error && (
          <div className={styles.error}>
            Failed to load your favorites
          </div>
        )}

        {apartments.length === 0 ? (
          <div className={styles.emptyState}>
            <Heart className={styles.emptyIcon} />
            <h2>No favorites yet</h2>
            <p>Start browsing apartments and add your favorites to see them here.</p>
            <button 
              onClick={() => router.push('/')}
              className={styles.browseButton}
            >
              Start Browsing
            </button>
          </div>
        ) : (
          <div className={styles.favoritesGrid}>
            {apartments.map(apartment => (
              <ApartmentCard
                key={apartment._id}
                apartment={apartment}
                isFavorite={true}
                onRemoveFavorite={() => handleRemoveFavorite(apartment._id)}
                onCardClick={() => router.push(`/apartment/${apartment._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Favorites; 