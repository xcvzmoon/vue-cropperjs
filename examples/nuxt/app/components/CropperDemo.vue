<script setup lang="ts">
import type { CropperData, CropperImageInstance } from '@xcvzmoon/vue-cropperjs';

const cropperRef = useTemplateRef<CropperImageInstance>('cropperRef');
const previewUrl = ref<string | null>(null);
const stateSnapshot = ref<CropperData | null>(null);
const src = ref('/sample-landscape.svg');
const canvasProps = { background: true, themeColor: '#bb5a3c' };
const imageProps = { rotatable: true, scalable: true, translatable: true };
const selectionProps = { initialCoverage: 0.5, movable: true, outlined: true, resizable: true };

async function exportSelection() {
  const canvas = await cropperRef.value?.toCanvas({ width: 320 });

  if (!canvas) {
    return;
  }

  previewUrl.value = canvas.toDataURL('image/png');
}

function resetCrop() {
  cropperRef.value?.resetImageTransform();
  cropperRef.value?.resetSelection();
  stateSnapshot.value = cropperRef.value?.getData() ?? null;
}

function flipHorizontal() {
  cropperRef.value?.flipX();
  stateSnapshot.value = cropperRef.value?.getData() ?? null;
}

function flipVertical() {
  cropperRef.value?.flipY();
  stateSnapshot.value = cropperRef.value?.getData() ?? null;
}

function resetFlip() {
  cropperRef.value?.resetFlip();
  stateSnapshot.value = cropperRef.value?.getData() ?? null;
}

function loadAlternateSource() {
  src.value = src.value === '/sample-landscape.svg' ? '/sample-portrait.svg' : '/sample-landscape.svg';
}

function captureState() {
  stateSnapshot.value = cropperRef.value?.getData() ?? null;
}
</script>

<template>
  <div class="demo-grid">
    <div class="cropper-card">
      <ClientOnly>
        <AppCropperImage
          ref="cropperRef"
          :canvas-props="canvasProps"
          :image-props="imageProps"
          :selection-props="selectionProps"
          :src="src"
        />
      </ClientOnly>

      <div class="actions">
        <button type="button" class="primary-button" @click="exportSelection">Export Selection</button>
        <button type="button" class="ghost-button" @click="captureState">Read State</button>
        <button type="button" class="ghost-button" @click="flipHorizontal">Flip X</button>
        <button type="button" class="ghost-button" @click="flipVertical">Flip Y</button>
        <button type="button" class="ghost-button" @click="resetFlip">Reset Flip</button>
        <button type="button" class="ghost-button" @click="resetCrop">Reset Crop</button>
        <button type="button" class="ghost-button" @click="loadAlternateSource">Switch Source</button>
      </div>
    </div>

    <div class="preview-card">
      <p class="panel-label">Preview</p>
      <img v-if="previewUrl" :src="previewUrl" alt="Exported crop preview" />
      <p v-else class="preview-empty">Export a selection to preview the result here.</p>
    </div>

    <div class="state-card">
      <p class="panel-label">Current State</p>
      <pre>{{ stateSnapshot }}</pre>
    </div>
  </div>
</template>

<style scoped>
.demo-grid {
  display: grid;
  gap: 1rem;
}

.cropper-card,
.preview-card,
.state-card {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(31, 26, 23, 0.08);
  border-radius: 1.25rem;
  padding: 1rem;
}

.panel-label {
  color: #bb5a3c;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  margin: 0 0 0.75rem;
  text-transform: uppercase;
}

:deep([data-vue-cropper-root]) {
  min-height: 20rem;
}

:deep(cropper-canvas) {
  border-radius: 1rem;
  height: min(60vw, 28rem);
  min-height: 18rem;
  overflow: hidden;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

button {
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  font: inherit;
  padding: 0.85rem 1.2rem;
}

.primary-button {
  background: #1f1a17;
  color: #fffaf5;
}

.ghost-button {
  background: rgba(255, 255, 255, 0.74);
  color: #1f1a17;
}

.preview-card img {
  border-radius: 0.75rem;
  display: block;
  max-width: 100%;
}

.preview-empty {
  color: #62554d;
  margin: 0;
}

.state-card pre {
  background: rgba(31, 26, 23, 0.92);
  border-radius: 0.85rem;
  color: #fffaf5;
  margin: 0;
  overflow: auto;
  padding: 1rem;
  white-space: pre-wrap;
}

@media (min-width: 880px) {
  .demo-grid {
    grid-template-columns: minmax(0, 2fr) minmax(18rem, 1fr);
  }

  .cropper-card {
    grid-row: span 2;
  }
}
</style>
