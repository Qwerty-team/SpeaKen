--
-- PostgreSQL database dump
--

\restrict OwFQBGthWYYGPWu80fa1Yw4QccFXufYzqSK1OZWDQAKDii8FAdG8SLAGKJnyinH

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-10-14 12:17:02

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
-- TOC entry 230 (class 1259 OID 16477)
-- Name: assignment_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assignment_submissions (
    id bigint NOT NULL,
    assignment_id bigint NOT NULL,
    student_id bigint NOT NULL,
    audio_recording_id bigint,
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.assignment_submissions OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16476)
-- Name: assignment_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assignment_submissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assignment_submissions_id_seq OWNER TO postgres;

--
-- TOC entry 5202 (class 0 OID 0)
-- Dependencies: 229
-- Name: assignment_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assignment_submissions_id_seq OWNED BY public.assignment_submissions.id;


--
-- TOC entry 228 (class 1259 OID 16458)
-- Name: assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assignments (
    id bigint NOT NULL,
    instructor_id bigint NOT NULL,
    title character varying(200) NOT NULL,
    prompt_text text NOT NULL,
    max_duration_seconds integer DEFAULT 180 NOT NULL,
    due_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT assignments_max_duration_check CHECK ((max_duration_seconds > 0))
);


ALTER TABLE public.assignments OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16457)
-- Name: assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assignments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assignments_id_seq OWNER TO postgres;

--
-- TOC entry 5203 (class 0 OID 0)
-- Dependencies: 227
-- Name: assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assignments_id_seq OWNED BY public.assignments.id;


--
-- TOC entry 226 (class 1259 OID 16441)
-- Name: audio_recordings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audio_recordings (
    id bigint NOT NULL,
    session_id bigint NOT NULL,
    audio_url character varying(500) NOT NULL,
    transcript text,
    wpm_rate integer,
    grammar_score integer,
    pronunciation_score integer,
    ai_feedback_json jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    pauses_count integer,
    pause_frequency numeric(8,3),
    pace_category character varying(20),
    CONSTRAINT audio_recordings_grammar_score_check CHECK (((grammar_score IS NULL) OR ((grammar_score >= 0) AND (grammar_score <= 100)))),
    CONSTRAINT audio_recordings_pace_category_check CHECK (((pace_category IS NULL) OR ((pace_category)::text = ANY ((ARRAY['SLOW'::character varying, 'OPTIMAL'::character varying, 'TOO_FAST'::character varying])::text[])))),
    CONSTRAINT audio_recordings_pause_frequency_check CHECK (((pause_frequency IS NULL) OR (pause_frequency >= (0)::numeric))),
    CONSTRAINT audio_recordings_pauses_count_check CHECK (((pauses_count IS NULL) OR (pauses_count >= 0))),
    CONSTRAINT audio_recordings_pronunciation_score_check CHECK (((pronunciation_score IS NULL) OR ((pronunciation_score >= 0) AND (pronunciation_score <= 100)))),
    CONSTRAINT audio_recordings_wpm_rate_check CHECK (((wpm_rate IS NULL) OR (wpm_rate >= 0)))
);


ALTER TABLE public.audio_recordings OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16440)
-- Name: audio_recordings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audio_recordings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audio_recordings_id_seq OWNER TO postgres;

--
-- TOC entry 5204 (class 0 OID 0)
-- Dependencies: 225
-- Name: audio_recordings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audio_recordings_id_seq OWNED BY public.audio_recordings.id;


--
-- TOC entry 239 (class 1259 OID 16569)
-- Name: email_verification_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_verification_tokens (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT email_verification_expiration_check CHECK ((expires_at > created_at)),
    CONSTRAINT email_verification_used_at_check CHECK (((used_at IS NULL) OR (used_at >= created_at)))
);


ALTER TABLE public.email_verification_tokens OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16568)
-- Name: email_verification_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.email_verification_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_verification_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 5205 (class 0 OID 0)
-- Dependencies: 238
-- Name: email_verification_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.email_verification_tokens_id_seq OWNED BY public.email_verification_tokens.id;


--
-- TOC entry 233 (class 1259 OID 16509)
-- Name: manual_feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.manual_feedback (
    id bigint NOT NULL,
    submission_id bigint NOT NULL,
    instructor_id bigint NOT NULL,
    comment_text text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.manual_feedback OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16508)
