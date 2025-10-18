<template>
  <div class="sankey-container">
    <div class="header">
      <h2>患者流向分析桑基图</h2>
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
      <div ref="sankeyChart" class="chart" style="width: 100%; height: 600px;"></div>
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
            <div class="stat-value">{{ mortalityRate }}%</div>
            <div class="stat-label">死亡率</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ mostCommonFlow }}</div>
            <div class="stat-label">最常见流向</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ criticalMortality }}%</div>
            <div class="stat-label">严重伤死亡率</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'PatientFlowSankey',
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
      totalPatients: 0,
      mortalityRate: 0,
      mostCommonFlow: '',
      criticalMortality: 0
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
      this.chart = echarts.init(this.$refs.sankeyChart);
      
      // 模拟数据 - 实际应用中应从后端API获取
      const nodes = [
        { name: '交通伤' },
        { name: '高坠伤' },
        { name: '机械伤' },
        { name: '跌倒' },
        { name: '其他' },
        { name: '轻伤(ISS≤16)' },
        { name: '重伤(16<ISS≤25)' },
        { name: '严重伤(ISS>25)' },
        { name: '手术室' },
        { name: 'ICU' },
        { name: '普通病房' },
        { name: '出院' },
        { name: '死亡' }
      ];
      
      const links = [
        // 交通伤流向
        { source: '交通伤', target: '轻伤(ISS≤16)', value: 120 },
        { source: '交通伤', target: '重伤(16<ISS≤25)', value: 80 },
        { source: '交通伤', target: '严重伤(ISS>25)', value: 30 },
        
        // 高坠伤流向
        { source: '高坠伤', target: '轻伤(ISS≤16)', value: 40 },
        { source: '高坠伤', target: '重伤(16<ISS≤25)', value: 35 },
        { source: '高坠伤', target: '严重伤(ISS>25)', value: 25 },
        
        // 机械伤流向
        { source: '机械伤', target: '轻伤(ISS≤16)', value: 60 },
        { source: '机械伤', target: '重伤(16<ISS≤25)', value: 45 },
        { source: '机械伤', target: '严重伤(ISS>25)', value: 15 },
        
        // 跌倒流向
        { source: '跌倒', target: '轻伤(ISS≤16)', value: 90 },
        { source: '跌倒', target: '重伤(16<ISS≤25)', value: 30 },
        { source: '跌倒', target: '严重伤(ISS>25)', value: 10 },
        
        // 其他流向
        { source: '其他', target: '轻伤(ISS≤16)', value: 50 },
        { source: '其他', target: '重伤(16<ISS≤25)', value: 25 },
        { source: '其他', target: '严重伤(ISS>25)', value: 15 },
        
        // 轻伤患者流向
        { source: '轻伤(ISS≤16)', target: '普通病房', value: 110 },
        { source: '轻伤(ISS≤16)', target: '出院', value: 10 },
        
        // 重伤患者流向
        { source: '重伤(16<ISS≤25)', target: '手术室', value: 30 },
        { source: '重伤(16<ISS≤25)', target: 'ICU', value: 50 },
        { source: '重伤(16<ISS≤25)', target: '普通病房', value: 60 },
        
        // 严重伤患者流向
        { source: '严重伤(ISS>25)', target: '手术室', value: 15 },
        { source: '严重伤(ISS>25)', target: 'ICU', value: 40 },
        { source: '严重伤(ISS>25)', target: '死亡', value: 20 },
        
        // 手术室后续流向
        { source: '手术室', target: 'ICU', value: 30 },
        { source: '手术室', target: '普通病房', value: 10 },
        { source: '手术室', target: '死亡', value: 5 },
        
        // ICU后续流向
        { source: 'ICU', target: '普通病房', value: 70 },
        { source: 'ICU', target: '死亡', value: 20 },
        
        // 普通病房后续流向
        { source: '普通病房', target: '出院', value: 200 },
        { source: '普通病房', target: '死亡', value: 10 }
      ];
      
      // 为节点分配颜色
      const nodeColors = {
        '交通伤': '#5470c6',
        '高坠伤': '#91cc75',
        '机械伤': '#fac858',
        '跌倒': '#ee6666',
        '其他': '#73c0de',
        '轻伤(ISS≤16)': '#67C23A',
        '重伤(16<ISS≤25)': '#E6A23C',
        '严重伤(ISS>25)': '#F56C6C',
        '手术室': '#9a60b4',
        'ICU': '#f47920',
        '普通病房': '#2ec7c9',
        '出院': '#409EFF',
        '死亡': '#909399'
      };
      
      const option = {
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove',
          formatter: '{b}: {c}'
        },
        series: {
          type: 'sankey',
          layout: 'none',
          emphasis: {
            focus: 'adjacency'
          },
          data: nodes.map(node => ({
            name: node.name,
            itemStyle: {
              color: nodeColors[node.name] || '#5470c6'
            }
          })),
          links: links,
          lineStyle: {
            color: 'gradient',
            curveness: 0.5
          }
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
      // 模拟根据日期范围筛选数据
      // 实际项目中这里应该是API调用
      console.log('刷新数据，日期范围:', this.dateRange);
      
      // 重新渲染图表
      this.initChart();
      this.calculateStats();
    },
    calculateStats() {
      // 模拟统计数据计算
      // 实际项目中这里应该基于真实数据计算
      this.totalPatients = 360;
      this.mortalityRate = 8.3;
      this.mostCommonFlow = '交通伤→轻伤→普通病房→出院';
      this.criticalMortality = 33.3;
    }
  }
};
</script>

<style scoped>
.sankey-container {
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