document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const endScreen = document.getElementById('end-screen');

    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');

    const levelDisplay = document.getElementById('level-display');
    const timeDisplay = document.getElementById('time-display');
    const gameBoard = document.getElementById('game-board');
    const messageArea = document.getElementById('message-area');

    const endTitle = document.getElementById('end-title');
    const endMessage = document.getElementById('end-message');

    // --- Game Configuration ---
    const LEVEL_CONFIG = {
        1: { cards: 3, shuffleTime: 1500 },
        2: { cards: 4, shuffleTime: 2000 },
        3: { cards: 5, shuffleTime: 2500 },
        4: { cards: 6, shuffleTime: 3000 },
        5: { cards: 8, shuffleTime: 3500 },
    };
    const TOTAL_TIME = 60;

    // --- Game State ---
    let currentLevel = 1;
    let timeLeft = TOTAL_TIME;
    let timerInterval = null;
    let isGameActive = false;

    // --- Event Listeners ---
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);

    // --- Game Logic ---
    function startGame() {
        currentLevel = 1;
        timeLeft = TOTAL_TIME;
        isGameActive = true;

        startScreen.classList.remove('active');
        endScreen.classList.remove('active');
        gameScreen.classList.add('active');

        updateTimerDisplay();
        startTimer();
        loadLevel(currentLevel);
    }

    function startTimer() {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                endGame(false, '¡Se acabó el tiempo!');
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        timeDisplay.textContent = timeLeft;
    }

    function loadLevel(level) {
        if (!isGameActive) return;

        levelDisplay.textContent = level;
        gameBoard.innerHTML = '';
        gameBoard.style.pointerEvents = 'none'; // Disable clicks during setup
        messageArea.textContent = 'Memoriza la posición...';

        const config = LEVEL_CONFIG[level];
        const winnerIndex = Math.floor(Math.random() * config.cards);

        for (let i = 0; i < config.cards; i++) {
            createCard(i === winnerIndex);
        }

        // Briefly show the winning card
        setTimeout(() => {
            if (!isGameActive) return;
            messageArea.textContent = '¡Barajando!';
            shuffleCards();
        }, 2000); // Show for 2 seconds
    }

    function createCard(isWinner) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.isWinner = isWinner;

        card.innerHTML = `
            <div class="card-face card-back"></div>
            <div class="card-face card-front">
                ${isWinner ? '<img src="assets/logo.png" alt="Logo">' : ''}
            </div>
        `;

        card.addEventListener('click', handleCardClick);
        gameBoard.appendChild(card);
        
        // Flip to show content initially
        setTimeout(() => card.classList.add('flipped'), 100);
    }

    function shuffleCards() {
        const cards = Array.from(gameBoard.children);
        // Flip all cards back
        cards.forEach(card => card.classList.remove('flipped'));

        setTimeout(() => {
            // Simple shuffle: re-append in random order
            cards.sort(() => Math.random() - 0.5);
            cards.forEach(card => gameBoard.appendChild(card));
            
            messageArea.textContent = '¡Encuentra el logo!';
            gameBoard.style.pointerEvents = 'auto'; // Enable clicks
        }, 800); // Wait for flip animation to finish
    }

    function handleCardClick(e) {
        if (!isGameActive) return;

        const clickedCard = e.currentTarget;
        gameBoard.style.pointerEvents = 'none'; // Prevent multiple clicks
        clickedCard.classList.add('flipped');

        if (clickedCard.dataset.isWinner === 'true') {
            // Correct selection
            messageArea.textContent = '¡Correcto!';
            setTimeout(() => {
                currentLevel++;
                if (currentLevel > Object.keys(LEVEL_CONFIG).length) {
                    endGame(true);
                } else {
                    loadLevel(currentLevel);
                }
            }, 1500);
        } else {
            // Incorrect selection
            messageArea.textContent = 'Incorrecto...';
            endGame(false, '¡Esa no era la carta!');
        }
    }

    function endGame(isVictory, message = '') {
        isGameActive = false;
        clearInterval(timerInterval);

        if (isVictory) {
            endTitle.textContent = '¡FELICIDADES, GANASTE!';
            endMessage.textContent = `Completaste los 5 niveles.`;
        } else {
            endTitle.textContent = 'Juego Terminado';
            endMessage.textContent = message;
        }

        setTimeout(() => {
            gameScreen.classList.remove('active');
            endScreen.classList.add('active');
        }, 2000);
    }
});
