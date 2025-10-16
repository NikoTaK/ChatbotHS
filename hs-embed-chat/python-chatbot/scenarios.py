import re
from difflib import get_close_matches

SCENARIO_NAMES = [
    "admissions",
    "schedule",
    "courses",
    "faculty_info",
    "academic_calendar",
    "exams",
    "library",
    "finance",
    "registrar",
    "career_center",
    "international_office",
    "student_services",
    "alumni",
    "campus_map",
    "housing",
    "cafeteria",
    "sports",
    "events",
    "transport",
    "news",
    "contact_us",
    "off_topic",
]


SCENARIO_ALIASES = {
    "admissions": {
        "admissions", "admission", "apply", "enroll", "enrol", "application",
        "admit", "enrollment", "enrolment"
    },
    "schedule": {
        "schedule", "timetable", "class schedule", "time table"
    },
    "courses": {
        "courses", "course", "subjects", "classes", "curriculum", "modules"
    },
    "faculty_info": {
        "faculty", "faculty info", "professors", "teachers", "staff", "instructors",
        "faculty information"
    },
    "academic_calendar": {
        "academic calendar", "term dates", "semester dates", "holidays", "academic schedule"
    },
    "exams": {
        "exams", "exam", "midterms", "finals", "test", "tests", "assessment"
    },
    "library": {
        "library", "libraries", "books", "catalog", "lib"
    },
    "finance": {
        "finance", "financial aid", "tuition", "fees", "payments", "billing",
        "scholarship", "scholarships"
    },
    "registration": {
        "registration", "records", "transcript", "student records",
        "enrollment verification"
    },
    "career_center": {
        "career center", "career services", "careers", "jobs", "internships", "employment"
    },
    "international_office": {
        "international office", "visa", "immigration", "international", "visas",
        "residence permit"
    },
    "student_services": {
        "student services", "support", "helpdesk", "counseling", "advising", "student support"
    },
    "alumni": {
        "alumni", "graduates", "alumnus", "alumnae", "alumni office"
    },
    "campus_map": {
        "campus map", "map", "directions", "campus directions", "building map"
    },
    "housing": {
        "housing", "dorms", "accommodation", "residence", "residence hall", "dormitories"
    },
    "cafeteria": {
        "cafeteria", "canteen", "dining", "dining hall", "meal plan", "food court"
    },
    "sports": {
        "sports", "gym", "fitness", "athletics", "recreation", "sport"
    },
    "events": {
        "events", "event", "calendar of events", "whats on"
    },
    "transport": {
        "transport", "transportation", "shuttle", "bus", "parking", "commute"
    },
    "news": {
        "news", "updates", "announcements"
    },
    "contact_us": {
        "contact", "contacts", "contact us", "support", "get in touch", "email us"
    },
}

