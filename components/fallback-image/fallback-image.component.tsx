

import React from 'react';
import Image from 'next/image';
import { ImageProps } from 'next/image';

interface FallbackImageProps extends ImageProps {
  fallbackSvg: string;
}

export const FallbackImage: React.FC<FallbackImageProps> = ({ fallbackSvg, onError, ...props }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null; // Prevent infinite loop
    e.currentTarget.srcset = '';
    e.currentTarget.src = fallbackSvg;
    onError?.(e); // Call original onError if provided
  };

  return <Image {...props} onError={handleImageError} />;
};

