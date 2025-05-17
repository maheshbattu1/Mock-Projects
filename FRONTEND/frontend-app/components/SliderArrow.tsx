'use client';

import React from 'react';

interface ArrowProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  direction: 'prev' | 'next';
}

export const SliderArrow: React.FC<ArrowProps> = ({ 
  className, 
  style, 
  onClick, 
  direction 
}) => {
  return (
    <div
      className={`${className} custom-arrow ${direction === 'prev' ? 'custom-prev' : 'custom-next'}`}
      style={{ 
        ...style, 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
        zIndex: 2,
        cursor: 'pointer'
      }}
      onClick={onClick}
    >
      {direction === 'prev' ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </div>
  );
};
