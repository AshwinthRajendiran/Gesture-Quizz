#!/bin/bash

# 🚀 Quick Deploy Script for Hand Gesture Quiz
# This script helps you deploy to Render.com

echo "🚀 Hand Gesture Quiz Deployment Script"
echo "======================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Hand Gesture Quiz App"
fi

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Please add your GitHub repository as remote origin:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo ""
    echo "📋 Then push your code:"
    echo "   git push -u origin main"
    echo ""
    echo "🌐 Then deploy to Render:"
    echo "   1. Go to https://render.com"
    echo "   2. Sign up/Login"
    echo "   3. Click 'New Web Service'"
    echo "   4. Connect your GitHub repository"
    echo "   5. Configure:"
    echo "      - Name: hand-gesture-quiz"
    echo "      - Environment: Node"
    echo "      - Build Command: npm install"
    echo "      - Start Command: npm start"
    echo "      - Plan: Free"
    echo "   6. Click 'Create Web Service'"
else
    echo "✅ Git remote already configured"
    echo "📤 Pushing latest changes..."
    git add .
    git commit -m "Update: Hand Gesture Quiz App"
    git push origin main
    echo "✅ Code pushed to GitHub!"
    echo ""
    echo "🌐 Deploy to Render:"
    echo "   1. Go to https://render.com"
    echo "   2. Create New Web Service"
    echo "   3. Connect your repository"
    echo "   4. Use the configuration files provided"
fi

echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
echo "🎉 Happy deploying!" 