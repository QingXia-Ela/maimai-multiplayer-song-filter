<script setup lang="ts">
import { onUnmounted } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

const UPDATE_INTERVAL_MS = 60 * 60 * 1000

let updateTimer: ReturnType<typeof setInterval> | undefined

const {
  offlineReady,
  needRefresh,
  updateServiceWorker,
} = useRegisterSW({
  onRegistered(registration) {
    if (!registration) return
    updateTimer = setInterval(() => registration.update(), UPDATE_INTERVAL_MS)
  },
})

function closePrompt() {
  offlineReady.value = false
  needRefresh.value = false
}

onUnmounted(() => {
  if (updateTimer) clearInterval(updateTimer)
})
</script>

<template>
  <aside
    v-if="offlineReady || needRefresh"
    class="pwaPrompt"
    role="status"
    aria-live="polite"
  >
    <p class="pwaPromptMessage">
      {{ offlineReady ? '应用已可离线使用。' : '发现新版本，刷新后即可使用。' }}
    </p>
    <div class="pwaPromptActions">
      <button
        v-if="needRefresh"
        type="button"
        class="pwaPromptButton pwaPromptButtonPrimary"
        @click="updateServiceWorker()"
      >
        立即刷新
      </button>
      <button type="button" class="pwaPromptButton" @click="closePrompt">
        {{ needRefresh ? '稍后' : '知道了' }}
      </button>
    </div>
  </aside>
</template>

<style scoped>
.pwaPrompt {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 20;
  width: min(360px, calc(100vw - 32px));
  padding: 14px;
  border: 1px solid var(--c-border-strong);
  border-radius: var(--r-card);
  background: var(--c-surface);
  color: var(--c-text);
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.pwaPromptMessage {
  margin: 0;
  color: var(--c-text-subtle);
}

.pwaPromptActions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}

.pwaPromptButton {
  min-height: 38px;
  padding: 8px 12px;
  border: 1px solid var(--c-input-border);
  border-radius: var(--r-input);
  background: var(--c-btn-bg);
  color: var(--c-text);
  cursor: pointer;
}

.pwaPromptButton:hover {
  background: var(--c-btn-bg-hover);
}

.pwaPromptButtonPrimary {
  border-color: var(--c-primary-border);
  background: var(--c-primary-bg);
  color: var(--c-primary);
}

.pwaPromptButtonPrimary:hover {
  background: var(--c-primary-bg-hover);
}

@media (max-width: 600px) {
  .pwaPrompt {
    right: 12px;
    bottom: 12px;
    width: calc(100vw - 24px);
  }
}
</style>
