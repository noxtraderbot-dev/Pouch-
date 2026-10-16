/**
 * Pure Horizontal Sliding Image Carousel for JP MORGAN Landing Page
 * Displays one complete image at a time, advancing every 2 seconds.
 * No bottom caption line, no embedded text banners, no repeated images.
 */

import React, { useState, useEffect } from 'react';

export interface CarouselImage {
  url: string;
  alt: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  intervalMs?: number;
  className?: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  intervalMs = 2000,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [images.length, intervalMs]);

  if (!images || images.length === 0) return null;

  return (
    <div className={`relative overflow-hidden w-full h-full select-none ${className}`}>
      {/* Sliding Track - 100% width per slide, smooth transition */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img, index) => (
          <div
            key={index}
            className="w-full h-full flex-shrink-0 relative overflow-hidden bg-slate-900"
            style={{ width: '100%', minWidth: '100%' }}
          >
            <img
              src={img.url}
              alt={img.alt}
              className="w-full h-full object-cover object-center"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {/* Subtle minimalist indicator dots in top right - no bottom lines */}
      {images.length > 1 && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-slate-950/60 backdrop-blur-xs px-2.5 py-1 rounded-full border border-slate-700/50">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx ? 'bg-amber-400 w-4' : 'bg-white/40 w-1.5 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
