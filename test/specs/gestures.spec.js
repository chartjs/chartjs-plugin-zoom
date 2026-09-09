describe('gesture manager', function () {
  const data = {
    datasets: [
      {
        data: [
          { x: 1, y: 3 },
          { x: 2, y: 2 },
          { x: 3, y: 1 },
        ],
      },
    ],
  }

  it('should disable text selection and browser touch actions while gestures are enabled', function () {
    const chart = window.acquireChart({
      type: 'scatter',
      data,
      options: {
        plugins: {
          zoom: {
            pan: { enabled: true },
          },
        },
      },
    })

    expect(chart.canvas.style.touchAction).toBe('none')
    expect(chart.canvas.style.userSelect).toBe('none')
  })

  it('should leave canvas styles untouched when neither pan nor pinch is enabled', function () {
    const chart = window.acquireChart({
      type: 'scatter',
      data,
      options: {
        plugins: {
          zoom: {
            zoom: { wheel: { enabled: true } },
          },
        },
      },
    })

    expect(chart.canvas.style.userSelect).toBe('')
    expect(chart.canvas.style.touchAction).toBe('')
  })
})
