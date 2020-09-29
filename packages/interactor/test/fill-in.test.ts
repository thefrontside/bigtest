import { describe, it } from 'mocha';
import { TextField, Heading } from '../src/index';
import { dom } from './helpers';

describe('fillIn', () => {
  it('triggers a change event', async () => {
    dom(`
      <p>
        <label for="nameField">Name</label>
        <input value="initial" type="text" id="nameField"/>
        <h1 id="target"></h1>
      </p>
      <script>
        nameField.addEventListener('change', (event) => {
          target.textContent = 'success ' + event.target.value;
        });
      </script>
    `);

    await TextField('Name').fillIn('changed');
    await Heading('success changed').exists();
  });

  it('focuses field before changing value', async () => {
    dom(`
      <p>
        <label for="nameField">Name</label>
        <input value="initial" type="text" id="nameField"/>
        <h1 id="target"></h1>
      </p>
      <script>
        nameField.addEventListener('focus', (event) => {
          target.textContent = 'success ' + event.target.value;
        });
      </script>
    `);

    await TextField('Name').fillIn('changed');
    await Heading('success initial').exists();
  });

  it('blurs field after changing value', async () => {
    dom(`
      <p>
        <label for="nameField">Name</label>
        <input value="initial" type="text" id="nameField"/>
        <h1 id="target"></h1>
      </p>
      <script>
        nameField.addEventListener('blur', (event) => {
          target.textContent = 'success ' + event.target.value;
        });
      </script>
    `);

    await TextField('Name').fillIn('changed');
    await Heading('success changed').exists();
  });

  it('blurs field', async () => {
    dom(`
      <p>
        <label for="nameField">Name</label>
        <input type="text" id="nameField"/>
      </p>
      <script>
        nameField.addEventListener('blur', (event) => {
          event.preventDefault();
          let h1 = document.createElement('h1')
          h1.textContent = 'Success';
          document.body.appendChild(h1);
        });
      </script>
    `);

    await TextField('Name').focus();
    await TextField('Name').blur();
    await Heading('Success').exists();
  });

  it('triggers an input event for each key press', async () => {
    dom(`
      <p>
        <label for="nameField">Name</label>
        <input type="text" id="nameField"/>
        <h1 id="target"></h1>
      </p>
      <script>
        nameField.addEventListener('input', (event) => {
          if(event.data) {
            target.textContent = target.textContent + '-key:' + event.data;
          } else {
            target.textContent = target.textContent + '-del';
          }
        });
      </script>
    `);

    await TextField('Name').fillIn('cha');
    await Heading('-key:c-key:h-key:a').exists();
  });

  it('clears field and triggers input event before filling in', async () => {
    dom(`
      <p>
        <label for="nameField">Name</label>
        <input value="initial" type="text" id="nameField"/>
        <h1 id="target"></h1>
      </p>
      <script>
        nameField.addEventListener('input', (event) => {
          if(event.data) {
            target.textContent = target.textContent + '-key:' + event.data;
          } else {
            target.textContent = target.textContent + '-del';
          }
        });
      </script>
    `);

    await TextField('Name').fillIn('cha');
    await Heading('-del-key:c-key:h-key:a').exists();
  });

  it('triggers a cancellable keydown event for each key press', async () => {
    dom(`
      <p>
        <label for="nameField">Name</label>
        <input type="text" id="nameField"/>
        <h1 id="target"></h1>
      </p>
      <script>
        nameField.addEventListener('keydown', (event) => {
          if(event.key === 'h') {
            event.preventDefault();
          }
          target.textContent = target.textContent + '-key:' + event.key;
        });
      </script>
    `);

    await TextField('Name').fillIn('cha');
    await TextField('Name').has({ value: 'ca' });
    await Heading('-key:c-key:h-key:a').exists();
  });

  it('triggers a keyup event for each key press', async () => {
    dom(`
      <p>
        <label for="nameField">Name</label>
        <input type="text" id="nameField"/>
        <h1 id="target"></h1>
      </p>
      <script>
        nameField.addEventListener('keydown', (event) => {
          target.textContent = target.textContent + '-key:' + event.key;
        });
      </script>
    `);

    await TextField('Name').fillIn('cha');
    await Heading('-key:c-key:h-key:a').exists();
  });
});

