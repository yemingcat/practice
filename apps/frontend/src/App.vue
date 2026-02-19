<template>
  <div>
    <header style="position:sticky;top:0;background:#0f172a;color:#fff;padding:12px 16px;display:flex;justify-content:space-between">
      <div style="font-weight:700">绩效成果系统</div>
      <nav style="display:flex;gap:12px">
        <RouterLink class="nav" to="/lab">实验室</RouterLink>
        <RouterLink class="nav" to="/unit">二级单位</RouterLink>
        <RouterLink class="nav" to="/review">审核</RouterLink>
        <RouterLink class="nav" to="/reports">报表</RouterLink>
        <a href="../../prototype/perf-flow/index.html">原型</a>
      </nav>
    </header>
    <main style="max-width:1080px;margin:0 auto;padding:16px">
      <RouterView />
    </main>
  </div>
</template>
<script setup lang="ts"></script>
<style>
.nav{color:#e2e8f0}
.nav.router-link-active{color:#fff;text-decoration:underline}
</style>
