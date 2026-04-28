// ===== Template Engine =====

// Find a tool by ID
function findTool(id) {
    for (var i = 0; i < TOOLS_CONFIG.length; i++) {
        var cat = TOOLS_CONFIG[i];
        for (var j = 0; j < cat.tools.length; j++) {
            if (cat.tools[j].id === id) return { tool: cat.tools[j], category: cat.category, catIndex: i };
        }
    }
    return null;
}

// Get flat list of all tools
function getAllTools() {
    var all = [];
    TOOLS_CONFIG.forEach(function (cat) {
        cat.tools.forEach(function (tool) {
            all.push({ id: tool.id, name: tool.name, icon: tool.icon, description: tool.description, js: tool.js, category: cat.category });
        });
    });
    return all;
}

// Build the category tab bar
function renderTabbar(activeCatIndex) {
    var html = '';
    TOOLS_CONFIG.forEach(function (cat, i) {
        var cls = (i === activeCatIndex) ? 'tab active' : 'tab';
        var firstId = cat.tools[0].id;
        html += '<a class="' + cls + '" href="index.html?id=' + firstId + '">' + cat.category + '</a>';
    });
    document.getElementById('tabbar').innerHTML = html;
}

// Build the sidebar for a given category index
function renderSidebar(catIndex, activeToolId) {
    var cat = TOOLS_CONFIG[catIndex];
    var html = '<div class="sidebar-label">' + cat.category + '</div>';
    cat.tools.forEach(function (tool) {
        var cls = (tool.id === activeToolId) ? 'sidebar-item active' : 'sidebar-item';
        html += '<a class="' + cls + '" href="index.html?id=' + tool.id + '">'
            + '<span class="sidebar-icon">' + tool.icon + '</span> ' + tool.name + '</a>';
    });
    document.getElementById('sidebar').innerHTML = html;
}

// Build landing page cards (home view — shows all categories)
function renderHome() {
    // Tabs: none active (home view) — highlight first
    renderTabbar(-1);

    // Sidebar: show all tools grouped
    var sideHtml = '';
    TOOLS_CONFIG.forEach(function (cat) {
        sideHtml += '<div class="sidebar-label">' + cat.category + '</div>';
        cat.tools.forEach(function (tool) {
            sideHtml += '<a class="sidebar-item" href="index.html?id=' + tool.id + '">'
                + '<span class="sidebar-icon">' + tool.icon + '</span> ' + tool.name + '</a>';
        });
    });
    document.getElementById('sidebar').innerHTML = sideHtml;

    // Main content: card grid
    var html = '';
    TOOLS_CONFIG.forEach(function (cat) {
        html += '<section class="card-grid">';
        html += '<h2 class="section-title">' + cat.category + '</h2>';
        html += '<div class="cards">';
        cat.tools.forEach(function (tool) {
            html += '<a href="index.html?id=' + tool.id + '" class="nav-card">';
            html += '<span class="nav-card-icon">' + tool.icon + '</span>';
            html += '<h3>' + tool.name + '</h3>';
            html += '<p>' + tool.description + '</p>';
            html += '</a>';
        });
        html += '</div></section>';
    });
    document.getElementById('tool-content').innerHTML = html;
}

// Load and initialize a tool page
function loadTool(toolId) {
    var result = findTool(toolId);
    if (!result) {
        renderHome();
        return;
    }

    var tool = result.tool;
    var category = result.category;
    var catIndex = result.catIndex;

    // Page title
    document.title = tool.name + ' \u2014 Cryptography Lab';

    // Tabs & Sidebar
    renderTabbar(catIndex);
    renderSidebar(catIndex, toolId);

    // Breadcrumb
    document.getElementById('tool-content').innerHTML =
        '<div class="breadcrumb"><a href="index.html">Home</a> <span>\u203A ' + category + ' \u203A ' + tool.name + '</span></div>'
        + '<div id="tool-body"></div>';

    // Load tool script
    var script = document.createElement('script');
    script.src = 'js/' + tool.js;
    script.onload = function () {
        if (typeof toolInit === 'function') {
            toolInit(document.getElementById('tool-body'));
            // Re-bind copy buttons after tool renders
            document.querySelectorAll('.btn-copy').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var target = document.getElementById(btn.dataset.target);
                    if (target) {
                        navigator.clipboard.writeText(target.textContent).then(function () {
                            var orig = btn.textContent;
                            btn.textContent = '\u2713';
                            setTimeout(function () { btn.textContent = orig; }, 1200);
                        });
                    }
                });
            });
        }
    };
    document.body.appendChild(script);
}

// ===== App Init =====
function initApp() {
    var toolId = new URLSearchParams(window.location.search).get('id');
    if (toolId) {
        loadTool(toolId);
    } else {
        document.title = 'Cryptography Lab';
        renderHome();
    }
}
