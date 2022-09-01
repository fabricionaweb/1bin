import { createBin } from "./subtle.mjs"
import {
  CodeJar,
  withLineNumbers,
} from "https://cdn.jsdelivr.net/combine/npm/codejar@3.5.0/codejar.min.js,npm/codejar@3.6.0/linenumbers.min.js"

const highlight = element => {
  // highlight.js does not trims old tags, let's do it by this hack
  element.textContent = element.textContent
  hljs.highlightElement(element)
}

const onCreateClick = jar => async () => {
  const content = jar.toString().trim()
  if (!content) return

  document.body.classList.add("loading")
  const url = await createBin(content)

  try {
    await navigator.clipboard.writeText(url)
  } catch (e) {}

  location.assign(url)
}

document.addEventListener("DOMContentLoaded", () => {
  const $editor = document.querySelector(".editor")
  const jar = CodeJar($editor, withLineNumbers(highlight, { width: "45px" }))
  $editor.focus()

  const $button = document.querySelector(".create")
  $button.addEventListener("click", onCreateClick(jar))
})
