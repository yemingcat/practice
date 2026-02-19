<template>
  <a-card title="补充材料">
    <a-space direction="vertical" style="width:100%">
      <div>结果ID：{{ id }}</div>
      <a-alert v-if="tip" type="info" :message="tip" show-icon />
      <a-upload
        :action="`/api/v1/results/${id}/attachments`"
        :multiple="true"
        :withCredentials="false"
        :show-upload-list="true"
        accept="image/*,.pdf"
        name="files"
        :beforeUpload="beforeUpload"
        @change="onChange"
      >
        <a-button type="primary" :disabled="!allowUpload">上传文件/图片</a-button>
      </a-upload>
      <a-divider />
      <a-list :data-source="items">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-space style="display:flex;justify-content:space-between;width:100%">
              <a :href="item.url" target="_blank">{{ item.file_name }}</a>
              <span>
                <a-button style="margin-right:8px" @click="download(item)">下载</a-button>
                <a-button danger @click="remove(item.id)">删除</a-button>
              </span>
            </a-space>
          </a-list-item>
        </template>
      </a-list>
    </a-space>
  </a-card>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { http } from '../services/http'
import { message } from 'ant-design-vue'
const route = useRoute()
const id = String(route.query.result_id || '')
const items = ref<any[]>([])
const tip = ref('仅状态为“被退回”的记录允许上传补充材料')
const allowUpload = ref(false)
const fetchList = async () => {
  const { data } = await http.get(`/api/v1/results/${id}/attachments`)
  items.value = data.data || []
}
const fetchStatus = async () => {
  const { data } = await http.get(`/api/v1/results/${id}`)
  allowUpload.value = data.status === 'rejected'
  if (!allowUpload.value) tip.value = '当前记录非退回状态，禁止上传'
}
const onChange = (info: any) => {
  if (info.file.status === 'done') {
    message.success('上传成功')
    fetchList()
  } else if (info.file.status === 'error') {
    message.error('上传失败')
  }
}
const beforeUpload = () => {
  if (!allowUpload.value) {
    message.warning('当前记录非退回状态，禁止上传')
    return false
  }
  return true
}
const remove = async (attId: string) => {
  await http.delete(`/api/v1/attachments/${attId}`)
  message.success('已删除')
  fetchList()
}
const download = (item: any) => {
  const url = item.download_url || `/api/v1/attachments/${item.id}/download`
  window.open(url, '_blank')
}
onMounted(async () => {
  await fetchStatus()
  await fetchList()
})
</script>
