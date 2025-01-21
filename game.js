// Game settings
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Variables
let birdWidth = 40, birdHeight = 40;
let birdX = 100, birdY = HEIGHT / 2;
let birdVelocity = 0, gravity = 0.5, jumpStrength = -10;
let pipeWidth = 60, pipeGap = 150, pipeVelocity = 3;
let pipes = [];
let score = 0;
let username = '';
let highScore = 0;
let gameOver = false;
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

// Elements
const usernameInput = document.getElementById("usernameInput");
const gameOverScreen = document.getElementById("gameOverScreen");
const leaderboardList = document.getElementById("leaderboardList");
const scoreText = document.getElementById("scoreText");

// Functions
function drawBird() {
    ctx.fillStyle = "brown";
    ctx.fillRect(birdX, birdY, birdWidth, birdHeight);
}

function drawPipes() {
    ctx.fillStyle = "green";
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, HEIGHT - pipe.bottomY);
    });
}

function drawScore() {
    ctx.fillStyle = "black";
    ctx.font = "32px Arial";
    ctx.fillText(`Score: ${score}`, 10, 40);
}

function generatePipe() {
    let gap = Math.floor(Math.random() * (HEIGHT - pipeGap - 100)) + 50;
    return { x: WIDTH, topHeight: gap, bottomY: gap + pipeGap };
}

function resetGame() {
    birdY = HEIGHT / 2;
    birdVelocity = 0;
    pipes = [];
    score = 0;
    gameOver = false;
}

function saveHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem(username, highScore);
    }
    updateLeaderboard();
}

function updateLeaderboard() {
    leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ username, highScore });
    leaderboard.sort((a, b) => b.highScore - a.highScore);
    leaderboard = leaderboard.slice(0, 5); // Keep top 5 scores
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    leaderboardList.innerHTML = leaderboard
        .map(player => `<li>${player.username}: ${player.highScore}</li>`)
        .join('');
}

// Start game
function startGame() {
    username = document.getElementById("username").value.trim();
    if (username) {
        usernameInput.style.display = "none";
        gameLoop();
    }
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    if (!gameOver) {
        // Bird movement
        birdVelocity += gravity;
        birdY += birdVelocity;

        // Prevent bird from going out of bounds
        if (birdY > HEIGHT - birdHeight) {
            birdY = HEIGHT - birdHeight;
            birdVelocity = 0;
        }
        if (birdY < 0) {
            birdY = 0;
            birdVelocity = 0;
        }

        // Move pipes
        pipes.forEach(pipe => pipe.x -= pipeVelocity);

        // Add new pipes
        if (pipes.length === 0 || pipes[pipes.length - 1].x < WIDTH - 300) {
            pipes.push(generatePipe());
        }

        // Remove off-screen pipes
        pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

        // Collision detection
        for (let pipe of pipes) {
            if (birdX + birdWidth > pipe.x && birdX < pipe.x + pipeWidth) {
                if (birdY < pipe.topHeight || birdY + birdHeight > pipe.bottomY) {
                    gameOver = true;
                    saveHighScore();
                }
            }
        }

        // Score increment
        pipes.forEach(pipe => {
            if (pipe.x + pipeWidth < birdX && !pipe.scored) {
                score++;
                pipe.scored = true;
            }
        });
    }

    // Draw everything
    drawBird();
    drawPipes();
    drawScore();

    // Game over screen
    if (gameOver) {
        scoreText.textContent = `Score: ${score} (High Score: ${highScore})`;
        gameOverScreen.style.display = "block";
    } else {
        requestAnimationFrame(gameLoop);
    }
}

// Restart game
function restartGame() {
    gameOverScreen.style.display = "none";
    resetGame();
    gameLoop();
}

// Event listeners
window.addEventListener("keydown", (e) => {
    if (e.key === " " && !gameOver) {
        birdVelocity = jumpStrength; // Jump when spacebar is pressed
    }
    if (e.key === " " && gameOver) {
        restartGame(); // Restart game if spacebar is pressed after game over
    }
});

// Load leaderboard on start
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem(username)) {
        highScore = localStorage.getItem(username);
    }
    updateLeaderboard();
});
