<template>
  <div class="injury-analysis-container">
    <div class="header">
      <h2>创伤部位与伤因时间分布分析</h2>
      <div class="controls">
        <el-select v-model="selectedYear" placeholder="选择年份" style="width: 120px; margin-right: 15px;">
          <el-option label="2023" value="2023"></el-option>
          <el-option label="2022" value="2022"></el-option>
          <el-option label="2021" value="2021"></el-option>
        </el-select>
        
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
        
        <el-button type="primary" @click="refreshData">查询</el-button>
      </div>
    </div>
    
    <div class="charts-container">
      <!-- 左侧：创伤部位分布 -->
      <div class="chart-panel">
        <h3>创伤部位时间分布</h3>
        <div ref="bodyPartChart" class="chart" style="width: 100%; height: 500px;"></div>
      </div>
      
      <!-- 右侧：伤因分布 -->
      <div class="chart-panel">
        <h3>伤因时间分布</h3>
        <div ref="injuryCauseChart" class="chart" style="width: 100%; height: 500px;"></div>
      </div>
    </div>
    
    <div class="stats">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ totalInjuries }}</div>
            <div class="stat-label">总创伤数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ mostAffectedPart }}</div>
            <div class="stat-label">最常受伤部位</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ mostCommonCause }}</div>
            <div class="stat-label">最常见伤因</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ peakSeasonTime }}</div>
            <div class="stat-label">高发季节/时段</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'InjuryAnalysis',
  data() {
    return {
      selectedYear: '2023',
      selectedSeason: 'all',
      selectedTimePeriod: 'all',
      bodyPartChart: null,
      injuryCauseChart: null,
      // 身体部位数据
      bodyParts: [
        { key: 'head_neck', name: '头颈部', color: '#5470c6' },
        { key: 'face', name: '面部', color: '#91cc75' },
        { key: 'chest', name: '胸部', color: '#fac858' },
        { key: 'abdomen', name: '腹部', color: '#ee6666' },
        { key: 'extremities', name: '四肢', color: '#73c0de' },
        { key: 'external', name: '体表', color: '#9a60b4' }
      ],
      // 伤因数据
      injuryCauses: [
        { key: 'traffic', name: '交通伤', color: '#5470c6' },
        { key: 'fall', name: '高坠伤', color: '#91cc75' },
        { key: 'mechanical', name: '机械伤', color: '#fac858' },
        { key: 'tumble', name: '跌倒', color: '#ee6666' },
        { key: 'other', name: '其他', color: '#73c0de' }
      ],
      // 时间段数据
      timePeriods: [
        { key: 'morning_peak', name: '早高峰(7-9)' },
        { key: 'morning', name: '上午(10-12)' },
        { key: 'noon_peak', name: '午高峰(11-13)' },
        { key: 'afternoon', name: '下午(14-17)' },
        { key: 'evening_peak', name: '晚高峰(17-19)' },
        { key: 'night', name: '夜间(20-6)' }
      ],
      // 季节数据
      seasons: [
        { key: 'spring', name: '春季' },
        { key: 'summer', name: '夏季' },
        { key: 'autumn', name: '秋季' },
        { key: 'winter', name: '冬季' }
      ],
      // 模拟数据
      injuryData: {
        '2023': {
          // 创伤部位数据
          bodyParts: {
            spring: {
              morning_peak: { head_neck: 12, face: 8, chest: 10, abdomen: 6, extremities: 15, external: 20 },
              morning: { head_neck: 10, face: 6, chest: 8, abdomen: 5, extremities: 12, external: 16 },
              noon_peak: { head_neck: 15, face: 10, chest: 12, abdomen: 8, extremities: 18, external: 25 },
              afternoon: { head_neck: 11, face: 7, chest: 9, abdomen: 6, extremities: 14, external: 18 },
              evening_peak: { head_neck: 18, face: 12, chest: 15, abdomen: 10, extremities: 22, external: 30 },
              night: { head_neck: 8, face: 5, chest: 7, abdomen: 4, extremities: 10, external: 12 }
            },
            summer: {
              morning_peak: { head_neck: 15, face: 10, chest: 12, abdomen: 8, extremities: 20, external: 25 },
              morning: { head_neck: 12, face: 8, chest: 10, abdomen: 6, extremities: 16, external: 20 },
              noon_peak: { head_neck: 18, face: 12, chest: 15, abdomen: 10, extremities: 25, external: 30 },
              afternoon: { head_neck: 14, face: 9, chest: 11, abdomen: 7, extremities: 18, external: 22 },
              evening_peak: { head_neck: 22, face: 15, chest: 18, abdomen: 12, extremities: 28, external: 35 },
              night: { head_neck: 10, face: 6, chest: 8, abdomen: 5, extremities: 12, external: 15 }
            },
            autumn: {
              morning_peak: { head_neck: 10, face: 7, chest: 9, abdomen: 6, extremities: 14, external: 18 },
              morning: { head_neck: 8, face: 5, chest: 7, abdomen: 4, extremities: 11, external: 14 },
              noon_peak: { head_neck: 13, face: 9, chest: 11, abdomen: 7, extremities: 16, external: 22 },
              afternoon: { head_neck: 9, face: 6, chest: 8, abdomen: 5, extremities: 12, external: 16 },
              evening_peak: { head_neck: 16, face: 11, chest: 13, abdomen: 9, extremities: 20, external: 28 },
              night: { head_neck: 7, face: 4, chest: 6, abdomen: 3, extremities: 9, external: 11 }
            },
            winter: {
              morning_peak: { head_neck: 20, face: 13, chest: 17, abdomen: 12, extremities: 25, external: 35 },
              morning: { head_neck: 16, face: 11, chest: 14, abdomen: 9, extremities: 20, external: 28 },
              noon_peak: { head_neck: 25, face: 17, chest: 21, abdomen: 15, extremities: 30, external: 40 },
              afternoon: { head_neck: 18, face: 12, chest: 16, abdomen: 11, extremities: 22, external: 32 },
              evening_peak: { head_neck: 30, face: 20, chest: 25, abdomen: 18, extremities: 35, external: 45 },
              night: { head_neck: 12, face: 8, chest: 10, abdomen: 7, extremities: 15, external: 20 }
            }
          },
          // 伤因数据
          causes: {
            spring: {
              morning_peak: { traffic: 25, fall: 15, mechanical: 10, tumble: 20, other: 8 },
              morning: { traffic: 20, fall: 12, mechanical: 8, tumble: 16, other: 6 },
              noon_peak: { traffic: 30, fall: 18, mechanical: 12, tumble: 25, other: 10 },
              afternoon: { traffic: 22, fall: 14, mechanical: 9, tumble: 18, other: 7 },
              evening_peak: { traffic: 35, fall: 20, mechanical: 15, tumble: 30, other: 12 },
              night: { traffic: 15, fall: 8, mechanical: 6, tumble: 12, other: 5 }
            },
            summer: {
              morning_peak: { traffic: 30, fall: 18, mechanical: 12, tumble: 25, other: 10 },
              morning: { traffic: 25, fall: 15, mechanical: 10, tumble: 20, other: 8 },
              noon_peak: { traffic: 35, fall: 20, mechanical: 15, tumble: 30, other: 12 },
              afternoon: { traffic: 28, fall: 16, mechanical: 11, tumble: 22, other: 9 },
              evening_peak: { traffic: 40, fall: 25, mechanical: 18, tumble: 35, other: 15 },
              night: { traffic: 18, fall: 10, mechanical: 7, tumble: 15, other: 6 }
            },
            autumn: {
              morning_peak: { traffic: 20, fall: 12, mechanical: 8, tumble: 16, other: 6 },
              morning: { traffic: 16, fall: 10, mechanical: 6, tumble: 12, other: 5 },
              noon_peak: { traffic: 25, fall: 15, mechanical: 10, tumble: 20, other: 8 },
              afternoon: { traffic: 18, fall: 11, mechanical: 7, tumble: 14, other: 6 },
              evening_peak: { traffic: 30, fall: 18, mechanical: 12, tumble: 25, other: 10 },
              night: { traffic: 12, fall: 7, mechanical: 5, tumble: 10, other: 4 }
            },
            winter: {
              morning_peak: { traffic: 35, fall: 20, mechanical: 15, tumble: 30, other: 12 },
              morning: { traffic: 28, fall: 16, mechanical: 11, tumble: 22, other: 9 },
              noon_peak: { traffic: 40, fall: 25, mechanical: 18, tumble: 35, other: 15 },
              afternoon: { traffic: 32, fall: 19, mechanical: 13, tumble: 28, other: 11 },
              evening_peak: { traffic: 45, fall: 30, mechanical: 22, tumble: 40, other: 18 },
              night: { traffic: 20, fall: 12, mechanical: 8, tumble: 16, other: 7 }
            }
          }
        }
      },
      totalInjuries: 0,
      mostAffectedPart: '',
      mostCommonCause: '',
      peakSeasonTime: ''
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.initCharts();
      this.calculateStats();
    });
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    if (this.bodyPartChart) {
      this.bodyPartChart.dispose();
    }
    if (this.injuryCauseChart) {
      this.injuryCauseChart.dispose();
    }
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    initCharts() {
      // 确保DOM元素已经渲染
      if (this.$refs.bodyPartChart && this.$refs.injuryCauseChart) {
        this.bodyPartChart = echarts.init(this.$refs.bodyPartChart);
        this.injuryCauseChart = echarts.init(this.$refs.injuryCauseChart);
        
        this.updateCharts();
      } else {
        // 如果DOM元素未准备好，延迟初始化
        setTimeout(() => {
          this.initCharts();
        }, 100);
      }
    },
    updateCharts() {
      this.updateBodyPartChart();
      this.updateInjuryCauseChart();
    },
    updateBodyPartChart() {
      if (!this.bodyPartChart) return;
      
      // 准备数据
      const timePeriods = this.selectedTimePeriod === 'all' 
        ? this.timePeriods 
        : [this.timePeriods.find(p => p.key === this.selectedTimePeriod)];
      
      const seasons = this.selectedSeason === 'all'
        ? this.seasons
        : [this.seasons.find(s => s.key === this.selectedSeason)];
      
      // 准备系列数据
      const seriesData = this.bodyParts.map(part => {
        return {
          name: part.name,
          type: 'bar',
          stack: 'total',
          data: [],
          itemStyle: {
            color: part.color
          },
          emphasis: {
            focus: 'series'
          }
        };
      });
      
      // 准备X轴数据
      const xAxisData = [];
      
      // 填充数据
      timePeriods.forEach(period => {
        seasons.forEach(season => {
          xAxisData.push(`${period.name}-${season.name}`);
          
          const data = this.injuryData[this.selectedYear].bodyParts[season.key][period.key];
          
          this.bodyParts.forEach((part, index) => {
            seriesData[index].data.push(data[part.key]);
          });
        });
      });
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: this.bodyParts.map(part => part.name),
          top: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '60px',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: xAxisData
        },
        yAxis: {
          type: 'value',
          name: '创伤数量'
        },
        series: seriesData
      };
      
      this.bodyPartChart.setOption(option);
    },
    updateInjuryCauseChart() {
      if (!this.injuryCauseChart) return;
      
      // 准备数据
      const timePeriods = this.selectedTimePeriod === 'all' 
        ? this.timePeriods 
        : [this.timePeriods.find(p => p.key === this.selectedTimePeriod)];
      
      const seasons = this.selectedSeason === 'all'
        ? this.seasons
        : [this.seasons.find(s => s.key === this.selectedSeason)];
      
      // 准备系列数据
      const seriesData = this.injuryCauses.map(cause => {
        return {
          name: cause.name,
          type: 'bar',
          stack: 'total',
          data: [],
          itemStyle: {
            color: cause.color
          },
          emphasis: {
            focus: 'series'
          }
        };
      });
      
      // 准备X轴数据
      const xAxisData = [];
      
      // 填充数据
      timePeriods.forEach(period => {
        seasons.forEach(season => {
          xAxisData.push(`${period.name}-${season.name}`);
          
          const data = this.injuryData[this.selectedYear].causes[season.key][period.key];
          
          this.injuryCauses.forEach((cause, index) => {
            seriesData[index].data.push(data[cause.key]);
          });
        });
      });
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: this.injuryCauses.map(cause => cause.name),
          top: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '60px',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: xAxisData
        },
        yAxis: {
          type: 'value',
          name: '创伤数量'
        },
        series: seriesData
      };
      
      this.injuryCauseChart.setOption(option);
    },
    handleResize() {
      if (this.bodyPartChart) {
        this.bodyPartChart.resize();
      }
      if (this.injuryCauseChart) {
        this.injuryCauseChart.resize();
      }
    },
    refreshData() {
      this.updateCharts();
      this.calculateStats();
    },
    calculateStats() {
      // 计算统计数据
      let total = 0;
      const partTotals = {};
      const causeTotals = {};
      
      // 初始化
      this.bodyParts.forEach(part => {
        partTotals[part.key] = 0;
      });
      
      this.injuryCauses.forEach(cause => {
        causeTotals[cause.key] = 0;
      });
      
      // 确定筛选范围
      const timePeriods = this.selectedTimePeriod === 'all' 
        ? this.timePeriods 
        : [this.timePeriods.find(p => p.key === this.selectedTimePeriod)];
      
      const seasons = this.selectedSeason === 'all'
        ? this.seasons
        : [this.seasons.find(s => s.key === this.selectedSeason)];
      
      // 累加数据
      timePeriods.forEach(period => {
        seasons.forEach(season => {
          // 累加创伤部位数据
          const bodyData = this.injuryData[this.selectedYear].bodyParts[season.key][period.key];
          for (const part in bodyData) {
            total += bodyData[part];
            partTotals[part] += bodyData[part];
          }
          
          // 累加伤因数据
          const causeData = this.injuryData[this.selectedYear].causes[season.key][period.key];
          for (const cause in causeData) {
            total += causeData[cause];
            causeTotals[cause] += causeData[cause];
          }
        });
      });
      
      // 找出最常受伤的部位
      let maxPartCount = 0;
      let maxPart = '';
      for (const part in partTotals) {
        if (partTotals[part] > maxPartCount) {
          maxPartCount = partTotals[part];
          maxPart = part;
        }
      }
      
      // 找出最常见的伤因
      let maxCauseCount = 0;
      let maxCause = '';
      for (const cause in causeTotals) {
        if (causeTotals[cause] > maxCauseCount) {
          maxCauseCount = causeTotals[cause];
          maxCause = cause;
        }
      }
      
      this.totalInjuries = total;
      this.mostAffectedPart = this.bodyParts.find(p => p.key === maxPart)?.name || '';
      this.mostCommonCause = this.injuryCauses.find(c => c.key === maxCause)?.name || '';
      
      // 计算高发季节/时段
      if (seasons.length === 1 && timePeriods.length === 1) {
        this.peakSeasonTime = `${seasons[0].name} ${timePeriods[0].name}`;
      } else {
        this.peakSeasonTime = '多季节/时段';
      }
    }
  }
};
</script>

<style scoped>
.injury-analysis-container {
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

.charts-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-panel {
  flex: 1;
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  min-height: 550px;
}

.chart-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #303133;
  text-align: center;
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

@media (max-width: 1200px) {
  .charts-container {
    flex-direction: column;
  }
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