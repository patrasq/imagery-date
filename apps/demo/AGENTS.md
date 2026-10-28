# Demo

A page that runs the library in the browser; not part of the npm package. It imports the library only as
`imagery-date`, like any user (C8).

## Code Review Rules

- Flag a Google Maps Platform key, or any other credential, in the demo's code, build configuration or published
  page, and a billable provider enabled in it. Safe path: the keyless providers only; a visitor who wants Google
  dates uses the CLI or the library with their own key.
- Flag text on the page that presents the demo as a product or service. Safe path: plain labels that it is a demo of
  the library, as in `index.html`.
