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

    <!-- 主要内容区域 -->
    <div class="dashboard-main">

      <!-- 右侧可视化区域 -->
      <div class="visualization-area">
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

        <!-- 主要可视化图表区域 - 紧凑布局 -->
        <div class="dashboard-grid">
          <!-- 第一行：月度时间热力图（占据主要位置） -->
          <div class="grid-item main-heatmap">
            <MonthlyTimeHeatmap 
              :selectedYear="selectedYear"
              :startDate="dateRange && dateRange.length === 2 ? dateRange[0] : null"
              :endDate="dateRange && dateRange.length === 2 ? dateRange[1] : null"
              :season="selectedSeason"
              :timePeriod="selectedTimePeriod" />
          </div>
          
          <!-- 第二行：三个饼状图（ISS、GCS、RTS） -->
          <div class="grid-item pie-chart-container">
            <div class="pie-chart-box">
              <div class="chart-header">
                <div class="chart-title">
                  <i class="el-icon-pie-chart"></i>
                  <span>ISS分布</span>
                </div>
                <div class="chart-subtitle">创伤严重度分析</div>
              </div>
              <div class="chart-content">
                <div class="chart-placeholder">
                  <i class="el-icon-pie-chart"></i>
                  <p>ISS分布饼状图</p>
                  <small>创伤严重度分析</small>
                </div>
              </div>
            </div>
          </div>
          
          <div class="grid-item pie-chart-container">
            <div class="pie-chart-box">
              <div class="chart-header">
                <div class="chart-title">
                  <i class="el-icon-pie-chart"></i>
                  <span>GCS分布</span>
                </div>
                <div class="chart-subtitle">格拉斯哥昏迷评分</div>
              </div>
              <div class="chart-content">
                <div class="chart-placeholder">
                  <i class="el-icon-pie-chart"></i>
                  <p>GCS分布饼状图</p>
                  <small>格拉斯哥昏迷评分</small>
                </div>
              </div>
            </div>
          </div>
          
          <div class="grid-item pie-chart-container">
            <div class="pie-chart-box">
              <div class="chart-header">
                <div class="chart-title">
                  <i class="el-icon-pie-chart"></i>
                  <span>RTS分布</span>
                </div>
                <div class="chart-subtitle">修正创伤评分</div>
              </div>
              <div class="chart-content">
                <div class="chart-placeholder">
                  <i class="el-icon-pie-chart"></i>
                  <p>RTS分布饼状图</p>
                  <small>修正创伤评分</small>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 第三行：身体区域损伤旭日图 -->
          <div class="grid-item sunburst-container">
            <div class="sunburst-chart-box">
              <div class="chart-header">
                <div class="chart-title">
                  <i class="el-icon-user-solid"></i>
                  <span>身体区域损伤</span>
                </div>
                <div class="chart-subtitle">人体损伤分布旭日图</div>
              </div>
              <div class="chart-content">
                <div class="chart-placeholder">
                  <i class="el-icon-user-solid"></i>
                  <p>身体区域损伤旭日图</p>
                  <small>人体损伤分布可视化</small>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 第四行：伤因分布柱状图 -->
          <div class="grid-item injury-cause-container">
            <InjuryCauseChart 
              :selectedYear="selectedYear"
              :startDate="dateRange && dateRange.length === 2 ? dateRange[0] : null"
              :endDate="dateRange && dateRange.length === 2 ? dateRange[1] : null"
              :season="selectedSeason"
              :timePeriod="selectedTimePeriod" />
          </div>
          
          <!-- 第五行：人群身体热力图 -->
          <div class="grid-item body-heatmap-container">
            <div class="body-heatmap-box">
              <div class="chart-header">
                <div class="chart-title">
                  <i class="el-icon-s-data"></i>
                  <span>人群身体热力图</span>
                </div>
                <div class="chart-subtitle">所有人群损伤分布汇总</div>
              </div>
              <div class="chart-content">
                <div class="chart-placeholder">
                  <i class="el-icon-s-data"></i>
                  <p>人群身体热力图</p>
                  <small>所有人群损伤分布汇总</small>
                </div>
              </div>
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

