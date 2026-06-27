import { useState } from "react";
import { useIsMobile } from "../hooks/useBreakpoint.js";

const API = import.meta.env.VITE_API_URL || "/api";
const G = "#c9973a", BG = "#0f0400", TXT = "#fdf0d5", MUTED = "#b89060", CARD = "#1a0900";
const CURRENT_YEAR = 2026;

// Chaldean system
const CHALDEAN = {
  A:1,I:1,J:1,Q:1,Y:1, B:2,K:2,R:2,
  C:3,G:3,L:3,S:3, D:4,M:4,T:4,
  E:5,H:5,N:5,X:5, U:6,V:6,W:6,
  O:7,Z:7, F:8,P:8,
};

const PLANET = {1:"Sun",2:"Moon",3:"Jupiter",4:"Rahu",5:"Mercury",6:"Venus",7:"Ketu",8:"Saturn",9:"Mars"};
const DEITY  = {1:"Lord Surya",2:"Lord Chandra / Parvati",3:"Lord Vishnu / Brihaspati",4:"Goddess Durga",5:"Lord Ganesha",6:"Goddess Lakshmi",7:"Lord Shiva",8:"Lord Shani / Shiva",9:"Lord Hanuman"};
const COLOR  = {1:"Gold, Orange",2:"White, Silver",3:"Yellow, Turmeric",4:"Electric Blue, Grey",5:"Green, Turquoise",6:"White, Pink",7:"Violet, Maroon",8:"Black, Dark Blue",9:"Red, Crimson"};
const GEM    = {1:"Ruby (Manik)",2:"Pearl (Moti)",3:"Yellow Sapphire (Pukhraj)",4:"Hessonite (Gomed)",5:"Emerald (Panna)",6:"Diamond / White Sapphire",7:"Cat's Eye (Lahsuniya)",8:"Blue Sapphire (Neelam)",9:"Red Coral (Moonga)"};
const DAY    = {1:"Sunday",2:"Monday",3:"Thursday",4:"Saturday",5:"Wednesday",6:"Friday",7:"Sunday",8:"Saturday",9:"Tuesday"};
const MANTRA = {
  1:"Om Suryaya Namaha (108×)",2:"Om Chandraya Namaha (108×)",3:"Om Gurave Namaha (108×)",
  4:"Om Rahave Namaha (108×)",5:"Om Budhaya Namaha (108×)",6:"Om Shukraya Namaha (108×)",
  7:"Om Ketave Namaha (108×)",8:"Om Shanaischaraya Namaha (108×)",9:"Om Hanumate Namaha (108×)",
};
const TITLE  = {1:"The Pioneer",2:"The Diplomat",3:"The Creator",4:"The Builder",5:"The Explorer",6:"The Nurturer",7:"The Seeker",8:"The Achiever",9:"The Humanitarian"};
const PCOL   = {1:"#ff8c00",2:"#8888ee",3:"#ddaa00",4:"#7777bb",5:"#00aa55",6:"#ee55aa",7:"#996633",8:"#5577aa",9:"#cc3300"};
const PBORD  = {1:"#ffcc00",2:"#bbbbff",3:"#ffdd66",4:"#aaaadd",5:"#55dd99",6:"#ffaadd",7:"#cc9966",8:"#88aacc",9:"#ff8866"};

// Planet friendship matrix (Vedic)
const FRIENDS = {
  Sun:["Moon","Mars","Jupiter"], Moon:["Sun","Mercury"], Mars:["Sun","Moon","Jupiter"],
  Mercury:["Sun","Venus"], Jupiter:["Sun","Moon","Mars"], Venus:["Mercury","Saturn","Rahu"],
  Saturn:["Mercury","Venus","Rahu"], Rahu:["Venus","Saturn","Mercury"], Ketu:["Mars","Venus","Sun"],
};
const ENEMIES = {
  Sun:["Venus","Saturn","Rahu"], Moon:["Rahu","Ketu"], Mars:["Mercury","Rahu"],
  Mercury:["Moon","Ketu"], Jupiter:["Mercury","Venus","Rahu"], Venus:["Sun","Moon"],
  Saturn:["Sun","Moon","Mars"], Rahu:["Sun","Moon"], Ketu:["Mercury","Rahu"],
};

function getPlanetRel(n1, n2) {
  const p1 = PLANET[n1], p2 = PLANET[n2];
  if (n1 === n2) return "same";
  if (FRIENDS[p1]?.includes(p2)) return "friend";
  if (ENEMIES[p1]?.includes(p2)) return "enemy";
  return "neutral";
}

const REL_DATA = {
  same:   { label:"Mirror Energies",   color:"#44ccaa", icon:"◎", note:"Your birth personality and life destiny are ruled by the same planet. Who you instinctively are IS the direction your life wants to move. The challenge is not finding your path — it is managing the extremes of this energy's shadow side." },
  friend: { label:"Aligned Destiny",   color:"#44cc88", icon:"✦", note:"Your Moolank and Bhagyank rulers are planetary friends in the Vedic tradition. Your natural instincts support your life's direction. The person you are makes progress toward who you are becoming. This is a flowing, self-reinforcing combination." },
  neutral:{ label:"Conscious Bridge",  color:"#ccaa44", icon:"◈", note:"Your ruling planets are neither allies nor enemies — they are neutral. This means your birth nature and your destiny path run on different tracks. Life asks you to consciously bridge the two, which builds enormous adaptability and range." },
  enemy:  { label:"Sacred Tension",    color:"#cc6644", icon:"⚡", note:"Your Moolank and Bhagyank rulers are in opposition. This is not a flaw — it is the source of your greatest depth. The friction between who you naturally are and the path you must walk forces growth that the easier combinations never produce. Every great teacher, artist, and reformer carries this combination." },
};

