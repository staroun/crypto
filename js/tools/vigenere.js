function toolInit(container) {
    container.innerHTML = '<div class="tool-card">'
        + '<h2>Vigen&egrave;re Cipher</h2>'
        + '<p class="description">Encrypt or decrypt text using the Vigen&egrave;re cipher. Each letter is shifted by the corresponding letter of a repeating keyword. Only alphabetic characters are encrypted; all other characters are passed through unchanged.</p>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="vig-text">Text</label><textarea id="vig-text" rows="3" placeholder="Enter plaintext or ciphertext...">HELLO WORLD</textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="vig-key">Keyword</label><input type="text" id="vig-key" value="KEY" placeholder="Enter keyword (letters only)..."></div>'
        + '<div class="btn-row">'
        + '<button class="btn" id="vig-encrypt">Encrypt</button>'
        + '<button class="btn btn-secondary" id="vig-decrypt">Decrypt</button>'
        + '</div>'
        + '</div>'
        + '<div class="output-area" id="vig-output"></div>'
        + '</div>';

    function vigCipher(text, keyword, decrypt) {
        var key = keyword.toUpperCase().replace(/[^A-Z]/g, '');
        if (key.length === 0) return null;

        var result = '';
        var ki = 0;
        for (var i = 0; i < text.length; i++) {
            var ch = text[i];
            if (ch >= 'A' && ch <= 'Z') {
                var shift = key.charCodeAt(ki % key.length) - 65;
                if (decrypt) shift = -shift;
                result += String.fromCharCode(((ch.charCodeAt(0) - 65 + shift) % 26 + 26) % 26 + 65);
                ki++;
            } else if (ch >= 'a' && ch <= 'z') {
                var shift = key.charCodeAt(ki % key.length) - 65;
                if (decrypt) shift = -shift;
                result += String.fromCharCode(((ch.charCodeAt(0) - 97 + shift) % 26 + 26) % 26 + 97);
                ki++;
            } else {
                result += ch;
            }
        }
        return result;
    }

    function buildStepTable(text, keyword, decrypt) {
        var key = keyword.toUpperCase().replace(/[^A-Z]/g, '');
        var html = '<table class="step-table"><tr><th>#</th><th>Char</th><th>Key Char</th><th>Shift</th><th>Result</th></tr>';
        var ki = 0;
        var step = 1;
        for (var i = 0; i < text.length; i++) {
            var ch = text[i];
            if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z')) {
                var isUpper = (ch >= 'A' && ch <= 'Z');
                var base = isUpper ? 65 : 97;
                var keyChar = key[ki % key.length];
                var shift = keyChar.charCodeAt(0) - 65;
                var effectiveShift = decrypt ? -shift : shift;
                var resultCode = ((ch.charCodeAt(0) - base + effectiveShift) % 26 + 26) % 26 + base;
                var resultChar = String.fromCharCode(resultCode);
                html += '<tr><td>' + step + '</td><td>' + escapeHtml(ch) + '</td><td>' + escapeHtml(keyChar) + ' (' + shift + ')</td><td>' + (decrypt ? '-' : '+') + shift + '</td><td>' + escapeHtml(resultChar) + '</td></tr>';
                ki++;
                step++;
            }
        }
        html += '</table>';
        return html;
    }

    document.getElementById('vig-encrypt').addEventListener('click', function () {
        var text = document.getElementById('vig-text').value;
        var keyword = document.getElementById('vig-key').value;
        var out = document.getElementById('vig-output');

        if (!text.trim()) { showError(out, 'Please enter some text.'); return; }
        if (!keyword.trim() || keyword.replace(/[^A-Za-z]/g, '').length === 0) { showError(out, 'Keyword must contain at least one letter.'); return; }

        var encrypted = vigCipher(text, keyword, false);
        var html = '<div class="result"><strong>Ciphertext:</strong><br>' + escapeHtml(encrypted) + '</div>';
        html += buildStepTable(text, keyword, false);
        out.innerHTML = html;
    });

    document.getElementById('vig-decrypt').addEventListener('click', function () {
        var text = document.getElementById('vig-text').value;
        var keyword = document.getElementById('vig-key').value;
        var out = document.getElementById('vig-output');

        if (!text.trim()) { showError(out, 'Please enter some text.'); return; }
        if (!keyword.trim() || keyword.replace(/[^A-Za-z]/g, '').length === 0) { showError(out, 'Keyword must contain at least one letter.'); return; }

        var decrypted = vigCipher(text, keyword, true);
        var html = '<div class="result"><strong>Plaintext:</strong><br>' + escapeHtml(decrypted) + '</div>';
        html += buildStepTable(text, keyword, true);
        out.innerHTML = html;
    });
}
