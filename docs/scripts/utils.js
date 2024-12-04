import { valueOrDefault } from 'chart.js/helpers'
import { addHours, startOfWeek, endOfWeek, isWeekend, nextMonday, getHours, setHours } from 'date-fns'
import addDays from 'date-fns/addDays'

// Adapted from http://indiegamr.com/generate-repeatable-random-numbers-in-js/
let _seed = Date.now()

export function srand(seed) {
  _seed = seed
}

export function rand(min, max) {
  min = valueOrDefault(min, 0)
  max = valueOrDefault(max, 0)
  _seed = (_seed * 9301 + 49297) % 233280
  return min + (_seed / 233280) * (max - min)
}

export function numbers(config) {
  const cfg = config || {}
  const min = valueOrDefault(cfg.min, 0)
  const max = valueOrDefault(cfg.max, 100)
  const from = valueOrDefault(cfg.from, [])
  const count = valueOrDefault(cfg.count, 8)
  const decimals = valueOrDefault(cfg.decimals, 8)
  const continuity = valueOrDefault(cfg.continuity, 1)
  const dfactor = Math.pow(10, decimals) || 0
  const data = []
  let i, value

  for (i = 0; i < count; ++i) {
    value = (from[i] || 0) + this.rand(min, max)
    if (this.rand() <= continuity) {
      data.push(Math.round(dfactor * value) / dfactor)
    } else {
      data.push(null)
    }
  }

  return data
}

export function points(config) {
  const xs = this.numbers(config)
  const ys = this.numbers(config)
  return xs.map((x, i) => ({ x, y: ys[i] }))
}

const rand255 = () => Math.round(Math.random() * 255)

export function randomColor(alpha) {
  return 'rgba(' + rand255() + ',' + rand255() + ',' + rand255() + ',' + (alpha || '.3') + ')'
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function months(config) {
  const cfg = config || {}
  const count = cfg.count || 12
  const section = cfg.section
  const values = []
  let i, value

  for (i = 0; i < count; ++i) {
    value = MONTHS[Math.ceil(i) % 12]
    values.push(value.substring(0, section))
  }

  return values
}

export function hourlyPoints(config) {
  const ys = this.numbers(config)
  const start = new Date().valueOf()
  return ys.map((y, i) => ({ x: addHours(start, i), y }))
}

function nextOfficeHour(time) {
  if (getHours(time) > 17) {
    time = setHours(addDays(time, 1), 8)
  }
  if (getHours(time) < 9) {
    time = setHours(time, 9)
  } else {
    time = addHours(time, 1)
  }
  if (isWeekend(time)) {
    time = setHours(nextMonday(time), 9)
  }
  return time
}

export function officeHourPoints(config) {
  const ys = this.numbers(config)
  let time = new Date().valueOf()
  return ys.map((y) => {
    time = nextOfficeHour(time)
    return { x: +time, y }
  })
}

export function nextWeek() {
  const now = new Date().valueOf()
  const min = startOfWeek(addHours(endOfWeek(now), 24))
  return {
    min: +min,
    max: +endOfWeek(min),
  }
}
