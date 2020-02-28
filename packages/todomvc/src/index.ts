import { Operation, Context } from 'effection';
import * as xp from 'express';
import * as Path from 'path';
import { Server } from 'http';
import { AddressInfo } from 'net';

export class TodoMVC {

  private constructor(public port: number, private http: Server) { }

  get url() { return `http://localhost:${this.port}`; }

  static *react(port?: number): Operation {
    let appDir = Path.join(__dirname, 'app');
    let express = xp;
    let app = express()
      .use(express.static(appDir));

    let server: Server = yield listen(app, port);

    let address = server.address() as AddressInfo;

    let context: Context = yield parent;
    context['ensure'](() => server.close());

    return new TodoMVC(address.port, server);
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
