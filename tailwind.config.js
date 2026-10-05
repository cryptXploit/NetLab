/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        overlay: 'var(--bg-overlay)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        'border-base': 'var(--border-base)',
        'border-strong': 'var(--border-strong)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-soft': 'var(--accent-soft)',
        tech: 'var(--tech-accent)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        
        'link-active': 'var(--link-active)',
        'link-disabled': 'var(--link-disabled)',
        'device-host': 'var(--device-host)',
        'device-switch': 'var(--device-switch)',
        'device-router': 'var(--device-router)',
      }
    },
  },
  plugins: [],
}
