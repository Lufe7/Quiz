const Question = document.getElementById("Question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const progressText = document.getElementById('progressText');
const scoreText = document.getElementById('score');
const progressBarFull = document.getElementById("progressBarFull");
const loader  = document.getElementById('loader');
const game  = document.getElementById('game');

let currentQuestion = {};
let acceptingAnswers = true;
let score = 0;
let questionCounter = 0;
let availableQuestion = [];

let questions = [];

fetch("https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple")
.then(res => {
    return res.json();
})
.then(loadedQuestions => {
    if (!loadedQuestions.results || loadedQuestions.results.length === 0) {
        throw new Error("No questions found");
    }

    console.log(loadedQuestions.results);
    questions = loadedQuestions.results.map(loadedQuestion => {
        const formattedQuestions = {
           question: loadedQuestion.question // Cambiado a singular
        };

        const answerChoices = [...loadedQuestion.incorrect_answers];
        formattedQuestions.answer = Math.floor(Math.random() * 3) + 1; // Corregido el cálculo
        answerChoices.splice(formattedQuestions.answer - 1, 0, loadedQuestion.correct_answer);

        answerChoices.forEach((choice, index) => {
            formattedQuestions["choice" + (index + 1)] = choice;
        });

        return formattedQuestions;
    });


    startGame();
})
.catch(err => {
    console.error(err); // Corregido el error tipográfico
});

// CONSTANTES
const CORRECT_BONUS = 10;
const MAX_QUESTION = 3;

const startGame = () => {
    questionCounter = 0;
    score = 0;
    availableQuestion = [...questions];
    console.log(availableQuestion);
    getNewQuestion();
    
    game.classList.remove("hidden");
    loader.classList.add("hidden");
};

const getNewQuestion = () => {
    if (availableQuestion.length === 0 || questionCounter >= MAX_QUESTION) {
        localStorage.setItem('mostRecentScore', score);
        return window.location.assign("/end.html");
    }

    questionCounter++;
    progressText.innerText = `Question ${questionCounter} / ${MAX_QUESTION}`;

    // Actualiza la barra de progreso
    progressBarFull.style.width = `${(questionCounter / MAX_QUESTION) * 100}%`;

    const questionIndex = Math.floor(Math.random() * availableQuestion.length);
    currentQuestion = availableQuestion[questionIndex];
    availableQuestion.splice(questionIndex, 1); // Elimina la pregunta seleccionada

    Question.innerText = currentQuestion.question;

    choices.forEach(choice => {
        const number = choice.dataset.number;
        choice.innerText = currentQuestion['choice' + number];
    });

    acceptingAnswers = true;
};

const incrementScore = num => {
    score += num;
    scoreText.innerText = score;
};

choices.forEach(choice => {
    choice.addEventListener('click', e => {
        if (!acceptingAnswers) return;
        acceptingAnswers = false;

        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset["number"];

        const classToApply = 
            selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";

        if (classToApply === 'correct') {
            incrementScore(CORRECT_BONUS);
        }

        selectedChoice.parentElement.classList.add(classToApply);

        setTimeout(() => {
            selectedChoice.parentElement.classList.remove(classToApply);
            getNewQuestion();
        }, 1000);
    });
});


