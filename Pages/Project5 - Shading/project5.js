// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix(
  translationX,
  translationY,
  translationZ,
  rotationX,
  rotationY
) {
  // [TO-DO] Modify the code below to form the transformation matrix.
  let sinX = Math.sin(rotationX)
  let cosX = Math.cos(rotationX)
  let cosY = Math.cos(rotationY)
  let sinY = Math.sin(rotationY)

  var rotationX = [1, 0, 0, 0, 0, cosX, sinX, 0, 0, -sinX, cosX, 0, 0, 0, 0, 1]

  var rotationY = [cosY, 0, -sinY, 0, 0, 1, 0, 0, sinY, 0, cosY, 0, 0, 0, 0, 1]

  var trans = [
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    translationX,
    translationY,
    translationZ,
    1,
  ]

  var rotation = MatrixMult(rotationY, rotationX)
  trans = MatrixMult(trans, rotation)
  return trans
}

var meshVS = `
	    attribute vec3 pos;
      attribute vec2 txc;
      attribute vec3 normals;

	    uniform mat4 mvp;
      uniform mat4 mv;
      uniform mat3 normalMatrix;
      uniform int swap;
      uniform float shininess;
      uniform vec3 lightDir;

      varying vec3 vPos;
      varying vec2 texCoord;
      varying vec3 norCoord;
      varying vec3 lightIn;
      varying float a;

      mat4 swapYandZ(mat4 original){
        vec4 temp= original[1];
        original[1] = original[2];
        original[2] = temp;
        return original;
      }

      mat3 swapYandZ(mat3 original){
        vec3 temp= original[1];
        original[1] = original[2];
        original[2] = temp;
        return original;
      }

	    void main()
	    {
        gl_Position = mvp * vec4(pos,1.0); 
        vPos = vec3(mv * vec4(pos, 1.0)).xyz;
        norCoord = normalMatrix * normals;
        
        if(swap == 1){
          mat4 swapped = swapYandZ(mvp);
          gl_Position = swapped * vec4(pos,1.0);
          norCoord = swapYandZ(normalMatrix) * normals;
          vPos = vec3(swapYandZ(mv) * vec4(pos, 1.0)).xyz;
        }

        texCoord = txc;
        a = shininess;
        lightIn = lightDir;
	    }
`

var meshFS = `
      precision mediump float; 

      uniform sampler2D tex;
      uniform int useTexture;

      varying vec2 texCoord;
      varying vec3 norCoord;
      varying vec3 vPos;
      varying vec3 lightIn;
      varying float a;
      
	    void main()
	    {
        vec3 v = normalize(vec3(0,0,0) - vPos);

        vec3 n = normalize(norCoord);
        vec3 h = normalize(normalize(lightIn) + v);
        float geo = dot(normalize(lightIn), n);
        float spec = dot(n,h);
        vec3 kd = vec3(1,1,1);
        vec3 ks = vec3(1,1,1);
        float I = 0.5;

        if(useTexture == 1){
          kd = texture2D(tex, texCoord).xyz;
        }
        vec3 color = I * (max(0.0,geo) * kd + ks * pow(max(0.0, spec), a)) + 0.1 * kd;
        gl_FragColor = vec4(color,1);
	    }
`

//gl_FragColor = 0.5 * max(0.0,geo) *(kd + ks * (pow(max(0.0,spec),a)/geo));
class MeshDrawer {
  constructor() {
    this.use_texture = false
    this.prog = InitShaderProgram(meshVS, meshFS)
    // attributes
    this.pos = gl.getAttribLocation(this.prog, "pos")
    this.tex = gl.getAttribLocation(this.prog, "txc")
    this.normals = gl.getAttribLocation(this.prog, "normals")
    // uniforms
    this.swap = gl.getUniformLocation(this.prog, "swap")
    this.mvp = gl.getUniformLocation(this.prog, "mvp")
    this.mv = gl.getUniformLocation(this.prog, "mv")
    this.nM = gl.getUniformLocation(this.prog, "normalMatrix")

    this.useTexture = gl.getUniformLocation(this.prog, "useTexture")
    this.lightDir = gl.getUniformLocation(this.prog, "lightDir")
  }

