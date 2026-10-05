import re

def patch(path, operations):
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    for op in operations:
        text = text.replace(op[0], op[1])
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)

# useLabStore.ts
patch('src/app/store/useLabStore.ts', [
    ("import { LabDefinition, LabProgress, EvidenceEntry }", "import type { LabDefinition, LabProgress, EvidenceEntry }")
])

# Lab.ts
patch('src/core/domain/Lab.ts', [
    ("import { SimulationState } from './NetworkTypes';", "")
])

# curriculum.ts
patch('src/data/curriculum.ts', [
    ("import { LabDefinition }", "import type { LabDefinition }"),
    ("(engine, history)", "(_engine, history)"),
    ("(engine) =>", "(_engine) =>")
])

# troubleshootingScenarios.ts
patch('src/data/troubleshootingScenarios.ts', [
    ("import { LabDefinition }", "import type { LabDefinition }"),
    ("(engine, history)", "(_engine, history)"),
    ("(engine) =>", "(_engine) =>")
])

# DeviceContextSheet.tsx (useLabStore imported but not used directly in top-level, it's used inside ping function)
# Actually, I added useLabStore and didn't use it in top scope? Wait, `useLabStore.getState()` doesn't strictly need it as a hook if not reactive, but it's fine. 
# Oh, it says 'useLabStore' is declared but its value is never read. Wait, if I used `useLabStore.getState()`, it IS read. 
# Ah, I added `import { useLabStore } from '../../../app/store/useLabStore';` but maybe I didn't replace correctly in DeviceContextSheet?
# Let's fix DeviceContextSheet
patch('src/ui/components/context/DeviceContextSheet.tsx', [
    ("import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';\nimport { useLabStore } from '../../../app/store/useLabStore';", "import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';")
])

# Actually wait! In DeviceContextSheet, I wrote `if (useLabStore.getState().activeLabId) {`. If I remove the import, it will error!
# Why did TS say it was not read? Oh, my python script did `text.replace` where `import { useWorkspaceStore }` was matched, but maybe `useLabStore` was imported TWICE? No. I'll just change it to use it.
