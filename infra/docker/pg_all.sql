--
-- PostgreSQL database cluster dump
--

\restrict f1J5Am6pVr9zOb5cMjNp8dCRCbzI3ztYv1dpyzd7MLL032MeapGbUeNeJU4UA8b

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:/tWkxafNkLxe+Kq1UcwtgA==$BawARuJeSINfe87HP+9dyAaD2uJfxm7C22l//C+RkYw=:2s9QTngsmNtUlBOjV7c5pUgStZ+5Ytrl83DBhjiXg0E=';

--
-- User Configurations
--








\unrestrict f1J5Am6pVr9zOb5cMjNp8dCRCbzI3ztYv1dpyzd7MLL032MeapGbUeNeJU4UA8b

--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

\restrict ECKqOjnVR5q8wPzfqPFYQpSGvfMuOlP5dzNxG1UySqO68g4NP8mGwKLRNjds4i1

-- Dumped from database version 17.8 (Debian 17.8-1.pgdg13+1)
-- Dumped by pg_dump version 17.8 (Debian 17.8-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict ECKqOjnVR5q8wPzfqPFYQpSGvfMuOlP5dzNxG1UySqO68g4NP8mGwKLRNjds4i1

--
-- Database "perfdb" dump
--

--
-- PostgreSQL database dump
--

\restrict U3nF8dyjdiMGa0jaXh45LBGgCk418dqLYq0METm3wL3tevbZO6irZJaXzUdj1S4

-- Dumped from database version 17.8 (Debian 17.8-1.pgdg13+1)
-- Dumped by pg_dump version 17.8 (Debian 17.8-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: perfdb; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE perfdb WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE perfdb OWNER TO postgres;

\unrestrict U3nF8dyjdiMGa0jaXh45LBGgCk418dqLYq0METm3wL3tevbZO6irZJaXzUdj1S4
\connect perfdb
\restrict U3nF8dyjdiMGa0jaXh45LBGgCk418dqLYq0METm3wL3tevbZO6irZJaXzUdj1S4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Result; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Result" (
    id text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    unique_no text,
    date timestamp(3) without time zone,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Result" OWNER TO postgres;

--
-- Name: Review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    result_id text NOT NULL,
    stage text NOT NULL,
    decision text DEFAULT 'pending'::text NOT NULL,
    comment text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Review" OWNER TO postgres;

--
-- Data for Name: Result; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Result" (id, type, title, unique_no, date, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Review" (id, result_id, stage, decision, comment, created_at) FROM stdin;
\.


--
-- Name: Result Result_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Result"
    ADD CONSTRAINT "Result_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: Review_result_id_stage_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Review_result_id_stage_idx" ON public."Review" USING btree (result_id, stage);


--
-- Name: Review Review_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_result_id_fkey" FOREIGN KEY (result_id) REFERENCES public."Result"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict U3nF8dyjdiMGa0jaXh45LBGgCk418dqLYq0METm3wL3tevbZO6irZJaXzUdj1S4

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

\restrict wkAvVy3YzWSiTAJSDHJoXWyDeHPuutbYOdnovGmsZzFmpWhcvAB726Kc9BFhclx

-- Dumped from database version 17.8 (Debian 17.8-1.pgdg13+1)
-- Dumped by pg_dump version 17.8 (Debian 17.8-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict wkAvVy3YzWSiTAJSDHJoXWyDeHPuutbYOdnovGmsZzFmpWhcvAB726Kc9BFhclx

--
-- PostgreSQL database cluster dump complete
--

