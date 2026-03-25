function toolInit(container) {
    container.innerHTML = '<div class="tool-card">'
        + '<h2>Multiplicative Cipher</h2>'
        + '<p class="description">Encrypt or decrypt text using the Multiplicative cipher. Each letter x is transformed by E(x) = (a &times; x) mod 26. The key <em>a</em> must be coprime to 26 (valid keys: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25).</p>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="mult-text">Text</label><textarea id="mult-text" rows="3" placeholder="Enter plaintext or ciphertext...">HELLO WORLD</textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group"><label for="mult-key">Key a (coprime to 26)</label><input type="number" id="mult-key" value="7" min="1" max="25"></div>'
        + '<div class="btn-row">'
        + '<button class="btn" id="mult-encrypt">Encrypt</button>'
        + '<button class="btn btn-secondary" id="mult-decrypt">Decrypt</button>'
        + '<button class="btn btn-accent" id="mult-brute">Brute Force</button>'
        + '</div>'
        + '</div>'
        + '<div class="output-area" id="mult-output"></div>'
        + '</div>';

    var validKeys = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];

    function modInv26(a) {
        for (var i = 1; i < 26; i++) {
            if ((a * i) % 26 === 1) return i;
        }
        return null;
    }

    function multCipher(text, a) {
        var result = '';
        for (var i = 0; i < text.length; i++) {
            var ch = text[i];
            if (ch >= 'A' && ch <= 'Z') {
                result += String.fromCharCode((a * (ch.charCodeAt(0) - 65)) % 26 + 65);
            } else if (ch >= 'a' && ch <= 'z') {
                result += String.fromCharCode((a * (ch.charCodeAt(0) - 97)) % 26 + 97);
            } else {
                result += ch;
            }
        }
        return result;
    }

    function buildStepTable(text, a, decrypt) {
        var aInv = decrypt ? modInv26(a) : null;
        var key = decrypt ? aInv : a;
        var html = '<table class="step-table"><tr><th>Char</th><th>x</th><th>' + (decrypt ? 'a\u207B\u00B9 \u00D7 x' : 'a \u00D7 x') + '</th><th>mod 26</th><th>Result</th></tr>';
        for (var i = 0; i < text.length; i++) {
            var ch = text[i];
            var upper = ch.toUpperCase();
            if (upper >= 'A' && upper <= 'Z') {
                var x = upper.charCodeAt(0) - 65;
                var product = key * x;
                var mod = product % 26;
                var res = String.fromCharCode(mod + 65);
                if (ch >= 'a' && ch <= 'z') res = res.toLowerCase();
                html += '<tr><td>' + escapeHtml(ch) + '</td><td>' + x + '</td><td>' + key + ' \u00D7 ' + x + ' = ' + product + '</td><td>' + mod + '</td><td>' + escapeHtml(res) + '</td></tr>';
            }
        }
        html += '</table>';
        return html;
    }

    document.getElementById('mult-encrypt').addEventListener('click', function () {
        var text = document.getElementById('mult-text').value;
        var a = parseInt(document.getElementById('mult-key').value, 10);
        var out = document.getElementById('mult-output');

        if (!text.trim()) { showError(out, 'Please enter some text.'); return; }
        if (validKeys.indexOf(a) === -1) { showError(out, 'Key a must be coprime to 26. Valid keys: ' + validKeys.join(', ')); return; }

        var encrypted = multCipher(text, a);
        var html = '<div class="result"><strong>Ciphertext (a = ' + a + '):</strong><br>' + escapeHtml(encrypted) + '</div>';
        html += buildStepTable(text, a, false);
        out.innerHTML = html;
    });

    document.getElementById('mult-decrypt').addEventListener('click', function () {
        var text = document.getElementById('mult-text').value;
        var a = parseInt(document.getElementById('mult-key').value, 10);
        var out = document.getElementById('mult-output');

        if (!text.trim()) { showError(out, 'Please enter some text.'); return; }
        if (validKeys.indexOf(a) === -1) { showError(out, 'Key a must be coprime to 26. Valid keys: ' + validKeys.join(', ')); return; }

        var aInv = modInv26(a);
        var decrypted = multCipher(text, aInv);
        var html = '<div class="result"><strong>Plaintext (a = ' + a + ', a\u207B\u00B9 = ' + aInv + '):</strong><br>' + escapeHtml(decrypted) + '</div>';
        html += buildStepTable(text, a, true);
        out.innerHTML = html;
    });

    document.getElementById('mult-brute').addEventListener('click', function () {
        var text = document.getElementById('mult-text').value;
        var out = document.getElementById('mult-output');

        if (!text.trim()) { showError(out, 'Please enter some text.'); return; }

        var html = '<table class="step-table"><tr><th>a</th><th>a\u207B\u00B9</th><th>Result</th></tr>';
        for (var i = 0; i < validKeys.length; i++) {
            var a = validKeys[i];
            var aInv = modInv26(a);
            var result = multCipher(text, aInv);
            html += '<tr><td>' + a + '</td><td>' + aInv + '</td><td>' + escapeHtml(result) + '</td></tr>';
        }
        html += '</table>';
        out.innerHTML = html;
    });
}
