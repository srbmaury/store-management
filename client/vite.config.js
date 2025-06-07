import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			'/api': 'https://store-management-js3x.onrender.com/',
		},
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/test/setup.js',
	},
});
