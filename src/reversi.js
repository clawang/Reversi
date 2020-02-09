// reversi.js
function repeat(value, n) {
	const a = [];
    for(let i = 0; i < n; i++) {
		a[i] = value;
    }
    return a;
} 
    
function generateBoard(rows, cols, initialValue) {
    const cells = rows*cols;
    const board = repeat(initialValue, cells);
    return board;
} 

function rowColToIndex(board, rowNumber, columnNumber) {
	const size = Math.sqrt(board.length);
	const index = rowNumber*size + columnNumber;
	return index;
}

function indexToRowCol(board, i) {
	const size = Math.sqrt(board.length);
	const col = i % size;
	const row = (i - col)/size;
	const rowCol = {"row": row, "col": col};
	return rowCol;
}

function setBoardCell(board, letter, row, col) {
	const newBoard = board.slice();
	const index = rowColToIndex(board, row, col);
	newBoard[index] = letter;
	return newBoard;
}

function algebraicToRowCol(algebraicNotation) {
	const col = algebraicNotation.charCodeAt(0) - 65;

	let row;
	if(algebraicNotation.length > 2) {
		row = parseInt(algebraicNotation.slice(1,2));
	} else if(algebraicNotation.length === 2) {
		row = parseInt(algebraicNotation[1]);
	} else {
		return undefined;
	}

	if(row < 0 || row > 26 || col < 0 || col > 26 || isNaN(row) || isNaN(col)) {
		return undefined;
	}

	return {"row": row - 1, "col": col};
}

function rowColToAlgebraic(row, col) {
	return String.fromCharCode(col + 65) + (row + 1);
}

function placeLetter(board, letter, algebraicNotation) {
	let newBoard = board.slice();
	const rowCol = algebraicToRowCol(algebraicNotation);
	newBoard = setBoardCell(newBoard, letter, rowCol.row, rowCol.col);
	return newBoard;
}

function placeLetters(board, letter, ...algebraicNotation) {
	let newBoard = board.slice();
	for(let i = 0; i < algebraicNotation.length; i++) {
		newBoard = placeLetter(newBoard, letter, algebraicNotation[i]);
	}
	return newBoard;
}

function boardToString(board) {
	const size = Math.sqrt(board.length);
	let picture = "     ";
	for(let i = 0; i < size; i++) {
		picture += String.fromCharCode(i + 65);
		if(i < size - 1) {
			picture += "   ";
		}
	}
	picture += "  \n";
	for(let i = 0; i < size; i++) {
		picture += "   +";
		for(let j = 0; j < size; j++) {
			picture += "---+";
		}
		picture += "\n "+(i+1)+" |";
		//each cell
		for(let k = 0; k < size; k++) {
			const index = rowColToIndex(board, i, k);
			if(board[index] === "X") {
				picture += " X |";
			} else if(board[index] === "O") {
				picture += " O |";
			} else {
				picture += "   |";
			}
		}
		picture += "\n";
	}
	picture += "   +";
	for(let i = 0; i < size; i++) {
		picture += "---+";
	}
	picture += "\n";
	return picture;
}

function isBoardFull(board) {
	let full = true;
	for(let i = 0; i < board.length; i++) {
		if(board[i] === " ") {
			full = false;
			break;
		}
	}
	return full;
}

function flip(board, row, col) {
	const index = rowColToIndex(board, row, col);
	let newBoard = board.slice();
	if(board[index] === "X") {
		newBoard = setBoardCell(board, "O", row, col);
	} else if(board[index] === "O") {
		newBoard = setBoardCell(board, "X", row, col);
	}
	return newBoard;
}

function flipCells(board, cellsToFlip) {
	let newBoard = board.slice();
	for(let i = 0; i < cellsToFlip.length; i++) {
		for(let j = 0; j < cellsToFlip[i].length; j++) {
			const row = cellsToFlip[i][j][0];
			const col = cellsToFlip[i][j][1];
			newBoard = flip(newBoard, row, col);
		}
	}
	return newBoard;
}

