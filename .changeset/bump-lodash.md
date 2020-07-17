---
"@bigtest/driver": patch
---
Upgraded version of lodash to 4.17.19 to address the following security notice.

GHSA-p6mc-m468-83gw
low severity
Vulnerable versions: < 4.17.19
Patched version: 4.17.19

Versions of lodash prior to 4.17.19 are vulnerable to Prototype Pollution. The function zipObjectDeep allows a malicious user to modify the prototype of Object if the property identifiers are user-supplied. Being affected by this issue requires zipping objects based on user-provided property arrays.

This vulnerability causes the addition or modification of an existing property that will exist on all objects and may lead to Denial of Service or Code Execution under specific circumstances.
