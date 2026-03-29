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

Cropper.js 2 styles are bundled with its custom elements, so no separate CSS import is required:

```ts
// Cropper.js 2 styles are bundled with its custom elements.
// No separate CSS import is required.
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
const cropper = useCropper(imageRef, { syncData: 'events' });

onMounted(async () => {
  await cropper.init();
  cropper.zoomImage(0.1);
  console.log(cropper.data.value);
});
</script>

<template>
  <img ref="imageRef" alt="Example" src="/image.jpg" />
</template>
```

The composable is useful when you want full control over markup and lifecycle while still getting typed state refs and action methods.

`syncData: 'events'` keeps the `data` and `imageTransform` refs updated from Cropper events. The default `syncData: 'manual'` avoids continuous syncing and lets you call `refreshData()` explicitly.

## Public API

### Component props

| Group         | Props                                         |
| ------------- | --------------------------------------------- |
| Source        | `src`, `alt`, `crossorigin`                   |
| State         | `data`                                        |
| Init-only     | `initOptions`                                 |
| Element props | `imageProps`, `selectionProps`, `canvasProps` |

### Props matrix

| Prop             | Type                                     | Purpose                                                          |
| ---------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| `src`            | `string`                                 | Set the source image                                             |
| `alt`            | `string`                                 | Forward alt text to the internal `cropper-image`                 |
| `crossorigin`    | `'' \| 'anonymous' \| 'use-credentials'` | Forward image cross-origin behavior                              |
| `data`           | `CropperData \| null`                    | Sync crop state with `v-model:data`                              |
| `initOptions`    | `CropperInitOptions`                     | Configure init-only root options like `container` and `template` |
| `imageProps`     | `CropperImageElementProps`               | Configure live image element behavior                            |
| `selectionProps` | `CropperSelectionProps`                  | Configure live selection element behavior                        |
| `canvasProps`    | `CropperCanvasProps`                     | Configure live canvas element behavior                           |

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

| Group     | Events                                                |
| --------- | ----------------------------------------------------- |
| Lifecycle | `ready`, `error`                                      |
| Action    | `action-start`, `action-move`, `action-end`, `action` |
| State     | `change`, `transform`, `update:data`                  |

### Events matrix

| Event          | Payload                                    | Purpose                                     |
| -------------- | ------------------------------------------ | ------------------------------------------- |
| `ready`        | `CropperInstance`                          | Report successful init and source readiness |
| `error`        | `Error`                                    | Report init or source load failure          |
| `action-start` | `CustomEvent<CropperActionEventDetail>`    | Forward canvas action start                 |
| `action-move`  | `CustomEvent<CropperActionEventDetail>`    | Forward canvas action move                  |
| `action-end`   | `CustomEvent<CropperActionEventDetail>`    | Forward canvas action end                   |
| `action`       | `CustomEvent<CropperActionEventDetail>`    | Forward canvas action updates               |
| `change`       | `CustomEvent<CropperChangeEventDetail>`    | Report selection changes                    |
| `transform`    | `CustomEvent<CropperTransformEventDetail>` | Report image transform changes              |
| `update:data`  | `CropperData \| null`                      | Sync combined crop state                    |

### Event detail types

| Detail type                   | Fields                                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| `CropperActionEventDetail`    | `action`, `relatedEvent`, optional `scale`, `rotate`, `startX`, `startY`, `endX`, `endY` |
| `CropperChangeEventDetail`    | `x`, `y`, `width`, `height`                                                              |
| `CropperTransformEventDetail` | `matrix`, `oldMatrix`                                                                    |

### Exposed component methods

| Group            | Methods                                                                                                                                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Getters          | `getInstance()`, `getCanvas()`, `getImage()`, `getSelection()`, `getSelections()`, `getData()`, `getImageTransform()`                                                                                                                        |
| Image            | `setImageSource(src)`, `moveImage(x, y?)`, `moveImageTo(x, y?)`, `zoomImage(scale, x?, y?)`, `rotateImage(angle, x?, y?)`, `flipX()`, `flipY()`, `resetFlip()`, `scaleImage(x, y?)`, `setImageTransform(transform)`, `resetImageTransform()` |
| Selection        | `resetSelection()`, `clearSelection()`, `moveSelection(x, y?)`, `moveSelectionTo(x, y?)`, `changeSelection(x, y, width?, height?, aspectRatio?)`, `zoomSelection(scale, x?, y?)`                                                             |
| Export and state | `toCanvas(options?)`, `setData(data)`, `destroy()`                                                                                                                                                                                           |

