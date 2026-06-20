<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'
import { marked } from 'marked'
import changelog from '../content/CHANGELOG.md?raw'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

marked.setOptions({
  gfm: true,
  breaks: false,
})

const renderedChangelog = computed(() => marked.parse(changelog) as string)

function close() {
  emit('close')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      document.addEventListener('keydown', onKeydown)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', onKeydown)
      document.body.style.removeProperty('overflow')
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.removeProperty('overflow')
})
</script>

<template>
  <Teleport to="body">
    <div v-if="props.open" class="announcementBackdrop" @click.self="close">
      <section
        class="announcementDialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-title"
      >
        <div class="announcementHeader">
          <h2 id="announcement-title">更新公告</h2>
          <button type="button" class="announcementClose" aria-label="关闭更新公告" @click="close">×</button>
        </div>
        <div class="announcementContent" v-html="renderedChangelog"></div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.announcementBackdrop {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: grid;
  place-items: center;
  padding: 16px;
  background: var(--c-dialog-backdrop);
}

.announcementDialog {
  width: min(680px, 100%);
  max-height: min(760px, calc(100vh - 32px));
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  background: var(--c-surface);
  color: var(--c-text);
}

.announcementHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--c-border-soft);
}

.announcementHeader h2 {
  margin: 0;
  font-size: 16px;
}

.announcementClose {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  border: 1px solid var(--c-input-border);
  border-radius: 10px;
  background: var(--c-btn-bg);
  color: var(--c-text-subtle);
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
}

.announcementClose:hover {
  background: var(--c-btn-bg-hover);
}

.announcementContent {
  overflow-y: auto;
  padding: 4px 18px 20px;
  color: var(--c-text-subtle);
  line-height: 1.7;
}

.announcementContent :deep(h1) {
  margin: 16px 0 12px;
  color: var(--c-text);
  font-size: 22px;
}

.announcementContent :deep(h2) {
  margin: 20px 0 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--c-border-soft);
  color: var(--c-text);
  font-size: 17px;
}

.announcementContent :deep(h3) {
  margin: 16px 0 6px;
  color: var(--c-text);
  font-size: 14px;
}

.announcementContent :deep(p) {
  margin: 8px 0;
}

.announcementContent :deep(ul) {
  margin: 6px 0;
  padding-left: 22px;
}

.announcementContent :deep(li + li) {
  margin-top: 4px;
}

.announcementContent :deep(code) {
  padding: 2px 5px;
  border-radius: 4px;
  background: var(--c-surface-soft);
  color: var(--c-text);
}
</style>
