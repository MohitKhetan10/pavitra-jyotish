"""
Comprehensive Hindu Kundali Compatibility Analysis.

Covers all major systems from the classical tradition:
  • Ashtakoot Milan (36-point system) — BPHS, Muhurta Chintamani
  • Rajju Dosha — rope compatibility (body-part grouping of nakshatras)
  • Vedha Dosha — nakshatra piercing pairs
  • Mahendra Koota — good fortune & longevity indicator
  • Stree-Deergha — wife's longevity and relationship endurance
  • 7th House Analysis — marital house for both charts
  • Venus & Jupiter Analysis — love and relationship karakas
  • Darakaraka — Jaimini spouse significator
  • Lagna Compatibility — ascendant relationship
  • Dasha Compatibility — timing of marriage and current life themes
  • Graha Aspecting 7th — malefic/benefic influence on marriage house
"""

# ── Nakshatra data ─────────────────────────────────────────────────────────────
# (name, gana, nadi, yoni_key, yoni_animal)
_NAK = [
    ('Ashwini',           'Deva',     'Adi',    'Ashwa',   'Horse'),
    ('Bharani',           'Manushya', 'Antya',  'Gaja',    'Elephant'),
    ('Krittika',          'Rakshasa', 'Adi',    'Mesha',   'Goat'),
    ('Rohini',            'Manushya', 'Antya',  'Sarpa',   'Snake'),
    ('Mrigashira',        'Deva',     'Madhya', 'Sarpa',   'Snake'),
    ('Ardra',             'Manushya', 'Madhya', 'Shwan',   'Dog'),
    ('Punarvasu',         'Deva',     'Adi',    'Marjara', 'Cat'),
    ('Pushya',            'Deva',     'Madhya', 'Mesha',   'Goat'),
    ('Ashlesha',          'Rakshasa', 'Antya',  'Marjara', 'Cat'),
    ('Magha',             'Rakshasa', 'Adi',    'Mushika', 'Rat'),
    ('Purva Phalguni',    'Manushya', 'Madhya', 'Mushika', 'Rat'),
    ('Uttara Phalguni',   'Manushya', 'Antya',  'Go',      'Cow/Bull'),
    ('Hasta',             'Deva',     'Adi',    'Mahisha', 'Buffalo'),
    ('Chitra',            'Rakshasa', 'Madhya', 'Vyaghra', 'Tiger'),
    ('Swati',             'Deva',     'Antya',  'Mahisha', 'Buffalo'),
    ('Vishakha',          'Rakshasa', 'Antya',  'Vyaghra', 'Tiger'),
    ('Anuradha',          'Deva',     'Madhya', 'Mriga',   'Deer'),
    ('Jyeshtha',          'Rakshasa', 'Antya',  'Mriga',   'Deer'),
    ('Mula',              'Rakshasa', 'Adi',    'Shwan',   'Dog'),
    ('Purva Ashadha',     'Manushya', 'Madhya', 'Vanara',  'Monkey'),
    ('Uttara Ashadha',    'Manushya', 'Antya',  'Nakula',  'Mongoose'),
    ('Shravana',          'Deva',     'Antya',  'Vanara',  'Monkey'),
    ('Dhanishtha',        'Rakshasa', 'Madhya', 'Simha',   'Lion'),
    ('Shatabhisha',       'Rakshasa', 'Madhya', 'Ashwa',   'Horse'),
    ('Purva Bhadrapada',  'Manushya', 'Adi',    'Simha',   'Lion'),
    ('Uttara Bhadrapada', 'Manushya', 'Antya',  'Go',      'Cow/Bull'),
    ('Revati',            'Deva',     'Antya',  'Gaja',    'Elephant'),
]

# Varna by moon sign (0=Aries)
_VARNA = {
    0:('Kshatriya',2), 1:('Vaishya',1),   2:('Shudra',0),
    3:('Brahmin',3),   4:('Kshatriya',2), 5:('Vaishya',1),
    6:('Shudra',0),    7:('Brahmin',3),   8:('Kshatriya',2),
    9:('Vaishya',1),   10:('Shudra',0),   11:('Brahmin',3),
}

_LORDS = ['Mars','Venus','Mercury','Moon','Sun','Mercury',
          'Venus','Mars','Jupiter','Saturn','Saturn','Jupiter']

_SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
          'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']

_FRIENDS = {
    'Sun':['Moon','Mars','Jupiter'],     'Moon':['Sun','Mercury'],
    'Mars':['Sun','Moon','Jupiter'],     'Mercury':['Sun','Venus'],
    'Jupiter':['Sun','Moon','Mars'],     'Venus':['Mercury','Saturn'],
    'Saturn':['Mercury','Venus'],        'Rahu':['Venus','Mercury','Saturn'],
    'Ketu':['Mars','Venus','Saturn'],
}
_ENEMIES = {
    'Sun':['Venus','Saturn'],            'Moon':['Rahu','Ketu'],
    'Mars':['Mercury'],                  'Mercury':['Moon'],
    'Jupiter':['Mercury','Venus'],       'Venus':['Sun','Moon'],
    'Saturn':['Sun','Moon','Mars'],      'Rahu':['Sun','Moon','Mars'],
    'Ketu':['Sun','Moon','Mercury'],
}

