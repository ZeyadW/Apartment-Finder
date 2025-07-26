'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Bed, Bath, Square, MapPin, Check } from 'lucide-react';
import { apartmentAPI } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import './ApartmentDetails.css';
import type { Apartment, Developer, Compound } from '@/types';

const ApartmentDetails = () => {
  const params = useParams();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const id = params.id as string;

  // Query for apartment details
  const {
    data: apartment,
    isLoading,
    error,
  } = useQuery<Apartment>({
    queryKey: ['apartment', id],
    queryFn: () => apartmentAPI.getById(id).then((res: any) => res.data),
    enabled: !!id,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const nextImage = () => {
    if (apartment && apartment.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === apartment.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (apartment && apartment.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? apartment.images.length - 1 : prev - 1
      );
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading apartment details...</p>
      </div>
    );
  }

  if (error || !apartment) {
    return (
      <div className="error-container">
        <h2>Apartment Not Found</h2>
        <p>Failed to load apartment details. Please try again later.</p>
        <button onClick={() => router.push('/')} className="btn btn-primary">
          Back to Listings
        </button>
      </div>
    );
  }

  return (
    <div className="apartment-details">
      <div className="container">
        <button onClick={() => router.push('/')} className="back-button">
          <ArrowLeft className="back-icon" />
          Back to Listings
        </button>

        <div className="details-header">
          <h1 className="details-title">{apartment.unitName}</h1>
          <p className="details-subtitle">{apartment.project}</p>
          <div className="details-meta">
            <span className="details-developer">Developer: {typeof apartment.developer === 'object' ? (apartment.developer as Developer).name : apartment.developer}</span>
            <span className="details-compound">Compound: {typeof apartment.compound === 'object' ? (apartment.compound as Compound).name : apartment.compound}</span>
            <span className="details-listing-type">{apartment.listingType === 'rent' ? 'For Rent' : 'For Sale'}</span>
          </div>
          <div className="details-location">
            <MapPin className="location-icon" />
            <span>{apartment.address}, {apartment.city}</span>
          </div>
        </div>

        <div className="details-content">
          <div className="image-section">
            <div className="main-image">
              <img 
                src={apartment.images[currentImageIndex] || '/placeholder-apartment.jpg'} 
                alt={apartment.unitName}
                className="detail-image"
              />
              {apartment.images.length > 1 && (
                <>
                  <button onClick={prevImage} className="image-nav prev">
                    ‹
                  </button>
                  <button onClick={nextImage} className="image-nav next">
                    ›
                  </button>
                  <div className="image-counter">
                    {currentImageIndex + 1} / {apartment.images.length}
                  </div>
                </>
              )}
            </div>
            
            {apartment.images.length > 1 && (
              <div className="image-thumbnails">
                {apartment.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${apartment.unitName} - Image ${index + 1}`}
                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="info-section">
            <div className="price-card">
              <div className="price-header">
                <span className="price-amount">{formatPrice(apartment.price)}</span>
                <span className="price-period"> EGP{apartment.listingType === 'rent' ? '/month' : ''}</span>
              </div>
              <div className="availability-badge">
                {apartment.listingType === 'rent' ? 'For Rent' : 'For Sale'}
              </div>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <Bed className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Bedrooms</span>
                  <span className="detail-value">{apartment.bedrooms === 0 ? 'Studio' : apartment.bedrooms}</span>
                </div>
              </div>
              
              <div className="detail-item">
                <Bath className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Bathrooms</span>
                  <span className="detail-value">{apartment.bathrooms}</span>
                </div>
              </div>
              
              <div className="detail-item">
                <Square className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Square Feet</span>
                  <span className="detail-value">{apartment.squareFeet.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="description-section">
              <h3>Description</h3>
              <p>{apartment.description}</p>
            </div>

            <div className="amenities-section">
              <h3>Amenities</h3>
              <div className="amenities-grid">
                {(apartment.amenities || []).map((amenity, index) => (
                  <div key={index} className="amenity-item">
                    <Check className="amenity-icon" />
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentDetails; 