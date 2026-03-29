<script setup lang="ts">
import {
  CropperImage,
  type CropperActionEventDetail,
  type CropperData,
  type CropperImageInstance,
} from '@xcvzmoon/vue-cropperjs';
import { computed, ref, useTemplateRef } from 'vue';
import ComposableDemo from './components/ComposableDemo.vue';

type EventItem = {
  detail?: string;
  name: string;
};

const cropperRef = useTemplateRef<CropperImageInstance>('cropperRef');
const exportUrl = ref<string | null>(null);
const stateSnapshot = ref<CropperData | null>(null);
const sourceUrl = ref('/sample-landscape.svg');
const eventLog = ref<EventItem[]>([]);
const canvasProps = { background: true, themeColor: '#d06b4d' };
const imageProps = { rotatable: true, scalable: true, translatable: true };
const selectionProps = { initialCoverage: 0.55, movable: true, outlined: true, resizable: true };

const hasExport = computed(() => exportUrl.value !== null);

function pushEvent(name: string, detail?: string) {
  eventLog.value = [{ detail, name }, ...eventLog.value].slice(0, 10);
}

function captureState() {
  stateSnapshot.value = cropperRef.value?.getData() ?? null;
}

async function exportSelection() {
  const canvas = await cropperRef.value?.toCanvas({ width: 360 });

  if (!canvas) {
    return;
  }

  exportUrl.value = canvas.toDataURL('image/png');
  pushEvent('toCanvas', 'exported current selection');
}

function resetCrop() {
  cropperRef.value?.resetImageTransform();
  cropperRef.value?.resetSelection();
  captureState();
  pushEvent('reset', 'image transform + selection');
}

function clearSelection() {
  cropperRef.value?.clearSelection();
  captureState();
  pushEvent('clearSelection');
}

function zoomIn() {
  cropperRef.value?.zoomImage(0.1);
  captureState();
  pushEvent('zoomImage', '+0.1');
}

function zoomOut() {
  cropperRef.value?.zoomImage(-0.1);
  captureState();
  pushEvent('zoomImage', '-0.1');
}

function rotateLeft() {
  cropperRef.value?.rotateImage('-15deg');
  captureState();
  pushEvent('rotateImage', '-15deg');
}

function rotateRight() {
  cropperRef.value?.rotateImage('15deg');
  captureState();
  pushEvent('rotateImage', '15deg');
}

function flipHorizontal() {
  cropperRef.value?.flipX();
  captureState();
  pushEvent('flipX');
}

function flipVertical() {
  cropperRef.value?.flipY();
  captureState();
  pushEvent('flipY');
}

function resetFlip() {
  cropperRef.value?.resetFlip();
  captureState();
  pushEvent('resetFlip');
}

function moveImageLeft() {
  cropperRef.value?.moveImage(-20, 0);
  captureState();
  pushEvent('moveImage', '-20,0');
}

function moveImageRight() {
  cropperRef.value?.moveImage(20, 0);
  captureState();
  pushEvent('moveImage', '20,0');
}

function nudgeSelectionLeft() {
  cropperRef.value?.moveSelection(-12, 0);
  captureState();
  pushEvent('moveSelection', '-12,0');
}

function nudgeSelectionRight() {
  cropperRef.value?.moveSelection(12, 0);
  captureState();
  pushEvent('moveSelection', '12,0');
}

function tightenSelection() {
  const data = cropperRef.value?.getData();

  if (!data) {
    return;
  }

  cropperRef.value?.changeSelection(
    data.selection.x + 10,
    data.selection.y + 10,
    Math.max(80, data.selection.width - 20),
    Math.max(80, data.selection.height - 20),
    data.selection.aspectRatio || undefined,
  );
  captureState();
  pushEvent('changeSelection', 'shrink inward');
}

function widenSelection() {
  const data = cropperRef.value?.getData();

  if (!data) {
    return;
  }

  cropperRef.value?.changeSelection(
    Math.max(0, data.selection.x - 10),
    Math.max(0, data.selection.y - 10),
    data.selection.width + 20,
    data.selection.height + 20,
    data.selection.aspectRatio || undefined,
  );
  captureState();
  pushEvent('changeSelection', 'expand outward');
}

function loadSampleLandscape() {
  sourceUrl.value = '/sample-landscape.svg';
  pushEvent('setImageSource', 'landscape asset');
}

function loadSamplePortrait() {
  sourceUrl.value = '/sample-portrait.svg';
  pushEvent('setImageSource', 'portrait asset');
}

function onReady() {
  captureState();
  pushEvent('ready');
}

function onError(error: Error) {
  pushEvent('error', error.message);
}

