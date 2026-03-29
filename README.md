# @xcvzmoon/vue-cropperjs

[![CI](https://img.shields.io/github/actions/workflow/status/xcvzmoon/vue-cropperjs/ci.yaml?branch=main&color=black)](https://github.com/xcvzmoon/vue-cropperjs/actions/workflows/ci.yaml)
[![license](https://img.shields.io/github/license/xcvzmoon/vue-cropperjs?color=black)](https://github.com/xcvzmoon/vue-cropperjs/blob/main/LICENSE)
[![npm version](https://img.shields.io/npm/v/%40xcvzmoon%2Fvue-cropperjs?color=black)](https://www.npmjs.com/package/@xcvzmoon/vue-cropperjs)
[![npm downloads](https://img.shields.io/npm/dm/%40xcvzmoon%2Fvue-cropperjs?color=black)](https://www.npmjs.com/package/@xcvzmoon/vue-cropperjs)

Vue 3 wrapper for [Cropper.js 2](https://github.com/fengyuanchen/cropperjs) with a Vue-native component and composable API.

- Vue 3 only
- Cropper.js 2 only

## Install

```bash
pnpm add @xcvzmoon/vue-cropperjs cropperjs
```

Import Cropper's CSS in your app entry, layout, or component tree:

```ts
import 'cropperjs/dist/cropper.css';
```

## Basic usage

```vue
<script setup lang="ts">
import { CropperImage } from '@xcvzmoon/vue-cropperjs';

const src = 'https://fengyuanchen.github.io/cropperjs/picture.jpg';
</script>

<template>
  <CropperImage
    :canvas-props="{ background: true }"
    :image-props="{ rotatable: true, scalable: true, translatable: true }"
    :selection-props="{ initialCoverage: 0.5, movable: true, resizable: true }"
    :src="src"
  />
</template>
```

## Template ref usage

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { CropperImage, type CropperImageInstance } from '@xcvzmoon/vue-cropperjs';

const cropperRef = useTemplateRef<CropperImageInstance>('cropperRef');

async function exportSelection() {
  const canvas = await cropperRef.value?.toCanvas({ width: 320 });
  if (!canvas) return;

  const dataUrl = canvas.toDataURL('image/png');
  console.log(dataUrl);
}
</script>

<template>
  <CropperImage ref="cropperRef" :src="'/image.jpg'" />
  <button type="button" @click="exportSelection">Export</button>
</template>
```

## v-model:data

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { CropperImage, type CropperData } from '@xcvzmoon/vue-cropperjs';

const cropData = ref<CropperData | null>(null);
</script>

<template>
  <CropperImage
    v-model:data="cropData"
    :image-props="{ rotatable: true, scalable: true, translatable: true }"
    :selection-props="{ initialCoverage: 0.5, movable: true, resizable: true }"
    :src="'/image.jpg'"
  />

  <pre>{{ cropData }}</pre>
</template>
```

`data: null` resets the image transform and selection back to Cropper's default state.

## useCropper

```vue
<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue';
import { useCropper } from '@xcvzmoon/vue-cropperjs';

const imageRef = useTemplateRef<HTMLImageElement | null>('imageRef');
const cropper = useCropper(imageRef);

onMounted(async () => {
  await cropper.init();
  cropper.zoomImage(0.1);
});
</script>

<template>
  <img ref="imageRef" alt="Example" src="/image.jpg" />
</template>
```

The composable is useful when you want full control over markup and lifecycle while still getting the typed helper methods.

## Public API

### Component props

| Prop             | Type                                     | Notes                                                             |
| ---------------- | ---------------------------------------- | ----------------------------------------------------------------- |
| `src`            | `string`                                 | Image source                                                      |
| `alt`            | `string`                                 | Forwarded to Cropper's internal `cropper-image`                   |
| `crossorigin`    | `'' \| 'anonymous' \| 'use-credentials'` | Forwarded to the internal image element                           |
| `data`           | `CropperData \| null`                    | Two-way crop state via `v-model:data`                             |
| `initOptions`    | `CropperInitOptions`                     | Init-only root options; currently `container` and `template` only |
| `imageProps`     | `CropperImageElementProps`               | Live props for the internal `cropper-image`                       |
| `selectionProps` | `CropperSelectionProps`                  | Live props for the internal `cropper-selection`                   |
| `canvasProps`    | `CropperCanvasProps`                     | Live props for the internal `cropper-canvas`                      |

### Prop object shapes

`imageProps`

- `initialCenterSize`
- `rotatable`
- `scalable`
- `skewable`
- `slottable`
- `translatable`

`selectionProps`

- `x`, `y`, `width`, `height`
- `aspectRatio`, `initialAspectRatio`, `initialCoverage`
- `dynamic`, `movable`, `resizable`, `zoomable`
- `multiple`, `keyboard`, `outlined`, `precise`

`canvasProps`

- `background`
- `disabled`
- `scaleStep`
- `themeColor`

### Emits

| Event          | Payload                                    | Notes                                 |
| -------------- | ------------------------------------------ | ------------------------------------- |
| `ready`        | `CropperInstance`                          | Fired after init and source readiness |
| `error`        | `Error`                                    | Fired on init or source load failure  |
| `action-start` | `CustomEvent<CropperActionEventDetail>`    | Forwarded from `cropper-canvas`       |
| `action-move`  | `CustomEvent<CropperActionEventDetail>`    | Forwarded from `cropper-canvas`       |
| `action-end`   | `CustomEvent<CropperActionEventDetail>`    | Forwarded from `cropper-canvas`       |
| `action`       | `CustomEvent<CropperActionEventDetail>`    | Forwarded from `cropper-canvas`       |
| `change`       | `CustomEvent<CropperChangeEventDetail>`    | Forwarded from `cropper-selection`    |
| `transform`    | `CustomEvent<CropperTransformEventDetail>` | Forwarded from `cropper-image`        |
| `update:data`  | `CropperData \| null`                      | Fired when crop state changes         |

### Event detail types

`CropperActionEventDetail`

- `action`
- `relatedEvent`
- optional `scale`, `rotate`, `startX`, `startY`, `endX`, `endY`

`CropperChangeEventDetail`

- `x`, `y`, `width`, `height`

`CropperTransformEventDetail`

- `matrix`
- `oldMatrix`

### Exposed component methods

Getters

- `getInstance(): CropperInstance | null`
- `getCanvas(): CropperCanvasElement | null`
- `getImage(): CropperImageElementInstance | null`
- `getSelection(): CropperSelectionElement | null`
- `getSelections(): NodeListOf<CropperSelectionElement> | null`
- `getData(): CropperData | null`
- `getImageTransform(): CropperImageTransform | null`

Image actions

- `setImageSource(src): Promise<CropperImageElementInstance | null>`
- `moveImage(x, y?)`
- `moveImageTo(x, y?)`
- `zoomImage(scale, x?, y?)`
- `rotateImage(angle, x?, y?)`
- `scaleImage(x, y?)`
- `setImageTransform(transform)`
- `resetImageTransform()`

Selection actions

- `resetSelection()`
- `clearSelection()`
- `moveSelection(x, y?)`
- `moveSelectionTo(x, y?)`
- `changeSelection(x, y, width?, height?, aspectRatio?)`
- `zoomSelection(scale, x?, y?)`

Export and state

- `toCanvas(options?): Promise<HTMLCanvasElement | null>`
- `setData(data): CropperData | null`
- `destroy(): void`

### Composable return value

`useCropper()` returns the same typed action surface used by the component expose API, plus:

- `cropper`: `ShallowRef<CropperInstance | null>`
- `elementRef`: `Ref<HTMLImageElement | null>`
- `init(options?): Promise<CropperInstance | null>`

## Types

Useful exported types:

- `CropperImageInstance`
- `CropperImageProps`
- `CropperImageEmits`
- `CropperData`
- `CropperInitOptions`
- `CropperCanvasOptions`
- `CropperImageTransform`
- `CropperCanvasElement`
- `CropperImageElementInstance`
- `CropperSelectionElement`

## Reactive behavior

These props are designed for live updates after mount:

- `src`
- `alt`
- `crossorigin`
- `data`
- `imageProps`
- `selectionProps`
- `canvasProps`

These values should be treated as init-time configuration:

- `initOptions.container`
- `initOptions.template`
- any setup that changes the internal Cropper element structure

If you need to change init-time structure, recreate the component instead of expecting a seamless hot update.

## Error behavior

- the component emits `error` when Cropper initialization fails
- the component emits `error` when the source image fails to load
- `setImageSource()` throws if Cropper's internal image `$ready()` flow rejects

## Nuxt 3

Use the component only on the client because Cropper depends on the DOM.

```vue
<template>
  <ClientOnly>
    <CropperImage
      v-model:data="cropData"
      :image-props="{ rotatable: true, scalable: true, translatable: true }"
      :selection-props="{ initialCoverage: 0.5, movable: true, resizable: true }"
      :src="src"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CropperImage, type CropperData } from '@xcvzmoon/vue-cropperjs';

const cropData = ref<CropperData | null>(null);
const src = '/images/example.jpg';
</script>
```

If you want Nuxt auto-imports without creating a Nuxt module, add app-level wrappers for both the component and composable:

```ts
// composables/useVueCropper.ts
export { useCropper as useVueCropper } from '@xcvzmoon/vue-cropperjs';
```

```vue
<!-- components/AppCropperImage.client.vue -->
<script setup lang="ts">
export { CropperImage as default } from '@xcvzmoon/vue-cropperjs';
</script>
```

That gives you Nuxt auto-imports for `useVueCropper()` and `AppCropperImage` while keeping the package itself framework-agnostic.

## Migration notes

- Vue 3 only
- Cropper.js 2 only
- element-oriented API instead of a v1-style method proxy layer
- no Vue 2 compatibility layer
- no attempt to support Cropper.js v1 and v2 in one API
- `v-model:data` syncs image transform plus selection state instead of exposing old v1 `getData()` assumptions alone
