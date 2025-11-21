!macro customInstall
  # Close the application if it's running
  DetailPrint "Checking for running application..."
  nsExec::ExecToLog '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" --quit'

  # Wait for the application to close
  Sleep 2000

  # Kill any remaining processes by name
  nsExec::ExecToLog 'taskkill /f /im "${APP_EXECUTABLE_FILENAME}" /t'
  nsExec::ExecToLog 'taskkill /f /im "electron.exe" /t'

  Sleep 1000
!macroend

!macro customUnInstall
  # Close the application if it's running before uninstalling
  DetailPrint "Closing application before uninstall..."
  nsExec::ExecToLog '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" --quit'

  # Wait for the application to close
  Sleep 2000

  # Kill any remaining processes
  nsExec::ExecToLog 'taskkill /f /im "${APP_EXECUTABLE_FILENAME}" /t'
  nsExec::ExecToLog 'taskkill /f /im "electron.exe" /t'

  Sleep 1000
!macroend

!macro customInit
  # Basic initialization - no process checking to avoid plugin dependencies
!macroend
