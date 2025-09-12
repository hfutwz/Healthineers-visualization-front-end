<template>
  <div>
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
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 受伤弹窗 -->
    <InjuryFigureModal
      v-if="showModal"
      :patient="currentPatient"
      @close="closeModal"
    />

    <!-- 时间线弹窗 -->
    <intervention-timeline-dialog
      v-if="showTimeline"
      :local-data="selectedPatientData"
      @close="closeTimeline"
    />
  </div>
</template>

<script>
import InjuryFigureModal from './InjuryFigureModal.vue'
import InterventionTimelineDialog from './InterventionTimelineDialog.vue'

export default {
  components: {
    InjuryFigureModal,
    InterventionTimelineDialog,
  },
  data() {
    return {
      patients: [],

      // 受伤弹窗
      showModal: false,
      currentPatient: null,

      // 干预时间弹窗
      showTimeline: false,
      selectedPatientData: {}, // 这里存放请求到的干预时间数据
    }
  },
  methods: {
    fetchPatients() {
      this.$axios.get('/api/patient/list')
        .then(res => {
          this.patients = res.data.data;
        })
        .catch(err => {
          console.error('请求失败', err);
        });
    },

    showInjuryModal(patient) {
      this.currentPatient = patient;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
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
    }
  },
  mounted() {
    this.fetchPatients();
  }
}
</script>

<style scoped>
/* 表格样式 */
table.patient-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}
.patient-table th,
.patient-table td {
  border: 1px solid #ccc;
  padding: 8px;
}
.patient-table th {
  background-color: #f0f0f0;
}

/* 按钮样式 */
button {
  padding: 6px 12px;
  margin: 0 5px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
}
button:hover {
  background-color: #0056b3;
}
</style>