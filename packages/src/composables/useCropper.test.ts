import { afterEach, describe, expect, it, vi } from 'vitest';
import { shallowRef } from 'vue';
import { useCropper } from './useCropper.js';

const mockState = vi.hoisted(() => {
  const selectionTarget = document.createElement('div');
  const imageTarget = document.createElement('div');
  const canvasTarget = document.createElement('div');

  const selection = Object.assign(selectionTarget, {
    $change: vi.fn(),
    $clear: vi.fn(),
    $move: vi.fn(),
    $moveTo: vi.fn(),
    $reset: vi.fn(),
    $toCanvas: vi.fn(async () => document.createElement('canvas')),
    $zoom: vi.fn(),
    aspectRatio: 1,
    height: 100,
    width: 150,
    x: 10,
    y: 20,
  });

  const image = Object.assign(imageTarget, {
    $getTransform: vi.fn(() => [1, 0, 0, 1, 10, 20]),
    $move: vi.fn(),
    $moveTo: vi.fn(),
    $ready: vi.fn(async () => document.createElement('img')),
    $resetTransform: vi.fn(),
    $rotate: vi.fn(),
    $scale: vi.fn(),
    $setTransform: vi.fn(),
    $zoom: vi.fn(),
    src: '',
  });

  const canvas = Object.assign(canvasTarget, {
    $toCanvas: vi.fn(async () => document.createElement('canvas')),
  });

  const ctor = vi.fn();

  class MockCropper {
    destroy = vi.fn();
    element: HTMLImageElement;

    constructor(element: HTMLImageElement, options?: unknown) {
      this.element = element;
      ctor(element, options);
    }

    getCropperCanvas() {
      return this.element ? canvas : canvas;
    }

    getCropperImage() {
      return this.element ? image : image;
    }

    getCropperSelection() {
      return this.element ? selection : selection;
    }

    getCropperSelections() {
      return this.element
        ? ({
            item(index: number) {
              return index === 0 ? selection : null;
            },
            length: 1,
            0: selection,
          } as unknown as NodeListOf<typeof selection>)
        : ({
            item(index: number) {
              return index === 0 ? selection : null;
            },
            length: 1,
            0: selection,
          } as unknown as NodeListOf<typeof selection>);
    }
  }

  return { canvas, ctor, defaultExport: MockCropper, image, selection };
});

vi.mock('cropperjs', () => ({
  default: mockState.defaultExport,
}));

describe('useCropper', () => {
  afterEach(() => {
    mockState.ctor.mockClear();
    mockState.image.$getTransform.mockClear();
    mockState.image.$ready.mockClear();
    mockState.selection.x = 10;
    mockState.selection.y = 20;
  });

  it('exposes reactive state after init', async () => {
    const target = shallowRef(document.createElement('img'));
    const cropper = useCropper(target, { syncData: 'events' });

    await cropper.init();

    expect(cropper.isReady.value).toBe(true);
    expect(cropper.isInitializing.value).toBe(false);
    expect(cropper.error.value).toBeNull();
    expect(cropper.image.value).toBe(mockState.image);
    expect(cropper.selection.value).toBe(mockState.selection);
    expect(cropper.canvas.value).toBe(mockState.canvas);
    expect(cropper.imageTransform.value).toEqual([1, 0, 0, 1, 10, 20]);
    expect(cropper.data.value).toEqual({
      imageTransform: [1, 0, 0, 1, 10, 20],
      selection: {
        aspectRatio: 1,
        height: 100,
        width: 150,
        x: 10,
        y: 20,
      },
    });
  });

  it('supports manual and event-driven data syncing modes', async () => {
    const target = shallowRef(document.createElement('img'));
    const manualCropper = useCropper(target);

    await manualCropper.init();

    mockState.selection.x = 42;
    mockState.selection.dispatchEvent(new CustomEvent('change', { detail: { x: 42 } }));

    expect(manualCropper.data.value?.selection.x).toBe(10);

    manualCropper.refreshData();

    expect(manualCropper.data.value?.selection.x).toBe(42);

    const eventDrivenCropper = useCropper(target, { syncData: 'events' });

    await eventDrivenCropper.init();

    mockState.selection.x = 84;
    mockState.selection.dispatchEvent(new CustomEvent('change', { detail: { x: 84 } }));

    expect(eventDrivenCropper.data.value?.selection.x).toBe(84);
  });
});
