// The specs elsewhere import the source. These load the built UMD bundles the
// way a page does, with script tags after the Chart.js UMD bundle, to catch
// what only the bundling changes. Needs `npm run build` first.
// Chart.js does not export its UMD bundle, so it is reached by path.
import chartUrl from '../../node_modules/chart.js/dist/chart.umd.js?url'
import zoomUrl from '../../dist/chartjs-plugin-zoom.js?url'
import zoomMinUrl from '../../dist/chartjs-plugin-zoom.min.js?url'

function loadPage(pluginUrl) {
  return new Promise((resolve, reject) => {
    const frame = document.createElement('iframe')
    frame.style.width = '500px'
    frame.style.height = '500px'
    frame.onload = () => resolve(frame)
    frame.onerror = reject
    frame.srcdoc = `<!DOCTYPE html><html><body style="margin:0">
      <canvas id="chart" width="400" height="400"></canvas>
      <script src="${chartUrl}"></script>
      <script src="${pluginUrl}"></script>
    </body></html>`
    document.body.appendChild(frame)
  })
}

const nextFrameOf = (win) => new Promise((resolve) => win.requestAnimationFrame(() => resolve()))

describe.each([
  ['chartjs-plugin-zoom.js', zoomUrl],
  ['chartjs-plugin-zoom.min.js', zoomMinUrl],
])('the UMD bundle %s', function (_name, pluginUrl) {
  let frame

  afterEach(function () {
    frame?.remove()
    frame = undefined
  })

  it('should zoom with the wheel once per frame without errors', async function () {
    frame = await loadPage(pluginUrl)
    const win = frame.contentWindow
    const errors = []
    win.addEventListener('error', (e) => errors.push(e.error ?? e.message))

    const chart = new win.Chart(win.document.getElementById('chart'), {
      type: 'scatter',
      data: {
        datasets: [
          {
            data: [
              { x: 0, y: 0 },
              { x: 100, y: 100 },
            ],
          },
        ],
      },
      options: {
        animation: false,
        responsive: false,
        scales: { x: { min: 0, max: 100 }, y: { min: 0, max: 100 } },
        plugins: { zoom: { zoom: { wheel: { enabled: true }, mode: 'x' } } },
      },
    })

    const { left, right, top, bottom } = chart.scales.x
    const rect = chart.canvas.getBoundingClientRect()
    for (let i = 0; i < 4; i++) {
      chart.canvas.dispatchEvent(
        new win.WheelEvent('wheel', {
          clientX: rect.left + (left + right) / 2,
          clientY: rect.top + (top + bottom) / 2 - 20,
          deltaY: -100,
          cancelable: true,
          bubbles: true,
          view: win,
        })
      )
    }

    // Only the first event has zoomed; the rest wait for the next frame.
    expect(chart.scales.x.max - chart.scales.x.min).toBeCloseTo(90, 10)

    await nextFrameOf(win)

    expect(chart.scales.x.max - chart.scales.x.min).toBeCloseTo(100 * 0.9 ** 4, 10)
    expect(errors).toEqual([])
  })
})
