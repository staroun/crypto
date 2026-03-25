function toolInit(container) {
    container.innerHTML = '<div class="tool-card">'
        + '<h2>Caesar Cipher</h2>'
        + '<p class="description">Encrypt or decrypt text using the Caesar cipher (shift cipher). Each letter is shifted by a fixed number of positions in the alphabet. Use Brute Force to try all 26 possible shifts at once.</p>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="caesar-text">Text</label><textarea id="caesar-text" rows="3" placeholder="Enter plaintext or ciphertext...">HELLO WORLD</textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group"><label for="caesar-shift">Shift (0&ndash;25)</label><input type="number" id="caesar-shift" value="3" min="0" max="25"></div>'
        + '<div class="btn-row">'
        + '<button class="btn" id="caesar-encrypt">Encrypt</button>'
        + '<button class="btn btn-secondary" id="caesar-decrypt">Decrypt</button>'
        + '<button class="btn btn-accent" id="caesar-brute">Brute Force</button>'
        + '</div>'
        + '</div>'
        + '<div class="output-area" id="caesar-output"></div>'
        + '</div>';

    function caesarShift(text, shift) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            if (ch >= 'A' && ch <= 'Z') {
                result += String.fromCharCode(((ch.charCodeAt(0) - 65 + shift) % 26 + 26) % 26 + 65);
            } else if (ch >= 'a' && ch <= 'z') {
                result += String.fromCharCode(((ch.charCodeAt(0) - 97 + shift) % 26 + 26) % 26 + 97);
            } else {
                result += ch;
            }
        }
        return result;
    }

    document.getElementById('caesar-encrypt').addEventListener('click', function () {
        var text = document.getElementById('caesar-text').value;
        var shift = parseInt(document.getElementById('caesar-shift').value, 10);
        var out = document.getElementById('caesar-output');

        if (!text.trim()) { showError(out, 'Please enter some text.'); return; }
        if (isNaN(shift) || shift < 0 || shift > 25) { showError(out, 'Shift must be between 0 and 25.'); return; }

        var encrypted = caesarShift(text, shift);
        out.innerHTML = '<div class="result"><strong>Ciphertext (shift ' + shift + '):</strong><br>' + escapeHtml(encrypted) + '</div>';
    });

    document.getElementById('caesar-decrypt').addEventListener('click', function () {
        var text = document.getElementById('caesar-text').value;
        var shift = parseInt(document.getElementById('caesar-shift').value, 10);
        var out = document.getElementById('caesar-output');

        if (!text.trim()) { showError(out, 'Please enter some text.'); return; }
        if (isNaN(shift) || shift < 0 || shift > 25) { showError(out, 'Shift must be between 0 and 25.'); return; }

        var decrypted = caesarShift(text, -shift);
        out.innerHTML = '<div class="result"><strong>Plaintext (shift ' + shift + '):</strong><br>' + escapeHtml(decrypted) + '</div>';
    });

    document.getElementById('caesar-brute').addEventListener('click', function () {
        var text = document.getElementById('caesar-text').value;
        var out = document.getElementById('caesar-output');

        if (!text.trim()) { showError(out, 'Please enter some text.'); return; }

        var html = '<table class="step-table"><tr><th>Shift</th><th>Result</th></tr>';
        for (var s = 0; s < 26; s++) {
            var result = caesarShift(text, -s);
            html += '<tr><td>' + s + '</td><td>' + escapeHtml(result) + '</td></tr>';
        }
        html += '</table>';
        out.innerHTML = html;
    });
}