SCENARIO_REGISTRY = {
    # Admissions
    "admissions": {
        "title": "Admissions",
        "description": "Applications, eligibility, required documents, deadlines, scholarships/financial aid, review process.",
        "system_prompt": (
            "You are an Admissions Advisor for Harbour.Space University. Stay within admissions: eligibility, required documents, "
            "deadlines/timeline, scholarships/financial aid, and how applications are reviewed. Be concise, factual, friendly. "
            "If programme/country matters, ask briefly then guide. Do not invent policies or promises; point to official channels when needed."
        ),
    },
    # Schedule
    "schedule": {
        "title": "Schedule",
        "description": "Timetables, registration windows, add/drop, timetable changes and where to view schedule.",
        "system_prompt": (
            "You assist with schedules: where to view timetables, registration windows, add/drop periods, and change notifications. "
            "Ask for programme/semester if required. Do not fabricate exact times; explain where to see the official schedule."
        ),
    },
    # Courses
    "courses": {
        "title": "Courses",
        "description": "Degree structure, credits/ECTS, prerequisites/co‑requisites, core vs electives, syllabi.",
        "system_prompt": (
            "You help with courses and curriculum: degree structure, credits/ECTS, prerequisites and co‑requisites, core vs elective courses, "
            "and where to find syllabi. Ask for programme/level if needed. Avoid fabricating course lists."
        ),
    },
    # Faculty info
    "faculty_info": {
        "title": "Faculty Info",
        "description": "Instructor profiles, office hours, research areas, contact preferences, meetings.",
        "system_prompt": (
            "You provide faculty information: instructors, office hours, research interests, contact methods, and booking meetings. "
            "If a name is unknown, say so and suggest where to look (directory/site). Avoid inventing contact details."
        ),
    },
    # Academic calendar
    "academic_calendar": {
        "title": "Academic Calendar",
        "description": "Semester start/end, holidays, breaks, add/drop windows, exam periods.",
        "system_prompt": (
            "You cover the academic calendar: term start/end, holidays, breaks, add/drop windows, exam periods. "
            "Ask which term/academic year if needed. Do not guess dates; indicate where official dates are posted."
        ),
    },
    # Exams
    "exams": {
        "title": "Exams",
        "description": "Exam schedules, formats, grading, re-sits, accommodations, room info.",
        "system_prompt": (
            "You cover exams: schedules, formats (written/oral/project), grading rules, re‑sit policies, accommodations, and rooms. "
            "Ask for course/programme when necessary. Do not fabricate times or locations; reference official schedule."
        ),
    },
    # Library
    "library": {
        "title": "Library",
        "description": "Hours, borrowing, e-resources, study rooms, printing/scanning, remote access.",
        "system_prompt": (
            "You assist with library services: opening hours, borrowing, electronic resources, study rooms, printing/scanning, remote access. "
            "Avoid specific availability guarantees unless provided; point to the library site when needed."
        ),
    },
    # Finance
    "finance": {
        "title": "Finance",
        "description": "Tuition/fees, payments and deadlines, invoices, scholarships/aid, refunds.",
        "system_prompt": (
            "You cover student finance: tuition/fees, payment methods and deadlines, invoices, scholarships/financial aid, refunds. "
            "Do not invent amounts or due dates; if unknown, say so and provide the correct office/contact."
        ),
    },
    # Registrar
    "registrar": {
        "title": "Registrar",
        "description": "Student records, transcripts, enrollment verification, personal data updates, graduation paperwork, letters.",
        "system_prompt": (
            "You handle registrar topics: student records, transcripts, enrollment verification, personal data updates, graduation paperwork, "
            "and official letters. Clarify purpose/format when needed."
        ),
    },
    # Career Center
    "career_center": {
        "title": "Career Center",
        "description": "Internships/jobs, CV/portfolio review, interview prep, fairs and events, employer links.",
        "system_prompt": (
            "You represent the career center: internships and jobs, CV/portfolio reviews, interview preparation, career fairs/events, "
            "and employer connections. Avoid job guarantees; provide practical guidance."
        ),
    },
    # International Office
    "international_office": {
        "title": "International Office",
        "description": "Visas/residence permits, insurance, arrival, renewals, travel letters, compliance.",
        "system_prompt": (
            "You are the international office guide: visas and residence permits, insurance, arrival steps, renewals, travel letters, compliance. "
            "Laws vary by country; avoid legal advice, ask for nationality/status when relevant, and refer to official resources."
        ),
    },
    # Student Services
    "student_services": {
        "title": "Student Services",
        "description": "Advising, counseling/wellbeing, disability support, tech/helpdesk, peer support.",
        "system_prompt": (
            "You help with student services: academic advising, counseling/wellbeing, disability support, tech/helpdesk, peer support. "
            "Be supportive and concise; provide contact or booking paths if needed."
        ),
    },
    # Alumni
    "alumni": {
        "title": "Alumni",
        "description": "Alumni network/chapters, events, mentoring, post‑graduation services, career resources.",
        "system_prompt": (
            "You assist alumni: networks and chapters, events and mentoring, post‑graduation services (e.g., transcripts/email), career resources. "
            "Clarify graduation year/programme if relevant."
        ),
    },
    # Campus Map
    "campus_map": {
        "title": "Campus Map",
        "description": "Buildings, labs, classrooms, accessibility routes, entrances, nearby transport stops.",
        "system_prompt": (
            "You guide users on campus locations: buildings, labs, classrooms, accessible routes, entrances, nearby transport stops. "
            "Do not make up exact room availability; offer clear directions."
        ),
    },
    # Housing
    "housing": {
        "title": "Housing",
        "description": "Residence halls/partners, applications and deadlines, deposits, move‑in/out, maintenance.",
        "system_prompt": (
            "You handle housing: residence halls/partner options, application steps and deadlines, deposits, move‑in/move‑out, maintenance requests. "
            "Ask for term and housing type if needed."
        ),
    },
    # Cafeteria
    "cafeteria": {
        "title": "Cafeteria",
        "description": "Hours, menus, dietary options, meal plans, payment methods, locations.",
        "system_prompt": (
            "You cover dining: hours, menus, dietary options, meal plans, payment methods, campus locations. "
            "Avoid promising menu items unless sourced; point to official menus if necessary."
        ),
    },
    # Sports
    "sports": {
        "title": "Sports",
        "description": "Gym access, fitness classes, teams/clubs, facility booking, medical clearance.",
        "system_prompt": (
            "You cover sports and recreation: gym access, fitness classes, teams/clubs, facility bookings, medical clearance. "
            "Ask for activity and level if appropriate."
        ),
    },
    # Events
    "events": {
        "title": "Events",
        "description": "Academic/career/community events, tickets/RSVP, calendars, volunteering.",
        "system_prompt": (
            "You provide event info: academic, career, and community events, tickets/RSVP, calendars, volunteering. "
            "Avoid inventing dates; point to the official calendar when unsure."
        ),
    },
    # Transport
    "transport": {
        "title": "Transport",
        "description": "Public transport options, shuttles, parking permits, bike storage, airport routes.",
        "system_prompt": (
            "You handle transport and commuting: public transport options, campus shuttles, parking permits, bike storage, airport routes. "
            "Do not invent line numbers or schedules; suggest official transport planners when appropriate."
        ),
    },
    # News
    "news": {
        "title": "News",
        "description": "Updates, alerts, newsletters, social channels, where to subscribe.",
        "system_prompt": (
            "You share institutional news and announcements: updates, alerts, newsletters, social channels, and subscriptions. "
            "Avoid misinformation; be concise and point to official sources."
        ),
    },
    # Contact Us
    "contact_us": {
        "title": "Contact Us",
        "description": "Phone/email, support channels, office hours/locations, escalation paths.",
        "system_prompt": (
            "You provide contact information: phone/email, support channels, office hours/locations, escalation paths. "
            "If unsure, indicate the best official channel."
        ),
    },
    # Off-topic (polite redirection)
    "off_topic": {
        "title": "Off-topic",
        "description": "Messages unrelated to the university context (general knowledge, random chat, personal tasks).",
        "system_prompt": (
            "If the user's message is unrelated to Harbour.Space University (e.g., general knowledge, random chat, personal tasks), "
            "do not answer the off-topic question. Politely explain that this chatbot is for university-related assistance only "
            "(admissions, programmes, campus services, etc.) and invite them to ask a university-related question. Keep it brief and courteous."
        ),
    },
}

