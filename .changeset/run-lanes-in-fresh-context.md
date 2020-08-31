---
"@bigtest/agent": minor
---
Each sequence of related side-effects for a test (or lane in bigtest
jargon) is now run in its own fresh javascript context so that no
global variables or state can leak
