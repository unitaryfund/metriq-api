--
-- PostgreSQL database dump
--

-- Dumped from database version 13.5 (Ubuntu 13.5-2.pgdg20.04+1)
-- Dumped by pg_dump version 13.5 (Ubuntu 13.5-2.pgdg20.04+1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: likes; Type: TABLE; Schema: public; Owner: metriq
--

CREATE TABLE public.likes (
    id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer NOT NULL,
    "submissionId" integer NOT NULL
);


ALTER TABLE public.likes OWNER TO metriq;

--
-- Name: likes_id_seq; Type: SEQUENCE; Schema: public; Owner: metriq
--

CREATE SEQUENCE public.likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.likes_id_seq OWNER TO metriq;

--
-- Name: likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metriq
--

ALTER SEQUENCE public.likes_id_seq OWNED BY public.likes.id;


--
-- Name: methods; Type: TABLE; Schema: public; Owner: metriq
--

CREATE TABLE public.methods (
    id integer NOT NULL,
    name text NOT NULL,
    "fullName" text NOT NULL,
    description text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer NOT NULL
);


ALTER TABLE public.methods OWNER TO metriq;

--
-- Name: methods_id_seq; Type: SEQUENCE; Schema: public; Owner: metriq
--

CREATE SEQUENCE public.methods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.methods_id_seq OWNER TO metriq;

--
-- Name: methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metriq
--

ALTER SEQUENCE public.methods_id_seq OWNED BY public.methods.id;


--
-- Name: moderationReports; Type: TABLE; Schema: public; Owner: metriq
--

CREATE TABLE public."moderationReports" (
    id integer NOT NULL,
    description text NOT NULL,
    "resolvedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer NOT NULL,
    "submissionId" integer NOT NULL
);


ALTER TABLE public."moderationReports" OWNER TO metriq;

--
-- Name: moderationReports_id_seq; Type: SEQUENCE; Schema: public; Owner: metriq
--

CREATE SEQUENCE public."moderationReports_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."moderationReports_id_seq" OWNER TO metriq;

--
-- Name: moderationReports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metriq
--

ALTER SEQUENCE public."moderationReports_id_seq" OWNED BY public."moderationReports".id;


--
-- Name: results; Type: TABLE; Schema: public; Owner: metriq
--

CREATE TABLE public.results (
    id integer NOT NULL,
    "isHigherBetter" boolean NOT NULL,
    "metricName" text NOT NULL,
    "metricValue" double precision NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone,
    "userId" integer NOT NULL,
    "submissionMethodRefId" integer NOT NULL,
    "submissionTaskRefId" integer NOT NULL,
    "evaluatedAt" date,
    notes text NOT NULL
);


ALTER TABLE public.results OWNER TO metriq;

--
-- Name: results_id_seq; Type: SEQUENCE; Schema: public; Owner: metriq
--

CREATE SEQUENCE public.results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.results_id_seq OWNER TO metriq;

--
-- Name: results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metriq
--

ALTER SEQUENCE public.results_id_seq OWNED BY public.results.id;


--
-- Name: submissionMethodRefs; Type: TABLE; Schema: public; Owner: metriq
--

CREATE TABLE public."submissionMethodRefs" (
    id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone,
    "userId" integer NOT NULL,
    "submissionId" integer NOT NULL,
    "methodId" integer NOT NULL
);


ALTER TABLE public."submissionMethodRefs" OWNER TO metriq;

--
-- Name: submissionMethodRefs_id_seq; Type: SEQUENCE; Schema: public; Owner: metriq
--

CREATE SEQUENCE public."submissionMethodRefs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."submissionMethodRefs_id_seq" OWNER TO metriq;

--
-- Name: submissionMethodRefs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metriq
--

ALTER SEQUENCE public."submissionMethodRefs_id_seq" OWNED BY public."submissionMethodRefs".id;


--
-- Name: submissionTagRefs; Type: TABLE; Schema: public; Owner: metriq
--

CREATE TABLE public."submissionTagRefs" (
    id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone,
    "userId" integer NOT NULL,
    "submissionId" integer NOT NULL,
    "tagId" integer NOT NULL
);


ALTER TABLE public."submissionTagRefs" OWNER TO metriq;

--
-- Name: submissionTagRefs_id_seq; Type: SEQUENCE; Schema: public; Owner: metriq
--

CREATE SEQUENCE public."submissionTagRefs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."submissionTagRefs_id_seq" OWNER TO metriq;

--
-- Name: submissionTagRefs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metriq
--

ALTER SEQUENCE public."submissionTagRefs_id_seq" OWNED BY public."submissionTagRefs".id;


--
-- Name: submissionTaskRefs; Type: TABLE; Schema: public; Owner: metriq
--

CREATE TABLE public."submissionTaskRefs" (
    id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone,
    "userId" integer NOT NULL,
    "submissionId" integer NOT NULL,
    "taskId" integer NOT NULL
);


ALTER TABLE public."submissionTaskRefs" OWNER TO metriq;

--
-- Name: submissionTaskRefs_id_seq; Type: SEQUENCE; Schema: public; Owner: metriq
--

CREATE SEQUENCE public."submissionTaskRefs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."submissionTaskRefs_id_seq" OWNER TO metriq;

--
-- Name: submissionTaskRefs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metriq
--

ALTER SEQUENCE public."submissionTaskRefs_id_seq" OWNED BY public."submissionTaskRefs".id;


--
-- Name: submissions; Type: TABLE; Schema: public; Owner: metriq
--

CREATE TABLE public.submissions (
    id integer NOT NULL,
    name text NOT NULL,
    "nameNormal" text NOT NULL,
    description text NOT NULL,
    "contentUrl" text NOT NULL,
    "thumbnailUrl" text,
    "approvedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer NOT NULL,
    "deletedAt" timestamp with time zone
);


ALTER TABLE public.submissions OWNER TO metriq;

--
-- Name: submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: metriq
--

CREATE SEQUENCE public.submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.submissions_id_seq OWNER TO metriq;

--
-- Name: submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metriq
--

ALTER SEQUENCE public.submissions_id_seq OWNED BY public.submissions.id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: metriq
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer NOT NULL
);