function onChange() {
  captureState();
  pushEvent('change', 'selection changed');
}

function onTransform() {
  captureState();
  pushEvent('transform', 'image matrix changed');
}

function onActionStart(event: CustomEvent<CropperActionEventDetail>) {
  pushEvent('action-start', event.detail.action);
}

function onActionEnd(event: CustomEvent<CropperActionEventDetail>) {
  pushEvent('action-end', event.detail.action);
}
</script>

<template>
  <main class="page-shell">
    <section class="intro-card">
      <p class="eyebrow">Vue 3 Showcase</p>
      <h1>Interactive API playground for the wrapper</h1>
      <p class="lede">
        This page demonstrates the component surface, emitted events, exposed instance methods, source switching, state
        inspection, canvas export, and a direct `useCropper()` example in one place.
      </p>
    </section>

    <section class="workspace-grid">
      <article class="panel cropper-panel">
        <div class="panel-header">
          <p class="panel-label">Editor</p>
          <p class="panel-copy">Drag the crop box directly, then use the buttons to exercise the public API.</p>
        </div>

        <CropperImage
          ref="cropperRef"
          :canvas-props="canvasProps"
          :image-props="imageProps"
          :selection-props="selectionProps"
          :src="sourceUrl"
          @action-end="onActionEnd"
          @action-start="onActionStart"
          @change="onChange"
          @error="onError"
          @ready="onReady"
          @transform="onTransform"
        />

        <div class="control-sections">
          <section>
            <p class="control-title">Sources</p>
            <div class="button-row">
              <button type="button" class="ghost-button" @click="loadSampleLandscape">Landscape</button>
              <button type="button" class="ghost-button" @click="loadSamplePortrait">Portrait</button>
            </div>
          </section>

          <section>
            <p class="control-title">Export and State</p>
            <div class="button-row">
              <button type="button" class="primary-button" @click="exportSelection">Export Selection</button>
              <button type="button" class="ghost-button" @click="captureState">Read State</button>
              <button type="button" class="ghost-button" @click="resetCrop">Reset Crop</button>
            </div>
          </section>

          <section>
            <p class="control-title">Image Methods</p>
            <div class="button-row">
              <button type="button" class="ghost-button" @click="zoomIn">Zoom In</button>
              <button type="button" class="ghost-button" @click="zoomOut">Zoom Out</button>
              <button type="button" class="ghost-button" @click="rotateLeft">Rotate Left</button>
              <button type="button" class="ghost-button" @click="rotateRight">Rotate Right</button>
              <button type="button" class="ghost-button" @click="flipHorizontal">Flip X</button>
              <button type="button" class="ghost-button" @click="flipVertical">Flip Y</button>
              <button type="button" class="ghost-button" @click="resetFlip">Reset Flip</button>
              <button type="button" class="ghost-button" @click="moveImageLeft">Move Image Left</button>
              <button type="button" class="ghost-button" @click="moveImageRight">Move Image Right</button>
            </div>
          </section>

          <section>
            <p class="control-title">Selection Methods</p>
            <div class="button-row">
              <button type="button" class="ghost-button" @click="nudgeSelectionLeft">Nudge Left</button>
              <button type="button" class="ghost-button" @click="nudgeSelectionRight">Nudge Right</button>
              <button type="button" class="ghost-button" @click="tightenSelection">Shrink</button>
              <button type="button" class="ghost-button" @click="widenSelection">Expand</button>
              <button type="button" class="ghost-button" @click="clearSelection">Clear Selection</button>
            </div>
          </section>
        </div>
      </article>

      <article class="panel preview-panel">
        <p class="panel-label">Export Preview</p>
        <img v-if="hasExport" :src="exportUrl ?? undefined" alt="Exported crop preview" />
        <p v-else class="empty-state">Run `toCanvas()` with the export button to preview the cropped output.</p>
      </article>

      <article class="panel state-panel">
        <p class="panel-label">Current State</p>
        <pre>{{ stateSnapshot }}</pre>
      </article>

      <article class="panel event-panel">
        <p class="panel-label">Event Log</p>
        <div v-if="eventLog.length" class="event-list">
          <div v-for="event in eventLog" :key="`${event.name}-${event.detail ?? ''}`" class="event-row">
            <strong>{{ event.name }}</strong>
            <span>{{ event.detail ?? 'triggered' }}</span>
          </div>
        </div>
        <p v-else class="empty-state">Interact with the cropper to see emitted events.</p>
      </article>

      <article class="panel api-panel">
        <p class="panel-label">Showcased APIs</p>
        <div class="api-columns">
          <div>
            <p class="control-title">Props</p>
            <ul>
              <li>`src`</li>
              <li>`canvasProps`</li>
              <li>`imageProps`</li>
              <li>`selectionProps`</li>
            </ul>
          </div>

          <div>
            <p class="control-title">Methods</p>
            <ul>
              <li>`toCanvas()`</li>
              <li>`getData()`</li>
              <li>`moveImage()`</li>
              <li>`zoomImage()`</li>
              <li>`rotateImage()`</li>
              <li>`flipX()`</li>
              <li>`flipY()`</li>
              <li>`resetFlip()`</li>
              <li>`moveSelection()`</li>
              <li>`changeSelection()`</li>
              <li>`resetSelection()`</li>
            </ul>
          </div>

          <div>
            <p class="control-title">Events</p>
            <ul>
              <li>`ready`</li>
              <li>`error`</li>
              <li>`change`</li>
              <li>`transform`</li>
              <li>`action-start`</li>
              <li>`action-end`</li>
            </ul>
          </div>
        </div>
      </article>
    </section>

    <ComposableDemo />
  </main>
