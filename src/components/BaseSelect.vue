<script setup lang="ts">
type OptionValue = string | number

type Option = {
  label: string
  value: OptionValue
  disabled?: boolean
}

const props = defineProps<{
  modelValue: OptionValue
  options: Option[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: OptionValue): void
  (e: 'change', ev: Event): void
}>()

function onChange(ev: Event) {
  const el = ev.target as HTMLSelectElement
  const raw = el.value
  // 尝试按 options 的 value 类型做转换：number 优先，其次 string
  const matched = props.options.find((o) => String(o.value) === raw)
  const next = typeof matched?.value === 'number' ? Number(raw) : raw
  emit('update:modelValue', next)
  emit('change', ev)
}
</script>

<template>
  <select :value="String(modelValue)" @change="onChange">
    <option v-for="o in options" :key="String(o.value)" :value="String(o.value)" :disabled="o.disabled">
      {{ o.label }}
    </option>
  </select>
</template>

