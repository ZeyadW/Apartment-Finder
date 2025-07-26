'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apartmentAPI } from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import { Plus, Edit, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from './compounds.module.css';

interface Compound {
  _id: string;
  name: string;
  description?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

const CompoundsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCompound, setEditingCompound] = useState<Compound | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Fetch compounds
  const {
    data: compounds = [],
    isLoading,
    error
  } = useQuery<Compound[]>({
    queryKey: ['compounds'],
    queryFn: () => apartmentAPI.getCompounds().then(res => res.data),
  });

  // Create compound mutation
  const createCompoundMutation = useMutation({
    mutationFn: (compoundData: any) => apartmentAPI.createCompound(compoundData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compounds'] });
      resetForm();
    },
    onError: (error: any) => {
      console.error('Compound creation error:', error);
      let errorMessage = 'Failed to create compound';
      
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

  // Update compound mutation
  const updateCompoundMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apartmentAPI.updateCompound(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compounds'] });
      resetForm();
    },
    onError: (error: any) => {
      console.error('Compound update error:', error);
      let errorMessage = 'Failed to update compound';
      
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

  // Delete compound mutation
  const deleteCompoundMutation = useMutation({
    mutationFn: (id: string) => apartmentAPI.deleteCompound(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compounds'] });
    },
    onError: (error: any) => {
      console.error('Compound deletion error:', error);
      let errorMessage = 'Failed to delete compound';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(`Failed to delete compound: ${errorMessage}`);
    },
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', location: '' });
    setFormErrors({});
    setShowForm(false);
    setEditingCompound(null);
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      errors.name = 'Compound name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Compound name must be at least 2 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (editingCompound) {
      updateCompoundMutation.mutate({
        id: editingCompound._id,
        data: formData
      });
    } else {
      createCompoundMutation.mutate(formData);
    }
  };

  const handleEdit = (compound: Compound) => {
    setEditingCompound(compound);
    setFormData({
      name: compound.name,
      description: compound.description || '',
      location: compound.location || ''
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this compound?')) {
      deleteCompoundMutation.mutate(id);
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
        <p>Loading compounds...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>Failed to load compounds. Please try again.</p>
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
        <h1>Manage Compounds</h1>
        <button
          onClick={() => setShowForm(true)}
          className={styles.addButton}
          disabled={showForm}
        >
          <Plus size={20} />
          Add Compound
        </button>
      </div>

      {showForm && (
        <div className={styles.formContainer}>
          <h2>{editingCompound ? 'Edit Compound' : 'Add New Compound'}</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Compound Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`${styles.input} ${formErrors.name ? styles.error : ''}`}
                placeholder="Enter compound name"
              />
              {formErrors.name && <p className={styles.errorText}>{formErrors.name}</p>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={styles.input}
                placeholder="Enter compound location"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="Enter compound description"
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
                disabled={createCompoundMutation.isPending || updateCompoundMutation.isPending}
              >
                {(createCompoundMutation.isPending || updateCompoundMutation.isPending) ? (
                  <>
                    <Loader2 className={styles.spinner} />
                    {editingCompound ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingCompound ? 'Update Compound' : 'Create Compound'
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

      <div className={styles.compoundsList}>
        <h2>All Compounds ({compounds.length})</h2>
        {compounds.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No compounds found. Add your first compound to get started.</p>
          </div>
        ) : (
          <div className={styles.compoundsGrid}>
            {compounds.map((compound) => (
              <div key={compound._id} className={styles.compoundCard}>
                <div className={styles.compoundInfo}>
                  <h3 className={styles.compoundName}>{compound.name}</h3>
                  {compound.location && (
                    <p className={styles.compoundLocation}>
                      📍 {compound.location}
                    </p>
                  )}
                  {compound.description && (
                    <p className={styles.compoundDescription}>{compound.description}</p>
                  )}
                  <p className={styles.compoundDate}>
                    Created: {new Date(compound.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className={styles.compoundActions}>
                  <button
                    onClick={() => handleEdit(compound)}
                    className={styles.editButton}
                    title="Edit compound"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(compound._id)}
                    className={styles.deleteButton}
                    title="Delete compound"
                    disabled={deleteCompoundMutation.isPending}
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

const CompoundsPageWithAuth = () => (
  <ProtectedRoute requiredRole="admin">
    <CompoundsPage />
  </ProtectedRoute>
);

export default CompoundsPageWithAuth; 