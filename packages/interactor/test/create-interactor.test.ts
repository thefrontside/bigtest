import { describe, it } from 'mocha';
import * as expect from 'expect'

import { bigtestGlobals } from '@bigtest/globals';
import { JSDOM } from 'jsdom';

import { createInteractor } from '../src/index';

const Link = createInteractor<HTMLLinkElement>('link')({
  selector: 'a',
  locators: {
    byHref: (element) => element.href,
    byTitle: (element) => element.title
  },
  actions: {
    click: (element) => { element.click() },
    setHref: (element, value: string) => { element.href = value }
  }
});

const Header = createInteractor('header')({
  selector: 'h1,h2,h3,h4,h5,h6',
});

const Div = createInteractor('div')({
  defaultLocator: (element) => element.id || "",
});

const Details = createInteractor<HTMLDetailsElement>('details')({
  selector: 'details',
  defaultLocator: (element) => element.querySelector('summary')?.textContent || ''
});

const TextField = createInteractor<HTMLInputElement>('text field')({
  selector: 'input',
  defaultLocator: (element) => element.id,
  filters: {
    enabled: {
      apply: (element) => !element.disabled,
      default: true
    },
    value: (element) => element.value
  },
  actions: {
    fillIn: (element, value: string) => { element.value = value }
  }
});

const Datepicker = createInteractor<HTMLDivElement>("datepicker")({
  selector: "div.datepicker",
  defaultLocator: element => element.querySelector("label")?.textContent || "",
  filters: {
    open: element => !!element.querySelector("div.calendar"),
    month: element => element.querySelector("div.calendar h4")?.textContent
  },
  actions: {
    toggle: element => element.querySelector("input")?.click()
  }
});

function dom(html: string) {
  let jsdom = new JSDOM(`<!doctype html><html><body>${html}</body></html>`, { runScripts: "dangerously" });
  bigtestGlobals.document = jsdom.window.document;
}

describe('@bigtest/interactor', () => {
  beforeEach(() => {
    bigtestGlobals.reset();
    bigtestGlobals.defaultInteractorTimeout = 20;
  });

  describe('.exists', () => {
    it('can determine whether an element exists based on the interactor', async () => {
      dom(`
        <p><a href="/foobar">Foo Bar</a></p>
      `);

      await expect(Link('Foo Bar').exists()).resolves.toBeUndefined();
      await expect(Link('Blah').exists()).rejects.toHaveProperty('message', 'link "Blah" does not exist');
    });

    it('can use locators', async () => {
      dom(`
        <p><a title="Monkey" href="/foobar">Foo Bar</a></p>
      `);

      await expect(Link.byTitle('Monkey').exists()).resolves.toBeUndefined();
      await expect(Link.byTitle('Zebra').exists()).rejects.toHaveProperty('message', 'link with title "Zebra" does not exist');
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
      await expect(Link('Foo Bar').absent()).rejects.toHaveProperty('message', 'link "Foo Bar" exists but should not');
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

      await expect(Div("foo").find(Link("Bar")).exists()).rejects.toHaveProperty('message', 'link "Bar" within div "foo" does not exist');
      await expect(Div("bar").find(Link("Foo")).exists()).rejects.toHaveProperty('message', 'link "Foo" within div "bar" does not exist');
    });

    it('is rejected if the parent interactor cannot be found', async () => {
      dom(`
        <div id="foo">
          <a href="/foo">Foo</a>
        </div>
      `);

      await expect(Div("blah").find(Link("Foo")).exists()).rejects.toHaveProperty('message', 'div "blah" does not exist');
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
      await expect(Div("test").find(Div("foo").find(Link("Bar"))).exists()).rejects.toHaveProperty('message', 'link "Bar" within div "foo" within div "test" does not exist');

      await expect(Div("test").find(Div("foo")).find(Link("Foo")).exists()).resolves.toBeUndefined();
      await expect(Div("test").find(Div("foo")).find(Link("Bar")).exists()).rejects.toHaveProperty('message', 'link "Bar" within div "foo" within div "test" does not exist');
    });
  });

  describe('.is', () => {
    it('can apply filter', async () => {
      dom(`
        <input id="Email" value='jonas@example.com'/>
      `);

      await expect(TextField('Email').is({ value: 'jonas@example.com' })).resolves.toBeUndefined();
      await expect(TextField('Email').is({ value: 'incorrect@example.com' })).rejects.toHaveProperty('message', 'text field "Email" does not match filters: with value "incorrect@example.com"');
    });
  });

  describe('.has', () => {
    it('can apply filter', async () => {
      dom(`
        <input id="Email" value='jonas@example.com'/>
      `);

      await expect(TextField('Email').has({ value: 'jonas@example.com' })).resolves.toBeUndefined();
      await expect(TextField('Email').has({ value: 'incorrect@example.com' })).rejects.toHaveProperty('message', 'text field "Email" does not match filters: with value "incorrect@example.com"');
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
      await Link.byHref('/monkey').exists();
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
  });

  describe('filters', () => {
    it('can determine whether an element exists based on the interactor', async () => {
      dom(`
        <input id="Email" value='jonas@example.com'/>
      `);

      await expect(TextField('Email').exists()).resolves.toBeUndefined();
      await expect(TextField('Email', { value: 'jonas@example.com' }).exists()).resolves.toBeUndefined();
      await expect(TextField('Email', { value: 'incorrect@example.com' }).exists()).rejects.toHaveProperty('message', 'text field "Email" with value "incorrect@example.com" does not exist');
    });

    it('can apply default values', async () => {
      dom(`
        <input id="Email" value='jonas@example.com'/>
        <input id="Password" disabled="disabled" value='test1234'/>
      `);

      await expect(TextField('Password').exists()).rejects.toHaveProperty('message', 'text field "Password" does not exist');
      await expect(TextField('Password', { enabled: true }).exists()).rejects.toHaveProperty('message', 'text field "Password" which is enabled does not exist');
      await expect(TextField('Password', { enabled: false }).exists()).resolves.toBeUndefined();
    });

    it('can apply multiple filters', async () => {
      dom(`
        <input id="Email" value='jonas@example.com'/>
        <input id="Password" disabled="disabled" value='test1234'/>
      `);

      await expect(TextField('Password', { enabled: false, value: 'incorrect' }).exists()).rejects.toHaveProperty('message', 'text field "Password" which is not enabled and with value "incorrect" does not exist');
      await expect(TextField('Password', { enabled: true, value: 'test1234' }).exists()).rejects.toHaveProperty('message', 'text field "Password" which is enabled and with value "test1234" does not exist');
      await expect(TextField('Password', { enabled: false, value: 'test1234' }).exists()).resolves.toBeUndefined();
    });
  });

  describe('composition', () => {
    it('works', async () => {
      dom(`
        <div class="datepicker">
          <label for="start-date">Start Date</label>
          <input type="text" id="start-date" />
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
  });
});
