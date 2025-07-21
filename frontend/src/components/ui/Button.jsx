import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
        destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
        outline: 'border border-gray-600 bg-transparent text-white hover:bg-gray-800 active:bg-gray-700',
        secondary: 'bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-500',
        ghost: 'bg-transparent text-white hover:bg-gray-800 active:bg-gray-700',
        link: 'bg-transparent underline-offset-4 hover:underline text-blue-400 hover:text-blue-300'
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 text-sm',
        lg: 'h-11 px-6 text-lg',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export const Button = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => {
    // Enhanced debugging
    console.log('Button rendering:', { variant, size, className });
    
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }), 'inline-flex !visible')}
        ref={ref}
        style={{ 
          display: 'inline-flex !important', /* Force display with !important */
          cursor: props.disabled ? 'not-allowed' : 'pointer',
          justifyContent: 'center',
          alignItems: 'center',
          visibility: 'visible !important',
          opacity: '1 !important'
        }}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
