---
type: regex
target: trace
pattern: '^(?:(?!"name":"(?:Write|Edit)","input":\{"file_path":"[^"]*/out/src/(?![^"]*/test/)[^"]*(?<!\.test)\.tsx?")[\s\S])*?(?:Failed to resolve import|Cannot find module|FAIL  |Test Files  \d+ failed|error TS\d+)'
---
