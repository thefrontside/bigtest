import { describe, beforeEach, afterEach, it } from 'mocha';
import { expect, request } from '@tests/helpers';

import WebServer from '@run/servers/web';
import ProxyServer from '@run/servers/proxy';

describe('Unit: ProxyServer', function() {
  let test;

  beforeEach(async () => {
    test = new ProxyServer();
    await test.start();
  });

  afterEach(async () => {
    await test.stop();
  });

  it('is an instance of WebServer', () => {
    expect(test).to.be.an.instanceof(WebServer);
  });

  it('responds to all requests', async () => {
    await expect(request(test.url)).to.eventually
      .have.property('statusCode', 200);
    await expect(request(`${test.url}/foo`)).to.eventually
      .have.property('statusCode', 200);
  });

  it('404s for all `__bigtest__` endpoints', async () => {
    await expect(request(`${test.url}/__bigtest__/`)).to.eventually
      .have.property('statusCode', 404);
    await expect(request(`${test.url}/__bigtest__/foobar`)).to.eventually
      .have.property('statusCode', 404);
  });

  it('serves files from the `__bigtest__` endpoint', async () => {
    test.serve('/foobar', __filename);

    await expect(request(`${test.url}/__bigtest__/foobar`)).to.eventually
      .have.property('statusCode', 200);
  });

  describe('with a target', async () => {
    let server;

    beforeEach(async () => {
      server = new WebServer({ port: 8000 });

      server.app.get('/', (req, res) => res.send([
        '<html>',
        '<head></head>',
        '<body>PROXIED</body>',
        '</html>'
      ].join('')));

      await server.start();

      test.set(server.url);
    });

    afterEach(async () => {
      await server.stop();
    });

    it('proxies to the app server', async () => {
      await expect(request(test.url)).to.eventually
        .have.property('body').that.includes('PROXIED');
    });
  });

  describe('injecting scripts', () => {
    async function fetchTestHTML() {
      let { body: content } = await request(test.url);
      let [ head, body ] = content.split('</head><body>');
      head = head.replace(/^.*(<head>)/, '');
      body = body.replace(/<\/body>.*$/, '');
      return { head, body };
    }

    it('injects a script tag when given a string', async () => {
      test.inject('head', '/head.js');
      test.inject('body', '/body.js');

      let { head, body } = await fetchTestHTML();
      expect(head).to.include('<script src="/head.js"></script>');
      expect(body).to.include('<script src="/body.js"></script>');
    });

    it('injects a script tag when given the script or src option', async () => {
      test.inject('head', { script: '/head.js' });
      test.inject('body', { script: true, innerContent: 'let body = true;' });
      test.inject('body', { src: '/src.js' });

      let { head, body } = await fetchTestHTML();
      expect(head).to.include('<script src="/head.js"></script>');
      expect(body).to.include('<script>let body = true;</script>');
      expect(body).to.include('<script src="/src.js"></script>');
    });

    it('can inject other HTML elements', async () => {
      test.inject('head', { tagName: 'link', href: '/style.css', rel: 'stylesheet' });
      test.inject('body', { tagName: 'div', innerContent: 'hello' });

      let { head, body } = await fetchTestHTML();
      expect(head).to.include('<link href="/style.css" rel="stylesheet"/>');
      expect(body).to.include('<div>hello</div>');
    });

    it('can bulk inject with a hash of locations and array of options', async () => {
      test.inject({
        head: [
          { script: '/head.js' },
          { script: true, innerContent: 'foobar' }
        ],
        body: [
          { tagName: 'div', id: 'root', innerContent: '' },
          { script: '/body.js' }
        ]
      });

      let { head, body } = await fetchTestHTML();
      expect(head).to.include('<script src="/head.js"></script>');
      expect(head).to.include('<script>foobar</script>');
      expect(body).to.include('<div id="root"></div>');
      expect(body).to.include('<script src="/body.js"></script>');
    });

    it('can serve a module given the serve option', async () => {
      test.inject('head', { serve: 'mocha/mocha.js' });
      test.inject('body', { script: '/served.js', serve: __filename });

      let { head, body } = await fetchTestHTML();
      expect(head).to.include('<script src="/__bigtest__/mocha/mocha.js"></script>');
      expect(body).to.include('<script src="/__bigtest__/served.js"></script>');

      await expect(request(`${test.url}/__bigtest__/mocha/mocha.js`))
        .to.eventually.have.property('statusCode', 200);
      await expect(request(`${test.url}/__bigtest__/served.js`))
        .to.eventually.have.property('statusCode', 200);
    });
  });
});
