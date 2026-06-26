"""
Classical Jyotish interpretation engine.
Rule-based, unlimited, free forever.
Sources: Brihat Parashara Hora Shastra, Saravali, Phaladeepika, Jataka Parijata.
"""

# ── CONSTANTS ─────────────────────────────────────────────────────────────────

SIGN_LORDS = {
    'Aries':'Mars','Taurus':'Venus','Gemini':'Mercury','Cancer':'Moon',
    'Leo':'Sun','Virgo':'Mercury','Libra':'Venus','Scorpio':'Mars',
    'Sagittarius':'Jupiter','Capricorn':'Saturn','Aquarius':'Saturn','Pisces':'Jupiter'
}

EXALTATION = {
    'Sun':'Aries','Moon':'Taurus','Mars':'Capricorn','Mercury':'Virgo',
    'Jupiter':'Cancer','Venus':'Pisces','Saturn':'Libra',
    'Rahu':'Gemini','Ketu':'Sagittarius'
}
EXALT_DEG = {
    'Sun':10,'Moon':3,'Mars':28,'Mercury':15,'Jupiter':5,'Venus':27,'Saturn':20
}

DEBILITATION = {
    'Sun':'Libra','Moon':'Scorpio','Mars':'Cancer','Mercury':'Pisces',
    'Jupiter':'Capricorn','Venus':'Virgo','Saturn':'Aries',
    'Rahu':'Sagittarius','Ketu':'Gemini'
}

OWN_SIGNS = {
    'Sun':['Leo'],'Moon':['Cancer'],'Mars':['Aries','Scorpio'],
    'Mercury':['Gemini','Virgo'],'Jupiter':['Sagittarius','Pisces'],
    'Venus':['Taurus','Libra'],'Saturn':['Capricorn','Aquarius'],
    'Rahu':[],'Ketu':[]
}

HOUSE_NAMES = {
    1:'Tanu (Self)',2:'Dhana (Wealth)',3:'Sahaja (Siblings & Courage)',
    4:'Sukha (Home & Mother)',5:'Putra (Children & Intelligence)',
    6:'Ripu (Enemies & Health)',7:'Kalatra (Marriage & Partnership)',
    8:'Mrityu (Longevity & Transformation)',9:'Dharma (Fortune & Father)',
    10:'Karma (Career & Status)',11:'Labha (Gains & Friends)',
    12:'Vyaya (Loss, Liberation & Foreign)'
}

PLANET_NATURE = {
    'Sun':'Natural malefic — karaka for soul, father, authority, health, government',
    'Moon':'Natural benefic — karaka for mind, mother, emotions, public, liquids',
    'Mars':'Natural malefic — karaka for siblings, courage, land, blood, accidents',
    'Mercury':'Natural benefic — karaka for intellect, speech, trade, skin, nervous system',
    'Jupiter':'Natural benefic — karaka for wisdom, children, guru, dharma, wealth',
    'Venus':'Natural benefic — karaka for marriage, beauty, vehicles, art, luxury',
    'Saturn':'Natural malefic — karaka for longevity, service, karma, discipline, masses',
    'Rahu':'Shadow malefic — foreign, illusion, obsession, technology, sudden gains',
    'Ketu':'Shadow malefic — liberation, past life, spirituality, detachment, hidden wisdom'
}

# ── LAGNA INTERPRETATIONS ─────────────────────────────────────────────────────

LAGNA = {
    'Aries': {
        'title':'Mesha Lagna — The Pioneer',
        'lord':'Mars',
        'nature':'Fire · Movable · Masculine',
        'core':"Ruled by Mars, you are the archetype of the warrior and pioneer — bold, direct, and fiercely independent. You lead from the front, act before thinking, and recover quickly from setbacks. The body is strong with a distinctive face, often with a mark or scar near the head. Competitive by nature, honest to the point of bluntness, and deeply motivated by challenge. Your life path is one of initiation — you are built to begin things, break new ground, and inspire others into action. The soul lesson is patience and follow-through.",
        'strengths':'Courage, raw leadership, physical vitality, honesty, initiative',
        'challenges':'Temper, impatience, recklessness, head injuries, burns',
        'body':'Head, brain, eyes, blood, bone marrow',
        'career':'Military, surgery, engineering, sports, entrepreneurship, law enforcement',
        'deity':'Hanuman, Mangal, Kartikeya'
    },
    'Taurus': {
        'title':'Vrishabha Lagna — The Builder',
        'lord':'Venus',
        'nature':'Earth · Fixed · Feminine',
        'core':"Venus-ruled, you are the builder of beauty and stability — patient, sensual, and deeply attached to comfort, security, and permanence. You build slowly but permanently. The throat and voice are often beautiful or distinctive. Wealth accumulates steadily through your own effort. Art, music, food, and material refinement are natural domains. You resist change intensely and can be immovable once decided. The soul lesson is releasing attachment — to things, to people, to the way things were.",
        'strengths':'Patience, financial intelligence, artistic ability, reliability, sensuality',
        'challenges':'Stubbornness, possessiveness, overindulgence, resistance to necessary change',
        'body':'Throat, neck, thyroid, face, tongue, tonsils',
        'career':'Finance, music, art, agriculture, cooking, real estate, luxury goods',
        'deity':'Lakshmi, Shukra, Taurus deity'
    },
    'Gemini': {
        'title':'Mithuna Lagna — The Communicator',
        'lord':'Mercury',
        'nature':'Air · Dual · Masculine',
        'core':"Mercury-ruled, you process the world through words, ideas, and connections. Quick-minded, versatile, and socially fluent, you move across subjects, cultures, and social circles with ease. The body is lean and youthful — often appearing younger than actual age. You pursue multiple interests simultaneously and adapt to any environment. The challenge is depth: the Gemini rising native must learn to convert breadth of knowledge into mastery. Nervousness and scattered energy are the shadows of your brilliance.",
        'strengths':'Intelligence, communication, adaptability, curiosity, wit, writing ability',
        'challenges':'Inconsistency, anxiety, superficiality, dual-mindedness, nervous exhaustion',
        'body':'Lungs, shoulders, arms, hands, nervous system',
        'career':'Writing, journalism, teaching, trading, IT, marketing, law, translation',
        'deity':'Saraswati, Budha, Vishnu'
    },
    'Cancer': {
        'title':'Karka Lagna — The Nurturer',
        'lord':'Moon',
        'nature':'Water · Movable · Feminine',
        'core':"Ruled by the Moon, you feel the world before you think about it — empathy and intuition are your primary instruments. The face is often round with expressive eyes that absorb everything. Home, family, and mother are central to your story. You are fiercely protective of those you love and genuinely affected by lunar phases — moods cycle with the Moon. The public responds to you warmly because Cancer is a sign of the masses. Your soul lesson is emotional self-sufficiency — learning to nourish yourself as you nourish others.",
        'strengths':'Empathy, intuition, nurturing, memory, emotional intelligence, public appeal',
        'challenges':'Moodiness, over-attachment, emotional manipulation, inability to let go',
        'body':'Chest, breasts, stomach, lower lungs, lymphatic system',
        'career':'Healthcare, hospitality, real estate, food, politics, social work, counselling',
        'deity':'Chandra, Devi, Durga, Lakshmi'
    },
    'Leo': {
        'title':'Simha Lagna — The Sovereign',
        'lord':'Sun',
        'nature':'Fire · Fixed · Masculine',
        'core':"Ruled by the Sun, you carry a regal bearing and natural authority. You enter a room and people notice — not because you demand it, but because your energy is simply brighter. The body is usually well-built with strong chest, thick hair, and upright posture. Pride is both your virtue and vulnerability. Loyalty runs deep — you give your whole heart and expect the same in return. The soul is learning the distinction between ego-service (needing to be seen) and genuine self-expression (creating because you must).",
        'strengths':'Leadership, generosity, loyalty, creativity, charisma, dignity',
        'challenges':'Pride, need for recognition, stubbornness, authoritarianism, heart strain',
        'body':'Heart, spine, upper back, circulatory system',
        'career':'Government, politics, administration, acting, directing, management, teaching',
        'deity':'Surya, Rama, Vishnu'
    },
    'Virgo': {
        'title':'Kanya Lagna — The Analyst',
        'lord':'Mercury',
        'nature':'Earth · Dual · Feminine',
        'core':"Mercury's earthy expression produces the perfectionist — analytical, service-oriented, and exquisitely detail-conscious. You see what others miss: the error in the data, the flaw in the design, the impurity in the remedy. Health and the body are central preoccupations, and the body itself is often lean, refined, and sensitive. You serve through precision: as healer, accountant, editor, or scientist. The spiritual lesson is accepting that perfection is not the goal — wholeness is. Your greatest service is teaching others through your own striving toward excellence.",
        'strengths':'Analytical precision, service orientation, healing ability, hard work, discernment',
        'challenges':'Over-criticism, anxiety, digestive weakness, perfectionism causing paralysis',
        'body':'Intestines, colon, nervous system, skin, absorption organs',
        'career':'Medicine, accounting, editing, research, law, nutrition, programming, engineering',
        'deity':'Saraswati, Budha, Vishnu'
    },
    'Libra': {
        'title':'Tula Lagna — The Harmonizer',
        'lord':'Venus',
        'nature':'Air · Movable · Masculine',
        'core':"Venus-ruled Libra rising seeks beauty, justice, and balance in all domains. You are the natural diplomat — seeing all sides, mediating conflict, and creating elegant environments wherever you go. The face is often symmetrical and attractive; the manner is refined and socially gracious. Partnerships are central to your life: you grow through the mirror of relationship. The challenge is decision-making — when all sides seem equally valid, action stalls. Notably, Saturn is exalted in Libra — discipline, fairness, and Saturnine values support your highest expression.",
        'strengths':'Diplomacy, fairness, aesthetic sense, social grace, relationship intelligence',
        'challenges':'Indecisiveness, people-pleasing, conflict avoidance, dependency on approval',
        'body':'Kidneys, lower back, ovaries, skin, urinary tract',
        'career':'Law, diplomacy, arts, fashion, counselling, interior design, HR, mediation',
        'deity':'Lakshmi, Shukra, Saraswati'
    },
    'Scorpio': {
        'title':'Vrishchika Lagna — The Transformer',
        'lord':'Mars',
        'nature':'Water · Fixed · Feminine',
        'core':"Mars-ruled Scorpio rising produces the most intense and psychologically penetrating of all lagnas. You sense what is hidden — the lie beneath the smile, the power dynamic beneath politeness. Nothing is taken at face value; the gaze is magnetic and often unsettling to others. Life brings powerful experiences of loss and rebirth that force inner alchemy. Occult knowledge, research, and healing are natural domains. The soul's task is the ultimate Scorpionic act: to transmute personal poison into medicine that heals others. You are built for transformation.",
        'strengths':'Depth, determination, intuition, investigative ability, regenerative power',
        'challenges':'Jealousy, control, secretiveness, intensity that alienates, holding grudges',
        'body':'Reproductive organs, colon, bladder, hormonal system, immune system',
        'career':'Research, surgery, psychology, occult, intelligence, mining, investigation',
        'deity':'Kali, Shiva, Mangal, Durga'
    },
    'Sagittarius': {
        'title':'Dhanu Lagna — The Seeker',
        'lord':'Jupiter',
        'nature':'Fire · Dual · Masculine',
        'core':"Jupiter-ruled, you are the eternal student and teacher — seeking truth across philosophy, religion, travel, and higher learning. The body is tall or well-proportioned with a love for outdoor activity. Optimism is your natural state; you genuinely believe things work out, and they often do because Jupiter's grace follows you. The challenge is excess and overcommitment — saying yes to everything until body or schedule breaks. Faith is your superpower; the moment you lose it, everything contracts. Your life purpose is to be a light-bearer who expands the horizon for others.",
        'strengths':'Wisdom, optimism, generosity, love of truth, higher learning, natural luck',
        'challenges':'Excess, overconfidence, tactlessness, restlessness, dogmatism',
        'body':'Hips, thighs, liver, sciatic nerve, arterial system',
        'career':'Teaching, law, philosophy, religion, travel, publishing, athletics, judiciary',
        'deity':'Vishnu, Brihaspati, Dattatreya'
    },
    'Capricorn': {
        'title':'Makara Lagna — The Achiever',
        'lord':'Saturn',
        'nature':'Earth · Movable · Feminine',
        'core':"Saturn-ruled Capricorn rising carries the soul of the disciplined achiever. You build carefully, assume responsibility early in life, and gain steadily — the life arc reliably improves after 30 and peaks in the 40s and 50s when Saturn's rewards come due. The body is lean, bony, and built for endurance rather than speed. Pragmatic, serious, and respectful of structure and hierarchy. Mars is exalted here — when Mars is strong, ambition and physical drive are exceptional. The key lesson is not to sacrifice joy and relationship for achievement.",
        'strengths':'Discipline, ambition, endurance, organizational ability, responsibility',
        'challenges':'Coldness, pessimism, workaholism, difficulty expressing warmth, slow start',
        'body':'Knees, bones, teeth, skin, joints, structural skeleton',
        'career':'Politics, administration, engineering, business, law, architecture, finance',
        'deity':'Shani, Shiva, Kurma (tortoise avatar)'
    },
    'Aquarius': {
        'title':'Kumbha Lagna — The Visionary',
        'lord':'Saturn',
        'nature':'Air · Fixed · Masculine',
        'core':"Saturn's airy expression produces the intellectual humanitarian — idealistic, unconventional, and consistently ahead of the times. You think in systems and in terms of the collective: how can this be improved? How can the many be served? Friendship and community matter more than romantic partnership. The mind is original, sharp, and instinctively contrarian — you question established systems as a reflex. The challenge is emotional detachment: Aquarius rising understands humanity in the abstract while keeping individuals at arm's length. Your gifts belong to the world; the lesson is learning to receive.",
        'strengths':'Intellect, humanitarianism, originality, systemic thinking, vision',
        'challenges':'Emotional detachment, rebelliousness, rigidity of ideas, aloofness',
        'body':'Calves, ankles, circulatory system, nervous system, shins',
        'career':'Science, technology, social reform, aviation, astrology, invention, NGOs',
        'deity':'Shani, Varuna, Saraswati'
    },
    'Pisces': {
        'title':'Meena Lagna — The Mystic',
        'lord':'Jupiter',
        'nature':'Water · Dual · Feminine',
        'core':"Jupiter-ruled Pisces rising is the most spiritually sensitive and porous of all lagnas. You absorb the emotions of environments and people like a sponge — a gift (profound empathy, psychic sensitivity) and a challenge (difficulty maintaining boundaries). The eyes are often dreamy or otherworldly. You live as much in imagination as in physical reality. Venus is exalted in Pisces — love, art, beauty, and devotion flow naturally through you. The soul came this time to transcend ego through love and service. The lesson is learning not to lose yourself in the process.",
        'strengths':'Empathy, spirituality, creativity, compassion, psychic sensitivity, artistic vision',
        'challenges':'Boundary dissolution, escapism, impracticality, self-sacrifice to the point of erasure',
        'body':'Feet, lymphatic system, immune system, pineal gland',
        'career':'Art, music, healing, spirituality, film, psychology, charity, oceanography',
        'deity':'Vishnu, Lakshmi, Brihaspati, Saraswati'
    },
}

