// src/components/LoadingState.tsx
import React from 'react';

// Define the possible states
type LoadingStateType = 'idle' | 'loading' | 'success' | 'error';

// Define the props interface
interface LoadingStateProps {
  state: LoadingStateType;
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  state, 
  loadingMessage = "Processing...",
  successMessage = "Success!",
  errorMessage = "An error occurred" 
}) => {
  const getStatusColor = () => {
    switch (state) {
      case 'loading':
        return 'bg-violet-800';
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`transition-all duration-300 rounded-lg px-4 py-2 text-white ${getStatusColor()}`}>
        {state === 'loading' && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{loadingMessage}</span>
          </div>
        )}
        {state === 'success' && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}
        {state === 'error' && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingState;