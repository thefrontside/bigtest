const port = process.argv[2] || process.env.PORT || 33000;
require('http').createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write('<!doctype><html><head><title><h1>Test App<h1><a href="#">Another Link</a></title><body></body></html>\n');
  response.end();
}).listen(port, () => console.log(`listening on ${port}`));
