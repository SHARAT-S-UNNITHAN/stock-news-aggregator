import React from 'react';
import { Loader } from 'lucide-react';

function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader className={`${sizeClasses[size]} animate-spin text-blue-600 mb-4`} />
      {text && <p className="text-gray-500 dark:text-gray-400">{text}</p>}
    </div>
  );
}

export default LoadingSpinner;