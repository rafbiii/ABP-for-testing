// Theme Utility
// Manages theme persistence across page reloads

// Initialize theme on app load
export const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  
  // Default to light mode if no theme is saved
  if (!savedTheme) {
    localStorage.setItem('theme', 'light');
    document.body.classList.remove('dark-mode');
    return 'light';
  }
  
  // Apply saved theme
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  
  return savedTheme;
};

// Toggle theme
export const toggleTheme = () => {
  const currentTheme = localStorage.getItem('theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  localStorage.setItem('theme', newTheme);
  
  if (newTheme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  
  return newTheme;
};

// Set specific theme
export const setTheme = (theme) => {
  localStorage.setItem('theme', theme);
  
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  
  return theme;
};

// Get current theme
export const getCurrentTheme = () => {
  return localStorage.getItem('theme') || 'light';
};

// Force light mode (for specific pages)
export const forceLightMode = () => {
  localStorage.setItem('theme', 'light');
  document.body.classList.remove('dark-mode');
};

// Force dark mode (for specific pages)
export const forceDarkMode = () => {
  localStorage.setItem('theme', 'dark');
  document.body.classList.add('dark-mode');
};
