<template>
  <div class="body-region-sunburst-container">
    <div class="header">
      <h2>身体区域损伤分布旭日图</h2>
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
      <div ref="sunburstChart" class="chart" style="width: 100%; height: 600px;"></div>
    </div>
    
    <div class="stats">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ totalInjuries }}</div>
            <div class="stat-label">总损伤数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ mostAffectedRegion }}</div>
            <div class="stat-label">最常受损区域</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ mostCommonSeverity }}</div>
            <div class="stat-label">最常见严重度</div>
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
  name: 'BodyRegionSunburst',
  data() {
    return {
      selectedSeason: 'all',
      selectedTimePeriod: 'all',
      chart: null,
      // 模拟数据：季节 × 时间段 × 身体区域 × 损伤严重度
      injuryData: {
        // 春季数据
        spring: {
          morning_peak: {
            head_neck: { mild: 12, moderate: 8, severe: 4, critical: 1 },
            face: { mild: 8, moderate: 5, severe: 2, critical: 0 },
            chest: { mild: 10, moderate: 7, severe: 3, critical: 1 },
            abdomen: { mild: 6, moderate: 4, severe: 2, critical: 1 },
            extremities: { mild: 15, moderate: 10, severe: 5, critical: 2 },
            external: { mild: 20, moderate: 12, severe: 6, critical: 1 }
          },
          morning: {
            head_neck: { mild: 10, moderate: 6, severe: 3, critical: 1 },
            face: { mild: 6, moderate: 4, severe: 1, critical: 0 },
            chest: { mild: 8, moderate: 5, severe: 2, critical: 1 },
            abdomen: { mild: 5, moderate: 3, severe: 1, critical: 0 },
            extremities: { mild: 12, moderate: 8, severe: 4, critical: 1 },
            external: { mild: 16, moderate: 10, severe: 5, critical: 1 }
          },
          // 其他时间段数据...
          noon_peak: {
            head_neck: { mild: 15, moderate: 10, severe: 5, critical: 2 },
            face: { mild: 10, moderate: 7, severe: 3, critical: 1 },
            chest: { mild: 12, moderate: 8, severe: 4, critical: 2 },
            abdomen: { mild: 8, moderate: 5, severe: 3, critical: 1 },
            extremities: { mild: 18, moderate: 12, severe: 6, critical: 3 },
            external: { mild: 25, moderate: 15, severe: 8, critical: 2 }
          },
          afternoon: {
            head_neck: { mild: 11, moderate: 7, severe: 3, critical: 1 },
            face: { mild: 7, moderate: 5, severe: 2, critical: 0 },
            chest: { mild: 9, moderate: 6, severe: 3, critical: 1 },
            abdomen: { mild: 6, moderate: 4, severe: 2, critical: 1 },
            extremities: { mild: 14, moderate: 9, severe: 5, critical: 2 },
            external: { mild: 18, moderate: 11, severe: 6, critical: 1 }
          },
          evening_peak: {
            head_neck: { mild: 18, moderate: 12, severe: 6, critical: 3 },
            face: { mild: 12, moderate: 8, severe: 4, critical: 1 },
            chest: { mild: 15, moderate: 10, severe: 5, critical: 2 },
            abdomen: { mild: 10, moderate: 7, severe: 4, critical: 2 },
            extremities: { mild: 22, moderate: 15, severe: 8, critical: 4 },
            external: { mild: 30, moderate: 18, severe: 10, critical: 3 }
          },
          night: {
            head_neck: { mild: 8, moderate: 5, severe: 2, critical: 1 },
            face: { mild: 5, moderate: 3, severe: 1, critical: 0 },
            chest: { mild: 7, moderate: 4, severe: 2, critical: 1 },
            abdomen: { mild: 4, moderate: 3, severe: 1, critical: 0 },
            extremities: { mild: 10, moderate: 7, severe: 3, critical: 1 },
            external: { mild: 12, moderate: 8, severe: 4, critical: 1 }
          }
        },
        // 夏季数据
        summer: {
          morning_peak: {
            head_neck: { mild: 15, moderate: 10, severe: 5, critical: 2 },
            face: { mild: 10, moderate: 7, severe: 3, critical: 1 },
            chest: { mild: 12, moderate: 8, severe: 4, critical: 2 },
            abdomen: { mild: 8, moderate: 5, severe: 3, critical: 1 },
            extremities: { mild: 20, moderate: 13, severe: 7, critical: 3 },
            external: { mild: 25, moderate: 15, severe: 8, critical: 2 }
          },
          // 其他时间段数据...
        },
        // 秋季数据
        autumn: {
          morning_peak: {
            head_neck: { mild: 10, moderate: 7, severe: 3, critical: 1 },
            face: { mild: 7, moderate: 5, severe: 2, critical: 0 },
            chest: { mild: 8, moderate: 6, severe: 3, critical: 1 },
            abdomen: { mild: 6, moderate: 4, severe: 2, critical: 1 },
            extremities: { mild: 14, moderate: 9, severe: 5, critical: 2 },
            external: { mild: 18, moderate: 11, severe: 6, critical: 1 }
          },
          // 其他时间段数据...
        },
        // 冬季数据
        winter: {
          morning_peak: {
            head_neck: { mild: 20, moderate: 13, severe: 7, critical: 3 },
            face: { mild: 13, moderate: 9, severe: 5, critical: 2 },
            chest: { mild: 17, moderate: 11, severe: 6, critical: 3 },
            abdomen: { mild: 12, moderate: 8, severe: 4, critical: 2 },
            extremities: { mild: 25, moderate: 17, severe: 9, critical: 4 },
            external: { mild: 35, moderate: 20, severe: 12, critical: 4 }
          },
          // 其他时间段数据...
        }
      },
      totalInjuries: 0,
      mostAffectedRegion: '',
      mostCommonSeverity: '',
      peakSeasonTime: ''
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
      this.chart = echarts.init(this.$refs.sunburstChart);
      
      // 根据筛选条件获取数据
      const sunburstData = this.getSunburstData();
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            return `${params.name}<br/>数量: ${params.value}`;
          }
        },
        series: {
          type: 'sunburst',
          data: sunburstData,
          radius: ['15%', '90%'],
          label: {
            rotate: 'radial'
          },
          levels: [
            {},
            {
              r0: '15%',
              r: '35%',
              itemStyle: {
                borderWidth: 2
              },
              label: {
                rotate: 'tangential',
                fontSize: 14
              }
            },
            {
              r0: '35%',
              r: '70%',
              label: {
                align: 'right'
              }
            },
            {
              r0: '70%',
              r: '90%',
              label: {
                position: 'outside',
                padding: 3,
                silent: false
              },
              itemStyle: {
                borderWidth: 1
              }
            }
          ]
        }
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
    getSunburstData() {
      // 处理季节筛选
      const seasons = this.selectedSeason === 'all' 
        ? ['spring', 'summer', 'autumn', 'winter'] 
        : [this.selectedSeason];
      
      // 处理时间段筛选
      const timePeriods = this.selectedTimePeriod === 'all'
        ? ['morning_peak', 'morning', 'noon_peak', 'afternoon', 'evening_peak', 'night']
        : [this.selectedTimePeriod];
      
      // 累加符合条件的数据
      const regionData = {
        head_neck: { mild: 0, moderate: 0, severe: 0, critical: 0 },
        face: { mild: 0, moderate: 0, severe: 0, critical: 0 },
        chest: { mild: 0, moderate: 0, severe: 0, critical: 0 },
        abdomen: { mild: 0, moderate: 0, severe: 0, critical: 0 },
        extremities: { mild: 0, moderate: 0, severe: 0, critical: 0 },
        external: { mild: 0, moderate: 0, severe: 0, critical: 0 }
      };
      
      for (const season of seasons) {
        for (const timePeriod of timePeriods) {
          const timeData = this.injuryData[season]?.[timePeriod] || {};
          
          for (const region in timeData) {
            for (const severity in timeData[region]) {
              regionData[region][severity] += timeData[region][severity];
            }
          }
        }
      }
      
      // 转换为旭日图所需格式
      return [
        {
          name: '全部损伤',
          children: [
            {
              name: '头颈部',
              value: this.sumSeverities(regionData.head_neck),
              children: [
                { name: '轻度', value: regionData.head_neck.mild, itemStyle: { color: '#c6e48b' } },
                { name: '中度', value: regionData.head_neck.moderate, itemStyle: { color: '#7bc96f' } },
                { name: '重度', value: regionData.head_neck.severe, itemStyle: { color: '#49af64' } },
                { name: '危重', value: regionData.head_neck.critical, itemStyle: { color: '#239a3b' } }
              ]
            },
            {
              name: '面部',
              value: this.sumSeverities(regionData.face),
              children: [
                { name: '轻度', value: regionData.face.mild, itemStyle: { color: '#c6e48b' } },
                { name: '中度', value: regionData.face.moderate, itemStyle: { color: '#7bc96f' } },
                { name: '重度', value: regionData.face.severe, itemStyle: { color: '#49af64' } },
                { name: '危重', value: regionData.face.critical, itemStyle: { color: '#239a3b' } }
              ]
            },
            {
              name: '胸部',
              value: this.sumSeverities(regionData.chest),
              children: [
                { name: '轻度', value: regionData.chest.mild, itemStyle: { color: '#c6e48b' } },
                { name: '中度', value: regionData.chest.moderate, itemStyle: { color: '#7bc96f' } },
                { name: '重度', value: regionData.chest.severe, itemStyle: { color: '#49af64' } },
                { name: '危重', value: regionData.chest.critical, itemStyle: { color: '#239a3b' } }
              ]
            },
            {
              name: '腹部',
              value: this.sumSeverities(regionData.abdomen),
              children: [
                { name: '轻度', value: regionData.abdomen.mild, itemStyle: { color: '#c6e48b' } },
                { name: '中度', value: regionData.abdomen.moderate, itemStyle: { color: '#7bc96f' } },
                { name: '重度', value: regionData.abdomen.severe, itemStyle: { color: '#49af64' } },
                { name: '危重', value: regionData.abdomen.critical, itemStyle: { color: '#239a3b' } }
              ]
            },
            {
              name: '四肢',
              value: this.sumSeverities(regionData.extremities),
              children: [
                { name: '轻度', value: regionData.extremities.mild, itemStyle: { color: '#c6e48b' } },
                { name: '中度', value: regionData.extremities.moderate, itemStyle: { color: '#7bc96f' } },
                { name: '重度', value: regionData.extremities.severe, itemStyle: { color: '#49af64' } },
                { name: '危重', value: regionData.extremities.critical, itemStyle: { color: '#239a3b' } }
              ]
            },
            {
              name: '体表',
              value: this.sumSeverities(regionData.external),
              children: [
                { name: '轻度', value: regionData.external.mild, itemStyle: { color: '#c6e48b' } },
                { name: '中度', value: regionData.external.moderate, itemStyle: { color: '#7bc96f' } },
                { name: '重度', value: regionData.external.severe, itemStyle: { color: '#49af64' } },
                { name: '危重', value: regionData.external.critical, itemStyle: { color: '#239a3b' } }
              ]
            }
          ]
        }
      ];
    },
    sumSeverities(severityData) {
      return severityData.mild + severityData.moderate + severityData.severe + severityData.critical;
    },
    calculateStats() {
      const sunburstData = this.getSunburstData();
      const allData = sunburstData[0];
      
      // 计算总损伤数
      this.totalInjuries = allData.value;
      
      // 找出最常受损区域
      let maxRegionValue = 0;
      let maxRegionName = '';
      
      for (const region of allData.children) {
        if (region.value > maxRegionValue) {
          maxRegionValue = region.value;
          maxRegionName = region.name;
        }
      }
      
      this.mostAffectedRegion = maxRegionName;
      
      // 找出最常见严重度
      let severityCounts = { mild: 0, moderate: 0, severe: 0, critical: 0 };
      
      for (const region of allData.children) {
        for (const severity of region.children) {
          const severityType = this.getSeverityType(severity.name);
          severityCounts[severityType] += severity.value;
        }
      }
      
      let maxSeverityCount = 0;
      let maxSeverity = '';
      
      for (const severity in severityCounts) {
        if (severityCounts[severity] > maxSeverityCount) {
          maxSeverityCount = severityCounts[severity];
          maxSeverity = severity;
        }
      }
      
      this.mostCommonSeverity = this.getSeverityName(maxSeverity);
      
      // 计算高发季节/时段
      this.peakSeasonTime = `${this.getSeasonName(this.selectedSeason)}/${this.getTimePeriodName(this.selectedTimePeriod)}`;
    },
    getSeverityType(severityName) {
      const mapping = {
        '轻度': 'mild',
        '中度': 'moderate',
        '重度': 'severe',
        '危重': 'critical'
      };
      return mapping[severityName] || '';
    },
    getSeverityName(severityType) {
      const mapping = {
        'mild': '轻度',
        'moderate': '中度',
        'severe': '重度',
        'critical': '危重'
      };
      return mapping[severityType] || '';
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
.body-region-sunburst-container {
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