import React from 'react';
import { cn } from '../../utils/cn';

export const Label = ({ htmlFor, className, children, ...props }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'text-sm font-medium leading-none text-gray-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
};

export const FormGroup = ({ className, children, ...props }) => {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {children}
    </div>
  );
};

export const FormError = ({ className, children, ...props }) => {
  if (!children) return null;
  
  return (
    <p
      className={cn('text-sm font-medium text-red-400', className)}
      {...props}
    >
      {children}
    </p>
  );
};
