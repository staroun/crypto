function toolInit(container) {
    container.innerHTML = '<div class="tool-card">'
        + '<h2>Affine Cipher</h2>'
        + '<p class="description">Encrypt or decrypt text using the Affine cipher. Each letter x is transformed by E(x) = (a &times; x + b) mod 26, and decrypted by D(y) = a<sup>&minus;1</sup> &times; (y &minus; b) mod 26. The key <em>a</em> must be coprime to 26.</p>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="affine-text">Text</label><textarea id="affine-text" rows="3" placeholder="Enter plaintext or ciphertext...">HELLO WORLD</textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group"><label for="affine-a">Key a (coprime to 26)</label><input type="number" id="affine-a" value="7" min="1" max="25"></div>'
        + '<div class="input-group"><label for="affine-b">Key b (0&ndash;25)</label><input type="number" id="affine-b" value="3" min="0" max="25"></div>'
        + '<div class="btn-row">'
        + '<button class="btn" id="affine-encrypt">Encrypt</button>'
        + '<button class="btn btn-secondary" id="affine-decrypt">Decrypt</button>'
        + '<button class="btn btn-accent" id="affine-brute">Brute Force</button>'
        + '</div>'
        + '</div>'
        + '<div class="output-area" id="affine-output"></div>'
        + '</div>';

    var validA = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];

    function modInv26(a) {
        for (var i = 1; i < 26; i++) {
            if ((a * i) % 26 === 1) return i;
        }
        return null;
    }

    function affineEncrypt(text, a, b) {
        var result = '';
        for (var i = 0; i < text.length; i++) {
            var ch = text[i];
            if (ch >= 'A' && ch <= 'Z') {
                result += String.fromCharCode(((a * (ch.charCodeAt(0) - 65) + b) % 26 + 26) % 26 + 65);
            } else if (ch >= 'a' && ch <= 'z') {
                result += String.fromCharCode(((a * (ch.charCodeAt(0) - 97) + b) % 26 + 26) % 26 + 97);
            } else {
                result += ch;
            }
        }
        return result;
    }

    function affineDecrypt(text, a, b) {
        var aInv = modInv26(a);
        if (aInv === null) return null;
        var result = '';
        for (var i = 0; i < text.length; i++) {
            var ch = text[i];
            if (ch >= 'A' && ch <= 'Z') {
                result += String.fromCharCode(((aInv * (ch.charCodeAt(0) - 65 - b + 26 * 10)) % 26 + 26) % 26 + 65);
            } else if (ch >= 'a' && ch <= 'z') {
                result += String.fromCharCode(((aInv * (ch.charCodeAt(0) - 97 - b + 26 * 10)) % 26 + 26) % 26 + 97);
            } else {
                result += ch;
            }
        }
        return result;
    }

    function buildEncTable(text, a, b) {
        var html = '<table class="step-table"><tr><th>Char</th><th>x</th><th>a\u00D7x + b</th><th>mod 26</th><th>Result</th></tr>';
        for (var i = 0; i < text.length; i++) {
            var ch = text[i];
            var upper = ch.toUpperCase();
            if (upper >= 'A' && upper <= 'Z') {
                var x = upper.charCodeAt(0) - 65;
                var val = a * x + b;
                var mod = ((val % 26) + 26) % 26;
                var res = String.fromCharCode(mod + 65);
                if (ch >= 'a' && ch <= 'z') res = res.toLowerCase();
                html += '<tr><td>' + escapeHtml(ch) + '</td><td>' + x + '</td><td>' + a + '\u00D7' + x + ' + ' + b + ' = ' + val + '</td><td>' + mod + '</td><td>' + escapeHtml(res) + '</td></tr>';
            }
        }
        html += '</table>';
        return html;
    }

    function buildDecTable(text, a, b) {
        var aInv = modInv26(a);
        var html = '<table class="step-table"><tr><th>Char</th><th>y</th><th>y \u2212 b</th><th>a\u207B\u00B9 \u00D7 (y\u2212b)</th><th>mod 26</th><th>Result</th></tr>';
        for (var i = 0; i < text.length; i++) {
            var ch = text[i];
            var upper = ch.toUpperCase();
            if (upper >= 'A' && upper <= 'Z') {
                var y = upper.charCodeAt(0) - 65;
                var ymb = y - b;
                var product = aInv * ymb;
                var mod = ((product % 26) + 26) % 26;
                var res = String.fromCharCode(mod + 65);
                if (ch >= 'a' && ch <= 'z') res = res.toLowerCase();
                html += '<tr><td>' + escapeHtml(ch) + '</td><td>' + y + '</td><td>' + ymb + '</td><td>' + aInv + ' \u00D7 (' + ymb + ') = ' + product + '</td><td>' + mod + '</td><td>' + escapeHtml(res) + '</td></tr>';
            }
        }
        html += '</table>';
        return html;
    }

    document.getElementById('affine-encrypt').addEventListener('click', function () {
        var text = document.getElementById('affine-text').value;
        var a = parseInt(document.getElementById('affine-a').value, 10);
        var b = parseInt(document.getElementById('affine-b').value, 10);
        var out = document.getElementById('affine-output');

        if (!text.trim()) { showError(out, 'Please enter some text.'); return; }
        if (validA.indexOf(a) === -1) { showError(out, 'Key a must be coprime to 26. Valid keys: ' + validA.join(', ')); return; }
        if (isNaN(b) || b < 0 || b > 25) { showError(out, 'Key b must be between 0 and 25.'); return; }

        var encrypted = affineEncrypt(text, a, b);
        var html = '<div class="result"><strong>Ciphertext (a=' + a + ', b=' + b + '):</strong><br>' + escapeHtml(encrypted) + '</div>';
        html += buildEncTable(text, a, b);
        out.innerHTML = html;
    });

    document.getElementById('affine-decrypt').addEventListener('click', function () {
        var text = document.getElementById('affine-text').value;
        var a = parseInt(document.getElementById('affine-a').value, 10);
        var b = parseInt(document.getElementById('affine-b').value, 10);
        var out = document.getElementById('affine-output');

        if (!text.trim()) { showError(out, 'Please enter some text.'); return; }
        if (validA.indexOf(a) === -1) { showError(out, 'Key a must be coprime to 26. Valid keys: ' + validA.join(', ')); return; }
        if (isNaN(b) || b < 0 || b > 25) { showError(out, 'Key b must be between 0 and 25.'); return; }

        var aInv = modInv26(a);
        var decrypted = affineDecrypt(text, a, b);
        var html = '<div class="result"><strong>Plaintext (a=' + a + ', a\u207B\u00B9=' + aInv + ', b=' + b + '):</strong><br>' + escapeHtml(decrypted) + '</div>';
        html += buildDecTable(text, a, b);
        out.innerHTML = html;
    });

    document.getElementById('affine-brute').addEventListener('click', function () {
        var text = document.getElementById('affine-text').value;
        var out = document.getElementById('affine-output');

        if (!text.trim()) { showError(out, 'Please enter some text.'); return; }

        var html = '<table class="step-table"><tr><th>a</th><th>b</th><th>Result</th></tr>';
        for (var i = 0; i < validA.length; i++) {
            for (var b = 0; b < 26; b++) {
                var result = affineDecrypt(text, validA[i], b);
                html += '<tr><td>' + validA[i] + '</td><td>' + b + '</td><td>' + escapeHtml(result) + '</td></tr>';
            }
        }
        html += '</table>';
        out.innerHTML = html;
    });
}