_YONI_ENEMIES = {
    frozenset(['Ashwa','Mahisha']),
    frozenset(['Gaja','Simha']),
    frozenset(['Mesha','Vanara']),
    frozenset(['Sarpa','Nakula']),
    frozenset(['Shwan','Mriga']),
    frozenset(['Marjara','Mushika']),
    frozenset(['Vyaghra','Go']),
}

# Rajju groups — nakshatras organised by body-part
_RAJJU = {
    'Shiro (Head)':   ['Mrigashira','Chitra','Dhanishtha'],
    'Kantha (Neck)':  ['Rohini','Ardra','Hasta','Swati','Shravana','Shatabhisha'],
    'Nabhi (Navel)':  ['Krittika','Punarvasu','Uttara Phalguni','Vishakha','Uttara Ashadha','Purva Bhadrapada'],
    'Kati (Waist)':   ['Bharani','Pushya','Purva Phalguni','Anuradha','Purva Ashadha','Uttara Bhadrapada'],
    'Pada (Feet)':    ['Ashwini','Ashlesha','Magha','Jyeshtha','Mula','Revati'],
}
_RAJJU_SEVERITY = {
    'Shiro (Head)':  'Most serious — affects longevity of marriage',
    'Kantha (Neck)': 'Serious — affects wife\'s well-being',
    'Nabhi (Navel)': 'Moderate — affects prosperity and children',
    'Kati (Waist)':  'Mild — affects stability and finances',
    'Pada (Feet)':   'Minor — may cause travel and separation',
}
_NAK_TO_RAJJU = {}
for rj, naks in _RAJJU.items():
    for n in naks:
        _NAK_TO_RAJJU[n] = rj

# Vedha (piercing) nakshatra pairs
_VEDHA = {
    'Ashwini':'Jyeshtha',       'Jyeshtha':'Ashwini',
    'Bharani':'Anuradha',       'Anuradha':'Bharani',
    'Krittika':'Vishakha',      'Vishakha':'Krittika',
    'Rohini':'Swati',           'Swati':'Rohini',
    'Ardra':'Shravana',         'Shravana':'Ardra',
    'Punarvasu':'Uttara Ashadha','Uttara Ashadha':'Punarvasu',
    'Pushya':'Purva Ashadha',   'Purva Ashadha':'Pushya',
    'Ashlesha':'Mula',          'Mula':'Ashlesha',
    'Magha':'Revati',           'Revati':'Magha',
    'Purva Phalguni':'Uttara Bhadrapada', 'Uttara Bhadrapada':'Purva Phalguni',
    'Uttara Phalguni':'Purva Bhadrapada', 'Purva Bhadrapada':'Uttara Phalguni',
    'Hasta':'Shatabhisha',      'Shatabhisha':'Hasta',
    'Chitra':'Dhanishtha',      'Dhanishtha':'Chitra',
}

# Nakshatra rulers for Darakaraka context
_NAK_LORD = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury']

# ── helpers ───────────────────────────────────────────────────────────────────

def _nak_idx(name):
    for i,(n,*_) in enumerate(_NAK):
        if n == name: return i
    return 0

def _sign_idx(sign_en):
    try: return _SIGNS.index(sign_en)
    except: return 0

def _planet(chart, name):
    for p in chart['planets']:
        if p['name'] == name: return p
    return {}

def _house(chart, num):
    for h in chart['houses']:
        if h['house'] == num: return h
    return {}

def _planet_relation(p1, p2):
    if p1 == p2: return 'same'
    f1 = p2 in _FRIENDS.get(p1, [])
    f2 = p1 in _FRIENDS.get(p2, [])
    e1 = p2 in _ENEMIES.get(p1, [])
    e2 = p1 in _ENEMIES.get(p2, [])
    if f1 and f2:   return 'great_friends'
    if f1 or f2:    return 'friends'
    if e1 and e2:   return 'enemies'
    if e1 or e2:    return 'mixed'
    return 'neutral'

def _sign_relation(s1, s2):
    return _planet_relation(_LORDS[s1], _LORDS[s2])

# ── Ashtakoot kootas ──────────────────────────────────────────────────────────

def _varna(s1, s2):
    _, r1 = _VARNA.get(s1, ('Vaishya',1))
    _, r2 = _VARNA.get(s2, ('Vaishya',1))
    diff = abs(r1 - r2)
    if diff == 0: return 1.0
    if diff == 1: return 0.5
    return 0.0

def _vashya(s1, s2):
    groups = {0:'Chatushpad',1:'Chatushpad',2:'Dwipad',3:'Jalachara',
              4:'Vanachara',5:'Dwipad',6:'Dwipad',7:'Keeta',
              8:'Dwipad',9:'Chatushpad',10:'Dwipad',11:'Jalachara'}
    g1, g2 = groups.get(s1,'Dwipad'), groups.get(s2,'Dwipad')
    if g1 == g2: return 2.0
    if frozenset([g1,g2]) in {frozenset(['Chatushpad','Vanachara']),frozenset(['Dwipad','Jalachara'])}:
        return 1.0
    return 0.5

