import { describe, it } from 'mocha';
import * as expect from 'expect';
import { dom } from './helpers';
import { bigtestGlobals } from '@bigtest/globals';

import { createInteractor, perform } from '../src/index';

const Link = createInteractor<HTMLLinkElement>('link')({
  selector: 'a',
  filters: {
    href: (element) => element.href,
    title: (element) => element.title,
  },
  actions: {
    click: perform(element => { element.click() }),
    setHref: perform((element, value: string) => { element.href = value })
  }
});

const Header = createInteractor('header')({
  selector: 'h1,h2,h3,h4,h5,h6',
});

const Div = createInteractor('div')({
  locator: (element) => element.id || "",
});

const Details = createInteractor<HTMLDetailsElement>('details')({
  selector: 'details',
  locator: (element) => element.querySelector('summary')?.textContent || ''
});

const TextField = createInteractor<HTMLInputElement>('text field')({
  selector: 'input',
  locator: (element) => element.id,
  filters: {
    placeholder: element => element.placeholder,
    enabled: {
      apply: (element) => !element.disabled,
      default: true
    },
    value: (element) => element.value
  },
  actions: {
    fillIn: perform((element, value: string) => { element.value = value }),
    click: perform(element => { element.click() })
  }
});

const Datepicker = createInteractor<HTMLDivElement>("datepicker")({
  selector: "div.datepicker",
  locator: element => element.querySelector("label")?.textContent || "",
  filters: {
    open: element => !!element.querySelector("div.calendar"),
    month: element => element.querySelector("div.calendar h4")?.textContent
  },
  actions: {
    toggle: async interactor => {
      await interactor.find(TextField({ placeholder: "YYYY-MM-DD" })).click();
    }
  }
});

const MainNav = createInteractor('main nav')({
  selector: 'nav',
  children: {
    textField: TextField,
    itemLink: {
      find(interactor, item: number) {
        return interactor.find(Link(`Item ${item}`))
      }
    }
  }
});

