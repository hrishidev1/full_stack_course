# Exercise 0.6: New note in SPA

```mermaid
sequenceDiagram
    participant browser
    participant server

    Note right of browser: User enters a new note and submits the form

    browser->>browser: JavaScript prevents default form submission
    browser->>browser: JavaScript adds the note to the notes list
    browser->>browser: JavaScript redraws the notes

    browser->>server: POST https://studies.cs.helsinki.fi/exampleapp/new_note_spa
    Note right of browser: Note is sent as JSON
    server-->>browser: 201 Created

    Note right of browser: Page remains unchanged