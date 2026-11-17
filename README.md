# To Do List

A mobile-style to-do app: tasks, lists, reminders, notes, calendar and progress, with sign up and log in.
Plain HTML, CSS and JavaScript. No build step and no libraries.

## Run it on your computer

Double-click `index.html`, or serve the folder:

```bash
cd todo-app
python3 -m http.server 8080
# then open http://localhost:8080
```

## Put it on your phone with a home screen icon

A home screen icon needs the app on a website with **https**. Any free static host works. Two easy ways:

**Netlify (no coding, about 2 minutes)**
1. Unzip `todo-app.zip` on your computer.
2. Go to https://app.netlify.com/drop and sign in (free).
3. Drag the `todo-app` folder onto the page. Netlify gives you a link like `https://your-name.netlify.app`.

**GitHub Pages**
1. Create a new public repository on GitHub and upload everything inside `todo-app`.
2. Repository **Settings → Pages →** Source: *Deploy from a branch*, Branch: `main`, folder `/ (root)`, then **Save**.
3. After a minute your link is `https://<your-username>.github.io/<repo-name>/`.

**Then on the phone**
- **Android (Chrome):** open the link and tap **Install app on this phone** on the welcome screen,
  or Chrome menu **⋮ → Install app / Add to Home screen**.
- **iPhone (Safari):** open the link, tap **Share → Add to Home Screen**.

The icon opens the app full screen without the browser bar, and it also works offline.
On phones, Home also shows an **Add the app to your phone** banner with an **Add** button (hide it with ✕ for 7 days).

## GitHub Pages with your own domain (todo.primeznews.com)

This folder is ready for GitHub Pages: `CNAME` holds the domain and `.nojekyll` makes GitHub serve every file as-is.

1. Upload **everything inside this folder** (including `CNAME` and `.nojekyll`) to the root of the repository.
2. At your domain's DNS provider add a **CNAME** record: name `todo`, value `<your-github-username>.github.io`.
   If you use Cloudflare, set it to **DNS only** (grey cloud), not Proxied.
3. Repository **Settings → Pages**: Custom domain `todo.primeznews.com` → **Save**. Wait until it shows
   "DNS check successful". If the certificate seems stuck, remove the domain, save, and add it again.
4. When the certificate is ready (a few minutes, up to 24 hours), tick **Enforce HTTPS**.

Until step 4 is done, the browser shows a certificate warning, and the app can't work offline or be installed.

## Staying logged in

- Sign up once. **Keep me logged in** is on by default, so opening the app from the icon goes straight to Home.
- Turn it off in **Settings → App → Stay logged in** if you want the password every time.
- **Log out** turns it off until you log in again with the box ticked.

## Folder structure

```
todo-app/
├── index.html          App shell: markup, icon sprite, script tags
├── manifest.json       Install info (name, colors, icon) for Add to Home screen
├── sw.js               Service worker: caches files so the app opens offline
├── icons/
│   ├── logo.png        Logo used on Welcome, Login, Sign up and in the menu
│   ├── favicon.png     Browser tab icon
│   ├── icon-192.png    App icon (Add to Home screen)
│   ├── icon-512.png    App icon, large
│   └── icon-maskable-512.png  App icon with safe padding for Android
├── css/
│   └── styles.css      All styles: light/dark theme, layout, components
└── js/                 Loaded in this order (see index.html)
    ├── utils.js        Small helpers: DOM, dates, time formatting, repeat rules
    ├── state.js        App state, default lists/settings, sample data
    ├── storage.js      Saving to the browser (localStorage)
    ├── sync.js         Cloud sync when running inside Claude (falls back to the browser)
    ├── actions.js      Save/delete tasks and notes, complete/repeat, confetti
    ├── auth.js         Welcome, sign up, log in, forgot/change password, sessions
    ├── quick-add.js    Understands "Pay bills tomorrow 6pm !high #Work every month"
    ├── reminders.js    Reminder checks, sounds, vibration, day summary
    ├── dictation.js    Voice input (inside Claude only)
    ├── toasts.js       Pop-up messages with Undo / Snooze
    ├── theme.js        Light / dark / system theme
    ├── derived.js      Sorting, grouping (Overdue, Today, Upcoming…)
    ├── render.js       Draws the drawer, top bar, home (tabs), notes, calendar, progress, settings
    ├── dialogs.js      Bottom sheets: task, list, note, profile, password, day summary
    ├── backup.js       Export JSON/CSV and restore
    ├── router.js       Bottom navigation and #page links
    ├── events.js       Clicks, keyboard shortcuts, forms, swipe gestures
    └── main.js         Starts the app
```

## Where data is saved

- **Inside Claude:** synced to your Claude account and private to you.
- **Anywhere else:** saved in that browser (localStorage). Use **Settings → Backup** to copy it out,
  and **Restore** to load it on another device.

## About the log in

The account, password and "stay logged in" choice are saved with your data: in your private Claude data when used
inside Claude, or in the phone's browser storage (the app asks the browser to keep it) when installed from a website. The password is stored as a salted
SHA-256 hash, never as plain text. It works as a lock for the app, not as a server account system: there is no
backend, so accounts don't move between browsers by themselves. For real multi-user accounts, connect a backend such as
Firebase Auth or Supabase and replace the functions in `js/auth.js` and `js/sync.js`.

## Features

- Welcome, sign up and log in screens with show/hide password, "keep me logged in" and forgot password
- Home with today's summary ring, quick add and tabs: Today, Upcoming, Someday, Done
- Lists (Default, Personal, Shopping, Wishlist, Work, plus your own) with colors, sharing as text, mark all done
- Task details: list, priority, due date and time, repeat, notes, subtasks, batch add (one per line)
- Swipe right to complete, swipe left to delete, Undo on everything
- Reminders with sound, vibration and Snooze while the app is open; morning day summary
- Notes with colors, pins, checklists, photos and places (Google Maps link)
- Calendar month view and a Progress page with streak and 7-day chart
- Light and dark mode, 12/24-hour time, first day of week, keyboard shortcuts (N, /, 1–5)
