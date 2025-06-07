import { useEffect, useRef, useLayoutEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import MarkdownIt from "markdown-it";
import type { UserProfile } from "../types";

interface Props {
  user: UserProfile;
  anchor: DOMRect;
  onClose: () => void;
}

const AboutDialog: React.FC<Props> = ({ user, anchor, onClose }) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: anchor.top,
    left: anchor.left,
  });
  const mdRef = useRef(new MarkdownIt({ linkify: true, breaks: true }));
  useEffect(() => {
    const md = mdRef.current;
    const defaultRender =
      md.renderer.rules.link_open ||
      ((
        tokens: unknown,
        idx: number,
        options: unknown,
        env: unknown,
        self: unknown,
      ) =>
        (self as { renderToken: (t: unknown, i: number, o: unknown) => string }).renderToken(
          tokens,
          idx,
          options,
        ));
    md.renderer.rules.link_open = (
      tokens: unknown,
      idx: number,
      options: unknown,
      env: unknown,
      self: unknown,
    ) => {
      const t = tokens as Record<number, { attrPush: (attr: string[]) => void }>;
      t[idx].attrPush(["target", "_blank"]);
      t[idx].attrPush(["rel", "noopener noreferrer"]);
      return defaultRender(tokens, idx, options, env, self);
    };
  }, []);

  useLayoutEffect(() => {
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      const top = Math.max(0, anchor.top - rect.height - 4);
      setPosition({ top, left: anchor.left });
    }
  }, [anchor]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      className="fixed z-50 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-4 shadow-lg"
      style={{ top: position.top, left: position.left }}
    >
      <button
        onClick={onClose}
        className="absolute top-1 right-1 text-gray-400 hover:text-gray-700"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
      <h3 className="text-sm font-bold mb-2">{user.displayName}</h3>
      <div
        className="text-xs max-w-xs whitespace-pre-line [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:underline"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: mdRef.current.render(user.about || "") }}
      />
    </div>
  );
};

export default AboutDialog;
