import BaseBrowser from './base';

export default class SafariBrowser extends BaseBrowser {
  name = 'Safari';

  get command() {
    switch (process.platform) {
      case 'darwin':
        return [
          `${this.homedir}/Applications/Safari.app/Contents/MacOS/Safari`,
          '/Applications/Safari.app/Contents/MacOS/Safari'
        ];
      default:
        throw new Error('Safari is not supported on this platform');
    }
  }

  get arguments() {
    return [`${this.tmpdir}/start.html`];
  }

  setup() {
    // safari interprets command line args as file paths, so we
    // open to an html file that will redirect to the target
    return this.writeFile('start.html',
      `<script>window.location="${this.target}"</script>`
    );
  }
}
