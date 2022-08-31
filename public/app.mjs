import {
  CodeJar,
  withLineNumbers,
} from "https://cdn.jsdelivr.net/combine/npm/codejar@3.5.0/codejar.min.js,npm/codejar@3.6.0/linenumbers.min.js"

const highlight = element => {
  // highlight.js does not trims old tags, let's do it by this hack
  element.textContent = element.textContent
  hljs.highlightElement(element)
}

document.addEventListener("DOMContentLoaded", () => {
  const $editor = document.querySelector(".editor")
  CodeJar($editor, withLineNumbers(highlight, { width: "45px" }))
  $editor.focus()
})
