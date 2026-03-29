BEGIN;

-- When a brand name changes, update it in partnerships
CREATE OR REPLACE FUNCTION sync_brand_name()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    UPDATE partnerships SET brand_name = NEW.name WHERE brand_id = NEW.id;
    UPDATE marketplace_opportunities SET brand_name = NEW.name WHERE brand_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_brand_name ON brands;
CREATE TRIGGER trg_sync_brand_name
  AFTER UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION sync_brand_name();

-- When a talent name changes, update it in partnerships
CREATE OR REPLACE FUNCTION sync_talent_name()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    UPDATE partnerships SET talent_name = NEW.name WHERE talent_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_talent_name ON talents;
CREATE TRIGGER trg_sync_talent_name
  AFTER UPDATE ON talents
  FOR EACH ROW EXECUTE FUNCTION sync_talent_name();

COMMIT;
