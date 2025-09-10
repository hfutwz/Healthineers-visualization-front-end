<template>
  <transition name="modal-fade">
    <div class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <!-- 标题和关闭按钮 -->
        <div class="modal-header">
          <h3>病人受伤人体图 (ID: {{ patient.patientId }})</h3>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>加载伤情信息中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-container">
          <p>⚠️ {{ errorMessage }}</p>
          <button @click="fetchInjuryData">重试</button>
        </div>

        <!-- 内容区域 -->
        <div v-else class="modal-body">
          <!-- 受伤等级展示 -->
          <div class="injury-summary">
            <div class="severity-indicator" :class="'severity-' + injurySeverity">
            <div class="severity-info">
                <span class="severity-text">损伤等级：{{ severityText }}</span>
                <span class="iss-score">ISS评分：{{ issScore }}</span>
            </div>
            </div>
            
            <div class="color-legend">
              <h4>创伤等级颜色指示</h4>
              <div class="legend-items">
                <div v-for="i in 7" :key="i" class="legend-item">
                  <span class="color-box" :style="{ backgroundColor: getGradientColor(i-1) }"></span>
                  <span class="level-label">等级 {{ i-1 }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- SVG人体图和部位详情 -->
          <div class="injury-details">
            <div class="svg-container">
              <!-- 修复：添加明确的尺寸和边框用于调试 -->
              <div ref="svgContainer" class="human-figure" style="min-height: 300px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center;">
                <p v-if="!svgLoaded" class="svg-placeholder">加载人体图中...</p>
              </div>
            </div>
            
            <div class="injury-levels">
              <div 
                v-for="(level, part) in injuryLevels" 
                :key="part" 
                class="injury-item"
                :class="{ highlighted: highlightedPart === part }"
                @mouseenter="highlightPart(part)"
                @mouseleave="unhighlightPart"
              >
                <span class="part-name">{{ partNames[part] }}:</span>
                <span class="part-level" :style="{ color: getGradientColor(level) }">
                  {{ level }} ({{ getLevelDescription(level) }})
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-close" @click="closeModal">关闭</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    patient: {
      type: Object,
      required: true,
      validator: value => {
        return value && value.patientId;
      }
    }
  },
  data() {
    return {
      injuryLevels: {
        neck: 0,
        face: 0,
        chest: 0,
        abdomen: 0,
        limbs: 0,
        body: 0
      },
      issScore: null,
      injurySeverity: 0,
      loading: true,
      error: false,
      errorMessage: '',
      highlightedPart: null,
      svgLoaded: false, // 新增：跟踪SVG加载状态
      // SVG字符串占位符 - 实际使用时替换为完整SVG
      svgStr: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <!-- 简化的SVG内容，实际使用时替换为完整SVG -->
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
        neck: '头颈部',
        face: '面部',
        chest: '胸部',
        abdomen: '腹部',
        limbs: '四肢',
        body: '体表'
      }
    };
  },
  computed: {
    severityText() {
      const texts = ['轻伤', '重伤', '严重'];
      return texts[this.injurySeverity] || '未知';
    }
  },
  methods: {
    getGradientColor(level) {
      const startColor = [255, 255, 255]; // 白色
      const endColor = [139, 0, 0]; // 深红色
      const levelsCount = 7; // 0-6
      const factor = level / (levelsCount - 1);
      const rgb = startColor.map((c, i) => Math.round(c + (endColor[i] - c) * factor));
      return `rgb(${rgb.join(',')})`;
    },
    getLevelDescription(level) {
      const descriptions = ['无', '轻微', '轻度', '中度', '较重', '严重', '危重'];
      return descriptions[level] || '未知';
    },
    closeModal() {
      this.$emit('close');
    },
    loadAndColorSVG() {
      const container = this.$refs.svgContainer;
      if (!container) {
        console.error("SVG容器未找到");
        return;
      }
      
      try {
        // 插入SVG字符串
        container.innerHTML = this.svgStr;
        const svgEl = container.querySelector('svg');
        
        if (!svgEl) {
          console.error("SVG元素未创建成功");
          return;
        }

        // 设置SVG样式 - 修复：确保SVG有明确的尺寸
        svgEl.style.width = '100%';
        svgEl.style.height = '100%';
        svgEl.style.display = 'block';
        svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        const getItemColor = (level) => {
          return this.getGradientColor(level);
        };

        // 定义各部位对应的class名
        const parts = [
          { className: 'face', level: this.injuryLevels.face },
          { className: 'neck', level: this.injuryLevels.neck },
          { className: 'chest', level: this.injuryLevels.chest },
          { className: 'abdomen', level: this.injuryLevels.abdomen },
          { className: 'limbs', level: this.injuryLevels.limbs },
          { className: 'body', level: this.injuryLevels.body }
        ];

        parts.forEach(part => {
          const elements = svgEl.querySelectorAll(`.${part.className}`);
          elements.forEach(el => {
            el.setAttribute('fill', getItemColor(part.level));
            // 添加交互效果
            el.addEventListener('mouseenter', () => this.highlightPart(part.className));
            el.addEventListener('mouseleave', this.unhighlightPart);
          }); 
        });
        
        this.svgLoaded = true;
        console.log("SVG加载完成");
      } catch (e) {
        console.error("加载SVG时出错:", e);
      }
    },
    fetchInjuryData() {
      this.loading = true;
      this.error = false;
      this.svgLoaded = false;
      
      // 发送请求
      this.$axios.get(`/api/iss/injury/${this.patient.patientId}`)
        .then(res => {
          const data = res.data.data;
          if (data) {
            this.injuryLevels.neck = data.headNeck;
            this.injuryLevels.face = data.face;
            this.injuryLevels.chest = data.chest;
            this.injuryLevels.abdomen = data.abdomen;
            this.injuryLevels.limbs = data.limbs;
            this.injuryLevels.body = data.body;
            this.injurySeverity = data.injurySeverity;
            this.issScore = data.issScore; 
            
            // 修复：确保DOM更新完成后再加载SVG
            this.$nextTick(() => {
              setTimeout(() => {
                this.loadAndColorSVG();
              }, 100);
            });
          } else {
            this.error = true;
            this.errorMessage = '未找到该患者的创伤信息';
          }
          this.loading = false;
        })
        .catch(err => {
          console.error('请求伤情信息失败', err);
          this.error = true;
          this.errorMessage = '获取创伤信息失败，请检查网络连接';
          this.loading = false;
        });
    },
    highlightPart(part) {
      this.highlightedPart = part;
      
      // 高亮SVG中的对应部位
      const svgEl = this.$refs.svgContainer.querySelector('svg');
      if (svgEl) {
        const elements = svgEl.querySelectorAll(`.${part}`);
        elements.forEach(el => {
          el.style.filter = 'brightness(1.2) drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))';
        });
      }
    },
    unhighlightPart() {
      this.highlightedPart = null;
      
      // 移除SVG高亮
      const svgEl = this.$refs.svgContainer.querySelector('svg');
      if (svgEl) {
        const elements = svgEl.querySelectorAll('*');
        elements.forEach(el => {
          el.style.filter = '';
        });
      }
    }
  },
  mounted() {
    this.fetchInjuryData();
  },
  watch: {
    patient: {
      handler() {
        this.fetchInjuryData();
      },
      deep: true
    }
  }
};
</script>

