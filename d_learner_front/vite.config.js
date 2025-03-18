import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    // server: {
    //     proxy: {
    //         '/': {
    //             target: 'https://serene-woodland-45485-b6d1865e6702.herokuapp.com/',
    //             changeOrigin: true,
    //             secure: false
    //         }
    //     }
    // },
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.js': 'jsx'
            }
        }
    }
});