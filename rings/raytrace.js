AFRAME.registerComponent("raytrace", {
  schema: {
	shader: {type: "selector" },
	asset: { type: "asset" },
    transparent: { type: "boolean", default: false },
    backside: { type: "boolean", default: false },
    color: { type: "color", default: "white" },
    time: { type: "number", default: 0 }
  },

  init: function () {
    var color = new THREE.Color( this.data.color );
    this.myMesh = this.el.getObject3D("mesh");
    this.myShaderMaterial = new THREE.ShaderMaterial({
      vertexShader:
        "precision mediump float;\n" +
        "varying vec3 localSurfacePos;\n" +
        "void main() {\n" +
        "gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);\n" +
        "localSurfacePos = position;\n" +
        "}",
      uniforms: {
        time: { value: this.data.time },
        localCameraPos: { value: new THREE.Vector3(0, 0, 0) },
        surfaceColor: { value: new THREE.Vector3(color.r, color.g, color.b)  }
      },
    });
    this.myMesh.material = this.myShaderMaterial;

    var self = this;
    this.myMesh.onBeforeRender = function (
      renderer,
      scene,
      camera,
      geometry,
      material,
      group
    ) {
      self.myShaderMaterial.uniforms.localCameraPos.value.setFromMatrixPosition(
        camera.matrixWorld
      );
      self.myMesh.worldToLocal(
        self.myShaderMaterial.uniforms.localCameraPos.value
      );
    };
  },
  remove: function () {
    this.myMesh.onBeforeRender = null;
  },
  update: function (oldData) {
    if(this.data.shader || this.data.asset) {
      this.myShaderMaterial.fragmentShader = this.data.shader 
        ? this.data.shader.textContent 
        : THREE.Cache.get(this.data.asset);
      this.myShaderMaterial.side = this.data.backside
        ? THREE.BackSide
        : THREE.FrontSide;
      this.myShaderMaterial.transparent = this.data.transparent;
    }
  },
  tick: function (time, timeDelta) {
    this.myShaderMaterial.uniforms.time.value = time + this.data.time;
  },
});
