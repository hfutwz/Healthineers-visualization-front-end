<template>
  <div style="position: relative; width: 100%; max-width: 600px;">
    <svg viewBox="0 0 168.067 168.066" width="100%" xmlns="http://www.w3.org/2000/svg">

      <!-- 1. 头颈部 -->
      <path
        d="M74.913,42.315l-0.074,0.074c-0.631,0.348-0.979,0.774-0.979,1.149c0,1.042,2.554,2.202,5.977,2.202
           c1.038,0,2.041-0.112,2.931-0.309v-2.269c-0.84,0.167-1.759,0.268-2.705,0.268C77.928,43.42,76.1,42.999,74.913,42.315z"
        :fill="getColorByLevel(patientData.head)"
        @mouseenter="showDetail('头颈部', patientData.head)"
        @mouseleave="hideDetail"
      />

      <!-- 2. 面部 -->
      <path
        d="M75.352,39.341c-0.572,0.342-0.919,0.712-0.919,1.06c0,0.979,2.407,2.068,5.624,2.068
           c0.953,0,1.878-0.103,2.708-0.28v-1.998c-0.757,0.132-1.575,0.209-2.412,0.209C78.48,40.411,76.538,40.042,75.352,39.341z"
        :fill="getColorByLevel(patientData.face)"
        @mouseenter="showDetail('面部', patientData.face)"
        @mouseleave="hideDetail"
      />

      <!-- 3. 胸部区域（假设矩形） -->
      <rect
        x="70"
        y="80"
        width="60"
        height="80"
        :fill="getColorByLevel(patientData.chest)"
        @mouseenter="showDetail('胸部', patientData.chest)"
        @mouseleave="hideDetail"
        style="cursor:pointer;"
        @click="selectPart('chest')"
      />

      <!-- 4. 腹部区域（假设矩形） -->
      <rect
        x="70"
        y="160"
        width="60"
        height="80"
        :fill="getColorByLevel(patientData.abdomen)"
        @mouseenter="showDetail('腹部', patientData.abdomen)"
        @mouseleave="hideDetail"
        style="cursor:pointer;"
        @click="selectPart('abdomen')"
      />

      <!-- 5. 四肢（示意左臂） -->
      <rect
        x="40"
        y="80"
        width="20"
        height="80"
        :fill="getColorByLevel(patientData.limbs)"
        @mouseenter="showDetail('四肢', patientData.limbs)"
        @mouseleave="hideDetail"
        style="cursor:pointer;"
        @click="selectPart('limbs')"
      />

      <!-- 6. 其他部位或体表示意 -->
      <path
        d="M..."
        :fill="getColorByLevel(patientData.body)"
        @mouseenter="showDetail        ('体表', patientData.body)"
        @mouseleave="hideDetail"
        style="cursor:pointer;"
        @click="selectPart('body')"
      />
    </svg>
    <!-- 鼠标悬停显示信息 -->
    <div v-if="hoverInfo" style="position: absolute; top:10px; left:10px; background:#fff; border:1px solid #ccc; padding:8px;">
      <strong>{{ hoverInfo.part }}</strong>: 伤情等级 {{ hoverInfo.level }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 模拟从后端传入的伤情等级：0-未受伤，1-轻伤，2-中伤，3-重伤，4-严重，加重到6
      patientData: {
        head: 2,
        face: 4,
        chest: 1,
        abdomen: 3,
        limbs: 5,
        body: 1,
      },
      hoverInfo: null // 鼠标悬停信息
    }
  },
  methods: {
    // 根据等级返回颜色（浅到深）表示伤情严重程度
    getColorByLevel(level) {
      if (level == null || level === 0) return '#cccccc'; // 无伤
      if (level <= 2) return '#00ff00'; // 轻伤
      if (level <= 4) return '#ffff00'; // 中伤
      return '#ff0000'; // 重伤（严重）
    },
    showDetail(part, level) {
      this.hoverInfo = { part, level };
    },
    hideDetail() {
      this.hoverInfo = null;
    },
    selectPart(part) {
      alert(`你点击了：${part}`);
    }
  }
}
</script>