# ── PLANET IN SIGN ────────────────────────────────────────────────────────────

PLANET_IN_SIGN = {
'Sun': {
    'Aries':      "Exalted Sun — at peak strength. Tremendous vitality, leadership, and courage. Father is significant and strong. You command respect naturally and thrive in positions of authority. Health is excellent, especially in youth.",
    'Taurus':     "Sun in Venus's fixed earth sign. Steady, sensual, and materially motivated. Wealth through government or authority. Somewhat stubborn about status. Creative and musical leanings. Father may be artistic or financially oriented.",
    'Gemini':     "Sun in Mercury's airy sign. Intellectually brilliant, curious, and communicative. Multiple careers or identities are possible. Father may be a teacher, writer, or trader. Wit and speech are powerful personal assets.",
    'Cancer':     "Sun in Moon's water sign — mild tension between ego and emotion. Public life is prominent but emotionally taxing. Strong attachment to homeland. Father figure may be emotional or absent in early years. Good for nourishment-related careers.",
    'Leo':        "Sun in own sign — royal, dignified, and powerful. Natural authority, strong health, and a magnetic personality. Father is prominent, possibly in government or medicine. Pride must be tempered with humility for full success.",
    'Virgo':      "Sun in Mercury's earth sign. Analytical, service-oriented, and health-conscious. Authority through precision and expertise. Father may be in medical, accounting, or editorial fields. Criticism of others can become a weakness.",
    'Libra':      "Debilitated Sun — ego is softened, making self-assertion difficult. Partnerships compensate for what the self lacks. Justice-seeking and diplomatic. Father may be weak, passive, or justice-oriented. The soul learns to define itself through relationship.",
    'Scorpio':    "Sun in Mars's water sign. Intense, secretive, and psychologically penetrating. Hidden power and strong willpower. Father may be powerful, secretive, or transformative. Interest in occult, medicine, or research. Strong but not easily visible.",
    'Sagittarius':"Sun in Jupiter's fire sign — excellent placement. Philosophical, optimistic, religious, and generous. Father is dharmic, wise, or foreign. Luck follows throughout life. Fame through teaching, law, religion, or philosophy.",
    'Capricorn':  "Sun in Saturn's earth sign — some friction. Authority is earned through hard work and patience. Career is serious, disciplined, and government-related. Father may be strict, distant, or burdened. Late bloomer who achieves lasting recognition.",
    'Aquarius':   "Sun in Saturn's air sign. Humanitarian and idealistic authority. Leadership of groups, communities, and reform movements. Father may be unconventional or community-oriented. Originality and independence define the public persona.",
    'Pisces':     "Sun in Jupiter's water sign. Spiritual, artistic, and compassionate authority. Leadership through empathy and vision rather than force. Father may be spiritual, artistic, or self-sacrificing. Difficulty with worldly ambition; rich inner life compensates.",
},
'Moon': {
    'Aries':      "Moon in Mars's fire sign — emotional nature is passionate, impulsive, and reactive. Quick moods, quick recovery. Mother may be energetic, independent, or aggressive. Courage in emotional situations. Mind acts before it reflects.",
    'Taurus':     "Exalted Moon — the most peaceful and stable emotional position. Mind is calm, sensual, and comfort-seeking. Mother is nurturing, stable, and materially generous. Excellent memory, love of beauty, and natural contentment.",
    'Gemini':     "Moon in Mercury's air sign. Mind is restless, curious, and constantly processing information. Excellent communication ability. Mother may be talkative, intellectual, or changeable. Many thoughts, many ideas — focus is the challenge.",
    'Cancer':     "Moon in own sign — deeply intuitive, empathetic, and emotionally sensitive. Strong bond with mother and home. Public life is prominent because Cancer Moon connects naturally with the masses. Mood follows lunar cycles closely.",
    'Leo':        "Moon in Sun's fire sign. Emotional need for recognition, appreciation, and creative expression. Proud, generous, and warm-hearted. Mother may be dramatic, regal, or dominant. Leads with heart; needs loyal emotional support.",
    'Virgo':      "Moon in Mercury's earth sign. Analytical emotions — you process feelings through thought. Service-oriented, detail-conscious, and health-aware. Mother may be critical, helpful, or health-focused. Overthinking can disrupt inner peace.",
    'Libra':      "Moon in Venus's air sign. Emotionally oriented toward beauty, balance, and relationship. Mind seeks harmony and avoids confrontation. Mother may be beautiful, artistic, or socially prominent. Partnerships are emotionally essential.",
    'Scorpio':    "Debilitated Moon — emotions are intense, turbulent, and difficult to surface. Powerful intuition and psychic sensitivity. Mother relationship may be complex, possessive, or transformative. The emotional depth is vast but rarely shown.",
    'Sagittarius':"Moon in Jupiter's fire sign. Optimistic, philosophical, and freedom-loving emotional nature. Mind gravitates toward wisdom, travel, and higher meaning. Mother may be religious, foreign, or broad-minded. Joy comes through exploration.",
    'Capricorn':  "Moon in Saturn's earth sign. Emotions are restrained, serious, and burdened by responsibility. Practical and reliable but struggles to show vulnerability. Mother may be cold, hardworking, or burdened. Emotional warmth develops slowly with age.",
    'Aquarius':   "Moon in Saturn's air sign. Emotionally detached yet compassionate about humanity. Mind is original and group-oriented. Mother may be unconventional, humanitarian, or absent. Strong intellectual empathy with difficulty in personal intimacy.",
    'Pisces':     "Moon in Jupiter's water sign. Deeply compassionate, dreamy, and psychically open. Imagination is vivid and borderless. Mother may be spiritual, artistic, or self-sacrificing. Absorption of others' emotions requires active energetic protection.",
},
'Mars': {
    'Aries':      "Mars in own sign — raw, fearless energy. Exceptional courage, athleticism, and willpower. Quick temper with equally quick forgiveness. Natural leader in crisis. Sibling bonds are strong. Prone to head injuries, fever, and accidents.",
    'Taurus':     "Mars in Venus's earth sign. Energy is directed toward building wealth and comfort. Sensual drive, stubborn determination, and financial ambition. Slow to anger but formidable when provoked. Success in real estate, finance, and agriculture.",
    'Gemini':     "Mars in Mercury's air sign. Intellectual energy, sharp argumentation, and communicative courage. Excellent for law, debate, and writing. Multiple simultaneous projects. Siblings may be intellectually prominent. Nervous tension is common.",
    'Cancer':     "Debilitated Mars — courage is compromised by emotional sensitivity. Protectiveness toward family is fierce, but aggression is indirect. The energy fluctuates with mood. May have strained sibling or mother relationships. Indirect action replaces direct confrontation.",
    'Leo':        "Mars in Sun's fire sign. Regal, proud, and authoritative energy. Leadership in battle and administration. Strong ego-drive fuels ambition. Excellent for military, government, and sports. Chest and heart need protection.",
    'Virgo':      "Mars in Mercury's earth sign. Precise, detail-oriented energy. Excellent for surgery, engineering, and technical work. Somewhat critical and argumentative. Health is a focus of energy. Service through skilled action.",
    'Libra':      "Mars in Venus's air sign — uncomfortable placement. Energy is weakened by over-diplomacy. Action is delayed by weighing all options. Partnerships create conflict. Legal disputes are possible. Must cultivate decisive action.",
    'Scorpio':    "Mars in own sign — occult strength and transformative power. Intense, secretive energy that regenerates through crisis. Excellent for research, surgery, investigation, and healing. Powerful libido. Hidden but formidable.",
    'Sagittarius':"Mars in Jupiter's fire sign. Righteous, adventurous energy. Fights for justice, dharma, and ideology. Excellent for law, religion, athletics, and military. Father may be courageous. Foreign lands and travel are favored.",
    'Capricorn':  "Exalted Mars — maximum organized drive and disciplined ambition. Patient, persistent, and enormously capable. Success in government, engineering, and leadership. Energy builds steadily toward great achievement. Excellent placement for career.",
    'Aquarius':   "Mars in Saturn's air sign. Energy is directed toward collective causes, reform, and technology. Group leadership and humanitarian fighting. May be contrarian or rebellious. Technical innovation and community organizing are favored.",
    'Pisces':     "Mars in Jupiter's water sign. Spiritual energy and compassionate action. Service through healing, art, and devotion. Energy lacks sharp focus but is sustained. Excellent for healing, yoga, martial arts, and spiritual practice.",
},
'Mercury': {
    'Aries':      "Mercury in Mars's fire sign. Quick, sharp, and combative intellect. Speaks before thinking; brilliant in debate. Business ideas come rapidly. Writing and speech have a forceful, direct quality. Some irritability and impatience in communication.",
    'Taurus':     "Mercury in Venus's earth sign. Practical, deliberate, and aesthetic intelligence. Excellent for finance, art, music theory, and architecture. Speech is measured and persuasive. Business acumen is strong. Slow to form views, but those views are solid.",
    'Gemini':     "Mercury in own sign — highest intellectual strength. Quick wit, verbal brilliance, and insatiable curiosity. Excellent for writing, trade, teaching, and communication. Multiple topics mastered simultaneously. The archetypal intellectual.",
    'Cancer':     "Mercury in Moon's water sign. Emotional intelligence; memory is excellent and deeply intuitive. Communication is nurturing and imaginative. Writing has poetic or storytelling quality. Mind is strongly influenced by emotions and home environment.",
    'Leo':        "Mercury in Sun's fire sign. Creative, expressive, and authoritative communication. Writing and speech carry confidence and drama. Intelligence is directed toward leadership and creative self-expression. Good for teaching and politics.",
    'Virgo':      "Mercury exalted in own sign — perfect analytical mind. Precise, detailed, methodical, and brilliant at discrimination. Best placement for medicine, accounting, editing, coding, and research. Overthinking can be the only shadow.",
    'Libra':      "Mercury in Venus's air sign. Diplomatic, balanced, and aesthetically refined communication. Excellent for law, mediation, and all forms of partnership negotiation. Writing is elegant. Multiple perspectives are naturally considered.",
    'Scorpio':    "Mercury in Mars's water sign. Deep, investigative, and penetrating intelligence. Research, psychology, and occult knowledge come naturally. Communication may be secretive or blunt. Excellent for detective work, surgery planning, and deep analysis.",
    'Sagittarius':"Mercury in Jupiter's fire sign — mild tension. Intelligence seeks breadth over depth; philosophical and visionary thinking. Good for publishing, higher education, and international communication. May miss details in favor of the big picture.",
    'Capricorn':  "Mercury in Saturn's earth sign. Serious, structured, and methodical intellect. Excellent for administration, engineering, law, and science. Communication is formal and authoritative. Slow to speak, but what is said is considered and reliable.",
    'Aquarius':   "Mercury in Saturn's air sign. Original, unconventional, and systems-oriented intelligence. Excellent for science, technology, social theory, and invention. Communication is ahead of its time. Group thinking and collective analysis.",
    'Pisces':     "Debilitated Mercury — rational mind is softened by imagination and emotion. Intuitive rather than logical. Creative and poetic intelligence. May struggle with precision, deadlines, and detail. Excellent for art, spirituality, and healing.",
},
'Jupiter': {
    'Aries':      "Jupiter in Mars's fire sign. Righteous enthusiasm, bold wisdom, and pioneering philosophy. Teaching through direct action. Generosity is impulsive. Good for law, military leadership, and religious reform. Fast but not always thorough.",
    'Taurus':     "Jupiter in Venus's earth sign. Wealth, abundance, and material wisdom. Philosophy grounded in sensory reality. Generosity with material things. Good for finance, art, agriculture, and building lasting institutions. Prosperity through Venus domains.",
    'Gemini':     "Jupiter in Mercury's air sign — some tension. Intelligence is vast but scattered across many fields. Good teacher but may lack depth in any one area. Publishing, journalism, translation, and multi-lingual communication are favored.",
    'Cancer':     "Exalted Jupiter — most fortunate and expansive placement. Wisdom through emotional intelligence and compassion. Exceptional luck, prosperity, and spiritual grace. Mother and home are sources of fortune. Children bring great blessings.",
    'Leo':        "Jupiter in Sun's fire sign. Regal wisdom and magnanimous leadership. Excellent for government, teaching, spiritual authority, and creative direction. Recognition and status come naturally. Father may be prominent or wise.",
    'Virgo':      "Jupiter in Mercury's earth sign — mild tension. Wisdom is detailed and service-oriented but may become pedantic. Good for medicine, law, editing, and technical teaching. Generosity is expressed through skilled service.",
    'Libra':      "Jupiter in Venus's air sign. Wisdom through relationship, justice, and aesthetics. Excellent for law, diplomacy, marriage counselling, and art patronage. Marriage tends to be fortunate and brings expansion.",
    'Scorpio':    "Jupiter in Mars's water sign. Deep, occult wisdom and transformative philosophy. Excellent for research, psychology, healing, and esoteric knowledge. Hidden blessings that emerge through crisis and transformation.",
    'Sagittarius':"Jupiter in own sign — maximum wisdom, luck, and dharmic clarity. The guru in full expression: philosophical, expansive, generous, and deeply religious. Travel, teaching, law, and spiritual leadership bring enormous success.",
    'Capricorn':  "Debilitated Jupiter — wisdom is contracted by practicality and skepticism. Luck is earned through hard work, not grace. Philosophy becomes pragmatic. Excellent for business and administration despite the debilitation.",
    'Aquarius':   "Jupiter in Saturn's air sign. Wisdom directed toward collective welfare and social justice. Excellent for humanitarian work, science, and progressive philosophy. Generosity expressed toward groups and communities.",
    'Pisces':     "Jupiter in own sign — spiritual abundance and universal compassion. Deeply religious, artistic, and empathetic. The soul touches the divine through devotion and service. Excellent for healing, spirituality, and all water-related fields.",
},
'Venus': {
    'Aries':      "Venus in Mars's fire sign — uncomfortable. Love is passionate, impatient, and impulsive. Beauty is bold and striking. Artistic creativity has fiery energy. Romance is exciting but short-lived. Partnerships require learning patience.",
    'Taurus':     "Venus in own sign — sensual abundance and beauty at full strength. Magnetic attractiveness, refined taste, and deep pleasure in material comfort. Excellent for art, music, luxury, and finance. Marriage is stable and pleasurable.",
    'Gemini':     "Venus in Mercury's air sign. Love through words, ideas, and intellectual connection. Multiple romantic interests possible. Writing about love or beauty. Artistic expression through speech, writing, and communication.",
    'Cancer':     "Venus in Moon's water sign. Love is nurturing, deeply emotional, and homeward-oriented. Artistic expression through domestic beauty, cooking, and family. Mother is a source of beauty. Relationships feel like home.",
    'Leo':        "Venus in Sun's fire sign. Love is dramatic, generous, and proud. Artistic creativity is bold and expressive. Excellent for performing arts, fashion, and luxury. Partners are often distinguished or attractive.",
    'Virgo':      "Debilitated Venus — love is critical, analytical, and emotionally restrained. Service replaces romance. Art becomes technical craft. Difficulty expressing emotional needs directly. Healing through beauty and service.",
    'Libra':      "Venus in own sign — most balanced and socially gracious placement. Diplomatic, elegant, and relationship-mastering. Excellent for law, art, diplomacy, and marriage. Beauty and justice are inseparable values.",
    'Scorpio':    "Venus in Mars's water sign. Love is intense, transformative, and secretly passionate. Magnetic sexual attractiveness. Art explores darkness and depth. Possessiveness and jealousy are the shadows of this profound loving.",
    'Sagittarius':"Venus in Jupiter's fire sign. Love through philosophy, adventure, and shared belief. Partners may be foreign, religious, or academic. Art is expansive and inspired. Romance includes a quest for higher meaning.",
    'Capricorn':  "Venus in Saturn's earth sign. Love is serious, loyal, and slowly deepening. Relationships are treated as serious commitments. Art in service of structure and tradition. Material ambition motivates romantic choices.",
    'Aquarius':   "Venus in Saturn's air sign. Love is unconventional, friendship-based, and communal. Attraction to the unusual or intellectual. Art serves the collective. Romantic attachment is warm but emotionally distant.",
    'Pisces':     "Exalted Venus — the most spiritually loving and artistically inspired placement. Compassionate, romantic, and devoted love. Music, poetry, and visual art flow naturally. Marriage may be deeply spiritual or with someone foreign. The soul is love.",
},
'Saturn': {
    'Aries':      "Debilitated Saturn — discipline is undermined by impatience. Karma requires slowing down and acting deliberately. Lessons around anger, accidents, and acting without planning. Service to others eventually brings spiritual reward.",
    'Taurus':     "Saturn in Venus's earth sign. Steady, patient accumulation of wealth and material security. Discipline in the arts and finances. Late prosperity that is permanent. Karmic lessons around attachment to material things.",
    'Gemini':     "Saturn in Mercury's air sign. Serious, methodical intellect. Excellent for structured writing, mathematics, and long-term study. Communication may be formal or slow. Discipline in learning brings mastery over time.",
    'Cancer':     "Saturn in Moon's water sign — difficult. Emotional suppression and karmic heaviness around home and mother. Late emotional maturity. The karmic lesson is to build emotional security through self-reliance rather than dependency.",
    'Leo':        "Saturn in Sun's fire sign — difficult. Pride is tempered by humiliation and delay. Authority comes after significant testing. Father may be stern or absent. The soul learns true leadership through service rather than ego.",
    'Virgo':      "Saturn in Mercury's earth sign. Excellent for detailed, disciplined work. Long-term service in health, administration, or technical fields. Perfectionism is elevated to mastery. Karmic service through meticulous effort.",
    'Libra':      "Exalted Saturn — maximum justice, balance, and disciplined fairness. The highest expression of Saturnine virtue: impartial, patient, and deeply ethical. Excellent for law, judiciary, and administration. Slow but utterly reliable.",
    'Scorpio':    "Saturn in Mars's water sign. Deep, relentless karmic work in the domain of transformation. Research, mining, and occult disciplines require slow, persistent effort. Hidden strength that surfaces under sustained pressure.",
    'Sagittarius':"Saturn in Jupiter's fire sign. Disciplined philosophical or religious pursuit. Slow, thorough approach to dharma, law, and higher education. Karmic lessons through one's beliefs and teachers. Wisdom earned through long experience.",
    'Capricorn':  "Saturn in own sign — peak organizational power and disciplined ambition. Slow, relentless, and ultimately victorious achievement. Government, administration, and structural work are favored. The karma of responsibility fulfilled.",
    'Aquarius':   "Saturn in own sign — humanitarian discipline and systematic social reform. Long-term service to communities and collective well-being. Scientific, technological, and political work that endures across decades.",
    'Pisces':     "Saturn in Jupiter's water sign. Karmic spiritual discipline and service through sacrifice. The soul works quietly, without recognition, in service of the divine or the poor. Liberation through selfless, patient action.",
},
'Rahu': {
    'Aries':      "Rahu in Aries amplifies ambition, courage, and desire for individual recognition. Strong drive for new beginnings and innovative action. Foreign connections benefit leadership. The obsession is with self-creation and pioneering identity.",
    'Taurus':     "Rahu in Taurus intensifies desire for wealth, beauty, and material security. Foreign sources of income. Technology meets luxury. The soul obsessively seeks material stability but learns that true security is internal.",
    'Gemini':     "Rahu exalted in Gemini — foreign communication, multilingual ability, and mastery of information technology. Brilliant and unconventional thinker. Media, journalism, and IT bring sudden success. The mind is ravenously curious.",
    'Cancer':     "Rahu in Cancer — deep emotional ambitions around home, mother, and belonging. Foreign homeland or property. Emotional manipulation is the shadow; the soul seeks family but must find inner belonging first.",
    'Leo':        "Rahu in Leo — obsession with fame, recognition, and creative power. Unusual paths to authority. May become a celebrity or achieve sudden public visibility. The shadow is ego-inflation and craving attention.",
    'Virgo':      "Rahu in Virgo — intense focus on health, service, and analytical mastery. Foreign medicine or technology. The shadow is hypochondria and endless criticism. Mastery through precise technical skill.",
    'Libra':      "Rahu in Libra — deep desire for partnership, justice, and beauty. Foreign spouse or business partner possible. Diplomatic skill and aesthetic vision are amplified. The shadow is dependency and impossible romantic ideals.",
    'Scorpio':    "Rahu in Scorpio — obsession with hidden knowledge, power, and transformation. Sudden occult revelations. Foreign research or intelligence work. Intensely magnetic and secretive. The shadow is manipulation and power hunger.",
    'Sagittarius':"Rahu debilitated in Sagittarius — confusion between true wisdom and dogma. Foreign philosophy or religion becomes an obsession. Travel to distant lands. The soul seeks absolute truth but must learn that truth cannot be possessed.",
    'Capricorn':  "Rahu in Capricorn — obsessive ambition for status, power, and material success. Foreign career or government work. Sudden elevation in social position. The shadow is ruthlessness in the pursuit of success.",
    'Aquarius':   "Rahu in Aquarius — obsession with technology, social reform, and collective movements. Foreign technology or community. Brilliant but eccentric thinking. The soul seeks to serve humanity but must guard against revolutionary ego.",
    'Pisces':     "Rahu in Pisces — obsession with spiritual experience, dreams, and other realms. Foreign spirituality or healing arts. Vivid imagination that can border on delusion. The soul seeks liberation but must ground in practical reality.",
},
'Ketu': {
    'Aries':      "Ketu in Aries brings past-life warrior energy — you have already learned courage and pioneering. Now the soul detaches from individual identity and ego-driven action. Spiritual service through fearlessness without ego.",
    'Taurus':     "Ketu in Taurus brings past-life material wisdom — wealth and beauty are familiar but now feel empty. The soul detaches from accumulation and learns that true security is in spirit. Spiritual values replace material ones.",
    'Gemini':     "Ketu debilitated in Gemini — past-life intellectual mastery creates confusion this life. The mind is scattered; too much information. The soul must choose depth over breadth and move from knowledge to wisdom.",
    'Cancer':     "Ketu in Cancer — past-life emotional bonds and family. Now the soul detaches from domestic attachment. Spiritual connection replaces family dependency. The mother relationship may be karmically complex.",
    'Leo':        "Ketu in Leo — past-life royalty and ego. Fame and authority feel strangely hollow this life. The soul is detaching from the need for recognition. True leadership through selfless service without applause.",
    'Virgo':      "Ketu in Virgo — past-life service and analytical precision. This life, the soul transcends perfectionism. Healing ability is inherited from past lives. Discrimination applied to spiritual rather than mundane matters.",
    'Libra':      "Ketu in Libra — past-life relationship mastery and diplomacy. Now the soul detaches from partnership as the primary identity. Inner harmony replaces outer relationship. Justice is sought on the spiritual plane.",
    'Scorpio':    "Ketu exalted in Scorpio — past-life occult mastery and transformation. Exceptional spiritual depth, intuition, and psychic ability. Detachment from the physical world. Ancient healing knowledge flows naturally.",
    'Sagittarius':"Ketu in Sagittarius — past-life philosophical and religious authority. This life, dogmas dissolve. The soul detaches from belief systems to find direct spiritual experience. The guru within replaces all external teachers.",
    'Capricorn':  "Ketu in Capricorn — past-life ambition and worldly success. This life, the soul detaches from career and status. Spiritual discipline replaces worldly achievement. Service without recognition is the path.",
    'Aquarius':   "Ketu in Aquarius — past-life humanitarian work and collective service. This life, detachment from group identity and ideology. Spiritual individualism replaces collective movements. Inner reform precedes outer.",
    'Pisces':     "Ketu in Pisces — past-life spiritual dissolution and mysticism. This life, the soul must engage more with physical reality. Spiritual gifts are innate but the lesson is grounding them into practical compassionate service.",
},
}

