import { Operation, fork } from 'effection';
import { Mailbox, ensure } from '@bigtest/effection';
import { Subscribable, SymbolSubscribable, subscribe, ChainableSubscription } from '@effection/subscription';
import { Channel } from '@effection/channel';
import {
  findConfigFile,
  sys,
  createSemanticDiagnosticsBuilderProgram,
  createWatchCompilerHost,
  Diagnostic,
  createWatchProgram,
  flattenDiagnosticMessageText,
  FormatDiagnosticsHost,
  SemanticDiagnosticsBuilderProgram,
  WatchOfConfigFile
 } from 'typescript';

export type TypescriptValidatorMessage =
  | { type: 'skip'; validator: string }
  | { type: 'update'; validator: string; message: string }
  | { type: 'error'; validator: string; error: Error };

interface ValidatorOperationOptions {
  delegate: Mailbox;
};

const formatHost: FormatDiagnosticsHost = {
  getCanonicalFileName: path => path,
  getCurrentDirectory: sys.getCurrentDirectory,
  getNewLine: () => sys.newLine
};

class TypescriptValidator implements Subscribable<TypescriptValidatorMessage, undefined> {
  name = 'typescript';

  [SymbolSubscribable]() {
    return this.channel[SymbolSubscribable]();
  }

  *run(): Operation {
    let configPath = findConfigFile(process.cwd(), sys.fileExists, 'tsconfig.json');

    if (configPath == null) {
      this.channel.send({ type: 'skip', validator: this.name });
      return;
    }

    let createProgram = createSemanticDiagnosticsBuilderProgram;
    let program: WatchOfConfigFile<SemanticDiagnosticsBuilderProgram> | null = null;
    let host = createWatchCompilerHost(
      configPath,
      { noEmit: true },
      sys,
      createProgram,
      this.reportDiagnostic,
      this.reportWatchStatusChanged
    );

    yield ensure(() => {
      if (program) program.close();
    });

    program = createWatchProgram(host);

    yield;
  }

  private channel = new Channel<TypescriptValidatorMessage>();

  private reportDiagnostic = (diagnostic: Diagnostic) => {
    let message = `Error: TS${diagnostic.code}: ${flattenDiagnosticMessageText(diagnostic.messageText, formatHost.getNewLine())}`;
    this.channel.send({
      type: 'error',
      validator: this.name,
      error: new Error(message)
    });
  }

  private reportWatchStatusChanged = (diagnostic: Diagnostic) => {
    this.channel.send({
      type: 'update',
      validator: this.name,
      message: flattenDiagnosticMessageText(diagnostic.messageText, formatHost.getNewLine())
    });
  }
}

export function* createValidator(options: ValidatorOperationOptions): Operation {
  let tsValidator = new TypescriptValidator();
  let validatorEvents: ChainableSubscription<TypescriptValidatorMessage, undefined> = yield subscribe(tsValidator);

  options.delegate.send({ status: 'ready' });

  yield fork(validatorEvents.forEach(function*(event) {
    switch (event.type) {
      case 'skip':
        console.debug('[validator]', `[${event.validator}]`, 'skipping validation');
        options.delegate.send({ event: 'skip', validator: event.validator });
        break;

      case 'error':
        console.error('[validator]', `[${event.validator}]`, event.error.message);
        options.delegate.send({ event: 'error', validator: event.validator, error: event.error });
        break;

      case 'update':
        console.info('[validator]', `[${event.validator}]`, event.message);
        options.delegate.send({ event: 'update', validator: event.validator, message: event.message });
        break;

      default:
        break;
    }
  }));

  yield fork(tsValidator.run());
}