describe('@bigtest/interactor', () => {
  describe('instantiation', () => {
    describe('no arguments', () => {
      it('just uses the selector to locate', async () => {
        dom(`
          <nav id="main-nav"></nav>
        `);

        await expect(MainNav().exists()).resolves.toBeUndefined();
      });
    });
  });

  describe('.exists', () => {
    it('can determine whether an element exists based on the interactor', async () => {
      dom(`
        <p><a href="/foobar">Foo Bar</a></p>
        <p><a href="/foobar">Quox</a></p>
      `);

      await expect(Link('Foo Bar').exists()).resolves.toBeUndefined();
      await expect(Link('Blah').exists()).rejects.toHaveProperty('message', [
        'did not find link "Blah", did you mean one of:', '',
        '┃ link        ┃',
        '┣━━━━━━━━━━━━━┫',
        '┃ ⨯ "Foo Bar" ┃',
        '┃ ⨯ "Quox"    ┃',
      ].join('\n'));
    });

    it('returns true if multiple matches exist', async () => {
      dom(`
        <p><a href="/foo1">Foo</a></p>
        <p><a href="/foo2">Foo</a></p>
      `);

      await expect(Link('Foo').exists()).resolves.toBeUndefined();
    });

    // See this issue for a discussion of and explanation for this behaviour:
    // https://github.com/thefrontside/bigtest/issues/488
    it('throws an AmbiguousElementError if parent interactor is ambiguous', async () => {
      dom(`
        <nav id="main-nav"></nav>
        <nav id="secondary-nav"></nav>
      `);

      await expect(MainNav().find(Link('Foo')).exists()).rejects.toHaveProperty('message', [
        'main nav matches multiple elements:',
        '',
        '- <nav id="main-nav">',
        '- <nav id="secondary-nav">'
      ].join('\n'));
    });

    it('can use filters', async () => {
      dom(`
        <p><a title="Monkey" href="/foobar">Foo Bar</a></p>
      `);

      await expect(Link({ title: 'Monkey' }).exists()).resolves.toBeUndefined();
      await expect(Link({ title: 'Zebra' }).exists()).rejects.toHaveProperty('message', [
        'did not find link with title "Zebra", did you mean one of:', '',
        '┃ title: "Zebra" ┃',
        '┣━━━━━━━━━━━━━━━━┫',
        '┃ ⨯ "Monkey"     ┃',
      ].join('\n'));
    });

    it('can wait for condition to become true', async () => {
      dom(`
        <p id="foo"></p>
        <script>
          setTimeout(() => {
            foo.innerHTML = '<a href="/foobar">Foo Bar</a>';
          }, 5);
        </script>
      `);

      await expect(Link('Foo Bar').exists()).resolves.toBeUndefined();
    });

    it('can return description', () => {
      expect(Link('Foo Bar').exists().description).toEqual('link "Foo Bar" exists')
    });
  });

  describe('.absent', () => {
    it('can determine whether an element exists based on the interactor', async () => {
      dom(`
        <p><a href="/foobar">Foo Bar</a></p>
      `);

      await expect(Link('Blah').absent()).resolves.toBeUndefined();
      await expect(Link('Foo Bar').absent()).rejects.toHaveProperty('message', [
        'link "Foo Bar" exists but should not:', '',
        '- <a href="/foobar">',
      ].join('\n'))
    });

    it('throws if element exists multiple times', async () => {
      dom(`
        <p><a href="/foo1">Foo</a></p>
        <p><a href="/foo2">Foo</a></p>
      `);

      await expect(Link('Foo').absent()).rejects.toHaveProperty('message', [
        'link "Foo" exists but should not:', '',
        '- <a href="/foo1">',
        '- <a href="/foo2">',
      ].join('\n'))
    });

    // See this issue for a discussion of and explanation for this behaviour:
    // https://github.com/thefrontside/bigtest/issues/488
    it('throws if parent interactor does NOT exist', async () => {
      dom(`<p></p>`);

      await expect(MainNav().find(Link('Foo')).absent()).rejects.toHaveProperty('message', 'did not find main nav');
    });

    it('can wait for condition to become true', async () => {
      dom(`
        <p id="foo"><a href="/foobar">Foo Bar</a></p>
        <script>
          setTimeout(() => {
            foo.innerHTML = '';
          }, 5);
        </script>
      `);

      await expect(Link('Foo Bar').absent()).resolves.toBeUndefined();
    });

    it('can return description', () => {
      expect(Link('Foo Bar').absent().description).toEqual('link "Foo Bar" does not exist')
    });
  });

  describe('.find', () => {
    it('can find an interactor with the scope of another interactor', async () => {
      dom(`
        <div id="foo">
          <a href="/foo">Foo</a>
        </div>
        <div id="bar">
          <a href="/Bar">Bar</a>
        </div>
      `);

      await expect(Div("foo").find(Link("Foo")).exists()).resolves.toBeUndefined();
      await expect(Div("bar").find(Link("Bar")).exists()).resolves.toBeUndefined();
      await expect(Div("foo").find(Link("Bar")).exists()).rejects.toHaveProperty('message', [
        'did not find link "Bar" within div "foo", did you mean one of:', '',
        '┃ link    ┃',
        '┣━━━━━━━━━┫',
        '┃ ⨯ "Foo" ┃',
      ].join('\n'));
      await expect(Div("bar").find(Link("Foo")).exists()).rejects.toHaveProperty('message', [
        'did not find link "Foo" within div "bar", did you mean one of:', '',
        '┃ link    ┃',
        '┣━━━━━━━━━┫',
        '┃ ⨯ "Bar" ┃',
      ].join('\n'));
    });

    it('is rejected if the parent interactor cannot be found', async () => {
      dom(`
        <div id="foo">
          <a href="/foo">Foo</a>
        </div>
      `);

      await expect(Div("blah").find(Link("Foo")).exists()).rejects.toHaveProperty('message', [
        'did not find div "blah", did you mean one of:', '',
        '┃ div     ┃',
        '┣━━━━━━━━━┫',
        '┃ ⨯ "foo" ┃',
      ].join('\n'));
    });

    it('can be used with interactors with disjoint element types', async () => {
      dom(`
        <details>
          <summary>More stuff</summary>

          <a href="/foo">Foo</a>
        </details>
      `);

      await Details("More stuff").find(Link("Foo")).exists();
    });

    it('is composable', async () => {
      dom(`
        <div id="test">
          <div id="foo">
            <a href="/foo">Foo</a>
          </div>
          <div id="bar">
            <a href="/Bar">Bar</a>
          </div>
        </div>
        <a href="/foo">Foo</a>
      `);

      await expect(Div("test").find(Div("foo").find(Link("Foo"))).exists()).resolves.toBeUndefined();

      await expect(Div("test").find(Div("foo").find(Link("Bar"))).exists()).rejects.toHaveProperty('message', [
        'did not find link "Bar" within div "foo" within div "test", did you mean one of:', '',
        '┃ link    ┃',
        '┣━━━━━━━━━┫',
        '┃ ⨯ "Foo" ┃',
      ].join('\n'));

      await expect(Div("test").find(Div("foo")).find(Link("Foo")).exists()).resolves.toBeUndefined();
      await expect(Div("test").find(Div("foo")).find(Link("Bar")).exists()).rejects.toHaveProperty('message', [
        'did not find link "Bar" within div "foo" within div "test", did you mean one of:', '',
        '┃ link    ┃',
        '┣━━━━━━━━━┫',
        '┃ ⨯ "Foo" ┃',
      ].join('\n'));
    });

    it('cannot match an element outside of scope', async () => {
      dom(`
        <div id="test">
          <div id="foo">
            <a href="/foo">Foo</a>
          </div>
          <div id="bar">
            <a href="/Bar">Bar</a>
          </div>
        </div>
        <a href="/foo">Foo</a>
      `);

      await expect(Div("foo").find(Div("bar")).exists()).rejects.toHaveProperty('message', 'did not find div "bar" within div "foo"');
    });
  });

  describe('.is', () => {
    it('can apply filter', async () => {
      dom(`
        <input id="Email" value='jonas@example.com'/>
      `);

      await expect(TextField('Email').is({ value: 'jonas@example.com' })).resolves.toBeUndefined();
      await expect(TextField('Email').is({ value: 'incorrect@example.com' })).rejects.toHaveProperty('message', [
        'text field "Email" does not match filters:', '',
        '┃ value: "incorrect@example.com" ┃ enabled: true ┃',
        '┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━┫',
        '┃ ⨯ "jonas@example.com"          ┃ ✓ true        ┃',
      ].join('\n'))
    });
  });

  describe('.has', () => {
    it('can apply filter', async () => {
      dom(`
        <input id="Email" value='jonas@example.com'/>
      `);

      await expect(TextField('Email').has({ value: 'jonas@example.com' })).resolves.toBeUndefined();
      await expect(TextField('Email').has({ value: 'incorrect@example.com' })).rejects.toHaveProperty('message', [
        'text field "Email" does not match filters:', '',
        '┃ value: "incorrect@example.com" ┃ enabled: true ┃',
        '┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━┫',
        '┃ ⨯ "jonas@example.com"          ┃ ✓ true        ┃',
      ].join('\n'))
    });
  });

  describe('actions', () => {
    it('can use action to interact with element', async () => {
      dom(`
        <a id="foo" href="/foobar">Foo Bar</a>
        <div id="target"></div>
        <script>
          foo.onclick = () => {
            target.innerHTML = '<h1>Hello!</h1>';
          }
        </script>
      `);

      await Link('Foo Bar').click();
      await Header('Hello!').exists();
    });

    it('can pass arguments to action', async () => {
      dom(`
        <a id="foo" href="/foobar">Foo Bar</a>
      `);

      await Link('Foo Bar').setHref('/monkey');
      await Link({ href: '/monkey' }).exists();
    });

    it('does nothing unless awaited', async () => {
      dom(`
        <a id="foo" href="/foobar">Foo Bar</a>
        <div id="target"></div>
        <script>
          foo.onclick = () => {
            target.innerHTML = '<h1>Hello!</h1>';
          }
        </script>
      `);

      Link('Foo Bar').click();
      await Header('Hello!').absent();
    });

    it('works on scoped interactor', async () => {
      dom(`
        <div id="foo"><a href="/foobar">Foo Bar</a></div>
        <div id="target"></div>
        <script>
          foo.onclick = () => {
            target.innerHTML = '<h1>Hello!</h1>';
          }
        </script>
      `);

      await Div("foo").find(Link('Foo Bar')).click();
      await expect(Header('Hello!').exists()).resolves.toBeUndefined();
    });

    it('can return description of interaction', () => {
      expect(Div("foo").find(Link('Foo Bar')).click().description).toEqual('click on link "Foo Bar" within div "foo"');
    });

    it('can return description of interaction with argument', () => {
      expect(Link('Foo Bar').setHref('/monkey').description).toEqual('setHref with "/monkey" on link "Foo Bar"');
    });

    it('can use interactors within actions', async () => {
      dom(`
        <div class="datepicker">
          <label for="start-date">Start Date</label>
          <input type="text" id="start-date" placeholder="YYYY-MM-DD" />
        </div>
        <script>
          let startDateInput = document.getElementById("start-date");
          let datepicker = document.querySelector(".datepicker");
          startDateInput.onclick = () => {
            let calendar = document.createElement("div");
            let calendarMonth = document.createElement("h4");
            calendarMonth.appendChild(document.createTextNode("January"));
            calendar.classList.add("calendar");
            calendar.appendChild(calendarMonth);
            datepicker.appendChild(calendar);
          };
        </script>
      `);

      await expect(Datepicker("Start Date").has({ open: false })).resolves.toBeUndefined();
      await Datepicker("Start Date").toggle();
      await expect(Datepicker("Start Date").has({ open: true })).resolves.toBeUndefined();
      await expect(Datepicker("Start Date").has({ month: "January" })).resolves.toBeUndefined();
    });

    it('throws an error if ambiguous', async () => {
      dom(`
        <p><a href="/foo">Foo</a></p>
        <p><a href="/bar&quot;">Foo</a></p>
      `);

      await expect(Link('Foo').click()).rejects.toHaveProperty('message', [
        'link "Foo" matches multiple elements:', '',
        '- <a href="/foo">',
        '- <a href="/bar&quot;">',
      ].join('\n'))
    });

    it('throws an error if runner is currently in assertion state', async () => {
      dom(`
        <p><a href="/foo">Foo</a></p>
      `);

      bigtestGlobals.runnerState = 'assertion';

      await expect(Link('Foo').click()).rejects.toHaveProperty('message',
        'tried to click on link "Foo" in an assertion, actions should only be performed in steps'
      );
    });
  });

  describe('filters', () => {
    it('can determine whether an element exists based on the interactor', async () => {
      dom(`
        <input id="Email" value='jonas@example.com'/>
      `);

      await expect(TextField('Email').exists()).resolves.toBeUndefined();
      await expect(TextField('Email', { value: 'jonas@example.com' }).exists()).resolves.toBeUndefined();
      await expect(TextField('Email', { value: 'incorrect@example.com' }).exists()).rejects.toHaveProperty('message', [
        'did not find text field "Email" with value "incorrect@example.com", did you mean one of:', '',
        '┃ text field ┃ value: "incorrect@example.com" ┃ enabled: true ┃',
        '┣━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━┫',
        '┃ ✓ "Email"  ┃ ⨯ "jonas@example.com"          ┃ ✓ true        ┃',
      ].join('\n'))
    });

    it('can apply default values', async () => {
      dom(`
        <input id="Email" value='jonas@example.com'/>
        <input id="Password" disabled="disabled" value='test1234'/>
      `);

      await expect(TextField('Password').exists()).rejects.toHaveProperty('message', [
        'did not find text field "Password", did you mean one of:', '',
        '┃ text field   ┃ enabled: true ┃',
        '┣━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━┫',
        '┃ ✓ "Password" ┃ ⨯ false       ┃',
        '┃ ⨯ "Email"    ┃ ✓ true        ┃',
      ].join('\n'))
      await expect(TextField('Password', { enabled: true }).exists()).rejects.toHaveProperty('message', [
        'did not find text field "Password" which is enabled, did you mean one of:', '',
        '┃ text field   ┃ enabled: true ┃',
        '┣━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━┫',
        '┃ ✓ "Password" ┃ ⨯ false       ┃',
        '┃ ⨯ "Email"    ┃ ✓ true        ┃',
      ].join('\n'))
      await expect(TextField('Password', { enabled: false }).exists()).resolves.toBeUndefined();
    });

    it('can apply multiple filters', async () => {
      dom(`
        <input id="Email" value='jonas@example.com'/>
        <input id="Password" disabled="disabled" value='test1234'/>
      `);

      await expect(TextField('Password', { enabled: false, value: 'incorrect' }).exists()).rejects.toHaveProperty('message', [
        'did not find text field "Password" which is not enabled and with value "incorrect", did you mean one of:', '',
        '┃ text field   ┃ enabled: false ┃ value: "incorrect"    ┃',
        '┣━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━┫',
        '┃ ✓ "Password" ┃ ✓ false        ┃ ⨯ "test1234"          ┃',
        '┃ ⨯ "Email"    ┃ ⨯ true         ┃ ⨯ "jonas@example.com" ┃',
      ].join('\n'))
      await expect(TextField('Password', { enabled: true, value: 'test1234' }).exists()).rejects.toHaveProperty('message', [
        'did not find text field "Password" which is enabled and with value "test1234", did you mean one of:', '',
        '┃ text field   ┃ enabled: true ┃ value: "test1234"     ┃',
        '┣━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━┫',
        '┃ ✓ "Password" ┃ ⨯ false       ┃ ✓ "test1234"          ┃',
        '┃ ⨯ "Email"    ┃ ✓ true        ┃ ⨯ "jonas@example.com" ┃',
      ].join('\n'))
      await expect(TextField('Password', { enabled: false, value: 'test1234' }).exists()).resolves.toBeUndefined();
    });
  });

  describe('children', () => {
    it('can find child interactors', async () => {
      dom(`
        <nav>
          <input id="Email" value='jonas@example.com'/>
        </nav>
      `);

      await expect(MainNav().textField('Email').exists()).resolves.toBeUndefined();
      await expect(MainNav().textField({ value: 'jonas@example.com' }).exists()).resolves.toBeUndefined();
      await expect(MainNav().textField('Does not exist').exists()).rejects.toHaveProperty('message', [
        'did not find text field "Does not exist" within main nav, did you mean one of:', '',
        '┃ text field ┃ enabled: true ┃',
        '┣━━━━━━━━━━━━╋━━━━━━━━━━━━━━━┫',
        '┃ ⨯ "Email"  ┃ ✓ true        ┃',
      ].join('\n'))
    });

    it('can find child interactors with custom definition', async () => {
      dom(`
        <nav>
          <a href="/moo">Item 4</a>
        </nav>
      `);

      await expect(MainNav().itemLink(4).exists()).resolves.toBeUndefined();
      await expect(MainNav().itemLink(1337).exists()).rejects.toHaveProperty('message', [
        'did not find link "Item 1337" within main nav, did you mean one of:', '',
        '┃ link       ┃',
        '┣━━━━━━━━━━━━┫',
        '┃ ⨯ "Item 4" ┃',
      ].join('\n'))
    });
  });
});
