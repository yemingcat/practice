<template>
  <a-card title="审核面板">
    <a-descriptions bordered :column="2" size="small">
      <a-descriptions-item label="类型">{{ current?.type || '-' }}</a-descriptions-item>
      <a-descriptions-item label="名称">{{ current?.name || '-' }}</a-descriptions-item>
      <a-descriptions-item label="阶段">{{ stage }}</a-descriptions-item>
      <a-descriptions-item label="负责人">张三</a-descriptions-item>
    </a-descriptions>
    <a-divider />
    <a-form layout="vertical">
      <a-form-item label="结论">
        <a-select v-model:value="decision" :options="[{value:'approved',label:'通过'},{value:'rejected',label:'退回修改'}]" />
      </a-form-item>
      <a-form-item label="意见">
        <a-textarea v-model:value="comment" rows="4" placeholder="请补充授权通知书盖章页" />
      </a-form-item>
      <a-space>
        <a-button type="primary" @click="onSubmit">提交审核结论</a-button>
        <a-button @click="refresh">刷新</a-button>
      </a-space>
    </a-form>
  </a-card>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { http } from '../services/http'
const route = useRoute()
const router = useRouter()
const stage = ref((route.query.stage as string) || 'unit')
const result_id = ref(route.query.result_id as string | null)
const decision = ref('approved')
const comment = ref('')
const current = ref<any>(null)
const refresh = async () => {
  if (!result_id.value) {
    const { data } = await http.get('/api/v1/reviews', { params: { stage: stage.value, status: 'pending' } })
    current.value = data.data?.[0] || null
    result_id.value = current.value?.result_id || null
  } else {
    const { data } = await http.get('/api/v1/reviews', { params: { stage: stage.value, status: 'pending' } })
    current.value = (data.data || []).find((x: any) => x.result_id === result_id.value) || null
  }
}
const onSubmit = async () => {
  if (!result_id.value) { message.error('无待审记录'); return }
  await http.post('/api/v1/reviews', { result_id: result_id.value, stage: stage.value, decision: decision.value, comment: comment.value })
  message.success('已提交审核结论')
  router.push('/unit')
}
onMounted(refresh)
</script>
