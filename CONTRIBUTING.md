# How we work together (3 people, 1 day)

## The three rules
1. **Stay in your own files.** Conflicts only happen when two people change the same lines. The owner table is in README.md.
2. **Pull before you push**, every time.
3. **Commit small and often**, about every 30-60 minutes. Do not wait until the end.

## One-time setup
1. Accept the repo invitation (email from GitHub).
2. Install Git, or GitHub Desktop (buttons instead of commands).
3. Clone: `git clone https://github.com/salapa0/PerdBaan_Ai.git`

## The loop (repeat all day)
```
git pull                     # get everyone's latest work
# ...do some work...
git add .
git commit -m "short note on what you did"
git pull                     # again, in case someone pushed meanwhile
git push
```
In GitHub Desktop: **Fetch/Pull**, then **Commit**, then **Push**.

## If you see a conflict
Git marks both versions in the file between `<<<<<<<` and `>>>>>>>`. Keep the version you want, delete the marker lines, save, then `git add .` and `git commit`. If it looks confusing, ask a teammate before you guess.

## Do not commit
- Passwords, keys or `.env` files (they are in `.gitignore`)
- Model files (download them with Ollama instead)
- Huge photos (resize demo photos first)

## Before the demo
Once everything works end to end, mark it so you can always go back:
```
git tag demo-ready
git push --tags
```
After the freeze (about hour 10), only fix bugs, do not add features.

## Agreed data shapes
Everyone codes against the shapes in `src/data/shapes.js`. Change them only after telling the team.