def scenario_index():
    items = []
    for name in SCENARIO_NAMES:
        meta = SCENARIO_REGISTRY.get(name, {})
        title = meta.get("title") or _humanize(name)
        items.append({"name": name, "title": title})
    return items

def get_scenario_system_prompt(name: str):
    meta = SCENARIO_REGISTRY.get((name or "").strip().lower())
    if not meta:
        return None
    return meta.get("system_prompt")

SCENARIO_TEMPLATES = {}


def scenario_definitions_text() -> str:
    """Return a concise text list of scenario labels and their descriptions for classifier context."""
    lines = []
    for name in SCENARIO_NAMES:
        meta = SCENARIO_REGISTRY.get(name, {})
        desc = meta.get("description") or "General university-related topic."
        lines.append(f"- {name}: {desc}")
    return "\n".join(lines)


def _normalize_text(text: str) -> str:
    text = (text or "").lower()
    text = text.replace("_", " ")
    text = re.sub(r"[^a-z0-9\s]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _build_alias_patterns():
    patterns = {}
    for key, aliases in SCENARIO_ALIASES.items():
        pats = []
        for alias in aliases | {key, key.replace("_", " ")}:  # include canonical
            words = [re.escape(w) for w in alias.split()]
            if not words:
                continue
            # Match alias phrase with any amount of spaces between words, as whole words
            pattern = r"\\b" + r"\\s+".join(words) + r"\\b"
            pats.append(re.compile(pattern))
        patterns[key] = pats
    return patterns


ALIAS_PATTERNS = _build_alias_patterns()


def match_scenario(text: str):
    q = _normalize_text(text)
    if not q:
        return None
    # 0) Regex phrase match with word boundaries (works inside sentences)
    for key, pats in ALIAS_PATTERNS.items():
        for p in pats:
            if p.search(q):
                return key
    # 1) Direct alias substring match
    for key, aliases in SCENARIO_ALIASES.items():
        for a in aliases | {key, key.replace("_", " ")}:  # include canonical forms
            if a in q:
                return key
    # 2) Token-level fuzzy match
    tokens = q.split()
    for key, aliases in SCENARIO_ALIASES.items():
        corpus = list(aliases | {key, key.replace("_", " ")})
        for t in tokens:
            hit = get_close_matches(t, corpus, n=1, cutoff=0.75)
            if hit:
                return key
    # 3) Whole-string fuzzy match against names
    hit = get_close_matches(q, list(SCENARIO_NAMES), n=1, cutoff=0.75)
    if hit:
        return hit[0]
    return None


def _humanize(name: str) -> str:
    return name.replace("_", " ").title()


def list_scenarios():
    return list(SCENARIO_NAMES)


def get_scenario(name: str):
    key = (name or "").strip().lower()
    if key not in SCENARIO_NAMES:
        return None
    title = _humanize(key)
    return {
        "name": key,
        "title": title,
        "aliases": sorted(list(SCENARIO_ALIASES.get(key, [])))
    }
