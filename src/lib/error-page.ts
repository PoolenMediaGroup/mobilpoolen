// Felsidan skickas utan sajtens stilmall, så färgerna måste stå här. De är
// samma värden som tokens i styles.css: --background, --foreground,
// --muted-foreground, --primary och --input-border.
export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="sv">
  <head>
    <meta charset="utf-8" />
    <title>Något gick fel | Mobilpoolen</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #f3f6f9; color: #0e1b2c; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4a586b; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { display: inline-flex; align-items: center; min-height: 44px; padding: 0 1rem; border-radius: 0.75rem; font: inherit; font-weight: 600; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #3b28cc; color: #fff; }
      .secondary { background: #fff; color: #0e1b2c; border-color: #7f8ca0; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Något gick fel</h1>
      <p>Sidan kunde inte laddas. Försök igen om en stund, gå till startsidan eller kontakta oss om felet finns kvar.</p>
      <div class="actions">
        <button type="button" class="primary" onclick="location.reload()">Försök igen</button>
        <a class="secondary" href="/">Till startsidan</a>
        <a class="secondary" href="/kontakt">Kontakta oss</a>
      </div>
    </div>
  </body>
</html>`;
}
