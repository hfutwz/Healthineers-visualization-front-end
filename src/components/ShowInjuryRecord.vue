<template>
  <div class="body-region-sunburst-container">
    <div class="header">
      <h2>身体区域损伤分布旭日图</h2>
      <div class="controls">
        <el-button type="primary" @click="refreshData" :loading="loading">刷新数据</el-button>
      </div>
    </div>
    
    <div class="chart-wrapper">
      <div v-if="loading" class="loading-container">
        <el-loading :loading="loading" text="加载中..."></el-loading>
      </div>
      <div ref="sunburstChart" class="chart" style="width: 100%; height: 600px;" v-show="!loading"></div>
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
import axios from 'axios';

export default {
  name: 'BodyRegionSunburst',
  props: {
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
      selectedSeason: 'all',
      selectedTimePeriod: 'all',
      chart: null,
      // 从后端获取的数据
      injuryData: [],
      totalInjuries: 0,
      mostAffectedRegion: '',
      mostCommonSeverity: '',
      peakSeasonTime: '',
      loading: false
    };
  },
  mounted() {
    this.updateFilters();
    this.loadData();
    window.addEventListener('resize', this.handleResize);
  },
  watch: {
    season: {
      handler() {
        this.updateFilters();
        this.loadData();
      },
      immediate: false
    },
    timePeriod: {
      handler() {
        this.updateFilters();
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
    year: {
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
    // 更新筛选条件
    updateFilters() {
      this.selectedSeason = this.season || 'all';
      this.selectedTimePeriod = this.timePeriod || 'all';
    },
    
    // 从后端加载数据
    async loadData() {
      this.loading = true;
      try {
        const params = {
          season: this.selectedSeason === 'all' ? null : this.getSeasonValue(this.selectedSeason),
          timePeriod: this.selectedTimePeriod === 'all' ? null : this.getTimePeriodValue(this.selectedTimePeriod),
          startDate: this.startDate,
          endDate: this.endDate,
          year: this.year
        };
        
        const response = await axios.get('/api/patient-statistics/body-region-sunburst', { params });
        
        if (response.data.code === 200) {
          this.injuryData = response.data.data;
          this.initChart();
          this.calculateStats();
        } else {
          this.$message.error('获取数据失败：' + response.data.message);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
        this.$message.error('获取数据失败，请检查网络连接');
      } finally {
        this.loading = false;
      }
    },
    
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
      this.loadData();
    },
    getSunburstData() {
      // 处理从后端获取的数据
      const regionData = {
        head_neck: { mild: 0, moderate: 0, severe: 0, critical: 0 },
        face: { mild: 0, moderate: 0, severe: 0, critical: 0 },
        chest: { mild: 0, moderate: 0, severe: 0, critical: 0 },
        abdomen: { mild: 0, moderate: 0, severe: 0, critical: 0 },
        limbs: { mild: 0, moderate: 0, severe: 0, critical: 0 },
        body: { mild: 0, moderate: 0, severe: 0, critical: 0 }
      };
      
      // 处理后端返回的数据
      this.injuryData.forEach(item => {
        const region = item.body_region;
        const severity = item.severity_level;
        const count = item.injury_count;
        
        if (regionData[region]) {
          const severityKey = this.getSeverityKey(severity);
          if (severityKey) {
            regionData[region][severityKey] += count;
          }
        }
      });
      
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
              value: this.sumSeverities(regionData.limbs),
              children: [
                { name: '轻度', value: regionData.limbs.mild, itemStyle: { color: '#c6e48b' } },
                { name: '中度', value: regionData.limbs.moderate, itemStyle: { color: '#7bc96f' } },
                { name: '重度', value: regionData.limbs.severe, itemStyle: { color: '#49af64' } },
                { name: '危重', value: regionData.limbs.critical, itemStyle: { color: '#239a3b' } }
              ]
            },
            {
              name: '体表',
              value: this.sumSeverities(regionData.body),
              children: [
                { name: '轻度', value: regionData.body.mild, itemStyle: { color: '#c6e48b' } },
                { name: '中度', value: regionData.body.moderate, itemStyle: { color: '#7bc96f' } },
                { name: '重度', value: regionData.body.severe, itemStyle: { color: '#49af64' } },
                { name: '危重', value: regionData.body.critical, itemStyle: { color: '#239a3b' } }
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
    },
    
    // 获取季节对应的数值
    getSeasonValue(seasonKey) {
      const mapping = {
        'spring': 0,
        'summer': 1,
        'autumn': 2,
        'winter': 3
      };
      return mapping[seasonKey];
    },
    
    // 获取时间段对应的数值
    getTimePeriodValue(timePeriodKey) {
      const mapping = {
        'night': 0,
        'morning_peak': 1,
        'noon_peak': 2,
        'afternoon': 3,
        'evening_peak': 4,
        'evening': 5
      };
      return mapping[timePeriodKey];
    },
    
    // 获取严重度对应的键值
    getSeverityKey(severityLevel) {
      const mapping = {
        '1': 'mild',
        '2': 'moderate', 
        '3': 'severe',
        '4': 'critical',
        '5': 'critical',
        '6': 'critical'
      };
      return mapping[severityLevel];
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