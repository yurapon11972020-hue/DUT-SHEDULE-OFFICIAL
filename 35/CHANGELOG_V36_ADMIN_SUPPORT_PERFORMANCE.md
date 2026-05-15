# DUT v36 — admin, support chat, performance and drag UX

## Admin
- Replaced admin header logo with the same DUT logo used on the main site.
- Removed extra helper text from the admin dashboard and user/request/export sections.
- Added lightweight auto-refresh for admin data, including support requests.

## Support chat
- The Support button now opens and closes the chat.
- Removed separate close/minimize/refresh buttons from the chat header.
- Added automatic polling for user support threads.
- Added unread admin reply badge on the Support button.
- User messages and admin replies remain saved in `data/db.json`.

## Design and performance
- Fixed select dropdown readability in dark/custom themes.
- Added safer CSS while editing design settings to reduce lag.
- Random design now randomizes all design settings and a real random accent color.
- Added draggable task animation modes: Lift, Ghost and Snap.

## Board drag and drop
- Added drag feedback, drop highlight and move animation.
- Task move is now optimistic in the UI: the card moves visually immediately, then the API saves the result.
