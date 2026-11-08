# Version 21 — Firebase migration

Status: implementation committed to the isolated branch `v21-firebase-migration`. It is not deployed to GitHub Pages, and Firestore rules have not been published to Firebase.

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
- Son writes are restricted by rules to a fixed allowlist of game progress, tickets, wins, and user-submitted requests. Son cannot write prize catalog, money balance, payout counters, or Dad approvals.
- Dad receives the Son progress document and folds the reported progress into the authoritative production snapshot.

## Data trust boundary (free Firebase plan)

The Son progress document is client-reported. Firestore Security Rules can restrict which fields the Son writes, but cannot prove that a browser game was honestly completed. Therefore ticket awards and game results remain client-trusted and can be forged by a modified client. Money balance, payout counters, prize catalog, family ownership, invitation issuance, and Dad decisions remain Dad-only.

For server-verified game rewards, a trusted backend (for example Cloud Functions on a billable Firebase plan) is required. This branch does not claim server-verified rewards.

## Required Firebase console setup

In project `kopilka-prizov-family`:
1. Enable Google provider in Authentication.
2. Enable Anonymous provider in Authentication.
3. Add the GitHub Pages domain to Authorized domains.
4. Publish the repository's `firestore.rules` in Firestore Rules.
5. Do not enable billing or deploy Cloud Functions for this free-plan version.

## Migration and data safety

- The first family creation copies the current browser's local app state into the new production snapshot.
- Existing data in the old Firebase project `kopilka-bc12a` is not automatically copied.
- Do not clear browser storage or the old Firebase project until the new family has been created and verified on both devices.
- Existing local family IDs from the old system are not automatically enrolled as new Google/Anonymous members; create the new family from the device that contains the up-to-date local data.

## Validation status and limitations

- Source-level integration has been reviewed.
- No Firebase Emulator or live Firestore Rules simulation has been run in this environment.
- Rules have not been deployed to the Firebase project.
- End-to-end Google sign-in, anonymous sign-in, invitation consumption, cross-device sync, offline/reconnect behavior, and test-mode isolation still require live testing after publishing the rules.
- Do not merge or publish this branch until those checks pass.
