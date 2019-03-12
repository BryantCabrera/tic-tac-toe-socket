// get our connection to the socket.io server
var socket = io();



// listen to the server for the `new-game` event
socket.on('new-game', function() {
    game.init();
    game.render();
});

// listen to the server for the `move` event
socket.on('move', function ({ previousPlayer, idx, currentTurn }) {
    console.log(
      `${previousPlayer} clicked on square #${idx}. It is now ${turn}'s turn.`
    );
    
    board[idx] = previousPlayer;

    turn *= 1;

    game.render();
});

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
let board, turn, winner, player;
const $gameboard = $('#gameboard');
const $squares = $('td');
const $turnDisplay = $('#turn');
const players = ['Player 1', 'Player 2'];


const renderLookUp = {
    '1': '/imgs/player1.png',
    '-1': '/imgs/player2.png',
    'null': '/imgs/classroom.png'
};

// Room player assignment
(function () {

    // Types of players
    const P1 = 1, P2 = -1;
    const socket = io.connect('http://localhost:3000'),
        player,
        game;

    //Create a new game. Emit newGame event.
    $('#new').on('click', function () {
        const name = $('#nameNew').val();
        // if (!name) {
        //     alert('Please enter your name.');
        //     return;
        // }
        socket.emit('createGame', { name: name });
        player = new Player(name, P1);
    });

    //Join an existing game on the entered roomId. Emit the joinGame event.
    $('#join').on('click', function () {
        const name = $('#nameJoin').val();
        const roomID = $('#room').val();
        // if (!name || !roomID) {
        //     alert('Please enter your name and game ID.');
        //     return;
        // }
        socket.emit('joinGame', { name: name, room: roomID });
        player = new Player(name, P2);
    });
})();

const game = {
    init() {
        //gives each square an initial value of null
        board = new Array(9).fill('null');
        //sets the first player
        turn = 1;
    },
    render() {
        //generates square visuals
        $squares.each(function (index, square) {
            $(square).html(`<img src=${renderLookUp[`${board[index]}`]}>`);
        });

        //updates turn
        if (turn === 1) {
            $turnDisplay.text(`It is ${players[0]}'s turn.`);
            $('#player1-img').css('display', 'inline-block');
            $('#player2-img').css('display', 'none');
        } else if (turn === -1) {
            $turnDisplay.text(`It is ${players[1]}'s turn.`);
            $('#player1-img').css('display', 'none');
            $('#player2-img').css('display', 'inline-block');
        }

        //win logic
        game.findWinner()

        //updates UI to let players know who won
        if (game.findWinner() === 1) {
            $turnDisplay.text(`${players[0]} has won the game!`);
        } else if (game.findWinner() === -1) {
            $turnDisplay.text(`${players[1]} has won the game!`);
        } else if (game.findWinner() === 0) {
            $turnDisplay.text(`It was a tie game!  Both Jims won!`);
        }

    },
    findWinner() {
        //winning combination arrays
        const winConditions = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

        //map actual board array values to win condition combinations
        winConditions.forEach(combination => combination.map((square, index) => combination[index] = board[square]));

        //reduce the newly mapped array to sums. separated for clarity.
        winConditions.forEach((combination, index) => winConditions[index] = combination.reduce((acc, squareValue) => acc += squareValue, 0));

        // console.log(winConditions);

        //if the absolute value of the sum at that combination of squares is 3, that means the same player had a token in each of those squares and has won the game
        for (let i = 0; i < winConditions.length; i++) {
            if (Math.abs(winConditions[i]) === 3) {
                //if winner present, squares become unclickable
                board.forEach((square, index) => {
                    if (square === 'null') {
                        board[index] = 0;
                    }
                });

                //return which player won
                return winConditions[i] / 3
            } else if (winConditions.some(square => square !== 3) && winConditions.every(squareValue => squareValue === 1 || squareValue === -1)) {
                //return 0 if it was a tie game
                return 0
            }
        }

        //SAME AS ABOVE, BUT WITH FOR LOOPS
        // let winComboCheck = [];
        // let winValues = [];
        // for (let i = 0; i < winConditions.length; i++) {
        //     winComboCheck.push(winConditions[i].map(square => square = board[square]));
        // }

        // for (let i = 0; i < winComboCheck.length; i++) {
        //     winValues.push(winComboCheck[i].reduce((acc, square) => acc += square, 0));
        // };

        // console.log(winValues);

        // for (let i = 0; i < winValues.length; i++) {
        //     if (Math.abs(winValues[i]) === 3) {
        //         return winValues[i]/3
        //     }
        // }

    }
};


$('td').on('click', function (e) {
    // console.log($(e));
    // console.log(e.currentTarget);
    // console.log(e.target.id);
    let idx = parseInt(e.currentTarget.id);
    // console.log(idx, 'this is idx');

    if (board[idx] === 'null') {
        board[idx] = turn;
        // console.log(board[idx], 'board at idx');
        turn *= -1;
        // console.log(board); 
        socket.emit('move', {
            previousPlayer: turn * -1,
            idx: idx,
            turn: turn
        });   
        game.render();
    }
});


$("#new-game").on('click', function (e) {
    game.init();
    game.render();

    socket.emit('new-game');
});