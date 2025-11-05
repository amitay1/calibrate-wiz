const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');

let mainWindow = null;

function initAutoUpdater(window) {
  mainWindow = window;

  // Configure auto-updater
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  // Update available
  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info);
    
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: `A new version ${info.version} is available. Would you like to download it now?`,
      buttons: ['Download', 'Later'],
      defaultId: 0,
      cancelId: 1,
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
        
        // Show progress notification
        mainWindow.webContents.send('update-downloading');
      }
    });
  });

  // Update not available
  autoUpdater.on('update-not-available', () => {
    console.log('Update not available');
  });

  // Download progress
  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow.webContents.send('update-progress', {
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total,
    });
  });

  // Update downloaded
  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info);
    
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: `Version ${info.version} has been downloaded. The application will restart to install the update.`,
      buttons: ['Restart Now', 'Later'],
      defaultId: 0,
      cancelId: 1,
    }).then((result) => {
      if (result.response === 0) {
        setImmediate(() => autoUpdater.quitAndInstall());
      }
    });
  });

  // Error
  autoUpdater.on('error', (error) => {
    console.error('Auto-updater error:', error);
    
    dialog.showErrorBox(
      'Update Error',
      'An error occurred while checking for updates. Please try again later.'
    );
  });
}

function checkForUpdates() {
  autoUpdater.checkForUpdates();
}

module.exports = {
  initAutoUpdater,
  checkForUpdates,
};
