import { Operation, Context } from 'effection';
import * as xp from 'express';
import * as Path from 'path';
import { Server } from 'http';
import { AddressInfo } from 'net';

export class AgentServer {
  private constructor(public agentAppURL: string, private connectBackURL?: string, private http?: Server) {}

  get connectURL() {
    return `${this.agentAppURL}/?connectTo=${this.connectBackURL}`;
  }

  get harnessScriptURL() {
    return `${this.agentAppURL}/harness.js`;
  }

  static *create(connectBackURL: string, port?: number, appDir: string = Path.join(__dirname, 'app')): Operation {
    let express = xp;
    let app = express()
      .use((req, res, next) => {
        let url = req.query['connectTo'];
        if (!url) {
          res.redirect(`${req.url}?connectTo=${connectBackURL}`);
        } else {
          next();
        }
      })
      .use(express.static(appDir));

    let server: Server = yield listen(app, port);

    let address = server.address() as AddressInfo;

    let context: Context = yield parent;
    context['ensure'](() => server.close());

    return new AgentServer(`http://localhost:${address.port}`, connectBackURL, server);
  }



  static *external(agentServerURL: string, connectBackURL: string): Operation {
    let url = new URL(agentServerURL);

    return new AgentServer(agentServerURL, connectBackURL);
  }

  join(): Operation {
    return ({ resume, ensure }) => {
      if (this.http) {
        this.http.on('close', resume);
        ensure(() => this.http.off('close', resume));
      }
    }
  }
}

function listen(app: xp.Express, port?: number): Operation {
  return ({ resume, fail }) => {
    let server = app.listen(port, (err) => {
      if (err) {
        fail(err);
      } else {
        resume(server);
      }
    })
  };
};


const parent: Operation = ({ resume, context: { parent } }) => resume(parent.parent);
