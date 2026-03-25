function toolInit(container) {
    container.innerHTML = ''
        // ===== Card 1: Encode =====
        + '<div class="tool-card">'
        + '<h2>LSB Steganography &mdash; Encode</h2>'
        + '<p class="description">Hide a secret message inside an image by modifying the Least Significant Bit (LSB) of each color channel (R, G, B). The message is converted to binary, and each bit replaces the LSB of successive channel values. A null byte (00000000) is appended as an end-of-message marker.</p>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label>Cover Image</label>'
        + '<div class="drop-zone" id="encode-drop-zone">'
        + '<p>Drag &amp; drop an image here, or click to select</p>'
        + '<input type="file" id="encode-file-input" hidden accept="image/*">'
        + '</div></div>'
        + '</div>'
        + '<div id="encode-capacity"></div>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="encode-message">Secret Message</label>'
        + '<textarea id="encode-message" rows="3" placeholder="Enter the secret message to hide...">Hello, World!</textarea></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="btn-row"><button class="btn" id="encode-btn">Encode Message</button></div>'
        + '</div>'
        + '<div class="output-area" id="encode-output"></div>'
        + '</div>'

        // ===== Card 2: Decode =====
        + '<div class="tool-card">'
        + '<h2>LSB Steganography &mdash; Decode</h2>'
        + '<p class="description">Extract a hidden message from a stego image by reading the LSB of each R, G, B channel. Extraction stops when a null byte (all zero bits) is found.</p>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label>Stego Image</label>'
        + '<div class="drop-zone" id="decode-drop-zone">'
        + '<p>Drag &amp; drop a stego image here, or click to select</p>'
        + '<input type="file" id="decode-file-input" hidden accept="image/*">'
        + '</div></div>'
        + '</div>'
        + '<div class="input-row">'
        + '<div class="btn-row"><button class="btn btn-secondary" id="decode-btn">Decode Message</button></div>'
        + '</div>'
        + '<div class="output-area" id="decode-output"></div>'
        + '</div>'

        // ===== Card 3: LSB Bit Visualization =====
        + '<div class="tool-card">'
        + '<h2>LSB Bit Visualization</h2>'
        + '<p class="description">Visualize how a single character is embedded into pixel data using LSB substitution. Three random pixels (9 channel values: 3 &times; RGB) are generated, and the 8 bits of the character replace the LSB of the first 8 channels. The 9th channel remains unchanged.</p>'
        + '<div class="input-row">'
        + '<div class="input-group"><label for="viz-char">Single Character</label>'
        + '<input type="text" id="viz-char" value="A" maxlength="1" style="width:60px;text-align:center;"></div>'
        + '<div class="btn-row"><button class="btn btn-accent" id="viz-btn">Visualize</button></div>'
        + '</div>'
        + '<div class="output-area" id="viz-output"></div>'
        + '</div>';

    // ===== Shared state =====
    var encodeImage = null; // stores the loaded cover image as an Image object
    var decodeImage = null;

    // ===== Helper: set up a drop zone =====
    function setupDropZone(zoneId, inputId, callback) {
        var zone = document.getElementById(zoneId);
        var input = document.getElementById(inputId);

        zone.addEventListener('click', function () {
            input.click();
        });

        zone.addEventListener('dragover', function (e) {
            e.preventDefault();
            zone.classList.add('dragover');
        });

        zone.addEventListener('dragleave', function () {
            zone.classList.remove('dragover');
        });

        zone.addEventListener('drop', function (e) {
            e.preventDefault();
            zone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                callback(e.dataTransfer.files[0]);
            }
        });

        input.addEventListener('change', function () {
            if (input.files.length > 0) {
                callback(input.files[0]);
            }
        });
    }

    // ===== Helper: load image file into an Image object =====
    function loadImage(file, callback) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var img = new Image();
            img.onload = function () {
                callback(img);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // ===== Card 1: Encode setup =====
    setupDropZone('encode-drop-zone', 'encode-file-input', function (file) {
        loadImage(file, function (img) {
            encodeImage = img;
            var zone = document.getElementById('encode-drop-zone');
            zone.innerHTML = '<p>Loaded: <strong>' + escapeHtml(file.name) + '</strong> (' + img.width + ' &times; ' + img.height + ')</p>'
                + '<input type="file" id="encode-file-input" hidden accept="image/*">';
            // Re-attach the file input listener
            document.getElementById('encode-file-input').addEventListener('change', function () {
                if (this.files.length > 0) {
                    loadImage(this.files[0], function (newImg) {
                        encodeImage = newImg;
                    });
                }
            });

            // Show capacity
            var totalPixels = img.width * img.height;
            var totalChannels = totalPixels * 3; // R, G, B only
            var maxBytes = Math.floor(totalChannels / 8) - 1; // minus 1 for null terminator
            document.getElementById('encode-capacity').innerHTML = '<div class="result">'
                + '<strong>Image Capacity:</strong> ' + totalPixels.toLocaleString() + ' pixels &times; 3 channels = '
                + totalChannels.toLocaleString() + ' bits available<br>'
                + '<strong>Maximum message size:</strong> ' + maxBytes.toLocaleString() + ' characters (bytes)'
                + '</div>';
        });
    });

    // ===== Card 1: Encode button =====
    document.getElementById('encode-btn').addEventListener('click', function () {
        var out = document.getElementById('encode-output');
        var message = document.getElementById('encode-message').value;

        if (!encodeImage) { showError(out, 'Please load a cover image first.'); return; }
        if (!message) { showError(out, 'Please enter a secret message.'); return; }

        // Draw image to canvas to get pixel data
        var canvas = document.createElement('canvas');
        canvas.width = encodeImage.width;
        canvas.height = encodeImage.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(encodeImage, 0, 0);
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var pixels = imageData.data;

        // Convert message to bits + null terminator
        var bits = '';
        for (var i = 0; i < message.length; i++) {
            bits += message.charCodeAt(i).toString(2).padStart(8, '0');
        }
        bits += '00000000'; // null byte end marker

        // Check capacity (3 usable channels per pixel: R, G, B; skip Alpha)
        var totalChannels = (pixels.length / 4) * 3;
        if (bits.length > totalChannels) {
            showError(out, 'Message is too long for this image. Need ' + bits.length
                + ' bits but image only has ' + totalChannels + ' usable channel bits.');
            return;
        }

        // Embed bits into LSB of R, G, B channels (skip alpha)
        var bitIdx = 0;
        for (var p = 0; p < pixels.length && bitIdx < bits.length; p++) {
            // Skip alpha channel (every 4th byte: index 3, 7, 11, ...)
            if ((p + 1) % 4 === 0) continue;

            var bit = parseInt(bits[bitIdx], 10);
            pixels[p] = (pixels[p] & 0xFE) | bit;
            bitIdx++;
        }

        // Put modified data back
        ctx.putImageData(imageData, 0, 0);

        // Also draw the original for side-by-side comparison
        var origCanvas = document.createElement('canvas');
        origCanvas.width = encodeImage.width;
        origCanvas.height = encodeImage.height;
        var origCtx = origCanvas.getContext('2d');
        origCtx.drawImage(encodeImage, 0, 0);

        // Build output with side-by-side canvases
        var html = '<div class="result"><strong>Message encoded successfully!</strong><br>'
            + escapeHtml(message.length.toString()) + ' characters + 1 null byte = '
            + bits.length + ' bits embedded into LSBs.</div>';
        html += '<div class="canvas-row">'
            + '<div class="canvas-box"><h3>Original</h3><div id="encode-orig-canvas"></div></div>'
            + '<div class="canvas-box"><h3>Stego Image</h3><div id="encode-stego-canvas"></div></div>'
            + '</div>';
        html += '<div class="result" id="encode-download"></div>';

        out.innerHTML = html;

        // Apply responsive sizing to canvases
        origCanvas.style.maxWidth = '100%';
        origCanvas.style.height = 'auto';
        canvas.style.maxWidth = '100%';
        canvas.style.height = 'auto';

        document.getElementById('encode-orig-canvas').appendChild(origCanvas);
        document.getElementById('encode-stego-canvas').appendChild(canvas);

        // Create download link
        var downloadUrl = canvas.toDataURL('image/png');
        var downloadEl = document.getElementById('encode-download');
        downloadEl.innerHTML = '<a href="' + downloadUrl + '" download="stego-image.png" class="btn btn-accent" '
            + 'style="display:inline-block;text-decoration:none;">Download Stego Image (PNG)</a>';
    });

    // ===== Card 2: Decode setup =====
    setupDropZone('decode-drop-zone', 'decode-file-input', function (file) {
        loadImage(file, function (img) {
            decodeImage = img;
            var zone = document.getElementById('decode-drop-zone');
            zone.innerHTML = '<p>Loaded: <strong>' + escapeHtml(file.name) + '</strong> (' + img.width + ' &times; ' + img.height + ')</p>'
                + '<input type="file" id="decode-file-input" hidden accept="image/*">';
            document.getElementById('decode-file-input').addEventListener('change', function () {
                if (this.files.length > 0) {
                    loadImage(this.files[0], function (newImg) {
                        decodeImage = newImg;
                    });
                }
            });
        });
    });

    // ===== Card 2: Decode button =====
    document.getElementById('decode-btn').addEventListener('click', function () {
        var out = document.getElementById('decode-output');

        if (!decodeImage) { showError(out, 'Please load a stego image first.'); return; }

        // Draw image to canvas and read pixel data
        var canvas = document.createElement('canvas');
        canvas.width = decodeImage.width;
        canvas.height = decodeImage.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(decodeImage, 0, 0);
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var pixels = imageData.data;

        // Extract LSBs from R, G, B channels
        var bits = '';
        var decoded = '';
        var bytes = [];
        var done = false;

        for (var p = 0; p < pixels.length && !done; p++) {
            // Skip alpha channel
            if ((p + 1) % 4 === 0) continue;

            bits += (pixels[p] & 1).toString();

            // Every 8 bits, check for null byte
            if (bits.length % 8 === 0) {
                var byte = bits.substring(bits.length - 8);
                var code = parseInt(byte, 2);
                if (code === 0) {
                    done = true;
                } else {
                    bytes.push({ binary: byte, decimal: code, character: String.fromCharCode(code) });
                    decoded += String.fromCharCode(code);
                }
            }
        }

        if (bytes.length === 0) {
            showError(out, 'No hidden message found. The image may not contain steganographic data, or the null terminator was the first byte.');
            return;
        }

        // Build output
        var html = '<div class="result"><strong>Decoded Message:</strong><br>'
            + '<pre style="white-space:pre-wrap;word-break:break-all;">' + escapeHtml(decoded) + '</pre></div>';

        html += '<table class="step-table"><tr><th>Byte #</th><th>Binary</th><th>Decimal</th><th>Character</th></tr>';
        for (var i = 0; i < bytes.length; i++) {
            html += '<tr><td>' + (i + 1) + '</td><td>' + bytes[i].binary + '</td><td>'
                + bytes[i].decimal + '</td><td>' + escapeHtml(bytes[i].character) + '</td></tr>';
        }
        html += '</table>';

        out.innerHTML = html;
    });

    // ===== Card 3: LSB Bit Visualization =====
    document.getElementById('viz-btn').addEventListener('click', function () {
        var ch = document.getElementById('viz-char').value;
        var out = document.getElementById('viz-output');

        if (!ch || ch.length !== 1) { showError(out, 'Please enter exactly one character.'); return; }

        var code = ch.charCodeAt(0);
        if (code > 255) { showError(out, 'Character must be in the ASCII range (0\u2013255).'); return; }

        var charBits = code.toString(2).padStart(8, '0');

        // Generate 9 random byte values (3 pixels x RGB)
        var origValues = [];
        for (var i = 0; i < 9; i++) {
            origValues.push(Math.floor(Math.random() * 256));
        }

        // Compute stego values: replace LSB of first 8 channels with char bits; 9th unchanged
        var stegoValues = [];
        for (var i = 0; i < 9; i++) {
            if (i < 8) {
                var bit = parseInt(charBits[i], 10);
                stegoValues.push((origValues[i] & 0xFE) | bit);
            } else {
                stegoValues.push(origValues[i]); // unchanged
            }
        }

        // Build table
        var html = '<div class="result"><strong>Character:</strong> ' + escapeHtml(ch)
            + ' &nbsp;&nbsp; <strong>ASCII:</strong> ' + code
            + ' &nbsp;&nbsp; <strong>Binary:</strong> ' + charBits + '</div>';

        html += '<table class="step-table">';

        // Header row
        html += '<tr><th></th>';
        for (var px = 0; px < 3; px++) {
            html += '<th>Pixel ' + (px + 1) + ' (R)</th><th>Pixel ' + (px + 1) + ' (G)</th><th>Pixel ' + (px + 1) + ' (B)</th>';
        }
        html += '</tr>';

        // Original row: show 8-bit binary with LSB underlined
        html += '<tr><td><strong>Original</strong></td>';
        for (var i = 0; i < 9; i++) {
            var bin = origValues[i].toString(2).padStart(8, '0');
            var upperBits = bin.substring(0, 7);
            var lsb = bin.substring(7);
            html += '<td style="font-family:monospace;">' + upperBits + '<u>' + lsb + '</u></td>';
        }
        html += '</tr>';

        // Stego row: changed LSBs in red, unchanged in green
        html += '<tr><td><strong>Stego</strong></td>';
        for (var i = 0; i < 9; i++) {
            var bin = stegoValues[i].toString(2).padStart(8, '0');
            var upperBits = bin.substring(0, 7);
            var lsb = bin.substring(7);
            if (i < 8) {
                // Check if LSB changed
                var origLsb = origValues[i] & 1;
                var stegoLsb = stegoValues[i] & 1;
                if (origLsb !== stegoLsb) {
                    html += '<td style="font-family:monospace;">' + upperBits + '<span class="no-match" style="font-weight:bold;">' + lsb + '</span></td>';
                } else {
                    html += '<td style="font-family:monospace;">' + upperBits + '<span class="match" style="font-weight:bold;">' + lsb + '</span></td>';
                }
            } else {
                // 9th channel unchanged
                html += '<td style="font-family:monospace;">' + upperBits + '<span class="match" style="font-weight:bold;">' + lsb + '</span></td>';
            }
        }
        html += '</tr>';

        // Hidden bit row
        html += '<tr><td><strong>Hidden Bit</strong></td>';
        for (var i = 0; i < 9; i++) {
            if (i < 8) {
                html += '<td class="highlight" style="font-family:monospace;text-align:center;font-weight:bold;">' + charBits[i] + '</td>';
            } else {
                html += '<td style="text-align:center;color:#999;">&mdash;</td>';
            }
        }
        html += '</tr>';

        // Decimal values row for reference
        html += '<tr><td><strong>Original (dec)</strong></td>';
        for (var i = 0; i < 9; i++) {
            html += '<td style="text-align:center;">' + origValues[i] + '</td>';
        }
        html += '</tr>';

        html += '<tr><td><strong>Stego (dec)</strong></td>';
        for (var i = 0; i < 9; i++) {
            html += '<td style="text-align:center;">' + stegoValues[i] + '</td>';
        }
        html += '</tr>';

        html += '</table>';

        html += '<div class="result"><strong>Summary:</strong> The 8 bits of <code>' + escapeHtml(ch)
            + '</code> (' + charBits + ') are embedded into the LSBs of the first 8 channel values. '
            + 'The 9th channel (Pixel 3 Blue) is not modified. '
            + '<span class="match" style="font-weight:bold;">Green</span> = LSB unchanged, '
            + '<span class="no-match" style="font-weight:bold;">Red</span> = LSB modified.</div>';

        out.innerHTML = html;
    });
}
