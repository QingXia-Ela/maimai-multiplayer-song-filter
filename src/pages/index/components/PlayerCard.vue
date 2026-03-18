<script setup lang="ts">
import BaseSelect from '@/components/BaseSelect.vue'
import BaseNumberInput from '@/components/BaseNumberInput.vue'
import type { LevelIndex, PlayerSettings } from '../utils/songFilter'

const props = defineProps<{
  player: PlayerSettings
  manualLevelInput: boolean
  difficultyOptions: Array<{ label: string; value: LevelIndex }>
  levelValueSelectOptions: Array<{ label: string; value: number }>
  onInputChanged: () => void
  onSelectChanged: (p: PlayerSettings, manual: boolean) => void
}>()

const emit = defineEmits<{ (e: 'update:manualLevelInput', v: boolean): void }>()

function toggleManualLevelInput(ev: Event) {
  const next = (ev.target as HTMLInputElement).checked
  emit('update:manualLevelInput', next)
  props.onSelectChanged(props.player, next)
}
</script>

<template>
  <div class="card">
    <h3>{{ props.player.name }}</h3>

    <div class="formRow">
      <span class="label">最高可接受谱面难度</span>
      <BaseSelect v-model="props.player.maxDifficulty" class="input" :options="props.difficultyOptions" @change="props.onInputChanged" />
    </div>

    <div class="formRow">
      <span class="label">可接受定数区间</span>
      <div class="row gap rangeRow">
        <template v-if="props.manualLevelInput">
          <BaseNumberInput v-model="props.player.minLevelValue" class="input inputFlex" :min="1" :max="15" step="0.1" @input="props.onInputChanged" />
        </template>
        <template v-else>
          <BaseSelect
            v-model="props.player.minLevelValue"
            class="input inputFlex"
            :options="props.levelValueSelectOptions"
            @change="props.onSelectChanged(props.player, props.manualLevelInput)"
          />
        </template>

        <span class="muted">到</span>

        <template v-if="props.manualLevelInput">
          <BaseNumberInput v-model="props.player.maxLevelValue" class="input inputFlex" :min="1" :max="15" step="0.1" @input="props.onInputChanged" />
        </template>
        <template v-else>
          <BaseSelect
            v-model="props.player.maxLevelValue"
            class="input inputFlex"
            :options="props.levelValueSelectOptions"
            @change="props.onSelectChanged(props.player, props.manualLevelInput)"
          />
        </template>
      </div>
    </div>

    <div class="formRow">
      <span class="label">期望定数（排序用）</span>
      <template v-if="props.manualLevelInput">
        <BaseNumberInput v-model="props.player.expectedLevelValue" class="input" :min="1" :max="15" step="0.1" @input="props.onInputChanged" />
      </template>
      <template v-else>
        <BaseSelect
          v-model="props.player.expectedLevelValue"
          class="input"
          :options="props.levelValueSelectOptions"
          @change="props.onSelectChanged(props.player, props.manualLevelInput)"
        />
      </template>
    </div>

    <details class="details">
      <summary class="detailsSummary">高级设置</summary>
      <div class="detailsBody">
        <div class="formRow">
          <span class="label">期望差距阈值</span>
          <BaseNumberInput
            v-model="props.player.maxExpectedDelta"
            class="input inputNarrow"
            :min="0"
            :max="15"
            step="0.1"
            @input="props.onInputChanged"
          />
        </div>

        <div class="formRow">
          <span class="label">手动输入定数</span>
          <label class="row gap">
            <input type="checkbox" :checked="props.manualLevelInput" @change="toggleManualLevelInput" />
            <span class="muted">关闭时使用下拉选择（1~15，每 0.5）</span>
          </label>
        </div>
      </div>
    </details>
  </div>
</template>

