# Working on this repo

## Every time you work

In GitHub Desktop:

1. **Fetch origin**, then **Pull origin** if it appears. This gets the latest version.
2. Make your changes.
3. In the **Changes** tab, write a short summary of what you did, click **Commit to main**.
4. **Push origin**.

Commit small and often, so nobody loses work and conflicts stay small.

Command-line equivalent:
```
git pull
git add .
git commit -m "short note on what you did"
git push
```

## First time on a new computer

In GitHub Desktop: **File → Clone repository → salapa0/PerdBaan_Ai**. Or:
```
git clone https://github.com/salapa0/PerdBaan_Ai.git
```

## If you get a conflict

Two people changed the same lines. GitHub Desktop lists the files; open each one, keep the version you want, delete the `<<<<<<<`, `=======` and `>>>>>>>` marker lines, save, then commit. If it looks confusing, ask before guessing.

## Do not commit

- Passwords, keys or `.env` files
- AI model files (download them with Ollama instead)
- Large photos or videos (keep photos under 500 KB; keep recordings on a USB stick)

## Data shapes

The formats for the owner's form, the AI draft and the copy cards are in `src/data/shapes.js`. Update that file whenever you change a format.

## Marking the demo version

When the full demo works end to end, tag it so you can always get back to it:
```
git tag demo-ready
git push --tags
```
