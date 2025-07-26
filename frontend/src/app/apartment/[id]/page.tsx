'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ApartmentDetails from '@/components/ApartmentDetails/ApartmentDetails';

export default function ApartmentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      // Update the URL to include the id as a search parameter
      const url = new URL(window.location.href);
      url.searchParams.set('id', id);
      window.history.replaceState({}, '', url.toString());
    }
  }, [id]);

  return <ApartmentDetails />;
} 
 