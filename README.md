## How it works

### Flow

<details>
  <summary>Create flow</summary>

![create-flow](https://user-images.githubusercontent.com/15933/182303130-05e8fecb-48a4-495e-acf0-231ab8855dcf.svg)

</details>

<details>
  <summary>Read flow</summary>

![read-flow](https://user-images.githubusercontent.com/15933/182309002-efe0d721-3399-4625-b915-379e94193f80.svg)

</details>

### Create:

1. Using the browser [SubtleCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto) API, we [generate a key](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey) and the [initialization vector (IV)](https://en.wikipedia.org/wiki/Initialization_vector)
   - The key will be presented only to the user. The server never know about it, neither through requests logs
   - Even the IV being stored in the database it does not work without the key. Always need both
   - Both IV and key are always randomic
1. Before send anything to server, the encrypt process happens in the Browser
1. Send the encrypted message (in format of file) and the IV to the server
1. The server will save the content and the IV and return your the id to access it
1. An URL will be present to you, something like `http://<host>/ac3d0752-0911-49f8-95dc-092f9eb90c21#Pdp_jo3mmrk3LDds6HXjn1m0zdVgcpV3yNJgGQ0hVM8`
    - Who have the **full url** can read your message

### Read:

1. When someone open the URL it starts the process to read a message
1. The URL have the format `http://<host>/<uuidv4>#<key>`
   - `uuidv4` is the id for the content in our database
   - `key` is the key to decode it
1. The browser will ask the server to get the content that belongs to the **uuid**
   - If not exists will return 404
   - If exists but have already expire, it will delete and return 404
     - So far I decided 24h to expire, _Maybe in the future users can define it_
   - If exists just return it (IV and encrypted content)
1. Now the browser should have all it needs to start the decrypt process
1. Try to decrypt using [SubtleCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/decrypt)
   - If not possible will display an error, probably is the key. Not much can be done
   - If possible will just present the message

### Common:

- The `#` is know as [location.hash](https://developer.mozilla.org/en-US/docs/Web/API/Location/hash) and this hash **will never be reach by any network call\*** by default. It will be necessary to decrypt your message through javascript
  - _\*Only if have some JavaScript code to intercept it and make one request, this is not done here_
  - _This wont appear in network calls neither http referer_
- Using [highlight.js](https://github.com/highlightjs/highlight.js) to auto-detection the language code for the messages

## Browser Compatibility

[SubtleCrypto](https://caniuse.com/mdn-api_subtlecrypto)

| ![Chrome][chrome] | ![Edge][edge] | ![Firefox][firefox] | ![Opera][opera] | ![Safari][safari] |
| :---------------: | :-----------: | :-----------------: | :-------------: | :---------------: |
|        37         |      79       |         34          |       24        |         7         |

[chrome]: https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png
[firefox]: https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png
[edge]: https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png
[opera]: https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png
[safari]: https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png
