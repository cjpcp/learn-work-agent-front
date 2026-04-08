<template>
  <a-card title="审批管理">
    <a-empty description="审批相关功能已移至流程代办服务">
      <template #description>
        <p>审批相关功能已移至流程代办服务</p>
        <p>请通过以下链接访问流程代办服务</p>
      </template>
      <a-button type="primary" @click="navigateToProcessService"> 前往流程代办服务 </a-button>
    </a-empty>
  </a-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToProcessService = () => {
  router.push('/process')
}
</script>
