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
            size="small"
            @change="onFilterChange">
          </el-date-picker>
        </div>
        <div class="filter-item">
          <label>季节</label>
          <el-select v-model="selectedSeason" placeholder="选择季节" size="small" @change="onFilterChange">
            <el-option label="全部" value="all"></el-option>
            <el-option label="春季(3-5月)" value="spring"></el-option>
            <el-option label="夏季(6-8月)" value="summer"></el-option>
            <el-option label="秋季(9-11月)" value="autumn"></el-option>
            <el-option label="冬季(12-2月)" value="winter"></el-option>
          </el-select>
        </div>
        <div class="filter-item">
          <label>时间段</label>
          <el-select v-model="selectedTimePeriod" placeholder="选择时间段" size="small" @change="onFilterChange">
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
          <el-select v-model="selectedYear" placeholder="选择年份" size="small" @change="onFilterChange">
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

      <!-- 可视化图表区域 - 左侧三行图表，右侧一个人体图 -->
      <div class="charts-grid">
        <!-- 左侧图表区域 -->
        <div class="left-charts-area">
          <!-- 第一行：病例时间统计图（横条型） -->
          <div class="chart-item chart-horizontal">
            <div class="chart-title-overlay">
              <div class="chart-title">
                <i class="fas fa-chart-line"></i>
                病例时间统计图
              </div>
              <div class="chart-subtitle">患者流量月度时间分布</div>
            </div>
            <div class="chart-content">
            <MonthlyTimeHeatmap 
              :selectedYear="selectedYear"
              :startDate="dateRange && dateRange.length === 2 ? dateRange[0] : null"
              :endDate="dateRange && dateRange.length === 2 ? dateRange[1] : null"
              :season="selectedSeason"
              :timePeriod="selectedTimePeriod" />
            </div>
          </div>
          
          <!-- 第二行：三个饼状图水平排列 -->
          <div class="pie-charts-row">
            <!-- ISS分布图 -->
            <div class="chart-item chart-pie">
              <div class="chart-title-overlay">
                <div class="chart-title">
                  <i class="fas fa-chart-pie"></i>
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
            <div class="chart-item chart-pie">
              <div class="chart-title-overlay">
                <div class="chart-title">
                  <i class="fas fa-chart-pie"></i>
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
            
            <!-- RTS分布图 -->
            <div class="chart-item chart-pie">
              <div class="chart-title-overlay">
                <div class="chart-title">
                  <i class="fas fa-chart-pie"></i>
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
          </div>
          
          <!-- 第三行：柱状图 + 旭日图 -->
          <div class="bottom-charts-row">
            <!-- 伤因分布图 -->
            <div class="chart-item chart-bar">
              <div class="chart-title-overlay">
                <div class="chart-title">
                  <i class="fas fa-chart-bar"></i>
                  伤因分布图
                </div>
                <div class="chart-subtitle">受伤原因分类统计</div>
              </div>
              <div class="chart-content">
            <InjuryCauseChart 
              :selectedYear="selectedYear"
              :startDate="dateRange && dateRange.length === 2 ? dateRange[0] : null"
              :endDate="dateRange && dateRange.length === 2 ? dateRange[1] : null"
              :season="selectedSeason"
              :timePeriod="selectedTimePeriod" />
              </div>
          </div>
          
            <!-- 身体区域损伤图 -->
            <div class="chart-item chart-sunburst">
              <div class="chart-title-overlay">
                <div class="chart-title">
                  <i class="fas fa-sun"></i>
                  身体区域损伤图
                </div>
              </div>
              <div class="chart-content">
                <BodyRegionSunburst 
                  :startDate="dateRange && dateRange.length === 2 ? dateRange[0] : null"
                  :endDate="dateRange && dateRange.length === 2 ? dateRange[1] : null"
                  :season="selectedSeason"
                  :timePeriod="selectedTimePeriod"
                  :year="selectedYear" />
                </div>
              </div>
            </div>
          </div>

        <!-- 右侧区域：人群身体热力图 + 预测模块 -->
        <div class="right-area">
          <!-- 人群身体热力图 -->
          <div class="chart-item chart-heatmap">
            <div class="chart-title-overlay">
              <div class="chart-title">
                <i class="fas fa-fire"></i>
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
          
          <!-- 预测模块预留位置 -->
          <div class="chart-item chart-prediction">
            <div class="chart-title-overlay">
              <div class="chart-title">
                <i class="fas fa-crystal-ball"></i>
                预测模块
              </div>
            </div>
            <div class="chart-content">
              <div class="prediction-placeholder">
                <div class="placeholder-content">
                  <i class="fas fa-cog fa-spin"></i>
                  <p>预测模块开发中...</p>
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
import ISSDistributionChart from '@/components/ISSDistributionChart.vue'
import GCSDistributionChart from '@/components/GCSDistributionChart.vue'
import RTSDistributionChart from '@/components/RTSDistributionChart.vue'
import BodyRegionSunburst from '@/components/BodyRegionSunburstWidget.vue'
import PopulationBodyHeatmapWidget from '@/components/PopulationBodyHeatmapWidget.vue'

