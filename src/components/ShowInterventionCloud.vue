<template>
  <div class="intervention-wordcloud-container">
    <div class="header">
      <h2>干预措施使用频率词云图</h2>
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
          <el-option label="早高峰(7-9)" value="morning_peak"></el-option>
          <el-option label="上午(10-12)" value="morning"></el-option>
          <el-option label="午高峰(11-13)" value="noon_peak"></el-option>
          <el-option label="下午(14-17)" value="afternoon"></el-option>
          <el-option label="晚高峰(17-19)" value="evening_peak"></el-option>
          <el-option label="夜间(20-6)" value="night"></el-option>
        </el-select>
        
        <el-button type="primary" @click="refreshData">查询</el-button>
      </div>
    </div>
    
    <div class="chart-wrapper">
      <div ref="wordcloudChart" class="chart" style="width: 100%; height: 600px;"></div>
    </div>
    
    <div class="stats">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ totalInterventions }}</div>
            <div class="stat-label">总干预次数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ mostFrequentIntervention }}</div>
            <div class="stat-label">最常用干预</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ averagePerPatient }}</div>
            <div class="stat-label">人均干预次数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ peakUsage }}</div>
            <div class="stat-label">高使用季节/时段</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import 'echarts-wordcloud';

export default {
  name: 'InterventionWordCloud',
  data() {
    return {
      selectedSeason: 'all',
      selectedTimePeriod: 'all',
      chart: null,
      // 模拟数据：季节 × 时间段 × 干预措施使用频率
      interventionData: {
        // 春季数据
        spring: {
          morning_peak: [
            { name: '气管插管', value: 85 },
            { name: '输血', value: 70 },
            { name: 'CT检查', value: 65 },
            { name: '深静脉置管', value: 60 },
            { name: '呼吸机', value: 55 },
            { name: 'B超', value: 50 },
            { name: '心肺复苏', value: 30 },
            { name: '除颤', value: 15 },
            { name: '导尿', value: 40 },
            { name: '胃管', value: 25 }
          ],
          morning: [
            { name: '气管插管', value: 70 },
            { name: '输血', value: 60 },
            { name: 'CT检查', value: 55 },
            { name: '深静脉置管', value: 50 },
            { name: '呼吸机', value: 45 },
            { name: 'B超', value: 40 },
            { name: '心肺复苏', value: 20 },
            { name: '除颤', value: 10 },
            { name: '导尿', value: 35 },
            { name: '胃管', value: 20 }
          ],
          noon_peak: [
            { name: '气管插管', value: 90 },
            { name: '输血', value: 75 },
            { name: 'CT检查', value: 70 },
            { name: '深静脉置管', value: 65 },
            { name: '呼吸机', value: 60 },
            { name: 'B超', value: 55 },
            { name: '心肺复苏', value: 35 },
            { name: '除颤', value: 20 },
            { name: '导尿', value: 45 },
            { name: '胃管', value: 30 }
          ],
          afternoon: [
            { name: '气管插管', value: 75 },
            { name: '输血', value: 65 },
            { name: 'CT检查', value: 60 },
            { name: '深静脉置管', value: 55 },
            { name: '呼吸机', value: 50 },
            { name: 'B超', value: 45 },
            { name: '心肺复苏', value: 25 },
            { name: '除颤', value: 12 },
            { name: '导尿', value: 38 },
            { name: '胃管', value: 22 }
          ],
          evening_peak: [
            { name: '气管插管', value: 95 },
            { name: '输血', value: 80 },
            { name: 'CT检查', value: 75 },
            { name: '深静脉置管', value: 70 },
            { name: '呼吸机', value: 65 },
            { name: 'B超', value: 60 },
            { name: '心肺复苏', value: 40 },
            { name: '除颤', value: 25 },
            { name: '导尿', value: 50 },
            { name: '胃管', value: 35 }
          ],
          night: [
            { name: '气管插管', value: 65 },
            { name: '输血', value: 55 },
            { name: 'CT检查', value: 50 },
            { name: '深静脉置管', value: 45 },
            { name: '呼吸机', value: 40 },
            { name: 'B超', value: 35 },
            { name: '心肺复苏', value: 15 },
            { name: '除颤', value: 8 },
            { name: '导尿', value: 30 },
            { name: '胃管', value: 18 }
          ]
        },
        // 夏季数据
        summer: {
          morning_peak: [
            { name: '气管插管', value: 80 },
            { name: '输血', value: 75 },
            { name: 'CT检查', value: 70 },
            { name: '深静脉置管', value: 65 },
            { name: '呼吸机', value: 60 },
            { name: 'B超', value: 55 },
            { name: '心肺复苏', value: 35 },
            { name: '除颤', value: 20 },
            { name: '导尿', value: 45 },
            { name: '胃管', value: 30 }
          ],
          // 其他时间段数据...
        },
        // 秋季数据
        autumn: {
          morning_peak: [
            { name: '气管插管', value: 75 },
            { name: '输血', value: 70 },
            { name: 'CT检查', value: 65 },
            { name: '深静脉置管', value: 60 },
            { name: '呼吸机', value: 55 },
            { name: 'B超', value: 50 },
            { name: '心肺复苏', value: 30 },
            { name: '除颤', value: 15 },
            { name: '导尿', value: 40 },
            { name: '胃管', value: 25 }
          ],
          // 其他时间段数据...
        },
        // 冬季数据
        winter: {
          morning_peak: [
            { name: '气管插管', value: 90 },
            { name: '输血', value: 85 },
            { name: 'CT检查', value: 80 },
            { name: '深静脉置管', value: 75 },
            { name: '呼吸机', value: 70 },
            { name: 'B超', value: 65 },
            { name: '心肺复苏', value: 45 },
            { name: '除颤', value: 30 },
            { name: '导尿', value: 55 },
            { name: '胃管', value: 40 }
          ],
          // 其他时间段数据...
        }
      },
      // 模拟患者数量数据
      patientCountData: {
        spring: {
          morning_peak: 120,
          morning: 100,
          noon_peak: 140,
          afternoon: 110,
          evening_peak: 160,
          night: 90
        },
        summer: {
          morning_peak: 130,
          morning: 110,
          noon_peak: 150,
          afternoon: 120,
          evening_peak: 170,
          night: 100
        },
        autumn: {
          morning_peak: 115,
          morning: 95,
          noon_peak: 135,
          afternoon: 105,
          evening_peak: 155,
          night: 85
        },
        winter: {
          morning_peak: 140,
          morning: 120,
          noon_peak: 160,
          afternoon: 130,
          evening_peak: 180,
          night: 110
        }
      },
      totalInterventions: 0,
      mostFrequentIntervention: '',
      averagePerPatient: 0,
      peakUsage: ''
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
      this.chart = echarts.init(this.$refs.wordcloudChart);
      
      // 根据筛选条件获取数据
      const wordcloudData = this.getWordcloudData();
      
      const option = {
        tooltip: {
          show: true,
          formatter: function (params) {
            return `${params.name}: ${params.value}次`;
          }
        },
        series: [{
          type: 'wordCloud',
          shape: 'circle',
          left: 'center',
          top: 'center',
          width: '90%',
          height: '90%',
          sizeRange: [12, 60],
          rotationRange: [-45, 45],
          rotationStep: 45,
          gridSize: 8,
          drawOutOfBound: false,
          textStyle: {
            normal: {
              fontFamily: 'sans-serif',
              fontWeight: 'bold',
              color: function () {
                return 'rgb(' + [
                  Math.round(Math.random() * 160 + 50),
                  Math.round(Math.random() * 160 + 50),
                  Math.round(Math.random() * 160 + 50)
                ].join(',') + ')';
              }
            },
            emphasis: {
              shadowBlur: 10,
              shadowColor: '#333'
            }
          },
          data: wordcloudData
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
      this.initChart();
      this.calculateStats();
    },
    getWordcloudData() {
      // 处理季节筛选
      const seasons = this.selectedSeason === 'all' 
        ? ['spring', 'summer', 'autumn', 'winter'] 
        : [this.selectedSeason];
      
      // 处理时间段筛选
      const timePeriods = this.selectedTimePeriod === 'all'
        ? ['morning_peak', 'morning', 'noon_peak', 'afternoon', 'evening_peak', 'night']
        : [this.selectedTimePeriod];
      
      // 创建干预措施频率映射
      const interventionMap = {};
      
      // 累加符合条件的数据
      for (const season of seasons) {
        for (const timePeriod of timePeriods) {
          const interventions = this.interventionData[season]?.[timePeriod] || [];
          
          for (const intervention of interventions) {
            if (!interventionMap[intervention.name]) {
              interventionMap[intervention.name] = 0;
            }
            interventionMap[intervention.name] += intervention.value;
          }
        }
      }
      
      // 转换为词云所需格式
      const result = [];
      for (const name in interventionMap) {
        result.push({
          name: name,
          value: interventionMap[name]
        });
      }
      
      return result;
    },
    calculateStats() {
      const wordcloudData = this.getWordcloudData();
      
      // 计算总干预次数
      this.totalInterventions = wordcloudData.reduce((sum, item) => sum + item.value, 0);
      
      // 找出最常用的干预措施
      let maxValue = 0;
      let maxIntervention = '';
      
      for (const item of wordcloudData) {
        if (item.value > maxValue) {
          maxValue = item.value;
          maxIntervention = item.name;
        }
      }
      
      this.mostFrequentIntervention = maxIntervention;
      
      // 计算患者总数
      let totalPatients = 0;
      
      // 处理季节筛选
      const seasons = this.selectedSeason === 'all' 
        ? ['spring', 'summer', 'autumn', 'winter'] 
        : [this.selectedSeason];
      
      // 处理时间段筛选
      const timePeriods = this.selectedTimePeriod === 'all'
        ? ['morning_peak', 'morning', 'noon_peak', 'afternoon', 'evening_peak', 'night']
        : [this.selectedTimePeriod];
      
      // 累加患者数量
      for (const season of seasons) {
        for (const timePeriod of timePeriods) {
          totalPatients += this.patientCountData[season]?.[timePeriod] || 0;
        }
      }
      
      // 计算人均干预次数
      this.averagePerPatient = totalPatients > 0 
        ? (this.totalInterventions / totalPatients).toFixed(2)
        : 0;
      
      // 计算高使用季节/时段
      this.peakUsage = `${this.getSeasonName(this.selectedSeason)}/${this.getTimePeriodName(this.selectedTimePeriod)}`;
    },
    getSeasonName(seasonKey) {
      const mapping = {
        'all': '全部季节',
        'spring': '春季',
        'summer': '夏季',
        'autumn': '秋季',
        'winter': '冬季'
      };
      return mapping[seasonKey] || '';
    },
    getTimePeriodName(timePeriodKey) {
      const mapping = {
        'all': '全部时段',
        'morning_peak': '早高峰',
        'morning': '上午',
        'noon_peak': '午高峰',
        'afternoon': '下午',
        'evening_peak': '晚高峰',
        'night': '夜间'
      };
      return mapping[timePeriodKey] || '';
    }
  }
};
</script>

<style scoped>
.intervention-wordcloud-container {
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