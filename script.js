document.addEventListener('DOMContentLoaded', function() {
    // Game state
    const gameState = {
        currentPlayer: 1,
        player1Position: 1,
        player2Position: 1,
        diceRolling: false,
        diceValue: 0,
        lastMove: ''
    };

    // Define snakes (red) and ladders (green) exactly as specified
    const snakesAndLadders = [
        // Ladders (from lower to higher number)
        { from: 4, to: 14, type: "ladder" },
        { from: 8, to: 30, type: "ladder" },
        { from: 21, to: 42, type: "ladder" },
        { from: 28, to: 76, type: "ladder" },
        { from: 50, to: 67, type: "ladder" },
        { from: 71, to: 92, type: "ladder" },
        { from: 80, to: 99, type: "ladder" },
        
        // Snakes (from higher to lower number)
        { from: 32, to: 10, type: "snake" },
        { from: 36, to: 6, type: "snake" },
        { from: 48, to: 26, type: "snake" },
        { from: 62, to: 18, type: "snake" },
        { from: 88, to: 24, type: "snake" },
        { from: 95, to: 56, type: "snake" },
        { from: 97, to: 78, type: "snake" },
        { from: 98, to: 79, type: "snake" }
    ];

    // DOM elements
    const gameBoard = document.getElementById('game-board');
    const player1PositionEl = document.getElementById('player1-position');
    const player2PositionEl = document.getElementById('player2-position');
    const player1Card = document.getElementById('player1-card');
    const player2Card = document.getElementById('player2-card');
    const rollDice1Btn = document.getElementById('roll-dice-1');
    const rollDice2Btn = document.getElementById('roll-dice-2');
    const resetGameBtn = document.getElementById('reset-game');
    const turnTextEl = document.getElementById('turn-text');
    const lastMoveEl = document.getElementById('last-move');
    const diceFace = document.getElementById('dice-face');
    const snakesLaddersSvg = document.getElementById('snakes-ladders-svg');

    // Initialize the game
    initializeGame();

    // Event listeners
    rollDice1Btn.addEventListener('click', function() {
        rollDice(1);
    });
    
    rollDice2Btn.addEventListener('click', function() {
        rollDice(2);
    });
    
    resetGameBtn.addEventListener('click', resetGame);
    
    // Initialize the game board
    function initializeGame() {
        createGameBoard();
        drawSnakesAndLadders();
        updatePlayerPositions();
        updateTurnIndicator();
    }

    // Create the game board cells
    function createGameBoard() {
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                let cellNumber;
                
                // Even rows (from bottom) go left to right
                if (row % 2 != 0) {
                    cellNumber = 90 - row * 10 + col + 1;
                } 
                // Odd rows go right to left
                else {
                    cellNumber = 100 - row * 10 - col;
                }

                // Create cell element
                const cell = document.createElement('div');
                cell.className = 'board-cell';
                cell.id = `cell-${cellNumber}`;
                
                // Add odd/even class for coloring
                if (cellNumber % 2 === 1) {
                    cell.classList.add('odd');
                } else {
                    cell.classList.add('even');
                }
                
                // Highlight cells with snakes and ladders
                const isSnakeStart = snakesAndLadders.some(sl => sl.from === cellNumber && sl.type === 'snake');
                const isLadderStart = snakesAndLadders.some(sl => sl.from === cellNumber && sl.type === 'ladder');
                
                if (isSnakeStart) {
                    cell.classList.add('snake-start');
                }
                
                if (isLadderStart) {
                    cell.classList.add('ladder-start');
                }
                
                // Display cell number
                cell.textContent = cellNumber;
                
                // Add flag to cell 100
                if (cellNumber === 100) {
                    const flag = document.createElement('div');
                    flag.className = 'flag';
                    cell.appendChild(flag);
                }
                
                gameBoard.appendChild(cell);
            }
        }
    }

    // Draw snakes and ladders on SVG
    function drawSnakesAndLadders() {
        snakesLaddersSvg.innerHTML = '';
        
        snakesAndLadders.forEach((sl, index) => {
            const startPos = getGridPosition(sl.from);
            const endPos = getGridPosition(sl.to);
            
            if (!startPos || !endPos) return;
            
            // Calculate positions in percentage
            const startX = (startPos.col + 0.5) * 10;
            const startY = (startPos.row + 0.5) * 10;
            const endX = (endPos.col + 0.5) * 10;
            const endY = (endPos.row + 0.5) * 10;
            
            // Create line element
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', startX + '%');
            line.setAttribute('y1', startY + '%');
            line.setAttribute('x2', endX + '%');
            line.setAttribute('y2', endY + '%');
            
            // Set color based on type
            if (sl.type === "snake") {
                line.setAttribute('stroke', '#ff4d4d'); // Red for snakes
                line.setAttribute('stroke-width', '10');
            } else {
                line.setAttribute('stroke', '#00cc00'); // Green for ladders
                line.setAttribute('stroke-width', '4');
                line.setAttribute('stroke-dasharray', '5,9'); // Dashed line for ladders
            }
            
            line.setAttribute('stroke-linecap', 'round');
            
            snakesLaddersSvg.appendChild(line);
        });
    }

    // Convert position to grid coordinates
    function getGridPosition(position) {
        if (position < 1 || position > 100) return null;
        
        // Calculate row (0-9, from top to bottom)
        const row = Math.floor((position - 1) / 10);
        
        // Calculate column (0-9, from left to right)
        let col;
        if (row % 2 === 0) {
            // Even rows (from top) go left to right
            col = (position - 1) % 10;
        } else {
            // Odd rows go right to left
            col = 9 - ((position - 1) % 10);
        }
        
        // Invert row since our grid is 0,0 at top-left
        const invertedRow = 9 - row;
        
        return { row: invertedRow, col };
    }

    // Update player positions on the board
    function updatePlayerPositions() {
        // Remove existing tokens
        const existingTokens = document.querySelectorAll('.player-token');
        existingTokens.forEach(token => token.remove());
        
        // Update position text
        player1PositionEl.textContent = gameState.player1Position;
        player2PositionEl.textContent = gameState.player2Position;
        
        // Add player 1 token
        if (gameState.player1Position <= 100) {
            const cell1 = document.getElementById(`cell-${gameState.player1Position}`);
            if (cell1) {
                const token1 = document.createElement('div');
                token1.className = 'player-token player1-token';
                token1.textContent = '1';
                cell1.appendChild(token1);
            }
        }
        
        // Add player 2 token
        if (gameState.player2Position <= 100) {
            const cell2 = document.getElementById(`cell-${gameState.player2Position}`);
            if (cell2) {
                const token2 = document.createElement('div');
                token2.className = 'player-token player2-token';
                token2.textContent = '2';
                cell2.appendChild(token2);
            }
        }
    }

    // Update turn indicator
    function updateTurnIndicator() {
        turnTextEl.textContent = `Player ${gameState.currentPlayer}'s turn`;
        lastMoveEl.textContent = gameState.lastMove;
        
        // Update player cards to highlight active player
        player1Card.classList.toggle('active', gameState.currentPlayer === 1);
        player2Card.classList.toggle('active', gameState.currentPlayer === 2);
        
        // Enable/disable roll buttons
        rollDice1Btn.disabled = gameState.currentPlayer !== 1 || gameState.diceRolling;
        rollDice2Btn.disabled = gameState.currentPlayer !== 2 || gameState.diceRolling;
    }

    // Roll dice function with animation
    function rollDice(player) {
        console.log(`Rolling dice for player ${player}`);
        
        if (player !== gameState.currentPlayer || gameState.diceRolling) {
            console.log(`Cannot roll: current player is ${gameState.currentPlayer}, dice rolling: ${gameState.diceRolling}`);
            return;
        }
        
        gameState.diceRolling = true;
        
        // Update UI to show dice is rolling
        updateTurnIndicator();
        
        // Add rolling animation
        diceFace.classList.add('dice-rolling');
        
        // Simulate dice roll animation
        let rollCount = 0;
        const rollInterval = setInterval(() => {
            const randomValue = Math.floor(Math.random() * 6) + 1;
            diceFace.textContent = randomValue;
            rollCount++;
            
            if (rollCount >= 10) {
                clearInterval(rollInterval);
                finishRoll();
            }
        }, 100);
        
        function finishRoll() {
            // Generate final dice value
            const roll = Math.floor(Math.random() * 6) + 1;
            gameState.diceValue = roll;
            diceFace.textContent = roll;
            
            // Remove rolling animation
            setTimeout(() => {
                diceFace.classList.remove('dice-rolling');
                
                // Move player+
                movePlayer(player, roll);
            }, 500);
        }
    }
    
    // Move player function
    function movePlayer(player, roll) {
        // Get current position
        const currentPosition = player === 1 ? gameState.player1Position : gameState.player2Position;
        let newPosition = currentPosition + roll;
        
        // Update last move text
        gameState.lastMove = `Player ${player} rolled ${roll} and moved from ${currentPosition} to ${newPosition}`;
        
        // Check if player won
        if (newPosition > 100) {
            gameState.lastMove = `Player ${player} rolled ${roll} but cannot move beyond 100`;
            newPosition = currentPosition; // Can't move beyond 100
        }
        
        // Update position
        if (player === 1) {
            gameState.player1Position = newPosition;
        } else {
            gameState.player2Position = newPosition;
        }
        
        // Update UI
        updatePlayerPositions();
        updateTurnIndicator();
        
        // Check if landed on a snake or ladder
        const snakeOrLadder = snakesAndLadders.find(sl => sl.from === newPosition);
        
        if (snakeOrLadder) {
            // Delay the snake/ladder movement for visual effect
            setTimeout(() => {
                if (player === 1) {
                    gameState.player1Position = snakeOrLadder.to;
                } else {
                    gameState.player2Position = snakeOrLadder.to;
                }
                
                // Update last move text
                if (snakeOrLadder.type === 'snake') {
                    gameState.lastMove = `Player ${player} slid down a snake from ${newPosition} to ${snakeOrLadder.to}`;
                } else {
                    gameState.lastMove = `Player ${player} climbed a ladder from ${newPosition} to ${snakeOrLadder.to}`;
                }
                
                updatePlayerPositions();
                updateTurnIndicator();
                
                // Check for win after snake/ladder
                checkWin(player);
            }, 1000);
        } else {
            // Check for win immediately
            checkWin(player);
        }
    }
    
    // Check if player won
    function checkWin(player) {
        const position = player === 1 ? gameState.player1Position : gameState.player2Position;
        
        if (position === 100) {
            setTimeout(() => {
                alert(`Player ${player} wins!`);
                resetGame();
            }, 500);
        } else {
            // Switch player
            gameState.currentPlayer = player === 1 ? 2 : 1;
            gameState.diceRolling = false;
            updateTurnIndicator();
        }
    }

    // Reset game function
    function resetGame() {
        gameState.currentPlayer = 1;
        gameState.player1Position = 1;
        gameState.player2Position = 1;
        gameState.diceValue = 0;
        gameState.diceRolling = false;
        gameState.lastMove = '';
        
        diceFace.textContent = '1';
        updatePlayerPositions();
        updateTurnIndicator();
    }
});