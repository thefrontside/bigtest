// This will force fetch to be polyfilled with XHR for pretender to
// mock http requets.
//
// We do this inside of another imported file becuase it needs to happen
// before the fetch is first imported. Imports are hoisted to the top so
// settings this explicity before importing the app still won't work; it
// needs to be inside another import that happens before the app import.
window.fetch = undefined;
