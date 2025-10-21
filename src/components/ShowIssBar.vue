<template>
  <div class="iss-pie-container">
    <div class="header">
      <h2>ISS评分分布饼图</h2>
      <div class="controls">
        <el-select v-model="selectedSeason" placeholder="选择季节" style="width: 120px; margin-right: 15px;">
          <el-option label="全部季节" value="all"></el-option>
          <el-option label="春季" value="spring"></el-option>
          <el-option label="夏季" value="summer"></el-option>
          <el-option label="秋季" value="autumn"></el-option>
          <el-option label="冬季" value="winter"></el-option>
        </el-select>
        
        <el-select v-model="selectedTimePeriod" placeholder="选择时间段" style="width: 150px; margin-right: 15px;">
          <el-option label="全部时间段" value="all"></el-option>
          <el-option label="夜间(00:00-07:59)" value="night_0_759"></el-option>
          <el-option label="早高峰(08:00-09:59)" value="morning_peak_8_959"></el-option>
          <el-option label="午高峰(10:00-11:59)" value="noon_peak_10_1159"></el-option>
          <el-option label="下午(12:00-16:59)" value="afternoon_12_1659"></el-option>
          <el-option label="晚高峰(17:00-19:59)" value="evening_peak_17_1959"></el-option>
          <el-option label="晚上(20:00-23:59)" value="night_20_2359"></el-option>
        </el-select>
        
        <el-button type="primary" @click="refreshData">查询</el-button>
      </div>
    </div>
    
    <div class="chart-wrapper">
      <div ref="pieChart" class="chart" style="width: 100%; height: 500px;"></div>
    </div>
    
    <div class="stats">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ totalPatients }}</div>
            <div class="stat-label">总患者数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ mildPercentage }}%</div>
            <div class="stat-label">轻伤比例</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ severePercentage }}%</div>
            <div class="stat-label">重伤比例</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ criticalPercentage }}%</div>
            <div class="stat-label">严重伤比例</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'ISSPieChart',
  data() {
    return {
      selectedSeason: 'all',
      selectedTimePeriod: 'all',
      chart: null,
      // 模拟数据：季节 × 时间段 × ISS等级
      issData: {
        // 春季数据
        spring: {
          morning_peak: { mild: 30, severe: 15, critical: 5 },
          morning: { mild: 25, severe: 10, critical: 3 },
          noon_peak: { mild: 35, severe: 18, critical: 7 },
          afternoon: { mild: 28, severe: 12, critical: 4 },
          evening_peak: { mild: 40, severe: 22, critical: 10 },
          night: { mild: 20, severe: 8, critical: 2 }
        },
        // 夏季数据
        summer: {
          morning_peak: { mild: 35, severe: 18, critical: 7 },
          morning: { mild: 30, severe: 15, critical: 5 },
          noon_peak: { mild: 45, severe: 25, critical: 12 },
          afternoon: { mild: 32, severe: 16, critical: 6 },
          evening_peak: { mild: 50, severe: 28, critical: 15 },
          night: { mild: 25, severe: 10, critical: 4 }
        },
        // 秋季数据
        autumn: {
          morning_peak: { mild: 28, severe: 12, critical: 4 },
          morning: { mild: 25, severe: 10, critical: 3 },
          noon_peak: { mild: 32, severe: 16, critical: 6 },
          afternoon: { mild: 30, severe: 14, critical: 5 },
          evening_peak: { mild: 38, severe: 20, critical: 8 },
          night: { mild: 22, severe: 9, critical: 3 }
        },
        // 冬季数据
        winter: {
          morning_peak: { mild: 40, severe: 22, critical: 10 },
          morning: { mild: 35, severe: 18, critical: 7 },
          noon_peak: { mild: 45, severe: 25, critical: 12 },
          afternoon: { mild: 38, severe: 20, critical: 8 },
          evening_peak: { mild: 55, severe: 30, critical: 18 },
          night: { mild: 30, severe: 15, critical: 5 }
        }
      },
      totalPatients: 0,
      mildPercentage: 0,
      severePercentage: 0,
      criticalPercentage: 0
    };
  },
  mounted() {
    this.initChart();
    this.calculateStats();
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.pieChart);
      
      // 根据筛选条件获取数据
      const data = this.getFilteredData();
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: ['轻伤(ISS≤16)', '重伤(16<ISS≤25)', '严重伤(ISS>25)']
        },
        series: [
          {
            name: 'ISS评分分布',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: data.mild, name: '轻伤(ISS≤16)', itemStyle: { color: '#67C23A' } },
              { value: data.severe, name: '重伤(16<ISS≤25)', itemStyle: { color: '#E6A23C' } },
              { value: data.critical, name: '严重伤(ISS>25)', itemStyle: { color: '#F56C6C' } }
            ]
          }
        ]
      };
      
      this.chart.setOption(option);
    },
    handleResize() {
      if (this.chart) {
        this.chart.resize();
      }
    },
    refreshData() {
      this.initChart();
      this.calculateStats();
    },
    getFilteredData() {
      let mild = 0;
      let severe = 0;
      let critical = 0;
      
      // 处理季节筛选
      const seasons = this.selectedSeason === 'all' 
        ? ['spring', 'summer', 'autumn', 'winter'] 
        : [this.selectedSeason];
      
      // 处理时间段筛选
      const timePeriods = this.selectedTimePeriod === 'all'
        ? ['morning_peak', 'morning', 'noon_peak', 'afternoon', 'evening_peak', 'night']
        : [this.selectedTimePeriod];
      
      // 累加符合条件的数据
      for (const season of seasons) {
        for (const timePeriod of timePeriods) {
          mild += this.issData[season][timePeriod].mild;
          severe += this.issData[season][timePeriod].severe;
          critical += this.issData[season][timePeriod].critical;
        }
      }
      
      return { mild, severe, critical };
    },
    calculateStats() {
      const data = this.getFilteredData();
      const total = data.mild + data.severe + data.critical;
      
      this.totalPatients = total;
      this.mildPercentage = total > 0 ? ((data.mild / total) * 100).toFixed(1) : 0;
      this.severePercentage = total > 0 ? ((data.severe / total) * 100).toFixed(1) : 0;
      this.criticalPercentage = total > 0 ? ((data.critical / total) * 100).toFixed(1) : 0;
    }
  }
};
</script>

<style scoped>
.iss-pie-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: #fff;
  padding: 15px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header h2 {
  margin: 0;
  color: #303133;
}

.controls {
  display: flex;
  align-items: center;
}

.chart-wrapper {
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.chart {
  border-radius: 4px;
}

.stats {
  margin-bottom: 20px;
}

.stat-card {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  text-align: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .controls {
    flex-wrap: wrap;
  }
}
</style>