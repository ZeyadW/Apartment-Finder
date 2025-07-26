'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter } from 'lucide-react';
import { apartmentAPI } from '@/services/api';
import './SearchFilter.css';

interface SearchFilterProps {
  onSearch: (filters: any) => void;
}

const SearchFilter = ({ onSearch }: SearchFilterProps) => {
  const [filters, setFilters] = useState({
    search: '',
    listingType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    city: ''
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [mode, setMode] = useState<'compounds' | 'properties'>('properties');
  const [compoundQuery, setCompoundQuery] = useState('');
  const [compoundOptions, setCompoundOptions] = useState<string[]>([]);
  const [showCompoundDropdown, setShowCompoundDropdown] = useState(false);
  const compoundDropdownRef = useRef<HTMLDivElement>(null);
  const [propertyOptions, setPropertyOptions] = useState<any[]>([]);
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const propertyDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [allApartments, setAllApartments] = useState<any[]>([]);
  const [allCities, setAllCities] = useState<string[]>([]);

  // Fetch all unique project names for autocomplete
  useEffect(() => {
    if (mode === 'compounds') {
      apartmentAPI.getAll().then((res: any) => {
        const uniqueProjects = Array.from(new Set(res.map((apt: any) => apt.project))) as string[];
        setCompoundOptions(uniqueProjects);
      });
    }
  }, [mode]);

  // Fetch all apartments on mount for client-side substring search
  useEffect(() => {
    apartmentAPI.getAll().then((res: any) => {
      setAllApartments(res || []);
      // Extract unique cities from actual listings
      const uniqueCities = Array.from(new Set((res || []).map((apt: any) => apt.city)))
        .filter((city): city is string => typeof city === 'string' && city.trim() !== '') // Filter out empty or null cities
        .sort(); // Sort alphabetically
      setAllCities(uniqueCities);
    }).catch((error) => {
      console.error('Error fetching apartments for search:', error);
      setAllApartments([]);
      setAllCities([]);
    });
  }, []);

  // Handle click outside for compound dropdown
  useEffect(() => {
    if (!showCompoundDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (compoundDropdownRef.current && !compoundDropdownRef.current.contains(e.target as Node)) {
        setShowCompoundDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showCompoundDropdown]);

  // Handle click outside for property dropdown
  useEffect(() => {
    if (!showPropertyDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (propertyDropdownRef.current && !propertyDropdownRef.current.contains(e.target as Node)) {
        setShowPropertyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showPropertyDropdown]);



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    clearValidationError(name);
    if (name === 'search') {
      if (value.length >= 1 && allApartments) {
        const filtered = allApartments.filter((apt: any) =>
          apt.unitName?.toLowerCase().includes(value.toLowerCase()) ||
          apt.unitNumber?.toLowerCase().includes(value.toLowerCase()) ||
          apt.project?.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 8);
        setPropertyOptions(filtered);
        setShowPropertyDropdown(true);
      } else {
        setPropertyOptions([]);
        setShowPropertyDropdown(false);
      }
    }

  };

  const handlePropertySelect = (apt: any) => {
    setFilters(prev => ({ ...prev, search: apt.unitName }));
    setShowPropertyDropdown(false);
    router.push(`/apartment/${apt._id}`);
  };

  const handleCompoundInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompoundQuery(e.target.value);
    setShowCompoundDropdown(true);
  };

  const handleCompoundSelect = (project: string) => {
    setCompoundQuery(project);
    setShowCompoundDropdown(false);
    router.push(`/compound/${encodeURIComponent(project)}`);
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'properties') {
      // Validate filters before submitting
      if (!validateFilters()) {
        return; // Don't submit if validation fails
      }
      onSearch(filters);
    } else if (mode === 'compounds' && compoundQuery) {
      router.push(`/compound/${encodeURIComponent(compoundQuery)}`);
    }
  };

  const handleReset = () => {
    setFilters({
      search: '',
      listingType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      city: ''
    });
    setCompoundQuery('');
    setPropertyOptions([]);
    setValidationErrors({});
    onSearch({});
  };

  // Validation functions
  const validateFilters = () => {
    const errors: {[key: string]: string} = {};

    // Price validation
    if (filters.minPrice && filters.maxPrice) {
      const minPrice = parseFloat(filters.minPrice);
      const maxPrice = parseFloat(filters.maxPrice);
      if (minPrice > maxPrice) {
        errors.price = 'Min price cannot be greater than max price';
      }
    }

    // Min price validation
    if (filters.minPrice && parseFloat(filters.minPrice) < 0) {
      errors.minPrice = 'Min price must be at least 0';
    }

    // Max price validation
    if (filters.maxPrice && parseFloat(filters.maxPrice) < 0) {
      errors.maxPrice = 'Max price must be at least 0';
    }

    // Bedrooms validation
    if (filters.bedrooms && (parseInt(filters.bedrooms) < 0 || parseInt(filters.bedrooms) > 10)) {
      errors.bedrooms = 'Bedrooms must be between 0 and 10';
    }

    // Bathrooms validation
    if (filters.bathrooms && (parseInt(filters.bathrooms) < 0 || parseInt(filters.bathrooms) > 10)) {
      errors.bathrooms = 'Bathrooms must be between 0 and 10';
    }

    // City validation
    if (filters.city && filters.city.trim().length === 0) {
      errors.city = 'City cannot be empty';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearValidationError = (field: string) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Filter compound options for autocomplete
  const filteredCompounds = compoundOptions.filter(option =>
    option.toLowerCase().includes(compoundQuery.toLowerCase())
  );

  return (
    <div className="search-filter">
      <div className="container">
        <div className="search-toggle-row">
          <button
            type="button"
            className={`search-toggle-btn${mode === 'compounds' ? ' active' : ''}`}
            onClick={() => setMode('compounds')}
          >
            Compounds
          </button>
          <button
            type="button"
            className={`search-toggle-btn${mode === 'properties' ? ' active' : ''}`}
            onClick={() => setMode('properties')}
          >
            Properties
          </button>
        </div>
        <form onSubmit={handleSubmit} className="filter-form">
          {mode === 'compounds' ? (
            <div className="filter-row">
              <div className="filter-group" style={{ position: 'relative' }}>
                <label htmlFor="compound-search" className="form-label">
                  <Search className="filter-icon" />
                  Search Compounds
                </label>
                <input
                  type="text"
                  id="compound-search"
                  name="compound-search"
                  value={compoundQuery}
                  onChange={handleCompoundInput}
                  placeholder="Type compound/project name..."
                  className="form-input"
                  autoComplete="off"
                  onFocus={() => setShowCompoundDropdown(true)}
                />
                {showCompoundDropdown && filteredCompounds.length > 0 && (
                  <div className="compound-dropdown" ref={compoundDropdownRef}>
                    {filteredCompounds.map(option => (
                      <div
                        key={option}
                        className="compound-dropdown-item"
                        onClick={() => handleCompoundSelect(option)}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="filter-group">
                <label htmlFor="minPrice" className="form-label">Min Price</label>
                <input
                  type="number"
                  id="minPrice"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleInputChange}
                  placeholder="Min price..."
                  min="0"
                  step="1"
                  className="form-input"
                />
              </div>
              <div className="filter-group">
                <label htmlFor="maxPrice" className="form-label">Max Price</label>
                <input
                  type="number"
                  id="maxPrice"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleInputChange}
                  placeholder="Max price..."
                  min="0"
                  step="1"
                  className="form-input"
                />
              </div>
              <div className="filter-actions">
                <button type="submit" className="btn btn-primary">
                  <Filter className="btn-icon" />
                  Search
                </button>
                <button type="button" onClick={handleReset} className="btn btn-secondary">
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="filter-row">
                <div className="filter-group" style={{ position: 'relative' }}>
                  <label htmlFor="search" className="form-label">
                    <Search className="filter-icon" />
                    Search
                  </label>
                  <input
                    type="text"
                    id="search"
                    name="search"
                    value={filters.search}
                    onChange={handleInputChange}
                    placeholder="Search by name, unit, or project..."
                    className="form-input"
                    autoComplete="off"
                    onFocus={() => filters.search.length >= 1 && setShowPropertyDropdown(true)}
                  />
                  {showPropertyDropdown && propertyOptions.length > 0 && (
                    <div className="property-dropdown" ref={propertyDropdownRef}>
                      {propertyOptions.map(apt => (
                        <div
                          key={apt._id}
                          className="property-dropdown-item"
                          onClick={() => handlePropertySelect(apt)}
                        >
                          <span>{apt.unitName}</span>
                          <span style={{ color: '#888', fontSize: '12px', marginLeft: '8px' }}>{apt.project}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="filter-group">
                  <label htmlFor="city" className="form-label">City</label>
                  <select
                    id="city"
                    name="city"
                    value={filters.city}
                    onChange={handleInputChange}
                    className={`form-input ${validationErrors.city ? 'error' : ''}`}
                  >
                    <option value="">All Cities</option>
                    {allCities.map(city => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {validationErrors.city && (
                    <span className="error-message">{validationErrors.city}</span>
                  )}
                </div>
                <div className="filter-group">
                  <label htmlFor="listingType" className="form-label">Listing Type</label>
                  <select
                    id="listingType"
                    name="listingType"
                    value={filters.listingType}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="">All Types</option>
                    <option value="rent">For Rent</option>
                    <option value="sale">For Sale</option>
                  </select>
                </div>
              </div>
              <div className="filter-row">
                              <div className="filter-group">
                <label htmlFor="minPrice" className="form-label">Min Price</label>
                <input
                  type="number"
                  id="minPrice"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleInputChange}
                  placeholder="Min price..."
                  min="0"
                  step="1"
                  className="form-input"
                />
              </div>
              <div className="filter-group">
                <label htmlFor="maxPrice" className="form-label">Max Price</label>
                <input
                  type="number"
                  id="maxPrice"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleInputChange}
                  placeholder="Max price..."
                  min="0"
                  step="1"
                  className="form-input"
                />
              </div>
                <div className="filter-group">
                  <label htmlFor="bedrooms" className="form-label">Bedrooms</label>
                  <select
                    id="bedrooms"
                    name="bedrooms"
                    value={filters.bedrooms}
                    onChange={handleInputChange}
                    className={`form-input ${validationErrors.bedrooms ? 'error' : ''}`}
                  >
                    <option value="">Any</option>
                    <option value="0">Studio</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                  </select>
                  {validationErrors.bedrooms && (
                    <span className="error-message">{validationErrors.bedrooms}</span>
                  )}
                </div>
                <div className="filter-group">
                  <label htmlFor="bathrooms" className="form-label">Bathrooms</label>
                  <select
                    id="bathrooms"
                    name="bathrooms"
                    value={filters.bathrooms}
                    onChange={handleInputChange}
                    className={`form-input ${validationErrors.bathrooms ? 'error' : ''}`}
                  >
                    <option value="">Any</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                  </select>
                  {validationErrors.bathrooms && (
                    <span className="error-message">{validationErrors.bathrooms}</span>
                  )}
                </div>
              </div>
              <div className="filter-actions">
                <button type="submit" className="btn btn-primary">
                  <Filter className="btn-icon" />
                  Apply Filters
                </button>
                <button type="button" onClick={handleReset} className="btn btn-secondary">
                  Clear Filters
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default SearchFilter; 
       