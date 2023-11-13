// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.

function GetTransform(positionX, positionY, rotation, scale) {
  //m = array(
  // 0, 3, 6
  // 1, 4, 7
  // 2, 5, 8
  //)

  let sin = Math.sin((rotation * Math.PI) / 180)
  let cos = Math.cos((rotation * Math.PI) / 180)

  let m = Array(
    scale * cos,
    scale * sin,
    0,
    scale * -sin,
    scale * cos,
    0,
    positionX,
    positionY,
    1
  )

  return m
}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform(trans1, trans2) {
  let out = Array(1, 0, 0, 0, 1, 0, 0, 0, 1)

  for (let k = 0; k < 3; k++) {
    for (let j = 0; j < 3; j++) {
      let sum = 0
      for (let i = 0; i < 3; i++) {
        sum += trans1[i + 3 * k] * trans2[i * 3 + j]
      }
      out[j + k * 3] = sum
    }
  }

  return out
}
