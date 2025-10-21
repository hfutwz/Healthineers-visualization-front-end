<template>
  <el-dialog
    :visible="true"
    width="800px"
    :before-close="handleClose"
    title="干预时间线"
    class="timeline-dialog"
  >
    <!-- 患者信息头部 -->
    <div class="patient-header">
        <h3>患者干预时间线</h3>
      <div class="patient-info">
          <div class="info-item">
            <span class="label">患者ID:</span>
          <span class="value">{{ patientId || '未知' }}</span>
          </div>
          <div class="info-item">
            <span class="label">接诊日期:</span>
          <span class="value">{{ admissionDate }}</span>
          </div>
          <div class="info-item">
          <span class="label">关键事件:</span>
          <span class="value">{{ keyEvents.length }} 项</span>
          </div>
          <div class="info-item">
          <span class="label">非关键事件:</span>
          <span class="value">{{ nonKeyEvents.length }} 项</span>
        </div>
      </div>
    </div>
    
    <!-- 时间线容器 - 按时间分组布局 -->
    <div class="timeline-container">
      <!-- 中央时间轴 -->
      <div class="timeline-axis"></div>
      
      <!-- 时间线事件列表 - 按时间分组 -->
      <div class="timeline-events">
        <div 
          v-for="(timeGroup, timeIndex) in groupedTimelineEvents"
          :key="timeIndex"
          class="timeline-time-group"
        >
          <!-- 时间点 -->
          <div class="time-point">
            <div class="time-dot" :class="{ 'key-dot': timeGroup.hasKeyEvent }"></div>
            <div class="time-label">{{ formatEventTime(timeGroup.time) }}</div>
          </div>
          
          <!-- 该时间点的所有事件 -->
          <div class="events-row">
            <!-- 关键事件（左侧） -->
            <div class="key-events">
              <div class="key-events-row">
                <div 
                  v-for="(event, eventIndex) in timeGroup.keyEvents"
                  :key="`key-${eventIndex}`"
                  class="event-item key-event compact"
                  @click="showStatistics(event)"
                >
                <div class="event-icon">
                    <i :class="getEventIcon(event.eventName)"></i>
                </div>
                <div class="event-details">
                    <div class="event-name">{{ event.eventName }}</div>
          </div>
        </div>
      </div>
    </div>
    
            <!-- 非关键事件（右侧） -->
            <div class="non-key-events">
              <!-- 非关键事件横向排列 -->
              <div class="non-key-events-row">
                <div 
                  v-for="(eventGroup, eventIndex) in timeGroup.nonKeyEvents"
                  :key="`non-key-${eventIndex}`"
                  class="event-item non-key-event compact"
                >
                <div class="event-icon">
                    <i :class="getEventIcon(eventGroup.eventName)"></i>
                </div>
                <div class="event-details">
                    <div class="event-name">{{ eventGroup.eventName }}</div>
                </div>
                </div>
              </div>
              
              <!-- 去向信息显示在右侧底部 -->
              <div v-if="timeGroup.keyEvents.some(event => event.eventName === '离室')" class="destination-info">
                <span class="destination-label">去向:</span>
                <span class="destination-value">{{ timeGroup.keyEvents.find(event => event.eventName === '离室')?.destination || '未知' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="exportTimeline">导出时间线</el-button>
    </span>

    <!-- 统计曲线弹窗 -->
    <el-dialog
      :visible="statisticsDialogVisible"
      width="800px"
      :before-close="closeStatisticsDialog"
      :title="`${selectedEventName} - 统计分布`"
      class="statistics-dialog"
      :append-to-body="true"
      :modal="true"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
      :destroy-on-close="false"
    >
      <div class="statistics-content">
        <div class="statistics-header" style="background: #f5f7fa; border: 1px solid #e4e7ed; padding: 15px; margin: -20px -20px 15px -20px; border-radius: 4px;">
          <h3 class="statistics-title" style="font-size: 18px; font-weight: 500; margin: 0 0 10px 0; color: #303133;">{{ statisticsData.eventType }} - 统计分布</h3>
          <div class="statistics-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px;">
            <div class="statistics-item" style="background: #fff; padding: 8px 12px; border: 1px solid #e4e7ed; border-radius: 4px;">
              <div class="statistics-item-label" style="font-size: 12px; color: #909399; margin-bottom: 2px;">事件类型</div>
              <div class="statistics-item-value" style="font-size: 14px; font-weight: 500; color: #303133;">{{ statisticsData.eventType }}</div>
            </div>
            <div class="statistics-item" style="background: #fff; padding: 8px 12px; border: 1px solid #e4e7ed; border-radius: 4px;">
              <div class="statistics-item-label" style="font-size: 12px; color: #909399; margin-bottom: 2px;">平均时间</div>
              <div class="statistics-item-value" style="font-size: 14px; font-weight: 500; color: #303133;">{{ statisticsData.meanTime?.toFixed(1) }} 分钟</div>
            </div>
            <div class="statistics-item" style="background: #fff; padding: 8px 12px; border: 1px solid #e4e7ed; border-radius: 4px;">
              <div class="statistics-item-label" style="font-size: 12px; color: #909399; margin-bottom: 2px;">中位时间</div>
              <div class="statistics-item-value" style="font-size: 14px; font-weight: 500; color: #303133;">{{ statisticsData.medianTime?.toFixed(1) }} 分钟</div>
            </div>
            <div class="statistics-item" style="background: #fff; padding: 8px 12px; border: 1px solid #e4e7ed; border-radius: 4px;">
              <div class="statistics-item-label" style="font-size: 12px; color: #909399; margin-bottom: 2px;">标准差</div>
              <div class="statistics-item-value" style="font-size: 14px; font-weight: 500; color: #303133;">{{ statisticsData.standardDeviation?.toFixed(1) }} 分钟</div>
            </div>
            <div class="statistics-item" style="background: #fff; padding: 8px 12px; border: 1px solid #e4e7ed; border-radius: 4px;">
              <div class="statistics-item-label" style="font-size: 12px; color: #909399; margin-bottom: 2px;">当前患者时间</div>
              <div class="statistics-item-value" style="font-size: 14px; font-weight: 500; color: #303133;">{{ statisticsData.currentPatientTime?.toFixed(1) }} 分钟</div>
            </div>
            <div class="statistics-item" style="background: #fff; padding: 8px 12px; border: 1px solid #e4e7ed; border-radius: 4px;">
              <div class="statistics-item-label" style="font-size: 12px; color: #909399; margin-bottom: 2px;">与均值差值</div>
              <div class="statistics-item-value" :class="getDifferenceClass()" style="font-size: 14px; font-weight: 500;">
                {{ getTimeDifference() }}
              </div>
            </div>
            <div class="statistics-item" style="background: #fff; padding: 8px 12px; border: 1px solid #e4e7ed; border-radius: 4px;">
              <div class="statistics-item-label" style="font-size: 12px; color: #909399; margin-bottom: 2px;">质控标准线</div>
              <div class="statistics-item-value" style="font-size: 14px; font-weight: 500; color: #303133;">{{ statisticsData.qualityControlLine?.toFixed(1) }} 分钟</div>
        </div>
        </div>
        </div>
        
        <div class="chart-container">
          <div ref="chartContainer" style="width: 100%; height: 400px;"></div>
        </div>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'InterventionTimelineDialog',
  props: {
    patientId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      keyEvents: [],
      nonKeyEvents: [],
      admissionDate: '',
      statisticsDialogVisible: false,
      selectedEventName: '',
      statisticsData: {},
      chart: null
    }
  },
  computed: {
    timelineEvents() {
      // 合并所有事件并按时间排序
      const allEvents = [
        ...this.keyEvents.map(event => ({ ...event, eventType: 'key' })),
        ...this.nonKeyEvents.map(event => ({ ...event, eventType: 'non_key' }))
      ]
      
      // 按时间排序
      return allEvents
        .filter(event => event.eventTime)
        .sort((a, b) => new Date(a.eventTime) - new Date(b.eventTime))
    },
    
    groupedTimelineEvents() {
      // 按时间分组事件
      const timeGroups = {}
      
      // 处理关键事件
      this.keyEvents.forEach(event => {
        if (event.eventTime) {
          const timeKey = new Date(event.eventTime).getTime()
          if (!timeGroups[timeKey]) {
            timeGroups[timeKey] = {
              time: event.eventTime,
              keyEvents: [],
              nonKeyEvents: [],
              hasKeyEvent: false
            }
          }
          timeGroups[timeKey].keyEvents.push(event)
          timeGroups[timeKey].hasKeyEvent = true
        }
      })
      
      // 处理非关键事件 - 按事件名称分组
      const nonKeyEventGroups = {}
      this.nonKeyEvents.forEach(event => {
        if (event.eventTime) {
          const timeKey = new Date(event.eventTime).getTime()
          if (!timeGroups[timeKey]) {
            timeGroups[timeKey] = {
              time: event.eventTime,
              keyEvents: [],
              nonKeyEvents: [],
              hasKeyEvent: false
            }
          }
          
          // 按事件名称分组
          const eventName = event.eventName
          if (!nonKeyEventGroups[timeKey]) {
            nonKeyEventGroups[timeKey] = {}
          }
          if (!nonKeyEventGroups[timeKey][eventName]) {
            nonKeyEventGroups[timeKey][eventName] = {
              eventName: eventName,
              events: [],
              destination: event.destination
            }
          }
          nonKeyEventGroups[timeKey][eventName].events.push(event)
        }
      })
      
      // 将分组的非关键事件添加到时间组
      Object.keys(nonKeyEventGroups).forEach(timeKey => {
        const timeGroup = timeGroups[timeKey]
        if (timeGroup) {
          timeGroup.nonKeyEvents = Object.values(nonKeyEventGroups[timeKey])
        }
      })
      
      // 转换为数组并按时间排序
      return Object.values(timeGroups)
        .sort((a, b) => new Date(a.time) - new Date(b.time))
    }
  },
  watch: {
    statisticsDialogVisible(newVal) {
      if (newVal) {
        // 对话框打开时，确保图表正确显示
        this.$nextTick(() => {
          setTimeout(() => {
            if (this.chart) {
              this.chart.resize()
            } else if (this.statisticsData && Object.keys(this.statisticsData).length > 0) {
              this.initChart()
            }
          }, 100)
        })
      }
    }
  },
  mounted() {
    this.loadTimelineData()
  },
  methods: {
    async loadTimelineData() {
      try {
        console.log('开始加载患者时间线数据，患者ID:', this.patientId)
        
        // 加载关键事件
        const keyResponse = await this.$axios.get(`/api/intervention/key-events/${this.patientId}`)
        console.log('关键事件API响应:', keyResponse.data)
        this.keyEvents = keyResponse.data.data || []
        
        // 加载非关键事件
        const nonKeyResponse = await this.$axios.get(`/api/intervention/non-key-events/${this.patientId}`)
        console.log('非关键事件API响应:', nonKeyResponse.data)
        this.nonKeyEvents = nonKeyResponse.data.data || []
        
        console.log('加载完成 - 关键事件数量:', this.keyEvents.length, '非关键事件数量:', this.nonKeyEvents.length)
        
        // 设置接诊日期
        if (this.keyEvents.length > 0) {
          const admissionEvent = this.keyEvents.find(event => event.eventName === '入室')
          if (admissionEvent) {
            this.admissionDate = this.formatDate(admissionEvent.eventTime)
          }
        }
      } catch (error) {
        console.error('加载时间线数据失败:', error)
        this.$message.error('加载时间线数据失败: ' + error.message)
      }
    },
    
    getEventIcon(eventName) {
      const iconMap = {
        '入室': 'el-icon-s-home',
        '采血': 'el-icon-document',
        'CT': 'el-icon-camera',
        '离室': 'el-icon-right',
        '外周静脉': 'el-icon-connection',
        '鼻导管': 'el-icon-wind-power'
      }
      return iconMap[eventName] || 'el-icon-document'
    },
    
    async showStatistics(event) {
      try {
        this.selectedEventName = event.eventName
        this.statisticsDialogVisible = true
        
        // 获取统计数据，传入当前患者ID
        const response = await this.$axios.get(`/api/intervention/statistics/${this.getEventTypeKey(event.eventName)}`, {
          params: {
            patientId: this.patientId
          }
        })
        this.statisticsData = response.data.data || {}
        
        // 等待对话框完全打开后再初始化图表
        this.$nextTick(() => {
          // 使用setTimeout确保对话框动画完成
          setTimeout(() => {
            this.initChart()
          }, 300)
        })
      } catch (error) {
        console.error('获取统计数据失败:', error)
        this.$message.error('获取统计数据失败: ' + error.message)
      }
    },
    
    getEventTypeKey(eventName) {
      const eventTypeMap = {
        '入室': 'admission',
        'CT': 'ct',
        '气管插管': 'intubation',
        '输血开始': 'transfusion',
        '离室': 'discharge',
        '死亡': 'death'
      }
      return eventTypeMap[eventName] || 'unknown'
    },
    
    getTimeDifference() {
      if (!this.statisticsData.currentPatientTime || !this.statisticsData.meanTime) {
        return '0.0 分钟'
      }
      const difference = this.statisticsData.currentPatientTime - this.statisticsData.meanTime
      const sign = difference >= 0 ? '+' : ''
      return `${sign}${difference.toFixed(1)} 分钟`
    },
    
    getDifferenceClass() {
      if (!this.statisticsData.currentPatientTime || !this.statisticsData.meanTime) {
        return ''
      }
      const difference = this.statisticsData.currentPatientTime - this.statisticsData.meanTime
      if (Math.abs(difference) <= this.statisticsData.standardDeviation) {
        return 'normal-difference' // 在1个标准差内，正常
      } else if (difference > 0) {
        return 'positive-difference' // 超过均值，较慢
      } else {
        return 'negative-difference' // 低于均值，较快
      }
    },
    
    initChart() {
      if (!this.$refs.chartContainer) {
        console.warn('图表容器不存在，延迟初始化')
        setTimeout(() => {
          this.initChart()
        }, 100)
        return
      }
      
      // 销毁已存在的图表实例
      if (this.chart) {
        this.chart.dispose()
        this.chart = null
      }
      
      // 确保容器有尺寸
      const container = this.$refs.chartContainer
      if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        console.warn('图表容器尺寸为0，延迟初始化')
        // 如果容器没有尺寸，延迟初始化
        setTimeout(() => {
          this.initChart()
        }, 200)
        return
      }
      
      try {
        this.chart = echarts.init(this.$refs.chartContainer)
        console.log('图表初始化成功，容器尺寸:', container.offsetWidth, 'x', container.offsetHeight)
      } catch (error) {
        console.error('图表初始化失败:', error)
        return
      }
      
      const option = {
        title: {
          text: `${this.selectedEventName} - 时间分布统计`,
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            if (!params || !params[0]) return ''
            return `时间: ${params[0].axisValue} 分钟<br/>频次: ${params[0].value}`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          name: '时间 (分钟)',
          nameLocation: 'middle',
          nameGap: 30,
          axisLine: {
            lineStyle: {
              color: '#666'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '频次',
          nameLocation: 'middle',
          nameGap: 50,
          axisLine: {
            lineStyle: {
              color: '#666'
            }
          }
        },
        series: [
          {
            name: '分布',
            type: 'line',
            data: this.generateChartData(),
            smooth: true,
            symbol: 'none', // 不显示数据点
            lineStyle: {
              color: '#409EFF',
              width: 3
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                  { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
                ]
              }
            },
            markLine: {
              data: [
                {
                  name: '均值线',
                  xAxis: this.statisticsData.meanTime || 0,
                  lineStyle: {
                    color: '#67C23A',
                    type: 'solid',
                    width: 2
                  },
                  label: {
                    formatter: '均值: {c} 分钟',
                    position: 'end'
                  }
                },
                // 只有当质控标准线大于0时才显示
                ...(this.statisticsData.qualityControlLine > 0 ? [{
                  name: '质控标准线',
                  xAxis: this.statisticsData.qualityControlLine,
                  lineStyle: {
                    color: '#E6A23C',
                    type: 'dashed',
                    width: 2
                  },
                  label: {
                    formatter: '质控标准: {c} 分钟',
                    position: 'end'
                  }
                }] : []),
                {
                  name: '当前患者',
                  xAxis: this.statisticsData.currentPatientTime || 0,
                  lineStyle: {
                    color: '#F56C6C',
                    type: 'solid',
                    width: 3
                  },
                  label: {
                    formatter: '当前患者: {c} 分钟',
                    position: 'end'
                  }
                }
              ]
            }
          }
        ]
      }
      
      this.chart.setOption(option, true) // 使用true强制重新渲染
      
      // 强制刷新图表显示
      setTimeout(() => {
        if (this.chart) {
          this.chart.resize()
        }
      }, 50)
      
      // 监听窗口大小变化
      window.addEventListener('resize', this.handleResize)
    },
    
    generateChartData() {
      if (!this.statisticsData.distributionPoints || this.statisticsData.distributionPoints.length === 0) {
        return []
      }
      
      const data = []
      for (let i = 0; i < 100; i++) {
        const x = (i - 50) * 2.0 // -100 到 100
        const y = this.statisticsData.distributionPoints[i] || 0
        data.push([x, y])
      }
      
      return data
    },
    
    formatEventTime(eventTime) {
      if (!eventTime) return ''
      
      const date = new Date(eventTime)
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      
      return `${year}-${month}-${day} ${hours}:${minutes}`
    },
    
    formatDate(eventTime) {
      if (!eventTime) return ''
      
      const date = new Date(eventTime)
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      
      return `${year}-${month}-${day}`
    },
    
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    },
    
    closeStatisticsDialog() {
      this.statisticsDialogVisible = false
      if (this.chart) {
        this.chart.dispose()
        this.chart = null
      }
      // 移除窗口大小变化监听器
      window.removeEventListener('resize', this.handleResize)
    },
    
    exportTimeline() {
      // 实现导出功能
      this.$message.info('导出功能开发中...')
    },
    
    handleClose() {
      this.closeStatisticsDialog()
      this.$emit('close')
    }
  },
  
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
    }
  }
}
</script>

