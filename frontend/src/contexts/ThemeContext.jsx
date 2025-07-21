import React, { createContext, useContext, useState, useEffect } from 'react';

// Define theme colors
const darkTheme = {
  bg: {
    primary: '#121212',
    secondary: '#1e1e1e',
    tertiary: '#2d2d2d',
    card: '#1a1a1a',
    input: '#2d2d2d'
  },
  text: {
    primary: '#ffffff',
    secondary: '#e0e0e0',
    tertiary: '#a0a0a0',
    accent: '#90caf9'
  },
  button: {
    primary: '#1976d2',
    hover: '#1565c0',
    text: '#ffffff'
  },
  border: {
    primary: '#333333',
    input: '#444444',
    focus: '#1976d2'
  }
};

const ThemeContext = createContext(darkTheme);

export const ThemeProvider = ({ children }) => {
  const [theme] = useState(darkTheme);
  
  useEffect(() => {
    // Apply theme to document body
    document.body.style.backgroundColor = theme.bg.primary;
    document.body.style.color = theme.text.primary;
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