# ── PLANET IN HOUSE ────────────────────────────────────────────────────────────

PLANET_IN_HOUSE = {
'Sun': {
    1: "Sun in the 1st — the identity IS the solar principle. Strong constitution, leadership ability, and personal charisma. The self is defined by authority, dignity, and independence. Health is robust. Ego must be consciously developed toward humility.",
    2: "Sun in the 2nd — wealth through government, authority, or the father. Powerful, authoritative speech. Family is prominent or influential. Right eye may be strong or significant. Accumulation through personal effort and dignity.",
    3: "Sun in the 3rd — courageous, bold, and creatively self-expressive. Sibling relationships involve father figures. Writing, media, and communication are illuminated. Effort and initiative are constant. Short journeys are frequent.",
    4: "Sun in the 4th — father dominates the home environment. Home life is formal or authority-driven. Property through government or father is possible. Mother may be overshadowed. Emotional life is shaped by authority and dignity.",
    5: "Sun in the 5th — excellent for creative expression, teaching, and children. Intelligence is brilliant and proud. Political inclinations. First child may be delayed or a son of consequence. Authority through creative output.",
    6: "Sun in the 6th — defeats enemies, wins competitions, and excels in service. Health challenges are overcome through willpower. Government service. Daily work brings recognition. Enemies are ultimately subdued.",
    7: "Sun in the 7th — spouse may be authoritative, proud, or government-connected. Partnership conflicts around ego. Success in business or law through bold action. Public visibility through partnerships.",
    8: "Sun in the 8th — longevity subject to care. Occult and hidden knowledge. Father's life may be shortened. Sudden career disruptions followed by transformation. Research, surgery, and hidden matters bring success.",
    9: "Sun in the 9th — highly auspicious. Dharmic, philosophical, and devoted to father and guru. Fortune through religion, law, and higher learning. Fame and blessings from spiritual pursuits. The father is noble.",
    10: "Sun in the 10th — the most powerful career placement for Sun. Fame, authority, and government recognition. The career is the life's central expression. Father's influence shapes profession. Lasting public achievement.",
    11: "Sun in the 11th — gains through authority, government, and powerful friends. Income is substantial and growing. Elder siblings may be distinguished. Social network includes influential people. Desires are fulfilled.",
    12: "Sun in the 12th — foreign lands, spiritual retreat, and hidden expense. Eye problems possible. Father may live far away or be spiritually inclined. The soul seeks liberation through surrender of ego. Meditative and self-reflective."
},
'Moon': {
    1: "Moon in the 1st — highly visible, emotionally expressive, and deeply connected to the public. The personality shifts with lunar phases. Beautiful or round face. Mother's influence on character is profound. Excellent for politics and public life.",
    2: "Moon in the 2nd — wealth through emotional intelligence, food, liquids, or the public. Family is emotionally central. Voice is melodious and persuasive. Finances fluctuate like the Moon. Mother contributes to family wealth.",
    3: "Moon in the 3rd — emotional courage and intuitive communication. Writing with feeling, storytelling, and imaginative expression. Many short journeys. Sibling bonds are emotionally close. Mind is restless and curious.",
    4: "Moon in the 4th — own house for Moon, and one of the best placements. Deep happiness in home, strong bond with mother, and emotional security. Real estate is favored. Domestic life is the soul's sanctuary.",
    5: "Moon in the 5th — emotional relationship with children and creativity. Intuitive intelligence. Romance is central to happiness. Excellent memory and imagination. Creative work flows from emotional depth.",
    6: "Moon in the 6th — emotional sensitivity to illness, service, and conflict. Health issues related to digestion or emotions. Excellent for nursing, healing, and counselling. Enemies through emotional misunderstandings.",
    7: "Moon in the 7th — spouse is emotional, caring, and possibly beautiful. Marriage brings public visibility. Emotional need for partnership is high. Business with the public or women is favorable.",
    8: "Moon in the 8th — deep emotional sensitivity and psychic ability. Mother's health may be a concern. Interest in occult and hidden matters. Emotional turbulence that eventually produces wisdom and depth.",
    9: "Moon in the 9th — fortunate, devotional, and emotionally connected to dharma. Mother is spiritual or religious. Pilgrimage and travel bring joy. Luck flows through emotional openness and faith.",
    10: "Moon in the 10th — career in public life, healthcare, food, or real estate. Public is the natural audience. Mother's influence on career. Emotional fluctuation in career; fame comes in waves like the Moon.",
    11: "Moon in the 11th — gains through women, public, and emotional intelligence. Many friends, especially female. Desires are fulfilled gradually. Elder sister may be significant. Income through Moon-related fields.",
    12: "Moon in the 12th — spiritual sensitivity, dream life, and foreign connections. Sleep is important for well-being. Emotional life is private and hidden. Mother may live far away. Excellent for meditation and retreat."
},
'Mars': {
    1: "Mars in the 1st — fearless, energetic, and physically powerful personality. Athletic build, strong will, and natural warrior energy. Accidents involving the head or face are possible. Leadership in adversity is a gift.",
    2: "Mars in the 2nd — sharp, direct speech that can wound. Accumulates wealth through effort and sometimes conflict. Family may involve disputes. Teeth and eyes need care. Determination drives financial growth.",
    3: "Mars in the 3rd — great courage, initiative, and media/communication power. Excellent for writing, military, and entrepreneurship. Sibling relationships are competitive but loyal. Short journeys are frequent and productive.",
    4: "Mars in the 4th — domestic conflicts and mother's relationship may be tense. Property disputes are possible. Strong desire for home and land. Engineering or construction work related to home. Ancestral land brings success.",
    5: "Mars in the 5th — competitive intelligence and creative fire. Children may be delayed or require effort. Romantic relationships are passionate and intense. Excellent for sports, speculation, and creative competition.",
    6: "Mars in the 6th — powerful placement for defeating enemies, excelling in competition, and thriving in service. Military, law, medicine, and sports are natural paths. Health is robust. Enemies are overcome.",
    7: "Mars in the 7th (Mangal Dosha) — partner is strong, opinionated, or from a different background. Marriage requires conscious partnership. Business partnerships involve conflict then resolution. Legal battles are possible.",
    8: "Mars in the 8th — intense, investigative, and transformative energy. Long life through willpower. Sudden events that require courage. Excellent for surgery, research, and occult. Hidden strength surfaces in crisis.",
    9: "Mars in the 9th — righteous, dharmic, and philosophically combative. Father may be a warrior or strongly opinionated. Fights for beliefs. Travel to distant places. Law, religion, and social justice are important.",
    10: "Mars in the 10th — exceptional career placement for Mars. Success in military, engineering, surgery, and leadership. Ambition is fierce and achievement is notable. Authority is earned through competitive excellence.",
    11: "Mars in the 11th — gains through courage, siblings, and competitive effort. Influential and energetic friends. Income through Mars fields: engineering, military, sports, medicine. Desires are achieved through direct action.",
    12: "Mars in the 12th — energy is spent in hidden or foreign settings. Foreign military or medical work. Expenses through aggression or accidents. Spiritual warrior energy in meditation or service. Bed pleasures are notable."
},
'Mercury': {
    1: "Mercury in the 1st — witty, youthful, and intellectually vivid personality. Appears younger than actual age throughout life. Quick mind, adaptable nature, and natural communicator. Speech is the primary instrument of self-expression.",
    2: "Mercury in the 2nd — eloquent speech, writing ability, and intelligence in financial matters. Multiple income streams. Family is educated. Accounting, trading, and teaching are favored. The voice is a significant asset.",
    3: "Mercury in the 3rd — own house for Mercury; brilliant communicator, writer, and trader. Siblings may be intellectually gifted. All forms of media, communication, and commerce flourish. Curiosity never diminishes.",
    4: "Mercury in the 4th — educated mother, intellectual home environment. Academic success. Home may function as an office or study. Real estate through analysis and calculation. Mind is deeply rooted in the past.",
    5: "Mercury in the 5th — exceptional intelligence, mathematical ability, and analytical creativity. Speculative success through analysis. Teaching children or teaching through creative media. Multiple creative projects.",
    6: "Mercury in the 6th — analytical problem-solver who excels in service. Legal, medical, and administrative fields. Debates and arguments are won through logic. Health challenges are analyzed and overcome methodically.",
    7: "Mercury in the 7th — partner is educated, communicative, and intellectually matched. Business partnerships through writing, media, or trade. Legal agreements are favorable. Marriage improves intellectual life.",
    8: "Mercury in the 8th — deep research, hidden knowledge, and investigative analysis. Excellent for occult study, psychology, and detective work. May inherit through siblings. Longevity through mental adaptability.",
    9: "Mercury in the 9th — philosophical intelligence, religious writing, and teaching. Father is educated. Publishing, journalism, and higher education. Long distance communication. Travels for knowledge and wisdom.",
    10: "Mercury in the 10th — career built on communication, intellect, and information. Writing, journalism, teaching, trading, and law bring public success. Analytical reputation. Multiple careers through life.",
    11: "Mercury in the 11th — gains through communication, trade, and intellectual networks. Many intelligent friends. Income from writing, media, or teaching. Elder siblings are significant. Desires fulfilled through clever strategy.",
    12: "Mercury in the 12th — secret writing, spiritual study, and foreign communication. Meditation and mantra practice benefit deeply. Sleep-related speech. May work behind the scenes in writing or research."
},
'Jupiter': {
    1: "Jupiter in the 1st — the most auspicious planetary placement for overall life quality. Blessed, wise, generous, and spiritually fortunate. The body is well-proportioned. Knowledge flows naturally. The chart is elevated by this placement.",
    2: "Jupiter in the 2nd — wealth, family prosperity, and eloquent speech. Multiple income sources. Family is educated and fortunate. Sweet, wise speech. Traditional values around money. Financial growth through wisdom and dharma.",
    3: "Jupiter in the 3rd — wisdom through communication, writing, and teaching. Sibling relationships are fortunate. Short journeys are educational. However, courage may be replaced by philosophy — the challenge is action over contemplation.",
    4: "Jupiter in the 4th — deeply fortunate home life, excellent mother-relationship, and academic success. Property and vehicles are blessed. Peace in the home is profound. Academic excellence. The private life is one of genuine contentment.",
    5: "Jupiter in the 5th — own house of wisdom in the house of intelligence — highly auspicious. Brilliant children, exceptional intelligence, and creative abundance. Speculation is favored. Teaching is a divine calling. The soul is deeply blessed.",
    6: "Jupiter in the 6th — enemies are converted into supporters. Health challenges are overcome through wisdom. Service through teaching or healing. Legal matters tend to resolve in favor. The challenge is overconfidence in adversity.",
    7: "Jupiter in the 7th — highly fortunate for marriage. Spouse is educated, wise, and spiritually inclined. Business partnerships expand wealth. The partner is a genuine guru. Marriage brings prosperity and dharmic growth.",
    8: "Jupiter in the 8th — longevity is blessed. Hidden knowledge, inheritance, and spiritual wealth. Occult wisdom and deep philosophical inquiry. Sudden blessings emerge from crisis. The 8th house is elevated by Jupiter's grace.",
    9: "Jupiter in the 9th — own house in the house of dharma — maximum fortune. The guru is within and without. Father is a blessing. Religion, philosophy, and higher learning define the life path. Luck is constant and profound.",
    10: "Jupiter in the 10th — career in education, law, religion, and administration. Excellent reputation, public honor, and lasting achievement. Fame through wisdom and justice. Career becomes a vehicle for dharma.",
    11: "Jupiter in the 11th — maximum gains and fulfilled desires. Wealthy, well-connected, and deeply fortunate friendships. Income through teaching, law, and wisdom. The elder sibling is fortunate. Wishes are consistently fulfilled.",
    12: "Jupiter in the 12th — spiritual liberation, moksha, and hidden divine grace. Wealth may go to charity or foreign lands. Excellent for spiritual practice, retreat, and meditation. The soul is nearing liberation."
},
'Venus': {
    1: "Venus in the 1st — beautiful appearance, magnetic personality, and natural artistic grace. Love of luxury and aesthetic refinement. Career often involves beauty, art, or relationships. Marriage is an important life focus.",
    2: "Venus in the 2nd — wealth through beauty, art, luxury, or women. Melodious, persuasive voice. Family is artistic or prosperous. Excellent food and material comfort. Multiple sources of income through Venus fields.",
    3: "Venus in the 3rd — artistic communication, beautiful writing, and creative media skills. Sibling relationships are affectionate. Short journeys are pleasurable. Music, poetry, and visual art flow through communication.",
    4: "Venus in the 4th — beautiful home environment, artistic mother, and profound domestic happiness. Vehicles are fortunate. Real estate brings pleasure. The home is a place of beauty and comfort. Academic success in arts.",
    5: "Venus in the 5th — romantic creativity and artistic intelligence. Love affairs are central to the life story. Children are beautiful or artistic. Speculation through art and entertainment. Creative self-expression brings joy.",
    6: "Venus in the 6th — some friction between love and service. Health challenges through indulgence. Relationships with colleagues may be complicated. Service in beauty, healthcare, or art. Disputes in romance are possible.",
    7: "Venus in the 7th — own house in the house of marriage — highly auspicious for relationships. Spouse is beautiful, artistic, and pleasurable. Business partnerships are harmonious and profitable. Marriage brings genuine happiness.",
    8: "Venus in the 8th — intense, hidden romantic life. Inheritance through spouse or women. Occult attraction. Longevity is favored. The hidden life contains great beauty. Transformation through deep intimacy.",
    9: "Venus in the 9th — fortunate, artistic, and spiritually beautiful dharma. Father may be artistic. Pleasurable long journeys. Love of beauty in philosophy and religion. Blessings through devotion to the Divine Feminine.",
    10: "Venus in the 10th — highly successful career in art, entertainment, beauty, fashion, and luxury. Fame through creative work. Public admires the aesthetic choices. Career is beautiful and socially prominent.",
    11: "Venus in the 11th — gains through art, women, and beauty. Wealthy, artistic, and affectionate friendships. Income through entertainment, luxury, and creative fields. Desires fulfilled through beautiful relationships.",
    12: "Venus in the 12th — pleasures in private and hidden settings. Foreign romantic connections. Spiritual devotion to the Divine Feminine. Expenses through luxury. Bed comforts are significant. Liberation through love."
},
'Saturn': {
    1: "Saturn in the 1st — serious, reserved, and lean appearance. Life begins with difficulty but steadily improves after 30. Discipline, responsibility, and patience are the dominant personality traits. The body ages slowly and endures long.",
    2: "Saturn in the 2nd — financial accumulation is slow but permanent. Speech is careful, serious, and sometimes harsh. Family responsibilities are heavy. Wealth through industry, mining, or service. Late material prosperity.",
    3: "Saturn in the 3rd — disciplined communication and persistent courage. Relationships with siblings may be formal or burdened. Writing is methodical and thorough. Short journeys serve a practical purpose. Courage develops slowly.",
    4: "Saturn in the 4th — early home life is burdened or cold. Mother may be hardworking or emotionally restrained. Property is acquired through persistent effort. Academic path may be interrupted but eventually completed.",
    5: "Saturn in the 5th — children may be delayed or few. Intelligence is serious, mathematical, and disciplined. Romantic relationships are formal or delayed. Teaching older students. Speculation is approached cautiously.",
    6: "Saturn in the 6th — exceptional placement for defeating chronic enemies and long-term health challenges. Service-oriented career with endurance. Legal and administrative work. Slow but complete victory over all obstacles.",
    7: "Saturn in the 7th — marriage is delayed or to an older partner. Spouse is serious, responsible, and loyal but not demonstratively affectionate. Business partnerships are stable, formal, and long-lasting.",
    8: "Saturn in the 8th — exceptional longevity. Life is long but marked by recurring delays and transformations. Research, occult, and hidden disciplines are mastered over time. Inheritance may be delayed or contested.",
    9: "Saturn in the 9th — disciplined philosophy, serious religious practice, and demanding father. Fortune comes slowly through persistent dharmic effort. Law, administration, and structured spirituality are the paths.",
    10: "Saturn in the 10th — powerful career position through discipline, patience, and sustained effort. Fame is earned slowly but lasts a lifetime. Government, law, and administration are natural careers. Peak achievement comes after 40.",
    11: "Saturn in the 11th — gains through industry, service, and long-term effort. Older or serious friends. Income from Saturn fields: mining, agriculture, law, administration. Goals are achieved through persistent systematic action.",
    12: "Saturn in the 12th — own house in the house of liberation — disciplined spiritual practice and karmic service. Expenses are controlled. Foreign service. Solitary and meditative. Moksha through patient surrender and selfless service."
},
'Rahu': {
    1: "Rahu in the 1st — unusual, magnetic, and non-conformist personality. Foreign qualities in appearance or manner. The self is amplified beyond ordinary limits. Ambition is intense. The soul's obsession this life is self-creation.",
    2: "Rahu in the 2nd — obsession with wealth, food, and speech. Unconventional income streams, possibly foreign. Speech may be dramatic or exaggerated. Foreign family connections. Sudden financial gains and losses.",
    3: "Rahu in the 3rd — powerful communicator and media personality. Courage is amplified beyond ordinary limits. Foreign media, internet, or technology fields. Sibling relationships are unusual or karmically significant.",
    4: "Rahu in the 4th — foreign homeland or unconventional home environment. Mother may be from a different background. Property acquired through unusual means. Emotional security is sought but elusive until inner work is done.",
    5: "Rahu in the 5th — unconventional intelligence and creative expression. Children may be unique or foreign. Romance is intense and karmic. Speculation with sudden highs and lows. Creative obsession and artistic intensity.",
    6: "Rahu in the 6th — powerful for defeating enemies through unconventional means. Service in foreign or technological fields. Health challenges that require unusual treatment. Competitive success through clever maneuvering.",
    7: "Rahu in the 7th — foreign or unconventional spouse. Marriage is intensely karmic and transformative. Business partnerships with foreigners or in technology. The soul meets its shadow through the partner.",
    8: "Rahu in the 8th — intense fascination with hidden knowledge, death, and transformation. Sudden inheritance. Occult powers and psychic sensitivity. Research into forbidden or taboo subjects. Sudden life disruptions that transform.",
    9: "Rahu in the 9th — unconventional or foreign philosophy and religion. Father may be from a different background or belief system. The soul questions all received wisdom and seeks its own truth across unusual paths.",
    10: "Rahu in the 10th — sudden and dramatic career rise, often in unconventional fields. Fame through technology, foreign connections, or unusual talent. The public persona is magnetic and non-conformist. Ambition is limitless.",
    11: "Rahu in the 11th — sudden and large gains through unconventional networks. Foreign friends and unusual alliances. Technology and internet-based income. Desires are intense and fulfilled through unexpected channels.",
    12: "Rahu in the 12th — foreign lands, hidden spiritual worlds, and deep psychic exploration. Overseas living or work. Dreams are vivid and prophetic. Expenses through foreign travel or unusual indulgences. Spiritual obsession."
},
'Ketu': {
    1: "Ketu in the 1st — spiritual detachment from personal identity. The self feels undefined or other-worldly. Past-life spiritual development makes worldly ego-building feel meaningless. Psychic sensitivity and deep intuition are natural gifts.",
    2: "Ketu in the 2nd — detachment from wealth, family, and speech. Money comes and goes without attachment. Family ties are karmically complex. Speech is often cryptic, spiritual, or unusual. Past-life financial karma resolves.",
    3: "Ketu in the 3rd — detachment from ordinary communication and courage. Spiritual writing or cryptic expression. Sibling bonds are karmically old and may dissolve. Short journeys lose interest; the inner journey captivates.",
    4: "Ketu in the 4th — detachment from home, mother, and emotional security. Frequent relocations. The search for home is ultimately interior. Mother relationship is karmically old and complex. Solitude brings more peace than company.",
    5: "Ketu in the 5th — detachment from children, romance, and ego-driven creativity. Past-life spiritual intelligence. Unconventional creative expression. Children may be spiritual or karmically challenging. Intuitive wisdom is spontaneous.",
    6: "Ketu in the 6th — past-life service dissolves ordinary health and enemy karma. The body heals in unusual ways. Enemies lose power without effort. Healing and service come instinctively from a place beyond ego.",
    7: "Ketu in the 7th — detachment from marriage and partnership. Spouse may be spiritual, unusual, or absent. Past-life partnership karma resolves. The soul seeks union with the divine rather than another person.",
    8: "Ketu in the 8th — most spiritually powerful placement for Ketu. Intuitive access to hidden worlds, past lives, and occult knowledge. Sudden spiritual revelations. Liberation is naturally close. Excellent for moksha.",
    9: "Ketu in the 9th — detachment from external religion and guru. The inner guru awakens. Father may be spiritually inclined or absent. Past-life dharmic wisdom manifests as natural spiritual insight without formal study.",
    10: "Ketu in the 10th — detachment from career, status, and worldly achievement. Past-life authority is released. The soul works without concern for recognition. Spiritual service replaces career ambition. Fame may come unexpectedly.",
    11: "Ketu in the 11th — detachment from gains, goals, and social network. Past-life abundance is released. Friendships dissolve or are spiritual in nature. Income is irregular but sufficient. Freedom from desire brings peace.",
    12: "Ketu in the 12th — own house energy — liberation is imminent across lifetimes. Profound spiritual gift. Dream life is rich and revelatory. Foreign or ashram living. The soul is ready for moksha."
}
}