ALTER TABLE public.tags OWNER TO metriq;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: metriq
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tags_id_seq OWNER TO metriq;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metriq
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: metriq
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    name text NOT NULL,
    "fullName" text NOT NULL,
    description text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer NOT NULL,
    "taskId" integer
);


ALTER TABLE public.tasks OWNER TO metriq;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: metriq
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tasks_id_seq OWNER TO metriq;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metriq
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: metriq
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    "usernameNormal" text NOT NULL,
    "passwordHash" text NOT NULL,
    email text NOT NULL,
    "clientToken" text,
    "recoveryToken" text,
    "clientTokenCreated" timestamp with time zone,
    "recoveryTokenExpiration" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


ALTER TABLE public.users OWNER TO metriq;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: metriq
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO metriq;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metriq
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: likes id; Type: DEFAULT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.likes ALTER COLUMN id SET DEFAULT nextval('public.likes_id_seq'::regclass);


--
-- Name: methods id; Type: DEFAULT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.methods ALTER COLUMN id SET DEFAULT nextval('public.methods_id_seq'::regclass);


--
-- Name: moderationReports id; Type: DEFAULT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public."moderationReports" ALTER COLUMN id SET DEFAULT nextval('public."moderationReports_id_seq"'::regclass);


--
-- Name: results id; Type: DEFAULT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.results ALTER COLUMN id SET DEFAULT nextval('public.results_id_seq'::regclass);


--
-- Name: submissionMethodRefs id; Type: DEFAULT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public."submissionMethodRefs" ALTER COLUMN id SET DEFAULT nextval('public."submissionMethodRefs_id_seq"'::regclass);


--
-- Name: submissionTagRefs id; Type: DEFAULT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public."submissionTagRefs" ALTER COLUMN id SET DEFAULT nextval('public."submissionTagRefs_id_seq"'::regclass);


--
-- Name: submissionTaskRefs id; Type: DEFAULT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public."submissionTaskRefs" ALTER COLUMN id SET DEFAULT nextval('public."submissionTaskRefs_id_seq"'::regclass);


