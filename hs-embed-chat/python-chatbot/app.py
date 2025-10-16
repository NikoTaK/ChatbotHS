"""
Harbour.Space Chatbot - Python Flask Backend
A simple chatbot for Harbour.Space University using OpenAI's GPT API
"""

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv
from datetime import datetime
import time
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse, quote_plus, parse_qs, unquote
import logging
import uuid
from scenarios import (
    list_scenarios,
    get_scenario,
    SCENARIO_NAMES,
    scenario_index,
    get_scenario_system_prompt,
    scenario_definitions_text,
)

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for API requests
app.logger.setLevel(logging.INFO)

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

# System prompt for the chatbot
SYSTEM_PROMPT = """You are a helpful assistant for Harbour.Space University in Barcelona. 
You help prospective students learn about programmes, admissions, scholarships, and campus life.
Be friendly, concise, and informative. When relevant, suggest they explore the programme catalogue by typing "catalogue"."""

# When web sources are provided, force citation-style answers
CITATION_PROMPT = (
    "Answer in the user's language. Use ONLY the provided web sources. "
    "Include short direct quotes in quotes and inline citations like [1], [2]. "
    "At the end, append a 'Sources:' list with [n] URL per line. If sources are insufficient, say you don't know."
)

# Simpler web answer mode: answer from a single fetched page and add a single link at the end
WEB_ANSWER_PROMPT = (
    "You are given the raw text of a web page. Answer the user's question briefly and accurately USING THIS PAGE ONLY when possible. "
    "If the page doesn't contain the needed facts, say it explicitly and suggest where on the site to look. "
    "Write in the user's language. Avoid guessing."
)

# Fallback responses for common questions when rate limited
FALLBACK_RESPONSES = {
    'programmes': "Harbour.Space offers Master's degrees in Computer Science, Data Science, Cyber Security, and Digital Marketing. Type 'catalogue' to see all programmes!",
    'apply': "To apply to Harbour.Space, visit our admissions page. You'll need: academic transcripts, CV, motivation letter, and English proficiency proof. Application deadlines vary by programme.",
    'location': "Harbour.Space University is located in Barcelona, Spain - one of Europe's most vibrant tech hubs!",
    'scholarships': "We offer various scholarships including merit-based awards and industry partnerships. Contact our admissions team for details.",
    'default': "I'm currently experiencing high traffic. Type 'catalogue' to see our programmes, or try asking about: programmes, admissions, location, or scholarships."
}

# Programme catalogue data
PROGRAMMES = [
    {
        'id': 'prog1',
        'title': 'Computer Science',
        'subtitle': "Master's Degree",
        'description': 'Build cutting-edge software and systems with industry leaders',
        'image': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80',
        'url': 'https://harbour.space/barcelona/master/computer-science',
    },
    {
        'id': 'prog2',
        'title': 'Data Science',
        'subtitle': "Master's Degree",
        'description': 'Master AI, machine learning, and big data analytics',
        'image': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80',
        'url': 'https://harbour.space/barcelona/master/data-science',
    },
    {
        'id': 'prog3',
        'title': 'Cyber Security',
        'subtitle': "Master's Degree",
        'description': 'Protect digital infrastructure and combat cyber threats',
        'image': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80',
        'url': 'https://harbour.space/barcelona/master/cyber-security',
    },
    {
        'id': 'prog4',
        'title': 'Digital Marketing',
        'subtitle': "Master's Degree",
        'description': 'Drive growth through data-driven marketing strategies',
        'image': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80',
        'url': 'https://harbour.space/barcelona/master/digital-marketing',
    },
]


@app.route('/')
def index():
    """Render the main chatbot page"""
    return render_template('index.html')


@app.route('/api/scenarios', methods=['GET'])
def scenarios_list_route():
    """List available scenario templates"""
    scenarios = scenario_index()
    return jsonify({'scenarios': scenarios})


