class HandGestureQuizApp {
    constructor() {
        this.gestureDetector = new GestureDetector();
        this.quizManager = new QuizManager();
        this.isInitialized = false;
        this.cameraAvailable = false;
    }

    async initialize() {
        console.log('Initializing Hand Gesture Quiz App...');
        
        // Show loading screen
        this.showScreen('loading-screen');
        
        try {
            // Load quiz questions
            const questionsLoaded = await this.quizManager.loadQuestions();
            if (!questionsLoaded) {
                throw new Error('Failed to load quiz questions');
            }
            
            // Check camera availability
            this.cameraAvailable = await this.checkCameraAvailability();
            
            // Set camera availability in quiz manager
            this.quizManager.cameraAvailable = this.cameraAvailable;
            
            if (this.cameraAvailable) {
                // Initialize gesture detector
                const gestureInitialized = await this.gestureDetector.initialize();
                if (!gestureInitialized) {
                    console.warn('Gesture detector failed, continuing with keyboard/mouse controls');
                    this.cameraAvailable = false;
                    this.quizManager.cameraAvailable = false;
                } else {
                    // Set up gesture callback
                    this.gestureDetector.setGestureCallback((gesture) => {
                        this.handleGesture(gesture);
                    });
                }
            }
            
            this.isInitialized = true;
            console.log('App initialized successfully');
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Hide loading screen and show appropriate rules screen
            setTimeout(() => {
                if (this.cameraAvailable) {
                    this.showScreen('gesture-rules-screen');
                } else {
                    this.showScreen('keyboard-rules-screen');
                }
            }, 1000);
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize the application. Please refresh the page and try again.');
        }
    }

    async checkCameraAvailability() {
        try {
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.warn('getUserMedia not supported');
                return false;
            }
            
            // Try to get camera access
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            
            // Stop the stream immediately as we just wanted to test access
            stream.getTracks().forEach(track => track.stop());
            
            console.log('Camera access granted');
            return true;
            
        } catch (error) {
            console.warn('Camera access failed:', error.name);
            
            if (error.name === 'NotAllowedError') {
                this.quizManager.updateGestureFeedback('camera-denied');
            } else {
                this.quizManager.updateGestureFeedback('no-camera');
            }
            
            return false;
        }
    }

    handleGesture(gesture) {
        if (!this.isInitialized) return;
        
        console.log('Gesture detected:', gesture);
        this.quizManager.handleGesture(gesture);
        
        // Handle start quiz gesture
        if (gesture === '5' && !this.quizManager.isQuizStarted) {
            this.startQuiz();
        }
    }

    startQuiz() {
        this.showScreen('quiz-screen');
        this.quizManager.startQuiz();
    }

    // Listen for start quiz event from keyboard
    setupEventListeners() {
        document.addEventListener('startQuiz', () => {
            this.startQuiz();
        });
        
        // Listen for start quiz from both gesture and keyboard rules screens
        document.addEventListener('click', (event) => {
            if (event.target.id === 'gesture-start-btn' || event.target.id === 'keyboard-start-btn') {
                this.startQuiz();
            }
        });
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    showError(message) {
        const loadingContent = document.querySelector('.loading-content');
        if (loadingContent) {
            loadingContent.innerHTML = `
                <h1>Hand Gesture Quiz</h1>
                <div style="color: #e53e3e; margin: 20px 0;">
                    <p>❌ ${message}</p>
                </div>
                <button onclick="location.reload()" class="btn btn-primary">
                    Refresh Page
                </button>
            `;
        }
    }

    destroy() {
        if (this.gestureDetector) {
            this.gestureDetector.destroy();
        }
    }
}

// Global app instance
let app;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, starting app...');
    
    // Initialize the app
    app = new HandGestureQuizApp();
    await app.initialize();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (app) {
        app.destroy();
    }
});

// Handle visibility change (pause/resume)
document.addEventListener('visibilitychange', () => {
    if (app && app.gestureDetector) {
        if (document.hidden) {
            // Page is hidden, could pause detection
            console.log('Page hidden, pausing gesture detection');
        } else {
            // Page is visible again, resume detection
            console.log('Page visible, resuming gesture detection');
        }
    }
});

// Add keyboard shortcuts for testing (optional)
document.addEventListener('keydown', (event) => {
    if (!app || !app.isInitialized) return;
    
    // Only enable keyboard shortcuts in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        switch (event.key) {
            case '1':
            case '2':
            case '3':
            case '4':
                app.handleGesture(event.key);
                break;
            case 'n':
                app.quizManager.nextQuestion();
                break;
            case 's':
                app.quizManager.submitQuiz();
                break;
            case 'r':
                if (document.getElementById('results-screen').classList.contains('active')) {
                    app.quizManager.restartQuiz();
                }
                break;
        }
    }
}); 