import { ContextModule } from "three-start"
import { Inspector } from 'three/addons/inspector/Inspector.js'

import type { ParametersGroup } from "three/examples/jsm/inspector/tabs/Parameters.js"

import { GridMaterial, size, thickness } from '../materials/grid'

export class InspectorModule extends ContextModule {
  inspector!: Inspector
  gui!: ParametersGroup

  onAwake() {
    this.inspector = this.ctx.renderer.inspector = new Inspector()

    this.gui = this.inspector.createParameters('Settings')
    this.gui.add(GridMaterial, 'wireframe').name('Wireframe')
    this.gui.add(size, 'value', 2, 20, 1).name('Size')
    this.gui.add(thickness, 'value', 0.01, 1, 0.01).name('Thickness')
  }
}
