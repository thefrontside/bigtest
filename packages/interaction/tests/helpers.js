/* global beforeEach, afterEach */

/**
 * Inserts a fixture's HTML into a testing DOM element
 *
 * @param {String} name - name of the fixture
 */
export function useFixture(name) {
  let html = require(`html-loader!./fixtures/${name}.html`);
  let $container;

  beforeEach(() => {
    $container = document.createElement('div');
    $container.innerHTML = html;
    $container.id = 'test';

    document.body.insertBefore($container, document.body.firstChild);
  });

  afterEach(() => {
    document.body.removeChild($container);
  });
}
