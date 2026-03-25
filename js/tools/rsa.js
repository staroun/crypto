function toolInit(container) {
    container.innerHTML = ''
        // ===== Card 1: RSA Encrypt / Decrypt =====
        + '<div class="tool-card">'
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
        + '</div>'

        // ===== Card 2: RSA Digital Signature =====
        + '<div class="tool-card">'
        + '<h2>RSA Digital Signature</h2>'
        + '<p class="description">Sign messages and verify signatures using RSASSA-PKCS1-v1_5 with SHA-256 via the Web Crypto API. Paste JWK keys from the section above, or generate a new key pair here.</p>'
        + '<div class="input-row">'
        + '<div class="input-group"><label for="rsa-sig-keysize">Key Size</label>'
        + '<select id="rsa-sig-keysize"><option value="2048">2048-bit</option><option value="4096">4096-bit</option></select></div>'
        + '<div class="btn-row"><button class="btn btn-accent" id="rsa-sig-genkey">Generate Signing Key Pair</button></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="rsa-sig-pubkey">Public Key (JWK JSON)</label>'
        + '<textarea id="rsa-sig-pubkey" rows="4" placeholder="Public key in JWK format..."></textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="rsa-sig-privkey">Private Key (JWK JSON)</label>'
        + '<textarea id="rsa-sig-privkey" rows="6" placeholder="Private key in JWK format..."></textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="rsa-sig-message">Message</label>'
        + '<textarea id="rsa-sig-message" rows="3" placeholder="Enter the message to sign or verify..."></textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="rsa-sig-signature">Signature (hex)</label>'
        + '<input type="text" id="rsa-sig-signature" placeholder="Hex signature (produced by Sign, required for Verify)..."></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="btn-row">'
        + '<button class="btn" id="rsa-sign">Sign</button>'
        + '<button class="btn btn-secondary" id="rsa-verify">Verify</button>'
        + '</div>'
        + '</div>'
        + '<div class="output-area" id="rsa-sig-output"></div>'
        + '</div>';

    // ===== RSA Encrypt / Decrypt Logic =====

    document.getElementById('rsa-enc-genkey').addEventListener('click', async function () {
        var out = document.getElementById('rsa-enc-output');
        var btn = this;
        btn.disabled = true;
        btn.textContent = 'Generating...';
        try {
            var keySize = parseInt(document.getElementById('rsa-enc-keysize').value, 10);
            var keyPair = await crypto.subtle.generateKey(
                {
                    name: 'RSA-OAEP',
                    modulusLength: keySize,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: 'SHA-256'
                },
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

    // ===== RSA Digital Signature Logic =====

    document.getElementById('rsa-sig-genkey').addEventListener('click', async function () {
        var out = document.getElementById('rsa-sig-output');
        var btn = this;
        btn.disabled = true;
        btn.textContent = 'Generating...';
        try {
            var keySize = parseInt(document.getElementById('rsa-sig-keysize').value, 10);
            var keyPair = await crypto.subtle.generateKey(
                {
                    name: 'RSASSA-PKCS1-v1_5',
                    modulusLength: keySize,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: 'SHA-256'
                },
                true,
                ['sign', 'verify']
            );
            var pubJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
            var privJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
            document.getElementById('rsa-sig-pubkey').value = JSON.stringify(pubJwk, null, 2);
            document.getElementById('rsa-sig-privkey').value = JSON.stringify(privJwk, null, 2);
            out.innerHTML = '<div class="result"><strong>Signing key pair generated (' + keySize + '-bit).</strong> Keys are displayed above in JWK format.</div>';
        } catch (e) {
            showError(out, 'Key generation failed: ' + e.message);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Generate Signing Key Pair';
        }
    });

    document.getElementById('rsa-sign').addEventListener('click', async function () {
        var out = document.getElementById('rsa-sig-output');
        var privKeyStr = document.getElementById('rsa-sig-privkey').value.trim();
        var message = document.getElementById('rsa-sig-message').value;

        if (!privKeyStr) { showError(out, 'Please provide or generate a private key.'); return; }
        if (!message) { showError(out, 'Please enter a message to sign.'); return; }

        try {
            var privJwk = JSON.parse(privKeyStr);
            // Ensure correct alg and key_ops for RSASSA-PKCS1-v1_5 signing
            privJwk.alg = 'RS256';
            privJwk.key_ops = ['sign'];
            var privKey = await crypto.subtle.importKey(
                'jwk', privJwk,
                { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
                false, ['sign']
            );
            var encoder = new TextEncoder();
            var data = encoder.encode(message);
            var sigBuffer = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', privKey, data);
            var sigHex = hexEncode(sigBuffer);
            document.getElementById('rsa-sig-signature').value = sigHex;
            out.innerHTML = '<div class="result"><strong>Signature (hex):</strong><br>'
                + '<span style="word-break:break-all;">' + escapeHtml(sigHex) + '</span></div>';
        } catch (e) {
            showError(out, 'Signing failed: ' + e.message);
        }
    });

    document.getElementById('rsa-verify').addEventListener('click', async function () {
        var out = document.getElementById('rsa-sig-output');
        var pubKeyStr = document.getElementById('rsa-sig-pubkey').value.trim();
        var message = document.getElementById('rsa-sig-message').value;
        var sigHex = document.getElementById('rsa-sig-signature').value.trim();

        if (!pubKeyStr) { showError(out, 'Please provide or generate a public key.'); return; }
        if (!message) { showError(out, 'Please enter the message that was signed.'); return; }
        if (!sigHex) { showError(out, 'Please enter or produce a signature to verify.'); return; }

        try {
            var pubJwk = JSON.parse(pubKeyStr);
            // Ensure correct alg and key_ops for RSASSA-PKCS1-v1_5 verification
            pubJwk.alg = 'RS256';
            pubJwk.key_ops = ['verify'];
            var pubKey = await crypto.subtle.importKey(
                'jwk', pubJwk,
                { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
                false, ['verify']
            );
            var encoder = new TextEncoder();
            var data = encoder.encode(message);
            var sig = hexDecode(sigHex);
            var valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', pubKey, sig, data);

            if (valid) {
                out.innerHTML = '<div class="result match"><strong>Signature is VALID.</strong> The message is authentic and has not been tampered with.</div>';
            } else {
                out.innerHTML = '<div class="result no-match"><strong>Signature is INVALID.</strong> The message may have been altered, or the wrong key was used.</div>';
            }
        } catch (e) {
            showError(out, 'Verification failed: ' + e.message);
        }
    });
}
