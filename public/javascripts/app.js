//updates mouse to match current player image
//vanilla JavaScript
const root = document.documentElement;
const gameboard = document.getElementById('gameboard');

gameboard.addEventListener('mousemove', e => {
    root.style.setProperty('--x', (e.clientX - 15) + 'px');
    root.style.setProperty('--y', (e.clientY - 15) + 'px');
});
//jQuery version
// const root = $('document.documentElement');

// $('#gameboard').on('mousemove', e => {
//     root.css('--x', (e.clientX - 15) + 'px');
//     root.css('--y', (e.clientY -15) + 'px');
// });


//jQuery section
let board, turn, winner, user, player, roomID, message, idx;
var game;
const $gameboard = $('#gameboard');
const $squares = $('td');
const $turnDisplay = $('#turn');
const players = ['Player 1', 'Player 2'];

const renderLookUp = {
    '1': '/imgs/player1.png',
    '-1': '/imgs/player2.png',
    'null': '/imgs/classroom.png'
};


// addEventListener support for IE8
function bindEvent(element, eventName, eventHandler) {
    if (element.addEventListener) {
        element.addEventListener(eventName, eventHandler, false);
    } else if (element.attachEvent) {
        element.attachEvent('on' + eventName, eventHandler);
    }
}

// Send a message to the parent
const sendMessage = function (msg) {
    // Make sure you are sending a string, and to stringify JSON
    window.parent.postMessage(msg, '*');
};

// Listen to messages from parent window
bindEvent(window, 'message', function (e) {
    // console.log(e, ' this is e from TicTacToe app.js iframe');
    // console.log(e.data, ' this is e.data from TicTacToe app.js iframe');

    // parses data into JSON
    const data = JSON.parse(e.data);
    //sets global user to parsed data
    user = data;
    // console.log(user, ' this is user from TTT app.js.');

    // console.log(data, ' this is parsed data from Tic Tac Toe app.js');

    if (data.email) {
        $('#nameNew').val(data.email).prop('disabled', true);
        $("#nameJoin").val(data.email).prop('disabled', true);
    }
    $("#new-game").hide();
});

// get our connection to the socket.io server
const socket = io();

//SOCKET LISTENERS
// listen to the server for the `new-game` event
socket.on('new-game', function(data) {
    if (!game) {
        game = new Game(data.room);
    }
    game.init();
    game.render();
});

// listen to the server for the `move` event
socket.on('move', function ({ previousPlayer, idx, currentTurn }) {
    // console.log(
    //   `${previousPlayer} clicked on square #${idx}. It is now ${turn}'s turn.`
    // );
    
    game.board[idx] = previousPlayer;

    game.turn *= -1;

    game.render();
});

// New Game created by current client. 
// Updates the UI and creates new Game var.
socket.on('newGame', function (data) {
    const message = 'Hello, ' + data.name +
        '. Please ask your friend to enter Game ID: ' +
        data.room + '. Waiting for player 2...';
    $('.create-room__message').html(message);
    $("#create-room").hide();
    $("#new-game").hide();
});

// If player creates the game/room, he/she will be Player 1 (1).
// When opponent connects to the room, updates player 1's UI.
socket.on('player1', function (data) {
    const message = 'Hello, ' + player.getPlayerName();
    $('.container').html(message);
    player.setCurrentTurn(true);
});

// The person who joined the game is Player 2 (-1). 
// When Player 2 successfully joins the game room, this message received.
socket.on('player2', function (data) {
    const message = 'Hello, ' + data.name;

    //Create game for player 2
    $(".container").html(message);
    player.setCurrentTurn(false);
    socket.emit('new-game', { room: data.room });
});

// If connection failed, displays error
socket.on('err', function (data) {
    const message = data.message;

    // Displays error
    $(".container").html(message);
});

