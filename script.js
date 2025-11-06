document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const endScreen = document.getElementById('end-screen');
    const tipModal = document.getElementById('tip-modal'); // Phase 3

    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const continueButton = document.getElementById('continue-button'); // Phase 3

    const levelDisplay = document.getElementById('level-display');
    const timeDisplay = document.getElementById('time-display');
    const scoreDisplay = document.getElementById('score-display');
    const gameBoard = document.getElementById('game-board');
    const messageArea = document.getElementById('message-area');

    const endTitle = document.getElementById('end-title');
    const endMessage = document.getElementById('end-message');
    const tipText = document.getElementById('tip-text'); // Phase 3

    // --- Financial Tips ---
    const financialTips = {
        1: "Tip: ¡Ahorrar una pequeña parte de tus ingresos cada mes puede hacer una gran diferencia a largo plazo!",
        2: "Tip: Crear un presupuesto te ayuda a entender a dónde va tu dinero y a controlar tus gastos.",
        3: "Tip: Evita las compras impulsivas. Espera 24 horas antes de hacer una compra no planificada.",
        4: "Tip: Entender la diferencia entre 'necesidad' y 'deseo' es clave para la salud financiera.",
        5: "¡Felicidades! Has demostrado una gran habilidad. ¡Sigue así con tus finanzas!"
    };

    // --- Game Configuration ---
    const LEVEL_CONFIG = {
        1: { cards: 3, cols: 3 },
        2: { cards: 4, cols: 4 },
        3: { cards: 5, cols: 5 },
        4: { cards: 6, cols: 3 },
        5: { cards: 8, cols: 4 },
    };
    const TOTAL_TIME = 60;

    // --- Game State ---
    let currentLevel = 1;
    let timeLeft = TOTAL_TIME;
    let score = 0;
    let levelStartTime = 0;
    let timerInterval = null;
    let isGameActive = false;

    // --- Event Listeners ---
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    continueButton.addEventListener('click', () => {
        tipModal.classList.remove('active');
        loadLevel(currentLevel);
    });

    // --- Game Logic ---
    function startGame() {
        currentLevel = 1;
        timeLeft = TOTAL_TIME;
        score = 0;
        isGameActive = true;

        startScreen.classList.remove('active');
        endScreen.classList.remove('active');
        tipModal.classList.remove('active');
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
                endGame(false, '¡Se acabó el tiempo!');
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        timeDisplay.textContent = timeLeft;
    }

    function updateScoreDisplay() {
        scoreDisplay.textContent = score;
    }

    function loadLevel(level) {
        if (!isGameActive) return;

        levelDisplay.textContent = level;
        gameBoard.innerHTML = '';
        gameBoard.style.pointerEvents = 'none';
        messageArea.textContent = 'Memoriza la posición...';
        levelStartTime = Date.now();

        const config = LEVEL_CONFIG[level];
        const winnerIndex = Math.floor(Math.random() * config.cards);

        const positions = calculateGridPositions(config.cards, config.cols);

        for (let i = 0; i < config.cards; i++) {
            createCard(i === winnerIndex, positions[i]);
        }

        setTimeout(() => {
            if (!isGameActive) return;
            messageArea.textContent = '¡Barajando!';
            shuffleCards();
        }, 2000);
    }

    // Phase 1: Calculate card positions in a grid
    function calculateGridPositions(numCards, numCols) {
        const positions = [];
        const boardWidth = gameBoard.clientWidth;
        const boardHeight = gameBoard.clientHeight;
        const cardWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--card-size'));
        const cardHeight = cardWidth * 1.4;
        const numRows = Math.ceil(numCards / numCols);

        const totalGridWidth = numCols * cardWidth + (numCols - 1) * 20;
        const totalGridHeight = numRows * cardHeight + (numRows - 1) * 20;
        const offsetX = (boardWidth - totalGridWidth) / 2;
        const offsetY = (boardHeight - totalGridHeight) / 2;

        for (let i = 0; i < numCards; i++) {
            const row = Math.floor(i / numCols);
            const col = i % numCols;
            const left = offsetX + col * (cardWidth + 20);
            const top = offsetY + row * (cardHeight + 20);
            positions.push({ top, left });
        }
        return positions;
    }

    function createCard(isWinner, position) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.isWinner = isWinner;
        card.style.top = `${position.top}px`;
        card.style.left = `${position.left}px`;

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

    // Phase 1: Real shuffle animation
    function shuffleCards() {
        const cards = Array.from(gameBoard.children);
        let positions = cards.map(card => ({ top: card.style.top, left: card.style.left }));

        // Flip all cards back
        cards.forEach(card => card.classList.remove('flipped'));

        setTimeout(() => {
            // Shuffle positions array
            for (let i = positions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [positions[i], positions[j]] = [positions[j], positions[i]];
            }

            // Assign new positions to cards
            cards.forEach((card, i) => {
                card.style.top = positions[i].top;
                card.style.left = positions[i].left;
            });
            
            setTimeout(() => {
                messageArea.textContent = '¡Encuentra el logo!';
                gameBoard.style.pointerEvents = 'auto';
            }, 800); // Wait for shuffle animation to finish

        }, 600); // Wait for flip animation to finish
    }

    function handleCardClick(e) {
        if (!isGameActive) return;

        const clickedCard = e.currentTarget;
        gameBoard.style.pointerEvents = 'none';
        clickedCard.classList.add('flipped');

        if (clickedCard.dataset.isWinner === 'true') {
            // --- Correct selection ---
            const timeTaken = (Date.now() - levelStartTime) / 1000;
            const pointsGained = Math.max(10, Math.round(100 - (timeTaken * 5)));
            score += pointsGained;
            updateScoreDisplay();

            messageArea.textContent = `¡Correcto! +${pointsGained} puntos`;

            setTimeout(() => {
                currentLevel++;
                if (currentLevel > Object.keys(LEVEL_CONFIG).length) {
                    endGame(true);
                } else {
                    showTipModal(); // Phase 3
                }
            }, 1500);

        } else {
            // --- Incorrect selection (Phase 3) ---
            messageArea.textContent = 'Incorrecto...';
            const winnerCard = gameBoard.querySelector('[data-is-winner="true"]');
            winnerCard.classList.add('correct-answer');
            endGame(false, '¡Esa no era la carta!');
        }
    }

    // Phase 3: Show tip modal
    function showTipModal() {
        tipText.textContent = financialTips[currentLevel -1];
        tipModal.classList.add('active');
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
