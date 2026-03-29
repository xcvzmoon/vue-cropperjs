<script setup lang="ts">
import type {
  CropperActionEventDetail,
  CropperChangeEventDetail,
  CropperData,
  CropperImageEmits,
  CropperImageExposed,
  CropperImageProps,
  CropperTransformEventDetail,
} from '../types.js';
import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue';
import { useCropper } from '../composables/useCropper.js';

const props = withDefaults(defineProps<CropperImageProps>(), {
  alt: '',
  canvasProps: undefined,
  crossorigin: undefined,
  data: undefined,
  imageProps: undefined,
  initOptions: undefined,
  selectionProps: undefined,
});

const emits = defineEmits<CropperImageEmits>();
const containerRef = useTemplateRef<HTMLDivElement | null>('containerRef');
const imageRef = shallowRef<HTMLImageElement | null>(null);
const cropper = useCropper(imageRef);
let unbindElementEvents: (() => void) | null = null;
let lastEmittedData: CropperData | null = null;
let syncingFromModel = false;

function normalizeError(error: unknown): Error {
  return error instanceof Error ? error : new Error('Failed to initialize cropper');
}

function createSourceErrorMessage(src: string): string {
  return `Failed to load image source "${src}"`;
}

function normalizeComponentError(error: unknown): Error {
  const normalizedError = normalizeError(error);

  if (normalizedError.message.startsWith('Failed to load cropper image source')) {
    return new Error(
      normalizedError.message.replace('Failed to load cropper image source', 'Failed to load image source'),
      {
        cause: normalizedError,
      },
    );
  }

  return normalizedError;
}

function ensureImageElement(): HTMLImageElement {
  const existingImage = imageRef.value;
  if (existingImage) return existingImage;

  const nextImage = new Image();
  imageRef.value = nextImage;

  return nextImage;
}

function syncSourceElement() {
  const sourceImage = ensureImageElement();
  sourceImage.alt = props.alt;

  if (props.crossorigin !== undefined) sourceImage.crossOrigin = props.crossorigin;
  sourceImage.src = props.src;
}

function assignDefinedProps(target: object, source: object | undefined) {
  if (!source) return;

  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined) Reflect.set(target, key, value);
  }
}

function getStableObjectKey(value: object | undefined): string {
  if (!value) return '';
  return JSON.stringify(
    Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)),
  );
}

function isSameData(left: CropperImageProps['data'], right: CropperData | null): boolean {
  if (left === right) return true;
  if (!left || !right) return false;
  return (
    left.selection.aspectRatio === right.selection.aspectRatio &&
    left.selection.height === right.selection.height &&
    left.selection.width === right.selection.width &&
    left.selection.x === right.selection.x &&
    left.selection.y === right.selection.y &&
    left.imageTransform.length === right.imageTransform.length &&
    left.imageTransform.every((value, index) => value === right.imageTransform[index])
  );
}

function emitDataUpdate() {
  if (syncingFromModel) return;

  const nextData = cropper.getData();

  lastEmittedData = nextData;

  if (!isSameData(props.data, nextData)) emits('update:data', nextData);
}

function applyModelData(nextData: CropperData | null | undefined) {
  const currentData = cropper.getData();

  if (nextData === undefined) return;

  if (isSameData(nextData, lastEmittedData)) {
    lastEmittedData = nextData;
    return;
  }

  if (nextData === null) {
    syncingFromModel = true;

    try {
      cropper.resetImageTransform();
      cropper.resetSelection();
    } finally {
      syncingFromModel = false;
    }

    emitDataUpdate();
    return;
  }

  if (isSameData(nextData, currentData)) return;

  syncingFromModel = true;

  try {
    cropper.setData(nextData);
  } finally {
    syncingFromModel = false;
  }
}

