document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const endScreen = document.getElementById('end-screen');

    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');

    const levelDisplay = document.getElementById('level-display');
    const timeDisplay = document.getElementById('time-display');
    const scoreDisplay = document.getElementById('score-display'); // New
    const gameBoard = document.getElementById('game-board');
    const messageArea = document.getElementById('message-area');

    const endTitle = document.getElementById('end-title');
    const endMessage = document.getElementById('end-message');

    // --- Phase 2: Sound Effects ---
    // IMPORTANT: User must provide these audio files in the 'assets' folder
    const sounds = {
        click: new Audio('assets/click.mp3'),
        shuffle: new Audio('assets/shuffle.mp3'),
        winLevel: new Audio('assets/winLevel.mp3'),
        winGame: new Audio('assets/winGame.mp3'),
        lose: new Audio('assets/lose.mp3'),
    };

    // --- Phase 2: Financial Tips ---
    const financialTips = {
        1: "Tip: ¡Ahorrar una pequeña parte de tus ingresos cada mes puede hacer una gran diferencia a largo plazo!",
        2: "Tip: Crear un presupuesto te ayuda a entender a dónde va tu dinero y a controlar tus gastos.",
        3: "Tip: Evita las compras impulsivas. Espera 24 horas antes de hacer una compra no planificada.",
        4: "Tip: Entender la diferencia entre 'necesidad' y 'deseo' es clave para la salud financiera.",
        5: "¡Felicidades! Has demostrado una gran habilidad. ¡Sigue así con tus finanzas!"
    };

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
    let score = 0; // New
    let levelStartTime = 0; // New
    let timerInterval = null;
    let isGameActive = false;

    // --- Event Listeners ---
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);

    // --- Game Logic ---
    function startGame() {
        currentLevel = 1;
        timeLeft = TOTAL_TIME;
        score = 0; // New
        isGameActive = true;

        startScreen.classList.remove('active');
        endScreen.classList.remove('active');
        gameScreen.classList.add('active');

        updateScoreDisplay();
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
                sounds.lose.play();
                endGame(false, '¡Se acabó el tiempo!');
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        timeDisplay.textContent = timeLeft;
    }

    function updateScoreDisplay() { // New
        scoreDisplay.textContent = score;
    }

    function loadLevel(level) {
        if (!isGameActive) return;

        levelDisplay.textContent = level;
        gameBoard.innerHTML = '';
        gameBoard.style.pointerEvents = 'none';
        messageArea.textContent = 'Memoriza la posición...';
        levelStartTime = Date.now(); // New

        const config = LEVEL_CONFIG[level];
        const winnerIndex = Math.floor(Math.random() * config.cards);

        for (let i = 0; i < config.cards; i++) {
            createCard(i === winnerIndex);
        }

        setTimeout(() => {
            if (!isGameActive) return;
            messageArea.textContent = '¡Barajando!';
            sounds.shuffle.play();
            shuffleCards();
        }, 2000);
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
        
        setTimeout(() => card.classList.add('flipped'), 100);
    }

    function shuffleCards() {
        const cards = Array.from(gameBoard.children);
        cards.forEach(card => card.classList.remove('flipped'));

        setTimeout(() => {
            cards.sort(() => Math.random() - 0.5);
            cards.forEach(card => gameBoard.appendChild(card));
            
            messageArea.textContent = '¡Encuentra el logo!';
            gameBoard.style.pointerEvents = 'auto';
        }, 800);
    }

    function handleCardClick(e) {
        if (!isGameActive) return;

        const clickedCard = e.currentTarget;
        sounds.click.play();
        gameBoard.style.pointerEvents = 'none';
        clickedCard.classList.add('flipped');

        if (clickedCard.dataset.isWinner === 'true') {
            // --- Correct selection (Phase 2 logic) ---
            sounds.winLevel.play();
            const timeTaken = (Date.now() - levelStartTime) / 1000; // seconds
            const pointsGained = Math.max(10, Math.round(100 - (timeTaken * 5)));
            score += pointsGained;
            updateScoreDisplay();

            messageArea.textContent = `¡Correcto! +${pointsGained} puntos`;

            setTimeout(() => {
                messageArea.textContent = financialTips[currentLevel];
                setTimeout(() => {
                    currentLevel++;
                    if (currentLevel > Object.keys(LEVEL_CONFIG).length) {
                        sounds.winGame.play();
                        endGame(true);
                    } else {
                        loadLevel(currentLevel);
                    }
                }, 3000); // Show tip for 3 seconds
            }, 1500); // Show points for 1.5 seconds

        } else {
            // --- Incorrect selection ---
            sounds.lose.play();
            messageArea.textContent = 'Incorrecto...';
            endGame(false, '¡Esa no era la carta!');
        }
    }

    function endGame(isVictory, message = '') {
        isGameActive = false;
        clearInterval(timerInterval);

        if (isVictory) {
            endTitle.textContent = '¡FELICIDADES, GANASTE!';
            endMessage.textContent = `Tu puntuación final es: ${score}`;
        } else {
            endTitle.textContent = 'Juego Terminado';
            endMessage.textContent = `${message} Tu puntuación fue: ${score}`;
        }

        setTimeout(() => {
            gameScreen.classList.remove('active');
            endScreen.classList.add('active');
        }, 2500);
    }
});
