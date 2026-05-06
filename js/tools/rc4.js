function toolInit(container) {
    container.innerHTML = '<div class="tool-card">'
        + '<h2>RC4 Stream Cipher</h2>'
        + '<p class="description">Encrypt or decrypt data using the RC4 stream cipher (Ron Rivest, 1987). Same operation works in both directions: ciphertext = plaintext &oplus; keystream. Key length is variable (1 &ndash; 256 bytes; typically 16 bytes). <strong>Warning:</strong> RC4 is broken for security use; included for education only.</p>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="rc4-key">Key (hex)</label>'
        + '<input type="text" id="rc4-key" value="0102030405" placeholder="2&ndash;512 hex chars (1&ndash;256 bytes)..."></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="rc4-input">Plaintext (text) / Ciphertext (hex)</label>'
        + '<textarea id="rc4-input" rows="3" placeholder="Plaintext for encrypt, hex for decrypt..."></textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="btn-row">'
        + '<button class="btn" id="rc4-encrypt">Encrypt</button>'
        + '<button class="btn btn-secondary" id="rc4-decrypt">Decrypt</button>'
        + '<button class="btn btn-accent" id="rc4-keystream">Show Keystream (32 bytes)</button>'
        + '</div>'
        + '</div>'
        + '<div class="output-area" id="rc4-output"></div>'
        + '</div>';

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

    function ksa(keyBytes) {
        var S = [];
        for (var i = 0; i < 256; i++) S[i] = i;
        var j = 0;
        for (var i = 0; i < 256; i++) {
            j = (j + S[i] + keyBytes[i % keyBytes.length]) & 0xff;
            var t = S[i]; S[i] = S[j]; S[j] = t;
        }
        return S;
    }
    function prga(S, length) {
        S = S.slice();
        var i = 0, j = 0;
        var stream = [];
        for (var n = 0; n < length; n++) {
            i = (i + 1) & 0xff;
            j = (j + S[i]) & 0xff;
            var t = S[i]; S[i] = S[j]; S[j] = t;
            stream.push(S[(S[i] + S[j]) & 0xff]);
        }
        return stream;
    }

    function rc4Process(keyBytes, dataBytes) {
        var S = ksa(keyBytes);
        var keystream = prga(S, dataBytes.length);
        var out = [];
        for (var i = 0; i < dataBytes.length; i++) out.push(dataBytes[i] ^ keystream[i]);
        return { out: out, keystream: keystream, S: S };
    }

    function readKey() {
        var keyHex = document.getElementById('rc4-key').value.trim().replace(/\s/g, '').toUpperCase();
        if (!/^[0-9A-F]+$/.test(keyHex) || keyHex.length % 2 !== 0) throw new Error('Key must be a hex string with even length.');
        var keyBytes = hexToBytes(keyHex);
        if (keyBytes.length < 1 || keyBytes.length > 256) throw new Error('Key length must be 1 to 256 bytes.');
        return keyBytes;
    }

    function renderState(S) {
        var html = '<div style="margin-top:0.4rem;color:var(--text-dim);font-size:0.78rem;">First 32 bytes of S after KSA:</div>';
        html += '<table class="step-table" style="font-size:0.75rem;"><tr><th>idx</th>';
        for (var c = 0; c < 8; c++) html += '<th>+' + c + '</th>';
        html += '</tr>';
        for (var r = 0; r < 4; r++) {
            html += '<tr><td>' + (r * 8) + '</td>';
            for (var c = 0; c < 8; c++) {
                var v = S[r * 8 + c];
                html += '<td>' + (v < 16 ? '0' : '') + v.toString(16).toUpperCase() + '</td>';
            }
            html += '</tr>';
        }
        html += '</table>';
        return html;
    }

    document.getElementById('rc4-encrypt').addEventListener('click', function () {
        var out = document.getElementById('rc4-output');
        try {
            var keyBytes = readKey();
            var data = strToBytes(document.getElementById('rc4-input').value);
            if (!data.length) throw new Error('Please enter plaintext.');
            var r = rc4Process(keyBytes, data);
            var html = '<div class="result"><strong>Ciphertext (hex):</strong><br>' + bytesToHex(r.out) + '</div>';
            html += '<div style="margin-top:0.5rem;color:var(--text-dim);font-size:0.82rem;">Keystream (first 16 bytes): '
                + bytesToHex(r.keystream.slice(0, 16)) + '</div>';
            html += renderState(r.S);
            out.innerHTML = html;
        } catch (e) { showError(out, e.message); }
    });

    document.getElementById('rc4-decrypt').addEventListener('click', function () {
        var out = document.getElementById('rc4-output');
        try {
            var keyBytes = readKey();
            var hex = document.getElementById('rc4-input').value.trim().replace(/\s/g, '').toUpperCase();
            if (!/^[0-9A-F]+$/.test(hex) || hex.length % 2 !== 0) throw new Error('Ciphertext must be a hex string with even length.');
            var data = hexToBytes(hex);
            var r = rc4Process(keyBytes, data);
            var html = '<div class="result"><strong>Plaintext:</strong><br>' + escapeHtml(bytesToStr(r.out)) + '</div>';
            html += '<div style="margin-top:0.5rem;color:var(--text-dim);font-size:0.82rem;">Hex: ' + bytesToHex(r.out) + '</div>';
            html += '<div style="margin-top:0.3rem;color:var(--text-dim);font-size:0.82rem;">Keystream (first 16 bytes): '
                + bytesToHex(r.keystream.slice(0, 16)) + '</div>';
            html += renderState(r.S);
            out.innerHTML = html;
        } catch (e) { showError(out, 'Decryption failed: ' + e.message); }
    });

    document.getElementById('rc4-keystream').addEventListener('click', function () {
        var out = document.getElementById('rc4-output');
        try {
            var keyBytes = readKey();
            var S = ksa(keyBytes);
            var stream = prga(S, 32);
            var html = '<div class="result"><strong>Keystream (32 bytes, hex):</strong><br>' + bytesToHex(stream) + '</div>';
            html += renderState(S);
            out.innerHTML = html;
        } catch (e) { showError(out, e.message); }
    });
}