-- Name: manual_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.manual_feedback_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.manual_feedback_id_seq OWNER TO postgres;

--
-- TOC entry 5206 (class 0 OID 0)
-- Dependencies: 232
-- Name: manual_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.manual_feedback_id_seq OWNED BY public.manual_feedback.id;


--
-- TOC entry 224 (class 1259 OID 16418)
-- Name: practice_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.practice_sessions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    topic_id bigint,
    session_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    duration_minutes integer NOT NULL,
    feedback text,
    CONSTRAINT practice_sessions_duration_check CHECK ((duration_minutes >= 0))
);


ALTER TABLE public.practice_sessions OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16417)
-- Name: practice_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.practice_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.practice_sessions_id_seq OWNER TO postgres;

--
-- TOC entry 5207 (class 0 OID 0)
-- Dependencies: 223
-- Name: practice_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.practice_sessions_id_seq OWNED BY public.practice_sessions.id;


--
-- TOC entry 237 (class 1259 OID 16548)
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    token character varying(500) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16547)
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refresh_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 5208 (class 0 OID 0)
-- Dependencies: 236
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- TOC entry 235 (class 1259 OID 16531)
-- Name: student_analytics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_analytics (
    id bigint NOT NULL,
    student_id bigint NOT NULL,
    avg_grammar_score numeric(5,2),
    avg_pronunciation_score numeric(5,2),
    avg_wpm integer,
    total_practice_minutes integer DEFAULT 0,
    recorded_date date DEFAULT CURRENT_DATE,
    CONSTRAINT student_analytics_grammar_score_check CHECK (((avg_grammar_score IS NULL) OR ((avg_grammar_score >= (0)::numeric) AND (avg_grammar_score <= (100)::numeric)))),
    CONSTRAINT student_analytics_minutes_check CHECK ((total_practice_minutes >= 0)),
    CONSTRAINT student_analytics_pronunciation_score_check CHECK (((avg_pronunciation_score IS NULL) OR ((avg_pronunciation_score >= (0)::numeric) AND (avg_pronunciation_score <= (100)::numeric)))),
    CONSTRAINT student_analytics_wpm_check CHECK (((avg_wpm IS NULL) OR (avg_wpm >= 0)))
);


ALTER TABLE public.student_analytics OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16530)
-- Name: student_analytics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_analytics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_analytics_id_seq OWNER TO postgres;

--
-- TOC entry 5209 (class 0 OID 0)
-- Dependencies: 234
-- Name: student_analytics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_analytics_id_seq OWNED BY public.student_analytics.id;


--
-- TOC entry 222 (class 1259 OID 16406)
-- Name: topics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.topics (
    id bigint NOT NULL,
    title character varying(200) NOT NULL,
    category character varying(50),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    difficulty_level character varying(20),
    CONSTRAINT topics_difficulty_level_check CHECK (((difficulty_level IS NULL) OR ((difficulty_level)::text = ANY ((ARRAY['BEGINNER'::character varying, 'INTERMEDIATE'::character varying, 'ADVANCED'::character varying])::text[]))))
);


ALTER TABLE public.topics OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16405)
-- Name: topics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.topics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.topics_id_seq OWNER TO postgres;

--
-- TOC entry 5210 (class 0 OID 0)
-- Dependencies: 221
-- Name: topics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.topics_id_seq OWNED BY public.topics.id;


--
-- TOC entry 241 (class 1259 OID 16590)
-- Name: user_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_settings (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    microphone_device_id character varying(255),
    microphone_device_label character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_settings OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16589)
-- Name: user_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_settings_id_seq OWNER TO postgres;

--
-- TOC entry 5211 (class 0 OID 0)
-- Dependencies: 240
-- Name: user_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_settings_id_seq OWNED BY public.user_settings.id;


