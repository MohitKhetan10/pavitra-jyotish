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

    lagna    = data.get("lagna", {})
    planets  = data.get("planets", [])
    houses   = data.get("houses", [])
    dasha    = data.get("current_dasha", {})
    antard   = data.get("current_antardasha", {})
    yogas    = data.get("yogas", [])
    vimsh    = data.get("vimshottari", [])

    planet_lines = "\n".join(
        f"  {p['name']}: {p['sign_en']} {p['degree_in_sign']:.2f}° | House {p['house']} | "
        f"{p['nakshatra']} Pada {p['pada']} | Lord: {p.get('nakshatra_lord','')}"
        + (" [Retrograde]" if p["retrograde"] else "")
        + (" [Combust]"    if p.get("combust") else "")
        for p in planets
    )
    house_lines = "\n".join(
        f"  H{h['house']} {h['sign_en']} (lord {h['lord']}) → "
        + (", ".join(h['planets']) if h['planets'] else "empty")
        for h in houses
    )
    yoga_lines = "\n".join(f"  {y['name']}: {y['desc']}" for y in yogas) or "  None detected"
    dasha_line  = f"{dasha.get('lord')} Mahadasha until {dasha.get('end','?')}"
    antard_line = f"{antard.get('lord')} Antardasha until {antard.get('end','?')}" if antard else "—"
    vimsh_lines = "\n".join(
        f"  {d.get('lord')} Mahadasha: {d.get('start','?')} → {d.get('end','?')}"
        for d in vimsh
    ) if vimsh else "  Not available"

    # Identify weak/afflicted planets for detailed remedies
    weak = []
    for p in planets:
        issues = []
        if p.get("retrograde"): issues.append("retrograde")
        if p.get("combust"):    issues.append("combust")
        if p["name"] == "Sun"    and p["sign_en"] == "Libra":    issues.append("debilitated")
        if p["name"] == "Moon"   and p["sign_en"] == "Scorpio":  issues.append("debilitated")
        if p["name"] == "Mars"   and p["sign_en"] == "Cancer":   issues.append("debilitated")
        if p["name"] == "Mercury"and p["sign_en"] == "Pisces":   issues.append("debilitated")
        if p["name"] == "Jupiter"and p["sign_en"] == "Capricorn":issues.append("debilitated")
        if p["name"] == "Venus"  and p["sign_en"] == "Virgo":    issues.append("debilitated")
        if p["name"] == "Saturn" and p["sign_en"] == "Aries":    issues.append("debilitated")
        if issues: weak.append(f"{p['name']} ({', '.join(issues)}) in {p['sign_en']} House {p['house']}")
    weak_lines = "\n".join(f"  {w}" for w in weak) or "  None detected"

    prompt = f"""You are the most learned Vedic Jyotishi alive — a master of Brihat Parashara Hora Shastra, Phaladeepika, Jataka Parijata, Saravali, Uttara Kalamrita, and Mansagari. A devoted seeker has placed their entire birth chart before you. Give them the most complete, profound, and life-changing reading possible. Write with the warmth of a grandfather, the precision of a scholar, and the depth of a sage. Address them directly as "you."

══════════════════════════════════════════
BIRTH CHART (Sidereal · Lahiri · Whole Sign)
══════════════════════════════════════════
LAGNA: {lagna.get('sign_en')} {lagna.get('degree_in_sign'):.2f}° | {lagna.get('nakshatra')} Nakshatra Pada {lagna.get('pada')} | Lord: {lagna.get('lord')}

PLANETS:
{planet_lines}

HOUSES:
{house_lines}

YOGAS IN THIS CHART:
{yoga_lines}

AFFLICTED / WEAK PLANETS:
{weak_lines}

VIMSHOTTARI DASHA TIMELINE:
{vimsh_lines}

CURRENT PERIOD: {dasha_line}
CURRENT SUB-PERIOD: {antard_line}
══════════════════════════════════════════

Write a COMPLETE life reading. Cover every single aspect. Use these exact bold headers:

**1. Lagna & Physical Self — Who You Are**
The ascendant sign, degree, nakshatra, and pada — what this reveals about the person's body, appearance, personality, instincts, default way of moving through the world, and the overall tone of their entire life.

**2. The Mind & Inner World — Moon Analysis**
The Moon sign, nakshatra, pada, and house — the emotional nature, what brings peace, what creates anxiety, relationship with mother, mental tendencies, and what this person truly needs to feel safe and nourished.

**3. Soul Purpose & Vitality — Sun Analysis**
The Sun's placement — the soul's mission, relationship with father and authority, where they naturally shine, self-esteem patterns, and what they are here to master.

**4. Every Planet — Graha Phala (all 9)**
For EACH planet (Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu) — the exact effects of its placement in sign, house, and nakshatra. What it gives, what it takes, and how it expresses through lived experience.

**5. All 12 Houses — Complete Bhava Phala**
A dedicated paragraph for every house (1st through 12th) — what the sign, lord placement, and occupying planets reveal about that life area. Be specific and detailed.

**6. Career, Wealth & Life Purpose**
10th house, 10th lord, planets in 10th, 2nd house (accumulated wealth), 11th house (income and gains), and any career yogas. What professions suit this chart? When will prosperity peak? What should they work toward?

**7. Relationships & Marriage**
7th house, 7th lord, Venus, Jupiter (for female charts). The nature of the spouse this chart attracts, timing of marriage, quality of the marital bond, and any relationship patterns to be aware of.

**8. Health & Physical Vitality**
The ascendant lord's strength, 6th house, 8th house, planets afflicting the chart, and what areas of health need attention. What this chart says about longevity and physical constitution.

**9. Children, Creativity & Intelligence**
5th house and its lord, Jupiter's placement, any indications for children, the level of creative intelligence, ability to learn, and connection to past-life merit (purva punya).

**10. Spirituality, Dharma & Liberation**
9th house (dharma, guru, past life merits), 12th house (moksha, foreign travel, retreat), Ketu's placement, and the spiritual path most natural to this soul.

**11. Past Life Karma & Soul Contracts — Rahu/Ketu Axis**
The exact Rahu and Ketu houses and signs — what karma was accumulated in past lives, what lessons and wounds they carry into this birth, what Rahu is pulling them toward as new growth, and the soul contracts embedded in this chart.

**12. Yogas — Special Combinations & Their Fruits**
Every yoga present in this chart — what each one means concretely, when it will ripen, and how the person can consciously activate it.

**13. Your Past — What the Chart Reveals About Your History**
Using the dasha timeline already elapsed — what themes, events, and turning points the past planetary periods brought. Connect the chart to the life that has already been lived.

**14. Your Present — What Is Happening Right Now**
The exact Mahadasha and Antardasha running now — their specific nature, what they are activating in this chart, the key themes of this period, and what the person should focus on or be careful about right now.

**15. Your Future — The Next 20 Years**
Go through each upcoming Mahadasha period one by one — what each will bring for career, relationships, health, and spiritual growth. Give specific guidance for navigating each period wisely.

**16. What You Must Do — Dharmic Life Guidance**
Specific, personal do's drawn from this exact chart: the habits, practices, relationships, and choices that will align this person with their highest destiny.

**17. What You Must Avoid — Karmic Warnings**
Specific don'ts from this chart: patterns, behaviors, types of people, decisions, and environments that will bring suffering and delay this person's growth.

**18. Complete Remedies for Every Weak Planet — Upaya**
For EVERY afflicted, debilitated, combust, or retrograde planet AND for the chart's most important planets:
- Sacred mantra (exact Sanskrit, with daily repetition count)
- Deity to worship and specific prayer
- Fasting day
- Gemstone or substitute stone (with metal and weight)
- Daan (charitable act — specific item, day, time)
- Colour and direction to favour
- Specific puja or ritual with timing

**19. Auspicious Guidance — Lucky Colours, Numbers, Days & Directions**
Lucky number, colour, day of the week, direction to face while working and praying, and the most auspicious time of day for important decisions — all derived from this specific chart.

**20. The Complete Story of This Soul**
A final synthesis — the overarching narrative of this soul's journey: where they have come from (past lives via Ketu), what they are learning in this life, the single most important thing they must understand about themselves, and the blessing this chart carries.

Write at least 3000 words. Be specific to THIS chart — never generic. Every sentence must connect to the actual planetary positions given. Write as if this is the only reading you will ever give this person and they are trusting you with their entire life."""

    async def stream():
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role":"user","content":prompt}],
            stream=True, max_tokens=7000,
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


