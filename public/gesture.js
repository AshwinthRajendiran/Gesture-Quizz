class GestureDetector {
    constructor() {
        this.hands = null;
        this.camera = null;
        this.isInitialized = false;
        this.lastGesture = null;
        this.gestureDebounceTime = 1000; // 1 second debounce
        this.lastGestureTime = 0;
        this.onGestureCallback = null;
        
        // Hand landmark indices for finger detection
        this.fingerIndices = {
            thumb: [4, 3, 2, 1, 0],
            index: [8, 7, 6, 5],
            middle: [12, 11, 10, 9],
            ring: [16, 15, 14, 13],
            pinky: [20, 19, 18, 17]
        };
    }

    async initialize() {
        try {
            console.log('Loading MediaPipe Hands...');
            
            // Initialize MediaPipe Hands
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`;
                }
            });

            console.log('Configuring hands detection...');
            this.hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.hands.onResults(this.onResults.bind(this));

            console.log('Getting video element...');
            const videoElement = document.getElementById('webcam');
            if (!videoElement) {
                throw new Error('Video element with id "webcam" not found');
            }

            console.log('Initializing camera...');
            // Initialize camera
            this.camera = new Camera(videoElement, {
                onFrame: async () => {
                    if (this.hands) {
                        await this.hands.send({ image: videoElement });
                    }
                },
                width: 400,
                height: 300
            });

            await this.camera.start();
            this.isInitialized = true;
            
            console.log('Gesture detector initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize gesture detector:', error);
            console.error('Error details:', error.message);
            return false;
        }
    }

    onResults(results) {
        const canvas = document.getElementById('output-canvas');
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            
            // Draw hand landmarks
            this.drawLandmarks(ctx, landmarks);
            
            // Detect gesture
            const gesture = this.detectGesture(landmarks);
            this.updateGestureFeedback(gesture);
            
            // Handle gesture with debouncing
            this.handleGesture(gesture);
        } else {
            this.updateGestureFeedback(null);
        }
    }

    drawLandmarks(ctx, landmarks) {
        // Draw connections
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        
        // Draw finger connections
        for (const finger of Object.values(this.fingerIndices)) {
            for (let i = 0; i < finger.length - 1; i++) {
                const start = landmarks[finger[i]];
                const end = landmarks[finger[i + 1]];
                
                ctx.beginPath();
                ctx.moveTo(start.x * ctx.canvas.width, start.y * ctx.canvas.height);
                ctx.lineTo(end.x * ctx.canvas.width, end.y * ctx.canvas.height);
                ctx.stroke();
            }
        }
        
        // Draw landmark points
        ctx.fillStyle = '#FF0000';
        for (const landmark of landmarks) {
            ctx.beginPath();
            ctx.arc(
                landmark.x * ctx.canvas.width,
                landmark.y * ctx.canvas.height,
                3,
                0,
                2 * Math.PI
            );
            ctx.fill();
        }
    }

    detectGesture(landmarks) {
        const fingerCount = this.countRaisedFingers(landmarks);
        
        // Check for closed hand (0 fingers up) - next question gesture
        if (fingerCount === 0) {
            return 'closed';
        }
        
        // Return finger count for 1-5 fingers
        if (fingerCount >= 1 && fingerCount <= 5) {
            return fingerCount.toString();
        }
        
        return null;
    }

    countRaisedFingers(landmarks) {
        let count = 0;
        
        // Check each finger
        const fingers = ['thumb', 'index', 'middle', 'ring', 'pinky'];
        
        for (const finger of fingers) {
            if (this.isFingerUp(landmarks, finger)) {
                count++;
            }
        }
        
        return count;
    }

    isFingerUp(landmarks, fingerName) {
        const finger = this.fingerIndices[fingerName];
        
        if (fingerName === 'thumb') {
            // Thumb detection is different due to its orientation
            const thumbTip = landmarks[finger[0]];
            const thumbIP = landmarks[finger[1]];
            const thumbMCP = landmarks[finger[2]];
            
            // Check if thumb is extended horizontally
            return thumbTip.x > thumbIP.x;
        } else {
            // For other fingers, check if tip is above the PIP joint
            const tip = landmarks[finger[0]];
            const pip = landmarks[finger[2]];
            
            return tip.y < pip.y;
        }
    }

    isClosedHand(landmarks) {
        // Check if all fingers are down (closed hand)
        const thumbDown = !this.isFingerUp(landmarks, 'thumb');
        const indexDown = !this.isFingerUp(landmarks, 'index');
        const middleDown = !this.isFingerUp(landmarks, 'middle');
        const ringDown = !this.isFingerUp(landmarks, 'ring');
        const pinkyDown = !this.isFingerUp(landmarks, 'pinky');
        
        return thumbDown && indexDown && middleDown && ringDown && pinkyDown;
    }

    updateGestureFeedback(gesture) {
        const gestureText = document.getElementById('gesture-text');
        
        if (!gesture) {
            gestureText.textContent = 'Show your hand to the camera';
            return;
        }
        
        switch (gesture) {
            case 'closed':
                gestureText.textContent = '✊ Closed hand detected - Next question';
                break;
            case '1':
                gestureText.textContent = '1 finger - Option 1 selected';
                break;
            case '2':
                gestureText.textContent = '2 fingers - Option 2 selected';
                break;
            case '3':
                gestureText.textContent = '3 fingers - Option 3 selected';
                break;
            case '4':
                gestureText.textContent = '4 fingers - Option 4 selected';
                break;
            case '5':
                gestureText.textContent = '5 fingers - Submit quiz';
                break;
            default:
                gestureText.textContent = 'Gesture detected: ' + gesture;
        }
    }

    handleGesture(gesture) {
        const now = Date.now();
        
        // Debounce gestures to prevent rapid firing
        if (now - this.lastGestureTime < this.gestureDebounceTime) {
            return;
        }
        
        // Only trigger if gesture changed
        if (gesture !== this.lastGesture && gesture !== null) {
            this.lastGesture = gesture;
            this.lastGestureTime = now;
            
            if (this.onGestureCallback) {
                this.onGestureCallback(gesture);
            }
        }
    }

    setGestureCallback(callback) {
        this.onGestureCallback = callback;
    }

    destroy() {
        if (this.camera) {
            this.camera.stop();
        }
        if (this.hands) {
            this.hands.close();
        }
    }
} 