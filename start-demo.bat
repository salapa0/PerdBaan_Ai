@echo off
REM Start the Poet Baan demo on http://localhost:5173
cd /d "%~dp0"
echo.
echo   Poet Baan demo  -  http://localhost:5173
echo   Opening Chrome and starting the server...  (close this window to stop)
echo.
start "" http://localhost:5173
where py >nul 2>nul && ( py -m http.server 5173 ) || ( python -m http.server 5173 )
pause