<style scoped>
/* 弹窗遮罩样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* 弹窗内容样式 */
.modal-content {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* 弹窗头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.4rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

/* 弹窗主体 */
.modal-body {
  padding: 20px;
  flex: 1;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.error-container {
  text-align: center;
  padding: 40px;
}

.error-container p {
  color: #e74c3c;
  margin-bottom: 20px;
}

/* 受伤摘要 */
.injury-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.severity-indicator {
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: bold;
  color: white;
}

.severity-0 { background-color: #2ecc71; }
.severity-1 { background-color: #f39c12; }
.severity-2 { background-color: #e74c3c; }
.severity-3 { background-color: #8e44ad; }

/* 颜色图例 */
.color-legend {
  background: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
}

.color-legend h4 {
  margin: 0 0 10px 0;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.color-box {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  margin-right: 5px;
  border: 1px solid #ddd;
}

.level-label {
  font-size: 0.8rem;
  color: #555;
}

/* 受伤详情区域 */
.injury-details {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.svg-container {
  flex: 1;
  min-width: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 修复：确保SVG容器有明确的尺寸 */
.human-figure {
  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.svg-placeholder {
  color: #999;
  font-style: italic;
}

.injury-levels {
  flex: 1;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.injury-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  border-radius: 6px;
  background-color: #f9f9f9;
  transition: all 0.2s ease;
}

.injury-item.highlighted {
  background-color: #e3f2fd;
  transform: translateX(5px);
}

.part-name {
  font-weight: bold;
  color: #34495e;
}

.part-level {
  font-weight: bold;
}

/* 弹窗底部 */
.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  text-align: right;
}

.btn-close {
  padding: 8px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.btn-close:hover {
  background-color: #2980b9;
}

/* 动画效果 */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter, .modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
  transition: transform 0.3s;
}

.modal-fade-enter .modal-content,
.modal-fade-leave-to .modal-content {
  transform: scale(0.95);
}
.severity-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 0.9rem;
  font-weight: normal;
  color: #fff;
  margin-top: 5px;
}

.severity-text {
  font-weight: bold;
  margin-bottom: 3px;
}

.iss-score {
  font-size: 0.85rem;
  color: #eee;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .injury-summary {
    flex-direction: column;
    align-items: stretch;
  }
  
  .injury-details {
    flex-direction: column;
  }
  
  .svg-container {
    order: 2;
  }
  
  .injury-levels {
    order: 1;
  }
  
  .human-figure {
    height: 250px;
  }
}
</style>