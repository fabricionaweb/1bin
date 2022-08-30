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
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encrypted
  )
  return new TextDecoder().decode(decrypted)
}

/*
from https://developer.chrome.com/blog/how-to-convert-arraybuffer-to-and-from-string/
*/
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf))
}

// from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
function str2ab(str) {
  const buf = new ArrayBuffer(str.length)
  const bufView = new Uint8Array(buf)
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

window.addEventListener("DOMContentLoaded", async () => {
  const uuid = location.pathname.slice(1)

  if (uuid) {
    const response = await fetch(`/api?uuid=${uuid}`)
    const iv = new Uint8Array(response.headers.get("x-iv").split(","))
    const file = await response.text()
    const key = await importKey(location.hash.slice(1))

    console.log(iv)
    console.log(key)

    try {
      const message = await decrypt(str2ab(window.atob(file)), key, iv)
      console.log(message)
    } catch (err) {
      console.log(err)
    }
  }

  const $inputKey = document.querySelector("input#key")
  const $cryptButton = document.querySelector("button#go")
  const $contentInput = document.querySelector("textarea#content")

  const cryptoKey = await generateKey()
  const { k: privateKey } = await exportKey(cryptoKey)
  $inputKey.value = privateKey

  $cryptButton.addEventListener("click", async () => {
    const iv = generateIv()
    const message = await encrypt($contentInput.value, cryptoKey, iv)

    const formData = new FormData()
    formData.append("iv", iv)
    formData.append("message", window.btoa(ab2str(message)))

    const response = await fetch("/api", {
      method: "POST",
      body: formData,
    })
    const { uuid } = await response.json()
    window.location = `/${uuid}#${privateKey}`
  })
})
