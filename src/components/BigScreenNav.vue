<template>
  <div class="bigscreen-nav">
    <div class="nav-container">
      <div class="nav-item" :class="{ active: currentRoute === 'MapPage' }" @click="navigateTo('/')">
        <i class="el-icon-location"></i>
        <span>地图热力图</span>
      </div>
      
      <div class="nav-item" :class="{ active: currentRoute === 'Dashboard' }" @click="navigateTo('/dashboard')">
        <i class="el-icon-s-data"></i>
        <span>数据驾驶舱</span>
      </div>
      
      <div class="nav-item" :class="{ active: currentRoute === 'BigScreenDashboard' }" @click="navigateTo('/bigscreen')">
        <i class="el-icon-monitor"></i>
        <span>大屏展示</span>
      </div>
      
      <div class="nav-item" :class="{ active: currentRoute === 'HourlyStatistics' }" @click="navigateTo('/hourly')">
        <i class="el-icon-time"></i>
        <span>小时统计</span>
      </div>
      
      <div class="nav-item" :class="{ active: currentRoute === 'DataVisualizationDashboard' }" @click="navigateTo('/data-visualization')">
        <i class="el-icon-pie-chart"></i>
        <span>数据展板</span>
      </div>
    </div>
    
    <div class="nav-indicator" :style="{ left: indicatorPosition + 'px' }"></div>
  </div>
</template>

<script>
export default {
  name: 'BigScreenNav',
  data() {
    return {
      currentRoute: '',
      indicatorPosition: 0
    }
  },
  mounted() {
    this.updateCurrentRoute();
    this.updateIndicatorPosition();
  },
  watch: {
    $route: {
      handler() {
        this.updateCurrentRoute();
        this.updateIndicatorPosition();
      },
      immediate: true
    }
  },
  methods: {
    navigateTo(path) {
      this.$router.push(path);
    },
    
    updateCurrentRoute() {
      this.currentRoute = this.$route.name;
    },
    
    updateIndicatorPosition() {
      const activeIndex = this.getActiveIndex();
      const navItemWidth = 120; // 每个导航项的宽度
      this.indicatorPosition = activeIndex * navItemWidth;
    },
    
    getActiveIndex() {
      const routes = ['MapPage', 'Dashboard', 'BigScreenDashboard', 'HourlyStatistics', 'DataVisualizationDashboard'];
      return routes.indexOf(this.currentRoute);
    }
  }
}
</script>

<style scoped>
.bigscreen-nav {
  position: fixed;
  top: 20px;
  right: 30px;
  z-index: 2000;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.nav-container {
  display: flex;
  position: relative;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 60px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #94a3b8;
  position: relative;
  z-index: 2;
}

.nav-item:hover {
  color: #ffffff;
  background: rgba(59, 130, 246, 0.1);
}

.nav-item.active {
  color: #ffffff;
  background: rgba(59, 130, 246, 0.2);
}

.nav-item i {
  font-size: 20px;
  margin-bottom: 4px;
}

.nav-item span {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

.nav-indicator {
  position: absolute;
  top: 8px;
  width: 120px;
  height: 60px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(30, 58, 138, 0.3));
  border-radius: 8px;
  transition: left 0.3s ease;
  z-index: 1;
}

/* 响应式设计 */
@media (min-width: 1920px) {
  .nav-item {
    width: 140px;
    height: 70px;
  }
  
  .nav-item i {
    font-size: 22px;
  }
  
  .nav-item span {
    font-size: 13px;
  }
  
  .nav-indicator {
    width: 140px;
    height: 70px;
  }
}

@media (min-width: 2560px) {
  .nav-item {
    width: 160px;
    height: 80px;
  }
  
  .nav-item i {
    font-size: 24px;
  }
  
  .nav-item span {
    font-size: 14px;
  }
  
  .nav-indicator {
    width: 160px;
    height: 80px;
  }
}

@media (min-width: 3840px) {
  .nav-item {
    width: 180px;
    height: 90px;
  }
  
  .nav-item i {
    font-size: 26px;
  }
  
  .nav-item span {
    font-size: 15px;
  }
  
  .nav-indicator {
    width: 180px;
    height: 90px;
  }
}
</style>
