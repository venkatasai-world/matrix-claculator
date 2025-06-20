const MatrixOps = {
  validate(matrix) {
    const rowLength = matrix[0].length;
    return matrix.every(row => row.length === rowLength);
  },

  add(a, b) {
    return a.map((row, i) => row.map((v, j) => v + b[i][j]));
  },

  subtract(a, b) {
    return a.map((row, i) => row.map((v, j) => v - b[i][j]));
  },

  multiply(a, b) {
    const result = [];
    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < b[0].length; j++) {
        result[i][j] = a[i].reduce((sum, val, k) => sum + val * b[k][j], 0);
      }
    }
    return result;
  },

  transpose(m) {
    return m[0].map((_, i) => m.map(row => row[i]));
  },

  determinant(m) {
    if (m.length === 1) return m[0][0];
    if (m.length === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
    return m[0].reduce((det, _, i) => {
      const sub = m.slice(1).map(r => r.filter((_, j) => j !== i));
      return det + Math.pow(-1, i) * m[0][i] * MatrixOps.determinant(sub);
    }, 0);
  },

  rank(m) {
    const r = m.map(row => [...row]);
    let rank = 0;
    const eps = 1e-10;
    const visited = Array(m.length).fill(false);

    for (let j = 0; j < m[0].length; j++) {
      for (let i = 0; i < m.length; i++) {
        if (!visited[i] && Math.abs(r[i][j]) > eps) {
          rank++;
          visited[i] = true;
          const pivot = r[i][j];
          for (let k = j; k < r[0].length; k++) r[i][k] /= pivot;
          for (let x = 0; x < r.length; x++) {
            if (x !== i) {
              const factor = r[x][j];
              for (let k = j; k < r[0].length; k++) r[x][k] -= factor * r[i][k];
            }
          }
          break;
        }
      }
    }
    return rank;
  },

  trace(m) {
    return m.reduce((sum, row, i) => sum + row[i], 0);
  }
};

let state = {
  matrixCount: 1,
  matrixRows: 2,
  matrixCols: 2,
  selectedOperation: null
};

function setMatrixCount(count) {
  document.querySelectorAll('#matrix-count-options li').forEach(el => el.classList.remove('selected'));
  event.target.classList.add('selected');
  state.matrixCount = count;
  updateDimensionOptions();
  renderMatrices();
}

function updateDimensionOptions() {
  const options = [
    { label: '2x2', rows: 2, cols: 2 },
    { label: '3x3', rows: 3, cols: 3 },
    { label: '2x3', rows: 2, cols: 3 },
    { label: '3x2', rows: 3, cols: 2 }
  ];
  document.getElementById('dimension-options').innerHTML =
    options.map(d => `<li onclick="setMatrixSize(${d.rows}, ${d.cols})">${d.label}</li>`).join('');
}

function setMatrixSize(rows, cols) {
  document.querySelectorAll('#dimension-options li').forEach(el => el.classList.remove('selected'));
  event.target.classList.add('selected');
  state.matrixRows = rows;
  state.matrixCols = cols;
  renderMatrices();
}

function setOperation(op) {
  document.querySelectorAll('#operation-options li').forEach(el => el.classList.remove('selected'));
  event.target.classList.add('selected');
  state.selectedOperation = op;
}

function renderMatrices() {
  const container = document.getElementById('matrix-area');
  container.innerHTML = '';
  for (let i = 0; i < state.matrixCount; i++) {
    const grid = Array(state.matrixRows * state.matrixCols).fill().map(() => '<input type="number" value="0">').join('');
    container.innerHTML += `<div class="matrix"><h3>Matrix ${i + 1}</h3><div class="matrix-grid" style="grid-template-columns: repeat(${state.matrixCols}, auto)">${grid}</div></div>`;
  }
}

function getMatrixFromInputs(index) {
  const inputs = document.getElementsByClassName('matrix-grid')[index].getElementsByTagName('input');
  const matrix = [];
  for (let i = 0; i < state.matrixRows; i++) {
    const row = [];
    for (let j = 0; j < state.matrixCols; j++) {
      row.push(parseFloat(inputs[i * state.matrixCols + j].value));
    }
    matrix.push(row);
  }
  return matrix;
}

function calculateResult() {
  const resultDisplay = document.getElementById('result-display');
  const errorDisplay = document.getElementById('error-display');
  resultDisplay.innerHTML = '<h3>Result</h3>';
  errorDisplay.textContent = '';
  try {
    const matrices = Array.from({ length: state.matrixCount }, (_, i) => getMatrixFromInputs(i));
    let result;
    switch (state.selectedOperation) {
      case 'add': result = MatrixOps.add(matrices[0], matrices[1]); break;
      case 'subtract': result = MatrixOps.subtract(matrices[0], matrices[1]); break;
      case 'multiply': result = MatrixOps.multiply(matrices[0], matrices[1]); break;
      case 'transpose': result = MatrixOps.transpose(matrices[0]); break;
      case 'determinant': result = MatrixOps.determinant(matrices[0]); break;
      case 'rank': result = MatrixOps.rank(matrices[0]); break;
      case 'trace': result = MatrixOps.trace(matrices[0]); break;
      default: throw new Error('Please select an operation');
    }
    resultDisplay.innerHTML += `<pre>${formatResult(result)}</pre>`;
  } catch (e) {
    errorDisplay.textContent = e.message;
  }
}

function formatResult(res) {
  if (typeof res === 'number') return res.toFixed(2);
  if (Array.isArray(res)) {
    return res.map(row => row.map(v => v.toFixed(2).padStart(6)).join(' ')).join('\n');
  }
  return JSON.stringify(res);
}

updateDimensionOptions();
renderMatrices();
