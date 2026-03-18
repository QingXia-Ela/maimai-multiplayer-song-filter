<script setup lang="ts">
import BaseSelect from '@/components/BaseSelect.vue'
import type { ThemeMode } from '@/store'
import ParamHelp from './ParamHelp.vue'

const props = defineProps<{
  modelValue: ThemeMode
  options: Array<{ label: string; value: ThemeMode }>
}>()

const emit = defineEmits<{ (e: 'update:modelValue', v: ThemeMode): void }>()
</script>

<template>
  <header class="header">
    <div class="headerTop">
      <div class="headerMain">
        <h1>MaiMai 选歌器</h1>
        <p class="sub">输入两位玩家的可接受范围，先筛选出玩家 1 可接受歌曲，再从中筛选玩家 2，最后按“期望定数接近度”排序。</p>
      </div>

      <label class="row gap headerTheme">
        <span class="label">主题</span>
        <BaseSelect
          class="input themeSelect"
          :model-value="props.modelValue"
          :options="props.options"
          @update:model-value="(v) => emit('update:modelValue', v)"
        />
      </label>
    </div>

    <ParamHelp />
  </header>
</template>

