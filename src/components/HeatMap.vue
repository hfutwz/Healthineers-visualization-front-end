<template>
  <div class="heatmap-container">
    <!-- 上方筛选框区域 -->
    <div class="filters">
      <!-- 季节多选按钮（每个用不同颜色的按钮） -->
      <div class="season-box">
        <label v-for="s in seasons" :key="s.value" :style="{ backgroundColor: s.color }" class="color-btn">
          <input type="checkbox" :checked="selectedSeasons.includes(s.value)" @change="toggleSeason(s.value)"> {{s.label}}
        </label>
      </div>
      
      <!-- 时间段多选按钮（色彩不同） -->
      <div class="timeperiod-box">
        <label v-for="t in timePeriods" :key="t.value" :style="{ backgroundColor: t.color }" class="color-btn">
          <input type="checkbox" :checked="selectedTimePeriods.includes(t.value)" @change="toggleTimePeriod(t.value)"> {{t.label}}
        </label>
      </div>
      
      <!-- 查询按钮 -->
      <button @click="query">查询</button>
    </div>

    <!-- 地图显示区域 -->
    <div id="hotMap" class="map-box"></div>
  </div>
</template>

<script>
/* global AMap */
export default {
  data() {
    return {
      map: null,
      heatmap: null,
      heatmapData: [],

      // 多选数组
      selectedSeasons: [],
      selectedTimePeriods: [],

      // 颜色定义
      seasons: [
        { value: 0, label: "春", color: "#77dd77" },
        { value: 1, label: "夏", color: "#55cc55" },
        { value: 2, label: "秋", color: "#ffcc66" },
        { value: 3, label: "冬", color: "#66ccff" },
      ],
      timePeriods: [
        { value: 0, label: "夜间 19:00-7:00", color: "#333" },
        { value: 1, label: "早高峰 7:00-9:00", color: "#ff6666" },
        { value: 2, label: "早晨 9:00-11:00", color: "#66cc66" },
        { value: 3, label: "午高峰 11:00-13:00", color: "#66cccc" },
        { value: 4, label: "下午 13:00-17:00", color: "#ffcc66" },
        { value: 5, label: "晚高峰 17:00-19:00", color: "#cc66ff" },
      ],
    }
  },
  methods: {
    initMap() {
      this.map = new AMap.Map("hotMap", {
        resizeEnable: true,
        center: [121.4737, 31.2304],
        zoom: 11,
      });
      this.map.plugin(["AMap.Heatmap"], () => {
        this.heatmap = new AMap.Heatmap(this.map, {
          radius: 25,
          opacity: [0, 0.8],
          gradient: {
            0.3: "blue",
            0.5: "green",
            0.7: "yellow",
            0.9: "red",
          },
        });
        this.query();
      });
    },
    setHeatmapData() {
      if (!this.heatmap) return;
      const dataPoints = this.heatmapData.map(item => ({
        lng: item.longitude, // 后端字段名是longitude
        lat: item.latitude,   // 后端字段名是latitude
        count: item.count
      }));
      this.heatmap.setDataSet({ data: dataPoints, max: 3 });
    },  
    query() {
      let params = new URLSearchParams();

      this.selectedSeasons.forEach(s => {
        params.append('seasons', s);
      });
      this.selectedTimePeriods.forEach(tp => {
        params.append('timePeriods', tp);
      });
      this.$axios
        .get('/api/map/locations', { params })
        .then(res => {
          console.log('响应数据：', res.data);
          this.heatmapData = res.data.data || [];
          this.setHeatmapData();
        })
        .catch(err => {
          console.error('请求失败：', err);
        });
    },
    toggleSeason(val) {
      const index = this.selectedSeasons.indexOf(val);
      if (index >= 0) {
        this.selectedSeasons.splice(index, 1);
      } else {
        this.selectedSeasons.push(val);
      }
    },
    toggleTimePeriod(val) {
      const index = this.selectedTimePeriods.indexOf(val);
      if (index >= 0) {
        this.selectedTimePeriods.splice(index, 1);
      } else {
        this.selectedTimePeriods.push(val);
      }
    },
    loadAllLocations() {
    this.$axios.get('/api/map/locations')
      .then(res => {
        // 赋值：假设 res.data.data 是地点数组
        this.heatmapData = res.data.data || [];
        this.setHeatmapData();
      })
      .catch(err => {
        console.error('加载全部地点失败：', err);
      });
    },
  },
  mounted() {
    this.initMap();
    //this.loadAllLocations(); // 加载全部地点
  },
};
</script>

<style scoped>
.heatmap-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: Arial, sans-serif;
}
.filters {
  padding: 10px 20px;
  background: #fff;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
button {
  padding: 6px 12px;
  background-color: #0270c9;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
button:hover {
  background-color: #025b9c;
}
#hotMap {
  flex: 1;
  min-height: 400px;
}
.color-btn {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  border: 1px solid #ccc;
  user-select: none;
  font-size: 14px;
  transition: all 0.2s;
}
</style>

