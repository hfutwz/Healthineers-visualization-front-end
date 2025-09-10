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
        <tr v-for="patient in patients" :key="patient.id">
          <td>{{ patient.patientId }}</td>
          <td>{{ patient.age }}</td>
          <td>{{ patient.gender }}</td>
          <td>{{ patient.height }}</td>
          <td>{{ patient.weight }}</td>
          <td>{{ patient.isGreenChannel }}</td>
          <td>
            <button @click="showInjuryModal(patient)">查看受伤程度</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 受伤人体弹窗组件 -->
    <InjuryFigureModal 
      v-if="showModal" 
      :patient="currentPatient"
      @close="closeModal"
    />
  </div>
</template>

<script>
import InjuryFigureModal from './InjuryFigureModal.vue';

export default {
  components: {
    InjuryFigureModal
  },
  data() {
    return {
      patients: [], // 改为空数组，由请求初始化
      showModal: false,
      currentPatient: null,
    };
  },
  methods: {
    // 使用axios请求患者列表
    fetchPatients() {
      this.$axios.get('/api/patient/list')
        .then(res => {
          this.patients = res.data.data; // 根据返回格式调整
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
    }
  },
  mounted() {
    this.fetchPatients();
  },
};
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