@app.post("/numerology-interpret")
async def numerology_interpret(request: Request):
    data = await request.json()
    api_key, client = _grok_client()
    if not api_key:
        async def no_key():
            yield "⚠ GROQ_API_KEY not set in backend/.env"
        return StreamingResponse(no_key(), media_type="text/plain")

    moolank  = data.get("moolank")
    bhagyank = data.get("bhagyank")
    namank   = data.get("namank")
    name     = data.get("name", "")
    day      = data.get("day")
    month    = data.get("month")
    year     = data.get("year")

    PLANETS = {1:"Sun",2:"Moon",3:"Jupiter",4:"Rahu",5:"Mercury",
               6:"Venus",7:"Ketu",8:"Saturn",9:"Mars"}
    TITLES  = {1:"The Pioneer",2:"The Diplomat",3:"The Creator",4:"The Builder",
               5:"The Explorer",6:"The Nurturer",7:"The Seeker",
               8:"The Achiever",9:"The Humanitarian"}
    FRIENDS = {
        "Sun":["Moon","Mars","Jupiter"],"Moon":["Sun","Mercury"],
        "Mars":["Sun","Moon","Jupiter"],"Mercury":["Sun","Venus"],
        "Jupiter":["Sun","Moon","Mars"],"Venus":["Mercury","Saturn","Rahu"],
        "Saturn":["Mercury","Venus","Rahu"],"Rahu":["Venus","Saturn","Mercury"],
        "Ketu":["Mars","Venus","Sun"],
    }
    ENEMIES = {
        "Sun":["Venus","Saturn","Rahu"],"Moon":["Rahu","Ketu"],"Mars":["Mercury","Rahu"],
        "Mercury":["Moon","Ketu"],"Jupiter":["Mercury","Venus","Rahu"],"Venus":["Sun","Moon"],
        "Saturn":["Sun","Moon","Mars"],"Rahu":["Sun","Moon"],"Ketu":["Mercury","Rahu"],
    }

    mp = PLANETS.get(moolank,""); bp = PLANETS.get(bhagyank,""); np = PLANETS.get(namank,"") if namank else ""
    mt = TITLES.get(moolank,"");  bt = TITLES.get(bhagyank,"")
    CURRENT_YEAR = 2026
    def _reduce(n):
        while n > 9: n = sum(int(d) for d in str(n))
        return n
    curr_py = _reduce(day + month + CURRENT_YEAR)
    past_py = _reduce(day + month + CURRENT_YEAR - 1)
    next_py = _reduce(day + month + CURRENT_YEAR + 1)

    if mp and bp:
        if moolank == bhagyank: rel = "same planet — perfect amplification"
        elif bp in FRIENDS.get(mp,[]): rel = f"planetary friends ({mp} and {bp} support each other)"
        elif bp in ENEMIES.get(mp,[]): rel = f"planetary enemies ({mp} and {bp} in sacred tension — the most growth-producing combination)"
        else: rel = f"neutral planets ({mp} and {bp} run parallel tracks requiring conscious bridging)"
    else: rel = "unknown"

    namank_section = f"""
**4. The Name Vibration — Namank {namank} ({np})**
The name "{name}" vibrates at {np}'s frequency (Namank {namank} · {TITLES.get(namank,'')}). Analyze how this name energy interacts with Moolank {moolank} ({mp}) and Bhagyank {bhagyank} ({bp}). Is the name harmonious, challenging, or neutral in relation to the core numbers? Does it amplify or complicate the person's path? Should they consider any adjustment to their name's vibration?""" if namank else """
**4. The Name Vibration**
No name was provided for Namank calculation. Explain briefly what the Namank is, how it is calculated using the Chaldean system, and why it matters for this specific Moolank-Bhagyank combination."""

    prompt = f"""You are a master Vedic numerologist — deeply versed in the ancient Ankashastra tradition, the Chaldean system, and the numerological synthesis of all three schools. A seeker has placed their complete numerical blueprint before you. Give the most specific, insightful, and life-changing reading possible. Write as a compassionate sage who has studied these exact numbers for decades. Use specific, concrete language — not "you are creative" but "you feel most alive when you are building something that did not exist before." Address them as "you."

══════════════════════════════════════
COMPLETE NUMEROLOGICAL BLUEPRINT
══════════════════════════════════════
Date of Birth: {day}/{month}/{year}{"  |  Name: " + name if name else ""}
Moolank  (Birth Number):   {moolank} — {mt} — ruled by {mp}
Bhagyank (Destiny Number): {bhagyank} — {bt} — ruled by {bp}{(chr(10)+"Namank   (Name Number):    " + str(namank) + " — " + TITLES.get(namank,"") + " — ruled by " + np) if namank else ""}

PLANETARY RELATIONSHIP: {rel}

PERSONAL YEAR CYCLE:
  {CURRENT_YEAR-1} (Past Year):    Personal Year {past_py}  — can be verified against last year's experience
  {CURRENT_YEAR}   (Current Year): Personal Year {curr_py}  — active NOW
  {CURRENT_YEAR+1} (Next Year):    Personal Year {next_py}  — approaching
══════════════════════════════════════

Write a COMPLETE reading. Use these exact bold headers:

**1. Moolank {moolank} — The Person You Were Born As**
What does this birth number reveal with pinpoint specificity? How does {mp} shape this person's instincts, physical constitution, and default way of moving through the world? Use concrete, specific language that makes them feel recognized — not described.

**2. Bhagyank {bhagyank} — The Direction Your Life Is Designed to Move**
What karmic purpose did this soul choose? How does {bp} shape the arc of their life? Where will they feel most alive, most on-purpose? What does this number require them to learn or become?

**3. The Living Dialogue Between Your Numbers — {moolank} and {bhagyank}**
This is the most important section. The relationship between these two numbers ({rel}) is the central dynamic of this person's life. Analyze it deeply and specifically: Does the birth nature support the destiny, or resist it? What does this friction or harmony produce in real life — in choices made, patterns repeated, breakthroughs achieved? What does mastering this combination look like?
{namank_section}

**5. Your Past — What Your Numbers Say About the Life Already Lived**
Using Moolank {moolank} and Bhagyank {bhagyank} as a lens, describe the themes that almost certainly characterized this person's childhood, adolescence, and early adulthood. What did the formative years feel like? What patterns were set in motion? Be specific to these numbers — not generic.

**6. Last Year ({CURRENT_YEAR-1}) — Personal Year {past_py}: Verify This**
Describe exactly what Personal Year {past_py} brought — what themes, what energy, what types of events tend to occur in this year. Tell them to compare it against what actually happened in {CURRENT_YEAR-1}. The verified past creates trusted future.

**7. This Year ({CURRENT_YEAR}) — Personal Year {curr_py}: What Is Happening Now**
This is the most time-sensitive section. Personal Year {curr_py} is active right now. What does it mean specifically for someone with Moolank {moolank} and Bhagyank {bhagyank}? What should they be doing, what should they be avoiding, what opportunity is available right now that will not return in this form for nine years?

**8. Next Year ({CURRENT_YEAR+1}) — Personal Year {next_py}: Prepare Now**
What is coming? What should this person begin preparing for? How does Personal Year {next_py} interact with their Moolank and Bhagyank specifically?

**9. Career & Financial Life — The Numerological Vocational Blueprint**
Based on the Moolank-Bhagyank combination specifically, what work makes this person feel most alive? What types of environments drain them? What are the peak years for financial growth? What numerological principles should guide major career decisions?

**10. Love, Relationships & Compatibility**
What does this combination need in a partner to thrive? Which Moolanks are most naturally compatible? Which create productive friction? What is the core pattern this person repeats in relationships — and what must they learn about love that these numbers have been trying to teach them?

**11. Karmic Lessons — What This Soul Came to Resolve**
What are the deepest karmic themes in this blueprint? What has this soul struggled with across lifetimes that the Moolank {moolank}-Bhagyank {bhagyank} combination is designed to address? What is the spiritual opportunity concealed inside this person's greatest life challenge?

**12. Complete Remedies for Both Ruling Planets**
For Moolank {moolank} ({mp}) AND Bhagyank {bhagyank} ({bp}) separately:
— Sacred mantra (exact Sanskrit, daily repetition count)
— Presiding deity and specific worship practice (what to offer, which day, which time)
— Fasting day and what to eat/avoid
— Gemstone: which stone, which metal, which finger, when to start wearing
— Daan: specific charitable act (what item, to whom, which day, which time)
— Lucky number, colour, direction for daily life
— One specific puja or ritual for activating this number's highest potential

**13. The Story of This Soul — Final Synthesis**
Not a summary. A narrative. What is the overarching arc of this life as told by these numbers? What is the single most important truth about themselves that a person with Moolank {moolank} and Bhagyank {bhagyank} most needs to hear — the thing that, if they truly understood it, would change how they live? End with a specific blessing tied to their numerical blueprint.

Write at minimum 2500 words. Every sentence must be specific to these exact numbers. Use concrete language throughout. This reading should feel like it could not have been written for anyone else."""

    async def stream():
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role":"user","content":prompt}],
            stream=True, max_tokens=6000,
        )
        async for chunk in response:
            content = chunk.choices[0].delta.content
            if content: yield content

    return StreamingResponse(stream(), media_type="text/plain")
