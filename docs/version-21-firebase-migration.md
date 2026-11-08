# Version 21 — Firebase migration

Status: implementation is committed to the isolated branch `v21-firebase-migration`. A preview-only copy has also been added to `main` under `preview-v21/`; the production root `index.html` was not changed. The preview files are in `main` under `preview-v21/`; expected URL: `https://dvk11111-pixel.github.io/kopilka/preview-v21/` (I could not independently verify that Pages has finished serving the path). The preview uses separate local-storage keys and a named Firebase app; create a new test family there. It uses the same Firebase project, but a different family record. The user confirmed that the Firestore rules were published in Firebase Console.

## Implemented in this branch

- Firebase client configuration now targets `kopilka-prizov-family`.
- Dad authentication uses Google sign-in.
- Son authentication uses Firebase Anonymous Authentication.
- Dad creates a family with the existing human-readable ID format (`K` plus 10 characters).
- Dad creates a one-time 48-character invitation, valid for 24 hours.
- Son membership is created only in the same transaction that consumes a valid invitation.
- Dad can issue a fresh invitation from the Dad cloud panel.
- Legacy email/password registration and the insecure “join by family ID only” flow have been removed from the login UI.
- The existing production snapshot remains Dad-write-only. The test snapshot is Dad-only.
- Son progress is synchronized separately in `families/{familyId}/sonState/main`.
- Son writes are restricted by rules to a fixed allowlist of game progress, tickets, wins, requests, and acknowledgement events. Dad-owned subjects and weekly reward markers are not Son-writable.
- Ticket IDs are unique across devices. Son sends explicit ticket-spend, reward-collection, money-collection, and cashout events; Dad processes them idempotently into the authoritative snapshot.
- Parent decisions on homework and prize requests win during merges, so an old Son copy cannot revert Dad's confirmation/rejection.
- Dad receives the Son progress document and folds the reported progress into the authoritative production snapshot.

## Data trust boundary (free Firebase plan)

The Son progress document is client-reported. Firestore Security Rules can restrict which fields the Son writes, but cannot prove that a browser game was honestly completed. Therefore ticket awards and game results remain client-trusted and can be forged by a modified client. Money balance, payout counters, prize catalog, family ownership, invitation issuance, and Dad decisions remain Dad-only.

For server-verified game rewards, a trusted backend (for example Cloud Functions on a billable Firebase plan) is required. This branch does not claim server-verified rewards.

## Required Firebase console setup

In project `kopilka-prizov-family`:
1. Enable Google provider in Authentication.
2. Enable Anonymous provider in Authentication.
3. Add the GitHub Pages domain to Authorized domains.
4. The user previously confirmed publishing the rules. The rules file has since been updated to allow the new Son acknowledgement fields; **publish the current `firestore.rules` again before testing Version 21**.
5. Do not enable billing or deploy Cloud Functions for this free-plan version.

## Migration and data safety

- The first family creation copies the current browser's local app state into the new production snapshot.
- Existing data in the old Firebase project `kopilka-bc12a` is not automatically copied.
- Do not clear browser storage or the old Firebase project until the new family has been created and verified on both devices.
- Existing local family IDs from the old system are not automatically enrolled as new Google/Anonymous members; create the new family from the device that contains the up-to-date local data.

## Validation status and limitations

- GitHub Actions static checks passed: both Firebase helper files pass `node --check`, inline scripts parse, and the Son payload keys match the Firestore rules allowlist.
- No Firebase Emulator or live Firestore Rules simulation has been run in this environment.
- The user confirmed that the rules were published, but their live deployed contents have not been independently inspected here.
- End-to-end Google sign-in, anonymous sign-in, invitation consumption, cross-device sync, offline/reconnect behavior, and test-mode isolation have not yet been verified on real devices.
- Keep the v21 pull request unmerged until those checks pass. The preview-only page on `main` is not the production app.
