<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  songId: number
  title: string
}>()

const sourceIndex = ref(0)
const coverElement = ref<HTMLElement | null>(null)
const shouldLoad = ref(false)
let observer: IntersectionObserver | null = null

const sources = computed(() => [
  `https://assets2.lxns.net/maimai/jacket/${props.songId}.png`,
  `https://www.diving-fish.com/covers/${String(props.songId).padStart(5, '0')}.png`,
])

const currentSource = computed(() => sources.value[sourceIndex.value] ?? null)

function useFallback() {
  sourceIndex.value += 1
}

async function startLoading() {
  if (shouldLoad.value) return
  shouldLoad.value = true
  observer?.disconnect()
  observer = null
}

onMounted(() => {
  if (!('IntersectionObserver' in window)) {
    startLoading()
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) startLoading()
    },
    { rootMargin: '0px' },
  )

  if (coverElement.value) observer.observe(coverElement.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <div ref="coverElement" class="cover">
    <img
      v-if="shouldLoad && currentSource"
      :src="currentSource"
      :alt="`${title} 封面`"
      decoding="async"
      @error="useFallback"
    />
    <span v-else-if="shouldLoad && !currentSource" aria-hidden="true">无封面</span>
  </div>
</template>

<style scoped>
.cover {
  width: 72px;
  height: 72px;
  flex: 0 0 72px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 1px solid var(--c-border-soft);
  border-radius: 10px;
  background: var(--c-surface-soft);
  color: var(--c-text-weaker);
  font-size: 11px;
}

.cover img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

@media (max-width: 520px) {
  .cover {
    width: 64px;
    height: 64px;
    flex-basis: 64px;
  }
}
</style>
