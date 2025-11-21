const { app, components, BrowserWindow } = require('electron');
const os = require('os');
const crypto = require('crypto');

// Handle --quit command line argument for installer
if (process.argv.includes('--quit')) {
  app.quit();
  process.exit(0);
}

function getMachineInfo() {
  const networkInterfaces = os.networkInterfaces();
  const allMacs = [];
  let primaryMacAddress = '';

  // Collect all MAC addresses
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      if (iface.mac && iface.mac !== '00:00:00:00:00:00' && !iface.internal) {
        allMacs.push(iface.mac);
        if (!primaryMacAddress) {
          primaryMacAddress = iface.mac;
        }
      }
    }
  }

  // Generate machineId from MAC address and hostname
  const machineIdSource = `${primaryMacAddress}-${os.hostname()}`;
  const machineId = crypto.createHash('sha256').update(machineIdSource).digest('hex');

  return {
    machineName: os.hostname(),
    macAddress: primaryMacAddress || '00:00:00:00:00:00',
    machineId: machineId,
    allMacs: allMacs.join(','),
    os: os.platform(),
    flag: process.platform === 'win32' ? 'win' : process.platform === 'darwin' ? 'mac' : 'linux',
    appVersion: '8081'
  };
}

function injectLocalStorage(webContents, machineInfo) {
  const script = `
    localStorage.setItem('machineName', '${machineInfo.machineName}');
    localStorage.setItem('macAddress', '${machineInfo.macAddress}');
    localStorage.setItem('machineId', '${machineInfo.machineId}');
    localStorage.setItem('allMacs', '${machineInfo.allMacs}');
    localStorage.setItem('os', '${machineInfo.os}');
    localStorage.setItem('flag', '${machineInfo.flag}');
    localStorage.setItem('appVersion', '${machineInfo.appVersion}');
  `;
  webContents.executeJavaScript(script);
}

function createWindow() {
  const machineInfo = getMachineInfo();
  
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // Inject localStorage before page loads
  win.webContents.on('did-finish-load', () => {
    injectLocalStorage(win.webContents, machineInfo);
  });

  win.loadURL('https://app.theuniqueacademycommerce.com/dashboard');
}
app.whenReady().then(async () => {
  await components.whenReady();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
