<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const menuOpen = ref(false)
const links = [
  { label: 'Home', to: '/' },
  { label: 'Translator', to: '/translate' },
  { label: 'Conversation', to: '/conversation' },
  { label: 'History', to: '/history' },
]
</script>

<template>
  <header class="navbar">
    <RouterLink class="brand" to="/" @click="menuOpen = false">
      <span class="brand-mark">t</span>
      <span class="brand-name">talk<span>bridge</span></span>
    </RouterLink>
    <button class="menu-toggle" type="button" :aria-expanded="menuOpen" aria-label="Toggle navigation" @click="menuOpen = !menuOpen">
      {{ menuOpen ? '×' : '☰' }}
    </button>
    <nav class="nav-links" :class="{ open: menuOpen }" aria-label="Main navigation">
      <RouterLink v-for="link in links" :key="link.to" class="nav-link" :class="{ 'nav-link-active': route.path === link.to }" :to="link.to" @click="menuOpen = false">
        {{ link.label }}
      </RouterLink>
    </nav>
    <div class="nav-actions">
      <RouterLink class="button button-quiet" to="/settings">Preferences</RouterLink>
      <span class="avatar" aria-label="Guest profile">TB</span>
    </div>
  </header>
</template>
