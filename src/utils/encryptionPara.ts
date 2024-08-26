import {md5} from 'js-md5';
// 封装生成时间戳和签名的函数  
// 导出获取时间戳的函数  
export function getTimestamp() {
    return Math.floor(new Date().getTime() / 1000);
}

// 导出获取签名的函数，它依赖于getTimestamp函数  
export function getSignature() {
    const timestamp = getTimestamp(); // 调用getTimestamp函数来获取当前时间戳  
    return md5(timestamp + "");
}