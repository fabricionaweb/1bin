const ALGORITHM_ID = "AES-GCM"
const ALGORITHM_GEN = { name: ALGORITHM_ID, length: 256 }

const generateKey = () => crypto.subtle.generateKey(ALGORITHM_GEN, true, ["encrypt", "decrypt"])
const generateIv = () => crypto.getRandomValues(new Uint8Array(12))
const generateJwt = k => ({ k, kty: "oct", alg: "A256GCM", ext: true })

const exportKey = key => crypto.subtle.exportKey("jwk", key)
const importKey = key => crypto.subtle.importKey("jwk", generateJwt(key), ALGORITHM_GEN, true, ["encrypt", "decrypt"])

const encrypt = (content, key, iv) =>
  crypto.subtle.encrypt({ name: ALGORITHM_ID, iv }, key, new TextEncoder().encode(content))
const decrypt = (content, key, iv) =>
  crypto.subtle.decrypt({ name: ALGORITHM_ID, iv }, key, content).then(decrypted => new TextDecoder().decode(decrypted))

const toDataUrl = buffer =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
    reader.readAsDataURL(new Blob([buffer]))
  })
const fromDataUrl = dataUrl => fetch(dataUrl).then(res => res.arrayBuffer())

export async function createBin(content) {
  const iv = generateIv()
  const key = await generateKey()
  const { k: privateKey } = await exportKey(key)
  const dataUrl = await encrypt(content, key, iv).then(toDataUrl)

  const headers = { "x-iv": iv }
  const body = new FormData()
  body.append("message", dataUrl)

  const { uuid } = await fetch("/api", { method: "POST", headers, body }).then(res => res.json())
  const { protocol, host } = location

  return `${protocol}//${host}/${uuid}#${privateKey}`
}
