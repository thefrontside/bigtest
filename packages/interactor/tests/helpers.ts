export function useFixture(name: string): void {
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