@app.route('/api/scenarios/<name>', methods=['GET'])
def scenarios_get_route(name):
    """Get a specific scenario template"""
    scen = get_scenario(name)
    if not scen:
        return jsonify({'error': 'Scenario not found'}), 404
    return jsonify({'scenario': scen})


@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Handle chat messages and return responses
    
    Request JSON:
    {
        "message": "user message",
        "history": [{"role": "user/assistant", "content": "..."}]
    }
    
    Response JSON:
    {
        "response": "assistant response",
        "type": "text|catalogue|embed",
        "data": {...}  # Optional, for catalogue or embed types
    }
    """
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        image_data_url = (data.get('image') or '').strip()
        conversation_history = data.get('history', [])
        rid = uuid.uuid4().hex[:8]
        app.logger.info(f"[{rid}] /api/chat start text='{user_message[:160]}' img={'yes' if image_data_url else 'no'} hist={len(conversation_history)}")
        
        if not user_message and not image_data_url:
            return jsonify({'error': 'Message or image is required'}), 400
        
        # Check for "catalogue" keyword
        if user_message.lower() in ['catalogue', 'catalog']:
            return jsonify({
                'response': 'Here are our available programmes:',
                'type': 'catalogue',
                'data': {'programmes': PROGRAMMES}
            })
        
        # Check for embeddable URLs (YouTube, Vimeo, Maps)
        if 'youtube.com' in user_message or 'youtu.be' in user_message:
            return jsonify({
                'response': "Here's your YouTube video:",
                'type': 'embed',
                'data': {'url': user_message, 'platform': 'youtube'}
            })
        elif 'vimeo.com' in user_message:
            return jsonify({
                'response': "Here's your Vimeo video:",
                'type': 'embed',
                'data': {'url': user_message, 'platform': 'vimeo'}
            })
        elif 'google.com/maps' in user_message or 'goo.gl/maps' in user_message:
            return jsonify({
                'response': "Here's your Google Maps location:",
                'type': 'embed',
                'data': {'url': user_message, 'platform': 'maps'}
            })
        
        # Use OpenAI ChatGPT for general responses
        if not openai.api_key:
            return jsonify({
                'response': 'OpenAI API key not configured. Please set OPENAI_API_KEY in .env file.',
                'type': 'text'
            })

        # Classify the user's message into one scenario label (no keyword matching)
        scenario_to_use = classify_scenario(user_message, image_data_url)
        app.logger.info(f"[{rid}] scenario='{scenario_to_use or '-'}'")
        
        # Build messages for OpenAI
        messages = [{'role': 'system', 'content': SYSTEM_PROMPT}]
        # Try web retrieval (single-best page). Also allow explicit force with prefixes.
        web_doc = None
        try:
            force_web = False
            q = user_message
            if q.lower().startswith(('web:', 'найди:', 'lookup:', 'search:', 'find:')):
                force_web = True
                q = q.split(':', 1)[1].strip() or user_message
            urls_in_text = extract_urls(user_message)
            app.logger.info(f"[{rid}] retrieval try force={force_web} urls_in_text={len(urls_in_text)} q='{q}'")
            docs = collect_web_docs(web_urls=urls_in_text if urls_in_text else None, query=(None if urls_in_text else q), max_sources=3)
            web_doc = choose_best_doc(docs, q)
            # If selected doc is too short, try targeted fallbacks
            if web_doc and len((web_doc.get('text') or '')) < 400 and q:
                m = q.lower()
                candidates = []
                if any(k in m for k in ['scholar', 'стипенд']):
                    candidates.extend(['https://harbour.space/admissions/scholarship', 'https://harbour.space/scholarships'])
                if any(k in m for k in ['submission', 'deadline', 'intake', 'calendar', 'срок', 'интейк', 'календар', 'распис']):
                    candidates.append('https://harbour.space/admissions')
                if any(k in m for k in ['bachelor', 'bachelors', 'undergraduate', 'foundation']):
                    candidates.extend(['https://harbour.space/bachelors', 'https://harbour.space/programmes', 'https://harbour.space/admissions'])
                extra_docs = []
                for u in candidates:
                    if not web_doc or u != web_doc.get('url'):
                        try:
                            extra_docs.append(fetch_and_clean(u, max_chars=3000))
                        except Exception:
                            continue
                if extra_docs:
                    best_extra = choose_best_doc(extra_docs + ([web_doc] if web_doc else []), q)
                    if best_extra and best_extra.get('url') != (web_doc.get('url') if web_doc else None):
                        web_doc = best_extra
                        app.logger.info(f"[{rid}] web doc replaced by fallback url={web_doc.get('url')}")
            if web_doc:
                web_excerpt = (web_doc.get('text') or '')[:2400]
                app.logger.info(f"[{rid}] web doc chosen len={len(web_excerpt)} url={web_doc.get('url')}")
                messages.append({'role': 'system', 'content': WEB_ANSWER_PROMPT})
                messages.append({'role': 'system', 'content': f"WEB PAGE: {web_doc.get('title','')} ({web_doc.get('url','')})\nCONTENT:\n{web_excerpt}"})
            elif force_web:
                messages.append({'role': 'system', 'content': 'No web page could be retrieved for the explicit web request.'})
        except Exception as e:
            app.logger.info(f"[{rid}] retrieval error: {e}")
            web_doc = None

        # If a scenario is active, inject its system prompt to guide generation
        if scenario_to_use:
            scen_prompt = get_scenario_system_prompt(scenario_to_use)
            if scen_prompt:
                messages.append({'role': 'system', 'content': f"[Scenario: {scenario_to_use}] {scen_prompt}"})
            else:
                messages.append({'role': 'system', 'content': f"Answer strictly within the '{scenario_to_use}' domain."})
        messages.extend(conversation_history)
        # Build user content, supporting optional image
        if image_data_url:
            user_content = []
            if user_message:
                user_content.append({'type': 'text', 'text': user_message})
            else:
                user_content.append({'type': 'text', 'text': 'Please analyze the image and help accordingly.'})
            user_content.append({'type': 'image_url', 'image_url': {'url': image_data_url}})
            messages.append({'role': 'user', 'content': user_content})
        else:
            messages.append({'role': 'user', 'content': user_message})
        
        # Call OpenAI API with retry logic
        max_retries = 2
        retry_delay = 1
        
        for attempt in range(max_retries):
            try:
                model = ('gpt-4o-mini' if image_data_url else 'gpt-3.5-turbo')
                temp = 0.2 if web_doc else 0.7
                app.logger.info(f"[{rid}] OpenAI call attempt={attempt+1} model={model} msgs={len(messages)} web={'yes' if web_doc else 'no'} max_tokens=500 temp={temp}")
                response = openai.ChatCompletion.create(
                    model=model,
                    messages=messages,
                    temperature=temp,
                    max_tokens=500
                )
                break
            except openai.error.RateLimitError:
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                    retry_delay *= 2
                else:
                    # Use fallback response
                    fallback_msg = get_fallback_response(user_message)
                    return jsonify({
                        'response': fallback_msg,
                        'type': 'text'
                    })
            except Exception as e:
                raise e
        
        assistant_message = response.choices[0].message.content
        try:
            app.logger.info(f"[{rid}] OpenAI ok len={len(assistant_message)}")
        except Exception:
            pass
        # Append single source link when web doc was used
        if web_doc and web_doc.get('url'):
            assistant_message = f"{assistant_message}\n\nSource: {web_doc.get('url')}"
        resp = {'response': assistant_message, 'type': 'text'}
        # Tell the client which scenario is active after classification
        if scenario_to_use:
            resp['data'] = {'active_scenario': scenario_to_use}
        return jsonify(resp)
        
    except openai.error.AuthenticationError:
        return jsonify({
            'error': 'Invalid OpenAI API key. Please check your configuration.',
            'response': 'Sorry, there was an authentication error. Please contact support.',
            'type': 'text'
        }), 401
    except openai.error.RateLimitError:
        fallback_msg = get_fallback_response(data.get('message', ''))
        return jsonify({
            'response': fallback_msg + '\n\n⏳ (Rate limit - please wait 20 seconds between messages)',
            'type': 'text'
        })
    except Exception as e:
        app.logger.error(f'Chat error: {str(e)}')
        return jsonify({
            'error': str(e),
            'response': 'Sorry, I encountered an error. Please try again.',
            'type': 'text'
        }), 500


def get_fallback_response(message):
    """Get a fallback response when OpenAI is rate limited"""
    message_lower = message.lower()
    
    if any(word in message_lower for word in ['programme', 'program', 'course', 'study', 'degree']):
        return FALLBACK_RESPONSES['programmes']
    elif any(word in message_lower for word in ['apply', 'application', 'admission', 'enroll']):
        return FALLBACK_RESPONSES['apply']
    elif any(word in message_lower for word in ['where', 'location', 'barcelona', 'campus']):
        return FALLBACK_RESPONSES['location']
    elif any(word in message_lower for word in ['scholarship', 'funding', 'financial', 'tuition']):
        return FALLBACK_RESPONSES['scholarships']
    else:
        return FALLBACK_RESPONSES['default']


def classify_scenario(user_message: str, image_data_url: str = "") -> str:
    """Classify the user's message into one of SCENARIO_NAMES using OpenAI.
    Returns a scenario name (lowercase) from SCENARIO_NAMES, or an empty string if classification failed.
    """
    labels = SCENARIO_NAMES
    definitions = scenario_definitions_text()
    instruction = (
        "You are a strict intent classifier for a university chatbot.\n"
        "Choose exactly ONE label from this list: "
        f"{labels}.\n\n"
        "Labels and descriptions:\n"
        f"{definitions}\n\n"
        "Rules:\n"
        "- If the message is unrelated to the university context, classify as 'off_topic'.\n"
        "- If ambiguous between multiple labels, pick the closest by intent; if still unclear, use 'off_topic'.\n"
        "- Return ONLY the label verbatim (lowercase), no punctuation or explanation."
    )
    try:
        user_payload = None
        if image_data_url:
            parts = []
            if user_message:
                parts.append({'type': 'text', 'text': user_message})
            else:
                parts.append({'type': 'text', 'text': 'Classify this image-based query.'})
            parts.append({'type': 'image_url', 'image_url': {'url': image_data_url}})
            user_payload = {'role': 'user', 'content': parts}
        else:
            user_payload = {'role': 'user', 'content': user_message}

        resp = openai.ChatCompletion.create(
            model=('gpt-4o-mini' if image_data_url else 'gpt-3.5-turbo'),
            messages=[
                {'role': 'system', 'content': instruction},
                user_payload,
            ],
            temperature=0,
            max_tokens=10,
        )
        label = (resp.choices[0].message.content or '').strip().lower()
        # Strict match against allowed labels
        if label in labels:
            return label
        return ''
    except Exception:
        return ''


# ---------- Web retrieval helpers ----------

def extract_urls(text: str) -> list:
    if not text:
        return []
    return re.findall(r'https?://[^\s)]+', text)


def should_web_search(message: str) -> bool:
    if not message:
        return False
    m = message.lower()
    keywords = [
        'schedule', 'timetable', 'intakes', 'intake', 'deadlines', 'admissions', 'requirements', 'calendar', 'dates',
        'latest', 'current', 'tuition', 'scholarships', 'site', 'website', 'web', 'find', 'lookup', 'check', 'submission',
        '2024', '2025', '2026',
        'расписание', 'интейк', 'интейки', 'набор', 'прием', 'приём', 'сроки', 'подача', 'поступление',
        'стипенд', 'календар', 'требования', 'актуаль', 'на сайте', 'найди', 'посмотри', 'официаль'
    ]
    return any(k in m for k in keywords)


def fetch_and_clean(url: str, timeout: int = 8, max_chars: int = 3000) -> dict:
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
    resp = requests.get(url, headers=headers, timeout=timeout)
    status = resp.status_code
    try:
        app.logger.info(f"[fetch] status={status} url={url} len={len(resp.text)}")
    except Exception:
        pass
    html = resp.text
    soup = BeautifulSoup(html, 'html.parser')
    for tag in soup(['script', 'style', 'noscript', 'header', 'footer', 'nav', 'aside']):
        tag.decompose()
    title = (soup.title.string.strip() if soup.title and soup.title.string else url)
    text = ' '.join(soup.get_text(separator=' ').split())
    # If page seems empty or blocked, try r.jina.ai readability proxy
    if status >= 400 or len(text) < 300 or 'enable javascript' in text.lower() or 'captcha' in text.lower():
        try:
            parsed = urlparse(url)
            reader = f"https://r.jina.ai/http://{parsed.netloc}{parsed.path}"
            if parsed.query:
                reader += f"?{parsed.query}"
            r2 = requests.get(reader, headers=headers, timeout=timeout)
            app.logger.info(f"[fetch] reader status={r2.status_code} url={reader} len={len(r2.text)}")
            if r2.ok and len(r2.text) > 200:
                text = ' '.join(r2.text.split())
                title = title or parsed.netloc
        except Exception as e:
            try:
                app.logger.info(f"[fetch] reader error for {url}: {e}")
            except Exception:
                pass
    text = text[:max_chars]
    return {'url': url, 'title': title, 'text': text}


def search_duckduckgo(query: str, max_results: int = 3) -> list:
    # Try DuckDuckGo HTML endpoint
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8'
    }
    urls = []
    def resolve_duck_href(href: str) -> str:
        if not href:
            return ''
        if href.startswith('http'):
            return href
        # DDG often uses /l/?uddg=<encoded-url>
        try:
            q = urlparse(href).query
            params = parse_qs(q)
            if 'uddg' in params and params['uddg']:
                return unquote(params['uddg'][0])
        except Exception:
            pass
        return ''

    try:
        q = quote_plus(query)
        url = f'https://duckduckgo.com/html/?q={q}&kl=us-en'
        r = requests.get(url, headers=headers, timeout=8)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, 'html.parser')
        # DDG HTML uses links with class 'result__a'
        anchors = soup.select('a.result__a') or soup.select('h2 a.result__a')
        app.logger.info(f"[search] ddg html anchors={len(anchors)} for '{query}'")
        for a in anchors:
            href = resolve_duck_href(a.get('href'))
            if href:
                urls.append(href)
                if len(urls) >= max_results:
                    break
    except Exception:
        pass
    # Fallback to lite version if needed
    if not urls:
        try:
            q = quote_plus(query)
            url = f'https://lite.duckduckgo.com/lite/?q={q}'
            r = requests.get(url, headers=headers, timeout=8)
            r.raise_for_status()
            soup = BeautifulSoup(r.text, 'html.parser')
            anchors = soup.find_all('a')
            app.logger.info(f"[search] ddg lite anchors={len(anchors)} for '{query}'")
            for a in anchors:
                href = resolve_duck_href(a.get('href'))
                if href:
                    urls.append(href)
                    if len(urls) >= max_results:
                        break
        except Exception:
            pass
    # Prefer Harbour.Space when available
    urls_sorted = sorted(urls, key=lambda u: (0 if 'harbour.space' in u else 1, u))
    try:
        app.logger.info(f"[search] ddg results={len(urls_sorted)} for '{query}' -> {urls_sorted}")
    except Exception:
        pass
    return urls_sorted[:max_results]


def search_bing_html(query: str, max_results: int = 3) -> list:
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8'
    }
    urls = []
    try:
        q = quote_plus(query)
        url = f'https://www.bing.com/search?q={q}&setlang=en'
        r = requests.get(url, headers=headers, timeout=8)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, 'html.parser')
        anchors = soup.select('li.b_algo h2 a, h2 a')
        app.logger.info(f"[search] bing anchors={len(anchors)} for '{query}'")
        for a in anchors:
            href = a.get('href')
            if href and href.startswith('http'):
                urls.append(href)
                if len(urls) >= max_results:
                    break
    except Exception:
        pass
    urls_sorted = sorted(urls, key=lambda u: (0 if 'harbour.space' in u else 1, u))
    try:
        app.logger.info(f"[search] bing results={len(urls_sorted)} for '{query}' -> {urls_sorted}")
    except Exception:
        pass
    return urls_sorted[:max_results]


def build_sources_block(web_urls: list = None, query: str = None, max_sources: int = 3, max_chars_per: int = 3000) -> str:
    urls = list(web_urls or [])
    seen = set(urls)
    if not urls and query:
        query_variants = [
            f"{query} site:harbour.space",
            f"Harbour.Space University {query}",
            query,
        ]
        for q in query_variants:
            results = search_duckduckgo(q, max_results=max_sources)
            if not results:
                results = search_bing_html(q, max_results=max_sources)
            for u in results:
                if u in seen:
                    continue
                urls.append(u)
                seen.add(u)
                if len(urls) >= max_sources:
                    break
            if len(urls) >= max_sources:
                break
    if not urls and query:
        # Seed fallback for known Harbour.Space sections when query hints at them
        m = query.lower()
        seeds = []
        if ('harbour.space' in m or 'harbour space' in m or 'harbourspace' in m or
            'harbor.space' in m or 'harbor space' in m or 'harborspace' in m):
            if any(k in m for k in ['scholar', 'стипенд']):
                seeds.extend(['https://harbour.space/admissions/scholarship', 'https://harbour.space/scholarships'])
            if any(k in m for k in ['admission', 'apply', 'поступлен', 'подач']):
                seeds.append('https://harbour.space/admissions')
            if any(k in m for k in ['submission', 'intake', 'интейк', 'deadline', 'срок', 'calendar', 'распис']):
                seeds.append('https://harbour.space/admissions')
            if any(k in m for k in ['bachelor', 'bachelors', 'undergraduate', 'foundation']):
                seeds.extend(['https://harbour.space/bachelors', 'https://harbour.space/programmes', 'https://harbour.space/admissions'])
            if any(k in m for k in ['about', 'foundation', 'history', 'о нас', 'об университете']):
                seeds.append('https://harbour.space/about')
            if not seeds:
                seeds.append('https://harbour.space/')
        if seeds:
            app.logger.info(f"[search] using seed urls for '{query}': {seeds}")
        urls.extend([u for u in seeds if u not in seen])
        for u in seeds:
            seen.add(u)
    if not urls:
        return ''
    items = []
    for i, u in enumerate(urls[:max_sources], start=1):
        try:
            doc = fetch_and_clean(u, max_chars=max_chars_per)
            items.append((i, doc['url'], doc['title'], doc['text']))
        except Exception as e:
            try:
                app.logger.info(f"[fetch] error url={u} err={e}")
            except Exception:
                pass
            continue
    if not items:
        return ''
    # Build compact block: header list + excerpts
    header = '\n'.join([f"[{i}] {t} — {u}" for (i, u, t, _) in items])
    excerpts = '\n\n'.join([f"[{i}] EXCERPT: {txt}" for (i, _, _, txt) in items])
    block = f"{header}\n\n{excerpts}"
    try:
        app.logger.info(f"Web sources used for query: {query or 'urls'} -> {[u for (_, u, _, _) in items]}")
    except Exception:
        pass
    return block


# ---------- Simple web-doc retrieval (no citations) ----------

def collect_web_docs(web_urls: list | None, query: str | None, max_sources: int = 3) -> list:
    urls = []
    seen = set()
    if web_urls:
        for u in web_urls:
            if u not in seen:
                urls.append(u); seen.add(u)
    if query:
        # prefer harbour.space
        variants = [
            f"{query} site:harbour.space",
            f"Harbour.Space University {query}",
            query,
        ]
        for q in variants:
            res = search_duckduckgo(q, max_results=max_sources) or []
            if not res:
                res = search_bing_html(q, max_results=max_sources)
            for u in res:
                if u not in seen:
                    urls.append(u); seen.add(u)
                if len(urls) >= max_sources:
                    break
            if len(urls) >= max_sources:
                break
        # seeds fallback (same как в build_sources_block)
        if len(urls) == 0:
            m = query.lower()
            seeds = []
            if ('harbour.space' in m or 'harbour space' in m or 'harbourspace' in m or
                'harbor.space' in m or 'harbor space' in m or 'harborspace' in m):
                if any(k in m for k in ['scholar', 'стипенд']):
                    seeds.extend(['https://harbour.space/admissions/scholarship', 'https://harbour.space/scholarships'])
                if any(k in m for k in ['admission', 'apply', 'поступлен', 'подач']):
                    seeds.append('https://harbour.space/admissions')
                if any(k in m for k in ['submission', 'intake', 'интейк', 'deadline', 'срок', 'calendar', 'распис']):
                    seeds.append('https://harbour.space/admissions')
                if any(k in m for k in ['bachelor', 'bachelors', 'undergraduate', 'foundation']):
                    seeds.extend(['https://harbour.space/bachelors', 'https://harbour.space/programmes', 'https://harbour.space/admissions'])
                if any(k in m for k in ['about', 'foundation', 'history', 'о нас', 'об университете']):
                    seeds.append('https://harbour.space/about')
                if not seeds:
                    seeds.append('https://harbour.space/')
            if seeds:
                app.logger.info(f"[search] using seed urls (collect) for '{query}': {seeds}")
            for u in seeds:
                if u not in seen:
                    urls.append(u); seen.add(u)

    docs = []
    for u in urls[:max_sources]:
        try:
            doc = fetch_and_clean(u, max_chars=3000)
            docs.append(doc)
        except Exception as e:
            app.logger.info(f"[collect] fetch error for {u}: {e}")
    return docs


def choose_best_doc(docs: list, query: str | None) -> dict | None:
    if not docs:
        return None
    q = (query or '').lower()
    q_terms = [t for t in re.split(r"[^\w]+", q) if t and len(t) > 2]
    def score(doc):
        url = doc.get('url', '')
        title = (doc.get('title') or '').lower()
        text = (doc.get('text') or '').lower()
        s = 0.0
        if 'harbour.space' in url:
            s += 5
        # term matches
        for t in q_terms[:8]:
            if t in title:
                s += 1.5
            if t in text:
                s += 0.5
        # length heuristic
        L = len(text)
        if L < 250:
            s -= 1
        else:
            s += min(L / 2000.0, 2.0)
        return s
    best = max(docs, key=score)
    return best

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'openai_configured': bool(openai.api_key)
    })


if __name__ == '__main__':
    # Check if OpenAI API key is set
    if not openai.api_key:
        print('⚠️  WARNING: OPENAI_API_KEY not found in environment variables')
        print('   Set it in .env file or the chatbot will use fallback responses')
    else:
        print('✅ OpenAI API key configured')
    
    # Run the Flask app
    print('🚀 Starting Harbour.Space Chatbot...')
    print('📍 Open http://localhost:8080 in your browser')
    app.run(debug=True, host='0.0.0.0', port=8080)
