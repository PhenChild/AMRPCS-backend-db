INSERT INTO bh.pais
(nombre, siglas, state, aud_created_at)
VALUES('ECUADOR', 'EC', 'A'::bpchar, now());
-----
-----


INSERT INTO bh.division
("idPais", nombre, nivel, state, aud_created_at)
VALUES(1, 'GUAYAS', 1, 'A'::bpchar, now());

INSERT INTO bh.division
("idPais", "idPadre", nombre, nivel, state, aud_created_at)
VALUES(1, 1, 'NARANJITO', 2, 'A'::bpchar, now());


---
---
INSERT INTO bh.estacion
(codigo, nombre, posicion, altitud, direccion, referencias, state, "idUbicacion", aud_created_at)
VALUES('EC00001', 'Estacion El Reloj',point(-19.03806,-65.24306)::geometry,1500,  'VIA LECHUGAL', 'POR UN PASO DESNIVEL', 'A'::bpchar, 2, now());

INSERT INTO bh."user"
(email, "password", nombre, apellido, telefono, "idPais", state, "role", aud_created_at)
VALUES('obs@mail', '$2y$12$u5VFrmOxhrimpCr58fWuW.QWvKntHMj5LAb7L.1ec4kmH/iH8P5r.', 'dennys', 'Lopez', '5555', 1, 'A'::bpchar, 'observer'::bh.enum_user_role, now());

INSERT INTO bh."user"
(email, "password", nombre, apellido, telefono, "idPais", state, "role", aud_created_at)
VALUES('obs.sequia@mail', '$2y$12$u5VFrmOxhrimpCr58fWuW.QWvKntHMj5LAb7L.1ec4kmH/iH8P5r.', 'josué', 'Tomalá', '5555', 1, 'A'::bpchar, 'observer'::bh.enum_user_role, now());


---
---
INSERT INTO bh.observador
(state, "idEstacion", "idUser", is_sequia, aud_created_at)
VALUES('A'::bpchar, 1, 1, false, now());

INSERT INTO bh.observador
(state, "idEstacion", "idUser", is_sequia, aud_created_at)
VALUES('A'::bpchar, 1, 2, true, now());


---
---
INSERT INTO bh.precipitacion
(fecha, valor, comentario, state, "idObservador", aud_created_at)
VALUES('2021-06-01 00:00:00-05', 40.5, 's/n', 'A'::bpchar, 1, now());

INSERT INTO bh.prec_acum
(fecha_inicio, fecha_fin, valor, comentario, state, "idObservador", aud_created_at)
VALUES('2021-07-04', '2021-07-09 00:00:00-05', 43.2, '', 'A'::bpchar, 1, now());

INSERT INTO bh.cuestionario
(fecha, resp_suelo, resp_veg, resp_prec, resp_temp_prec, resp_temps, resp_gana, comentario, state, "idObservador", aud_created_at)
VALUES('2021-09-24 22:10:00-05', 4, 4, 5, 6, 5, 6, '', 'A'::bpchar, 2, now());



