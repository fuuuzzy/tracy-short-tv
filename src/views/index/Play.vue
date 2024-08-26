<template>
  <transition name="el-fade-in-linear">
    <div class="player_area" v-show="data.loading">
      <div class="player_p">
        <video-player @mounted="playerMount" :src="data.options.src" :poster="data.detail.picture" controls
                      @ready="beforePlay"
                      @ended="isAutoPlay"
                      @timeupdate="updateProgress"
                      :loop="false"
                      @keydown="handlePlay"
                      :bufferedPercent="30"
                      :volume="data.options.volume"
                      crossorigin="anonymous" playsinline class="video-player"
                      :playback-rates="[0.5, 1.0, 1.5, 2.0]"/>
        <div class="adBox_max" ref="adContainer"></div>
      </div>
      <div class="current_play_info">
        <div class="play_info_left">
          <h3 class="current_play_title">{{ data.detail.name }} · Episode {{ data.current.episode }}</h3>
          <p>{{ data.detail.descriptor.content }}</p>
        </div>
        <div class="play_info_right">
          <a href="javascript:;" :class="`iconfont icon-play1 ${data.autoplay?'p_r_active':''}`"
             @click="()=>{data.autoplay= !data.autoplay}"></a>
          <a v-show="hasNext" href="javascript:;" class="iconfont icon-iov-next"
             @click="playNext"></a>
        </div>
      </div>
      <!-- 播放选集   -->
      <div class="play-module">
        <div class="play-module-item">
          <div class="module-heading">
            <p class="play-module-title">Episode List · Total {{ data.epCount }} Ep </p>
            <div class="play-tab-group">
              <a href="javascript:;" :class="`play-tab-item ${data.currentTabId == item.id ? 'tab-active':''}`"
                 v-for="item in data.detail.list" @click="changeTab(item.id)">{{ item.name }}</a>
            </div>
          </div>
          <div class="play-list">
            <div class="play-list-item" v-show="data.currentTabId == item.id" v-for="item in data.detail.list">
              <a :class="`play-link ${v.episode == data.current.episode?'play-link-active':''}`"
                 v-for="(v,i) in item.linkList"
                 href="javascript:;" @click="playChange({sourceId: item.id, episodeIndex: i, target: this})">{{
                  v.episode
                }}
                <img v-if="i >= data.detail.free" class="right_top" src="../../assets/image/icon_lock@2x.png" alt="">
              </a>
            </div>
          </div>
        </div>
      </div>
      <!--相关推荐-->
      <div class="correlation">
        <RelateList :relateList="data.relate"/>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import {computed, onBeforeMount, reactive, ref} from "vue";
import {useRouter} from "vue-router";
import {COOKIE_KEY_MAP, cookieUtil} from '../../utils/cookie'
// 引入视频播放器组件
import {VideoPlayer} from '@videojs-player/vue'
import {ElMessage} from 'element-plus'
import 'video.js/dist/video-js.css'
import {getCarousel, getEpisodes, getVideoDetail} from "../../api/video";
import RelateList from "../../components/index/RelateList.vue";

// 播放源切换事件
const changeTab = (id: string) => {
  data.currentTabId = id
  playChange({sourceId: id, episodeIndex: data.current.episode - 1, target: null})
}

// 播放页所需数据
const data: any = reactive({
  loading: false,
  detail: {
    id: '',
    free: 0,
    epCount: 0,
    name: '',
    picture: '',
    playFrom: [],
    DownFrom: '',
    playList: [[]],
    downloadList: '',
    descriptor: {
      subTitle: '',
      cName: '',
      enName: '',
      initial: '',
      classTag: '',
      actor: '',
      director: '',
      writer: '',
      blurb: '',
      remarks: '',
      releaseDate: '',
      area: '',
      language: '',
      year: '',
      state: '',
      updateTime: '',
      addTime: '',
      dbId: '',
      dbScore: '',
      hits: '',
      content: '',
    },
    list: [],
  },
  current: {index: 0, episode: '', link: ''},
  currentEpisode: 0,
  relate: [],
  currentTabId: '', // 当前播放源ID
// @videojs-player 播放属性设置
  autoplay: true,
  options: {
    title: "", //视频名称
    src: "", //视频源
    volume: 0.6, // 音量
    currentTime: 50,
  },
})
//
const hasNext = computed(() => {
  let flag = false
  data.detail.list.forEach((item: any) => {
    if (data.currentTabId == item.id) {
      flag = data.current.index != item.linkList.length - 1
    }
  })
  return flag
})
let video = ref();
let adsLoaded = ref(false);
let adContainer = ref();
let adDisplayContainer: any;
let adsLoader: any;
let adsManager: any
const isExecuted = ref(false)

