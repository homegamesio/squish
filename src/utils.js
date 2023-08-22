const path = require('path');

const getAppDataPath = () => {
  if (!process) {
    return "";
  }

  switch (process.platform) {
    case "darwin": {
      return path.join(process.env.HOME, "Library", "Application Support", "homegames");
    }
    case "win32": {
      return path.join(process.env.APPDATA, "homegames");
    }
    case "linux": {
      return path.join(process.env.HOME, ".homegames");
    }
    default: {
      console.log("Unsupported platform!");
      process.exit(1);
    }
  }
}

module.exports = {
    getAppDataPath
}
