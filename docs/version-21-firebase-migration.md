# Version 21 — Firebase migration plan

Status: isolated working branch; not deployed.

## Current source audit

- The app initializes Firebase project `kopilka-bc12a`; target project is `kopilka-prizov-family`.
- The UI still exposes Email/Password registration and sign-in.
- Family membership is currently created by any authenticated user who knows a family document ID. The current Firestore rules permit this and therefore do not safely bind a Son account to an invitation.
- The complete game/economy state is stored as one `payload` object in `families/{familyId}/spaces/{space}/state/main`.
- Both Dad and Son can currently write that entire document. UI role hiding is not a security boundary: a modified client could change prizes, ticket balances, money, approvals, or requests.
- Dad's local password is stored as a client-side SHA-256 hash in localStorage. It cannot securely authorize Dad privileges in Firestore.
- Test space is a separate document path, but its security relies on the same role model and must be preserved during migration.

## Required target behavior

1. Dad signs in with Google. The authenticated Firebase UID is the sole authority for Dad privileges.
2. Son signs in anonymously. Son receives access only after accepting a high-entropy, single-use family invitation created by Dad. Anonymous auth on two devices creates different UIDs; it does not link them automatically.
3. A Son account must never be able to grant itself Dad membership or change family ownership.
4. Dad can switch the UI to a Son preview on Dad's device without signing out. Preview must use a separate `test` data space and must never write to `production`.
5. A Dad password stored or checked only in browser code/localStorage is not secure. If Dad needs admin access on the Son device, require Dad's Google sign-in there; do not treat a local PIN as authorization.
6. No paid Cloud Functions or custom-token service is assumed (Firebase Spark plan).

## Mandatory data separation before secure Firestore rules

The current monolithic state document cannot safely support Dad/Son permissions. Split it into independently authorized records, for example:

- `families/{familyId}`: owner UID and schema metadata; Dad-only writes.
- `families/{familyId}/members/{uid}`: membership role; only owner/Dad may create or change roles, except a narrowly validated invitation acceptance.
- `families/{familyId}/invites/{inviteId}`: random, expiring, single-use invitation; Dad creates/revokes. Acceptance must atomically consume it and create a Son membership.
- `families/{familyId}/catalog/{prizeId}`: Dad-only catalog writes; Son read-only.
- `families/{familyId}/accounts/son`: balances and game progress. Son may update only explicitly allowed progress/claim fields; Dad may administer awards. Validate field sets and value transitions in rules.
- `families/{familyId}/requests/{requestId}`: Son may create requests and read own family queue; only Dad may approve/reject.
- `families/{familyId}/spaces/test/**`: Dad-only read/write, separate from production.

Exact collection design and rule predicates must be finalized together with the client migration. Do not enable broad Son writes to a shared state document.

## Migration and release gates

- Preserve and migrate the existing local state without overwriting either device's data.
- Implement Google sign-in and anonymous sign-in; remove Email/Password UI.
- Implement Dad-created single-use invitation acceptance for Son.
- Implement separate production/test stores and Dad-only preview switching.
- Add Firestore rules that deny by default and enforce the split above.
- Test unauthenticated access, arbitrary anonymous users, invite replay, role escalation, Son attempts to edit catalog/balances/approvals, Dad test writes, and Son production gameplay.
- Run syntax/static checks and verify the built files before opening a release PR.
- Do not merge or publish until the owner reviews the release.

## Important limitation

Do not deploy the current rules or a client-only role/password workaround as a security fix. The current data model gives both roles write access to one unrestricted payload; changing only the sign-in buttons would leave the family's tickets and money vulnerable.