// Personal Year descriptions
const PY = {
  1: { theme:"New Beginnings", action:"Plant",    color:"#ff8c00",
       past:"A Year 1 in the past was a year of bold new starts — decisions made, seeds planted, a sense of starting fresh that may have felt exciting or overwhelming, often both. If you launched something new, made a significant independent choice, or stepped into a new identity, that was this year's energy at work.",
       curr:"You are in a Year 1 right now. The old cycle has ended. This is the year to make the move you have been postponing, to start the thing, to claim the new direction. The universe is in a planting phase with you — what you begin now has the energy to grow for the next nine years. Do not wait for perfect conditions.",
       next:"A Year 1 ahead means a new 9-year cycle begins. Start preparing your intentions. What do you want to build in the next nine years of your life? The seed you plant in a Year 1 determines the harvest of your Year 8." },
  2: { theme:"Patience & Partnership", action:"Wait",   color:"#8888ee",
       past:"A Year 2 in the past asked you to slow down, cooperate, and wait. If you forced things or tried to act unilaterally, you likely met resistance. The year rewarded collaboration, sensitivity, and patience over independent action.",
       curr:"You are in a Year 2 — a year of gestation, not action. Your seed from last year is growing underground. Your role now is to tend, not push. Relationships, partnerships, and quiet inner work are the real work of this year. Resist the urge to rush.",
       next:"A Year 2 ahead is a year to cultivate — relationships, ideas, partnerships. Prepare to receive rather than force. The right ally or collaboration may arrive this year." },
  3: { theme:"Expression & Expansion", action:"Create", color:"#ddaa00",
       past:"A Year 3 in the past was socially rich — new connections, creative projects, expression, and expansion. If you felt scattered or indulgent, that was the shadow of this year's energy. At its best, it was a year of joy, communication, and growth.",
       curr:"You are in a Year 3 — a year to express, create, connect, and expand. The energy supports communication in all forms: writing, speaking, socializing, creating. This is not a year to contract or hide. Put yourself out there. The world is ready to receive you.",
       next:"A Year 3 ahead brings creative expansion and social opportunity. Begin preparing creative projects now so they are ready to launch into this expressive energy." },
  4: { theme:"Hard Work & Foundation", action:"Build",  color:"#7777bb",
       past:"A Year 4 in the past demanded effort, discipline, and often felt restrictive or slow. Things that needed to be fixed — systems, foundations, routines — required your attention. The fruits of this year are usually not visible until much later.",
       curr:"You are in a Year 4 — the year to build, organize, and strengthen foundations. This is not glamorous work. But the structure you create this year holds everything you will build for the next five years. Do not avoid the unglamorous tasks.",
       next:"A Year 4 ahead requires discipline and patience. Use the time before it arrives to clear clutter — physical, mental, relational — so the building work has a clean foundation." },
  5: { theme:"Change & Freedom",       action:"Move",   color:"#00aa55",
       past:"A Year 5 in the past was unpredictable — change arrived whether invited or not. Travel, new experiences, shifts in circumstance. If you resisted, it was turbulent. If you embraced it, it was exhilarating.",
       curr:"You are in a Year 5 — the year of change, freedom, and unexpected turns. Do not resist. Opportunities come through movement, not stillness. Be willing to adapt quickly. What you think you want may be replaced by something better than you imagined.",
       next:"A Year 5 ahead brings disruption and liberation in equal measure. Leave room in your plans for the unexpected — it will come, and it will carry opportunity inside it." },
  6: { theme:"Love & Responsibility",  action:"Serve",  color:"#ee55aa",
       past:"A Year 6 in the past centered on home, family, love, and obligation. Relationships demanded more from you. You may have taken on caring responsibilities, resolved family matters, or felt the pull of duty strongly.",
       curr:"You are in a Year 6 — a year of love and responsibility. Your home, your relationships, and your community need your attention. This is a year to heal, to give, to commit. Do not neglect the people who depend on you — and do not neglect yourself in the process of caring for them.",
       next:"A Year 6 ahead will ask more from you relationally. Strengthen your key relationships now. Resolve outstanding family tensions before this energy amplifies them." },
  7: { theme:"Introspection & Study",  action:"Reflect",color:"#996633",
       past:"A Year 7 in the past was introspective, perhaps isolating. Deep study, spiritual inquiry, or significant inner shifts. External results were sparse — the work was entirely internal. What you discovered about yourself in that year may only be revealing its value now.",
       curr:"You are in a Year 7 — a year of withdrawal, deep study, and inner reckoning. This is the most spiritual year of the 9-year cycle. Solitude is productive. Study is rewarded. Rest is essential. Do not measure this year by external achievements. The treasure is buried inward.",
       next:"A Year 7 ahead is a year for inner work and preparation. Create space in your life for stillness, learning, and spiritual practice before this energy arrives." },
  8: { theme:"Power & Harvest",        action:"Claim",  color:"#5577aa",
       past:"A Year 8 in the past was a year of significant achievement, financial movement, and karmic accounting. What you had invested effort in came to harvest — for better or worse. Power, money, and authority were central themes.",
       curr:"You are in a Year 8 — the harvest year. Everything you have worked for and built over the previous seven years is now ready to be claimed. This is the year for bold financial moves, claiming authority, and stepping into your power fully. Karma also settles debts this year.",
       next:"A Year 8 ahead is your harvest window. Ensure the foundations are strong now — what you claim in a Year 8 must be built on real work and integrity, or it will not hold." },
  9: { theme:"Completion & Release",   action:"Let Go", color:"#cc3300",
       past:"A Year 9 in the past was a year of endings, completions, and release. Relationships, phases of life, or identities that had run their course fell away — sometimes painfully, always necessarily. What you let go made room for what is coming.",
       curr:"You are in a Year 9 — the year of completion and release. The 9-year cycle that began in your last Year 1 is closing. Let go of what no longer belongs to your next chapter — relationships, roles, beliefs, places. Give generously. Forgive thoroughly. The Year 1 that follows will be the most powerful new beginning of your life.",
       next:"A Year 9 ahead requires courage to release. Begin now identifying what has run its course in your life. The cleaner your release, the more powerful your incoming Year 1." },
};

