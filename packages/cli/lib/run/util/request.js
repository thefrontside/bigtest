import http from 'http';
import https from 'https';
import url from 'url';

/**
 * Wraps node's http(s) `request` in a promise that resolves with the
 * `statusCode` and `body` of a response.
 *
 * @private
 * @param {String|Object} options - Options given to `http.request`
 * @returns {Promise} resolves when the response ends, rejects if the
 * request errors
 */
export default async function request(options) {
  let request = http.request;

  if (typeof options === 'string') {
    options = url.parse(options);
  }

  if (options.protocol === 'https:') {
    options = { rejectUnauthorized: false, ...options };
    request = https.request;
  }

  return new Promise((resolve, reject) => {
    request(options, response => {
      let data = '';

      response.on('data', chunk => {
        data += chunk;
      });

      response.once('end', () => resolve({
        statusCode: response.statusCode,
        body: data
      }));
    }).on('error', reject).end();
  });
}