function getCellsToFlip(board, lastRow, lastCol) {
	const newBoard = board.slice();
	const size = Math.sqrt(board.length);
	const result = new Array();
	let pairs = new Array();
	const letter = board[rowColToIndex(board, lastRow, lastCol)];
	let end = false;
	let other;
	if(letter === "X") {
		other = "O";
	} else {
		other = "X";
	}

	//up
	let newRow = lastRow - 1;
	while(end === false) {
		if(newRow < 0) {
			pairs = [];
			end = true;
			break;
		} 
		const index = rowColToIndex(board, newRow, lastCol);
		if(newBoard[index] === other) {
			pairs.push([newRow, lastCol]);
		} else if(newBoard[index] === letter) {
			end = true;
		} else {
			pairs = [];
			end = true;
		}
		newRow--;
	}

	for(let i = 0; i < pairs.length; i++) {
		const current = pairs[i];
		result.push(current);
	}

	pairs = [];

	//down
	newRow = lastRow + 1;
	end = false;
	while(end === false) {
		if(newRow > size) {
			pairs = [];
			end = true;
			break;
		} 
		const index = rowColToIndex(board, newRow, lastCol);
		if(newBoard[index] === other) {
			pairs.push([newRow, lastCol]);
		} else if(newBoard[index] === letter) {
			end = true;
		} else {
			pairs = [];
			end = true;
		}
		newRow++;
	}

	for(let i = 0; i < pairs.length; i++) {
		const current = pairs[i];
		result.push(current);
	}

	pairs = [];

	//left
	let newCol = lastCol - 1;
	end = false;
	while(end === false) {
		if(newCol < 0) {
			pairs = [];
			end = true;
			break;
		} 
		const index = rowColToIndex(board, lastRow, newCol);
		if(newBoard[index] === other) {
			pairs.push([lastRow, newCol]);
		} else if(newBoard[index] === letter) {
			end = true;
		} else {
			pairs = [];
			end = true;
		}
		newCol--;
	}

	for(let i = 0; i < pairs.length; i++) {
		const current = pairs[i];
		result.push(current);
	}

	pairs = [];

	//right
	newCol = lastCol + 1;
	end = false;
	while(end === false) {
		if(newCol > size) {
			pairs = [];
			end = true;
			break;
		} 
		const index = rowColToIndex(board, lastRow, newCol);
		if(newBoard[index] === other) {
			pairs.push([lastRow, newCol]);
		} else if(newBoard[index] === letter) {
			end = true;
		} else {
			pairs = [];
			end = true;
		}
		newCol++;
	}

	for(let i = 0; i < pairs.length; i++) {
		const current = pairs[i];
		result.push(current);
	}

	pairs = [];

	//upper left diagonal
	newRow = lastRow - 1;
	newCol = lastCol - 1;
	end = false;
	while(end === false) {
		if(newRow < 0 || newCol < 0) {
			pairs = [];
			end = true;
			break;
		} 
		const index = rowColToIndex(board, newRow, newCol);
		if(newBoard[index] === other) {
			pairs.push([newRow, newCol]);
		} else if(newBoard[index] === letter) {
			end = true;
		} else {
			pairs = [];
			end = true;
		}
		newRow--;
		newCol--;
	}

	for(let i = 0; i < pairs.length; i++) {
		const current = pairs[i];
		result.push(current);
	}

	pairs = [];

	//upper right diagonal
	newRow = lastRow - 1;
	newCol = lastCol + 1;
	end = false;
	while(end === false) {
		if(newRow < 0 || newCol > size) {
			pairs = [];
			end = true;
			break;
		} 
		const index = rowColToIndex(board, newRow, newCol);
		if(newBoard[index] === other) {
			pairs.push([newRow, newCol]);
		} else if(newBoard[index] === letter) {
			end = true;
		} else {
			pairs = [];
			end = true;
		}
		newRow--;
		newCol++;
	}

	for(let i = 0; i < pairs.length; i++) {
		const current = pairs[i];
		result.push(current);
	}

	pairs = [];

	//lower left diagonal
	newRow = lastRow + 1;
	newCol = lastCol - 1;
	end = false;
	while(end === false) {
		if(newRow > size || newCol < 0) {
			pairs = [];
			end = true;
			break;
		} 
		const index = rowColToIndex(board, newRow, newCol);
		if(newBoard[index] === other) {
			pairs.push([newRow, newCol]);
		} else if(newBoard[index] === letter) {
			end = true;
		} else {
			pairs = [];
			end = true;
		}
		newRow++;
		newCol--;
	}

	for(let i = 0; i < pairs.length; i++) {
		const current = pairs[i];
		result.push(current);
	}

	pairs = [];

	//lower right diagonal
	newRow = lastRow + 1;
	newCol = lastCol + 1;
	end = false;
	while(end === false) {
		if(newRow > size || newCol > size) {
			pairs = [];
			end = true;
			break;
		} 
		const index = rowColToIndex(board, newRow, newCol);
		if(newBoard[index] === other) {
			pairs.push([newRow, newCol]);
		} else if(newBoard[index] === letter) {
			end = true;
		} else {
			pairs = [];
			end = true;
		}
		newRow++;
		newCol++;
	}

	for(let i = 0; i < pairs.length; i++) {
		const current = pairs[i];
		result.push(current);
	}

	pairs = [];

	//groups pairs by row
	const groups = new Array();
	for(let i = 0; i < size; i++) {
		pairs = [];
		for(let j = 0; j < result.length; j++) {
			if(result[j][0] === i) {
				pairs.push(result[j]);
			}
		}
		if(pairs.length > 0) {
			groups.push(pairs);
		}
	}

	return groups;
}

