function toolInit(container) {
    container.innerHTML = ''
        // ===== Card 1: ECDH Key Exchange =====
        + '<div class="tool-card">'
        + '<h2>ECC &mdash; ECDH Key Exchange</h2>'
        + '<p class="description">Elliptic Curve Diffie-Hellman key agreement via Web Crypto API. Two parties each generate a key pair and derive a shared secret from their private key and the other party&rsquo;s public key. P-256 &asymp; 128-bit security (&asymp; RSA 3072), P-384 &asymp; 192-bit security (&asymp; RSA 7680).</p>'
        + '<div class="input-row">'
        + '<div class="input-group"><label for="ecdh-curve">Curve</label>'
        + '<select id="ecdh-curve"><option value="P-256" selected>P-256 (&asymp; RSA 3072)</option><option value="P-384">P-384 (&asymp; RSA 7680)</option></select></div>'
        + '<div class="btn-row"><button class="btn btn-accent" id="ecdh-gen">Generate Both Key Pairs</button></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label>Alice Public Key (JWK)</label>'
        + '<textarea id="ecdh-alice-pub" rows="3" style="font-size:0.72rem;"></textarea></div>'
        + '<div class="input-group flex-grow"><label>Bob Public Key (JWK)</label>'
        + '<textarea id="ecdh-bob-pub" rows="3" style="font-size:0.72rem;"></textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label>Alice Private Key (JWK)</label>'
        + '<textarea id="ecdh-alice-priv" rows="3" style="font-size:0.72rem;"></textarea></div>'
        + '<div class="input-group flex-grow"><label>Bob Private Key (JWK)</label>'
        + '<textarea id="ecdh-bob-priv" rows="3" style="font-size:0.72rem;"></textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="btn-row"><button class="btn" id="ecdh-derive">Derive Shared Secret</button></div>'
        + '</div>'
        + '<div class="output-area" id="ecdh-output"></div>'
        + '</div>'

        // ===== Card 2: ECDSA Sign / Verify =====
        + '<div class="tool-card">'
        + '<h2>ECC &mdash; ECDSA Digital Signature</h2>'
        + '<p class="description">Sign and verify messages using ECDSA (Elliptic Curve Digital Signature Algorithm) with SHA-256 via Web Crypto API.</p>'
        + '<div class="input-row">'
        + '<div class="input-group"><label for="ecdsa-curve">Curve</label>'
        + '<select id="ecdsa-curve"><option value="P-256" selected>P-256 (&asymp; RSA 3072)</option><option value="P-384">P-384 (&asymp; RSA 7680)</option></select></div>'
        + '<div class="btn-row"><button class="btn btn-accent" id="ecdsa-gen">Generate Key Pair</button></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="ecdsa-pub">Public Key (JWK)</label>'
        + '<textarea id="ecdsa-pub" rows="3" style="font-size:0.72rem;"></textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="ecdsa-priv">Private Key (JWK)</label>'
        + '<textarea id="ecdsa-priv" rows="3" style="font-size:0.72rem;"></textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="ecdsa-msg">Message</label>'
        + '<textarea id="ecdsa-msg" rows="2" placeholder="Enter message to sign or verify..."></textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="ecdsa-sig">Signature (hex)</label>'
        + '<input type="text" id="ecdsa-sig" placeholder="Produced by Sign, required for Verify..."></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="btn-row">'
        + '<button class="btn" id="ecdsa-sign">Sign</button>'
        + '<button class="btn btn-secondary" id="ecdsa-verify">Verify</button>'
        + '</div>'
        + '</div>'
        + '<div class="output-area" id="ecdsa-output"></div>'
        + '</div>';

    // ===== ECDH =====
    var alicePriv = null, bobPriv = null;

    document.getElementById('ecdh-gen').addEventListener('click', async function () {
        var out = document.getElementById('ecdh-output');
        var curve = document.getElementById('ecdh-curve').value;
        try {
            var aliceKP = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: curve }, true, ['deriveBits']);
            var bobKP = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: curve }, true, ['deriveBits']);

            var aPub = await crypto.subtle.exportKey('jwk', aliceKP.publicKey);
            var aPriv = await crypto.subtle.exportKey('jwk', aliceKP.privateKey);
            var bPub = await crypto.subtle.exportKey('jwk', bobKP.publicKey);
            var bPriv = await crypto.subtle.exportKey('jwk', bobKP.privateKey);

            alicePriv = aliceKP.privateKey;
            bobPriv = bobKP.privateKey;

            document.getElementById('ecdh-alice-pub').value = JSON.stringify(aPub, null, 2);
            document.getElementById('ecdh-alice-priv').value = JSON.stringify(aPriv, null, 2);
            document.getElementById('ecdh-bob-pub').value = JSON.stringify(bPub, null, 2);
            document.getElementById('ecdh-bob-priv').value = JSON.stringify(bPriv, null, 2);

            var coordLen = curve === 'P-256' ? 32 : 48;
            out.innerHTML = '<div class="result"><strong>Key pairs generated (' + curve + ').</strong></div>'
                + '<div style="margin-top:0.4rem;color:var(--text-dim);font-size:0.82rem;">'
                + 'Public key size: ' + coordLen + ' bytes per coordinate (x, y)<br>'
                + 'Private key size: ' + coordLen + ' bytes (d)</div>';
        } catch (e) { showError(out, 'Key generation failed: ' + e.message); }
    });

    document.getElementById('ecdh-derive').addEventListener('click', async function () {
        var out = document.getElementById('ecdh-output');
        var curve = document.getElementById('ecdh-curve').value;
        try {
            var alicePubJwk = JSON.parse(document.getElementById('ecdh-alice-pub').value);
            var alicePrivJwk = JSON.parse(document.getElementById('ecdh-alice-priv').value);
            var bobPubJwk = JSON.parse(document.getElementById('ecdh-bob-pub').value);
            var bobPrivJwk = JSON.parse(document.getElementById('ecdh-bob-priv').value);

            // Import keys
            var alicePrivKey = await crypto.subtle.importKey('jwk', alicePrivJwk, { name: 'ECDH', namedCurve: curve }, false, ['deriveBits']);
            var bobPubKey = await crypto.subtle.importKey('jwk', bobPubJwk, { name: 'ECDH', namedCurve: curve }, false, []);
            var bobPrivKey = await crypto.subtle.importKey('jwk', bobPrivJwk, { name: 'ECDH', namedCurve: curve }, false, ['deriveBits']);
            var alicePubKey = await crypto.subtle.importKey('jwk', alicePubJwk, { name: 'ECDH', namedCurve: curve }, false, []);

            var bitLen = curve === 'P-256' ? 256 : 384;

            // Alice derives with her private + Bob's public
            var sharedA = await crypto.subtle.deriveBits({ name: 'ECDH', public: bobPubKey }, alicePrivKey, bitLen);
            // Bob derives with his private + Alice's public
            var sharedB = await crypto.subtle.deriveBits({ name: 'ECDH', public: alicePubKey }, bobPrivKey, bitLen);

            var hexA = hexEncode(sharedA);
            var hexB = hexEncode(sharedB);
            var match = hexA === hexB;

            var html = '<table class="step-table">'
                + '<tr><th>Party</th><th>Shared Secret (hex)</th></tr>'
                + '<tr><td>Alice (her priv + Bob pub)</td><td style="word-break:break-all;font-size:0.78rem;">' + hexA + '</td></tr>'
                + '<tr><td>Bob (his priv + Alice pub)</td><td style="word-break:break-all;font-size:0.78rem;">' + hexB + '</td></tr>'
                + '</table>';
            if (match) {
                html += '<div class="result match"><strong>Shared secrets match!</strong> (' + bitLen + ' bits = ' + (bitLen / 8) + ' bytes)</div>';
            } else {
                html += '<div class="result no-match"><strong>Mismatch!</strong> Check that the keys correspond.</div>';
            }
            out.innerHTML = html;
        } catch (e) { showError(out, 'Derivation failed: ' + e.message); }
    });

    // ===== ECDSA =====
    document.getElementById('ecdsa-gen').addEventListener('click', async function () {
        var out = document.getElementById('ecdsa-output');
        var curve = document.getElementById('ecdsa-curve').value;
        try {
            var kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: curve }, true, ['sign', 'verify']);
            var pub = await crypto.subtle.exportKey('jwk', kp.publicKey);
            var priv = await crypto.subtle.exportKey('jwk', kp.privateKey);
            document.getElementById('ecdsa-pub').value = JSON.stringify(pub, null, 2);
            document.getElementById('ecdsa-priv').value = JSON.stringify(priv, null, 2);
            out.innerHTML = '<div class="result"><strong>ECDSA key pair generated (' + curve + ').</strong></div>';
        } catch (e) { showError(out, 'Key generation failed: ' + e.message); }
    });

    document.getElementById('ecdsa-sign').addEventListener('click', async function () {
        var out = document.getElementById('ecdsa-output');
        var curve = document.getElementById('ecdsa-curve').value;
        try {
            var privJwk = JSON.parse(document.getElementById('ecdsa-priv').value);
            var msg = document.getElementById('ecdsa-msg').value;
            if (!msg) throw new Error('Please enter a message.');
            var privKey = await crypto.subtle.importKey('jwk', privJwk, { name: 'ECDSA', namedCurve: curve }, false, ['sign']);
            var data = new TextEncoder().encode(msg);
            var sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privKey, data);
            var sigHex = hexEncode(sig);
            document.getElementById('ecdsa-sig').value = sigHex;
            // Parse r, s from DER-ish raw format (r || s, each coordinate_size bytes)
            var coordLen = curve === 'P-256' ? 32 : 48;
            var sigBytes = new Uint8Array(sig);
            var rHex = hexEncode(sigBytes.slice(0, coordLen));
            var sHex = hexEncode(sigBytes.slice(coordLen));
            var html = '<div class="result"><strong>Signature (hex):</strong><br>'
                + '<span style="word-break:break-all;">' + sigHex + '</span></div>';
            html += '<div style="margin-top:0.4rem;color:var(--text-dim);font-size:0.82rem;">'
                + 'r = ' + rHex + '<br>'
                + 's = ' + sHex + '<br>'
                + 'Signature length: ' + sigBytes.length + ' bytes (' + (coordLen * 2) + ' = 2 &times; ' + coordLen + ')</div>';
            out.innerHTML = html;
        } catch (e) { showError(out, 'Signing failed: ' + e.message); }
    });

    document.getElementById('ecdsa-verify').addEventListener('click', async function () {
        var out = document.getElementById('ecdsa-output');
        var curve = document.getElementById('ecdsa-curve').value;
        try {
            var pubJwk = JSON.parse(document.getElementById('ecdsa-pub').value);
            var msg = document.getElementById('ecdsa-msg').value;
            var sigHex = document.getElementById('ecdsa-sig').value.trim();
            if (!msg) throw new Error('Please enter the message that was signed.');
            if (!sigHex) throw new Error('Please enter the signature.');
            var pubKey = await crypto.subtle.importKey('jwk', pubJwk, { name: 'ECDSA', namedCurve: curve }, false, ['verify']);
            var data = new TextEncoder().encode(msg);
            var sig = hexDecode(sigHex);
            var valid = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, pubKey, sig, data);
            if (valid) {
                out.innerHTML = '<div class="result match"><strong>Signature is VALID.</strong> The message is authentic.</div>';
            } else {
                out.innerHTML = '<div class="result no-match"><strong>Signature is INVALID.</strong> The message may have been altered.</div>';
            }
        } catch (e) { showError(out, 'Verification failed: ' + e.message); }
    });
}
