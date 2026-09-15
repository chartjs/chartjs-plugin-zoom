import {
  acquireChart,
  releaseChart,
  specsFromFixtures,
  triggerMouseEvent,
  addMatchers,
  releaseCharts,
} from 'chartjs-test-utils'

// force ratio=1 for tests on high-res/retina devices
// ref https://github.com/chartjs/Chart.js/issues/4515
window.devicePixelRatio = 1

window.acquireChart = acquireChart
window.releaseChart = releaseChart

jasmine.fixture = {
  specs: specsFromFixtures,
}
jasmine.triggerMouseEvent = triggerMouseEvent

jasmine.triggerWheelEvent = function (chart, init = {}) {
  const node = chart.canvas
  const rect = node.getBoundingClientRect()
  const event = new WheelEvent(
    'wheel',
    Object.assign({}, init, {
      clientX: rect.left + init.x,
      clientY: rect.top + init.y,
      cancelable: true,
      bubbles: true,
      view: window,
    })
  )

  node.dispatchEvent(event)
}

jasmine.dispatchEvent = function (chart, type, pt, init = {}) {
  const node = chart.canvas
  const rect = node.getBoundingClientRect()
  const event = new MouseEvent(
    type,
    Object.assign({}, init, {
      clientX: rect.left + pt.x,
      clientY: rect.top + pt.y,
      cancelable: true,
      bubbles: true,
      view: window,
    })
  )

  node.dispatchEvent(event)
}

// Native Pointer Events replacement for the former Hammer.js `Simulator`.
// Drives the plugin's gesture handling directly, without a gesture library.
// `init` accepts any PointerEvent property, e.g. `button` or `ctrlKey`.
function dispatchPointer(node, type, pointerId, clientX, clientY, init = {}) {
  node.dispatchEvent(
    new PointerEvent(
      type,
      Object.assign(
        {
          pointerId,
          pointerType: 'touch',
          clientX,
          clientY,
          cancelable: true,
          bubbles: true,
          view: window,
          isPrimary: pointerId === 1,
        },
        init
      )
    )
  )
}

jasmine.dispatchPointer = dispatchPointer

jasmine.simulatePan = function (chart, { deltaX = 0, deltaY = 0, steps = 5, ...init } = {}, done) {
  const node = chart.canvas
  const rect = node.getBoundingClientRect()
  const startX = rect.left + rect.width / 2
  const startY = rect.top + rect.height / 2

  dispatchPointer(node, 'pointerdown', 1, startX, startY, init)
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    dispatchPointer(node, 'pointermove', 1, startX + deltaX * t, startY + deltaY * t, init)
  }
  dispatchPointer(node, 'pointerup', 1, startX + deltaX, startY + deltaY, init)

  if (done) {
    done()
  }
}

jasmine.simulatePinch = function (chart, { pos, scale = 2, steps = 5 } = {}, done) {
  const node = chart.canvas
  const rect = node.getBoundingClientRect()
  const cx = pos ? rect.left + pos[0] : rect.left + rect.width / 2
  const cy = pos ? rect.top + pos[1] : rect.top + rect.height / 2
  const startGap = 40

  const finger = (gap) => [
    { x: cx - gap, y: cy },
    { x: cx + gap, y: cy },
  ]

  const start = finger(startGap)
  dispatchPointer(node, 'pointerdown', 1, start[0].x, start[0].y)
  dispatchPointer(node, 'pointerdown', 2, start[1].x, start[1].y)

  for (let i = 1; i <= steps; i++) {
    const gap = startGap * (1 + (scale - 1) * (i / steps))
    const pts = finger(gap)
    dispatchPointer(node, 'pointermove', 1, pts[0].x, pts[0].y)
    dispatchPointer(node, 'pointermove', 2, pts[1].x, pts[1].y)
  }

  const end = finger(startGap * scale)
  dispatchPointer(node, 'pointerup', 1, end[0].x, end[0].y)
  dispatchPointer(node, 'pointerup', 2, end[1].x, end[1].y)

  if (done) {
    done()
  }
}

beforeEach(function () {
  addMatchers()
})

afterEach(function () {
  releaseCharts()
})

beforeAll(() => {
  // Disable colors plugin for tests.
  window.Chart.defaults.plugins.colors.enabled = false
})
