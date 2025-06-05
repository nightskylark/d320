import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import { XMarkIcon, PencilSquareIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase";
import EditEnemy from "./EditEnemy";
import type { Enemy, UserProfile } from "../types";
import LoginPrompt from "./LoginPrompt";

interface Props {
  enemy: Enemy;
  author?: UserProfile;
  onPrev: () => void;
  onNext: () => void;
  close: () => void;
  onDelete: () => void;
}
const EnemyDetail: React.FC<Props> = ({ enemy, author, onPrev, onNext, close, onDelete }) => {
    const user = useAuth();
    const cardRef = useRef<HTMLDivElement | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loginPrompt, setLoginPrompt] = useState(false);
    const liked = !!user && enemy.likedBy?.includes(user.uid);

    const toggleLike = async () => {
        if (!user || !enemy.id) {
            setLoginPrompt(true);
            return;
        }
        const ref = doc(db, "eotv-enemies", enemy.id);
        await updateDoc(ref, {
            likedBy: liked ? arrayRemove(user.uid) : arrayUnion(user.uid)
        });
    };

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isEditing) {
                    setIsEditing(false);
                } else {
                    close();
                }
            } else if (!isEditing && e.key === 'ArrowLeft') {
                onPrev();
            } else if (!isEditing && e.key === 'ArrowRight') {
                onNext();
            }
        };

        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isEditing, close, onPrev, onNext]);

    // Close card when clicking outside
    const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
        if (cardRef.current === event.target) {
            close();
            setIsEditing(false);
        }
    };
  
    return (
    <>
    {loginPrompt && (
        <LoginPrompt
            open={loginPrompt}
            onClose={() => setLoginPrompt(false)}
            message="Для сохранения требуется авторизация"
        />
    )}
    <div
        key={enemy.id}
        ref={cardRef}
        onClick={handleClickOutside}
        className={`text-white shadow-lg cursor-pointer  overflow-hidden fixed z-50 inset-0 p-5 bg-black flex justify-center items-center`}
    >
       {(isEditing 
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

                    {/* Action buttons */}
                    <div className="absolute top-2 right-10 flex gap-2">
                        <button
                            onClick={toggleLike}
                            title={liked ? 'Сохранено' : 'Сохранить'}
                            className="text-gray-300 hover:scale-110 transition"
                        >
                            {liked ? <StarSolid className="w-6 h-6" /> : <StarOutline className="w-6 h-6" />}
                        </button>
                        {user && user.uid === enemy.authorUid && (
                            <>
                                <button onClick={() => setIsEditing(true)} className="text-gray-300 hover:text-white cursor-pointer drop-shadow-md">
                                    <PencilSquareIcon className="w-6 h-6" />
                                </button>
                                <button onClick={onDelete} className="text-gray-300 hover:text-white cursor-pointer drop-shadow-md">
                                    <TrashIcon className="w-6 h-6" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Close button */}
                    <button onClick={close} className="absolute top-2 right-2 text-gray-300 hover:text-white cursor-pointer drop-shadow-xl">
                        <XMarkIcon className="w-6 h-6" />
                    </button>

                    {/* Navigation between cards */}
                    <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-700 p-2 rounded-full cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out" onClick={onPrev}>
                        <ChevronLeftIcon className="w-5 h-5 text-white" />
                    </button>
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-700 p-2 rounded-full cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out" onClick={onNext}>
                        <ChevronRightIcon className="w-5 h-5 text-white" />
                    </button>
                </div>
            </> 
        )}
    </div>
    </>
  );
};

export default EnemyDetail;
