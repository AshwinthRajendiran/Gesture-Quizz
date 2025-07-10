class QuizManager {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.score = 0;
        this.startTime = null;
        this.timer = null;
        this.isQuizComplete = false;
        
        // DOM elements
        this.questionText = document.getElementById('question-text');
        this.optionElements = [
            document.getElementById('option-0'),
            document.getElementById('option-1'),
            document.getElementById('option-2'),
            document.getElementById('option-3')
        ];
        this.questionCounter = document.getElementById('question-counter');
        this.timerElement = document.getElementById('timer');
        this.nextBtn = document.getElementById('next-btn');
        this.submitBtn = document.getElementById('submit-btn');
        
        // Bind event listeners
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.submitBtn.addEventListener('click', () => this.submitQuiz());
    }

    async loadQuestions() {
        try {
            console.log('Fetching questions from /api/quiz...');
            const response = await fetch('/api/quiz');
            
            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status} ${response.statusText}`);
            }
            
            this.questions = await response.json();
            console.log('Questions loaded successfully:', this.questions.length);
            return true;
        } catch (error) {
            console.error('Failed to load questions from API:', error);
            console.error('Error details:', error.message);
            
            // Fallback: Use hardcoded questions if API fails
            console.log('Using fallback questions...');
            this.questions = [
                {
                    id: 1,
                    question: "Which of the following best describes a Demand-Side Platform (DSP)?",
                    options: ["A platform that hosts display ads", "A tool for publishers to serve ads directly", "A platform for media buyers to purchase inventory in real time", "A CRM system used by advertisers"],
                    correctAnswer: 2
                },
                {
                    id: 2,
                    question: "Which of the following platforms aggregates inventory and sells it in bulk to advertisers?",
                    options: ["Ad Server", "Data Management Platform", "Ad Network", "DSP"],
                    correctAnswer: 2
                },
                {
                    id: 3,
                    question: "What is the main advantage of using a DSP over an Ad Network?",
                    options: ["DSPs are free while Ad Networks are not", "DSPs allow impression-by-impression bidding", "DSPs only work with direct publishers", "DSPs use only third-party data"],
                    correctAnswer: 1
                },
                {
                    id: 4,
                    question: "Which entity enables the real-time buying and selling of ad inventory?",
                    options: ["DMP", "Ad Server", "Ad Exchange", "CRM"],
                    correctAnswer: 2
                },
                {
                    id: 5,
                    question: "In a second-price auction used in RTB, the winner pays:",
                    options: ["Their full bid price", "The average of all bids", "The price of the second-highest bid plus $0.01", "The lowest bid submitted"],
                    correctAnswer: 2
                }
            ];
            console.log('Fallback questions loaded:', this.questions.length);
            return true;
        }
    }

    startQuiz() {
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.score = 0;
        this.isQuizComplete = false;
        this.startTime = Date.now();
        
        this.displayQuestion();
        this.startTimer();
        this.updateButtons();
    }

    displayQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.completeQuiz();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        
        // Update question text
        this.questionText.textContent = question.question;
        
        // Update options
        question.options.forEach((option, index) => {
            this.optionElements[index].textContent = option;
        });
        
        // Update counter
        this.questionCounter.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`;
        
        // Clear previous selections
        this.clearSelections();
    }

    selectOption(optionIndex) {
        // Clear previous selections
        this.clearSelections();
        
        // Select new option
        const optionElement = document.querySelector(`[data-index="${optionIndex}"]`);
        if (optionElement) {
            optionElement.classList.add('selected');
        }
        
        // Store answer (convert to 0-based index)
        this.answers[this.currentQuestionIndex] = optionIndex;
        
        // Enable next button
        this.updateButtons();
    }

    clearSelections() {
        document.querySelectorAll('.option').forEach(option => {
            option.classList.remove('selected');
        });
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
            this.updateButtons();
        }
    }

    updateButtons() {
        const hasAnswer = this.answers[this.currentQuestionIndex] !== undefined;
        const isLastQuestion = this.currentQuestionIndex === this.questions.length - 1;
        
        this.nextBtn.disabled = !hasAnswer || isLastQuestion;
        this.submitBtn.disabled = !hasAnswer || !isLastQuestion;
    }

    async submitQuiz() {
        this.isQuizComplete = true;
        this.stopTimer();
        
        // Calculate score
        this.calculateScore();
        
        // Calculate total time
        this.totalTime = Date.now() - this.startTime;
        
        // Submit to server
        await this.submitResults();
        
        // Show results
        this.showResults();
    }

    calculateScore() {
        this.score = 0;
        this.answers.forEach((answer, index) => {
            const question = this.questions[index];
            if (answer === question.correctAnswer) {
                this.score++;
            }
        });
    }

    async submitResults() {
        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    answers: this.answers,
                    score: this.score
                })
            });
            
            const result = await response.json();
            console.log('Quiz submitted:', result);
        } catch (error) {
            console.error('Failed to submit quiz:', error);
        }
    }

    showResults() {
        // Hide quiz screen
        document.getElementById('quiz-screen').classList.remove('active');
        
        // Show results screen
        const resultsScreen = document.getElementById('results-screen');
        resultsScreen.classList.add('active');
        
        // Update results
        const percentage = Math.round((this.score / this.questions.length) * 100);
        document.getElementById('score-percentage').textContent = `${percentage}%`;
        document.getElementById('score-text').textContent = this.score;
        document.getElementById('total-questions').textContent = this.questions.length;
        
        // Display total time
        this.displayTotalTime();
        
        // Show answer summary
        this.displayAnswerSummary();
        
        // Add restart button listener
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartQuiz();
        });
    }

    displayTotalTime() {
        const totalTimeElement = document.getElementById('total-time');
        if (totalTimeElement && this.totalTime) {
            const minutes = Math.floor(this.totalTime / 60000);
            const seconds = Math.floor((this.totalTime % 60000) / 1000);
            totalTimeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    displayAnswerSummary() {
        const summaryContainer = document.getElementById('answers-summary');
        summaryContainer.innerHTML = '';
        
        this.questions.forEach((question, index) => {
            const userAnswer = this.answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            
            const answerItem = document.createElement('div');
            answerItem.className = `answer-item ${isCorrect ? 'correct' : 'incorrect'}`;
            
            const questionText = document.createElement('span');
            questionText.textContent = `Q${index + 1}: ${question.question}`;
            
            const answerText = document.createElement('span');
            if (userAnswer !== undefined) {
                answerText.textContent = `Your answer: ${question.options[userAnswer]}`;
            } else {
                answerText.textContent = 'No answer';
            }
            
            answerItem.appendChild(questionText);
            answerItem.appendChild(answerText);
            summaryContainer.appendChild(answerItem);
        });
    }

    restartQuiz() {
        // Hide results screen
        document.getElementById('results-screen').classList.remove('active');
        
        // Show quiz screen
        document.getElementById('quiz-screen').classList.add('active');
        
        // Restart quiz
        this.startQuiz();
    }

    startTimer() {
        this.timer = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            this.timerElement.textContent = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    handleGesture(gesture) {
        if (this.isQuizComplete) return;
        
        switch (gesture) {
            case '1':
            case '2':
            case '3':
            case '4':
                const optionIndex = parseInt(gesture) - 1;
                this.selectOption(optionIndex);
                break;
            case 'closed':
                if (!this.nextBtn.disabled) {
                    this.nextQuestion();
                }
                break;
            case '5':
                if (!this.submitBtn.disabled) {
                    this.submitQuiz();
                }
                break;
        }
    }

    getCurrentQuestion() {
        return this.questions[this.currentQuestionIndex];
    }

    getProgress() {
        return {
            current: this.currentQuestionIndex + 1,
            total: this.questions.length,
            percentage: Math.round(((this.currentQuestionIndex + 1) / this.questions.length) * 100)
        };
    }
} 