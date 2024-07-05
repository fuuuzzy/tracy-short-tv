<template>
  <transition name="el-fade-in-linear">
    <div class="container" v-if="d.load">
      <!--影片列表展示-->
      <div class="content">
        <div class="news">
          <div class="c_nav">
            <span class="c_nav_text silver">History</span>
          </div>
          <FilmList :col="7" :list="historyList"/>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from "vue";
import {useRouter} from "vue-router";
import FilmList from "../../components/index/FilmList.vue";
import {COOKIE_KEY_MAP, cookieUtil} from "../../utils/cookie";

const d = reactive({
  load: false,
  title: {},
  content: {
    news: [],
    top: [],
    recent: [],
  }

})

const historyList = ref<Array<any>>([])
const router = useRouter()

const getFilmData = () => {
  handleHistory()
  d.load = true
}

const handleHistory = () => {
  // 获取cookie中的filmHistory
  let historyMap = cookieUtil.getCookie(COOKIE_KEY_MAP.FILM_HISTORY) ? JSON.parse(cookieUtil.getCookie(COOKIE_KEY_MAP.FILM_HISTORY)) : null
  let arr = []
  if (historyMap) {
    for (let k in historyMap) {
      arr.push({
        id: historyMap[k].id,
        desc: historyMap[k].desc,
        link: historyMap[k].link,
        poster_hd: historyMap[k].poster_hd,
        title_en: historyMap[k].title_en,
        tags_en_list: historyMap[k].tags_en_list,
        release_date: historyMap[k].release_date,
        timeStamp: historyMap[k].timeStamp
      })
    }
    arr.sort((item1, item2) => item2.timeStamp - item1.timeStamp)
  }
  historyList.value = arr
}

onMounted(() => {
  getFilmData()
})
</script>

<style scoped>
@import "/src/assets/css/classify.css";

.c_nav {
  display: flex;
  justify-content: space-between;

  padding: 6px;
}

.c_nav_text {
  font-weight: 700;
  line-height: 1.1;
}

.c_nav_more {
  background: #25252b;
  border-radius: 8px;
}

.content > div {
  padding-bottom: 20px;
}

/**/
@media (min-width: 768px) {
  .c_nav {
    margin-bottom: 15px;
  }

  .c_nav_text {
    font-size: 28px;
  }

  .c_nav_more {
    font-size: 14px;
    padding: 0 15px;
    line-height: 32px;
  }

}

@media (max-width: 768px) {
  .c_nav {
    margin-bottom: 10px;
  }

  .c_nav_text {
    font-size: 20px;
    line-height: 28px;
  }

  .c_nav_more {
    font-size: 12px;
    padding: 0 10px;
    line-height: 28px;
  }

  .c_nav_more b {
    font-size: 12px;
  }
}

</style>