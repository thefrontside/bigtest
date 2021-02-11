import { test } from '@bigtest/suite';
import { Link, App, Heading } from '@bigtest/interactor';

export default test('Passing Test With Interactors')
  .step("visit app", async() => {
    await App.visit('/');
  })
  .step("has headline", async() => {
    await Heading("Test App").exists();
  })
  .step("click a link", async() => {
    await Link('Something').click();
  });
