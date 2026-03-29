<template>
  <main class="page-shell">
    <section class="hero-panel">
      <p class="eyebrow">Nuxt 4 Example</p>
      <h1>Client-only crop workflow with auto-imported wrappers</h1>
      <p class="intro">
        This demo shows the recommended Nuxt usage: a client-only wrapper component and a composable wrapper that Nuxt
        auto-imports from your app.
      </p>
    </section>

    <section class="demo-panel">
      <CropperDemo />
    </section>
  </main>
</template>

<style scoped>
.page-shell {
  --paper: #f4efe7;
  --ink: #1f1a17;
  --muted: #62554d;
  --accent: #bb5a3c;
  --panel: rgba(255, 250, 245, 0.82);
  align-items: center;
  background:
    radial-gradient(circle at top left, rgba(187, 90, 60, 0.18), transparent 28%),
    radial-gradient(circle at bottom right, rgba(74, 111, 88, 0.2), transparent 24%),
    linear-gradient(135deg, #efe6da 0%, var(--paper) 45%, #e7ddd0 100%);
  color: var(--ink);
  display: grid;
  gap: 1.5rem;
  min-height: 100vh;
  padding: 2rem;
}

.hero-panel,
.demo-panel {
  backdrop-filter: blur(16px);
  background: var(--panel);
  border: 1px solid rgba(31, 26, 23, 0.08);
  border-radius: 1.5rem;
  box-shadow: 0 24px 80px rgba(58, 43, 31, 0.12);
  margin: 0 auto;
  max-width: 960px;
  padding: 1.5rem;
  width: 100%;
}

.eyebrow {
  color: var(--accent);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 0.85rem;
  letter-spacing: 0.18em;
  margin: 0 0 0.5rem;
  text-transform: uppercase;
}

h1 {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2rem, 4vw, 3.75rem);
  line-height: 0.95;
  margin: 0;
}

.intro {
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.6;
  margin: 1rem 0 0;
  max-width: 42rem;
}

@media (max-width: 640px) {
  .page-shell {
    padding: 1rem;
  }

  .hero-panel,
  .demo-panel {
    border-radius: 1rem;
    padding: 1rem;
  }
}
</style>
