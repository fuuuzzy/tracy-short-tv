import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import {router} from "./router/router";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)

app.mount('#app')

export default app

