<template>
  <div class="dashboard-container">
    <!-- 顶部导航栏 -->
    <div class="dashboard-header">
      <div class="header-left">
        <div class="logo">
          <i>📊</i>
          <span>医院创伤数据可视化系统</span>
        </div>
      </div>
      <div class="header-center">
        <div class="time-display">
          <i>🕐</i>
          <span>{{ currentTime }}</span>
        </div>
      </div>
      <div class="header-right">
        <div class="user-info">
          <i>👤</i>
          <span>管理员</span>
        </div>
        <div class="system-status">
          <div class="status-indicator"></div>
          <span>系统正常</span>
        </div>
      </div>
    </div>

    <!-- 顶部筛选栏 -->
    <div class="filter-bar">
      <div class="filter-container">
        <div class="filter-item">
          <label>时间范围</label>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="small">
          </el-date-picker>
        </div>
        <div class="filter-item">
          <label>季节</label>
          <el-select v-model="selectedSeason" placeholder="选择季节" size="small">
            <el-option label="全部" value="all"></el-option>
            <el-option label="春季(3-5月)" value="spring"></el-option>
            <el-option label="夏季(6-8月)" value="summer"></el-option>
            <el-option label="秋季(9-11月)" value="autumn"></el-option>
            <el-option label="冬季(12-2月)" value="winter"></el-option>
          </el-select>
        </div>
        <div class="filter-item">
          <label>时间段</label>
          <el-select v-model="selectedTimePeriod" placeholder="选择时间段" size="small">
            <el-option label="全部" value="all"></el-option>
            <el-option label="夜间(00:00-07:59)" value="night"></el-option>
            <el-option label="早高峰(08:00-09:59)" value="morning_peak"></el-option>
            <el-option label="午高峰(10:00-11:59)" value="noon_peak"></el-option>
            <el-option label="下午(12:00-16:59)" value="afternoon"></el-option>
            <el-option label="晚高峰(17:00-19:59)" value="evening_peak"></el-option>
            <el-option label="晚上(20:00-23:59)" value="evening"></el-option>
          </el-select>
        </div>
        <div class="filter-item">
          <label>年份</label>
          <el-select v-model="selectedYear" placeholder="选择年份" size="small">
            <el-option 
              v-for="year in yearOptions" 
              :key="year.value" 
              :label="year.label" 
              :value="year.value">
            </el-option>
          </el-select>
        </div>
        <div class="filter-item">
          <el-button type="primary" size="small" @click="handleQuery" :loading="queryLoading">
            <i class="el-icon-search"></i>
            查询数据
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="dashboard-main">
      <!-- 统计卡片区域 -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalPatients }}</div>
            <div class="stat-label">总患者人数</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <div class="stat-value">{{ dailyAverage }}</div>
            <div class="stat-label">日均患者人数</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <div class="stat-value">{{ avgInterventionTime }}</div>
            <div class="stat-label">平均干预时间(分钟)</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ successRate }}%</div>
            <div class="stat-label">救治成功率</div>
          </div>
        </div>
      </div>

      <!-- 7图表网格布局 -->
      <div class="charts-grid">
        <!-- 第一行：热力图 + ISS饼图 + GCS饼图 + 人体图（跨2行） -->
        <!-- 病例时间统计图（热力图） -->
        <div class="chart-item chart-heatmap">
          <div class="chart-title-overlay">
            <div class="chart-title">
              <i>🔥</i>
              患者流量月度时间分布热点图
            </div>
          </div>
          <div class="chart-content">
            <MonthlyTimeHeatmapCore 
              :selectedYear="selectedYear"
              :startDate="dateRange && dateRange.length === 2 ? dateRange[0] : null"
              :endDate="dateRange && dateRange.length === 2 ? dateRange[1] : null"
              :season="selectedSeason"
              :timePeriod="selectedTimePeriod" />
          </div>
        </div>

        <!-- ISS分布图 -->
        <div class="chart-item chart-pie-iss">
          <div class="chart-title-overlay">
            <div class="chart-title">
              <i>🥧</i>
              ISS分布图
            </div>
          </div>
          <div class="chart-content">
            <ISSDistributionChart 
              :startDate="dateRange && dateRange.length === 2 ? dateRange[0] : null"
              :endDate="dateRange && dateRange.length === 2 ? dateRange[1] : null"
              :season="selectedSeason"
              :timePeriod="selectedTimePeriod"
              :year="selectedYear" />
          </div>
        </div>

        <!-- GCS分布图 -->
        <div class="chart-item chart-pie-gcs">
          <div class="chart-title-overlay">
            <div class="chart-title">
              <i>🥧</i>
              GCS分布图
            </div>
          </div>
          <div class="chart-content">
            <GCSDistributionChart 
              :startDate="dateRange && dateRange.length === 2 ? dateRange[0] : null"
              :endDate="dateRange && dateRange.length === 2 ? dateRange[1] : null"
              :season="selectedSeason"
              :timePeriod="selectedTimePeriod"
              :year="selectedYear" />
          </div>
        </div>

        <!-- 人群身体热力图（跨2行） -->
        <div class="chart-item chart-body">
          <div class="chart-title-overlay">
            <div class="chart-title">
              <i>🔥</i>
              人群身体热力图
            </div>
          </div>
          <div class="chart-content">
            <PopulationBodyHeatmapWidget 
              :startDate="dateRange && dateRange.length === 2 ? dateRange[0] : null"
              :endDate="dateRange && dateRange.length === 2 ? dateRange[1] : null"
              :season="selectedSeason"
              :timePeriod="selectedTimePeriod"
              :year="selectedYear" />
          </div>
        </div>

        <!-- 第二行：柱状图 + RTS饼图 + 旭日图 -->
        <!-- 伤因分布图 -->
        <div class="chart-item chart-bar">
          <div class="chart-content">
            <InjuryCauseDistributionChartCore 
              :selectedYear="selectedYear"
              :startDate="dateRange && dateRange.length === 2 ? dateRange[0] : null"
              :endDate="dateRange && dateRange.length === 2 ? dateRange[1] : null"
              :season="selectedSeason"
              :timePeriod="selectedTimePeriod" />
          </div>
        </div>

        <!-- RTS分布图 -->
        <div class="chart-item chart-pie-rts">
          <div class="chart-title-overlay">
            <div class="chart-title">
              <i>🥧</i>
              RTS分布图
            </div>
          </div>
          <div class="chart-content">
            <RTSDistributionChart 
              :startDate="dateRange && dateRange.length === 2 ? dateRange[0] : null"
              :endDate="dateRange && dateRange.length === 2 ? dateRange[1] : null"
              :season="selectedSeason"
              :timePeriod="selectedTimePeriod"
              :year="selectedYear" />
          </div>
        </div>

        <!-- 身体区域损伤图 -->
        <div class="chart-item chart-sunburst">
          <div class="chart-title-overlay">
            <div class="chart-title">
              <i>☀️</i>
              身体区域损伤图
            </div>
          </div>
          <div class="chart-content">
            <BodyRegionSunburstWidget 
              :startDate="dateRange && dateRange.length === 2 ? dateRange[0] : null"
              :endDate="dateRange && dateRange.length === 2 ? dateRange[1] : null"
              :season="selectedSeason"
              :timePeriod="selectedTimePeriod"
              :year="selectedYear" />
          </div>
        </div>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="dashboard-footer">
      <div class="footer-left">
        <span>数据更新时间: {{ lastUpdateTime }}</span>
        <span class="separator">|</span>
        <span>系统版本: v2.0.0</span>
      </div>
      <div class="footer-right">
        <span>在线用户: 1</span>
        <span class="separator">|</span>
        <span>数据源: 原始excel数据</span>
      </div>
    </div>
  </div>