### Methods matrix

| Method                                                 | Return type                                    | Purpose                                   |
| ------------------------------------------------------ | ---------------------------------------------- | ----------------------------------------- |
| `getInstance()`                                        | `CropperInstance \| null`                      | Access the raw Cropper instance           |
| `getCanvas()`                                          | `CropperCanvasElement \| null`                 | Access the internal canvas element        |
| `getImage()`                                           | `CropperImageElementInstance \| null`          | Access the internal image element         |
| `getSelection()`                                       | `CropperSelectionElement \| null`              | Access the primary selection              |
| `getSelections()`                                      | `NodeListOf<CropperSelectionElement> \| null`  | Access all selections                     |
| `getData()`                                            | `CropperData \| null`                          | Read image transform plus selection state |
| `getImageTransform()`                                  | `CropperImageTransform \| null`                | Read the current image matrix             |
| `setImageSource(src)`                                  | `Promise<CropperImageElementInstance \| null>` | Replace the current source image          |
| `moveImage(x, y?)`                                     | `CropperImageElementInstance \| null`          | Move the image by delta                   |
| `moveImageTo(x, y?)`                                   | `CropperImageElementInstance \| null`          | Move the image to coordinates             |
| `zoomImage(scale, x?, y?)`                             | `CropperImageElementInstance \| null`          | Zoom the image                            |
| `rotateImage(angle, x?, y?)`                           | `CropperImageElementInstance \| null`          | Rotate the image                          |
| `flipX()`                                              | `CropperImageElementInstance \| null`          | Flip horizontally                         |
| `flipY()`                                              | `CropperImageElementInstance \| null`          | Flip vertically                           |
| `resetFlip()`                                          | `CropperImageElementInstance \| null`          | Reset flip scaling                        |
| `scaleImage(x, y?)`                                    | `CropperImageElementInstance \| null`          | Apply image scale directly                |
| `setImageTransform(transform)`                         | `CropperImageElementInstance \| null`          | Apply a transform matrix                  |
| `resetImageTransform()`                                | `CropperImageElementInstance \| null`          | Reset the image transform                 |
| `resetSelection()`                                     | `CropperSelectionElement \| null`              | Reset the current selection               |
| `clearSelection()`                                     | `CropperSelectionElement \| null`              | Clear the current selection               |
| `moveSelection(x, y?)`                                 | `CropperSelectionElement \| null`              | Move the selection by delta               |
| `moveSelectionTo(x, y?)`                               | `CropperSelectionElement \| null`              | Move the selection to coordinates         |
| `changeSelection(x, y, width?, height?, aspectRatio?)` | `CropperSelectionElement \| null`              | Update the selection box                  |
| `zoomSelection(scale, x?, y?)`                         | `CropperSelectionElement \| null`              | Zoom the selection                        |
| `toCanvas(options?)`                                   | `Promise<HTMLCanvasElement \| null>`           | Export the current crop to canvas         |
| `setData(data)`                                        | `CropperData \| null`                          | Apply combined image and selection state  |
| `destroy()`                                            | `void`                                         | Destroy the cropper instance              |

### Composable return value

`useCropper()` returns the same typed action surface used by the component expose API, plus:

- `cropper`: `ShallowRef<CropperInstance | null>`
- `canvas`: `ComputedRef<CropperCanvasElement | null>`
- `image`: `ComputedRef<CropperImageElementInstance | null>`
- `selection`: `ComputedRef<CropperSelectionElement | null>`
- `elementRef`: `Ref<HTMLImageElement | null>`
- `data`: `Ref<CropperData | null>`
- `imageTransform`: `Ref<CropperImageTransform | null>`
- `isReady`: `Ref<boolean>`
- `isInitializing`: `Ref<boolean>`
- `error`: `Ref<Error | null>`
- `refreshData(): CropperData | null`
- `applyData(data: CropperData | null): CropperData | null`
- `init(options?): Promise<CropperInstance | null>`

## Types

Useful exported types:

- `CropperImageInstance`
- `CropperImageProps`
- `CropperImageEmits`
- `CropperData`
- `CropperInitOptions`
- `CropperSyncMode`
- `CropperCanvasOptions`
- `CropperImageTransform`
- `CropperCanvasElement`
- `CropperImageElementInstance`
- `CropperSelectionElement`
- `UseCropperOptions`

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
