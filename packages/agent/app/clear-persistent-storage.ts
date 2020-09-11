
export function* clearPersistentStorage() {
  localStorage.clear();
  sessionStorage.clear();
}
