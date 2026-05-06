function toolInit(container) {
    container.innerHTML = '<div class="tool-card">'
        + '<h2>ChaCha20 Stream Cipher (RFC 8439)</h2>'
        + '<p class="description">ChaCha20 is a modern stream cipher by Daniel J. Bernstein, used in TLS 1.3, WireGuard, and OpenSSH. It uses a 256-bit key, a 96-bit nonce, and a 32-bit block counter to generate a 64-byte keystream block via 20 rounds of the Quarter-Round (ARX) function. Same operation works in both directions: ciphertext = plaintext &oplus; keystream.</p>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="cc-key">Key (256-bit = 64 hex chars)</label>'
        + '<input type="text" id="cc-key" value="000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F" maxlength="64"></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="cc-nonce">Nonce (96-bit = 24 hex chars)</label>'
        + '<input type="text" id="cc-nonce" value="000000000000004A00000000" maxlength="24"></div>'
        + '<div class="input-group"><label for="cc-counter">Initial Counter</label>'
        + '<input type="number" id="cc-counter" value="1" min="0" max="4294967295"></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="cc-input">Plaintext (text) / Ciphertext (hex)</label>'
        + '<textarea id="cc-input" rows="3" placeholder="Plaintext for encrypt, hex for decrypt..."></textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="btn-row">'
        + '<button class="btn" id="cc-encrypt">Encrypt</button>'
        + '<button class="btn btn-secondary" id="cc-decrypt">Decrypt</button>'
        + '<button class="btn btn-accent" id="cc-block">Show First Keystream Block</button>'
        + '</div>'
        + '</div>'
        + '<div class="output-area" id="cc-output"></div>'
        + '</div>';

    // ===== Helpers =====
    function hexToBytes(hex) {
        var b = [];
        for (var i = 0; i < hex.length; i += 2) b.push(parseInt(hex.substr(i, 2), 16));
        return b;
    }
    function bytesToHex(bytes) {
        var h = '';
        for (var i = 0; i < bytes.length; i++) h += (bytes[i] < 16 ? '0' : '') + bytes[i].toString(16).toUpperCase();
        return h;
    }
    function strToBytes(s) { return Array.prototype.slice.call(new TextEncoder().encode(s)); }
    function bytesToStr(bytes) { return new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(bytes)); }

    function rotl(v, n) { return ((v << n) | (v >>> (32 - n))) >>> 0; }
    function add32(a, b) { return ((a + b) >>> 0); }

    // Read 4 bytes as little-endian 32-bit word
    function leU32(bytes, off) {
        return ((bytes[off]) | (bytes[off+1] << 8) | (bytes[off+2] << 16) | (bytes[off+3] << 24)) >>> 0;
    }
    // Write 32-bit word as 4 little-endian bytes
    function u32LE(v) {
        return [v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff];
    }

    // ===== ChaCha20 core =====
    function quarterRound(s, a, b, c, d) {
        s[a] = add32(s[a], s[b]); s[d] = rotl(s[d] ^ s[a], 16);
        s[c] = add32(s[c], s[d]); s[b] = rotl(s[b] ^ s[c], 12);
        s[a] = add32(s[a], s[b]); s[d] = rotl(s[d] ^ s[a], 8);
        s[c] = add32(s[c], s[d]); s[b] = rotl(s[b] ^ s[c], 7);
    }

    function chachaBlock(keyBytes, nonceBytes, counter) {
        // Constants: "expand 32-byte k" little-endian
        var state = [
            0x61707865, 0x3320646e, 0x79622d32, 0x6b206574,
            leU32(keyBytes, 0),  leU32(keyBytes, 4),  leU32(keyBytes, 8),  leU32(keyBytes, 12),
            leU32(keyBytes, 16), leU32(keyBytes, 20), leU32(keyBytes, 24), leU32(keyBytes, 28),
            counter >>> 0,
            leU32(nonceBytes, 0), leU32(nonceBytes, 4), leU32(nonceBytes, 8)
        ];
        var working = state.slice();

        // 20 rounds = 10 double rounds
        for (var i = 0; i < 10; i++) {
            // Column rounds
            quarterRound(working, 0, 4,  8, 12);
            quarterRound(working, 1, 5,  9, 13);
            quarterRound(working, 2, 6, 10, 14);
            quarterRound(working, 3, 7, 11, 15);
            // Diagonal rounds
            quarterRound(working, 0, 5, 10, 15);
            quarterRound(working, 1, 6, 11, 12);
            quarterRound(working, 2, 7,  8, 13);
            quarterRound(working, 3, 4,  9, 14);
        }

        // Add original state, then serialize little-endian
        var out = [];
        for (var i = 0; i < 16; i++) {
            var v = add32(working[i], state[i]);
            out = out.concat(u32LE(v));
        }
        return { keystream: out, initialState: state, finalState: working };
    }

    function chacha20Process(keyBytes, nonceBytes, counter, dataBytes) {
        var out = [];
        var blockNum = 0;
        for (var i = 0; i < dataBytes.length; i += 64) {
            var block = chachaBlock(keyBytes, nonceBytes, counter + blockNum);
            var keystream = block.keystream;
            var n = Math.min(64, dataBytes.length - i);
            for (var j = 0; j < n; j++) out.push(dataBytes[i + j] ^ keystream[j]);
            blockNum++;
        }
        return out;
    }

    function readArgs() {
        var keyHex = document.getElementById('cc-key').value.trim().replace(/\s/g, '').toUpperCase();
        if (!/^[0-9A-F]{64}$/.test(keyHex)) throw new Error('Key must be exactly 64 hex characters (256-bit).');
        var nonceHex = document.getElementById('cc-nonce').value.trim().replace(/\s/g, '').toUpperCase();
        if (!/^[0-9A-F]{24}$/.test(nonceHex)) throw new Error('Nonce must be exactly 24 hex characters (96-bit).');
        var counter = parseInt(document.getElementById('cc-counter').value, 10);
        if (isNaN(counter) || counter < 0 || counter > 0xFFFFFFFF) throw new Error('Counter must be a 32-bit unsigned integer (0 — 4294967295).');
        return { keyBytes: hexToBytes(keyHex), nonceBytes: hexToBytes(nonceHex), counter: counter };
    }

    function renderState(label, state) {
        var html = '<div style="margin-top:0.6rem;color:var(--text-dim);font-size:0.82rem;">' + label + ':</div>';
        html += '<table class="step-table" style="font-size:0.78rem;">';
        for (var r = 0; r < 4; r++) {
            html += '<tr>';
            for (var c = 0; c < 4; c++) {
                var v = state[r * 4 + c];
                var hex = ('00000000' + v.toString(16).toUpperCase()).slice(-8);
                html += '<td>' + hex + '</td>';
            }
            html += '</tr>';
        }
        html += '</table>';
        return html;
    }

    document.getElementById('cc-encrypt').addEventListener('click', function () {
        var out = document.getElementById('cc-output');
        try {
            var args = readArgs();
            var data = strToBytes(document.getElementById('cc-input').value);
            if (!data.length) throw new Error('Please enter plaintext.');
            var ct = chacha20Process(args.keyBytes, args.nonceBytes, args.counter, data);
            var firstBlock = chachaBlock(args.keyBytes, args.nonceBytes, args.counter);
            var html = '<div class="result"><strong>Ciphertext (hex):</strong><br>' + bytesToHex(ct) + '</div>';
            html += '<div style="margin-top:0.5rem;color:var(--text-dim);font-size:0.82rem;">'
                + 'Plaintext bytes: ' + data.length + ', blocks used: ' + Math.ceil(data.length / 64) + '</div>';
            html += '<div style="margin-top:0.3rem;color:var(--text-dim);font-size:0.82rem;">First keystream block (64 bytes):<br>'
                + bytesToHex(firstBlock.keystream) + '</div>';
            out.innerHTML = html;
        } catch (e) { showError(out, e.message); }
    });

    document.getElementById('cc-decrypt').addEventListener('click', function () {
        var out = document.getElementById('cc-output');
        try {
            var args = readArgs();
            var hex = document.getElementById('cc-input').value.trim().replace(/\s/g, '').toUpperCase();
            if (!/^[0-9A-F]+$/.test(hex) || hex.length % 2 !== 0) throw new Error('Ciphertext must be a hex string with even length.');
            var pt = chacha20Process(args.keyBytes, args.nonceBytes, args.counter, hexToBytes(hex));
            var html = '<div class="result"><strong>Plaintext:</strong><br>' + escapeHtml(bytesToStr(pt)) + '</div>';
            html += '<div style="margin-top:0.5rem;color:var(--text-dim);font-size:0.82rem;">Hex: ' + bytesToHex(pt) + '</div>';
            out.innerHTML = html;
        } catch (e) { showError(out, 'Decryption failed: ' + e.message); }
    });

    document.getElementById('cc-block').addEventListener('click', function () {
        var out = document.getElementById('cc-output');
        try {
            var args = readArgs();
            var block = chachaBlock(args.keyBytes, args.nonceBytes, args.counter);
            var html = '<div class="result"><strong>First keystream block (64 bytes, hex):</strong></div>';
            html += '<div style="margin-top:0.4rem;font-family:var(--font-mono);font-size:0.82rem;word-break:break-all;">' + bytesToHex(block.keystream) + '</div>';
            html += renderState('Initial state (4×4 of 32-bit words, big-endian display)', block.initialState);
            html += renderState('After 20 rounds (working state)', block.finalState);
            out.innerHTML = html;
        } catch (e) { showError(out, e.message); }
    });
}
