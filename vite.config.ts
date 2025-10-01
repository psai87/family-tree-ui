import {defineConfig} from 'vite'
import path from "path"
import reactSWC from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
    base: '/family-tree-ui/',
    plugins: [reactSWC(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },

})
