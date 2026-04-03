<script setup lang="ts">
import BaseSelect from '@/components/BaseSelect.vue'
import PlayerCard from './PlayerCard.vue'
import type { LevelIndex, LevelValueSource, PlayerSettings } from '../utils/songFilter'

const props = defineProps<{
  sortPrimary: 'first' | 'second'
  levelValueSource: LevelValueSource
  firstManualLevelInput: boolean
  secondManualLevelInput: boolean
  firstPlayer: PlayerSettings
  secondPlayer: PlayerSettings
  difficultyOptions: Array<{ label: string; value: LevelIndex }>
  levelValueSelectOptions: Array<{ label: string; value: number }>
  onInputChanged: () => void
  onSelectChanged: (p: PlayerSettings, manual: boolean) => void
  searchDisabled: boolean
}>()

const emit = defineEmits<{
  (e: 'update:sortPrimary', v: 'first' | 'second'): void
  (e: 'update:levelValueSource', v: LevelValueSource): void
  (e: 'update:firstManualLevelInput', v: boolean): void
  (e: 'update:secondManualLevelInput', v: boolean): void
  (e: 'dirty'): void
  (e: 'reset'): void
  (e: 'search'): void
}>()

function onSortPrimaryChanged(v: 'first' | 'second') {
  emit('update:sortPrimary', v)
  emit('dirty')
}

function onLevelValueSourceChanged(v: LevelValueSource) {
  emit('update:levelValueSource', v)
  emit('dirty')
}
</script>

<template>
  <section class="panel">
    <div class="panelTitleRow">
      <h2>玩家设置</h2>
      <div class="row gap">
        <label class="row gap">
          <span class="label">排序优先级</span>
          <BaseSelect
            class="input"
            :model-value="props.sortPrimary"
            :options="[
              { label: '先贴近玩家 1 期望', value: 'first' },
              { label: '先贴近玩家 2 期望', value: 'second' },
            ]"
            @update:model-value="onSortPrimaryChanged"
          />
        </label>

        <label class="row gap">
          <span class="label">定数来源</span>
          <BaseSelect
            class="input"
            :model-value="props.levelValueSource"
            :options="[
              { label: '玩家公投（水鱼）', value: 'fit' },
              { label: '官方（LXNS）', value: 'official' },
            ]"
            @update:model-value="onLevelValueSourceChanged"
          />
        </label>

        <button type="button" class="btn" @click="emit('reset')">重置玩家参数</button>
        <button type="button" class="btn btnPrimary" :disabled="props.searchDisabled" @click="emit('search')">开始筛选</button>
      </div>
    </div>

    <div class="grid2">
      <PlayerCard
        :manual-level-input="props.firstManualLevelInput"
        @update:manual-level-input="(v) => emit('update:firstManualLevelInput', v)"
        :player="props.firstPlayer"
        :difficulty-options="props.difficultyOptions"
        :level-value-select-options="props.levelValueSelectOptions"
        :on-input-changed="props.onInputChanged"
        :on-select-changed="props.onSelectChanged"
      />
      <PlayerCard
        :manual-level-input="props.secondManualLevelInput"
        @update:manual-level-input="(v) => emit('update:secondManualLevelInput', v)"
        :player="props.secondPlayer"
        :difficulty-options="props.difficultyOptions"
        :level-value-select-options="props.levelValueSelectOptions"
        :on-input-changed="props.onInputChanged"
        :on-select-changed="props.onSelectChanged"
      />
    </div>
  </section>
</template>
