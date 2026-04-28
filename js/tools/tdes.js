function toolInit(container) {
    container.innerHTML = '<div class="tool-card">'
        + '<h2>3DES (Triple DES)</h2>'
        + '<p class="description">Encrypt or decrypt a 64-bit block using Triple DES in EDE (Encrypt-Decrypt-Encrypt) mode. '
        + 'Encryption: C = E<sub>K3</sub>(D<sub>K2</sub>(E<sub>K1</sub>(P))) &emsp; Decryption: P = D<sub>K1</sub>(E<sub>K2</sub>(D<sub>K3</sub>(C))). '
        + '2-key mode sets K3 = K1 (effective 112-bit), 3-key mode uses three independent keys (effective 168-bit).</p>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="tdes-plain">Plaintext / Ciphertext (16 hex chars)</label>'
        + '<input type="text" id="tdes-plain" value="0123456789ABCDEF" placeholder="e.g. 0123456789ABCDEF" maxlength="16"></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group"><label for="tdes-mode">Mode</label>'
        + '<select id="tdes-mode"><option value="3" selected>3-key EDE (K1, K2, K3)</option><option value="2">2-key EDE (K3 = K1)</option></select></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="tdes-k1">K1 (16 hex chars)</label>'
        + '<input type="text" id="tdes-k1" value="0123456789ABCDEF" maxlength="16"></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="tdes-k2">K2 (16 hex chars)</label>'
        + '<input type="text" id="tdes-k2" value="23456789ABCDEF01" maxlength="16"></div>'
        + '</div>'
        + '<div class="input-row" id="tdes-k3-row">'
        + '<div class="input-group flex-grow"><label for="tdes-k3">K3 (16 hex chars)</label>'
        + '<input type="text" id="tdes-k3" value="456789ABCDEF0123" maxlength="16"></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="btn-row">'
        + '<button class="btn" id="tdes-encrypt">Encrypt</button>'
        + '<button class="btn btn-secondary" id="tdes-decrypt">Decrypt</button>'
        + '</div>'
        + '</div>'
        + '<div class="output-area" id="tdes-output"></div>'
        + '</div>';

    // ===== DES Tables =====
    var IP = [58,50,42,34,26,18,10,2,60,52,44,36,28,20,12,4,62,54,46,38,30,22,14,6,64,56,48,40,32,24,16,8,57,49,41,33,25,17,9,1,59,51,43,35,27,19,11,3,61,53,45,37,29,21,13,5,63,55,47,39,31,23,15,7];
    var FP = [40,8,48,16,56,24,64,32,39,7,47,15,55,23,63,31,38,6,46,14,54,22,62,30,37,5,45,13,53,21,61,29,36,4,44,12,52,20,60,28,35,3,43,11,51,19,59,27,34,2,42,10,50,18,58,26,33,1,41,9,49,17,57,25];
    var E = [32,1,2,3,4,5,4,5,6,7,8,9,8,9,10,11,12,13,12,13,14,15,16,17,16,17,18,19,20,21,20,21,22,23,24,25,24,25,26,27,28,29,28,29,30,31,32,1];
    var P = [16,7,20,21,29,12,28,17,1,15,23,26,5,18,31,10,2,8,24,14,32,27,3,9,19,13,30,6,22,11,4,25];
    var PC1 = [57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4];
    var PC2 = [14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32];
    var SHIFTS = [1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1];

    var SBOX = [
        [[14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7],[0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8],[4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0],[15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13]],
        [[15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10],[3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5],[0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15],[13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9]],
        [[10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8],[13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1],[13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7],[1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12]],
        [[7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15],[13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9],[10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4],[3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14]],
        [[2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9],[14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6],[4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14],[11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3]],
        [[12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11],[10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8],[9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6],[4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13]],
        [[4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1],[13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6],[1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2],[6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12]],
        [[13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7],[1,15,13,8,10,3,7,4,12,5,6,2,0,14,9,11],[7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8],[2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11]]
    ];

    // ===== Bit helpers =====
    function hexToBits(hex) {
        var bits = [];
        for (var i = 0; i < hex.length; i++) {
            var n = parseInt(hex[i], 16);
            for (var b = 3; b >= 0; b--) bits.push((n >> b) & 1);
        }
        return bits;
    }

    function bitsToHex(bits) {
        var hex = '';
        for (var i = 0; i < bits.length; i += 4) {
            var n = (bits[i] << 3) | (bits[i+1] << 2) | (bits[i+2] << 1) | bits[i+3];
            hex += n.toString(16).toUpperCase();
        }
        return hex;
    }

    function permute(bits, table) {
        var out = [];
        for (var i = 0; i < table.length; i++) out.push(bits[table[i] - 1]);
        return out;
    }

    function xorBits(a, b) {
        var out = [];
        for (var i = 0; i < a.length; i++) out.push(a[i] ^ b[i]);
        return out;
    }

    function leftShift(bits, n) {
        return bits.slice(n).concat(bits.slice(0, n));
    }

    // ===== Key Schedule =====
    function generateSubkeys(keyBits) {
        var pc1 = permute(keyBits, PC1);
        var C = pc1.slice(0, 28);
        var D = pc1.slice(28, 56);
        var subkeys = [];
        for (var i = 0; i < 16; i++) {
            C = leftShift(C, SHIFTS[i]);
            D = leftShift(D, SHIFTS[i]);
            subkeys.push(permute(C.concat(D), PC2));
        }
        return subkeys;
    }

    // ===== Feistel function =====
    function feistel(R, subkey) {
        var expanded = permute(R, E);
        var xored = xorBits(expanded, subkey);
        var sOut = [];
        for (var i = 0; i < 8; i++) {
            var chunk = xored.slice(i * 6, i * 6 + 6);
            var row = (chunk[0] << 1) | chunk[5];
            var col = (chunk[1] << 3) | (chunk[2] << 2) | (chunk[3] << 1) | chunk[4];
            var val = SBOX[i][row][col];
            for (var b = 3; b >= 0; b--) sOut.push((val >> b) & 1);
        }
        return permute(sOut, P);
    }

    // ===== DES core (single block) =====
    function desBlock(plainBits, keyBits, decrypt) {
        var ip = permute(plainBits, IP);
        var L = ip.slice(0, 32);
        var R = ip.slice(32, 64);

        var subkeys = generateSubkeys(keyBits);
        if (decrypt) subkeys = subkeys.slice().reverse();

        for (var i = 0; i < 16; i++) {
            var fOut = feistel(R, subkeys[i]);
            var newR = xorBits(L, fOut);
            L = R;
            R = newR;
        }

        var combined = R.concat(L);
        return permute(combined, FP);
    }

    // ===== UI: hide K3 in 2-key mode =====
    function updateK3Visibility() {
        var mode = document.getElementById('tdes-mode').value;
        var row = document.getElementById('tdes-k3-row');
        if (mode === '2') {
            row.style.display = 'none';
        } else {
            row.style.display = '';
        }
    }
    document.getElementById('tdes-mode').addEventListener('change', updateK3Visibility);
    updateK3Visibility();

    // ===== 3DES Process =====
    function run3DES(decrypt) {
        var plainHex = document.getElementById('tdes-plain').value.trim().toUpperCase().replace(/\s/g, '');
        var k1Hex = document.getElementById('tdes-k1').value.trim().toUpperCase().replace(/\s/g, '');
        var k2Hex = document.getElementById('tdes-k2').value.trim().toUpperCase().replace(/\s/g, '');
        var mode = document.getElementById('tdes-mode').value;
        var k3Hex = (mode === '2') ? k1Hex : document.getElementById('tdes-k3').value.trim().toUpperCase().replace(/\s/g, '');
        var out = document.getElementById('tdes-output');

        if (!/^[0-9A-F]{16}$/.test(plainHex)) { showError(out, 'Input must be exactly 16 hex characters (64 bits).'); return; }
        if (!/^[0-9A-F]{16}$/.test(k1Hex)) { showError(out, 'K1 must be exactly 16 hex characters.'); return; }
        if (!/^[0-9A-F]{16}$/.test(k2Hex)) { showError(out, 'K2 must be exactly 16 hex characters.'); return; }
        if (mode === '3' && !/^[0-9A-F]{16}$/.test(k3Hex)) { showError(out, 'K3 must be exactly 16 hex characters.'); return; }

        var plainBits = hexToBits(plainHex);
        var k1Bits = hexToBits(k1Hex);
        var k2Bits = hexToBits(k2Hex);
        var k3Bits = hexToBits(k3Hex);

        // EDE chain
        // Encrypt: E_K3(D_K2(E_K1(P)))
        // Decrypt: D_K1(E_K2(D_K3(C)))
        var stages;
        if (!decrypt) {
            stages = [
                { label: 'Stage 1: Eₖ₁ (encrypt with K1)', key: k1Bits, keyHex: k1Hex, decrypt: false },
                { label: 'Stage 2: Dₖ₂ (decrypt with K2)', key: k2Bits, keyHex: k2Hex, decrypt: true },
                { label: 'Stage 3: Eₖ₃ (encrypt with K3)', key: k3Bits, keyHex: k3Hex, decrypt: false }
            ];
        } else {
            stages = [
                { label: 'Stage 1: Dₖ₃ (decrypt with K3)', key: k3Bits, keyHex: k3Hex, decrypt: true },
                { label: 'Stage 2: Eₖ₂ (encrypt with K2)', key: k2Bits, keyHex: k2Hex, decrypt: false },
                { label: 'Stage 3: Dₖ₁ (decrypt with K1)', key: k1Bits, keyHex: k1Hex, decrypt: true }
            ];
        }

        var current = plainBits;
        var stageResults = [];
        for (var i = 0; i < 3; i++) {
            var input = current;
            current = desBlock(input, stages[i].key, stages[i].decrypt);
            stageResults.push({
                label: stages[i].label,
                keyHex: stages[i].keyHex,
                inputHex: bitsToHex(input),
                outputHex: bitsToHex(current)
            });
        }
        var resultHex = bitsToHex(current);

        var html = '';
        if (decrypt) {
            html += '<div class="result"><strong>Plaintext:</strong> ' + resultHex + '</div>';
        } else {
            html += '<div class="result"><strong>Ciphertext:</strong> ' + resultHex + '</div>';
        }

        // Mode summary
        var modeLabel = (mode === '2') ? '2-key EDE (K3 = K1)' : '3-key EDE';
        html += '<div style="margin:0.8rem 0 0.4rem;color:var(--text-dim);font-size:0.85rem;">'
            + '<strong>Mode:</strong> ' + modeLabel + '<br>'
            + '<strong>K1:</strong> ' + k1Hex + '<br>'
            + '<strong>K2:</strong> ' + k2Hex + '<br>'
            + '<strong>K3:</strong> ' + k3Hex + (mode === '2' ? ' (= K1)' : '') + '</div>';

        // Stage table
        html += '<table class="step-table"><tr><th>Stage</th><th>Operation</th><th>Key</th><th>Input</th><th>Output</th></tr>';
        for (var i = 0; i < stageResults.length; i++) {
            var s = stageResults[i];
            html += '<tr><td>' + (i + 1) + '</td><td>' + s.label + '</td><td>' + s.keyHex + '</td><td>' + s.inputHex + '</td><td>' + s.outputHex + '</td></tr>';
        }
        html += '</table>';

        // Formula
        var formula = decrypt
            ? 'P = D<sub>K1</sub>(E<sub>K2</sub>(D<sub>K3</sub>(C)))'
            : 'C = E<sub>K3</sub>(D<sub>K2</sub>(E<sub>K1</sub>(P)))';
        html += '<div style="margin-top:0.5rem;color:var(--text-dim);font-size:0.85rem;">Formula: ' + formula + '</div>';

        out.innerHTML = html;
    }

    document.getElementById('tdes-encrypt').addEventListener('click', function () { run3DES(false); });
    document.getElementById('tdes-decrypt').addEventListener('click', function () { run3DES(true); });
}
