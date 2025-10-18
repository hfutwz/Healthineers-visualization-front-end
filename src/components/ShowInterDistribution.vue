<template>
  <div class="injury-distribution-container">
    <div class="header">
      <h2>创伤时间分布分析</h2>
      <div class="controls">
        <el-select v-model="selectedYear" placeholder选择年份 style="width: 120px; margin-right: 15px;">
          <el-option label="2023" value="2023"></el-option>
          <el-option label="2022" value="2022"></el-option>
          <el-option label="2021" value="2021"></el-option>
        </el-select>
        
        <el-select v-model="selectedInjuryType" placeholder="选择创伤类型" style="width: 150px; margin-right: 15px;">
          <el-option label="全部类型" value="all"></el-option>
          <el-option label="交通伤" value="traffic"></el-option>
          <el-option label="高坠伤" value="fall"></el-option>
          <el-option label="机械伤" value="mechanical"></el-option>
          <el-option label="跌倒" value="tumble"></el-option>
          <el-option label="其他" value="other"></el-option>
        </el-select>
        
        <el-button type="primary" @click="refreshData">查询</el-button>
      </div>
    </div>
    
    <div class="matrix-container">
      <div class="matrix-header">
        <div class="time-periods-header">
          <div class="empty-cell"></div>
          <div v-for="period in timePeriods" :key="period.key" class="time-period-header">
            {{ period.name }}
          </div>
        </div>
      </div>
      
      <div class="matrix-body">
        <div v-for="season in seasons" :key="season.key" class="matrix-row">
          <div class="season-header">
            {{ season.name }}
          </div>
          
          <div v-for="period in timePeriods" :key="period.key" class="matrix-cell">
            <div 
              ref="chart"
              class="mini-chart"
              :data-season="season.key"
              :data-period="period.key"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="legend">
      <div class="legend-title">身体部位</div>
      <div class="legend-items">
        <div v-for="(bodyPart, index) in bodyParts" :key="bodyPart.key" class="legend-item">
          <span class="legend-color" :style="{ backgroundColor: bodyPartColors[index] }"></span>
          <span class="legend-label">{{ bodyPart.name }}</span>
        </div>
      </div>
    </div>
    
    <div class="stats-panel">
      <h3>统计摘要</h3>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-value">{{ totalInjuries }}</div>
            <div class="stat-label">总创伤数</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-value">{{ mostAffectedPart }}</div>
            <div class="stat-label">最常受伤部位</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item">
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
  name: 'InjuryDistributionMatrix',
  data() {
    return {
      selectedYear: '2023',
      selectedInjuryType: 'all',
      charts: {}, // 存储所有图表实例
      // 季节数据
      seasons: [
        { key: 'spring', name: '春季' },
        { key: 'summer', name: '夏季' },
        { key: 'autumn', name: '秋季' },
        { key: 'winter', name: '冬季' }
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
      // 身体部位数据
      bodyParts: [
        { key: 'head_neck', name: '头颈部' },
        { key: 'face', name: '面部' },
        { key: 'chest', name: '胸部' },
        { key: 'abdomen', name: '腹部' },
        { key: 'extremities', name: '四肢' },
        { key: 'external', name: '体表' }
      ],
      // 颜色方案
      bodyPartColors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#9a60b4'],
      // 模拟数据
      injuryData: {
        // 2023年数据
        '2023': {
          // 春季数据
          spring: {
            morning_peak: { head_neck: 12, face: 8, chest: 10, abdomen: 6, extremities: 15, external: 20 },
            morning: { head_neck: 10, face: 6, chest: 8, abdomen: 5, extremities: 12, external: 16 },
            noon_peak: { head_neck: 15, face: 10, chest: 12, abdomen: 8, extremities: 18, external: 25 },
            afternoon: { head_neck: 11, face: 7, chest: 9, abdomen: 6, extremities: 14, external: 18 },
            evening_peak: { head_neck: 18, face: 12, chest: 15, abdomen: 10, extremities: 22, external: 30 },
            night: { head_neck: 8, face: 5, chest: 7, abdomen: 4, extremities: 10, external: 12 }
          },
          // 其他季节数据...
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
        }
        // 其他年份数据...
      },
      totalInjuries: 0,
      mostAffectedPart: '',
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
    // 销毁所有图表实例
    Object.values(this.charts).forEach(chart => {
      chart.dispose();
    });
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    initCharts() {
      // 初始化所有小图表
      this.seasons.forEach(season => {
        this.timePeriods.forEach(period => {
          const chartId = `${season.key}_${period.key}`;
          const chartElement = this.$refs.chart.find(el => 
            el.getAttribute('data-season') === season.key && 
            el.getAttribute('data-period') === period.key
          );
          
          if (chartElement) {
            const chart = echarts.init(chartElement);
            this.charts[chartId] = chart;
            
            this.updateChart(season.key, period.key);
          }
        });
      });
    },
    updateChart(season, period) {
      const chartId = `${season}_${period}`;
      const chart = this.charts[chartId];
      
      if (!chart) return;
      
      // 获取数据
      const data = this.injuryData[this.selectedYear][season][period];
      const values = this.bodyParts.map(part => data[part.key]);
      const total = values.reduce((sum, value) => sum + value, 0);
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '50%'],
            data: this.bodyParts.map((part, index) => ({
              value: data[part.key],
              name: part.name,
              itemStyle: {
                color: this.bodyPartColors[index]
              }
            })),
            label: {
              show: total > 0,
              formatter: '{c}',
              fontSize: 10
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
      
      chart.setOption(option);
    },
    handleResize() {
      // 调整所有图表大小
      Object.values(this.charts).forEach(chart => {
        chart.resize();
      });
    },
    refreshData() {
      // 更新所有图表
      this.seasons.forEach(season => {
        this.timePeriods.forEach(period => {
          this.updateChart(season.key, period.key);
        });
      });
      
      this.calculateStats();
    },
    calculateStats() {
      // 计算统计数据
      let total = 0;
      const partTotals = {
        head_neck: 0,
        face: 0,
        chest: 0,
        abdomen: 0,
        extremities: 0,
        external: 0
      };
      
      let maxCount = 0;
      let maxPart = '';
      let maxSeasonTime = { count: 0, season: '', period: '' };
      
      // 累加数据
      this.seasons.forEach(season => {
        this.timePeriods.forEach(period => {
          const data = this.injuryData[this.selectedYear][season.key][period.key];
          let seasonTimeTotal = 0;
          
          for (const part in data) {
            total += data[part];
            partTotals[part] += data[part];
            seasonTimeTotal += data[part];
          }
          
          // 检查是否为最高发的季节+时间段组合
          if (seasonTimeTotal > maxSeasonTime.count) {
            maxSeasonTime = {
              count: seasonTimeTotal,
              season: season.name,
              period: period.name
            };
          }
        });
      });
      
      // 找出最常受伤的部位
      for (const part in partTotals) {
        if (partTotals[part] > maxCount) {
          maxCount = partTotals[part];
          maxPart = part;
        }
      }
      
      this.totalInjuries = total;
      this.mostAffectedPart = this.bodyParts.find(p => p.key === maxPart).name;
      this.peakSeasonTime = `${maxSeasonTime.season} ${maxSeasonTime.period}`;
    }
  }
};
</script>

<style scoped>
.injury-distribution-container {
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

.matrix-container {
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow-x: auto;
}

.matrix-header {
  margin-bottom: 10px;
}

.time-periods-header {
  display: flex;
  margin-left: 100px; /* 与季节标题宽度匹配 */
}

.time-period-header {
  flex: 1;
  text-align: center;
  font-weight: bold;
  padding: 5px;
  min-width: 120px;
}

.empty-cell {
  width: 100px; /* 与季节标题宽度匹配 */
}

.matrix-body {
  display: flex;
  flex-direction: column;
}

.matrix-row {
  display: flex;
  margin-bottom: 10px;
}

.season-header {
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-right: 10px;
}

.matrix-cell {
  flex: 1;
  min-width: 120px;
  height: 120px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-right: 10px;
  position: relative;
}

.mini-chart {
  width: 100%;
  height: 100%;
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
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
}

.legend-color {
  display: inline-block;
  width: 15px;
  height: 15px;
  border-radius: 3px;
  margin-right: 5px;
}

.legend-label {
  font-size: 14px;
}

.stats-panel {
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stats-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #303133;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
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
  .matrix-container {
    overflow-x: auto;
  }
  
  .time-periods-header {
    min-width: 800px;
  }
  
  .matrix-row {
    min-width: 800px;
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
  
  .legend-items {
    flex-direction: column;
    gap: 8px;
  }
}
</style>