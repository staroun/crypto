function toolInit(container) {
    container.innerHTML = '<div class="tool-card">'
        + '<h2>ElGamal Encryption</h2>'
        + '<p class="description">Public-key encryption based on the Discrete Logarithm Problem. Uses standardized MODP primes (RFC 2409 / RFC 3526) with generator g = 2. Private key x is random; public key y = g<sup>x</sup> mod p. Encrypt: (c1, c2) = (g<sup>k</sup> mod p,&ensp;m &middot; y<sup>k</sup> mod p). Decrypt: m = c2 &middot; (c1<sup>x</sup>)<sup>&minus;1</sup> mod p.</p>'
        + '<div class="input-row">'
        + '<div class="input-group"><label for="eg-keysize">Key Size</label>'
        + '<select id="eg-keysize"><option value="1024">1024-bit</option><option value="2048" selected>2048-bit</option></select></div>'
        + '<div class="btn-row"><button class="btn btn-accent" id="eg-genkey">Generate Key Pair</button></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="eg-p">Prime p (hex)</label>'
        + '<textarea id="eg-p" rows="3" style="font-size:0.72rem;"></textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="eg-pubkey">Public Key y = g<sup>x</sup> mod p (hex)</label>'
        + '<textarea id="eg-pubkey" rows="2" style="font-size:0.72rem;"></textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="eg-privkey">Private Key x (hex)</label>'
        + '<textarea id="eg-privkey" rows="2" style="font-size:0.72rem;"></textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="eg-input">Plaintext (text) / Ciphertext (c1:c2 hex)</label>'
        + '<textarea id="eg-input" rows="3" placeholder="Plaintext for encrypt, or c1:c2 hex for decrypt..."></textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="btn-row">'
        + '<button class="btn" id="eg-encrypt">Encrypt</button>'
        + '<button class="btn btn-secondary" id="eg-decrypt">Decrypt</button>'
        + '</div>'
        + '</div>'
        + '<div class="output-area" id="eg-output"></div>'
        + '</div>';

    // ===== Standard MODP primes (g = 2) =====
    var PRIMES = {
        1024: 'FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE65381FFFFFFFFFFFFFFFF',
        2048: 'FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AACAA68FFFFFFFFFFFFFFFF'
    };
    var G = 2n;

    // ===== BigInt helpers =====
    function modPow(base, exp, mod) {
        base = ((base % mod) + mod) % mod;
        var result = 1n;
        while (exp > 0n) {
            if (exp & 1n) result = (result * base) % mod;
            exp >>= 1n;
            base = (base * base) % mod;
        }
        return result;
    }

    function modInv(a, m) {
        var m0 = m, x0 = 0n, x1 = 1n;
        if (m === 1n) return 0n;
        while (a > 1n) {
            var q = a / m;
            var t = m;
            m = a % m;
            a = t;
            t = x0;
            x0 = x1 - q * x0;
            x1 = t;
        }
        if (x1 < 0n) x1 += m0;
        return x1;
    }

    function randomBigInt(bits) {
        var bytes = new Uint8Array(Math.ceil(bits / 8));
        crypto.getRandomValues(bytes);
        bytes[0] |= (1 << ((bits - 1) % 8));
        var hex = '';
        for (var i = 0; i < bytes.length; i++) hex += (bytes[i] < 16 ? '0' : '') + bytes[i].toString(16);
        return BigInt('0x' + hex);
    }

    function bigToHex(n) {
        var h = n.toString(16).toUpperCase();
        if (h.length % 2) h = '0' + h;
        return h;
    }

    function strToBytes(s) { return Array.prototype.slice.call(new TextEncoder().encode(s)); }
    function bytesToStr(bytes) { return new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(bytes)); }

    function bytesToBigInt(bytes) {
        var hex = '';
        for (var i = 0; i < bytes.length; i++) hex += (bytes[i] < 16 ? '0' : '') + bytes[i].toString(16);
        return hex.length > 0 ? BigInt('0x' + hex) : 0n;
    }
    function bigIntToBytes(n) {
        var hex = n.toString(16);
        if (hex.length % 2) hex = '0' + hex;
        var bytes = [];
        for (var i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.substr(i, 2), 16));
        return bytes;
    }

    // ===== Key generation =====
    document.getElementById('eg-genkey').addEventListener('click', function () {
        var out = document.getElementById('eg-output');
        var bits = parseInt(document.getElementById('eg-keysize').value, 10);
        var pHex = PRIMES[bits];
        var p = BigInt('0x' + pHex);

        // Private key: random x in [2, p-2]
        var x = randomBigInt(bits - 1);
        x = (x % (p - 3n)) + 2n;

        // Public key: y = g^x mod p
        var y = modPow(G, x, p);

        document.getElementById('eg-p').value = pHex;
        document.getElementById('eg-pubkey').value = bigToHex(y);
        document.getElementById('eg-privkey').value = bigToHex(x);

        out.innerHTML = '<div class="result"><strong>' + bits + '-bit key pair generated.</strong></div>'
            + '<div style="margin-top:0.4rem;color:var(--text-dim);font-size:0.82rem;">'
            + 'Prime source: RFC ' + (bits === 1024 ? '2409 MODP Group 2' : '3526 MODP Group 14') + '<br>'
            + 'g = 2<br>'
            + 'Private key x: ' + bigToHex(x).length / 2 + ' bytes<br>'
            + 'Public key y: ' + bigToHex(y).length / 2 + ' bytes</div>';
    });

    // ===== Encrypt =====
    document.getElementById('eg-encrypt').addEventListener('click', function () {
        var out = document.getElementById('eg-output');
        try {
            var pHex = document.getElementById('eg-p').value.trim().replace(/\s/g, '');
            var yHex = document.getElementById('eg-pubkey').value.trim().replace(/\s/g, '');
            var input = document.getElementById('eg-input').value;
            if (!pHex || !yHex) throw new Error('Generate a key pair first.');
            if (!input) throw new Error('Please enter plaintext.');

            var p = BigInt('0x' + pHex);
            var y = BigInt('0x' + yHex);
            var bits = parseInt(document.getElementById('eg-keysize').value, 10);

            // Convert plaintext to BigInt (must be < p)
            var mBytes = strToBytes(input);
            var m = bytesToBigInt(mBytes);
            if (m >= p) throw new Error('Message too long for this key size. Max ' + Math.floor(bits / 8 - 1) + ' bytes.');
            if (m === 0n) throw new Error('Message cannot be empty or all zeros.');

            // Random k in [2, p-2]
            var k = randomBigInt(bits - 1);
            k = (k % (p - 3n)) + 2n;

            var c1 = modPow(G, k, p);
            var c2 = (m * modPow(y, k, p)) % p;

            var c1Hex = bigToHex(c1);
            var c2Hex = bigToHex(c2);
            document.getElementById('eg-input').value = c1Hex + ':' + c2Hex;

            var html = '<div class="result"><strong>Ciphertext (c1:c2 hex):</strong><br>'
                + '<span style="word-break:break-all;font-size:0.78rem;">' + c1Hex + ':' + c2Hex + '</span></div>';
            html += '<table class="step-table" style="font-size:0.78rem;">'
                + '<tr><th>Step</th><th>Value</th></tr>'
                + '<tr><td>m (plaintext as number)</td><td style="word-break:break-all;">' + bigToHex(m) + '</td></tr>'
                + '<tr><td>k (random)</td><td style="word-break:break-all;">' + bigToHex(k) + '</td></tr>'
                + '<tr><td>c1 = g<sup>k</sup> mod p</td><td style="word-break:break-all;">' + c1Hex + '</td></tr>'
                + '<tr><td>c2 = m &middot; y<sup>k</sup> mod p</td><td style="word-break:break-all;">' + c2Hex + '</td></tr>'
                + '</table>';
            out.innerHTML = html;
        } catch (e) { showError(out, e.message); }
    });

    // ===== Decrypt =====
    document.getElementById('eg-decrypt').addEventListener('click', function () {
        var out = document.getElementById('eg-output');
        try {
            var pHex = document.getElementById('eg-p').value.trim().replace(/\s/g, '');
            var xHex = document.getElementById('eg-privkey').value.trim().replace(/\s/g, '');
            var input = document.getElementById('eg-input').value.trim();
            if (!pHex || !xHex) throw new Error('Generate a key pair first.');

            var parts = input.split(':');
            if (parts.length !== 2) throw new Error('Ciphertext must be in the format c1:c2 (hex).');

            var p = BigInt('0x' + pHex);
            var x = BigInt('0x' + xHex);
            var c1 = BigInt('0x' + parts[0].trim().replace(/\s/g, ''));
            var c2 = BigInt('0x' + parts[1].trim().replace(/\s/g, ''));

            // m = c2 * (c1^x)^(-1) mod p
            var s = modPow(c1, x, p);
            var sInv = modInv(s, p);
            var m = (c2 * sInv) % p;

            var mBytes = bigIntToBytes(m);
            var plaintext = bytesToStr(mBytes);

            var html = '<div class="result"><strong>Plaintext:</strong><br>' + escapeHtml(plaintext) + '</div>';
            html += '<table class="step-table" style="font-size:0.78rem;">'
                + '<tr><th>Step</th><th>Value</th></tr>'
                + '<tr><td>s = c1<sup>x</sup> mod p</td><td style="word-break:break-all;">' + bigToHex(s) + '</td></tr>'
                + '<tr><td>s<sup>&minus;1</sup> mod p</td><td style="word-break:break-all;">' + bigToHex(sInv) + '</td></tr>'
                + '<tr><td>m = c2 &middot; s<sup>&minus;1</sup> mod p</td><td style="word-break:break-all;">' + bigToHex(m) + '</td></tr>'
                + '</table>';
            html += '<div style="margin-top:0.4rem;color:var(--text-dim);font-size:0.82rem;">Hex: ' + bigToHex(m) + '</div>';
            out.innerHTML = html;
        } catch (e) { showError(out, 'Decryption failed: ' + e.message); }
    });
}
