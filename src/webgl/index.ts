import * as THREE from "three/webgpu"
import {
  mrt,
  output,
  velocity,
  packNormalToRGB,
  normalView,
} from 'three/tsl'
import {
  ThreeContextEvents,
  ThreeStart,
} from "three-start"

import { AssetLoaderModule } from './modules/AssetLoader'
import { OrbitControlsModule } from './modules/OrbitControls'
import { InspectorModule } from './modules/Inspector'

import { GridMaterial } from './materials/grid'

//
// Setup
//
const starter = new ThreeStart()

starter.addModules({
  assetLoader: new AssetLoaderModule(),
  orbitControls: new OrbitControlsModule(),
  inspector: new InspectorModule(),
})

const { scene, renderer, camera, modules, scenePass, renderPipeline } = starter.ctx

renderer.toneMapping = THREE.ACESFilmicToneMapping

starter.start()
starter.ctx.once(ThreeContextEvents.Mount, () => {
  createPostProcessing()
})

starter.mount(document.getElementById('app')! as HTMLDivElement)

await renderer.init()

modules.assetLoader.createKTX2Loader()

await modules.assetLoader.loadTextures(['/diamond-07.png', '/m.png'], { colorSpace: THREE.SRGBColorSpace })
await modules.assetLoader.loadModels('/suzanne.glb')
await modules.assetLoader.loadKTX('/2d_etc1s.ktx2', {
  flipY: false,
  colorSpace: THREE.SRGBColorSpace,
})

//
// Camera
//
camera.position.set(0, 1, 5)

const geometry = new THREE.PlaneGeometry(10, 10, 10, 10).rotateX(-Math.PI / 2)
const mesh = new THREE.Mesh(geometry, GridMaterial)
scene.add(mesh)

//
// Post-processing and Inspector
//
function createPostProcessing(): void {
  scenePass.setMRT(
    mrt({
      output,
      velocity,
      normal: packNormalToRGB(normalView)
    })
  )

  const scenePassColor = scenePass.getTextureNode('output').toInspector('Output')
  // const scenePassDepth = scenePass.getTextureNode('depth').toInspector('Depth', () => scenePass.getLinearDepthNode())
  // const scenePassNormal = scenePass.getTextureNode('normal').toInspector('Normal')
  // const scenePassVelocity = scenePass.getTextureNode('velocity').toInspector('Velocity')

  // const outputNode = Fn(() => {
  //   const top = mix(scenePassColor.renderOutput(), scenePassDepth.step(1), step(0.5, screenUV.x))
  //   const bottom = mix(scenePassNormal, scenePassVelocity, step(0.5, screenUV.x))
  //   const out = mix(top, bottom, step(0.5, screenUV.y))

  //   return out
  // })

  renderPipeline.outputNode = scenePassColor
}
