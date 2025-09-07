<template>
  <div class="map-anim-container">
    <!-- 顶部控制 -->
    <div class="top-controls">
      <label>起始日期：</label>
      <input type="date" v-model="baseDate" />
      <button @click="startAnimation">开始查询</button>
      <button @click="stopAnimation">停止</button>
      <span class="current-date">当前日期：{{ currentDate }}</span>
    </div>
    <!-- 大地图 -->
    <div id="mapContainer" class="map-box"></div>
    <!-- 轮播区域 -->
    <div class="carousel-box">
      <!-- 左箭头 -->
      <div class="arrow left" @click="move(-1)">‹</div>

      <!-- 可视窗口 -->
      <div class="viewport" ref="viewport">
        <div
          class="track"
          ref="track"
          :style="{ transform: `translateX(${offsetX}px)` }"
        >
          <div
            v-for="(item,index) in dayDataList"
            :key="item.date"
            class="slide"
            :class="{ active: index === currentIdx }"
            @click="jumpTo(index)"
          >
            <div class="mini-map" :id="`miniMap${index}`"></div>
            <span class="slide-date">{{ item.date }}</span>
          </div>
        </div>
      </div>

      <!-- 右箭头 -->
      <div class="arrow right" @click="move(1)">›</div>
    </div>

    <!-- 指示器 -->
    <div class="dots">
      <span
        v-for="(item,index) in dayDataList"
        :key="index"
        :class="{ active: index === currentIdx }"
        @click="jumpTo(index)"
      />
    </div>

  </div>
</template>

<script>
/* global AMap */
export default {
  data() {
    return {
      map: null,          // 主地图
      heatmap: null,      // 主热力图层
      baseDate: '',       // 用户选择起始日
      dayDataList: [],    // 7天的数据 & miniMap 实例
      currentIdx: 0,      // 当前激活索引
      intervalId: null,   // 自动轮播句柄
      currentDate: '',    // 顶部文字
      offsetX: 0,         // track 偏移量
      slideWidth: 180,    // 单个 slide 宽度（含 margin）
    };
  },
  methods: {
    /* ---------------- 高德相关 ---------------- */
    initMap() {
      this.map = new AMap.Map('mapContainer', {
        resizeEnable: true,
        center: [121.4737, 31.2304],
        zoom: 11,
      });
      this.map.plugin(['AMap.Heatmap'], () => {
        this.heatmap = new AMap.Heatmap(this.map, {
          radius: 25,
          opacity: [0, 0.8],
          gradient: {
            0.3: 'blue',
            0.5: 'green',
            0.7: 'yellow',
            0.9: 'red',
          },
        });
      });
    },
    /* 初始化单个 mini 地图（缩略图） */
    initMiniMap(index, points) {
      this.$nextTick(() => {
        const mini = new AMap.Map(`miniMap${index}`, {
          zoom: 9,
          center: [121.4737, 31.2304],
          dragEnable: false,
          doubleClickZoom: false,
          keyboardEnable: false,
        });
        // 缩略图也用热力图
        new AMap.Heatmap(mini, {
          radius: 15,
          opacity: [0, 0.6],
          gradient: { 0.3: 'blue', 0.5: 'green', 0.7: 'yellow', 0.9: 'red' },
        }).setDataSet({ data: points, max: 1 });
        this.dayDataList[index].miniMap = mini;
      });
    },

    /* ---------------- 数据请求 ---------------- */
    async fetch7Days() {
      if (!this.baseDate) { alert('请先选择起始日期'); return; }
      const base = new Date(this.baseDate);
      const dateArr = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(base);
        d.setDate(base.getDate() + i);
        dateArr.push(this.fmtDate(d));
      }
      // 并发请求
      const tasks = dateArr.map(date =>
        this.$axios.get('/api/map/location-filtered', {
          params: { startDate: date, endDate: date },
        }).then(res => {
          const pts = (res.data.data || []).map(v => ({
            lng: v.longitude,
            lat: v.latitude,
            count: v.count,
          }));
          return { date, points: pts };
        })
      );
      const arr = await Promise.all(tasks);
      this.dayDataList = arr;
      this.currentIdx = 0;
      this.switchBigMap();          // 第一次渲染主地图
      this.dayDataList.forEach((v, i) => this.initMiniMap(i, v.points));
      this.scrollToCenter(0);       // 把第一个居中
    },

    /* ---------------- 轮播控制 ---------------- */
    startAnimation() {
      if (!this.baseDate) { alert('请先选择起始日期'); return; }
      if (this.dayDataList.length === 0) {
        this.fetch7Days().then(() => this.autoPlay());
      } else {
        this.autoPlay();
      }
    },
    autoPlay() {
      this.stopAnimation();
      this.intervalId = setInterval(() => {
        this.move(1);
      }, 2000);
    },
    stopAnimation() {
      if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
    },
    /* 左右箭头 +/-1 */
    move(step) {
      let next = this.currentIdx + step;
      if (next < 0) next = 0;
      if (next >= this.dayDataList.length) next = this.dayDataList.length - 1;
      this.jumpTo(next);
    },
    /* 跳到指定索引 */
    jumpTo(index) {
      this.currentIdx = index;
      this.switchBigMap();
      this.scrollToCenter(index);
    },
    /* 主地图切换数据 */
    switchBigMap() {
      const item = this.dayDataList[this.currentIdx];
      if (!item) return;
      this.currentDate = item.date;
      if (this.heatmap) {
        this.heatmap.setDataSet({ data: item.points, max: 1 });
      }
    },
    /* 计算偏移，让当前 slide 居中 */
    scrollToCenter(index) {
      const vw = this.$refs.viewport.clientWidth;
      const slideW = this.slideWidth;
      const maxOffset = Math.max(0, this.dayDataList.length * slideW - vw);
      const target = index * slideW - (vw - slideW) / 2;
      this.offsetX = Math.max(-maxOffset, Math.min(0, -target));
    },

    /* ---------------- 工具 ---------------- */
    fmtDate(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    },
  },
  mounted() {
    this.initMap();
  },
  beforeDestroy() {
    this.stopAnimation();
  },
};
</script>

