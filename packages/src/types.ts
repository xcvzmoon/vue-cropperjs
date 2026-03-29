import type { CropperCanvas, CropperImage as CropperImageElement, CropperOptions, CropperSelection } from 'cropperjs';
import type { Ref, ShallowRef } from 'vue';

export type CropperInstance = InstanceType<typeof import('cropperjs').default>;
export type CropperCanvasElement = CropperCanvas;
export type CropperImageElementInstance = CropperImageElement;
export type CropperSelectionElement = CropperSelection;
export type CropperCanvasOptions = Parameters<CropperSelection['$toCanvas']>[0];
export type CropperImageTransform = [number, number, number, number, number, number];

export interface CropperCanvasProps {
  background?: CropperCanvas['background'] | undefined;
  disabled?: CropperCanvas['disabled'] | undefined;
  scaleStep?: CropperCanvas['scaleStep'] | undefined;
  themeColor?: CropperCanvas['themeColor'] | undefined;
}

export interface CropperImageElementProps {
  initialCenterSize?: CropperImageElement['initialCenterSize'] | undefined;
  rotatable?: CropperImageElement['rotatable'] | undefined;
  scalable?: CropperImageElement['scalable'] | undefined;
  skewable?: CropperImageElement['skewable'] | undefined;
  slottable?: CropperImageElement['slottable'] | undefined;
  translatable?: CropperImageElement['translatable'] | undefined;
}

export interface CropperSelectionProps {
  x?: CropperSelection['x'] | undefined;
  y?: CropperSelection['y'] | undefined;
  width?: CropperSelection['width'] | undefined;
  height?: CropperSelection['height'] | undefined;
  aspectRatio?: CropperSelection['aspectRatio'] | undefined;
  initialAspectRatio?: CropperSelection['initialAspectRatio'] | undefined;
  initialCoverage?: CropperSelection['initialCoverage'] | undefined;
  dynamic?: CropperSelection['dynamic'] | undefined;
  movable?: CropperSelection['movable'] | undefined;
  resizable?: CropperSelection['resizable'] | undefined;
  zoomable?: CropperSelection['zoomable'] | undefined;
  multiple?: CropperSelection['multiple'] | undefined;
  keyboard?: CropperSelection['keyboard'] | undefined;
  outlined?: CropperSelection['outlined'] | undefined;
  precise?: CropperSelection['precise'] | undefined;
}

export interface CropperData {
  imageTransform: CropperImageTransform;
  selection: {
    aspectRatio: number;
    height: number;
    width: number;
    x: number;
    y: number;
  };
}

export interface CropperActionEventDetail {
  action: string;
  endX?: number | undefined;
  endY?: number | undefined;
  relatedEvent: Event;
  rotate?: number | undefined;
  scale?: number | undefined;
  startX?: number | undefined;
  startY?: number | undefined;
}

export interface CropperChangeEventDetail {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface CropperTransformEventDetail {
  matrix: number[];
  oldMatrix: number[];
}

export interface CropperImageProps {
  src: string;
  alt?: string | undefined;
  crossorigin?: '' | 'anonymous' | 'use-credentials' | undefined;
  data?: CropperData | null | undefined;
  initOptions?: Pick<CropperOptions, 'container' | 'template'> | undefined;
  canvasProps?: CropperCanvasProps | undefined;
  imageProps?: CropperImageElementProps | undefined;
  selectionProps?: CropperSelectionProps | undefined;
}

export interface UseCropperReturn {
  cropper: ShallowRef<CropperInstance | null>;
  elementRef: Ref<HTMLImageElement | null>;
  changeSelection: (
    x: number,
    y: number,
    width?: number | undefined,
    height?: number | undefined,
    aspectRatio?: number | undefined,
  ) => CropperSelection | null;
  clearSelection: () => CropperSelection | null;
  destroy: () => void;
  flipX: () => CropperImageElement | null;
  flipY: () => CropperImageElement | null;
  getCanvas: () => CropperCanvas | null;
  getData: () => CropperData | null;
  getImage: () => CropperImageElement | null;
  getImageTransform: () => CropperImageTransform | null;
  getInstance: () => CropperInstance | null;
  getSelection: () => CropperSelection | null;
  getSelections: () => NodeListOf<CropperSelection> | null;
  init: (options?: CropperOptions | undefined) => Promise<CropperInstance | null>;
  moveImage: (x: number, y?: number | undefined) => CropperImageElement | null;
  moveImageTo: (x: number, y?: number | undefined) => CropperImageElement | null;
  moveSelection: (x: number, y?: number | undefined) => CropperSelection | null;
  moveSelectionTo: (x: number, y?: number | undefined) => CropperSelection | null;
  resetFlip: () => CropperImageElement | null;
  resetImageTransform: () => CropperImageElement | null;
  resetSelection: () => CropperSelection | null;
  rotateImage: (angle: number | string, x?: number | undefined, y?: number | undefined) => CropperImageElement | null;
  scaleImage: (x: number, y?: number | undefined) => CropperImageElement | null;
  setData: (data: Partial<CropperData>) => CropperData | null;
  setImageSource: (src: string) => Promise<CropperImageElement | null>;
  setImageTransform: (transform: CropperImageTransform) => CropperImageElement | null;
  toCanvas: (options?: CropperCanvasOptions | undefined) => Promise<HTMLCanvasElement | null>;
  zoomImage: (scale: number, x?: number | undefined, y?: number | undefined) => CropperImageElement | null;
  zoomSelection: (scale: number, x?: number | undefined, y?: number | undefined) => CropperSelection | null;
}

export interface CropperImageExposed extends UseCropperReturn {
  imageRef: Ref<HTMLImageElement | null>;
}

export interface CropperImageEmits {
  (event: 'action', nativeEvent: CustomEvent<CropperActionEventDetail>): void;
  (event: 'action-end', nativeEvent: CustomEvent<CropperActionEventDetail>): void;
  (event: 'action-move', nativeEvent: CustomEvent<CropperActionEventDetail>): void;
  (event: 'action-start', nativeEvent: CustomEvent<CropperActionEventDetail>): void;
  (event: 'change', nativeEvent: CustomEvent<CropperChangeEventDetail>): void;
  (event: 'error', error: Error): void;
  (event: 'ready', instance: CropperInstance): void;
  (event: 'transform', nativeEvent: CustomEvent<CropperTransformEventDetail>): void;
  (event: 'update:data', data: CropperData | null): void;
}

export type CropperInitOptions = Pick<CropperOptions, 'container' | 'template'>;