--
-- Name: submissions id; Type: DEFAULT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.submissions ALTER COLUMN id SET DEFAULT nextval('public.submissions_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (id);


--
-- Name: likes likes_submissionId_userId_unique; Type: CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT "likes_submissionId_userId_unique" UNIQUE ("userId", "submissionId");


--
-- Name: methods methods_pkey; Type: CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.methods
    ADD CONSTRAINT methods_pkey PRIMARY KEY (id);


--
-- Name: moderationReports moderationReports_pkey; Type: CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public."moderationReports"
    ADD CONSTRAINT "moderationReports_pkey" PRIMARY KEY (id);


--
-- Name: results results_pkey; Type: CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_pkey PRIMARY KEY (id);


--
-- Name: submissionMethodRefs submissionMethodRefs_pkey; Type: CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public."submissionMethodRefs"
    ADD CONSTRAINT "submissionMethodRefs_pkey" PRIMARY KEY (id);


--
-- Name: submissionMethodRefs submissionMethodRefs_submissionId_methodId_unique; Type: CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public."submissionMethodRefs"
    ADD CONSTRAINT "submissionMethodRefs_submissionId_methodId_unique" UNIQUE ("submissionId", "methodId", "deletedAt");


--
-- Name: submissionTagRefs submissionTagRefs_pkey; Type: CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public."submissionTagRefs"
    ADD CONSTRAINT "submissionTagRefs_pkey" PRIMARY KEY (id);


--
-- Name: submissionTagRefs submissionTagRefs_submissionId_tagId_unique; Type: CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public."submissionTagRefs"
    ADD CONSTRAINT "submissionTagRefs_submissionId_tagId_unique" UNIQUE ("submissionId", "tagId", "deletedAt");


--
-- Name: submissionTaskRefs submissionTaskRefs_pkey; Type: CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public."submissionTaskRefs"
    ADD CONSTRAINT "submissionTaskRefs_pkey" PRIMARY KEY (id);


--
-- Name: submissionTaskRefs submissionTaskRefs_submissionId_taskId_unique; Type: CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public."submissionTaskRefs"
    ADD CONSTRAINT "submissionTaskRefs_submissionId_taskId_unique" UNIQUE ("submissionId", "taskId", "deletedAt");


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: fki_moderationReports_submissionId_fkey; Type: INDEX; Schema: public; Owner: metriq
--

CREATE INDEX "fki_moderationReports_submissionId_fkey" ON public."moderationReports" USING btree ("submissionId");


--
-- Name: fki_results_submissionTaskRefId_fkey; Type: INDEX; Schema: public; Owner: metriq
--

CREATE INDEX "fki_results_submissionTaskRefId_fkey" ON public.results USING btree ("submissionTaskRefId");


--
-- Name: fki_tasks_tasksId_fkey; Type: INDEX; Schema: public; Owner: metriq
--

CREATE INDEX "fki_tasks_tasksId_fkey" ON public.tasks USING btree ("taskId");


--
-- Name: likes likes_submissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT "likes_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES public.submissions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: likes likes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT "likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: methods methods_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.methods
    ADD CONSTRAINT "methods_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: moderationReports moderationReports_submissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public."moderationReports"
    ADD CONSTRAINT "moderationReports_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES public.submissions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: moderationReports moderationReports_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public."moderationReports"
    ADD CONSTRAINT "moderationReports_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: results results_submissionMethodRefId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT "results_submissionMethodRefId_fkey" FOREIGN KEY ("submissionMethodRefId") REFERENCES public."submissionMethodRefs"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: results results_submissionTaskRefId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT "results_submissionTaskRefId_fkey" FOREIGN KEY ("submissionTaskRefId") REFERENCES public."submissionTaskRefs"(id);


--
-- Name: results results_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT "results_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: submissionMethodRefs submissionMethodRefs_methodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public."submissionMethodRefs"
    ADD CONSTRAINT "submissionMethodRefs_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES public.methods(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: submissionMethodRefs submissionMethodRefs_submissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public."submissionMethodRefs"
    ADD CONSTRAINT "submissionMethodRefs_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES public.submissions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: submissionMethodRefs submissionMethodRefs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public."submissionMethodRefs"
    ADD CONSTRAINT "submissionMethodRefs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: submissionTagRefs submissionTagRefs_submissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public."submissionTagRefs"
    ADD CONSTRAINT "submissionTagRefs_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES public.submissions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: submissionTagRefs submissionTagRefs_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public."submissionTagRefs"
    ADD CONSTRAINT "submissionTagRefs_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: submissionTagRefs submissionTagRefs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public."submissionTagRefs"
    ADD CONSTRAINT "submissionTagRefs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: submissionTaskRefs submissionTaskRefs_submissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public."submissionTaskRefs"
    ADD CONSTRAINT "submissionTaskRefs_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES public.submissions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: submissionTaskRefs submissionTaskRefs_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public."submissionTaskRefs"
    ADD CONSTRAINT "submissionTaskRefs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: submissionTaskRefs submissionTaskRefs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public."submissionTaskRefs"
    ADD CONSTRAINT "submissionTaskRefs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: submissions submissions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT "submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tags tags_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT "tags_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tasks tasks_tasksId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_tasksId_fkey" FOREIGN KEY ("taskId") REFERENCES public.tasks(id);


--
-- Name: tasks tasks_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: metriq
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