const initializeIMA = () => {
  google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);
  adDisplayContainer = new google.ima.AdDisplayContainer(adContainer.value);
  adsLoader = new google.ima.AdsLoader(adDisplayContainer);
  adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded,
      false
  );
  adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError, false);

  var adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl = "https://pubads.g.doubleclick.net/gampad/ads?" +
      "iu=/21775744923/external/single_ad_samples&sz=640x480&" +
      "cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&" +
      "gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=";
  adsLoader.requestAds(adsRequest);
};

const onAdsManagerLoaded = (adsManagerLoadedEvent: any) => {
  // Instantiate the AdsManager from the adsLoader response and pass it the video element
  adsManager = adsManagerLoadedEvent.getAdsManager(video);
  adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
  // 广告暂停
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      onContentPauseRequested
  );
  // 广告恢复
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      onContentResumeRequested
  );
  // 非线性广告
  adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, onAdLoaded);
  // 用户点击广告
  adsManager.addEventListener(google.ima.AdEvent.Type.CLICK, onAdClick);
  // 在广告已准备好（无需缓冲）的情况下播放时（在广告开始时或缓冲完毕后）触发。
  adsManager.addEventListener(google.ima.AdEvent.Type.AD_CAN_PLAY, onCanPlay);

  loadAds();
};
const onContentPauseRequested = () => {
  video.value.pause();
};
const onContentResumeRequested = () => {
  setTimeout(() => {
    isExecuted.value = false;
  }, 2000);
  adContainer.value.innerHTML = "";
  adContainer.value.style.display = "none";
  video.value.play()
};
const onAdError = (adErrorEvent: any) => {
  let errorCode = adErrorEvent.getError().data.errorCode

  setTimeout(() => {
    isExecuted.value = false;
  }, 2000);
  adContainer.value.style.display = "none";
  console.log(adErrorEvent.getError())
  if (adsManager) {
    adsManager.destroy();
  }
  adContainer.value.innerHTML = "";
  video.value.play()
};
const loadAds = () => {
  if (adsLoaded.value) {
    return;
  }
  video.value.pause();
  adsLoaded.value = true;
  adDisplayContainer.initialize();
  const width = video.clientWidth;
  const height = video.clientHeight;
  try {
    adsManager.init(width, height, google.ima.ViewMode.NORMAL);
    adsManager.start();
    adsManager.setVolume(1);
  } catch (adError) {
    console.log("AdsManager could not be started");
    video.value.play();
  }
};
const onAdLoaded = (adEvent: any) => {
  var ad = adEvent.getAd();
  if (!ad.isLinear()) {
    video.value.play();
  }
};
const onAdClick = () => {

};
const onCanPlay = () => {

};

const playfun = () => {
  // 判断广告是否加载
  if (adsLoaded.value) {
    adsLoaded.value = false;
    initializeIMA();
  } else {
    initializeIMA();
  }
};

// 播放进度
const updateProgress = (ev: any) => {
  // if (ev.target.player.cache_.currentTime) {
  //   if ((Math.floor(ev.target.player.cache_.currentTime) == 0 && !isExecuted.value)) {
  //     isExecuted.value = true;
  //     adContainer.value.style.display = 'block'
  //     video.value.pause();
  //     playfun();
  //   }
  // }
};

// 获取路由信息
const router = useRouter()

