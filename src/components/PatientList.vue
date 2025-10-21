<template>
  <div>
    <!-- 查询条件区域 -->
    <div class="search-form">
      <div class="form-row">
        <div class="form-group">
          <label>患者ID：</label>
          <input v-model="searchForm.patientId" type="number" placeholder="请输入患者ID" />
        </div>
        <div class="form-group">
          <label>性别：</label>
          <select v-model="searchForm.gender">
            <option value="">全部</option>
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </div>
        <div class="form-group">
          <label>年龄范围：</label>
          <input v-model="searchForm.minAge" type="number" placeholder="最小年龄" />
          <span>-</span>
          <input v-model="searchForm.maxAge" type="number" placeholder="最大年龄" />
        </div>
        <div class="form-group">
          <button @click="searchPatients" class="search-btn">查询</button>
          <button @click="resetSearch" class="reset-btn">重置</button>
          <button @click="showImportModal" class="import-btn">批量导入</button>
        </div>
      </div>
    </div>

    <!-- 患者列表表格 -->
    <table class="patient-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>年龄</th>
          <th>性别</th>
          <th>身高</th>
          <th>体重</th>
          <th>绿色通道</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="patient in patients" :key="patient.patientId">
          <td>{{ patient.patientId }}</td>
          <td>{{ patient.age }}</td>
          <td>{{ patient.gender }}</td>
          <td>{{ patient.height }}</td>
          <td>{{ patient.weight }}</td>
          <td>{{ patient.isGreenChannel ? '是' : '否' }}</td>
          <td>
            <button @click="showInjuryModal(patient)">查看受伤程度</button>
            <button @click="fetchInterventionData(patient)">查看干预时间</button>
            <button @click="showGcsModal(patient)">GCS评分</button>
            <button @click="showRtsModal(patient)">RTS评分</button>
            <button @click="showOnAdmissionModal(patient)">入室前信息</button>
            <button @click="showOffAdmissionModal(patient)">离室后信息</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 分页组件 -->
    <div class="pagination">
      <div class="pagination-info">
        共 {{ total }} 条记录，第 {{ current }} / {{ pages }} 页
      </div>
      <div class="pagination-controls">
        <button 
          @click="goToPage(1)" 
          :disabled="current === 1"
          class="page-btn"
        >
          首页
        </button>
        <button 
          @click="goToPage(current - 1)" 
          :disabled="current === 1"
          class="page-btn"
        >
          上一页
        </button>
        <span class="page-numbers">
          <button 
            v-for="page in visiblePages" 
            :key="page"
            @click="goToPage(page)"
            :class="['page-btn', { active: page === current }]"
          >
            {{ page }}
          </button>
        </span>
        <button 
          @click="goToPage(current + 1)" 
          :disabled="current === pages"
          class="page-btn"
        >
          下一页
        </button>
        <button 
          @click="goToPage(pages)" 
          :disabled="current === pages"
          class="page-btn"
        >
          末页
        </button>
      </div>
    </div>

    <!-- 受伤弹窗 -->
    <InjuryFigureModal
      v-if="showModal"
      :patient="currentPatient"
      @close="closeModal"
    />

    <!-- 时间线弹窗 -->
    <intervention-timeline-dialog
      v-if="showTimeline"
      :patient-id="selectedPatientData.patientId"
      @close="closeTimeline"
    />

    <!-- GCS评分弹窗 -->
    <GcsScoreModal
      v-if="showGcsModalFlag"
      :patient="currentGcsPatient"
      @close="closeGcsModal"
    />

    <!-- RTS评分弹窗 -->
    <RtsScoreModal
      v-if="showRtsModalFlag"
      :patient="currentRtsPatient"
      @close="closeRtsModal"
    />

    <!-- 入室前信息弹窗 -->
    <PatientOnAdmissionModal
      v-if="showOnAdmissionModalFlag"
      :patient="currentOnAdmissionPatient"
      @close="closeOnAdmissionModal"
    />

    <!-- 离室后信息弹窗 -->
    <PatientOffAdmissionModal
      v-if="showOffAdmissionModalFlag"
      :patient="currentOffAdmissionPatient"
      @close="closeOffAdmissionModal"
    />

    <!-- 批量导入弹窗 -->
    <div v-if="showImportModalFlag" class="modal-overlay" @click="closeImportModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>批量导入患者信息</h3>
          <button @click="closeImportModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="upload-area" 
               @dragover.prevent 
               @drop.prevent="handleFileDrop"
               :class="{ 'drag-over': isDragOver }"
               @dragenter="isDragOver = true"
               @dragleave="isDragOver = false">
            <input 
              ref="fileInput" 
              type="file" 
              accept=".xlsx,.xls" 
              @change="handleFileSelect"
              style="display: none"
            />
            <div v-if="!selectedFile" class="upload-placeholder">
              <i class="upload-icon">📁</i>
              <p>点击选择文件或拖拽文件到此处</p>
              <p class="upload-hint">支持 .xlsx 和 .xls 格式</p>
            </div>
            <div v-else class="file-info">
              <i class="file-icon">📄</i>
              <div class="file-details">
                <p class="file-name">{{ selectedFile.name }}</p>
                <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
              <button @click="removeFile" class="remove-btn">删除</button>
            </div>
          </div>
          
          <div class="import-actions">
            <button @click="triggerFileSelect" class="select-btn">选择文件</button>
            <button @click="importFile" :disabled="!selectedFile || isImporting" class="import-btn">
              {{ isImporting ? '导入中...' : '开始导入' }}
            </button>
          </div>
          
          <div v-if="importResult" class="import-result" :class="importResult.success ? 'success' : 'error'">
            <h4>{{ importResult.success ? '导入成功' : '导入失败' }}</h4>
            <p>{{ importResult.message }}</p>
            <div v-if="importResult.success && importResult.data" class="result-details">
              <p>文件名: {{ importResult.data.fileName }}</p>
              <p>文件大小: {{ formatFileSize(importResult.data.fileSize) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 导入加载提示 -->
    <ImportLoadingModal
      :is-visible="showImportLoading"
      :progress="importProgress"
      :can-cancel="canCancelImport"
      @cancel="cancelImport"
    />
  </div>
</template>

<script>
import InjuryFigureModal from './InjuryFigureModal.vue'
import InterventionTimelineDialog from './InterventionTimelineDialog.vue'
import GcsScoreModal from './GcsScoreModal.vue'
import RtsScoreModal from './RtsScoreModal.vue'
import PatientOnAdmissionModal from './PatientOnAdmissionModal.vue'
import PatientOffAdmissionModal from './PatientOffAdmissionModal.vue'
import ImportLoadingModal from './ImportLoadingModal.vue'

export default {
  components: {
    InjuryFigureModal,
    InterventionTimelineDialog,
    GcsScoreModal,
    RtsScoreModal,
    PatientOnAdmissionModal,
    PatientOffAdmissionModal,
    ImportLoadingModal,
  },
  data() {
    return {
      patients: [],
      
      // 分页数据
      current: 1,
      size: 10,
      total: 0,
      pages: 0,
      
      // 查询条件
      searchForm: {
        patientId: null,
        gender: '',
        minAge: null,
        maxAge: null
      },

      // 受伤弹窗
      showModal: false,
      currentPatient: null,

      // 干预时间弹窗
      showTimeline: false,
      selectedPatientData: {}, // 这里存放请求到的干预时间数据

      // GCS评分弹窗
      showGcsModalFlag: false,
      currentGcsPatient: null,

      // RTS评分弹窗
      showRtsModalFlag: false,
      currentRtsPatient: null,

      // 入室前信息弹窗
      showOnAdmissionModalFlag: false,
      currentOnAdmissionPatient: null,

      // 离室后信息弹窗
      showOffAdmissionModalFlag: false,
      currentOffAdmissionPatient: null,

      // 批量导入弹窗
      showImportModalFlag: false,
      selectedFile: null,
      isDragOver: false,
      isImporting: false,
      importResult: null,
      
      // 导入加载状态
      showImportLoading: false,
      importProgress: 0,
      canCancelImport: true,
      importStartTime: null,
      progressInterval: null,
    }
  },
  computed: {
    // 计算可见的页码
    visiblePages() {
      const pages = [];
      const maxVisible = 5; // 最多显示5个页码
      let start = Math.max(1, this.current - Math.floor(maxVisible / 2));
      let end = Math.min(this.pages, start + maxVisible - 1);
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    }
  },
  methods: {
    // 获取患者分页数据
    fetchPatients() {
      const params = {
        current: this.current,
        size: this.size,
        ...this.searchForm
      };
      
      // 清理空值参数
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === '') {
          delete params[key];
        }
      });
      
      this.$axios.get('/api/patient/page', { params })
        .then(res => {
          const data = res.data.data;
          this.patients = data.records;
          this.current = data.current;
          this.size = data.size;
          this.total = data.total;
          this.pages = data.pages;
        })
        .catch(err => {
          console.error('请求失败', err);
        });
    },

    // 搜索患者
    searchPatients() {
      this.current = 1; // 重置到第一页
      this.fetchPatients();
    },

    // 重置搜索条件
    resetSearch() {
      this.searchForm = {
        patientId: null,
        gender: '',
        minAge: null,
        maxAge: null
      };
      this.current = 1;
      this.fetchPatients();
    },

    // 跳转到指定页
    goToPage(page) {
      if (page >= 1 && page <= this.pages && page !== this.current) {
        this.current = page;
        this.fetchPatients();
      }
    },

    showInjuryModal(patient) {
      this.currentPatient = patient;
      this.showModal = true;
      
      // 获取受伤程度数据
      this.fetchInjuryData(patient);
    },
    closeModal() {
      this.showModal = false;
    },

    // 获取受伤程度数据
    fetchInjuryData(patient) {
      const url = `/api/iss/injury/${patient.patientId}`;
      this.$axios.get(url)
        .then(res => {
          console.log('受伤程度数据:', res.data);
          
          if (res.data.data) {
            // 将受伤数据合并到患者对象中
            this.currentPatient = {
              ...patient,
              ...res.data.data
            };
          }
        })
        .catch(err => {
          console.error('获取受伤程度数据失败:', err);
          // 即使获取失败，也显示弹窗，但数据可能不完整
        });
    },

    fetchInterventionData(patient) {
      const url = `/api/intervention/patient/${patient.patientId}`;
      this.$axios.get(url)
        .then(res => {
          console.log('干预数据:', res.data);
          
          // 修正：确保我们获取的是对象而不是数组
          if (Array.isArray(res.data.data) && res.data.data.length > 0) {
            this.selectedPatientData = res.data.data[0];
          } else if (typeof res.data.data === 'object') {
            this.selectedPatientData = res.data.data;
          } else {
            this.selectedPatientData = {};
          }
          
          this.showTimeline = true; // 弹出时间线
        })
        .catch(err => {
          console.error('请求干预时间失败', err);
          alert('获取干预时间失败');
        });
    },

    closeTimeline() {
      this.showTimeline = false;
    },

    // GCS评分相关方法
    showGcsModal(patient) {
      this.currentGcsPatient = patient;
      this.showGcsModalFlag = true;
      
      // 获取GCS评分数据
      this.fetchGcsData(patient);
    },

    closeGcsModal() {
      this.showGcsModalFlag = false;
    },

    // 获取GCS评分数据
    fetchGcsData(patient) {
      const url = `/api/gcs/score/${patient.patientId}`;
      this.$axios.get(url)
        .then(res => {
          console.log('GCS评分数据:', res.data);
          if (res.data.data) {
            // 将GCS数据合并到患者对象中
            this.currentGcsPatient = {
              ...patient,
              ...res.data.data
            };
          }
        })
        .catch(err => {
          console.error('获取GCS评分数据失败:', err);
          // 即使获取失败，也显示弹窗，但数据可能不完整
        });
    },

    // RTS评分相关方法
    showRtsModal(patient) {
      this.currentRtsPatient = patient;
      this.showRtsModalFlag = true;
      
      // 获取RTS评分数据
      this.fetchRtsData(patient);
    },

    closeRtsModal() {
      this.showRtsModalFlag = false;
    },

    // 获取RTS评分数据
    fetchRtsData(patient) {
      const url = `/api/rts/score/${patient.patientId}`;
      this.$axios.get(url)
        .then(res => {
          console.log('RTS评分数据:', res.data);
          if (res.data.data) {
            // 将RTS数据合并到患者对象中
            this.currentRtsPatient = {
              ...patient,
              ...res.data.data
            };
          }
        })
        .catch(err => {
          console.error('获取RTS评分数据失败:', err);
          // 即使获取失败，也显示弹窗，但数据可能不完整
        });
    },

    // 入室前信息相关方法
    showOnAdmissionModal(patient) {
      this.currentOnAdmissionPatient = patient;
      this.showOnAdmissionModalFlag = true;
    },

    closeOnAdmissionModal() {
      this.showOnAdmissionModalFlag = false;
    },

    // 离室后信息相关方法
    showOffAdmissionModal(patient) {
      this.currentOffAdmissionPatient = patient;
      this.showOffAdmissionModalFlag = true;
    },

    closeOffAdmissionModal() {
      this.showOffAdmissionModalFlag = false;
    },

    // 批量导入相关方法
    showImportModal() {
      this.showImportModalFlag = true;
      this.selectedFile = null;
      this.importResult = null;
    },

    closeImportModal() {
      this.showImportModalFlag = false;
      this.selectedFile = null;
      this.importResult = null;
      this.isDragOver = false;
    },

    triggerFileSelect() {
      this.$refs.fileInput.click();
    },

    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.importResult = null;
      }
    },

    handleFileDrop(event) {
      this.isDragOver = false;
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (this.isValidFile(file)) {
          this.selectedFile = file;
          this.importResult = null;
        } else {
          alert('请选择有效的Excel文件（.xlsx或.xls格式）');
        }
      }
    },

    isValidFile(file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      const validExtensions = ['.xlsx', '.xls'];
      
      const hasValidType = validTypes.includes(file.type);
      const hasValidExtension = validExtensions.some(ext => 
        file.name.toLowerCase().endsWith(ext)
      );
      
      return hasValidType || hasValidExtension;
    },

    removeFile() {
      this.selectedFile = null;
      this.importResult = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },

    async importFile() {
      if (!this.selectedFile) {
        alert('请先选择文件');
        return;
      }

      // 开始导入流程
      this.startImportProcess();

      try {
        const formData = new FormData();
        formData.append('file', this.selectedFile);

        // 模拟进度更新
        this.simulateProgress();

        const response = await this.$axios.post('/api/file/uploadPatientExcel', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // 完成导入
        this.completeImport(response);

      } catch (error) {
        console.error('导入失败:', error);
        this.handleImportError(error);
      }
    },

    // 开始导入流程
    startImportProcess() {
      this.isImporting = true;
      this.showImportLoading = true;
      this.importProgress = 0;
      this.canCancelImport = true;
      this.importStartTime = Date.now();
      this.importResult = null;
      
      // 关闭导入弹窗
      this.showImportModalFlag = false;
    },

    // 模拟进度更新
    simulateProgress() {
      const progressInterval = setInterval(() => {
        if (this.importProgress < 90) {
          this.importProgress += Math.random() * 15;
          if (this.importProgress > 90) {
            this.importProgress = 90;
          }
        }
      }, 500);

      // 保存interval以便清理
      this.progressInterval = progressInterval;
    },

    // 完成导入
    completeImport(response) {
      // 清理进度模拟
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }

      // 设置完成进度
      this.importProgress = 100;
      
      // 延迟一下让用户看到100%的进度
      setTimeout(() => {
        this.showImportLoading = false;
        this.isImporting = false;
        this.canCancelImport = true;

        if (response.data.code === 200) {
          this.importResult = {
            success: true,
            message: response.data.data.message,
            data: response.data.data
          };
          
          // 导入成功后刷新患者列表
          this.fetchPatients();
          
          // 显示成功提示
          this.showSuccessMessage('🎉 导入成功！患者数据已成功导入系统。');
        } else {
          this.importResult = {
            success: false,
            message: response.data.message || '导入失败'
          };
          this.showErrorMessage('❌ 导入失败：' + (response.data.message || '未知错误'));
        }
        
        // 重新打开导入弹窗显示结果
        this.showImportModalFlag = true;
      }, 1000);
    },

    // 处理导入错误
    handleImportError(error) {
      // 清理进度模拟
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }

      this.showImportLoading = false;
      this.isImporting = false;
      this.canCancelImport = true;

      this.importResult = {
        success: false,
        message: error.response?.data?.message || '导入失败，请检查文件格式'
      };

      this.showErrorMessage('❌ 导入失败：' + this.importResult.message);
      
      // 重新打开导入弹窗显示错误
      this.showImportModalFlag = true;
    },

    // 取消导入
    cancelImport() {
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }

      this.showImportLoading = false;
      this.isImporting = false;
      this.canCancelImport = true;
      this.importProgress = 0;

      this.showWarningMessage('⚠️ 导入已取消');
    },

    // 显示成功消息
    showSuccessMessage(message) {
      // 这里可以使用更友好的提示方式，比如toast通知
      console.log('Success:', message);
    },

    // 显示错误消息
    showErrorMessage(message) {
      // 这里可以使用更友好的提示方式，比如toast通知
      console.error('Error:', message);
    },

    // 显示警告消息
    showWarningMessage(message) {
      // 这里可以使用更友好的提示方式，比如toast通知
      console.warn('Warning:', message);
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  },
  mounted() {
    this.fetchPatients();
  },
  beforeDestroy() {
    // 清理定时器
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }
}
</script>

