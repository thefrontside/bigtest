import { describe, beforeEach, it } from 'mocha';
import { WritableStream } from 'memory-streams';
import { expect, when } from '@tests/helpers';

import Process from '@run/process';

describe('Unit: Process', () => {
  it('can be created with specific properties', () => {
    let test = new Process({
      name: 'test',
      cmd: 'echo',
      args: ['hello world'],
      env: { TEST: true }
    });

    expect(test).to.have.property('name', 'test');
    expect(test).to.have.property('command', 'echo');
    expect(test).to.have.property('arguments').that.deep.equals(['hello world']);
    expect(test).to.have.property('env').that.deep.equals({ TEST: true });
  });

  it('can define own non-configurable properties', () => {
    class Test extends Process {
      get name() { return 'extended'; }
      get command() { return 'sleep'; }
      get arguments() { return ['0.1']; }
      get env() { return { FOO: 'bar' }; }
    };

    let test = new Test({
      name: 'overridden',
      cmd: 'exit',
      args: [1],
      env: null
    });

    expect(test).to.have.property('name', 'extended');
    expect(test).to.have.property('command', 'sleep');
    expect(test).to.have.property('arguments').that.deep.equals(['0.1']);
    expect(test).to.have.property('env').that.deep.equals({ FOO: 'bar' });
  });

  describe('run', () => {
    class Test extends Process {
      get name() { return 'test'; }
      get command() { return 'printf'; }
      get arguments() { return ['hello %s', this.env.SUBJECT]; }
    }

    it('indicates it is running', async () => {
      let test = new Test();
      expect(test.running).to.be.false;

      let done = test.run();
      expect(test.running).to.be.true;

      await expect(done).to.be.fulfilled;
      expect(test.running).to.be.false;
    });

    it('runs the specified command and resolves on exit', async () => {
      let test = new Test({ env: { SUBJECT: 'world' } });
      let output = new WritableStream();
      let done = test.run();

      test.process.stdout.pipe(output);

      await expect(done).to.be.fulfilled;
      expect(output.toString()).to.equal('hello world');
    });

    it('runs the first command found when given an array of commands', async () => {
      let test = new Process({ cmd: ['not-me', 'printf'], args: ['hola %s', 'mundo'] });
      let output = new WritableStream();
      let done = test.run();

      test.process.stdout.pipe(output);

      await expect(done).to.be.fulfilled;
      expect(output.toString()).to.equal('hola mundo');
    });

    it('rejects when the command exits with a non-zero code', async () => {
      let test = new Process({ cmd: 'printf', args: ['%'] });
      await expect(test.run()).to.be.rejectedWith('Command failed with exit code 1.');
    });

    it('rejects when the command does not exist', async () => {
      let test = new Process({ name: 'nope', cmd: 'f4k3' });
      await expect(test.run()).to.be.rejectedWith('Command not found.');
    });

    it('rejects when the command path does not exist', async () => {
      let test = new Process({ name: 'path', cmd: 'not/a/real/path' });
      await expect(test.run()).to.be.rejectedWith('Command not found.');
    });
  });

  describe('kill', () => {
    it('kills a running process', async () => {
      let test = new Process({ cmd: 'sleep', args: [10] });

      let done = test.run();
      expect(test.running).to.be.true;

      await test.kill();
      await expect(done).to.be.fulfilled;
      expect(test.running).to.be.false;
    });

    it('kills a hanging process after 2 seconds', async () => {
      let test = new Process({
        cmd: 'node',
        args: ['--eval', `
          process.on("SIGTERM", () => {}); // prevent default kill
          setTimeout(() => {}, 10000); // keep this process around
          console.log(); // signal to the parent process`]
      });

      let done = test.run();
      let ready = false;

      // wait for SIGTERM listener to be registered
      test.process.stdout.on('data', () => ready = true);
      expect(test.running).to.be.true;
      await when(() => ready);

      let time = Date.now();
      await test.kill();
      let duration = Date.now() - time;

      await expect(done).to.be.fulfilled;
      expect(test.running).to.be.false;
      expect(duration).to.be.gt(2000);
    }).timeout(3000);
  });

  describe('pipe', () => {
    let streams;

    beforeEach(() => {
      streams = {
        stdout: new WritableStream(),
        stderr: new WritableStream()
      };
    });

    it('adds a new line to stdout before any piped output', async () => {
      let test = new Process({ cmd: 'printf', args: ['test'] });

      let done = test.run();
      test.pipe(streams);
      await expect(done).to.be.fulfilled;

      expect(streams.stdout.toString()).to.equal('\ntest');
      expect(streams.stderr.toString()).to.equal('');
    });

    it('adds a new line to stderr before any piped output', async () => {
      let test = new Process({ cmd: 'printf', args: ['%'] });

      let done = test.run();
      test.pipe(streams);
      await expect(done).to.be.rejected;

      expect(streams.stdout.toString()).to.equal('');
      expect(streams.stderr.toString()).to.match(/^\n/);
    });

    it('does not add a new line if there was no output', async () => {
      let test = new Process({ cmd: 'node', args: ['--eval', ''] });

      let done = test.run();
      test.pipe(streams);
      await expect(done).to.be.fulfilled;

      expect(streams.stdout.toString()).to.equal('');
      expect(streams.stderr.toString()).to.equal('');
    });
  });

  describe('unpipe', () => {
    let streams;

    beforeEach(() => {
      streams = {
        stdout: new WritableStream(),
        stderr: new WritableStream()
      };
    });

    it('adds a new line to stdout after any piped output', async () => {
      let test = new Process({ cmd: 'printf', args: ['test'] });

      let done = test.run();
      test.pipe(streams);
      await expect(done).to.be.fulfilled;
      test.unpipe(streams);

      expect(streams.stdout.toString()).to.equal('\ntest\n');
      expect(streams.stderr.toString()).to.equal('');
    });

    it('adds a new line to stderr after any piped output', async () => {
      let test = new Process({ cmd: 'printf', args: ['%'] });

      let done = test.run();
      test.pipe(streams);
      await expect(done).to.be.rejected;
      test.unpipe(streams);

      expect(streams.stdout.toString()).to.equal('');
      expect(streams.stderr.toString()).to.match(/\n\n$/); // printf error ends in a newline
    });

    it('does not add a new line if there was no output', async () => {
      let test = new Process({ cmd: 'node', args: ['--eval', ''] });

      let done = test.run();
      test.pipe(streams);
      await expect(done).to.be.fulfilled;
      test.unpipe(streams);

      expect(streams.stdout.toString()).to.equal('');
      expect(streams.stderr.toString()).to.equal('');
    });
  });
});
