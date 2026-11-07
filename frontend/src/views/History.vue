<script setup>
import { computed, ref } from 'vue'
import TranslationCard from '../components/TranslationCard.vue'

const search = ref('')
const history = ref(JSON.parse(localStorage.getItem('talkbridge.history') || '[]'))
const filteredHistory = computed(() => history.value.filter((item) => `${item.source} ${item.translated} ${item.sourceLanguage} ${item.targetLanguage}`.toLowerCase().includes(search.value.toLowerCase())))

function clearHistory() {
  history.value = []
  localStorage.removeItem('talkbridge.history')
}
</script>

<template>
  <div class="page-heading"><div><p class="eyebrow">Words worth keeping</p><h1>Your history</h1><p>Your saved translations, right here on this device.</p></div><button v-if="history.length" class="button button-secondary" type="button" @click="clearHistory">Clear history</button></div>
  <div class="history-toolbar"><span class="pill">{{ history.length }} {{ history.length === 1 ? 'translation' : 'translations' }}</span><input v-model="search" class="field history-search" placeholder="Search your translations" aria-label="Search translation history" /></div>
  <section v-if="filteredHistory.length" class="card history-list">
    <TranslationCard v-for="(item, index) in filteredHistory" :key="`${item.time}-${index}`" :source="item.source" :translated="item.translated" :source-language="item.sourceLanguage" :target-language="item.targetLanguage" :time="new Date(item.time).toLocaleString()" />
  </section>
  <section v-else class="card empty-state"><div class="empty-state-icon">⌕</div><h3>{{ search ? 'No matching translations' : 'Your history is waiting' }}</h3><p>{{ search ? 'Try another phrase or language.' : 'Translations you make will be saved here on this device.' }}</p><RouterLink v-if="!search" class="button button-primary" style="margin-top: 18px" to="/translate">Translate a phrase</RouterLink></section>
</template>
