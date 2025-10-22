<template>
  <div class="dashboard-container">
    <!-- 顶部导航栏 -->
    <div class="dashboard-header">
      <div class="header-left">
        <div class="logo">
          <i class="el-icon-s-data"></i>
          <span class="logo-text">医院创伤数据驾驶舱</span>
        </div>
      </div>
      <div class="header-center">
        <div class="time-display">
          <i class="el-icon-time"></i>
          <span>{{ currentTime }}</span>
        </div>
      </div>
      <div class="header-right">
        <div class="user-info">
          <i class="el-icon-user"></i>
          <span>管理员</span>
        </div>
        <div class="system-status">
          <div class="status-indicator online"></div>
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

    <!-- 主要内容区域 - 全屏大屏布局 -->
    <div class="dashboard-main">
        <!-- 统计卡片区域 -->
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="el-icon-user-solid"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalPatients }}</div>
              <div class="stat-label">总患者人数</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="el-icon-date"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ dailyAverage }}</div>
              <div class="stat-label">日均患者人数</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="el-icon-time"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ avgInterventionTime }}</div>
              <div class="stat-label">平均干预时间(分钟)</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="el-icon-success"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ successRate }}%</div>
              <div class="stat-label">救治成功率</div>
            </div>
          </div>
        </div>

      <!-- 可视化图表区域 - 竖列布局，无容器框 -->
      <div class="charts-container">
        
        <!-- 病例时间统计图 -->
        <div class="chart-item">
            <MonthlyTimeHeatmap 
              :selectedYear="selectedYear"
              :startDate="dateRange && dateRange.length === 2 ? dateRange[0] : null"
              :endDate="dateRange && dateRange.length === 2 ? dateRange[1] : null"
              :season="selectedSeason"
              :timePeriod="selectedTimePeriod" />
          </div>
          
        <!-- ISS分布图 -->
        <div class="chart-item">
          <ISSDistributionChart 
            :startDate="dateRange && dateRange.length === 2 ? dateRange[0] : null"
            :endDate="dateRange && dateRange.length === 2 ? dateRange[1] : null"
            :season="selectedSeason"
            :timePeriod="selectedTimePeriod"
            :year="selectedYear" />
          </div>
          
        <!-- 伤因分布图 -->
        <div class="chart-item">
            <InjuryCauseChart 
              :selectedYear="selectedYear"
              :startDate="dateRange && dateRange.length === 2 ? dateRange[0] : null"
              :endDate="dateRange && dateRange.length === 2 ? dateRange[1] : null"
              :season="selectedSeason"
              :timePeriod="selectedTimePeriod" />
          </div>
          
        <!-- GCS分布图 -->
        <div class="chart-item">
          <GCSDistributionChart 
            :startDate="dateRange && dateRange.length === 2 ? dateRange[0] : null"
            :endDate="dateRange && dateRange.length === 2 ? dateRange[1] : null"
            :season="selectedSeason"
            :timePeriod="selectedTimePeriod"
            :year="selectedYear" />
                </div>

        <!-- RTS分布图 -->
        <div class="chart-item">
          <RTSDistributionChart 
            :startDate="dateRange && dateRange.length === 2 ? dateRange[0] : null"
            :endDate="dateRange && dateRange.length === 2 ? dateRange[1] : null"
            :season="selectedSeason"
            :timePeriod="selectedTimePeriod"
            :year="selectedYear" />
              </div>

        <!-- 身体区域损伤图 -->
        <div class="chart-item">
          <BodyRegionSunburst 
            :startDate="dateRange && dateRange.length === 2 ? dateRange[0] : null"
            :endDate="dateRange && dateRange.length === 2 ? dateRange[1] : null"
            :season="selectedSeason"
            :timePeriod="selectedTimePeriod"
            :year="selectedYear" />
        </div>

        <!-- 人群身体热力图 -->
        <div class="chart-item">
          <div class="placeholder-chart">
            <div class="placeholder-content">
              <i class="el-icon-s-data"></i>
              <h4>人群身体热力图</h4>
              <p>所有人群损伤分布汇总</p>
              <small>显示整体人群的损伤分布热力图</small>
          </div>
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
        <span>在线用户: {{ onlineUsers }}</span>
        <span class="separator">|</span>
        <span>数据源: 创伤数据库</span>
      </div>
    </div>
  </div>
</template>

<script>
import MonthlyTimeHeatmap from '@/components/MonthlyTimeHeatmap.vue'
import InjuryCauseChart from '@/components/InjuryCauseChart.vue'
import ISSDistributionChart from '@/components/ISSDistributionChart.vue'
import GCSDistributionChart from '@/components/GCSDistributionChart.vue'
import RTSDistributionChart from '@/components/RTSDistributionChart.vue'
import BodyRegionSunburst from '@/components/ShowInjuryRecord.vue'

