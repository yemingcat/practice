<template>
  <a-card title="成果匹配">
    <a-space style="margin-bottom:12px">
      <a-input placeholder="名称/编号/DOI/专利号" style="width:320px" />
      <a-button type="primary">搜索</a-button>
    </a-space>
    <a-table :dataSource="rows" :columns="cols" rowKey="id" :pagination="false" />
  </a-card>
</template>
<script setup lang="ts">
const rows = [
  { id: 1, name: '高性能材料研究', type: '论文', no: '10.1234/abc', score: '92%' },
  { id: 2, name: 'XXX发明专利', type: '专利', no: 'CNxxxx', score: '88%' }
]
const cols = [
  { title: '名称', dataIndex: 'name' },
  { title: '类型', dataIndex: 'type' },
  { title: '编号/DOI', dataIndex: 'no' },
  { title: '相似度', dataIndex: 'score' }
]
</script>
