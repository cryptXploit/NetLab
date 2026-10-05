import re

path = 'src/data/curriculum.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("learningObjectives: ['Understand devices', 'Understand links', 'Send a packet'],", "learningObjectives: ['Understand devices', 'Understand links', 'Send a packet'],\n  skills: ['FOUNDATIONS'],")
text = text.replace("learningObjectives: ['Understand ARP Requests', 'Understand ARP Replies', 'Inspect MAC Tables'],", "learningObjectives: ['Understand ARP Requests', 'Understand ARP Replies', 'Inspect MAC Tables'],\n  skills: ['ARP', 'FOUNDATIONS'],")
text = text.replace("learningObjectives: ['Understand switches', 'Observe MAC learning', 'Observe broadcast behavior'],", "learningObjectives: ['Understand switches', 'Observe MAC learning', 'Observe broadcast behavior'],\n  skills: ['SWITCHING', 'ARP'],")
text = text.replace("learningObjectives: ['Understand DHCP', 'Observe DORA process', 'Configure a client'],", "learningObjectives: ['Understand DHCP', 'Observe DORA process', 'Configure a client'],\n  skills: ['DHCP', 'IPV4'],")
text = text.replace("learningObjectives: ['Understand DNS', 'Observe DNS Queries'],", "learningObjectives: ['Understand DNS', 'Observe DNS Queries'],\n  skills: ['DNS'],")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

path = 'src/data/troubleshootingScenarios.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("learningObjectives: ['Verify Default Gateway', 'Understand Routing Tables', 'Read ARP Output'],", "learningObjectives: ['Verify Default Gateway', 'Understand Routing Tables', 'Read ARP Output'],\n  skills: ['ROUTING', 'IPV4', 'TROUBLESHOOTING'],")
text = text.replace("learningObjectives: ['Verify bidirectional routing', 'Inspect Router Tables'],", "learningObjectives: ['Verify bidirectional routing', 'Inspect Router Tables'],\n  skills: ['ROUTING', 'TROUBLESHOOTING'],")
text = text.replace("learningObjectives: ['Verify Subnetting', 'Inspect Interfaces', 'Understand L2 vs L3 boundaries'],", "learningObjectives: ['Verify Subnetting', 'Inspect Interfaces', 'Understand L2 vs L3 boundaries'],\n  skills: ['IPV4', 'SWITCHING', 'TROUBLESHOOTING'],")
text = text.replace("learningObjectives: ['Check Link Status', 'Verify Interfaces'],", "learningObjectives: ['Check Link Status', 'Verify Interfaces'],\n  skills: ['FOUNDATIONS', 'TROUBLESHOOTING'],")
text = text.replace("learningObjectives: ['Differentiate IP vs DNS issues', 'Configure DNS Server IP'],", "learningObjectives: ['Differentiate IP vs DNS issues', 'Configure DNS Server IP'],\n  skills: ['DNS', 'IPV4', 'TROUBLESHOOTING'],")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

path = 'src/core/simulation/ScenarioGenerator.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("learningObjectives: ['Verify Default Gateway', 'Understand ARP failures'],", "learningObjectives: ['Verify Default Gateway', 'Understand ARP failures'],\n    skills: ['ROUTING', 'IPV4', 'TROUBLESHOOTING'],")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
