import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from openai import AsyncOpenAI
import engine
import interpreter
import matcher

app = FastAPI(title="Jyotish Engine API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class BirthDetails(BaseModel):
    year: int; month: int; day: int
    hour: int; minute: int
    lat: float; lon: float; tz_offset: float

class MatchRequest(BaseModel):
    p1: BirthDetails
    p2: BirthDetails

def _grok_client():
    api_key = os.environ.get("GROQ_API_KEY", "")
    return api_key, AsyncOpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")

@app.get("/")
def health():
    return {"status": "alive"}

@app.post("/chart")
def chart(b: BirthDetails):
    return engine.compute_chart(b.year, b.month, b.day, b.hour, b.minute, b.lat, b.lon, b.tz_offset)

@app.post("/report")
def report(b: BirthDetails):
    chart_data = engine.compute_chart(b.year, b.month, b.day, b.hour, b.minute, b.lat, b.lon, b.tz_offset)
    return interpreter.interpret_chart(chart_data)

@app.post("/match")
def match(req: MatchRequest):
    c1 = engine.compute_chart(req.p1.year, req.p1.month, req.p1.day,
                               req.p1.hour, req.p1.minute, req.p1.lat, req.p1.lon, req.p1.tz_offset)
    c2 = engine.compute_chart(req.p2.year, req.p2.month, req.p2.day,
                               req.p2.hour, req.p2.minute, req.p2.lat, req.p2.lon, req.p2.tz_offset)
    result = matcher.compute_match(c1, c2)
    result['p1_yogas'] = c1.get('yogas', [])
    result['p2_yogas'] = c2.get('yogas', [])
    return result

@app.post("/interpret")
async def interpret(request: Request):
    data = await request.json()
    api_key, client = _grok_client()
    if not api_key:
        async def no_key():
            yield "⚠ GROQ_API_KEY not set in backend/.env"
        return StreamingResponse(no_key(), media_type="text/plain")

    lagna   = data.get("lagna", {})
    planets = data.get("planets", [])
    houses  = data.get("houses", [])
    dasha   = data.get("current_dasha", {})
    antard  = data.get("current_antardasha", {})
    yogas   = data.get("yogas", [])

    planet_lines = "\n".join(
        f"  {p['name']}: {p['sign_en']} {p['degree_in_sign']}° | House {p['house']} | {p['nakshatra']} Pada {p['pada']}"
        + (" [Retrograde]" if p["retrograde"] else "")
        + (" [Combust]" if p.get("combust") else "")
        for p in planets
    )
    house_lines = "\n".join(
        f"  H{h['house']} {h['sign_en']} (lord {h['lord']})"
        + (f" → {', '.join(h['planets'])}" if h['planets'] else " → empty")
        for h in houses
    )
    yoga_lines  = "\n".join(f"  {y['name']}: {y['desc']}" for y in yogas) or "  None detected"
    dasha_line  = f"{dasha.get('lord')} Mahadasha until {dasha.get('end')}"
    antard_line = f"{antard.get('lord')} Antardasha until {antard.get('end')}" if antard else "—"

    prompt = f"""You are a deeply learned Vedic Jyotishi trained in Brihat Parashara Hora Shastra, Phaladeepika, Jataka Parijata, and Saravali. Provide a rich, detailed, and accurate interpretation of this birth chart. Write warmly, specifically, and in the voice of a compassionate pandit.

══ BIRTH CHART ══
Lagna: {lagna.get('sign_en')} {lagna.get('degree_in_sign')}° | {lagna.get('nakshatra')} Nakshatra Pada {lagna.get('pada')} | Lord: {lagna.get('lord')}

PLANETS (Sidereal · Lahiri · Whole Sign Houses):
{planet_lines}

HOUSES:
{house_lines}

YOGAS:
{yoga_lines}

CURRENT DASHA: {dasha_line}
CURRENT ANTARDASHA: {antard_line}

Write a complete, detailed reading with bold headers for each section:

**1. Lagna — The Self & Life Path**
**2. Planetary Analysis — Graha Phala** (every planet)
**3. House-by-House Analysis — Bhava Phala** (all 12 houses)
**4. Yogas & Special Combinations**
**5. Current Dasha Period — Dasha Phala**
**6. Deep Classical Remedies — Upaya** (specific mantras with counts, ritual baths, daan, gemstones)

~1000 words. Precise, warm, grounded in shastra. No frightening predictions."""

    async def stream():
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role":"user","content":prompt}],
            stream=True, max_tokens=2500,
        )
        async for chunk in response:
            content = chunk.choices[0].delta.content
            if content: yield content

    return StreamingResponse(stream(), media_type="text/plain")

