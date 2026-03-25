function toolInit(container) {
    container.innerHTML = ''
        + '<div class="tool-card">'
        + '<h2>Space-Based Text Steganography</h2>'
        + '<p class="description">Hide a secret message inside cover text by varying the number of spaces between words. One space encodes bit 0, two spaces encode bit 1. The secret message is converted to 8-bit ASCII binary and embedded between consecutive words of the cover text.</p>'

        + '<h3>Encode</h3>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="space-cover">Cover Text</label>'
        + '<textarea id="space-cover" rows="3" placeholder="Enter cover text with enough words...">The quick brown fox jumps over the lazy dog near the river bank today</textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="space-secret">Secret Message</label>'
        + '<input type="text" id="space-secret" value="Hi" placeholder="Enter secret message..."></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="btn-row"><button class="btn" id="space-encode">Encode</button></div>'
        + '</div>'
        + '<div class="output-area" id="space-encode-output"></div>'

        + '<h3>Decode</h3>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="space-stego">Stego Text</label>'
        + '<textarea id="space-stego" rows="3" placeholder="Paste stego text to decode..."></textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="btn-row"><button class="btn btn-secondary" id="space-decode">Decode</button></div>'
        + '</div>'
        + '<div class="output-area" id="space-decode-output"></div>'
        + '</div>';

    // ===== Encode =====
    document.getElementById('space-encode').addEventListener('click', function () {
        var cover = document.getElementById('space-cover').value;
        var secret = document.getElementById('space-secret').value;
        var out = document.getElementById('space-encode-output');

        if (!cover.trim()) { showError(out, 'Please enter cover text.'); return; }
        if (!secret) { showError(out, 'Please enter a secret message.'); return; }

        // Convert secret to binary
        var bits = '';
        for (var i = 0; i < secret.length; i++) {
            bits += secret.charCodeAt(i).toString(2).padStart(8, '0');
        }

        // Split cover text into words
        var words = cover.trim().split(/\s+/);
        var gaps = words.length - 1;

        if (bits.length > gaps) {
            showError(out, 'Cover text needs at least ' + (bits.length + 1) + ' words to hide '
                + bits.length + ' bits, but only has ' + words.length + ' words (' + gaps + ' gaps).');
            return;
        }

        // Build bit mapping table
        var html = '<div class="result"><strong>Secret Message:</strong> ' + escapeHtml(secret) + '<br>'
            + '<strong>Binary Representation:</strong> ' + escapeHtml(bits) + ' (' + bits.length + ' bits)</div>';

        html += '<table class="step-table"><tr><th>Char</th><th>ASCII</th><th>Binary (8-bit)</th></tr>';
        for (var i = 0; i < secret.length; i++) {
            var code = secret.charCodeAt(i);
            html += '<tr><td>' + escapeHtml(secret[i]) + '</td><td>' + code
                + '</td><td>' + code.toString(2).padStart(8, '0') + '</td></tr>';
        }
        html += '</table>';

        // Build stego text
        var stego = words[0];
        html += '<table class="step-table"><tr><th>Gap #</th><th>Bit</th><th>Spaces</th><th>Between Words</th></tr>';
        for (var i = 0; i < gaps; i++) {
            if (i < bits.length) {
                var numSpaces = bits[i] === '1' ? 2 : 1;
                stego += (numSpaces === 2 ? '  ' : ' ') + words[i + 1];
                html += '<tr><td>' + (i + 1) + '</td><td>' + bits[i] + '</td><td>'
                    + numSpaces + '</td><td>' + escapeHtml(words[i]) + ' <span class="highlight">['
                    + numSpaces + ' space' + (numSpaces > 1 ? 's' : '') + ']</span> '
                    + escapeHtml(words[i + 1]) + '</td></tr>';
            } else {
                stego += ' ' + words[i + 1];
            }
        }
        html += '</table>';

        html += '<div class="result"><strong>Stego Text:</strong><br>'
            + '<pre style="white-space:pre-wrap;word-break:break-all;">' + escapeHtml(stego) + '</pre></div>';

        out.innerHTML = html;

        // Auto-fill decode textarea
        document.getElementById('space-stego').value = stego;
    });

    // ===== Decode =====
    document.getElementById('space-decode').addEventListener('click', function () {
        var stego = document.getElementById('space-stego').value;
        var out = document.getElementById('space-decode-output');

        if (!stego.trim()) { showError(out, 'Please enter stego text to decode.'); return; }

        // Extract bits from space gaps
        var bits = '';
        var gapPattern = / +/g;
        var match;
        while ((match = gapPattern.exec(stego)) !== null) {
            if (match[0].length >= 2) {
                bits += '1';
            } else {
                bits += '0';
            }
        }

        if (bits.length === 0) {
            showError(out, 'No space gaps found in the text.');
            return;
        }

        // Convert bits to ASCII characters
        var html = '<div class="result"><strong>Extracted Bits:</strong> ' + escapeHtml(bits) + ' (' + bits.length + ' bits)</div>';

        // Truncate to multiple of 8
        var usableBits = bits.substring(0, Math.floor(bits.length / 8) * 8);
        if (usableBits.length === 0) {
            showError(out, 'Not enough bits extracted to form a complete byte. Got ' + bits.length + ' bits, need at least 8.');
            return;
        }

        var decoded = '';
        html += '<table class="step-table"><tr><th>Byte #</th><th>Binary</th><th>Decimal</th><th>Character</th></tr>';
        for (var i = 0; i < usableBits.length; i += 8) {
            var byte = usableBits.substring(i, i + 8);
            var code = parseInt(byte, 2);
            var ch = String.fromCharCode(code);
            decoded += ch;
            html += '<tr><td>' + (i / 8 + 1) + '</td><td>' + byte + '</td><td>' + code
                + '</td><td>' + escapeHtml(ch) + '</td></tr>';
        }
        html += '</table>';

        html += '<div class="result"><strong>Decoded Message:</strong> ' + escapeHtml(decoded) + '</div>';

        out.innerHTML = html;
    });
}
