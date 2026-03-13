import type { CharacterCard } from "../types";

interface CharacterDeckProps {
  characters: CharacterCard[];
}

const CharacterDeck: React.FC<CharacterDeckProps> = ({ characters }) => {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {characters.map((character) => (
        <article
          key={character.id}
          className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-xl"
          style={{ boxShadow: `0 10px 35px -20px ${character.accent}` }}
        >
          <div className="mb-3 h-1 w-20 rounded-full" style={{ backgroundColor: character.accent }} />
          <h3 className="text-lg font-semibold text-white">{character.name}</h3>
          {character.subtitle ? <p className="mt-1 text-sm text-slate-300">{character.subtitle}</p> : null}
        </article>
      ))}
    </div>
  );
};

export default CharacterDeck;
