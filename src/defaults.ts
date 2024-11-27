import type { ZoomPluginOptions } from './options'

export const defaults: ZoomPluginOptions = {
  pan: {
    enabled: false,
    mode: 'xy',
    threshold: 10,
    modifierKey: null,
  },
  zoom: {
    wheel: {
      enabled: false,
      speed: 0.1,
      modifierKey: null,
    },
    drag: {
      enabled: false,
      drawTime: 'beforeDatasetsDraw',
      modifierKey: null,
    },
    pinch: {
      enabled: false,
    },
    mode: 'xy',
  },
}
