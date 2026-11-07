<script setup>
defineProps({
  listening: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  actionLabel: { type: String, default: 'voice input' },
})
defineEmits(['click'])
</script>

<template>
  <button class="mic-button" :class="{ listening }" type="button" :disabled="disabled" :aria-label="listening ? `Stop ${actionLabel}` : `Start ${actionLabel}`" @click="$emit('click')">
    {{ listening ? '■' : '🎙' }}
  </button>
</template>