--
-- TOC entry 220 (class 1259 OID 16390)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    role character varying(20) DEFAULT 'STUDENT'::character varying NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['STUDENT'::character varying, 'INSTRUCTOR'::character varying, 'SYSTEM_ADMINISTRATOR'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16389)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5212 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 231 (class 1259 OID 16503)
-- Name: view_student_performance; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_student_performance AS
 SELECT u.id AS student_id,
    u.username,
    count(ar.id) AS total_recordings,
    round(avg(ar.grammar_score), 2) AS avg_grammar,
    round(avg(ar.pronunciation_score), 2) AS avg_pronunciation,
    round(avg(ar.wpm_rate), 0) AS avg_wpm
   FROM ((public.users u
     LEFT JOIN public.practice_sessions ps ON ((u.id = ps.user_id)))
     LEFT JOIN public.audio_recordings ar ON ((ps.id = ar.session_id)))
  WHERE ((u.role)::text = 'STUDENT'::text)
  GROUP BY u.id, u.username;


ALTER VIEW public.view_student_performance OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 16613)
-- Name: word_feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.word_feedback (
    id bigint NOT NULL,
    audio_recording_id bigint NOT NULL,
    word_text character varying(255) NOT NULL,
    start_time_seconds numeric(8,3),
    end_time_seconds numeric(8,3),
    pronunciation_score numeric(5,2),
    phoneme_feedback text,
    suggestion text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT word_feedback_score_check CHECK (((pronunciation_score IS NULL) OR ((pronunciation_score >= (0)::numeric) AND (pronunciation_score <= (100)::numeric)))),
    CONSTRAINT word_feedback_time_check CHECK ((((start_time_seconds IS NULL) OR (start_time_seconds >= (0)::numeric)) AND ((end_time_seconds IS NULL) OR (end_time_seconds >= (0)::numeric)) AND ((start_time_seconds IS NULL) OR (end_time_seconds IS NULL) OR (end_time_seconds >= start_time_seconds))))
);


ALTER TABLE public.word_feedback OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 16612)
-- Name: word_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.word_feedback_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.word_feedback_id_seq OWNER TO postgres;

--
-- TOC entry 5213 (class 0 OID 0)
-- Dependencies: 242
-- Name: word_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.word_feedback_id_seq OWNED BY public.word_feedback.id;


--
-- TOC entry 4927 (class 2604 OID 16480)
-- Name: assignment_submissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_submissions ALTER COLUMN id SET DEFAULT nextval('public.assignment_submissions_id_seq'::regclass);


--
-- TOC entry 4924 (class 2604 OID 16461)
-- Name: assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments ALTER COLUMN id SET DEFAULT nextval('public.assignments_id_seq'::regclass);


--
-- TOC entry 4922 (class 2604 OID 16444)
-- Name: audio_recordings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audio_recordings ALTER COLUMN id SET DEFAULT nextval('public.audio_recordings_id_seq'::regclass);


--
-- TOC entry 4936 (class 2604 OID 16572)
-- Name: email_verification_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_verification_tokens ALTER COLUMN id SET DEFAULT nextval('public.email_verification_tokens_id_seq'::regclass);


--
-- TOC entry 4929 (class 2604 OID 16512)
-- Name: manual_feedback id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.manual_feedback ALTER COLUMN id SET DEFAULT nextval('public.manual_feedback_id_seq'::regclass);


--
-- TOC entry 4920 (class 2604 OID 16421)
-- Name: practice_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.practice_sessions ALTER COLUMN id SET DEFAULT nextval('public.practice_sessions_id_seq'::regclass);


--
-- TOC entry 4934 (class 2604 OID 16551)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 4931 (class 2604 OID 16534)
-- Name: student_analytics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_analytics ALTER COLUMN id SET DEFAULT nextval('public.student_analytics_id_seq'::regclass);


--
-- TOC entry 4918 (class 2604 OID 16409)
-- Name: topics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics ALTER COLUMN id SET DEFAULT nextval('public.topics_id_seq'::regclass);


--
-- TOC entry 4938 (class 2604 OID 16593)
-- Name: user_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings ALTER COLUMN id SET DEFAULT nextval('public.user_settings_id_seq'::regclass);


--
-- TOC entry 4915 (class 2604 OID 16393)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4941 (class 2604 OID 16616)
-- Name: word_feedback id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.word_feedback ALTER COLUMN id SET DEFAULT nextval('public.word_feedback_id_seq'::regclass);


