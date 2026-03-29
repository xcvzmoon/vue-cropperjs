<script setup lang="ts">
import { useCropper } from '@xcvzmoon/vue-cropperjs';
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';

const imageRef = useTemplateRef<HTMLImageElement | null>('imageRef');
const exportUrl = ref<string | null>(null);
const sourceUrl = ref('/sample-portrait.svg');
const cropper = useCropper(imageRef, { syncData: 'events' });

const errorMessage = computed(() => cropper.error.value?.message ?? 'None');
const liveData = computed(() => cropper.data.value);
const statusText = computed(() => {
  if (cropper.error.value) {
    return 'Error';
  }

  if (cropper.isInitializing.value) {
    return 'Initializing';
  }

  if (cropper.isReady.value) {
    return 'Ready';
  }

  return 'Idle';
});

async function initialize() {
  try {
    await cropper.init();
  } catch {
    // Error state is exposed through the composable refs.
  }
}

async function changeSource(nextSource: string) {
  sourceUrl.value = nextSource;

  try {
    await cropper.setImageSource(nextSource);
  } catch {
    // Error state is exposed through the composable refs.
  }
}

async function exportSelection() {
  const canvas = await cropper.toCanvas({ width: 280 });

  if (!canvas) {
    return;
  }

  exportUrl.value = canvas.toDataURL('image/png');
}

function refreshSnapshot() {
  cropper.refreshData();
}

function resetAll() {
  cropper.resetImageTransform();
  cropper.resetSelection();
  cropper.refreshData();
}

function zoomIn() {
  cropper.zoomImage(0.1);
}

function rotate() {
  cropper.rotateImage('15deg');
}

function flipX() {
  cropper.flipX();
}

function moveSelection() {
  cropper.moveSelection(16, 0);
}

onMounted(() => {
  initialize();
});

onBeforeUnmount(() => {
  cropper.destroy();
});
</script>

<template>
  <section class="composable-shell">
    <div class="composable-head">
      <div>
        <p class="eyebrow">Composable Demo</p>
        <h2>Direct `useCropper()` integration</h2>
        <p class="copy">
          This section skips `CropperImage` and uses `useCropper(imageRef, { syncData: 'events' })` directly.
        </p>
      </div>

      <div class="status-grid">
        <div>
          <span class="status-label">Status</span>
          <strong>{{ statusText }}</strong>
        </div>
        <div>
          <span class="status-label">Sync Mode</span>
          <strong>`events`</strong>
        </div>
        <div>
          <span class="status-label">Error</span>
          <strong>{{ errorMessage }}</strong>
        </div>
      </div>
    </div>

    <div class="composable-grid">
      <article class="panel stage-panel">
        <p class="panel-label">Stage</p>
        <div class="stage-wrap">
          <img ref="imageRef" :src="sourceUrl" alt="Composable cropper source image" />
        </div>

        <div class="button-groups">
          <div>
            <p class="control-title">Sources</p>
            <div class="button-row">
              <button type="button" class="ghost-button" @click="changeSource('/sample-landscape.svg')">
                Landscape
              </button>
              <button type="button" class="ghost-button" @click="changeSource('/sample-portrait.svg')">Portrait</button>
            </div>
          </div>

          <div>
            <p class="control-title">Composable Actions</p>
            <div class="button-row">
              <button type="button" class="primary-button" @click="exportSelection">Export</button>
              <button type="button" class="ghost-button" @click="refreshSnapshot">Refresh Data</button>
              <button type="button" class="ghost-button" @click="resetAll">Reset</button>
              <button type="button" class="ghost-button" @click="zoomIn">Zoom In</button>
              <button type="button" class="ghost-button" @click="rotate">Rotate</button>
              <button type="button" class="ghost-button" @click="flipX">Flip X</button>
              <button type="button" class="ghost-button" @click="moveSelection">Move Selection</button>
            </div>
          </div>
        </div>
      </article>

      <article class="panel data-panel">
        <p class="panel-label">Reactive State</p>
        <pre>{{ liveData }}</pre>
      </article>

      <article class="panel export-panel">
        <p class="panel-label">Export Preview</p>
        <img v-if="exportUrl" :src="exportUrl" alt="Composable export preview" />
        <p v-else class="empty-state">Use `toCanvas()` through the composable to generate a preview.</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.composable-shell {
  backdrop-filter: blur(18px);
  background: rgba(255, 251, 246, 0.85);
  border: 1px solid rgba(33, 25, 19, 0.08);
  border-radius: 1.5rem;
  box-shadow: 0 24px 80px rgba(70, 49, 35, 0.12);
  margin: 1rem auto 0;
  max-width: 1200px;
  padding: 1rem;
}

.composable-head {
  display: grid;
  gap: 1rem;
}

.eyebrow,
.panel-label,
.control-title,
.status-label {
  color: #d06b4d;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  margin: 0 0 0.75rem;
  text-transform: uppercase;
}

h2 {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.6rem, 3vw, 2.6rem);
  line-height: 1;
  margin: 0;
}

.copy,
.empty-state {
  color: #6b5b50;
  line-height: 1.6;
  margin: 0;
}

.status-grid {
  display: grid;
  gap: 0.75rem;
}

.status-grid > div,
.panel {
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(33, 25, 19, 0.08);
  border-radius: 1rem;
  padding: 1rem;
}

.status-grid strong {
  display: block;
}

.composable-grid {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.stage-wrap {
  min-height: 18rem;
}

.stage-wrap img {
  display: block;
  max-width: 100%;
}

.button-groups {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

button {
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  font: inherit;
  padding: 0.85rem 1.15rem;
}

.primary-button {
  background: linear-gradient(135deg, #d06b4d 0%, #9a4a2f 100%);
  color: #fff9f4;
}

.ghost-button {
  background: rgba(255, 255, 255, 0.76);
  color: #211913;
}

.data-panel pre {
  background: rgba(33, 25, 19, 0.92);
  border-radius: 1rem;
  color: #f9efe6;
  font-size: 0.85rem;
  margin: 0;
  overflow: auto;
  padding: 1rem;
  white-space: pre-wrap;
}

.export-panel img {
  border-radius: 1rem;
  display: block;
  max-width: 100%;
}

@media (min-width: 860px) {
  .composable-head {
    grid-template-columns: minmax(0, 2fr) minmax(16rem, 1fr);
  }

  .status-grid {
    grid-template-columns: 1fr;
  }

  .composable-grid {
    grid-template-columns: minmax(0, 1.8fr) minmax(18rem, 1fr);
  }

  .stage-panel {
    grid-row: span 2;
  }
}
</style>
