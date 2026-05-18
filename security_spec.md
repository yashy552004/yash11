# Security Specification for MediQuick

## Data Invariants
1. A user profile must match the `request.auth.uid`.
2. An order must have a valid `userId` matching the authenticated user (unless pharmacist/admin).
3. Medicines can only be updated by admins or pharmacists (inventory management).
4. Messages must belong to a `chatId` where the user is a participant.
5. Reminders must be owned by the user.

## The "Dirty Dozen" Payloads (Deny Cases)
1. **Identity Spoofing**: User A trying to update User B's profile.
2. **Role Escalation**: Patient trying to set their role to 'admin'.
3. **Ghost Order**: User A trying to view User B's order history.
4. **Unauthorized Medicine Edit**: Patient trying to change the price of a medicine.
5. **Chat Eavesdropping**: User C trying to read messages in a chat between User A and Pharmacist B.
6. **Fake Prescription**: Patient trying to confirm an order without a prescription URL for restricted medicine.
7. **Negative Price**: Admin (by mistake) or attacker trying to set medicine price < 0.
8. **Orphaned Message**: Creating a message in a chat ID that doesn't exist.
9. **Tampering with Stock**: User trying to manually decrement stock without an official order confirmation.
10. **Duplicate Reminder**: (Soft deny) Logic for avoiding multiple identical reminders.
11. **Spoofed Timestamp**: User trying to set `createdAt` in the past.
12. **Unauthorized Deletion**: Patient trying to delete a confirmed order.

## Access Groups
- **Patient**: Can manage own profile, orders, reminders, and chat with pharmacists.
- **Pharmacist**: Can manage inventory, confirm orders, and chat with patients.
- **Admin**: Full access.
