<template>
  <div class="map-page">
    <div class="sidebar">
      <ul>
        <li @click="currentModule='HeatMap'">热力图-病例-按季节</li>
        <li @click="currentModule='MapDataAnimation'">热力图-病例-按日期</li>
        <li @click="currentModule='PatientList'">热力图-病人信息</li>
        <li @click="currentModule='ShowTimeperiods'">统计分析- 时间段_周 热力图</li>
        <li @click="currentModule='ShowSeasonalBarChart'">统计分析- 季节_伤因 柱状图</li>
        <li @click="currentModule='ShowIssBar'">统计分析- ISS评分分布 饼图</li>
        <li @click="currentModule='ShowInjuryRecord'">统计分析- 身体区域损伤分布 旭日图</li>
        <li @click="currentModule='ShowInterventionCloud'">统计分析- 干预措施使用频率 词云</li>
        <li @click="currentModule='ShowInterTime'">统计分析- 干预措施时间效率 箱线图</li>
        <li @click="currentModule='ShowPatientFlowSankey'">统计分析- 患者流向 桑基图</li>
        <li @click="currentModule='ShowInterDistribution'">统计分析- 创伤部分 时间分布</li>
        <li @click="currentModule='ShowInjuryAnalysis'">统计分析- 创伤部位与伤因时间分布</li>
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
import ShowTimeperiods from '@/components/ShowTimeperiods.vue'
import ShowSeasonalBarChart from '@/components/ShowSeasonalBarChart.vue'
import ShowIssBar from '@/components/ShowIssBar.vue'
import ShowInjuryRecord from '@/components/ShowInjuryRecord.vue'
import ShowInterventionCloud from '@/components/ShowInterventionCloud.vue'
import ShowInterTime from '@/components/ShowInterTime.vue'
import ShowPatientFlowSankey from '@/components/ShowPatientFlowSankey.vue'
import ShowInterDistribution from '@/components/ShowInterDistribution.vue'
import ShowInjuryAnalysis from '@/components/ShowInjuryAnalysis.vue'

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
        case 'ShowTimeperiods':
          return 'ShowTimeperiods'
        case 'ShowSeasonalBarChart':
          return 'ShowSeasonalBarChart'
        case 'ShowIssBar':
          return 'ShowIssBar'
        case 'ShowInjuryRecord':
          return 'ShowInjuryRecord'
        case 'ShowInterventionCloud':
          return 'ShowInterventionCloud'
        case 'ShowInterTime':
          return 'ShowInterTime'
        case 'ShowPatientFlowSankey':
          return 'ShowPatientFlowSankey'
        case 'ShowInterDistribution':
          return 'ShowInterDistribution'
        case 'ShowInjuryAnalysis':
          return 'ShowInjuryAnalysis'
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
    ShowTimeperiods,
    ShowSeasonalBarChart,
    ShowIssBar,
    ShowInjuryRecord,
    ShowInterventionCloud,
    ShowInterTime,
    ShowPatientFlowSankey,
    ShowInterDistribution,
    ShowInjuryAnalysis
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