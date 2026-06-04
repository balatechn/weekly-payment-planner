import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  darkMode: localStorage.getItem('darkMode') === 'true',
  
  toggleDarkMode: () => set((state) => {
    const newDarkMode = !state.darkMode;
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    return { darkMode: newDarkMode };
  }),
  
  initTheme: () => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }
}));