// Deep number data with concrete, specific language
const NUM_DATA = {
  1: {
    personality: "You feel most alive when you are the one who decides. Not because you distrust others — but because your inner compass is precise and waiting to be followed. You have an instinct for what is right that precedes logic, and a need to act on it that precedes comfort. You were not made to wait for permission. When you lead, others feel safer, even if they cannot explain why.",
    strengths: ["Decisive authority that others naturally defer to","The courage to start things that haven't been done before","Self-reliance that never becomes neediness","A will that bends under pressure and springs back stronger","Originality — your instincts move in directions no map covers"],
    challenges: ["Stubbornness disguised as conviction","Difficulty acknowledging when you are wrong","Impatience with people who process more slowly","A loneliness that comes from always leading","Workaholism as a substitute for intimacy"],
    career: "Leadership, entrepreneurship, politics, innovation, military command, executive roles. You are built for positions where the final decision is yours. You suffocate in the middle of hierarchies.",
    love: "You love fiercely, but you love like a fire — intense warmth and the risk of burning. You need a partner who stands in their own strength without competing with yours. Your deepest fear in love is dependence. Learn to let someone in.",
    health: "Sun-ruled: heart, spine, eyes, blood pressure. Watch burnout from over-leading. Morning sun exposure, cardiovascular exercise, and genuine rest — not just sleep — are essential.",
  },
  2: {
    personality: "You feel things before you understand them. You walk into a room and know who is unhappy, who is pretending, who needs to be heard — before a word is spoken. This is not a skill you learned. You were born with the room already inside you. Your greatest gift is making people feel genuinely heard in a world that is mostly waiting to speak.",
    strengths: ["Emotional intelligence that reads rooms and people precisely","A peacemaking instinct that resolves tension others don't even see","Loyalty so deep it becomes its own form of courage","Intuition that rivals any instrument","The capacity to hold space for others' pain without collapsing"],
    challenges: ["Suppressing your own needs so consistently you forget what they are","Taking on others' emotional weather as your own","Avoiding conflict until it becomes crisis","Mood cycles tied to people and environment around you","Co-dependency — love that loses itself in the other"],
    career: "Counseling, healing, diplomacy, music, nursing, social work, mediation, teaching. You excel wherever human connection is the actual work, not the background to the work.",
    love: "You are the most devoted partner there is — but devotion without boundaries becomes disappearance. You need someone stable, consistent, and able to receive as well as take. You must learn that love does not require you to become invisible.",
    health: "Moon-ruled: digestion, chest, hormones, fluids. Prone to anxiety and emotional eating. Time near water, moon-awareness practices, and protecting your sleep are not luxuries — they are maintenance.",
  },
  3: {
    personality: "Your mind never stops making connections. A conversation, a book, a stranger's face — everything becomes raw material. You can take any idea and make it beautiful, and you can make almost anyone feel that their story matters. What others call your charm is actually something deeper: you genuinely find people interesting, and they feel that.",
    strengths: ["The ability to express what others can only feel","Infectious optimism that is contagious in the best way","Intellectual range that moves across fields with ease","A storytelling gift that can make truth feel like magic","Joy — real, renewable, and shared freely"],
    challenges: ["Scattering your gifts across too many directions","Starting brilliantly and finishing inconsistently","Emotional superficiality as self-protection","Spending and indulging in excess when life feels empty","The gap between what you can imagine and what you follow through on"],
    career: "Writing, teaching, performing, law, philosophy, comedy, design, filmmaking, public speaking. Any field where language, ideas, or beauty are the core product.",
    love: "You fall in love with the idea as much as the person — and you make love feel like a creative act. You need a partner who appreciates your need for creative freedom and gives you space to be larger than the relationship. A partner who shrinks you will lose you.",
    health: "Jupiter-ruled: liver, hips, thighs. The risk is excess in all directions — food, drink, commitments, indulgence. Your body responds well to movement and needs it to process the enormous amount of energy you generate.",
  },
  4: {
    personality: "You build things. Not just physically — you build systems, routines, and foundations that others stand on without knowing they're there. Most people take credit for inspiration; you take responsibility for execution. You are the one still working when everyone else has gone home. The world runs on people like you, even when it forgets to say so.",
    strengths: ["A work ethic that outlasts everyone else in the room","The ability to turn vision into reality through sheer persistence","Reliability — when you say you will do something, it happens","Long-range thinking that sees decades, not quarters","Trustworthiness that becomes a form of reputation"],
    challenges: ["Resistance to change even when the current structure has stopped working","Pessimism that emerges as 'realism' when you're under pressure","Rigidity in methods long after better methods exist","Work as a substitute for emotional presence","Rahu's shadow: obsessive attachment to outcomes, restlessness under the surface"],
    career: "Engineering, architecture, finance, accountancy, real estate, construction, project management, law enforcement. You build the infrastructure others inhabit.",
    love: "You love through stability, provision, and constancy. You do not say it easily — you show it through what you build and who you protect. You need a partner who can read love in action, not just in words.",
    health: "Rahu-ruled: nervous system, skin, respiratory. Prone to anxiety, obsessive thinking, and conditions that are hard to diagnose. Mental rest is as important as physical rest — which you rarely take.",
  },
  5: {
    personality: "You collect experiences the way others collect possessions. You've had conversations that changed you, places that remade you, and you would do it all again without hesitation. What other people call chaos, you call Tuesday. You are the most mentally agile of all numbers — you can talk to anyone, adapt to anything, and learn any skill with startling speed. The world is endlessly interesting to you, and that is not nothing.",
    strengths: ["Mental agility that adapts faster than circumstances can change","Communication that meets people exactly where they are","Adventurousness that turns obstacles into plot twists","The ability to make any room more alive","A curiosity that never exhausts itself"],
    challenges: ["Commitment feels like a closing door, not an opening one","Restlessness that mistakes movement for progress","Inconsistency that reads as unreliability to people who need you","Sensation-seeking that tips into excess","Finishing nothing, because starting feels like the real thing"],
    career: "Sales, media, journalism, travel, trading, consulting, entrepreneurship, technology, diplomacy. Any work that changes daily and rewards adaptability over routine.",
    love: "You are thrilling to be with. But you need a partner who can hold their own without needing you to stay still. The partner who gives you freedom without insecurity is rare and irreplaceable when found.",
    health: "Mercury-ruled: nervous system, lungs, hands. Anxiety and scattered energy are your primary health risks. Pranayama, grounding practices, and consistent sleep schedules — the things that feel most restrictive to you — are exactly what your system needs.",
  },
  6: {
    personality: "You cannot watch someone suffer and do nothing. It is physically uncomfortable for you. This is your greatest virtue and the quality most frequently exploited — the world quickly learns that you will show up, and some people stop learning to show up for themselves. You carry responsibility the way others carry keys — automatically, without thinking about the weight.",
    strengths: ["A capacity for love that goes deeper than most people know love can go","The ability to create harmony in environments that felt irreconcilable","Natural healing presence — people feel better simply by being near you","Aesthetic sensitivity that finds beauty in unexpected places","Devotion that does not waver when things get difficult"],
    challenges: ["Carrying burdens that are not yours to carry","Perfectionism that turns inward as self-criticism","Difficulty saying no to people you love even when you should","Martyrdom — giving until empty, then wondering why you are empty","Possessiveness or jealousy when you feel the love you give is not received equally"],
    career: "Medicine, healing arts, teaching, design, social work, hospitality, childcare, counseling, fashion. You are the caregiver in every professional context you enter.",
    love: "You love with everything. The risk is that you attract people who need saving — and love that begins as rescue rarely becomes partnership. Choose someone who does not need fixing. Choose someone who brings as much as they take.",
    health: "Venus-ruled: kidneys, reproductive system, throat, skin. Prone to carrying others' stress in the body. Self-care is not indulgence for you — it is maintenance. Your ability to serve others depends entirely on how well you serve yourself first.",
  },
  7: {
    personality: "You think in questions, not answers. The mystery interests you more than the solution. You go deep where others go wide, and you have a tolerance for ambiguity that most people find actively uncomfortable. Being alone is not loneliness for you — it is where you become yourself. The world often mistakes your depth for distance. Let them. You know the difference.",
    strengths: ["An analytical depth that others rarely reach","Intuition that borders on perception of what is not yet visible","The capacity to sit with uncertainty until truth reveals itself","A spiritual awareness that arrived before any formal practice","Ability to see through performance to what is actually real"],
    challenges: ["Withdrawal that becomes isolation before you notice it happening","Difficulty expressing what you feel in language others can receive","A skepticism that can curdle into cynicism","Keeping people at the exact distance where they cannot fully know you","Ketu's shadow: detachment that reads as coldness, even when the warmth is real"],
    career: "Research, philosophy, psychology, astrology, writing, science, medicine, spiritual teaching, investigation. Any field where solitary depth produces results others cannot replicate by working faster or harder.",
    love: "You love selectively and permanently. Once you trust, it is absolute. But you build trust slowly, through observation rather than conversation. You need a partner who can interpret your silences correctly — not as absence, but as fullness.",
    health: "Ketu-ruled: prone to mysterious or misdiagnosed conditions. Nervous system, skin, digestion. Meditation, mantra, and time in nature are not supplementary for you — they are primary medicine.",
  },
  8: {
    personality: "Life has given you heavier weights than most — not as punishment, but as tuition. Everything you have earned the hard way has given you something that cannot be faked: real authority. Not the authority of a title, but the authority of someone who has faced the thing and survived it. When you walk into a room, something in the room recognizes that.",
    strengths: ["Resilience that recovers from losses that would stop others permanently","Strategic intelligence that sees the long game when others see only the next move","An executive presence that inspires confidence in uncertain conditions","The ability to build wealth and structure through disciplined effort","Wisdom born from experience rather than theory"],
    challenges: ["Saturn's testing: life gives you more obstacles, delays, and losses than the average person as karmic curriculum","Control that becomes rigidity when you feel unsafe","Work that crowds out everything soft and personal","A ruthlessness that appears when the goal matters more than the people","Difficulty receiving help, care, or softness — even when it is genuine"],
    career: "Business, law, politics, finance, banking, surgery, engineering, administration. You are built for power — but must earn it through integrity, not shortcuts. Saturn ensures that anything built on dishonesty is eventually dismantled.",
    love: "You love through protection, provision, and constancy. You do not perform softness easily. Your partner must understand that your version of love looks like showing up, not saying the right words. Guard against letting career crowd out intimacy until there is nothing left to come home to.",
    health: "Saturn-ruled: bones, teeth, joints, knees. Chronic rather than acute conditions. Cold, stress, and overwork accumulate in the body over years. Discipline in rest is as important as discipline in work — and far harder for you to implement.",
  },
  9: {
    personality: "You feel other people's pain as your own — sometimes before they feel it themselves. This is not metaphor. You absorb the emotional atmosphere around you, and when the world is suffering, you suffer with it. Your instinct is always toward the one who is struggling, the cause that has been abandoned, the story that has not been told. This is why your rest matters more than you know — you are porous in a way that most people are not.",
    strengths: ["Compassion that moves from feeling into action, not just sentiment","A wisdom that arrived before it was earned — past-life knowledge surfacing","The courage to fight for what is right when everyone else has moved on","The ability to complete things — cycles, projects, relationships — with grace","A magnetism that draws people who need exactly what you carry"],
    challenges: ["Absorbing others' pain until your own needs disappear","Anger that erupts when you see injustice — sometimes without warning","Holding on too long — to people, places, phases of life — past their usefulness","Impulsiveness in moments of passion that you later need to repair","Giving so much to the world that the people closest to you get what remains"],
    career: "Medicine, law, social activism, teaching, healing, military, spiritual leadership, writing, philosophy. Any path where courage and compassion intersect — where the work matters more than the reward.",
    love: "You love with your whole being — completely and sometimes overwhelmingly. You need someone who can receive great love without feeling consumed by it. The partner who matches your emotional capacity without needing you to be smaller is rare. Do not settle for less.",
    health: "Mars-ruled: blood, the head, inflammation, fever, accidents. Over-giving is your primary health risk. Your body carries the weight of what your emotions absorb. Rest, solitude, and practices that empty the vessel are not optional for you.",
  },
};

