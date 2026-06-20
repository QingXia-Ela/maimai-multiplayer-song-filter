<script setup lang="ts">
import { computed } from 'vue'
import { getSongExtraInfo } from '../constants/songExtraInfo'

const props = defineProps<{
  songId: number
  title: string
  compact?: boolean
}>()

const extraInfo = computed(() => getSongExtraInfo(props.songId))
</script>

<template>
  <div class="songTitleInfo" :class="{ compact: props.compact }">
    <div class="songTitleLine">
      <strong class="songTitle">{{ props.title }}</strong>
      <ul v-if="extraInfo?.tags?.length" class="songTags" aria-label="歌曲标签">
        <li v-for="tag in extraInfo.tags" :key="tag" class="songTag">{{ tag }}</li>
      </ul>
    </div>
    <p v-if="extraInfo?.description" class="songDescription">{{ extraInfo.description }}</p>
  </div>
</template>

<style scoped>
.songTitleInfo {
  min-width: 0;
}

.songTitleLine {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.songTitle {
  min-width: 0;
  color: var(--c-text);
  overflow-wrap: anywhere;
}

.songTags {
  list-style: none;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin: 0;
  padding: 0;
}

.songTag {
  padding: 2px 7px;
  border: 1px solid var(--c-primary-border);
  border-radius: 999px;
  background: var(--c-primary-bg);
  color: var(--c-primary);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
}

.songDescription {
  margin: 3px 0 0;
  color: var(--c-text-muted);
  font-size: 12px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.compact .songTitleLine {
  gap: 4px;
}

.compact .songTag {
  padding: 1px 6px;
  font-size: 10px;
}

.compact .songDescription {
  margin-top: 2px;
  font-size: 11px;
}
</style>
