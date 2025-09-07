<template>
  <div>
    <!-- 表格列示所有患者基本信息 -->
    <table class="patient-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>姓名</th>
          <th>年龄</th>
          <th>性别</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="patient in patients" :key="patient.id">
          <td>{{ patient.id }}</td>
          <td>{{ patient.name }}</td>
          <td>{{ patient.age }}</td>
          <td>{{ patient.gender }}</td>
          <td>
            <button @click="showInjuryModal(patient)">查看受伤程度</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 受伤人体信息弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>病人受伤人体图（ID: {{ currentPatient.id }})</h3>
        <!-- SVG人体轮廓 -->
        <svg width="200" height="400" viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg" class="human-svg">
          <!-- 头部 -->
          <circle :fill="getColor(currentPatient.injuryLocations.head)"
                  cx="100" cy="50" r="40"/>
          <!-- 面部-轮廓（可省略或用椭圆等） -->
          <!-- 躯干 -->
          <rect x="80" y="90" width="40" height="100" :fill="getColor(currentPatient.injuryLocations.chest)"/>
          <!-- 腰部 -->
          <rect x="80" y="190" width="40" height="40" :fill="getColor(currentPatient.injuryLocations.abdomen)"/>
          <!-- 脚 -->
          <rect x="70" y="240" width="20" height="100" :fill="getColor(currentPatient.injuryLocations.limbs)"/>
          <rect x="110" y="240" width="20" height="100" :fill="getColor(currentPatient.injuryLocations.limbs)"/>
          <!-- 手臂（随意简化） -->
          <rect x="60" y="100" width="20" height="70" :fill="getColor(currentPatient.injuryLocations.body)"/>
          <rect x="120" y="100" width="20" height="70" :fill="getColor(currentPatient.injuryLocations.body)"/>
        </svg>
        <!-- 图标说明 -->
        <div class="color-legend">
          <div><span class="color-box" :style="{backgroundColor:'#ff0000'}"></span>严重(6)</div>
          <div><span class="color-box" :style="{backgroundColor:'#ffff00'}"></span>重伤(4-5)</div>
          <div><span class="color-box" :style="{backgroundColor:'#00ff00'}"></span>轻伤(1-3)</div>
        </div>
        <button @click="closeModal">关闭</button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      patients: [
        { id: 1, name: '张三', age: 30, gender: '男', injuryLocations: {head: 6, face: 4, chest: 2, abdomen: 1, limbs: 3, body: 5} },
        { id: 2, name: '李四', age: 25, gender: '女', injuryLocations: {head: 2, face: 1, chest: 0, abdomen: 0, limbs: 2, body: 3} },
        // 你可以填充更多模拟数据
      ],
      showModal: false,
      currentPatient: null,
    };
  },
  methods: {
    showInjuryModal(patient) {
      this.currentPatient = patient;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    // 根据伤情程度返回颜色
    getColor(level) {
      if (level >= 6) return '#ff0000'; // 最严重
      if (level >= 4) return '#ffff00'; // 重伤
      if (level >= 1) return '#00ff00'; // 轻伤
      return '#cccccc'; // 无伤或没数据
    }
  }
}
</script>
<style scoped>
.map-anim-container {
  width: 100%;
}

table.patient-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}
.patient-table th, .patient-table td {
  border: 1px solid #ccc;
  padding: 8px;
}
.patient-table th {
  background: #f0f0f0;
}

button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  text-align: center;
}
.color-legend {
  display: flex;
  justify-content: space-around;
  margin: 10px 0;
}
.color-box {
  display: inline-block;
  width: 20px; height: 20px;
  border: 1px solid #999;
  margin-right: 8px;
}
/* SVG地图样式 */
svg.human-svg {
  width: 200px;
  height: auto;
}
</style>
