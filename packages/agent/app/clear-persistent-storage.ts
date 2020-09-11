export function* clearPersistentStorage() {
  localStorage.clear();
  sessionStorage.clear();

  yield clearIndexedDB();
}

function* clearIndexedDB() {
  let indexedDB = window.indexedDB;
  if (isEnumerableIndexedDB(indexedDB)) {
    let databases: DBInfo[] = yield indexedDB.databases();
    for (let database of databases) {
      let request: IDBRequest = indexedDB.deleteDatabase(database.name);
      yield idbRequest(request);
    }
  }
}

function idbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  })
}

interface DBInfo {
  name: string;
  version: number;
}

interface EnumerableIDBFactory extends IDBFactory {
  databases(): Promise<DBInfo[]>;
}

function isEnumerableIndexedDB(indexedDB?: IDBFactory): indexedDB is EnumerableIDBFactory {
  return !!indexedDB &&
    (typeof (indexedDB as unknown as Record<string,unknown>).databases !== 'undefined')
}
