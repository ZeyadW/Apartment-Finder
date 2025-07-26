'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Bed, Bath, Square, MapPin, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apartmentAPI } from '@/services/api';
import styles from './ApartmentCard.module.css';
import { ReactNode, MouseEvent } from 'react';
import type { Apartment } from '@/types';

interface ApartmentCardProps {
  apartment: Apartment;
  actions?: ReactNode;
  onCardClick?: () => void;
  isFavorite?: boolean;
  onRemoveFavorite?: () => void;
}

const ApartmentCard = ({ apartment, actions, onCardClick, isFavorite, onRemoveFavorite }: ApartmentCardProps) => {
  const { user } = useAuth();
  const [favorite, setFavorite] = useState(isFavorite ?? false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    setFavorite(isFavorite ?? false);
  }, [isFavorite]);

  const handleFavoriteToggle = async () => {
    if (!user) return;
    setFavoriteLoading(true);
    try {
      if (favorite) {
        await apartmentAPI.removeFromFavorites(apartment._id);
        setFavorite(false);
        if (onRemoveFavorite) onRemoveFavorite();
      } else {
        await apartmentAPI.addToFavorites(apartment._id);
        setFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={styles.apartmentCard} onClick={onCardClick} style={onCardClick ? { cursor: 'pointer' } : {}}>
      <div className={styles.cardImage}>
        <img 
          src={apartment.images[0] || '/placeholder-apartment.jpg'} 
          alt={apartment.unitName}
          className={styles.cardImg}
        />
        <div className={styles.cardBadge}>
          {apartment.listingType === 'rent' ? 'For Rent' : 'For Sale'}
        </div>
        {user && user.role === 'user' && (
          <button
            onClick={e => { e.stopPropagation(); handleFavoriteToggle(); }}
            disabled={favoriteLoading}
            className={`${styles.favoriteButton} ${favorite ? styles.favorited : ''}`}
            title={favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={styles.favoriteIcon} fill={favorite ? '#dc3545' : 'none'} />
          </button>
        )}
      </div>
      
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{apartment.unitName}</h3>
          <p className={styles.cardSubtitle}>{apartment.project}</p>
        </div>
        
        <div className={styles.cardLocation}>
          <MapPin className={styles.locationIcon} />
          <span>{apartment.city}</span>
        </div>
        
        <p className={styles.cardDescription}>
          {apartment.description.length > 100 
            ? `${apartment.description.substring(0, 100)}...` 
            : apartment.description
          }
        </p>
        
        <div className={styles.cardDetails}>
          <div className={styles.detailItem}>
            <Bed className={styles.detailIcon} />
            <span>{apartment.bedrooms === 0 ? 'Studio' : `${apartment.bedrooms} bed`}</span>
          </div>
          <div className={styles.detailItem}>
            <Bath className={styles.detailIcon} />
            <span>{apartment.bathrooms} bath</span>
          </div>
          <div className={styles.detailItem}>
            <Square className={styles.detailIcon} />
            <span>{apartment.squareFeet} sq ft</span>
          </div>
        </div>
        
        <div className={styles.cardAmenities}>
          {(apartment.amenities || []).slice(0, 3).map((amenity, index) => (
            <span key={index} className={styles.amenityTag}>
              {amenity.name}
            </span>
          ))}
          {(apartment.amenities || []).length > 3 && (
            <span className={`${styles.amenityTag} ${styles.more}`}>
              +{(apartment.amenities || []).length - 3} more
            </span>
          )}
        </div>
        
        <div className={styles.cardFooter}>
          <div className={styles.cardPriceViewRow}>
            <div className={styles.cardPriceRow}>
              <span className={styles.priceAmount}>{formatPrice(apartment.price)}</span>
              <span className={styles.pricePeriod}> EGP{apartment.listingType === 'rent' ? '/month' : ''}</span>
            </div>
            {!actions && (
              <Link href={`/apartment/${apartment._id}`} className={styles.viewDetailsButton} onClick={e => e.stopPropagation()}>
                View Details
              </Link>
            )}
          </div>
          {actions && (
            <div className={styles.cardActionsRow} onClick={e => e.stopPropagation()}>
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApartmentCard; 