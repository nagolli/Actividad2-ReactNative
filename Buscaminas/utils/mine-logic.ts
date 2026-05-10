export type Cell = {
  hasBomb: boolean;
  revealed: boolean;
  flagged: boolean;
  neighborBombs: number;
};

export const normalizeBombCount = (rows: number, columns: number, bombs: number) => {
  const totalCells = rows * columns;
  return Math.max(1, Math.min(bombs, totalCells - 1));
};

export const createBoard = (rows: number, columns: number, bombs: number): Cell[][] => {
  const board: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => ({
      hasBomb: false,
      revealed: false,
      flagged: false,
      neighborBombs: 0,
    }))
  );

  const totalCells = rows * columns;
  const bombCount = normalizeBombCount(rows, columns, bombs);
  const bombIndexes = new Set<number>();

  while (bombIndexes.size < bombCount) {
    bombIndexes.add(Math.floor(Math.random() * totalCells));
  }

  for (const index of bombIndexes) {
    const row = Math.floor(index / columns);
    const col = index % columns;
    board[row][col].hasBomb = true;
  }

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      if (board[row][col].hasBomb) continue;

      let nearbyBombs = 0;
      for (let r = row - 1; r <= row + 1; r += 1) {
        for (let c = col - 1; c <= col + 1; c += 1) {
          if (r === row && c === col) continue;
          if (r < 0 || c < 0 || r >= rows || c >= columns) continue;
          if (board[r][c].hasBomb) nearbyBombs += 1;
        }
      }
      board[row][col].neighborBombs = nearbyBombs;
    }
  }

  return board;
};

export const cloneBoard = (board: Cell[][]): Cell[][] =>
  board.map((row) => row.map((cell) => ({ ...cell })));

export const revealConnectedArea = (board: Cell[][], startRow: number, startCol: number) => {
  const rows = board.length;
  const columns = board[0].length;
  const queue: [number, number][] = [[startRow, startCol]];

  while (queue.length > 0) {
    const next = queue.shift();
    if (!next) break;

    const [row, col] = next;
    const cell = board[row][col];

    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;

    if (cell.neighborBombs !== 0) continue;

    for (let r = row - 1; r <= row + 1; r += 1) {
      for (let c = col - 1; c <= col + 1; c += 1) {
        if (r === row && c === col) continue;
        if (r < 0 || c < 0 || r >= rows || c >= columns) continue;

        const neighbor = board[r][c];
        if (!neighbor.revealed && !neighbor.hasBomb && !neighbor.flagged) {
          queue.push([r, c]);
        }
      }
    }
  }
};

export const countFlags = (board: Cell[][]) => {
  let total = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell.flagged) total += 1;
    }
  }
  return total;
};

const countHiddenCells = (board: Cell[][]) => {
  let total = 0;
  for (const row of board) {
    for (const cell of row) {
      if (!cell.revealed) total += 1;
    }
  }
  return total;
};

const hasWonByRevealedCells = (board: Cell[][]) => {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.hasBomb && !cell.revealed) {
        return false;
      }
    }
  }
  return true;
};

const hasWonByHiddenBombs = (board: Cell[][], totalBombs: number) =>
  countHiddenCells(board) === totalBombs;

const hasWonByCorrectFlags = (board: Cell[][], totalBombs: number) => {
  if (countFlags(board) !== totalBombs) {
    return false;
  }

  for (const row of board) {
    for (const cell of row) {
      if (cell.flagged && !cell.hasBomb) {
        return false;
      }
    }
  }

  return true;
};

export const hasWonByAnyRule = (board: Cell[][], totalBombs: number) =>
  hasWonByRevealedCells(board) ||
  hasWonByHiddenBombs(board, totalBombs) ||
  hasWonByCorrectFlags(board, totalBombs);
