import { useState } from 'react';

export function useErrorTest() {
  const [shouldThrow, setShouldThrow] = useState(false);
  
  const throwError = () => {
    setShouldThrow(true);
  };
  
  if (shouldThrow) {
    throw new Error('This is a test error from useErrorTest hook');
  }
  
  return { throwError };
}