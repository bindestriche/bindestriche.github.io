@echo off
title Marble Game Server

echo Starting Python web server on http://localhost:8000
echo ===================================================
echo.

REM Check if Python is installed and available in PATH.
python --version >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Python does not seem to be installed or is not in your system's PATH.
    echo Please install Python and make sure to check "Add Python to PATH" during installation.
    pause
    exit /b
)

REM Start the python server in a new, non-blocking window.
REM The "Python Server" part is the title of the new window.
start "Python Server" python -m http.server

echo Waiting for the server to initialize...

REM Wait for 2 seconds. The >nul hides the timeout countdown text.
timeout /t 2 /nobreak >nul

echo Opening the game in your browser...
start http://localhost:8000

echo.
echo ===================================================
echo The server is now running.
echo To stop the server, simply close the new "Python Server" command window.
echo This window will close after you press any key.
echo.
pause