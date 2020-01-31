import WebServer from './web';

const {
  assign,
  entries,
  defineProperty
} = Object;
const {
  isArray
} = Array;

/**
 * Proxy server that forwards requests and websockets connections to a
 * provided target and allows injecting HTML into responses.
 *
 * @param {Object} [options] - WebServer options
 */
export default class ProxyServer extends WebServer {
  constructor(options) {
    assign(super(options), {
      injected: {}
    });

    // intercept requests to inject HTML
    this.app.use(require('express-mung').write(
      this.handleResponse.bind(this)
    ));

    // serve static html when there is no target
    this.app.use((req, res, next) => {
      if (!(this.target || /^\/__bigtest__/.test(req.path))) {
        let body = '<html><head></head><body></body></html>';
        res.set('content-type', 'text/html').write(body);
      } else {
        next();
      }
    });
  }

  /**
   * Sets the proxy target and initializes proxy middleware
   *
   * @param {String} target - URL to proxy to
   */
  set(target) {
    defineProperty(this, 'target', { value: target });

    this.app.use(require('http-proxy-middleware')({
      logLevel: 'silent',
      ws: true,
      target,

      onError(err, req, res) {
        res.status(500).end(err.message);
      }
    }));
  }

  /**
   * Adds to the list of HTML that is injected into each
   * response. Given a string, a script tag will be injected with the
   * string as it's `src` attribute. If the `serve` option is
   * specified, that module will be served as this script file.
   *
   * Also accepts a hash of location options, or an array of options
   * for a specific location.
   *
   * @param {String} where - Injected location (`head` or `body`)
   * @param {Object|String} options - Options, or script src string
   * @param {String|Boolean} [options.script] - Script shortcut
   * @param {String} [options.tagName] - Tag name to inject
   * @param {String} [options.innerContent] - Inner content for tag
   * @param {String} [options.serve] - Module or file to serve
   * @param {Object} [options...attr] - Remaining html attributes
   * @returns {ProxyServer} this instance
   */
  inject(where, options) {
    // a hash of locations were given
    if (typeof where === 'object') {
      return entries(where).reduce((self, args) => self.inject(...args), this);
    }

    // an array of options were given
    if (isArray(options)) {
      return options.reduce((self, opts) => self.inject(where, opts), this);
    }

    // if attrs is a string, inject a script
    if (typeof options === 'string') {
      options = { script: options };
    }

    // if not an absolute path or url, probably a module to serve
    if (typeof options.script === 'string' &&
        !/^(\/|https?:)/.test(options.script)) {
      options = assign({}, { serve: options.script });
    }

    let {
      serve,
      script,
      ...attrs
    } = options;

    // serve this file
    if (serve) {
      // no leading slash so the script src can be prefixed
      let path = (typeof script === 'string' ? script : serve).replace(/^\//, '');
      // the proxy serves files at `/__bigtest__/`
      script = `/__bigtest__/${path}`;
      this.serve(path, serve);
    }

    // script shortcut
    if (script || attrs.src) {
      attrs = assign({
        tagName: 'script',
        src: typeof script === 'string' && script,
        innerContent: ''
      }, attrs);
    }

    // concat to existing injected things
    this.injected[where] = (
      this.injected[where] || []
    ).concat(attrs);

    // return this instance for chaining
    return this;
  }

  /**
   * Formats injected attributes as HTML
   *
   * @param {String} where - Injected location (`head` or `body`)
   * @returns {String} HTML string
   */
  tags(where) {
    return (this.injected[where] || [])
      .map(({ tagName, innerContent, ...attrs }) => {
        let attrString = entries(attrs)
          .filter(([a, v]) => !!v)
          .map(([a, v]) => `${a}="${v}"`)
          .join(' ');

        let html = `<${tagName} ${attrString}`;
        html = html.trim();

        if (innerContent != null) {
          html += `>${innerContent}</${tagName}>`;
        } else {
          html += '/>';
        }

        return html;
      }).join('');
  }

  /**
   * When intercepting responses injects HTML into the response body.
   *
   * @private
   * @param {Buffer|String} body - Intercepted response body
   * @param {Request} req - Request object
   * @param {Response} res - Response object
   * @returns {String} the modified body
   */
  handleResponse(body, _, req, res) {
    let isHTML = res.get('content-type').includes('text/html');
    let isOK = res.statusCode >= 200 && res.statusCode < 300;

    if (isHTML && isOK) {
      body = body.toString().replace(/<\/head>/i, this.tags('head') + '$&');
      body = body.toString().replace(/<\/body>/i, this.tags('body') + '$&');
      res.set('content-length', body.length);
    }

    return body;
  }

  /**
   * Overrides the WebServer#serve method to always serve from the
   * proxy's `__bigtest__` endpoint.
   */
  serve(path, file) {
    if (typeof path === 'string') {
      path = '__bigtest__' + (path[0] === '/' ? path : `/${path}`);
    }

    return WebServer.prototype.serve.call(this, path, file);
  }
}
