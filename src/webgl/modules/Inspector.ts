import { ContextModule } from "three-start"
import { Inspector } from 'three/addons/inspector/Inspector.js'

import type BloomNode from 'three/addons/tsl/display/BloomNode.js'
import type { ParametersGroup } from "three/examples/jsm/inspector/tabs/Parameters.js"

import { GridMaterial, count, thickness, colorsPool, strength, speed } from '../materials/grid'

export class InspectorModule extends ContextModule {
  inspector!: Inspector
  gui!: ParametersGroup

  onAwake() {
    this.inspector = this.ctx.renderer.inspector = new Inspector()

    this.gui = this.inspector.createParameters('Settings')
    this.createControls()
    this.createGrid()
  }

  private createControls(): void {
    const folder = this.gui.addFolder('Controls')

    const { modules } = this.ctx

    folder.add(modules.orbitControls.controls, 'enabled').name('Enabled')
    folder.add(modules.orbitControls.controls, 'enableZoom').name('Enable Zoom')
    folder.add(modules.orbitControls.controls, 'enablePan').name('Enable Pan')
    folder.add(modules.orbitControls.controls, 'enableRotate').name('Enable Rotate')
    folder.add(modules.orbitControls.controls, 'autoRotate').name('Auto Rotate')
    folder.add(modules.orbitControls.controls, 'autoRotateSpeed', 0, 2).name('Auto Rotate Speed')
  }

  private createGrid(): void {
    const folder = this.gui.addFolder('Grid')

    folder.add(GridMaterial, 'wireframe').name('Wireframe')
    folder.add(count, 'value', 2, 20, 2).name('Count')
    folder.add(thickness, 'value', 0.01, 1, 0.01).name('Thickness')
    folder.addColor(colorsPool.array, 0).name('Colors 01')
    folder.addColor(colorsPool.array, 1).name('Colors 02')
    folder.addColor(colorsPool.array, 2).name('Colors 03')
    folder.add(strength, 'value', 0, 3, 0.01).name('Strength')
    folder.add(speed, 'value', 0, 2, 0.01).name('Speed')
  }

  createBloom(bloomPass: BloomNode): void {
    const folder = this.gui.addFolder('Bloom')

    // folder.add(bloom, 'value', 0, 1, 0.01).name('Bloom')
    folder.add(bloomPass.strength, 'value', 0, 10, 0.01).name('Strength')
    folder.add(bloomPass.radius, 'value', 0, 1, 0.01).name('Radius')
    folder.add(bloomPass.threshold, 'value', 0, 1, 0.01).name('Threshold')
  }
}
