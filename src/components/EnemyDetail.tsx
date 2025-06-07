import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { renderMarkdown } from "../utils/markdown";
import { XMarkIcon, PencilSquareIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon as StarOutline, LinkIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase";
import { printEnemies } from "../utils/printEnemies";
import EditEnemy from "./EditEnemy";
import AboutDialog from "./AboutDialog";
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
    const [linkCopied, setLinkCopied] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);
    const [aboutAnchor, setAboutAnchor] = useState<DOMRect | null>(null);
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

    const handleShare = async () => {
        if (!enemy.id) return;
        const url = `${window.location.origin}${window.location.pathname}?enemy=${enemy.id}`;
        try {
            await navigator.clipboard.writeText(url);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (e) {
            console.error('Failed to copy link', e);
        }
    };

    const handlePrint = () => {
        const profiles: Record<string, UserProfile> = {};
        if (author) {
            profiles[enemy.authorUid] = author;
        }
        printEnemies([enemy], profiles);
    };

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (aboutOpen) {
                    setAboutOpen(false);
                } else if (isEditing) {
                    setIsEditing(false);
                } else {
                    close();
                }
            } else if (!isEditing && !aboutOpen && e.key === 'ArrowLeft') {
                onPrev();
            } else if (!isEditing && !aboutOpen && e.key === 'ArrowRight') {
                onNext();
            }
        };

        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isEditing, aboutOpen, close, onPrev, onNext]);

    // Close card when clicking outside
    const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
        if (cardRef.current === event.target) {
            if (aboutOpen) {
                setAboutOpen(false);
            } else {
                close();
                setIsEditing(false);
            }
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
        className={`text-gray-900 dark:text-white shadow-lg cursor-pointer  overflow-hidden fixed z-40 inset-0 p-5  bg-gray-500 dark:bg-black flex justify-center items-center`}
    >
       {(isEditing 
            ? <EditEnemy enemy={enemy} onClose={() => setIsEditing(false)} />
            : <>
                {/* Expanded view */}
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl w-full flex flex-col sm:flex-row shadow-lg h-full max-w-7xl overflow-hidden">
                    {/* Left column - image 1 */}
                    <img
                        src={enemy.imageURL || "/eotv-enemy-placeholder.png"}
                        alt={enemy.name}
                        className="w-full sm:w-3/14 h-40 sm:h-auto object-cover"
                    />
                    {/* Center - title + description */}
                    <div className="sm:w-4/7 w-full flex flex-col px-6 overflow-y-auto">
                        <h2 className="text-2xl font-bold text-center p-6 pt-10">{enemy.name}</h2>
                        <div
                            className="prose dark:prose-invert text-sm"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(enemy.customDescription) }}
                        />

                    </div>
                    {/* Right column - image 2 */}
                    {enemy.imageURL2 && <img src={enemy.imageURL2} alt="Extra" className="w-full sm:w-3/14 h-40 sm:h-auto object-cover" />}

                    {/* Tags */}
                    <div className="absolute bottom-0 left-0 p-4 flex flex-col gap-2 sm:w-3/14 h-32 sm:h-auto">
                        <div className="flex flex-wrap gap-1">
                        {enemy.tags.map((tag, index) => (
                            <span key={index} className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs drop-shadow-2xl">{tag}</span>
                        ))}
                        </div>
                    </div>

                    {/* Author */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                        <span
                            className="text-sm hover:underline cursor-pointer"
                            onClick={(e) => {
                                setAboutAnchor(e.currentTarget.getBoundingClientRect());
                                setAboutOpen(true);
                            }}
                        >
                            {author?.displayName || "Unknown"}
                        </span>
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
                        <button
                            onClick={handleShare}
                            title="Поделиться"
                            className="text-gray-300 hover:scale-110 transition"
                        >
                            <LinkIcon className="w-6 h-6" />
                        </button>
                        <button
                            onClick={handlePrint}
                            title="Печать"
                            className="text-gray-300 hover:scale-110 transition"
                        >
                            <PrinterIcon className="w-6 h-6" />
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
                    {linkCopied && (
                        <div className="absolute top-10 right-10 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white text-xs px-2 py-1 rounded-md shadow">
                            Ссылка скопирована
                        </div>
                    )}

                    {/* Close button */}
                    <button onClick={close} className="absolute top-2 right-2 text-gray-300 hover:text-white cursor-pointer drop-shadow-xl">
                        <XMarkIcon className="w-6 h-6" />
                    </button>

                    {/* Navigation between cards */}
                    <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-200 dark:bg-gray-700 p-2 rounded-full cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out" onClick={onPrev}>
                        <ChevronLeftIcon className="w-5 h-5 text-gray-900 dark:text-white" />
                    </button>
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-200 dark:bg-gray-700 p-2 rounded-full cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out" onClick={onNext}>
                        <ChevronRightIcon className="w-5 h-5 text-gray-900 dark:text-white" />
                    </button>
                </div>
            </> 
        )}
    </div>
    {author && aboutOpen && aboutAnchor && (
        <AboutDialog
            user={author}
            anchor={aboutAnchor}
            onClose={() => setAboutOpen(false)}
        />
    )}
    </>
  );
};

export default EnemyDetail;
