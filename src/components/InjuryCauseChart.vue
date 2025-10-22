<template>
  <div class="injury-cause-chart">
    <div class="chart-header">
      <div class="chart-title">
        <i class="el-icon-s-data"></i>
        <span>伤因分布柱状图</span>
      </div>
      <div class="chart-subtitle">月度伤因分布统计</div>
    </div>
    <div class="chart-content">
      <div class="content-wrapper">
        <div class="chart-container">
          <div ref="chartContainer" class="chart-canvas"></div>
          <div v-if="loading" class="loading-overlay">
            <i class="el-icon-loading"></i>
            <p>加载中...</p>
          </div>
          <div v-else-if="error" class="error-overlay">
            <i class="el-icon-warning"></i>
            <p>{{ error }}</p>
            <button @click="retryChart" class="retry-btn">重试</button>
          </div>
          <div v-else-if="!chartData || chartData.length === 0" class="empty-data">
            <i class="el-icon-info"></i>
            <p>暂无数据</p>
          </div>
        </div>
        
        <!-- 简化统计信息展示 -->
        <div v-if="!loading && !error && chartData && chartData.length > 0" class="simple-stats">
          <div class="stats-row">
            <span class="stat-label">最繁忙时段：</span>
            <span class="stat-value">{{ busiestInjuryType.name }}</span>
          </div>
          <div class="stats-row">
            <span class="stat-label">最繁忙季节：</span>
            <span class="stat-value">{{ busiestSeason.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'InjuryCauseChart',
  props: {
    selectedYear: {
      type: String,
      default: () => new Date().getFullYear().toString()
    },
    startDate: {
      type: String,
      default: null
    },
    endDate: {
      type: String,
      default: null
    },
    season: {
      type: String,
      default: 'all'
    },
    timePeriod: {
      type: String,
      default: 'all'
    }
  },
  data() {
    return {
      chart: null,
      loading: false,
      error: null,
      chartData: null
    }
  },
  computed: {
    // 计算最繁忙创伤类型
    busiestInjuryType() {
      if (!this.chartData || this.chartData.length === 0) {
        return { name: '', count: 0, percentage: 0 }
      }
      
      let maxCount = 0
      let maxCause = null
      let totalCount = 0
      
      // 计算每种伤因的总人数
      this.chartData.forEach(cause => {
        const causeTotal = cause.monthly_data ? cause.monthly_data.reduce((sum, count) => sum + count, 0) : 0
        totalCount += causeTotal
        
        if (causeTotal > maxCount) {
          maxCount = causeTotal
          maxCause = cause
        }
      })
      
      const percentage = totalCount > 0 ? (maxCount / totalCount) * 100 : 0
      
      return {
        name: maxCause ? maxCause.cause_name : '',
        count: maxCount,
        percentage: percentage
      }
    },
    
    // 计算最繁忙季节
    busiestSeason() {
      if (!this.chartData || this.chartData.length === 0) {
        return { name: '', count: 0, percentage: 0 }
      }
      
      // 按季节统计（假设数据按月份排列：1-3月春季，4-6月夏季，7-9月秋季，10-12月冬季）
      const seasonStats = {
        '春季': { months: [0, 1, 2], count: 0 }, // 1-3月
        '夏季': { months: [3, 4, 5], count: 0 }, // 4-6月
        '秋季': { months: [6, 7, 8], count: 0 }, // 7-9月
        '冬季': { months: [9, 10, 11], count: 0 } // 10-12月
      }
      
      // 统计每个季节的总人数
      this.chartData.forEach(cause => {
        if (cause.monthly_data) {
          seasonStats['春季'].count += cause.monthly_data.slice(0, 3).reduce((sum, count) => sum + count, 0)
          seasonStats['夏季'].count += cause.monthly_data.slice(3, 6).reduce((sum, count) => sum + count, 0)
          seasonStats['秋季'].count += cause.monthly_data.slice(6, 9).reduce((sum, count) => sum + count, 0)
          seasonStats['冬季'].count += cause.monthly_data.slice(9, 12).reduce((sum, count) => sum + count, 0)
        }
      })
      
      // 找到人数最多的季节
      let maxCount = 0
      let maxSeason = ''
      let totalCount = 0
      
      Object.keys(seasonStats).forEach(season => {
        const count = seasonStats[season].count
        totalCount += count
        if (count > maxCount) {
          maxCount = count
          maxSeason = season
        }
      })
      
      const percentage = totalCount > 0 ? (maxCount / totalCount) * 100 : 0
      
      return {
        name: maxSeason,
        count: maxCount,
        percentage: percentage
      }
    }
  },
  watch: {
    selectedYear: {
      handler() {
        this.fetchData()
      },
      immediate: true
    },
    startDate: {
      handler() {
        this.fetchData()
      }
    },
    endDate: {
      handler() {
        this.fetchData()
      }
    },
    season: {
      handler() {
        this.fetchData()
      }
    },
    timePeriod: {
      handler() {
        this.fetchData()
      }
    }
  },
  mounted() {
    console.log('InjuryCauseChart: Component mounted')
    this.$nextTick(() => {
      // 延迟初始化，确保DOM完全渲染
      setTimeout(() => {
        this.initChart()
        this.fetchData()
      }, 100)
    })
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
    }
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    // 初始化图表
    initChart(retryCount = 0) {
      console.log('InjuryCauseChart: Initializing chart, retry:', retryCount)
      
      if (!this.$refs.chartContainer) {
        console.error('InjuryCauseChart: Chart container not found')
        if (retryCount < 3) {
          console.log('InjuryCauseChart: Retrying in 200ms...')
          setTimeout(() => {
            this.initChart(retryCount + 1)
          }, 200)
          return false
        }
        this.error = '图表容器未找到'
        return false
      }
      
      // 清理现有图表实例
      if (this.chart) {
        this.chart.dispose()
        this.chart = null
      }
      
      try {
        this.chart = echarts.init(this.$refs.chartContainer)
        console.log('InjuryCauseChart: Chart initialized successfully')
        
        // 监听窗口大小变化
        window.addEventListener('resize', this.handleResize)
        
        return true
      } catch (error) {
        console.error('InjuryCauseChart: Failed to initialize chart:', error)
        if (retryCount < 3) {
          console.log('InjuryCauseChart: Retrying initialization...')
          setTimeout(() => {
            this.initChart(retryCount + 1)
          }, 200)
          return false
        }
        this.error = '图表初始化失败: ' + error.message
        return false
      }
    },
    
    // 处理窗口大小变化
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    },
    
    // 获取数据
    async fetchData() {
      console.log('InjuryCauseChart: Fetching data...')
      
      this.loading = true
      this.error = null
      
      try {
        // 构建请求参数
        const seasonMapping = {
          'spring': 0,
          'summer': 1,
          'autumn': 2,
          'winter': 3
        }
        
        const timePeriodMapping = {
          'night': 0,
          'morning_peak': 1,
          'noon_peak': 2,
          'afternoon': 3,
          'evening_peak': 4,
          'evening': 5
        }
        
        const params = {
          year: this.selectedYear ? parseInt(this.selectedYear) : null,
          startDate: this.startDate,
          endDate: this.endDate,
          season: this.season !== 'all' ? seasonMapping[this.season] : null,
          timePeriod: this.timePeriod !== 'all' ? timePeriodMapping[this.timePeriod] : null
        }
        
        // 移除空值参数
        Object.keys(params).forEach(key => {
          if (params[key] === null || params[key] === undefined || params[key] === '') {
            delete params[key]
          }
        })
        
        console.log('InjuryCauseChart: Request params:', params)
        const response = await this.$axios.get('/api/patient-statistics/injury-cause-distribution', { params })
        
        console.log('InjuryCauseChart: API response:', response.data)
        
        if (response.data.success) {
          this.chartData = response.data.data
          console.log('InjuryCauseChart: Data received:', this.chartData)
          
          if (this.chartData && this.chartData.length > 0) {
            this.$nextTick(() => {
              this.renderChart()
            })
          }
        } else {
          throw new Error(response.data.errorMsg || '获取数据失败')
        }
      } catch (error) {
        console.error('InjuryCauseChart: Fetch data failed:', error)
        
        if (error.response) {
          if (error.response.status === 404) {
            this.error = 'API接口不存在'
          } else if (error.response.status === 500) {
            this.error = '服务器内部错误'
          } else {
            this.error = `请求失败 (${error.response.status})`
          }
        } else if (error.request) {
          this.error = '无法连接到服务器'
        } else {
          this.error = `获取数据失败: ${error.message}`
        }
      } finally {
        this.loading = false
      }
    },
    
    // 渲染图表
    renderChart() {
      console.log('InjuryCauseChart: Rendering chart')
      
      if (!this.chart) {
        console.error('InjuryCauseChart: Chart instance not found, trying to reinitialize...')
        if (this.initChart()) {
          // 重新初始化成功，继续渲染
          console.log('InjuryCauseChart: Chart reinitialized, continuing render...')
        } else {
          this.error = '图表实例不存在'
          return
        }
      }
      
      if (!this.chartData || this.chartData.length === 0) {
        console.warn('InjuryCauseChart: No data to render')
        return
      }
      
      try {
        // 处理数据，构建堆叠柱状图
        const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        const series = []
        const legendData = []
        
        // 为每种伤因创建数据系列
        this.chartData.forEach(cause => {
          const seriesItem = {
            name: cause.cause_name,
            type: 'bar',
            stack: 'total',
            data: cause.monthly_data || [],
            itemStyle: {
              color: cause.color
            },
            emphasis: {
              focus: 'series'
            }
          }
          series.push(seriesItem)
          legendData.push(cause.cause_name)
        })
        
        const option = {
          title: {
            text: '月度伤因分布统计',
            left: 'center',
            top: 20,
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
              if (!params || params.length === 0) return ''
              
              let result = params[0].name + '<br/>'
              let total = 0
              params.forEach(param => {
                if (param.value > 0) {
                  result += `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`
                  result += param.seriesName + ': ' + param.value + '人<br/>'
                  total += param.value
                }
              })
              result += `<span style="font-weight:bold;color:#333;">总计: ${total}人</span>`
              return result
            }
          },
          legend: {
            data: legendData,
            top: 50,
            left: 'center',
            itemWidth: 12,
            itemHeight: 12,
            textStyle: {
              fontSize: 12
            }
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
            data: months,
            axisLabel: {
              fontSize: 11,
              color: '#666'
            },
            axisLine: {
              lineStyle: {
                color: '#ddd'
              }
            }
          },
          yAxis: {
            type: 'value',
            name: '患者人数',
            nameTextStyle: {
              color: '#666',
              fontSize: 12
            },
            axisLabel: {
              fontSize: 11,
              color: '#666'
            },
            axisLine: {
              lineStyle: {
                color: '#ddd'
              }
            },
            splitLine: {
              lineStyle: {
                color: '#f0f0f0',
                type: 'dashed'
              }
            }
          },
          series: series
        }
        
        // 设置图表配置
        this.chart.setOption(option, true)
        console.log('InjuryCauseChart: Chart rendered successfully')
        
        // 强制刷新图表
        setTimeout(() => {
          if (this.chart) {
            this.chart.resize()
          }
        }, 100)
        
      } catch (error) {
        console.error('InjuryCauseChart: Error rendering chart:', error)
        this.error = '图表渲染失败: ' + error.message
      }
    },
    
    // 重试图表
    retryChart() {
      console.log('InjuryCauseChart: Retrying chart...')
      this.error = null
      this.loading = true
      
      // 清理现有图表
      if (this.chart) {
        this.chart.dispose()
        this.chart = null
      }
      
      // 延迟重新初始化
      setTimeout(() => {
        this.initChart()
        this.fetchData()
      }, 100)
    }
  }
}
</script>

