function toolInit(container) {
    container.innerHTML = ''
        // Inline style for fullscreen behavior — applies only when this card is fullscreen
        + '<style>'
        + '#aes-anim-container:fullscreen,'
        + '#aes-anim-container:-webkit-full-screen {'
        + '  width:100vw;height:100vh;min-height:0;border-radius:0;border:none;'
        + '  display:flex;align-items:center;justify-content:center;'
        + '}'
        + '#aes-anim-container:fullscreen ruffle-player,'
        + '#aes-anim-container:-webkit-full-screen ruffle-player {'
        + '  width:100% !important;height:100% !important;'
        + '}'
        + '</style>'

        + '<div class="tool-card">'
        + '<h2>AES Animation</h2>'
        + '<p class="description">Interactive AES visualization powered by <a href="https://ruffle.rs" target="_blank" rel="noopener" style="color:var(--accent);">Ruffle</a> &mdash; an open-source Flash Player emulator (WebAssembly). SWF source: <code>homepage/swf/AES.swf</code>.</p>'
        + '<div class="input-row">'
        + '<div class="btn-row">'
        + '<button class="btn btn-secondary" id="aes-anim-reload">Reload</button>'
        + '<button class="btn btn-accent" id="aes-anim-fullscreen">Fullscreen</button>'
        + '</div>'
        + '</div>'
        + '<div id="aes-anim-container" style="background:#000;border:1px solid var(--border);border-radius:6px;height:600px;display:flex;align-items:center;justify-content:center;color:var(--text-dim);font-family:var(--font-mono);font-size:0.85rem;overflow:hidden;">'
        + 'Loading Ruffle...'
        + '</div>'
        + '<div id="aes-anim-status" style="margin-top:0.6rem;color:var(--text-dim);font-size:0.82rem;"></div>'
        + '</div>';

    var SWF_PATH = 'swf/AES.swf';
    var RUFFLE_CDN = 'https://unpkg.com/@ruffle-rs/ruffle';
    var rufflePlayer = null;

    function setStatus(msg, isError) {
        var el = document.getElementById('aes-anim-status');
        el.textContent = msg;
        el.style.color = isError ? 'var(--red)' : 'var(--text-dim)';
    }

    function embedSwf() {
        var c = document.getElementById('aes-anim-container');
        c.innerHTML = '';
        try {
            var ruffle = window.RufflePlayer.newest();
            rufflePlayer = ruffle.createPlayer();
            rufflePlayer.style.width = '100%';
            rufflePlayer.style.height = '100%';
            // Maintain SWF aspect ratio with letterboxing
            if (rufflePlayer.config) {
                rufflePlayer.config = { scale: 'showAll', letterbox: 'on' };
            }
            c.appendChild(rufflePlayer);
            rufflePlayer.load({ url: SWF_PATH, scale: 'showAll', letterbox: 'on' }).then(function () {
                setStatus('Loaded ' + SWF_PATH);
            }).catch(function (err) {
                c.innerHTML = '<div style="padding:1rem;text-align:center;">'
                    + '<strong style="color:var(--red);">Failed to load SWF</strong><br>'
                    + 'Place your AES.swf file at <code>homepage/swf/AES.swf</code><br>'
                    + '<span style="font-size:0.78rem;">Error: ' + (err && err.message ? err.message : err) + '</span></div>';
                setStatus('Load failed', true);
            });
        } catch (e) {
            setStatus('Ruffle init failed: ' + e.message, true);
        }
    }

    function loadRuffle() {
        if (window.RufflePlayer) {
            embedSwf();
            return;
        }
        var script = document.createElement('script');
        script.src = RUFFLE_CDN;
        script.onload = function () {
            var tries = 0;
            var iv = setInterval(function () {
                if (window.RufflePlayer && window.RufflePlayer.newest) {
                    clearInterval(iv);
                    embedSwf();
                } else if (++tries > 50) {
                    clearInterval(iv);
                    setStatus('Ruffle loaded but RufflePlayer is unavailable. Check network or CDN.', true);
                }
            }, 100);
        };
        script.onerror = function () {
            setStatus('Failed to load Ruffle from CDN. Check network connection.', true);
            var c = document.getElementById('aes-anim-container');
            c.innerHTML = '<div style="padding:1rem;text-align:center;">'
                + '<strong style="color:var(--red);">Cannot load Ruffle</strong><br>'
                + 'Network error or CDN blocked.<br>'
                + '<span style="font-size:0.78rem;">CDN: ' + RUFFLE_CDN + '</span></div>';
        };
        document.head.appendChild(script);
    }

    document.getElementById('aes-anim-reload').addEventListener('click', function () {
        loadRuffle();
    });

    document.getElementById('aes-anim-fullscreen').addEventListener('click', function () {
        // Prefer Ruffle's built-in fullscreen which preserves aspect ratio
        if (rufflePlayer && typeof rufflePlayer.enterFullscreen === 'function') {
            try { rufflePlayer.enterFullscreen(); return; } catch (e) { /* fall through */ }
        }
        var c = document.getElementById('aes-anim-container');
        if (c.requestFullscreen) c.requestFullscreen();
        else if (c.webkitRequestFullscreen) c.webkitRequestFullscreen();
    });

    loadRuffle();
}