# ── NAKSHATRA INTERPRETATIONS ─────────────────────────────────────────────────

NAKSHATRA = {
    'Ashwini':     {'deity':'Ashwini Kumaras (divine physicians)','lord':'Ketu','symbol':'Horse head','meaning':"The healer and pioneer. Swift action, fresh beginnings, and natural healing ability. The soul arrives full of divine medicine and enthusiasm. Impatience is the shadow; the gift is instantaneous healing and new starts."},
    'Bharani':     {'deity':'Yama (lord of death and dharma)','lord':'Venus','symbol':'Yoni (womb)','meaning':"The bearer of creative and destructive force. Bharani natives carry great burdens with dignity. They are intensely creative, sensual, and unafraid of the extremes of life. Transformation through embracing birth and death as equals."},
    'Krittika':    {'deity':'Agni (fire god)','lord':'Sun','symbol':'Razor or flame','meaning':"The cutter and purifier. Krittika natives are sharp, critical, and illuminating — they burn away what is false. Nurturing through tough love. Leadership through discernment. The fire that both destroys and cooks."},
    'Rohini':      {'deity':'Brahma (creator)','lord':'Moon','symbol':'Chariot or ox cart','meaning':"The most fertile and creative nakshatra. Rohini natives are beautiful, artistic, sensual, and profoundly creative. The Moon is most at home here. Abundance flows naturally; indulgence and possessiveness are the shadows."},
    'Mrigashira':  {'deity':'Soma (Moon god)','lord':'Mars','symbol':'Deer head','meaning':"The eternal seeker. Mrigashira natives are always searching — for knowledge, for beauty, for the divine. Gentle curiosity, sensitivity, and artistic refinement. The deer's alertness and tendency toward over-caution are both present."},
    'Ardra':       {'deity':'Rudra (storm god)','lord':'Rahu','symbol':'Teardrop or diamond','meaning':"The transformer through storm. Ardra natives experience intense periods of destruction followed by profound renewal. Raw intelligence, rebellious energy, and deep emotional processing. The storm that clears the air."},
    'Punarvasu':   {'deity':'Aditi (mother of gods)','lord':'Jupiter','symbol':'Bow and quiver','meaning':"The returner. Punarvasu means 'return of the light.' These natives are resilient, philosophical, and optimistic — they recover from any setback and always find their way home to grace. Renewal is their superpower."},
    'Pushya':      {'deity':'Brihaspati (Jupiter)','lord':'Saturn','symbol':'Flower, circle, udder','meaning':"The nourisher. Pushya is the most auspicious nakshatra for all beginnings. Natives are deeply caring, nurturing, and spiritually generous. Duty and service to family and community define the soul's expression."},
    'Ashlesha':    {'deity':'Nagas (serpent beings)','lord':'Mercury','symbol':'Coiled serpent','meaning':"The entwiner. Ashlesha natives have profound psychic ability, healing power, and penetrating intelligence — but also the capacity for manipulation if the lower nature is active. The kundalini rises through this nakshatra."},
    'Magha':       {'deity':'Pitru (ancestors)','lord':'Ketu','symbol':'Royal throne and palanquin','meaning':"The royal. Magha carries ancestral pride, natural leadership, and a deep connection to lineage. These natives are meant for positions of authority and honor. Ancestor reverence is essential for their well-being."},
    'Purva Phalguni':{'deity':'Bhaga (god of delight)','lord':'Venus','symbol':'Front legs of bed or hammock','meaning':"The playful creator. Purva Phalguni natives are creative, sensual, generous, and deeply oriented toward pleasure and creative partnership. Joy is their dharma. Art, love, and celebration are the soul's authentic expressions."},
    'Uttara Phalguni':{'deity':'Aryaman (god of contracts)','lord':'Sun','symbol':'Back legs of bed','meaning':"The partner and sovereign. Uttara Phalguni combines solar leadership with relational commitment. Marriage, contracts, and social agreements are elevated. Service to society through creative leadership and social grace."},
    'Hasta':       {'deity':'Savitar (solar deity of skill)','lord':'Moon','symbol':'Open hand','meaning':"The craftsperson. Hasta natives are extraordinarily skilled with their hands — healers, artists, craftspeople, and technicians. Dexterity, pragmatism, and clever resourcefulness. What the hands make, the soul speaks."},
    'Chitra':      {'deity':'Vishvakarma (divine architect)','lord':'Mars','symbol':'Bright jewel or pearl','meaning':"The architect of beauty. Chitra natives are drawn to beauty, design, and perfect form. Exceptional aesthetic vision, creative architecture, and the drive to make things beautiful. The bright jewel within darkness."},
    'Swati':       {'deity':'Vayu (wind god)','lord':'Rahu','symbol':'Young sprout, coral','meaning':"The independent. Swati natives are freedom-loving, adaptable, and socially skilled — like a blade of grass that bends in the storm but never breaks. Trade, diplomacy, and the ability to move freely through all social worlds."},
    'Vishakha':    {'deity':'Indra and Agni','lord':'Jupiter','symbol':'Triumphal arch, potter\'s wheel','meaning':"The achiever. Vishakha natives are intensely goal-oriented, patient in their ambition, and ultimately triumphant. The forked branch — choosing between worldly achievement and spiritual liberation. Both paths are equally valid."},
    'Anuradha':    {'deity':'Mitra (god of friendship)','lord':'Saturn','symbol':'Lotus flower','meaning':"The devoted friend. Anuradha natives build deep, loyal, and spiritually meaningful friendships. Organizational ability, devotion to a chosen path, and the capacity to bloom under pressure like the lotus in dark water."},
    'Jyeshtha':    {'deity':'Indra (king of gods)','lord':'Mercury','symbol':'Circular talisman, umbrella','meaning':"The elder and protector. Jyeshtha natives carry authority, responsibility, and protective power. They are the eldest in any group — the one others turn to in crisis. Great power comes with the burden of being the guardian."},
    'Mula':        {'deity':'Nirriti (goddess of dissolution)','lord':'Ketu','symbol':'Tied bunch of roots','meaning':"The rooter. Mula natives go to the root of everything — cutting through appearances to find the essential truth. Philosophers, researchers, and those who dissolve structures. The ability to destroy what is false and plant what is real."},
    'Purva Ashadha':{'deity':'Apas (waters)','lord':'Venus','symbol':'Elephant tusk, fan','meaning':"The invincible. Purva Ashadha natives are philosophically bold, energetically expansive, and relentlessly driven toward their vision of truth. Purification through water. The speaker whose words cannot be silenced."},
    'Uttara Ashadha':{'deity':'Vishvadevas (universal gods)','lord':'Sun','symbol':'Elephant tusk','meaning':"The undefeated. Uttara Ashadha natives achieve their goals through sustained effort, integrity, and right action. They are unstoppable once committed. Universal purpose — their work serves something larger than personal ambition."},
    'Shravana':    {'deity':'Vishnu (preserver)','lord':'Moon','symbol':'Three footprints or ear','meaning':"The listener. Shravana natives learn through listening deeply — to wisdom, to teachers, to the universe. They are preservers of knowledge and tradition. Media, education, and the transmission of wisdom are their natural callings."},
    'Dhanishtha':  {'deity':'Ashta Vasus (eight elemental gods)','lord':'Mars','symbol':'Flute and drum','meaning':"The wealthy musician. Dhanishtha natives have natural rhythmic ability, material abundance potential, and the gift for creating community through music or coordinated effort. Ambition combined with artistic soul."},
    'Shatabhisha': {'deity':'Varuna (god of cosmic order)','lord':'Rahu','symbol':'Empty circle, 100 stars','meaning':"The healer of hidden things. Shatabhisha natives are reclusive, independent healers and researchers. They heal what cannot be seen. Medicine, astrology, and hidden sciences are their domain. Solitude is not loneliness — it is their laboratory."},
    'Purva Bhadrapada':{'deity':'Aja Ekapada (one-footed goat)','lord':'Jupiter','symbol':'Front legs of funeral cot or sword','meaning':"The dual-natured purifier. Purva Bhadrapada natives carry both the spiritual and the worldly with unusual intensity. Transformation through fire. The soul is being refined across enormous pressure into something pure."},
    'Uttara Bhadrapada':{'deity':'Ahir Budhnya (serpent of depth)','lord':'Saturn','symbol':'Back legs of funeral cot','meaning':"The deep one. Uttara Bhadrapada natives carry profound wisdom, patience, and the capacity to endure without complaint. Connection to the ancient depths of the subconscious and collective. The quiet saint."},
    'Revati':      {'deity':'Pushan (nurturer of journeys)','lord':'Mercury','symbol':'Fish or drum','meaning':"The traveler. Revati is the final nakshatra — the end of the zodiacal cycle and the gateway to completion. Natives are compassionate, artistic, and spiritually evolved. They guide others on their journey home."},
}

