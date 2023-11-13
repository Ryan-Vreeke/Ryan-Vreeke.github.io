// [TO-DO] Complete the implementation of the following class and the vertex shader below.

class CurveDrawer {
  constructor() {
    this.prog = InitShaderProgram(curvesVS, curvesFS)
    // [TO-DO] Other initializations should be done here.

    //attributes
    this.t = gl.getAttribLocation(this.prog, "t")

    this.mvp = gl.getUniformLocation(this.prog, "mvp")
    //uniforms
    this.p0 = gl.getUniformLocation(this.prog, "p0")
    this.p1 = gl.getUniformLocation(this.prog, "p1")
    this.p2 = gl.getUniformLocation(this.prog, "p2")
    this.p3 = gl.getUniformLocation(this.prog, "p3")

    // Initialize the attribute buffer
    this.steps = 100
    var tv = []
    for (var i = 0; i < this.steps; ++i) {
      tv.push(i / (this.steps - 1))
    }

    this.tBuff = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuff)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tv), gl.STATIC_DRAW)
  }

  setViewport(width, height) {
    // [TO-DO] This is where we should set the transformation matrix.
    // [TO-DO] Do not forget to bind the program before you set a uniform variable value.
    var trans = [
      2 / width,
      0,
      0,
      0,
      0,
      -2 / height,
      0,
      0,
      0,
      0,
      1,
      0,
      -1,
      1,
      0,
      1,
    ]
    gl.useProgram(this.prog)
    gl.uniformMatrix4fv(this.mvp, false, trans)
  }

  updatePoints(pt) {
    var p = []
    for (let i = 0; i < 4; i++) {
      var x = pt[i].getAttribute("cx")
      var y = pt[i].getAttribute("cy")
      p.push(x)
      p.push(y)
    }

    // [TO-DO] Do not forget to bind the program before you set a uniform variable value.
    // [TO-DO] The control points have changed, we must update corresponding uniform variables.
    gl.useProgram(this.prog)
    gl.uniform2f(this.p0, p[0], p[1])
    gl.uniform2f(this.p1, p[2], p[3])
    gl.uniform2f(this.p2, p[4], p[5])
    gl.uniform2f(this.p3, p[6], p[7])
  }

  draw() {
    // [TO-DO] This is where we give the command to draw the curve.
    // [TO-DO] Do not forget to bind the program and set the vertex attribute.
    gl.useProgram(this.prog)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuff)
    gl.vertexAttribPointer(this.t, 1, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(this.t)

    gl.useProgram(this.prog)
    gl.drawArrays(gl.LINE_STRIP, 0, 100)
  }
}

// Vertex Shader
var curvesVS = `
	attribute float t;
	uniform mat4 mvp;
	uniform vec2 p0;
	uniform vec2 p1;
	uniform vec2 p2;
	uniform vec2 p3;

	void main()
	{
		// [TO-DO] Replace the following with the proper vertex shader code
        float f0 = pow((1.0 - t), 3.0);
        float f1 = 3.0 * pow((1.0 - t), 2.0) * t;
        float f2 = 3.0 * (1.0 - t) * pow(t, 2.0);
        float f3 = pow(t, 3.0);

        vec2 sum = f0 * p0 + f1 * p1 + f2 * p2 + f3 * p3;
		gl_Position = mvp * vec4(sum , 0.0, 1.0);
	}
`

// Fragment Shader
var curvesFS = `
	precision mediump float;
	void main()
	{
		gl_FragColor = vec4(1,0,0,1);
	}
`
