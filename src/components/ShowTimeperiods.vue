<template>
  <div class="heatmap-container">
    <div class="header">
      <h2>患者流量时间分布热力图</h2>
      <div class="controls">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          style="width: 300px; margin-right: 15px;"
          @change="refreshData"
        >
        </el-date-picker>
        <el-button type="primary" @click="refreshData">查询</el-button>
      </div>
    </div>
    
    <div class="chart-wrapper">
      <div ref="heatmapChart" class="chart" style="width: 100%; height: 500px;"></div>
    </div>
    
    <div class="legend">
      <div class="legend-title">患者数量</div>
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
            <div class="stat-value">{{ peakTime }}</div>
            <div class="stat-label">最繁忙时段</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ peakDay }}</div>
            <div class="stat-label">最繁忙日期</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ averagePerDay }}</div>
            <div class="stat-label">日均患者</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'HeatMap',
  data() {
    // 设置默认日期范围为最近30天
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    return {
      dateRange: [
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      ],
      chart: null,
      heatmapData: [
        // 周一至周日，六个时间段的数据（新规则）
        ['夜间(00:00-07:59)', 12, 15, 8, 10, 7, 9, 11],
        ['早高峰(08:00-09:59)', 9, 11, 7, 8, 6, 10, 12],
        ['午高峰(10:00-11:59)', 15, 18, 12, 14, 16, 20, 22],
        ['下午(12:00-16:59)', 10, 12, 9, 11, 8, 13, 10],
        ['晚高峰(17:00-19:59)', 18, 20, 15, 17, 19, 25, 23],
        ['晚上(20:00-23:59)', 8, 10, 6, 7, 9, 15, 14]
      ],
      totalPatients: 0,
      peakTime: '',
      peakDay: '',
      averagePerDay: 0
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
      this.chart = echarts.init(this.$refs.heatmapChart);
      
      // 处理热力图数据格式
      const data = [];
      for (let i = 0; i < this.heatmapData.length; i++) {
        for (let j = 1; j < this.heatmapData[i].length; j++) {
          data.push([j - 1, i, this.heatmapData[i][j]]);
        }
      }
      
      const option = {
        tooltip: {
          position: 'top',
          formatter: function (params) {
            const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
            const times = ['夜间(00:00-07:59)', '早高峰(08:00-09:59)', '午高峰(10:00-11:59)', '下午(12:00-16:59)', '晚高峰(17:00-19:59)', '晚上(20:00-23:59)'];
            return `${days[params.value[0]]} ${times[params.value[1]]}<br>患者数: ${params.value[2]}`;
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
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          splitArea: {
            show: true
          },
          axisLabel: {
            fontWeight: 'bold'
          }
        },
        yAxis: {
          type: 'category',
          data: ['夜间(00:00-07:59)', '早高峰(08:00-09:59)', '午高峰(10:00-11:59)', '下午(12:00-16:59)', '晚高峰(17:00-19:59)', '晚上(20:00-23:59)'],
          splitArea: {
            show: true
          },
          axisLabel: {
            fontWeight: 'bold'
          }
        },
        visualMap: {
          min: 0,
          max: 25,
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
            fontWeight: 'bold'
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
    refreshData() {
      // 模拟根据日期范围筛选数据
      // 实际项目中这里应该是API调用
      const startDate = new Date(this.dateRange[0]);
      const endDate = new Date(this.dateRange[1]);
      
      // 计算日期范围的天数
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      
      // 根据日期范围长度调整数据（示例逻辑）
      const factor = daysDiff / 30; // 以30天为基准
      
      // 更新数据
      for (let i = 0; i < this.heatmapData.length; i++) {
        for (let j = 1; j < this.heatmapData[i].length; j++) {
          // 随机波动模拟不同时间段的数据变化
          const randomFactor = 0.8 + Math.random() * 0.4;
          this.heatmapData[i][j] = Math.round(this.heatmapData[i][j] * factor * randomFactor);
        }
      }
      
      // 重新渲染图表
      this.initChart();
      this.calculateStats();
    },
    calculateStats() {
      // 计算统计数据
      let total = 0;
      let maxValue = 0;
      let maxTimeIndex = 0;
      let maxDayIndex = 0;
      
      for (let i = 0; i < this.heatmapData.length; i++) {
        for (let j = 1; j < this.heatmapData[i].length; j++) {
          total += this.heatmapData[i][j];
          
          if (this.heatmapData[i][j] > maxValue) {
            maxValue = this.heatmapData[i][j];
            maxTimeIndex = i;
            maxDayIndex = j - 1;
          }
        }
      }
      
      this.totalPatients = total;
      this.peakTime = this.heatmapData[maxTimeIndex][0];
      this.peakDay = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][maxDayIndex];
      
      // 计算日期范围的天数
      const startDate = new Date(this.dateRange[0]);
      const endDate = new Date(this.dateRange[1]);
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      this.averagePerDay = Math.round(total / daysDiff);
    }
  }
};
</script>

<style scoped>
.heatmap-container {
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

.legend {
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.legend-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
}

.legend-scale ul {
  padding: 0;
  margin: 0;
  list-style: none;
}

.legend-labels li {
  display: inline-block;
  width: 80px;
  text-align: center;
  font-size: 12px;
  color: #606266;
}

.legend-labels li span {
  display: block;
  height: 15px;
  width: 80px;
  margin-bottom: 5px;
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