# ── DASHA INTERPRETATIONS ─────────────────────────────────────────────────────

DASHA = {
    'Sun':     {'years':6,  'title':'Surya Mahadasha — 6 Years',   'core':"The Sun dasha activates soul-purpose, authority, and the karmic story of the father. Career visibility increases dramatically. Government, medicine, and leadership domains become prominent. Health comes into focus, particularly around the heart, eyes, and spine. Relationships with father figures, bosses, and authorities are central themes. If the Sun is strong in the natal chart, this period brings recognition, name, and status. If afflicted, conflicts with authorities and ego-related challenges arise. Spiritual practice around Surya is deeply supportive during this period.", 'worship':"Surya Puja, daily arghya (water offering to Sun), Ruby, Sunday fasts, Aditya Hridayam recitation"},
    'Moon':    {'years':10, 'title':'Chandra Mahadasha — 10 Years', 'core':"The Moon dasha activates the emotional body, the mind, and the story of the mother. The inner world becomes as important as the outer. Public life can flourish because the Moon rules the masses. Real estate, food, water, and nurturing domains are highlighted. The mind is more sensitive, intuitive, and potentially vulnerable to mood swings. Mother's health may come into focus. If the Moon is strong and waxing, this is an extraordinarily productive and emotionally fulfilling period. If afflicted or waning, mental health, anxiety, and emotional instability require attention.", 'worship':"Chandra Puja, Monday fasts, Pearl, offering milk to Shivling, Chandra Yantra"},
    'Mars':    {'years':7,  'title':'Mangal Mahadasha — 7 Years',   'core':"The Mars dasha activates energy, courage, land, siblings, and the warrior archetype. Career in technical, military, surgical, or athletic fields is strongly supported. Property acquisition and construction are favored. The body's energy is high and competitive. Conflicts, accidents, and disputes are also possible manifestations — Mars cuts both ways. Relationships with siblings, competitors, and colleagues come into focus. Passionate romantic energy is strong. If Mars is well-placed, this is a period of great accomplishment. If afflicted, accidents, blood-related issues, or conflicts require careful management.", 'worship':"Mangal Puja, Tuesday fasts, Red Coral, Hanuman Chalisa, red flowers to Hanuman"},
    'Mercury': {'years':17, 'title':'Budha Mahadasha — 17 Years',   'core':"The Mercury dasha is the longest major period for intellectual, commercial, and communicative growth. Writing, teaching, trading, and information technology domains flourish. Multiple career threads can run simultaneously. The mind is sharp, adaptable, and quick. Skin, nervous system, and digestive health need attention. Sibling relationships come into focus. If Mercury is strong, this 17-year period can produce extraordinary intellectual achievements, publications, and business success. Youth is preserved. Adaptability and versatility are the keys to navigating this long and richly varied period.", 'worship':"Saraswati Puja, Wednesday fasts, Emerald, green moong offering, Budh Yantra"},
    'Jupiter': {'years':16, 'title':'Guru Mahadasha — 16 Years',    'core':"Jupiter mahadasha is the most broadly auspicious of all major periods. Divine grace is active. Wisdom, wealth, children, marriage, and spiritual growth are all supported. The guru arrives — whether as a physical teacher or as inner wisdom. Higher education, law, religion, and publishing domains expand. Marriage often occurs during Jupiter dasha. Children are blessed during this period. Income and wealth grow through legitimate means. If Jupiter is strong, this can be the most transformative and expansive 16 years of the life. If afflicted, overconfidence, excess, and liver-related health issues require care.", 'worship':"Vishnu Puja, Thursday fasts, Yellow Sapphire, Brihaspati Yantra, banana offering"},
    'Venus':   {'years':20, 'title':'Shukra Mahadasha — 20 Years',  'core':"Venus mahadasha is the longest major period — 20 years of creative, romantic, and material blossoming. Art, beauty, music, marriage, vehicles, luxury, and sensory pleasure are all elevated. The feminine principle in life becomes prominent. If unmarried at the start of Venus dasha, marriage is very likely during this period. Creative careers reach their peak expression. Wealth through aesthetic or relationship-oriented fields grows. The body enjoys physical comfort. If Venus is strong, this is perhaps the most pleasurable and creative period of a lifetime. If afflicted, over-indulgence, romantic complications, or reproductive health require attention.", 'worship':"Lakshmi Puja, Friday fasts, Diamond or White Sapphire, white flowers, Shukra Yantra"},
    'Saturn':  {'years':19, 'title':'Shani Mahadasha — 19 Years',   'core':"Saturn mahadasha is the great karmic reckoning and purification. Whatever has been built with integrity endures; whatever was built on shortcuts collapses. Discipline, hard work, service, and patience are both demanded and rewarded. The body shows the effects of accumulated karma — chronic conditions, joints, bones, and teeth require attention. Career in government, law, administration, and service grows through patient effort. Recognition comes slowly but permanently. The first seven years are often the most challenging; the last twelve bring steadier rewards. Saturn ultimately rewards those who serve others without complaint.", 'worship':"Shani Puja, Saturday fasts, Blue Sapphire (after testing), black sesame and mustard oil lamp, Shani Yantra"},
    'Rahu':    {'years':18, 'title':'Rahu Mahadasha — 18 Years',    'core':"Rahu mahadasha is the period of worldly ambition, foreign connection, technology, and obsessive manifestation. The material world intensifies — desires become overwhelming and sometimes fulfilled in unexpected ways. Foreign travel, technology, and unconventional career paths are strongly activated. The mind may become restless, unclear, or anxious if not grounded. Illusions can feel very real. This period can produce dramatic worldly success or dramatic worldly confusion — the difference lies in whether Rahu's energy is channeled consciously. Spiritual practice is essential to stay grounded through the intensity of this 18-year journey.", 'worship':"Durga Puja, Rahu Yantra, feeding fish, donating to foreigners, Saturday evening prayers"},
    'Ketu':    {'years':7,  'title':'Ketu Mahadasha — 7 Years',     'core':"Ketu mahadasha is a period of spiritual detachment, dissolution, and past-life karma completing. What was built for ego-gratification loosens its grip. Spiritual insights arise suddenly and powerfully. The material world feels less compelling than the inner world. Occult knowledge, psychic experiences, and spiritual liberation are the deep gifts of this period. Career, relationships, and material goals may feel unfulfilling unless connected to a larger spiritual purpose. Health requires vigilance — mysterious symptoms, immune challenges, or sudden accidents are possible. Those who embrace the spiritual invitation of Ketu dasha are profoundly rewarded.", 'worship':"Ganesha Puja, Ketu Yantra, feed dogs, donate blankets, recite Ketu mantras"},
}

