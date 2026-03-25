function toolInit(container) {
    container.innerHTML = '<div class="tool-card">'
        + '<h2>Substitution Cipher</h2>'
        + '<p class="description">Encrypt or decrypt text using a monoalphabetic substitution cipher. Each letter of the alphabet is replaced by a corresponding letter from a 26-letter substitution alphabet. Use the Random button to generate a random permutation.</p>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="sub-text">Text</label><textarea id="sub-text" rows="3" placeholder="Enter plaintext or ciphertext...">HELLO WORLD</textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="sub-alpha">Substitution Alphabet (26 letters)</label><input type="text" id="sub-alpha" value="ZEBRASCDFGHIJKLMNOPQTUVWXY" maxlength="26" placeholder="Enter 26 unique letters..."></div>'
        + '<div class="btn-row">'
        + '<button class="btn btn-accent" id="sub-random">Random</button>'
        + '<button class="btn" id="sub-encrypt">Encrypt</button>'
        + '<button class="btn btn-secondary" id="sub-decrypt">Decrypt</button>'
        + '</div>'
        + '</div>'
        + '<div class="output-area" id="sub-output"></div>'
        + '</div>';

    function validateAlphabet(alpha) {
        if (alpha.length !== 26) return 'Substitution alphabet must be exactly 26 letters.';
        var seen = {};
        for (var i = 0; i < 26; i++) {
            var ch = alpha[i];
            if (ch < 'A' || ch > 'Z') return 'Substitution alphabet must contain only uppercase letters A\u2013Z.';
            if (seen[ch]) return 'Duplicate letter "' + ch + '" in substitution alphabet. Each letter must appear exactly once.';
            seen[ch] = true;
        }
        return null;
    }

    function buildMapping(alpha) {
        var encryptMap = {};
        var decryptMap = {};
        for (var i = 0; i < 26; i++) {
            var plain = String.fromCharCode(65 + i);
            var cipher = alpha[i];
            encryptMap[plain] = cipher;
            decryptMap[cipher] = plain;
        }
        return { encrypt: encryptMap, decrypt: decryptMap };
    }

    function applyMapping(text, map) {
        var result = '';
        for (var i = 0; i < text.length; i++) {
            var ch = text[i];
            if (ch >= 'A' && ch <= 'Z') {
                result += map[ch];
            } else if (ch >= 'a' && ch <= 'z') {
                var mapped = map[ch.toUpperCase()];
                result += mapped.toLowerCase();
            } else {
                result += ch;
            }
        }
        return result;
    }

    function buildMappingTable(alpha) {
        var html = '<table class="step-table"><tr><th>Plain</th>';
        for (var i = 0; i < 26; i++) {
            html += '<td>' + String.fromCharCode(65 + i) + '</td>';
        }
        html += '</tr><tr><th>Cipher</th>';
        for (var i = 0; i < 26; i++) {
            html += '<td>' + alpha[i] + '</td>';
        }
        html += '</tr></table>';
        return html;
    }

    function shuffleAlphabet() {
        var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        for (var i = letters.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = letters[i];
            letters[i] = letters[j];
            letters[j] = temp;
        }
        return letters.join('');
    }

    document.getElementById('sub-random').addEventListener('click', function () {
        document.getElementById('sub-alpha').value = shuffleAlphabet();
    });

    document.getElementById('sub-encrypt').addEventListener('click', function () {
        var text = document.getElementById('sub-text').value;
        var alpha = document.getElementById('sub-alpha').value.toUpperCase();
        var out = document.getElementById('sub-output');

        if (!text.trim()) { showError(out, 'Please enter some text.'); return; }
        var err = validateAlphabet(alpha);
        if (err) { showError(out, err); return; }

        document.getElementById('sub-alpha').value = alpha;
        var maps = buildMapping(alpha);
        var encrypted = applyMapping(text, maps.encrypt);
        var html = '<div class="result"><strong>Ciphertext:</strong><br>' + escapeHtml(encrypted) + '</div>';
        html += buildMappingTable(alpha);
        out.innerHTML = html;
    });

    document.getElementById('sub-decrypt').addEventListener('click', function () {
        var text = document.getElementById('sub-text').value;
        var alpha = document.getElementById('sub-alpha').value.toUpperCase();
        var out = document.getElementById('sub-output');

        if (!text.trim()) { showError(out, 'Please enter some text.'); return; }
        var err = validateAlphabet(alpha);
        if (err) { showError(out, err); return; }

        document.getElementById('sub-alpha').value = alpha;
        var maps = buildMapping(alpha);
        var decrypted = applyMapping(text, maps.decrypt);
        var html = '<div class="result"><strong>Plaintext:</strong><br>' + escapeHtml(decrypted) + '</div>';
        html += buildMappingTable(alpha);
        out.innerHTML = html;
    });
}
