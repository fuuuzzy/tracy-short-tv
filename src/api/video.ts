import {ApiGet} from "../utils/request";
import {getSignature, getTimestamp} from "../utils/encryptionPara";


/**
 * 获取轮播图
 */
export function getCarousel() {
    return ApiGet('/recommendation/theatre/list', {
        count: 6,
        need_shuffle: 1,
        copyright_status: 1,
        timestamp: getTimestamp(),
        signature: getSignature(),
    });
}

/**
 * 获取指定分类数据
 */
export function getCategoryById(ind: number) {
    return ApiGet('/theatre/list', {
        cid: ind,
        pageSize: 50,
        timestamp: getTimestamp(),
        signature: getSignature(),
    });
}

/**
 * 获取分类
 */
export function getCategories() {
    return ApiGet('/theatre/categories', {
        copyright_status: 1,
        timestamp: getTimestamp(),
        signature: getSignature(),
    });
}

/**
 * 获取视频详情
 */
export function getVideoDetail(id: number) {
    return ApiGet('/theatre/info', {
        id: id,
        timestamp: getTimestamp(),
        signature: getSignature(),
    });
}

/**
 * 获取视频剧集
 */
export function getEpisodes(id: number, index: number) {
    return ApiGet('/episode/list', {
        pageIdx: index,
        tid: id,
        timestamp: getTimestamp(),
        signature: getSignature(),
    });
}