# ── PLANET REMEDIES (linked to shop items) ────────────────────────────────────

REMEDIES = {
    'Sun':     {'day':'Sunday','color':'Red/Orange','metal':'Gold','stone':'Ruby','grain':'Wheat','flower':'Sunflower, Red Rose, Marigold','fast':'Sunday fast (one meal)','mantra':'Om Hraam Hreem Hraum Sah Suryaya Namah (108x)','donation':'Wheat, copper, jaggery to the poor on Sundays','puja':'Surya puja at sunrise, offer water eastward','shop_items':['Sunflower (Suryamukhi)','Rose (Gulab) — Red','Wheat (Gehun/Godhuma)','Camphor (Kapur) — Bhimseni','Ruby (Manik) — Natural']},
    'Moon':    {'day':'Monday','color':'White/Silver','metal':'Silver','stone':'Pearl','grain':'Rice','flower':'White flowers, White Lotus, Chameli','fast':'Monday fast','mantra':'Om Shraam Shreem Shraum Sah Chandraya Namah (108x)','donation':'White rice, silver, milk to the poor on Mondays','puja':'Shivling abhishek with milk on Mondays','shop_items':['Rose (Gulab) — White','Akshat (Unbroken Rice, white)','Pure Cow Milk (Gai ko Doodh)','Pearl (Moti) — Basra','Silver Puja Thali']},
    'Mars':    {'day':'Tuesday','color':'Red/Coral','metal':'Copper','stone':'Red Coral','grain':'Red Lentil','flower':'Red Hibiscus, Red Rose, Marigold','fast':'Tuesday fast','mantra':'Om Kraam Kreem Kraum Sah Bhaumaya Namah (108x)','donation':'Red cloth, copper, red lentils on Tuesdays','puja':'Hanuman puja on Tuesdays','shop_items':['Hibiscus (Japa/Gurhal) — Red','Lentil (Masur Dal — red)','Red Coral (Moonga) — Italian','Mustard Oil (Sarso Tel)','Red Cloth (Shani Vastra)']},
    'Mercury': {'day':'Wednesday','color':'Green','metal':'Bronze/Brass','stone':'Emerald','grain':'Green Gram','flower':'Green flowers, Shankha Pushpa','fast':'Wednesday fast','mantra':'Om Braam Breem Braum Sah Budhaya Namah (108x)','donation':'Green cloth, bronze, green moong on Wednesdays','puja':'Saraswati puja and reading/writing on Wednesdays','shop_items':['Green Gram (Moong)','Emerald (Panna) — Colombian','Green Silk Cloth','Shankha Pushpa (Morning Glory)','Sapta Dhanya (Seven Grains Set)']},
    'Jupiter': {'day':'Thursday','color':'Yellow/Gold','metal':'Gold','stone':'Yellow Sapphire','grain':'Chickpea','flower':'Yellow flowers, Marigold, Champa','fast':'Thursday fast','mantra':'Om Graam Greem Graum Sah Gurave Namah (108x)','donation':'Yellow cloth, turmeric, chickpeas on Thursdays','puja':'Vishnu puja, banana offering on Thursdays','shop_items':['Marigold (Sayapatri/Genda)','Champak (Champa)','Chickpea (Chana/Chanaka)','Yellow Sapphire (Pukhraj)','Yellow Silk Cloth (Pitambar)']},
    'Venus':   {'day':'Friday','color':'White/Pink','metal':'Silver','stone':'Diamond/White Sapphire','grain':'Rice','flower':'White/Pink flowers, Jasmine, White Rose','fast':'Friday fast','mantra':'Om Draam Dreem Draum Sah Shukraya Namah (108x)','donation':'White cloth, silver, rice to young women on Fridays','puja':'Lakshmi puja on Fridays, lotus offering','shop_items':['Jasmine (Chameli)','Rose (Gulab) — White','Lotus (Kamal Phool)','Diamond (Heera) — Natural','White Silk Cloth']},
    'Saturn':  {'day':'Saturday','color':'Black/Dark Blue','metal':'Iron','stone':'Blue Sapphire (after testing)','grain':'Black Sesame, Black Gram','flower':'Blue/Purple flowers, Shami leaves','fast':'Saturday fast','mantra':'Om Praam Preem Praum Sah Shanaishcharaya Namah (108x)','donation':'Black sesame, mustard oil lamp, black cloth on Saturdays','puja':'Shani puja on Saturdays, light mustard oil lamp','shop_items':['Black Sesame (Kala Til)','Black Gram (Urad Dal/Maash)','Mustard Oil (Sarso Tel)','Blue Sapphire (Neelam)','Black Cloth (Shani Vastra)']},
    'Rahu':    {'day':'Saturday','color':'Multi/Smoke','metal':'Lead/Panchdhatu','stone':'Hessonite (Gomed)','grain':'Black Gram','flower':'Multi-coloured flowers, Blue flowers','fast':'Saturday evening prayers','mantra':'Om Bhram Bhreem Bhraum Sah Rahave Namah (108x)','donation':'Feed fish, donate to foreigners, black sesame on Saturdays','puja':'Durga puja, feeding blue or black colored items to birds','shop_items':['Aparajita (Butterfly Pea, Blue)','Black Sesame (Kala Til)','Hessonite (Gomed) — Natural','Hakik Stone (Black Agate)','Navagraha Cloth Set (9 pcs)']},
    'Ketu':    {'day':'Tuesday/Saturday','color':'Grey/Brown','metal':'Iron/Panchdhatu','stone':"Cat's Eye (Lehsunia)",'grain':'Sesame, Horse Gram','flower':'Multi-coloured, White flowers','fast':'Fasting on Tuesdays or Saturdays','mantra':'Om Sraam Sreem Sraum Sah Ketave Namah (108x)','donation':'Donate blankets, feed dogs, sesame on Saturdays','puja':'Ganesha puja, donation to the poor and animals','shop_items':['White Sesame (Safed Til)','Pumpkin Seeds (Kaddu Beej)','Cat\'s Eye (Lehsunia/Vaidurya)','Vibhuti (Sacred Ash)','5 Mukhi Rudraksha']},
}

