import BaseBrowser from './base';

export default class FirefoxBrowser extends BaseBrowser {
  name = 'Firefox';

  get command() {
    switch (process.platform) {
      case 'linux':
        return 'firefox';
      case 'darwin':
        return [
          `${this.homedir}/Applications/Firefox.app/Contents/MacOS/firefox`,
          '/Applications/Firefox.app/Contents/MacOS/firefox'
        ];
      case 'win32':
        return [
          'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
          'C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe'
        ];
    }
  }

  get arguments() {
    return ['-profile', this.tmpdir, this.target];
  }

  setup() {
    // using user.js to suppress checks and popups
    return this.writeFile('user.js', [
      'user_pref("browser.shell.checkDefaultBrowser", false);',
      'user_pref("browser.cache.disk.smart_size.first_run", false);',
      'user_pref("datareporting.policy.dataSubmissionEnabled", false);'
    ].join('\n'));
  }
}
