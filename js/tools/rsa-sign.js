function toolInit(container) {
    container.innerHTML = '<div class="tool-card">'
        + '<h2>RSA Digital Signature</h2>'
        + '<p class="description">Sign messages and verify signatures using RSASSA-PKCS1-v1_5 with SHA-256 via the Web Crypto API. The signer uses the private key; the verifier uses the public key.</p>'
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

    document.getElementById('rsa-sig-genkey').addEventListener('click', async function () {
        var out = document.getElementById('rsa-sig-output');
        var btn = this;
        btn.disabled = true;
        btn.textContent = 'Generating...';
        try {
            var keySize = parseInt(document.getElementById('rsa-sig-keysize').value, 10);
            var keyPair = await crypto.subtle.generateKey(
                { name: 'RSASSA-PKCS1-v1_5', modulusLength: keySize, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
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
