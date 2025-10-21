<template>
  <div class="monthly-heatmap-container">
    <div class="chart-header">
      <div class="chart-title">
        <i class="el-icon-data-line"></i>
        <span>病例时间统计图</span>
      </div>
      <div class="chart-subtitle">患者流量月度时间分布</div>
    </div>
    
    <div class="chart-content">
      <div class="chart-wrapper">
        <div ref="heatmapChart" class="chart" style="width: 100%; height: 280px;"></div>
      </div>
      
      <div class="legend">
        <div class="legend-scale">
          <ul class="legend-labels">
            <li><span style="background-color: #f2f2f2;"></span>0</li>
            <li><span style="background-color: #c6e48b;"></span>5</li>
            <li><span style="background-color: #7bc96f;"></span>10</li>
            <li><span style="background-color: #49af64;"></span>15</li>
            <li><span style="background-color: #239a3b;"></span>20</li>
            <li><span style="background-color: #196127;"></span>25+</li>
          </ul>
        </div>
        
        <div class="legend-info" v-if="hasData">
          <div class="info-item">
            <span class="info-label">最繁忙时段：</span>
            <span class="info-value">{{ peakTime }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">最繁忙季节：</span>
            <span class="info-value">{{ peakMonth }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-loading :loading="loading" text="正在加载数据..."></el-loading>
    </div>
    
    <!-- 无数据状态 -->
    <div v-if="!hasData && !loading" class="no-data">
      <i class="el-icon-warning"></i>
      <span>暂无数据</span>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'MonthlyTimeHeatmap',
  data() {
    return {
      chart: null,
      // 7×13矩阵数据：7个时间段（6个时间段+总和行） × 13个月（12个月+总和列）
      heatmapData: [
        // 时间段数据（7个时间段 × 13个月）
        ['早高峰(7-9)', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ['上午(10-12)', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ['午高峰(11-13)', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ['下午(14-17)', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ['晚高峰(17-19)', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ['夜间(20-6)', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ['总和', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ],
      peakTime: '',
      peakMonth: '',
      hasData: false,
      loading: true
    };
  },
  mounted() {
    this.loadData();
    window.addEventListener('resize', this.handleResize);
  },
  
  props: {
    selectedYear: {
      type: [String, Number],
      default: () => new Date().getFullYear()
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
      type: [String, Number],
      default: null
    },
    timePeriod: {
      type: [String, Number],
      default: null
    }
  },
  
  watch: {
    selectedYear: {
      handler() {
        this.loadData();
      },
      immediate: false
    },
    startDate: {
      handler() {
        this.loadData();
      },
      immediate: false
    },
    endDate: {
      handler() {
        this.loadData();
      },
      immediate: false
    },
    season: {
      handler() {
        this.loadData();
      },
      immediate: false
    },
    timePeriod: {
      handler() {
        this.loadData();
      },
      immediate: false
    }
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    async loadData() {
      try {
        this.loading = true;
        
        // 构建查询参数
        const params = {
          year: this.selectedYear
        };
        
        // 添加日期范围参数
        if (this.startDate) {
          params.startDate = this.startDate;
        }
        if (this.endDate) {
          params.endDate = this.endDate;
        }
        
        // 添加季节参数
        if (this.season && this.season !== 'all') {
          params.season = this.season;
        }
        
        // 添加时间段参数
        if (this.timePeriod && this.timePeriod !== 'all') {
          params.timePeriod = this.timePeriod;
        }
        
        console.log('月度热力图查询参数:', params);
        
        // 加载热力图数据
        const heatmapResponse = await this.$axios.get('/api/patient-statistics/monthly-heatmap', {
          params: params
        });
        
        // 更新热力图数据
        if (heatmapResponse.data.success) {
          this.processHeatmapData(heatmapResponse.data.data);
        }
        
        this.loading = false;
        
        // 初始化图表
        this.$nextTick(() => {
          this.initChart();
          this.calculateStats();
        });
        
      } catch (error) {
        console.error('加载热力图数据失败:', error);
        this.loading = false;
        this.hasData = false;
        this.$message.error('加载热力图数据失败: ' + error.message);
      }
    },
    
    processHeatmapData(apiData) {
      console.log('处理热力图数据:', apiData);
      
      // 时间段映射（后端返回英文，前端显示中文）
      const timePeriodMapping = {
        'night_0_7': '夜间(0-7)',
        'morning_rush_8_9': '早高峰(8-9)',
        'lunch_rush_10_11': '午高峰(10-11)',
        'afternoon_12_16': '下午(12-16)',
        'evening_rush_17_19': '晚高峰(17-19)',
        'night_20_23': '晚上(20-23)',
        'total': '总和'
      };
      
      // 初始化7x13数据矩阵（7个时间段 × 13个月）
      const timePeriods = ['夜间(0-7)', '早高峰(8-9)', '午高峰(10-11)', '下午(12-16)', '晚高峰(17-19)', '晚上(20-23)', '总和'];
      const heatmapData = timePeriods.map(period => [period, ...new Array(13).fill(0)]);
      
      // 处理API返回的数据
      if (apiData && Array.isArray(apiData)) {
        console.log('API数据是数组，长度:', apiData.length);
        
        // 处理新的数据格式（每个时间段包含data数组）
        apiData.forEach(item => {
          console.log('处理数据项:', item);
          const timePeriod = item.time_period;
          const data = item.data;
          
          // 使用映射找到对应的中文时间段名称
          const chineseTimePeriod = timePeriodMapping[timePeriod] || timePeriod;
          const periodIndex = timePeriods.indexOf(chineseTimePeriod);
          
          if (periodIndex !== -1 && Array.isArray(data)) {
            // 复制数据到对应行
            for (let i = 0; i < Math.min(data.length, 13); i++) {
              heatmapData[periodIndex][i + 1] = data[i];
            }
            console.log(`设置数据: ${chineseTimePeriod} = [${data.join(', ')}]`);
          } else {
            console.log(`跳过数据: ${timePeriod} -> ${chineseTimePeriod} (索引: ${periodIndex})`);
          }
        });
      } else {
        console.log('API数据不是数组或为空:', apiData);
      }
      
      console.log('最终热力图数据:', heatmapData);
      this.heatmapData = heatmapData;
    },
    
    initChart() {
      this.chart = echarts.init(this.$refs.heatmapChart);
      
      // 处理热力图数据格式
      const data = [];
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '总和'];
      const timePeriods = ['夜间(0-7)', '早高峰(8-9)', '午高峰(10-11)', '下午(12-16)', '晚高峰(17-19)', '晚上(20-23)', '总和'];
      
      for (let i = 0; i < this.heatmapData.length; i++) {
        for (let j = 1; j < this.heatmapData[i].length; j++) {
          data.push([j - 1, i, this.heatmapData[i][j]]);
        }
      }
      
      const option = {
        tooltip: {
          position: 'top',
          formatter: function (params) {
            const month = months[params.value[0]] || '未知月份';
            const timePeriod = timePeriods[params.value[1]] || '未知时间段';
            const count = params.value[2];
            return `${month} ${timePeriod}<br>患者数: ${count}`;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '总和'],
          splitArea: {
            show: true
          },
          axisLabel: {
            fontWeight: 'bold',
            fontSize: 12
          }
        },
        yAxis: {
          type: 'category',
          data: ['夜间(0-7)', '早高峰(8-9)', '午高峰(10-11)', '下午(12-16)', '晚高峰(17-19)', '晚上(20-23)', '总和'],
          splitArea: {
            show: true
          },
          axisLabel: {
            fontWeight: 'bold',
            fontSize: 12
          }
        },
        visualMap: {
          min: 0,
          max: 40,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '0%',
          inRange: {
            color: ['#f2f2f2', '#c6e48b', '#7bc96f', '#49af64', '#239a3b', '#196127']
          },
          textStyle: {
            color: '#333'
          }
        },
        series: [{
          name: '患者数量',
          type: 'heatmap',
          data: data,
          label: {
            show: true,
            formatter: function (params) {
              return params.value[2];
            },
            color: '#000',
            fontWeight: 'bold',
            fontSize: 11
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      };
      
      this.chart.setOption(option);
    },
    handleResize() {
      if (this.chart) {
        this.chart.resize();
      }
    },
    calculateStats() {
      // 检查是否有数据
      let hasAnyData = false;
      let maxValue = 0;
      let maxTimeIndex = 0;
      let maxMonthIndex = 0;
      
      // 计算最繁忙时段（排除总和行）
      const timePeriods = ['夜间(0-7)', '早高峰(8-9)', '午高峰(10-11)', '下午(12-16)', '晚高峰(17-19)', '晚上(20-23)'];
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
      
      // 只分析前6个时间段（排除总和行）
      for (let i = 0; i < 6; i++) {
        for (let j = 1; j < 13; j++) { // 只分析前12个月（排除总和列）
          const value = this.heatmapData[i][j];
          if (value > 0) {
            hasAnyData = true;
          }
          
          if (value > maxValue) {
            maxValue = value;
            maxTimeIndex = i;
            maxMonthIndex = j - 1;
          }
        }
      }
      
      this.hasData = hasAnyData;
      
      if (hasAnyData) {
        this.peakTime = timePeriods[maxTimeIndex];
        this.peakMonth = months[maxMonthIndex];
      }
    }
  }
};
</script>

<style scoped>
.monthly-heatmap-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chart-header {
  padding: 20px 20px 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.chart-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.chart-title i {
  margin-right: 10px;
  font-size: 20px;
}

.chart-subtitle {
  font-size: 14px;
  opacity: 0.8;
}

.chart-content {
  display: flex;
  flex-direction: column;
}

.chart-wrapper {
  width: 100%;
}

.chart {
  border-radius: 4px;
}


.info-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  justify-content: space-between;
}

.info-label {
  color: #666;
  margin-right: 8px;
  font-weight: 500;
}

.info-value {
  color: #409EFF;
  font-weight: bold;
  background-color: #ecf5ff;
  padding: 4px 8px;
  border-radius: 4px;
}

.legend {
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}


.legend-scale ul {
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  gap: 20px;
}

.legend-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.legend-labels li {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.legend-labels li span {
  display: block;
  height: 15px;
  width: 30px;
  margin-bottom: 5px;
  border-radius: 2px;
}


.loading-container {
  text-align: center;
  padding: 40px;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #909399;
  font-size: 16px;
}

.no-data i {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}
</style>
