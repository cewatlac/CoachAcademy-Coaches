# Coach Academy — Topics Portal (Static)

This repo is a **static, GitHub Pages–friendly** portal:

**Home → Track → Session → Topic** (videos/scripts/notes).

It is designed so you can:
- keep the **full curriculum structure in one JSON** file,
- add **multiple video links per sub-topic**,
- host it on **GitHub Pages** with zero backend.

## Run locally
You can open `index.html` directly.

Recommended (static server):

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Repo structure

```text
coach-academy-topics-portal/
├─ index.html                       # Home (tracks)
├─ tracks/track.html                # Track page (sessions)
├─ sessions/session.html            # Session page (topics tree)
├─ topics/topic.html                # Topic details page (videos/scripts)
├─ instructors/                     # Example extra section (like "Our Instructors")
│  ├─ index.html
│  └─ assem-amr.html
├─ data/
│  ├─ portal-data.json              # ✅ MAIN curriculum structure
│  └─ profile-data.json             # Example instructor profile data
├─ shared/
│  ├─ app.js                        # Rendering + routing + search + theme toggle
│  └─ styles.css                    # Coach Academy theme + components
├─ assets/
│  ├─ logo.png                      # Coach Academy logo
│  ├─ covers/                       # Track cover images
│  └─ instructors/                  # Instructor photos
└─ scripts/                         # (optional) Put .docx/.pdf and reference from JSON
```

## Edit content

### 1) Main curriculum structure
Edit: `data/portal-data.json`

`portal-data.json` contains an array of **tracks**.
Each track contains **sessions**.
Each session contains a tree of **topics** (topics can have children).

Minimal shape:

```json
{
  "tracks": [
    {
      "id": "cpp-foundations",
      "title": "C++ Foundations",
      "subtitle": "Intro programming + fundamentals",
      "badge": "Beginner",
      "cover": "assets/covers/cpp-foundations.jpg",
      "stats": { "sessions": 8, "totalMinutes": 890 },
      "sessionsList": [
        {
          "id": "s1",
          "title": "Introduction to Programming & Conditions",
          "hours": { "lecture": 2, "mentoring": 2, "practice": 2 },
          "topics": [
            {
              "id": "s1-t1",
              "title": "What is Programming?",
              "minutes": 10,
              "script": "scripts/01-intro/1-what-is-programming.docx",
              "notes": "",
              "videos": [
                { "title": "(optional) Intro video", "url": "https://youtu.be/..." }
              ],
              "children": [
                {
                  "id": "s1-t1-a",
                  "title": "Extra: ...",
                  "minutes": 8,
                  "videos": []
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### 2) Add video links (per sub-topic)
Inside any topic object:

```json
"videos": [
  { "title": "Install VS Code (Windows)", "url": "https://..." },
  { "title": "Install VS Code (Mac)", "url": "https://..." }
]
```

### 3) Add nested sub-topics
Inside any topic object:

```json
"children": [
  { "id": "...", "title": "Nested topic", "minutes": 10, "videos": [] }
]
```

### 4) Add scripts/materials
Put your `.docx` / `.pdf` under `scripts/` (or any folder), then reference the relative path in JSON using `script`.

## Navigation (what the portal already does)
- Home shows tracks.
- Clicking a track opens the sessions list.
- Clicking a session opens a topics tree.
- Clicking a topic opens topic details (videos/scripts/notes).

## Coach Academy theme
- Theme colors/components: `shared/styles.css`
- Theme toggle + UI rendering: `shared/app.js`

## Deploy on GitHub Pages
1) Push this repo to GitHub.
2) Repo Settings → Pages → Deploy from branch → `main` / `/ (root)`.
3) Open the provided Pages URL.
