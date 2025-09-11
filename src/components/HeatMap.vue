<template>
  <div class="heatmap-container">
    <!-- 上方筛选框区域 -->
    <div class="filters">
      <!-- 季节多选按钮 -->
      <div class="season-box">
        <label v-for="s in seasons" :key="s.value" :style="{ backgroundColor: s.color }" class="color-btn">
          <input type="checkbox" :checked="selectedSeasons.includes(s.value)" @change="toggleSeason(s.value)"> {{s.label}}
        </label>
      </div>
      
      <!-- 时间段多选按钮 -->
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

    <!-- 受伤人体弹窗组件 -->
    <InjuryFigureModal 
      v-if="showModal" 
      :patient="currentPatient"
      :patients="patientsData"
      :current-index="currentPatientIndex"
      @close="closeModal"
      @prev="showPreviousPatient"
      @next="showNextPatient"
    />
  </div>
</template>

<script>
/* global AMap */
import InjuryFigureModal from './InjuryFigureModal.vue';

export default {
  components: {
    InjuryFigureModal
  },
  data() {
    return {
      map: null,
      heatmap: null,
      heatmapData: [],
      selectedSeasons: [],
      selectedTimePeriods: [],
      showModal: false,
      patientsData: [],
      currentPatientIndex: 0,
      clickedPoint: null,
      
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
  computed: {
    // 当前患者
    currentPatient() {
      return this.patientsData[this.currentPatientIndex] || {};
    }
  },
  methods: {
    initMap() {
      // 初始化地图
      this.map = new AMap.Map("hotMap", {
        resizeEnable: true,
        center: [121.4737, 31.2304],
        zoom: 11,
      });
      
      // 添加点击事件监听
      this.map.on('click', (e) => {
        this.handleMapClick(e);
      });
      
      // 加载热力图插件
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
    
    // 处理地图点击事件
    handleMapClick(e) {
      this.clickedPoint = {
        lng: e.lnglat.getLng(),
        lat: e.lnglat.getLat()
      };
      
      // 请求该点的患者数据
      this.fetchPatientData();
    },
    
    // 请求患者数据
    fetchPatientData() {
      if (!this.clickedPoint) return;
      
      let params = new URLSearchParams();
      params.append('longitude', this.clickedPoint.lng);
      params.append('latitude', this.clickedPoint.lat);
      
      this.selectedSeasons.forEach(s => {
        params.append('seasons', s);
      });
      
      this.selectedTimePeriods.forEach(tp => {
        params.append('timePeriods', tp);
      });
      
      this.$axios
        .get('/api/iss/injury/search', { params })
        .then(res => {
          console.log('患者数据响应：', res.data);
          this.patientsData = res.data.data || [];
          
          if (this.patientsData.length > 0) {
            this.currentPatientIndex = 0;
            this.showModal = true;
          } else {
            alert('该位置没有找到患者数据');
          }
        })
        .catch(err => {
          console.error('请求患者数据失败：', err);
          alert('获取患者数据失败');
        });
    },
    
    // 查询热力图数据
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
          console.log('热力图响应数据：', res.data);
          this.heatmapData = res.data.data || [];
          this.setHeatmapData();
        })
        .catch(err => {
          console.error('请求热力图数据失败：', err);
        });
    },
    
    setHeatmapData() {
      if (!this.heatmap) return;
      const dataPoints = this.heatmapData.map(item => ({
        lng: item.longitude,
        lat: item.latitude,
        count: item.count
      }));
      this.heatmap.setDataSet({ data: dataPoints, max: 3 });
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
    
    // 弹窗相关方法
    closeModal() {
      this.showModal = false;
    },
    
    showPreviousPatient() {
      if (this.currentPatientIndex > 0) {
        this.currentPatientIndex--;
      } else {
        // 循环到最后一个
        this.currentPatientIndex = this.patientsData.length - 1;
      }
    },
    
    showNextPatient() {
      if (this.currentPatientIndex < this.patientsData.length - 1) {
        this.currentPatientIndex++;
      } else {
        // 循环到第一个
        this.currentPatientIndex = 0;
      }
    }
  },
  mounted() {
    this.initMap();
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