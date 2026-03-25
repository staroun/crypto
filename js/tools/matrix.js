function toolInit(container) {
    container.innerHTML = '<div class="tool-card">'
        + '<h2>Matrix Inverse over \u2124<sub>m</sub></h2>'
        + '<p class="description">Compute the inverse of a square matrix modulo <em>m</em> using Gauss-Jordan elimination. Used in Hill cipher and lattice-based cryptography. The inverse exists only when det(A) is coprime to m.</p>'
        + '<div class="input-row">'
        + '<div class="input-group"><label for="mat-size">Matrix Size</label><select id="mat-size"><option value="2" selected>2 \u00D7 2</option><option value="3">3 \u00D7 3</option><option value="4">4 \u00D7 4</option><option value="5">5 \u00D7 5</option></select></div>'
        + '<div class="input-group flex-grow"><label for="mat-mod">Modulus m</label><input type="text" id="mat-mod" value="26" placeholder="e.g. 26"></div>'
        + '<button class="btn btn-accent" id="mat-resize">Apply Size</button>'
        + '</div>'
        + '<div class="input-row"><div class="input-group flex-grow"><label>Matrix A (enter values row by row)</label><div class="matrix-grid" id="mat-grid"></div></div></div>'
        + '<div class="btn-row"><button class="btn" id="mat-compute">Compute Inverse</button><button class="btn btn-secondary" id="mat-det">Compute Determinant</button><button class="btn btn-accent" id="mat-example">Load Example</button></div>'
        + '<div class="output-area" id="mat-output"></div>'
        + '</div>';

    var matSize = 2;

    function buildMatrixGrid() {
        var n = parseInt(document.getElementById('mat-size').value, 10);
        matSize = n;
        var grid = document.getElementById('mat-grid');
        grid.style.gridTemplateColumns = 'repeat(' + n + ', 60px)';
        grid.innerHTML = '';
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                var inp = document.createElement('input');
                inp.type = 'text'; inp.id = 'mat-' + i + '-' + j;
                inp.value = (i === j) ? '1' : '0';
                inp.setAttribute('autocomplete', 'off');
                grid.appendChild(inp);
            }
        }
    }
    buildMatrixGrid();

    document.getElementById('mat-resize').addEventListener('click', buildMatrixGrid);

    document.getElementById('mat-example').addEventListener('click', function() {
        var n = matSize;
        var examples = { 2:[[6,24],[1,16]], 3:[[6,24,1],[13,16,10],[20,17,15]], 4:[[5,8,1,2],[4,3,7,6],[2,1,9,3],[1,4,2,5]], 5:[[2,1,3,0,1],[1,0,2,1,3],[3,2,1,1,0],[0,1,1,2,1],[1,3,0,1,2]] };
        var ex = examples[n] || examples[2];
        for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) { var el = document.getElementById('mat-'+i+'-'+j); if (el && ex[i]) el.value = ex[i][j] !== undefined ? ex[i][j] : 0; }
        document.getElementById('mat-mod').value = '26';
    });

    function readMatrix() {
        var n = matSize, mat = [];
        for (var i = 0; i < n; i++) { mat[i] = []; for (var j = 0; j < n; j++) { var v = parseBigInt(document.getElementById('mat-'+i+'-'+j).value); if (v === null) return null; mat[i][j] = v; } }
        return mat;
    }

    function matDet(mat, m) {
        var n = mat.length;
        if (n === 1) return modPos(mat[0][0], m);
        if (n === 2) return modPos(mat[0][0]*mat[1][1] - mat[0][1]*mat[1][0], m);
        var det = 0n;
        for (var j = 0; j < n; j++) { var minor = []; for (var i = 1; i < n; i++) minor.push(mat[i].filter(function(_,k){return k!==j;})); det = modPos(det + (j%2===0?1n:-1n)*mat[0][j]*matDet(minor,m), m); }
        return modPos(det, m);
    }

    function matInverseMod(mat, m) {
        var n = mat.length, steps = [], aug = [];
        for (var i = 0; i < n; i++) { aug[i] = []; for (var j = 0; j < n; j++) aug[i][j] = modPos(mat[i][j],m); for (var j = 0; j < n; j++) aug[i][n+j] = (i===j)?1n:0n; }
        steps.push({label:'Initial augmented matrix [A | I]', matrix:aug.map(function(r){return r.slice();})});
        for (var col = 0; col < n; col++) {
            var pivotRow = -1;
            for (var row = col; row < n; row++) { if (aug[row][col] !== 0n && modInverse(aug[row][col],m) !== null) { pivotRow = row; break; } }
            if (pivotRow === -1) return {success:false, steps:steps, reason:'No invertible pivot in column '+col+'. Matrix is singular mod '+m+'.'};
            if (pivotRow !== col) { var tmp = aug[col]; aug[col] = aug[pivotRow]; aug[pivotRow] = tmp; steps.push({label:'Swap R'+col+' \u2194 R'+pivotRow, matrix:aug.map(function(r){return r.slice();})}); }
            var pivotInv = modInverse(aug[col][col], m);
            for (var j = 0; j < 2*n; j++) aug[col][j] = modPos(aug[col][j]*pivotInv, m);
            steps.push({label:'R'+col+' \u2190 R'+col+' \u00D7 '+pivotInv+' (mod '+m+')', matrix:aug.map(function(r){return r.slice();})});
            for (var row = 0; row < n; row++) { if (row===col||aug[row][col]===0n) continue; var factor = aug[row][col]; for (var j = 0; j < 2*n; j++) aug[row][j] = modPos(aug[row][j]-factor*aug[col][j],m); steps.push({label:'R'+row+' \u2190 R'+row+' \u2212 '+factor+'\u00B7R'+col+' (mod '+m+')', matrix:aug.map(function(r){return r.slice();})}); }
        }
        var inv = []; for (var i = 0; i < n; i++) inv[i] = aug[i].slice(n);
        return {success:true, steps:steps, inverse:inv};
    }

    function renderMatrixHtml(mat, n, totalCols) {
        var cols = totalCols || mat[0].length;
        var html = '<div class="matrix-display" style="grid-template-columns:repeat('+cols+',auto)">';
        for (var i = 0; i < mat.length; i++) for (var j = 0; j < cols; j++) { var val = mat[i][j]!==undefined?mat[i][j].toString():'0'; var sep = (totalCols>n&&j===n-1)?'border-right:2px solid var(--accent);padding-right:0.6rem;':''; html += '<span style="'+sep+'">'+val+'</span>'; }
        html += '</div>'; return html;
    }

    document.getElementById('mat-det').addEventListener('click', function() {
        var out = document.getElementById('mat-output'), mat = readMatrix(), m = parseBigInt(document.getElementById('mat-mod').value);
        if (!mat) { showError(out, 'Please enter valid integers in all matrix cells.'); return; }
        if (m === null || m < 2n) { showError(out, 'Please enter modulus m \u2265 2.'); return; }
        var det = matDet(mat,m), inv = modInverse(det,m);
        var html = '<span class="highlight">det(A) mod '+m+' = '+det+'</span>';
        if (det===0n) html += '<br><span class="error">Determinant is 0. Matrix is singular.</span>';
        else if (inv===null) html += '<br><span class="error">gcd('+det+', '+m+') \u2260 1. Not invertible mod '+m+'.</span>';
        else html += '<br><span class="match">det\u207B\u00B9 mod '+m+' = '+inv+' \u2192 Matrix is invertible.</span>';
        out.innerHTML = html;
    });

    document.getElementById('mat-compute').addEventListener('click', function() {
        var out = document.getElementById('mat-output'), mat = readMatrix(), m = parseBigInt(document.getElementById('mat-mod').value), n = matSize;
        if (!mat) { showError(out, 'Please enter valid integers in all matrix cells.'); return; }
        if (m === null || m < 2n) { showError(out, 'Please enter modulus m \u2265 2.'); return; }
        var det = matDet(mat,m), result = matInverseMod(mat,m);
        var html = '<span class="highlight">det(A) mod '+m+' = '+det+'</span><br><br><strong>Gauss-Jordan Elimination Steps:</strong><br>';
        result.steps.forEach(function(step) { html += '<div style="margin:0.5rem 0;"><em>'+step.label+'</em>'+renderMatrixHtml(step.matrix,n,2*n)+'</div>'; });
        if (!result.success) { html += '<span class="error">'+result.reason+'</span>'; }
        else {
            html += '<br><span class="result">A\u207B\u00B9 mod '+m+' =</span>'+renderMatrixHtml(result.inverse,n,n);
            var product = [];
            for (var i=0;i<n;i++){product[i]=[];for(var j=0;j<n;j++){var sum=0n;for(var k=0;k<n;k++)sum+=modPos(mat[i][k],m)*result.inverse[k][j];product[i][j]=modPos(sum,m);}}
            html += '<br><span class="highlight">Verification: A \u00D7 A\u207B\u00B9 mod '+m+' =</span>'+renderMatrixHtml(product,n,n);
            if (product.every(function(row,i){return row.every(function(v,j){return v===(i===j?1n:0n);});})) html += '<span class="match">\u2713 Verified: identity matrix.</span>';
        }
        out.innerHTML = html;
    });
}
