// ===== Template Engine =====

// Build landing page cards from TOOLS_CONFIG
function generateIndex(containerId) {
    const container = document.getElementById(containerId);
    let html = '';
    TOOLS_CONFIG.forEach(cat => {
        html += '<section class="card-grid">';
        html += '<h2 class="section-title">' + cat.category + '</h2>';
        html += '<div class="cards">';
        cat.tools.forEach(tool => {
            html += '<a href="tool.html?id=' + tool.id + '" class="nav-card">';
            html += '<span class="nav-card-icon">' + tool.icon + '</span>';
            html += '<h3>' + tool.name + '</h3>';
            html += '<p>' + tool.description + '</p>';
            html += '</a>';
        });
        html += '</div></section>';
    });
    container.innerHTML = html;
}

// Find a tool by ID
function findTool(id) {
    for (const cat of TOOLS_CONFIG) {
        for (const tool of cat.tools) {
            if (tool.id === id) return { tool, category: cat.category };
        }
    }
    return null;
}

// Get flat list of all tools
function getAllTools() {
    const all = [];
    TOOLS_CONFIG.forEach(cat => {
        cat.tools.forEach(tool => {
            all.push({ ...tool, category: cat.category });
        });
    });
    return all;
}

// Load and initialize a tool page
function loadTool(toolId) {
    const result = findTool(toolId);
    if (!result) {
        document.getElementById('tool-content').innerHTML =
            '<div class="tool-card"><h2>Tool not found</h2><p>The tool "' + toolId + '" does not exist. <a href="index.html" style="color:var(--accent)">Back to home</a></p></div>';
        return;
    }

    const { tool, category } = result;

    // Page title
    document.title = tool.name + ' \u2014 Cryptography Lab';

    // Breadcrumb
    document.getElementById('breadcrumb').innerHTML =
        '<a href="index.html">Home</a> <span>\u203A ' + category + ' \u203A ' + tool.name + '</span>';

    // Prev / Next navigation
    const all = getAllTools();
    const idx = all.findIndex(t => t.id === toolId);
    let nav = '<div class="tool-nav">';
    if (idx > 0) {
        nav += '<a href="tool.html?id=' + all[idx - 1].id + '" class="tool-nav-link">\u2190 ' + all[idx - 1].name + '</a>';
    } else {
        nav += '<span></span>';
    }
    nav += '<a href="index.html" class="tool-nav-home">All Tools</a>';
    if (idx < all.length - 1) {
        nav += '<a href="tool.html?id=' + all[idx + 1].id + '" class="tool-nav-link">' + all[idx + 1].name + ' \u2192</a>';
    } else {
        nav += '<span></span>';
    }
    nav += '</div>';
    document.getElementById('tool-nav').innerHTML = nav;

    // Load tool script
    const script = document.createElement('script');
    script.src = 'js/' + tool.js;
    script.onload = () => {
        if (typeof toolInit === 'function') {
            toolInit(document.getElementById('tool-content'));
            // Re-bind copy buttons after tool renders
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
        }
    };
    document.body.appendChild(script);
}
