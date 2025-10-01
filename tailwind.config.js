/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
                oswald: ['Oswald', 'sans-serif'],
                fancy: ['Oswald', 'sans-serif'],
            },
            colors: {
                'siri-dark': '#1a202c',
                'siri-bg': '#F4F6F8',
                navy: {
                    DEFAULT: '#00004d', // Use a deep navy for the sidebar
                },
                orange: {
                    DEFAULT: '#f97316', // Vibrant orange
                    light: '#fff7ed', // Light orange for the main background
                    dark: '#ea580c', // Darker orange for hover effects
                },
            }
        },
    },
    plugins: [],
}