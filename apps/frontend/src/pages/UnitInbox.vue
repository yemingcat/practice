<template>
  <a-card title="二级单位审核">
    <a-space style="margin-bottom:12px">
      <a-button type="primary" @click="refresh">刷新</a-button>
      <a-select v-model:value="stage" style="width:160px" :options="stages" @change="refresh" />
      <a-select v-model:value="status" style="width:160px" :options="statuses" @change="refresh" />
      <a-input placeholder="搜索名称/负责人/编号" style="width:240px" />
    </a-space>
    <a-table :dataSource="rows" :columns="cols" rowKey="id" :pagination="false">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key==='action'">
          <RouterLink :to="`/review?stage=${stage}&result_id=${record.result_id}`">审核</RouterLink>
          <span v-if="record.decision==='rejected'"> ｜ </span>
          <RouterLink v-if="record.decision==='rejected'" :to="`/supplement?result_id=${record.result_id}`">补充材料</RouterLink>
        </template>
      </template>
    </a-table>
  </a-card>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { http } from '../services/http'
const rows = ref<any[]>([])
const stage = ref('unit')
const status = ref('pending')
const stages = [{ value: 'unit', label: '单位初审' }, { value: 'final', label: '终审' }]
const statuses = [
  { value: 'pending', label: '待审核' },
  { value: 'rejected', label: '被退回' },
  { value: 'approved', label: '已通过' },
  { value: 'all', label: '全部' }
]
const cols = [
  { title: '名称', dataIndex: 'name' },
  { title: '类型', dataIndex: 'type' },
  { title: '实验室', dataIndex: 'lab' },
  { title: '负责人', dataIndex: 'owner' },
  { title: '状态', dataIndex: 'decision' },
  { title: '操作', key: 'action' }
]
const refresh = async () => {
  const { data } = await http.get('/api/v1/reviews', {
    params: { stage: stage.value, status: status.value, t: Date.now() }
  })
  rows.value = Array.isArray(data.data) ? data.data : []
}
onMounted(refresh)
watch([stage, status], refresh)
</script>
