# To Do List

A mobile-style to-do app: tasks, lists, reminders, notes, calendar and progress, with sign up and log in.
Plain HTML, CSS and JavaScript. No build step and no libraries.

## Run it

**Easiest:** double-click `index.html` to open it in a browser.

**Recommended (enables offline mode and "Install app"):** serve the folder with any web server, for example:

```bash
cd todo-app
python3 -m http.server 8080
# then open http://localhost:8080
```

To put it online, upload the whole folder to any static host (GitHub Pages, Netlify, Vercel, Firebase Hosting).
Over HTTPS, phones can use **Add to Home screen** to install it like an app.

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

The account and password are kept on the device or in your private Claude data. The password is stored as a salted
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
