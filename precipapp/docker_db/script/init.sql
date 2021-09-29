-- first install by shell: apt update && apt install postgis -y postgresql-12-postgis-3 
CREATE ROLE "bits" WITH LOGIN PASSWORD '123.456';
ALTER USER bits WITH SUPERUSER;

CREATE DATABASE "precdb"; 
\c precdb;
-- SET search_path TO bh;
CREATE EXTENSION postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--

-- Dumped from database version 13.4 (Ubuntu 13.4-1.pgdg20.04+1)
-- Dumped by pg_dump version 13.4 (Ubuntu 13.4-1.pgdg20.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: bh; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA bh;
ALTER SCHEMA bh OWNER TO bits;
SET default_tablespace = '';
SET default_table_access_method = heap;

