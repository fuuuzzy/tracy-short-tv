import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from "unplugin-vue-components/resolvers";


export default defineConfig({
    server: {
        host: 'localhost',
        port: 3600,
        proxy: {
            "/api": {
                target: `http://localhost`,
                changeOrigin: true, // 允许跨域
                rewrite: path => path.replace(/^\/api/, '')
            }
        },
    },

    plugins: [
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
    ],
    css: {devSourcemap: true},
    build: {
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            }
        }
    }

})
