import { MeshBasicNodeMaterial, DoubleSide, Node } from 'three/webgpu'
import { uv, uniform, max, Fn, vec3 } from 'three/tsl'

export const size = uniform(10)
export const thickness = uniform(0.1)

export const GridMaterial = new MeshBasicNodeMaterial({
  transparent: true,
  side: DoubleSide,
  forceSinglePass: true,
  wireframe: false
})

const Grid = Fn(([_coords, _size]: [Node<'vec2'>, Node<'float'>]) => {
  const x = _coords.x.mul(_size).fract().sub(0.5).abs().mul(2).step(thickness.oneMinus())
  const y = _coords.y.mul(_size).fract().sub(0.5).abs().mul(2).step(thickness.oneMinus())

  return max(x, y)
}, { coords: 'vec2', size: 'float', return: 'float' })

GridMaterial.colorNode = vec3(Grid(uv(), size))

GridMaterial.opacityNode = Grid(uv(), size)
