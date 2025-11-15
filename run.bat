@echo off
setlocal ENABLEEXTENSIONS ENABLEDELAYEDEXPANSION

REM ---------------------------------------------------------------------------
REM  Deepfake Detection - Full Stack Launcher (Backend + Desktop + Ollama)
REM ---------------------------------------------------------------------------

set "PROJECT_ROOT=%~dp0"
set "MODE=%~1"

cd /d "%PROJECT_ROOT%" || goto :fatal

call :banner "Deepfake Detection Full Stack"
call :prepare_environment || goto :fatal
call :start_backend || goto :fatal
call :start_ollama

if /I "%MODE%"=="backend-only" goto :summary

call :prepare_react_frontend || goto :fatal
call :build_react_frontend || goto :fatal
call :start_frontend_electron || goto :fatal

:summary
echo.
echo ============================================================
echo  Services launching (check new terminal windows):
echo     - deepfake-backend   : FastAPI at http://127.0.0.1:8000
echo     - deepfake-ollama    : local LLM (if CLI available)
if /I not "%MODE%"=="backend-only" (
    echo     - deepfake-frontend : Electron shell (serving frontend/build)
)
echo ============================================================
echo Keep this launcher open until you confirm all windows started.
pause
exit /b 0

:fatal
echo.
echo [ERROR] Launcher stopped due to the issue shown above.
echo Press any key to close this window once you have reviewed it.
pause
exit /b 1

:banner
echo ============================================================
echo   %~1
echo ============================================================
exit /b 0

:prepare_environment
call :detect_python || exit /b 1
call :ensure_venv || exit /b 1
echo [Python] Installing backend requirements...
call ".venv\Scripts\activate.bat" || (
    echo Could not activate the Python virtual environment.
    exit /b 1
)
pip install -r backend\requirements.txt || (
    echo pip install failed. Review the log above for details.
    call ".venv\Scripts\deactivate.bat" >nul 2>&1
    exit /b 1
)
call ".venv\Scripts\deactivate.bat" >nul 2>&1
exit /b 0

:detect_python
where py >nul 2>&1 && set "PYTHON_CMD=py -3"
if defined PYTHON_CMD exit /b 0
where python >nul 2>&1 || (
    echo Python 3 was not found on PATH. Install it from https://python.org and rerun this script.
    exit /b 1
)
set "PYTHON_CMD=python"
exit /b 0

:ensure_venv
if exist ".venv\Scripts\python.exe" exit /b 0
echo [Python] Creating virtual environment (.venv)...
%PYTHON_CMD% -m venv .venv || (
    echo Failed to create the Python virtual environment.
    exit /b 1
)
exit /b 0

:start_backend
echo [Backend] Launching FastAPI (uvicorn)...
start "deepfake-backend" cmd /K "cd /d %PROJECT_ROOT% && call .venv\Scripts\activate.bat && uvicorn backend.app.main:app --reload"
exit /b 0

:start_ollama
where ollama >nul 2>&1 || (
    echo [Ollama] CLI not detected. Install from https://ollama.com/download to enable local reasoning.
    exit /b 0
)
echo [Ollama] Starting ollama serve...
start "deepfake-ollama" cmd /K "cd /d %PROJECT_ROOT% && ollama serve"
exit /b 0

:prepare_react_frontend
if not exist "frontend\package.json" (
    echo [Frontend] frontend\\package.json not found. Cannot launch UI.
    exit /b 1
)
echo [Frontend] Installing npm dependencies...
pushd frontend
npm install || (
    echo npm install failed for the React app. Check the log above.
    popd
    exit /b 1
)
popd
exit /b 0

:build_react_frontend
echo [Frontend] Building production assets...
pushd frontend
npm run build || (
    echo React build failed. Check the log above.
    popd
    exit /b 1
)
popd
exit /b 0

:start_frontend_electron
echo [Frontend] Launching Electron shell...
start "deepfake-frontend" cmd /K "cd /d %PROJECT_ROOT%frontend && npm run electron:shell"
exit /b 0
