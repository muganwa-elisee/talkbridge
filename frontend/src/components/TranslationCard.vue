<script setup>
defineProps({
  source: { type: String, required: true },
  translated: { type: String, required: true },
  sourceLanguage: { type: String, default: 'Original' },
  targetLanguage: { type: String, default: 'Translation' },
  time: { type: String, default: '' },
})
</script>

<template>
  <article class="card history-item">
    <div>
      <p class="history-phrase">{{ source }}</p>
      <p class="history-sub">{{ translated }}</p>
    </div>
    <span class="history-lang">{{ sourceLanguage }} → {{ targetLanguage }}</span>
    <span class="history-time">{{ time }}</span>
  </article>
</template>
