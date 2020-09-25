import * as Path from 'path';

interface Options {
  url: string;
  prefix?: string;
}

export class AgentServerConfig {
  constructor(public options: Options) {}

  url() {
    let url = new URL(this.options.url);
    url.pathname = this.options.prefix || '/';
    return url.toString();
  }

  agentUrl(connectionUrl: string, agentId?: string) {
    let url = new URL(this.url());
    url.pathname = url.pathname + 'index.html';
    url.searchParams.append('connectTo', connectionUrl);
    if (agentId) {
      url.searchParams.append('agentId', agentId);
    }
    return url.toString();
  }

  harnessUrl() {
    return `${this.url()}harness.js`;
  }

  appDir() {
    return Path.join(__dirname, '../app');
  }
}