<style>
/* 全局样式，不使用scoped */
.timeline-dialog .patient-header {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.timeline-dialog .patient-header h3 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 18px;
}

.timeline-dialog .patient-info {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.timeline-dialog .info-item {
  display: flex;
  align-items: center;
}

.timeline-dialog .label {
  font-weight: 500;
  color: #606266;
  margin-right: 8px;
}

.timeline-dialog .value {
  color: #303133;
  font-weight: 600;
}

.timeline-dialog .timeline-container {
  max-height: 500px;
  overflow-y: auto;
  padding: 20px 0;
  position: relative;
}

.timeline-dialog .timeline-axis {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e4e7ed;
  transform: translateX(-50%);
  z-index: 1;
}

.timeline-dialog .timeline-events {
  width: 100%;
  position: relative;
  z-index: 2;
}

.timeline-dialog .timeline-time-group {
  display: flex;
  align-items: flex-start;
  margin-bottom: 30px;
  position: relative;
  width: 100%;
}

.timeline-dialog .time-point {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 3;
  min-width: 120px;
}

.timeline-dialog .time-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #67C23A;
  border: 3px solid #fff;
  box-shadow: 0 0 0 2px #67C23A;
  position: relative;
}

.timeline-dialog .time-dot.key-dot {
  background: #409EFF;
  box-shadow: 0 0 0 2px #409EFF;
}

