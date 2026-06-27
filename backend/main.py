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
            yield "❌ GROQ_API_KEY not set in backend/.env"
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
        f"  H{h['house']} {h['sign_en']} (lord {h['lord']}) 🪐 "
        + (", ".join(h['planets']) if h['planets'] else "empty")
        for h in houses
    )
    yoga_lines = "\n".join(f"  {y['name']}: {y['desc']}" for y in yogas) or "  None detected"
    dasha_line  = f"{dasha.get('lord')} Mahadasha until {dasha.get('end','?')}"
    antard_line = f"{antard.get('lord')} Antardasha until {antard.get('end','?')}" if antard else "—"
    vimsh_lines = "\n".join(
        f"  {d.get('lord')} Mahadasha: {d.get('start','?')} 🪐 {d.get('end','?')}"
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

    prompt = f"""You are the most learned Vedic Jyotishi alive – a master of Brihat Parashara Hora Shastra, Phaladeepika, Jataka Parijata, Saravali, Uttara Kalamrita, and Mansagari. A devoted seeker has placed their entire birth chart before you. Give them the most complete, profound, and life-changing reading possible. Write with the warmth of a grandfather, the precision of a scholar, and the depth of a sage. Address them directly as "you."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BIRTH CHART (Sidereal × Lahiri × Whole Sign)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write a COMPLETE life reading. Cover every single aspect. Use these exact bold headers:

**1. Lagna & Physical Self – Who You Are**
The ascendant sign, degree, nakshatra, and pada – what this reveals about the person's body, appearance, personality, instincts, default way of moving through the world, and the overall tone of their entire life.

**2. The Mind & Inner World – Moon Analysis**
The Moon sign, nakshatra, pada, and house – the emotional nature, what brings peace, what creates anxiety, relationship with mother, mental tendencies, and what this person truly needs to feel safe and nourished.

**3. Soul Purpose & Vitality – Sun Analysis**
The Sun's placement – the soul's mission, relationship with father and authority, where they naturally shine, self-esteem patterns, and what they are here to master.

**4. Every Planet – Graha Phala (all 9)**
For EACH planet (Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu) – the exact effects of its placement in sign, house, and nakshatra. What it gives, what it takes, and how it expresses through lived experience.

**5. All 12 Houses – Complete Bhava Phala**
A dedicated paragraph for every house (1st through 12th) – what the sign, lord placement, and occupying planets reveal about that life area. Be specific and detailed.

**6. Career, Wealth & Life Purpose**
10th house, 10th lord, planets in 10th, 2nd house (accumulated wealth), 11th house (income and gains), and any career yogas. What professions suit this chart? When will prosperity peak? What should they work toward?

**7. Relationships & Marriage**
7th house, 7th lord, Venus, Jupiter (for female charts). The nature of the spouse this chart attracts, timing of marriage, quality of the marital bond, and any relationship patterns to be aware of.

**8. Health & Physical Vitality**
The ascendant lord's strength, 6th house, 8th house, planets afflicting the chart, and what areas of health need attention. What this chart says about longevity and physical constitution.

**9. Children, Creativity & Intelligence**
5th house and its lord, Jupiter, planets in 5th. Natural creative talents, the capacity for children, brilliance of offspring, and what creative pursuits will bring joy.

**10. Spiritual Evolution & Moksha**
12th house, 12th lord, strength of 8th & 12th houses, Ketu's placement. Where the soul is moving toward in this lifetime, spiritual lessons encoded in the chart, and the path of inner development.

**11. Past-Life Karma & Rahu/Ketu Axis**
Rahu's placement – the hunger, the pull, the life lessons of this birth. Ketu's placement – what the soul already knows, past mastery, where detachment comes naturally. What is this soul being drawn toward and away from?

**12. Dasha Timing & Life Cycles**
Vimshottari analysis: the current mahadasha and antardasha, what they activate, and what the next 5–10 years will bring. When will major life events occur? What periods favor what endeavors?

**13. Yogas & Blessings**
List every yoga detected. Explain what each gives. Emphasize the positive potential encoded in this chart.

**14. Remedies & Practices**
If planets are weak or afflicted, suggest specific remedies: mantra, gem, fasting day, deity, giving, or spiritual practice. Tie these directly to their chart.

**15. Your True Path**
A heartfelt, direct summary: who this person really is, what they came here to do, the gifts they carry, the challenges they will transform, and the light they are meant to share with the world.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write with warmth, wisdom, and the deepest respect for this seeker's path. This is not a surface reading. This is their life.

— Created by Mohit Khetan, with devotion to the eternal wisdom of Jyotish.

ॐ"""

    async def stream_interpret():
        try:
            stream = await client.chat.completions.create(
                model="mixtral-8x7b-32768",
                messages=[{"role": "user", "content": prompt}],
                stream=True,
                temperature=0.7,
                max_tokens=4000,
            )
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            yield f"Error: {str(e)}"

    return StreamingResponse(stream_interpret(), media_type="text/plain")
