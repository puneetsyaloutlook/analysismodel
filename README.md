# ANLYSIS documentation

Static documentation site for ANLYSIS: a catalogue of 236 analytical techniques and an eight-step process for choosing and running them. The site address is ANLYSIS.work. The repository is still named `analysismodel`.

## Layout

- `data/design.md`: the design document. Its numbered sections become the process and project record pages.
- `data/schema.json`: field vocabularies, requirement types, working document types, check library, stakes levels, and the rules for the eight steps. It keeps its original field names, and section 8 of the design document maps them to the names used on the site.
- `data/catalogue.csv`: the 236 techniques (52 columns). Each row becomes a technique page.
- `data/test-*.md`: test evidence pages. They were written under version 1.1 and use its terms.
- `data/run.json` and `data/run1/`: the stored run of 11 November 2026 that the simulator replays. `run1/` contains the inputs and each technique's result. `build/export_run.py` rebuilds `run.json` from `run1/`. It needs the process scripts, which are not in this repository.
- `data/simulator.json` and `build/export_simulator.py`: five earlier recorded test jobs. The site no longer uses them, because they contain no technique results.
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

When the design changes, change `data/design.md` and `data/schema.json` first and together. The site and the simulator are generated from them, so do not change step names or rules in the site code alone. Then replace `data/catalogue.csv` if technique text or tags changed, then rebuild and commit `public/`.

## Deploy on Vercel

Import the repository. `vercel.json` sets the output directory to `public` and turns off the build and install commands. Fonts (Public Sans, Lora) load from Google Fonts.