.timeline-dialog .time-label {
  margin-top: 8px;
  font-size: 11px;
  font-weight: 600;
  color: #303133;
  background: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  white-space: nowrap;
  text-align: center;
  line-height: 1.2;
}

.timeline-dialog .events-row {
  display: flex;
  width: 100%;
  min-height: 60px;
  align-items: flex-start;
  padding-top: 20px;
}

.timeline-dialog .key-events {
  flex: 1;
  padding-right: 100px; /* 进一步减少关键事件到时间线的距离 */
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: flex-end; /* 让关键事件右对齐，更靠近时间线 */
  align-items: flex-end; /* 关键事件右对齐 */
}

.timeline-dialog .key-events-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
  justify-content: flex-end; /* 关键事件行右对齐，更靠近时间线 */
}

.timeline-dialog .non-key-events {
  flex: 1;
  padding-left: 30px; /* 非关键事件距离时间线左侧80px */
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.timeline-dialog .non-key-events-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
}

.timeline-dialog .event-item {
  display: flex;
  align-items: flex-start;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  max-width: 100%;
}

.timeline-dialog .event-item.compact {
  padding: 8px 10px;
  border-radius: 6px;
  min-width: 80px;
  max-width: 120px;
  flex-shrink: 0;
}

.timeline-dialog .event-item.key-event {
  cursor: pointer;
  border-color: #409EFF;
}