// Specific combination notes for particularly significant Moolank+Bhagyank pairs
const COMBO_NOTE = {
  "1+8":"Sun and Saturn — the father and the judge. Your instinct is toward light, leadership, and assertion; your destiny demands discipline, patience, and karmic reckoning. The tension between them is the engine of your life. Neither wins. Both are necessary.",
  "8+1":"Saturn and Sun — same as above in reverse: you were formed by discipline and limitation, but your destiny calls you toward the light, leadership, and self-expression you may have been denied early on.",
  "1+6":"Sun and Venus — the will and the heart. You are a natural leader who also needs love deeply. The tension between authority and intimacy is central to your life. You may have to choose, repeatedly, between power and softness — until you learn they are not opposites.",
  "6+1":"Venus and Sun — you lead through love, care, and beauty. But the Sun's energy in your destiny asks you to claim authority you may have been taught was not yours to hold.",
  "3+9":"Jupiter and Mars — two expansive, generous, dharmic energies. You were born to create and destined to serve. This is one of the most spiritually potent combinations — the artist-warrior, the teacher-healer.",
  "9+3":"Mars and Jupiter — same energy: a warrior born to create. Your life's work is both fierce and beautiful.",
  "2+8":"Moon and Saturn — deep sensitivity with a karmic mission. You feel everything and you must carry a heavy load. The Moon gives you empathy; Saturn gives you the endurance to actually help. Together they make the compassionate leader.",
  "8+2":"Saturn and Moon — karmic weight carried with feeling. Your life teaches you that real strength includes softness.",
  "7+4":"Ketu and Rahu — the nodal axis in numerological form. You carry ancient wisdom (Ketu/7) while your destiny pulls you toward material mastery and worldly desire (Rahu/4). You are living out the karmic axis in a single lifetime.",
  "4+7":"Rahu and Ketu — the reverse axis: worldly, driven, materially focused at birth, destined for spiritual depth and withdrawal. Many renunciants and sages carry this combination.",
};