# ── YOGA DESCRIPTIONS ─────────────────────────────────────────────────────────

YOGA_DESC = {
    'Gaja Kesari':         "Gaja Kesari Yoga — Moon and Jupiter in mutual kendra (1/4/7/10 from each other). One of the most auspicious yogas in Jyotish. The native possesses elephant-like memory, lion-like courage, and natural wisdom. Fame, prosperity, and social respect come throughout life. This yoga elevates the entire chart.",
    'Budha Aditya':        "Budha Aditya Yoga — Sun and Mercury in the same house. The intellect and the soul are aligned, producing sharp analytical intelligence, eloquent speech, and professional brilliance. Success in communication, government, and intellectual fields is strongly supported.",
    'Hamsa':               "Hamsa Yoga (Pancha Mahapurusha) — Jupiter in Kendra in Sagittarius, Pisces, or Cancer. The native embodies divine wisdom, grace, and prosperity. Leadership through wisdom rather than force. A deeply auspicious yoga producing philosophical leaders, judges, and teachers of great integrity.",
    'Ruchaka':             "Ruchaka Yoga (Pancha Mahapurusha) — Mars in Kendra in Aries, Scorpio, or Capricorn. Exceptional physical strength, courage, and leadership. Military, athletic, and engineering excellence. The native overcomes all opposition through sheer force of will and physical vitality.",
    'Malavya':             "Malavya Yoga (Pancha Mahapurusha) — Venus in Kendra in Taurus, Libra, or Pisces. Beauty, wealth, luxury, and romantic fulfillment. Exceptional artistic ability and the capacity to attract material abundance. A fortunate life surrounded by beauty and harmonious relationships.",
    'Sasa':                "Sasa Yoga (Pancha Mahapurusha) — Saturn in Kendra in Capricorn, Aquarius, or Libra. Disciplined power, political authority, and the capacity to lead large organizations. Success through persistent effort. Recognition comes slowly but is ultimately massive and enduring.",
}

# ── HOUSE KARMA DESCRIPTIONS ──────────────────────────────────────────────────

HOUSE_KARMA = {
    1:  "The 1st house (Lagna/Tanu Bhava) governs the self — the body, personality, health, appearance, and the overall direction of the life. Planets here colour the entire chart.",
    2:  "The 2nd house (Dhana Bhava) governs accumulated wealth, family, speech, food, right eye, and early childhood. It is the house of what you own and what you say.",
    3:  "The 3rd house (Sahaja Bhava) governs courage, communication, siblings, short journeys, writing, hands, and right ear. It is the house of personal initiative.",
    4:  "The 4th house (Sukha Bhava) governs home, mother, emotional happiness, vehicles, property, and academic foundations. It is the seat of inner peace.",
    5:  "The 5th house (Putra Bhava) governs children, intelligence, creativity, romance, past-life merit (purva punya), and speculation. It is the house of creative joy.",
    6:  "The 6th house (Ripu Bhava) governs enemies, illness, debts, service, legal disputes, and daily work. It is the house of karmic service and necessary friction.",
    7:  "The 7th house (Kalatra Bhava) governs marriage, business partnerships, the public, foreign lands, and the 'other' in all its forms.",
    8:  "The 8th house (Mrityu Bhava) governs longevity, inheritance, sudden events, occult knowledge, transformation, and the mysteries of life and death.",
    9:  "The 9th house (Dharma Bhava) governs fortune, father, guru, higher education, philosophy, religion, long journeys, and divine grace.",
    10: "The 10th house (Karma Bhava) governs career, status, reputation, government, public achievement, and the soul's dharmic work in the world.",
    11: "The 11th house (Labha Bhava) governs income, gains, fulfilled desires, friends, elder siblings, and the social network.",
    12: "The 12th house (Vyaya Bhava) governs liberation, foreign lands, losses, hidden life, expenses, sleep, and spiritual dissolution.",
}

# ── MAIN INTERPRETATION FUNCTION ─────────────────────────────────────────────

