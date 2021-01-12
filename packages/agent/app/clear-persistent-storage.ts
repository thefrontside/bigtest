import { fork, Operation } from 'effection';
import { getIndexedDBConfig } from './indexed-db-config';

export function* clearPersistentStorage(): Operation<void> {
  localStorage.clear();
  sessionStorage.clear();

  yield clearIndexedDB();
}

function* clearIndexedDB() {
  let { openedDBNames } = getIndexedDBConfig();

  // delete any database that were opened in previous lanes
  for (let dbName of openedDBNames) {
    let request: IDBRequest = window.indexedDB.deleteDatabase(dbName);
    yield fork(idbRequest(request));
  }
  openedDBNames.clear();


  // anytime an indexed DB is opened, stash the name so we can clear it later
  let originalOpen = window.indexedDB.open;
  window.indexedDB.open = function open(name: string, version?: number) {
    openedDBNames.add(name);
    return originalOpen.call(window.indexedDB, name, version);
  }
}

function idbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  })
}