def _tara(n1, n2):
    good = {2,4,6,8,0}
    def ok(frm,to): t=(to-frm)%27%9; return t in good
    a,b = ok(n1,n2), ok(n2,n1)
    if a and b: return 3.0
    if a or b:  return 1.5
    return 0.0

def _yoni(y1, y2):
    if y1 == y2: return 4.0
    if frozenset([y1,y2]) in _YONI_ENEMIES: return 0.0
    return 2.0

def _graha_maitri(s1, s2):
    l1, l2 = _LORDS[s1], _LORDS[s2]
    if l1 == l2: return 5.0
    f1 = l2 in _FRIENDS.get(l1,[]);  f2 = l1 in _FRIENDS.get(l2,[])
    e1 = l2 in _ENEMIES.get(l1,[]);  e2 = l1 in _ENEMIES.get(l2,[])
    if f1 and f2:       return 5.0
    if f1 and not e2:   return 4.0
    if f2 and not e1:   return 4.0
    if f1 or f2:        return 3.0
    if not e1 and not e2: return 2.5
    if e1 and e2:       return 0.0
    return 1.0

def _gana(g1, g2):
    if g1 == g2: return 6.0
    return {frozenset(['Deva','Manushya']):5.0,
            frozenset(['Deva','Rakshasa']):1.0,
            frozenset(['Manushya','Rakshasa']):0.0}.get(frozenset([g1,g2]),0.0)

def _bhakoot(s1, s2):
    d = (s2-s1)%12
    return 0.0 if d in {1,4,5,7,8,11} else 7.0

def _nadi(n1, n2):
    return 0.0 if n1==n2 else 8.0

# ── Extended Kootas ───────────────────────────────────────────────────────────

def _mahendra(n1, n2):
    """Count from P1's nak to P2's nak; auspicious if falls on 4,7,10,13,16,19,22,25."""
    count = (n2 - n1) % 27 + 1
    good = count in {4,7,10,13,16,19,22,25}
    return {
        'count': count,
        'auspicious': good,
        'desc': (
            f"Person 2's nakshatra is {count} positions from Person 1's — this is an auspicious "
            f"Mahendra count. This combination brings good fortune, prosperity, and long life to the couple."
            if good else
            f"Person 2's nakshatra is {count} positions from Person 1's — this count is neutral for Mahendra. "
            f"The union can be strengthened through conscious effort and appropriate worship."
        ),
    }

def _stree_deergha(n1, n2):
    """P2's nak should be more than 9 positions ahead of P1's for relationship endurance."""
    count = (n2 - n1) % 27 + 1
    good  = count > 9
    return {
        'count': count,
        'auspicious': good,
        'desc': (
            f"Person 2's nakshatra falls {count} positions from Person 1's (>{9} required). "
            f"Stree-Deergha is satisfied — the relationship endures and the female partner's well-being is protected."
            if good else
            f"Person 2's nakshatra falls only {count} positions from Person 1's (>9 required). "
            f"Stree-Deergha concern — specific protective remedies are recommended for the female partner's health and longevity."
        ),
    }

# ── Rajju Dosha ───────────────────────────────────────────────────────────────

def _rajju_dosha(n1_name, n2_name):
    r1 = _NAK_TO_RAJJU.get(n1_name, 'Unknown')
    r2 = _NAK_TO_RAJJU.get(n2_name, 'Unknown')
    same = (r1 == r2)
    severity = _RAJJU_SEVERITY.get(r1, '') if same else ''
    return {
        'p1_rajju': r1, 'p2_rajju': r2,
        'dosha': same,
        'severity': severity,
        'desc': (
            f"Rajju Dosha is present — both nakshatras fall in the {r1} group. {severity}. "
            f"This is a significant dosha requiring specific remedies before marriage. "
            f"A learned Jyotishi should be consulted for the appropriate Dosha Shanti puja."
            if same else
            f"No Rajju Dosha. Person 1 is in {r1} and Person 2 is in {r2} — different groups. "
            f"This is highly auspicious and indicates long life and harmony in the marital bond."
        ),
    }

# ── Vedha Dosha ───────────────────────────────────────────────────────────────

def _vedha_dosha(n1_name, n2_name):
    if n1_name == n2_name:
        dosha = False
        desc  = "Same nakshatra — Vedha does not apply. The partners share identical lunar energy."
    else:
        dosha = _VEDHA.get(n1_name) == n2_name
        desc  = (
            f"Vedha Dosha present — {n1_name} and {n2_name} are classical vedha (piercing) nakshatras. "
            f"They create energetic friction that must be resolved through Navagraha puja and specific mantras before marriage."
            if dosha else
            f"No Vedha Dosha. {n1_name} and {n2_name} are compatible and do not pierce each other. Auspicious."
        )
    return {'dosha': dosha, 'p1_nak': n1_name, 'p2_nak': n2_name, 'desc': desc}

