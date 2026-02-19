<template>
  <a-card title="汇总报表">
    <a-row :gutter="[12,12]">
      <a-col :span="8"><a-statistic title="总成果数" :value="total" /></a-col>
      <a-col :span="8"><a-statistic title="通过率" :value="passRate" /></a-col>
      <a-col :span="8"><a-statistic title="退回率" :value="rejectRate" /></a-col>
    </a-row>
    <a-divider />
    <a-table :dataSource="rows" :columns="cols" rowKey="type" :pagination="false" />
    <a-space style="margin-top:12px">
      <a-button type="primary">导出XLSX</a-button>
      <a-button>导出PDF</a-button>
    </a-space>
  </a-card>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { http } from '../services/http'
const rows = ref<any[]>([])
const total = ref(0)
const passRate = ref('—')
const rejectRate = ref('—')
const cols = [
  { title: '类型', dataIndex: 'name' },
  { title: '数量', dataIndex: 'count' }
]
const refresh = async () => {
  const { data } = await http.get('/api/v1/reports/summary')
  rows.value = data.type || []
  total.value = rows.value.reduce((s: number, r: any) => s + (r.count || 0), 0)
  passRate.value = '—'
  rejectRate.value = '—'
}
onMounted(refresh)
</script>
