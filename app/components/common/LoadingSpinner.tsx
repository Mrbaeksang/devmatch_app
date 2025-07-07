import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
};

export default LoadingSpinner;
