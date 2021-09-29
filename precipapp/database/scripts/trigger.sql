SET search_path TO bh;
create or replace function update_calc_column()
  returns trigger
as
$$
begin
  new.total := (new.resp_suelo + new.resp_veg + new.resp_prec + new.resp_temp_prec + new.resp_temps + new.resp_gana - 25) * 0.25;
  return new;
end;
$$
language plpgsql;


create trigger calc_trigger 
   before insert or update on cuestionario
   for each row
   execute procedure update_calc_column();