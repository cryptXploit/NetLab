import re

def patch(path, operations):
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    for op in operations:
        text = text.replace(op[0], op[1])
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)

# Revert my bad patch in curriculum and troubleshootingScenarios
patch('src/data/curriculum.ts', [
    ("(_engine) =>", "(engine) =>"),
    ("(_engine, history)", "(_engine, _history)"),
    ("(engine, history)", "(_engine, _history)"),
    ("(_engine, history) => {\n        return history", "(_engine, history) => {\n        return history") # wait, need history
])

# I'll just write a script that does it with regex to be safe.
