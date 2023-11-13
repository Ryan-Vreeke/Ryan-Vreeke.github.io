// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
  // [TO-DO] Modify the code below to form the transformation matrix.
  let sinX = Math.sin(rotationX);
  let cosX = Math.cos(rotationX);
  let cosY = Math.cos(rotationY);
  let sinY = Math.sin(rotationY);
  var yRotation = [
    cosY, 0, sinY, 0,
    0, 1, 0, 0,
    -sinY, 0, cosY, 0,
    0, 0, 0, 1
  ]

  var xRotation = [
    1, 0, 0, 0,
    0, cosX, -sinX, 0,
    0, sinX, cosX, 0,
    0, 0, 0, 1
  ]
  var trans = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    translationX, translationY, translationZ, 1
  ];

  let rotation = MatrixMult(yRotation, xRotation);
  trans = MatrixMult(trans, rotation);
  var mvp = MatrixMult(projectionMatrix, trans);
  return mvp;
}

// [TO-DO] Complete the implementation of the following class.

var meshVS = `
	    attribute vec3 pos;
      attribute vec2 txc;
	    uniform mat4 mvp;
      uniform int swap;
      varying vec2 texCoord;

      mat4 swapYandZ(mat4 original){
        vec4 temp= original[1];
        original[1] = original[2];
        original[2] = temp;
        return original;
      }

	    void main()
	    {
        
        if(swap == 1){
          mat4 swapped = swapYandZ(mvp);
		      gl_Position = swapped * vec4(pos,1);
        }else{
		      gl_Position = mvp * vec4(pos,1);
        }
        texCoord = txc;
	    }
    `;

//gl_FragColor = texture2D(tex, texCoords);
// Fragment shader source code
var meshFS = `
      precision mediump float; 
      uniform sampler2D tex;
      uniform int useTexture;
      varying vec2 texCoord;
      
	    void main()
	    {
        if(useTexture == 1){
          gl_FragColor = texture2D(tex, texCoord);
        }else{
          gl_FragColor = vec4(1,gl_FragCoord.z*gl_FragCoord.z,0,1);
        }
	    }
    `;

class MeshDrawer {
  // The constructor is a good place for taking care of the necessary initializations.
  constructor() {
    this.use_texture = false;
    this.prog = InitShaderProgram(meshVS, meshFS);
    // attributes
    this.pos = gl.getAttribLocation(this.prog, 'pos');
    this.tex = gl.getAttribLocation(this.prog, 'txc');
    // uniforms
    this.swap = gl.getUniformLocation(this.prog, 'swap');
    this.mvp = gl.getUniformLocation(this.prog, 'mvp');
    this.useTexture = gl.getUniformLocation(this.prog, 'useTexture');
  }

  // This method is called every time the user opens an OBJ file.
  // The arguments of this function is an array of 3D vertex positions
  // and an array of 2D texture coordinates.
  // Every item in these arrays is a floating point value, representing one
  // coordinate of the vertex position or texture coordinate.
  // Every three consecutive elements in the vertPos array forms one vertex
  // position and every three consecutive vertex positions form a triangle.
  // Similarly, every two consecutive elements in the texCoords array
  // form the texture coordinate of a vertex.
  // Note that this method can be called multiple times.
  // vertPost = 3D vertex positions
  // texCoords = 2d texCoords
  setMesh(vertPos, texCoords) {
    // [TO-DO] Update the contents of the vertex buffer objects.
    this.numTriangles = vertPos.length / 3;
    this.vertBuffer = gl.createBuffer();
    this.texBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

    //binding texture coords
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

  }

  // This method is called when the user changes the state of the
  // "Swap Y-Z Axes" checkbox. 
  // The argument is a boolean that indicates if the checkbox is checked.
  swapYZ(swap) {
    gl.useProgram(this.prog);

    if(swap){
      gl.uniform1i(this.swap, 1);
      return;
    }

    gl.uniform1i(this.swap, 0);
  }

  // This method is called to draw the triangular mesh.
  // The argument is the transformation matrix, the same matrix returned
  // by the GetModelViewProjection function above.
  draw(trans) {
    // [TO-DO] Complete the WebGL initializations before drawing
    // dont use this code just here for now
    gl.useProgram(this.prog);
    gl.uniformMatrix4fv(this.mvp, false, trans);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.pos);

    if (this.use_texture) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
      gl.vertexAttribPointer(this.tex, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(this.tex);
    }
    // !!
    gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
  }

  // This method is called to set the texture of the mesh.
  // The argument is an HTML IMG element containing the texture data.
  setTexture(img) {
    // [TO-DO] Bind the texture
    this.mytex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.mytex);

    // You can set the texture image data using the following command.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);

    // some uniform parameter(s) of the fragment shader, so that it uses the texture.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);//bilinear when you are zoomed in
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);//trilinear when you are looking at the texture from a distance

    gl.useProgram(this.prog);
    gl.uniform1i(this.useTexture, 1);
    this.use_texture = true;
  }

  // This method is called when the user changes the state of the
  // "Show Texture" checkbox. 
  // The argument is a boolean that indicates if the checkbox is checked.
  showTexture(show) {
    gl.useProgram(this.prog);
    if (show) {
      this.use_texture = true;
      gl.uniform1i(this.useTexture, 1);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.mytex);

      let sampler = gl.getUniformLocation(this.prog, 'tex');
      gl.useProgram(this.prog);
      gl.uniform1i(sampler, 0);
    } else {
      this.use_texture = true;
      gl.uniform1i(this.useTexture, 0);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }
    // [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
  }

}
