'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ApartmentCard from '@/components/ApartmentCard/ApartmentCard';
import { apartmentAPI } from '@/services/api';
import { Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import './compound.css';
import type { Apartment } from '@/types';

export default function CompoundPage() {
  const params = useParams();
  const router = useRouter();
  const project = decodeURIComponent(params.project as string);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
  });

  // Query for apartments in the compound
  const {
    data: apartments = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Apartment[]>({
    queryKey: ['compound-apartments', project, filters],
    queryFn: () => apartmentAPI.getAll({ project, ...filters }),
    enabled: !!project,
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = async (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  return (
    <div className="compound-page">
      <div className="compound-hero">
        <div className="container">
          <h1 className="compound-title">{project}</h1>
          <p className="compound-subtitle">Explore all apartments in {project}</p>
        </div>
      </div>
      <div className="container">
        <form className="compound-filters" onSubmit={handleApplyFilters}>
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleFilterChange}
            placeholder="Min Price"
            className="form-input"
          />
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            placeholder="Max Price"
            className="form-input"
          />
          <select
            name="bedrooms"
            value={filters.bedrooms}
            onChange={handleFilterChange}
            className="form-input"
          >
            <option value="">Any Bedrooms</option>
            <option value="0">Studio</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4+</option>
          </select>
          <button type="submit" className="btn btn-primary">Apply Filters</button>
        </form>
        {isLoading ? (
          <div className="loading-container">
            <Loader2 className="loading-spinner" />
            <p>Loading apartments...</p>
          </div>
        ) : error ? (
          <div className="error-message">Failed to load apartments for this compound.</div>
        ) : apartments.length === 0 ? (
          <div className="no-results">
            <h2>No apartments found in this compound</h2>
          </div>
        ) : (
          <div className="apartments-grid">
            {apartments.map(apartment => (
              <ApartmentCard 
                key={apartment._id} 
                apartment={apartment} 
                onCardClick={() => router.push(`/apartment/${apartment._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
 