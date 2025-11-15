@echo off
setlocal

REM Root of the repository
set "PROJECT_ROOT=%~dp0"
pushd "%PROJECT_ROOT%"

echo.
echo [Deepfake Detection] Bootstrapping local environment...

REM Ensure Python virtual environment exists
if not exist ".venv" (
    echo Creating Python virtual environment...
    py -3 -m venv .venv
)

REM Install backend dependencies
echo Installing backend requirements...
call ".venv\Scripts\activate.bat"
pip install -r backend\requirements.txt >nul
deactivate >nul 2>&1

REM Start FastAPI backend in a new terminal window
echo Launching FastAPI backend (uvicorn)...
start "deepfake-backend" cmd /K "cd /d %PROJECT_ROOT% && call .venv\Scripts\activate.bat && uvicorn backend.app.main:app --reload"

REM Install frontend dependencies if needed
pushd desktop
if not exist "node_modules" (
    echo Installing desktop dependencies...
    npm install
)

REM Start Electron desktop in a new terminal window
echo Launching Electron desktop app...
start "deepfake-desktop" cmd /K "cd /d %PROJECT_ROOT%desktop && npm run dev"
popd

echo.
echo [Deepfake Detection] Backend and desktop processes started.
echo Close these windows to stop the services.

popd
endlocal
