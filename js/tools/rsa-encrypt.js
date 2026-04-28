function toolInit(container) {
    container.innerHTML = '<div class="tool-card">'
        + '<h2>RSA Encrypt / Decrypt</h2>'
        + '<p class="description">Generate RSA key pairs and perform encryption/decryption using RSA-OAEP with SHA-256 via the Web Crypto API. Keys are exported in JWK (JSON Web Key) format.</p>'
        + '<div class="input-row">'
        + '<div class="input-group"><label for="rsa-enc-keysize">Key Size</label>'
        + '<select id="rsa-enc-keysize"><option value="2048">2048-bit</option><option value="4096">4096-bit</option></select></div>'
        + '<div class="btn-row"><button class="btn btn-accent" id="rsa-enc-genkey">Generate Key Pair</button></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="rsa-enc-pubkey">Public Key (JWK JSON)</label>'
        + '<textarea id="rsa-enc-pubkey" rows="4" placeholder="Public key in JWK format..."></textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="rsa-enc-privkey">Private Key (JWK JSON)</label>'
        + '<textarea id="rsa-enc-privkey" rows="6" placeholder="Private key in JWK format..."></textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="rsa-enc-input">Plaintext / Ciphertext (hex)</label>'
        + '<textarea id="rsa-enc-input" rows="3" placeholder="Enter plaintext to encrypt, or hex ciphertext to decrypt..."></textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="btn-row">'
        + '<button class="btn" id="rsa-encrypt">Encrypt</button>'
        + '<button class="btn btn-secondary" id="rsa-decrypt">Decrypt</button>'
        + '</div>'
        + '</div>'
        + '<div class="output-area" id="rsa-enc-output"></div>'
        + '</div>';

    document.getElementById('rsa-enc-genkey').addEventListener('click', async function () {
        var out = document.getElementById('rsa-enc-output');
        var btn = this;
        btn.disabled = true;
        btn.textContent = 'Generating...';
        try {
            var keySize = parseInt(document.getElementById('rsa-enc-keysize').value, 10);
            var keyPair = await crypto.subtle.generateKey(
                { name: 'RSA-OAEP', modulusLength: keySize, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
                true,
                ['encrypt', 'decrypt']
            );
            var pubJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
            var privJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
            document.getElementById('rsa-enc-pubkey').value = JSON.stringify(pubJwk, null, 2);
            document.getElementById('rsa-enc-privkey').value = JSON.stringify(privJwk, null, 2);
            out.innerHTML = '<div class="result"><strong>Key pair generated (' + keySize + '-bit).</strong> Public and private keys are displayed above in JWK format.</div>';
        } catch (e) {
            showError(out, 'Key generation failed: ' + e.message);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Generate Key Pair';
        }
    });

    document.getElementById('rsa-encrypt').addEventListener('click', async function () {
        var out = document.getElementById('rsa-enc-output');
        var pubKeyStr = document.getElementById('rsa-enc-pubkey').value.trim();
        var plaintext = document.getElementById('rsa-enc-input').value;

        if (!pubKeyStr) { showError(out, 'Please provide or generate a public key.'); return; }
        if (!plaintext) { showError(out, 'Please enter plaintext to encrypt.'); return; }

        try {
            var pubJwk = JSON.parse(pubKeyStr);
            var pubKey = await crypto.subtle.importKey('jwk', pubJwk, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']);
            var encoder = new TextEncoder();
            var data = encoder.encode(plaintext);
            var cipherBuffer = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, pubKey, data);
            var ctHex = hexEncode(cipherBuffer);
            out.innerHTML = '<div class="result"><strong>Ciphertext (hex):</strong><br>'
                + '<span style="word-break:break-all;">' + escapeHtml(ctHex) + '</span></div>';
        } catch (e) {
            showError(out, 'Encryption failed: ' + e.message);
        }
    });

    document.getElementById('rsa-decrypt').addEventListener('click', async function () {
        var out = document.getElementById('rsa-enc-output');
        var privKeyStr = document.getElementById('rsa-enc-privkey').value.trim();
        var ctHex = document.getElementById('rsa-enc-input').value.trim();

        if (!privKeyStr) { showError(out, 'Please provide or generate a private key.'); return; }
        if (!ctHex) { showError(out, 'Please enter ciphertext (hex) to decrypt.'); return; }

        try {
            var privJwk = JSON.parse(privKeyStr);
            var privKey = await crypto.subtle.importKey('jwk', privJwk, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['decrypt']);
            var ct = hexDecode(ctHex);
            var plainBuffer = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, privKey, ct);
            var decoder = new TextDecoder();
            var plaintext = decoder.decode(plainBuffer);
            out.innerHTML = '<div class="result"><strong>Plaintext:</strong><br>' + escapeHtml(plaintext) + '</div>';
        } catch (e) {
            showError(out, 'Decryption failed: ' + e.message);
        }
    });
}
