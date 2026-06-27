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

    planets = {1:"Sun",2:"Moon",3:"Jupiter",4:"Rahu",5:"Mercury",
               6:"Venus",7:"Ketu",8:"Saturn",9:"Mars"}
    titles  = {1:"The Pioneer",2:"The Diplomat",3:"The Creator",4:"The Builder",
               5:"The Explorer",6:"The Nurturer",7:"The Seeker",
               8:"The Achiever",9:"The Humanitarian"}

    namank_line = f"\nNamank (Name Number): {namank} — {titles.get(namank,'')} — ruled by {planets.get(namank,'')}" if namank else ""
    name_line   = f"\nName: {name}" if name else ""

    prompt = f"""You are a master Vedic numerologist — deeply versed in the ancient Ankashastra tradition as taught in Brihat Samhita, and the numerological systems of Pythagoras, Chaldea, and the Vedic rishis. A seeker has placed their birth numbers before you. Give them the most complete, insightful, and life-changing numerology reading possible. Write warmly, precisely, and with the authority of a sage. Address them directly as "you."

══════════════════════════════════════
NUMEROLOGY CHART
══════════════════════════════════════
Date of Birth: {day}/{month}/{year}{name_line}
Moolank (Birth Number): {moolank} — {titles.get(moolank,'')} — ruled by {planets.get(moolank,'')}
Bhagyank (Destiny Number): {bhagyank} — {titles.get(bhagyank,'')} — ruled by {planets.get(bhagyank,'')}{namank_line}
══════════════════════════════════════

Write a COMPLETE numerological life reading. Use these exact bold headers:

**1. The Core Vibration — Who You Are at Birth (Moolank {moolank})**
What does this Moolank reveal about the person's deepest instinctive nature? How does the ruling planet {planets.get(moolank,'')} shape their personality, physical constitution, and approach to life? What is the gift and the shadow of this number?

**2. The Soul's Chosen Path — Destiny & Life Purpose (Bhagyank {bhagyank})**
What has this soul come to earth to accomplish? How does {planets.get(bhagyank,'')} shape their life trajectory? Where will they feel the call of destiny most strongly? What karmic themes does this number carry from past lives?

**3. The Dialogue Between Your Numbers**
How do Moolank {moolank} and Bhagyank {bhagyank} interact? Do they support each other or create inner tension? What does this combination reveal about the central theme of this person's life — the push and pull between who they naturally are and who they are becoming?

{"**4. The Name Vibration (Namank " + str(namank) + ")** — How does the name number interact with the Moolank and Bhagyank? Does it amplify, harmonize, or challenge the core numbers? Is the name vibration fortunate for this person? What does " + planets.get(namank,'') + " add to the overall numerological picture?" if namank else "**4. The Power of Name Vibration** — Explain how a person's name number (Namank) works and why it matters, especially in the context of this Moolank and Bhagyank combination."}

**5. Your Past — What These Numbers Say About Your History**
Using the Moolank and Bhagyank as a lens — what themes, patterns, and key turning points has this person likely experienced in childhood, teenage years, and early adulthood? What did the formative years feel like for someone with this numerical blueprint?

**6. Your Present — The Current Phase of Your Number Cycle**
Every 9 years, a person moves through a complete numerological cycle. Calculate and describe the current Personal Year Number for this person (add day + month + current year, reduce to single digit). What is the theme of this year? What should they focus on, and what should they release?

**7. Your Future — The Next 9-Year Cycle**
Walk through the upcoming personal years one by one. What does each year in the cycle ahead hold? Give specific guidance for how to navigate each year according to the numerological energies at play.

**8. Career & Wealth — Your Numerological Vocational Path**
Based on the Moolank and Bhagyank together, what career paths are most aligned with this person's numerical blueprint? When are the peak years for professional achievement and financial growth? What numerological principles should guide their business decisions?

**9. Love, Relationships & Compatibility**
What type of partner does this combination seek and attract? Which numbers are most compatible romantically? Which create friction? What is the core pattern this person brings to relationships — and what must they learn about love to find lasting happiness?

**10. Health & Vitality Through Numbers**
What does the Moolank's ruling planet reveal about physical constitution and health tendencies? What body systems need the most attention? What numerological practices — fasting days, color therapy, mantra — support this person's physical wellbeing?

**11. Karmic Lessons & Spiritual Growth**
What are the deepest karmic lessons embedded in these numbers? What has the soul struggled with across lifetimes that these numbers are here to resolve? What is the spiritual opportunity hidden inside the greatest challenge of this numerical blueprint?

**12. Complete Remedies — Upaya for Both Numbers**
For BOTH the Moolank and Bhagyank:
- Sacred mantra (exact Sanskrit, with daily count)
- Presiding deity and specific worship practice
- Auspicious fasting day and what to offer
- Gemstone (with metal, finger to wear on, and when to start wearing)
- Daan (specific charitable act — day, item, recipient)
- Lucky colour to wear, direction to face, and number to use in daily life
- Specific ritual or puja with timing

**13. The Complete Story of This Soul**
A final synthesis — what is the single overarching narrative of this person's life as told by their numbers? What is the one truth about themselves they most need to understand? What is the unique blessing that only someone with this exact Moolank-Bhagyank combination carries into the world?

Write at least 2000 words. Be specific to THESE exact numbers — never generic. Every paragraph must reference the actual numbers given. Write as if this is the most important reading you will ever give."""

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
