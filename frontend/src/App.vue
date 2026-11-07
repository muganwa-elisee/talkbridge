<script setup>
import Navbar from './components/Navbar.vue'
import PwaUpdatePrompt from './components/PwaUpdatePrompt.vue'
</script>

<template>
  <div class="app-shell">
    <Navbar />
    <main class="page-shell">
      <RouterView />
    </main>
    <footer class="site-footer">
      <span class="brand-mark brand-mark-small">t</span>
      <span>TalkBridge · Make every conversation count.</span>
      <span class="footer-note">Your voice, understood.</span>
    </footer>
    <PwaUpdatePrompt />
  </div>
</template>
