<script setup>
import { ref, watch } from 'vue'

const preferences = ref(JSON.parse(localStorage.getItem('talkbridge.preferences') || '{"autoSpeak":false,"saveHistory":true,"compactView":false}'))
watch(preferences, (value) => localStorage.setItem('talkbridge.preferences', JSON.stringify(value)), { deep: true })
const preferencesList = [
  { key: 'autoSpeak', title: 'Play translations aloud', description: 'Automatically speak translations after they are ready.' },
  { key: 'saveHistory', title: 'Save translation history', description: 'Keep translations in this browser so you can find them again.' },
  { key: 'compactView', title: 'Compact layout', description: 'Use a denser layout for the translation workspace.' },
]
</script>

<template>
  <div class="page-heading"><div><p class="eyebrow">Make it feel like yours</p><h1>Preferences</h1><p>Choose how TalkBridge works best for you.</p></div></div>
  <div class="settings-layout">
    <aside class="card settings-tabs"><button class="settings-tab active" type="button">General</button><button class="settings-tab" type="button" @click="$router.push('/history')">History & privacy</button></aside>
    <section class="card settings-panel">
      <h2>General</h2><p class="muted" style="font-size: 13px">Your preferences are stored locally in this browser.</p>
      <div v-for="item in preferencesList" :key="item.key" class="toggle-row">
        <div><strong style="font-size: 13px">{{ item.title }}</strong><p class="setting-description">{{ item.description }}</p></div>
        <button class="toggle" :class="{ on: preferences[item.key] }" type="button" role="switch" :aria-checked="preferences[item.key]" :aria-label="item.title" @click="preferences[item.key] = !preferences[item.key]"></button>
      </div>
      <div class="settings-field"><label class="form-label" for="default-language">Default source language</label><select id="default-language" class="select-field"><option>English</option><option>Spanish</option><option>French</option><option>German</option></select><p class="setting-description">You can change your language pair any time in the translator.</p></div>
      <div class="notice">TalkBridge saves your preferences and translation history on this device. Clearing browser data will remove them.</div>
    </section>
  </div>
</template>
