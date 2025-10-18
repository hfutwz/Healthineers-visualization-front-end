<template>
  <div class="seasonal-container">
    <div class="header">
      <h2>季节性创伤类型分布统计</h2>
      <div class="controls">
        <el-date-picker
          v-model="startYear"
          type="year"
          placeholder="选择起始年份"
          value-format="yyyy"
          style="width: 150px; margin-right: 15px;"
          @change="refreshData"
        >
        </el-date-picker>
        <span>至</span>
        <el-date-picker
          v-model="endYear"
          type="year"
          placeholder="选择结束年份"
          value-format="yyyy"
          style="width: 150px; margin-left: 15px; margin-right: 15px;"
          @change="refreshData"
        >
        </el-date-picker>
        <el-button type="primary" @click="refreshData">查询</el-button>
      </div>
    </div>
    
    <div class="chart-wrapper">
      <div ref="barChart" class="chart" style="width: 100%; height: 500px;"></div>
      <div v-if="legendTooltip.visible" class="legend-tooltip" :style="legendTooltip.style">
        {{ legendTooltip.content }}
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
            <div class="stat-value">{{ mostCommonInjury }}</div>
            <div class="stat-label">最常见创伤类型</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ peakSeason }}</div>
            <div class="stat-label">最繁忙季节</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ averagePerYear }}</div>
            <div class="stat-label">年均患者</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'SeasonalBarChart',
  data() {
    // 设置默认年份范围为最近5年
    const currentYear = new Date().getFullYear();
    
    return {
      startYear: (currentYear - 4).toString(),
      endYear: currentYear.toString(),
      chart: null,
      seasonalData: {
        // 春季数据
        spring: {
          traffic: 65,
          fall: 28,
          mechanical: 35,
          tumble: 45,
          other: 20
        },
        // 夏季数据
        summer: {
          traffic: 59,
          fall: 48,
          mechanical: 42,
          tumble: 25,
          other: 18
        },
        // 秋季数据
        autumn: {
          traffic: 80,
          fall: 40,
          mechanical: 38,
          tumble: 36,
          other: 22
        },
        // 冬季数据
        winter: {
          traffic: 81,
          fall: 19,
          mechanical: 32,
          tumble: 52,
          other: 25
        }
      },
      totalPatients: 0,
      mostCommonInjury: '',
      peakSeason: '',
      averagePerYear: 0,
      // 图例提示框
      legendTooltip: {
        visible: false,
        content: '',
        style: {
          left: '0px',
          top: '0px'
        }
      }
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
      this.chart = echarts.init(this.$refs.barChart);
      
      // 准备图表数据
      const seasons = ['春季', '夏季', '秋季', '冬季'];
      const injuryTypes = [
        { name: '交通伤', key: 'traffic', color: '#5470c6' },
        { name: '高坠伤', key: 'fall', color: '#91cc75' },
        { name: '机械伤', key: 'mechanical', color: '#fac858' },
        { name: '跌倒', key: 'tumble', color: '#ee6666' },
        { name: '其他', key: 'other', color: '#73c0de' }
      ];
      
      // 计算每个类别的总数
      const categoryTotals = {};
      injuryTypes.forEach(type => {
        categoryTotals[type.name] = 0;
        seasons.forEach(season => {
          const seasonKey = this.getSeasonKey(season);
          categoryTotals[type.name] += this.seasonalData[seasonKey][type.key];
        });
      });
      
      const seriesData = injuryTypes.map(type => {
        return {
          name: type.name,
          type: 'bar',
          stack: 'season',
          data: seasons.map(season => {
            const seasonKey = this.getSeasonKey(season);
            return this.seasonalData[seasonKey][type.key];
          }),
          itemStyle: {
            color: type.color,
            // 设置鼠标悬停时的高亮效果
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        };
      });
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          // 自定义提示框内容
          formatter: function(params) {
            let result = params[0].name + '<br/>';
            params.forEach(param => {
              result += `${param.marker}${param.seriesName}: ${param.value}<br/>`;
            });
            return result;
          }
        },
        legend: {
          data: injuryTypes.map(type => type.name),
          top: 10,
          selectedMode: false // 禁用图例点击选择功能
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
          data: seasons,
          axisLabel: {
            fontWeight: 'bold'
          }
        },
        yAxis: {
          type: 'value',
          name: '患者数量',
          axisLabel: {
            fontWeight: 'bold'
          }
        },
        // 添加高亮效果配置
        emphasis: {
          focus: 'series',  // 高亮同系列的所有数据
          blurScope: 'coordinateSystem'  // 淡化其他系列
        },
        series: seriesData
      };
      
      this.chart.setOption(option);
      
      // 添加图表事件监听，实现更精确的高亮效果
      this.chart.on('mouseover', (params) => {
        // 高亮当前系列的所有数据
        this.chart.dispatchAction({
          type: 'highlight',
          seriesIndex: params.seriesIndex
        });
      });
      
      this.chart.on('mouseout', (params) => {
        // 取消高亮
        this.chart.dispatchAction({
          type: 'downplay',
          seriesIndex: params.seriesIndex
        });
      });
      
      // 阻止图例点击事件
      this.chart.on('legendselectchanged', (params) => {
        // 阻止默认行为
        this.chart.dispatchAction({
          type: 'legendUnSelect',
          name: params.name
        });
      });
      
      // 添加图例鼠标悬停事件
      this.chart.on('legendselectall', () => {
        // 阻止全选
        this.chart.dispatchAction({
          type: 'legendUnSelect',
          name: '__all__'
        });
      });
      
      // 添加自定义图例悬停事件
      setTimeout(() => {
        try {
          const legend = this.chart.getModel().getComponent('legend');
          if (legend && legend.group) {
            const group = legend.group;
            
            // 使用更安全的方法遍历子元素
            const children = group.childrenRef || [];
            for (let i = 0; i < children.length; i++) {
              const child = children[i];
              if (child && child.__ecComponentInfo && child.__ecComponentInfo.mainType === 'legend') {
                child.on('mouseover', () => {
                  const name = child.__ecData.name;
                  const rect = child.getBoundingRect();
                  const viewPoint = this.chart.convertToPixel({ seriesIndex: 0 }, [rect.x, rect.y]);
                  
                  // 显示自定义提示框
                  this.legendTooltip = {
                    visible: true,
                    content: `${name}: 总计 ${categoryTotals[name]} 例`,
                    style: {
                      left: (viewPoint[0] + rect.width + 10) + 'px',
                      top: (viewPoint[1] + rect.height / 2 - 15) + 'px'
                    }
                  };
                  
                  // 高亮当前类别的所有季节数据
                  this.chart.dispatchAction({
                    type: 'highlight',
                    seriesName: name
                  });
                });
                
                child.on('mouseout', () => {
                  // 隐藏自定义提示框
                  this.legendTooltip.visible = false;
                  
                  // 取消高亮
                  this.chart.dispatchAction({
                    type: 'downplay',
                    seriesName: child.__ecData.name
                  });
                });
              }
            }
          } else {
            // 如果无法获取图例，使用备用方案
            console.warn('无法获取图例组件，使用备用方案');
            this.setupFallbackLegendEvents(categoryTotals);
          }
        } catch (error) {
          console.error('处理图例事件时出错:', error);
          // 使用备用方案
          this.setupFallbackLegendEvents(categoryTotals);
        }
      }, 100); // 增加延迟确保图表完全渲染
    },
    
    // 备用方案：使用 ECharts 事件系统处理图例交互
    setupFallbackLegendEvents(categoryTotals) {
      // 使用 ECharts 事件系统处理图例交互
      this.chart.on('legendselectchanged', (params) => {
        // 阻止默认行为
        this.chart.dispatchAction({
          type: 'legendUnSelect',
          name: params.name
        });
        
        // 显示提示
        this.legendTooltip = {
          visible: true,
          content: `${params.name}: 总计 ${categoryTotals[params.name]} 例`,
          style: {
            left: '50%',
            top: '20px',
            transform: 'translateX(-50%)'
          }
        };
        
        // 高亮当前类别的所有季节数据
        this.chart.dispatchAction({
          type: 'highlight',
          seriesName: params.name
        });
      });
      
      // 添加全局鼠标离开事件
      this.chart.getDom().addEventListener('mouseleave', () => {
        this.legendTooltip.visible = false;
        this.chart.dispatchAction({
          type: 'downplay',
          seriesName: '__all__'
        });
      });
    },
    
    handleResize() {
      if (this.chart) {
        this.chart.resize();
      }
    },
    
    refreshData() {
      // 模拟根据年份范围筛选数据
      // 实际项目中这里应该是API调用
      const start = parseInt(this.startYear);
      const end = parseInt(this.endYear);
      const yearCount = end - start + 1;
      
      // 根据年份范围长度调整数据（示例逻辑）
      const factor = yearCount / 5; // 以5年为基准
      
      // 更新数据
      for (const season in this.seasonalData) {
        for (const injury in this.seasonalData[season]) {
          // 随机波动模拟不同年份的数据变化
          const randomFactor = 0.8 + Math.random() * 0.4;
          this.seasonalData[season][injury] = Math.round(this.seasonalData[season][injury] * factor * randomFactor);
        }
      }
      
      // 重新渲染图表
      this.initChart();
      this.calculateStats();
    },
    
    calculateStats() {
      // 计算统计数据
      let total = 0;
      let injuryTotals = {
        traffic: 0,
        fall: 0,
        mechanical: 0,
        tumble: 0,
        other: 0
      };
      let seasonTotals = {
        spring: 0,
        summer: 0,
        autumn: 0,
        winter: 0
      };
      
      // 计算各类型和季节的总数
      for (const season in this.seasonalData) {
        for (const injury in this.seasonalData[season]) {
          const count = this.seasonalData[season][injury];
          total += count;
          injuryTotals[injury] += count;
          seasonTotals[season] += count;
        }
      }
      
      // 找出最常见的创伤类型
      let maxInjuryCount = 0;
      let maxInjury = '';
      for (const injury in injuryTotals) {
        if (injuryTotals[injury] > maxInjuryCount) {
          maxInjuryCount = injuryTotals[injury];
          maxInjury = injury;
        }
      }
      
      // 找出最繁忙的季节
      let maxSeasonCount = 0;
      let maxSeason = '';
      for (const season in seasonTotals) {
        if (seasonTotals[season] > maxSeasonCount) {
          maxSeasonCount = seasonTotals[season];
          maxSeason = season;
        }
      }
      
      this.totalPatients = total;
      this.mostCommonInjury = this.getInjuryName(maxInjury);
      this.peakSeason = this.getSeasonName(maxSeason);
      
      // 计算年份范围
      const start = parseInt(this.startYear);
      const end = parseInt(this.endYear);
      const yearCount = end - start + 1;
      this.averagePerYear = Math.round(total / yearCount);
    },
    
    getSeasonKey(seasonName) {
      const mapping = {
        '春季': 'spring',
        '夏季': 'summer',
        '秋季': 'autumn',
        '冬季': 'winter'
      };
      return mapping[seasonName];
    },
    
    getSeasonName(seasonKey) {
      const mapping = {
        'spring': '春季',
        'summer': '夏季',
        'autumn': '秋季',
        'winter': '冬季'
      };
      return mapping[seasonKey];
    },
    
    getInjuryName(injuryKey) {
      const mapping = {
        'traffic': '交通伤',
        'fall': '高坠伤',
        'mechanical': '机械伤',
        'tumble': '跌倒',
        'other': '其他'
      };
      return mapping[injuryKey];
    }
  }
};
</script>

<style scoped>
.seasonal-container {
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
  position: relative;
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.chart {
  border-radius: 4px;
}

.legend-tooltip {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 1000;
  pointer-events: none;
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