.timeline-dialog .event-item.key-event:hover {
  background: #f0f9ff;
  border-color: #409EFF;
  transform: translateX(-3px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.2);
}

.timeline-dialog .event-item.non-key-event {
  border-color: #67C23A;
}

.timeline-dialog .event-item.non-key-event:hover {
  background: #f0f9ff;
  border-color: #67C23A;
  transform: translateX(3px);
  box-shadow: 0 4px 8px rgba(103, 194, 58, 0.2);
}

.timeline-dialog .event-icon {
  margin-right: 10px;
  margin-top: 2px;
  flex-shrink: 0;
}

.timeline-dialog .event-icon i {
  font-size: 16px;
  color: #606266;
}

.timeline-dialog .event-item.compact .event-icon i {
  font-size: 14px;
}

.timeline-dialog .key-event .event-icon i {
  color: #409EFF;
}

.timeline-dialog .non-key-event .event-icon i {
  color: #67C23A;
}

.timeline-dialog .event-details {
  flex: 1;
  min-width: 0;
}

.timeline-dialog .event-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  line-height: 1.3;
}

.timeline-dialog .event-item.compact .event-name {
  font-size: 12px;
  margin-bottom: 2px;
  line-height: 1.2;
}

.timeline-dialog .event-description {
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
  margin-bottom: 6px;
}

