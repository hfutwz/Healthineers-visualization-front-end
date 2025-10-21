<template>
  <div 
    class="dashboard-widget"
    :class="{ 'widget-dragging': isDragging, 'widget-resizing': isResizing }"
    :style="widgetStyle"
    @mousedown="startDrag"
  >
    <!-- 窗口头部 -->
    <div class="widget-header" @mousedown="startDrag">
      <div class="widget-title">
        <i :class="widgetConfig.icon"></i>
        <span>{{ widgetConfig.title }}</span>
        <div class="widget-status" v-if="widgetConfig.status">
          <div class="status-dot" :class="widgetConfig.status"></div>
        </div>
      </div>
      <div class="widget-controls">
        <button 
          class="control-btn minimize-btn" 
          @click="minimizeWidget"
          title="最小化"
        >
          <i class="el-icon-minus"></i>
        </button>
        <button 
          class="control-btn maximize-btn" 
          @click="maximizeWidget"
          title="最大化"
        >
          <i class="el-icon-full-screen"></i>
        </button>
        <button 
          class="control-btn close-btn" 
          @click="closeWidget"
          title="关闭"
        >
          <i class="el-icon-close"></i>
        </button>
      </div>
    </div>

    <!-- 窗口内容 -->
    <div class="widget-content" :class="{ 'minimized': isMinimized }">
      <!-- 调整大小手柄 -->
      <div class="resize-handles">
        <div class="resize-handle n" @mousedown="startResize('n', $event)"></div>
        <div class="resize-handle s" @mousedown="startResize('s', $event)"></div>
        <div class="resize-handle e" @mousedown="startResize('e', $event)"></div>
        <div class="resize-handle w" @mousedown="startResize('w', $event)"></div>
        <div class="resize-handle ne" @mousedown="startResize('ne', $event)"></div>
        <div class="resize-handle nw" @mousedown="startResize('nw', $event)"></div>
        <div class="resize-handle se" @mousedown="startResize('se', $event)"></div>
        <div class="resize-handle sw" @mousedown="startResize('sw', $event)"></div>
      </div>

      <!-- 实际内容区域 -->
      <div class="widget-body">
        <slot>
          <!-- 默认占位内容 -->
          <div class="widget-placeholder">
            <div class="placeholder-icon">
              <i :class="widgetConfig.icon"></i>
            </div>
            <h3>{{ widgetConfig.title }}</h3>
            <p>{{ widgetConfig.description }}</p>
            <div class="placeholder-actions">
              <el-button type="primary" size="small" @click="configureWidget">
                <i class="el-icon-setting"></i>
                配置组件
              </el-button>
              <el-button size="small" @click="refreshWidget">
                <i class="el-icon-refresh"></i>
                刷新数据
              </el-button>
            </div>
          </div>
        </slot>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="widget-loading">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>

    <!-- 错误状态 -->
    <div v-if="hasError" class="widget-error">
      <i class="el-icon-warning"></i>
      <span>{{ errorMessage }}</span>
      <el-button size="mini" @click="retryLoad">重试</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardWidget',
  props: {
    widgetConfig: {
      type: Object,
      required: true,
      default: () => ({
        id: '',
        title: '未命名组件',
        icon: 'el-icon-s-data',
        description: '这是一个数据可视化组件',
        status: 'normal'
      })
    },
    position: {
      type: Object,
      default: () => ({ x: 0, y: 0 })
    },
    size: {
      type: Object,
      default: () => ({ width: 400, height: 300 })
    },
    zIndex: {
      type: Number,
      default: 10
    }
  },
  
  data() {
    return {
      isDragging: false,
      isResizing: false,
      isMinimized: false,
      isMaximized: false,
      isLoading: false,
      hasError: false,
      errorMessage: '',
      
      // 拖拽相关
      dragStart: { x: 0, y: 0 },
      dragOffset: { x: 0, y: 0 },
      
      // 调整大小相关
      resizeStart: { x: 0, y: 0, width: 0, height: 0 },
      resizeDirection: '',
      
      // 原始位置和大小（用于恢复）
      originalPosition: { x: 0, y: 0 },
      originalSize: { width: 0, height: 0 }
    }
  },
  
  computed: {
    widgetStyle() {
      return {
        position: 'absolute',
        left: `${this.position.x}px`,
        top: `${this.position.y}px`,
        width: `${this.size.width}px`,
        height: `${this.size.height}px`,
        zIndex: this.zIndex,
        transform: this.isMaximized ? 'scale(1.02)' : 'scale(1)',
        transition: this.isDragging || this.isResizing ? 'none' : 'all 0.3s ease'
      }
    }
  },
  
  methods: {
    // 开始拖拽
    startDrag(event) {
      if (event.target.closest('.widget-controls')) return;
      
      this.isDragging = true;
      this.dragStart = { x: event.clientX, y: event.clientY };
      this.dragOffset = {
        x: event.clientX - this.position.x,
        y: event.clientY - this.position.y
      };
      
      this.$emit('widget-drag-start', this.widgetConfig.id);
      event.preventDefault();
    },
    
    // 开始调整大小
    startResize(direction, event) {
      this.isResizing = true;
      this.resizeDirection = direction;
      this.resizeStart = {
        x: event.clientX,
        y: event.clientY,
        width: this.size.width,
        height: this.size.height
      };
      
      event.preventDefault();
      event.stopPropagation();
    },
    
    // 最小化窗口
    minimizeWidget() {
      this.isMinimized = !this.isMinimized;
      this.$emit('widget-minimize', this.widgetConfig.id, this.isMinimized);
    },
    
    // 最大化窗口
    maximizeWidget() {
      if (!this.isMaximized) {
        // 保存原始位置和大小
        this.originalPosition = { ...this.position };
        this.originalSize = { ...this.size };
        
        // 最大化
        this.isMaximized = true;
        this.$emit('widget-maximize', this.widgetConfig.id, true);
      } else {
        // 恢复原始大小
        this.isMaximized = false;
        this.$emit('widget-maximize', this.widgetConfig.id, false);
      }
    },
    
    // 关闭窗口
    closeWidget() {
      this.$emit('widget-close', this.widgetConfig.id);
    },
    
    // 配置组件
    configureWidget() {
      this.$emit('widget-configure', this.widgetConfig.id);
    },
    
    // 刷新数据
    refreshWidget() {
      this.isLoading = true;
      this.hasError = false;
      
      // 模拟数据加载
      setTimeout(() => {
        this.isLoading = false;
        this.$emit('widget-refresh', this.widgetConfig.id);
      }, 1000);
    },
    
    // 重试加载
    retryLoad() {
      this.hasError = false;
      this.refreshWidget();
    },
    
    // 设置错误状态
    setError(message) {
      this.hasError = true;
      this.errorMessage = message;
      this.isLoading = false;
    },
    
    // 清除错误状态
    clearError() {
      this.hasError = false;
      this.errorMessage = '';
    },
    
    // 处理鼠标移动
    handleMouseMove(event) {
      if (this.isDragging) {
        const newX = event.clientX - this.dragOffset.x;
        const newY = event.clientY - this.dragOffset.y;
        
        this.$emit('widget-move', this.widgetConfig.id, {
          x: Math.max(0, newX),
          y: Math.max(0, newY)
        });
      }
      
      if (this.isResizing) {
        this.handleResize(event);
      }
    },
    
    // 处理鼠标释放
    handleMouseUp() {
      if (this.isDragging) {
        this.isDragging = false;
        this.$emit('widget-drag-end', this.widgetConfig.id);
      }
      
      if (this.isResizing) {
        this.isResizing = false;
        this.$emit('widget-resize-end', this.widgetConfig.id);
      }
    },
    
    // 处理调整大小
    handleResize(event) {
      if (!this.isResizing) return;
      
      const deltaX = event.clientX - this.resizeStart.x;
      const deltaY = event.clientY - this.resizeStart.y;
      
      let newWidth = this.resizeStart.width;
      let newHeight = this.resizeStart.height;
      
      if (this.resizeDirection.includes('right')) {
        newWidth = Math.max(200, this.resizeStart.width + deltaX);
      }
      if (this.resizeDirection.includes('bottom')) {
        newHeight = Math.max(150, this.resizeStart.height + deltaY);
      }
      
      this.$emit('widget-resize', this.widgetConfig.id, {
        width: newWidth,
        height: newHeight
      });
    }
  },
  
  mounted() {
    // 添加全局事件监听
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  },
  
  beforeDestroy() {
    // 移除全局事件监听
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }
}
</script>

