<template>
  <div class="injury-cause-chart">
    <div class="chart-header">
      <div class="chart-title">
        <i class="el-icon-data-line"></i>
        <span>伤因分布</span>
      </div>
      <div class="chart-subtitle">月度伤因统计柱状图</div>
    </div>
    
    <div class="chart-content">
      <div class="chart-wrapper">
        <div ref="chart" class="chart" style="width: 100%; height: 400px;"></div>
      </div>
    </div>
    
    <div class="chart-footer">
      <div class="legend">
        <div class="legend-title">伤因类型统计</div>
        <ul class="legend-list">
          <li v-for="(item, index) in legendData" :key="index" class="legend-item">
            <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
            <span class="legend-label">{{ item.name }}</span>
            <span class="legend-value">{{ item.total }}例</span>
          </li>
        </ul>
      </div>
      
      <!-- 调试信息 -->
      <div v-if="showDebug" class="debug-info">
        <p>数据状态: {{ chartData.length > 0 ? '已加载' : '无数据' }}</p>
        <p>伤因类型: {{ legendData.length }}种</p>
        <p>总病例数: {{ totalPatients }}例</p>
        <button @click="debugData" class="debug-btn">调试数据</button>
        <button @click="forceRefresh" class="debug-btn">强制刷新</button>
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
      totalPatients: 0,
      months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      showDebug: false
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
        console.log('InjuryCauseDistributionChart: 开始获取月度伤因数据')
        const response = await this.$axios.get('/api/patient-statistics/injury-cause-distribution', {
          params: { year: this.selectedYear }
        })
        
        console.log('InjuryCauseDistributionChart: API响应数据:', response.data)
        
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
      console.log('InjuryCauseDistributionChart: 处理月度数据:', rawData)
      
      // 处理月度伤因统计数据
      this.chartData = []
      this.legendData = []
      this.totalPatients = 0
      
      // 为每个伤因类型创建系列数据
      rawData.forEach((causeData, index) => {
        const seriesData = {
          name: causeData.cause_name,
          type: 'bar',
          stack: 'total',
          data: causeData.monthly_data,
          itemStyle: {
            color: causeData.color
          }
        }
        
        this.chartData.push(seriesData)
        
        // 添加到图例
        this.legendData.push({
          name: causeData.cause_name,
          total: causeData.total_count,
          color: causeData.color
        })
        
        this.totalPatients += causeData.total_count
      })
      
      console.log('InjuryCauseDistributionChart: 处理后的图表数据:', this.chartData)
      console.log('InjuryCauseDistributionChart: 图例数据:', this.legendData)
    },
    
    loadMockData() {
      console.log('InjuryCauseDistributionChart: 使用模拟数据')
      // 模拟月度数据
      const mockData = [
        {
          cause_name: '交通伤',
          color: '#FF6B6B',
          total_count: 619,
          monthly_data: [109, 87, 109, 134, 79, 59, 42, 0, 0, 0, 0, 0]
        },
        {
          cause_name: '高坠伤',
          color: '#4ECDC4',
          total_count: 43,
          monthly_data: [11, 5, 7, 7, 8, 3, 2, 0, 0, 0, 0, 0]
        },
        {
          cause_name: '机械伤',
          color: '#45B7D1',
          total_count: 74,
          monthly_data: [12, 13, 11, 12, 10, 9, 7, 0, 0, 0, 0, 0]
        },
        {
          cause_name: '跌倒',
          color: '#96CEB4',
          total_count: 539,
          monthly_data: [127, 107, 74, 79, 82, 46, 24, 0, 0, 0, 0, 0]
        },
        {
          cause_name: '其他',
          color: '#FFEAA7',
          total_count: 134,
          monthly_data: [29, 12, 14, 28, 14, 19, 18, 0, 0, 0, 0, 0]
        }
      ]
      
      this.processData(mockData)
      this.updateChart()
    },
    
    initChart() {
      this.chart = echarts.init(this.$refs.chart)
      this.updateChart()
    },
    
    updateChart() {
      if (!this.chart) {
        console.log('InjuryCauseDistributionChart: 图表实例不存在，跳过更新')
        return
      }
      
      if (!this.chartData || this.chartData.length === 0) {
        console.log('InjuryCauseDistributionChart: 图表数据为空，跳过更新')
        return
      }
      
      console.log('InjuryCauseDistributionChart: 更新图表配置')
      
      const option = {
        title: {
          text: `${this.selectedYear}年月度伤因统计`,
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#2c3e50'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params) {
            let result = params[0].name + '<br/>'
            let total = 0
            params.forEach(param => {
              if (param.value > 0) {
                result += `${param.marker}${param.seriesName}: ${param.value}例<br/>`
                total += param.value
              }
            })
            if (total > 0) {
              result += `<br/>总计: ${total}例`
            }
            return result
          }
        },
        legend: {
          data: this.legendData.map(item => item.name),
          top: 30,
          left: 'center'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: this.months,
          axisLabel: {
            fontSize: 12
          }
        },
        yAxis: {
          type: 'value',
          name: '病例数',
          nameLocation: 'middle',
          nameGap: 30,
          axisLabel: {
            formatter: '{value}例'
          }
        },
        series: this.chartData
      }
      
      console.log('InjuryCauseDistributionChart: 图表配置:', option)
      this.chart.setOption(option, true)
    },
    
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    },
    
    // 调试数据
    debugData() {
      console.log('=== InjuryCauseDistributionChart 调试信息 ===')
      console.log('图表实例:', this.chart)
      console.log('图表数据:', this.chartData)
      console.log('图例数据:', this.legendData)
      console.log('总病例数:', this.totalPatients)
      console.log('选中年份:', this.selectedYear)
      console.log('月份数据:', this.months)
      
      if (this.chart) {
        const option = this.chart.getOption()
        console.log('当前图表配置:', option)
      }
      
      this.$message.info('调试信息已输出到控制台')
    },
    
    // 强制刷新
    forceRefresh() {
      console.log('InjuryCauseDistributionChart: 强制刷新图表')
      this.showDebug = !this.showDebug
      
      if (this.chart) {
        this.chart.dispose()
        this.chart = null
      }
      
      this.$nextTick(() => {
        this.initChart()
        if (this.chartData.length > 0) {
          this.updateChart()
        } else {
          this.fetchData()
        }
      })
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

.debug-info {
  margin-top: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 5px;
  border: 1px solid #e9ecef;
}

.debug-info p {
  margin: 5px 0;
  font-size: 12px;
  color: #666;
}

.debug-btn {
  margin: 5px 5px 0 0;
  padding: 4px 8px;
  font-size: 11px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.debug-btn:hover {
  background-color: #0056b3;
}
</style>

