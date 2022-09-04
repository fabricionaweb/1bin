import { createBin, readBin } from "./subtle.mjs"
import {
  CodeJar,
  withLineNumbers,
} from "https://cdn.jsdelivr.net/combine/npm/codejar@3.5.0/codejar.min.js,npm/codejar@3.6.0/linenumbers.min.js"

const UUID4_REGEX = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i

const loading = force => document.body.classList.toggle("loading", force)

const highlight = element => {
  // highlight.js does not trims old tags, let's do it by this hack
  element.textContent = element.textContent
  hljs.highlightElement(element)
}

const onCreateClick = jar => async () => {
  const content = jar.toString().trim()
  if (!content) return

  loading()
  const url = await createBin(content)

  try {
    await navigator.clipboard.writeText(url)
  } catch (e) {}

  location.assign(url)
}

document.addEventListener("DOMContentLoaded", async () => {
  const uuid = location.pathname.slice(1)
  const key = location.hash.slice(1)

  const $editor = document.querySelector(".editor")
  const $button = document.querySelector(".create")

  const jar = CodeJar($editor, withLineNumbers(highlight, { width: "45px" }))
  $button.addEventListener("click", onCreateClick(jar))

  if (UUID4_REGEX.test(uuid)) {
    loading()
    $button.setAttribute("hidden", true)
    $editor.setAttribute("contenteditable", false)
    jar.updateCode(await readBin(uuid, key))
    loading()
  }

  $editor.focus()
})