export default {
  name: 'DashboardPage',
  components: {
    MonthlyTimeHeatmap,
    InjuryCauseChart
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
    this.fetchStatistics();
    this.fetchMonthlyHeatmapData();
    this.fetchInjuryCauseData();
  },
  
  beforeDestroy() {
    this.removeEventListeners();
  },
  
  methods: {
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
      
      // 获取统计数据（四个变量）
      this.fetchStatistics();
      
      // 获取患者流量月度时间分布数据
      this.fetchMonthlyHeatmapData();
      
      // 获取伤因分布数据
      this.fetchInjuryCauseData();
      
      // 模拟查询过程
      setTimeout(() => {
        this.queryLoading = false;
        
        console.log('查询参数:', {
          dateRange: this.dateRange,
          season: this.selectedSeason,
          timePeriod: this.selectedTimePeriod,
          year: this.selectedYear
        });
        
        this.$message.success('数据查询完成！');
      }, 1500);
    },

    // 获取患者流量月度时间分布数据
    fetchMonthlyHeatmapData() {
      // 构建查询参数
      let params = {};
      
      // 如果有日期范围，添加到参数中
      if (this.dateRange && this.dateRange.length === 2) {
        params.startDate = this.dateRange[0];
        params.endDate = this.dateRange[1];
      }
      
      // 添加年份参数
      if (this.selectedYear) {
        params.year = this.selectedYear;
      }
      
      // 添加季节参数
      if (this.selectedSeason && this.selectedSeason !== 'all') {
        // 将季节字符串转换为数字
        const seasonMap = {
          'spring': 0,
          'summer': 1,
          'autumn': 2,
          'winter': 3
        };
        params.season = seasonMap[this.selectedSeason];
      }
      
      // 添加时间段参数
      if (this.selectedTimePeriod && this.selectedTimePeriod !== 'all') {
        // 将时间段字符串转换为数字（与数据库定义一致）
        const timePeriodMap = {
          'night': 0,           // 夜间(00:00-07:59)
          'morning_peak': 1,    // 早高峰(08:00-09:59)
          'noon_peak': 2,       // 午高峰(10:00-11:59)
          'afternoon': 3,       // 下午(12:00-16:59)
          'evening_peak': 4,    // 晚高峰(17:00-19:59)
          'evening': 5          // 晚上(20:00-23:59)
        };
        params.timePeriod = timePeriodMap[this.selectedTimePeriod];
      }
      
      console.log('月度热力图查询参数:', params);
      
      // 只发送月度热力图数据请求
      this.$axios.get('/api/patient-statistics/monthly-heatmap', { params })
        .then(response => {
          console.log('月度热力图数据请求成功:', response.data);
          // 这里可以处理热力图数据
          if (response.data.success) {
            console.log('热力图数据:', response.data.data);
          }
        })
        .catch(error => {
          console.error('月度热力图数据请求失败:', error);
          this.$message.error('获取月度热力图数据失败');
        });
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
        params.year = this.selectedYear;
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

/* 主要内容区域 */
.dashboard-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧控制面板 */
.control-panel {
  width: 280px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 20px;
  overflow-y: auto;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.panel-section {
  margin-bottom: 25px;
}

.panel-section h3 {
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #3498db;
}

.panel-section h3 i {
  margin-right: 8px;
  color: #3498db;
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

/* 右侧可视化区域 */
.visualization-area {
  flex: 1;
  padding: 20px;
  overflow: hidden;
  position: relative;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 15px;
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


/* 新的紧凑网格布局 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto auto auto;
  gap: 15px;
  padding: 15px;
  height: calc(100vh - 300px);
  min-height: 600px;
}

/* 主热力图 - 占据第一行 */
.main-heatmap {
  grid-column: 1;
  grid-row: 1;
  min-height: 350px;
}

/* 饼状图容器 - 第二行，三个并排 */
.pie-chart-container {
  grid-column: 1;
  grid-row: 2;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  min-height: 200px;
}

/* 旭日图容器 - 第三行 */
.sunburst-container {
  grid-column: 1;
  grid-row: 3;
  min-height: 300px;
}

/* 伤因分布容器 - 第四行 */
.injury-cause-container {
  grid-column: 1;
  grid-row: 4;
  min-height: 300px;
}

/* 身体热力图容器 - 第五行 */
.body-heatmap-container {
  grid-column: 1;
  grid-row: 5;
  min-height: 250px;
}

/* 新的紧凑图表框样式 */
.grid-item {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.grid-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

/* 分隔线样式 */
.grid-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #3498db, transparent);
  opacity: 0.3;
}

/* 饼状图框 */
.pie-chart-box {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 旭日图框 */
.sunburst-chart-box {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 身体热力图框 */
.body-heatmap-box {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 科技感图表框（保留原有样式用于兼容） */
.chart-box {
  background: linear-gradient(135deg, rgba(30, 60, 114, 0.1), rgba(42, 82, 152, 0.1));
  border: 2px solid transparent;
  border-radius: 15px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.chart-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, #00d4ff, #0099cc, #0066cc, #0033cc);
  border-radius: 15px;
  padding: 2px;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
  z-index: -1;
}

.chart-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
}

.chart-box:hover::before {
  background: linear-gradient(45deg, #00d4ff, #0099cc, #0066cc, #0033cc, #00d4ff);
  animation: borderGlow 2s linear infinite;
}

@keyframes borderGlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 紧凑图表标题 */
.chart-header {
  padding: 12px 15px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 3px;
}

.chart-title i {
  font-size: 16px;
  color: white;
}

.chart-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 11px;
  font-weight: 400;
}

/* 紧凑图表内容 */
.chart-content {
  padding: 15px;
  height: calc(100% - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.chart-placeholder {
  text-align: center;
  color: #666;
}

.chart-placeholder i {
  font-size: 32px;
  color: #3498db;
  margin-bottom: 10px;
  display: block;
  opacity: 0.7;
}

.chart-placeholder p {
  font-size: 14px;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
}

.chart-placeholder small {
  font-size: 11px;
  color: #666;
}

/* 不规则布局 */
.chart-1 {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
}

.chart-2 {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
}

.chart-3 {
  grid-column: 3 / 4;
  grid-row: 1 / 2;
}

.chart-4 {
  grid-column: 1 / 2;
  grid-row: 2 / 3;
}

.chart-5 {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
}

.chart-6 {
  grid-column: 3 / 4;
  grid-row: 2 / 3;
}

/* 图表组件 */
.chart-item {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.chart-item:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.chart-item.chart-dragging {
  z-index: 1000;
  transform: rotate(1deg) scale(1.02);
}

.chart-header {
  height: 45px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  cursor: move;
}

.chart-title {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 14px;
}

.chart-title i {
  margin-right: 8px;
  font-size: 16px;
}

.chart-controls {
  display: flex;
  gap: 5px;
}

.close-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.chart-content {
  height: calc(100% - 45px);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.chart-placeholder {
  text-align: center;
  color: #666;
}

.chart-placeholder i {
  font-size: 48px;
  color: #3498db;
  margin-bottom: 15px;
  display: block;
  opacity: 0.7;
}

.chart-placeholder p {
  font-size: 16px;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
}

.chart-placeholder small {
  font-size: 12px;
  color: #95a5a6;
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
@media (max-width: 1600px) {
  .secondary-charts {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .secondary-charts {
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
  
  .secondary-charts {
    grid-template-columns: 1fr;
  }
  
  .main-charts-container {
    flex-direction: column;
  }
  
  .filter-container {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-item {
    width: 100%;
  }
}
</style>
