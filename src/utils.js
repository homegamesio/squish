const path = require('path');

const getAppDataPath = () => {
  switch (process.platform) {
    case "darwin": {
      return path.join(process.env.HOME, "Library", "Application Support", "Your app name");
    }
    case "win32": {
      return path.join(process.env.APPDATA, "Your app name");
    }
    case "linux": {
      return path.join(process.env.HOME, ".Your app name");
    }
    default: {
      console.log("Unsupported platform!");
      process.exit(1);
    }
  }
}


function saveAppData(content) {
    const appDatatDirPath = getAppDataPath();
    
    // Create appDataDir if not exist
    if (!fs.existsSync(appDatatDirPath)) {
        fs.mkdirSync(appDatatDirPath);
    }

    const appDataFilePath = path.join(appDatatDirPath, 'appData.json');
    content = JSON.stringify(content);

    fs.writeFile(appDataFilePath, content, (err) => {
        if (err) {
            console.log("There was a problem saving data!");
            // console.log(err);
        } else {
            console.log("Data saved correctly!");
            loadAppData();
        }
    });
};

module.exports = {
    getAppDataPath
}
