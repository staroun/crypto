function toolInit(container) {
    container.innerHTML = '<div class="tool-card">'
        + '<h2>GCD &mdash; Euclidean Algorithm</h2>'
        + '<p class="description">Compute the Greatest Common Divisor of two integers using the Euclidean Algorithm. Each step is shown so you can follow along. Supports arbitrarily large integers.</p>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="gcd-a">a</label><input type="text" id="gcd-a" value="252" placeholder="Enter any size integer..."></div>'
        + '<div class="input-group flex-grow"><label for="gcd-b">b</label><input type="text" id="gcd-b" value="198" placeholder="Enter any size integer..."></div>'
        + '<button class="btn" id="gcd-compute">Compute GCD</button>'
        + '</div>'
        + '<div class="output-area" id="gcd-output"></div>'
        + '</div>';

    document.getElementById('gcd-compute').addEventListener('click', () => {
        const a = parseBigInt(document.getElementById('gcd-a').value);
        const b = parseBigInt(document.getElementById('gcd-b').value);
        const out = document.getElementById('gcd-output');

        if (a === null || b === null) { showError(out, 'Please enter valid integers.'); return; }
        if (a < 0n || b < 0n) { showError(out, 'Please enter non-negative integers.'); return; }

        const steps = [];
        let x = a < 0n ? -a : a, y = b < 0n ? -b : b;
        while (y !== 0n) {
            const q = x / y, r = x % y;
            steps.push({ a: x, b: y, q, r });
            x = y; y = r;
        }
        steps.push({ a: x, b: 0n, gcd: x });

        let html = '<table class="step-table"><tr><th>Step</th><th>a</th><th>b</th><th>q = a \u00F7 b</th><th>r = a mod b</th></tr>';
        for (let i = 0; i < steps.length; i++) {
            const s = steps[i];
            if (s.gcd !== undefined) {
                html += '<tr><td>' + (i+1) + '</td><td>' + formatBig(s.a) + '</td><td>0</td><td colspan="2" style="color:var(--text-dim)">b = 0, done</td></tr>';
            } else {
                html += '<tr><td>' + (i+1) + '</td><td>' + formatBig(s.a) + '</td><td>' + formatBig(s.b) + '</td><td>' + formatBig(s.q) + '</td><td>' + formatBig(s.r) + '</td></tr>';
            }
        }
        html += '</table>';
        html += '<div class="result">GCD(' + formatBig(a) + ', ' + formatBig(b) + ') = ' + formatBig(steps[steps.length-1].a) + '</div>';
        out.innerHTML = html;
    });
}
