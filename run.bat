@echo off
setlocal ENABLEEXTENSIONS ENABLEDELAYEDEXPANSION

:: Request admin privileges if not already elevated
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [Launcher] Requesting administrator privileges...
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

REM ---------------------------------------------------------------------------
REM  Deepfake Detection - Full Stack Launcher (Backend + Desktop + Ollama)
REM ---------------------------------------------------------------------------

set "PROJECT_ROOT=%~dp0"
set "MODE=%~1"
set "FRONTEND_DIR=%PROJECT_ROOT%frontend"
set "OLLAMA_STATUS=skipped"

cd /d "%PROJECT_ROOT%" || goto :fatal

call :banner "Deepfake Detection Full Stack"
call :prepare_environment || goto :fatal
call :start_backend || goto :fatal
call :start_ollama
call :launch_wsl_ollama

if /I "%MODE%"=="backend-only" goto :summary

call :prepare_react_frontend || goto :fatal
call :build_react_frontend || goto :fatal
call :start_frontend_electron || goto :fatal

:summary
echo.
echo ============================================================
echo  Services launching (check new terminal windows):
echo     - deepfake-backend   : FastAPI at http://127.0.0.1:8000
if /I "%OLLAMA_STATUS%"=="running" (
    echo     - deepfake-ollama    : local LLM window (deepfake-ollama)
) else if /I "%OLLAMA_STATUS%"=="missing" (
    echo     - deepfake-ollama    : skipped (Ollama CLI not detected)
) else (
    echo     - deepfake-ollama    : skipped (%OLLAMA_STATUS%)
)
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
start "deepfake-backend" cmd /K "cd /d ""%PROJECT_ROOT%"" && call .venv\Scripts\activate.bat && uvicorn backend.app.main:app --reload"
exit /b 0

:start_ollama
set "OLLAMA_STATUS=missing"
where ollama >nul 2>&1 || (
    echo [Ollama] CLI not detected. Install from https://ollama.com/download to enable local reasoning.
    echo [Ollama] No ubuntu/ollama terminal window will open until the CLI is installed.
    exit /b 0
)
set "OLLAMA_STATUS=checking"
call :ensure_llama_model
echo [Ollama] Starting ollama serve...
start "deepfake-ollama" cmd /K "cd /d ""%PROJECT_ROOT%"" && ollama serve"
set "OLLAMA_STATUS=running"
exit /b 0

:ensure_llama_model
echo [Ollama] Ensuring llama3:8b model assets are available...
set "LLAMA_READY="
for /f "delims=" %%M in ('ollama list ^| findstr /I "llama3:8b"') do set "LLAMA_READY=1"
if defined LLAMA_READY (
    echo [Ollama] llama3:8b already present locally.
) else (
    echo [Ollama] Pulling llama3:8b (this may take a few minutes on first run)...
    ollama pull llama3:8b || (
        echo [Ollama] Warning: automatic pull failed. Run "ollama pull llama3:8b" manually once the serve window is up.
        exit /b 0
    )
)
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
start "deepfake-frontend" cmd /K "cd /d ""%FRONTEND_DIR%"" && npm run electron:shell"
exit /b 0

:launch_wsl_ollama
set "WSL_PULL_STARTED="
if exist "%SystemRoot%\System32\wsl.exe" (
    set "WSL_DISTRO="
    for /f "delims=" %%D in ('"%SystemRoot%\System32\wsl.exe" -l -q 2^>nul') do (
        echo %%D | findstr /I "ubuntu" >nul 2>&1
        if not errorlevel 1 (
            set "WSL_DISTRO=%%D"
            goto :wsl_found
        )
    )
    if not defined WSL_DISTRO (
        for /f "delims=" %%D in ('"%SystemRoot%\System32\wsl.exe" -l -q 2^>nul') do (
            if not defined WSL_DISTRO set "WSL_DISTRO=%%D"
        )
    )
    if defined WSL_DISTRO (
        echo [Ollama][WSL] Opening Ubuntu session to pull llama3:8b...
        start "ubuntu-ollama-pull" "%SystemRoot%\System32\wsl.exe" -d "%WSL_DISTRO%" /bin/bash -lc "ollama pull llama3:8b; echo; echo 'WSL session ready. Leave this open to reuse the llama3 cache.'; exec bash"
        set "WSL_PULL_STARTED=1"
        goto :wsl_exit
    ) else (
        echo [Ollama][WSL] No Linux distributions registered. Attempting native Windows pull instead.
    )
) else (
    echo [Ollama][WSL] Windows Subsystem for Linux not detected. Attempting native Windows pull instead.
)
:wsl_exit
if defined WSL_PULL_STARTED exit /b 0
echo [Ollama] Opening Windows shell to pull llama3:8b...
start "ollama-pull" cmd /K "cd /d ""%PROJECT_ROOT%"" && ollama pull llama3:8b && echo( && echo Pull complete. Leave this window open to monitor ollama downloads."
exit /b 0
