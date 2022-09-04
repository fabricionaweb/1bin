import { createBin, readBin } from "./subtle.mjs"
import {
  CodeJar,
  withLineNumbers,
} from "https://cdn.jsdelivr.net/combine/npm/codejar@3.5.0/codejar.min.js,npm/codejar@3.6.0/linenumbers.min.js"

const UUID4_REGEX = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i

const setLoading = force => document.body.classList.toggle("loading", force)

const highlight = element => {
  // highlight.js does not trims old tags, let's do it by this hack
  element.textContent = element.textContent
  hljs.highlightElement(element)
}

document.addEventListener("DOMContentLoaded", async () => {
  const uuid = location.pathname.slice(1)
  const key = location.hash.slice(1)

  const $editor = document.querySelector(".editor")
  const $button = document.querySelector(".create")

  const jar = CodeJar($editor, withLineNumbers(highlight, { width: "45px" }))

  const onCreateClick = async () => {
    const content = jar.toString().trim()
    if (!content) return

    setLoading(true)
    const url = await createBin(content)

    try {
      await navigator.clipboard.writeText(url)
    } catch (e) {}

    setLoading(false)
    location.assign(url)
  }

  const onEditClickOnce = () => {
    $button.textContent = "Fork it"
    $button.removeEventListener("click", onEditClickOnce)
    $button.addEventListener("click", onCreateClick)

    $editor.setAttribute("contenteditable", true)
    $editor.focus()
  }

  if (UUID4_REGEX.test(uuid)) {
    setLoading(true)

    $button.textContent = "Edit it"
    $button.addEventListener("click", onEditClickOnce)

    $editor.setAttribute("contenteditable", false)

    try {
      jar.updateCode(await readBin(uuid, key))
    } catch (e) {}

    setLoading(false)
  } else {
    $button.addEventListener("click", onCreateClick)
    $editor.focus()
  }
})
