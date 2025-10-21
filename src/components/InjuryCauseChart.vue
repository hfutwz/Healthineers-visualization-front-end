<template>
  <div class="injury-cause-chart">
    <div class="chart-header">
      <div class="chart-title">
        <i class="el-icon-s-data"></i>
        <span>伤因分布柱状图</span>
      </div>
      <div class="chart-subtitle">12个月伤因分布统计</div>
    </div>
    <div class="chart-content">
      <div v-if="loading" class="loading-container">
        <i class="el-icon-loading"></i>
        <p>加载中...</p>
      </div>
      <div v-else-if="error" class="error-container">
        <i class="el-icon-warning"></i>
        <p>{{ error }}</p>
      </div>
      <div v-else ref="chartContainer" class="chart-container"></div>
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
    this.initChart()
    this.fetchData()
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
    }
  },
  methods: {
    // 初始化图表
    initChart() {
      if (this.chart) {
        this.chart.dispose()
      }
      this.chart = echarts.init(this.$refs.chartContainer)
      
      // 监听窗口大小变化
      window.addEventListener('resize', this.handleResize)
    },
    
    // 处理窗口大小变化
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    },
    
    // 获取数据
    async fetchData() {
      this.loading = true
      this.error = null
      
      try {
        const params = {
          year: this.selectedYear ? parseInt(this.selectedYear) : null,
          startDate: this.startDate,
          endDate: this.endDate,
          season: this.season !== 'all' ? parseInt(this.season) : null,
          timePeriod: this.timePeriod !== 'all' ? parseInt(this.timePeriod) : null
        }
        
        // 移除空值参数
        Object.keys(params).forEach(key => {
          if (params[key] === null || params[key] === undefined || params[key] === '') {
            delete params[key]
          }
        })
        
        const response = await this.$axios.get('/api/patient-statistics/injury-cause-distribution', { params })
        
        if (response.data.success) {
          this.chartData = response.data.data
          this.renderChart()
        } else {
          throw new Error(response.data.message || '获取数据失败')
        }
      } catch (error) {
        console.error('获取伤因分布数据失败:', error)
        this.error = '获取数据失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    
    // 渲染图表
    renderChart() {
      if (!this.chart || !this.chartData) return
      
      const option = {
        title: {
          text: '伤因分布统计',
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
            let result = params[0].name + '<br/>'
            params.forEach(param => {
              result += `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`
              result += param.seriesName + ': ' + param.value + '人<br/>'
            })
            return result
          }
        },
        legend: {
          data: this.chartData.series ? this.chartData.series.map(s => s.name) : [],
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
          data: this.chartData.months || [],
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
        series: this.chartData.series || []
      }
      
      this.chart.setOption(option, true)
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

.chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
  color: #666;
}

.loading-container i,
.error-container i {
  font-size: 32px;
  margin-bottom: 10px;
  color: #3498db;
}

.loading-container i {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container i {
  color: #e74c3c;
}

.loading-container p,
.error-container p {
  font-size: 14px;
  margin: 0;
}
</style>
