<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  min?: number
  max?: number
  step?: number | string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: number): void
  (e: 'input', ev: Event): void
  (e: 'change', ev: Event): void
}>()

function toNumber(raw: string) {
  // 允许输入中间态（比如空字符串）时不 emit NaN：回退为当前值
  if (raw.trim() === '') return props.modelValue
  const n = Number(raw)
  return Number.isFinite(n) ? n : props.modelValue
}

function onInput(ev: Event) {
  const el = ev.target as HTMLInputElement
  emit('update:modelValue', toNumber(el.value))
  emit('input', ev)
}

function onChange(ev: Event) {
  const el = ev.target as HTMLInputElement
  emit('update:modelValue', toNumber(el.value))
  emit('change', ev)
}
</script>

<template>
  <input
    type="number"
    :value="String(modelValue)"
    :min="min"
    :max="max"
    :step="step"
    @input="onInput"
    @change="onChange"
  />
</template>