export default {
  name: 'DashboardPage',
  components: {
    MonthlyTimeHeatmap,
    InjuryCauseChart,
    ISSDistributionChart,
    GCSDistributionChart,
    RTSDistributionChart,
    BodyRegionSunburst,
    PopulationBodyHeatmapWidget
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
    // 筛选条件变化时的处理
    onFilterChange() {
      console.log('=== Dashboard: 筛选条件发生变化，自动更新所有数据 ===');
      console.log('Dashboard: 当前筛选条件:', {
        selectedYear: this.selectedYear,
        selectedSeason: this.selectedSeason,
        selectedTimePeriod: this.selectedTimePeriod,
        dateRange: this.dateRange
      });
      
      // 自动更新统计数据（四个统计卡片）
      console.log('=== Dashboard: 准备调用fetchStatistics ===');
      try {
        this.fetchStatistics();
        console.log('=== Dashboard: fetchStatistics调用成功 ===');
      } catch (error) {
        console.error('=== Dashboard: fetchStatistics调用失败 ===');
        console.error('Dashboard: fetchStatistics错误:', error);
      }
      
      // 自动更新伤因分布数据
      console.log('=== Dashboard: 准备调用fetchInjuryCauseData ===');
      try {
        this.fetchInjuryCauseData();
        console.log('=== Dashboard: fetchInjuryCauseData调用成功 ===');
      } catch (error) {
        console.error('=== Dashboard: fetchInjuryCauseData调用失败 ===');
        console.error('Dashboard: fetchInjuryCauseData错误:', error);
      }
      
      // 其他图表组件会通过props变化自动重新获取数据
      // ISS分布图、GCS分布图、RTS分布图、月度时间热力图、身体区域旭日图、人口身体热力图等都会通过watch监听props变化自动重新获取数据
      console.log('Dashboard: 其他图表组件将通过props变化自动重新获取数据');
    },
    
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
      console.log('=== Dashboard: fetchStatistics方法被调用 ===');
      console.log('Dashboard: fetchStatistics - 方法开始执行');
      console.log('Dashboard: fetchStatistics - 调用堆栈:', new Error().stack);
      console.log('Dashboard: fetchStatistics - this对象:', this);
      console.log('Dashboard: fetchStatistics - $axios存在:', !!this.$axios);
      
      // 构建查询参数
      let params = {};
      
      // 如果有日期范围，添加到参数中
      if (this.dateRange && this.dateRange.length === 2) {
        params.startDate = this.dateRange[0];
        params.endDate = this.dateRange[1];
      }
      
      // 添加四个维度的筛选条件
      if (this.selectedYear) {
        params.year = parseInt(this.selectedYear);
      }
      
      if (this.selectedSeason && this.selectedSeason !== 'all') {
        // 季节映射
        const seasonMapping = {
          'spring': 0,    // 春季
          'summer': 1,    // 夏季
          'autumn': 2,    // 秋季
          'winter': 3     // 冬季
        };
        params.season = seasonMapping[this.selectedSeason];
      }
      
      if (this.selectedTimePeriod && this.selectedTimePeriod !== 'all') {
        // 时间段映射
        const timePeriodMapping = {
          'night': 0,         // 夜间
          'morning_peak': 1,  // 早高峰
          'noon_peak': 2,     // 午高峰
          'afternoon': 3,     // 下午
          'evening_peak': 4,  // 晚高峰
          'evening': 5        // 晚上
        };
        params.timePeriod = timePeriodMapping[this.selectedTimePeriod];
      }
      
      console.log('Dashboard: 获取统计数据，参数:', params);
      console.log('Dashboard: 当前筛选条件:', {
        selectedYear: this.selectedYear,
        selectedSeason: this.selectedSeason,
        selectedTimePeriod: this.selectedTimePeriod,
        dateRange: this.dateRange
      });
      
      console.log('=== Dashboard: 准备发送API请求到 /api/patient-statistics/statistics ===');
      console.log('Dashboard: API请求参数:', params);
      console.log('Dashboard: axios实例存在:', !!this.$axios);
      console.log('Dashboard: axios baseURL:', this.$axios ? this.$axios.defaults.baseURL : 'undefined');
      
      // 强制检查axios是否可用
      if (!this.$axios) {
        console.error('=== Dashboard: $axios不存在，无法发送请求 ===');
        this.$message.error('网络请求工具不可用');
        return;
      }
      
      console.log('=== Dashboard: 开始发送API请求 ===');
      const requestPromise = this.$axios.get('/api/patient-statistics/statistics', { params });
      console.log('=== Dashboard: API请求已发送，Promise对象:', requestPromise);
      
      requestPromise
        .then(res => {
          console.log('=== Dashboard: 统计数据API响应成功 ===');
          console.log('Dashboard: 统计数据API响应:', res.data);
          if (res.data.success && res.data.data) {
            const data = res.data.data;
            this.totalPatients = data.totalPatients || 0;
            this.dailyAverage = Math.round(data.averagePatientsPerDay * 10) / 10;
            this.avgInterventionTime = Math.round(data.averageInterventionTime * 10) / 10;
            this.successRate = Math.round(data.successRate * 10) / 10;
            
            console.log('Dashboard: 统计数据更新完成:', {
              totalPatients: this.totalPatients,
              dailyAverage: this.dailyAverage,
              avgInterventionTime: this.avgInterventionTime,
              successRate: this.successRate
            });
          } else {
            console.warn('Dashboard: 未获取到有效统计数据');
          }
        })
        .catch(err => {
          console.error('=== Dashboard: 统计数据API请求失败 ===');
          console.error('Dashboard: 错误详情:', err);
          console.error('Dashboard: 错误消息:', err.message);
          console.error('Dashboard: 错误响应:', err.response);
          this.$message.error('获取统计数据失败');
        });
    },

    // 处理查询按钮点击
    handleQuery() {
      console.log('=== Dashboard: handleQuery方法被调用 ===');
      console.log('Dashboard: handleQuery - 方法开始执行');
      console.log('Dashboard: handleQuery - 调用堆栈:', new Error().stack);
      
      this.queryLoading = true;
      
      console.log('Dashboard: 开始查询数据，参数:', {
        dateRange: this.dateRange,
        season: this.selectedSeason,
        timePeriod: this.selectedTimePeriod,
        year: this.selectedYear
      });
      
      // 获取统计数据（四个变量）
      console.log('=== Dashboard: 准备调用fetchStatistics ===');
      console.log('Dashboard: fetchStatistics方法存在:', typeof this.fetchStatistics);
      console.log('Dashboard: 即将调用fetchStatistics');
      
      try {
        this.fetchStatistics();
        console.log('=== Dashboard: fetchStatistics调用成功 ===');
      } catch (error) {
        console.error('=== Dashboard: fetchStatistics调用失败 ===');
        console.error('Dashboard: fetchStatistics错误:', error);
      }
      
      // 获取伤因分布数据
      console.log('=== Dashboard: 准备调用fetchInjuryCauseData ===');
      console.log('Dashboard: fetchInjuryCauseData方法存在:', typeof this.fetchInjuryCauseData);
      
      try {
        this.fetchInjuryCauseData();
        console.log('=== Dashboard: fetchInjuryCauseData调用成功 ===');
      } catch (error) {
        console.error('=== Dashboard: fetchInjuryCauseData调用失败 ===');
        console.error('Dashboard: fetchInjuryCauseData错误:', error);
      }
      
      // 其他图表组件会通过props变化自动重新获取数据
      // ISS分布图、GCS分布图、RTS分布图等都会通过watch监听props变化自动重新获取数据
      console.log('Dashboard: 其他图表组件将通过props变化自动重新获取数据');
      
      // 模拟查询过程
      setTimeout(() => {
        this.queryLoading = false;
        this.$message.success('数据查询完成！');
        console.log('=== Dashboard: 查询完成 ===');
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
  width: 100vw;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  font-family: 'Microsoft YaHei', sans-serif;
  overflow: hidden; /* 禁止整个页面滚动 */
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

/* 主要内容区域 - 全屏布局，无滚动 */
.dashboard-main {
  flex: 1;
  padding: 20px;
  overflow: hidden; /* 禁止滚动 */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
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
  height: 80px; /* 固定高度 */
}

/* 图表网格容器 - CSS Grid布局，无滚动 */
.charts-grid {
  flex: 1; /* 占据剩余空间 */
  display: grid;
  grid-template-columns: 3fr 1fr; /* 2列：左侧图表区域占3份，右侧人体图占1份 */
  gap: 15px;
  overflow: hidden; /* 禁止滚动 */
}

/* 左侧图表区域 */
.left-charts-area {
  display: grid;
  grid-template-rows: 1fr 1fr 1fr; /* 三行等分 */
  gap: 15px;
}

/* 右侧区域：人群身体热力图 + 预测模块 */
.right-area {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 预测模块样式 */
.chart-prediction {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
}

.prediction-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.placeholder-content {
  text-align: center;
  color: #909399;
}

.placeholder-content i {
  font-size: 24px;
  margin-bottom: 10px;
  color: #409EFF;
}

.placeholder-content p {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

/* 第二行：三个饼状图水平排列 */
.pie-charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr; /* 三列等分 */
  gap: 15px;
}

/* 第三行：柱状图 + 旭日图 */
.bottom-charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 两列等分 */
  gap: 15px;
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
  position: relative; /* 为标题覆盖定位 */
}

/* 图表标题覆盖样式 - 显示在右上角 */
.chart-title-overlay {
  position: absolute;
  top: 10px;
  right: 15px;
  background: rgba(52, 152, 219, 0.9);
  backdrop-filter: blur(10px);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.chart-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 3px;
}

.chart-title i {
  margin-right: 6px;
  font-size: 14px;
}

.chart-subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.2;
}

/* 图表样式类 - 保留用于样式标识 */
.chart-horizontal,
.chart-pie,
.chart-bar,
.chart-sunburst,
.chart-vertical {
  /* 样式类保留，用于组件标识 */
  position: relative;
}

/* 图表组件尺寸调整 - 适配网格布局 */
.chart-item >>> .monthly-time-heatmap,
.chart-item >>> .injury-cause-chart,
.chart-item >>> .iss-distribution-chart,
.chart-item >>> .gcs-distribution-chart,
.chart-item >>> .rts-distribution-chart,
.chart-item >>> .body-region-sunburst,
.chart-item >>> .population-body-heatmap {
  height: 100% !important;
  min-height: unset !important;
  display: flex !important;
  flex-direction: column !important;
}

/* 图表内容区域调整 */
.chart-item >>> .chart-content {
  flex: 1 !important;
  min-height: unset !important;
  padding: 0 !important; /* 移除内边距，让图表占据整个区域 */
  background: transparent !important; /* 透明背景，让图表组件自己处理背景 */
}

/* 图表画布调整 */
.chart-item >>> .chart-canvas,
.chart-item >>> .donut-chart,
.chart-item >>> .heatmap-container,
.chart-item >>> .sunburst-container,
.chart-item >>> .population-heatmap-container {
  height: 100% !important;
  min-height: unset !important;
  flex: 1 !important;
}

/* 图表标题区域调整 */
.chart-item >>> .chart-header {
  flex-shrink: 0 !important;
  padding: 10px 15px !important;
}

.chart-item >>> .chart-title {
  font-size: 14px !important;
  margin-bottom: 5px !important;
}

.chart-item >>> .chart-subtitle {
  font-size: 12px !important;
  margin-bottom: 10px !important;
}

/* 加载和错误状态调整 */
.chart-item >>> .loading-container,
.chart-item >>> .error-container,
.chart-item >>> .empty-data {
  height: 100% !important;
  min-height: unset !important;
  flex: 1 !important;
}

/* 图例区域调整 */
.chart-item >>> .chart-legend {
  max-height: 120px !important;
  overflow-y: auto !important;
}

/* 响应式字体调整 */
@media (min-width: 1920px) {
  .chart-item >>> .chart-title {
    font-size: 16px !important;
  }
  
  .chart-item >>> .chart-subtitle {
    font-size: 13px !important;
  }
}

@media (min-width: 2560px) {
  .chart-item >>> .chart-title {
    font-size: 18px !important;
  }
  
  .chart-item >>> .chart-subtitle {
    font-size: 14px !important;
  }
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

/* 响应式设计 - 大屏适配 */
@media (min-width: 1920px) {
  .dashboard-header {
    height: 70px;
  }
  
  .filter-bar {
    height: 60px;
  }
  
  .stats-cards {
    height: 100px;
  }
  
  .charts-grid {
    gap: 20px;
  }
}

@media (min-width: 2560px) {
  .dashboard-header {
    height: 80px;
  }
  
  .filter-bar {
    height: 70px;
  }
  
  .stats-cards {
    height: 120px;
  }
  
  .charts-grid {
    gap: 25px;
  }
}

@media (min-width: 3840px) {
  .charts-grid {
    grid-template-columns: 3fr 1fr; /* 4K屏幕保持2列布局 */
    gap: 25px;
  }
}

@media (max-width: 1366px) {
  .charts-grid {
    grid-template-columns: 1fr; /* 小屏幕改为1列 */
    grid-template-rows: auto; /* 自动高度 */
  }
  
  .left-charts-area {
    grid-template-rows: auto auto auto; /* 三行自动高度 */
  }
  
  .pie-charts-row {
    grid-template-columns: 1fr; /* 饼图改为1列 */
    grid-template-rows: 1fr 1fr 1fr; /* 三行 */
  }
  
  .bottom-charts-row {
    grid-template-columns: 1fr; /* 底部图表改为1列 */
    grid-template-rows: 1fr 1fr; /* 两行 */
  }
  
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
    height: 120px;
  }
}

@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr; /* 手机屏幕改为1列 */
    grid-template-rows: auto; /* 自动高度 */
  }
  
  .left-charts-area {
    grid-template-rows: auto auto auto; /* 三行自动高度 */
  }
  
  .pie-charts-row {
    grid-template-columns: 1fr; /* 饼图改为1列 */
    grid-template-rows: 1fr 1fr 1fr; /* 三行 */
  }
  
  .bottom-charts-row {
    grid-template-columns: 1fr; /* 底部图表改为1列 */
    grid-template-rows: 1fr 1fr; /* 两行 */
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
    height: 200px;
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

