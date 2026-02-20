@echo off
REM Opens the static delivery app preview in the default browser
pushd "%~dp0"
start "" "index.html"
popd
exit /b 0