</template>

<script>
import MonthlyTimeHeatmapCore from '@/components/MonthlyTimeHeatmapCore.vue'
import ISSDistributionChart from '@/components/ISSDistributionChart.vue'
import GCSDistributionChart from '@/components/GCSDistributionChart.vue'
import PopulationBodyHeatmapWidget from '@/components/PopulationBodyHeatmapWidget.vue'
import InjuryCauseDistributionChartCore from '@/components/InjuryCauseDistributionChartCore.vue'
import RTSDistributionChart from '@/components/RTSDistributionChart.vue'
import BodyRegionSunburstWidget from '@/components/BodyRegionSunburstWidget.vue'

export default {
  name: 'DataVisualizationDashboard',
  components: {
    MonthlyTimeHeatmapCore,
    ISSDistributionChart,
    GCSDistributionChart,
    PopulationBodyHeatmapWidget,
    InjuryCauseDistributionChartCore,
    RTSDistributionChart,
    BodyRegionSunburstWidget
  },
  data() {
    return {
      // 当前时间
      currentTime: '',
      lastUpdateTime: '',
      
      // 筛选条件 - 使用驾驶舱的数据结构
      dateRange: [],
      selectedSeason: 'all',
      selectedTimePeriod: 'all',
      selectedYear: new Date().getFullYear().toString(),
      
      // 统计数据
      totalPatients: 0,
      dailyAverage: 0,
      avgInterventionTime: 0,
      successRate: 0,
      onlineUsers: 12,
      
      // 查询状态
      queryLoading: false
    }
  },
  
  computed: {
    // 获取年份选项（从2000年到当前年）
    yearOptions() {
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let year = 2000; year <= currentYear; year++) {
        years.push({
          value: year.toString(),
          label: `${year}年`
        });
      }
      return years.reverse(); // 最新的年份在前
    }
  },
  
  mounted() {
    this.updateTime();
    this.initializeAllData();
    
    // 每秒更新时间
    setInterval(this.updateTime, 1000);
  },
  methods: {
    // 初始化所有数据
    initializeAllData() {
      console.log('DataVisualizationDashboard: 开始初始化所有数据')
      // 获取统计数据
      this.fetchStatistics();
      // 其他图表组件会通过props变化自动触发数据获取
      console.log('DataVisualizationDashboard: 所有数据初始化完成')
    },
    
     // 获取统计数据
     fetchStatistics() {
       // 构建查询参数
       let params = {};
       
       // 如果有日期范围，添加到参数中
       if (this.dateRange && this.dateRange.length === 2) {
         params.startDate = this.dateRange[0];
         params.endDate = this.dateRange[1];
       }
       
       // 添加四个维度的筛选条件
       if (this.selectedYear && this.selectedYear !== 'all') {
         params.year = this.selectedYear;
       }
       
       if (this.selectedSeason && this.selectedSeason !== 'all') {
         params.season = this.selectedSeason;
       }
       
       if (this.selectedTimePeriod && this.selectedTimePeriod !== 'all') {
         params.timePeriod = this.selectedTimePeriod;
       }
       
       console.log('DataVisualizationDashboard: 获取统计数据，参数:', params);
       console.log('DataVisualizationDashboard: 当前筛选条件:', {
         selectedYear: this.selectedYear,
         selectedSeason: this.selectedSeason,
         selectedTimePeriod: this.selectedTimePeriod,
         dateRange: this.dateRange
       });
       
       // 确保每次都会发出请求
       this.$axios.get('/api/patient-statistics/statistics', { params })
         .then(res => {
           console.log('DataVisualizationDashboard: API响应:', res.data);
           if (res.data.success && res.data.data) {
             const data = res.data.data;
             this.totalPatients = data.totalPatients || 0;
             this.dailyAverage = Math.round(data.averagePatientsPerDay * 10) / 10;
             this.avgInterventionTime = Math.round(data.averageInterventionTime * 10) / 10;
             this.successRate = Math.round(data.successRate * 10) / 10;
             
             console.log('DataVisualizationDashboard: 统计数据更新完成:', {
               totalPatients: this.totalPatients,
               dailyAverage: this.dailyAverage,
               avgInterventionTime: this.avgInterventionTime,
               successRate: this.successRate
             });
           } else {
             console.warn('DataVisualizationDashboard: 未获取到有效统计数据');
           }
         })
         .catch(err => {
           console.error('获取统计数据失败:', err);
           this.$message.error('获取统计数据失败');
         });
     },

    // 处理查询按钮点击
    handleQuery() {
      this.queryLoading = true;
      
      console.log('DataVisualizationDashboard: 开始查询数据，参数:', {
        dateRange: this.dateRange,
        season: this.selectedSeason,
        timePeriod: this.selectedTimePeriod,
        year: this.selectedYear
      });
      
      // 强制重新获取统计数据（四个变量）
      this.fetchStatistics();
      
      // 其他图表组件会通过props变化自动重新获取数据
      // ISS分布图、GCS分布图、RTS分布图等都会通过watch监听props变化自动重新获取数据
      
      // 设置一个较短的延迟来显示查询完成状态
      setTimeout(() => {
        this.queryLoading = false;
        this.$message.success('数据查询完成！');
        console.log('DataVisualizationDashboard: 查询完成');
      }, 1000);
    },
    
    // 更新时间
    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleString('zh-CN');
      this.lastUpdateTime = now.toLocaleString('zh-CN');
    }
  }
}
</script>

