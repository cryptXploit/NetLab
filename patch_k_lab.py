import re

path = 'src/core/domain/Lab.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

skills = """export type Skill = 
  | 'FOUNDATIONS'
  | 'ARP'
  | 'IPV4'
  | 'DNS'
  | 'DHCP'
  | 'SWITCHING'
  | 'ROUTING'
  | 'TROUBLESHOOTING';\n\n"""

text = text.replace("export type LabDifficulty", skills + "export type LabDifficulty")
text = text.replace("learningObjectives: string[];", "learningObjectives: string[];\n  skills?: Skill[];")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