<style scoped>
.dashboard-widget {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;
  user-select: none;
}

.dashboard-widget:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.dashboard-widget.widget-dragging {
  z-index: 1000;
  transform: rotate(1deg) scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.dashboard-widget.widget-resizing {
  z-index: 999;
}

/* 窗口头部 */
.widget-header {
  height: 40px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  cursor: move;
  position: relative;
}

.widget-title {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 14px;
  flex: 1;
}

.widget-title i {
  margin-right: 8px;
  font-size: 16px;
}

.widget-status {
  margin-left: 10px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.normal {
  background: #27ae60;
}

.status-dot.warning {
  background: #f39c12;
}

.status-dot.error {
  background: #e74c3c;
}

.widget-controls {
  display: flex;
  gap: 2px;
}

.control-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.close-btn:hover {
  background: #e74c3c;
}

/* 窗口内容 */
.widget-content {
  height: calc(100% - 40px);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.widget-content.minimized {
  height: 0;
  overflow: hidden;
}

.widget-body {
  height: 100%;
  padding: 20px;
  overflow: auto;
}

/* 调整大小手柄 */
.resize-handles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  background: transparent;
  pointer-events: all;
}

.resize-handle.n {
  top: -3px;
  left: 0;
  right: 0;
  height: 6px;
  cursor: n-resize;
}

.resize-handle.s {
  bottom: -3px;
  left: 0;
  right: 0;
  height: 6px;
  cursor: s-resize;
}

.resize-handle.e {
  top: 0;
  bottom: 0;
  right: -3px;
  width: 6px;
  cursor: e-resize;
}

.resize-handle.w {
  top: 0;
  bottom: 0;
  left: -3px;
  width: 6px;
  cursor: w-resize;
}

.resize-handle.ne {
  top: -3px;
  right: -3px;
  width: 6px;
  height: 6px;
  cursor: ne-resize;
}

.resize-handle.nw {
  top: -3px;
  left: -3px;
  width: 6px;
  height: 6px;
  cursor: nw-resize;
}

.resize-handle.se {
  bottom: -3px;
  right: -3px;
  width: 6px;
  height: 6px;
  cursor: se-resize;
}

.resize-handle.sw {
  bottom: -3px;
  left: -3px;
  width: 6px;
  height: 6px;
  cursor: sw-resize;
}

/* 占位内容 */
.widget-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #666;
}

.placeholder-icon {
  font-size: 48px;
  color: #bdc3c7;
  margin-bottom: 20px;
}

.placeholder-icon i {
  display: block;
}

.widget-placeholder h3 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 10px;
}

.widget-placeholder p {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 20px;
}

.placeholder-actions {
  display: flex;
  gap: 10px;
}

/* 加载状态 */
.widget-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.widget-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  color: #e74c3c;
}

.widget-error i {
  font-size: 48px;
  margin-bottom: 15px;
}

.widget-error span {
  margin-bottom: 15px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .widget-controls {
    gap: 1px;
  }
  
  .control-btn {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }
}
</style>
