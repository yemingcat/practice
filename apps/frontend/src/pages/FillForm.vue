<template>
  <a-card title="成果填报">
    <a-form layout="vertical">
      <a-row :gutter="[12,0]">
        <a-col :span="12"><a-form-item label="成果类型"><a-select v-model:value="form.type" :options="types" /></a-form-item></a-col>
        <a-col :span="12"><a-form-item label="成果名称"><a-input v-model:value="form.title" placeholder="例如 高性能材料研究" /></a-form-item></a-col>
        <a-col :span="12"><a-form-item label="编号/DOI/专利号"><a-input v-model:value="form.unique_no" /></a-form-item></a-col>
        <a-col :span="12"><a-form-item label="完成/授权日期"><a-date-picker v-model:value="form.date" style="width:100%" /></a-form-item></a-col>
        <a-col :span="24"><a-form-item label="参与人及贡献比例"><a-textarea rows="3" v-model:value="form.contributors" placeholder="张三 40%，李四 30%，王五 30%" /></a-form-item></a-col>
      </a-row>
      <a-space>
        <a-button type="primary" :loading="submitting" @click="onSubmit">提交初审</a-button>
        <a-button :loading="saving" @click="onSave">保存草稿</a-button>
      </a-space>
    </a-form>
  </a-card>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { http } from '../services/http'
const types = [{ value: '论文', label: '论文' }, { value: '专利', label: '专利' }, { value: '获奖', label: '获奖' }]
const form = reactive<any>({ id: null, type: '', title: '', unique_no: '', date: null, contributors: '' })
const router = useRouter()
const saving = ref(false)
const submitting = ref(false)
const validate = () => {
  if (!form.type || !form.title) {
    message.error('请填写类型与名称')
    return false
  }
  return true
}
const onSave = async () => {
  if (!validate()) return
  saving.value = true
  if (!form.id) {
    const { data } = await http.post('/api/v1/results', { type: form.type, title: form.title, unique_no: form.unique_no, date: form.date })
    form.id = data.id
    message.success('已保存草稿')
  } else {
    await http.patch(`/api/v1/results/${form.id}`, { type: form.type, title: form.title, unique_no: form.unique_no, date: form.date })
    message.success('草稿已更新')
  }
  saving.value = false
}
const onSubmit = async () => {
  if (!validate()) return
  submitting.value = true
  if (!form.id) await onSave()
  await http.post(`/api/v1/results/${form.id}/submit`)
  message.success('已提交初审')
  router.push('/unit')
  submitting.value = false
}
</script>