.timeline-dialog .destination-info {
  display: flex;
  align-items: center;
  font-size: 12px;
  margin-top: 8px;
  padding: 6px 8px;
  background: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  position: absolute;
  bottom: -10px;
  right: 0;
  min-width: 120px;
}

.timeline-dialog .destination-label {
  color: #606266;
  margin-right: 6px;
}

.timeline-dialog .destination-value {
  color: #409EFF;
  font-weight: 600;
}

.timeline-dialog .statistics-content .statistics-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.timeline-dialog .chart-container {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  background: #fff;
  min-height: 400px;
}

/* 统计对话框样式 */
.timeline-dialog .statistics-dialog {
  z-index: 3000 !important;
}

.timeline-dialog .statistics-dialog .el-dialog {
  background: #fff !important;
}

.timeline-dialog .statistics-dialog .el-dialog__body {
  background: #fff !important;
  padding: 20px !important;
}

.timeline-dialog .statistics-content {
  background: #fff;
  min-height: 500px;
}

.timeline-dialog .statistics-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
}

/* 统计对话框顶部样式 - 使用更高优先级 */
.timeline-dialog .statistics-dialog .el-dialog__body .statistics-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  padding: 20px !important;
  margin: -20px -20px 20px -20px !important;
  border-radius: 8px 8px 0 0 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.timeline-dialog .statistics-dialog .el-dialog__body .statistics-title {
  font-size: 24px !important;
  font-weight: 600 !important;
  margin: 0 0 15px 0 !important;
  text-align: center !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
  color: white !important;
}