export default {
  name: 'DashboardPage',
  components: {
    MonthlyTimeHeatmap,
    InjuryCauseChart,
    ISSDistributionChart,
    GCSDistributionChart,
    RTSDistributionChart,
    BodyRegionSunburst
  },
  data() {
    return {
      // 当前时间
      currentTime: '',
      lastUpdateTime: '',
      
      // 筛选条件
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
      
      // 可用窗口组件
      availableWidgets: [
        { id: 'heatmap', name: '周热力图', icon: 'el-icon-s-data', active: true },
        { id: 'injury-analysis', name: '创伤部位分析', icon: 'el-icon-s-marketing', active: true },
        { id: 'iss-score', name: 'ISS评分分布', icon: 'el-icon-pie-chart', active: true },
        { id: 'body-region', name: '身体区域损伤', icon: 'el-icon-user', active: false },
        { id: 'intervention-time', name: '干预时间效率', icon: 'el-icon-time', active: false },
        { id: 'patient-flow', name: '患者流向图', icon: 'el-icon-share', active: false }
      ],
      
      // 激活的窗口
      activeWidgets: [],
      
      // 拖拽相关
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      dragOffset: { x: 0, y: 0 },
      
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
    this.initializeWidgets();
    this.setupEventListeners();
    // 初始化时获取所有数据
    this.initializeAllData();
  },
  
  beforeDestroy() {
    this.removeEventListeners();
  },
  
  methods: {
    // 初始化所有数据
    initializeAllData() {
      console.log('Dashboard: 开始初始化所有数据')
      // 获取统计数据
      this.fetchStatistics();
      // 获取伤因分布数据
      this.fetchInjuryCauseData();
      // 其他图表组件会通过props变化自动触发数据获取
      console.log('Dashboard: 所有数据初始化完成')
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
      
      this.$axios.get('/api/patient-statistics/statistics', { params })
        .then(res => {
          if (res.data.success && res.data.data) {
            const data = res.data.data;
            this.totalPatients = data.totalPatients || 0;
            this.dailyAverage = Math.round(data.averagePatientsPerDay * 10) / 10;
            this.avgInterventionTime = Math.round(data.averageInterventionTime * 10) / 10;
            this.successRate = Math.round(data.successRate * 10) / 10;
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
      
      console.log('Dashboard: 开始查询数据，参数:', {
        dateRange: this.dateRange,
        season: this.selectedSeason,
        timePeriod: this.selectedTimePeriod,
        year: this.selectedYear
      });
      
      // 获取统计数据（四个变量）
      this.fetchStatistics();
      
      // 获取伤因分布数据
      this.fetchInjuryCauseData();
      
      // 其他图表组件会通过props变化自动重新获取数据
      // ISS分布图、GCS分布图、RTS分布图等都会通过watch监听props变化自动重新获取数据
      
      // 模拟查询过程
      setTimeout(() => {
        this.queryLoading = false;
        this.$message.success('数据查询完成！');
        console.log('Dashboard: 查询完成');
      }, 1500);
    },


    // 获取伤因分布数据
    fetchInjuryCauseData() {
      // 构建查询参数
      let params = {};
      
      // 如果有日期范围，添加到参数中
      if (this.dateRange && this.dateRange.length === 2) {
        params.startDate = this.dateRange[0];
        params.endDate = this.dateRange[1];
      }
      
      // 添加年份参数
      if (this.selectedYear) {
        params.year = parseInt(this.selectedYear);
      }
      
      // 添加季节参数（转换为数字）
      if (this.selectedSeason && this.selectedSeason !== 'all') {
        const seasonMapping = {
          'spring': 0,  // 春季
          'summer': 1,  // 夏季
          'autumn': 2,  // 秋季
          'winter': 3   // 冬季
        };
        params.season = seasonMapping[this.selectedSeason];
      }
      
      // 添加时间段参数（转换为数字）
      if (this.selectedTimePeriod && this.selectedTimePeriod !== 'all') {
        const timePeriodMapping = {
          'night': 0,           // 夜间
          'morning_peak': 1,    // 早高峰
          'noon_peak': 2,       // 午高峰
          'afternoon': 3,       // 下午
          'evening_peak': 4,    // 晚高峰
          'evening': 5          // 晚上
        };
        params.timePeriod = timePeriodMapping[this.selectedTimePeriod];
      }
      
      this.$axios.get('/api/patient-statistics/injury-cause-distribution', { params })
        .then(response => {
          console.log('伤因分布数据请求成功:', response.data);
          if (response.data.success) {
            console.log('伤因分布数据:', response.data.data);
          }
        })
        .catch(error => {
          console.error('伤因分布数据请求失败:', error);
          this.$message.error('获取伤因分布数据失败');
        });
    },
    
    // 更新时间
    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleString('zh-CN');
      this.lastUpdateTime = now.toLocaleString('zh-CN');
      
      // 每秒更新时间
      setTimeout(() => {
        this.updateTime();
      }, 1000);
    },
    
    // 初始化窗口
    initializeWidgets() {
      this.activeWidgets = this.availableWidgets
        .filter(widget => widget.active)
        .map((widget, index) => ({
          ...widget,
          style: {
            position: 'absolute',
            left: `${(index % 3) * 33.33}%`,
            top: `${Math.floor(index / 3) * 50}%`,
            width: '32%',
            height: '48%',
            zIndex: 10
          },
          dragging: false
        }));
    },
    
    // 切换窗口显示
    toggleWidget(widgetId) {
      const widget = this.availableWidgets.find(w => w.id === widgetId);
      if (widget) {
        widget.active = !widget.active;
        this.initializeWidgets();
      }
    },
    
    // 关闭窗口
    closeWidget(widgetId) {
      const widget = this.availableWidgets.find(w => w.id === widgetId);
      if (widget) {
        widget.active = false;
        this.initializeWidgets();
      }
    },
    
    // 开始拖拽
    startDrag(widget, event) {
      this.isDragging = true;
      widget.dragging = true;
      
      this.dragStart = {
        x: event.clientX,
        y: event.clientY
      };
      
      this.dragOffset = {
        x: event.clientX - parseInt(widget.style.left),
        y: event.clientY - parseInt(widget.style.top)
      };
      
      event.preventDefault();
    },
    
    // 拖拽中
    handleDrag(event) {
      if (!this.isDragging) return;
      
      const activeWidget = this.activeWidgets.find(w => w.dragging);
      if (activeWidget) {
        const newX = event.clientX - this.dragOffset.x;
        const newY = event.clientY - this.dragOffset.y;
        
        activeWidget.style.left = `${Math.max(0, newX)}px`;
        activeWidget.style.top = `${Math.max(0, newY)}px`;
      }
    },
    
    // 结束拖拽
    endDrag() {
      this.isDragging = false;
      this.activeWidgets.forEach(widget => {
        widget.dragging = false;
      });
    },
    
    // 调整窗口大小
    resizeWidget(widget) {
      // 这里可以实现窗口大小调整功能
      console.log('调整窗口大小:', widget.name);
    },
    
    // 设置事件监听
    setupEventListeners() {
      document.addEventListener('mousemove', this.handleDrag);
      document.addEventListener('mouseup', this.endDrag);
    },
    
    // 移除事件监听
    removeEventListeners() {
      document.removeEventListener('mousemove', this.handleDrag);
      document.removeEventListener('mouseup', this.endDrag);
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  font-family: 'Microsoft YaHei', sans-serif;
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

/* 主要内容区域 - 全屏布局 */
.dashboard-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 顶部筛选栏 */
.filter-bar {
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  padding: 15px 20px;
  border-bottom: 2px solid rgba(52, 152, 219, 0.3);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-item label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.widget-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.widget-btn {
  width: 100%;
  text-align: left;
  justify-content: flex-start;
}

.layout-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

/* 图表容器 - 竖列布局 */
.charts-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0;
}

/* 图表项目 - 无容器框 */
.chart-item {
  width: 100%;
  min-height: 500px;
  background: transparent;
  border: none;
  box-shadow: none;
  border-radius: 0;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  font-size: 16px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 3px;
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: #666;
  line-height: 1.2;
}


/* 占位符图表样式 */
.placeholder-chart {
  width: 100%;
  min-height: 500px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}


.placeholder-content {
  text-align: center;
  color: #666;
  padding: 40px;
}

.placeholder-content i {
  font-size: 48px;
  color: #3498db;
  margin-bottom: 20px;
  display: block;
  opacity: 0.8;
}

.placeholder-content h4 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 600;
}

.placeholder-content p {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.placeholder-content small {
  font-size: 12px;
  color: #999;
}





/* 底部状态栏 */
.dashboard-footer {
  height: 40px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  font-size: 12px;
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
@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-container {
    flex-wrap: wrap;
    gap: 15px;
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .filter-container {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-item {
    width: 100%;
  }
  
  .placeholder-content {
    padding: 20px;
  }
  
  .placeholder-content i {
    font-size: 36px;
  }
}
</style>

