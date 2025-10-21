<template>
  <div class="intervention-boxplot-container">
    <div class="header">
      <h2>干预措施时间效率分析</h2>
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
        
        <el-select v-model="selectedInjuryType" placeholder="选择创伤类型" style="width: 150px; margin-right: 15px;">
          <el-option label="全部类型" value="all"></el-option>
          <el-option label="交通伤" value="traffic"></el-option>
          <el-option label="高坠伤" value="fall"></el-option>
          <el-option label="机械伤" value="mechanical"></el-option>
          <el-option label="跌倒" value="tumble"></el-option>
          <el-option label="其他" value="other"></el-option>
        </el-select>
        
        <el-select v-model="selectedISSLevel" placeholder="选择ISS等级" style="width: 150px; margin-right: 15px;">
          <el-option label="全部等级" value="all"></el-option>
          <el-option label="轻伤(ISS≤16)" value="mild"></el-option>
          <el-option label="重伤(16<ISS≤25)" value="severe"></el-option>
          <el-option label="严重伤(ISS>25)" value="critical"></el-option>
        </el-select>
        
        <el-button type="primary" @click="refreshData">查询</el-button>
      </div>
    </div>
    
    <div class="chart-wrapper">
      <div ref="boxplotChart" class="chart" style="width: 100%; height: 500px;"></div>
    </div>
    
    <div class="stats">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ fastestIntervention }}</div>
            <div class="stat-label">最快响应措施</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ slowestIntervention }}</div>
            <div class="stat-label">最慢响应措施</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ medianTime }}分钟</div>
            <div class="stat-label">中位响应时间</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ improvementRate }}%</div>
            <div class="stat-label">较上月效率提升</div>
          </div>
        </el-col>
      </el-row>
    </div>
    
    <div class="data-table">
      <h3>详细时间统计数据（分钟）</h3>
      <el-table :data="timeStats" stripe style="width: 100%">
        <el-table-column prop="intervention" label="干预措施" width="150"></el-table-column>
        <el-table-column prop="min" label="最小值" width="100"></el-table-column>
        <el-table-column prop="q1" label="Q1" width="100"></el-table-column>
        <el-table-column prop="median" label="中位数" width="100"></el-table-column>
        <el-table-column prop="q3" label="Q3" width="100"></el-table-column>
        <el-table-column prop="max" label="最大值" width="100"></el-table-column>
        <el-table-column prop="avg" label="平均值" width="100"></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'InterventionBoxplot',
  data() {
    return {
      selectedSeason: 'all',
      selectedTimePeriod: 'all',
      selectedInjuryType: 'all',
      selectedISSLevel: 'all',
      chart: null,
      // 模拟数据：干预措施时间分布（分钟）
      interventionTimeData: {
        // 春季数据
        spring: {
          morning_peak: {
            traffic: {
              mild: [[5, 8, 12, 15, 25], [10, 15, 20, 30, 45], [15, 20, 30, 45, 60], [20, 30, 45, 60, 90], [45, 60, 90, 120, 180]],
              severe: [[3, 6, 10, 13, 20], [8, 12, 18, 25, 40], [12, 18, 25, 35, 50], [15, 25, 35, 50, 70], [30, 45, 70, 100, 150]],
              critical: [[2, 4, 8, 10, 15], [5, 8, 12, 18, 30], [8, 12, 20, 30, 40], [10, 15, 25, 40, 60], [20, 30, 50, 80, 120]]
            },
            fall: {
              mild: [[6, 9, 13, 16, 26], [11, 16, 21, 31, 46], [16, 21, 31, 46, 61], [21, 31, 46, 61, 91], [46, 61, 91, 121, 181]],
              severe: [[4, 7, 11, 14, 21], [9, 13, 19, 26, 41], [13, 19, 26, 36, 51], [16, 26, 36, 51, 71], [31, 46, 71, 101, 151]],
              critical: [[3, 5, 9, 11, 16], [6, 9, 13, 19, 31], [9, 13, 21, 31, 41], [11, 16, 26, 41, 61], [21, 31, 51, 81, 121]]
            },
            // 其他创伤类型数据...
          },
          // 其他时间段数据...
        },
        // 其他季节数据...
      },
      fastestIntervention: '气管插管',
      slowestIntervention: '手术室',
      medianTime: 45,
      improvementRate: 5.2,
      timeStats: [
        { intervention: '气管插管', min: 5, q1: 8, median: 12, q3: 15, max: 25, avg: 13.2 },
        { intervention: '深静脉置管', min: 10, q1: 15, median: 20, q3: 30, max: 45, avg: 23.5 },
        { intervention: '首次CT', min: 15, q1: 20, median: 30, q3: 45, max: 60, avg: 32.8 },
        { intervention: '开始输血', min: 20, q1: 30, median: 45, q3: 60, max: 90, avg: 47.3 },
        { intervention: '手术室', min: 45, q1: 60, median: 90, q3: 120, max: 180, avg: 95.6 }
      ]
    };
  },
  mounted() {
    this.initChart();
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
      this.chart = echarts.init(this.$refs.boxplotChart);
      
      // 准备图表数据
      const interventions = ['气管插管', '深静脉置管', '首次CT', '开始输血', '手术室'];
      
      // 模拟数据 - 实际应用中应从后端获取
      const data = [
        [5, 8, 12, 15, 25],  // 气管插管
        [10, 15, 20, 30, 45], // 深静脉置管
        [15, 20, 30, 45, 60], // 首次CT
        [20, 30, 45, 60, 90], // 开始输血
        [45, 60, 90, 120, 180] // 手术室
      ];
      
      const option = {
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function (params) {
            const data = params.data;
            return `
              ${params.name}<br/>
              最小值: ${data[0]}分钟<br/>
              下四分位数: ${data[1]}分钟<br/>
              中位数: ${data[2]}分钟<br/>
              上四分位数: ${data[3]}分钟<br/>
              最大值: ${data[4]}分钟
            `;
          }
        },
        grid: {
          left: '10%',
          right: '10%',
          bottom: '15%',
          top: '10%'
        },
        xAxis: {
          type: 'category',
          data: interventions,
          boundaryGap: true,
          nameGap: 30,
          splitArea: {
            show: false
          },
          axisLabel: {
            formatter: '{value}',
            fontSize: 10
          }
        },
        yAxis: {
          type: 'value',
          name: '时间（分钟）',
          splitArea: {
            show: true
          },
          min: 0,
          max: 200
        },
        series: [
          {
            name: '干预时间',
            type: 'boxplot',
            data: data.map((item, index) => {
              return {
                value: item,
                itemStyle: {
                  color: this.getInterventionColor(interventions[index])
                }
              };
            }),
            tooltip: {
              formatter: function (param) {
                return [
                  '干预: ' + param.name + '<hr size=1 style="margin: 3px 0">',
                  '最小值: ' + param.data[0] + '分钟',
                  '下四分位数: ' + param.data[1] + '分钟',
                  '中位数: ' + param.data[2] + '分钟',
                  '上四分位数: ' + param.data[3] + '分钟',
                  '最大值: ' + param.data[4] + '分钟'
                ].join('<br/>');
              }
            }
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
      // 模拟根据筛选条件更新数据
      // 实际项目中这里应该是API调用
      console.log('刷新数据:', {
        season: this.selectedSeason,
        timePeriod: this.selectedTimePeriod,
        injuryType: this.selectedInjuryType,
        ISSLevel: this.selectedISSLevel
      });
      
      // 重新渲染图表
      this.initChart();
    },
    getInterventionColor(intervention) {
      const colors = {
        '气管插管': '#5470c6',
        '深静脉置管': '#91cc75',
        '首次CT': '#fac858',
        '开始输血': '#ee6666',
        '手术室': '#73c0de'
      };
      return colors[intervention] || '#5470c6';
    }
  }
};
</script>

<style scoped>
.intervention-boxplot-container {
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
  flex-wrap: wrap;
  gap: 10px;
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

.data-table {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.data-table h3 {
  margin-top: 0;
  color: #303133;
  margin-bottom: 15px;
}

@media (max-width: 1200px) {
  .controls {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}
</style>