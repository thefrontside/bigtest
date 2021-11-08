import './globals';
import { TestImplementation } from '@bigtest/suite';
import { globals as interactorsGlobals, setDocumentResolver, setInteractorTimeout } from '@interactors/globals'

export type RunnerState = 'pending' | 'step' | 'assertion';

interface BigtestOptions {
  testFrame?: HTMLIFrameElement;
  document?: Document;
  defaultInteractorTimeout?: number;
  defaultAppTimeout?: number;
  appUrl?: string;
  runnerState?: RunnerState;
}

const defaultManifest: TestImplementation = {
  description: 'Empty',
  steps: [],
  assertions: [],
  children: [],
};

function options(): BigtestOptions {
  if(!globalThis.__bigtest) {
    globalThis.__bigtest = {};
  }
  return globalThis.__bigtest as BigtestOptions;
}

export const bigtestGlobals = {
  manifestProperty: '__bigtestManifest',

  get manifest(): TestImplementation {
    return globalThis.__bigtestManifest as TestImplementation || defaultManifest;
  },

  set manifest(value: TestImplementation) {
    globalThis.__bigtestManifest = value;
  },

  get document(): Document {
    let testFrame = options().testFrame;
    let doc = (testFrame && testFrame.contentDocument) || interactorsGlobals.document;
    if (!doc) throw new Error('no document found')
    return doc
  },

  set document(value: Document) {
    setDocumentResolver(() => value);
  },

  get defaultInteractorTimeout(): number {
    return interactorsGlobals.interactorTimeout;
  },

  set defaultInteractorTimeout(value: number) {
    setInteractorTimeout(value);
  },

  get defaultAppTimeout(): number {
    return options().defaultAppTimeout || 20000;
  },

  set defaultAppTimeout(value: number) {
    options().defaultAppTimeout = value;
  },

  get testFrame(): HTMLIFrameElement | undefined {
    return options().testFrame;
  },

  set testFrame(value: HTMLIFrameElement | undefined) {
    options().testFrame = value;
  },

  get runnerState(): RunnerState | undefined {
    return options().runnerState;
  },

  set runnerState(value: RunnerState | undefined) {
    options().runnerState = value;
  },

  get appUrl(): string | undefined {
    return options().appUrl;
  },

  set appUrl(value: string | undefined) {
    options().appUrl = value;
  },

  reset(): void {
    interactorsGlobals.reset();
    delete globalThis.__bigtest;
    delete globalThis.__bigtestManifest;
  }
};
