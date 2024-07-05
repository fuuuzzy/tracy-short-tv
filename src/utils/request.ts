import axios from "axios";

// 自定义loading加载动画
import {load} from "../components/Loading";

let loadingCount: number = 0;

const requestConf: any = (config: any) => {
    // 开启loading动画
    loadingCount++
    load.start('')
    return config;
}

const http = axios.create({
    baseURL: `https://ostapi.ibrave.ltd/v1/ost/site`,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
    },
})

http.interceptors.request.use(requestConf, (error) => {
    return Promise.reject(error)
})

http.interceptors.response.use(
    (response) => {
        // 关闭loading动画
        loadingCount--
        loadingCount == 0 && load.close()
        return response.data;
    },
    (error) => {
        return Promise.reject(error);
    }
)

export function ApiGet(url: string, params: any) {
    return http({
        url: url, method: 'get', params
    })
}

export {http};