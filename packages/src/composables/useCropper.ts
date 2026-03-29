import type {
  CropperCanvasOptions,
  CropperData,
  CropperImageElementInstance,
  CropperImageTransform,
  CropperInstance,
  CropperSelectionElement,
  UseCropperReturn,
} from '../types.js';
import type { CropperCanvas, CropperOptions } from 'cropperjs';
import { type Ref, shallowRef } from 'vue';

type CropperConstructor = typeof import('cropperjs').default;

function toImageTransform(matrix: number[] | undefined): CropperImageTransform {
  const [a = 1, b = 0, c = 0, d = 1, e = 0, f = 0] = matrix ?? [];
  return [a, b, c, d, e, f];
}

function toErrorMessage(value: unknown): string {
  return value instanceof Error && value.message ? value.message : 'unknown error';
}

export function useCropper(target: Ref<HTMLImageElement | null> = shallowRef(null)): UseCropperReturn {
  const cropper = shallowRef<CropperInstance | null>(null);

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

  function destroy() {
    cropper.value?.destroy();
    cropper.value = null;
  }

  async function init(options?: CropperOptions): Promise<CropperInstance | null> {
    if (typeof window === 'undefined') return null;

    const element = target.value;
    if (!element) return null;

    destroy();

    const cropperModule = await import('cropperjs');
    const Cropper = (cropperModule.default ?? cropperModule) as unknown as CropperConstructor;
    const instance = new Cropper(element, options);

    cropper.value = instance;
    return instance;
  }

  async function setImageSource(src: string): Promise<CropperImageElementInstance | null> {
    const element = target.value;
    if (element) element.src = src;

    const cropperImage = getImage();
    if (!cropperImage) return null;

    cropperImage.src = src;

    try {
      await cropperImage.$ready();
    } catch (error) {
      throw new Error(`Failed to load cropper image source "${src}": ${toErrorMessage(error)}`, { cause: error });
    }

    return cropperImage;
  }

  function moveImage(x: number, y?: number): CropperImageElementInstance | null {
    return getImage()?.$move(x, y) ?? null;
  }

  function moveImageTo(x: number, y?: number): CropperImageElementInstance | null {
    return getImage()?.$moveTo(x, y) ?? null;
  }

  function zoomImage(scale: number, x?: number, y?: number): CropperImageElementInstance | null {
    return getImage()?.$zoom(scale, x, y) ?? null;
  }

  function rotateImage(angle: number | string, x?: number, y?: number): CropperImageElementInstance | null {
    return getImage()?.$rotate(angle, x, y) ?? null;
  }

  function scaleImage(x: number, y?: number): CropperImageElementInstance | null {
    return getImage()?.$scale(x, y) ?? null;
  }

  function setImageTransform(transform: CropperImageTransform): CropperImageElementInstance | null {
    return getImage()?.$setTransform(transform) ?? null;
  }

  function getImageTransform(): CropperImageTransform | null {
    return toImageTransform(getImage()?.$getTransform());
  }

  function resetImageTransform(): CropperImageElementInstance | null {
    return getImage()?.$resetTransform() ?? null;
  }

  function resetSelection(): CropperSelectionElement | null {
    return getSelection()?.$reset() ?? null;
  }

  function clearSelection(): CropperSelectionElement | null {
    return getSelection()?.$clear() ?? null;
  }

  function moveSelection(x: number, y?: number): CropperSelectionElement | null {
    return getSelection()?.$move(x, y) ?? null;
  }

  function moveSelectionTo(x: number, y?: number): CropperSelectionElement | null {
    return getSelection()?.$moveTo(x, y) ?? null;
  }

  function changeSelection(
    x: number,
    y: number,
    width?: number,
    height?: number,
    aspectRatio?: number,
  ): CropperSelectionElement | null {
    return getSelection()?.$change(x, y, width, height, aspectRatio) ?? null;
  }

  function zoomSelection(scale: number, x?: number, y?: number): CropperSelectionElement | null {
    return getSelection()?.$zoom(scale, x, y) ?? null;
  }

  async function toCanvas(options?: CropperCanvasOptions): Promise<HTMLCanvasElement | null> {
    const selection = getSelection();
    if (selection) return selection.$toCanvas(options);
    return getCanvas()?.$toCanvas(options) ?? null;
  }

  function getData(): CropperData | null {
    const selection = getSelection();
    const imageTransform = getImageTransform();
    return !selection || !imageTransform
      ? null
      : {
          imageTransform,
          selection: {
            aspectRatio: selection.aspectRatio,
            height: selection.height,
            width: selection.width,
            x: selection.x,
            y: selection.y,
          },
        };
  }

  function setData(data: Partial<CropperData>): CropperData | null {
    if (data.imageTransform) setImageTransform(data.imageTransform);

    const selection = getSelection();
    if (selection && data.selection) {
      selection.$change(
        data.selection.x ?? selection.x,
        data.selection.y ?? selection.y,
        data.selection.width ?? selection.width,
        data.selection.height ?? selection.height,
        data.selection.aspectRatio ?? selection.aspectRatio,
      );
    }

    return getData();
  }

  return {
    cropper,
    elementRef: target,
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
    init,
    moveImage,
    moveImageTo,
    moveSelection,
    moveSelectionTo,
    resetImageTransform,
    resetSelection,
    rotateImage,
    scaleImage,
    setData,
    setImageSource,
    setImageTransform,
    toCanvas,
    zoomImage,
    zoomSelection,
  };
}
