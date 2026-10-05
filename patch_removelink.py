import re

path_engine = 'src/core/simulation/SimulationEngine.ts'
with open(path_engine, 'r', encoding='utf-8') as f:
    text_engine = f.read()

remove_link = """  public removeLink(linkId: string): void {
    this.links.delete(linkId);
  }"""
text_engine = re.sub(r'  public addLink\(link: Link\): void \{.*?\n  \}', lambda m: m.group(0) + '\n\n' + remove_link, text_engine, flags=re.DOTALL)
with open(path_engine, 'w', encoding='utf-8') as f:
    f.write(text_engine)

path_store = 'src/app/store/useSimulationStore.ts'
with open(path_store, 'r', encoding='utf-8') as f:
    text_store = f.read()

text_store = text_store.replace('addLink: (sourceId: string, sourceIfaceId: string, targetId: string, targetIfaceId: string) => { success: boolean, error?: string };', 'addLink: (sourceId: string, sourceIfaceId: string, targetId: string, targetIfaceId: string) => { success: boolean, error?: string };\n  removeLink: (linkId: string) => void;')

remove_link_store = """    removeLink: (linkId: string) => {
      const eng = get().engine;
      eng.removeLink(linkId);
      set({ links: [...eng.getLinks()] });
    },"""
text_store = re.sub(r'    addLink: \(sourceId: string, sourceIfaceId: string, targetId: string, targetIfaceId: string\) => \{.*?\n    \},', lambda m: m.group(0) + '\n\n' + remove_link_store, text_store, flags=re.DOTALL)

with open(path_store, 'w', encoding='utf-8') as f:
    f.write(text_store)
