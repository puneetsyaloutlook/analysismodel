# MANIFST documentation

Static documentation site for MANIFST: a catalogue of 236 analytical techniques and an eight-step process for choosing and running them. The name is provisional. The repository is still named `analysismodel`.

## Layout

- `data/design.md`: the design document. Its numbered sections become the process and project record pages.
- `data/schema.json`: field vocabularies, artefact types, check library, phases, stakes tiers.
- `data/catalogue.csv`: the 236 techniques (52 columns). Each row becomes a technique page.
- `data/test-*.md`: test evidence pages.
- `data/simulator.json`: the five recorded test jobs for the simulator page (gate counts, picks, stages, checks, answer basis). Regenerate it from the model working directory with `python3 build/export_simulator.py <model dir> data/simulator.json`. It needs the process scripts, which are not in this repository.
- `build/build.py`: generates `public/` from the files above.
- `build/check.py`: checks internal links, anchors, dashes, and banned words on authored pages.
- `build/assets/`: CSS and JavaScript copied to `public/assets/`.
- `public/`: the generated site. It is committed, so Vercel needs no build step.

## Refresh the site

```
pip install markdown
python3 build/build.py
python3 build/check.py
```

Preview locally with `python3 -m http.server 8000 -d public`.

When the model changes, change `data/design.md` and `data/schema.json` together, replace `data/catalogue.csv` if technique text or tags changed, then rebuild and commit `public/`.

## Deploy on Vercel

Import the repository. `vercel.json` sets the output directory to `public` and turns off the build and install commands. Fonts (Public Sans, Lora) load from Google Fonts.
