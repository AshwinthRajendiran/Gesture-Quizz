class HandGestureQuizApp {
    constructor() {
        this.gestureDetector = new GestureDetector();
        this.quizManager = new QuizManager();
        this.isInitialized = false;
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
            
            // Initialize gesture detector
            const gestureInitialized = await this.gestureDetector.initialize();
            if (!gestureInitialized) {
                throw new Error('Failed to initialize gesture detector');
            }
            
            // Set up gesture callback
            this.gestureDetector.setGestureCallback((gesture) => {
                this.handleGesture(gesture);
            });
            
            this.isInitialized = true;
            console.log('App initialized successfully');
            
            // Hide loading screen and show quiz
            setTimeout(() => {
                this.showScreen('quiz-screen');
                this.quizManager.startQuiz();
            }, 1000);
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize the application. Please refresh the page and try again.');
        }
    }

    handleGesture(gesture) {
        if (!this.isInitialized) return;
        
        console.log('Gesture detected:', gesture);
        this.quizManager.handleGesture(gesture);
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
    
    // Check for webcam support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Webcam access is not supported in your browser. Please use a modern browser with webcam support.');
        return;
    }
    
    // Request webcam permission early
    try {
        await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (error) {
        alert('Please allow webcam access to use the hand gesture quiz.');
        return;
    }
    
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