// app.js
const rev = require('./reversi.js');
const readlineSync = require('readline-sync');
const fs = require('fs');

function userControls() {
	console.log("REVERSI?");
	let valid = false;
	let boardWidth;
	while(valid === false) {
		boardWidth = readlineSync.question('How wide should the board be? (even numbers between 4 and 26, inclusive)\n');
		if(boardWidth > 26 || boardWidth < 4 || boardWidth % 2 !== 0 || isNaN(boardWidth)) {
			continue;
		} else {
			valid = true;
		}
	}
	valid = false;
	let playerLetter;
	while(valid === false) {
		playerLetter = readlineSync.question('Pick your letter: X (black) or O (white)\n');
		if(playerLetter === 'X' || playerLetter === 'O') {
			valid = true;
		}
	}
	return {boardPreset: {boardWidth: boardWidth, playerLetter: playerLetter}};
}

function createBoard(boardWidth) {
	let board = rev.generateBoard(boardWidth, boardWidth, " ");
	const margin = boardWidth/2 - 1;
	board = rev.setBoardCell(board, "O", margin, margin);
	board = rev.setBoardCell(board, "X", margin, margin + 1);
	board = rev.setBoardCell(board, "X", margin + 1, margin);
	board = rev.setBoardCell(board, "O", margin + 1, margin + 1);
	console.log(rev.boardToString(board));
	return board;
}

//plays
function makePlay(board, letter, row, col) {
	const nextMoveAlg = rev.rowColToAlgebraic(row, col);
	let newBoard = rev.placeLetter(board, letter, nextMoveAlg);
	newBoard = rev.flipCells(newBoard, rev.getCellsToFlip(newBoard, row, col));
	console.log(rev.boardToString(newBoard));
	const score = rev.getLetterCounts(newBoard);
	console.log("Score\n=====\nX: " + score.X + "\nO: " + score.O + "\n");
	return newBoard;
}

function gamePlay(config) {
	//user controlled game settings
	let board = config.boardPreset.board;
	const playerLetter = config.boardPreset.playerLetter;
	let playerMoves = new Array();
	let computerMoves = new Array();

	let opponent;
	if(playerLetter === 'X') {
		opponent = 'O';
	} else {
		opponent = 'X';
	}

	//GAME SET-UP
	//using config file to set up game
	if(config.preset) {
		console.log("REVERSI\n");
		if(config.scriptedMoves.computer !== undefined) {
			computerMoves = config.scriptedMoves.computer;
			console.log("Computer will make the following moves: " + computerMoves);
		}
		if(config.scriptedMoves.player !== undefined) {
			playerMoves = config.scriptedMoves.player;
			console.log("The player will make the following moves: " + playerMoves);
		}
		console.log("Player is " + playerLetter);
		console.log(rev.boardToString(board));
	}

	//actual gameplay
	let gameplay = true;
	let turn = 'X';
	let passes = 0;
	while(gameplay) {
		//check for game over
		if(rev.isBoardFull(board) || passes >= 2) {
			gameplay = false;
			const score = rev.getLetterCounts(board);
			if(score[playerLetter] > score[opponent]) {
				console.log("You won! 👍🏻");
			} else if(score[playerLetter] < score[opponent]) {
				console.log("You lost 😢");
			} else {
				console.log("It's a draw 🤷🏻‍♀️");
			}
			break;
		}
		//moves
		if(turn === playerLetter) { //player's move
			if(rev.getValidMoves(board, playerLetter).length === 0) {
				readlineSync.question("No valid moves available for you.\nPress <ENTER> to pass.");
				passes++;
				turn = opponent;
				continue;
			}
			let nextMove;
			const scriptedMove = playerMoves.shift();
			if(scriptedMove !== undefined && rev.isValidMoveAlgebraicNotation(board, playerLetter, scriptedMove)) { //if there are still scripted moves
				nextMove = scriptedMove;
				console.log("Player move to " + nextMove + " is scripted.");
				readlineSync.question("Press <ENTER> to continue.");
			} else {
				nextMove = readlineSync.question("What's your move?\n");
			}
			const nextMoveRowCol = rev.algebraicToRowCol(nextMove);
			if(rev.isValidMoveAlgebraicNotation(board, playerLetter, nextMove)) {
				board = makePlay(board, playerLetter, nextMoveRowCol.row, nextMoveRowCol.col);
				passes = 0;
				turn = opponent;
			} else {
				console.log("INVALID MOVE. Your move should:\n* be in a  format\n* specify an existing empty cell\n* flip at least one of your opponent's pieces");
			}
		} else { //computer's move
			readlineSync.question('Press <ENTER> to show computer\'s move...');
			const possibleMoves = rev.getValidMoves(board, opponent);
			if(possibleMoves.length === 0) {
				console.log("The computer passed.");
				passes++;
				turn = playerLetter;
				continue;
			}
			let row;
			let col;
			const scriptedMove = computerMoves.shift();
			if(scriptedMove !== undefined && rev.isValidMoveAlgebraicNotation(board, opponent, scriptedMove)) { //if there are still scripted moves
				const nextMove = scriptedMove;
				console.log("Computer move to " + nextMove + " was scripted.");
				const rowCol = rev.algebraicToRowCol(nextMove);
				row = rowCol.row;
				col = rowCol.col;
			} else {
				const choice = Math.floor(Math.random() * possibleMoves.length);
				row = possibleMoves[choice][0];
				col = possibleMoves[choice][1];
			}
			
			board = makePlay(board, opponent, row, col);
			passes = 0;
			turn = playerLetter;
		}
	}
}

//configuration
let config;
if(process.argv[2] !== undefined) {
	fs.readFile('test.json', 'utf8', function(err, data) {
		if (err) {
			console.log('uh oh', err); 
		} else {
			config = JSON.parse(data);
			config.preset = true;
			gamePlay(config);
		}
	});
} else {
	config = userControls();
	config.preset = false;
	config.boardPreset.board = createBoard(config.boardPreset.boardWidth);
	gamePlay(config);
}