@app.post("/match-interpret")
async def match_interpret(request: Request):
    data = await request.json()
    api_key, client = _grok_client()
    if not api_key:
        async def no_key():
            yield "⚠ GROQ_API_KEY not set in backend/.env"
        return StreamingResponse(no_key(), media_type="text/plain")

    m = data.get("match", {})
    p1m = m.get("p1_moon", {})
    p2m = m.get("p2_moon", {})
    kootas = m.get("kootas", [])
    total  = m.get("total", 0)
    verdict = m.get("verdict", "")

    # Ashtakoot
    koota_lines = "\n".join(
        f"  {k['name']}: {k['score']}/{k['max']} — {k['detail']}"
        for k in kootas
    )

    # Extended kootas
    mah = m.get("mahendra", {})
    sd  = m.get("stree_deergha", {})

    # Doshas
    rajju = m.get("rajju", {})
    vedha = m.get("vedha", {})
    nadi  = m.get("nadi_dosha", {})
    bhakoot = m.get("bhakoot_dosha", {})
    mangal  = m.get("mangal", {})

    # 7th house
    h7 = m.get("seventh_house", {})
    h7p1 = h7.get("p1", {})
    h7p2 = h7.get("p2", {})

    # Venus/Jupiter
    vj   = m.get("venus_jupiter", {})
    vjp1 = vj.get("p1", {})
    vjp2 = vj.get("p2", {})

    # Darakaraka
    dk = m.get("darakaraka", {})

    # Lagna compat
    lg = m.get("lagna", {})

    # Dasha
    dasha_c = m.get("dasha", {})

    # Rahu/Ketu
    rk = m.get("rahu_ketu", {})

    prompt = f"""You are a deeply learned Vedic Jyotishi trained in Brihat Parashara Hora Shastra, Muhurta Chintamani, Phaladeepika, and classical Milan Shastra. You specialize in comprehensive Kundali compatibility analysis. Provide the most complete, honest, and compassionate compatibility reading possible.

══ COMPREHENSIVE COMPATIBILITY DATA ══

ASHTAKOOT MILAN — {total}/36 ({verdict})
{koota_lines}

EXTENDED KOOTAS:
  Mahendra: Count={mah.get('count')} → {'Auspicious ✓' if mah.get('auspicious') else 'Inauspicious ✗'}
  Stree-Deergha: Count={sd.get('count')} → {'Auspicious ✓' if sd.get('auspicious') else 'Inauspicious ✗'}

PERSON 1 MOON — {p1m.get('sign')} · {p1m.get('nakshatra')} Pada {p1m.get('pada')}
  Gana: {p1m.get('gana')} | Nadi: {p1m.get('nadi')} | Varna: {p1m.get('varna')} | Yoni Animal: {p1m.get('animal')} | Lord: {p1m.get('lord')}

PERSON 2 MOON — {p2m.get('sign')} · {p2m.get('nakshatra')} Pada {p2m.get('pada')}
  Gana: {p2m.get('gana')} | Nadi: {p2m.get('nadi')} | Varna: {p2m.get('varna')} | Yoni Animal: {p2m.get('animal')} | Lord: {p2m.get('lord')}

DOSHA ANALYSIS:
  Rajju Dosha: {'PRESENT — ' + rajju.get('severity','') if rajju.get('dosha') else 'None ✓'} | P1:{rajju.get('p1_rajju')} P2:{rajju.get('p2_rajju')}
  Vedha Dosha: {'PRESENT' if vedha.get('dosha') else 'None ✓'} | {vedha.get('p1_nak')} & {vedha.get('p2_nak')}
  Nadi Dosha:  {'PRESENT' if nadi.get('present') else 'None ✓'}
  Bhakoot Dosha: {'PRESENT' if bhakoot.get('present') else 'None ✓'}
  Mangal Dosha P1: {'PRESENT' + (' [CANCELLED: '+','.join(mangal.get('p1',{}).get('cancel_reasons',[]))+']' if mangal.get('p1',{}).get('cancelled') else '') if mangal.get('p1',{}).get('dosha') else 'None ✓'}
  Mangal Dosha P2: {'PRESENT' + (' [CANCELLED: '+','.join(mangal.get('p2',{}).get('cancel_reasons',[]))+']' if mangal.get('p2',{}).get('cancelled') else '') if mangal.get('p2',{}).get('dosha') else 'None ✓'}
  Both have Mangal Dosha (mutual cancellation): {mangal.get('both_have_dosha', False)}

7TH HOUSE (Marital House):
  Person 1 — 7th in {h7p1.get('sign','?')}, Lord {h7p1.get('lord','?')} placed as: {h7p1.get('lord_placed','?')}
    Planets in 7th: {', '.join(h7p1.get('planets_in',[])) or 'None'}
    Strength: {h7p1.get('strength','?')}
  Person 2 — 7th in {h7p2.get('sign','?')}, Lord {h7p2.get('lord','?')} placed as: {h7p2.get('lord_placed','?')}
    Planets in 7th: {', '.join(h7p2.get('planets_in',[])) or 'None'}
    Strength: {h7p2.get('strength','?')}

VENUS & JUPITER (Marriage Karakas):
  Person 1 — Venus: {vjp1.get('venus_sign','?')} House {vjp1.get('venus_house','?')} [{vjp1.get('venus_dignity','?')}] | Jupiter: {vjp1.get('jupiter_sign','?')} House {vjp1.get('jupiter_house','?')} [{vjp1.get('jupiter_dignity','?')}]
  Person 2 — Venus: {vjp2.get('venus_sign','?')} House {vjp2.get('venus_house','?')} [{vjp2.get('venus_dignity','?')}] | Jupiter: {vjp2.get('jupiter_sign','?')} House {vjp2.get('jupiter_house','?')} [{vjp2.get('jupiter_dignity','?')}]
  Venus Signs Compatibility: {vj.get('venus_compatibility','?')}

DARAKARAKA (Jaimini Spouse Significator):
  {dk.get('p1_dk_desc','')}
  {dk.get('p2_dk_desc','')}

LAGNA COMPATIBILITY:
  P1 Lagna: {lg.get('p1_lagna','?')} (lord {lg.get('p1_lord','?')}) | P2 Lagna: {lg.get('p2_lagna','?')} (lord {lg.get('p2_lord','?')})
  Lagna Relationship: {lg.get('relationship','?')} | Lord Relationship: {lg.get('lord_relationship','?')}
  Compatibility: {lg.get('compatibility','?')}
  P1 Moon in P2's lagna sign: {lg.get('moon1_in_lagna2', False)}
  P2 Moon in P1's lagna sign: {lg.get('moon2_in_lagna1', False)}

DASHA TIMING:
  Person 1: {dasha_c.get('p1_mahadasha','?')} Mahadasha / {dasha_c.get('p1_antardasha','?')} Antardasha until {dasha_c.get('p1_antardasha_end','?')} — {dasha_c.get('p1_quality','?')}
  Person 2: {dasha_c.get('p2_mahadasha','?')} Mahadasha / {dasha_c.get('p2_antardasha','?')} Antardasha until {dasha_c.get('p2_antardasha_end','?')} — {dasha_c.get('p2_quality','?')}

KARMIC AXIS (Rahu/Ketu):
  Person 1 — Rahu: {rk.get('p1_rahu','?')} H{rk.get('p1_rahu_house','?')} | Ketu: {rk.get('p1_ketu','?')} H{rk.get('p1_ketu_house','?')}
  Person 2 — Rahu: {rk.get('p2_rahu','?')} H{rk.get('p2_rahu_house','?')} | Ketu: {rk.get('p2_ketu','?')} H{rk.get('p2_ketu_house','?')}
  Strong Past-life Karmic Bond: {rk.get('karmic_connection', False)}

══ COMPREHENSIVE INTERPRETATION REQUESTED ══

Write the most thorough Kundali compatibility reading possible with these bold headers:

**1. Overall Compatibility — The Soul of This Union**
A deep, holistic assessment of this couple. Go beyond the Ashtakoot score. What does this combination of charts tell you about the nature and destiny of this relationship?

**2. Moon Compatibility — Chandra Milan**
Analyze both nakshatras, padas, ganas, and moon sign lords in depth. How do their minds, emotions, and instinctive natures harmonize? What is the emotional texture of daily life together?

**3. Rajju, Vedha & Extended Compatibility**
Discuss Rajju, Vedha, Mahendra, and Stree-Deergha with their specific traditional meanings. Be direct about what is present and what remedies are needed.

**4. Dosha Analysis — Complete with Remedies**
For EVERY dosha present (Nadi, Bhakoot, Mangal, Rajju, Vedha): explain the classical teaching, the real-life manifestation, and specific, actionable remedies (mantras with exact counts, pujas, daan, charitable acts, specific Devatas to propitiate).

**5. 7th House & Venus — Romantic & Marital Compatibility**
Using both 7th houses and Venus placements: what kind of partner does each person naturally seek? How well do they fulfill each other's deepest marital needs? Physical, romantic, and emotional compatibility.

**6. Darakaraka & Lagna — Personality Compatibility**
Using Darakaraka and Lagna analysis: are their personalities and life-orientation compatible? Will they naturally understand each other or will they need conscious bridging?

**7. Karmic Bond & Past-Life Connection**
Analyze the Rahu/Ketu axis relationship between the charts. What karma brings them together? What lessons does this relationship carry? What is the spiritual purpose of this union?

**8. Timing — Dasha & Auspicious Periods**
Based on both Mahadasha periods: is this an auspicious time to marry? When are the best windows? What to watch for and when.

**9. Strengths to Cultivate**
The top 3-4 genuine strengths of this union. Be specific to their charts — not generic advice.

**10. Complete Remedies & Blessings**
A consolidated, prioritized list of all remedies needed. Include specific Devata worship, mantras, puja, daan, and practical relationship practices drawn from the classical tradition. Close with blessings for their life together.

Write approximately 1400–1700 words. Be warm, deeply specific to these two charts, truthful, and grounded in classical shastra. Never be alarmist — every challenge has a remedy in Jyotish."""

    async def stream():
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role":"user","content":prompt}],
            stream=True, max_tokens=3800,
        )
        async for chunk in response:
            content = chunk.choices[0].delta.content
            if content: yield content

    return StreamingResponse(stream(), media_type="text/plain")
