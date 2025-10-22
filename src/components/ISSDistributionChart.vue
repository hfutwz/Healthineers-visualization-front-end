<template>
  <div class="iss-distribution-chart">
    <div class="chart-header">
      <div class="chart-title">
        <i class="el-icon-pie-chart"></i>
        <span>ISS评分分布饼图</span>
      </div>
      <div class="chart-subtitle">创伤严重度分析</div>
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
      
      <div v-else class="chart-container">
        <!-- 空数据提示 -->
        <div v-if="chartData.length === 0 || totalPatients === 0" class="empty-data">
          <i class="el-icon-info"></i>
          <h4>暂无ISS数据</h4>
          <p>当前筛选条件下没有找到ISS评分数据</p>
          <small>请尝试调整筛选条件或选择其他时间范围</small>
        </div>
        
        <!-- 甜甜圈图 -->
        <div v-else class="chart-wrapper">
          <div ref="chartContainer" class="donut-chart"></div>
          
          <!-- 图例（包含总计） -->
          <div class="chart-legend">
            <!-- 损伤类型图例 -->
            <div v-for="(item, index) in chartData" :key="index" class="legend-item">
              <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
              <div class="legend-text">
                <div class="legend-name">{{ item.name }}</div>
                <div class="legend-value">{{ item.value }}人 ({{ item.percentage }}%)</div>
              </div>
            </div>
            
            <!-- 总计项 -->
            <div class="legend-item total-item">
              <div class="legend-color total-color"></div>
              <div class="legend-text">
                <div class="legend-name">总计</div>
                <div class="legend-value">{{ totalPatients }}人</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'ISSDistributionChart',
  props: {
    // 筛选参数
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
    },
    year: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      error: null,
      chartData: [],
      chartInstance: null,
      showDebug: false, // 关闭调试模式
      totalPatients: 0
    }
  },
  mounted() {
    console.log('ISS分布图组件已挂载')
    this.initChart()
    this.fetchData()
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize)
  },
  watch: {
    // 监听筛选参数变化，重新获取数据
    startDate() {
      console.log('startDate变化，重新获取数据')
      this.refreshChart()
    },
    endDate() {
      console.log('endDate变化，重新获取数据')
      this.refreshChart()
    },
    season() {
      console.log('season变化，重新获取数据')
      this.refreshChart()
    },
    timePeriod() {
      console.log('timePeriod变化，重新获取数据')
      this.refreshChart()
    },
    year() {
      console.log('year变化，重新获取数据')
      this.refreshChart()
    }
  },
  beforeDestroy() {
    if (this.chartInstance) {
      this.chartInstance.dispose()
    }
    // 移除事件监听
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    initChart() {
      console.log('开始初始化图表')
      this.$nextTick(() => {
        if (this.$refs.chartContainer) {
          console.log('图表容器存在，开始初始化ECharts')
          
          // 如果已存在实例，先销毁
          if (this.chartInstance) {
            this.chartInstance.dispose()
            this.chartInstance = null
          }
          
          this.chartInstance = echarts.init(this.$refs.chartContainer)
          console.log('ECharts实例创建成功:', this.chartInstance)
          
          // 如果有数据，立即更新图表
          if (this.chartData && this.chartData.length > 0) {
            this.updateChart()
          }
        } else {
          console.log('图表容器不存在，延迟初始化')
          setTimeout(() => {
            this.initChart()
          }, 100)
        }
      })
    },
    
    async fetchData() {
      console.log('开始获取ISS分布数据')
      this.loading = true
      this.error = null
      
      try {
        // 构建查询参数
        const params = {}
        
        // 添加日期范围参数
        if (this.startDate) {
          params.startDate = this.startDate
        }
        if (this.endDate) {
          params.endDate = this.endDate
        }
        
        // 添加年份参数
        if (this.year) {
          params.year = parseInt(this.year)
        }
        
        // 添加季节参数（转换为数字）
        if (this.season && this.season !== 'all') {
          const seasonMapping = {
            'spring': 0,  // 春季
            'summer': 1,  // 夏季
            'autumn': 2,  // 秋季
            'winter': 3   // 冬季
          }
          params.season = seasonMapping[this.season]
        }
        
        // 添加时间段参数（转换为数字）
        if (this.timePeriod && this.timePeriod !== 'all') {
          const timePeriodMapping = {
            'night': 0,           // 夜间
            'morning_peak': 1,    // 早高峰
            'noon_peak': 2,       // 午高峰
            'afternoon': 3,       // 下午
            'evening_peak': 4,    // 晚高峰
            'evening': 5          // 晚上
          }
          params.timePeriod = timePeriodMapping[this.timePeriod]
        }
        
        console.log('ISS分布查询参数:', params)
        
        const response = await this.$axios.get('/api/patient-statistics/iss-distribution', { params })
        console.log('ISS分布数据请求成功:', response.data)
        
        if (response.data.success) {
          const rawData = response.data.data || []
          console.log('原始数据:', rawData)
          
           // 处理中文乱码问题，使用中文标签
           this.chartData = rawData.map(item => {
             let name = item.name
             // 检测乱码或根据颜色判断类型
             if (name.includes('') || name.includes('ISS') || name.includes('')) {
               // 根据颜色判断类型
               if (item.color === '#52C41A') {
                 name = '轻度损伤 (ISS≤16)'
               } else if (item.color === '#FA8C16') {
                 name = '重度损伤 (16<ISS≤25)'
               } else if (item.color === '#F5222D') {
                 name = '危重损伤 (ISS>25)'
               }
             }
             return {
               ...item,
               name: name
             }
           })
           
           // 计算总计
           this.calculateStats()
          
           console.log('处理乱码后的图表数据:', this.chartData)
          
          // 强制重新初始化图表以确保正确显示
          this.$nextTick(() => {
            if (this.chartInstance) {
              this.chartInstance.dispose()
              this.chartInstance = null
            }
            this.initChart()
          })
        } else {
          this.error = response.data.errorMsg || '获取ISS分布数据失败'
          console.error('API返回错误:', response.data)
        }
      } catch (error) {
        console.error('ISS分布数据请求失败:', error)
        this.error = '获取ISS分布数据失败: ' + error.message
      } finally {
        this.loading = false
      }
    },
    
    calculateStats() {
      this.totalPatients = this.chartData.reduce((sum, item) => sum + (item.value || 0), 0)
      console.log('总患者数:', this.totalPatients)
    },
    
    updateChart() {
      console.log('开始更新图表')
      
      if (!this.chartInstance) {
        console.log('图表实例不存在，重新初始化')
        this.initChart()
        return
      }
      
      if (!this.chartData || this.chartData.length === 0) {
        console.log('图表数据为空，显示空状态')
        this.showEmptyChart()
        return
      }
      
      console.log('开始渲染图表，数据:', this.chartData)
      
      // 过滤掉值为0的数据项
      const validData = this.chartData.filter(item => item.value > 0)
      
      if (validData.length === 0) {
        console.log('没有有效数据，显示空状态')
        this.showEmptyChart()
        return
      }
      
       // 不再需要清除中心信息
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            return `${params.name}<br/>患者数量: ${params.value}人<br/>占比: ${params.percent}%`
          }
        },
        legend: {
          show: false // 使用自定义图例
        },
        series: [
          {
            name: 'ISS分布',
            type: 'pie',
            radius: ['40%', '70%'], // 甜甜圈图
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 8,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              position: 'outside',
              formatter: function(params) {
                return `${params.name}\n${params.value}人\n${params.percent}%`
              },
              fontSize: 12,
              fontWeight: 'bold'
            },
            labelLine: {
              show: true,
              length: 15,
              length2: 10
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            data: validData.map(item => ({
              value: item.value,
              name: item.name,
              itemStyle: {
                color: item.color
              }
            }))
          }
        ]
      }
      
      console.log('图表配置:', option)
      
      // 先清除图表，再重新设置
      this.chartInstance.clear()
      this.chartInstance.setOption(option, true) // 强制刷新
      
       // 不再需要添加中心信息
    },
    
    showEmptyChart() {
      if (!this.chartInstance) return
      
      const option = {
        title: {
          text: '暂无数据',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#999',
            fontSize: 16
          }
        },
        series: []
      }
      
      this.chartInstance.setOption(option, true)
    },
    
    
    handleResize() {
      if (this.chartInstance) {
        this.chartInstance.resize()
      }
    },
    
     // 强制刷新图表
     refreshChart() {
       console.log('强制刷新图表')
       
       // 重置数据状态
       this.chartData = []
       this.totalPatients = 0
       
       // 重新获取数据
       this.fetchData()
     }
  }
}
</script>

