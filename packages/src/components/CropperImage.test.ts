import type { CropperImageExposed } from '../types.js';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CropperImage from './CropperImage.vue';

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
    movable: false,
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
    alt: '',
    crossorigin: '',
    rotatable: false,
    scalable: false,
    src: '',
    translatable: false,
  });

  const canvas = Object.assign(canvasTarget, {
    $toCanvas: vi.fn(async () => document.createElement('canvas')),
    background: false,
    disabled: false,
    scaleStep: 0.1,
    themeColor: '#39f',
  });

  const instances: Array<{
    destroy: ReturnType<typeof vi.fn>;
    element: HTMLImageElement;
    getCropperCanvas: () => typeof canvas;
    getCropperImage: () => typeof image;
    getCropperSelection: () => typeof selection;
    getCropperSelections: () => NodeListOf<typeof selection>;
    options: unknown;
  }> = [];

  const ctor = vi.fn();

  class MockCropper {
    destroy = vi.fn();
    element: HTMLImageElement;
    options: unknown;

    constructor(element: HTMLImageElement, options?: unknown) {
      this.element = element;
      this.options = options;

      ctor(element, options);
      instances.push(this as (typeof instances)[number]);
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

  return { canvas, ctor, defaultExport: MockCropper, image, instances, selection };
});

vi.mock('cropperjs', () => ({
  default: mockState.defaultExport,
}));

async function settle() {
  await vi.dynamicImportSettled();
  await flushPromises();
}

