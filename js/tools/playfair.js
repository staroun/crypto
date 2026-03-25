function toolInit(container) {
    container.innerHTML = '<div class="tool-card">'
        + '<h2>Playfair Cipher</h2>'
        + '<p class="description">Encrypt or decrypt text using the Playfair cipher. Uses a 5&times;5 key matrix (I and J are combined). Plaintext is split into digraphs; identical letter pairs are separated by X. Rules: same row &rarr; shift right, same column &rarr; shift down, rectangle &rarr; swap columns.</p>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="pf-text">Text</label><textarea id="pf-text" rows="3" placeholder="Enter plaintext or ciphertext...">HELLO WORLD</textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="pf-key">Keyword</label><input type="text" id="pf-key" value="MONARCHY" placeholder="Enter keyword..."></div>'
        + '<div class="btn-row">'
        + '<button class="btn" id="pf-encrypt">Encrypt</button>'
        + '<button class="btn btn-secondary" id="pf-decrypt">Decrypt</button>'
        + '</div>'
        + '</div>'
        + '<div class="output-area" id="pf-output"></div>'
        + '</div>';

    function buildMatrix(keyword) {
        keyword = keyword.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
        var seen = {}, letters = [];
        for (var i = 0; i < keyword.length; i++) {
            if (!seen[keyword[i]]) { seen[keyword[i]] = true; letters.push(keyword[i]); }
        }
        for (var c = 65; c <= 90; c++) {
            var ch = String.fromCharCode(c);
            if (ch === 'J') continue;
            if (!seen[ch]) { seen[ch] = true; letters.push(ch); }
        }
        var matrix = [];
        for (var i = 0; i < 5; i++) matrix.push(letters.slice(i * 5, i * 5 + 5));
        return matrix;
    }

    function findPos(matrix, ch) {
        for (var r = 0; r < 5; r++)
            for (var c = 0; c < 5; c++)
                if (matrix[r][c] === ch) return [r, c];
        return null;
    }

    function prepareDigraphs(text) {
        text = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
        var digraphs = [], i = 0;
        while (i < text.length) {
            var a = text[i];
            var b = (i + 1 < text.length) ? text[i + 1] : 'X';
            if (a === b) {
                digraphs.push([a, 'X']);
                i++;
            } else {
                digraphs.push([a, b]);
                i += 2;
            }
        }
        if (digraphs.length > 0 && digraphs[digraphs.length - 1].length === 1) {
            digraphs[digraphs.length - 1].push('X');
        }
        return digraphs;
    }

    function prepareDecryptDigraphs(text) {
        text = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
        var digraphs = [];
        for (var i = 0; i < text.length; i += 2) {
            var a = text[i];
            var b = (i + 1 < text.length) ? text[i + 1] : 'X';
            digraphs.push([a, b]);
        }
        return digraphs;
    }

    function encryptDigraph(matrix, a, b) {
        var posA = findPos(matrix, a), posB = findPos(matrix, b);
        var rA = posA[0], cA = posA[1], rB = posB[0], cB = posB[1];
        var rule;
        if (rA === rB) {
            rule = 'Same row \u2192 shift right';
            return { c1: matrix[rA][(cA + 1) % 5], c2: matrix[rB][(cB + 1) % 5], rule: rule };
        } else if (cA === cB) {
            rule = 'Same column \u2193 shift down';
            return { c1: matrix[(rA + 1) % 5][cA], c2: matrix[(rB + 1) % 5][cB], rule: rule };
        } else {
            rule = 'Rectangle \u2194 swap columns';
            return { c1: matrix[rA][cB], c2: matrix[rB][cA], rule: rule };
        }
    }

    function decryptDigraph(matrix, a, b) {
        var posA = findPos(matrix, a), posB = findPos(matrix, b);
        var rA = posA[0], cA = posA[1], rB = posB[0], cB = posB[1];
        var rule;
        if (rA === rB) {
            rule = 'Same row \u2190 shift left';
            return { c1: matrix[rA][(cA + 4) % 5], c2: matrix[rB][(cB + 4) % 5], rule: rule };
        } else if (cA === cB) {
            rule = 'Same column \u2191 shift up';
            return { c1: matrix[(rA + 4) % 5][cA], c2: matrix[(rB + 4) % 5][cB], rule: rule };
        } else {
            rule = 'Rectangle \u2194 swap columns';
            return { c1: matrix[rA][cB], c2: matrix[rB][cA], rule: rule };
        }
    }

    function renderMatrix(matrix, highlight) {
        var html = '<table class="step-table" style="width:auto;display:inline-table;">';
        for (var r = 0; r < 5; r++) {
            html += '<tr>';
            for (var c = 0; c < 5; c++) {
                var ch = matrix[r][c];
                var hl = highlight && highlight.indexOf(ch) !== -1;
                html += '<td style="width:2rem;' + (hl ? 'color:var(--accent);font-weight:700;' : '') + '">' + ch + '</td>';
            }
            html += '</tr>';
        }
        html += '</table>';
        return html;
    }

    document.getElementById('pf-encrypt').addEventListener('click', function () {
        var text = document.getElementById('pf-text').value;
        var key = document.getElementById('pf-key').value;
        var out = document.getElementById('pf-output');

        if (!text.trim()) { showError(out, 'Please enter some text.'); return; }
        if (!key.trim()) { showError(out, 'Please enter a keyword.'); return; }

        var matrix = buildMatrix(key);
        var digraphs = prepareDigraphs(text);

        var html = '<strong>Key Matrix:</strong><br>' + renderMatrix(matrix);
        html += '<br><strong>Digraphs:</strong> ' + digraphs.map(function(d) { return d[0] + d[1]; }).join(' ');

        html += '<table class="step-table"><tr><th>Digraph</th><th>Pos 1</th><th>Pos 2</th><th>Rule</th><th>Result</th></tr>';
        var ciphertext = '';
        for (var i = 0; i < digraphs.length; i++) {
            var d = digraphs[i];
            var posA = findPos(matrix, d[0]), posB = findPos(matrix, d[1]);
            var r = encryptDigraph(matrix, d[0], d[1]);
            ciphertext += r.c1 + r.c2;
            html += '<tr><td>' + d[0] + d[1] + '</td><td>(' + posA[0] + ',' + posA[1] + ')</td><td>(' + posB[0] + ',' + posB[1] + ')</td><td>' + r.rule + '</td><td>' + r.c1 + r.c2 + '</td></tr>';
        }
        html += '</table>';
        html += '<div class="result"><strong>Ciphertext:</strong> ' + escapeHtml(ciphertext) + '</div>';

        out.innerHTML = html;
    });

    document.getElementById('pf-decrypt').addEventListener('click', function () {
        var text = document.getElementById('pf-text').value;
        var key = document.getElementById('pf-key').value;
        var out = document.getElementById('pf-output');

        if (!text.trim()) { showError(out, 'Please enter some text.'); return; }
        if (!key.trim()) { showError(out, 'Please enter a keyword.'); return; }

        var matrix = buildMatrix(key);
        var digraphs = prepareDecryptDigraphs(text);

        var html = '<strong>Key Matrix:</strong><br>' + renderMatrix(matrix);
        html += '<br><strong>Digraphs:</strong> ' + digraphs.map(function(d) { return d[0] + d[1]; }).join(' ');

        html += '<table class="step-table"><tr><th>Digraph</th><th>Pos 1</th><th>Pos 2</th><th>Rule</th><th>Result</th></tr>';
        var plaintext = '';
        for (var i = 0; i < digraphs.length; i++) {
            var d = digraphs[i];
            var posA = findPos(matrix, d[0]), posB = findPos(matrix, d[1]);
            var r = decryptDigraph(matrix, d[0], d[1]);
            plaintext += r.c1 + r.c2;
            html += '<tr><td>' + d[0] + d[1] + '</td><td>(' + posA[0] + ',' + posA[1] + ')</td><td>(' + posB[0] + ',' + posB[1] + ')</td><td>' + r.rule + '</td><td>' + r.c1 + r.c2 + '</td></tr>';
        }
        html += '</table>';
        html += '<div class="result"><strong>Plaintext:</strong> ' + escapeHtml(plaintext) + '</div>';

        out.innerHTML = html;
    });
}
