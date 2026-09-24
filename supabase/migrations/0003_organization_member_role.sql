-- Kept separate: PostgreSQL must commit a new enum value before it is used.
-- Existing specialised roles and memberships remain unchanged.
alter type public.organization_role add value if not exists 'MEMBER';
