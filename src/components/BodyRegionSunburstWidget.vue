<template>
  <div class="body-region-sunburst-widget">
    <div class="widget-header">
      <h3>身体区域损伤分布</h3>
    </div>
    
    <div class="widget-content">
      <div class="chart-layout">
        <div class="chart-container">
          <div v-if="loading" class="loading-container">
            <el-loading :loading="loading" text="加载中..."></el-loading>
          </div>
          <div ref="sunburstChart" class="chart" v-show="!loading"></div>
        </div>
        
        <div class="info-panel">
          <div class="region-stats">
            <div v-for="region in regionStats" :key="region.name" class="region-item">
              <div class="region-header">
                <div class="region-name">{{ region.name }}</div>
                <div class="region-total">{{ region.total }}例</div>
              </div>
              <div class="severity-breakdown">
                <div v-for="severity in region.severities" :key="severity.type" class="severity-item">
                  <div class="severity-label">{{ severity.name }}</div>
                  <div class="severity-value">{{ severity.count }}/{{ severity.percentage }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import axios from 'axios';

export default {
  name: 'BodyRegionSunburstWidget',
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
      chart: null,
      injuryData: [],
      totalInjuries: 0,
      mostAffectedRegion: '',
      mostCommonSeverity: '',
      regionStats: [],
      loading: false
    };
  },
  mounted() {
    this.loadData();
    window.addEventListener('resize', this.handleResize);
  },
  watch: {
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
    async loadData() {
      this.loading = true;
      console.log('开始加载身体区域损伤数据...');
      try {
        const params = {
          season: this.season === 'all' ? null : this.getSeasonValue(this.season),
          timePeriod: this.timePeriod === 'all' ? null : this.getTimePeriodValue(this.timePeriod),
          startDate: this.startDate,
          endDate: this.endDate,
          year: this.year ? parseInt(this.year) : null
        };
        
        console.log('请求参数:', params);
        console.log('请求URL: /api/patient-statistics/body-region-sunburst');
        
        const response = await axios.get('/api/patient-statistics/body-region-sunburst', { params });
        
        console.log('API响应状态:', response.status);
        console.log('API响应数据:', response.data);
        
        // 处理不同的响应格式
        if (response.data.success === true || response.data.code === 200) {
          this.injuryData = response.data.data || [];
          console.log('获取到的身体区域损伤数据:', this.injuryData);
          console.log('数据长度:', this.injuryData.length);
          this.initChart();
          this.calculateStats();
        } else {
          console.error('获取身体区域损伤数据失败：', response.data.message || response.data.errorMsg);
        }
      } catch (error) {
        console.error('获取身体区域损伤数据失败:', error);
        console.error('错误详情:', error.response ? error.response.data : error.message);
      } finally {
        this.loading = false;
      }
    },
    
    initChart() {
      console.log('开始初始化旭日图...');
      
      // 确保容器有正确的尺寸
      const chartContainer = this.$refs.sunburstChart;
      if (chartContainer) {
        chartContainer.style.width = '100%';
        chartContainer.style.height = '400px';
        chartContainer.style.minHeight = '400px';
      }
      
      this.chart = echarts.init(chartContainer);
      
      const sunburstData = this.getSunburstData();
      console.log('旭日图数据:', sunburstData);
      
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
          radius: ['10%', '90%'],
          center: ['50%', '50%'],
          label: {
            rotate: 'radial',
            show: true,
            fontSize: 12,
            formatter: function(params) {
              if (params.depth === 1) {
                // 第二层显示部位名称和数量
                return `${params.name}\n${params.value}例`;
              } else if (params.depth === 2) {
                // 第三层显示严重度
                return params.name;
              }
              return params.name;
            }
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
                fontSize: 12,
                show: true
              }
            },
            {
              r0: '35%',
              r: '70%',
              label: {
                align: 'right',
                show: true,
                fontSize: 11
              }
            },
            {
              r0: '70%',
              r: '85%',
              label: {
                position: 'outside',
                padding: 3,
                silent: false,
                show: true,
                fontSize: 10
              },
              itemStyle: {
                borderWidth: 1
              }
            }
          ]
        }
      };
      
      this.chart.setOption(option);
      
      // 强制重新渲染以确保正确显示
      this.$nextTick(() => {
        if (this.chart) {
          this.chart.resize();
          // 延迟再次调整尺寸，确保图表完全渲染
          setTimeout(() => {
            if (this.chart) {
              this.chart.resize();
            }
          }, 100);
        }
      });
    },
    
    handleResize() {
      if (this.chart) {
        this.chart.resize();
      }
    },
    
    getSunburstData() {
      const regionData = {
        head_neck: { mild: 0, moderate: 0, severe: 0, critical: 0 },
        face: { mild: 0, moderate: 0, severe: 0, critical: 0 },
        chest: { mild: 0, moderate: 0, severe: 0, critical: 0 },
        abdomen: { mild: 0, moderate: 0, severe: 0, critical: 0 },
        limbs: { mild: 0, moderate: 0, severe: 0, critical: 0 },
        body: { mild: 0, moderate: 0, severe: 0, critical: 0 }
      };
      
      this.injuryData.forEach(item => {
        const region = item.body_region;
        const severity = item.severity_level;
        const count = item.injury_count;
        
        if (regionData[region]) {
          // 处理复合严重度，将数据同时计入所有相关等级
          const severityKeys = this.getSeverityKeys(severity);
          severityKeys.forEach(severityKey => {
            if (severityKey) {
              regionData[region][severityKey] += count;
            }
          });
        }
      });
      
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
                { name: '无法医治', value: regionData.head_neck.critical, itemStyle: { color: '#239a3b' } }
              ]
            },
            {
              name: '面部',
              value: this.sumSeverities(regionData.face),
              children: [
                { name: '轻度', value: regionData.face.mild, itemStyle: { color: '#c6e48b' } },
                { name: '中度', value: regionData.face.moderate, itemStyle: { color: '#7bc96f' } },
                { name: '重度', value: regionData.face.severe, itemStyle: { color: '#49af64' } },
                { name: '无法医治', value: regionData.face.critical, itemStyle: { color: '#239a3b' } }
              ]
            },
            {
              name: '胸部',
              value: this.sumSeverities(regionData.chest),
              children: [
                { name: '轻度', value: regionData.chest.mild, itemStyle: { color: '#c6e48b' } },
                { name: '中度', value: regionData.chest.moderate, itemStyle: { color: '#7bc96f' } },
                { name: '重度', value: regionData.chest.severe, itemStyle: { color: '#49af64' } },
                { name: '无法医治', value: regionData.chest.critical, itemStyle: { color: '#239a3b' } }
              ]
            },
            {
              name: '腹部',
              value: this.sumSeverities(regionData.abdomen),
              children: [
                { name: '轻度', value: regionData.abdomen.mild, itemStyle: { color: '#c6e48b' } },
                { name: '中度', value: regionData.abdomen.moderate, itemStyle: { color: '#7bc96f' } },
                { name: '重度', value: regionData.abdomen.severe, itemStyle: { color: '#49af64' } },
                { name: '无法医治', value: regionData.abdomen.critical, itemStyle: { color: '#239a3b' } }
              ]
            },
            {
              name: '四肢',
              value: this.sumSeverities(regionData.limbs),
              children: [
                { name: '轻度', value: regionData.limbs.mild, itemStyle: { color: '#c6e48b' } },
                { name: '中度', value: regionData.limbs.moderate, itemStyle: { color: '#7bc96f' } },
                { name: '重度', value: regionData.limbs.severe, itemStyle: { color: '#49af64' } },
                { name: '无法医治', value: regionData.limbs.critical, itemStyle: { color: '#239a3b' } }
              ]
            },
            {
              name: '体表',
              value: this.sumSeverities(regionData.body),
              children: [
                { name: '轻度', value: regionData.body.mild, itemStyle: { color: '#c6e48b' } },
                { name: '中度', value: regionData.body.moderate, itemStyle: { color: '#7bc96f' } },
                { name: '重度', value: regionData.body.severe, itemStyle: { color: '#49af64' } },
                { name: '无法医治', value: regionData.body.critical, itemStyle: { color: '#239a3b' } }
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
      
      this.totalInjuries = allData.value;
      
      // 计算每个部位的详细统计
      this.regionStats = allData.children.map(region => {
        const total = region.value;
        const severities = region.children.map(severity => {
          const count = severity.value;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          return {
            type: this.getSeverityType(severity.name),
            name: severity.name,
            count: count,
            percentage: percentage
          };
        });
        
        return {
          name: region.name,
          total: total,
          severities: severities
        };
      });
      
      // 计算最常受损区域
      let maxRegionValue = 0;
      let maxRegionName = '';
      
      for (const region of allData.children) {
        if (region.value > maxRegionValue) {
          maxRegionValue = region.value;
          maxRegionName = region.name;
        }
      }
      
      this.mostAffectedRegion = maxRegionName;
      
      // 计算最常见严重度
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
    },
    
    getSeverityType(severityName) {
      const mapping = {
        '轻度': 'mild',
        '中度': 'moderate',
        '重度': 'severe',
        '无法医治': 'critical'
      };
      return mapping[severityName] || '';
    },
    
    getSeverityName(severityType) {
      const mapping = {
        'mild': '轻度',
        'moderate': '中度',
        'severe': '重度',
        'critical': '无法医治'
      };
      return mapping[severityType] || '';
    },
    
    getSeasonValue(seasonKey) {
      const mapping = {
        'spring': 0,
        'summer': 1,
        'autumn': 2,
        'winter': 3
      };
      return mapping[seasonKey];
    },
    
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
    
    getSeverityKeys(severityLevel) {
      // 过滤掉0分数据
      if (severityLevel === '0' || severityLevel === 0) {
        return [];
      }
      
      // 处理包含多个严重度的情况（如 "1|2", "3|4" 等）
      if (severityLevel.includes('|')) {
        // 如果有多个严重度，返回所有严重度等级
        const severities = severityLevel.split('|').map(s => parseInt(s.trim())).filter(s => !isNaN(s) && s > 0);
        return severities.map(severity => this.getSeverityKeyByNumber(severity)).filter(key => key);
      }
      
      // 单个严重度
      const severityKey = this.getSeverityKeyByNumber(parseInt(severityLevel));
      return severityKey ? [severityKey] : [];
    },
    
    getSeverityKey(severityLevel) {
      // 保持向后兼容，返回第一个严重度等级
      const keys = this.getSeverityKeys(severityLevel);
      return keys.length > 0 ? keys[0] : 'mild';
    },
    
    getSeverityKeyByNumber(severityNumber) {
      // 根据用户需求重新映射严重度：1-2分轻度，3分中度，4-5分重度，6分无法医治
      const mapping = {
        1: 'mild',      // 轻度
        2: 'mild',      // 轻度
        3: 'moderate',  // 中度
        4: 'severe',    // 重度
        5: 'severe',    // 重度
        6: 'critical'   // 无法医治
      };
      return mapping[severityNumber] || null; // 返回null表示不显示0分数据
    }
  }
};
</script>

<style scoped>
.body-region-sunburst-widget {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.widget-header {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.widget-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.widget-content {
  flex: 1;
  padding: 15px;
}

.chart-layout {
  display: flex;
  gap: 20px;
  height: 100%;
}

.chart-container {
  flex: 1;
  min-height: 400px;
  position: relative;
}

.chart {
  width: 100% !important;
  height: 400px !important;
  border-radius: 4px;
}

.info-panel {
  width: 300px;
  max-height: 500px;
  overflow-y: auto;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409EFF;
}

.region-stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.region-item {
  background: white;
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.region-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.region-name {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.region-total {
  font-size: 16px;
  font-weight: bold;
  color: #409EFF;
}

.severity-breakdown {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.severity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
}

.severity-label {
  color: #606266;
  font-weight: 500;
}

.severity-value {
  color: #409EFF;
  font-weight: bold;
}

@media (max-width: 768px) {
  .chart-layout {
    flex-direction: column;
  }
  
  .info-panel {
    width: 100%;
    max-height: 300px;
  }
  
  .region-stats {
    gap: 10px;
  }
  
  .region-item {
    padding: 10px;
  }
  
  .severity-breakdown {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}
</style>
