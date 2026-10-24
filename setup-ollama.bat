@echo off
REM Helper: set OLLAMA_ORIGINS and pull the demo models.
REM EDIT the two model tags below to the sizes that fit your RAM, then write the SAME tags
REM into js\config.js (textModel / visionModel).

echo.
echo === 1) Allow the browser page to call Ollama ===
setx OLLAMA_ORIGINS "http://localhost:*,http://127.0.0.1:*"
echo   OLLAMA_ORIGINS set. Quit Ollama from the tray and start it again for this to take effect.
echo.

echo === 2) Pull the models (this downloads a few GB) ===
REM --- Vision model (also does Chinese translation). Use :3b on 8GB RAM, :7b on 16GB+ ---
set VISION=qwen2.5vl:7b
REM --- Thai text model: official SCB 10X Typhoon 8B GGUF from Hugging Face (~5 GB) ---
set TEXT=hf.co/scb10x/llama-3-typhoon-v1.5-8b-instruct-gguf

echo   Pulling vision model: %VISION%
ollama pull %VISION%
echo   Pulling text model: %TEXT%
ollama pull %TEXT%

echo.
echo === 3) Check ===
ollama list
echo.
echo   Now open js\config.js and make textModel / visionModel match the tags above.
echo   Reload http://localhost:5173 - the console Ollama light should turn green.
pause
