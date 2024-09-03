document.addEventListener('DOMContentLoaded', function() {
    let questionElement = document.getElementById('question');
    let answerButtons = document.querySelectorAll('.btn');
    let nextButton = document.getElementById('next-btn');
    let endGameButton = document.getElementById('end-game');
    let startAgainButton = document.getElementById('start-again');
    let diff=document.getElementById('diff');
    let scoresBlock=document.getElementById('scores');

    let currentQuestionIndex = 0;
    let questions = [];
    let currentDifficulty='easy';
    let currentPlayer = 1;
    let scores = {
        player1: 0,
        player2: 0
    };

    let difficultyMap = {
        0: { label: "easy", points: 10 },
        1: { label: "easy", points: 10 },
        2: { label: "medium", points: 15 },
        3: { label: "medium", points: 15 },
        4: { label: "hard", points: 20 },
        5: { label: "hard", points: 20 }
    };

    // Get player names from localStorage
    let player1Name = localStorage.getItem('player1');
    let player2Name = localStorage.getItem('player2');

    // Elements for displaying scores
    let player1ScoreElement = document.getElementById('player1Score');
    let player2ScoreElement = document.getElementById('player2Score');
    let finalScoresElement = document.getElementById('final-scores');

    // Display initial scores with player names
    player1ScoreElement.textContent = `${player1Name}: ${scores.player1}`;
    player2ScoreElement.textContent = `${player2Name}: ${scores.player2}`;

    // Fetch questions from the Trivia API for a difficulty
    async function fetchQuestions(difficulty) {
        try {
            var selectedCategory = localStorage.getItem('selectedCategory');
            var apiUrl = `https://opentdb.com/api.php?amount=2&category=${selectedCategory}&difficulty=${difficulty}&type=multiple`;
    
            let response = await fetch(apiUrl);
            let data = await response.json();
    
            if (!Array.isArray(data.results)) {
                throw new Error(`Invalid data format for ${difficulty} questions`);
            }
    
            questions = questions.concat(data.results);
            diff.textContent=`${difficulty}`;
            displayQuestion();
        } catch (error) {
            console.error(`Failed to fetch questions: ${error}`);
        }
    }
    
    
    
    
// Display the current question and answers
function displayQuestion() {
    if (currentQuestionIndex >= questions.length) {
        // All questions of the current difficulty completed
        if (currentDifficulty === 'easy') {
            currentDifficulty = 'medium';
        } else if (currentDifficulty === 'medium') {
            currentDifficulty = 'hard';
        } else {
            // All difficulties completed
            displayFinalScores();
            return;
        }

        // Fetch next set of questions
        fetchQuestions(currentDifficulty);
        return;
    }

    var currentQuestion = questions[currentQuestionIndex];
    questionElement.textContent = currentQuestion.question;

    var incorrectAnswers = currentQuestion.incorrect_answers || [];
    var correctAnswer = currentQuestion.correct_answer || '';

    var answers = incorrectAnswers.concat(correctAnswer).sort(function() {
        return Math.random() - 0.5;
    });

    answerButtons.forEach(function(button, index) {
        button.textContent = answers[index];
        button.style.display = 'block';
        button.onclick = function() {
            selectAnswer(button, correctAnswer);
        };
    });
}

nextButton.addEventListener('click', function() {
    currentQuestionIndex++;
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    answerButtons.forEach(function(button) {
        button.classList.remove('correct', 'incorrect');
        button.disabled = false;
    });
    nextButton.style.display = 'none';
    displayQuestion();
});



    // Handle answer selection
    function selectAnswer(button, correctAnswer) {
        let isCorrect = button.textContent === correctAnswer;
        button.classList.add(isCorrect ? 'correct' : 'incorrect');
        index=currentQuestionIndex%6;
        if (isCorrect) {
            let difficultyPoints = difficultyMap[index].points;
            if (currentPlayer === 1) {
                scores.player1 += difficultyPoints;
            } else {
                scores.player2 += difficultyPoints;
            }
            updateScores();
        }

        answerButtons.forEach(btn => btn.disabled = true);
        nextButton.style.display = 'block';
    }

    // Update the displayed scores
    function updateScores() {
        player1ScoreElement.textContent = `${player1Name}: ${scores.player1}`;
        player2ScoreElement.textContent = `${player2Name}: ${scores.player2}`;
    }

    

    // Display final scores and declare the winner
    function displayFinalScores() {
        questionElement.textContent = 'Quiz complete! Final Scores:';
        answerButtons.forEach(button => button.style.display = 'none');
        nextButton.style.display = 'none';
        endGameButton.style.display = 'block';
        startAgainButton.style.display = 'block';
        scoresBlock.style.display='none';
        diff.style.display='none';

        let winner = scores.player1 > scores.player2 ? player1Name : scores.player2 > scores.player1 ? player2Name : 'It\'s a tie!';
        
        finalScoresElement.innerHTML = `
            <p>${player1Name}: ${scores.player1}</p>
            <p>${player2Name}: ${scores.player2}</p>
            <p>Winner: ${winner}</p>
        `;
        finalScoresElement.style.display = 'block';
    }

    // Continue the game
    startAgainButton.addEventListener('click', function() {
        Continuegame(scores.player1,scores.player2); // Reload the page to start the game again
    });

    // End the game and go back to the home screen
    endGameButton.addEventListener('click', function() {

        window.location.href = 'index.html'; // Redirect to home page
    });

    //Continue game within the same category
    function Continuegame(p1,p2){
        finalScoresElement.style.display = 'none';
        scoresBlock.style.display='block';
        answerButtons.forEach(function(button) {
            button.classList.remove('correct', 'incorrect');
            button.disabled = false;
            button.style.display='block';
        });
        nextButton.style.display = 'block';
        endGameButton.style.display = 'none';
        startAgainButton.style.display = 'none';
        diff.style.display='block';
        currentDifficulty='easy';
        currentPlayer = 1;
        scores = {
            player1: p1,
            player2: p2
        };
        fetchQuestions(currentDifficulty);
    }
    function startGame() {
        fetchQuestions(currentDifficulty);
    }
    
    startGame();
});