<style scoped>
/* 基础样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Microsoft YaHei', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
}

/* 顶部导航栏 */
.dashboard-header {
  height: 60px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.header-left .logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
}

.header-left .logo i {
  font-size: 24px;
  color: #3498db;
  margin-right: 10px;
}

.header-center .time-display {
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #666;
}

.header-center .time-display i {
  margin-right: 8px;
  color: #3498db;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  color: #666;
}

.user-info i {
  margin-right: 5px;
  color: #3498db;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #27ae60;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* 顶部筛选栏 */
.filter-bar {
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  padding: 15px 20px;
  border-bottom: 2px solid rgba(52, 152, 219, 0.3);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: 50px;
}

.filter-container {
  display: flex;
  align-items: center;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  color: white;
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
}

.filter-item .el-date-editor {
  width: 240px !important;
}

.filter-item .el-select {
  width: 140px;
}

/* 主要内容区域 */
.dashboard-main {
  flex: 1;
  padding: 15px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px; /* 减少间距，让边框叠在一起 */
  margin-bottom: 10px;
  height: 45px; /* 大幅减少高度 */
}

.stat-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 4px; /* 减少圆角 */
  padding: 6px 8px; /* 大幅减少内边距 */
  display: flex;
  align-items: center;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06); /* 减少阴影 */
  transition: transform 0.2s ease;
  border: none; /* 去掉边框 */
  position: relative;
}

