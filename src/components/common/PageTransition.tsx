'use client';

import React from 'react';
import { useWellness } from '../../context/WellnessContext';

interface PageTransitionProps {
  children: React.ReactNode;
  transitionKey: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, transitionKey }) => {
  const { accessibility } = useWellness();

  if (accessibility.reducedMotion) {
    return <div key={transitionKey}>{children}</div>;
  }

  return (
    <div key={transitionKey} className="animate-page-enter w-full">
      {children}
    </div>
  );
};
