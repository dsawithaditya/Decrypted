<<<<<<< HEAD
# Mess Queue Manager: Team Decrypted (SE-302A)

A smart, rule-based queue manager for the Jain University canteen mess.

## Pages
- `index.html`: project overview, rules, algorithm, flowchart, team
- `student.html`: live best counter, crowd %, and wait time (open with the QR code)
- `staff.html`: PIN-protected console (default PIN **1234**)
- `tests.html`: runs test cases T1–T9

## Run locally
Open the folder in VS Code and use the **Live Server** extension, or run:
    python -m http.server 8000
then visit http://localhost:8000

## Demo
1. Open `staff.html` in one tab and `student.html` in another.
2. In the staff console, switch to **Simulation**.
3. Watch the alerts at 45%, the standby opening at 50%, cross access above 80%, and closing below 40%.

## Live sync across phones (Firebase)
Local mode syncs only tabs on the same device. To sync every phone:
1. Create a Firebase project and add a Realtime Database.
2. Paste your config into `FIREBASE_CONFIG` in `js/firebase.js`.
3. Add security rules so only staff can write.

## Host for free
Push to GitHub, then go to Settings → Pages → Deploy from branch `main`.
Open the staff page, then print the QR code it generates.
=======
# Decrypted
 A smart, rule-based queue manager for the Jain University canteen mess.
>>>>>>> 2de5d46658a970b10abbece211684a514e65f2be