</template>

<style scoped>
.page-shell {
  --paper: #f7f1e7;
  --ink: #211913;
  --muted: #6b5b50;
  --accent: #d06b4d;
  --accent-dark: #9a4a2f;
  --panel: rgba(255, 251, 246, 0.85);
  background:
    radial-gradient(circle at top left, rgba(208, 107, 77, 0.18), transparent 24%),
    radial-gradient(circle at bottom right, rgba(62, 102, 84, 0.16), transparent 22%),
    linear-gradient(135deg, #f1e7da 0%, var(--paper) 44%, #ece1d4 100%);
  color: var(--ink);
  min-height: 100vh;
  padding: 1.25rem;
}

.intro-card,
.panel {
  backdrop-filter: blur(18px);
  background: var(--panel);
  border: 1px solid rgba(33, 25, 19, 0.08);
  border-radius: 1.5rem;
  box-shadow: 0 24px 80px rgba(70, 49, 35, 0.12);
}

.intro-card {
  margin: 0 auto 1rem;
  max-width: 1200px;
  padding: 1.5rem;
}

.eyebrow,
.panel-label,
.control-title {
  color: var(--accent);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  margin: 0 0 0.75rem;
  text-transform: uppercase;
}

h1 {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2rem, 4vw, 4rem);
  line-height: 0.95;
  margin: 0;
}

.lede,
.panel-copy,
.empty-state {
  color: var(--muted);
  line-height: 1.6;
  margin: 0;
}

.workspace-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 2fr) minmax(20rem, 1fr);
  margin: 0 auto;
  max-width: 1200px;
}

.panel {
  padding: 1rem;
}

.cropper-panel {
  grid-row: span 3;
}

.panel-header {
  margin-bottom: 1rem;
}

.control-sections {
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
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease;
}

button:hover {
  transform: translateY(-1px);
}

.primary-button {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
  box-shadow: 0 12px 30px rgba(154, 74, 47, 0.24);
  color: #fff9f4;
}

.ghost-button {
  background: rgba(255, 255, 255, 0.7);
  color: var(--ink);
}

:deep([data-vue-cropper-root]) {
  min-height: 22rem;
}

:deep(cropper-canvas) {
  border-radius: 1rem;
  height: min(56vw, 34rem);
  min-height: 20rem;
  overflow: hidden;
}

.preview-panel img {
  border-radius: 1rem;
  display: block;
  max-width: 100%;
}

.state-panel pre,
.event-list,
.api-panel ul {
  background: rgba(33, 25, 19, 0.92);
  border-radius: 1rem;
  color: #f9efe6;
  font-size: 0.85rem;
  margin: 0;
  overflow: auto;
  padding: 1rem;
}

.state-panel pre {
  white-space: pre-wrap;
}

.event-list {
  display: grid;
  gap: 0.75rem;
}

.event-row {
  display: grid;
  gap: 0.2rem;
}

.event-row strong {
  color: #ffd8c8;
}

.api-columns {
  display: grid;
  gap: 1rem;
}

.api-panel ul {
  list-style: none;
}

.api-panel li + li {
  margin-top: 0.45rem;
}

@media (min-width: 920px) {
  .api-columns {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 920px) {
  .workspace-grid {
    grid-template-columns: 1fr;
  }

  .cropper-panel {
    grid-row: auto;
  }
}

@media (max-width: 640px) {
  .page-shell {
    padding: 0.75rem;
  }

  .intro-card,
  .panel {
    border-radius: 1rem;
  }

  :deep(cropper-canvas) {
    height: 20rem;
  }
}
</style>
