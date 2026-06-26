"""
Vedic Astrology Engine v2
- Skyfield + de421 ephemeris (sub-arcsecond planetary accuracy)
- Lahiri ayanamsa: 23.85317° at J2000, 1.39697°/century precession
- Whole Sign house system (standard Parashari Jyotish)
- Mean Rahu/Ketu (traditional Jyotish convention)
- Retrograde via half-day velocity (accurate near stations)
- Combustion, yogas, antardasha computed
"""
import math
import os
from datetime import date, timedelta, timezone, datetime

from skyfield.api import Loader

_DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(_DATA_DIR, exist_ok=True)
load = Loader(_DATA_DIR)
_eph = None

def _get_eph():
    global _eph
    if _eph is None:
        _eph = load("de421.bsp")
    return _eph

# ── lookup tables ─────────────────────────────────────────────────────────────
SIGNS    = ["Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya",
            "Tula","Vrishchika","Dhanu","Makara","Kumbha","Meena"]
SIGNS_EN = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo",
            "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"]
NAKSHATRAS = [
    "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra",
    "Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni",
    "Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula",
    "Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha",
    "Purva Bhadrapada","Uttara Bhadrapada","Revati",
]
NAK_LORDS = ["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"]

DASHA_LORDS = [
    ("Ketu",7),("Venus",20),("Sun",6),("Moon",10),("Mars",7),
    ("Rahu",18),("Jupiter",16),("Saturn",19),("Mercury",17),
]
DASHA_YEARS = {l: y for l, y in DASHA_LORDS}

SIGN_LORDS = ["Mars","Venus","Mercury","Moon","Sun","Mercury",
              "Venus","Mars","Jupiter","Saturn","Saturn","Jupiter"]

PLANET_NATURE = {
    "Sun":"malefic","Moon":"benefic","Mars":"malefic","Mercury":"neutral",
    "Jupiter":"benefic","Venus":"benefic","Saturn":"malefic",
    "Rahu":"malefic","Ketu":"malefic",
}

# Combustion orbs (degrees from Sun)
COMBUST_ORB = {"Moon":12,"Mars":17,"Mercury":14,"Jupiter":11,"Venus":10,"Saturn":15}

_PLANET_KEYS = {
    "Sun":"sun","Moon":"moon","Mars":"mars","Mercury":"mercury",
    "Jupiter":"jupiter barycenter","Venus":"venus","Saturn":"saturn barycenter",
}

HOUSE_NAMES = [
    "Tanu — Self & Body","Dhana — Wealth & Family","Sahaja — Siblings & Courage",
    "Sukha — Home & Happiness","Putra — Children & Intelligence","Shatru — Enemies & Health",
    "Kalatra — Partnership & Marriage","Mrityu — Longevity & Transformation",
    "Dharma — Fortune & Philosophy","Karma — Career & Status",
    "Labha — Gains & Social Circle","Vyaya — Losses & Liberation",
]

# ── core math ─────────────────────────────────────────────────────────────────
def _lahiri_ayanamsa(jd_ut: float) -> float:
    T = (jd_ut - 2451545.0) / 36525.0
    return (23.85317 + 1.39697 * T) % 360

def _to_sid(trop: float, ay: float) -> float:
    return (trop - ay) % 360

