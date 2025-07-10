# Hand Gesture Quiz Application

A full-stack quiz application where users interact using hand gestures instead of clicking buttons. The app uses MediaPipe Hands for real-time hand gesture detection via webcam.

## Features

- **Hand Gesture Recognition**: Uses MediaPipe Hands to detect hand landmarks and count fingers
- **Interactive Quiz**: 10 questions with 4 options each
- **Gesture Controls**:
  - 1-4 fingers: Select answer options
  - Closed hand (✊): Next question
  - 5 fingers: Submit quiz
- **Real-time Feedback**: Visual feedback showing detected gestures
- **Timer**: Tracks quiz completion time
- **Results Screen**: Shows score, percentage, and answer summary
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js (version 14 or higher)
- Modern web browser with webcam support (Chrome, Firefox, Safari, Edge)
- Webcam access permission

## Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

## How to Use

### Getting Started

1. **Allow Webcam Access**: When prompted, allow the browser to access your webcam
2. **Wait for Loading**: The app will load the hand detection model (this may take a few seconds)
3. **Position Your Hand**: Show your hand to the camera in the right panel

### Gesture Controls

- **1 Finger**: Select Option 1
- **2 Fingers**: Select Option 2  
- **3 Fingers**: Select Option 3
- **4 Fingers**: Select Option 4
- **Closed Hand (✊)**: Move to next question (only works after selecting an answer)
- **5 Fingers**: Submit the quiz (only works on the last question)

### Tips for Best Detection

1. **Good Lighting**: Ensure your hand is well-lit
2. **Clear Background**: Use a plain background for better detection
3. **Hand Position**: Keep your hand clearly visible in the camera frame
4. **Steady Hand**: Hold gestures steady for 1-2 seconds for reliable detection
5. **Distance**: Keep your hand about 20-30cm from the camera

## Project Structure

```
hand-gesture-quiz/
├── public/
│   ├── index.html          # Main HTML file
│   ├── style.css           # Styling
│   ├── gesture.js          # Hand gesture detection
│   ├── quiz.js             # Quiz logic and state management
│   └── main.js             # Main application controller
├── server.js               # Express server and API endpoints
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Technical Details

### Frontend Technologies
- **HTML5**: Structure and video element for webcam
- **CSS3**: Modern styling with gradients and animations
- **JavaScript (ES6+)**: Modular architecture with classes
- **MediaPipe Hands**: Hand landmark detection and gesture recognition

### Backend Technologies
- **Node.js**: Server runtime
- **Express.js**: Web framework and API endpoints
- **CORS**: Cross-origin resource sharing

### Key Components

#### GestureDetector Class (`gesture.js`)
- Handles MediaPipe Hands initialization
- Detects finger positions and counts
- Implements gesture debouncing to prevent rapid firing
- Provides real-time visual feedback

#### QuizManager Class (`quiz.js`)
- Manages quiz state and progression
- Handles answer selection and scoring
- Controls UI updates and navigation
- Manages timer and results display

#### HandGestureQuizApp Class (`main.js`)
- Coordinates between gesture detection and quiz logic
- Handles application initialization and error handling
- Manages screen transitions

## API Endpoints

- `GET /api/quiz` - Returns quiz questions
- `POST /api/submit` - Submits quiz results
- `GET /api/results` - Returns all quiz results

## Development Features

### Keyboard Shortcuts (Development Only)
When running on localhost, you can use keyboard shortcuts for testing:
- `1-4`: Select answer options
- `n`: Next question
- `s`: Submit quiz
- `r`: Restart quiz (from results screen)

### Error Handling
- Webcam access failures
- Model loading errors
- Network connectivity issues
- Graceful degradation with user-friendly error messages

## Troubleshooting

### Common Issues

1. **Webcam not working**
   - Check browser permissions
   - Ensure no other apps are using the webcam
   - Try refreshing the page

2. **Gesture detection not working**
   - Improve lighting conditions
   - Check hand position in camera frame
   - Ensure hand is clearly visible

3. **Model loading fails**
   - Check internet connection (MediaPipe loads from CDN)
   - Try refreshing the page
   - Clear browser cache

4. **Server won't start**
   - Check if port 3000 is already in use
   - Ensure Node.js is installed
   - Run `npm install` to install dependencies

### Browser Compatibility

- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Internet Explorer**: Not supported

## Customization

### Adding New Questions
Edit the `quizData` array in `server.js`:

```javascript
{
    id: 11,
    question: "Your new question here?",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: 2  // 0-based index of correct answer
}
```

### Modifying Gesture Sensitivity
Adjust the `gestureDebounceTime` in `gesture.js`:

```javascript
this.gestureDebounceTime = 1000; // Milliseconds
```

### Styling Changes
Modify `style.css` to customize the appearance. The app uses CSS Grid and Flexbox for responsive design.

## Performance Optimization

- Gesture detection runs at ~30fps
- Debouncing prevents rapid gesture firing
- Efficient DOM updates minimize reflows
- Lazy loading of MediaPipe models

## Security Considerations

- Webcam access requires user permission
- No sensitive data is stored permanently
- API endpoints are basic and for demonstration
- Consider adding authentication for production use

## Future Enhancements

- User accounts and persistent scores
- Multiple quiz categories
- Advanced gesture recognition
- Voice commands integration
- Mobile app version
- Multiplayer quiz mode

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application.

---

**Enjoy your hand gesture quiz experience! 🖐️✌️** 