.stat-card:hover {
  transform: translateY(-0.5px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 20px; /* 大幅缩小图标 */
  height: 20px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px; /* 减少右边距 */
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  font-size: 10px; /* 缩小字体 */
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 14px; /* 缩小数字字体 */
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 1px;
  line-height: 1.1;
}

.stat-label {
  font-size: 9px; /* 进一步缩小标签字体 */
  color: #666;
  line-height: 1.1;
}

/* 7图表网格布局 */
.charts-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr; /* 4列：热力图2列，3个饼图各1列 */
  grid-template-rows: 1fr 1fr; /* 2行 */
  gap: 12px;
  overflow: hidden;
}

/* 第一行：热力图 + ISS饼图 + GCS饼图 + 人体图（跨2行） */
.chart-heatmap {
  grid-column: 1;
  grid-row: 1;
}

.chart-pie-iss {
  grid-column: 2;
  grid-row: 1;
}

.chart-pie-gcs {
  grid-column: 3;
  grid-row: 1;
}

.chart-body {
  grid-column: 4;
  grid-row: 1 / 3; /* 跨2行 */
}

/* 第二行：柱状图 + RTS饼图 + 旭日图 */
.chart-bar {
  grid-column: 1;
  grid-row: 2;
}

.chart-pie-rts {
  grid-column: 2;
  grid-row: 2;
}

.chart-sunburst {
  grid-column: 3;
  grid-row: 2;
}

/* 图表项目基础样式 */
.chart-item {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 200px;
}

/* 图表标题覆盖样式 */
.chart-title-overlay {
  position: absolute;
  top: 4px;
  right: 12px;
  background: rgba(52, 152, 219, 0.9);
  backdrop-filter: blur(10px);
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.chart-title {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 2px;
}

.chart-title i {
  margin-right: 4px;
  font-size: 12px;
}

.chart-subtitle {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.2;
}

/* 图表内容 */
.chart-content {
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
  background: transparent;
  color: #666;
  font-size: 14px;
  height: 100%;
  min-height: 0;
}

/* 底部状态栏 */
.dashboard-footer {
  height: 35px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  font-size: 11px;
}

.footer-left, .footer-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.separator {
  color: #666;
}

/* 响应式设计 */
@media (max-width: 1920px) {
  .charts-grid {
    grid-template-columns: 2fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }
}

@media (max-width: 1366px) {
  .charts-grid {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr;
  }
  
  .chart-heatmap {
    grid-column: 1 / 3;
    grid-row: 1;
  }
  
  .chart-pie-iss {
    grid-column: 1;
    grid-row: 2;
  }
  
  .chart-pie-gcs {
    grid-column: 2;
    grid-row: 2;
  }
  
  .chart-bar {
    grid-column: 1;
    grid-row: 3;
  }
  
  .chart-pie-rts {
    grid-column: 2;
    grid-row: 3;
  }
  
  .chart-sunburst {
    grid-column: 1;
    grid-row: 4;
  }
  
  .chart-body {
    grid-column: 2;
    grid-row: 4;
  }
}

@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(7, 1fr);
  }
  
  .chart-heatmap,
  .chart-pie-iss,
  .chart-pie-gcs,
  .chart-pie-rts,
  .chart-bar,
  .chart-sunburst,
  .chart-body {
    grid-column: 1;
    grid-row: auto;
  }
}
</style>
