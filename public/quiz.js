class QuizManager {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.score = 0;
        this.startTime = null;
        this.timer = null;
        this.isQuizComplete = false;
        this.isQuizStarted = false;
        
        // Gesture detection delay
        this.gestureDelay = 3000; // 3 seconds delay
        this.gestureEnabled = false;
        this.gestureDelayTimer = null;
        
        // Keyboard navigation
        this.selectedOptionIndex = -1;
        this.cameraAvailable = false;
        
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
        this.gestureStartBtn = document.getElementById('gesture-start-btn');
        this.keyboardStartBtn = document.getElementById('keyboard-start-btn');
        
        // Bind event listeners
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.submitBtn.addEventListener('click', () => this.submitQuiz());
        if (this.gestureStartBtn) {
            this.gestureStartBtn.addEventListener('click', () => this.startQuiz());
        }
        if (this.keyboardStartBtn) {
            this.keyboardStartBtn.addEventListener('click', () => this.startQuiz());
        }
        
        // Bind keyboard events
        this.bindKeyboardEvents();
    }

    async loadQuestions() {
        try {
            const response = await fetch('/api/quiz');
            this.questions = await response.json();
            console.log('Questions loaded:', this.questions.length);
            return true;
        } catch (error) {
            console.error('Failed to load questions:', error);
            return false;
        }
    }

    startQuiz() {
        this.isQuizStarted = true;
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.score = 0;
        this.isQuizComplete = false;
        this.startTime = Date.now();
        this.selectedOptionIndex = -1;
        
        // Clear any existing gesture delay
        if (this.gestureDelayTimer) {
            clearTimeout(this.gestureDelayTimer);
            this.gestureDelayTimer = null;
        }
        
        // Hide webcam section if camera is not available
        this.updateWebcamVisibility();
        
        this.displayQuestion();
        this.startTimer();
        this.updateButtons();
    }

    updateWebcamVisibility() {
        const webcamSection = document.getElementById('webcam-section');
        const quizContent = document.querySelector('.quiz-content');
        
        if (webcamSection) {
            if (this.cameraAvailable) {
                webcamSection.style.display = 'flex';
                quizContent.classList.remove('no-webcam');
            } else {
                webcamSection.style.display = 'none';
                quizContent.classList.add('no-webcam');
            }
        }
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
        
        // Start gesture delay timer
        this.startGestureDelay();
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
        
        // Clear keyboard selection
        this.selectedOptionIndex = -1;
        this.updateOptionSelection();
        
        // Enable next button
        this.updateButtons();
    }

    clearSelections() {
        document.querySelectorAll('.option').forEach(option => {
            option.classList.remove('selected', 'keyboard-selected');
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
        
        // Show/hide buttons based on question number
        if (isLastQuestion) {
            this.nextBtn.style.display = 'none';
            this.submitBtn.style.display = 'block';
            this.submitBtn.disabled = !hasAnswer;
        } else {
            this.nextBtn.style.display = 'block';
            this.submitBtn.style.display = 'none';
            this.nextBtn.disabled = !hasAnswer;
        }
    }

    async submitQuiz() {
        this.isQuizComplete = true;
        this.stopTimer();
        
        // Stop any ongoing gesture delay
        if (this.gestureDelayTimer) {
            clearTimeout(this.gestureDelayTimer);
            this.gestureDelayTimer = null;
        }
        
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
        
        // Update restart instructions based on mode
        this.updateRestartInstructions();
        
        // Add restart button listener
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartQuiz();
        });
    }

    updateRestartInstructions() {
        const restartInstructions = document.getElementById('restart-instructions');
        if (restartInstructions) {
            if (this.cameraAvailable) {
                restartInstructions.innerHTML = '<p>Press <strong>Enter</strong> or show <strong>5 fingers</strong> to restart the quiz</p>';
            } else {
                restartInstructions.innerHTML = '<p>Press <strong>Enter</strong> to restart the quiz</p>';
            }
        }
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
            
            const questionText = document.createElement('div');
            questionText.className = 'question-text';
            questionText.textContent = `Q${index + 1}: ${question.question}`;
            
            const answerText = document.createElement('div');
            answerText.className = 'answer-text';
            if (userAnswer !== undefined) {
                answerText.innerHTML = `<strong>Your answer:</strong> ${question.options[userAnswer]}`;
            } else {
                answerText.innerHTML = `<strong>Your answer:</strong> No answer`;
            }
            
            const correctAnswerText = document.createElement('div');
            correctAnswerText.className = 'correct-answer-text';
            correctAnswerText.innerHTML = `<strong>Correct answer:</strong> ${question.options[question.correctAnswer]}`;
            
            answerItem.appendChild(questionText);
            answerItem.appendChild(answerText);
            answerItem.appendChild(correctAnswerText);
            summaryContainer.appendChild(answerItem);
        });
    }

    restartQuiz() {
        // Reset quiz state
        this.isQuizComplete = false;
        this.isQuizStarted = false;
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.score = 0;
        this.selectedOptionIndex = -1;
        
        // Stop any timers
        this.stopTimer();
        if (this.gestureDelayTimer) {
            clearTimeout(this.gestureDelayTimer);
            this.gestureDelayTimer = null;
        }
        
        // Hide results screen
        document.getElementById('results-screen').classList.remove('active');
        
        // Show appropriate rules screen based on camera availability
        if (this.cameraAvailable) {
            document.getElementById('gesture-rules-screen').classList.add('active');
        } else {
            document.getElementById('keyboard-rules-screen').classList.add('active');
        }
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

    startGestureDelay() {
        // Disable gesture detection
        this.gestureEnabled = false;
        
        // Clear any existing timer
        if (this.gestureDelayTimer) {
            clearTimeout(this.gestureDelayTimer);
        }
        
        // Disable gesture detector feedback
        if (this.gestureDetector) {
            this.gestureDetector.setGestureEnabled(false);
        }
        
        // Hide detection messages during countdown
        this.updateGestureFeedback('countdown');
        
        // Start countdown timer with visual feedback
        let remainingTime = Math.ceil(this.gestureDelay / 1000);
        
        const countdownInterval = setInterval(() => {
            remainingTime--;
            if (remainingTime > 0) {
                this.updateGestureFeedback('waiting', remainingTime);
            } else {
                clearInterval(countdownInterval);
                this.gestureEnabled = true;
                this.updateGestureFeedback('ready');
            }
        }, 1000);
        
        // Set the main delay timer
        this.gestureDelayTimer = setTimeout(() => {
            clearInterval(countdownInterval);
            this.gestureEnabled = true;
            this.updateGestureFeedback('ready');
            
            // Re-enable gesture detector feedback
            if (this.gestureDetector) {
                this.gestureDetector.setGestureEnabled(true);
            }
        }, this.gestureDelay);
    }

    updateGestureFeedback(status, countdown = null) {
        const gestureText = document.getElementById('gesture-text');
        const gestureFeedback = document.querySelector('.gesture-feedback');
        
        // Remove all status classes
        gestureFeedback.classList.remove('waiting', 'ready', 'no-camera', 'camera-denied');
        
        switch (status) {
            case 'waiting':
                if (countdown !== null) {
                    gestureText.textContent = `⏳ Please wait ${countdown} seconds before making gestures...`;
                } else {
                    gestureText.textContent = `⏳ Please wait 3 seconds before making gestures...`;
                }
                gestureFeedback.classList.add('waiting');
                break;
            case 'ready':
                gestureText.textContent = '🖐️ Show your hand to the camera';
                gestureFeedback.classList.add('ready');
                break;
            case 'no-camera':
                gestureText.textContent = '📷 Camera not available - Use arrow keys and Enter';
                gestureFeedback.classList.add('no-camera');
                break;
            case 'camera-denied':
                gestureText.textContent = '❌ Camera access denied - Use arrow keys and Enter';
                gestureFeedback.classList.add('camera-denied');
                break;
            case 'countdown':
                // Hide detection messages during countdown
                gestureText.textContent = '';
                break;
        }
    }

    bindKeyboardEvents() {
        document.addEventListener('keydown', (event) => {
            // Handle restart quiz from results screen (both modes)
            if (this.isQuizComplete && event.key === 'Enter') {
                event.preventDefault();
                this.restartQuiz();
                return;
            }
            
            if (this.isQuizComplete) return;
            
            if (!this.isQuizStarted) {
                // Handle start quiz from rules screens (both modes)
                if (event.key === 'Enter') {
                    event.preventDefault();
                    this.startQuiz();
                    // Trigger screen change
                    document.dispatchEvent(new CustomEvent('startQuiz'));
                }
                return;
            }
            
            if (!this.cameraAvailable) {
                // Keyboard navigation when camera is not available
                switch (event.key) {
                    case 'ArrowUp':
                        event.preventDefault();
                        this.navigateOptions('up');
                        break;
                    case 'ArrowDown':
                        event.preventDefault();
                        this.navigateOptions('down');
                        break;
                    case 'Enter':
                        event.preventDefault();
                        if (this.selectedOptionIndex >= 0) {
                            this.selectOption(this.selectedOptionIndex);
                        } else if (!this.nextBtn.disabled) {
                            this.nextQuestion();
                        } else if (!this.submitBtn.disabled) {
                            this.submitQuiz();
                        }
                        break;
                }
            } else {
                // In camera mode, Enter key only works for start/restart, not for quiz navigation
                // (gestures handle the quiz navigation)
                if (event.key === 'Enter') {
                    event.preventDefault();
                    // Enter key in camera mode only works for start/restart, not during quiz
                }
            }
        });
    }

    navigateOptions(direction) {
        const maxIndex = 3;
        
        if (direction === 'up') {
            this.selectedOptionIndex = this.selectedOptionIndex <= 0 ? maxIndex : this.selectedOptionIndex - 1;
        } else {
            this.selectedOptionIndex = this.selectedOptionIndex >= maxIndex ? 0 : this.selectedOptionIndex + 1;
        }
        
        this.updateOptionSelection();
    }

    updateOptionSelection() {
        // Remove previous selection
        document.querySelectorAll('.option').forEach(option => {
            option.classList.remove('keyboard-selected');
        });
        
        // Add selection to current option
        if (this.selectedOptionIndex >= 0) {
            const optionElement = document.querySelector(`[data-index="${this.selectedOptionIndex}"]`);
            if (optionElement) {
                optionElement.classList.add('keyboard-selected');
            }
        }
    }

    handleGesture(gesture) {
        // Only handle gestures if camera is available
        if (!this.cameraAvailable) return;
        
        // Handle restart quiz from results screen
        if (this.isQuizComplete && gesture === '5') {
            this.restartQuiz();
            return;
        }
        
        if (this.isQuizComplete || !this.gestureEnabled) return;
        
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
                if (!this.isQuizStarted) {
                    this.startQuiz();
                    // Trigger screen change
                    document.dispatchEvent(new CustomEvent('startQuiz'));
                } else if (!this.submitBtn.disabled) {
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