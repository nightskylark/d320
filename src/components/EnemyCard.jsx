import { useRef } from "react";

function EnemyCard({ index, enemy, author, onClick }) {
    const cardRef = useRef(null);

    return (
    <div
        key={enemy.id}
        ref={cardRef}
        className={`bg-gray-800 text-white shadow-lg cursor-pointer  overflow-hidden relative w-40 h-56 aspect-[2/3] hover:scale-110 flex flex-col rounded-xl transition-all duration-300 ease-in-out`}
        onClick={() => onClick(index)}
    >
        {/* 1st image */}
        <img src={enemy.imageURL} alt={enemy.name} className="w-full h-32 object-cover" />

        <div className="p-2 flex flex-col">
            {/* Name */}
            <p className="text-sm text-center font-bold">{enemy.name}</p>

            {/* Tags */}
            <div className="absolute bottom-4 left-4 flex flex-col items-end gap-2">
                <div className="flex flex-wrap gap-1">
                {enemy.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-700 px-2 py-1 rounded text-xs drop-shadow-2xl">{tag}</span>
                ))}
                </div>
            </div>
 
            {/* Author avatar */}
            <div className="absolute items-center gap-2 mt-1 right-4 bottom-4">
                <img src={author?.photoURL} alt="Avatar" className="w-6 h-6 rounded-full" title={author?.displayName || "Unknown"} />
            </div>

        </div>

        {/* 2nd image preload */}
        {enemy.imageURL2 && <img src={enemy.imageURL2} alt="Extra" className="hidden" />}
    </div>
  );
}

export default EnemyCard;
