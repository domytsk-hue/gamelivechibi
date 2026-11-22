@echo off
chcp 65001 >nul
cd /d "%~dp0"
title TikCity - LIVE (deixe esta janela aberta)
where node >nul 2>nul || goto semnode
if not exist node_modules (
  echo Instalando pela primeira vez, espere um pouco...
  call npm install --no-fund --no-audit
)
if exist usuario.txt del usuario.txt
echo.
echo  Deixe esta janela ABERTA durante toda a live.
echo  Quando aparecer "conectado na live", esta tudo certo.
node server.js
pause
exit /b
:semnode
echo.
echo  Falta instalar o Node.js: https://nodejs.org  (botao LTS)
echo.
pause