# ── Mangal Dosha (with cancellations) ────────────────────────────────────────

def _mangal_dosha(chart1, chart2):
    def mars_data(chart):
        m = _planet(chart, 'Mars')
        h = m.get('house', 0)
        s = m.get('sign_en', '')
        dosha = h in {1,2,4,7,8,12}
        # Cancellations (Dosha Nivarana)
        cancel_reasons = []
        if s in ['Aries','Scorpio']: cancel_reasons.append("Mars in own sign")
        if s == 'Capricorn':         cancel_reasons.append("Mars exalted")
        if h == 1 and s in ['Aries','Scorpio']: cancel_reasons.append("Mars in own sign in 1st house")
        jup = _planet(chart, 'Jupiter')
        if jup.get('house') == h:     cancel_reasons.append("Jupiter conjunct Mars")
        moon = _planet(chart, 'Moon')
        if moon.get('sign_en') in ['Aries','Scorpio']: cancel_reasons.append("Moon in Mars sign")
        lagna_sign = chart['lagna'].get('sign_en','')
        if lagna_sign in ['Aries','Scorpio','Aquarius','Cancer']: cancel_reasons.append(f"{lagna_sign} lagna neutralises")
        cancelled = bool(cancel_reasons)
        return {'house': h, 'sign': s, 'dosha': dosha,
                'cancelled': cancelled, 'cancel_reasons': cancel_reasons}

    d1 = mars_data(chart1)
    d2 = mars_data(chart2)
    both = d1['dosha'] and d2['dosha']
    mutual_cancel = both  # Both having Mangal Dosha always cancels

    desc_1 = (
        f"Person 1 has Mangal Dosha (Mars in House {d1['house']} — {d1['sign']}). "
        + (f"However, this is cancelled because: {', '.join(d1['cancel_reasons'])}. " if d1['cancelled'] else "")
    ) if d1['dosha'] else f"Person 1 has no Mangal Dosha (Mars in House {d1['house']})."

    desc_2 = (
        f"Person 2 has Mangal Dosha (Mars in House {d2['house']} — {d2['sign']}). "
        + (f"However, this is cancelled because: {', '.join(d2['cancel_reasons'])}. " if d2['cancelled'] else "")
    ) if d2['dosha'] else f"Person 2 has no Mangal Dosha (Mars in House {d2['house']})."

    if mutual_cancel:
        overall = "Both persons have Mangal Dosha — this is mutually cancelled. Marriage is fully permitted. This combination often creates passion and strength in the relationship."
    elif d1['dosha'] and d1['cancelled']:
        overall = "Person 1 has Mangal Dosha but classical cancellations apply. Remedies are still advisable."
    elif d2['dosha'] and d2['cancelled']:
        overall = "Person 2 has Mangal Dosha but classical cancellations apply. Remedies are still advisable."
    elif d1['dosha'] or d2['dosha']:
        overall = "Mangal Dosha is present without full cancellation. Marriage should be preceded by Kuja Dosha Shanti puja, specific Mars remedies, and ideally matching with a partner who also has Mangal Dosha."
    else:
        overall = "No Mangal Dosha in either chart. This is auspicious for a harmonious and long-lasting marriage."

    return {
        'p1': d1, 'p2': d2,
        'both_have_dosha': both,
        'overall': overall,
        'p1_desc': desc_1, 'p2_desc': desc_2,
    }

# ── 7th House Analysis ────────────────────────────────────────────────────────

def _seventh_house_analysis(chart1, chart2):
    def h7_info(chart, label):
        h7  = _house(chart, 7)
        lord_name = h7.get('lord', '')
        lord_p = _planet(chart, lord_name) if lord_name else {}
        lord_placed = f"{lord_name} in {lord_p.get('sign_en','?')} (House {lord_p.get('house','?')})" if lord_name else "Unknown"

        planets_in_7 = h7.get('planets', [])
        malefics_in_7 = [p for p in planets_in_7 if p in ('Saturn','Mars','Rahu','Ketu','Sun')]
        benefics_in_7 = [p for p in planets_in_7 if p in ('Jupiter','Venus','Moon','Mercury')]

        # Planets aspecting 7th (full aspect)
        # Jupiter (5,7,9), Saturn (3,7,10), Mars (4,7,8), Rahu/Ketu (7th from themselves = 1st)
        aspecting = []
        for p in chart['planets']:
            if p['name'] in ('Rahu','Ketu'): continue
            h = p.get('house',0)
            seventh_house_num = 7
            diff = (seventh_house_num - h) % 12
            if p['name'] in ('Jupiter',) and diff in {0,4,6,8}: aspecting.append(p['name'])
            elif p['name'] == 'Saturn' and diff in {0,2,6,9}: aspecting.append(p['name'])
            elif p['name'] == 'Mars' and diff in {0,3,6,7}: aspecting.append(p['name'])
            elif diff == 6: aspecting.append(p['name'])  # 7th aspect (all planets)

        aspecting = list(set(aspecting))
        ben_asp  = [x for x in aspecting if x in ('Jupiter','Venus','Moon','Mercury')]
        mal_asp  = [x for x in aspecting if x in ('Saturn','Mars','Rahu','Ketu','Sun')]

        strength = "Strong" if benefics_in_7 or ben_asp else ("Afflicted" if (malefics_in_7 or mal_asp) else "Moderate")

        return {
            'sign': h7.get('sign_en','?'),
            'lord': lord_name,
            'lord_placed': lord_placed,
            'planets_in': planets_in_7,
            'malefics_in': malefics_in_7,
            'benefics_in': benefics_in_7,
            'aspecting': aspecting,
            'benefic_aspects': ben_asp,
            'malefic_aspects': mal_asp,
            'strength': strength,
            'desc': (
                f"{label}'s 7th house is {h7.get('sign_en','?')} with lord {lord_name} placed as {lord_placed}. "
                + (f"Benefic planets ({', '.join(benefics_in_7)}) occupy the house — excellent for marriage. " if benefics_in_7 else "")
                + (f"Malefic planets ({', '.join(malefics_in_7)}) occupy the house — specific remedies recommended. " if malefics_in_7 else "")
                + (f"Jupiter/Venus aspects strengthen the house. " if ben_asp else "")
                + (f"Malefic aspects ({', '.join(mal_asp)}) require attention. " if mal_asp else "")
                + f"Overall 7th house strength: {strength}."
            ),
        }

    return {
        'p1': h7_info(chart1, "Person 1"),
        'p2': h7_info(chart2, "Person 2"),
    }

