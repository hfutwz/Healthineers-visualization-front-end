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
  </div>
</template>

<script>
import InjuryFigureModal from './InjuryFigureModal.vue'
import InterventionTimelineDialog from './InterventionTimelineDialog.vue'
import GcsScoreModal from './GcsScoreModal.vue'
import RtsScoreModal from './RtsScoreModal.vue'
import PatientOnAdmissionModal from './PatientOnAdmissionModal.vue'
import PatientOffAdmissionModal from './PatientOffAdmissionModal.vue'

export default {
  components: {
    InjuryFigureModal,
    InterventionTimelineDialog,
    GcsScoreModal,
    RtsScoreModal,
    PatientOnAdmissionModal,
    PatientOffAdmissionModal,
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
    }
  },
  mounted() {
    this.fetchPatients();
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
</style>