<style scoped>
.iss-distribution-chart {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 500px;
}

.chart-header {
  padding: 20px 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.chart-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.chart-title i {
  margin-right: 8px;
  color: #1890ff;
  font-size: 20px;
}

.chart-subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.chart-content {
  padding: 20px;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #999;
}

.loading-container i,
.error-container i {
  font-size: 32px;
  margin-bottom: 16px;
}

.error-container {
  color: #ff4d4f;
}

.chart-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.debug-info {
  background: #f0f0f0;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
}

.donut-chart {
  width: 100%;
  height: 400px;
  position: relative;
}

/* 图表包装器 */
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 总计项样式 */
.total-item {
  border-top: 1px solid #e8e8e8;
  padding-top: 12px;
  margin-top: 8px;
}

.total-color {
  background: linear-gradient(135deg, #1890ff, #40a9ff) !important;
  border: 2px solid #1890ff;
}

.total-item .legend-name {
  color: #1890ff;
  font-weight: 600;
}

.total-item .legend-value {
  color: #1890ff;
  font-weight: 500;
}


.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-text {
  flex: 1;
}

.legend-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.legend-value {
  font-size: 12px;
  color: #666;
}

/* 空数据提示样式 */
.empty-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #666;
  background: #fafafa;
  border-radius: 8px;
  margin: 20px;
}

.empty-data i {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 16px;
}

.empty-data h4 {
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.empty-data p {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.5;
}

.empty-data small {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .donut-chart {
    height: 300px;
  }
  
}

@media (max-width: 480px) {
  .chart-header {
    padding: 16px 16px 0;
  }
  
  .chart-content {
    padding: 16px;
  }
  
}
</style>