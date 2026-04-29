@echo off
echo Starting Local Web Server for MMO Isekai Editor...
echo Please wait a moment...

:: Check if node/npm is available
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed! 
    echo Please install Node.js to use the editor with assets.
    pause
    exit /b
)

:: Start the server in a new minimized window
start /min cmd /c "npm run serve"

:: Wait for server to start
timeout /t 3 /nobreak >nul

:: Open the Map Editor in the default browser
start http://localhost:3000/map-editor.html

echo.
echo Map Editor should be open in your browser now.
echo (Keep this window open or minimize it while using the editor)
echo.
pause