# ── Venus & Jupiter Analysis ──────────────────────────────────────────────────

def _venus_jupiter_analysis(chart1, chart2):
    def vj(chart, label):
        v = _planet(chart, 'Venus')
        j = _planet(chart, 'Jupiter')
        lagna = chart['lagna']

        v_dignity = ('Exalted' if v.get('sign_en') == 'Pisces' else
                     'Own Sign' if v.get('sign_en') in ['Taurus','Libra'] else
                     'Debilitated' if v.get('sign_en') == 'Virgo' else 'Placed')
        j_dignity = ('Exalted' if j.get('sign_en') == 'Cancer' else
                     'Own Sign' if j.get('sign_en') in ['Sagittarius','Pisces'] else
                     'Debilitated' if j.get('sign_en') == 'Capricorn' else 'Placed')

        v_house = v.get('house',0)
        j_house = j.get('house',0)

        # Venus in good houses for marriage: 1,2,4,5,7,9,11
        v_strong = v_house in {1,2,4,5,7,9,11} and v_dignity in ('Exalted','Own Sign')
        # Jupiter for husband quality (for women) in 1,5,7,9
        j_for_husband = j_house in {1,5,7,9}

        return {
            'venus_sign': v.get('sign_en','?'),
            'venus_house': v_house,
            'venus_dignity': v_dignity,
            'venus_nakshatra': v.get('nakshatra','?'),
            'jupiter_sign': j.get('sign_en','?'),
            'jupiter_house': j_house,
            'jupiter_dignity': j_dignity,
            'venus_strong': v_strong,
            'desc': (
                f"{label} — Venus ({v_dignity}) in {v.get('sign_en','?')} House {v_house}: "
                + ("strong position for love and marriage. " if v_strong else "moderate placement for relationship matters. ")
                + f"Jupiter ({j_dignity}) in {j.get('sign_en','?')} House {j_house}: "
                + ("excellent for wisdom and dharmic marriage. " if j_house in {1,5,7,9} else "functional placement. ")
            ),
        }

    # Cross-chart Venus relationship
    v1 = _planet(chart1, 'Venus')
    v2 = _planet(chart2, 'Venus')
    j1 = _planet(chart1, 'Jupiter')
    j2 = _planet(chart2, 'Jupiter')

    v_rel = _sign_idx(v1.get('sign_en','Aries'))
    v_rel2 = _sign_idx(v2.get('sign_en','Aries'))
    venus_compat = _planet_relation(_LORDS[v_rel], _LORDS[v_rel2])

    return {
        'p1': vj(chart1, "Person 1"),
        'p2': vj(chart2, "Person 2"),
        'venus_compatibility': venus_compat,
        'venus_compat_desc': {
            'great_friends': "Both Venus placements are in strongly friendly signs — exceptional romantic harmony and shared aesthetic values.",
            'same':          "Both Venus in same element/lord — deep romantic resonance and similar expressions of love.",
            'friends':       "Venus placements are friendly — natural attraction and good romantic compatibility.",
            'neutral':       "Venus placements are neutral — love can develop through mutual effort and understanding.",
            'mixed':         "Venus placements have some tension — differences in love styles that can be harmonized with awareness.",
            'enemies':       "Venus placements are in conflicting signs — significant differences in love nature. Conscious communication is essential.",
        }.get(venus_compat, "Moderate romantic compatibility."),
    }

# ── Darakaraka (Jaimini Spouse Significator) ─────────────────────────────────

