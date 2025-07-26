"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apartmentAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { Loader2, Edit, Trash2, Eye, EyeOff, Building2, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from "./my-listings.module.css";
import ApartmentCard from '@/components/ApartmentCard/ApartmentCard';
import type { Apartment } from '@/types';

const MyListings = () => {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [togglingApartmentId, setTogglingApartmentId] = useState<string | null>(null);
  const [deletingApartmentId, setDeletingApartmentId] = useState<string | null>(null);

  // Query for my listings
  const {
    data: apartments = [],
    isLoading,
    error,
  } = useQuery<Apartment[]>({
    queryKey: ['my-listings'],
    queryFn: () => apartmentAPI.getMyListings(),
    enabled: !!user,
  });

  // Toggle availability mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: (id: string) => apartmentAPI.toggleAvailability(id),
    onMutate: async (apartmentId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['my-listings'] });
      await queryClient.cancelQueries({ queryKey: ['apartments'] });
      await queryClient.cancelQueries({ queryKey: ['favorites'] });

      // Snapshot the previous value
      const previousListings = queryClient.getQueryData(['my-listings']);

      // Optimistically update to the new value
      queryClient.setQueryData(['my-listings'], (old: any) => {
        if (!old) return old;
        return old.map((apartment: any) =>
          apartment._id === apartmentId
            ? { ...apartment, isAvailable: !apartment.isAvailable }
            : apartment
        );
      });

      // Return a context object with the snapshotted value
      return { previousListings };
    },
    onError: (err, apartmentId, context) => {
      console.error('Toggle availability error:', err);
      let errorMessage = 'Failed to toggle availability';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as any).message;
      }
      
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousListings) {
        queryClient.setQueryData(['my-listings'], context.previousListings);
      }
      
      alert(errorMessage);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  // Delete apartment mutation
  const deleteApartmentMutation = useMutation({
    mutationFn: (id: string) => apartmentAPI.delete(id),
    onMutate: async (apartmentId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['my-listings'] });
      await queryClient.cancelQueries({ queryKey: ['apartments'] });
      await queryClient.cancelQueries({ queryKey: ['favorites'] });

      // Snapshot the previous value
      const previousListings = queryClient.getQueryData(['my-listings']);

      // Optimistically update to the new value
      queryClient.setQueryData(['my-listings'], (old: any) => {
        if (!old) return old;
        return old.filter((apartment: any) => apartment._id !== apartmentId);
      });

      // Return a context object with the snapshotted value
      return { previousListings };
    },
    onError: (err, apartmentId, context) => {
      console.error('Delete apartment error:', err);
      let errorMessage = 'Failed to delete apartment';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as any).message;
      }
      
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousListings) {
        queryClient.setQueryData(['my-listings'], context.previousListings);
      }
      
      alert(errorMessage);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const handleEdit = (id: string) => {
    router.push(`/edit-apartment/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    deleteApartmentMutation.mutate(id);
  };

  const handleToggleAvailability = async (id: string) => {
    toggleAvailabilityMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} />
        <p>Loading your listings...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="agent">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>My Listings</h1>
          <button 
            onClick={() => router.push('/admin/create-apartment')}
            className={styles.createButton}
          >
            <Plus size={20} />
            Create New Listing
          </button>
        </div>

        {error && (
          <div className={styles.error}>
            Failed to load your listings
          </div>
        )}

        {apartments.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <Building2 size={80} />
            </div>
            <h2>No listings yet</h2>
            <p>Start by creating your first apartment listing to showcase your properties to potential tenants.</p>
            <button 
              onClick={() => router.push('/admin/create-apartment')}
              className={styles.createButton}
            >
              <Plus size={20} />
              Create Your First Listing
            </button>
          </div>
        ) : (
          <div className={styles.listingsGrid}>
            {apartments.map((apartment) => (
              <ApartmentCard
                key={apartment._id}
                apartment={apartment}
                onCardClick={() => router.push(`/apartment/${apartment._id}`)}
                actions={
                  <>
                    <button 
                      onClick={e => { e.stopPropagation(); handleEdit(apartment._id); }}
                      className={styles.editButton}
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button 
                      onClick={e => { e.stopPropagation(); handleToggleAvailability(apartment._id); }}
                      disabled={togglingApartmentId === apartment._id}
                      className={`${styles.toggleButton} ${apartment.isAvailable ? styles.hideButton : styles.showButton}`}
                    >
                      {togglingApartmentId === apartment._id ? (
                        <Loader2 size={16} className={styles.spinner} />
                      ) : apartment.isAvailable ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                      {togglingApartmentId === apartment._id ? "Updating..." : (apartment.isAvailable ? "Hide" : "Show")}
                    </button>
                    <button 
                      onClick={e => { e.stopPropagation(); handleDelete(apartment._id); }}
                      disabled={deletingApartmentId === apartment._id}
                      className={styles.deleteButton}
                    >
                      {deletingApartmentId === apartment._id ? (
                        <Loader2 size={16} className={styles.spinner} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      {deletingApartmentId === apartment._id ? "Deleting..." : "Delete"}
                    </button>
                  </>
                }
              />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default MyListings; 