function toolInit(container) {
    container.innerHTML = '<div class="tool-card">'
        + '<h2>A5/1 Stream Cipher</h2>'
        + '<p class="description">A5/1 is the stream cipher used in GSM mobile communication. It uses three irregularly clocked LFSRs (R1: 19-bit, R2: 22-bit, R3: 23-bit) controlled by majority clocking. Key is 64 bits; per-frame nonce is 22 bits. Each GSM frame produces 228 keystream bits. <strong>Warning:</strong> broken since 2003; included for education only.</p>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="a51-key">Session Key (64 bits = 16 hex chars)</label>'
        + '<input type="text" id="a51-key" value="0123456789ABCDEF" maxlength="16"></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="a51-frame">Frame Number (22 bits = up to 6 hex chars)</label>'
        + '<input type="text" id="a51-frame" value="000000" maxlength="6"></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="a51-input">Plaintext (text) / Ciphertext (hex)</label>'
        + '<textarea id="a51-input" rows="3" placeholder="Plaintext for encrypt, hex for decrypt..."></textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="btn-row">'
        + '<button class="btn" id="a51-encrypt">Encrypt</button>'
        + '<button class="btn btn-secondary" id="a51-decrypt">Decrypt</button>'
        + '<button class="btn btn-accent" id="a51-keystream">Show 228-bit Keystream</button>'
        + '</div>'
        + '</div>'
        + '<div class="output-area" id="a51-output"></div>'
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

    function bitsToBytes(bits) {
        var bytes = [];
        for (var i = 0; i + 8 <= bits.length; i += 8) {
            var b = 0;
            for (var j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
            bytes.push(b);
        }
        return bytes;
    }
    function bytesToBits(bytes) {
        var bits = [];
        for (var i = 0; i < bytes.length; i++) for (var j = 7; j >= 0; j--) bits.push((bytes[i] >> j) & 1);
        return bits;
    }

    // ===== A5/1 LFSR helpers =====
    // R1: 19 bits, taps at positions 13,16,17,18, output = bit 18, clock bit at position 8
    // R2: 22 bits, taps at positions 20,21,        output = bit 21, clock bit at position 10
    // R3: 23 bits, taps at positions 7,20,21,22,   output = bit 22, clock bit at position 10
    function clockR(R, taps) {
        var feedback = 0;
        for (var i = 0; i < taps.length; i++) feedback ^= R[taps[i]];
        // shift left: each bit at i+1 takes value of i; new bit at position 0 = feedback
        for (var i = R.length - 1; i > 0; i--) R[i] = R[i - 1];
        R[0] = feedback;
    }

    function clockAll(state) {
        clockR(state.R1, [13, 16, 17, 18]);
        clockR(state.R2, [20, 21]);
        clockR(state.R3, [7, 20, 21, 22]);
    }

    function majority(a, b, c) { return (a + b + c) >= 2 ? 1 : 0; }

    function clockMajority(state) {
        var c1 = state.R1[8], c2 = state.R2[10], c3 = state.R3[10];
        var maj = majority(c1, c2, c3);
        if (c1 === maj) clockR(state.R1, [13, 16, 17, 18]);
        if (c2 === maj) clockR(state.R2, [20, 21]);
        if (c3 === maj) clockR(state.R3, [7, 20, 21, 22]);
    }

    function outputBit(state) {
        return state.R1[18] ^ state.R2[21] ^ state.R3[22];
    }

    // Initialize: 64-bit key + 22-bit frame, then 100 majority clocks
    function initA51(keyBits, frameBits) {
        var state = { R1: new Array(19).fill(0), R2: new Array(22).fill(0), R3: new Array(23).fill(0) };

        // Step 1: clock all + XOR key bit into LSB of each register
        for (var i = 0; i < 64; i++) {
            clockAll(state);
            state.R1[0] ^= keyBits[i];
            state.R2[0] ^= keyBits[i];
            state.R3[0] ^= keyBits[i];
        }
        // Step 2: clock all + XOR frame bit
        for (var i = 0; i < 22; i++) {
            clockAll(state);
            state.R1[0] ^= frameBits[i];
            state.R2[0] ^= frameBits[i];
            state.R3[0] ^= frameBits[i];
        }
        // Step 3: 100 majority clocks (output discarded)
        for (var i = 0; i < 100; i++) clockMajority(state);

        return state;
    }

    function generateKeystreamBits(state, n) {
        var bits = [];
        for (var i = 0; i < n; i++) {
            clockMajority(state);
            bits.push(outputBit(state));
        }
        return bits;
    }

    function readKeyAndFrame() {
        var keyHex = document.getElementById('a51-key').value.trim().replace(/\s/g, '').toUpperCase();
        if (!/^[0-9A-F]{16}$/.test(keyHex)) throw new Error('Session key must be exactly 16 hex characters (64 bits).');
        var frameHex = (document.getElementById('a51-frame').value.trim().replace(/\s/g, '').toUpperCase() || '0').padStart(6, '0');
        if (!/^[0-9A-F]{1,6}$/.test(frameHex)) throw new Error('Frame number must be 1–6 hex characters.');
        var keyBytes = hexToBytes(keyHex);
        var keyBits = bytesToBits(keyBytes);   // 64 bits

        // Frame number is 22 bits — take low 22 bits of the hex value
        var frameVal = parseInt(frameHex, 16) & 0x3FFFFF;
        var frameBits = [];
        for (var i = 21; i >= 0; i--) frameBits.push((frameVal >> i) & 1);

        return { keyBits: keyBits, frameBits: frameBits, keyHex: keyHex, frameVal: frameVal };
    }

    function process(dataBytes) {
        var args = readKeyAndFrame();
        var state = initA51(args.keyBits, args.frameBits);
        var bits = generateKeystreamBits(state, dataBytes.length * 8);
        var keystream = bitsToBytes(bits);
        var out = [];
        for (var i = 0; i < dataBytes.length; i++) out.push(dataBytes[i] ^ keystream[i]);
        return { out: out, keystream: keystream, args: args };
    }

    document.getElementById('a51-encrypt').addEventListener('click', function () {
        var out = document.getElementById('a51-output');
        try {
            var data = strToBytes(document.getElementById('a51-input').value);
            if (!data.length) throw new Error('Please enter plaintext.');
            var r = process(data);
            var html = '<div class="result"><strong>Ciphertext (hex):</strong><br>' + bytesToHex(r.out) + '</div>';
            html += '<div style="margin-top:0.5rem;color:var(--text-dim);font-size:0.82rem;">'
                + 'Frame: 0x' + r.args.frameVal.toString(16).toUpperCase() + ' (' + r.args.frameVal + ')<br>'
                + 'Keystream (first 16 bytes): ' + bytesToHex(r.keystream.slice(0, 16)) + '</div>';
            out.innerHTML = html;
        } catch (e) { showError(out, e.message); }
    });

    document.getElementById('a51-decrypt').addEventListener('click', function () {
        var out = document.getElementById('a51-output');
        try {
            var hex = document.getElementById('a51-input').value.trim().replace(/\s/g, '').toUpperCase();
            if (!/^[0-9A-F]+$/.test(hex) || hex.length % 2 !== 0) throw new Error('Ciphertext must be a hex string with even length.');
            var r = process(hexToBytes(hex));
            var html = '<div class="result"><strong>Plaintext:</strong><br>' + escapeHtml(bytesToStr(r.out)) + '</div>';
            html += '<div style="margin-top:0.5rem;color:var(--text-dim);font-size:0.82rem;">Hex: ' + bytesToHex(r.out) + '</div>';
            html += '<div style="margin-top:0.3rem;color:var(--text-dim);font-size:0.82rem;">'
                + 'Keystream (first 16 bytes): ' + bytesToHex(r.keystream.slice(0, 16)) + '</div>';
            out.innerHTML = html;
        } catch (e) { showError(out, 'Decryption failed: ' + e.message); }
    });

    document.getElementById('a51-keystream').addEventListener('click', function () {
        var out = document.getElementById('a51-output');
        try {
            var args = readKeyAndFrame();
            var state = initA51(args.keyBits, args.frameBits);
            var bits = generateKeystreamBits(state, 228);
            // Display as bit string and as hex (228 bits = 28 bytes + 4 bits)
            var bitStr = '';
            for (var i = 0; i < bits.length; i++) {
                bitStr += bits[i];
                if ((i + 1) % 8 === 0) bitStr += ' ';
            }
            var html = '<div class="result"><strong>228-bit GSM frame keystream:</strong></div>';
            html += '<div style="margin-top:0.4rem;font-family:var(--font-mono);font-size:0.78rem;word-break:break-all;">' + bitStr.trim() + '</div>';
            // Pad to 232 bits (29 bytes) for hex display
            var padded = bits.slice();
            while (padded.length < 232) padded.push(0);
            var bytes = bitsToBytes(padded);
            html += '<div style="margin-top:0.4rem;color:var(--text-dim);font-size:0.82rem;">Hex (29 bytes, last 4 bits zero-padded): ' + bytesToHex(bytes) + '</div>';
            out.innerHTML = html;
        } catch (e) { showError(out, e.message); }
    });
}