def _darakaraka_analysis(chart1, chart2):
    def dk(chart):
        # Exclude Rahu and Ketu (traditional Jaimini)
        planets = [p for p in chart['planets'] if p['name'] not in ('Rahu','Ketu')]
        if not planets: return {}
        dkp = min(planets, key=lambda p: p.get('degree_in_sign', 0))
        return dkp

    dk1 = dk(chart1)  # Person 1's DK (describes their spouse)
    dk2 = dk(chart2)

    def dk_desc(dkp, person):
        if not dkp: return ""
        name = dkp.get('name','')
        sign = dkp.get('sign_en','')
        house = dkp.get('house',0)
        nak   = dkp.get('nakshatra','')
        descs = {
            'Sun': f"{person}'s Darakaraka is Sun — the spouse will be dignified, authoritative, and soul-centred. Strong ego; needs respect.",
            'Moon': f"{person}'s Darakaraka is Moon — the spouse is emotionally sensitive, nurturing, and home-loving.",
            'Mars': f"{person}'s Darakaraka is Mars — the spouse is energetic, courageous, and passionate. Strong-willed.",
            'Mercury': f"{person}'s Darakaraka is Mercury — the spouse is intelligent, witty, and communicative. Youthful energy.",
            'Jupiter': f"{person}'s Darakaraka is Jupiter — the spouse is wise, dharmic, and spiritually inclined. A true guru-partner.",
            'Venus': f"{person}'s Darakaraka is Venus — the spouse is beautiful, artistic, and pleasure-loving. Deep romantic nature.",
            'Saturn': f"{person}'s Darakaraka is Saturn — the spouse may be older, disciplined, or from a different social background. Deep loyalty over time.",
        }
        base = descs.get(name, f"{person}'s Darakaraka is {name}.")
        return f"{base} Placed in {sign} (House {house}) — {nak} nakshatra."

    # Cross-analysis: DK1 compared to P2's chart energy
    dk1_in_p2 = ""
    if dk1:
        dk1_name = dk1.get('name','')
        p2_dk1_planet = _planet(chart2, dk1_name)
        if p2_dk1_planet:
            dk1_in_p2 = (f"Person 1's Darakaraka ({dk1_name}) is in House {p2_dk1_planet.get('house','?')} "
                         f"in Person 2's chart — showing how the spouse image activates Person 2's life.")

    return {
        'p1_dk': dk1,
        'p2_dk': dk2,
        'p1_dk_desc': dk_desc(dk1, "Person 1"),
        'p2_dk_desc': dk_desc(dk2, "Person 2"),
        'cross_desc':  dk1_in_p2,
    }

# ── Lagna Compatibility ───────────────────────────────────────────────────────

def _lagna_compatibility(chart1, chart2):
    l1 = chart1['lagna']
    l2 = chart2['lagna']
    s1 = _sign_idx(l1.get('sign_en','Aries'))
    s2 = _sign_idx(l2.get('sign_en','Aries'))
    diff = abs(s1 - s2)
    trine = diff in {0, 4, 8}    # Same, 5th, 9th from each other
    kendra = diff in {0, 3, 6, 9} # 1-4-7-10 relationship

    lord_rel = _planet_relation(l1.get('lord',''), l2.get('lord',''))
    # Is P1's moon in P2's lagna sign?
    m1 = _planet(chart1, 'Moon')
    m2 = _planet(chart2, 'Moon')
    moon1_in_l2 = m1.get('sign_en') == l2.get('sign_en')
    moon2_in_l1 = m2.get('sign_en') == l1.get('sign_en')

    compat_level = (
        "Excellent" if (trine and lord_rel in ('great_friends','friends','same')) else
        "Good"      if (kendra or trine) else
        "Moderate"  if lord_rel in ('friends','neutral') else
        "Challenging"
    )

    return {
        'p1_lagna': l1.get('sign_en'), 'p1_lord': l1.get('lord'),
        'p2_lagna': l2.get('sign_en'), 'p2_lord': l2.get('lord'),
        'relationship': 'Trine' if trine else 'Kendra' if kendra else 'Other',
        'lord_relationship': lord_rel,
        'moon1_in_lagna2': moon1_in_l2,
        'moon2_in_lagna1': moon2_in_l1,
        'compatibility': compat_level,
        'desc': (
            f"Person 1 rises in {l1.get('sign_en')} (lord {l1.get('lord')}) and "
            f"Person 2 rises in {l2.get('sign_en')} (lord {l2.get('lord')}). "
            f"Lagna signs are in a {'trine' if trine else 'kendra' if kendra else 'non-kendra/trine'} relationship. "
            f"Lagna lords are {lord_rel.replace('_',' ')}. "
            + ("Person 1's Moon in Person 2's lagna sign — very powerful soul connection. " if moon1_in_l2 else "")
            + ("Person 2's Moon in Person 1's lagna sign — very powerful soul connection. " if moon2_in_l1 else "")
            + f"Overall lagna compatibility: {compat_level}."
        ),
    }

# ── Dasha Compatibility & Timing ─────────────────────────────────────────────