function isValidMove(board, letter, row, col) {
	const index = rowColToIndex(board, row, col);
	const size = Math.sqrt(board.length);

	//targets an empty square
	if(board[index] !== " ") {
		return false;
	}

	//is within boundaries of the board
	if(row > size || row < 0 || col > size || col < 0) {
		return false;
	}

	//adheres to rules of Reversi
	const newBoard = setBoardCell(board, letter, row, col);
	const pairs = getCellsToFlip(newBoard, row, col);
	if(pairs.length === 0) {
		return false;
	} else {
		return true;
	}
}

function isValidMoveAlgebraicNotation(board, letter, algebraicNotation) {
	const rowCol = algebraicToRowCol(algebraicNotation);
	if(rowCol === undefined) {
		return false;
	}
	return isValidMove(board, letter, rowCol.row, rowCol.col);
}

function getLetterCounts(board) {
	let x = 0;
	let o = 0;
	for(let i = 0; i < board.length; i++) {
		if(board[i] === "X") {
			x++;
		} else if(board[i] === "O") {
			o++;
		}
	}
	return {X: x, O: o};
}

function getValidMoves(board, letter) {
	const result = new Array();
	for(let i = 0; i < board.length; i++) {
		const rowCol = indexToRowCol(board, i);
		if(isValidMove(board, letter, rowCol.row, rowCol.col)) {
			result.push([rowCol.row, rowCol.col]);
		}
	}
	return result;
}

// let board = generateBoard(8,8," ");
// board = placeLetters(board, 'X', "B2", "B4", "B6", "D2", "D4", "D6", "F6", "G1", "G4", "D4");
// board = placeLetters(board, 'O', "C3", "C4", "C5", "D3", "D5", "E3", "E4", "E5", "F2", "F4");
// board = flipCells(board, [[[0, 0], [0, 1]], [[1, 1]]]);
// let board = generateBoard(4, 4, " ");
// board = placeLetters(board, 'X', "A1");
// board = placeLetters(board, 'O', "B2");
// board = placeLetters(board, 'X', "A2");
// board = placeLetters(board, 'O', "C3");
// const visual = boardToString(board);
// console.log(visual);
// console.log(getValidMoves(board, 'X'));
// ...

module.exports = {
    repeat: repeat,
    generateBoard: generateBoard,
    rowColToIndex: rowColToIndex,
    indexToRowCol: indexToRowCol,
    setBoardCell: setBoardCell,
    algebraicToRowCol: algebraicToRowCol,
    rowColToAlgebraic: rowColToAlgebraic,
    placeLetter: placeLetter,
    placeLetters: placeLetters,
    boardToString: boardToString,
    isBoardFull: isBoardFull,
    flip: flip,
    flipCells: flipCells,
    getCellsToFlip: getCellsToFlip,
    isValidMove: isValidMove,
    isValidMoveAlgebraicNotation: isValidMoveAlgebraicNotation,
    getLetterCounts: getLetterCounts,
    getValidMoves: getValidMoves,
};

