function toolInit(container) {
    container.innerHTML = ''
        // ===== Card 1: Hash Generator =====
        + '<div class="tool-card">'
        + '<h2>Hash Generator</h2>'
        + '<p class="description">Compute cryptographic hash digests of text input using SHA-1, SHA-256, and SHA-512 via the Web Crypto API. Click the copy button next to any hash to copy it to your clipboard.</p>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="hash-text">Text Input</label>'
        + '<textarea id="hash-text" rows="3" placeholder="Enter text to hash..."></textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="btn-row"><button class="btn" id="hash-compute">Compute Hashes</button></div>'
        + '</div>'
        + '<div class="output-area" id="hash-output">'
        + '<div class="hash-results">'
        + '<div class="hash-row"><span class="hash-label">SHA-1:</span><span class="hash-value" id="hash-sha1"></span><button class="btn-copy" data-target="hash-sha1">Copy</button></div>'
        + '<div class="hash-row"><span class="hash-label">SHA-256:</span><span class="hash-value" id="hash-sha256"></span><button class="btn-copy" data-target="hash-sha256">Copy</button></div>'
        + '<div class="hash-row"><span class="hash-label">SHA-512:</span><span class="hash-value" id="hash-sha512"></span><button class="btn-copy" data-target="hash-sha512">Copy</button></div>'
        + '</div>'
        + '</div>'
        + '</div>'

        // ===== Card 2: File Hash =====
        + '<div class="tool-card">'
        + '<h2>File Hash</h2>'
        + '<p class="description">Compute the SHA-256 hash of a file. Drag and drop a file onto the drop zone, or click to select a file from your computer.</p>'
        + '<div class="drop-zone" id="file-drop-zone">'
        + '<p>Drag &amp; drop a file here, or click to select</p>'
        + '<input type="file" id="file-hash-input" hidden>'
        + '</div>'
        + '<div class="output-area" id="file-hash-output"></div>'
        + '</div>'

        // ===== Card 3: Hash Comparison =====
        + '<div class="tool-card">'
        + '<h2>Hash Comparison</h2>'
        + '<p class="description">Compare two hash values to check if they match. If they differ, the position of the first difference is shown.</p>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="hash-cmp-a">Hash A</label>'
        + '<input type="text" id="hash-cmp-a" placeholder="Enter first hash value..."></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="hash-cmp-b">Hash B</label>'
        + '<input type="text" id="hash-cmp-b" placeholder="Enter second hash value..."></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="btn-row"><button class="btn" id="hash-compare">Compare</button></div>'
        + '</div>'
        + '<div class="output-area" id="hash-cmp-output"></div>'
        + '</div>';

    // ===== Card 1: Hash Generator Logic =====

    // Attach copy-button listeners for the hash results
    container.querySelectorAll('.btn-copy').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var target = document.getElementById(btn.dataset.target);
            if (target && target.textContent) {
                navigator.clipboard.writeText(target.textContent).then(function () {
                    var orig = btn.textContent;
                    btn.textContent = '\u2713';
                    setTimeout(function () { btn.textContent = orig; }, 1200);
                });
            }
        });
    });

    async function computeHash(algorithm, data) {
        var hashBuffer = await crypto.subtle.digest(algorithm, data);
        return hexEncode(hashBuffer);
    }

    document.getElementById('hash-compute').addEventListener('click', async function () {
        var text = document.getElementById('hash-text').value;
        var sha1El = document.getElementById('hash-sha1');
        var sha256El = document.getElementById('hash-sha256');
        var sha512El = document.getElementById('hash-sha512');

        if (!text) {
            sha1El.textContent = '';
            sha256El.textContent = '';
            sha512El.textContent = '';
            showError(document.getElementById('hash-output'), 'Please enter some text to hash.');
            return;
        }

        try {
            var encoder = new TextEncoder();
            var data = encoder.encode(text);

            var results = await Promise.all([
                computeHash('SHA-1', data),
                computeHash('SHA-256', data),
                computeHash('SHA-512', data)
            ]);

            // Restore the hash-results structure in the output area
            var outEl = document.getElementById('hash-output');
            outEl.innerHTML = '<div class="hash-results">'
                + '<div class="hash-row"><span class="hash-label">SHA-1:</span><span class="hash-value" id="hash-sha1"></span><button class="btn-copy" data-target="hash-sha1">Copy</button></div>'
                + '<div class="hash-row"><span class="hash-label">SHA-256:</span><span class="hash-value" id="hash-sha256"></span><button class="btn-copy" data-target="hash-sha256">Copy</button></div>'
                + '<div class="hash-row"><span class="hash-label">SHA-512:</span><span class="hash-value" id="hash-sha512"></span><button class="btn-copy" data-target="hash-sha512">Copy</button></div>'
                + '</div>';

            document.getElementById('hash-sha1').textContent = results[0];
            document.getElementById('hash-sha256').textContent = results[1];
            document.getElementById('hash-sha512').textContent = results[2];

            // Re-attach copy listeners after re-rendering
            outEl.querySelectorAll('.btn-copy').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var target = document.getElementById(btn.dataset.target);
                    if (target && target.textContent) {
                        navigator.clipboard.writeText(target.textContent).then(function () {
                            var orig = btn.textContent;
                            btn.textContent = '\u2713';
                            setTimeout(function () { btn.textContent = orig; }, 1200);
                        });
                    }
                });
            });
        } catch (e) {
            showError(document.getElementById('hash-output'), 'Hashing failed: ' + e.message);
        }
    });

    // ===== Card 2: File Hash Logic =====

    var dropZone = document.getElementById('file-drop-zone');
    var fileInput = document.getElementById('file-hash-input');

    dropZone.addEventListener('click', function () {
        fileInput.click();
    });

    dropZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', function () {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            hashFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', function () {
        if (fileInput.files.length > 0) {
            hashFile(fileInput.files[0]);
        }
    });

    async function hashFile(file) {
        var out = document.getElementById('file-hash-output');
        out.innerHTML = '<div class="result">Computing SHA-256 hash of <strong>' + escapeHtml(file.name) + '</strong> (' + formatFileSize(file.size) + ')...</div>';

        try {
            var arrayBuffer = await file.arrayBuffer();
            var hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
            var hashHex = hexEncode(hashBuffer);

            out.innerHTML = '<div class="result">'
                + '<strong>File:</strong> ' + escapeHtml(file.name) + ' (' + formatFileSize(file.size) + ')<br>'
                + '<strong>SHA-256:</strong><br>'
                + '<span style="word-break:break-all;">' + escapeHtml(hashHex) + '</span>'
                + '</div>';
        } catch (e) {
            showError(out, 'File hashing failed: ' + e.message);
        }
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        var units = ['B', 'KB', 'MB', 'GB'];
        var i = Math.floor(Math.log(bytes) / Math.log(1024));
        if (i >= units.length) i = units.length - 1;
        return (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2) + ' ' + units[i];
    }

    // ===== Card 3: Hash Comparison Logic =====

    document.getElementById('hash-compare').addEventListener('click', function () {
        var out = document.getElementById('hash-cmp-output');
        var hashA = document.getElementById('hash-cmp-a').value.trim().toLowerCase();
        var hashB = document.getElementById('hash-cmp-b').value.trim().toLowerCase();

        if (!hashA || !hashB) {
            showError(out, 'Please enter both hash values to compare.');
            return;
        }

        if (hashA === hashB) {
            out.innerHTML = '<div class="result match"><strong>Match!</strong> The two hash values are identical (' + hashA.length + ' characters).</div>';
        } else {
            // Find first difference position
            var diffPos = -1;
            var maxLen = Math.max(hashA.length, hashB.length);
            for (var i = 0; i < maxLen; i++) {
                if (i >= hashA.length || i >= hashB.length || hashA[i] !== hashB[i]) {
                    diffPos = i;
                    break;
                }
            }

            // Build highlighted comparison
            var highlightA = '';
            var highlightB = '';
            for (var j = 0; j < maxLen; j++) {
                var charA = j < hashA.length ? escapeHtml(hashA[j]) : '\u2205';
                var charB = j < hashB.length ? escapeHtml(hashB[j]) : '\u2205';
                if (j === diffPos) {
                    highlightA += '<mark>' + charA + '</mark>';
                    highlightB += '<mark>' + charB + '</mark>';
                } else {
                    highlightA += charA;
                    highlightB += charB;
                }
            }

            out.innerHTML = '<div class="result no-match">'
                + '<strong>No Match.</strong> First difference at position ' + (diffPos + 1) + '.'
                + (hashA.length !== hashB.length ? ' Lengths differ (' + hashA.length + ' vs ' + hashB.length + ').' : '')
                + '<br><br>'
                + '<strong>Hash A:</strong><br><span style="word-break:break-all;font-family:monospace;">' + highlightA + '</span><br>'
                + '<strong>Hash B:</strong><br><span style="word-break:break-all;font-family:monospace;">' + highlightB + '</span>'
                + '</div>';
        }
    });
}
