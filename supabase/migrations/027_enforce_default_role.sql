-- Prevent users from setting role to 'admin' via client
-- Default role is 'brand' for new signups
-- Only existing admins can promote other users to admin

CREATE OR REPLACE FUNCTION enforce_signup_role()
RETURNS TRIGGER AS $$
BEGIN
  -- On INSERT, if role is 'admin', force it to 'brand'
  -- Admin role can only be set by a database admin directly
  IF TG_OP = 'INSERT' AND NEW.role = 'admin' THEN
    NEW.role := 'brand';
  END IF;

  -- On UPDATE, prevent non-admin from changing role to 'admin'
  IF TG_OP = 'UPDATE' AND NEW.role = 'admin' AND OLD.role != 'admin' THEN
    NEW.role := OLD.role;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_signup_role_trigger ON profiles;
CREATE TRIGGER enforce_signup_role_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION enforce_signup_role();
