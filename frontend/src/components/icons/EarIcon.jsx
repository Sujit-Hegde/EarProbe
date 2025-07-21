import React from 'react';

export const EarIcon = ({ className, width = 24, height = 24 }) => {
  return (
    <img 
      src="https://www.svgrepo.com/show/452445/ear.svg" 
      alt="Ear logo" 
      width={width} 
      height={height} 
      className={className} 
    />
  );
};

export default EarIcon;
