import "@bigtest/globals";

/**
 * This allows the test frame to store some data on the agent frame by allocating
 * a storage cell for keeping track of which databases have been opened.
 */

export interface IndexedDBConfig {
  openedDBNames: Set<string>;
}

interface IndexedDBConfigurable {
  currentIndexedDBConfig?: IndexedDBConfig;
}

/**
 * Retrieve the indexedDBConfig from the agent frame. Meant to be called from the test frame.
 */
export function getIndexedDBConfig(): IndexedDBConfig {
  let context: typeof globalThis = window.parent.window;
  let bigtest: IndexedDBConfigurable = context.__bigtest as IndexedDBConfigurable;
  if (!bigtest.currentIndexedDBConfig) {
    bigtest.currentIndexedDBConfig = { openedDBNames: new Set() };
  }
  return bigtest.currentIndexedDBConfig;
}
