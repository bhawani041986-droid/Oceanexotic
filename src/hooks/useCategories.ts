import { useState, useEffect } from 'react';
import { PRODUCT_CATEGORIES as FALLBACK_CATEGORIES } from '@/constants/categories';

export function useCategories() {
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to fetch dynamic categories, using fallback");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  return { categories, isLoading };
}
