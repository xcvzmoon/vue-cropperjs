import type {
  CropperCanvasOptions,
  CropperData,
  CropperImageElementInstance,
  CropperImageTransform,
  CropperInstance,
  CropperSelectionElement,
  UseCropperOptions,
  UseCropperReturn,
} from '../types.js';
import type { CropperCanvas, CropperOptions } from 'cropperjs';
import { computed, ref, shallowRef, type Ref } from 'vue';

type CropperConstructor = typeof import('cropperjs').default;

function toImageTransform(matrix: number[] | undefined): CropperImageTransform {
  const [a = 1, b = 0, c = 0, d = 1, e = 0, f = 0] = matrix ?? [];
  return [a, b, c, d, e, f];
}

function toError(value: unknown, fallbackMessage: string): Error {
  return value instanceof Error ? value : new Error(fallbackMessage);
}

export function useCropper(
  target: Ref<HTMLImageElement | null> = shallowRef(null),
  composableOptions: UseCropperOptions = {},
): UseCropperReturn {
  const cropper = shallowRef<CropperInstance | null>(null);
  const data = ref<CropperData | null>(null);
  const imageTransform = ref<CropperImageTransform | null>(null);
  const error = ref<Error | null>(null);
  const isInitializing = ref(false);
  const isReady = ref(false);
  let unbindStateEvents: (() => void) | null = null;

  const canvas = computed(() => getCanvas());
  const image = computed(() => getImage());
  const selection = computed(() => getSelection());

  function clearRuntimeState() {
    unbindStateEvents?.();
    unbindStateEvents = null;
    data.value = null;
    imageTransform.value = null;
    isReady.value = false;
  }

  function getInstance(): CropperInstance | null {
    return cropper.value;
  }

  function getCanvas(): CropperCanvas | null {
    return cropper.value?.getCropperCanvas() ?? null;
  }

  function getImage(): CropperImageElementInstance | null {
    return cropper.value?.getCropperImage() ?? null;
  }

  function getSelection(): CropperSelectionElement | null {
    return cropper.value?.getCropperSelection() ?? null;
  }

  function getSelections(): NodeListOf<CropperSelectionElement> | null {
    return cropper.value?.getCropperSelections() ?? null;
  }

  function bindStateEvents() {
    unbindStateEvents?.();

    if ((composableOptions.syncData ?? 'manual') !== 'events') {
      unbindStateEvents = null;
      return;
    }

    const bindings: Array<[EventTarget, string, EventListener]> = [];
    const syncState: EventListener = () => {
      refreshData();
    };

    const bind = (targetElement: EventTarget | null, eventName: string) => {
      if (!targetElement) return;
      targetElement.addEventListener(eventName, syncState);
      bindings.push([targetElement, eventName, syncState]);
    };

    bind(getSelection(), 'change');
    bind(getImage(), 'transform');

    unbindStateEvents = () => {
      for (const [targetElement, eventName, listener] of bindings) {
        targetElement.removeEventListener(eventName, listener);
      }
    };
  }

  function destroy() {
    unbindStateEvents?.();
    unbindStateEvents = null;
    cropper.value?.destroy();
    cropper.value = null;
    clearRuntimeState();
  }

  function getImageTransform(): CropperImageTransform | null {
    const currentImage = getImage();
    return !currentImage ? null : toImageTransform(currentImage.$getTransform());
  }

  function getData(): CropperData | null {
    const currentSelection = getSelection();
    const currentImageTransform = getImageTransform();
    return !currentSelection || !currentImageTransform
      ? null
      : {
          imageTransform: currentImageTransform,
          selection: {
            aspectRatio: currentSelection.aspectRatio,
            height: currentSelection.height,
            width: currentSelection.width,
            x: currentSelection.x,
            y: currentSelection.y,
          },
        };
  }

  function refreshData(): CropperData | null {
    imageTransform.value = getImageTransform();
    data.value = getData();
    return data.value;
  }

  async function init(overrideOptions?: CropperOptions): Promise<CropperInstance | null> {
    if (typeof window === 'undefined') return null;
    const element = target.value;
    if (!element) return null;

    isInitializing.value = true;
    error.value = null;
    destroy();

    try {
      const cropperModule = await import('cropperjs');
      const Cropper = (cropperModule.default ?? cropperModule) as unknown as CropperConstructor;
      const initOptions = {
        ...composableOptions.initOptions,
        ...overrideOptions,
      } satisfies CropperOptions;
      const instance = new Cropper(element, initOptions);

      cropper.value = instance;

      try {
        await getImage()?.$ready();
      } catch (caughtError) {
        const nextError = new Error(
          `Failed to load cropper image source "${element.src}": ${toError(caughtError, 'unknown error').message}`,
          {
            cause: caughtError,
          },
        );

        destroy();
        error.value = nextError;

        throw nextError;
      }

      bindStateEvents();
      refreshData();
      isReady.value = true;

      return instance;
    } catch (caughtError) {
      const nextError =
        caughtError instanceof Error
          ? caughtError
          : new Error(`Failed to initialize cropper: ${toError(caughtError, 'unknown error').message}`, {
              cause: caughtError,
            });

      destroy();
      error.value = nextError;

      throw nextError;
    } finally {
      isInitializing.value = false;
    }
  }

  async function setImageSource(src: string): Promise<CropperImageElementInstance | null> {
    const element = target.value;
    if (element) element.src = src;

    const cropperImage = getImage();
    if (!cropperImage) return null;

    error.value = null;
    isReady.value = false;
    cropperImage.src = src;

    try {
      await cropperImage.$ready();
      bindStateEvents();
      refreshData();
      isReady.value = true;

      return cropperImage;
    } catch (caughtError) {
      const nextError = new Error(
        `Failed to load cropper image source "${src}": ${toError(caughtError, 'unknown error').message}`,
        {
          cause: caughtError,
        },
      );

      error.value = nextError;

      throw nextError;
    }
  }

  function moveImage(x: number, y?: number): CropperImageElementInstance | null {
    const nextImage = getImage()?.$move(x, y) ?? null;
    refreshData();
    return nextImage;
  }

  function moveImageTo(x: number, y?: number): CropperImageElementInstance | null {
    const nextImage = getImage()?.$moveTo(x, y) ?? null;
    refreshData();
    return nextImage;
  }

  function zoomImage(scale: number, x?: number, y?: number): CropperImageElementInstance | null {
    const nextImage = getImage()?.$zoom(scale, x, y) ?? null;
    refreshData();
    return nextImage;
  }

  function rotateImage(angle: number | string, x?: number, y?: number): CropperImageElementInstance | null {
    const nextImage = getImage()?.$rotate(angle, x, y) ?? null;

    refreshData();

    return nextImage;
  }

  function scaleImage(x: number, y?: number): CropperImageElementInstance | null {
    const nextImage = getImage()?.$scale(x, y) ?? null;
    refreshData();
    return nextImage;
  }

  function flipX(): CropperImageElementInstance | null {
    return scaleImage(-1, 1);
  }

  function flipY(): CropperImageElementInstance | null {
    return scaleImage(1, -1);
  }

  function setImageTransform(transform: CropperImageTransform): CropperImageElementInstance | null {
    const nextImage = getImage()?.$setTransform(transform) ?? null;
    refreshData();
    return nextImage;
  }

  function resetImageTransform(): CropperImageElementInstance | null {
    const nextImage = getImage()?.$resetTransform() ?? null;
    refreshData();
    return nextImage;
  }

  function resetFlip(): CropperImageElementInstance | null {
    return scaleImage(1, 1);
  }

  function resetSelection(): CropperSelectionElement | null {
    const nextSelection = getSelection()?.$reset() ?? null;
    refreshData();
    return nextSelection;
  }

  function clearSelection(): CropperSelectionElement | null {
    const nextSelection = getSelection()?.$clear() ?? null;
    refreshData();
    return nextSelection;
  }

  function moveSelection(x: number, y?: number): CropperSelectionElement | null {
    const nextSelection = getSelection()?.$move(x, y) ?? null;
    refreshData();
    return nextSelection;
  }

  function moveSelectionTo(x: number, y?: number): CropperSelectionElement | null {
    const nextSelection = getSelection()?.$moveTo(x, y) ?? null;
    refreshData();
    return nextSelection;
  }

  function changeSelection(
    x: number,
    y: number,
    width?: number,
    height?: number,
    aspectRatio?: number,
  ): CropperSelectionElement | null {
    const nextSelection = getSelection()?.$change(x, y, width, height, aspectRatio) ?? null;
    refreshData();
    return nextSelection;
  }

  function zoomSelection(scale: number, x?: number, y?: number): CropperSelectionElement | null {
    const nextSelection = getSelection()?.$zoom(scale, x, y) ?? null;
    refreshData();
    return nextSelection;
  }

  async function toCanvas(options?: CropperCanvasOptions): Promise<HTMLCanvasElement | null> {
    const currentSelection = getSelection();
    if (currentSelection) return currentSelection.$toCanvas(options);
    return getCanvas()?.$toCanvas(options) ?? null;
  }

  function setData(nextData: Partial<CropperData>): CropperData | null {
    if (nextData.imageTransform) setImageTransform(nextData.imageTransform);
    const currentSelection = getSelection();
    if (currentSelection && nextData.selection) {
      currentSelection.$change(
        nextData.selection.x ?? currentSelection.x,
        nextData.selection.y ?? currentSelection.y,
        nextData.selection.width ?? currentSelection.width,
        nextData.selection.height ?? currentSelection.height,
        nextData.selection.aspectRatio ?? currentSelection.aspectRatio,
      );
    }
    return refreshData();
  }

  function applyData(nextData: CropperData | null): CropperData | null {
    if (nextData === null) {
      resetImageTransform();
      resetSelection();
      return refreshData();
    }
    return setData(nextData);
  }

  return {
    applyData,
    canvas,
    cropper,
    data,
    elementRef: target,
    error,
    flipX,
    flipY,
    changeSelection,
    clearSelection,
    destroy,
    getCanvas,
    getData,
    getImage,
    getImageTransform,
    getInstance,
    getSelection,
    getSelections,
    image,
    imageTransform,
    init,
    isInitializing,
    isReady,
    moveImage,
    moveImageTo,
    moveSelection,
    moveSelectionTo,
    refreshData,
    resetFlip,
    resetImageTransform,
    resetSelection,
    rotateImage,
    scaleImage,
    selection,
    setData,
    setImageSource,
    setImageTransform,
    toCanvas,
    zoomImage,
    zoomSelection,
  };
}
