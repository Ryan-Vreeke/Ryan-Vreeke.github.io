// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite(bgImg, fgImg, fgOpac, fgPos) {
  let startX = 0
  let startY = 0

  if (fgPos.x > 0) {
    startX = fgPos.x
  }

  if (fgPos.y > 0) {
    startY = fgPos.y
  }

  for (let x = 0; x < fgImg.width; x++) {
    for (let y = 0; y < fgImg.height; y += 4) {
      if (x + fgPos.x > 0 && x + fgPos.x < bgImg.width) {
        let p = (bgImg.width * (y + fgPos.y) + (x + fgPos.x)) * 4
        let p1 = (bgImg.width * (y + fgPos.y + 1) + (x + fgPos.x)) * 4
        let p2 = (bgImg.width * (y + fgPos.y + 2) + (x + fgPos.x)) * 4
        let p3 = (bgImg.width * (y + fgPos.y + 3) + (x + fgPos.x)) * 4

        let f = (fgImg.width * y + x) * 4
        let f1 = (fgImg.width * (y + 1) + x) * 4
        let f2 = (fgImg.width * (y + 2) + x) * 4
        let f3 = (fgImg.width * (y + 3) + x) * 4

        colorChange(bgImg, fgImg, fgOpac, p, f)
        colorChange(bgImg, fgImg, fgOpac, p1, f1)
        colorChange(bgImg, fgImg, fgOpac, p2, f2)
        colorChange(bgImg, fgImg, fgOpac, p3, f3)
      }
    }
  }
}

function colorChange(bgImg, fgImg, fgA, p, fgP) {
  let r = bgImg.data[p]
  let g = bgImg.data[p + 1]
  let b = bgImg.data[p + 2]
  let a = bgImg.data[p + 3] / 255

  let rF = fgImg.data[fgP]
  let gF = fgImg.data[fgP + 1]
  let bF = fgImg.data[fgP + 2]
  let aF = (fgImg.data[fgP + 3] / 255) * fgA

  let alpha = aF + (1 - aF) * a

  r = (aF * rF + (1 - aF) * r * a) / alpha
  g = (aF * gF + (1 - aF) * g * a) / alpha
  b = (aF * bF + (1 - aF) * b * a) / alpha

  bgImg.data[p] = r //r
  bgImg.data[p + 1] = g //g
  bgImg.data[p + 2] = b //b
  bgImg.data[p + 3] = alpha * 255 //alpha
}