--
-- TOC entry 5184 (class 0 OID 16477)
-- Dependencies: 230
-- Data for Name: assignment_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignment_submissions (id, assignment_id, student_id, audio_recording_id, submitted_at) FROM stdin;
1	1	1	1	2026-10-14 02:03:17.194046
\.


--
-- TOC entry 5182 (class 0 OID 16458)
-- Dependencies: 228
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignments (id, instructor_id, title, prompt_text, max_duration_seconds, due_date, created_at) FROM stdin;
1	1	Test Speaking Assignment	Describe your daily routine in English.	180	2026-10-21 02:02:49.04134	2026-10-14 02:02:49.04134
\.


--
-- TOC entry 5180 (class 0 OID 16441)
-- Dependencies: 226
-- Data for Name: audio_recordings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audio_recordings (id, session_id, audio_url, transcript, wpm_rate, grammar_score, pronunciation_score, ai_feedback_json, created_at, pauses_count, pause_frequency, pace_category) FROM stdin;
1	1	https://example.com/test-audio.mp3	Hello, my name is Alex. I enjoy learning English.	100	85	90	{"feedback": "Good job", "suggestions": ["Practice pronunciation"]}	2026-10-14 02:00:43.200742	\N	\N	\N
\.


--
-- TOC entry 5192 (class 0 OID 16569)
-- Dependencies: 239
-- Data for Name: email_verification_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_verification_tokens (id, user_id, token_hash, expires_at, used_at, created_at) FROM stdin;
\.


--
-- TOC entry 5186 (class 0 OID 16509)
-- Dependencies: 233
-- Data for Name: manual_feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.manual_feedback (id, submission_id, instructor_id, comment_text, created_at) FROM stdin;
1	1	1	Good effort. Practice pronunciation and fluency.	2026-10-14 02:04:19.810037
\.


--
-- TOC entry 5178 (class 0 OID 16418)
-- Dependencies: 224
-- Data for Name: practice_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.practice_sessions (id, user_id, topic_id, session_date, duration_minutes, feedback) FROM stdin;
1	1	1	2026-10-14 02:00:09.725476	5	Test practice session
\.


--
-- TOC entry 5190 (class 0 OID 16548)
-- Dependencies: 237
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, user_id, token, expires_at, created_at) FROM stdin;
1	1	test_refresh_token_not_for_login	2026-10-15 02:05:53.52119	2026-10-14 02:05:53.52119
\.


--
-- TOC entry 5188 (class 0 OID 16531)
-- Dependencies: 235
-- Data for Name: student_analytics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_analytics (id, student_id, avg_grammar_score, avg_pronunciation_score, avg_wpm, total_practice_minutes, recorded_date) FROM stdin;
1	1	85.00	90.00	100	5	2026-10-14
\.


--
-- TOC entry 5176 (class 0 OID 16406)
-- Dependencies: 222
-- Data for Name: topics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.topics (id, title, category, description, created_at, difficulty_level) FROM stdin;
1	Daily Conversation	Speaking	Test topic for speaking practice	2026-10-14 01:55:43.358429	\N
\.


--
-- TOC entry 5194 (class 0 OID 16590)
-- Dependencies: 241
-- Data for Name: user_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_settings (id, user_id, microphone_device_id, microphone_device_label, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5174 (class 0 OID 16390)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password_hash, created_at, role) FROM stdin;
1	test_student	test_student@speaken.test	test_hash_not_for_login	2026-10-14 01:55:43.358429	STUDENT
\.


--
-- TOC entry 5196 (class 0 OID 16613)
-- Dependencies: 243
-- Data for Name: word_feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.word_feedback (id, audio_recording_id, word_text, start_time_seconds, end_time_seconds, pronunciation_score, phoneme_feedback, suggestion, created_at) FROM stdin;
1	1	Hello	\N	\N	90.00	\N	\N	2026-10-14 11:49:11.489907
\.


--
-- TOC entry 5214 (class 0 OID 0)
-- Dependencies: 229
-- Name: assignment_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assignment_submissions_id_seq', 1, true);


--
-- TOC entry 5215 (class 0 OID 0)
-- Dependencies: 227
-- Name: assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assignments_id_seq', 1, true);


--
-- TOC entry 5216 (class 0 OID 0)
-- Dependencies: 225
-- Name: audio_recordings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audio_recordings_id_seq', 2, true);