// 点击播集数播放对应影片
const playChange = (play: { sourceId: string, episodeIndex: number, target: any }) => {
  if (play.episodeIndex >= data.detail.free) {
    ElMessage({
      message: 'Please play the videos in order and the full will be unlocked automatically.',
      type: 'warning',
    })
    return;
  }
  data.detail.list.forEach((item: any) => {
    if (item.id == play.sourceId) {
      let currPlay = item.linkList[play.episodeIndex]
      data.current = {index: play.episodeIndex, episode: currPlay.episode, link: currPlay.link}
      data.currentEpisode = play.episodeIndex
      data.options.src = currPlay.link
      data.options.title = data.detail.name + "  " + currPlay.episode
      data.currentTabId = play.sourceId
      if (data.autoplay) {
        setTimeout(() => {
          video.value.play()
        }, 1000)
      }
      return
    }
  })
}

// player相关事件
const handlePlay = (e: any) => {
  e.preventDefault()
  switch (e.keyCode) {
    case 32:
      if (e.target.paused) {
        e.target.play()
      } else {
        e.target.pause()
      }
      break
    case 37:
      e.target.currentTime = e.target.currentTime - 5 < 0 ? 0 : e.target.currentTime - 5
      break
    case 39:
      e.target.currentTime = e.target.currentTime + 5 > e.target.duration ? e.target.duration : e.target.currentTime + 5
      break
    case 38:
      data.options.volume = data.options.volume + 0.05 > 1 ? 1 : data.options.volume + 0.05
      break
    case 40:
      data.options.volume = data.options.volume - 0.05 < 0 ? 0 : data.options.volume - 0.05
      break
  }
}
// 播放结束后是否自动播放下一集
const isAutoPlay = () => {
  if (!data.autoplay) {
    return
  }
  playNext()
}
// 点击下一集按钮
const playNext = () => {
  // 如果不存在下一集信息则直接返回
  if (!hasNext.value) {
    return
  }
  playChange({sourceId: data.currentTabId, episodeIndex: data.current.index + 1, target: ''})
}
// 主动触发快捷键
const triggerKeyMap = (keyCode: number) => {
  let player = document.getElementsByTagName("video")[0]
  player.focus()
  const event = document.createEvent('HTMLEvents');
  event.initEvent('keydown', true, false);
  event.keyCode = keyCode; // 设置键码
  player.dispatchEvent(event)
}
const handleBtn = (e: any) => {
  let btns = document.getElementsByClassName('vjs-button')
  for (let el of btns) {
    el.addEventListener('keydown', function (t: any) {
      t.preventDefault()
      triggerKeyMap(t.keyCode)
    })
  }
}
// player 加载完成事件
const playerMount = (e: any) => {
  // 处理功能按钮相关事件
  handleBtn(e)
  video.value = e.player
}
// player 准备就绪事件
const beforePlay = (e: any) => {
  // 从router参数中获取时间信息
  let currentTime = router.currentRoute.value.query.currentTime
  currentTime && e.target.player.currentTime(currentTime)
}


//影片信息加入本地的观看历史中, 先获取cookie,已存在则追加,否则添加
const saveFilmHistory = () => {
  if (data.options.src.length > 0) {
    let player = document.getElementsByTagName("video")[0]
    let histories = cookieUtil.getCookie(COOKIE_KEY_MAP.FILM_HISTORY) ? JSON.parse(cookieUtil.getCookie(COOKIE_KEY_MAP.FILM_HISTORY)) : {}
    let link = `/play?id=${data.detail.id}&current=${data.currentEpisode}&currentTime=${player.currentTime}`
    histories[data.detail.id] = {
      name: data.detail.name,
      link: link,
      id: data.detail.id,
      episode: data.current.episode,
      title_en: data.detail.name,
      tags_en_list: data.detail.descriptor.classTag.split('#'),
      poster_hd: data.detail.picture,
      desc: data.detail.descriptor.content,
      release_date: data.detail.descriptor.releaseDate,
      timeStamp: (new Date()).valueOf()
    }
    cookieUtil.setCookie(COOKIE_KEY_MAP.FILM_HISTORY, JSON.stringify(histories))
  }
}

// 在浏览器关闭前或页面刷新前将当前影片的观看信息存入历史记录中
window.addEventListener('beforeunload', saveFilmHistory)

