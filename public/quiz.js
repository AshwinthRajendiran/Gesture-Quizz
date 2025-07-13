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
                    options: ["A platform for media buyers to purchase inventory in real time", "A tool for publishers to serve ads directly", "A platform that hosts display ads", "A CRM system used by advertisers"],
                    correctAnswer: 0
                },
                {
                    id: 2,
                    question: "Which of the following platforms aggregates inventory and sells it in bulk to advertisers?",
                    options: ["Ad Network", "Ad Server", "Data Management Platform", "DSP"],
                    correctAnswer: 0
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
                    options: ["Ad Exchange", "DMP", "Ad Server", "CRM"],
                    correctAnswer: 0
                },
                {
                    id: 5,
                    question: "In a second-price auction used in RTB, the winner pays:",
                    options: ["Their full bid price", "The average of all bids", "The lowest bid submitted", "The price of the second-highest bid plus $0.01"],
                    correctAnswer: 3
                },
                {
                    id: 6,
                    question: "Why are first-price auctions becoming more popular in AdTech?",
                    options: ["They reduce latency in header bidding", "They guarantee higher user engagement", "They eliminate the need for ad exchanges", "They increase transparency for advertisers"],
                    correctAnswer: 3
                },
                {
                    id: 7,
                    question: "A key disadvantage of RTB is:",
                    options: ["It eliminates user segmentation", "It may not guarantee premium inventory", "It bypasses all privacy laws", "It only supports desktop ads"],
                    correctAnswer: 1
                },
                {
                    id: 8,
                    question: "What distinguishes PMP (Private Marketplace) from open RTB?",
                    options: ["PMP is open to all advertisers", "PMP allows selective inventory access by invite", "PMP does not use DSPs", "PMP is only for mobile in-app ads"],
                    correctAnswer: 1
                },
                {
                    id: 9,
                    question: "Programmatic Direct deals:",
                    options: ["Combine manual negotiations with automated ad serving", "Are executed entirely by humans", "Involve no automation", "Are illegal in the EU due to GDPR"],
                    correctAnswer: 0
                },
                {
                    id: 10,
                    question: "Which media buying method gives guaranteed inventory?",
                    options: ["Programmatic Direct", "Open RTB", "Header Bidding", "Waterfall Auctions"],
                    correctAnswer: 0
                },
                {
                    id: 11,
                    question: "Which of the following is a form of ad fraud?",
                    options: ["CPM optimization", "Deal ID verification", "Frequency capping", "Ad stacking in a single ad slot"],
                    correctAnswer: 3
                },
                {
                    id: 12,
                    question: "Which metric ensures an ad was actually seen by a user?",
                    options: ["Conversion Rate", "Click-Through Rate", "Bounce Rate", "Viewable Impression"],
                    correctAnswer: 3
                },
                {
                    id: 13,
                    question: "Ad viewability for a display ad requires:",
                    options: ["50% pixels in viewport for at least 1 second", "100% pixels in viewport for 1 second", "All pixels in viewport for 2 seconds", "Full-screen visibility with interaction"],
                    correctAnswer: 0
                },
                {
                    id: 14,
                    question: "Which cookie type is used to track users across multiple domains?",
                    options: ["Flash cookie", "Third-party cookie", "First-party cookie", "Session cookie"],
                    correctAnswer: 1
                },
                {
                    id: 15,
                    question: "What is a core goal of Safari's Intelligent Tracking Prevention (ITP)?",
                    options: ["Block malware", "Improve site SEO", "Increase ad revenue", "Restrict cross-site user tracking"],
                    correctAnswer: 3
                }
            ];
            console.log('Fallback questions loaded:', this.questions.length);
            return true;
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