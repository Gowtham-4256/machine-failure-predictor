@echo off
echo 🚀 Launching Machine Failure Predictor System...

:: 1. Start the Backend (FastAPI)
:: Moves to root, activates venv, enters backend, and runs app
start cmd /k "cd /d %~dp0 && .\venv\Scripts\activate && cd backend && python app.py"

:: 2. Start the Frontend (React)
:: Moves to the frontend folder and starts the development server
start cmd /k "cd /d %~dp0\frontend && npm start"

echo ✅ Both windows are opening. 
echo 💡 Tip: Keep these windows open while you use the app.
pause