const getInfo = async (link: any) => {
  const videoDetail = await getVideoDetail(link);
  let episodeList: any = [];
  for (let i = 1; ; i++) {
    const episode = await getEpisodes(link, i)
    if (episode.data.data.length === 0) {
      break;
    }
    episodeList.push(...episode.data.data)
  }
  const playList: any = []
  const playSdList: any = []
  for (const item of episodeList) {
    let videoLink: any = item.video_hd
    let videoLinkSd: any = item.video_sd
    if (item.m3u8_hd) {
      videoLink = item.m3u8_hd
    }
    if (item.m3u8_sd) {
      videoLinkSd = item.m3u8_sd
    }
    playList.push({
      episode: item.rank,
      link: videoLink
    })
    playSdList.push({
      episode: item.rank,
      link: videoLinkSd
    })
  }
  for (let i = episodeList.length + 1; i <= videoDetail.data.episode_count; i++) {
    playList.push({
      episode: i,
      link: ""
    })
    playSdList.push({
      episode: i,
      link: ""
    })
  }
  const list: any = [{
    id: 1,
    name: "HD",
    linkList: playList
  },
    {
      id: 2,
      name: "SD",
      linkList: playSdList
    }]
  data.detail.id = link
  data.epCount = videoDetail.data.episode_count
  data.detail.name = videoDetail.data.title_en
  data.detail.picture = videoDetail.data.poster_hd_h
  data.detail.free = videoDetail.data.free_episode_count
  data.detail.playFrom = ['network']
  data.detail.DownFrom = 'http'
  data.detail.playList = [playList, playSdList]
  data.detail.list = list
  data.current.episode = "1"
  data.current.link = playList[0].link
  let current = router.currentRoute.value.query.current
  if (current) {
    data.current.episode = Number(current) + 1 + ""
    data.current.link = playList[Number(current)].link
    if (playList[Number(current)].link) {
      data.current.link = playList[Number(current)].link
    }
  }
  data.currentTabId = "1"

  data.detail.descriptor.actor = "network"
  data.detail.descriptor.area = "EN"
  data.detail.descriptor.dbId = link
  data.detail.descriptor.addTime = Date.now().toString()
  data.detail.descriptor.hits = "0"
  data.detail.descriptor.blurb = videoDetail.data.desc
  data.detail.descriptor.content = videoDetail.data.desc
  data.detail.descriptor.classTag = videoDetail.data.tags_en
  data.detail.descriptor.cName = videoDetail.data.intro
  data.detail.descriptor.dbScore = "0.0"
  data.detail.descriptor.director = "network"
  data.detail.descriptor.enName = videoDetail.data.title_en
  data.detail.descriptor.initial = "network"
  data.detail.descriptor.language = "en"
  data.detail.descriptor.releaseDate = videoDetail.data.release_date
  data.detail.descriptor.remarks = videoDetail.data.desc
  data.detail.descriptor.year = videoDetail.data.release_date
  data.loading = true
  data.options.src = data.current.link

  //推荐
  const carousel = await getCarousel();
  data.relate = carousel.data
}

// 初始化页面数据
onBeforeMount(() => {
  getInfo(router.currentRoute.value.query.id)
})
</script>

<style scoped>
@import "/src/assets/css/film.css";
/*vue3-video-play 相关设置*/
/*//播放器控件区域大小*/
.video-player {
  width: 100% !important;
  height: 100% !important;
  position: absolute;
  border-radius: 6px;
}

.adBox_max {
  position: absolute;
  display: none;
  width: 100%;
  height: 100%;
  z-index: 999999999;
}

:deep(.vjs-big-play-button) {
  line-height: 2em;
  height: 2em;
  width: 2em;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.65);
}

:deep(.vjs-control-bar) {
  background: rgba(0, 0, 0, 0.32);
}

/*取消video被选中的白边*/
:deep(video:focus) {
  border: none !important;
  outline: none;
}

:deep(.data-vjs-player:focus) {
  border: none !important;
  outline: none;
}

:deep(.vjs-tech) {
  border-radius: 6px;
}

:deep(img) {
  border-radius: 6px;
}

/*进度条配色*/
:deep(.video-js .vjs-load-progress div) {
  background: rgba(255, 255, 255, 0.55) !important;
}

:deep(.video-js .vjs-play-progress) {
  background: orange
}

:deep(.video-js .vjs-slider) {
  background-color: hsla(0, 0%, 100%, .2);
}


