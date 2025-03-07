import { useState, useRef, useEffect } from "react";
import { auth } from "../firebase";
import ReactMarkdown from "react-markdown";
import { XMarkIcon, PencilSquareIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import EditEnemy from "./EditEnemy";

function EnemyCard({ index, isSelected, enemy, author, onClick, onPrev, onNext, close, onDelete }) {
    const user = auth.currentUser;
    const cardRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);

    // Close card when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
        if (cardRef.current === event.target) {
            close();
            setIsEditing(false);
        }
        };

        if (isSelected) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isSelected]);

    return (
    <div
        key={enemy.id}
        ref={cardRef}
        className={`bg-gray-800 text-white shadow-lg cursor-pointer  overflow-hidden 
        ${isSelected
            ? "fixed z-50 inset-0 p-5 bg-black flex justify-center items-center"
            : "relative w-40 h-56 aspect-[2/3] hover:scale-110 flex flex-col rounded-xl transition-all duration-300 ease-in-out"}
        `}
        onClick={() => !isSelected && onClick(index)}
    >
      {isSelected
        ? (isEditing 
            ? <EditEnemy enemy={enemy} onClose={() => setIsEditing(false)} />
            : <>
                {/* Expanded view */}
                <div className="relative bg-gray-900 rounded-2xl w-full flex shadow-lg h-full max-w-7xl overflow-hidden">
                    {/* Left column - image 1 */}
                    <img src={enemy.imageURL} alt={enemy.name} className="w-3/14 object-cover" />
                    {/* Center - title + description */}
                    <div className="w-4/7 flex flex-col px-6 overflow-y-auto">
                        <h2 className="text-2xl font-bold text-center p-6 pt-10">{enemy.name}</h2>
                        <ReactMarkdown
                        components={{
                            p: ({ node, ...props }) => <p className="text-gray-300 text-sm mt-2" {...props} />,
                            strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />,
                            em: ({ node, ...props }) => <em className="italic text-gray-400" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc list-inside text-gray-300 mt-2" {...props} />,
                            li: ({ node, ...props }) => <li className="ml-4" {...props} />
                        }}
                        >
                        {enemy.customDescription}
                        </ReactMarkdown>

                    </div>
                    {/* Right column - image 2 */}
                    {enemy.imageURL2 && <img src={enemy.imageURL2} alt="Extra" className="w-3/14 object-cover" />}

                    {/* Tags */}
                    <div className="absolute bottom-4 left-4 flex flex-col items-end gap-2">
                        <div className="flex flex-wrap gap-1">
                        {enemy.tags.map((tag, index) => (
                            <span key={index} className="bg-gray-700 px-2 py-1 rounded text-xs drop-shadow-2xl">{tag}</span>
                        ))}
                        </div>
                    </div>

                    {/* Author */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                        <span className="text-sm">{author?.displayName || "Unknown"}</span>
                        <img src={author?.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-500" />
                    </div>

                    {/* Close button */}
                    <button onClick={close} className="absolute top-2 right-2 text-gray-300 hover:text-white cursor-pointer drop-shadow-xl">
                        <XMarkIcon className="w-6 h-6" />
                    </button>

                    {/* Edit and Delete buttons */}
                    {user && user.uid === enemy.authorUid && (
                        <div className="absolute top-2 right-10 flex gap-2">
                            <button onClick={() => setIsEditing(true)} className="text-gray-300 hover:text-white cursor-pointer drop-shadow-md">
                                <PencilSquareIcon className="w-6 h-6" />
                            </button>
                            <button onClick={onDelete} className="text-gray-300 hover:text-white cursor-pointer drop-shadow-md">
                                <TrashIcon className="w-6 h-6" />
                            </button>
                        </div>
                    )}

                    {/* Navigation between cards */}
                    <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-700 p-2 rounded-full cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out" onClick={onPrev}>
                        <ChevronLeftIcon className="w-5 h-5 text-white" />
                    </button>
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-700 p-2 rounded-full cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out" onClick={onNext}>
                        <ChevronRightIcon className="w-5 h-5 text-white" />
                    </button>
                </div>
            </> 
        )
        : (
        <>
            {/* Compact view*/}
            <img src={enemy.imageURL} alt={enemy.name} className="w-full h-32 object-cover" />
            <div className="p-2 flex flex-col">
                <p className="text-sm text-center font-bold">{enemy.name}</p>
                
                {/* Tags */}
                <div className="absolute bottom-4 left-4 flex flex-col items-end gap-2">
                    <div className="flex flex-wrap gap-1">
                    {enemy.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-700 px-2 py-1 rounded text-xs drop-shadow-2xl">{tag}</span>
                    ))}
                    </div>
                </div>

                <div className="absolute items-center gap-2 mt-1 right-4 bottom-4">
                    <img src={author?.photoURL} alt="Avatar" className="w-6 h-6 rounded-full" title={author?.displayName || "Unknown"} />
                </div>

            </div>
            {enemy.imageURL2 && <img src={enemy.imageURL2} alt="Extra" className="hidden" />}
        </>
      )}
    </div>
  );
}

export default EnemyCard;
