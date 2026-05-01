@echo off

REM Start frontend
start "Postpipe Frontend" cmd /k "cd /d D:\Codes\Postpipe-2.0-fontend- && npm run dev"

REM Start connector
start "Postpipe Connector" cmd /k "cd /d D:\Codes\Postpipe-2.0-fontend-\static-system\my-connector && npm run dev"

exit