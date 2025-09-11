<template>
  <div class="map-page">
    <div class="sidebar">
      <ul>
        <li @click="currentModule='HeatMap'">热力图-病例-按季节</li>
        <li @click="currentModule='MapDataAnimation'">热力图-病例-按日期</li>
        <li @click="currentModule='PatientList'">热力图-病人信息</li>
        <li @click="currentModule='Other'">其他模块</li>
      </ul>
    </div>
    <div class="content">
      <component :is="currentComponent" />
    </div>
  </div>
</template>

<script>
import MapDataAnimation from '@/components/MapDataAnimation.vue' 
import HeatMap from '../components/HeatMap.vue'
import PatientList from '../components/PatientList.vue'
// 可以加入其他组件
export default {
  data() {
    return {
      currentModule: 'HeatMap' // 默认显示热力图
    }
  },
  computed: {
    currentComponent() {
      switch (this.currentModule) {
        case 'HeatMap':
          return 'HeatMap'
        case 'MapDataAnimation':
          return 'MapDataAnimation'
        case 'PatientList':
          return 'PatientList'
        case 'Other':
          return 'div' // 将来可以放“Other”组件
        default:
          return 'div'
      }
    }
  },
  components: {
    HeatMap,
    MapDataAnimation,
    PatientList,
  }
}
</script>

<style scoped>
/* 左侧边栏样式 */
.sidebar {
  width: 220px;
  height: 100vh;
  background-color: #2b3a4e; /* 你可以改色 */
  color: #fff;
  padding: 20px;
  box-sizing: border-box;
  position: fixed;     /* 固定在左侧 */
  top: 0;
  left: 0;
  overflow-y: auto;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  padding: 12px 15px;
  margin-bottom: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s, color 0.2s;
}

.sidebar li:hover {
  background-color: #3b4b59;
  color: #ffeb3b;
}

/* 内容区域与侧边栏匹配 */
.content {
  margin-left: 220px;   /* 保持跟sidebar宽度一致 */
  padding: 20px;
}
</style>