function applyElementProps() {
  const cropperImage = cropper.getImage();

  if (cropperImage) {
    cropperImage.alt = props.alt;
    if (props.crossorigin !== undefined) cropperImage.crossorigin = props.crossorigin;
    assignDefinedProps(cropperImage, props.imageProps);
  }

  const cropperSelection = cropper.getSelection();
  if (cropperSelection) assignDefinedProps(cropperSelection, props.selectionProps);

  const cropperCanvas = cropper.getCanvas();
  if (cropperCanvas) assignDefinedProps(cropperCanvas, props.canvasProps);
}

function bindElementEvents() {
  unbindElementEvents?.();

  const bindings: Array<[EventTarget, string, EventListener]> = [];

  const bind = (target: EventTarget | null, type: string, listener: EventListener) => {
    if (!target) return;
    target.addEventListener(type, listener);
    bindings.push([target, type, listener]);
  };

  bind(cropper.getCanvas(), 'actionstart', (event) => {
    emits('action-start', event as CustomEvent<CropperActionEventDetail>);
  });

  bind(cropper.getCanvas(), 'actionmove', (event) => {
    emits('action-move', event as CustomEvent<CropperActionEventDetail>);
  });

  bind(cropper.getCanvas(), 'actionend', (event) => {
    emits('action-end', event as CustomEvent<CropperActionEventDetail>);
  });

  bind(cropper.getCanvas(), 'action', (event) => {
    emits('action', event as CustomEvent<CropperActionEventDetail>);
  });

  bind(cropper.getSelection(), 'change', (event) => {
    emits('change', event as CustomEvent<CropperChangeEventDetail>);
    emitDataUpdate();
  });

  bind(cropper.getImage(), 'transform', (event) => {
    emits('transform', event as CustomEvent<CropperTransformEventDetail>);
    emitDataUpdate();
  });

  bind(imageRef.value, 'error', () => {
    emits('error', new Error(createSourceErrorMessage(props.src)));
  });

  unbindElementEvents = () => {
    for (const [target, type, listener] of bindings) {
      target.removeEventListener(type, listener);
    }
  };
}

async function initialize() {
  try {
    syncSourceElement();

    const initOptions = containerRef.value
      ? { ...props.initOptions, container: containerRef.value }
      : props.initOptions;

    const instance = await cropper.init(initOptions);

    if (!instance) return;

    bindElementEvents();
    applyElementProps();
    applyModelData(props.data);

    emits('ready', instance);
    emitDataUpdate();
  } catch (error) {
    emits('error', normalizeComponentError(error));
  }
}

onMounted(() => {
  initialize();
});

onBeforeUnmount(() => {
  unbindElementEvents?.();
  cropper.destroy();
});

watch(
  () => props.src,
  (nextSrc, previousSrc) => {
    if (nextSrc === previousSrc) return;

    cropper
      .setImageSource(nextSrc)
      .then(() => {
        syncSourceElement();
        applyElementProps();
        applyModelData(props.data);
        const instance = cropper.getInstance();
        if (instance) emits('ready', instance);
        emitDataUpdate();
      })
      .catch((error: unknown) => {
        emits('error', normalizeComponentError(error));
      });
  },
);

watch(
  () => props.alt,
  () => {
    syncSourceElement();
    applyElementProps();
  },
);

watch(
  () => props.crossorigin,
  () => {
    syncSourceElement();
    applyElementProps();
  },
);

watch(
  () => getStableObjectKey(props.imageProps),
  () => {
    applyElementProps();
  },
);

watch(
  () => props.data,
  (nextData) => {
    if (isSameData(nextData, lastEmittedData)) {
      return;
    }

    applyModelData(nextData);
  },
  { deep: true },
);

watch(
  () => getStableObjectKey(props.selectionProps),
  () => {
    applyElementProps();
  },
);

watch(
  () => getStableObjectKey(props.canvasProps),
  () => {
    applyElementProps();
  },
);

const exposed: CropperImageExposed = {
  imageRef,
  ...cropper,
};

defineExpose<CropperImageExposed>(exposed);
</script>

<template>
  <div ref="containerRef" data-vue-cropper-root="" />
</template>