describe('CropperImage', () => {
  afterEach(() => {
    mockState.canvas.$toCanvas.mockClear();
    mockState.ctor.mockClear();
    mockState.image.$getTransform.mockClear();
    mockState.image.$move.mockClear();
    mockState.image.$moveTo.mockClear();
    mockState.image.$ready.mockClear();
    mockState.image.$resetTransform.mockClear();
    mockState.image.$rotate.mockClear();
    mockState.image.$scale.mockClear();
    mockState.image.$setTransform.mockClear();
    mockState.image.$zoom.mockClear();
    mockState.instances.length = 0;
    mockState.selection.$change.mockClear();
    mockState.selection.$clear.mockClear();
    mockState.selection.$move.mockClear();
    mockState.selection.$moveTo.mockClear();
    mockState.selection.$reset.mockClear();
    mockState.selection.$toCanvas.mockClear();
    mockState.selection.$zoom.mockClear();
  });

  it('initializes cropper on mount and emits ready', async () => {
    const wrapper = mount(CropperImage, {
      props: {
        alt: 'Example',
        canvasProps: {
          background: true,
        },
        imageProps: {
          rotatable: true,
        },
        selectionProps: {
          movable: true,
        },
        src: '/example.jpg',
      },
    });

    await settle();

    expect(mockState.ctor).toHaveBeenCalledTimes(1);
    expect(mockState.image.$ready).toHaveBeenCalledTimes(1);
    expect(mockState.image.alt).toBe('Example');
    expect(mockState.image.rotatable).toBe(true);
    expect(mockState.canvas.background).toBe(true);
    expect(mockState.selection.movable).toBe(true);
    expect(wrapper.emitted('ready')).toHaveLength(1);
    expect(mockState.instances[0]?.element.src).toContain('/example.jpg');
  });

  it('updates the cropper image source without re-initializing', async () => {
    const wrapper = mount(CropperImage, {
      props: {
        src: '/before.jpg',
      },
    });

    await settle();

    const firstInstance = mockState.instances[0];

    await wrapper.setProps({ src: '/after.jpg' });
    await settle();

    expect(mockState.ctor).toHaveBeenCalledTimes(1);
    expect(firstInstance?.destroy).toHaveBeenCalledTimes(0);
    expect(mockState.image.src).toBe('/after.jpg');
    expect(mockState.image.$ready).toHaveBeenCalledTimes(2);
    expect(wrapper.emitted('ready')).toHaveLength(2);
  });

  it('exposes image, selection, and data helpers', async () => {
    const wrapper = mount(CropperImage, {
      props: {
        src: '/actions.jpg',
      },
    });

    await settle();

    const exposed = wrapper.vm as unknown as CropperImageExposed;

    exposed.resetSelection();
    exposed.clearSelection();
    exposed.moveSelection(10, 12);
    exposed.moveSelectionTo(20, 24);
    exposed.changeSelection(1, 2, 3, 4, 5);
    exposed.zoomSelection(0.2, 30, 40);
    exposed.moveImage(5, 6);
    exposed.moveImageTo(7, 8);
    exposed.zoomImage(0.1, 9, 10);
    exposed.rotateImage('45deg', 11, 12);
    exposed.flipX();
    exposed.flipY();
    exposed.resetFlip();
    exposed.scaleImage(1.2, 1.3);
    exposed.setImageTransform([1, 0, 0, 1, 30, 40]);
    exposed.resetImageTransform();
    const data = exposed.getData();
    exposed.setData({
      imageTransform: [1, 0, 0, 1, 50, 60],
      selection: {
        aspectRatio: 2,
        height: 80,
        width: 70,
        x: 3,
        y: 4,
      },
    });
    await exposed.toCanvas({ width: 120 });

    expect(mockState.selection.$reset).toHaveBeenCalledTimes(1);
    expect(mockState.selection.$clear).toHaveBeenCalledTimes(1);
    expect(mockState.selection.$move).toHaveBeenCalledWith(10, 12);
    expect(mockState.selection.$moveTo).toHaveBeenCalledWith(20, 24);
    expect(mockState.selection.$change).toHaveBeenCalledWith(1, 2, 3, 4, 5);
    expect(mockState.selection.$zoom).toHaveBeenCalledWith(0.2, 30, 40);
    expect(mockState.image.$move).toHaveBeenCalledWith(5, 6);
    expect(mockState.image.$moveTo).toHaveBeenCalledWith(7, 8);
    expect(mockState.image.$zoom).toHaveBeenCalledWith(0.1, 9, 10);
    expect(mockState.image.$rotate).toHaveBeenCalledWith('45deg', 11, 12);
    expect(mockState.image.$scale).toHaveBeenCalledWith(-1, 1);
    expect(mockState.image.$scale).toHaveBeenCalledWith(1, -1);
    expect(mockState.image.$scale).toHaveBeenCalledWith(1, 1);
    expect(mockState.image.$scale).toHaveBeenCalledWith(1.2, 1.3);
    expect(mockState.image.$setTransform).toHaveBeenCalledWith([1, 0, 0, 1, 30, 40]);
    expect(mockState.image.$resetTransform).toHaveBeenCalledTimes(1);
    expect(data).toEqual({
      imageTransform: [1, 0, 0, 1, 10, 20],
      selection: {
        aspectRatio: 1,
        height: 100,
        width: 150,
        x: 10,
        y: 20,
      },
    });
    expect(mockState.selection.$toCanvas).toHaveBeenCalledWith({ width: 120 });
  });

  it('forwards cropper element events', async () => {
    const wrapper = mount(CropperImage, {
      props: {
        src: '/events.jpg',
      },
    });

    await settle();

    mockState.canvas.dispatchEvent(
      new CustomEvent('actionstart', {
        detail: { action: 'move', relatedEvent: new Event('pointerdown') },
      }),
    );
    mockState.canvas.dispatchEvent(
      new CustomEvent('action', {
        detail: { action: 'scale', relatedEvent: new WheelEvent('wheel') },
      }),
    );
    mockState.selection.dispatchEvent(new CustomEvent('change', { detail: { height: 90, width: 80, x: 1, y: 2 } }));
    mockState.image.dispatchEvent(
      new CustomEvent('transform', {
        detail: { matrix: [1, 0, 0, 1, 0, 0], oldMatrix: [1, 0, 0, 1, 1, 1] },
      }),
    );

    expect(wrapper.emitted('action-start')).toHaveLength(1);
    expect(wrapper.emitted('action')).toHaveLength(1);
    expect(wrapper.emitted('change')).toHaveLength(1);
    expect(wrapper.emitted('transform')).toHaveLength(1);
  });

  it('supports v-model:data updates from cropper events', async () => {
    const wrapper = mount(CropperImage, {
      props: {
        src: '/model.jpg',
      },
    });

    await settle();

    mockState.selection.dispatchEvent(
      new CustomEvent('change', {
        detail: { height: 95, width: 85, x: 6, y: 7 },
      }),
    );

    const dataUpdates = wrapper.emitted('update:data');

    expect(dataUpdates?.at(-1)?.[0]).toEqual({
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

  it('applies v-model:data from the parent', async () => {
    const wrapper = mount(CropperImage, {
      props: {
        data: {
          imageTransform: [1, 0, 0, 1, 70, 80],
          selection: {
            aspectRatio: 3,
            height: 60,
            width: 50,
            x: 8,
            y: 9,
          },
        },
        src: '/model-in.jpg',
      },
    });

    await settle();

    expect(mockState.image.$setTransform).toHaveBeenCalledWith([1, 0, 0, 1, 70, 80]);
    expect(mockState.selection.$change).toHaveBeenCalledWith(8, 9, 50, 60, 3);

    await wrapper.setProps({
      data: {
        imageTransform: [1, 0, 0, 1, 11, 12],
        selection: {
          aspectRatio: 4,
          height: 40,
          width: 30,
          x: 1,
          y: 2,
        },
      },
    });

    expect(mockState.image.$setTransform).toHaveBeenLastCalledWith([1, 0, 0, 1, 11, 12]);
    expect(mockState.selection.$change).toHaveBeenLastCalledWith(1, 2, 30, 40, 4);
  });

  it('treats v-model:data null as a reset request', async () => {
    const wrapper = mount(CropperImage, {
      props: {
        data: {
          imageTransform: [1, 0, 0, 1, 70, 80],
          selection: {
            aspectRatio: 3,
            height: 60,
            width: 50,
            x: 8,
            y: 9,
          },
        },
        src: '/model-reset.jpg',
      },
    });

    await settle();

    mockState.image.$resetTransform.mockClear();
    mockState.selection.$reset.mockClear();

    await wrapper.setProps({ data: null });

    expect(mockState.image.$resetTransform).toHaveBeenCalledTimes(1);
    expect(mockState.selection.$reset).toHaveBeenCalledTimes(1);
  });

  it('emits an error when the image source fails to become ready', async () => {
    mockState.image.$ready.mockRejectedValueOnce(new Error('boom'));

    const wrapper = mount(CropperImage, {
      props: {
        src: '/broken.jpg',
      },
    });

    await settle();

    const errorEvents = wrapper.emitted('error');
    const firstError = errorEvents?.[0]?.[0];

    expect(errorEvents).toHaveLength(1);
    expect((firstError as Error).message).toContain('Failed to load image source');
  });

  it('destroys the cropper on unmount', async () => {
    const wrapper = mount(CropperImage, {
      props: {
        src: '/cleanup.jpg',
      },
    });

    await settle();

    const instance = mockState.instances[0];

    wrapper.unmount();

    expect(instance?.destroy).toHaveBeenCalledTimes(1);
  });
});
