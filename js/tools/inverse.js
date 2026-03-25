function toolInit(container) {
    container.innerHTML = '<div class="tool-card">'
        + '<h2>Multiplicative Inverse &mdash; Extended Euclidean Algorithm</h2>'
        + '<p class="description">Find the multiplicative inverse of <em>a</em> modulo <em>m</em> using the Extended Euclidean Algorithm. The inverse exists only when gcd(a, m) = 1. Supports arbitrarily large integers.</p>'
        + '<div class="input-row">'
        + '<div class="input-group flex-grow"><label for="inv-a">a</label><input type="text" id="inv-a" value="11" placeholder="Enter any size integer..."></div>'
        + '<div class="input-group flex-grow"><label for="inv-m">m (modulus)</label><input type="text" id="inv-m" value="26" placeholder="Enter any size integer..."></div>'
        + '<button class="btn" id="inv-compute">Find Inverse</button>'
        + '</div>'
        + '<div class="output-area" id="inv-output"></div>'
        + '</div>';

    document.getElementById('inv-compute').addEventListener('click', () => {
        const a = parseBigInt(document.getElementById('inv-a').value);
        const m = parseBigInt(document.getElementById('inv-m').value);
        const out = document.getElementById('inv-output');

        if (a === null || m === null) { showError(out, 'Please enter valid integers.'); return; }
        if (a < 1n) { showError(out, 'Please enter a \u2265 1.'); return; }
        if (m < 2n) { showError(out, 'Please enter m \u2265 2.'); return; }

        // Extended Euclidean Algorithm in the table format:
        // q | r1  r2 | r | t1  t2 | t
        const rows = [];
        let r1 = m, r2 = a;
        let t1 = 0n, t2 = 1n;

        while (r2 !== 0n) {
            const q = r1 / r2;
            const r = r1 - q * r2;
            const t = t1 - q * t2;
            rows.push({ q, r1, r2, r, t1, t2, t });
            r1 = r2; r2 = r;
            t1 = t2; t2 = t;
        }
        // Final row: r1=gcd, r2=0
        const gcd = r1;

        // Build table
        let html = '<table class="step-table">'
            + '<tr><th>q</th><th>r<sub>1</sub></th><th>r<sub>2</sub></th><th>r</th><th>t<sub>1</sub></th><th>t<sub>2</sub></th><th>t</th></tr>';
        for (let i = 0; i < rows.length; i++) {
            const s = rows[i];
            html += '<tr>'
                + '<td>' + formatBig(s.q) + '</td>'
                + '<td>' + formatBig(s.r1) + '</td>'
                + '<td>' + formatBig(s.r2) + '</td>'
                + '<td>' + formatBig(s.r) + '</td>'
                + '<td>' + formatBig(s.t1) + '</td>'
                + '<td>' + formatBig(s.t2) + '</td>'
                + '<td>' + formatBig(s.t) + '</td>'
                + '</tr>';
        }
        // Bottom row: final r1, r2 and t1, t2
        html += '<tr style="border-top:2px solid var(--border);">'
            + '<td></td>'
            + '<td>' + formatBig(r1) + '</td>'
            + '<td>' + formatBig(r2) + '</td>'
            + '<td></td>'
            + '<td>' + formatBig(t1) + '</td>'
            + '<td>' + formatBig(t2) + '</td>'
            + '<td></td>'
            + '</tr>';
        html += '</table>';

        html += '<div style="margin-top:0.5rem;color:var(--text-dim);font-size:0.85rem;">'
            + 'r = r<sub>1</sub> \u2212 q \u00D7 r<sub>2</sub> &emsp; t = t<sub>1</sub> \u2212 q \u00D7 t<sub>2</sub>'
            + '</div>';

        if (gcd !== 1n) {
            html += '<div class="error" style="margin-top:0.5rem;">gcd(' + formatBig(a) + ', ' + formatBig(m) + ') = ' + formatBig(gcd) + ' \u2260 1<br>Multiplicative inverse does NOT exist.</div>';
        } else {
            const inverse = ((t1 % m) + m) % m;
            html += '<div class="result">gcd(' + formatBig(a) + ', ' + formatBig(m) + ') = 1<br>'
                + formatBig(a) + '<sup>\u22121</sup> mod ' + formatBig(m) + ' = ' + formatBig(inverse) + '</div>';
            const verify = (a * inverse) % m;
            html += '<div style="margin-top:0.3rem;color:var(--text-dim);font-size:0.85rem;">Verification: '
                + formatBig(a) + ' \u00D7 ' + formatBig(inverse) + ' mod ' + formatBig(m) + ' = ' + formatBig(verify);
            if (verify === 1n) html += ' <span class="match">\u2713 Correct</span>';
            html += '</div>';
        }
        out.innerHTML = html;
    });
}
