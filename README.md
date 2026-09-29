# Sharon Agency Growth Demos

Standalone web project based on the 90-day growth proposal for Sharon's life insurance business. This folder is its own git repository and is intended to be published as its own GitHub repository and GitHub Pages site.

## Included demos

- Campaign overview dashboard
- Focused consultation landing page
- Inquiry capture form
- Follow-up and booking pipeline
- Performance scorecard and conversion funnel
- Educational content calendar
- Interactive prospect presentation slideshow

## Run locally

This is a static HTML/CSS/JavaScript project. You can open `index.html` directly or run a local server:

```bash
python -m http.server 5177
```

Then open:

```text
http://127.0.0.1:5177
```

Presentation route:

```text
http://127.0.0.1:5177/presentation.html
```

## Deployment

This project is ready for GitHub Pages.

1. Create a new GitHub repository for this project.
2. Push this folder's `main` branch to that repository.
3. In the repository settings, set Pages to use GitHub Actions.
4. The included workflow publishes the static site after every push to `main`.

No backend, database, or external service is required for the current demo.