<style scoped>
/* 查询表单样式 */
.search-form {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.form-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #333;
  white-space: nowrap;
}

.form-group input,
.form-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.search-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.search-btn:hover {
  background-color: #0056b3;
}

.reset-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.reset-btn:hover {
  background-color: #545b62;
}

.import-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.import-btn:hover {
  background-color: #218838;
}

/* 表格样式 */
table.patient-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.patient-table th,
.patient-table td {
  border: 1px solid #e9ecef;
  padding: 12px;
  text-align: left;
}

.patient-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.patient-table tbody tr:hover {
  background-color: #f8f9fa;
}

/* 操作按钮样式 */
.patient-table button {
  padding: 6px 12px;
  margin: 0 3px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.patient-table button:hover {
  background-color: #0056b3;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-top: 20px;
}

.pagination-info {
  color: #6c757d;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 5px;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  background-color: white;
  color: #007bff;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.page-btn:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
  border-color: #dee2e6;
}

.page-btn.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .pagination {
    flex-direction: column;
    gap: 15px;
  }
  
  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
}

/* 批量导入弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 20px;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: #007bff;
  background-color: #f8f9fa;
}

.upload-placeholder {
  color: #6c757d;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.upload-hint {
  font-size: 12px;
  color: #adb5bd;
  margin-top: 8px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.file-icon {
  font-size: 24px;
}

.file-details {
  flex: 1;
  text-align: left;
}

.file-name {
  margin: 0 0 4px 0;
  font-weight: 500;
  color: #333;
}

.file-size {
  margin: 0;
  font-size: 12px;
  color: #6c757d;
}

.remove-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.remove-btn:hover {
  background-color: #c82333;
}

.import-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
}

.select-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.select-btn:hover {
  background-color: #545b62;
}

.import-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.import-result {
  padding: 16px;
  border-radius: 6px;
  margin-top: 16px;
}

.import-result.success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.import-result.error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.import-result h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.import-result p {
  margin: 4px 0;
  font-size: 14px;
}

.result-details {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.result-details p {
  font-size: 12px;
  color: #6c757d;
}
</style>