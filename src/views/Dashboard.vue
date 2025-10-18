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
            <el-option label="早高峰(7-9)" value="morning_peak"></el-option>
            <el-option label="上午(9-12)" value="morning"></el-option>
            <el-option label="中午(12-14)" value="noon"></el-option>
            <el-option label="下午(14-17)" value="afternoon"></el-option>
            <el-option label="晚高峰(17-19)" value="evening_peak"></el-option>
            <el-option label="夜间(19-7)" value="night"></el-option>
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
              <div class="stat-label">总患者数</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="el-icon-warning"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ criticalPatients }}</div>
              <div class="stat-label">危重患者</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="el-icon-time"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ avgResponseTime }}</div>
              <div class="stat-label">平均响应时间(分钟)</div>
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

        <!-- 科技感图表区域 -->
        <div class="tech-charts-container">
          <div class="chart-box chart-1">
            <div class="chart-header">
              <div class="chart-title">
                <i class="el-icon-data-line"></i>
                <span>周热力图</span>
              </div>
              <div class="chart-subtitle">患者流量时间分布</div>
            </div>
            <div class="chart-content">
              <div class="chart-placeholder">
                <i class="el-icon-data-line"></i>
                <p>周热力图</p>
                <small>患者流量时间分布</small>
              </div>
            </div>
          </div>

          <div class="chart-box chart-2">
            <div class="chart-header">
              <div class="chart-title">
                <i class="el-icon-pie-chart"></i>
                <span>创伤部位分析</span>
              </div>
              <div class="chart-subtitle">身体部位损伤统计</div>
            </div>
            <div class="chart-content">
              <div class="chart-placeholder">
                <i class="el-icon-pie-chart"></i>
                <p>创伤部位分析</p>
                <small>身体部位损伤统计</small>
              </div>
            </div>
          </div>

          <div class="chart-box chart-3">
            <div class="chart-header">
              <div class="chart-title">
                <i class="el-icon-data-analysis"></i>
                <span>ISS评分分布</span>
              </div>
              <div class="chart-subtitle">创伤严重度分析</div>
            </div>
            <div class="chart-content">
              <div class="chart-placeholder">
                <i class="el-icon-data-analysis"></i>
                <p>ISS评分分布</p>
                <small>创伤严重度分析</small>
              </div>
            </div>
          </div>

          <div class="chart-box chart-4">
            <div class="chart-header">
              <div class="chart-title">
                <i class="el-icon-user-solid"></i>
                <span>身体区域损伤</span>
              </div>
              <div class="chart-subtitle">人体图可视化</div>
            </div>
            <div class="chart-content">
              <div class="chart-placeholder">
                <i class="el-icon-user-solid"></i>
                <p>身体区域损伤</p>
                <small>人体图可视化</small>
              </div>
            </div>
          </div>

          <div class="chart-box chart-5">
            <div class="chart-header">
              <div class="chart-title">
                <i class="el-icon-timer"></i>
                <span>干预时间效率</span>
              </div>
              <div class="chart-subtitle">救治时间分析</div>
            </div>
            <div class="chart-content">
              <div class="chart-placeholder">
                <i class="el-icon-timer"></i>
                <p>干预时间效率</p>
                <small>救治时间分析</small>
              </div>
            </div>
          </div>

          <div class="chart-box chart-6">
            <div class="chart-header">
              <div class="chart-title">
                <i class="el-icon-share"></i>
                <span>患者流向图</span>
              </div>
              <div class="chart-subtitle">治疗流程可视化</div>
            </div>
            <div class="chart-content">
              <div class="chart-placeholder">
                <i class="el-icon-share"></i>
                <p>患者流向图</p>
                <small>治疗流程可视化</small>
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
export default {
  name: 'DashboardPage',
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
      totalPatients: 1248,
      criticalPatients: 89,
      avgResponseTime: 15.6,
      successRate: 94.2,
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
  },
  
  beforeDestroy() {
    this.removeEventListeners();
  },
  
  methods: {
    // 处理查询按钮点击
    handleQuery() {
      this.queryLoading = true;
      
      // 模拟查询过程
      setTimeout(() => {
        this.queryLoading = false;
        
        // 这里将来会发送多个可视化请求
        console.log('查询参数:', {
          dateRange: this.dateRange,
          season: this.selectedSeason,
          timePeriod: this.selectedTimePeriod,
          year: this.selectedYear
        });
        
        // TODO: 发送多个可视化请求
        // this.fetchHeatmapData();
        // this.fetchInjuryAnalysisData();
        // this.fetchISSScoreData();
        // this.fetchBodyRegionData();
        // this.fetchInterventionTimeData();
        // this.fetchPatientFlowData();
        
        this.$message.success('数据查询完成！');
      }, 1500);
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
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  font-size: 20px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}


/* 科技感图表容器 */
.tech-charts-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 20px;
  padding: 20px;
  height: calc(100vh - 300px);
  min-height: 600px;
}

/* 科技感图表框 */
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

/* 图表标题 */
.chart-header {
  padding: 15px 20px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 153, 204, 0.1));
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #00d4ff;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
}

.chart-title i {
  font-size: 18px;
  color: #00d4ff;
}

.chart-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 400;
}

/* 图表内容 */
.chart-content {
  padding: 20px;
  height: calc(100% - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.05));
}

.chart-placeholder {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

.chart-placeholder i {
  font-size: 48px;
  color: #00d4ff;
  margin-bottom: 15px;
  display: block;
  opacity: 0.7;
}

.chart-placeholder p {
  font-size: 16px;
  margin-bottom: 8px;
  color: #ffffff;
  font-weight: 500;
}

.chart-placeholder small {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
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
  .tech-charts-container {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
  }
}

@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .tech-charts-container {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
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
  
  .tech-charts-container {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(6, 1fr);
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
