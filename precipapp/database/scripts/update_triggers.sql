CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.aud_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER set_timestamp
BEFORE UPDATE ON bh.cuestionario
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();



CREATE TRIGGER set_timestamp
BEFORE UPDATE ON bh.division 
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();



CREATE TRIGGER set_timestamp
BEFORE UPDATE ON bh.estacion 
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();



CREATE TRIGGER set_timestamp
BEFORE UPDATE ON bh.foto 
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();



CREATE TRIGGER set_timestamp
BEFORE UPDATE ON bh.observador 
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();



CREATE TRIGGER set_timestamp
BEFORE UPDATE ON bh.pais 
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();



CREATE TRIGGER set_timestamp
BEFORE UPDATE ON bh.prec_acum 
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();



CREATE TRIGGER set_timestamp
BEFORE UPDATE ON bh.precipitacion 
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();



CREATE TRIGGER set_timestamp
BEFORE UPDATE ON bh."user" 
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
