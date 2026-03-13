import type { CharacterCard } from "../types";

interface CharacterDeckProps {
  characters: CharacterCard[];
}

const CharacterDeck: React.FC<CharacterDeckProps> = ({ characters }) => {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {characters.map((character, index) => (
        <article key={character.id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
          <div className="mb-2 text-sm text-slate-300">{character.name || `Персонаж ${index + 1}`}</div>
          <div className="relative aspect-[210/297] overflow-hidden rounded-xl border border-white/10 bg-slate-950/70">
            {character.imageUrl ? (
              <img src={character.imageUrl} alt={character.name || `Персонаж ${index + 1}`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-center text-sm text-slate-400">
                Плейсхолдер A4
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
};

export default CharacterDeck;
