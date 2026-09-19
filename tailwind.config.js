/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary:  '#2563EB',
                'primary-hover': '#1D4ED8',
                header:   '#1E293B',
                success:  '#22C55E',
                warning:  '#F59E0B',
                danger:   '#EF4444',
                bg:       '#F8FAFC',
                border:   '#E2E8F0',
                text:     '#0F172A',
            },
        },
    },
    prefix: 'tw-',
    corePlugins: {
        preflight: false,
    },
    plugins: [],
}
