@echo off
setlocal

set "PROJECT_ROOT=%~dp0"

echo.
echo [Deepfake Detection] Running initialize.bat to boot backend and desktop...
call "%PROJECT_ROOT%initialize.bat"

echo.
echo [Deepfake Detection] Checking for Ollama CLI...
where ollama >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Launching Ollama server window...
    start "deepfake-ollama" cmd /K "cd /d %PROJECT_ROOT% && ollama serve"
) else (
    echo Ollama CLI was not found on PATH. Install from https://ollama.com/download to enable local LLM reasoning.
)

echo.
echo [Deepfake Detection] All services requested have been triggered.
endlocal