--
-- TOC entry 5217 (class 0 OID 0)
-- Dependencies: 238
-- Name: email_verification_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.email_verification_tokens_id_seq', 1, false);


--
-- TOC entry 5218 (class 0 OID 0)
-- Dependencies: 232
-- Name: manual_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.manual_feedback_id_seq', 1, true);


--
-- TOC entry 5219 (class 0 OID 0)
-- Dependencies: 223
-- Name: practice_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.practice_sessions_id_seq', 1, true);


--
-- TOC entry 5220 (class 0 OID 0)
-- Dependencies: 236
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 1, true);


--
-- TOC entry 5221 (class 0 OID 0)
-- Dependencies: 234
-- Name: student_analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_analytics_id_seq', 1, true);


--
-- TOC entry 5222 (class 0 OID 0)
-- Dependencies: 221
-- Name: topics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.topics_id_seq', 1, true);


--
-- TOC entry 5223 (class 0 OID 0)
-- Dependencies: 240
-- Name: user_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_settings_id_seq', 1, false);


--
-- TOC entry 5224 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- TOC entry 5225 (class 0 OID 0)
-- Dependencies: 242
-- Name: word_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.word_feedback_id_seq', 1, true);


--
-- TOC entry 4982 (class 2606 OID 16484)
-- Name: assignment_submissions assignment_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_pkey PRIMARY KEY (id);


--
-- TOC entry 4979 (class 2606 OID 16470)
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 4976 (class 2606 OID 16451)
-- Name: audio_recordings audio_recordings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audio_recordings
    ADD CONSTRAINT audio_recordings_pkey PRIMARY KEY (id);


--
-- TOC entry 5000 (class 2606 OID 16580)
-- Name: email_verification_tokens email_verification_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5002 (class 2606 OID 16582)
-- Name: email_verification_tokens email_verification_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_token_hash_key UNIQUE (token_hash);


--
-- TOC entry 4989 (class 2606 OID 16519)
-- Name: manual_feedback manual_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.manual_feedback
    ADD CONSTRAINT manual_feedback_pkey PRIMARY KEY (id);


--
-- TOC entry 4974 (class 2606 OID 16427)
-- Name: practice_sessions practice_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.practice_sessions
    ADD CONSTRAINT practice_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4996 (class 2606 OID 16559)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4998 (class 2606 OID 16561)
-- Name: refresh_tokens refresh_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key UNIQUE (token);


--
-- TOC entry 4991 (class 2606 OID 16539)
-- Name: student_analytics student_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_analytics
    ADD CONSTRAINT student_analytics_pkey PRIMARY KEY (id);


--
-- TOC entry 4970 (class 2606 OID 16416)
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (id);


--
-- TOC entry 4993 (class 2606 OID 16541)
-- Name: student_analytics unique_student_date; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_analytics
    ADD CONSTRAINT unique_student_date UNIQUE (student_id, recorded_date);


--
-- TOC entry 5005 (class 2606 OID 16603)
-- Name: user_settings user_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5007 (class 2606 OID 16605)
-- Name: user_settings user_settings_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_user_id_key UNIQUE (user_id);


--
-- TOC entry 4962 (class 2606 OID 16404)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4964 (class 2606 OID 16400)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4966 (class 2606 OID 16402)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5010 (class 2606 OID 16627)
-- Name: word_feedback word_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.word_feedback
    ADD CONSTRAINT word_feedback_pkey PRIMARY KEY (id);


--
-- TOC entry 4980 (class 1259 OID 16653)
-- Name: idx_assignments_instructor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignments_instructor ON public.assignments USING btree (instructor_id);


--
-- TOC entry 4977 (class 1259 OID 16502)
-- Name: idx_audio_recordings_session; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audio_recordings_session ON public.audio_recordings USING btree (session_id);


--
-- TOC entry 5003 (class 1259 OID 16588)
-- Name: idx_email_verification_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_email_verification_user ON public.email_verification_tokens USING btree (user_id);


--
-- TOC entry 4986 (class 1259 OID 16654)
-- Name: idx_manual_feedback_instructor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_manual_feedback_instructor ON public.manual_feedback USING btree (instructor_id);


