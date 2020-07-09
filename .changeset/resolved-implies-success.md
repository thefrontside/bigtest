---
"@bigtest/interactor": minor
---
Drop resolve value from interactions and assertions. If the promise
resolves, that means it was successful. in other words, the type of
`exists()` is now `() => Promise<void>`, not `() => Promise<true>`
