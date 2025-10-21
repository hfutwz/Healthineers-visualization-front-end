<template>
  <div class="injury-cause-chart">
    <div class="chart-header">
      <div class="chart-title">
        <i class="el-icon-pie-chart"></i>
        <span>伤因分布</span>
      </div>
      <div class="chart-subtitle">12个月伤因统计</div>
    </div>
    
    <div class="chart-content">
      <div class="chart-wrapper">
        <div ref="chart" class="chart" style="width: 100%; height: 300px;"></div>
      </div>
    </div>
    
    <div class="chart-footer">
      <div class="legend">
        <div class="legend-title">伤因类型</div>
        <ul class="legend-list">
          <li v-for="(item, index) in legendData" :key="index" class="legend-item">
            <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
            <span class="legend-label">{{ item.name }}</span>
            <span class="legend-value">{{ item.value }}例</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'InjuryCauseDistributionChart',
  props: {
    selectedYear: {
      type: [String, Number],
      default: new Date().getFullYear()
    }
  },
  data() {
    return {
      chart: null,
      chartData: [],
      legendData: [],
      totalPatients: 0
    }
  },
  mounted() {
    this.initChart()
    this.fetchData()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
    }
    window.removeEventListener('resize', this.handleResize)
  },
  watch: {
    selectedYear() {
      this.fetchData()
    }
  },
  methods: {
    async fetchData() {
      try {
        const response = await this.$axios.get('/api/patient-statistics/injury-cause-distribution', {
          params: { year: this.selectedYear }
        })
        
        if (response.data.success) {
          this.processData(response.data.data)
          this.updateChart()
        } else {
          this.$message.error('获取伤因分布数据失败')
        }
      } catch (error) {
        console.error('获取伤因分布数据失败:', error)
        this.$message.error('获取伤因分布数据失败')
        // 使用模拟数据
        this.loadMockData()
      }
    },
    
    processData(rawData) {
      // 处理原始数据，按伤因类型分组
      const causeMap = new Map()
      
      rawData.forEach(item => {
        const cause = item.injury_cause_category || '未知'
        if (!causeMap.has(cause)) {
          causeMap.set(cause, 0)
        }
        causeMap.set(cause, causeMap.get(cause) + item.patient_count)
      })
      
      // 转换为图表数据格式
      this.chartData = []
      this.legendData = []
      this.totalPatients = 0
      
      const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4']
      
      let colorIndex = 0
      causeMap.forEach((value, key) => {
        this.chartData.push({
          name: key,
          value: value
        })
        
        this.legendData.push({
          name: key,
          value: value,
          color: colors[colorIndex % colors.length]
        })
        
        this.totalPatients += value
        colorIndex++
      })
    },
    
    loadMockData() {
      // 模拟数据
      const mockData = [
        { name: '交通事故', value: 450 },
        { name: '跌倒', value: 320 },
        { name: '工作事故', value: 280 },
        { name: '运动伤害', value: 180 },
        { name: '其他', value: 120 }
      ]
      
      this.chartData = mockData
      this.legendData = mockData.map((item, index) => ({
        ...item,
        color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'][index]
      }))
      this.totalPatients = mockData.reduce((sum, item) => sum + item.value, 0)
      
      this.updateChart()
    },
    
    initChart() {
      this.chart = echarts.init(this.$refs.chart)
      this.updateChart()
    },
    
    updateChart() {
      if (!this.chart) return
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: this.chartData.map(item => item.name)
        },
        series: [
          {
            name: '伤因分布',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['60%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
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
            data: this.chartData
          }
        ]
      }
      
      this.chart.setOption(option)
    },
    
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    }
  }
}
</script>

<style scoped>
.injury-cause-chart {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-header {
  padding: 15px 20px 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.chart-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 3px;
}

.chart-title i {
  margin-right: 8px;
  font-size: 18px;
}

.chart-subtitle {
  font-size: 12px;
  opacity: 0.8;
}

.chart-content {
  flex: 1;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-wrapper {
  width: 100%;
  height: 100%;
}

.chart {
  width: 100%;
  height: 100%;
}

.chart-footer {
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
}

.legend-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-label {
  flex: 1;
  color: #666;
}

.legend-value {
  color: #2c3e50;
  font-weight: 600;
}
</style>
