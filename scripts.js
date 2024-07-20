let currentPlayer = 'player1';
let previousScores = {
    player1: [],
    player2: []
};
let scoreHistory = [];
let gameType = '501';
let legsToWin = 1;
let player1Legs = 0;
let player2Legs = 0;

// Valid finishing scores
const validFinishes = new Set([
    2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 25, 50, 32, 36, 40, 44, 48, 52, 56,
    60, 64, 68, 72, 76, 80, 84, 88, 92, 96, 100, 104, 108, 112, 116, 120,
    124, 128, 132, 136, 140, 144, 148, 152, 156, 160, 164, 168, 170
]);

// Invalid finish scores
const invalidFinishes = new Set([180, 179, 178, 177, 176, 175, 174, 173, 172, 171, 169, 168, 166, 165, 163, 162, 159]);

function startGame() {
    const player1Name = document.getElementById('player1Name').value;
    const player2Name = document.getElementById('player2Name').value;
    const gameTypeSelect = document.getElementById('gameType');
    const legsInput = document.getElementById('legs');
    
    if (!player1Name || !player2Name) {
        alert('Please enter both player names.');
        return;
    }
    
    gameType = gameTypeSelect.value;
    legsToWin = parseInt(legsInput.value, 10);

    if (isNaN(legsToWin) || legsToWin < 1) {
        alert('Please enter a valid number of legs.');
        return;
    }

    // Update player names on the game screen
    document.getElementById('player1NameDisplay').innerText = player1Name;
    document.getElementById('player2NameDisplay').innerText = player2Name;

    // Hide setup screen and show game screen
    document.getElementById('setupScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    
    // Reset scores and stats
    resetGame();
}

function resetGame() {
    document.getElementById('player1Score').innerText = gameType;
    document.getElementById('player2Score').innerText = gameType;
    document.getElementById('player1Average').innerText = 'Average: 0';
    document.getElementById('player2Average').innerText = 'Average: 0';
    document.getElementById('player1DartsThrown').innerText = 'Darts Thrown: 0';
    document.getElementById('player2DartsThrown').innerText = 'Darts Thrown: 0';
    document.getElementById('player1Legs').innerText = 'Legs Won: 0';
    document.getElementById('player2Legs').innerText = 'Legs Won: 0';
    currentPlayer = 'player1';
    previousScores = { player1: [], player2: [] };
    scoreHistory = [];
    player1Legs = 0;
    player2Legs = 0;
    highlightCurrentPlayer();
    document.body.style.pointerEvents = 'auto'; // Enable input and interactions
    document.getElementById('winnerPopup').style.display = 'none'; // Hide winner popup
    document.getElementById('overlay').style.display = 'none'; // Hide overlay
}


function appendNumber(number) {
    const scoreInput = document.getElementById('scoreInput');
    scoreInput.value += number;
    checkInputLength();
}

function deleteNumber() {
    const scoreInput = document.getElementById('scoreInput');
    scoreInput.value = scoreInput.value.slice(0, -1);
}

function updateScore() {
    const scoreInput = document.getElementById('scoreInput');
    const scoreValue = scoreInput.value === '' ? 0 : parseInt(scoreInput.value, 10);

    if (scoreValue >= 0 && scoreValue <= 180) {
        const currentPlayerScore = document.getElementById(`${currentPlayer}Score`);
        let currentScore = parseInt(currentPlayerScore.innerText, 10);

        // Calculate new score after the input
        const newScore = currentScore - scoreValue;

        // Check if the new score is invalid
        if (newScore < 0 || newScore === 1 || (newScore === 0 && invalidFinishes.has(currentScore))) {
            alert('Invalid score.');
            scoreInput.value = ''; // Clear input
            return; // Prevent further action
        }

        // Update the score
        currentPlayerScore.innerText = newScore;

        // Update previous scores and score history
        previousScores[currentPlayer].push(scoreValue);
        scoreHistory.push({ player: currentPlayer, score: scoreValue });

        // Update darts thrown
        const dartsThrownElement = document.getElementById(`${currentPlayer}DartsThrown`);
        dartsThrownElement.innerText = (parseInt(dartsThrownElement.innerText.replace('Darts Thrown: ', ''), 10) || 0) + 3;

        // Text-to-speech announcement
        const utterance = new SpeechSynthesisUtterance(`${scoreValue}`);
        speechSynthesis.speak(utterance);

        scoreInput.value = ''; // Clear input after updating score
        calculateAverage(currentPlayer);

        if (newScore === 0) {
            declareWinner(currentPlayer);
        } else {
            switchPlayer();
        }
    } else {
        alert('Please enter a valid score between 0 and 180');
    }
}

function calculateAverage(player) {
    const scores = previousScores[player];
    const totalDarts = scores.length * 3;
    const totalScore = scores.reduce((acc, score) => acc + score, 0);
    const average = totalScore / (scores.length || 1); // Avoid division by zero

    const averageDisplay = document.getElementById(`${player}Average`);
    averageDisplay.innerText = `Average: ${average.toFixed(2)}`;
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
    highlightCurrentPlayer();
}

function highlightCurrentPlayer() {
    const player1Section = document.getElementById('player1Section');
    const player2Section = document.getElementById('player2Section');

    player1Section.classList.remove('active');
    player2Section.classList.remove('active');

    const currentPlayerSection = document.getElementById(`${currentPlayer}Section`);
    currentPlayerSection.classList.add('active');
}

function checkInputLength() {
    const scoreInput = document.getElementById('scoreInput');
    if (scoreInput.value.length > 3) {
        scoreInput.value = scoreInput.value.slice(0, 3);
    }
}

function declareWinner(player) {
    // Increment the legs won for the player
    if (player === 'player1') {
        player1Legs++;
        document.getElementById('player1Legs').innerText = `Legs Won: ${player1Legs}`;
    } else {
        player2Legs++;
        document.getElementById('player2Legs').innerText = `Legs Won: ${player2Legs}`;
    }

    // Check if the player has won the match
    if (player1Legs >= legsToWin || player2Legs >= legsToWin) {
        // Show winner popup with match details
        showMatchWinnerPopup();
    } else {
        // Reset scores for the next leg
        resetScoresForNewLeg();
    }
}

function showMatchWinnerPopup() {
    const winner = player1Legs >= legsToWin ? 'Player 1' : 'Player 2';
    const player1Average = document.getElementById('player1Average').innerText;
    const player2Average = document.getElementById('player2Average').innerText;

    const winnerPopup = document.getElementById('winnerPopup');
    winnerPopup.innerHTML = `
        <h2>${winner} wins the match!</h2>
        <p>${player1Legs} - ${player2Legs}</p>
        <p>Player 1 Average: ${player1Average}</p>
        <p>Player 2 Average: ${player2Average}</p>
        <!-- No button here anymore -->
    `;
    winnerPopup.style.display = 'block'; // Show popup
    document.getElementById('overlay').style.display = 'block'; // Show overlay

    // Disable input and interactions
    document.body.style.pointerEvents = 'none';
}

function resetLeg() {
    document.getElementById('player1Score').innerText = gameType;
    document.getElementById('player2Score').innerText = gameType;
    document.getElementById('player1DartsThrown').innerText = 'Darts Thrown: 0';
    document.getElementById('player2DartsThrown').innerText = 'Darts Thrown: 0';
    previousScores = { player1: [], player2: [] };
    scoreHistory = [];
    currentPlayer = 'player1';
    highlightCurrentPlayer();
}

function resetScoresForNewLeg() {
    document.getElementById('player1Score').innerText = gameType;
    document.getElementById('player2Score').innerText = gameType;
    document.getElementById('player1DartsThrown').innerText = 'Darts Thrown: 0';
    document.getElementById('player2DartsThrown').innerText = 'Darts Thrown: 0';
    previousScores = { player1: [], player2: [] };
    scoreHistory = [];
    currentPlayer = 'player1'; // Start next leg with Player 1
    highlightCurrentPlayer();
}

function undo() {
    if (scoreHistory.length === 0) {
        alert('Nothing to undo.');
        return;
    }

    // Get the last entry from the score history
    const lastEntry = scoreHistory.pop();
    const player = lastEntry.player;
    const lastScore = lastEntry.score;

    // Revert the score
    const currentPlayerScoreElement = document.getElementById(`${player}Score`);
    let currentScore = parseInt(currentPlayerScoreElement.innerText, 10);
    currentScore += lastScore;
    currentPlayerScoreElement.innerText = currentScore;

    // Update previous scores
    const previousScoresArray = previousScores[player];
    previousScoresArray.pop();

    // Update darts thrown count
    const dartsThrownElement = document.getElementById(`${player}DartsThrown`);
    dartsThrownElement.innerText = parseInt(dartsThrownElement.innerText, 10) - 3;

    // Clear the score input
    document.getElementById('scoreInput').value = '';

    // Recalculate the average
    calculateAverage(player);

    // Switch back to the current player if needed
    switchPlayer();
}

function restartGame() {
    // Hide the winner popup and reset the game
    document.getElementById('winnerPopup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    
    // Remove disabled state
    document.querySelectorAll('.game-screen *').forEach(el => {
        el.classList.remove('disabled');
    });

    // Reset game state
    resetGame();

    // Show the setup screen and hide the game screen
    document.getElementById('setupScreen').classList.remove('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
}

function endGame() {
    // Reset game state and show the setup screen
    resetGame();
    document.querySelectorAll('.game-screen *').forEach(el => {
        el.classList.remove('disabled');
    });
    document.getElementById('setupScreen').classList.remove('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
}

function setupOverlayClickListener() {
    const overlay = document.getElementById('overlay');
    overlay.addEventListener('click', restartGame);
}

// Call this function when the page loads or when setting up the game
document.addEventListener('DOMContentLoaded', setupOverlayClickListener);

// Update the showMatchWinnerPopup function to ensure the overlay is visible
function showMatchWinnerPopup() {
    const winner = player1Legs >= legsToWin ? 'Player 1' : 'Player 2';
    const player1Average = document.getElementById('player1Average').innerText;
    const player2Average = document.getElementById('player2Average').innerText;

    const winnerPopup = document.getElementById('winnerPopup');
    winnerPopup.innerHTML = `
        <h2>${winner} wins the match!</h2>
        <p>${player1Legs} - ${player2Legs}</p>
        <p>Player 1 Average: ${player1Average}</p>
        <p>Player 2 Average: ${player2Average}</p>
        <!-- No button here anymore -->
    `;
    winnerPopup.style.display = 'block'; // Show popup
    document.getElementById('overlay').style.display = 'block'; // Show overlay

    // Disable all elements except the End Game button
    document.querySelectorAll('.game-screen *:not(.end-game-btn)').forEach(el => {
        el.classList.add('disabled');
    });
}
