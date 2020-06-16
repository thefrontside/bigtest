---
"@bigtest/project": minor
---

`@bigtest/project` used to have a peer dependency on
`@bigtest/webdriver` in order to import some interfaces. We maybe
shouldn't have used peer dependency in the first place, but now that
the interfaces have been extracted into `@bigtest/driver` we move the
dependency there.