function reduce(n) {
  while (n > 9) n = String(n).split("").reduce((a,d) => a + Number(d), 0);
  return n;
}
function calcMoolank(day) { return reduce(day); }
function calcBhagyank(day, month, year) {
  return reduce(`${day}${month}${year}`.split("").reduce((a,d) => a + Number(d), 0));
}
function calcNamank(name) {
  const sum = name.toUpperCase().replace(/[^A-Z]/g,"").split("").reduce((a,c) => a + (CHALDEAN[c]||0), 0);
  return reduce(sum);
}
function calcPersonalYear(day, month, yr) {
  return reduce(`${day}${month}${yr}`.split("").reduce((a,d) => a + Number(d), 0));
}

function formatMd(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")
    .replace(/^#{1,3} (.+)$/gm,"<strong>$1</strong>")
    .replace(/\n/g,"<br/>");
}

// ── Components ─────────────────────────────────────────────────────────────

function InfoBox({ label, value }) {
  return (
    <div style={S.infoBox}>
      <div style={{color:MUTED,fontSize:11,textTransform:"uppercase",letterSpacing:1}}>{label}</div>
      <div style={{color:TXT,fontSize:14,marginTop:4}}>{value}</div>
    </div>
  );
}

function SectionBlock({ title, text }) {
  return (
    <div style={{marginTop:18}}>
      <div style={S.sLabel}>{title}</div>
      <div style={{color:TXT,fontSize:15,lineHeight:1.8,opacity:0.9}}>{text}</div>
    </div>
  );
}

function NumCard({ num, label }) {
  const isMobile = useIsMobile();
  const d = NUM_DATA[num]; if (!num||!d) return null;
  return (
    <div style={{...S.card, borderColor:PBORD[num]}}>
      <div style={{...S.numHeader, flexWrap:"wrap"}}>
        <div style={{fontSize: isMobile ? 52 : 72,fontWeight:"bold",color:PCOL[num],fontFamily:"Georgia,serif",minWidth:60,textAlign:"center",lineHeight:1}}>{num}</div>
        <div>
          <div style={{color:PBORD[num],fontSize: isMobile ? 17 : 20,fontFamily:"Georgia,serif"}}>{TITLE[num]}</div>
          <div style={{color:MUTED,fontSize:13,marginTop:4}}>{label} · ruled by {PLANET[num]}</div>
        </div>
      </div>
      <div style={S.grid3}>
        <InfoBox label="Ruling Planet"   value={PLANET[num]} />
        <InfoBox label="Deity"           value={DEITY[num]}  />
        <InfoBox label="Lucky Colour"    value={COLOR[num]}  />
        <InfoBox label="Gemstone"        value={GEM[num]}    />
        <InfoBox label="Auspicious Day"  value={DAY[num]}    />
        <InfoBox label="Sacred Mantra"   value={MANTRA[num]} />
      </div>
      <SectionBlock title="Core Personality" text={d.personality} />
      <div style={{...S.twoCol, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr"}}>
        <div>
          <div style={S.sLabel}>Strengths</div>
          <ul style={S.ul}>{d.strengths.map((s,i)=><li key={i} style={S.li}>{s}</li>)}</ul>
        </div>
        <div>
          <div style={S.sLabel}>Challenges</div>
          <ul style={S.ul}>{d.challenges.map((c,i)=><li key={i} style={S.li}>{c}</li>)}</ul>
        </div>
      </div>
      <SectionBlock title="Career & Purpose"       text={d.career} />
      <SectionBlock title="Love & Relationships"   text={d.love}   />
      <SectionBlock title="Health & Body"          text={d.health} />
    </div>
  );
}

function CombinedSection({ moolank, bhagyank, namank, name }) {
  const rel = getPlanetRel(moolank, bhagyank);
  const rd  = REL_DATA[rel];
  const comboKey = `${moolank}+${bhagyank}`;
  const comboNote = COMBO_NOTE[comboKey];
  const mp  = PLANET[moolank], bp = PLANET[bhagyank], np = namank ? PLANET[namank] : null;

  return (
    <div style={{...S.card, borderColor:rd.color, marginBottom:40}}>
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:24,paddingBottom:20,borderBottom:"1px solid #ffffff11"}}>
        <div style={{fontSize:48,color:rd.color}}>{rd.icon}</div>
        <div>
          <div style={{color:rd.color,fontSize:22,fontFamily:"Georgia,serif",fontWeight:"bold"}}>{rd.label}</div>
          <div style={{color:MUTED,fontSize:14,marginTop:4}}>
            Moolank {moolank} ({mp}) · Bhagyank {bhagyank} ({bp}){namank?` · Namank ${namank} (${np})`:""}
          </div>
        </div>
      </div>

      <SectionBlock title="The Relationship Between Your Numbers" text={rd.note} />

      {comboNote && (
        <div style={{background:"#2a110033",border:`1px solid ${rd.color}44`,borderRadius:8,padding:"16px 20px",marginTop:20}}>
          <div style={S.sLabel}>Specific to {moolank}+{bhagyank}</div>
          <div style={{color:TXT,fontSize:15,lineHeight:1.8}}>{comboNote}</div>
        </div>
      )}

      <SectionBlock
        title="Your Birth Nature vs. Your Destiny Path"
        text={`Your Moolank ${moolank} (${mp}) describes the person you were born as — your instinctive energy, your default mode, the self that appears before you have had time to think. Your Bhagyank ${bhagyank} (${bp}) describes the direction your life is designed to move — the lessons, the purpose, the path your soul signed up for. ${
          rel==="same"  ? `Because both are governed by the same planet, there is no gap between your natural self and your destined direction. You were born already aligned. The work is not to find the path — it is to master this energy's depth without falling into its shadow.`
        : rel==="friend"? `Because ${mp} and ${bp} are planetary friends, your natural instincts tend to propel you toward your life's purpose rather than away from it. You do not have to fight yourself to move in the right direction. The challenge is complacency — this ease can make the deeper work feel optional.`
        : rel==="neutral"? `Because ${mp} and ${bp} are in neutral relationship, your birth nature and your life's direction run on parallel tracks that do not automatically merge. You must consciously translate who you are into where you are going. This translation work is the real curriculum of your life — and it produces extraordinary range.`
        : `Because ${mp} and ${bp} are in planetary opposition, who you naturally are creates friction with where you are meant to go. This is not a problem to be fixed. It is a design. The friction between your ${moolank}-energy and your ${bhagyank}-path is the engine that drives your deepest growth. Every transformation you undergo will emerge from this tension.`
        }`}
      />

      {namank && (
        <SectionBlock
          title={`How Your Name (Namank ${namank} · ${np}) Fits`}
          text={(() => {
            const mnRel = getPlanetRel(moolank, namank), bnRel = getPlanetRel(bhagyank, namank);
            const mnTxt = mnRel==="friend"?"amplifies and supports" : mnRel==="enemy"?"creates useful friction with" : "sits in quiet dialogue with";
            const bnTxt = bnRel==="friend"?"reinforces and accelerates" : bnRel==="enemy"?"challenges and refines" : "moves in parallel with";
            return `The name "${name}" vibrates at ${np}'s frequency (Namank ${namank}). In the Chaldean tradition, your name number is the energy you project outward — how the world perceives and responds to you, regardless of your inner reality. Your Namank ${mnTxt} your Moolank and ${bnTxt} your Bhagyank. ${
              mnRel==="friend"&&bnRel==="friend" ? "This is a very fortunate name alignment — your projected energy supports both who you are and where you are going." :
              mnRel==="enemy"||bnRel==="enemy" ? "There is productive friction between your name's vibration and your core numbers. Chaldean numerologists sometimes recommend name adjustments (adding or removing a letter) when the Namank works against the Moolank or Bhagyank — worth considering if you have experienced persistent resistance in life." :
              "Your name's energy neither blocks nor accelerates your path — it witnesses it. The neutral relationship gives you flexibility in how you present yourself."
            }`;
          })()}
        />
      )}
    </div>
  );
}

function PersonalYearSection({ day, month }) {
  const isMobile = useIsMobile();
  const currPY = calcPersonalYear(day, month, CURRENT_YEAR);
  const pastPY = calcPersonalYear(day, month, CURRENT_YEAR - 1);
  const nextPY = calcPersonalYear(day, month, CURRENT_YEAR + 1);
  const curr   = PY[currPY], past = PY[pastPY], next = PY[nextPY];

  return (
    <div style={{marginBottom:48}}>
      <div style={S.secHead}>Personal Year Cycle — Your Timing Right Now</div>
      <p style={S.secDesc}>
        Your Personal Year number changes every January, creating a precise 9-year rhythm of action, rest, growth, and harvest.
        It is calculated from your birth day and month against the current calendar year —
        making it the most time-sensitive and verifiable tool in numerology.
      </p>

      {/* Past year */}
      <div style={{...S.pyCard, borderColor:`${PY[pastPY].color}55`, opacity:0.8}}>
        <div style={{...S.pyHeader, flexWrap:"wrap"}}>
          <div style={{...S.pyNum, color:PY[pastPY].color, fontSize: isMobile ? 36 : 52}}>{pastPY}</div>
          <div style={{flex:1,minWidth:160}}>
            <div style={{color:PY[pastPY].color,fontSize:13,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Personal Year {CURRENT_YEAR-1} — Completed</div>
            <div style={{color:TXT,fontSize:18,fontFamily:"Georgia,serif"}}>{past.theme}</div>
          </div>
          <div style={{...S.pyTag, background:`${PY[pastPY].color}22`, color:PY[pastPY].color}}>Verify this against your {CURRENT_YEAR-1}</div>
        </div>
        <div style={{color:MUTED,fontSize:14,lineHeight:1.8}}>{past.past}</div>
      </div>

      {/* Current year */}
      <div style={{...S.pyCard, borderColor:curr.color, background:"#2a110022"}}>
        <div style={{...S.pyHeader, flexWrap:"wrap"}}>
          <div style={{...S.pyNum, color:curr.color, fontSize: isMobile ? 44 : 64}}>{currPY}</div>
          <div style={{flex:1,minWidth:160}}>
            <div style={{color:curr.color,fontSize:13,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Personal Year {CURRENT_YEAR} — Now</div>
            <div style={{color:TXT,fontSize: isMobile ? 18 : 22,fontFamily:"Georgia,serif"}}>{curr.theme}</div>
            <div style={{color:curr.color,fontSize:13,marginTop:4}}>Your keyword this year: {curr.action}</div>
          </div>
        </div>
        <div style={{color:TXT,fontSize:15,lineHeight:1.8}}>{curr.curr}</div>
      </div>

      {/* Next year */}
      <div style={{...S.pyCard, borderColor:`${PY[nextPY].color}55`}}>
        <div style={{...S.pyHeader, flexWrap:"wrap"}}>
          <div style={{...S.pyNum, color:PY[nextPY].color, fontSize: isMobile ? 36 : 52}}>{nextPY}</div>
          <div style={{flex:1,minWidth:160}}>
            <div style={{color:PY[nextPY].color,fontSize:13,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Personal Year {CURRENT_YEAR+1} — Approaching</div>
            <div style={{color:TXT,fontSize:18,fontFamily:"Georgia,serif"}}>{next.theme}</div>
          </div>
          <div style={{...S.pyTag, background:`${PY[nextPY].color}22`, color:PY[nextPY].color}}>Prepare now</div>
        </div>
        <div style={{color:MUTED,fontSize:14,lineHeight:1.8}}>{next.next}</div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function Numerology() {
  const [form, setForm]       = useState({name:"",day:"",month:"",year:""});
  const [result, setResult]   = useState(null);
  const [reading, setReading] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [formError, setFormError] = useState("");

  function set(k,v) { setForm(f=>({...f,[k]:v})); setFormError(""); }

  function calculate() {
    try {
      const day   = parseInt(form.day);
      const month = parseInt(form.month);
      const year  = parseInt(form.year);
      if (isNaN(day)   || day   < 1 || day   > 31) { setFormError("Please enter a valid day (1–31)."); return; }
      if (isNaN(month) || month < 1 || month > 12) { setFormError("Please enter a valid month (1–12)."); return; }
      if (isNaN(year)  || year  < 1900 || year > 2099) { setFormError("Please enter a valid year (1900–2099)."); return; }
      setFormError("");
      const moolank  = calcMoolank(day);
      const bhagyank = calcBhagyank(day, month, year);
      const namank   = form.name.trim() ? calcNamank(form.name.trim()) : null;
      const currPY   = calcPersonalYear(day, month, CURRENT_YEAR);
      setResult({ moolank, bhagyank, namank, currPY, day, month, year, name: form.name.trim() });
      setReading("");
    } catch(e) {
      setFormError("Something went wrong. Please check your inputs and try again.");
    }
  }

  async function getReading() {
    if(!result) return;
    setAiLoading(true); setReading("");
    try {
      const res = await fetch(`${API}/numerology-interpret`,{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(result),
      });
      const reader=res.body.getReader(), decoder=new TextDecoder();
      let done=false;
      while(!done){ const {value,done:d}=await reader.read(); done=d; if(value) setReading(r=>r+decoder.decode(value)); }
    } catch(e) { setReading("⚠ Unable to reach the reading service. Please try again."); }
    setAiLoading(false);
  }

  return (
    <div style={S.page}>
      <div style={S.hero}>
        <div style={S.heroSym}>अंक</div>
        <h1 style={S.heroTitle}>Vedic Numerology</h1>
        <p style={S.heroSub}>Moolank · Bhagyank · Namank — and how they speak to each other</p>
      </div>

      <div style={S.container}>

        {/* Form */}
        <div style={S.card}>
          <div style={{fontSize:18,color:G,fontFamily:"Georgia,serif",marginBottom:20}}>Your Details</div>
          <div style={S.row}>
            <div style={S.fg}>
              <label style={S.lbl}>Full Name <span style={{color:G,fontSize:11}}>(for Namank · Chaldean)</span></label>
              <input style={S.inp} placeholder="Enter your full name" value={form.name} onChange={e=>set("name",e.target.value)} />
            </div>
          </div>
          <div style={S.row}>
            <div style={S.fg}><label style={S.lbl}>Day</label><input style={S.inp} type="number" placeholder="DD" min="1" max="31" value={form.day} onChange={e=>set("day",e.target.value)} /></div>
            <div style={S.fg}><label style={S.lbl}>Month</label><input style={S.inp} type="number" placeholder="MM" min="1" max="12" value={form.month} onChange={e=>set("month",e.target.value)} /></div>
            <div style={S.fg}><label style={S.lbl}>Year</label><input style={S.inp} type="number" placeholder="YYYY" value={form.year} onChange={e=>set("year",e.target.value)} /></div>
          </div>
          <button style={S.btn} onClick={calculate}>✦ Calculate My Numbers</button>
          {formError && <div style={{color:"#ff6655",fontSize:14,marginTop:12}}>{formError}</div>}
        </div>

        {result && !formError && (<>

          {/* Badge row */}
          <div style={S.badgeRow}>
            {[
              {num:result.moolank,  label:"Moolank",  sub:"Birth Number"},
              {num:result.bhagyank, label:"Bhagyank",  sub:"Destiny Number"},
              ...(result.namank?[{num:result.namank, label:"Namank", sub:"Name Number"}]:[]),
              {num:result.currPY,   label:`PY ${CURRENT_YEAR}`, sub:"Personal Year", special:true},
            ].map(({num,label,sub,special})=>(
              <div key={label} style={{...S.badge, borderColor:special?"#ffffff44":PBORD[num], opacity:special?0.9:1}}>
                <div style={{fontSize:44,fontWeight:"bold",color:special?"#aaaaaa":PCOL[num],fontFamily:"Georgia,serif",lineHeight:1}}>{num}</div>
                <div style={{color:TXT,fontWeight:"bold",fontSize:15,marginTop:6}}>{label}</div>
                <div style={{color:MUTED,fontSize:12,marginTop:3}}>{sub}</div>
                {!special && <div style={{color:PBORD[num],fontSize:12,marginTop:5}}>{TITLE[num]}</div>}
                {special  && <div style={{color:"#aaaaaa",fontSize:12,marginTop:5}}>{PY[num]?.theme}</div>}
              </div>
            ))}
          </div>

          {/* Combined Analysis — hero section */}
          <div style={S.secHead}>The Reading — Your Three Numbers Together</div>
          <p style={S.secDesc}>
            Most numerology tools give you a number and a description. That is not a reading — that is a dictionary entry.
            What matters is how your numbers relate to each other, and what the combination reveals that no individual number can.
          </p>
          <CombinedSection
            moolank={result.moolank} bhagyank={result.bhagyank}
            namank={result.namank}   name={result.name}
          />

          {/* Personal Year */}
          <PersonalYearSection day={result.day} month={result.month} />

          {/* Individual deep dives */}
          <div style={S.secHead}>Moolank {result.moolank} — Your Birth Number in Depth</div>
          <p style={S.secDesc}>Who you were at birth. Your instinctive nature, before the world shaped you.</p>
          <NumCard num={result.moolank} label="Moolank" />

          <div style={{...S.secHead, marginTop:48}}>Bhagyank {result.bhagyank} — Your Destiny Number in Depth</div>
          <p style={S.secDesc}>Who you are becoming. The direction your soul chose for this lifetime.</p>
          <NumCard num={result.bhagyank} label="Bhagyank" />

          {result.namank && (<>
            <div style={{...S.secHead, marginTop:48}}>Namank {result.namank} — Your Name Number in Depth</div>
            <p style={S.secDesc}>The energy your name "{result.name}" vibrates at. How the world perceives and responds to you.</p>
            <NumCard num={result.namank} label="Namank" />
          </>)}

          {/* AI Reading */}
          <div style={{...S.card, marginTop:48, borderColor:`${G}44`}}>
            <div style={{fontSize:20,color:G,fontFamily:"Georgia,serif",marginBottom:8}}>✦ Complete Numerological Reading</div>
            <div style={{color:MUTED,fontSize:14,marginBottom:20}}>
              A synthesized reading of all your numbers — past years verified, present year decoded, next cycle mapped, full remedies for both ruling planets.
            </div>
            {!reading && (
              <button style={S.aiBtn} onClick={getReading} disabled={aiLoading}>
                {aiLoading ? "Generating…" : "✦ Generate Complete Reading"}
              </button>
            )}
            {aiLoading && !reading && <div style={{color:MUTED,fontStyle:"italic",marginTop:16}}>Consulting the numbers…</div>}
            {reading && <div style={S.aiText} dangerouslySetInnerHTML={{__html:formatMd(reading)}} />}
          </div>

        </>)}
      </div>
    </div>
  );
}

const S = {
  page:       {minHeight:"100vh",background:BG,color:TXT,fontFamily:"system-ui,sans-serif"},
  hero:       {textAlign:"center",padding:"60px 20px 40px",background:"linear-gradient(180deg,#1a0800 0%,#0f0400 100%)"},
  heroSym:    {fontSize:60,color:G,fontFamily:"Georgia,serif",marginBottom:8},
  heroTitle:  {fontSize:34,fontWeight:"bold",color:TXT,margin:"0 0 12px",fontFamily:"Georgia,serif",letterSpacing:2},
  heroSub:    {color:MUTED,fontSize:15,maxWidth:520,margin:"0 auto"},
  container:  {maxWidth:900,margin:"0 auto",padding:"40px 20px 80px"},
  card:       {background:CARD,border:"1px solid",borderColor:`${G}33`,borderRadius:12,padding:"28px 24px",marginBottom:24},
  row:        {display:"flex",gap:16,marginBottom:18,flexWrap:"wrap"},
  fg:         {display:"flex",flexDirection:"column",flex:1,minWidth:130},
  lbl:        {color:MUTED,fontSize:12,marginBottom:7,textTransform:"uppercase",letterSpacing:1},
  inp:        {background:"#2a1200",border:`1px solid ${G}44`,borderRadius:8,padding:"11px 14px",color:TXT,fontSize:15,outline:"none"},
  btn:        {background:G,color:"#0f0400",border:"none",borderRadius:8,padding:"13px 28px",fontSize:14,fontWeight:"bold",cursor:"pointer",letterSpacing:1,marginTop:4},
  badgeRow:   {display:"flex",gap:16,justifyContent:"center",marginBottom:40,flexWrap:"wrap"},
  badge:      {background:CARD,border:"2px solid",borderRadius:12,padding:"20px 24px",textAlign:"center",minWidth:140,flex:1,maxWidth:200},
  secHead:    {fontSize:22,color:G,fontFamily:"Georgia,serif",margin:"0 0 12px",borderBottom:`1px solid ${G}33`,paddingBottom:12},
  secDesc:    {color:MUTED,fontSize:14,lineHeight:1.8,marginBottom:24},
  numHeader:  {display:"flex",alignItems:"center",gap:20,marginBottom:24,paddingBottom:20,borderBottom:"1px solid #ffffff11"},
  grid3:      {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:4},
  infoBox:    {background:"#2a110022",border:`1px solid ${G}22`,borderRadius:8,padding:"10px 14px"},
  twoCol:     {display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginTop:18},
  sLabel:     {color:G,fontSize:12,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8,fontWeight:"bold"},
  ul:         {margin:0,paddingLeft:18},
  li:         {color:TXT,fontSize:14,lineHeight:2,opacity:0.9},
  pyCard:     {background:CARD,border:"1px solid",borderRadius:10,padding:"20px 22px",marginBottom:16},
  pyHeader:   {display:"flex",alignItems:"flex-start",gap:20,marginBottom:14,flexWrap:"wrap"},
  pyNum:      {fontSize:52,fontWeight:"bold",fontFamily:"Georgia,serif",lineHeight:1,minWidth:60,textAlign:"center"},
  pyTag:      {marginLeft:"auto",padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:"bold",whiteSpace:"nowrap"},
  aiBtn:      {background:"transparent",border:`1px solid ${G}`,color:G,borderRadius:8,padding:"12px 26px",fontSize:14,cursor:"pointer",letterSpacing:1},
  aiText:     {color:TXT,fontSize:15,lineHeight:1.9},
};