// If game has ended, display New Game button.
socket.on("gameEnded", function(data) {
    if (user) {
        let userWins = user.games.length > 0 && user.games.map(game => game.title).includes('Tic-Tac-Toe') ? user.games.filter(game => game.title === 'Tic-Tac-Toe')[0].wins : 0;
        let userLosses = user.games.length > 0 && user.games.map(game => game.title).includes('Tic-Tac-Toe') ? user.games.filter(game => game.title === 'Tic-Tac-Toe')[0].losses : 0;
        let userDraws = user.games.length > 0 && user.games.map(game => game.title).includes('Tic-Tac-Toe') ? user.games.filter(game => game.title === 'Tic-Tac-Toe')[0].draws : 0;
   

        if (game.winner === 0) {
            userDraws++;
        } else if (player.type === game.winner) {
            userWins++;
        } else {
            userLosses++;
        }

        gameInfo = {
            title: 'Tic-Tac-Toe',
            author: 'Bryant Cabrera',
            wins: userWins,
            losses: userLosses,
            draws: userDraws
        }

        if (user.games.length > 0 && user.games.map(game => game.title).includes('Tic-Tac-Toe')) {
            user.games.map((game, index) => {
                if (game.title === 'Tic-Tac-Toe') {
                    user.games[index] = gameInfo
                }
            });
        } else {
            user.games.push(gameInfo);
        }
        sendMessage(user);
    }
    // Displays new game button
    $("#new-game").show();
});

// // Opponent played his turn. Update UI.
// // Allow the current player to play now. 
// socket.on('turnPlayed', function (data) {
//     const row = data.tile.split('_')[1][0];
//     const col = data.tile.split('_')[1][1];
//     const opponentType = player.getPlayerType() == P1 ? P2 : P1;
//     game.updateBoard(opponentType, row, col, data.tile);
//     player.setCurrentTurn(true);
// });

// // If the other player wins or game is tied, this event is received. 
// // Notify the user about either scenario and end the game.
// socket.on('gameEnd', function (data) {
//     game.endGame(data.message);
//     socket.leave(data.room);
// })

// // End the game on any err event. 
// socket.on('err', function (data) {
//     game.endGame(data.message);
// });


//Player class
class Player {
    constructor(name, type) {
        this.name = name;
        this.type = type;
        this.currentTurn = true;
        this.movesPlayed = [];
    }
    
    //Set the bit of the move played by the player
    updateMovesPlayed = function (idx) {
        this.movesPlayed.push(idx);
    }

    getMovesPlayed = function () {
        return this.movesPlayed;
    }

    //Set the currentTurn for player to turn and update UI to reflect the same.
    setCurrentTurn = function (turn) {
        this.currentTurn = turn;
        if (turn) {
            $('#container').text('Your turn.');
        }
        else {
            $('#container').text('Waiting for Opponent.');
        }
    }

    getPlayerName = function () {
        return this.name;
    }

    getPlayerType = function () {
        return this.type;
    }

    //Returns currentTurn to determine if it is the player's turn.
    getCurrentTurn = function () {
        return this.currentTurn;
    }
}

// Game class
class Game  {
    constructor(roomID) {
        this.roomID = roomID;
        this.board = [];
        this.turn = 1;
        this.winner = -2;
    }

    init() {
        //gives each square an initial value of null
        this.board = new Array(9).fill('null');
        //sets the first player
        this.turn = 1;
    }

