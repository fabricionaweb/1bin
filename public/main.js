async function generateKey() {
  return await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256, // 128, 192, or 256
    },
    true,
    ["encrypt", "decrypt"]
  )
}

function generateIv() {
  // Don't re-use initialization vectors
  // Always generate a new iv every time your encrypt
  // Recommended to use 12 bytes length
  // Needed to decrypt
  return crypto.getRandomValues(new Uint8Array(12))
}

async function exportKey(key) {
  return await crypto.subtle.exportKey("jwk", key)
}

async function importKey(key) {
  return await crypto.subtle.importKey(
    "jwk",
    {
      k: key,
      kty: "oct",
      alg: "A256GCM",
      ext: true,
    },
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  )
}

async function encrypt(decrypted, key, iv) {
  return await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(decrypted)
  )
}

async function decrypt(encrypted, key, iv) {
  let decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encrypted
  )
  return new TextDecoder().decode(decrypted)
}

window.addEventListener("DOMContentLoaded", async () => {
  const uuid = location.pathname.slice(1)

  if (uuid) {
    const response = await fetch(`/api?uuid=${uuid}`)
    const iv = new Uint8Array(response.headers.get("x-iv").split(","))
    const file = await response.arrayBuffer()
    const key = await importKey(location.hash.slice(1))

    console.log(iv)
    console.log(key)

    const message = await decrypt(file, key, iv)
    console.log(message)
  }

  const $inputKey = document.querySelector("input#key")
  const $cryptButton = document.querySelector("button#go")
  const $contentInput = document.querySelector("textarea#content")

  const cryptoKey = await generateKey()
  const jsonKey = await exportKey(cryptoKey)

  $inputKey.value = jsonKey.k
  console.log(cryptoKey)

  $cryptButton.addEventListener("click", async () => {
    const iv = generateIv()
    const message = await encrypt($contentInput.value, cryptoKey, iv)

    const formData = new FormData()
    formData.append("iv", iv)
    formData.append("file", new Blob([message]))

    fetch("/api", {
      method: "POST",
      body: formData,
    })
  })
})
