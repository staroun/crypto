function toolInit(container) {
    container.innerHTML = '<div class="tool-card">'
        + '<h2>DES (Data Encryption Standard)</h2>'
        + '<p class="description">Encrypt or decrypt a single 64-bit block using DES. Enter plaintext and key as 16 hex characters (8 bytes) each. Shows the full internal process: Initial Permutation, 16 Feistel rounds with key schedule, and Final Permutation.</p>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="des-plain">Plaintext / Ciphertext (16 hex chars)</label>'
        + '<input type="text" id="des-plain" value="0123456789ABCDEF" placeholder="e.g. 0123456789ABCDEF" maxlength="16"></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="des-key">Key (16 hex chars)</label>'
        + '<input type="text" id="des-key" value="133457799BBCDFF1" placeholder="e.g. 133457799BBCDFF1" maxlength="16"></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="btn-row">'
        + '<button class="btn" id="des-encrypt">Encrypt</button>'
        + '<button class="btn btn-secondary" id="des-decrypt">Decrypt</button>'
        + '</div>'
        + '</div>'
        + '<div class="output-area" id="des-output"></div>'
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

    function formatBits(bits, groupSize) {
        if (!groupSize) return bits.join('');
        var s = '';
        for (var i = 0; i < bits.length; i++) {
            if (i > 0 && i % groupSize === 0) s += ' ';
            s += bits[i];
        }
        return s;
    }

    // ===== Key Schedule =====
    function generateSubkeys(keyBits) {
        var steps = [];
        var pc1 = permute(keyBits, PC1);
        steps.push({ label: 'PC-1 (56 bits)', bits: pc1 });

        var C = pc1.slice(0, 28);
        var D = pc1.slice(28, 56);
        var subkeys = [];

        for (var i = 0; i < 16; i++) {
            C = leftShift(C, SHIFTS[i]);
            D = leftShift(D, SHIFTS[i]);
            var cd = C.concat(D);
            var subkey = permute(cd, PC2);
            subkeys.push(subkey);
            steps.push({
                round: i + 1,
                shift: SHIFTS[i],
                C: C.slice(),
                D: D.slice(),
                subkey: subkey
            });
        }
        return { subkeys: subkeys, steps: steps };
    }

    // ===== Feistel function =====
    function feistel(R, subkey) {
        var expanded = permute(R, E);
        var xored = xorBits(expanded, subkey);

        // S-box substitution
        var sOut = [];
        for (var i = 0; i < 8; i++) {
            var chunk = xored.slice(i * 6, i * 6 + 6);
            var row = (chunk[0] << 1) | chunk[5];
            var col = (chunk[1] << 3) | (chunk[2] << 2) | (chunk[3] << 1) | chunk[4];
            var val = SBOX[i][row][col];
            for (var b = 3; b >= 0; b--) sOut.push((val >> b) & 1);
        }

        var pOut = permute(sOut, P);
        return { result: pOut, expanded: expanded, xored: xored, sOut: sOut };
    }

    // ===== DES core =====
    function desProcess(plainBits, keyBits, decrypt) {
        var roundSteps = [];

        // Initial Permutation
        var ip = permute(plainBits, IP);
        var L = ip.slice(0, 32);
        var R = ip.slice(32, 64);
        roundSteps.push({ label: 'Initial Permutation', L: L.slice(), R: R.slice() });

        // Generate subkeys
        var ks = generateSubkeys(keyBits);
        var subkeys = ks.subkeys;
        if (decrypt) subkeys = subkeys.slice().reverse();

        // 16 rounds
        for (var i = 0; i < 16; i++) {
            var f = feistel(R, subkeys[i]);
            var newR = xorBits(L, f.result);
            var oldL = L, oldR = R;
            L = R;
            R = newR;
            roundSteps.push({
                round: i + 1,
                keyIndex: decrypt ? 15 - i : i,
                subkey: subkeys[i],
                oldL: oldL,
                oldR: oldR,
                expanded: f.expanded,
                xored: f.xored,
                sOut: f.sOut,
                fResult: f.result,
                newL: L.slice(),
                newR: R.slice()
            });
        }

        // Final swap + Final Permutation
        var combined = R.concat(L); // swap before FP
        var result = permute(combined, FP);
        roundSteps.push({ label: 'Final Permutation', bits: result });

        return { result: result, roundSteps: roundSteps, keySteps: ks.steps };
    }

    // ===== Render =====
    function runDES(decrypt) {
        var plainHex = document.getElementById('des-plain').value.trim().toUpperCase().replace(/\s/g, '');
        var keyHex = document.getElementById('des-key').value.trim().toUpperCase().replace(/\s/g, '');
        var out = document.getElementById('des-output');

        if (!/^[0-9A-F]{16}$/.test(plainHex)) { showError(out, 'Input must be exactly 16 hex characters (64 bits).'); return; }
        if (!/^[0-9A-F]{16}$/.test(keyHex)) { showError(out, 'Key must be exactly 16 hex characters (64 bits).'); return; }

        var plainBits = hexToBits(plainHex);
        var keyBits = hexToBits(keyHex);
        var res = desProcess(plainBits, keyBits, decrypt);
        var resultHex = bitsToHex(res.result);

        var html = '';

        // Result summary
        if (decrypt) {
            html += '<div class="result"><strong>Plaintext:</strong> ' + resultHex + '</div>';
        } else {
            html += '<div class="result"><strong>Ciphertext:</strong> ' + resultHex + '</div>';
        }

        // Key Schedule
        html += '<div class="tool-card" style="margin-top:1rem;padding:1rem;">'
            + '<h3>Key Schedule</h3>'
            + '<div style="margin-bottom:0.5rem;color:var(--text-dim);font-size:0.85rem;">Key: ' + keyHex + ' &rarr; ' + formatBits(keyBits, 8) + '</div>';

        var pc1Step = res.keySteps[0];
        html += '<div style="margin-bottom:0.5rem;color:var(--text-dim);font-size:0.85rem;">' + pc1Step.label + ': ' + formatBits(pc1Step.bits, 7) + '</div>';

        html += '<table class="step-table"><tr><th>Round</th><th>Shift</th><th>C<sub>i</sub> (28 bits)</th><th>D<sub>i</sub> (28 bits)</th><th>K<sub>i</sub> (48 bits)</th></tr>';
        for (var i = 1; i < res.keySteps.length; i++) {
            var ks = res.keySteps[i];
            html += '<tr><td>' + ks.round + '</td><td>' + ks.shift + '</td><td style="font-size:0.75rem;">' + formatBits(ks.C, 7) + '</td><td style="font-size:0.75rem;">' + formatBits(ks.D, 7) + '</td><td style="font-size:0.75rem;">' + formatBits(ks.subkey, 6) + '</td></tr>';
        }
        html += '</table></div>';

        // Rounds
        html += '<div class="tool-card" style="margin-top:1rem;padding:1rem;">'
            + '<h3>Feistel Rounds</h3>';

        var ipStep = res.roundSteps[0];
        html += '<div style="margin-bottom:0.5rem;color:var(--text-dim);font-size:0.85rem;">' + (decrypt ? 'Ciphertext' : 'Plaintext') + ': ' + plainHex + '</div>';
        html += '<div style="margin-bottom:0.8rem;color:var(--text-dim);font-size:0.85rem;">' + ipStep.label + ' &rarr; L<sub>0</sub>: ' + bitsToHex(ipStep.L) + ' &ensp; R<sub>0</sub>: ' + bitsToHex(ipStep.R) + '</div>';

        html += '<table class="step-table"><tr><th>Round</th><th>K<sub>i</sub></th><th>L<sub>i</sub></th><th>R<sub>i</sub></th><th>f(R, K)</th></tr>';
        for (var i = 1; i <= 16; i++) {
            var step = res.roundSteps[i];
            html += '<tr><td>' + step.round + '</td><td style="font-size:0.75rem;">' + bitsToHex(step.subkey) + '</td><td>' + bitsToHex(step.newL) + '</td><td>' + bitsToHex(step.newR) + '</td><td>' + bitsToHex(step.fResult) + '</td></tr>';
        }
        html += '</table>';

        var fpStep = res.roundSteps[17];
        html += '<div style="margin-top:0.5rem;color:var(--text-dim);font-size:0.85rem;">' + fpStep.label + ' &rarr; ' + bitsToHex(fpStep.bits) + '</div>';
        html += '</div>';

        out.innerHTML = html;
    }

    document.getElementById('des-encrypt').addEventListener('click', function () { runDES(false); });
    document.getElementById('des-decrypt').addEventListener('click', function () { runDES(true); });
}