# Sanskrit → English sign name map (engine returns Sanskrit in 'sign', English in 'sign_en')
SIGN_EN = {
    'Mesha':'Aries','Vrishabha':'Taurus','Mithuna':'Gemini','Karka':'Cancer',
    'Simha':'Leo','Kanya':'Virgo','Tula':'Libra','Vrishchika':'Scorpio',
    'Dhanu':'Sagittarius','Makara':'Capricorn','Kumbha':'Aquarius','Meena':'Pisces',
    # pass-through if already English
    'Aries':'Aries','Taurus':'Taurus','Gemini':'Gemini','Cancer':'Cancer',
    'Leo':'Leo','Virgo':'Virgo','Libra':'Libra','Scorpio':'Scorpio',
    'Sagittarius':'Sagittarius','Capricorn':'Capricorn','Aquarius':'Aquarius','Pisces':'Pisces',
}

def to_en(sign):
    """Return English sign name regardless of whether input is Sanskrit or English."""
    return SIGN_EN.get(sign, sign)

def planet_dignity(planet, sign_en):
    """sign_en must be English sign name."""
    if sign_en == EXALTATION.get(planet):      return 'Exalted'
    if sign_en == DEBILITATION.get(planet):    return 'Debilitated'
    if sign_en in OWN_SIGNS.get(planet, []):   return 'Own Sign'
    lord = SIGN_LORDS.get(sign_en, '')
    friends = {
        'Sun':['Moon','Mars','Jupiter'],'Moon':['Sun','Mercury'],
        'Mars':['Sun','Moon','Jupiter'],'Mercury':['Sun','Venus'],
        'Jupiter':['Sun','Moon','Mars'],'Venus':['Mercury','Saturn'],
        'Saturn':['Mercury','Venus']
    }
    if planet in friends.get(lord, []):        return 'Friendly Sign'
    return 'Neutral'

def interpret_chart(data):
    """
    data = result from engine.compute_chart()
    Engine returns:
      lagna   → dict with keys: sign (Sanskrit), sign_en (English), lord, nakshatra, ...
      planets → LIST of dicts: name, sign (Sanskrit), sign_en (English),
                degree_in_sign, nakshatra, retrograde, combust, house, ...
      houses  → LIST of dicts: house (int), sign (Sanskrit), sign_en (English), lord, planets (list of names)
      yogas   → list (may be empty, or list of dicts with 'name' key, or list of strings)
      current_dasha       → dict with 'lord' key
      current_antardasha  → dict with 'lord' key
    """
    # ── normalise planets list → dict keyed by name ───────────────────────────
    raw_planets = data.get('planets', [])
    planet_map = {}  # name → info dict
    if isinstance(raw_planets, list):
        for p in raw_planets:
            planet_map[p['name']] = p
    else:
        planet_map = raw_planets  # already a dict

    # ── normalise houses list → dict keyed by house number ───────────────────
    raw_houses = data.get('houses', [])
    house_map = {}  # int → info dict
    if isinstance(raw_houses, list):
        for h in raw_houses:
            house_map[int(h['house'])] = h
    else:
        house_map = {int(k): v for k, v in raw_houses.items()}

    # ── lagna ─────────────────────────────────────────────────────────────────
    lagna_raw  = data.get('lagna', {})
    lagna_en   = to_en(lagna_raw.get('sign_en') or lagna_raw.get('sign', ''))
    lagna_data = LAGNA.get(lagna_en, {})

    lagna_lord_name = lagna_raw.get('lord', lagna_data.get('lord', ''))
    ll_info    = planet_map.get(lagna_lord_name, {})
    ll_sign_en = to_en(ll_info.get('sign_en') or ll_info.get('sign', '?'))
    ll_house   = ll_info.get('house', '?')
    ll_dignity = planet_dignity(lagna_lord_name, ll_sign_en)

    report = {}
    report['lagna'] = {
        'sign':          lagna_en,
        'title':         lagna_data.get('title', f'{lagna_en} Lagna'),
        'lord':          lagna_lord_name,
        'lord_position': f"{lagna_lord_name} is in {ll_sign_en} ({ll_dignity}) in the {ll_house}th house",
        'nature':        lagna_data.get('nature', ''),
        'core':          lagna_data.get('core', ''),
        'strengths':     lagna_data.get('strengths', ''),
        'challenges':    lagna_data.get('challenges', ''),
        'body':          lagna_data.get('body', ''),
        'career':        lagna_data.get('career', ''),
        'deity':         lagna_data.get('deity', ''),
    }

    # ── planets ───────────────────────────────────────────────────────────────
    report['planets'] = {}
    for pname, pinfo in planet_map.items():
        sign_en  = to_en(pinfo.get('sign_en') or pinfo.get('sign', ''))
        house    = int(pinfo.get('house', 0))
        nak      = pinfo.get('nakshatra', '')
        deg      = pinfo.get('degree_in_sign', pinfo.get('degrees', 0))
        retro    = bool(pinfo.get('retrograde', False))
        combust  = bool(pinfo.get('combust', False))
        dignity  = planet_dignity(pname, sign_en)

        sign_interp  = (PLANET_IN_SIGN.get(pname) or {}).get(sign_en, '')
        house_interp = (PLANET_IN_HOUSE.get(pname) or {}).get(house, '')
        nak_data     = NAKSHATRA.get(nak, {})

        status_parts = [dignity]
        if retro:    status_parts.append('Retrograde')
        if combust:  status_parts.append('Combust')
        status = ' · '.join(status_parts)

        retro_note = (
            f"{pname} is retrograde — its energy turns inward, intensifying the inner experience "
            f"of its domains while sometimes causing external delays. Past karma connected to {pname} "
            f"is actively being resolved. Traditional remedy: offer "
            f"{REMEDIES.get(pname, {}).get('flower', 'flowers')} to {pname}'s presiding deity."
        ) if retro else ''

        combust_note = (
            f"{pname} is combust the Sun — its significations are overpowered by solar ego. "
            f"Consciously cultivate {pname}'s qualities; they need active expression. "
            f"Puja specifically for {pname} is highly recommended."
        ) if combust else ''

        report['planets'][pname] = {
            'sign':              sign_en,
            'house':             house,
            'degrees':           round(float(deg), 2),
            'nakshatra':         nak,
            'dignity':           dignity,
            'status':            status,
            'nature':            PLANET_NATURE.get(pname, ''),
            'in_sign':           sign_interp,
            'in_house':          house_interp,
            'nakshatra_meaning': nak_data.get('meaning', ''),
            'nakshatra_deity':   nak_data.get('deity', ''),
            'nakshatra_lord':    nak_data.get('lord', ''),
            'retro_note':        retro_note,
            'combust_note':      combust_note,
            'remedy':            REMEDIES.get(pname, {}),
        }

    # ── houses ────────────────────────────────────────────────────────────────
    report['houses'] = {}
    for h_num in range(1, 13):
        hinfo      = house_map.get(h_num, {})
        hsign_en   = to_en(hinfo.get('sign_en') or hinfo.get('sign', ''))
        hlord      = hinfo.get('lord', SIGN_LORDS.get(hsign_en, ''))
        occupants  = list(hinfo.get('planets', []))
        ll_info2   = planet_map.get(hlord, {})
        lord_sign2 = to_en(ll_info2.get('sign_en') or ll_info2.get('sign', '?'))
        lord_house2= ll_info2.get('house', '?')
        lord_dig2  = planet_dignity(hlord, lord_sign2)

        report['houses'][h_num] = {
            'number':        h_num,
            'sign':          hsign_en,
            'lord':          hlord,
            'lord_position': f"{hlord} in {lord_sign2} ({lord_dig2}), {lord_house2}th house",
            'occupants':     occupants,
            'karaka':        HOUSE_KARMA.get(h_num, ''),
            'name':          HOUSE_NAMES.get(h_num, ''),
        }

    # ── yogas ─────────────────────────────────────────────────────────────────
    yogas = data.get('yogas', [])
    report['yogas'] = []
    for y in yogas:
        yname = y if isinstance(y, str) else y.get('name', str(y))
        desc  = ''
        for key, val in YOGA_DESC.items():
            if key.lower() in yname.lower() or yname.lower() in key.lower():
                desc = val
                break
        if not desc:
            desc = f"{yname}: A classical planetary combination present in your chart that elevates and influences your life path."
        report['yogas'].append({'name': yname, 'description': desc})

    # ── dasha ─────────────────────────────────────────────────────────────────
    cd   = data.get('current_dasha') or {}
    cad  = data.get('current_antardasha') or {}
    maha_lord  = cd.get('lord', cd.get('planet', ''))
    antar_lord = cad.get('lord', cad.get('planet', ''))
    maha_data  = DASHA.get(maha_lord, {})
    antar_data = DASHA.get(antar_lord, {})

    report['dasha'] = {
        'mahadasha_lord':    maha_lord,
        'mahadasha_title':   maha_data.get('title', f'{maha_lord} Mahadasha'),
        'mahadasha_core':    maha_data.get('core', ''),
        'mahadasha_worship': maha_data.get('worship', ''),
        'mahadasha_end':     cd.get('end', ''),
        'antardasha_lord':   antar_lord,
        'antardasha_title':  antar_data.get('title', f'{antar_lord} Antardasha') if antar_lord else '',
        'antardasha_core':   antar_data.get('core', ''),
        'antardasha_end':    cad.get('end', ''),
        'antardasha_synthesis': _synthesize_dasha(maha_lord, antar_lord),
    }

    # ── synthesis ─────────────────────────────────────────────────────────────
    strong = [p for p, d in report['planets'].items() if d['dignity'] in ('Exalted', 'Own Sign')]
    weak   = [p for p, d in report['planets'].items() if d['dignity'] == 'Debilitated']
    retro  = [p for p, d in report['planets'].items() if 'Retrograde' in d['status']]

    report['synthesis'] = {
        'strong_planets': strong,
        'weak_planets':   weak,
        'retro_planets':  retro,
        'yoga_count':     len(yogas),
        'summary':        _build_summary(lagna_en, strong, weak, yogas, maha_lord),
    }

    return report


def _synthesize_dasha(maha, antar):
    if not maha or not antar:
        return ''
    maha_d  = DASHA.get(maha, {})
    antar_d = DASHA.get(antar, {})
    if not maha_d or not antar_d:
        return ''
    friends = {
        'Sun':['Moon','Mars','Jupiter'],'Moon':['Sun','Mercury'],
        'Mars':['Sun','Moon','Jupiter'],'Mercury':['Sun','Venus'],
        'Jupiter':['Sun','Moon','Mars'],'Venus':['Mercury','Saturn'],
        'Saturn':['Mercury','Venus'],'Rahu':['Venus','Mercury','Saturn'],
        'Ketu':['Mars','Venus','Saturn']
    }
    relation = ("These two planetary energies are friendly and cooperative"
                if antar in friends.get(maha, []) else
                "These two planetary energies carry some inherent tension, requiring conscious navigation")
    return (
        f"The {maha} Mahadasha is currently running with the {antar} Antardasha. "
        f"{relation}. The broad {maha} themes — {maha_d.get('core','')[:150]}... "
        f"— are being focused and coloured by {antar} sub-period energy: {antar_d.get('core','')[:150]}... "
        f"Recommended combined worship: {maha_d.get('worship','')} alongside {antar_d.get('worship','')}."
    )


def _build_summary(lagna_en, strong, weak, yogas, maha_lord):
    parts = [
        f"This is a {lagna_en} rising chart, governed by {SIGN_LORDS.get(lagna_en,'')} "
        f"and shaped by all that this implies about the soul's fundamental orientation in this lifetime."
    ]
    if strong:
        parts.append(
            f"The strongest planetary placements — {', '.join(strong)} — bestow significant natural gifts "
            f"and areas where life results come with relative ease and grace."
        )
    if weak:
        parts.append(
            f"The debilitated planets — {', '.join(weak)} — mark the soul's primary growth edges: "
            f"areas requiring conscious effort, spiritual practice, and targeted remedies. "
            f"These are not flaws but the chart's most important invitations."
        )
    if yogas:
        ynames = [(y if isinstance(y, str) else y.get('name', '')) for y in yogas]
        parts.append(
            f"The presence of {len(yogas)} yoga(s) — {', '.join(ynames)} — elevates the chart "
            f"and indicates past-life merit actively manifesting in this lifetime."
        )
    if maha_lord:
        d = DASHA.get(maha_lord, {})
        parts.append(
            f"Currently in the {maha_lord} Mahadasha ({d.get('years','')} year period): "
            f"{d.get('core','')[:220]}..."
        )
    return ' '.join(parts)
