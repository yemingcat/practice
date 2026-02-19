<template>
  <a-card title="实验室工作台">
    <a-space style="margin-bottom:12px">
      <RouterLink to="/match"><a-button type="primary">从库匹配</a-button></RouterLink>
      <RouterLink to="/fill"><a-button>新建填报</a-button></RouterLink>
      <a-input placeholder="搜索名称/编号" style="width:240px" />
    </a-space>
    <a-table :dataSource="rows" :columns="cols" rowKey="id" :pagination="false">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key==='action'">
          <RouterLink v-if="record.status==='rejected'" :to="`/supplement?result_id=${record.id}`">补充材料</RouterLink>
        </template>
      </template>
    </a-table>
  </a-card>
  </template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { http } from '../services/http'
const rows = ref<any[]>([])
const cols = [
  { title: '名称', dataIndex: 'title' },
  { title: '类型', dataIndex: 'type' },
  { title: '状态', dataIndex: 'status' },
  { title: '操作', key: 'action' }
]
onMounted(async () => {
  const { data } = await http.get('/api/v1/results')
  rows.value = data.data || []
})
</script>