.timeline-dialog .statistics-dialog .el-dialog__body .statistics-list {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
  gap: 12px !important;
  margin-top: 15px !important;
}

.timeline-dialog .statistics-dialog .el-dialog__body .statistics-item {
  background: rgba(255, 255, 255, 0.15) !important;
  padding: 12px 16px !important;
  border-radius: 8px !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  transition: all 0.3s ease !important;
}

.timeline-dialog .statistics-dialog .el-dialog__body .statistics-item:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.timeline-dialog .statistics-dialog .el-dialog__body .statistics-item-label {
  font-size: 14px !important;
  font-weight: 500 !important;
  margin-bottom: 4px !important;
  opacity: 0.9 !important;
  color: white !important;
}

.timeline-dialog .statistics-dialog .el-dialog__body .statistics-item-value {
  font-size: 16px !important;
  font-weight: 600 !important;
  color: #fff !important;
}

.timeline-dialog .chart-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin: 20px 0 10px 0;
  padding: 15px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.timeline-dialog .chart-subtitle {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 20px;
  font-style: italic;
}

/* 差值颜色样式 */
.timeline-dialog .normal-difference {
  color: #67C23A;
  font-weight: 600;
}

.timeline-dialog .statistics-dialog .el-dialog__body .statistics-item-value.normal-difference {
  color: #67C23A !important;
}

.timeline-dialog .statistics-dialog .el-dialog__body .statistics-item-value.warning-difference {
  color: #E6A23C !important;
}

.timeline-dialog .statistics-dialog .el-dialog__body .statistics-item-value.danger-difference {
  color: #F56C6C !important;
}

.timeline-dialog .positive-difference {
  color: #E6A23C;
  font-weight: 600;
}

.timeline-dialog .negative-difference {
  color: #409EFF;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .timeline-dialog .patient-info {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .timeline-dialog .time-point {
    min-width: 100px;
  }
  
  .timeline-dialog .time-label {
    font-size: 10px;
    padding: 3px 6px;
  }
  
  .timeline-dialog .events-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .timeline-dialog .key-events,
  .timeline-dialog .non-key-events {
    padding: 0;
    width: 100%;
  }
  
  .timeline-dialog .event-item {
    padding: 10px;
  }
  
  .timeline-dialog .event-icon i {
    font-size: 14px;
  }
  
  .timeline-dialog .event-name {
  font-size: 13px;
  }
  
  .timeline-dialog .event-description {
    font-size: 11px;
  }
  
  .timeline-dialog .destination-info {
    font-size: 11px;
    position: static;
    margin-top: 8px;
    min-width: auto;
  }
}
</style>