/*当前播放的影片信息展示*/
.current_play_info {
  width: 100%;
  padding: 15px 5px;
  text-align: left;
  display: flex;
  justify-content: space-between;
}

.current_play_title {
  font-weight: 600;
  color: rgb(201, 196, 196);
  margin: 0 0 12px 0;
}

.current_play_title a {
  color: rgb(201, 196, 196);
  font-weight: 600;
  margin-right: 16px;
}

.current_play_title a:hover {
  color: orange;
}

/*自动播放 & 下一集链接*/

.play_info_right a {
  margin-left: 10px;
  padding: 15px 20px;
  display: inline-block;
  font-size: 20px;
  height: 100%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
}

.p_r_active {
  color: #FFBB5C;
}


/* 播放区域*/
.player_area {
  width: 100%;
  min-height: 100%;
}


@media (min-width: 768px) {
  .player_area {
    padding: 10px 6%;
  }

  .right_top {
    width: 15px;
    height: 15px;
    position: absolute;
    top: 5px;
    right: 10px;
  }

  .tags a {
    padding: 5px 10px;
    background-color: rgba(155, 73, 231, 0.72);
    color: #c4c2c2;
    font-size: 13px;
    border-radius: 6px;
    margin-right: 15px;
  }

  .tags span {
    padding: 6px 12px;
    background-color: #404042;
    color: #b5b2b2;
    border-radius: 5px;
    margin: 0 8px;
    font-size: 12px;
  }

  .play_content a {
    white-space: nowrap;
    font-size: 12px;
    min-width: calc(10% - 24px);
    padding: 6px 10px;
    color: #ffffff;
    border-radius: 6px;
    margin: 8px 12px;
    background: #888888;
  }

  .play_info_right a {
    margin-left: 5px;
    display: inline-block;
    padding: 2px 8px;
    font-size: 35px;
    height: 60px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
  }

  .play_info_right a:hover {
    color: #FFBB5C;
    background: rgb(0, 0, 0, 0.2);
  }

}


.player_p {
  width: 100%;
  /*height: 700px;*/
  margin: 0;
  padding-bottom: 56.25% !important;
  position: relative;
  border-radius: 6px;
  display: flex;
}


/*右侧播放源选择区域*/
/*影片播放列表信息展示*/
/*影片播放列表信息展示*/
.play_list {
  width: 100%;
  border-radius: 10px;
  background: #2e2e2e;
  margin-top: 50px;
  position: relative;
}

.play_content {
  display: flex;
  flex-flow: row wrap;
  padding: 10px 10px 10px 10px;

}

.play_list > h2 {
  position: absolute;
  left: 10px;
  top: -10px;
  z-index: 50;
}

/*推荐列表区域*/
.correlation {
  width: 100%;
}

</style>

<!--移动端-->
<style scoped>

/*适应小尺寸*/
@media (max-width: 768px) {
  .player_area {
    padding: 5px 10px;
  }

  .right_top {
    width: 10px;
    height: 10px;
    position: absolute;
    top: 5px;
    right: 5px;
  }

  .tags a {
    padding: 5px 10px;
    color: #c4c2c2;
    background-color: rgba(155, 73, 231, 0.72);
    font-size: 13px;
    border-radius: 6px;
    margin-right: 3px;
  }


  .play_content a {
    white-space: nowrap;
    color: #ffffff;
    border-radius: 6px;
    margin: 6px 8px;
    background: #888888;
    min-width: calc(25% - 16px);
    font-size: 12px;
    padding: 6px 12px !important;
  }

  .tags span {
    padding: 6px 10px;
    background-color: #404042;
    color: #b5b2b2;
    border-radius: 5px;
    margin: 0 3px;
    font-size: 12px;
  }

  :deep(.el-tabs__item) {
    width: 70px;
    height: 35px;
    margin: 17px 5px 0 0 !important;
    font-size: 13px;
  }

  .play_info_right {
    display: flex;
    flex-direction: row;
  }

  .play_info_right a {
    margin-left: 5px;
    display: inline-block;
    padding: 2px 8px;
    font-size: 20px;
    height: 35px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
  }

  .play_info_right a:active {
    color: #FFBB5C;
    background: rgb(0, 0, 0, 0.2);
  }
}
</style>