def _dasha_compatibility(chart1, chart2):
    d1  = chart1.get('current_dasha', {})
    d2  = chart2.get('current_dasha', {})
    ad1 = chart1.get('current_antardasha', {})
    ad2 = chart2.get('current_antardasha', {})

    MARRIAGE_LORDS = {'Jupiter', 'Venus', 'Moon', 'Mercury'}
    CHALLENGING    = {'Saturn', 'Rahu', 'Ketu', 'Mars', 'Sun'}

    l1 = d1.get('lord','')
    l2 = d2.get('lord','')
    al1 = ad1.get('lord','') if ad1 else ''
    al2 = ad2.get('lord','') if ad2 else ''

    p1_favorable = l1 in MARRIAGE_LORDS or al1 in MARRIAGE_LORDS
    p2_favorable = l2 in MARRIAGE_LORDS or al2 in MARRIAGE_LORDS
    both_favorable = p1_favorable and p2_favorable

    def dasha_quality(lord, alord):
        if lord in MARRIAGE_LORDS: return "marriage-supportive"
        if lord in CHALLENGING and alord in MARRIAGE_LORDS: return "partially supportive via antardasha"
        if lord in CHALLENGING: return "requires careful timing — not ideal for marriage currently"
        return "neutral"

    return {
        'p1_mahadasha': l1,   'p1_mahadasha_end': d1.get('end',''),
        'p2_mahadasha': l2,   'p2_mahadasha_end': d2.get('end',''),
        'p1_antardasha': al1, 'p1_antardasha_end': ad1.get('end','') if ad1 else '',
        'p2_antardasha': al2, 'p2_antardasha_end': ad2.get('end','') if ad2 else '',
        'p1_quality': dasha_quality(l1, al1),
        'p2_quality': dasha_quality(l2, al2),
        'both_favorable': both_favorable,
        'desc': (
            f"Person 1 is currently in {l1} Mahadasha / {al1} Antardasha (until {d1.get('end','?')}) — {dasha_quality(l1, al1)}. "
            f"Person 2 is in {l2} Mahadasha / {al2} Antardasha (until {d2.get('end','?')}) — {dasha_quality(l2, al2)}. "
            + ("Both dashas support marriage — the timing is auspicious for proceeding with marriage plans." if both_favorable else
               "Dasha analysis suggests waiting for a more supportive planetary period before finalizing marriage, or performing remedies to smooth the current period.")
        ),
    }

# ── Rahu/Ketu Karmic Axis ────────────────────────────────────────────────────

def _rahu_ketu_axis(chart1, chart2):
    r1 = _planet(chart1, 'Rahu')
    r2 = _planet(chart2, 'Rahu')
    k1 = _planet(chart1, 'Ketu')
    k2 = _planet(chart2, 'Ketu')

    # Check if P1's Rahu is conjunct P2's Moon, Venus, or Lagna
    p2_moon  = _planet(chart2, 'Moon')
    p1_moon  = _planet(chart1, 'Moon')

    strong_connection = (
        r1.get('sign_en') == p2_moon.get('sign_en') or
        r2.get('sign_en') == p1_moon.get('sign_en') or
        k1.get('sign_en') == p2_moon.get('sign_en') or
        k2.get('sign_en') == p1_moon.get('sign_en')
    )

    return {
        'p1_rahu': r1.get('sign_en'), 'p1_rahu_house': r1.get('house'),
        'p2_rahu': r2.get('sign_en'), 'p2_rahu_house': r2.get('house'),
        'p1_ketu': k1.get('sign_en'), 'p1_ketu_house': k1.get('house'),
        'p2_ketu': k2.get('sign_en'), 'p2_ketu_house': k2.get('house'),
        'karmic_connection': strong_connection,
        'desc': (
            f"Person 1 — Rahu in {r1.get('sign_en')} House {r1.get('house')} · "
            f"Ketu in {k1.get('sign_en')} House {k1.get('house')}. "
            f"Person 2 — Rahu in {r2.get('sign_en')} House {r2.get('house')} · "
            f"Ketu in {k2.get('sign_en')} House {k2.get('house')}. "
            + ("The nodal axis connects strongly with the partner's Moon — this indicates a deep past-life karmic bond. "
               "The relationship carries unresolved karma that this lifetime is meant to heal and complete. "
               "Such unions are intense, fated, and deeply transformative." if strong_connection else
               "No direct Rahu/Ketu conjunction with partner's Moon, suggesting a fresh karmic start. "
               "The relationship builds new karma rather than resolving old patterns.")
        ),
    }

# ── Main Function ─────────────────────────────────────────────────────────────

