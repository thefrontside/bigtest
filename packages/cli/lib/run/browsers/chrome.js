import BaseBrowser from './base';

export default class ChromeBrowser extends BaseBrowser {
  name = 'Google Chrome';

  get command() {
    switch (process.platform) {
      case 'linux':
        return [
          'google-chrome',
          'google-chrome-stable'
        ];
      case 'darwin':
        return [
          `${this.homedir}/Applications/${this.name}.app/Contents/MacOS/${this.name}`,
          `/Applications/${this.name}.app/Contents/MacOS/${this.name}`
        ];
      case 'win32':
        return [
          `${this.homedir}\\Local Settings\\Application Data\\Google\\${this.name}\\Application\\chrome.exe`,
          `${this.homedir}\\AppData\\Local\\Google\\${this.name}\\Application\\chrome.exe`,
          `C:\\Program Files\\Google\\${this.name}\\Application\\Chrome.exe`,
          `C:\\Program Files (x86)\\Google\\${this.name}\\Application\\Chrome.exe`
        ];
    }
  }

  get arguments() {
    return [
      `--user-data-dir=${this.tmpdir}`,
      '--headless',
      '--no-default-browser-check',
      '--no-first-run',
      '--disable-default-apps',
      '--disable-popup-blocking',
      '--disable-translate',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-device-discovery-notifications',
      this.target
    ];
  }
}