--
-- TOC entry 4987 (class 1259 OID 16655)
-- Name: idx_manual_feedback_submission; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_manual_feedback_submission ON public.manual_feedback USING btree (submission_id);


--
-- TOC entry 4971 (class 1259 OID 16656)
-- Name: idx_practice_sessions_topic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_practice_sessions_topic ON public.practice_sessions USING btree (topic_id);


--
-- TOC entry 4972 (class 1259 OID 16657)
-- Name: idx_practice_sessions_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_practice_sessions_user ON public.practice_sessions USING btree (user_id);


--
-- TOC entry 4994 (class 1259 OID 16658)
-- Name: idx_refresh_tokens_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_user ON public.refresh_tokens USING btree (user_id);


--
-- TOC entry 4983 (class 1259 OID 16650)
-- Name: idx_submissions_assignment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_submissions_assignment ON public.assignment_submissions USING btree (assignment_id);


--
-- TOC entry 4984 (class 1259 OID 16651)
-- Name: idx_submissions_audio_recording; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_submissions_audio_recording ON public.assignment_submissions USING btree (audio_recording_id);


--
-- TOC entry 4985 (class 1259 OID 16652)
-- Name: idx_submissions_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_submissions_student ON public.assignment_submissions USING btree (student_id);


--
-- TOC entry 4967 (class 1259 OID 16501)
-- Name: idx_topics_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_topics_category ON public.topics USING btree (category);


--
-- TOC entry 4968 (class 1259 OID 16500)
-- Name: idx_topics_title; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_topics_title ON public.topics USING btree (title);


--
-- TOC entry 5008 (class 1259 OID 16633)
-- Name: idx_word_feedback_recording; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_word_feedback_recording ON public.word_feedback USING btree (audio_recording_id);


--
-- TOC entry 5015 (class 2606 OID 16485)
-- Name: assignment_submissions assignment_submissions_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;


--
-- TOC entry 5016 (class 2606 OID 16495)
-- Name: assignment_submissions assignment_submissions_audio_recording_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_audio_recording_id_fkey FOREIGN KEY (audio_recording_id) REFERENCES public.audio_recordings(id) ON DELETE SET NULL;


--
-- TOC entry 5017 (class 2606 OID 16490)
-- Name: assignment_submissions assignment_submissions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5014 (class 2606 OID 16471)
-- Name: assignments assignments_instructor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5013 (class 2606 OID 16452)
-- Name: audio_recordings audio_recordings_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audio_recordings
    ADD CONSTRAINT audio_recordings_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.practice_sessions(id) ON DELETE CASCADE;


--
-- TOC entry 5022 (class 2606 OID 16583)
-- Name: email_verification_tokens email_verification_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5018 (class 2606 OID 16525)
-- Name: manual_feedback manual_feedback_instructor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.manual_feedback
    ADD CONSTRAINT manual_feedback_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5019 (class 2606 OID 16520)
-- Name: manual_feedback manual_feedback_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.manual_feedback
    ADD CONSTRAINT manual_feedback_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.assignment_submissions(id) ON DELETE CASCADE;


--
-- TOC entry 5011 (class 2606 OID 16433)
-- Name: practice_sessions practice_sessions_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.practice_sessions
    ADD CONSTRAINT practice_sessions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE SET NULL;


--
-- TOC entry 5012 (class 2606 OID 16428)
-- Name: practice_sessions practice_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.practice_sessions
    ADD CONSTRAINT practice_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5021 (class 2606 OID 16562)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5020 (class 2606 OID 16542)
-- Name: student_analytics student_analytics_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_analytics
    ADD CONSTRAINT student_analytics_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5023 (class 2606 OID 16606)
-- Name: user_settings user_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5024 (class 2606 OID 16628)
-- Name: word_feedback word_feedback_audio_recording_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.word_feedback
    ADD CONSTRAINT word_feedback_audio_recording_id_fkey FOREIGN KEY (audio_recording_id) REFERENCES public.audio_recordings(id) ON DELETE CASCADE;


-- Completed on 2026-10-14 12:17:02

--
-- PostgreSQL database dump complete
--

\unrestrict OwFQBGthWYYGPWu80fa1Yw4QccFXufYzqSK1OZWDQAKDii8FAdG8SLAGKJnyinH

