function toolInit(container) {
    container.innerHTML = '<div class="tool-card">'
        + '<h2>AES Encryption / Decryption</h2>'
        + '<p class="description">Encrypt and decrypt text using the AES algorithm via the Web Crypto API. Supports AES-GCM (authenticated encryption) and AES-CBC modes with 128-bit or 256-bit keys. Ciphertext is output in hex as <code>IV:ciphertext</code>.</p>'
        + '<div class="input-row">'
        + '<div class="input-group"><label for="aes-mode">Mode</label>'
        + '<select id="aes-mode"><option value="AES-GCM">AES-GCM</option><option value="AES-CBC">AES-CBC</option></select></div>'
        + '<div class="input-group"><label for="aes-keysize">Key Size</label>'
        + '<select id="aes-keysize"><option value="128">128-bit</option><option value="256">256-bit</option></select></div>'
        + '<div class="btn-row"><button class="btn btn-accent" id="aes-genkey">Generate Key</button></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="aes-key">Key (hex)</label>'
        + '<input type="text" id="aes-key" placeholder="Hex key (32 or 64 hex chars)..."></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="aes-input">Plaintext / Ciphertext</label>'
        + '<textarea id="aes-input" rows="3" placeholder="Enter plaintext to encrypt, or IV:ciphertext hex to decrypt..."></textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="btn-row">'
        + '<button class="btn" id="aes-encrypt">Encrypt</button>'
        + '<button class="btn btn-secondary" id="aes-decrypt">Decrypt</button>'
        + '</div>'
        + '</div>'
        + '<div class="output-area" id="aes-output"></div>'
        + '</div>';

    function getMode() {
        return document.getElementById('aes-mode').value;
    }

    function getKeyLength() {
        return parseInt(document.getElementById('aes-keysize').value, 10);
    }

    // Generate a random AES key and display as hex
    document.getElementById('aes-genkey').addEventListener('click', async function () {
        var out = document.getElementById('aes-output');
        try {
            var keyLen = getKeyLength();
            var key = await crypto.subtle.generateKey(
                { name: getMode(), length: keyLen },
                true,
                ['encrypt', 'decrypt']
            );
            var raw = await crypto.subtle.exportKey('raw', key);
            var hexKey = hexEncode(raw);
            document.getElementById('aes-key').value = hexKey;
            out.innerHTML = '<div class="result"><strong>Generated ' + keyLen + '-bit key:</strong><br>' + escapeHtml(hexKey) + '</div>';
        } catch (e) {
            showError(out, 'Key generation failed: ' + e.message);
        }
    });

    // Import hex key as CryptoKey
    async function importKey(hexKey, mode, usages) {
        var raw = hexDecode(hexKey);
        return crypto.subtle.importKey('raw', raw, { name: mode }, false, usages);
    }

    // Encrypt plaintext
    document.getElementById('aes-encrypt').addEventListener('click', async function () {
        var out = document.getElementById('aes-output');
        var hexKey = document.getElementById('aes-key').value.trim();
        var plaintext = document.getElementById('aes-input').value;
        var mode = getMode();

        if (!hexKey) { showError(out, 'Please enter or generate a key.'); return; }
        if (!plaintext) { showError(out, 'Please enter plaintext to encrypt.'); return; }

        var expectedLen = getKeyLength() / 4; // hex chars
        if (hexKey.length !== expectedLen) {
            showError(out, 'Key must be ' + expectedLen + ' hex characters for ' + getKeyLength() + '-bit key. Current length: ' + hexKey.length + '.');
            return;
        }

        try {
            var key = await importKey(hexKey, mode, ['encrypt']);
            var encoder = new TextEncoder();
            var data = encoder.encode(plaintext);

            var iv;
            var algoParams;
            if (mode === 'AES-GCM') {
                iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
                algoParams = { name: 'AES-GCM', iv: iv };
            } else {
                iv = crypto.getRandomValues(new Uint8Array(16)); // 128-bit IV for CBC
                algoParams = { name: 'AES-CBC', iv: iv };
            }

            var cipherBuffer = await crypto.subtle.encrypt(algoParams, key, data);
            var ivHex = hexEncode(iv);
            var ctHex = hexEncode(cipherBuffer);
            var result = ivHex + ':' + ctHex;

            out.innerHTML = '<div class="result"><strong>Ciphertext (' + escapeHtml(mode) + '):</strong><br>'
                + '<span style="word-break:break-all;">' + escapeHtml(result) + '</span></div>';
        } catch (e) {
            showError(out, 'Encryption failed: ' + e.message);
        }
    });

    // Decrypt ciphertext
    document.getElementById('aes-decrypt').addEventListener('click', async function () {
        var out = document.getElementById('aes-output');
        var hexKey = document.getElementById('aes-key').value.trim();
        var ciphertext = document.getElementById('aes-input').value.trim();
        var mode = getMode();

        if (!hexKey) { showError(out, 'Please enter or generate a key.'); return; }
        if (!ciphertext) { showError(out, 'Please enter ciphertext (IV:ciphertext in hex).'); return; }

        var expectedLen = getKeyLength() / 4;
        if (hexKey.length !== expectedLen) {
            showError(out, 'Key must be ' + expectedLen + ' hex characters for ' + getKeyLength() + '-bit key. Current length: ' + hexKey.length + '.');
            return;
        }

        var parts = ciphertext.split(':');
        if (parts.length !== 2) {
            showError(out, 'Ciphertext must be in the format IV:ciphertext (hex).');
            return;
        }

        try {
            var iv = hexDecode(parts[0]);
            var ct = hexDecode(parts[1]);
            var key = await importKey(hexKey, mode, ['decrypt']);

            var algoParams;
            if (mode === 'AES-GCM') {
                algoParams = { name: 'AES-GCM', iv: iv };
            } else {
                algoParams = { name: 'AES-CBC', iv: iv };
            }

            var plainBuffer = await crypto.subtle.decrypt(algoParams, key, ct);
            var decoder = new TextDecoder();
            var plaintext = decoder.decode(plainBuffer);

            out.innerHTML = '<div class="result"><strong>Plaintext:</strong><br>' + escapeHtml(plaintext) + '</div>';
        } catch (e) {
            showError(out, 'Decryption failed: ' + e.message + '. Check that the key, mode, and ciphertext are correct.');
        }
    });
}
