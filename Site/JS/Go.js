const canvas = document.getElementById('goBoard');
const ctx = canvas.getContext('2d');
const boardSize = 19;
const cellSize = canvas.width / (boardSize + 1);
let currentPlayer = 'B';
let board = Array(boardSize).fill().map(() => Array(boardSize).fill(null));

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    for (let i = 0; i < boardSize; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(cellSize * (i + 1), cellSize);
        ctx.lineTo(cellSize * (i + 1), canvas.height - cellSize);
        ctx.stroke();

        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(cellSize, cellSize * (i + 1));
        ctx.lineTo(canvas.width - cellSize, cellSize * (i + 1));
        ctx.stroke();
    }

    // Draw stones
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j]) {
                ctx.fillStyle = board[i][j] === 'B' ? 'black' : 'white';
                ctx.beginPath();
                ctx.arc(
                    cellSize * (i + 1),
                    cellSize * (j + 1),
                    cellSize * 0.4,
                    0,
                    2 * Math.PI
                );
                ctx.fill();
                ctx.strokeStyle = 'black';
                ctx.stroke();
            }
        }
    }
}

function getNeighbors(x, y) {
    const neighbors = [];
    if (x > 0) neighbors.push([x - 1, y]);
    if (x < boardSize - 1) neighbors.push([x + 1, y]);
    if (y > 0) neighbors.push([x, y - 1]);
    if (y < boardSize - 1) neighbors.push([x, y + 1]);
    return neighbors;
}

function getGroupLiberties(x, y, color) {
    const visited = new Set();
    const queue = [[x, y]];
    let hasLiberty = false;

    visited.add(`${x},${y}`);

    while (queue.length > 0) {
        const [cx, cy] = queue.shift();

        for (const [nx, ny] of getNeighbors(cx, cy)) {
            if (!board[nx][ny]) {
                hasLiberty = true; // Found at least one liberty
            }
            if (board[nx][ny] === color && !visited.has(`${nx},${ny}`)) {
                visited.add(`${nx},${ny}`);
                queue.push([nx, ny]);
            }
        }
    }

    return hasLiberty;
}

function findCapturedGroups(x, y, placedColor) {
    const captured = [];
    const checked = new Set();

    for (const [nx, ny] of getNeighbors(x, y)) {
        const targetColor = board[nx][ny];
        const key = `${nx},${ny}`;

        if (targetColor && targetColor !== placedColor && !checked.has(key)) {
            if (!getGroupLiberties(nx, ny, targetColor)) {
                // Collect all stones in this captured group
                const group = [];
                const queue = [[nx, ny]];
                const visited = new Set();

                visited.add(key);
                while (queue.length > 0) {
                    const [cx, cy] = queue.shift();
                    group.push([cx, cy]);

                    for (const [adjX, adjY] of getNeighbors(cx, cy)) {
                        const adjKey = `${adjX},${adjY}`;
                        if (board[adjX][adjY] === targetColor && !visited.has(adjKey)) {
                            visited.add(adjKey);
                            queue.push([adjX, adjY]);
                        }
                    }
                }
                captured.push(...group);
            }
            checked.add(key);
        }
    }
    return captured;
}

function handlePlaceStone(x, y) {
    if (board[x][y]) return;

    const originalBoard = JSON.parse(JSON.stringify(board)); // For rollback
    board[x][y] = currentPlayer;

    // Check for captured groups
    const capturedStones = findCapturedGroups(x, y, currentPlayer);

    // Check suicide rule
    const hasLiberties = getGroupLiberties(x, y, currentPlayer);

    if (capturedStones.length === 0 && !hasLiberties) {
        // Invalid suicide move
        board = originalBoard;
        return;
    }

    // Remove captured stones
    capturedStones.forEach(([cx, cy]) => {
        board[cx][cy] = null;
    });

    // Switch players
    currentPlayer = currentPlayer === 'B' ? 'W' : 'B';
    document.getElementById('turn').textContent =
        `Current Player: ${currentPlayer === 'B' ? 'Black' : 'White'}`;
}


canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / cellSize - 1);
    const y = Math.round((e.clientY - rect.top) / cellSize - 1);

    if (x >= 0 && x < boardSize && y >= 0 && y < boardSize) {
        handlePlaceStone(x, y);
        drawBoard();
    }
});

function resetGame() {
    board = Array(boardSize).fill().map(() => Array(boardSize).fill(null));
    currentPlayer = 'B';
    document.getElementById('turn').textContent = 'Current Player: Black';
    drawBoard();
}

// Initial draw
drawBoard();