    render() {
        //generates square visuals
        $squares.each(function (index, square) {
            $(square).html(`<img src=${renderLookUp[`${game.board[index]}`]}>`);
        });

        //updates turn
        if (this.turn === 1) {
            $turnDisplay.text(`It is ${players[0]}'s turn.`);
            $('#player1-img').css('display', 'inline-block');
            $('#player2-img').css('display', 'none');
        } else if (this.turn === -1) {
            $turnDisplay.text(`It is ${players[1]}'s turn.`);
            $('#player1-img').css('display', 'none');
            $('#player2-img').css('display', 'inline-block');
        }

        //win logic
        this.winner = game.findWinner()

        //updates UI to let players know who won
        if (this.winner === 1) {
            $turnDisplay.text(`${players[0]} has won the game!`);
            socket.emit('gameEnded', {
                room: roomID,
                winner: game.winner
            });
        } else if (this.winner === -1) {
            $turnDisplay.text(`${players[1]} has won the game!`);
            socket.emit('gameEnded', {
                room: roomID,
                winner: game.winner,
            });
        } else if (this.winner === 0) {
            $turnDisplay.text(`It was a tie game!  Both Jims won!`);
            socket.emit('gameEnded', {
                room: roomID,
                winner: game.winner
            });
        }

    }

    findWinner() {
        //winning combination arrays
        const winConditions = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

        //map actual board array values to win condition combinations
        winConditions.forEach(combination => combination.map((square, index) => combination[index] = this.board[square]));

        //reduce the newly mapped array to sums. separated for clarity.
        winConditions.forEach((combination, index) => winConditions[index] = combination.reduce((acc, squareValue) => acc += squareValue, 0));

        // console.log(winConditions);

        //if the absolute value of the sum at that combination of squares is 3, that means the same player had a token in each of those squares and has won the game
        for (let i = 0; i < winConditions.length; i++) {
            if (Math.abs(winConditions[i]) === 3) {
                //if winner present, squares become unclickable
                this.board.forEach((square, index) => {
                    if (square === 'null') {
                        this.board[index] = 0;
                    }
                });
                
                //return which player won
                return winConditions[i] / 3
            } else if (winConditions.some(square => square !== 3) && winConditions.every(squareValue => squareValue === 1 || squareValue === -1)) {
                //return 0 if it was a tie game
                return 0
            }
        }
    }
};


$('td').on('click', function (e) {

    idx = parseInt(e.currentTarget.id);

    if (game.board[idx] === 'null' && player.type === game.turn) {
        // game.board[idx] = game.turn;

        // game.turn *= -1;

        socket.emit('move', {
            previousPlayer: game.turn,
            idx: idx,
            turn: game.turn * -1
        });   
        game.render();
    }
});


$("#new-game").on('click', function (e) {
    game.init();
    game.render();

    socket.emit('new-game');
});


// Socket Rooms
//Create a new game. Emit newGame event.
$('#new').on('click', function () {
    const name = $('#nameNew').val();
    if (!name) {
        $('.create-room__header').text('Please Enter a Name!');
        return;
    } else {
        $('#join-room').hide();
    } 
    socket.emit('createGame', { name: name });
    player = new Player(name, 1);
});

//Join an existing game on the entered roomId. Emit the joinGame event.
$('#join').on('click', function () {
    const name = $('#nameJoin').val();
    const roomID = $('#room').val();
    if (!name || !roomID) {
        $('.join-room__header').text('Please enter your name and game ID.');
        return;
    }
    socket.emit('joinGame', { name: name, room: roomID });
    player = new Player(name, -1);
});






// // Room player assignment
// // (function () {

// // Types of players
// const P1 = 1, P2 = -1;
// const socket = io.connect('http://localhost:3000'),
//     player,
//     game;

//Create a new game. Emit newGame event.
// $('#new').on('click', function () {
//     console.log(' clicking #new');
//     const name = $('#nameNew').val();
//     // if (!name) {
//     //     alert('Please enter your name.');
//     //     return;
//     // }
//     $('#create-new').hide();
//     socket.emit('createGame', { name: name });
//     player = new Player(name, P1);
// });

// //Join an existing game on the entered roomId. Emit the joinGame event.
// $('#join').on('click', function () {
//     const name = $('#nameJoin').val();
//     const roomID = $('#room').val();
//     // if (!name || !roomID) {
//     //     alert('Please enter your name and game ID.');
//     //     return;
//     // }
//     socket.emit('joinGame', { name: name, room: roomID });
//     player = new Player(name, P2);
// });
// // })();