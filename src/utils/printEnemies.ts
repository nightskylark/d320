import type { Enemy, UserProfile } from "../types";

export const printEnemies = (
  enemies: Enemy[],
  authors: Record<string, UserProfile>
) => {
  const styles = `
    @page { size: A4 landscape; margin: 1cm; }
    body { font-family: sans-serif; padding: 0; font-size: 14px; }
    .page { display: flex; align-items: stretch; page-break-after: always; height: calc(100vh - 2cm); }
    .page:last-child { page-break-after: auto; }
    .side { width: 20%; overflow: hidden; }
    .side img { width: 100%; height: 100%; object-fit: cover; object-position: center; }
    .content { width: 60%; padding: 0 10px; box-sizing: border-box; }
    h1 { text-align: center; margin: 0 0 10px; }
    .desc { white-space: pre-wrap; margin-bottom: 10px; }
    .tags { margin-bottom: 10px; }
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
          <div class="side">${enemy.imageURL ? `<img src="${enemy.imageURL}" />` : ''}</div>
          <div class="content">
            <h1>${enemy.name}</h1>
            <div class="desc">${desc}</div>
            <div class="tags">${tags}</div>
            <div class="author">${author ? author.displayName : ''}</div>
          </div>
          <div class="side">${enemy.imageURL2 ? `<img src="${enemy.imageURL2}" />` : ''}</div>
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