<style scoped>
.injury-cause-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

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

.chart-content {
  flex: 1;
  padding: 15px;
  background: #f8f9fa;
  position: relative;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
}

.chart-container {
  flex: 1;
  height: 100%;
  min-height: 300px;
  position: relative;
}

.chart-canvas {
  width: 100%;
  height: 100%;
  min-height: 400px;
  background: #fff;
  border-radius: 4px;
}

.empty-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
  color: #999;
  text-align: center;
}

.empty-data i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #ddd;
}

.empty-data p {
  font-size: 16px;
  margin: 0;
}

.retry-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
}

.retry-btn:hover {
  background: #0056b3;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 10;
  color: #666;
}

.loading-overlay i,
.error-overlay i {
  font-size: 32px;
  margin-bottom: 10px;
}

.loading-overlay i {
  color: #3498db;
  animation: spin 1s linear infinite;
}

.error-overlay i {
  color: #e74c3c;
}

.loading-overlay p,
.error-overlay p {
  font-size: 14px;
  margin: 0;
}

/* 简化统计信息样式 */
.simple-stats {
  margin-top: 16px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #3498db;
}

.stats-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.stats-row:last-child {
  margin-bottom: 0;
}

.stat-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
  margin-right: 8px;
}

.stat-value {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 600;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>