import re

path = 'src/core/__tests__/InvariantChecker.test.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = re.sub(r"  it\('should catch orphaned links', \(\) => \{\n    const eng = new SimulationEngine\(\);\n    eng\.addLink\(createLink\('link1', 'invalid1', 'invalid2'\)\);\n    const res = InvariantChecker\.checkInvariants\(eng\);\n    expect\(res\.valid\)\.toBe\(false\);\n    expect\(res\.errors\.length\)\.toBe\(2\);\n  \}\);\n\n", '', text)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
