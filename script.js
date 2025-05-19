// DOM Elements
const player1HealthDisplay = document.getElementById('player1Health');
const player2HealthDisplay = document.getElementById('player2Health');
const timerDisplay = document.getElementById('timer');
const resultDisplay = document.getElementById('resultDisplay');
const player1Element = document.getElementById('player1');
const player2Element = document.getElementById('player2');
const gameContainer = document.querySelector('.game-container');

// Game Variables
let player1 = {
    x: 100,
    y: 0, // y is not used for vertical movement in this basic example, but can be added
    health: 100,
    width: 50,
    height: 100,
    speed: 15,
    isAttacking: false,
    attackBox: { offsetX: 50, width: 70, height: 30 }, // Relative to player's top-left
    element: player1Element,
    healthDisplay: player1HealthDisplay,
    facingRight: true
};

let player2 = {
    x: gameContainer.offsetWidth - 100 - 50, // Initial position on the right
    y: 0,
    health: 100,
    width: 50,
    height: 100,
    speed: 15,
    isAttacking: false,
    attackBox: { offsetX: -70, width: 70, height: 30 }, // Relative to player's top-left, adjusted for facing left
    element: player2Element,
    healthDisplay: player2HealthDisplay,
    facingRight: false
};

let timeLeft = 60;
let gameInterval;
let timerInterval;
let gameOver = false;

// --- Game Logic Functions ---

function updateHealthDisplay() {
    player1.healthDisplay.style.width = player1.health + '%';
    player2.healthDisplay.style.width = player2.health + '%';
}

function updatePlayerPosition(player) {
    player.element.style.left = player.x + 'px';
    // player.element.style.bottom = player.y + 'px'; // If y-axis movement is added
}

function checkCollision(attacker, defender) {
    if (!attacker.isAttacking) return false;

    // Attacker's attack box absolute coordinates
    const attackLeft = attacker.facingRight ? attacker.x + attacker.attackBox.offsetX : attacker.x + attacker.attackBox.offsetX - attacker.attackBox.width + attacker.width;
    const attackRight = attacker.facingRight ? attacker.x + attacker.attackBox.offsetX + attacker.attackBox.width : attacker.x + attacker.attackBox.offsetX + attacker.width;
    const attackTop = attacker.y + attacker.height / 2 - attacker.attackBox.height / 2; // Centered vertically for simplicity
    const attackBottom = attacker.y + attacker.height / 2 + attacker.attackBox.height / 2;

    // Defender's bounding box absolute coordinates
    const defenderLeft = defender.x;
    const defenderRight = defender.x + defender.width;
    const defenderTop = defender.y;
    const defenderBottom = defender.y + defender.height;

    // Check for overlap
    return (
        attackLeft < defenderRight &&
        attackRight > defenderLeft &&
        attackTop < defenderBottom &&
        attackBottom > defenderTop
    );
}

function handleAttack(attacker, defender) {
    if (checkCollision(attacker, defender)) {
        defender.health -= 10; // Damage amount
        if (defender.health < 0) defender.health = 0;
        updateHealthDisplay();
        console.log((attacker === player1 ? "Player 1" : "Player 2") + " hits! " + (defender === player1 ? "Player 1" : "Player 2") + " health: " + defender.health);

        if (defender.health <= 0) {
            endGame(attacker === player1 ? "Player 1 Wins!" : "Player 2 Wins!");
        }
    }
    attacker.isAttacking = false; // Reset attack state after a short duration
}

function displayResult(message) {
    resultDisplay.textContent = message;
    resultDisplay.style.display = 'block';
}

function endGame(message) {
    if (gameOver) return;
    gameOver = true;
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    displayResult(message);
    console.log("Game Over: " + message);
}

function updateTimer() {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
        determineWinnerByHealth();
    }
}

function determineWinnerByHealth() {
    if (gameOver) return;
    if (player1.health > player2.health) {
        endGame("Player 1 Wins by Time Out!");
    } else if (player2.health > player1.health) {
        endGame("Player 2 Wins by Time Out!");
    } else {
        endGame("It's a Tie!");
    }
}

// --- Event Listeners ---
const keysPressed = {};

window.addEventListener('keydown', (event) => {
    if (gameOver) return;
    keysPressed[event.key.toLowerCase()] = true;

    // Player 1 Controls (WASD + Space for attack)
    if (event.key.toLowerCase() === ' ' && !player1.isAttacking) { // Space bar for P1 attack
        player1.isAttacking = true;
        player1.element.style.backgroundColor = 'pink'; // Visual feedback for attack
        setTimeout(() => {
            handleAttack(player1, player2);
            player1.element.style.backgroundColor = 'red'; // Reset color
        }, 200); // Attack duration
    }

    // Player 2 Controls (Arrow Keys + Enter for attack)
    if (event.key === 'Enter' && !player2.isAttacking) { // Enter for P2 attack
        player2.isAttacking = true;
        player2.element.style.backgroundColor = 'lightblue'; // Visual feedback for attack
        setTimeout(() => {
            handleAttack(player2, player1);
            player2.element.style.backgroundColor = 'blue'; // Reset color
        }, 200); // Attack duration
    }
});

window.addEventListener('keyup', (event) => {
    keysPressed[event.key.toLowerCase()] = false;
});

