// ===== Copy to Clipboard =====
document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.target);
        if (target) {
            navigator.clipboard.writeText(target.textContent).then(() => {
                const orig = btn.textContent;
                btn.textContent = '\u2713';
                setTimeout(() => btn.textContent = orig, 1200);
            });
        }
    });
});

// ===== Shared Utilities =====
function hexEncode(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function hexDecode(hex) {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return new Uint8Array(bytes);
}

function showError(el, msg) {
    el.innerHTML = '<span class="error">' + escapeHtml(msg) + '</span>';
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ===== BigInt Helpers =====
function parseBigInt(str) {
    str = str.trim().replace(/,/g, '').replace(/\s/g, '');
    if (str === '') return null;
    try { return BigInt(str); } catch { return null; }
}

function bigAbs(n) {
    return n < 0n ? -n : n;
}

function formatBig(n) {
    const s = n.toString();
    if (s.length <= 15) return s;
    const neg = s.startsWith('-');
    const digits = neg ? s.slice(1) : s;
    let formatted = '';
    for (let i = 0; i < digits.length; i++) {
        if (i > 0 && (digits.length - i) % 3 === 0) formatted += '\u2009';
        formatted += digits[i];
    }
    return (neg ? '-' : '') + formatted + ' (' + digits.length + ' digits)';
}

// ===== Modular Arithmetic =====
function modPos(a, m) {
    return ((a % m) + m) % m;
}

function extendedEuclidean(a, m) {
    const steps = [];
    let r0 = m, r1 = a;
    let s0 = 1n, s1 = 0n;
    let t0 = 0n, t1 = 1n;

    steps.push({ q: '-', r: r0, s: s0, t: t0 });
    steps.push({ q: '-', r: r1, s: s1, t: t1 });

    while (r1 !== 0n) {
        const q = r0 / r1;
        const r2 = r0 - q * r1;
        const s2 = s0 - q * s1;
        const t2 = t0 - q * t1;
        steps.push({ q, r: r2, s: s2, t: t2 });
        r0 = r1; r1 = r2;
        s0 = s1; s1 = s2;
        t0 = t1; t1 = t2;
    }

    const gcd = r0;
    let inverse = null;
    if (gcd === 1n) {
        inverse = ((t0 % m) + m) % m;
    }
    return { steps, gcd, inverse };
}

function modInverse(a, m) {
    a = modPos(a, m);
    if (a === 0n) return null;
    const result = extendedEuclidean(a, m);
    return result.gcd === 1n ? result.inverse : null;
}
