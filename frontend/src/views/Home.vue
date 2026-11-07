<script setup>
const features = [
  { icon: '↔', title: 'Instant translation', description: 'Turn what you mean into the words someone else understands, in a moment.' },
  { icon: '◉', title: 'Natural voice', description: 'Speak naturally and listen back with accessible, built-in voice tools.' },
  { icon: '✦', title: 'Made for people', description: 'A calm, clear space for everyday conversations across languages.' },
]
</script>

<template>
  <section class="hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">A little closer, in any language</p>
      <h1>Speak without<br /><span>borders.</span></h1>
      <p>Make every conversation feel more human. TalkBridge helps you understand and be understood, wherever life takes you.</p>
      <div class="hero-actions">
        <RouterLink class="button button-primary" to="/translate">Start translating <span aria-hidden="true">→</span></RouterLink>
        <RouterLink class="button button-secondary" to="/conversation">Open conversation</RouterLink>
      </div>
      <div class="trust-row">
        <div class="avatar-stack" aria-hidden="true"><span>AM</span><span>JL</span><span>SK</span><span>+</span></div>
        <span>A more thoughtful way to connect</span>
      </div>
    </div>
    <div class="card demo-card" aria-label="Example translation">
      <div class="demo-top"><h3>A conversation, connected</h3><span class="pill"><span class="dot"></span> Live demo</span></div>
      <div class="demo-lines">
        <div class="demo-line">
          <div class="demo-language"><span>🇺🇸</span> English · Original</div>
          <p>It's lovely to finally meet you. How was your trip?</p>
        </div>
        <div class="demo-arrow" aria-hidden="true">↓</div>
        <div class="demo-line translated">
          <div class="demo-language"><span>🇪🇸</span> Spanish · Translation</div>
          <p>Qué alegría conocerte por fin. ¿Qué tal estuvo tu viaje?</p>
        </div>
      </div>
      <div class="demo-bottom"><span>✦ &nbsp; Natural, thoughtful translations</span><span>0.8 sec</span></div>
    </div>
  </section>

  <section class="feature-section">
    <div class="section-title"><p class="eyebrow">Connection comes first</p><h2>Words bring us together.</h2><p>Everything you need to make the distance between languages feel smaller.</p></div>
    <div class="feature-grid">
      <article v-for="feature in features" :key="feature.title" class="card feature-card">
        <div class="feature-icon">{{ feature.icon }}</div>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.description }}</p>
      </article>
    </div>
  </section>
</template>
