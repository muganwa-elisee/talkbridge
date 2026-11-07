<script setup>
import { ref } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

const registrationError = ref('')
const {
  offlineReady,
  needRefresh,
  updateServiceWorker,
} = useRegisterSW({
  onRegisterError(error) {
    registrationError.value = `Offline support could not start: ${error.message}`
  },
})

function dismiss() {
  offlineReady.value = false
  needRefresh.value = false
  registrationError.value = ''
}
</script>

<template>
  <aside v-if="offlineReady || needRefresh || registrationError" class="pwa-notice" role="status" aria-live="polite">
    <p v-if="registrationError" class="pwa-notice-message">{{ registrationError }}</p>
    <p v-else-if="needRefresh" class="pwa-notice-message">A TALKBRIDGE update is ready. Refresh when you’re ready to load it.</p>
    <p v-else class="pwa-notice-message">TALKBRIDGE is ready for offline use.</p>
    <button v-if="needRefresh" class="button button-primary pwa-notice-action" type="button" @click="updateServiceWorker(true)">
      Refresh
    </button>
    <button class="button button-secondary pwa-notice-action" type="button" @click="dismiss">
      Dismiss
    </button>
  </aside>
</template>
