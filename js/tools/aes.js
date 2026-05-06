function toolInit(container) {
    container.innerHTML = ''
        // ===== Card 1: General AES with mode selection =====
        + '<div class="tool-card">'
        + '<h2>AES Encryption / Decryption (5 Modes)</h2>'
        + '<p class="description">Encrypt and decrypt text using pure JavaScript AES in five modes: <strong>ECB, CBC, CFB, OFB, CTR</strong>. Supports 128 / 192 / 256-bit keys. ECB and CBC use PKCS#7 padding; CFB/OFB/CTR are stream-style and need no padding. The IV (or counter) is required for all modes except ECB.</p>'
        + '<div class="input-row">'
        + '<div class="input-group"><label for="aes-mode">Mode</label>'
        + '<select id="aes-mode">'
        + '<option value="ECB">ECB</option>'
        + '<option value="CBC" selected>CBC</option>'
        + '<option value="CFB">CFB</option>'
        + '<option value="OFB">OFB</option>'
        + '<option value="CTR">CTR</option>'
        + '</select></div>'
        + '<div class="input-group"><label for="aes-keysize">Key Size</label>'
        + '<select id="aes-keysize"><option value="128">128-bit</option><option value="192">192-bit</option><option value="256">256-bit</option></select></div>'
        + '<div class="btn-row">'
        + '<button class="btn btn-accent" id="aes-genkey">Generate Key</button>'
        + '<button class="btn btn-accent" id="aes-geniv">Generate IV</button>'
        + '</div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="aes-key">Key (hex)</label>'
        + '<input type="text" id="aes-key" placeholder="32 / 48 / 64 hex chars"></div>'
        + '</div>'
        + '<div class="input-row" id="aes-iv-row">'
        + '<div class="input-group flex-grow"><label for="aes-iv">IV / Nonce (hex, 32 chars)</label>'
        + '<input type="text" id="aes-iv" placeholder="16 bytes (32 hex chars). For CTR, this is the initial counter block."></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="aes-input">Plaintext (text) / Ciphertext (hex)</label>'
        + '<textarea id="aes-input" rows="3" placeholder="Plaintext (UTF-8 text) for encryption, or hex ciphertext for decryption..."></textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="btn-row">'
        + '<button class="btn" id="aes-encrypt">Encrypt</button>'
        + '<button class="btn btn-secondary" id="aes-decrypt">Decrypt</button>'
        + '</div>'
        + '</div>'
        + '<div class="output-area" id="aes-output"></div>'
        + '</div>'

        // ===== Card 2: Step-by-Step Single Block (ECB, no padding) =====
        + '<div class="tool-card">'
        + '<h2>AES Step-by-Step (Single 128-bit Block)</h2>'
        + '<p class="description">Encrypt or decrypt a single 128-bit block using raw AES (no padding, no chaining). Shows the full internal process: Key Expansion (round keys), and for each round the state after SubBytes, ShiftRows, MixColumns, and AddRoundKey.</p>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="aes-step-plain">Plaintext / Ciphertext (32 hex chars = 128 bits)</label>'
        + '<input type="text" id="aes-step-plain" value="00112233445566778899AABBCCDDEEFF" maxlength="32"></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group"><label for="aes-step-keysize">Key Size</label>'
        + '<select id="aes-step-keysize"><option value="128" selected>128-bit (10 rounds)</option><option value="192">192-bit (12 rounds)</option><option value="256">256-bit (14 rounds)</option></select></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="aes-step-key">Key (hex)</label>'
        + '<input type="text" id="aes-step-key" value="000102030405060708090A0B0C0D0E0F" maxlength="64"></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="btn-row">'
        + '<button class="btn" id="aes-step-encrypt">Encrypt (with steps)</button>'
        + '<button class="btn btn-secondary" id="aes-step-decrypt">Decrypt (with steps)</button>'
        + '</div>'
        + '</div>'
        + '<div class="output-area" id="aes-step-output"></div>'
        + '</div>';

    // ===================== AES Core (pure JS) =====================
    var SBOX = [
        0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
        0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
        0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
        0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
        0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
        0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
        0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
        0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
        0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
        0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
        0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
        0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
        0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
        0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
        0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
        0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16
    ];
    var INV_SBOX = new Array(256);
    for (var i = 0; i < 256; i++) INV_SBOX[SBOX[i]] = i;

    var RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d];

    function xtime(b) { return ((b << 1) ^ ((b & 0x80) ? 0x1b : 0)) & 0xff; }
    function gmul(a, b) { var p = 0; for (var i = 0; i < 8; i++) { if (b & 1) p ^= a; a = xtime(a); b >>= 1; } return p & 0xff; }

    function hexToBytes(hex) {
        var bytes = [];
        for (var i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.substr(i, 2), 16));
        return bytes;
    }
    function bytesToHex(bytes) {
        var hex = '';
        for (var i = 0; i < bytes.length; i++) hex += (bytes[i] < 16 ? '0' : '') + bytes[i].toString(16).toUpperCase();
        return hex;
    }
    function strToBytes(str) {
        var b = new TextEncoder().encode(str);
        return Array.prototype.slice.call(b);
    }
    function bytesToStr(bytes) {
        try { return new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(bytes)); }
        catch (e) { return ''; }
    }
    function randomBytes(n) {
        var arr = new Uint8Array(n);
        crypto.getRandomValues(arr);
        return Array.prototype.slice.call(arr);
    }

    function keyExpansion(keyBytes) {
        var Nk = keyBytes.length / 4;
        var Nr = (Nk === 4) ? 10 : (Nk === 6) ? 12 : 14;
        var Nb = 4;
        var totalWords = Nb * (Nr + 1);
        var w = [];
        for (var i = 0; i < Nk; i++) w.push([keyBytes[4*i], keyBytes[4*i+1], keyBytes[4*i+2], keyBytes[4*i+3]]);
        for (var i = Nk; i < totalWords; i++) {
            var temp = w[i-1].slice();
            if (i % Nk === 0) {
                temp = [temp[1], temp[2], temp[3], temp[0]];
                for (var j = 0; j < 4; j++) temp[j] = SBOX[temp[j]];
                temp[0] ^= RCON[i / Nk];
            } else if (Nk > 6 && i % Nk === 4) {
                for (var j = 0; j < 4; j++) temp[j] = SBOX[temp[j]];
            }
            w.push([w[i-Nk][0]^temp[0], w[i-Nk][1]^temp[1], w[i-Nk][2]^temp[2], w[i-Nk][3]^temp[3]]);
        }
        var roundKeys = [];
        for (var r = 0; r <= Nr; r++) {
            var rk = [];
            for (var c = 0; c < 4; c++) for (var b = 0; b < 4; b++) rk.push(w[r*4 + c][b]);
            roundKeys.push(rk);
        }
        return { roundKeys: roundKeys, Nr: Nr };
    }

    function addRoundKey(state, rk) { var o = []; for (var i = 0; i < 16; i++) o.push(state[i] ^ rk[i]); return o; }
    function subBytes(state, t) { var o = []; for (var i = 0; i < 16; i++) o.push(t[state[i]]); return o; }

    function shiftRows(s) {
        var o = s.slice();
        var t = o[1]; o[1] = o[5]; o[5] = o[9]; o[9] = o[13]; o[13] = t;
        var t1 = o[2], t2 = o[6]; o[2] = o[10]; o[6] = o[14]; o[10] = t1; o[14] = t2;
        var t3 = o[15]; o[15] = o[11]; o[11] = o[7]; o[7] = o[3]; o[3] = t3;
        return o;
    }
    function invShiftRows(s) {
        var o = s.slice();
        var t = o[13]; o[13] = o[9]; o[9] = o[5]; o[5] = o[1]; o[1] = t;
        var t1 = o[10], t2 = o[14]; o[10] = o[2]; o[14] = o[6]; o[2] = t1; o[6] = t2;
        var t3 = o[3]; o[3] = o[7]; o[7] = o[11]; o[11] = o[15]; o[15] = t3;
        return o;
    }

    function mixColumns(s) {
        var o = s.slice();
        for (var c = 0; c < 4; c++) {
            var s0 = s[4*c], s1 = s[4*c+1], s2 = s[4*c+2], s3 = s[4*c+3];
            o[4*c]   = gmul(2,s0) ^ gmul(3,s1) ^ s2 ^ s3;
            o[4*c+1] = s0 ^ gmul(2,s1) ^ gmul(3,s2) ^ s3;
            o[4*c+2] = s0 ^ s1 ^ gmul(2,s2) ^ gmul(3,s3);
            o[4*c+3] = gmul(3,s0) ^ s1 ^ s2 ^ gmul(2,s3);
        }
        return o;
    }
    function invMixColumns(s) {
        var o = s.slice();
        for (var c = 0; c < 4; c++) {
            var s0 = s[4*c], s1 = s[4*c+1], s2 = s[4*c+2], s3 = s[4*c+3];
            o[4*c]   = gmul(0x0e,s0) ^ gmul(0x0b,s1) ^ gmul(0x0d,s2) ^ gmul(0x09,s3);
            o[4*c+1] = gmul(0x09,s0) ^ gmul(0x0e,s1) ^ gmul(0x0b,s2) ^ gmul(0x0d,s3);
            o[4*c+2] = gmul(0x0d,s0) ^ gmul(0x09,s1) ^ gmul(0x0e,s2) ^ gmul(0x0b,s3);
            o[4*c+3] = gmul(0x0b,s0) ^ gmul(0x0d,s1) ^ gmul(0x09,s2) ^ gmul(0x0e,s3);
        }
        return o;
    }

    function encryptBlock(plain, keyBytes, ke) {
        if (!ke) ke = keyExpansion(keyBytes);
        var state = addRoundKey(plain, ke.roundKeys[0]);
        for (var r = 1; r < ke.Nr; r++) {
            state = subBytes(state, SBOX);
            state = shiftRows(state);
            state = mixColumns(state);
            state = addRoundKey(state, ke.roundKeys[r]);
        }
        state = subBytes(state, SBOX);
        state = shiftRows(state);
        state = addRoundKey(state, ke.roundKeys[ke.Nr]);
        return state;
    }
    function decryptBlock(cipher, keyBytes, ke) {
        if (!ke) ke = keyExpansion(keyBytes);
        var state = addRoundKey(cipher, ke.roundKeys[ke.Nr]);
        for (var r = ke.Nr - 1; r >= 1; r--) {
            state = invShiftRows(state);
            state = subBytes(state, INV_SBOX);
            state = addRoundKey(state, ke.roundKeys[r]);
            state = invMixColumns(state);
        }
        state = invShiftRows(state);
        state = subBytes(state, INV_SBOX);
        state = addRoundKey(state, ke.roundKeys[0]);
        return state;
    }

    function xorBlock(a, b, len) {
        len = len || a.length;
        var o = new Array(len);
        for (var i = 0; i < len; i++) o[i] = a[i] ^ b[i];
        return o;
    }

    function pkcs7Pad(bytes) {
        var pad = 16 - (bytes.length % 16);
        var out = bytes.slice();
        for (var i = 0; i < pad; i++) out.push(pad);
        return out;
    }
    function pkcs7Unpad(bytes) {
        if (!bytes.length || bytes.length % 16 !== 0) throw new Error('Invalid padded length');
        var pad = bytes[bytes.length - 1];
        if (pad < 1 || pad > 16) throw new Error('Invalid PKCS#7 padding byte: ' + pad);
        for (var i = bytes.length - pad; i < bytes.length; i++) {
            if (bytes[i] !== pad) throw new Error('Invalid PKCS#7 padding bytes');
        }
        return bytes.slice(0, bytes.length - pad);
    }

    // ===================== Modes =====================
    function modeECB(input, keyBytes, encrypt) {
        var ke = keyExpansion(keyBytes);
        if (encrypt) {
            var data = pkcs7Pad(input);
            var out = [];
            for (var i = 0; i < data.length; i += 16) {
                var blk = data.slice(i, i + 16);
                out = out.concat(encrypt ? encryptBlock(blk, keyBytes, ke) : decryptBlock(blk, keyBytes, ke));
            }
            return out;
        } else {
            if (input.length % 16 !== 0) throw new Error('Ciphertext length must be a multiple of 16 for ECB.');
            var out = [];
            for (var i = 0; i < input.length; i += 16) {
                var blk = input.slice(i, i + 16);
                out = out.concat(decryptBlock(blk, keyBytes, ke));
            }
            return pkcs7Unpad(out);
        }
    }

    function modeCBC(input, keyBytes, iv, encrypt) {
        if (iv.length !== 16) throw new Error('CBC IV must be 16 bytes (32 hex chars).');
        var ke = keyExpansion(keyBytes);
        if (encrypt) {
            var data = pkcs7Pad(input);
            var out = [];
            var prev = iv;
            for (var i = 0; i < data.length; i += 16) {
                var blk = data.slice(i, i + 16);
                var x = xorBlock(blk, prev);
                var ct = encryptBlock(x, keyBytes, ke);
                out = out.concat(ct);
                prev = ct;
            }
            return out;
        } else {
            if (input.length % 16 !== 0) throw new Error('Ciphertext length must be a multiple of 16 for CBC.');
            var out = [];
            var prev = iv;
            for (var i = 0; i < input.length; i += 16) {
                var blk = input.slice(i, i + 16);
                var dec = decryptBlock(blk, keyBytes, ke);
                out = out.concat(xorBlock(dec, prev));
                prev = blk;
            }
            return pkcs7Unpad(out);
        }
    }

    function modeCFB(input, keyBytes, iv, encrypt) {
        if (iv.length !== 16) throw new Error('CFB IV must be 16 bytes (32 hex chars).');
        var ke = keyExpansion(keyBytes);
        var out = [];
        var prev = iv.slice();
        for (var i = 0; i < input.length; i += 16) {
            var n = Math.min(16, input.length - i);
            var keystream = encryptBlock(prev, keyBytes, ke);
            var blk = input.slice(i, i + n);
            var processed = xorBlock(blk, keystream, n);
            out = out.concat(processed);
            // Feedback: in CFB encrypt feedback = ciphertext block; decrypt feedback = ciphertext block (input)
            if (encrypt) {
                // pad processed to 16 bytes for feedback if last short block
                if (n === 16) prev = processed;
                else { prev = processed.concat(keystream.slice(n)); /* effectively unused after last block */ }
            } else {
                if (n === 16) prev = blk;
                else { prev = blk.concat(keystream.slice(n)); }
            }
        }
        return out;
    }

    function modeOFB(input, keyBytes, iv, encrypt) {
        if (iv.length !== 16) throw new Error('OFB IV must be 16 bytes (32 hex chars).');
        var ke = keyExpansion(keyBytes);
        var out = [];
        var feedback = iv.slice();
        for (var i = 0; i < input.length; i += 16) {
            var n = Math.min(16, input.length - i);
            feedback = encryptBlock(feedback, keyBytes, ke);
            var blk = input.slice(i, i + n);
            out = out.concat(xorBlock(blk, feedback, n));
        }
        return out;
    }

    function incrementCounter(ctr) {
        // Treat ctr as big-endian 128-bit integer; increment by 1
        var c = ctr.slice();
        for (var i = c.length - 1; i >= 0; i--) {
            c[i] = (c[i] + 1) & 0xff;
            if (c[i] !== 0) break;
        }
        return c;
    }

    function modeCTR(input, keyBytes, iv, encrypt) {
        if (iv.length !== 16) throw new Error('CTR initial counter block must be 16 bytes (32 hex chars).');
        var ke = keyExpansion(keyBytes);
        var out = [];
        var counter = iv.slice();
        for (var i = 0; i < input.length; i += 16) {
            var n = Math.min(16, input.length - i);
            var keystream = encryptBlock(counter, keyBytes, ke);
            var blk = input.slice(i, i + n);
            out = out.concat(xorBlock(blk, keystream, n));
            counter = incrementCounter(counter);
        }
        return out;
    }

    function runMode(mode, input, keyBytes, iv, encrypt) {
        if (mode === 'ECB') return modeECB(input, keyBytes, encrypt);
        if (mode === 'CBC') return modeCBC(input, keyBytes, iv, encrypt);
        if (mode === 'CFB') return modeCFB(input, keyBytes, iv, encrypt);
        if (mode === 'OFB') return modeOFB(input, keyBytes, iv, encrypt);
        if (mode === 'CTR') return modeCTR(input, keyBytes, iv, encrypt);
        throw new Error('Unknown mode: ' + mode);
    }

    // ===================== UI Wiring =====================
    function getMode() { return document.getElementById('aes-mode').value; }
    function getKeyLen() { return parseInt(document.getElementById('aes-keysize').value, 10); }

    function updateIvVisibility() {
        var row = document.getElementById('aes-iv-row');
        row.style.display = (getMode() === 'ECB') ? 'none' : '';
    }
    document.getElementById('aes-mode').addEventListener('change', updateIvVisibility);
    updateIvVisibility();

    document.getElementById('aes-genkey').addEventListener('click', function () {
        var len = getKeyLen() / 8;
        document.getElementById('aes-key').value = bytesToHex(randomBytes(len));
        document.getElementById('aes-output').innerHTML = '<div class="result"><strong>Generated ' + getKeyLen() + '-bit key.</strong></div>';
    });

    document.getElementById('aes-geniv').addEventListener('click', function () {
        document.getElementById('aes-iv').value = bytesToHex(randomBytes(16));
        document.getElementById('aes-output').innerHTML = '<div class="result"><strong>Generated 128-bit IV / counter.</strong></div>';
    });

    function readInputs(decryptMode) {
        var mode = getMode();
        var keyLen = getKeyLen();
        var keyHex = document.getElementById('aes-key').value.trim().replace(/\s/g, '').toUpperCase();
        var ivHex = document.getElementById('aes-iv').value.trim().replace(/\s/g, '').toUpperCase();
        var input = document.getElementById('aes-input').value;

        if (!/^[0-9A-F]+$/.test(keyHex) || keyHex.length !== keyLen / 4) {
            throw new Error('Key must be ' + (keyLen / 4) + ' hex chars (' + keyLen + '-bit).');
        }
        var iv = [];
        if (mode !== 'ECB') {
            if (!/^[0-9A-F]{32}$/.test(ivHex)) throw new Error('IV must be exactly 32 hex chars (128-bit).');
            iv = hexToBytes(ivHex);
        }
        var keyBytes = hexToBytes(keyHex);

        var inputBytes;
        if (!input) throw new Error('Please enter ' + (decryptMode ? 'ciphertext (hex)' : 'plaintext (text)') + '.');
        if (decryptMode) {
            var clean = input.trim().replace(/\s/g, '').toUpperCase();
            if (!/^[0-9A-F]+$/.test(clean) || clean.length % 2 !== 0) throw new Error('Ciphertext must be hex (even length).');
            inputBytes = hexToBytes(clean);
        } else {
            inputBytes = strToBytes(input);
        }
        return { mode: mode, keyBytes: keyBytes, iv: iv, inputBytes: inputBytes, keyLen: keyLen };
    }

    document.getElementById('aes-encrypt').addEventListener('click', function () {
        var out = document.getElementById('aes-output');
        try {
            var args = readInputs(false);
            var ct = runMode(args.mode, args.inputBytes, args.keyBytes, args.iv, true);
            var html = '<div class="result"><strong>Ciphertext (AES-' + args.mode + ' ' + args.keyLen + '-bit, hex):</strong><br>'
                + '<span style="word-break:break-all;">' + bytesToHex(ct) + '</span></div>';
            if (args.mode !== 'ECB') {
                html += '<div style="margin-top:0.4rem;font-size:0.82rem;color:var(--text-dim);">IV used: ' + bytesToHex(args.iv) + '</div>';
            }
            html += '<div style="margin-top:0.3rem;font-size:0.82rem;color:var(--text-dim);">'
                + 'Plaintext bytes: ' + args.inputBytes.length + ', ciphertext bytes: ' + ct.length + '</div>';
            out.innerHTML = html;
        } catch (e) { showError(out, e.message); }
    });

    document.getElementById('aes-decrypt').addEventListener('click', function () {
        var out = document.getElementById('aes-output');
        try {
            var args = readInputs(true);
            var pt = runMode(args.mode, args.inputBytes, args.keyBytes, args.iv, false);
            var text = bytesToStr(pt);
            var html = '<div class="result"><strong>Plaintext (AES-' + args.mode + ' ' + args.keyLen + '-bit):</strong><br>'
                + escapeHtml(text) + '</div>'
                + '<div style="margin-top:0.4rem;font-size:0.82rem;color:var(--text-dim);">Hex: ' + bytesToHex(pt) + '</div>';
            out.innerHTML = html;
        } catch (e) { showError(out, 'Decryption failed: ' + e.message); }
    });

    // ===================== Step-by-step (Card 2) =====================
    function aesEncryptBlockSteps(plainBytes, keyBytes) {
        var ke = keyExpansion(keyBytes);
        var rounds = [];
        var state = addRoundKey(plainBytes, ke.roundKeys[0]);
        rounds.push({ round: 0, label: 'Initial AddRoundKey', state: state.slice(), roundKey: ke.roundKeys[0] });
        for (var r = 1; r < ke.Nr; r++) {
            var s1 = subBytes(state, SBOX);
            var s2 = shiftRows(s1);
            var s3 = mixColumns(s2);
            var s4 = addRoundKey(s3, ke.roundKeys[r]);
            rounds.push({ round: r, sub: s1.slice(), shift: s2.slice(), mix: s3.slice(), state: s4.slice(), roundKey: ke.roundKeys[r] });
            state = s4;
        }
        var sf1 = subBytes(state, SBOX);
        var sf2 = shiftRows(sf1);
        var sf4 = addRoundKey(sf2, ke.roundKeys[ke.Nr]);
        rounds.push({ round: ke.Nr, sub: sf1.slice(), shift: sf2.slice(), state: sf4.slice(), roundKey: ke.roundKeys[ke.Nr], final: true });
        state = sf4;
        return { result: state, rounds: rounds, roundKeys: ke.roundKeys, Nr: ke.Nr };
    }

    function aesDecryptBlockSteps(cipherBytes, keyBytes) {
        var ke = keyExpansion(keyBytes);
        var rounds = [];
        var state = addRoundKey(cipherBytes, ke.roundKeys[ke.Nr]);
        rounds.push({ round: 0, label: 'Initial AddRoundKey (with K_' + ke.Nr + ')', state: state.slice(), roundKey: ke.roundKeys[ke.Nr] });
        for (var r = ke.Nr - 1; r >= 1; r--) {
            var s1 = invShiftRows(state);
            var s2 = subBytes(s1, INV_SBOX);
            var s3 = addRoundKey(s2, ke.roundKeys[r]);
            var s4 = invMixColumns(s3);
            rounds.push({ round: ke.Nr - r, invShift: s1.slice(), invSub: s2.slice(), addKey: s3.slice(), state: s4.slice(), roundKey: ke.roundKeys[r] });
            state = s4;
        }
        var sf1 = invShiftRows(state);
        var sf2 = subBytes(sf1, INV_SBOX);
        var sf3 = addRoundKey(sf2, ke.roundKeys[0]);
        rounds.push({ round: ke.Nr, invShift: sf1.slice(), invSub: sf2.slice(), state: sf3.slice(), roundKey: ke.roundKeys[0], final: true });
        state = sf3;
        return { result: state, rounds: rounds, roundKeys: ke.roundKeys, Nr: ke.Nr };
    }

    function renderState(bytes) {
        var html = '<div class="matrix-display" style="grid-template-columns:repeat(4,auto);">';
        for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
            var val = bytes[r + 4*c];
            html += '<span>' + (val < 16 ? '0' : '') + val.toString(16).toUpperCase() + '</span>';
        }
        html += '</div>';
        return html;
    }

    function runStep(decrypt) {
        var plainHex = document.getElementById('aes-step-plain').value.trim().toUpperCase().replace(/\s/g, '');
        var keyHex = document.getElementById('aes-step-key').value.trim().toUpperCase().replace(/\s/g, '');
        var keyLen = parseInt(document.getElementById('aes-step-keysize').value, 10);
        var out = document.getElementById('aes-step-output');

        if (!/^[0-9A-F]{32}$/.test(plainHex)) { showError(out, 'Input must be exactly 32 hex characters (128 bits).'); return; }
        var expectedKeyHex = keyLen / 4;
        if (keyHex.length !== expectedKeyHex || !/^[0-9A-F]+$/.test(keyHex)) {
            showError(out, 'Key must be exactly ' + expectedKeyHex + ' hex characters for ' + keyLen + '-bit AES.');
            return;
        }

        var plainBytes = hexToBytes(plainHex);
        var keyBytes = hexToBytes(keyHex);
        var res = decrypt ? aesDecryptBlockSteps(plainBytes, keyBytes) : aesEncryptBlockSteps(plainBytes, keyBytes);
        var resultHex = bytesToHex(res.result);

        var html = '';
        html += decrypt
            ? '<div class="result"><strong>Plaintext:</strong> ' + resultHex + '</div>'
            : '<div class="result"><strong>Ciphertext:</strong> ' + resultHex + '</div>';

        html += '<div style="margin-top:1rem;"><strong>Round Keys (Key Expansion):</strong></div>';
        html += '<table class="step-table"><tr><th>Round</th><th>Key (32 hex chars)</th></tr>';
        for (var i = 0; i < res.roundKeys.length; i++) {
            html += '<tr><td>K<sub>' + i + '</sub></td><td style="font-size:0.78rem;">' + bytesToHex(res.roundKeys[i]) + '</td></tr>';
        }
        html += '</table>';

        html += '<div style="margin-top:1rem;"><strong>' + (decrypt ? 'Decryption' : 'Encryption') + ' Rounds:</strong></div>';

        if (!decrypt) {
            html += '<table class="step-table"><tr><th>Round</th><th>SubBytes</th><th>ShiftRows</th><th>MixColumns</th><th>AddRoundKey (state)</th></tr>';
            for (var i = 0; i < res.rounds.length; i++) {
                var s = res.rounds[i];
                if (i === 0) {
                    html += '<tr><td>0 (init)</td><td colspan="3" style="color:var(--text-dim);">— (input XOR K<sub>0</sub>)</td><td style="font-size:0.78rem;">' + bytesToHex(s.state) + '</td></tr>';
                } else if (s.final) {
                    html += '<tr><td>' + s.round + ' (final)</td><td style="font-size:0.78rem;">' + bytesToHex(s.sub) + '</td><td style="font-size:0.78rem;">' + bytesToHex(s.shift) + '</td><td style="color:var(--text-dim);">— (skipped)</td><td style="font-size:0.78rem;">' + bytesToHex(s.state) + '</td></tr>';
                } else {
                    html += '<tr><td>' + s.round + '</td><td style="font-size:0.78rem;">' + bytesToHex(s.sub) + '</td><td style="font-size:0.78rem;">' + bytesToHex(s.shift) + '</td><td style="font-size:0.78rem;">' + bytesToHex(s.mix) + '</td><td style="font-size:0.78rem;">' + bytesToHex(s.state) + '</td></tr>';
                }
            }
            html += '</table>';
        } else {
            html += '<table class="step-table"><tr><th>Step</th><th>InvShiftRows</th><th>InvSubBytes</th><th>AddRoundKey</th><th>InvMixColumns (state)</th></tr>';
            for (var i = 0; i < res.rounds.length; i++) {
                var s = res.rounds[i];
                if (i === 0) {
                    html += '<tr><td>0 (init)</td><td colspan="3" style="color:var(--text-dim);">— (input XOR K<sub>' + res.Nr + '</sub>)</td><td style="font-size:0.78rem;">' + bytesToHex(s.state) + '</td></tr>';
                } else if (s.final) {
                    html += '<tr><td>' + s.round + ' (final)</td><td style="font-size:0.78rem;">' + bytesToHex(s.invShift) + '</td><td style="font-size:0.78rem;">' + bytesToHex(s.invSub) + '</td><td style="font-size:0.78rem;">' + bytesToHex(s.state) + '</td><td style="color:var(--text-dim);">— (skipped)</td></tr>';
                } else {
                    html += '<tr><td>' + s.round + '</td><td style="font-size:0.78rem;">' + bytesToHex(s.invShift) + '</td><td style="font-size:0.78rem;">' + bytesToHex(s.invSub) + '</td><td style="font-size:0.78rem;">' + bytesToHex(s.addKey) + '</td><td style="font-size:0.78rem;">' + bytesToHex(s.state) + '</td></tr>';
                }
            }
            html += '</table>';
        }

        html += '<div style="margin-top:1rem;"><strong>Final state (4×4 byte matrix, column-major):</strong></div>';
        html += renderState(res.result);

        out.innerHTML = html;
    }

    document.getElementById('aes-step-encrypt').addEventListener('click', function () { runStep(false); });
    document.getElementById('aes-step-decrypt').addEventListener('click', function () { runStep(true); });
}
