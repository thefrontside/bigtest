/* global beforeEach */

/**
 * Inserts a fixture's HTML into a testing DOM element
 *
 * @param {String} name - name of the fixture
 */
export function useFixture(name) {
  let html = require(`html-loader!./fixtures/${name}.html`);

  beforeEach(() => {
    let $container = document.getElementById('test');

    if ($container) {
      document.body.removeChild($container);
    }

    $container = document.createElement('div');
    $container.innerHTML = html;
    $container.id = 'test';

    document.body.insertBefore($container, document.body.firstChild);
  });
}