<style scoped>
/* ========= 结构与之前保持一致 ========= */
.map-anim-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: Arial, sans-serif;
}
.top-controls {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  gap: 12px;
}
.top-controls input[type="date"] {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  background: #007bff;
  color: #fff;
  cursor: pointer;
  transition: 0.3s;
}
button:hover {
  background: #0056b3;
}
.current-date {
  margin-left: auto;
  font-weight: bold;
  background: #f0f0f0;
  padding: 4px 10px;
  border-radius: 4px;
}
/* ========= 大地图 ========= */
#mapContainer {
  flex: 1;
  min-height: 400px;
  width: 100%;
}

/* ========= 轮播 ========= */
.carousel-box {
  position: relative;
  height: 140px;
  background: #fafafa;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
.viewport {
  flex: 1;
  overflow: hidden;
  height: 100%;
}
.track {
  display: flex;
  height: 100%;
  transition: transform 0.4s ease;
}
.slide {
  flex-shrink: 0;
  width: 160px;
  height: 110px;
  margin: 15px 10px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  position: relative;
}
.slide.active {
  box-shadow: 0 0 0 3px #007bff;
}
.mini-map {
  width: 100%;
  height: 80px;
  border-radius: 6px 6px 0 0;
}
.slide-date {
  display: block;
  text-align: center;
  line-height: 30px;
  font-size: 13px;
  font-weight: bold;
}
.arrow {
  width: 36px;
  height: 36px;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  cursor: pointer;
  user-select: none;
  transition: 0.2s;
  margin: 0 10px;
}
.arrow:hover {
  background: rgba(0, 0, 0, 0.55);
}
.dots {
  display: flex;
  justify-content: center;
  padding: 8px 0;
  background: #fafafa;
}
.dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ccc;
  margin: 0 4px;
  cursor: pointer;
  transition: 0.3s;
}
.dots span.active {
  background: #007bff;
}
</style>