function handleMovement() {
    if (gameOver) return;

    // Player 1 Movement (Keyboard or Joystick)
    if (keysPressed['a'] || player1Moving.left) { // A - P1 Left or Joystick Left
        player1.x -= player1.speed;
        player1.facingRight = false;
        player1.element.style.transform = 'scaleX(-1)'; // Flip sprite
    }
    if (keysPressed['d'] || player1Moving.right) { // D - P1 Right or Joystick Right
        player1.x += player1.speed;
        player1.facingRight = true;
        player1.element.style.transform = 'scaleX(1)';
    }

    // Player 2 Movement (Keyboard or Joystick)
    if (keysPressed['arrowleft'] || player2Moving.left) { // Left Arrow - P2 Left or Joystick Left
        player2.x -= player2.speed;
        player2.facingRight = false;
        player2.element.style.transform = 'scaleX(-1)'; // Flip sprite
    }
    if (keysPressed['arrowright'] || player2Moving.right) { // Right Arrow - P2 Right or Joystick Right
        player2.x += player2.speed;
        player2.facingRight = true;
        player2.element.style.transform = 'scaleX(1)';
    }

    // Boundary checks for player 1
    const currentContainerWidth = gameContainer.offsetWidth;
    if (player1.x < 0) player1.x = 0;
    if (player1.x + player1.width > currentContainerWidth) {
        player1.x = currentContainerWidth - player1.width;
    }

    // Boundary checks for player 2
    if (player2.x < 0) player2.x = 0;
    if (player2.x + player2.width > currentContainerWidth) {
        player2.x = currentContainerWidth - player2.width;
    }

    updatePlayerPosition(player1);
    updatePlayerPosition(player2);
}

// --- Mobile Joystick Logic ---
const player1Joystick = document.getElementById('player1Joystick');
const player2Joystick = document.getElementById('player2Joystick');

let player1Moving = { left: false, right: false };
let player2Moving = { left: false, right: false };

function getTouchPosition(event, element) {
    const rect = element.getBoundingClientRect();
    const touch = event.changedTouches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    return { x, y };
}

function handleJoystickMove(event, player, movingState) {
    if (gameOver) return;
    const joystick = event.target;
    const { x } = getTouchPosition(event, joystick);
    const center = joystick.offsetWidth / 2;

    movingState.left = false;
    movingState.right = false;

    if (x < center - 10) { // Left zone (with a small dead zone)
        movingState.left = true;
    } else if (x > center + 10) { // Right zone (with a small dead zone)
        movingState.right = true;
    }
}

function handleJoystickEnd(movingState) {
    movingState.left = false;
    movingState.right = false;
}

// Player 1 Joystick Events
if (player1Joystick) {
    player1Joystick.addEventListener('touchstart', (event) => {
        event.preventDefault(); // Prevent scrolling
        // Attack on tap (simple implementation)
        if (!player1.isAttacking) {
            player1.isAttacking = true;
            player1.element.style.backgroundColor = 'pink'; // Visual feedback for attack
            setTimeout(() => {
                handleAttack(player1, player2);
                player1.element.style.backgroundColor = 'red'; // Reset color
            }, 200); // Attack duration
        }
    });
    player1Joystick.addEventListener('touchmove', (event) => handleJoystickMove(event, player1, player1Moving));
    player1Joystick.addEventListener('touchend', () => handleJoystickEnd(player1Moving));
    player1Joystick.addEventListener('touchcancel', () => handleJoystickEnd(player1Moving));
}

// Player 2 Joystick Events
if (player2Joystick) {
    player2Joystick.addEventListener('touchstart', (event) => {
        event.preventDefault(); // Prevent scrolling
        // Attack on tap (simple implementation)
        if (!player2.isAttacking) {
            player2.isAttacking = true;
            player2.element.style.backgroundColor = 'lightblue'; // Visual feedback for attack
            setTimeout(() => {
                handleAttack(player2, player1);
                player2.element.style.backgroundColor = 'blue'; // Reset color
            }, 200); // Attack duration
        }
    });
    player2Joystick.addEventListener('touchmove', (event) => handleJoystickMove(event, player2, player2Moving));
    player2Joystick.addEventListener('touchend', () => handleJoystickEnd(player2Moving));
    player2Joystick.addEventListener('touchcancel', () => handleJoystickEnd(player2Moving));
}

// --- Game Loop ---
function gameLoop() {
    if (gameOver) return;
    handleMovement();
    // Other game updates can go here (e.g., animations, complex AI)
}

// --- Initialize Game ---
function initializeGame() {
    console.log("Initializing game...");
    // Reset player positions and health for a new game (if replaying)
    player1.x = 100;
    player1.health = 100;
    player1.facingRight = true;
    player1.element.style.transform = 'scaleX(1)';

    player2.x = gameContainer.offsetWidth - 100 - player2.width;
    player2.health = 100;
    player2.facingRight = false;
    player2.element.style.transform = 'scaleX(-1)';

    timeLeft = 60;
    gameOver = false;
    resultDisplay.style.display = 'none';

    updateHealthDisplay();
    updatePlayerPosition(player1);
    updatePlayerPosition(player2);
    timerDisplay.textContent = timeLeft;

    // Clear any existing intervals if re-initializing
    if (gameInterval) clearInterval(gameInterval);
    if (timerInterval) clearInterval(timerInterval);

    gameInterval = setInterval(gameLoop, 1000 / 60); // ~60 FPS
    timerInterval = setInterval(updateTimer, 1000);
    console.log("Game initialized and loops started.");
}

// Start the game when the script loads
// Ensure DOM is fully loaded before trying to access elements like gameContainer.offsetWidth
document.addEventListener('DOMContentLoaded', () => {
    // Update initial position of player2 based on actual container width
    player2.x = gameContainer.offsetWidth - 100 - player2.width;
    player2Element.style.left = player2.x + 'px';
    initializeGame();
});

console.log("격투 게임 스크립트가 로드되었습니다.");