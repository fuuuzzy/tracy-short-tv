<template>
  <transition name="el-fade-in-linear">
    <div v-if="isShow" class="container">
      <!--手机端-->
      <div class="hidden-sm-and-up banner_wrap" @touchstart="touchS" @click="getPlay(data.banner.current.id)"
           @touchend="touchE">
        <!--<Swiper :initial-slide="0"-->
        <!--        :modules='[Autoplay]' :loop='true' :speed='300' :spaceBetween='8' :mousewheel='true' :autoplay='{-->
        <!--    delay: 3000,-->
        <!--    disableOnInteraction: false,-->
        <!--  }' slidesPerView="3" :centeredSlides='true'>-->
        <!--  <SwiperSlide v-for="(_item, _index) in banners" :index="_index">-->
        <!--    <div class="slotImage">-->
        <!--      <el-image style="border-radius: 5px;width: 100%; height: 100%; " :src="_item.poster" fit="fill"/>-->
        <!--    </div>-->
        <!--  </SwiperSlide>-->
        <!--</Swiper>-->
        <el-carousel v-model="data.banner.current" ref="wrap" :pause-on-hover="false"
                     :interval="5000" trigger="hover"
                     indicator-position="none"
                     height="200px" arrow="never">
          <el-carousel-item v-for="item in banners" :key="item">
            <el-image style="width: 100%; height: 100%; " :src="item.picture" fit="fill"/>
          </el-carousel-item>
        </el-carousel>
      </div>

      <!--轮播图-->
      <div v-if="bigBanner" @click="getPlay(data.banner.current.id)" class="banner hidden-sm-and-down"
           :style="{background:`url(${data.banner.current.picture}) `,backgroundRepeat: 'no-repeat', backgroundSize: 'cover'}">
        <!--<img alt="not found" :src="data.banner.current.picture"/>-->
        <div class="preview">
          <el-carousel @change="carousel" indicator-position="none" :interval="3000" height="240px" arrow="always">
            <el-carousel-item v-for="item in banners" :key="item">
              <el-image @click="getPlay(item.id)"
                        style="width: 60%; height: 80%;border-radius: 15px;"
                        :src="item.poster"
                        fit="contain"/>
              <div class="carousel-tags">
                <span>{{ item.year }}</span>
                <span>{{ item.cName }}</span>
              </div>
              <p class="carousel-title">{{ item.name }}</p>
            </el-carousel-item>
          </el-carousel>
        </div>
        <!--<img class="hot-tag" src="../../assets/image/img_tag_hot.png" alt="not found"/>-->
      </div>
      <!--影视-->
      <div class="content_item" v-for="item in data.info.content">
        <template v-if="item.show">
          <el-row class="row-bg  cus_nav" justify="space-between">
            <el-col :span="12" class="title">
              <span>{{ item.name }}</span>
            </el-col>
          </el-row>
          <el-row class="cus_content">
            <el-col :md="26" :lg="24" :xl="24" class="cus_content">
              <!--影片列表-->
              <FilmList v-if="item.movies" :col="6" :list="item.movies"/>
            </el-col>
          </el-row>
        </template>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
// 顶部轮播图
import "swiper/swiper-bundle.css";
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

import 'element-plus/theme-chalk/display.css'
import {onBeforeMount, reactive, ref} from "vue";
import FilmList from "../../components/index/FilmList.vue";
import {router} from "../../router/router";
import {getCarousel, getCategories, getCategoryById} from "../../api/video";

const isShow = ref<boolean>(false)
// 轮播数据拟态
let banners = [
  {
    id: 0,
    name: '',
    year: 0,
    cName: '',
    poster: '',
    picture: ''
  }
]

const getPlay = (id: any) => {
  router.push({
    path: "/play",
    query: {
      id: id,
    },
  });
}
const bigBanner = ref<boolean>(true)
// pc 背景图同步响应
const carousel = (index: number) => {
  bigBanner.value = false
  data.banner.current = banners[index]
  bigBanner.value = true
}
const handleImg = (e: Event) => {
  e.target.style.display = "none"
}

// 滑动开始
const wrap = ref<HTMLFormElement>()
const touchS = (e: any) => {
  //记录触摸起始位置
  data.banner.touch.star = e.changedTouches[0].pageX
}

