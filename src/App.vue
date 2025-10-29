<template>
  <div id="app">
    <!-- 导航菜单 -->
    <nav class="main-nav" v-if="showNavigation">
      <div class="nav-container">
        <div class="nav-brand">
          <i class="el-icon-s-data"></i>
          <span>医院创伤数据可视化系统</span>
        </div>
        <div class="nav-menu">
          <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
            <i class="el-icon-location"></i>
            <span>地图热力图</span>
          </router-link>
          <router-link to="/bigscreen" class="nav-item" :class="{ active: $route.path === '/bigscreen' }">
            <i class="el-icon-monitor"></i>
            <span>后台可视化大屏</span>
          </router-link>
          <router-link to="/patient-list" class="nav-item" :class="{ active: $route.path === '/patient-list' }">
            <i class="el-icon-user"></i>
            <span>病人详情信息</span>
          </router-link>
          <router-link to="/hourly" class="nav-item" :class="{ active: $route.path === '/hourly' }">
            <i class="el-icon-time"></i>
            <span>每小时患者数量</span>
          </router-link>
          <router-link to="/monthly-heatmap" class="nav-item" :class="{ active: $route.path === '/monthly-heatmap' }">
            <i class="el-icon-date"></i>
            <span>每月地图热力图</span>
          </router-link>
        </div>
        <div class="nav-actions">
          <el-button size="small" @click="toggleFullscreen">
            <i :class="showNavigation ? 'el-icon-full-screen' : 'el-icon-copy-document'"></i>
          </el-button>
          <el-button size="small" @click="showSettings">
            <i class="el-icon-setting"></i>
          </el-button>
        </div>
      </div>
    </nav>
    
    <!-- 主要内容区域 -->
    <main class="main-content" :class="{ 'with-nav': showNavigation }">
      <!-- 全屏模式下的退出按钮 -->
      <div v-if="!showNavigation" class="exit-fullscreen-btn" @click="toggleFullscreen">
        <i class="el-icon-copy-document"></i>
        <span>退出全屏</span>
      </div>
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      showNavigation: true
    }
  },
  mounted() {
    // 添加键盘事件监听
    document.addEventListener('keydown', this.handleKeydown);
  },
  beforeDestroy() {
    // 移除键盘事件监听
    document.removeEventListener('keydown', this.handleKeydown);
  },
  methods: {
    toggleFullscreen() {
      this.showNavigation = !this.showNavigation;
    },
    showSettings() {
      this.$message.info('设置功能开发中...');
    },
    handleKeydown(event) {
      // ESC键退出全屏
      if (event.key === 'Escape' && !this.showNavigation) {
        this.showNavigation = true;
      }
    }
  }
}
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  background: #f5f7fa;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 导航菜单样式 */
.main-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
}

.nav-brand {
  display: flex;
  align-items: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
  text-decoration: none;
}

.nav-brand i {
  font-size: 24px;
  margin-right: 10px;
  color: #fff;
}

.nav-menu {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateY(-1px);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav-item i {
  margin-right: 8px;
  font-size: 16px;
}

.nav-actions {
  display: flex;
  gap: 10px;
}

.nav-actions .el-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  transition: all 0.3s ease;
}

.nav-actions .el-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  min-height: calc(100vh - 60px);
}

.main-content.with-nav {
  min-height: calc(100vh - 60px);
}

/* 退出全屏按钮样式 */
.exit-fullscreen-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 9999;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.exit-fullscreen-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.exit-fullscreen-btn i {
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 15px;
    flex-wrap: wrap;
    height: auto;
    min-height: 60px;
  }
  
  .nav-menu {
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: 10px;
    gap: 10px;
  }
  
  .nav-actions {
    order: 2;
  }
  
  .nav-brand {
    order: 1;
    font-size: 16px;
  }
  
  .nav-item {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .main-content.with-nav {
    min-height: calc(100vh - 80px);
  }
}

@media (max-width: 480px) {
  .nav-container {
    flex-direction: column;
    height: auto;
    padding: 10px 15px;
  }
  
  .nav-menu {
    order: 2;
    width: 100%;
    justify-content: space-around;
    margin: 10px 0;
  }
  
  .nav-actions {
    order: 3;
    width: 100%;
    justify-content: center;
  }
  
  .nav-brand {
    order: 1;
    margin-bottom: 10px;
  }
}
</style>
