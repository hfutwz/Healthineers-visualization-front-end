<template>
  <div class="hourly-statistics-container">
    <div class="header">
      <h2>24小时病例数量统计</h2>
      <div class="controls">
        <el-select v-model="filters.year" placeholder="年份(可选)" clearable filterable style="width: 140px; margin-right: 10px;" @change="onFilterChange">
          <el-option v-for="y in yearOptions" :key="y" :value="y" :label="y.toString()" />
        </el-select>
        <el-select v-model="filters.seasons" multiple placeholder="季节(可选, 可多选)" clearable style="width: 300px; margin-right: 10px;" @change="onFilterChange">
          <el-option :value="0" label="春" />
          <el-option :value="1" label="夏" />
          <el-option :value="2" label="秋" />
          <el-option :value="3" label="冬" />
        </el-select>
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          unlink-panels
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          style="width: 300px; margin-right: 10px;"
          @change="onFilterChange"
        />
        <el-button type="primary" :loading="loading" @click="fetchData">查询</el-button>
      </div>
    </div>

    <div class="stats">
      <el-row :gutter="16">
        <el-col :span="6"><div class="stat-card"><div class="stat-value">{{ total }}</div><div class="stat-label">总病例数</div></div></el-col>
        <el-col :span="6"><div class="stat-card"><div class="stat-value">{{ peakHourLabel }}</div><div class="stat-label">峰值时段</div></div></el-col>
        <el-col :span="6"><div class="stat-card"><div class="stat-value">{{ averagePerHour }}</div><div class="stat-label">每小时平均</div></div></el-col>
        <el-col :span="6"><div class="stat-card"><div class="stat-value">{{ nonZeroHours }}</div><div class="stat-label">非零小时数</div></div></el-col>
      </el-row>
    </div>

    <div class="chart-wrapper">
      <div ref="chart" class="chart"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'HourlyStatistics',
  data() {
    return {
      loading: false,
      filters: {
        year: undefined,
        seasons: [],
        dateRange: []
      },
      yearOptions: [],
      seriesData: Array(24).fill(0),
      total: 0,
      peakHourLabel: '-',
      averagePerHour: 0,
      nonZeroHours: 0,
      chart: null
    }
  },
  mounted() {
    this.initChart()
    this.loadYears()
    this.fetchData()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.chart) this.chart.dispose()
  },
  methods: {
    onFilterChange() {
      // 防抖可加，这里直接查询
      this.fetchData()
    },
    async loadYears() {
      // 本地生成当前年往前共11年
      const current = new Date().getFullYear()
      const years = []
      for (let i = 0; i <= 10; i += 1) {
        years.push(current - i)
      }
      this.yearOptions = years
    },
    async fetchData() {
      this.loading = true
      try {
        const params = new URLSearchParams()
        if (this.filters.year) params.append('year', this.filters.year)
        if (Array.isArray(this.filters.seasons) && this.filters.seasons.length > 0) {
          this.filters.seasons.forEach(s => params.append('seasons', s))
        }
        if (this.filters.dateRange && this.filters.dateRange.length === 2) {
          params.append('startDate', this.filters.dateRange[0])
          params.append('endDate', this.filters.dateRange[1])
        }
        const resp = await fetch(`/api/map/hourly-statistics?${params.toString()}`)
        if (!resp.ok) {
          const msg = `接口错误(${resp.status})`
          // 失败直接提示并返回
          this.$message && this.$message.error(msg)
          console.error('[HourlyStatistics] 请求失败:', msg)
          return
        }
        const result = await resp.json()
        console.log('[HourlyStatistics] 接口返回原始数据:', result)
        // 兼容 Result 包装结构 { code, data, msg }
        const data = Array.isArray(result) ? result : (result && result.data ? result.data : [])
        if (!Array.isArray(data) || data.length === 0) {
          this.seriesData = Array(24).fill(0)
          this.computeStats()
          this.renderChart()
          this.$message && this.$message.info('暂无数据，建议调整筛选条件或检查后端数据')
          return
        }
        const hours = Array(24).fill(0)
        data.forEach(item => {
          const h = typeof item.hour === 'number' ? item.hour : parseInt(item.hour, 10)
          if (!isNaN(h) && h >= 0 && h <= 23) {
            hours[h] = typeof item.count === 'number' ? item.count : parseInt(item.count, 10) || 0
          }
        })
        this.seriesData = hours
        this.computeStats()
        this.renderChart()
      } catch (e) {
        // 简单错误提示
        this.$message && this.$message.error('获取数据失败')
        console.error('[HourlyStatistics] 异常:', e)
      } finally {
        this.loading = false
      }
    },
    computeStats() {
      const sum = this.seriesData.reduce((a, b) => a + b, 0)
      this.total = sum
      this.averagePerHour = this.seriesData.length ? Math.round(sum / this.seriesData.length) : 0
      this.nonZeroHours = this.seriesData.filter(v => v > 0).length
      let max = -1, idx = -1
      this.seriesData.forEach((v, i) => { if (v > max) { max = v; idx = i } })
      this.peakHourLabel = idx >= 0 ? `${idx.toString().padStart(2, '0')}:00-${((idx + 1) % 24).toString().padStart(2, '0')}:00` : '-'
    },
    initChart() {
      this.chart = echarts.init(this.$refs.chart)
      this.renderChart()
    },
    renderChart() {
      if (!this.chart) return
      const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)
      const option = {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '3%', top: '8%', bottom: '10%', containLabel: true },
        xAxis: { type: 'category', data: hours, axisLabel: { rotate: 0 } },
        yAxis: { type: 'value', name: '病例数' },
        series: [{
          type: 'bar',
          name: '病例数',
          data: this.seriesData,
          itemStyle: { color: '#409EFF' }
        }]
      }
      this.chart.setOption(option)
    },
    handleResize() {
      if (this.chart) this.chart.resize()
    }
  }
}
</script>

<style scoped>
.hourly-statistics-container { padding: 20px; background: #f5f7fa; min-height: 100vh; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: #fff; padding: 12px 16px; border-radius: 4px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.controls { display: flex; align-items: center; flex-wrap: wrap; }
.stats { margin-bottom: 16px; }
.stat-card { background: #fff; padding: 16px; border-radius: 4px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.stat-value { font-size: 22px; font-weight: bold; color: #409EFF; }
.stat-label { font-size: 12px; color: #909399; }
.chart-wrapper { background: #fff; padding: 12px; border-radius: 4px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.chart { width: 100%; height: 460px; }
</style>