//  滑动结束
const touchE = (e: any) => {
  data.banner.touch.end = e.changedTouches[0].pageX
  let distance = data.banner.touch.end - data.banner.touch.star
  if (distance >= 50) {
    // let index = data.banner.touch.index - 1
    // data.banner.touch.index = index >= 0 ? index : banners.length-1
    wrap.value?.prev()
  } else if (distance <= -50) {
    // let index = data.banner.touch.index + 1
    // data.banner.touch.index = index <= banners.length - 1 ? index : 0
    wrap.value?.next()
  }
  // wrap.value?.setActiveItem(data.banner.touch.index)
}

const data = reactive({
  info: {},
  banner: {
    current: {id: 1, name: '', year: 2024, cName: '', poster: '', picture: ''},
    touch: {index: 0, star: 0, end: 0,}
  }
})

const showCarousel = async () => {
  banners = []
  const carousel = await getCarousel()
  const arr = []
  for (const item of carousel.data) {
    arr.push(
        {
          id: item.id,
          name: item.title_en,
          year: item.release_date.split('-')[0],
          cName: item.tags_en_list[0],
          poster: item.poster_hd,
          picture: item.poster_hd_h
        }
    )
  }
  banners = arr
  data.banner.current = banners[0]
  isShow.value = true
}

const getVideoList = async () => {
  const categories = await getCategories()
  const ca2 = await getCategoryById(categories.data[1].id);
  const ca1 = await getCategoryById(categories.data[0].id);
  data.info = {
    content: [
      {
        show: true,
        name: categories.data[0].title_en,
        movies: ca1.data.data
      },
      {
        show: true,
        name: categories.data[1].title_en,
        movies: ca2.data.data
      }
    ]
  }
}
onBeforeMount(() => {
  showCarousel()
  getVideoList()
})
</script>

<style scoped>
.slotImage {
  width: 135px;
  height: 230px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 0 2px;
}

.container {
  margin: 0 auto;
}

.content_item {
  padding: 10px;
  margin-bottom: 25px;
}

.title {
  display: flex;
  text-align: left;
  height: 40px;
}

.title > a {
  min-width: 40px;
  color: #ffff;
}

