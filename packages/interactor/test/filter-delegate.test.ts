import { describe, it } from 'mocha';
import expect from 'expect';
import { dom } from './helpers';

import { HTML } from '../src/index';


// TODO I need to fix types, but the idea is to pass filter as a plain property without calling it
// TODO by using getter under the hood
// TODO And as an side-effect that prop could be used to read a value in other actions or steps
// TODO See note in tests

const Header = HTML.extend('header')
  .selector('h1,h2,h3,h4,h5,h6')

const Label = HTML.extend<HTMLLabelElement>("label")
  .selector("label")

const Calendar = HTML.extend<HTMLElement>("calendar")
  .selector("div.calendar")

const TextField = HTML.extend<HTMLInputElement>('text field')
  .selector('input')
  .filters({
    placeholder: element => element.placeholder,
  })

const Datepicker = HTML.extend<HTMLDivElement>("datepicker")
  .selector("div.datepicker")
  .locator(element => element.querySelector("label")?.textContent || "")
  .filters({
    open: Calendar().exists(),
    month: Calendar().find(Header()).text,
  })
  .actions({
    toggle: async interactor => {
      await interactor.find(TextField({ placeholder: "YYYY-MM-DD" })).click();
    }
  });

describe('@bigtest/interactor', () => {
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
    await expect(Datepicker("Start Date").month).resolves.toEqual('January') // NOTE Like this
  });
});
