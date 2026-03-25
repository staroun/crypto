function toolInit(container) {
    container.innerHTML = '<div class="tool-card">'
        + '<h2>Hill Cipher</h2>'
        + '<p class="description">Encrypt or decrypt text using the Hill cipher. Plaintext is divided into blocks of size <em>n</em> and multiplied by an n&times;n key matrix modulo 26. The key matrix must be invertible mod 26 (i.e., gcd(det(K), 26) = 1). Letters: A=0, B=1, &hellip;, Z=25.</p>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="hill-text">Text</label><textarea id="hill-text" rows="3" placeholder="Enter plaintext or ciphertext...">HELLO</textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group"><label for="hill-size">Matrix Size</label><select id="hill-size"><option value="2" selected>2 &times; 2</option><option value="3">3 &times; 3</option></select></div>'
        + '<button class="btn btn-accent" id="hill-example">Load Example</button>'
        + '</div>'
        + '<div class="input-row"><div class="input-group flex-grow"><label>Key Matrix K</label><div class="matrix-grid" id="hill-grid"></div></div></div>'
        + '<div class="btn-row">'
        + '<button class="btn" id="hill-encrypt">Encrypt</button>'
        + '<button class="btn btn-secondary" id="hill-decrypt">Decrypt</button>'
        + '</div>'
        + '<div class="output-area" id="hill-output"></div>'
        + '</div>';

    var hillSize = 2;

    function buildGrid() {
        hillSize = parseInt(document.getElementById('hill-size').value, 10);
        var grid = document.getElementById('hill-grid');
        grid.style.gridTemplateColumns = 'repeat(' + hillSize + ', 60px)';
        grid.innerHTML = '';
        for (var i = 0; i < hillSize; i++) {
            for (var j = 0; j < hillSize; j++) {
                var inp = document.createElement('input');
                inp.type = 'text'; inp.id = 'hill-' + i + '-' + j;
                inp.value = (i === j) ? '1' : '0';
                inp.setAttribute('autocomplete', 'off');
                grid.appendChild(inp);
            }
        }
    }
    buildGrid();

    document.getElementById('hill-size').addEventListener('change', buildGrid);

    document.getElementById('hill-example').addEventListener('click', function () {
        var examples = {
            2: [[6, 24], [1, 16]],
            3: [[6, 24, 1], [13, 16, 10], [20, 17, 15]]
        };
        var ex = examples[hillSize];
        for (var i = 0; i < hillSize; i++)
            for (var j = 0; j < hillSize; j++)
                document.getElementById('hill-' + i + '-' + j).value = ex[i][j];
    });

    function readKey() {
        var n = hillSize, mat = [];
        for (var i = 0; i < n; i++) {
            mat[i] = [];
            for (var j = 0; j < n; j++) {
                var v = parseInt(document.getElementById('hill-' + i + '-' + j).value, 10);
                if (isNaN(v)) return null;
                mat[i][j] = v;
            }
        }
        return mat;
    }

    function mod26(x) { return ((x % 26) + 26) % 26; }

    function modInv26(a) {
        a = mod26(a);
        for (var i = 1; i < 26; i++) {
            if ((a * i) % 26 === 1) return i;
        }
        return null;
    }

    function det2(m) { return mod26(m[0][0] * m[1][1] - m[0][1] * m[1][0]); }

    function det3(m) {
        return mod26(
            m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
          - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
          + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
        );
    }

    function matInverse2(m) {
        var d = det2(m);
        var dInv = modInv26(d);
        if (dInv === null) return null;
        return [
            [mod26(dInv * m[1][1]), mod26(dInv * (-m[0][1]))],
            [mod26(dInv * (-m[1][0])), mod26(dInv * m[0][0])]
        ];
    }

    function matInverse3(m) {
        var d = det3(m);
        var dInv = modInv26(d);
        if (dInv === null) return null;
        // Cofactor matrix transposed (adjugate)
        var adj = [];
        for (var i = 0; i < 3; i++) {
            adj[i] = [];
            for (var j = 0; j < 3; j++) {
                // Minor(j, i) — transposed
                var rows = [0,1,2].filter(function(r){return r!==j;});
                var cols = [0,1,2].filter(function(c){return c!==i;});
                var minor = m[rows[0]][cols[0]] * m[rows[1]][cols[1]] - m[rows[0]][cols[1]] * m[rows[1]][cols[0]];
                var sign = ((i + j) % 2 === 0) ? 1 : -1;
                adj[i][j] = mod26(dInv * sign * minor);
            }
        }
        return adj;
    }

    function matMulVec(mat, vec, n) {
        var result = [];
        for (var i = 0; i < n; i++) {
            var sum = 0;
            for (var j = 0; j < n; j++) sum += mat[i][j] * vec[j];
            result.push(mod26(sum));
        }
        return result;
    }

    function renderMat(mat) {
        var n = mat.length;
        var html = '<div class="matrix-display" style="grid-template-columns:repeat(' + n + ',auto)">';
        for (var i = 0; i < n; i++)
            for (var j = 0; j < n; j++)
                html += '<span>' + mat[i][j] + '</span>';
        html += '</div>';
        return html;
    }

    function textToNums(text) {
        text = text.toUpperCase().replace(/[^A-Z]/g, '');
        var nums = [];
        for (var i = 0; i < text.length; i++) nums.push(text.charCodeAt(i) - 65);
        return nums;
    }

    function numsToText(nums) {
        var text = '';
        for (var i = 0; i < nums.length; i++) text += String.fromCharCode(nums[i] + 65);
        return text;
    }

    document.getElementById('hill-encrypt').addEventListener('click', function () {
        var text = document.getElementById('hill-text').value;
        var out = document.getElementById('hill-output');
        var key = readKey();
        var n = hillSize;

        if (!text.trim()) { showError(out, 'Please enter some text.'); return; }
        if (!key) { showError(out, 'Please enter valid integers in all key matrix cells.'); return; }

        var nums = textToNums(text);
        // Pad with X (23) if needed
        while (nums.length % n !== 0) nums.push(23);

        var d = (n === 2) ? det2(key) : det3(key);
        var html = '<strong>Key Matrix K:</strong>' + renderMat(key);
        html += '<div style="margin:0.3rem 0;color:var(--text-dim);font-size:0.85rem;">det(K) mod 26 = ' + d + '</div>';

        html += '<strong>Plaintext Numbers:</strong> ' + nums.map(function(v, i) {
            return String.fromCharCode(v + 65) + '=' + v;
        }).join(', ');

        html += '<table class="step-table"><tr><th>Block</th><th>Letters</th><th>P (vector)</th><th>K &times; P mod 26</th><th>Result</th></tr>';
        var resultNums = [];
        for (var i = 0; i < nums.length; i += n) {
            var block = nums.slice(i, i + n);
            var letters = block.map(function(v) { return String.fromCharCode(v + 65); }).join('');
            var encrypted = matMulVec(key, block, n);
            resultNums = resultNums.concat(encrypted);

            // Show multiplication detail
            var detail = '';
            for (var r = 0; r < n; r++) {
                var parts = [];
                for (var c = 0; c < n; c++) parts.push(key[r][c] + '\u00D7' + block[c]);
                detail += parts.join(' + ') + ' = ' + encrypted[r];
                if (r < n - 1) detail += '<br>';
            }

            html += '<tr><td>' + (i / n + 1) + '</td><td>' + letters + '</td><td>[' + block.join(', ') + ']</td><td>' + detail + '</td><td>' + encrypted.map(function(v) { return String.fromCharCode(v + 65); }).join('') + ' [' + encrypted.join(', ') + ']</td></tr>';
        }
        html += '</table>';

        var ciphertext = numsToText(resultNums);
        html += '<div class="result"><strong>Ciphertext:</strong> ' + escapeHtml(ciphertext) + '</div>';

        out.innerHTML = html;
    });

    document.getElementById('hill-decrypt').addEventListener('click', function () {
        var text = document.getElementById('hill-text').value;
        var out = document.getElementById('hill-output');
        var key = readKey();
        var n = hillSize;

        if (!text.trim()) { showError(out, 'Please enter some text.'); return; }
        if (!key) { showError(out, 'Please enter valid integers in all key matrix cells.'); return; }

        var d = (n === 2) ? det2(key) : det3(key);
        var dInv = modInv26(d);
        if (dInv === null) {
            showError(out, 'det(K) mod 26 = ' + d + '. gcd(' + d + ', 26) \u2260 1. Key matrix is not invertible mod 26.');
            return;
        }

        var keyInv = (n === 2) ? matInverse2(key) : matInverse3(key);
        if (!keyInv) { showError(out, 'Failed to compute key inverse.'); return; }

        var nums = textToNums(text);
        while (nums.length % n !== 0) nums.push(23);

        var html = '<strong>Key Matrix K:</strong>' + renderMat(key);
        html += '<div style="margin:0.3rem 0;color:var(--text-dim);font-size:0.85rem;">det(K) mod 26 = ' + d + ', det\u207B\u00B9 mod 26 = ' + dInv + '</div>';
        html += '<strong>K\u207B\u00B9 mod 26:</strong>' + renderMat(keyInv);

        html += '<br><strong>Ciphertext Numbers:</strong> ' + nums.map(function(v) {
            return String.fromCharCode(v + 65) + '=' + v;
        }).join(', ');

        html += '<table class="step-table"><tr><th>Block</th><th>Letters</th><th>C (vector)</th><th>K\u207B\u00B9 &times; C mod 26</th><th>Result</th></tr>';
        var resultNums = [];
        for (var i = 0; i < nums.length; i += n) {
            var block = nums.slice(i, i + n);
            var letters = block.map(function(v) { return String.fromCharCode(v + 65); }).join('');
            var decrypted = matMulVec(keyInv, block, n);
            resultNums = resultNums.concat(decrypted);

            var detail = '';
            for (var r = 0; r < n; r++) {
                var parts = [];
                for (var c = 0; c < n; c++) parts.push(keyInv[r][c] + '\u00D7' + block[c]);
                detail += parts.join(' + ') + ' = ' + decrypted[r];
                if (r < n - 1) detail += '<br>';
            }

            html += '<tr><td>' + (i / n + 1) + '</td><td>' + letters + '</td><td>[' + block.join(', ') + ']</td><td>' + detail + '</td><td>' + decrypted.map(function(v) { return String.fromCharCode(v + 65); }).join('') + ' [' + decrypted.join(', ') + ']</td></tr>';
        }
        html += '</table>';

        var plaintext = numsToText(resultNums);
        html += '<div class="result"><strong>Plaintext:</strong> ' + escapeHtml(plaintext) + '</div>';

        out.innerHTML = html;
    });
}