def _nakshatra(lon: float):
    span = 360 / 27
    n    = int(lon // span)
    pada = int((lon % span) // (span / 4)) + 1
    return NAKSHATRAS[n], pada, n

def _navamsa(lon: float) -> int:
    sign = int(lon // 30)
    nav  = int((lon % 30) // (30 / 9))
    if   sign % 3 == 0: start = sign
    elif sign % 3 == 1: start = (sign + 8) % 12
    else:               start = (sign + 4) % 12
    return (start + nav) % 12

def _add_years(d: date, yrs: float) -> date:
    return d + timedelta(days=yrs * 365.2425)

def _ecl_lon(eph, key: str, t) -> float:
    _, lon, _ = eph["earth"].at(t).observe(eph[key]).apparent().ecliptic_latlon()
    return lon.degrees % 360

def _speed(eph, key: str, dt_utc, ts) -> float:
    t_m = ts.from_datetime(dt_utc - timedelta(hours=12))
    t_p = ts.from_datetime(dt_utc + timedelta(hours=12))
    d   = (_ecl_lon(eph, key, t_p) - _ecl_lon(eph, key, t_m)) % 360
    return d - 360 if d > 180 else d

def _lagna(jd_ut: float, lat: float, lon: float) -> float:
    T    = (jd_ut - 2451545.0) / 36525.0
    gmst = (280.46061837 + 360.98564736629 * (jd_ut - 2451545.0)
            + T*T*0.000387933 - T**3/38710000.0) % 360
    lst  = (gmst + lon) % 360
    eps  = math.radians(23.439291111 - 0.013004167 * T)
    r    = math.radians(lst)
    asc  = math.degrees(math.atan2(
        -math.cos(r),
        math.sin(r)*math.cos(eps) + math.tan(math.radians(lat))*math.sin(eps)
    )) % 360
    return asc

# ── yoga detection ───────────────────────────────────────────────────────────
def _yogas(planets, lagna_idx):
    def h(name): return next((p["house"] for p in planets if p["name"]==name), None)
    def s(name): return int(next((p["longitude"] for p in planets if p["name"]==name), -1)//30)

    found = []
    moon_h, jup_h = h("Moon"), h("Jupiter")
    if moon_h and jup_h and (jup_h - moon_h) % 12 + 1 in [1,4,7,10]:
        found.append({"name":"Gaja-Kesari Yoga","type":"Raja","desc":"Jupiter in kendra from Moon — profound wisdom, prosperity, and great reputation throughout life."})

    if s("Sun") == s("Mercury") != -1:
        found.append({"name":"Budha-Aditya Yoga","type":"Budhi","desc":"Sun and Mercury together — sharp intelligence, eloquent speech, success in intellectual and administrative fields."})

    if moon_h and h("Mars") and abs(moon_h - h("Mars")) in [0,6]:
        found.append({"name":"Chandra-Mangala Yoga","type":"Dhana","desc":"Moon and Mars associated — strong willpower, financial drive, gains through courage and action."})

    jup_s, jup_h_ = s("Jupiter"), h("Jupiter")
    if jup_s in [8,11] and jup_h_ in [1,4,7,10]:
        found.append({"name":"Hamsa Yoga","type":"Pancha Mahapurusha","desc":"Jupiter in own sign in kendra — divine grace, wisdom, philanthropy, respected and honoured."})
    if jup_s == 3 and jup_h_ in [1,4,7,10]:
        found.append({"name":"Hamsa Yoga (Exalted)","type":"Pancha Mahapurusha","desc":"Exalted Jupiter in kendra — exceptional wisdom, spiritual elevation, great fortune."})

    mars_s, mars_h_ = s("Mars"), h("Mars")
    if mars_s in [0,7] and mars_h_ in [1,4,7,10]:
        found.append({"name":"Ruchaka Yoga","type":"Pancha Mahapurusha","desc":"Mars in own sign in kendra — extraordinary courage, leadership, physical vitality."})

    ven_s, ven_h_ = s("Venus"), h("Venus")
    if ven_s in [1,6] and ven_h_ in [1,4,7,10]:
        found.append({"name":"Malavya Yoga","type":"Pancha Mahapurusha","desc":"Venus in own sign in kendra — exceptional beauty, luxury, artistic genius, pleasures of life."})
    if ven_s == 11 and ven_h_ in [1,4,7,10]:
        found.append({"name":"Malavya Yoga (Exalted)","type":"Pancha Mahapurusha","desc":"Exalted Venus in kendra — supreme beauty, wealth, artistic mastery."})

    sat_s, sat_h_ = s("Saturn"), h("Saturn")
    if sat_s in [9,10] and sat_h_ in [1,4,7,10]:
        found.append({"name":"Sasa Yoga","type":"Pancha Mahapurusha","desc":"Saturn in own sign in kendra — discipline, authority, long life, rule over masses."})
    if sat_s == 6 and sat_h_ in [1,4,7,10]:
        found.append({"name":"Sasa Yoga (Exalted)","type":"Pancha Mahapurusha","desc":"Exalted Saturn in kendra — immense power, wealth, influence, endurance."})

    return found

# ── antardasha for current mahadasha ─────────────────────────────────────────
def _antardasha(maha_lord: str, maha_start: str, maha_years: float):
    maha_start_d = date.fromisoformat(maha_start)
    maha_idx = [l for l,_ in DASHA_LORDS].index(maha_lord)
    today = date.today().isoformat()
    periods, cur = [], maha_start_d
    for i in range(9):
        sub_lord, sub_total_yrs = DASHA_LORDS[(maha_idx + i) % 9]
        sub_yrs = maha_years * sub_total_yrs / 120.0
        end = _add_years(cur, sub_yrs)
        periods.append({"lord": sub_lord, "start": cur.isoformat(),
                        "end": end.isoformat(), "years": round(sub_yrs, 3)})
        cur = end
    current = next((p for p in periods if p["start"] <= today < p["end"]), None)
    return periods, current

# ── main computation ──────────────────────────────────────────────────────────
def compute_chart(year, month, day, hour, minute, lat, lon, tz_offset):
    eph = _get_eph()
    ts  = load.timescale()

    hour_ut = (hour + minute / 60.0) - tz_offset
    dt_utc  = datetime(year, month, day, tzinfo=timezone.utc) + timedelta(hours=hour_ut)
    t       = ts.from_datetime(dt_utc)
    jd_ut   = float(t.ut1)
    ay      = _lahiri_ayanamsa(jd_ut)

    # Planets
    planets_out  = []
    moon_sid_lon = 0.0
    sun_sid_lon  = 0.0

    for pname, key in _PLANET_KEYS.items():
        trop = _ecl_lon(eph, key, t)
        sid  = _to_sid(trop, ay)
        nak, pada, _ = _nakshatra(sid)
        is_retro = bool(_speed(eph, key, dt_utc, ts) < 0) if pname not in ("Sun","Moon") else False

        planets_out.append({
            "name": pname,
            "longitude": round(float(sid), 4),
            "sign": SIGNS[int(sid//30)],
            "sign_en": SIGNS_EN[int(sid//30)],
            "degree_in_sign": round(float(sid%30), 2),
            "nakshatra": nak, "pada": int(pada),
            "nak_lord": NAK_LORDS[(_ := _nakshatra(sid)[2]) % 9],
            "navamsa_sign": SIGNS_EN[_navamsa(sid)],
            "retrograde": is_retro, "combust": False,
            "nature": PLANET_NATURE.get(pname, "neutral"),
        })
        if pname == "Moon": moon_sid_lon = float(sid)
        if pname == "Sun":  sun_sid_lon  = float(sid)

    # Rahu / Ketu — mean nodes (IAU polynomial, accurate < 1' for 1800-2100)
    T2       = (jd_ut - 2451545.0) / 36525.0
    rahu_t   = (125.044555 - 1934.1362608*T2 + 0.0020708*T2**2 + T2**3/450000.0) % 360
    rahu_sid = float(_to_sid(rahu_t, ay))
    ketu_sid = float((rahu_sid + 180) % 360)

    for nname, nlon in [("Rahu", rahu_sid), ("Ketu", ketu_sid)]:
        nak, pada, ni = _nakshatra(nlon)
        planets_out.append({
            "name": nname, "longitude": round(nlon,4),
            "sign": SIGNS[int(nlon//30)], "sign_en": SIGNS_EN[int(nlon//30)],
            "degree_in_sign": round(nlon%30,2), "nakshatra": nak, "pada": int(pada),
            "nak_lord": NAK_LORDS[ni % 9],
            "navamsa_sign": SIGNS_EN[_navamsa(nlon)],
            "retrograde": True, "combust": False,
            "nature": "malefic",
        })

    # Combustion
    for p in planets_out:
        if p["name"] in COMBUST_ORB:
            diff = abs(p["longitude"] - sun_sid_lon)
            if diff > 180: diff = 360 - diff
            p["combust"] = bool(diff <= COMBUST_ORB[p["name"]])

    # Lagna
    asc_trop    = _lagna(jd_ut, lat, lon)
    asc_sid     = float(_to_sid(asc_trop, ay))
    lagna_idx   = int(asc_sid // 30)
    nak, pada, ni = _nakshatra(asc_sid)
    lagna = {
        "longitude": round(asc_sid, 4),
        "sign": SIGNS[lagna_idx], "sign_en": SIGNS_EN[lagna_idx],
        "degree_in_sign": round(asc_sid % 30, 2),
        "nakshatra": nak, "pada": int(pada), "nak_lord": NAK_LORDS[ni % 9],
        "lord": SIGN_LORDS[lagna_idx],
    }

    # Whole Sign houses
    for p in planets_out:
        p["house"] = (int(p["longitude"]//30) - lagna_idx) % 12 + 1

    houses = []
    for h in range(12):
        si = (lagna_idx + h) % 12
        houses.append({
            "house": h+1,
            "sign": SIGNS[si], "sign_en": SIGNS_EN[si],
            "lord": SIGN_LORDS[si],
            "significance": HOUSE_NAMES[h],
            "planets": [p["name"] for p in planets_out if p["house"] == h+1],
        })

    # Vimshottari dasha
    span       = 360/27
    nak_idx    = int(moon_sid_lon // span)
    frac       = (moon_sid_lon % span) / span
    start_lord = NAK_LORDS[nak_idx % 9]
    idx        = [l for l,_ in DASHA_LORDS].index(start_lord)
    balance    = (1-frac) * DASHA_LORDS[idx][1]

    timeline, cur = [], date(year, month, day)
    end = _add_years(cur, balance)
    timeline.append({"lord":start_lord,"start":cur.isoformat(),"end":end.isoformat(),"years":round(balance,2)})
    cur = end
    for step in range(1,9):
        lord, yrs = DASHA_LORDS[(idx+step)%9]
        end = _add_years(cur, yrs)
        timeline.append({"lord":lord,"start":cur.isoformat(),"end":end.isoformat(),"years":yrs})
        cur = end

    today   = date.today().isoformat()
    current = next((d for d in timeline if d["start"] <= today < d["end"]), None)

    antardasha_periods, current_antardasha = [], None
    if current:
        antardasha_periods, current_antardasha = _antardasha(
            current["lord"], current["start"], current["years"])

    return {
        "ayanamsa": round(ay, 4),
        "lagna": lagna,
        "planets": planets_out,
        "houses": houses,
        "vimshottari": timeline,
        "current_dasha": current,
        "antardasha": antardasha_periods,
        "current_antardasha": current_antardasha,
        "yogas": _yogas(planets_out, lagna_idx),
    }
