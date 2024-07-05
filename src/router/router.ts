import {createRouter, createWebHistory,} from "vue-router";

// 1.定义路由组件
import IndexHome from "../views/IndexHome.vue";
import Home from "../views/index/Home.vue";
import Play from "../views/index/Play.vue";
import FilmClassify from "../views/index/FilmClassify.vue";
import privacy from "../views/privacy/privacy.vue";
import copyright from "../views/privacy/copyright.vue";
import user from "../views/privacy/user.vue";
import {getToken} from "../utils/token";


// 2. 定义一个路由
const routes = [
    {
        path: '/',
        component: IndexHome,
        redirect: '/index',
        children: [
            {path: 'index', component: Home},
            {path: 'play', component: Play},
            {path: 'filmClassify', component: FilmClassify},
            {path: 'privacy', component: privacy},
            {path: 'user', component: user},
            {path: 'copyright', component: copyright},
        ]
    },
    {path: `/:pathMatch(.*)*`, redirect: '/index'},
]

// 创建路由实例并传递 routes配置
const router = createRouter({
    history: createWebHistory(),
    routes
})

// 添加全局前置守卫拦截未登录的跳转
router.beforeEach((to, from, next) => {
    // 如果访问的是 /manage 下的路由, 且 token信息为空 则跳转到登录界面
    let matchPath = new RegExp(/^\/manage\//).test(to.path)
    let token = getToken()
    if (matchPath && !token) {
        next('/login')
    } else {
        next()
    }
})


export {router}

