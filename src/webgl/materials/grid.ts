import { MeshBasicNodeMaterial, DoubleSide, Node, Color } from 'three/webgpu'
import {
  uv,
  uniform,
  max,
  min,
  Fn,
  vec3,
  instanceIndex,
  instancedArray,
  positionLocal,
  rotate,
  If,
  float,
  HALF_PI,
  time,
  mx_fractal_noise_float,
  uniformArray
} from 'three/tsl'

import { GRID_COUNT } from '../constants'

export const count = uniform(18)
export const thickness = uniform(0.015)
export const colorsPool = uniformArray([
  new Color(0x14fbff),
  new Color(0xff14a9),
  new Color(0x34ff12)
], 'color')
export const strength = uniform(3)
export const speed = uniform(0.3)

const positions = instancedArray(GRID_COUNT, 'vec3')
const originalPositions = instancedArray(GRID_COUNT, 'vec3')
const rotations = instancedArray(GRID_COUNT, 'vec3')

const TOTAL = float(GRID_COUNT)
const HALF_TOTAL = TOTAL.div(2)

export const GridMaterial = new MeshBasicNodeMaterial({
  transparent: true,
  side: DoubleSide,
  forceSinglePass: true,
  wireframe: false,
  depthWrite: false
})

export const computeInit = Fn(() => {
  const idx = instanceIndex.toFloat()
  const pos = positions.element(idx)
  const rot = rotations.element(idx)

  const origin = vec3()

  If(idx.lessThan(HALF_TOTAL), () => {
    origin.assign(vec3(0, idx.sub(HALF_TOTAL.div(2)), 0))
  }).Else(() => {
    origin.assign(vec3(0, 0, idx.sub(HALF_TOTAL).sub(HALF_TOTAL.div(2))))
    rot.assign(vec3(HALF_PI, 0, 0))
  })

  pos.assign(origin)
  originalPositions.element(idx).assign(origin)
})().compute(GRID_COUNT)

export const computeUpdate = Fn(() => {
  const idx = instanceIndex.toFloat()
  const pos = positions.element(idx)
  const originalPos = originalPositions.element(idx)

  If(idx.greaterThanEqual(HALF_TOTAL), () => {
    const originalZ = originalPos.z.toVar()
    const z = originalZ
                .add(time.mul(speed))
                .mod(HALF_TOTAL)
                .sub(HALF_TOTAL.div(2))

    pos.z.assign(z)
  })
})().compute(GRID_COUNT)

const Grid = Fn(([_coords, _count]: [Node<'vec2'>, Node<'float'>]) => {
  const x = _coords.x.mul(_count).fract().sub(0.5).abs().mul(2).step(thickness.oneMinus())
  const y = _coords.y.mul(_count).fract().sub(0.5).abs().mul(2).step(thickness.oneMinus())

  return max(x, y)
}, { coords: 'vec2', count: 'float', return: 'float' })

GridMaterial.colorNode = Fn(() => {
  const idx = instanceIndex.toFloat()
  const color = colorsPool.element(idx.mod(colorsPool.array.length))
  return color.add(color.pow(strength))
})()

GridMaterial.opacityNode = Fn(() => {
  const idx = instanceIndex.toFloat()
  const pos = positions.element(idx)

  const back = pos.z.smoothstep(HALF_TOTAL.div(2).negate(), HALF_TOTAL.div(2).sub(0.5).negate())
  const front = pos.z.smoothstep(HALF_TOTAL.div(2), HALF_TOTAL.div(2).sub(0.5))

  const grid = Grid(uv(), count)

  const noise = mx_fractal_noise_float(
                  positionLocal
                    .add(pos.xy)
                    .mul(1.3)
                    .add(time.mul(0.3)),
                    0.6
                )
                .smoothstep(0.35, 0.6)

  return min(back, front, grid, noise)
})()

GridMaterial.positionNode = Fn(() => {
  const rotated = rotate(positionLocal, rotations.toAttribute())
  const position = positions.toAttribute()

  return rotated.add(position)
})()
