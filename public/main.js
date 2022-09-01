function generateKey() {
  return crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  )
}

function generateIv() {
  return crypto.getRandomValues(new Uint8Array(12))
}

function exportKey(key) {
  return crypto.subtle.exportKey("jwk", key)
}

function importKey(key) {
  return crypto.subtle.importKey(
    "jwk",
    {
      k: key,
      kty: "oct",
      alg: "A256GCM",
      ext: true,
    },
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  )
}

function encrypt(decrypted, key, iv) {
  return crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(decrypted))
}

function decrypt(encrypted, key, iv) {
  return crypto.subtle
    .decrypt({ name: "AES-GCM", iv }, key, encrypted)
    .then(decrypted => new TextDecoder().decode(decrypted))
}

function toBase64(buffer) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
    reader.readAsDataURL(new Blob([buffer]))
  })
}

function fromBase64(dataUrl) {
  return fetch(dataUrl).then(res => res.arrayBuffer())
}

window.addEventListener("DOMContentLoaded", async () => {
  const regex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
  const uuid = location.pathname.slice(1)

  if (uuid.match(regex)) {
    const key = await importKey(location.hash.slice(1))
    const response = await fetch(`/api?uuid=${uuid}`)
    const iv = new Uint8Array(response.headers.get("x-iv").split(","))
    const buffer = await response.text().then(fromBase64)

    try {
      const message = await decrypt(buffer, key, iv)

      console.log(message)
    } catch (err) {
      console.log(err)
    }
  }

  const $inputKey = document.querySelector("input#key")
  const $cryptButton = document.querySelector("button#go")
  const $contentInput = document.querySelector("textarea#content")

  const key = await generateKey()
  const { k: privateKey } = await exportKey(key)

  $inputKey.value = privateKey

  $cryptButton.addEventListener("click", async () => {
    const iv = generateIv()
    const dataUrl = await encrypt($contentInput.value, key, iv).then(toBase64)

    const formData = new FormData()
    formData.append("message", dataUrl)

    const { uuid } = await fetch("/api", {
      method: "POST",
      headers: {
        "x-iv": iv,
      },
      body: formData,
    }).then(res => res.json())

    window.location = `/${uuid}#${privateKey}`
  })
})
