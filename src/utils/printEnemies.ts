import type { Enemy, UserProfile } from "../types";

export const printEnemies = (
  enemies: Enemy[],
  authors: Record<string, UserProfile>
) => {
  const styles = `
    body { font-family: sans-serif; padding: 20px; }
    .page { page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    h1 { text-align: center; margin-bottom: 20px; }
    .images { display: flex; gap: 10px; justify-content: center; margin-bottom: 20px; }
    .desc { white-space: pre-wrap; margin-bottom: 20px; }
    .tags { margin-bottom: 20px; }
    .tags span { background: #eee; padding: 2px 4px; margin-right: 4px; border-radius: 3px; }
    .author { text-align: right; }
  `;

  const pages = enemies
    .map((enemy) => {
      const author = authors[enemy.authorUid];
      const tags = enemy.tags.map((t) => `<span>${t}</span>`).join(" ");
      const desc = enemy.customDescription
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br/>");
      return `
        <div class="page">
          <h1>${enemy.name}</h1>
          <div class="images">
            <img src="${enemy.imageURL}" />
            ${enemy.imageURL2 ? `<img src="${enemy.imageURL2}" />` : ""}
          </div>
          <div class="desc">${desc}</div>
          <div class="tags">${tags}</div>
          <div class="author">${author ? author.displayName : ""}</div>
        </div>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Print</title>
  <style>${styles}</style>
</head>
<body onload="window.print()">
${pages}
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
};
