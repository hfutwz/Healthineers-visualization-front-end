<template>
  <div style="position: relative; display: inline-block;">
    <!-- 这里用v-html插入SVG -->
    <div ref="svgContainer" v-html="svgContent"></div>
    <!-- 在相应位置叠加“受伤状态标记” -->
    <div
      v-for="(mark, index) in marks"
      :key="index"
      :style="{
        position: 'absolute',
        top: mark.top,
        left: mark.left,
        background: 'rgba(255,0,0,0.5)',
        padding: '2px 4px',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#fff'
      }"
    >
      {{ mark.label }}
    </div>
  </div>
</template>

<script>
// 你可以在这里定义受伤位置的标注（位置坐标需根据SVG实际调整）
import svgStr from 'G:/Healthineers-visualization/body/body.svg?raw';

export default {
  data() {
    return {
      svgContent: '',
      marks: [
        { top: '50px', left: '100px', label: '头部(受伤' } ,
        { top: '200px', left: '150px', label: '左臂(轻伤)' }
        // 根据需要自行添加，坐标需要根据SVG调整
      ],
    };
  },
  mounted() {
    this.svgContent = svgStr;
  },
};
</script>