def compute_match(chart1, chart2):
    m1 = _planet(chart1, 'Moon') or {}
    m2 = _planet(chart2, 'Moon') or {}

    n1_name = m1.get('nakshatra', 'Ashwini')
    n2_name = m2.get('nakshatra', 'Ashwini')
    n1 = _nak_idx(n1_name)
    n2 = _nak_idx(n2_name)
    s1 = _sign_idx(m1.get('sign_en', 'Aries'))
    s2 = _sign_idx(m2.get('sign_en', 'Aries'))

    _, gana1, nadi1, yoni1, animal1 = _NAK[n1]
    _, gana2, nadi2, yoni2, animal2 = _NAK[n2]
    varna1, _ = _VARNA.get(s1, ('Vaishya', 1))
    varna2, _ = _VARNA.get(s2, ('Vaishya', 1))

    va = _varna(s1, s2);       vs = _vashya(s1, s2)
    ta = _tara(n1, n2);        yo = _yoni(yoni1, yoni2)
    gm = _graha_maitri(s1, s2); ga = _gana(gana1, gana2)
    bh = _bhakoot(s1, s2);     na = _nadi(nadi1, nadi2)
    total = va + vs + ta + yo + gm + ga + bh + na

    if total >= 30:   verdict, vcol = "Excellent Match",   "#44cc88"
    elif total >= 24: verdict, vcol = "Good Match",        "#88cc44"
    elif total >= 18: verdict, vcol = "Acceptable",        "#ddaa00"
    elif total >= 12: verdict, vcol = "Below Average",     "#ff8800"
    else:             verdict, vcol = "Not Recommended",   "#cc3300"

    return {
        'p1_moon': {
            'sign': m1.get('sign_en'), 'nakshatra': n1_name,
            'pada': m1.get('pada'),    'degree': m1.get('degree_in_sign'),
            'gana': gana1, 'nadi': nadi1, 'varna': varna1,
            'yoni': yoni1, 'animal': animal1, 'lord': _LORDS[s1],
        },
        'p2_moon': {
            'sign': m2.get('sign_en'), 'nakshatra': n2_name,
            'pada': m2.get('pada'),    'degree': m2.get('degree_in_sign'),
            'gana': gana2, 'nadi': nadi2, 'varna': varna2,
            'yoni': yoni2, 'animal': animal2, 'lord': _LORDS[s2],
        },
        'kootas': [
            {'name':'Varna',       'max':1,'score':va,'desc':'Spiritual compatibility','detail':f"P1:{varna1} · P2:{varna2}"},
            {'name':'Vashya',      'max':2,'score':vs,'desc':'Attraction & control',  'detail':'Moon sign groups'},
            {'name':'Tara',        'max':3,'score':ta,'desc':'Birth star harmony',    'detail':f"P1:{n1_name} · P2:{n2_name}"},
            {'name':'Yoni',        'max':4,'score':yo,'desc':'Physical harmony',      'detail':f"P1:{animal1} · P2:{animal2}"},
            {'name':'Graha Maitri','max':5,'score':gm,'desc':'Mind & intellect',      'detail':f"P1 lord:{_LORDS[s1]} · P2 lord:{_LORDS[s2]}"},
            {'name':'Gana',        'max':6,'score':ga,'desc':'Temperament',           'detail':f"P1:{gana1} · P2:{gana2}"},
            {'name':'Bhakoot',     'max':7,'score':bh,'desc':'Emotional prosperity',  'detail':f"Moons:{m1.get('sign_en')} & {m2.get('sign_en')}"},
            {'name':'Nadi',        'max':8,'score':na,'desc':'Health & progeny',      'detail':f"P1:{nadi1} · P2:{nadi2}"},
        ],
        'total': round(total,1), 'max': 36,
        'verdict': verdict,  'verdict_color': vcol,

        # Extended analyses
        'mahendra':      _mahendra(n1, n2),
        'stree_deergha': _stree_deergha(n1, n2),
        'rajju':         _rajju_dosha(n1_name, n2_name),
        'vedha':         _vedha_dosha(n1_name, n2_name),
        'mangal':        _mangal_dosha(chart1, chart2),
        'nadi_dosha': {
            'present': nadi1 == nadi2,
            'desc': (
                f"Nadi Dosha — both in {nadi1} Nadi. Most serious dosha affecting health and progeny. "
                f"Nadi Dosha Shanti puja, Mahamrityunjaya Japa (125,000 times), and Navagraha Shanti are essential."
                if nadi1 == nadi2 else
                f"No Nadi Dosha. P1: {nadi1} · P2: {nadi2} — different nadis. Excellent for health and offspring."
            ),
        },
        'bhakoot_dosha': {
            'present': bh == 0.0,
            'desc': (
                f"Bhakoot Dosha — moon signs in {m1.get('sign_en')} and {m2.get('sign_en')} create a 6-8, 5-9, or 2-12 pattern. "
                f"Can affect financial prosperity. Remedies: Vishnu Sahasranama and Rudrabhishek together before marriage."
                if bh == 0.0 else
                f"No Bhakoot Dosha. Moon sign relationship is harmonious and prosperity-supporting."
            ),
        },
        'seventh_house':     _seventh_house_analysis(chart1, chart2),
        'venus_jupiter':     _venus_jupiter_analysis(chart1, chart2),
        'darakaraka':        _darakaraka_analysis(chart1, chart2),
        'lagna':             _lagna_compatibility(chart1, chart2),
        'dasha':             _dasha_compatibility(chart1, chart2),
        'rahu_ketu':         _rahu_ketu_axis(chart1, chart2),
    }
