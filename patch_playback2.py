import re

path = 'src/app/store/useSimulationStore.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('export const useSimulationStore = create<SimulationStoreState>((set, get) => {', 'let playbackTimerId: any = null;\n\nexport const useSimulationStore = create<SimulationStoreState>((set, get) => {')

play_pause = """    play: () => {
      if (get().isPlaying) return;
      set({ isPlaying: true });
      
      if (playbackTimerId) clearTimeout(playbackTimerId);
      
      const loop = () => {
        if (!get().isPlaying) return;
        get().stepForward();
        playbackTimerId = setTimeout(loop, 1000 / get().playbackSpeed);
      };
      loop();
    },
    
    pause: () => {
      set({ isPlaying: false });
      if (playbackTimerId) {
        clearTimeout(playbackTimerId);
        playbackTimerId = null;
      }
    },"""

text = re.sub(r'    play: \(\) => \{.*?\n    \},\n\s*pause: \(\) => \{.*?\n    \},', play_pause, text, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
