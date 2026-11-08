/* Version 21 Firebase authentication and family invitations.
 * Uses Firebase compat SDK already loaded by index.html.
 * No email/password auth, Cloud Functions, or paid Firebase plan required.
 */
(function (global) {
  'use strict';
  const firebase = global.firebase;
  if (!firebase || !firebase.auth || !firebase.firestore) {
    throw new Error('Firebase Auth and Firestore compat SDKs must load before firebase-v21-auth.js');
  }

  const db = firebase.firestore();
  const auth = firebase.auth();
  const FieldValue = firebase.firestore.FieldValue;
  const Timestamp = firebase.firestore.Timestamp;

  function requireDad(user) {
    if (!user || user.isAnonymous || !user.providerData.some(p => p.providerId === 'google.com')) {
      throw new Error('Для этого действия нужен вход папы через Google.');
    }
  }
  function requireSon(user) {
    if (!user || !user.isAnonymous) {
      throw new Error('Для подключения сына нужен анонимный аккаунт.');
    }
  }
  function randomHex(bytes) {
    const data = new Uint8Array(bytes);
    crypto.getRandomValues(data);
    return Array.from(data, b => b.toString(16).padStart(2, '0')).join('');
  }
  function familyRef(familyId) {
    return db.collection('families').doc(familyId);
  }

  async function signInDad() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return auth.signInWithPopup(provider);
  }
  async function signInSon() {
    return auth.signInAnonymously();
  }
  async function createFamily() {
    const user = auth.currentUser;
    requireDad(user);
    const familyId = randomHex(12);
    const ref = familyRef(familyId);
    await ref.set({
      ownerUid: user.uid,
      schemaVersion: 21,
      createdAt: FieldValue.serverTimestamp()
    });
    await ref.collection('members').doc(user.uid).set({
      role: 'dad',
      joinedAt: FieldValue.serverTimestamp()
    });
    return familyId;
  }
  async function createInvitation(familyId) {
    const user = auth.currentUser;
    requireDad(user);
    const family = await familyRef(familyId).get();
    if (!family.exists || family.data().ownerUid !== user.uid) {
      throw new Error('Семья не найдена или у аккаунта нет прав папы.');
    }
    const code = randomHex(24);
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
    await familyRef(familyId).collection('invites').doc(code).set({
      familyId,
      createdBy: user.uid,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt,
      used: false
    });
    return { code, expiresAt };
  }
  async function claimInvitation(code) {
    const user = auth.currentUser;
    requireSon(user);
    if (!/^[0-9a-f]{48}$/.test(String(code || ''))) {
      throw new Error('Код приглашения имеет неверный формат.');
    }
    const inviteRef = db.collectionGroup('invites').doc; // collectionGroup is not used for writes
    const familyQuery = await db.collection('families').get();
    // Family IDs are not enumerable by clients under the security rules. The invitation
    // code is therefore entered together with the family ID shown by Dad.
    throw new Error('Для принятия приглашения передайте также идентификатор семьи.');
  }
  async function acceptInvitation(familyId, code) {
    const user = auth.currentUser;
    requireSon(user);
    if (!/^[0-9a-f]{24}$/.test(String(familyId || '')) || !/^[0-9a-f]{48}$/.test(String(code || ''))) {
      throw new Error('Проверь идентификатор семьи и код приглашения.');
    }
    const fref = familyRef(familyId);
    const inviteRef = fref.collection('invites').doc(code);
    const memberRef = fref.collection('members').doc(user.uid);
    await db.runTransaction(async tx => {
      const invite = await tx.get(inviteRef);
      if (!invite.exists) throw new Error('Приглашение не найдено.');
      const data = invite.data();
      if (data.familyId !== familyId || data.used || !data.expiresAt || data.expiresAt.toDate().getTime() <= Date.now()) {
        throw new Error('Приглашение уже использовано или срок его действия истёк.');
      }
      const member = await tx.get(memberRef);
      if (member.exists && member.data().role !== 'son') {
        throw new Error('Этот аккаунт уже имеет другой семейный профиль.');
      }
      tx.update(inviteRef, {
        used: true,
        claimedBy: user.uid,
        claimedAt: FieldValue.serverTimestamp()
      });
      tx.set(memberRef, {
        role: 'son',
        inviteId: code,
        joinedAt: FieldValue.serverTimestamp()
      });
    });
    return { familyId, role: 'son' };
  }

  global.KopilkaAuthV21 = Object.freeze({
    signInDad, signInSon, createFamily, createInvitation, acceptInvitation,
    currentUser: () => auth.currentUser,
    signOut: () => auth.signOut(),
    getMembership: async familyId => {
      const user = auth.currentUser;
      if (!user) return null;
      const snap = await familyRef(familyId).collection('members').doc(user.uid).get();
      return snap.exists ? snap.data() : null;
    }
  });
})(window);
