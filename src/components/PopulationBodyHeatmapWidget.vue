<template>
  <div class="population-body-heatmap-widget">
    <!-- 标题 -->
    <div class="widget-header">
      <h3>人群身体热力图</h3>
    </div>

    <!-- 热力图展示区域 -->
    <div class="heatmap-container">
      <div class="human-figure-container">
        <div ref="svgContainer" class="human-figure">
          <p v-if="!svgLoaded" class="svg-placeholder">加载人体图中...</p>
        </div>
      </div>
      
      <!-- 热力图数据展示 -->
      <div class="heatmap-data">
        <div class="data-summary">
          <h4>热力图数据</h4>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">总患者数：</span>
              <span class="stat-value">{{ totalPatients }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均严重程度：</span>
              <span class="stat-value">{{ averageSeverity.toFixed(2) }}</span>
            </div>
          </div>
        </div>
        
        <div class="body-parts-data">
          <h4>各部位热度数据</h4>
          <div class="parts-list">
            <div 
              v-for="part in bodyPartsData" 
              :key="part.body_part"
              class="part-item"
              :class="{ highlighted: highlightedPart === part.body_part }"
              @mouseenter="highlightPart(part.body_part)"
              @mouseleave="unhighlightPart"
            >
              <div class="part-header">
                <span class="part-name">{{ getPartName(part.body_part) }}</span>
                <span class="part-severity" :style="{ color: getSeverityColor(part.average_severity) }">
                  {{ part.average_severity.toFixed(2) }}
                </span>
              </div>
              <div class="part-details">
                <span class="patient-count">{{ part.patient_count }}例</span>
                <div class="severity-bar">
                  <div 
                    class="severity-fill" 
                    :style="{ 
                      width: (part.average_severity / 6 * 100) + '%',
                      backgroundColor: getSeverityColor(part.average_severity)
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 颜色图例 -->
        <div class="color-legend">
          <h4>严重程度颜色指示</h4>
          <div class="legend-items">
            <div v-for="i in 7" :key="i" class="legend-item">
              <span class="color-box" :style="{ backgroundColor: getSeverityColor(i-1) }"></span>
              <span class="level-label">等级 {{ i-1 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PopulationBodyHeatmapWidget',
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
      default: null
    },
    timePeriod: {
      type: String,
      default: null
    },
    year: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      svgLoaded: false,
      svgElement: null,
      highlightedPart: null,
      bodyPartsData: [],
      totalPatients: 0,
      averageSeverity: 0,
      // SVG字符串 - 复制自InjuryFigureModal.vue
      svgStr: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <g>
          <!--面部-->
          <path class="face" style="stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="&#10;&#9;&#9;M256,63.613L256,63.613c-13.282,0-24.048-10.767-24.048-24.048v-8.016C231.952,18.267,242.718,7.5,256,7.5h0&#10;&#9;&#9;c13.282,0,24.048,10.767,24.048,24.048v8.016C280.048,52.846,269.282,63.613,256,63.613z"/>
          <!--左手-->
          <path class="limbs" style="stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="
          M180.208,243.765c-2.84,7.953-8.12,14.805-15.085,19.579l-15.318,10.5c-8.221,5.635-19.371,4.151-25.831-3.439h0c-6.42-7.542-4.534-19.044,3.959-24.140l23.858-14.315" />
          <!--左臂-->
          <path style="stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="M215.919,143.774l-35.711,99.991M150.066,229.45l12.277-41.983" /> 
          <!--右手-->
          <path class="limbs" style="stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="&#10;&#9;&#9;M365.280, 233.929l23.858,14.315c8.493,5.096,10.38,16.598,3.959,24.140l0,0c-6.461,7.59-17.61,9.074-25.831,3.439l-15.318-10.5&#10;&#9;&#9;c-6.965-4.774-12.245-11.627-15.085-19.579"/>
          <!--右臂-->
          <path style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="&#10;&#9;&#9;M288.065,85.276l21.240,7.080c9.958,3.319,17.660,11.302,20.622,21.372l35.353,120.201&#10;&#9;&#9;M332.073,246.322l-35.711-99.991"/>
          <!---->
          <path style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="&#10;&#9;&#9;M296.081,239.968l-26.342,15.805C261.215,260.887,256,270.098,256,280.038v0.011l4.270,59.783&#10;&#9;&#9;c0.820,11.482,10.374,20.378,21.885,20.378h0c12.118,0,21.941-9.823,21.941-21.941"/>
	
      <polyline style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" points="&#10;&#9;&#9;304.097,472.435 269.801,463.411 291.999,358.948 &#9;"/>
    
		<line style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" x1="256" y1="167.823" x2="256" y2="95.677"/>

		<line style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" x1="247.984" y1="167.823" x2="264.016" y2="167.823"/>

    
  
		<line style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" x1="151.790" y1="231.952" x2="175.277" y2="251.873"/>
	
		<line style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" x1="189.532" y1="184.081" x2="196.714" y2="186.257"/>
	
		<line style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" x1="360.210" y1="231.952" x2="336.723" y2="251.873"/>
	
		<line style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" x1="322.468" y1="184.081" x2="315.286" y2="186.257"/>
		<!--左肩-->
    <path style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="&#10;&#9;&#9;
      M229.794,139.901
      l-14.801-6.743
      l-41.821,26.095
      l13.971-47.502
      c2.962-10.070,10.664-18.052,20.622-21.372
      l21.240-7.080&#10;&#9;&#9;"/>
    <!--颈部-->
    <path class="neck" style="stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="
      M272.032,62.422
      V68.090
      c0,6.901,4.416,13.027,10.962,15.210     
      l-28.065,10.276
      l-28.065,-10.276
      c6.547-2.182,10.962-8.309,10.962-15.210
      V62.422
    " />
		<polyline style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" points="&#10;&#9;&#9;282.206,139.901 297.006,133.158 338.028,159.488 &#9;"/>
    <path class="limbs" style="stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="&#10;&#9;&#9;
  M242.199,463.411L241.031,489.610c-0.599,8.390-7.580,14.890-15.992,14.890h-41.185v-6.715c0-10.351,6.624-19.541,16.444-22.814l7.605-2.535&#10;&#9;&#9;
  "/>
  <!--右脚-->
  <path class="limbs" style="stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="&#10;&#9;&#9;
  M304.097, 472.436l7.605,2.535c9.820,3.273,16.444,12.463,16.444,22.814v6.715H286.960c-8.411,0-15.392-6.500-15.992-14.890&#10;&#9;&#9;L269.801,463.411"/>
<!--腹部-->
 <path class="abdomen" style="stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="&#10;&#9;&#9;
M 216.539, 233.790
l5.623-19.679c1.171-4.097,1.513-8.387,1.007-12.618
L289.114,204.050
c-0.506,4.231-0.164,8.520,1.007,12.618&#10;&#9;&#9;
l5.623,19.679
l-26.342,15.805
C261.215,260.887,256,270.098,256,280.038
  "/>
<!--左侧大腿-->
<path class="body" style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="&#10;&#9;&#9;
M215.919,239.968
l26.342,15.805
c8.523,5.114,13.738,14.325,13.738,24.264
v0.011l-4.270,59.783&#10;&#9;&#9;
c-0.820,11.482-10.374,20.378-21.885,20.378
h0
c-12.118,0-21.941-9.823-21.941-21.941"/>
  <!--胸部-->
 <path class="chest" style="stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" 
  d="&#10;&#9;&#9;
  M296.363,146.331
  l0.926-10.616
l-8.175,68.335
L223.169,201.493
l-8.175-68.335
l0.926,10.616
L296.363,146.331
"/>
  <!--身体右侧-->
    <path class="body" style="stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" 
    d="&#10;&#9;&#9;
    M295.744,236.347
  c5.729,20.053,8.636,40.806,8.636,61.662
  v6.271
  L304.097,332.736  v139.700
  L269.801,463.411
  L256,280.048
  "/>
  <!--身体左侧-->
  <path class="body" style="stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="&#10;&#9;&#9;
M256,280.048
L242.199,463.411
L207.903,472.435
V295.452
c0-20.855,2.907-41.609,8.636-61.662
  "/>
	<path style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="&#10;&#9;&#9;M304.097,332.736v139.700l7.605,2.535c9.820,3.273,16.444,12.463,16.444,22.814v6.715H286.960c-8.411,0-15.392-6.500-15.992-14.890&#10;&#9;&#9;L256,280.048L241.031,489.610c-0.599,8.390-7.580,14.890-15.992,14.890h-41.185v-6.715c0-10.351,6.624-19.541,16.444-22.814l7.605-2.535&#10;&#9;&#9;V295.452c0-20.855,2.907-41.609,8.636-61.662l5.623-19.679c1.171-4.097,1.513-8.387,1.007-12.618l-8.175-68.335"/>
        </g>
      </svg>`,
      partNames: {
        head_neck: '头颈部',
        face: '面部',
        chest: '胸部',
        abdomen: '腹部',
        limbs: '四肢',
        body: '体表'
      }
    };
  },
  watch: {
    // 监听props变化，自动获取数据
    startDate: {
      handler() {
        this.fetchHeatmapData();
      }
    },
    endDate: {
      handler() {
        this.fetchHeatmapData();
      }
    },
    season: {
      handler() {
        this.fetchHeatmapData();
      }
    },
    timePeriod: {
      handler() {
        this.fetchHeatmapData();
      }
    },
    year: {
      handler() {
        this.fetchHeatmapData();
      }
    }
  },
  methods: {
    // 获取部位名称
    getPartName(partKey) {
      return this.partNames[partKey] || partKey;
    },
    
    // 获取严重程度颜色
    getSeverityColor(level) {
      const startColor = [255, 255, 255]; // 白色
      const endColor = [139, 0, 0]; // 深红色
      const levelsCount = 7; // 0-6
      const factor = level / (levelsCount - 1);
      const rgb = startColor.map((c, i) => Math.round(c + (endColor[i] - c) * factor));
      return `rgb(${rgb.join(',')})`;
    },
    
    
    // 获取热力图数据
    async fetchHeatmapData() {
      this.loading = true;
      try {
        // 构建查询参数，使用props中的值
        const params = {};
        
        // 处理年份参数
        if (this.year && this.year !== 'all' && this.year !== '') {
          params.year = parseInt(this.year);
        }
        
        // 处理季节参数
        if (this.season && this.season !== 'all') {
          const seasonMapping = {
            'spring': 0,  // 春季
            'summer': 1,  // 夏季
            'autumn': 2,  // 秋季
            'winter': 3   // 冬季
          };
          params.season = seasonMapping[this.season];
        }
        
        // 处理时间段参数
        if (this.timePeriod && this.timePeriod !== 'all') {
          const timePeriodMapping = {
            'night': 0,           // 夜间
            'morning_peak': 1,    // 早高峰
            'noon_peak': 2,       // 午高峰
            'afternoon': 3,       // 下午
            'evening_peak': 4,    // 晚高峰
            'evening': 5          // 晚上
          };
          params.timePeriod = timePeriodMapping[this.timePeriod];
        }
        
        // 处理日期参数
        if (this.startDate && this.startDate !== '') {
          params.startDate = this.startDate;
        }
        if (this.endDate && this.endDate !== '') {
          params.endDate = this.endDate;
        }
        
        console.log('发送热力图查询请求，参数:', params);
        
        const response = await this.$axios.get('/api/patient-statistics/population-body-heatmap', { params });
        
        console.log('热力图API响应:', response.data);
        
        if (response.data.success) {
          this.bodyPartsData = response.data.data || [];
          console.log('处理后的身体部位数据:', this.bodyPartsData);
          this.calculateSummaryStats();
          this.updateSVGColors();
        } else {
          console.error('API返回错误:', response.data.errorMsg);
          this.$message.error('获取热力图数据失败: ' + (response.data.errorMsg || '未知错误'));
        }
      } catch (error) {
        console.error('获取热力图数据失败:', error);
        this.$message.error('获取热力图数据失败: ' + error.message);
      } finally {
        this.loading = false;
      }
    },
    
    // 计算汇总统计
    calculateSummaryStats() {
      console.log('计算汇总统计，数据:', this.bodyPartsData);
      
      // 计算总患者数（所有部位的患者数之和）
      this.totalPatients = this.bodyPartsData.reduce((sum, part) => {
        const count = parseInt(part.patient_count) || 0;
        console.log(`部位 ${part.body_part}: ${count} 例患者`);
        return sum + count;
      }, 0);
      
      // 计算加权平均严重程度（按患者数加权）
      let totalWeightedSeverity = 0;
      let totalWeight = 0;
      
      this.bodyPartsData.forEach(part => {
        const count = parseInt(part.patient_count) || 0;
        const severity = parseFloat(part.average_severity) || 0;
        
        if (count > 0) {
          totalWeightedSeverity += severity * count;
          totalWeight += count;
        }
      });
      
      this.averageSeverity = totalWeight > 0 ? totalWeightedSeverity / totalWeight : 0;
      
      console.log(`汇总统计: 总患者数=${this.totalPatients}, 平均严重程度=${this.averageSeverity.toFixed(2)}`);
    },
    
    // 更新SVG颜色
    updateSVGColors() {
      if (!this.svgElement) {
        console.log('SVG元素未加载，跳过颜色更新');
        return;
      }

      const levelMap = {
        face: this.getPartSeverity('face'),
        neck: this.getPartSeverity('head_neck'),
        chest: this.getPartSeverity('chest'),
        abdomen: this.getPartSeverity('abdomen'),
        limbs: this.getPartSeverity('limbs'),
        body: this.getPartSeverity('body')
      };

      console.log('更新SVG颜色，严重程度映射:', levelMap);

      for (const part in levelMap) {
        const severity = levelMap[part];
        const color = this.getSeverityColor(severity);
        const elements = this.svgElement.querySelectorAll(`.${part}`);
        
        console.log(`部位 ${part}: 严重程度=${severity}, 颜色=${color}, 元素数量=${elements.length}`);
        
        elements.forEach(el => {
          el.setAttribute('fill', color);
          el.setAttribute('stroke', '#000000');
          el.setAttribute('stroke-width', '2');
        });
      }
    },
    
    // 获取部位严重程度
    getPartSeverity(partKey) {
      const part = this.bodyPartsData.find(p => p.body_part === partKey);
      const severity = part ? parseFloat(part.average_severity) || 0 : 0;
      console.log(`获取部位 ${partKey} 严重程度:`, severity);
      return severity;
    },
    
    // 高亮部位
    highlightPart(partName) {
      this.highlightedPart = partName;
      
      if (this.svgElement && this.svgElement.querySelectorAll) {
        try {
          const elements = this.svgElement.querySelectorAll(`.${partName}`);
          elements.forEach(el => {
            el.style.filter = 'brightness(1.2) drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))';
          });
        } catch (error) {
          console.error("高亮部位时出错:", error);
        }
      }
    },
    
    // 取消高亮
    unhighlightPart() {
      this.highlightedPart = null;
      
      if (this.svgElement && this.svgElement.querySelectorAll) {
        try {
          const elements = this.svgElement.querySelectorAll('*');
          elements.forEach(el => {
            el.style.filter = '';
          });
        } catch (error) {
          console.error("取消高亮时出错:", error);
        }
      }
    },
    
    // 加载SVG
    loadSVG() {
      this.svgLoaded = false;
      const container = this.$refs.svgContainer;
      if (!container) return;

      container.innerHTML = '';
      
      try {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.svgStr;
        const svgEl = tempDiv.querySelector('svg');

        if (!svgEl) {
          console.error("SVG元素未创建成功");
          return;
        }

        svgEl.style.width = '100%';
        svgEl.style.height = '100%';
        svgEl.style.display = 'block';
        svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        this.svgElement = svgEl;
        container.appendChild(svgEl);
        this.svgLoaded = true;
        
        // 绑定事件
        container.addEventListener('mouseover', this.handleSvgMouseOver);
        container.addEventListener('mouseout', this.handleSvgMouseOut);
        
      } catch (e) {
        console.error("加载SVG出错：", e);
        container.innerHTML = '<p class="svg-error">加载人体图失败</p>';
      }
    },
    
    // SVG鼠标悬停事件
    handleSvgMouseOver(event) {
      const target = event.target;
      if (target.classList.contains('face')) {
        this.highlightPart('face');
      } else if (target.classList.contains('neck')) {
        this.highlightPart('head_neck');
      } else if (target.classList.contains('chest')) {
        this.highlightPart('chest');
      } else if (target.classList.contains('abdomen')) {
        this.highlightPart('abdomen');
      } else if (target.classList.contains('limbs')) {
        this.highlightPart('limbs');
      } else if (target.classList.contains('body')) {
        this.highlightPart('body');
      }
    },
    
    // SVG鼠标离开事件
    handleSvgMouseOut() {
      this.unhighlightPart();
    }
  },
  mounted() {
    this.loadSVG();
    // 自动获取数据（通过watch监听器触发）
    this.fetchHeatmapData();
  }
};
</script>

<style scoped>
.population-body-heatmap-widget {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.widget-header {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.widget-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.heatmap-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 500px;
}

.human-figure-container {
  flex: 1;
  min-width: 300px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f9f9f9;
}

.human-figure {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg-placeholder {
  color: #909399;
  font-style: italic;
}

.heatmap-data {
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.data-summary {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #409EFF;
}

.data-summary h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 14px;
}

.summary-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #606266;
  font-size: 13px;
}

.stat-value {
  color: #409EFF;
  font-weight: 600;
  font-size: 14px;
}

.body-parts-data {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 15px;
}

.body-parts-data h4 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 14px;
}

.parts-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.part-item {
  padding: 10px;
  border-radius: 6px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.part-item:hover {
  background-color: #f0f0f0;
}

.part-item.highlighted {
  background-color: #ecf5ff;
  border-color: #409EFF;
}

.part-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.part-name {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

.part-severity {
  font-weight: 600;
  font-size: 14px;
}

.part-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.patient-count {
  color: #606266;
  font-size: 12px;
}

.severity-bar {
  width: 100px;
  height: 4px;
  background-color: #e4e7ed;
  border-radius: 2px;
  overflow: hidden;
}

.severity-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.color-legend {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 15px;
}

.color-legend h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 14px;
}

.legend-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
}

.color-box {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  margin-right: 6px;
}

.level-label {
  font-size: 12px;
  color: #606266;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .heatmap-container {
    flex-direction: column;
  }
  
  .heatmap-data {
    width: 100%;
  }
  
  .legend-items {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
