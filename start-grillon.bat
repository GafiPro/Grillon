@echo off
setlocal
cd /d "%~dp0"

set "PORT=8000"
set "URL=http://127.0.0.1:%PORT%/"

where py >nul 2>nul
if not errorlevel 1 (
    start "Grillon - servidor local" cmd /k "cd /d ""%~dp0"" && py -m http.server %PORT% --bind 127.0.0.1"
    goto :open_browser
)

where python >nul 2>nul
if not errorlevel 1 (
    start "Grillon - servidor local" cmd /k "cd /d ""%~dp0"" && python -m http.server %PORT% --bind 127.0.0.1"
    goto :open_browser
)

echo Nao foi encontrado Python neste computador.
echo Instala Python ou inicia o jogo manualmente com:
echo   py -m http.server %PORT% --bind 127.0.0.1
pause
exit /b 1

:open_browser
timeout /t 2 /nobreak >nul
start "" "%URL%"
echo.
echo Grillon esta disponivel em %URL%
echo Para desligar o servidor, fecha a janela "Grillon - servidor local".
echo Podes fechar esta janela.
pause
endlocal