a {
  color: #333;
  padding-top: 10px;
  text-decoration: none;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.cus_nav {
  border-bottom: 1px solid rgb(46, 46, 46);

  height: 40px;
}

.nav_ul {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  justify-content: end;
  margin: 0;
}

.nav_category > a {
  color: #c9c4c4;

}

.nav_category > a:hover {
  color: #1890ff;
}

.nav_ul > li {
  /*min-width: 60px;*/
  white-space: nowrap;
  line-height: 40px;
  margin: 0 8px;
  text-align: center;
  color: #999;
  font-size: 14px;
  font-weight: 400;
}


/*影片简介区域*/
.cus_content {
  padding-top: 15px;
}

.content_right {
  width: 100%;
  padding-left: 18px;
}

.content_right_item {
  display: flex;
  padding-left: 10px;
  border-bottom: 1px solid rgb(46, 46, 46);
}

.content_right_item > a {
  padding: 10px 15px 10px 0;
  color: hsla(0, 0%, 100%, .87);
  display: block;
  flex-grow: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
  white-space: nowrap;
}

.hot_title {
  text-align: left;
  margin: 8px 0;
}

:deep(.top_item) {
  color: red;
  /*font-style: oblique 10deg;*/
  font-style: italic;
  /*font-family: Inter;*/
  margin-right: 6px;
}

.content_right_item a span:hover {
  color: orange;
}


</style>

<!--移动端修改-->
<style scoped>
@media (min-width: 768px) {
  .cus_content_item {
    padding: 10px;
    overflow: hidden;
    /*margin-bottom: 10px;*/
  }
}

@media (max-width: 768px) {
  .cus_content_item {
    padding: 0 6px 0 0;
    margin-bottom: 10px;
    overflow: hidden;
  }

  .nav_ul {
    justify-content: end;
  }
}
</style>

<!--轮播图双端样式-->
<style scoped>
@media (max-width: 768px) {
  .content_item {
    padding: 10px;
    margin-bottom: 25px;
  }

  :deep(.el-carousel) {
    --el-carousel-arrow-size: 30px;
    --el-carousel-arrow-background: rgba(115, 133, 159, 0.5);
  }

  :deep(.el-carousel__arrow) {
    outline: none;
    border: none !important;
  }

  .el-carousel__item h3 {
    color: #475669;
    opacity: 0.75;
    line-height: 200px;
    margin: 0;
    text-align: center;
  }

  .el-carousel__item:nth-child(2n) {
    background-color: transparent;
  }

  .el-carousel__item:nth-child(2n + 1) {
    background-color: transparent;
  }

  :deep(.el-carousel__indicators) {
    width: 100% !important;
    text-align: right;
    height: 20px;
    line-height: 20px;
    padding-right: 10px;
    --el-carousel-indicator-padding-vertical: 0;
  }

  :deep(.el-carousel__button) {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    padding: 0 0 !important;
    margin: 0 2px;
  }

  .banner_wrap {
    margin: -5px 0 0 0;
    position: relative;
    box-shadow: 0 5px 30px 0 rgba(255, 255, 255, 0.15);
  }

  .carousel-tags {
    position: absolute;
    top: 170px;
    left: 25%;
  }

  .carousel-tags span {
    font-size: 12px;
    background: rgba(0, 0, 0, 0.55);
    color: #ffffff;
    padding: 2px 5px;
    margin: 2px 5px;
  }

  .carousel-title {
    font-size: 12px;
    position: absolute;
    bottom: 0;
    height: 20px;
    line-height: 20px;
    background: rgba(0, 0, 0, 0.5);
    text-align: left;
    width: 100%;
    margin: 0 auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis; /* 显示省略号 */
  }
}


@media (min-width: 768px) {
  .hot-tag {
    position: absolute;
    width: 120px !important;
    height: 50px !important;
    left: 0;
  }

  :deep(.el-carousel) {
    --el-carousel-arrow-size: 30px;
    --el-carousel-arrow-background: rgba(115, 133, 159, 0.5);
  }

  :deep(.el-carousel__arrow) {
    outline: none;
    border: none !important;
  }

  .container {
    /*    padding-top: 660px;*/
  }

  .banner2 {
    height: 600px;
    position: absolute;
    margin-top: 60px;
    left: 0;
    top: 0;
    box-shadow: inset 0 -40px 30px 20px rgba(0, 0, 0, 0.6), 0 5px 30px 0 rgba(255, 255, 255, 0.15);
    padding: 2%;
    margin-bottom: 10px;
    border-radius: 0 0 6px 6px;
    width: 100%;
  }

  .preview2 {
    width: 260px;
    height: 200px;
    position: absolute;
    right: 50px;
    bottom: 60px;
  }

  .banner {
    cursor: pointer;
    height: 600px;
    position: relative;
    padding: 2%;
    box-shadow: inset 0 -40px 50px 20px rgba(0, 0, 0, 0.6),
    0 5px 30px 0 rgba(255, 255, 255, 0.15);
    margin-bottom: 10px;
    border-radius: 6px;
    width: 100%;
  }

  .banner img {
    width: 100%;
    height: 100%;
    object-fit: fill;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 6px;
  }

  .preview {
    width: 260px;
    height: 200px;
    position: absolute;
    right: 50px;
    bottom: 60px;
    /*  border: 1px solid skyblue;*/
  }

  .el-carousel__item h3 {
    color: #475669;
    opacity: 0.75;
    line-height: 200px;
    margin: 0;
    text-align: center;
  }

  .el-carousel__item:nth-child(2n) {
    background-color: transparent;
  }

  .el-carousel__item:nth-child(2n + 1) {
    background-color: transparent;
  }

  :deep(.el-carousel__indicators) {
    width: 100% !important;
  }

  :deep(.el-carousel__button) {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin: 0 2px;
  }

  .carousel-tags {
    position: absolute;
    top: 170px;
    left: 20%;
  }

  .carousel-tags span {
    font-size: 12px;
    background: rgba(0, 0, 0, 0.55);
    color: #ffffff;
    padding: 2px 5px;
    margin: 2px 5px;
  }

  .carousel-title {
    font-size: 12px;
    max-width: 50%;

    margin: 0 auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis; /* 显示省略号 */
  }
}
</style>

