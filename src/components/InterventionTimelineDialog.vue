<template>
  <el-dialog
    :visible="true"
    width="900px"
    :before-close="handleClose"
    title="干预时间线"
    custom-class="intervention-timeline-dialog"
  >
    <!-- 头部：患者信息 -->
    <div class="patient-header">
      <div class="patient-basic-info">
        <h3>患者干预时间线</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">患者ID:</span>
            <span class="value">{{ localData.patientId || '未知' }}</span>
          </div>
          <div class="info-item">
            <span class="label">接诊日期:</span>
            <span class="value">{{ formatDate(localData.admissionDate) }}</span>
          </div>
          <div class="info-item">
            <span class="label">总干预项:</span>
            <span class="value">{{ timelineEvents.length }} 项</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 时间线内容 -->
    <div class="timeline-container">
      <div class="timeline-scroll">
        <el-timeline class="timeline" v-if="timelineEvents.length > 0">
          <el-timeline-item
            v-for="(event, index) in timelineEvents"
            :key="index"
            :timestamp="formatTime(event.time)"
            :color="event.color"
            :type="event.type"
            placement="top"
          >
            <el-card 
              :class="['event-card', `event-${event.type}`]"
              shadow="hover"
              @click.native="onItemClick(event)"
            >
              <div class="event-content">
                <div class="event-icon">
                  <i :class="event.icon"></i>
                </div>
                <div class="event-details">
                  <h4>{{ event.label }}</h4>
                  <p>{{ event.description || '点击查看详情' }}</p>
                </div>
                <div class="event-time">
                  {{ formatTime(event.time) }}
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
        
        <div v-else class="no-data">
          <i class="el-icon-time no-data-icon"></i>
          <p>暂无干预时间数据</p>
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="exportTimeline">导出时间线</el-button>
    </span>

    <!-- 详情弹窗 -->
    <el-dialog
      :visible.sync="detailVisible"
      width="500px"
      :title="selectedEvent ? selectedEvent.label : '干预详情'"
      append-to-body
    >
      <div v-if="selectedEvent" class="event-detail">
        <div class="detail-item">
          <span class="detail-label">干预类型:</span>
          <span class="detail-value">{{ selectedEvent.label }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">执行时间:</span>
          <span class="detail-value">{{ formatTime(selectedEvent.time) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">状态:</span>
          <el-tag :type="selectedEvent.type" size="small">
            {{ getStatusText(selectedEvent.type) }}
          </el-tag>
        </div>
        <div class="detail-item full-width">
          <span class="detail-label">备注:</span>
          <span class="detail-value">{{ selectedEvent.notes || '无备注信息' }}</span>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </el-dialog>
</template>

<script>
export default {
  name: 'InterventionTimelineDialog',
  props: {
    localData: {
      type: Object,
      default: () => ({}),
    }
  },
  data() {
    return {
      detailVisible: false,
      selectedEvent: null,
      
      eventList: [
        { label: '入室时间', key: 'admissionTime', color: '#409EFF', icon: 'el-icon-office-building', type: 'primary', description: '患者进入抢救室的时间' },
        { label: '外周静脉', key: 'peripheral', color: '#67C23A', icon: 'el-icon-first-aid-kit', type: 'success', description: '外周静脉通路建立时间' },
        { label: '深静脉', key: 'ivLine', color: '#67C23A', icon: 'el-icon-first-aid-kit', type: 'success', description: '深静脉通路建立时间' },
        { label: '骨通道', key: 'centralAccess', color: '#67C23A', icon: 'el-icon-set-up', type: 'success', description: '骨通道建立时间' },
        { label: '鼻导管', key: 'nasalPipe', color: '#67C23A', icon: 'el-icon-wind-power', type: 'success', description: '鼻导管给氧开始时间' },
        { label: '面罩', key: 'faceMask', color: '#67C23A', icon: 'el-icon-mask', type: 'success', description: '面罩给氧开始时间' },
        { label: '气管插管', key: 'endotrachealTube', color: '#E6A23C', icon: 'el-icon-help', type: 'warning', description: '气管插管开始时间' },
        { label: '呼吸机', key: 'ventilator', color: '#E6A23C', icon: 'el-icon-c-scale-to-original', type: 'warning', description: '呼吸机使用开始时间' },
        { label: '心肺复苏开始', key: 'cprStartTime', color: '#F56C6C', icon: 'el-icon-first-aid-kit', type: 'danger', description: '心肺复苏开始时间' },
        { label: '心肺复苏结束', key: 'cprEndTime', color: '#F56C6C', icon: 'el-icon-first-aid-kit', type: 'danger', description: '心肺复苏结束时间' },
        { label: 'B超', key: 'ultrasound', color: '#909399', icon: 'el-icon-video-camera', type: 'info', description: 'B超检查时间' },
        { label: 'CT', key: 'CT', color: '#909399', icon: 'el-icon-camera', type: 'info', description: 'CT检查时间' },
        { label: '止血带', key: 'tourniquet', color: '#E6A23C', icon: 'el-icon-warning-outline', type: 'warning', description: '止血带使用时间' },
        { label: '采血', key: 'bloodDraw', color: '#F56C6C', icon: 'el-icon-document', type: 'danger', description: '采血时间' },
        { label: '导尿', key: 'catheter', color: '#67C23A', icon: 'el-icon-connection', type: 'success', description: '导尿操作时间' },
        { label: '胃管', key: 'gastricTube', color: '#67C23A', icon: 'el-icon-food', type: 'success', description: '胃管置入时间' },
        { label: '输血开始', key: 'transfusionStart', color: '#F56C6C', icon: 'el-icon-watermelon', type: 'danger', description: '输血开始时间' },
        { label: '输血结束', key: 'transfusionEnd', color: '#F56C6C', icon: 'el-icon-watermelon', type: 'danger', description: '输血结束时间' },
        { label: '离开抢救室', key: 'leaveSurgeryTime', color: '#409EFF', icon: 'el-icon-position', type: 'primary', description: '离开抢救室时间' }
      ]
    };
  },
  computed: {
    timelineEvents() {
      const events = [];
      const d = this.localData;
      
      this.eventList.forEach(item => {
        const timeValue = d[item.key];
        if (timeValue) {
          events.push({
            label: item.label,
            time: timeValue,
            color: item.color,
            icon: item.icon,
            type: item.type,
            description: item.description,
            key: item.key,
            notes: this.getEventNotes(item.key)
          });
        }
      });
      
      // 按时间排序
      return events.sort((a, b) => {
        return this.parseTimeString(a.time) - this.parseTimeString(b.time);
      });
    }
  },
  methods: {
    // 格式化时间（将1530转换为15:30）
    formatTime(timeStr) {
      if (!timeStr) return '未采集';
      
      const str = timeStr.toString().padStart(4, '0');
      return `${str.substring(0, 2)}:${str.substring(2, 4)}`;
    },
    
    // 解析时间字符串为数字（用于排序）
    parseTimeString(timeStr) {
      return parseInt(timeStr || '0');
    },
    
    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return '未知';
      return dateStr;
    },
    
    // 获取事件备注
    getEventNotes(key) {
      // 这里可以根据key返回不同的备注信息
      const notesMap = {
        'cprStartTime': '心肺复苏持续时间约25分钟',
        'transfusionStart': '输注O型红细胞2单位'
      };
      return notesMap[key] || null;
    },
    
    // 获取状态文本
    getStatusText(type) {
      const statusMap = {
        'primary': '进行中',
        'success': '已完成',
        'warning': '注意',
        'danger': '紧急',
        'info': '检查'
      };
      return statusMap[type] || '未知';
    },
    
    // 初始化时间线
    initTimeline() {
      // 计算逻辑已移至computed属性
    },
    
    handleClose() {
      this.$emit('close');
    },
    
    onItemClick(event) {
      this.selectedEvent = event;
      this.detailVisible = true;
    },
    
    exportTimeline() {
      this.$message.success('时间线导出功能开发中...');
    }
  }
}
</script>

<style scoped>
.intervention-timeline-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.patient-header {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.patient-basic-info h3 {
  margin: 0 0 15px 0;
  color: #303133;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.value {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.timeline-container {
  padding: 0 20px;
  max-height: 400px;
  overflow-y: auto;
}

.timeline-scroll {
  padding: 10px 0;
}

.event-card {
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 10px;
  border-left: 4px solid transparent;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.event-primary {
  border-left-color: #409EFF;
}

.event-success {
  border-left-color: #67C23A;
}

.event-warning {
  border-left-color: #E6A23C;
}

.event-danger {
  border-left-color: #F56C6C;
}

.event-info {
  border-left-color: #909399;
}

.event-content {
  display: flex;
  align-items: center;
  padding: 5px 0;
}

.event-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
}

.event-primary .event-icon {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.event-success .event-icon {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.event-warning .event-icon {
  background-color: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.event-danger .event-icon {
  background-color: rgba(245, 108, 108, 0.1);
  color: #F56C6C;
}

.event-info .event-icon {
  background-color: rgba(144, 147, 153, 0.1);
  color: #909399;
}

.event-details {
  flex: 1;
}

.event-details h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #303133;
}

.event-details p {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.event-time {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
  flex-shrink: 0;
  margin-left: 10px;
}

.no-data {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}

.no-data-icon {
  font-size: 50px;
  margin-bottom: 15px;
  opacity: 0.5;
}

.no-data p {
  margin: 0;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 详情弹窗样式 */
.event-detail {
  padding: 10px 0;
}

.detail-item {
  display: flex;
  margin-bottom: 15px;
  align-items: center;
}

.detail-item.full-width {
  flex-direction: column;
  align-items: flex-start;
}

.detail-label {
  width: 80px;
  font-weight: 500;
  color: #606266;
  flex-shrink: 0;
}

.detail-value {
  color: #303133;
}

/* 滚动条样式 */
.timeline-container::-webkit-scrollbar {
  width: 6px;
}

.timeline-container::-webkit-scrollbar-thumb {
  background-color: #c0c4cc;
  border-radius: 3px;
}

.timeline-container::-webkit-scrollbar-thumb:hover {
  background-color: #909399;
}
</style>

<style>
/* 全局样式调整 */
.intervention-timeline-dialog .el-dialog__header {
  background: linear-gradient(135deg, #409EFF 0%, #64b5ff 100%);
  padding: 15px 20px;
}

.intervention-timeline-dialog .el-dialog__title {
  color: white;
  font-weight: 600;
}

.intervention-timeline-dialog .el-dialog__headerbtn {
  top: 15px;
}

.intervention-timeline-dialog .el-dialog__headerbtn .el-dialog__close {
  color: white;
}

.intervention-timeline-dialog .el-timeline-item__node {
  width: 16px;
  height: 16px;
}

.intervention-timeline-dialog .el-timeline-item__timestamp {
  font-size: 13px;
  font-weight: 500;
  color: #409EFF;
}
</style>