function skillSwitch(a) {
  switch (a) {
    case "tech":
      document.getElementById("tech").hidden = false
      document.getElementById("lang").hidden = true
      break
    case "lang":
      document.getElementById("tech").hidden = true
      document.getElementById("lang").hidden = false
      break
  }
}
