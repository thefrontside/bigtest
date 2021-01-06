import  Path from 'path';

interface Options {
  port: number;
  prefix?: string;
}

export class AgentServerConfig {
  constructor(public options: Options) {}

  url() {
    let url = new URL('http://localhost');
    url.port = this.options.port.toString();
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
