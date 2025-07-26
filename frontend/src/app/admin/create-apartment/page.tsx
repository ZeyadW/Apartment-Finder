"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apartmentAPI } from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { Plus, X, Upload, Image as ImageIcon, FileImage, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from "./create-apartment.module.css";

interface Developer {
  _id: string;
  name: string;
  description?: string;
  website?: string;
}

interface Compound {
  _id: string;
  name: string;
  description?: string;
  location?: string;
}

interface Amenity {
  _id: string;
  name: string;
  description?: string;
}

const CreateApartmentContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [developerSearch, setDeveloperSearch] = useState('');
  const [compoundSearch, setCompoundSearch] = useState('');
  const [showDeveloperDropdown, setShowDeveloperDropdown] = useState(false);
  const [showCompoundDropdown, setShowCompoundDropdown] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editApartmentId, setEditApartmentId] = useState<string | null>(null);


  // React Query hooks
  const {
    data: developers = [],
    isLoading: developersLoading,
    error: developersError,
  } = useQuery<Developer[]>({
    queryKey: ['developers'],
    queryFn: () => apartmentAPI.getDevelopers().then(res => res.data),
  });

  const {
    data: compounds = [],
    isLoading: compoundsLoading,
    error: compoundsError,
  } = useQuery<Compound[]>({
    queryKey: ['compounds'],
    queryFn: () => apartmentAPI.getCompounds().then(res => res.data),
  });

  const {
    data: amenities = [],
    isLoading: amenitiesLoading,
    error: amenitiesError,
  } = useQuery<Amenity[]>({
    queryKey: ['amenities'],
    queryFn: () => apartmentAPI.getAmenities().then((res: any) => res.data),
  });

  // Mutations
  const createApartmentMutation = useMutation({
    mutationFn: (apartmentData: any) => apartmentAPI.create(apartmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      router.push('/admin');
    },
    onError: (error: any) => {
      console.error('Apartment creation error:', error);
      let errorMessage = 'Failed to create apartment';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage);
    },
  });

  // Helper function to check if form should be disabled
  const isFormDisabled = () => {
    return developersLoading || compoundsLoading || amenitiesLoading || 
           !!developersError || !!compoundsError || !!amenitiesError;
  };

  // Validation functions
  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    // Basic Information
    if (!formData.unitName.trim()) {
      errors.unitName = "Unit name is required";
    } else if (formData.unitName.trim().length < 3) {
      errors.unitName = "Unit name must be at least 3 characters";
    }

    if (!formData.developer) {
      errors.developer = "Developer is required";
    }

    if (!formData.compound) {
      errors.compound = "Compound is required";
    }

    // Location Information
    if (!formData.city.trim()) {
      errors.city = "City is required";
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required";
    }

    // Property Details
    const bedrooms = parseInt(formData.bedrooms);
    if (isNaN(bedrooms) || bedrooms < 0) {
      errors.bedrooms = "Number of bedrooms must be 0 or more";
    }

    const bathrooms = parseInt(formData.bathrooms);
    if (isNaN(bathrooms) || bathrooms < 0) {
      errors.bathrooms = "Number of bathrooms must be 0 or more";
    }

    const squareFeet = parseInt(formData.squareFeet);
    if (isNaN(squareFeet) || squareFeet <= 0) {
      errors.squareFeet = "Square footage must be greater than 0";
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      errors.price = "Price must be greater than 0";
    }

    // Amenities validation
    if (selectedAmenities.length === 0) {
      errors.amenities = "At least one amenity must be selected";
    }

    // Images validation
    if (selectedFiles.length === 0 && existingImages.length === 0) {
      errors.images = "At least one image is required";
    } else if (selectedFiles.length > 10) {
      errors.images = "Maximum 10 images allowed";
    }

    // Description validation
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.trim().length < 20) {
      errors.description = "Description must be at least 20 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearValidationError = (field: string) => {
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Searchable dropdown helpers
  const filteredDevelopers = developers.filter(dev =>
    dev.name.toLowerCase().includes(developerSearch.toLowerCase())
  );

  const filteredCompounds = compounds.filter(comp =>
    comp.name.toLowerCase().includes(compoundSearch.toLowerCase())
  );



  const handleDeveloperSelect = (developerId: string) => {
    setFormData(prev => ({ ...prev, developer: developerId }));
    setDeveloperSearch('');
    setShowDeveloperDropdown(false);
    clearValidationError('developer');
  };

  const handleCompoundSelect = (compoundId: string) => {
    setFormData(prev => ({ ...prev, compound: compoundId }));
    setCompoundSearch('');
    setShowCompoundDropdown(false);
    clearValidationError('compound');
  };

  const handleDeveloperKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDeveloperDropdown(false);
    }
  };

  const handleCompoundKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowCompoundDropdown(false);
    }
  };

  const getSelectedDeveloperName = () => {
    const developer = developers.find(d => d._id === formData.developer);
    return developer ? developer.name : '';
  };

  const getSelectedCompoundName = () => {
    const compound = compounds.find(c => c._id === formData.compound);
    return compound ? compound.name : '';
  };
  
  const [formData, setFormData] = useState({
    unitName: "",
    unitNumber: "",
    project: "",
    address: "",
    city: "",
    price: "",
    listingType: "rent" as 'rent' | 'sale',
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    description: "",
    developer: "",
    compound: "",
  });

  // Predefined amenities list
  // const availableAmenities = [
  //   "Pool", "Gym", "Parking", "Balcony", "Elevator", "Security", 
  //   "Air Conditioning", "Heating", "Dishwasher", "Washing Machine",
  //   "Dryer", "Furnished", "Pet Friendly", "Garden", "Terrace",
  //   "Storage", "Bike Storage", "Concierge", "Doorman", "Rooftop",
  //   "Clubhouse", "Schools", "Business Hub", "Sports Clubs", "Mosque"
  // ];

  useEffect(() => {
    const loadData = async () => {
      try {
        // const [developersResponse, compoundsResponse] = await Promise.all([
        //   apartmentAPI.getDevelopers(),
        //   apartmentAPI.getCompounds()
        // ]);
        
        // setDevelopers(developersResponse.data);
        // setCompounds(compoundsResponse.data);
        
        // setDataLoadError(null); // Clear any previous errors
      } catch (err) {
        console.error('Error loading data:', err);
        const errorMessage = `Failed to load developers and compounds: ${err instanceof Error ? err.message : 'Unknown error'}`;
        setError(errorMessage);
        // setDataLoadError(errorMessage);
      } finally {
        // setLoadingData(false);
      }
    };
    loadData();
  }, []);

  // Check for edit mode
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'edit') {
      setIsEditMode(true);
      const editData = sessionStorage.getItem('editApartmentData');
      if (editData) {
        try {
          const apartment = JSON.parse(editData);
          setEditApartmentId(apartment._id);
          
          // Pre-populate form data
          setFormData({
            unitName: apartment.unitName || "",
            unitNumber: apartment.unitNumber || "",
            project: apartment.project || "",
            address: apartment.address || "",
            city: apartment.city || "",
            price: apartment.price?.toString() || "",
            listingType: apartment.listingType || "rent",
            bedrooms: apartment.bedrooms?.toString() || "",
            bathrooms: apartment.bathrooms?.toString() || "",
            squareFeet: apartment.squareFeet?.toString() || "",
            description: apartment.description || "",
            developer: typeof apartment.developer === 'object' ? apartment.developer._id : apartment.developer || "",
            compound: typeof apartment.compound === 'object' ? apartment.compound._id : apartment.compound || "",
          });
          
          // Pre-populate amenities
          if (apartment.amenities && Array.isArray(apartment.amenities)) {
            setSelectedAmenities(apartment.amenities);
          }
          
          // Pre-populate existing images
          if (apartment.images && Array.isArray(apartment.images)) {
            setExistingImages(apartment.images);
          }
          
          // Clear the session storage
          sessionStorage.removeItem('editApartmentData');
        } catch (err) {
          console.error('Error parsing edit data:', err);
          setError('Failed to load apartment data for editing');
        }
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Check if click is outside developer dropdown
      const developerDropdown = document.querySelector('.developer-dropdown');
      const developerInput = document.querySelector('.developer-input');
      if (developerDropdown && developerInput) {
        if (!developerDropdown.contains(target) && !developerInput.contains(target)) {
          setShowDeveloperDropdown(false);
        }
      }
      
      // Check if click is outside compound dropdown
      const compoundDropdown = document.querySelector('.compound-dropdown');
      const compoundInput = document.querySelector('.compound-input');
      if (compoundDropdown && compoundInput) {
        if (!compoundDropdown.contains(target) && !compoundInput.contains(target)) {
          setShowCompoundDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    clearValidationError(name); // Clear validation error on change
  };

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(a => a !== amenityId)
        : [...prev, amenityId]
    );
    clearValidationError('amenities'); // Clear validation error on amenity toggle
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    const validFiles = files.filter(file => {
      // Check MIME type
      const isValidMimeType = allowedTypes.includes(file.type);
      
      // Check file extension as backup
      const fileName = file.name.toLowerCase();
      const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
      
      return isValidMimeType || hasValidExtension;
    });
    
    if (validFiles.length !== files.length) {
      const invalidFiles = files.filter(file => !validFiles.includes(file));
      const invalidFileNames = invalidFiles.map(f => f.name).join(', ');
      setError(`Unsupported file type(s): ${invalidFileNames}. Please use JPG, JPEG, PNG, GIF, or WebP files only.`);
      return;
    }

    // Check file size (10MB limit before compression)
    const sizeValidFiles = validFiles.filter(file => file.size <= 10 * 1024 * 1024);
    if (sizeValidFiles.length !== validFiles.length) {
      const oversizedFiles = validFiles.filter(file => file.size > 10 * 1024 * 1024);
      const oversizedFileNames = oversizedFiles.map(f => f.name).join(', ');
      setError(`File(s) too large: ${oversizedFileNames}. Maximum size is 10MB per file before compression.`);
      return;
    }

    setSelectedFiles(prev => [...prev, ...sizeValidFiles]);
    setError(""); // Clear any previous errors
    clearValidationError('images'); // Clear validation error on file selection
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    clearValidationError('images'); // Clear validation error on file removal
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 800px width/height)
        const maxSize = 800;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Check if there was a data loading error
    // if (dataLoadError) {
    //   setError("Cannot submit form: " + dataLoadError);
    //   setLoading(false);
    //   return;
    // }

    // Validate that we have loaded the required data
    // if (developers.length === 0 || compounds.length === 0) {
    //   setError("Please wait for the form data to load completely before submitting");
    //   setLoading(false);
    //   return;
    // }

    // Validate that developer and compound are selected
    if (!formData.developer || !formData.compound) {
      setError("Please select both a developer and compound");
      setLoading(false);
      return;
    }

    // Additional validation to ensure we're using real ObjectIds
    const selectedDeveloper = developers.find(d => d._id === formData.developer);
    const selectedCompound = compounds.find(c => c._id === formData.compound);
    
    if (!selectedDeveloper || !selectedCompound) {
      setError("Invalid developer or compound selected. Please refresh the page and try again.");
      setLoading(false);
      return;
    }

    // Validate the form
    if (!validateForm()) {
      setError("Please fix the errors in the form.");
      setLoading(false);
      return;
    }

    try {
      let finalImages: string[] = [];
      
      if (selectedFiles.length > 0) {
        // If new files are selected, compress and use them
        const imageUrls = await Promise.all(selectedFiles.map(file => compressImage(file)));
        finalImages = imageUrls;
      } else if (existingImages.length > 0) {
        // If no new files but existing images, keep the existing ones
        finalImages = existingImages;
      }
        
      const apartmentData = {
        ...formData,
        amenities: selectedAmenities,
        images: finalImages,
        developer: formData.developer,
        compound: formData.compound,
      };

      if (isEditMode && editApartmentId) {
        // Update existing apartment
        await apartmentAPI.update(editApartmentId, apartmentData);
        setError(""); // Clear any previous errors
        alert('Apartment updated successfully!');
      } else {
        // Create new apartment
        await apartmentAPI.create(apartmentData);
        setError(""); // Clear any previous errors
        alert('Apartment created successfully!');
      }

      // Reset form
      setFormData({
        unitName: "",
        unitNumber: "",
        project: "",
        address: "",
        city: "",
        price: "",
        listingType: "rent",
        bedrooms: "",
        bathrooms: "",
        squareFeet: "",
        description: "",
        developer: "",
        compound: "",
      });
      setSelectedAmenities([]);
      setSelectedFiles([]);
      setExistingImages([]);
      
      // Redirect based on mode
      if (isEditMode) {
        router.push('/my-listings');
      } else {
        router.push('/my-listings');
      }
    } catch (err) {
      console.error('Error creating apartment:', err);
      let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} apartment`;
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as any).message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (developersLoading || compoundsLoading || amenitiesLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading form data...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="agent">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>{isEditMode ? 'Edit Apartment' : 'Create New Apartment'}</h1>
          <p>Fill in the details below to {isEditMode ? 'update' : 'create'} an apartment listing.</p>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.section}>
            <h2>Basic Information</h2>
            <div className={styles.formGroup}>
              <label htmlFor="unitName">Unit Name *</label>
              <input
                type="text"
                id="unitName"
                name="unitName"
                value={formData.unitName}
                onChange={handleChange}
                required
                className={`${styles.input} ${validationErrors.unitName ? styles.error : ''}`}
                placeholder="Enter unit name"
                disabled={isFormDisabled()}
              />
              {validationErrors.unitName && (
                <p className={styles.errorText}>{validationErrors.unitName}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="unitNumber">Unit Number *</label>
              <input
                type="text"
                id="unitNumber"
                name="unitNumber"
                value={formData.unitNumber}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Enter unit number"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="project">Project/Building Name *</label>
              <input
                type="text"
                id="project"
                name="project"
                value={formData.project}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Enter project or building name"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="developer">Developer *</label>
                <div className={styles.searchableSelect}>
                  <input
                    type="text"
                    placeholder={developersLoading ? "Loading developers..." : formData.developer ? getSelectedDeveloperName() : "Search developers..."}
                    value={developerSearch}
                    onChange={(e) => {
                      setDeveloperSearch(e.target.value);
                      setShowDeveloperDropdown(true);
                    }}
                    onFocus={() => setShowDeveloperDropdown(true)}
                    onKeyDown={handleDeveloperKeyDown}
                    className={`${styles.searchInput} developer-input ${validationErrors.developer ? styles.error : ''}`}
                    disabled={isFormDisabled()}
                  />
                  {showDeveloperDropdown && !isFormDisabled() && (
                    <div className={`${styles.dropdown} developer-dropdown`}>
                      {filteredDevelopers.length > 0 ? (
                        filteredDevelopers.map(dev => (
                          <div
                            key={dev._id}
                            className={`${styles.dropdownItem} ${formData.developer === dev._id ? styles.selected : ''}`}
                            onClick={() => handleDeveloperSelect(dev._id)}
                          >
                            <div className={styles.dropdownItemName}>{dev.name}</div>
                            {dev.description && (
                              <div className={styles.dropdownItemDesc}>{dev.description}</div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className={styles.dropdownItem}>No developers found</div>
                      )}
                    </div>
                  )}
                </div>
                {validationErrors.developer && (
                  <p className={styles.errorText}>{validationErrors.developer}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="compound">Compound *</label>
                <div className={styles.searchableSelect}>
                  <input
                    type="text"
                    placeholder={compoundsLoading ? "Loading compounds..." : formData.compound ? getSelectedCompoundName() : "Search compounds..."}
                    value={compoundSearch}
                    onChange={(e) => {
                      setCompoundSearch(e.target.value);
                      setShowCompoundDropdown(true);
                    }}
                    onFocus={() => setShowCompoundDropdown(true)}
                    onKeyDown={handleCompoundKeyDown}
                    className={`${styles.searchInput} compound-input ${validationErrors.compound ? styles.error : ''}`}
                    disabled={isFormDisabled()}
                  />
                  {showCompoundDropdown && !isFormDisabled() && (
                    <div className={`${styles.dropdown} compound-dropdown`}>
                      {filteredCompounds.length > 0 ? (
                        filteredCompounds.map(comp => (
                          <div
                            key={comp._id}
                            className={`${styles.dropdownItem} ${formData.compound === comp._id ? styles.selected : ''}`}
                            onClick={() => handleCompoundSelect(comp._id)}
                          >
                            <div className={styles.dropdownItemName}>{comp.name}</div>
                            {comp.description && (
                              <div className={styles.dropdownItemDesc}>{comp.description}</div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className={styles.dropdownItem}>No compounds found</div>
                      )}
                    </div>
                  )}
                </div>
                {validationErrors.compound && (
                  <p className={styles.errorText}>{validationErrors.compound}</p>
                )}
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2>Location</h2>
            <div className={styles.formGroup}>
              <label htmlFor="address">Street Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Enter street address"
              />
              {validationErrors.address && (
                <p className={styles.errorText}>{validationErrors.address}</p>
              )}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Enter city"
                />
                {validationErrors.city && (
                  <p className={styles.errorText}>{validationErrors.city}</p>
                )}
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2>Property Details</h2>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="listingType">Listing Type *</label>
                <select
                  id="listingType"
                  name="listingType"
                  value={formData.listingType}
                  onChange={handleChange}
                  required
                  className={styles.input}
                >
                  <option value="rent">For Rent</option>
                  <option value="sale">For Sale</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="price">{formData.listingType === 'rent' ? 'Monthly Rent (EGP)' : 'Sale Price (EGP)'} *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  className={styles.input}
                  placeholder={formData.listingType === 'rent' ? 'Enter monthly rent' : 'Enter sale price'}
                />
                {validationErrors.price && (
                  <p className={styles.errorText}>{validationErrors.price}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="bedrooms">Bedrooms *</label>
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  required
                  min="0"
                  className={styles.input}
                  placeholder="Number of bedrooms"
                />
                {validationErrors.bedrooms && (
                  <p className={styles.errorText}>{validationErrors.bedrooms}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="bathrooms">Bathrooms *</label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.5"
                  className={styles.input}
                  placeholder="Number of bathrooms"
                />
                {validationErrors.bathrooms && (
                  <p className={styles.errorText}>{validationErrors.bathrooms}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="squareFeet">Square Feet *</label>
                <input
                  type="number"
                  id="squareFeet"
                  name="squareFeet"
                  value={formData.squareFeet}
                  onChange={handleChange}
                  required
                  min="0"
                  className={styles.input}
                  placeholder="Square footage"
                />
                {validationErrors.squareFeet && (
                  <p className={styles.errorText}>{validationErrors.squareFeet}</p>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className={styles.textarea}
                placeholder="Describe the apartment, its features, and what makes it special..."
              />
              {validationErrors.description && (
                <p className={styles.errorText}>{validationErrors.description}</p>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h2>Amenities</h2>
            <div className={styles.amenitiesContainer}>
              <div className={styles.amenitiesGrid}>
                {amenities.map((amenity) => (
                  <label key={amenity._id} className={styles.amenityItem}>
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity._id)}
                      onChange={() => handleAmenityToggle(amenity._id)}
                      className={styles.amenityCheckbox}
                    />
                    <span className={styles.amenityLabel}>{amenity.name}</span>
                  </label>
                ))}
              </div>
              {selectedAmenities.length > 0 && (
                <div className={styles.selectedAmenities}>
                  <h4>Selected Amenities:</h4>
                  <div className={styles.amenityTags}>
                    {selectedAmenities.map((amenityId) => {
                      const amenity = amenities.find(a => a._id === amenityId);
                      return (
                        <span key={amenityId} className={styles.amenityTag}>
                          {amenity ? amenity.name : 'Unknown Amenity'}
                          <button
                            type="button"
                            onClick={() => handleAmenityToggle(amenityId)}
                            className={styles.removeAmenity}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              {validationErrors.amenities && (
                <p className={styles.errorText}>{validationErrors.amenities}</p>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h2>Images</h2>
            <div className={styles.imageUploadContainer}>
              <div className={`${styles.fileUploadArea} ${isDragging ? styles.dragover : ''}`} onDragOver={handleDragOver} onDrop={handleDrop} onDragLeave={handleDragLeave}>
                <input
                  type="file"
                  id="imageUpload"
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.webp"
                  onChange={handleFileSelect}
                  className={styles.fileInput}
                />
                <label htmlFor="imageUpload" className={styles.fileUploadLabel}>
                  <Upload size={24} />
                  <span>{isEditMode ? 'Click to add new images or drag and drop' : 'Click to select images or drag and drop'}</span>
                  <span className={styles.fileUploadHint}>
                    {isEditMode ? 'New images will replace existing ones. Supports: JPG, JPEG, PNG, GIF, WebP (Max 10MB each, will be compressed)' : 'Supports: JPG, JPEG, PNG, GIF, WebP (Max 10MB each, will be compressed)'}
                  </span>
                </label>
              </div>
              
              {(selectedFiles.length > 0 || existingImages.length > 0) && (
                <div className={styles.imagePreviewContainer}>
                  <h4>Images ({selectedFiles.length + existingImages.length}):</h4>
                  <div className={styles.imageList}>
                    {/* Show existing images */}
                    {existingImages.map((imageUrl, index) => (
                      <div key={`existing-${index}`} className={styles.imageItem}>
                        <div className={styles.imagePreview}>
                          <ImageIcon size={20} />
                          <div className={styles.imageInfo}>
                            <span className={styles.imageName}>Existing Image {index + 1}</span>
                            <span className={styles.imageSize}>Current image</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setExistingImages(prev => prev.filter((_, i) => i !== index));
                          }}
                          className={styles.removeImage}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    {/* Show new selected files */}
                    {selectedFiles.map((file, index) => (
                      <div key={`new-${index}`} className={styles.imageItem}>
                        <div className={styles.imagePreview}>
                          <FileImage size={20} />
                          <div className={styles.imageInfo}>
                            <span className={styles.imageName}>{file.name}</span>
                            <span className={styles.imageSize}>
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className={styles.removeImage}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {validationErrors.images && (
                <p className={styles.errorText}>{validationErrors.images}</p>
              )}
            </div>
          </div>



          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => router.push("/my-listings")}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isFormDisabled()}
              className={styles.submitButton}
            >
              {loading ? (
                <>
                  <Loader2 className={styles.spinner} />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Update Apartment' : 'Create Apartment'
              )}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
};

const CreateApartment = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateApartmentContent />
    </Suspense>
  );
};

export default CreateApartment; 
 