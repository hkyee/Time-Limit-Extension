# A productivity tool to restrict time spent on certain websites

## Features:
- User controlled domains
- User controlled time allowance on each domain
- Time spent is reset every day at midnight


Issues:
- When a user removes the limit, the sites should be reset
- When a user enters a new website, the sites should be reset

Fixes:
- Add || {}
- Change starttime to be stored in chrome

Cases:
- When user enters a limit on site A, while already on site A
