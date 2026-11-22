@echo off
chcp 65001 >nul
cd /d "%~dp0"
title TikCity - modo teste
where node >nul 2>nul || goto semnode
if not exist node_modules (
  echo Instalando pela primeira vez, espere um pouco...
  call npm install --no-fund --no-audit
)
start "" "http://localhost:3000/?painel=1"
node server.js --simulacao
pause
exit /b
:semnode
echo.
echo  Falta instalar o Node.js: https://nodejs.org  (botao LTS)
echo.
pause
