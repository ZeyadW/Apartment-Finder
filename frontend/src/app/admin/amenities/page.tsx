'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apartmentAPI } from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import { Plus, Edit, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from './amenities.module.css';

interface Amenity {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const AmenitiesPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Fetch amenities
  const {
    data: amenities = [],
    isLoading,
    error
  } = useQuery<Amenity[]>({
    queryKey: ['amenities'],
    queryFn: () => apartmentAPI.getAmenities().then(res => res.data),
  });

  // Create amenity mutation
  const createAmenityMutation = useMutation({
    mutationFn: (amenityData: any) => apartmentAPI.createAmenity(amenityData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
      resetForm();
    },
    onError: (error: any) => {
      console.error('Amenity creation error:', error);
      let errorMessage = 'Failed to create amenity';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setFormErrors({ general: errorMessage });
    },
  });

  // Update amenity mutation
  const updateAmenityMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apartmentAPI.updateAmenity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
      resetForm();
    },
    onError: (error: any) => {
      console.error('Amenity update error:', error);
      let errorMessage = 'Failed to update amenity';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setFormErrors({ general: errorMessage });
    },
  });

  // Delete amenity mutation
  const deleteAmenityMutation = useMutation({
    mutationFn: (id: string) => apartmentAPI.deleteAmenity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
    },
    onError: (error: any) => {
      console.error('Amenity deletion error:', error);
      let errorMessage = 'Failed to delete amenity';
      
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

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setFormErrors({});
    setShowForm(false);
    setEditingAmenity(null);
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      errors.name = 'Amenity name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Amenity name must be at least 2 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (editingAmenity) {
      updateAmenityMutation.mutate({
        id: editingAmenity._id,
        data: formData
      });
    } else {
      createAmenityMutation.mutate(formData);
    }
  };

  const handleEdit = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    setFormData({
      name: amenity.name,
      description: amenity.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this amenity?')) {
      deleteAmenityMutation.mutate(id);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} />
        <p>Loading amenities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>Failed to load amenities. Please try again.</p>
        <button onClick={() => window.location.reload()} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => router.push('/admin')} className={styles.backButton}>
          <ArrowLeft size={20} />
          Back to Admin Panel
        </button>
        <h1>Manage Amenities</h1>
        <button
          onClick={() => setShowForm(true)}
          className={styles.addButton}
          disabled={showForm}
        >
          <Plus size={20} />
          Add Amenity
        </button>
      </div>

      {showForm && (
        <div className={styles.formContainer}>
          <h2>{editingAmenity ? 'Edit Amenity' : 'Add New Amenity'}</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Amenity Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`${styles.input} ${formErrors.name ? styles.error : ''}`}
                placeholder="Enter amenity name"
              />
              {formErrors.name && <p className={styles.errorText}>{formErrors.name}</p>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="Enter amenity description"
                rows={3}
              />
            </div>

            {formErrors.general && (
              <p className={styles.errorText}>{formErrors.general}</p>
            )}

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={createAmenityMutation.isPending || updateAmenityMutation.isPending}
              >
                {(createAmenityMutation.isPending || updateAmenityMutation.isPending) ? (
                  <>
                    <Loader2 className={styles.spinner} />
                    {editingAmenity ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingAmenity ? 'Update Amenity' : 'Create Amenity'
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.amenitiesList}>
        <h2>All Amenities ({amenities.length})</h2>
        {amenities.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No amenities found. Add your first amenity to get started.</p>
          </div>
        ) : (
          <div className={styles.amenitiesGrid}>
            {amenities.map((amenity) => (
              <div key={amenity._id} className={styles.amenityCard}>
                <div className={styles.amenityInfo}>
                  <h3 className={styles.amenityName}>{amenity.name}</h3>
                  {amenity.description && (
                    <p className={styles.amenityDescription}>{amenity.description}</p>
                  )}
                  <p className={styles.amenityDate}>
                    Created: {new Date(amenity.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className={styles.amenityActions}>
                  <button
                    onClick={() => handleEdit(amenity)}
                    className={styles.editButton}
                    title="Edit amenity"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(amenity._id)}
                    className={styles.deleteButton}
                    title="Delete amenity"
                    disabled={deleteAmenityMutation.isPending}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AmenitiesPageWithAuth = () => (
  <ProtectedRoute requiredRole="admin">
    <AmenitiesPage />
  </ProtectedRoute>
);

export default AmenitiesPageWithAuth; 