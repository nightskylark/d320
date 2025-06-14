import { useRef, useState } from "react";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { StarIcon as StarSolid, PencilIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useFixedTags } from "../contexts/TagContext";
import type { Enemy, UserProfile } from "../types";
import LoginPrompt from "./LoginPrompt";

interface Props {
  index: number;
  enemy: Enemy;
  author?: UserProfile;
  onClick: (idx: number) => void;
}
const EnemyCard: React.FC<Props> = ({ index, enemy, author, onClick }) => {
    const cardRef = useRef<HTMLDivElement | null>(null);
    const user = useAuth();
    const fixedTags = useFixedTags();
    const [loginPrompt, setLoginPrompt] = useState(false);

    const liked = !!user && enemy.likedBy?.includes(user.uid);

    const toggleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user || !enemy.id) {
            setLoginPrompt(true);
            return;
        }
        const ref = doc(db, "eotv-enemies", enemy.id);
        await updateDoc(ref, {
            likedBy: liked ? arrayRemove(user.uid) : arrayUnion(user.uid)
        });
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
        className={`bg-white text-gray-900 dark:bg-gray-800 dark:text-white shadow-lg cursor-pointer  overflow-hidden relative w-full sm:w-40 sm:h-56 aspect-[2/3] hover:scale-110 flex flex-col rounded-xl transition-all duration-300 ease-in-out`}
        onClick={() => onClick(index)}
    >
        {enemy.draft && (
            <PencilIcon
                className="w-5 h-5 absolute top-2 left-2 text-sky-500 dark:text-sky-300 drop-shadow-[0_0_2px_#333]"
                title="Черновик"
            />
        )}
        {/* 1st image */}
        <img
          src={enemy.imageURL || "/eotv-enemy-placeholder.png"}
          alt={enemy.name}
          className="w-full h-1/2 sm:h-32 object-cover"
        />

        <button
            onClick={toggleLike}
            title={liked ? 'Сохранено' : 'Сохранить'}
            className="absolute top-2 right-2 text-sky-500 dark:text-sky-300 drop-shadow-[0_0_2px_#333] hover:scale-110 transition"
        >
            {liked ? <StarSolid className="w-5 h-5" /> : <StarOutline className="w-5 h-5" />}
        </button>

        <div className="p-2 flex flex-col">
            {/* Name */}
            <p className="h-10 flex items-center justify-center text-center overflow-hidden">
                <span className="line-clamp-2 leading-snug">{enemy.name}</span>
            </p>
            {/* <p className="flex text-sm font-bold h-10 text-ellipsis justify-center items-center text-center whitespace-nowrap">{enemy.name}</p> */}

            {/* Tags */}
            <div className="absolute bottom-4 left-4 flex flex-col items-end gap-2">
                <div className="flex flex-wrap gap-1">
                {enemy.tags.filter(tag => fixedTags.includes(tag)).map((tag, index) => (
                    <span key={index} className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs drop-shadow-2xl">{tag}</span>
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
    </>
  );
};

export default EnemyCard;
