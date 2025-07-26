'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apartmentAPI } from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import { Plus, Edit, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from './developers.module.css';

interface Developer {
  _id: string;
  name: string;
  description?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

const DevelopersPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Fetch developers
  const {
    data: developers = [],
    isLoading,
    error
  } = useQuery<Developer[]>({
    queryKey: ['developers'],
    queryFn: () => apartmentAPI.getDevelopers().then(res => res.data),
  });

  // Create developer mutation
  const createDeveloperMutation = useMutation({
    mutationFn: (developerData: any) => apartmentAPI.createDeveloper(developerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developers'] });
      resetForm();
    },
    onError: (error: any) => {
      console.error('Developer creation error:', error);
      let errorMessage = 'Failed to create developer';
      
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

  // Update developer mutation
  const updateDeveloperMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apartmentAPI.updateDeveloper(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developers'] });
      resetForm();
    },
    onError: (error: any) => {
      console.error('Developer update error:', error);
      let errorMessage = 'Failed to update developer';
      
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

  // Delete developer mutation
  const deleteDeveloperMutation = useMutation({
    mutationFn: (id: string) => apartmentAPI.deleteDeveloper(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developers'] });
    },
    onError: (error: any) => {
      console.error('Developer deletion error:', error);
      let errorMessage = 'Failed to delete developer';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(`Failed to delete developer: ${errorMessage}`);
    },
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', website: '' });
    setFormErrors({});
    setShowForm(false);
    setEditingDeveloper(null);
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      errors.name = 'Developer name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Developer name must be at least 2 characters';
    }

    if (formData.website && !isValidUrl(formData.website)) {
      errors.website = 'Please enter a valid URL';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (editingDeveloper) {
      updateDeveloperMutation.mutate({
        id: editingDeveloper._id,
        data: formData
      });
    } else {
      createDeveloperMutation.mutate(formData);
    }
  };

  const handleEdit = (developer: Developer) => {
    setEditingDeveloper(developer);
    setFormData({
      name: developer.name,
      description: developer.description || '',
      website: developer.website || ''
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this developer?')) {
      deleteDeveloperMutation.mutate(id);
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
        <p>Loading developers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>Failed to load developers. Please try again.</p>
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
        <h1>Manage Developers</h1>
        <button
          onClick={() => setShowForm(true)}
          className={styles.addButton}
          disabled={showForm}
        >
          <Plus size={20} />
          Add Developer
        </button>
      </div>

      {showForm && (
        <div className={styles.formContainer}>
          <h2>{editingDeveloper ? 'Edit Developer' : 'Add New Developer'}</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Developer Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`${styles.input} ${formErrors.name ? styles.error : ''}`}
                placeholder="Enter developer name"
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
                placeholder="Enter developer description"
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="website">Website</label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className={`${styles.input} ${formErrors.website ? styles.error : ''}`}
                placeholder="https://example.com"
              />
              {formErrors.website && <p className={styles.errorText}>{formErrors.website}</p>}
            </div>

            {formErrors.general && (
              <p className={styles.errorText}>{formErrors.general}</p>
            )}

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={createDeveloperMutation.isPending || updateDeveloperMutation.isPending}
              >
                {(createDeveloperMutation.isPending || updateDeveloperMutation.isPending) ? (
                  <>
                    <Loader2 className={styles.spinner} />
                    {editingDeveloper ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingDeveloper ? 'Update Developer' : 'Create Developer'
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

      <div className={styles.developersList}>
        <h2>All Developers ({developers.length})</h2>
        {developers.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No developers found. Add your first developer to get started.</p>
          </div>
        ) : (
          <div className={styles.developersGrid}>
            {developers.map((developer) => (
              <div key={developer._id} className={styles.developerCard}>
                <div className={styles.developerInfo}>
                  <h3 className={styles.developerName}>{developer.name}</h3>
                  {developer.description && (
                    <p className={styles.developerDescription}>{developer.description}</p>
                  )}
                  {developer.website && (
                    <a
                      href={developer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.developerWebsite}
                    >
                      {developer.website}
                    </a>
                  )}
                  <p className={styles.developerDate}>
                    Created: {new Date(developer.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className={styles.developerActions}>
                  <button
                    onClick={() => handleEdit(developer)}
                    className={styles.editButton}
                    title="Edit developer"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(developer._id)}
                    className={styles.deleteButton}
                    title="Delete developer"
                    disabled={deleteDeveloperMutation.isPending}
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

const DevelopersPageWithAuth = () => (
  <ProtectedRoute requiredRole="admin">
    <DevelopersPage />
  </ProtectedRoute>
);

export default DevelopersPageWithAuth; 