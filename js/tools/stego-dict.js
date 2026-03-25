function toolInit(container) {
    // ===== Dictionaries =====
    var articles = ['A', 'The'];
    var nouns = ['agent','baby','bird','book','brother','car','cat','child','city','class',
                 'doctor','dog','door','enemy','eye','father','friend','game','girl','hand',
                 'house','king','lady','letter','man','mother','night','park','queen','son',
                 'student','teacher'];
    var verbs = ['asked','bought','called','caught','drove','found','gave','heard',
                 'helped','hit','joined','kept','loved','met','saved','told'];

    container.innerHTML = ''
        + '<div class="tool-card">'
        + '<h2>Word-Dictionary Steganography</h2>'
        + '<p class="description">Hide data in natural-looking sentences using a fixed dictionary. Each sentence encodes exactly 16 bits (2 ASCII characters) using the structure: Article (1 bit) + Noun (5 bits) + Verb (4 bits) + Article (1 bit) + Noun (5 bits). Words are selected by their binary index in the dictionary.</p>'

        + '<h3>Dictionary</h3>'
        + '<div class="output-area" id="dict-display"></div>'

        + '<h3>Encode</h3>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="dict-secret">Secret Text (1\u20132 ASCII characters per sentence)</label>'
        + '<input type="text" id="dict-secret" value="Hi" placeholder="Enter 1-2 characters..."></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="btn-row"><button class="btn" id="dict-encode">Encode</button></div>'
        + '</div>'
        + '<div class="output-area" id="dict-encode-output"></div>'

        + '<h3>Decode</h3>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="dict-sentence">Sentence (5 words: Article Noun Verb Article Noun)</label>'
        + '<input type="text" id="dict-sentence" value="A friend called a doctor." placeholder="Enter a 5-word sentence..."></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="btn-row"><button class="btn btn-secondary" id="dict-decode">Decode</button></div>'
        + '</div>'
        + '<div class="output-area" id="dict-decode-output"></div>'
        + '</div>';

    // Build dictionary display
    (function () {
        var html = '<div class="result">';

        html += '<strong>Articles (1 bit):</strong><br>'
            + '<table class="step-table"><tr><th>Binary</th><th>Word</th></tr>';
        for (var i = 0; i < articles.length; i++) {
            html += '<tr><td>' + i + '</td><td>' + articles[i] + '</td></tr>';
        }
        html += '</table><br>';

        html += '<strong>Nouns (5 bits, 0\u201331):</strong><br>'
            + '<table class="step-table"><tr><th>Binary</th><th>Index</th><th>Word</th></tr>';
        for (var i = 0; i < nouns.length; i++) {
            html += '<tr><td>' + i.toString(2).padStart(5, '0') + '</td><td>' + i + '</td><td>' + nouns[i] + '</td></tr>';
        }
        html += '</table><br>';

        html += '<strong>Verbs (4 bits, 0\u201315):</strong><br>'
            + '<table class="step-table"><tr><th>Binary</th><th>Index</th><th>Word</th></tr>';
        for (var i = 0; i < verbs.length; i++) {
            html += '<tr><td>' + i.toString(2).padStart(4, '0') + '</td><td>' + i + '</td><td>' + verbs[i] + '</td></tr>';
        }
        html += '</table>';

        html += '</div>';
        document.getElementById('dict-display').innerHTML = html;
    })();

    // ===== Encode =====
    document.getElementById('dict-encode').addEventListener('click', function () {
        var secret = document.getElementById('dict-secret').value;
        var out = document.getElementById('dict-encode-output');

        if (!secret) { showError(out, 'Please enter 1\u20132 characters to encode.'); return; }
        if (secret.length > 2) { showError(out, 'Please enter at most 2 characters. Each sentence encodes exactly 16 bits (2 characters).'); return; }

        // Validate ASCII range
        for (var i = 0; i < secret.length; i++) {
            var code = secret.charCodeAt(i);
            if (code > 255) {
                showError(out, 'Character "' + escapeHtml(secret[i]) + '" is outside the ASCII range (0\u2013255).');
                return;
            }
        }

        // Build 16-bit binary
        var bits = '';
        for (var i = 0; i < secret.length; i++) {
            bits += secret.charCodeAt(i).toString(2).padStart(8, '0');
        }
        // Pad to 16 bits if only 1 character
        while (bits.length < 16) {
            bits += '0';
        }

        // Parse bit segments: article1(1) + noun1(5) + verb(4) + article2(1) + noun2(5)
        var art1Bits = bits.substring(0, 1);
        var noun1Bits = bits.substring(1, 6);
        var verbBits = bits.substring(6, 10);
        var art2Bits = bits.substring(10, 11);
        var noun2Bits = bits.substring(11, 16);

        var art1Idx = parseInt(art1Bits, 2);
        var noun1Idx = parseInt(noun1Bits, 2);
        var verbIdx = parseInt(verbBits, 2);
        var art2Idx = parseInt(art2Bits, 2);
        var noun2Idx = parseInt(noun2Bits, 2);

        var sentence = articles[art1Idx] + ' ' + nouns[noun1Idx] + ' '
            + verbs[verbIdx] + ' ' + articles[art2Idx].toLowerCase() + ' '
            + nouns[noun2Idx] + '.';

        // Build output
        var html = '<div class="result"><strong>Secret Text:</strong> ' + escapeHtml(secret) + '<br>';
        html += '<strong>Binary (16-bit):</strong> ' + escapeHtml(bits) + '</div>';

        html += '<table class="step-table"><tr><th>Char</th><th>ASCII</th><th>Binary (8-bit)</th></tr>';
        for (var i = 0; i < secret.length; i++) {
            html += '<tr><td>' + escapeHtml(secret[i]) + '</td><td>' + secret.charCodeAt(i)
                + '</td><td>' + secret.charCodeAt(i).toString(2).padStart(8, '0') + '</td></tr>';
        }
        if (secret.length === 1) {
            html += '<tr><td>(padding)</td><td>0</td><td>00000000</td></tr>';
        }
        html += '</table>';

        html += '<table class="step-table"><tr><th>Component</th><th>Bits</th><th>Index</th><th>Word</th></tr>';
        html += '<tr><td>Article 1 (1 bit)</td><td>' + art1Bits + '</td><td>' + art1Idx + '</td><td>' + articles[art1Idx] + '</td></tr>';
        html += '<tr><td>Noun 1 (5 bits)</td><td>' + noun1Bits + '</td><td>' + noun1Idx + '</td><td>' + nouns[noun1Idx] + '</td></tr>';
        html += '<tr><td>Verb (4 bits)</td><td>' + verbBits + '</td><td>' + verbIdx + '</td><td>' + verbs[verbIdx] + '</td></tr>';
        html += '<tr><td>Article 2 (1 bit)</td><td>' + art2Bits + '</td><td>' + art2Idx + '</td><td>' + articles[art2Idx] + '</td></tr>';
        html += '<tr><td>Noun 2 (5 bits)</td><td>' + noun2Bits + '</td><td>' + noun2Idx + '</td><td>' + nouns[noun2Idx] + '</td></tr>';
        html += '</table>';

        html += '<div class="result"><strong>Encoded Sentence:</strong> ' + escapeHtml(sentence) + '</div>';

        out.innerHTML = html;
    });

    // ===== Decode =====
    document.getElementById('dict-decode').addEventListener('click', function () {
        var sentence = document.getElementById('dict-sentence').value.trim();
        var out = document.getElementById('dict-decode-output');

        if (!sentence) { showError(out, 'Please enter a sentence to decode.'); return; }

        // Remove trailing punctuation and split into words
        var cleaned = sentence.replace(/[.,!?;:]+$/g, '').trim();
        var words = cleaned.split(/\s+/);

        if (words.length !== 5) {
            showError(out, 'Sentence must contain exactly 5 words (Article Noun Verb Article Noun). Found ' + words.length + ' words.');
            return;
        }

        // Look up each word (case-insensitive)
        var w1 = words[0], w2 = words[1], w3 = words[2], w4 = words[3], w5 = words[4];

        // Article 1
        var art1Idx = -1;
        for (var i = 0; i < articles.length; i++) {
            if (articles[i].toLowerCase() === w1.toLowerCase()) { art1Idx = i; break; }
        }
        if (art1Idx === -1) { showError(out, 'Word 1 "' + escapeHtml(w1) + '" is not a valid article. Expected: ' + articles.join(', ')); return; }

        // Noun 1
        var noun1Idx = -1;
        for (var i = 0; i < nouns.length; i++) {
            if (nouns[i].toLowerCase() === w2.toLowerCase()) { noun1Idx = i; break; }
        }
        if (noun1Idx === -1) { showError(out, 'Word 2 "' + escapeHtml(w2) + '" is not a valid noun.'); return; }

        // Verb
        var verbIdx = -1;
        for (var i = 0; i < verbs.length; i++) {
            if (verbs[i].toLowerCase() === w3.toLowerCase()) { verbIdx = i; break; }
        }
        if (verbIdx === -1) { showError(out, 'Word 3 "' + escapeHtml(w3) + '" is not a valid verb.'); return; }

        // Article 2
        var art2Idx = -1;
        for (var i = 0; i < articles.length; i++) {
            if (articles[i].toLowerCase() === w4.toLowerCase()) { art2Idx = i; break; }
        }
        if (art2Idx === -1) { showError(out, 'Word 4 "' + escapeHtml(w4) + '" is not a valid article. Expected: ' + articles.join(', ')); return; }

        // Noun 2
        var noun2Idx = -1;
        for (var i = 0; i < nouns.length; i++) {
            if (nouns[i].toLowerCase() === w5.toLowerCase()) { noun2Idx = i; break; }
        }
        if (noun2Idx === -1) { showError(out, 'Word 5 "' + escapeHtml(w5) + '" is not a valid noun.'); return; }

        // Reconstruct bits
        var art1Bits = art1Idx.toString(2);
        var noun1Bits = noun1Idx.toString(2).padStart(5, '0');
        var verbBits = verbIdx.toString(2).padStart(4, '0');
        var art2Bits = art2Idx.toString(2);
        var noun2Bits = noun2Idx.toString(2).padStart(5, '0');
        var allBits = art1Bits + noun1Bits + verbBits + art2Bits + noun2Bits;

        // Decode to characters
        var byte1 = allBits.substring(0, 8);
        var byte2 = allBits.substring(8, 16);
        var code1 = parseInt(byte1, 2);
        var code2 = parseInt(byte2, 2);
        var char1 = String.fromCharCode(code1);
        var char2 = code2 !== 0 ? String.fromCharCode(code2) : '';
        var decoded = char1 + char2;

        // Build output
        var html = '<table class="step-table"><tr><th>Component</th><th>Word</th><th>Index</th><th>Bits</th></tr>';
        html += '<tr><td>Article 1 (1 bit)</td><td>' + escapeHtml(w1) + '</td><td>' + art1Idx + '</td><td>' + art1Bits + '</td></tr>';
        html += '<tr><td>Noun 1 (5 bits)</td><td>' + escapeHtml(w2) + '</td><td>' + noun1Idx + '</td><td>' + noun1Bits + '</td></tr>';
        html += '<tr><td>Verb (4 bits)</td><td>' + escapeHtml(w3) + '</td><td>' + verbIdx + '</td><td>' + verbBits + '</td></tr>';
        html += '<tr><td>Article 2 (1 bit)</td><td>' + escapeHtml(w4) + '</td><td>' + art2Idx + '</td><td>' + art2Bits + '</td></tr>';
        html += '<tr><td>Noun 2 (5 bits)</td><td>' + escapeHtml(w5) + '</td><td>' + noun2Idx + '</td><td>' + noun2Bits + '</td></tr>';
        html += '</table>';

        html += '<div class="result"><strong>Extracted Bits:</strong> ' + escapeHtml(allBits) + '</div>';

        html += '<table class="step-table"><tr><th>Byte #</th><th>Binary</th><th>Decimal</th><th>Character</th></tr>';
        html += '<tr><td>1</td><td>' + byte1 + '</td><td>' + code1 + '</td><td>' + escapeHtml(char1) + '</td></tr>';
        if (code2 !== 0) {
            html += '<tr><td>2</td><td>' + byte2 + '</td><td>' + code2 + '</td><td>' + escapeHtml(char2) + '</td></tr>';
        } else {
            html += '<tr><td>2</td><td>' + byte2 + '</td><td>0</td><td>(padding / null)</td></tr>';
        }
        html += '</table>';

        html += '<div class="result"><strong>Decoded Message:</strong> ' + escapeHtml(decoded) + '</div>';

        out.innerHTML = html;
    });
}
