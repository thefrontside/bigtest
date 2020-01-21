/* global beforeEach */

/**
 * Inserts a fixture's HTML into a testing DOM element
 *
 * @param {String} name - name of the fixture
 */
export function useFixture(name) {
  let html = require(`./fixtures/${name}.html`);

  beforeEach(() => {
    const $oldContainer = document.getElementById('test');

    if ($oldContainer != null) {
      $oldContainer.remove();
    }

    const $container = document.createElement('div');
    $container.innerHTML = html;
    $container.id = 'test';

    document.body.insertBefore($container, document.body.firstChild);
  });
}