  // This method is called every time the user opens an OBJ file.
  // The arguments of this function is an array of 3D vertex positions,
  // an array of 2D texture coordinates, and an array of vertex normals.
  // Every item in these arrays is a floating point value, representing one
  // coordinate of the vertex position or texture coordinate.
  // Every three consecutive elements in the vertPos array forms one vertex
  // position and every three consecutive vertex positions form a triangle.
  // Similarly, every two consecutive elements in the texCoords array
  // form the texture coordinate of a vertex and every three consecutive
  // elements in the normals array form a vertex normal.
  // Note that this method can be called multiple times.
  setMesh(vertPos, texCoords, normals) {
    // [TO-DO] Update the contents of the vertex buffer objects.
    this.drawObj = true
    this.numTriangles = vertPos.length / 3
    this.vertBuffer = gl.createBuffer()
    this.texBuffer = gl.createBuffer()
    this.normBuffer = gl.createBuffer()

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW)

    //binding texture coords
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW)

    //normals buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW)
  }

  // This method is called when the user changes the state of the
  // "Swap Y-Z Axes" checkbox.
  // The argument is a boolean that indicates if the checkbox is checked.
  swapYZ(swap) {
    gl.useProgram(this.prog)

    if (swap) {
      gl.uniform1i(this.swap, 1)
      return
    }

    gl.uniform1i(this.swap, 0)
  }

  // This method is called to draw the triangular mesh.
  // The arguments are the model-view-projection transformation matrixMVP,
  // the model-view transformation matrixMV, the same matrix returned
  // by the GetModelViewProjection function above, and the normal
  // transformation matrix, which is the inverse-transpose of matrixMV.
  draw(matrixMVP, matrixMV, matrixNormal) {
    gl.useProgram(this.prog)
    gl.uniformMatrix4fv(this.mvp, false, matrixMVP)
    gl.uniformMatrix4fv(this.mv, false, matrixMV)
    gl.uniformMatrix3fv(this.nM, false, matrixNormal)

    if (this.use_texture) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer)
      gl.vertexAttribPointer(this.tex, 2, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(this.tex)
    }

    if (this.drawObj) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuffer)
      gl.vertexAttribPointer(this.normals, 3, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(this.normals)
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer)
    gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(this.pos)

    gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles)
  }

  // This method is called to set the texture of the mesh.
  // The argument is an HTML IMG element containing the texture data.
  setTexture(img) {
    this.mytex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, this.mytex)

    // You can set the texture image data using the following command.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img)
    gl.generateMipmap(gl.TEXTURE_2D)

    // some uniform parameter(s) of the fragment shader, so that it uses the texture.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR) //bilinear when you are zoomed in
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR
    ) //trilinear when you are looking at the texture from a distance

    gl.useProgram(this.prog)
    gl.uniform1i(this.useTexture, 1)
    this.use_texture = true

    // You can set the texture image data using the following command.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img)
  }

  // This method is called when the user changes the state of the
  // "Show Texture" checkbox.
  // The argument is a boolean that indicates if the checkbox is checked.
  showTexture(show) {
    gl.useProgram(this.prog)
    if (show) {
      this.use_texture = true
      gl.uniform1i(this.useTexture, 1)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, this.mytex)

      let sampler = gl.getUniformLocation(this.prog, "tex")
      gl.useProgram(this.prog)
      gl.uniform1i(sampler, 0)
    } else {
      this.use_texture = true
      gl.uniform1i(this.useTexture, 0)
      gl.bindTexture(gl.TEXTURE_2D, null)
    }
  }

  // This method is called to set the incoming light direction
  setLightDir(x, y, z) {
    // [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
    gl.useProgram(this.prog)
    gl.uniform3f(this.lightDir, x, y, z)
  }

  // This method is called to set the shininess of the material
  setShininess(shininess) {
    gl.useProgram(this.prog)
    this.shine = gl.getUniformLocation(this.prog, "shininess")
    gl.uniform1f(this.shine, shininess)
  }
}
