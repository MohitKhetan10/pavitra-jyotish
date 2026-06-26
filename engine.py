"""
Vedic Astrology Engine — the 'brain'.
Computes a REAL sidereal (Lahiri ayanamsa) chart: planetary positions,
Lagna, Vimshottari Dasha timeline, and D9 Navamsha.
Everything here is computed, not invented.
"""
import swisseph as swe
from datetime import date, timedelta

swe.set_sid_mode(swe.SIDM_LAHIRI)  # Nepal/India standard

SIGNS = ["Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya",
         "Tula","Vrishchika","Dhanu","Makara","Kumbha","Meena"]
SIGNS_EN = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo",
            "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"]
NAKSHATRAS = ["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra",
    "Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni",
    "Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula",
    "Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha",
    "Purva Bhadrapada","Uttara Bhadrapada","Revati"]
PLANETS = {"Sun":swe.SUN,"Moon":swe.MOON,"Mars":swe.MARS,"Mercury":swe.MERCURY,
           "Jupiter":swe.JUPITER,"Venus":swe.VENUS,"Saturn":swe.SATURN}
DASHA_LORDS = [("Ketu",7),("Venus",20),("Sun",6),("Moon",10),("Mars",7),
               ("Rahu",18),("Jupiter",16),("Saturn",19),("Mercury",17)]
NAK_LORD_SEQ = ["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"]

def _nakshatra(lon):
    span = 360/27
    n = int(lon // span)
    pada = int((lon % span) // (span/4)) + 1
    return NAKSHATRAS[n], pada, n

def _navamsa_sign(lon):
    sign = int(lon // 30)
    nav = int((lon % 30) // (30/9))
    if sign % 3 == 0: start = sign
    elif sign % 3 == 1: start = (sign + 8) % 12
    else: start = (sign + 4) % 12
    return (start + nav) % 12

def _add_years(d, yrs):
    return d + timedelta(days=yrs * 365.2425)

def compute_chart(year, month, day, hour, minute, lat, lon, tz_offset):
    """tz_offset in hours, e.g. Nepal = 5.75"""
    hour_ut = (hour + minute/60) - tz_offset
    jd = swe.julday(year, month, day, hour_ut)
    flags = swe.FLG_SIDEREAL | swe.FLG_SPEED

    planets = []
    for name, pid in PLANETS.items():
        res = swe.calc_ut(jd, pid, flags)[0]
        plon, speed = res[0], res[3]
        nak, pada, _ = _nakshatra(plon)
        planets.append({
            "name": name, "longitude": round(plon, 4),
            "sign": SIGNS[int(plon//30)], "sign_en": SIGNS_EN[int(plon//30)],
            "degree_in_sign": round(plon % 30, 2),
            "nakshatra": nak, "pada": pada,
            "navamsa_sign": SIGNS_EN[_navamsa_sign(plon)],
            "retrograde": bool(speed < 0 and name not in ("Sun","Moon")),
        })
    # Rahu / Ketu (lunar nodes)
    rahu = swe.calc_ut(jd, swe.MEAN_NODE, flags)[0][0]
    for name, rlon in [("Rahu", rahu), ("Ketu", (rahu+180) % 360)]:
        nak, pada, _ = _nakshatra(rlon)
        planets.append({
            "name": name, "longitude": round(rlon, 4),
            "sign": SIGNS[int(rlon//30)], "sign_en": SIGNS_EN[int(rlon//30)],
            "degree_in_sign": round(rlon % 30, 2),
            "nakshatra": nak, "pada": pada,
            "navamsa_sign": SIGNS_EN[_navamsa_sign(rlon)], "retrograde": True,
        })

    # Lagna (ascendant)
    _, ascmc = swe.houses_ex(jd, lat, lon, b'P', flags)
    asc = ascmc[0]
    nak, pada, _ = _nakshatra(asc)
    lagna = {"longitude": round(asc,4), "sign": SIGNS[int(asc//30)],
             "sign_en": SIGNS_EN[int(asc//30)], "degree_in_sign": round(asc%30,2),
             "nakshatra": nak, "pada": pada}

    # Vimshottari Dasha
    moon_lon = next(p["longitude"] for p in planets if p["name"]=="Moon")
    span = 360/27
    nak_index = int(moon_lon // span)
    frac = (moon_lon % span) / span
    start_lord = NAK_LORD_SEQ[nak_index % 9]
    idx = [l[0] for l in DASHA_LORDS].index(start_lord)
    balance = (1 - frac) * DASHA_LORDS[idx][1]

    timeline, cur = [], date(year, month, day)
    end = _add_years(cur, balance)
    timeline.append({"lord": start_lord, "start": cur.isoformat(),
                     "end": end.isoformat(), "years": round(balance,2)})
    cur = end
    for step in range(1, 9):
        lord, yrs = DASHA_LORDS[(idx+step) % 9]
        end = _add_years(cur, yrs)
        timeline.append({"lord": lord, "start": cur.isoformat(),
                         "end": end.isoformat(), "years": yrs})
        cur = end

    # which mahadasha is running today
    today = date.today().isoformat()
    current = next((d for d in timeline if d["start"] <= today < d["end"]), None)

    return {
        "ayanamsa": round(swe.get_ayanamsa_ut(jd), 4),
        "lagna": lagna, "planets": planets,
        "vimshottari": timeline, "current_dasha": current,
    }
