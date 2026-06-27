import { jsPDF } from "jspdf";

// ── Lookup tables (mirrored from Numerology.jsx) ──────────────────────────
const PLANET = {1:"Sun",2:"Moon",3:"Jupiter",4:"Rahu",5:"Mercury",6:"Venus",7:"Ketu",8:"Saturn",9:"Mars"};
const DEITY  = {1:"Lord Surya",2:"Lord Chandra / Parvati",3:"Lord Vishnu / Brihaspati",4:"Goddess Durga",5:"Lord Ganesha",6:"Goddess Lakshmi",7:"Lord Shiva",8:"Lord Shani / Shiva",9:"Lord Hanuman"};
const COLOR  = {1:"Gold, Orange",2:"White, Silver",3:"Yellow, Turmeric",4:"Electric Blue, Grey",5:"Green, Turquoise",6:"White, Pink",7:"Violet, Maroon",8:"Black, Dark Blue",9:"Red, Crimson"};
const GEM    = {1:"Ruby (Manik)",2:"Pearl (Moti)",3:"Yellow Sapphire (Pukhraj)",4:"Hessonite (Gomed)",5:"Emerald (Panna)",6:"Diamond / White Sapphire",7:"Cat's Eye (Lahsuniya)",8:"Blue Sapphire (Neelam)",9:"Red Coral (Moonga)"};
const DAY    = {1:"Sunday",2:"Monday",3:"Thursday",4:"Saturday",5:"Wednesday",6:"Friday",7:"Sunday",8:"Saturday",9:"Tuesday"};
const MANTRA = {1:"Om Suryaya Namaha (108×)",2:"Om Chandraya Namaha (108×)",3:"Om Gurave Namaha (108×)",4:"Om Rahave Namaha (108×)",5:"Om Budhaya Namaha (108×)",6:"Om Shukraya Namaha (108×)",7:"Om Ketave Namaha (108×)",8:"Om Shanaischaraya Namaha (108×)",9:"Om Hanumate Namaha (108×)"};
const TITLE  = {1:"The Pioneer",2:"The Diplomat",3:"The Creator",4:"The Builder",5:"The Explorer",6:"The Nurturer",7:"The Seeker",8:"The Achiever",9:"The Humanitarian"};

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
  same:   { label:"Mirror Energies",  color:[68,204,170],  note:"Your birth personality and life destiny are ruled by the same planet. Who you instinctively are IS the direction your life wants to move. The challenge is managing the extremes of this energy's shadow side." },
  friend: { label:"Aligned Destiny",  color:[68,204,136],  note:"Your Moolank and Bhagyank rulers are planetary friends. Your natural instincts support your life's direction. The person you are makes progress toward who you are becoming." },
  neutral:{ label:"Conscious Bridge", color:[204,170,68],  note:"Your ruling planets are neutral. Your birth nature and your destiny path run on different tracks. Life asks you to consciously bridge the two, which builds enormous adaptability and range." },
  enemy:  { label:"Sacred Tension",   color:[204,102,68],  note:"Your Moolank and Bhagyank rulers are in opposition. This is not a flaw — it is the source of your greatest depth. The friction between who you are and the path you must walk forces growth that the easier combinations never produce." },
};
const COMBO_NOTE = {
  "1+8":"Sun and Saturn — the father and the judge. Your instinct is toward light, leadership, and assertion; your destiny demands discipline, patience, and karmic reckoning.",
  "8+1":"Saturn and Sun — formed by discipline and limitation, your destiny calls you toward light, leadership, and self-expression you may have been denied early on.",
  "1+6":"Sun and Venus — the will and the heart. You may have to choose, repeatedly, between power and softness — until you learn they are not opposites.",
  "6+1":"Venus and Sun — you lead through love and care. But the Sun's energy in your destiny asks you to claim authority you may have been taught was not yours to hold.",
  "3+9":"Jupiter and Mars — the artist-warrior, the teacher-healer. One of the most spiritually potent combinations.",
  "9+3":"Mars and Jupiter — a warrior born to create. Your life's work is both fierce and beautiful.",
  "2+8":"Moon and Saturn — deep sensitivity with a karmic mission. Together they make the compassionate leader.",
  "8+2":"Saturn and Moon — karmic weight carried with feeling. Your life teaches that real strength includes softness.",
  "7+4":"Ketu and Rahu — ancient wisdom (7/Ketu) while destiny pulls toward material mastery (4/Rahu). You are living the karmic axis in a single lifetime.",
  "4+7":"Rahu and Ketu — materially focused at birth, destined for spiritual depth and withdrawal.",
};

const PY_THEME = {1:"New Beginnings",2:"Patience & Partnership",3:"Expression & Expansion",4:"Hard Work & Foundation",5:"Change & Freedom",6:"Love & Responsibility",7:"Introspection & Study",8:"Power & Harvest",9:"Completion & Release"};
const PY_ACTION = {1:"Plant",2:"Wait",3:"Create",4:"Build",5:"Move",6:"Serve",7:"Reflect",8:"Claim",9:"Let Go"};

const NUM_DATA = {
  1:{ personality:"You feel most alive when you are the one who decides. You have an instinct for what is right that precedes logic, and a need to act on it that precedes comfort. You were not made to wait for permission. When you lead, others feel safer, even if they cannot explain why.",strengths:["Decisive authority others naturally defer to","The courage to start things that haven't been done before","Self-reliance that never becomes neediness","A will that bends under pressure and springs back stronger","Originality — your instincts move in directions no map covers"],challenges:["Stubbornness disguised as conviction","Difficulty acknowledging when you are wrong","Impatience with people who process more slowly","A loneliness that comes from always leading","Workaholism as a substitute for intimacy"],career:"Leadership, entrepreneurship, politics, innovation, military command, executive roles. You suffocate in the middle of hierarchies.",love:"You love fiercely. You need a partner who stands in their own strength without competing with yours. Learn to let someone in.",health:"Sun-ruled: heart, spine, eyes, blood pressure. Watch burnout from over-leading. Morning sun, cardiovascular exercise, and genuine rest are essential." },
  2:{ personality:"You feel things before you understand them. You walk into a room and know who is unhappy, who is pretending, who needs to be heard — before a word is spoken. Your greatest gift is making people feel genuinely heard in a world that is mostly waiting to speak.",strengths:["Emotional intelligence that reads rooms and people precisely","A peacemaking instinct that resolves tension others don't see","Loyalty so deep it becomes its own form of courage","Intuition that rivals any instrument","The capacity to hold space for others' pain without collapsing"],challenges:["Suppressing your own needs so consistently you forget what they are","Taking on others' emotional weather as your own","Avoiding conflict until it becomes crisis","Mood cycles tied to people around you","Co-dependency — love that loses itself in the other"],career:"Counseling, healing, diplomacy, music, nursing, social work, mediation, teaching. You excel wherever human connection is the actual work.",love:"You are the most devoted partner — but devotion without boundaries becomes disappearance. You must learn that love does not require you to become invisible.",health:"Moon-ruled: digestion, chest, hormones. Time near water, moon-awareness practices, and protecting your sleep are essential." },
  3:{ personality:"Your mind never stops making connections. You can take any idea and make it beautiful, and you can make almost anyone feel that their story matters. What others call your charm is actually something deeper: you genuinely find people interesting.",strengths:["The ability to express what others can only feel","Infectious optimism that is contagious in the best way","Intellectual range across fields","A storytelling gift that makes truth feel like magic","Joy — real, renewable, and shared freely"],challenges:["Scattering your gifts across too many directions","Starting brilliantly and finishing inconsistently","Emotional superficiality as self-protection","Spending and indulging in excess when life feels empty","The gap between what you imagine and what you follow through on"],career:"Writing, teaching, performing, law, philosophy, comedy, design, filmmaking, public speaking. Any field where language, ideas, or beauty are the core product.",love:"You fall in love with the idea as much as the person. You need a partner who appreciates your need for creative freedom.",health:"Jupiter-ruled: liver, hips, thighs. Your body responds well to movement and needs it to process the enormous energy you generate." },
  4:{ personality:"You build things. Not just physically — you build systems, routines, and foundations that others stand on without knowing they're there. You are the one still working when everyone else has gone home.",strengths:["A work ethic that outlasts everyone in the room","The ability to turn vision into reality through persistence","Reliability — when you say you will do it, it happens","Long-range thinking that sees decades, not quarters","Trustworthiness that becomes a form of reputation"],challenges:["Resistance to change even when the structure has stopped working","Pessimism that emerges as realism under pressure","Rigidity in methods long after better ones exist","Work as a substitute for emotional presence","Rahu's shadow: obsessive attachment to outcomes"],career:"Engineering, architecture, finance, accountancy, real estate, construction, project management. You build the infrastructure others inhabit.",love:"You love through stability, provision, and constancy. You need a partner who can read love in action, not just in words.",health:"Rahu-ruled: nervous system, skin, respiratory. Prone to anxiety and obsessive thinking. Mental rest is as important as physical rest." },
  5:{ personality:"You collect experiences the way others collect possessions. You are the most mentally agile of all numbers — you can talk to anyone, adapt to anything, and learn any skill with startling speed.",strengths:["Mental agility that adapts faster than circumstances change","Communication that meets people exactly where they are","Adventurousness that turns obstacles into plot twists","The ability to make any room more alive","A curiosity that never exhausts itself"],challenges:["Commitment feels like a closing door, not an opening one","Restlessness that mistakes movement for progress","Inconsistency that reads as unreliability","Sensation-seeking that tips into excess","Finishing nothing, because starting feels like the real thing"],career:"Sales, media, journalism, travel, trading, consulting, entrepreneurship, technology, diplomacy. Any work that changes daily and rewards adaptability.",love:"You are thrilling to be with. The partner who gives you freedom without insecurity is rare and irreplaceable when found.",health:"Mercury-ruled: nervous system, lungs, hands. Pranayama, grounding practices, and consistent sleep are exactly what your system needs." },
  6:{ personality:"You cannot watch someone suffer and do nothing. This is your greatest virtue and the quality most frequently exploited. You carry responsibility the way others carry keys — automatically, without thinking about the weight.",strengths:["A capacity for love that goes deeper than most people know love can go","The ability to create harmony in environments that felt irreconcilable","Natural healing presence","Aesthetic sensitivity that finds beauty in unexpected places","Devotion that does not waver when things get difficult"],challenges:["Carrying burdens that are not yours to carry","Perfectionism that turns inward as self-criticism","Difficulty saying no to people you love even when you should","Martyrdom — giving until empty","Possessiveness or jealousy when love given is not received equally"],career:"Medicine, healing arts, teaching, design, social work, hospitality, childcare, counseling, fashion.",love:"You love with everything. Choose someone who does not need fixing. Choose someone who brings as much as they take.",health:"Venus-ruled: kidneys, reproductive system, throat, skin. Self-care is not indulgence — it is maintenance." },
  7:{ personality:"You think in questions, not answers. The mystery interests you more than the solution. Being alone is not loneliness for you — it is where you become yourself. The world mistakes your depth for distance.",strengths:["An analytical depth that others rarely reach","Intuition that borders on perception of what is not yet visible","The capacity to sit with uncertainty until truth reveals itself","A spiritual awareness that arrived before any formal practice","Ability to see through performance to what is real"],challenges:["Withdrawal that becomes isolation before you notice","Difficulty expressing feelings in language others can receive","Skepticism that can curdle into cynicism","Keeping people at the distance where they cannot fully know you","Ketu's shadow: detachment that reads as coldness"],career:"Research, philosophy, psychology, astrology, writing, science, medicine, spiritual teaching, investigation.",love:"You love selectively and permanently. You need a partner who can interpret your silences correctly — not as absence, but as fullness.",health:"Ketu-ruled: nervous system, skin, digestion. Meditation, mantra, and time in nature are primary medicine." },
  8:{ personality:"Life has given you heavier weights than most — not as punishment, but as tuition. Everything you have earned the hard way has given you real authority. Not the authority of a title, but of someone who has faced the thing and survived it.",strengths:["Resilience that recovers from losses that would stop others","Strategic intelligence that sees the long game","Executive presence that inspires confidence","The ability to build wealth through disciplined effort","Wisdom born from experience, not theory"],challenges:["Saturn's testing: more obstacles and delays than average as karmic curriculum","Control that becomes rigidity when you feel unsafe","Work that crowds out everything soft","A ruthlessness that appears when the goal matters more than people","Difficulty receiving help or softness, even when genuine"],career:"Business, law, politics, finance, banking, surgery, engineering, administration. You are built for power, earned through integrity.",love:"Your version of love looks like showing up, not saying the right words. Guard against letting career crowd out intimacy.",health:"Saturn-ruled: bones, teeth, joints, knees. Discipline in rest is as important as discipline in work — and far harder for you." },
  9:{ personality:"You feel other people's pain as your own — sometimes before they feel it themselves. Your instinct is always toward the one who is struggling, the cause that has been abandoned, the story that has not been told.",strengths:["Compassion that moves from feeling into action","A wisdom that arrived before it was earned","The courage to fight for what is right when everyone else has moved on","The ability to complete things — cycles, projects, relationships — with grace","A magnetism that draws people who need exactly what you carry"],challenges:["Absorbing others' pain until your own needs disappear","Anger that erupts when you see injustice, sometimes without warning","Holding on too long — to people, places, phases of life","Impulsiveness in moments of passion you later need to repair","Giving so much to the world that the people closest get what remains"],career:"Medicine, law, social activism, teaching, healing, military, spiritual leadership, writing, philosophy.",love:"You need someone who can receive great love without feeling consumed by it. Do not settle for less.",health:"Mars-ruled: blood, head, inflammation, fever, accidents. Rest, solitude, and practices that empty the vessel are not optional." },
};

// ── Palette ───────────────────────────────────────────────────────────────
const GOLD  = [201, 151, 58];
const SOFT  = [240, 208, 128];
const WHITE = [253, 240, 213];
const MUTED = [184, 144, 96];
const DARK  = [10, 4, 0];
const SURF  = [26, 9, 0];
const SURF2 = [42, 18, 0];

const NUM_COLORS = {1:[255,140,0],2:[136,136,238],3:[221,170,0],4:[119,119,187],5:[0,170,85],6:[238,85,170],7:[153,102,51],8:[85,119,170],9:[204,51,0]};

const PAGE_W = 210, PAGE_H = 297, ML = 14, MR = 14;
const CW = PAGE_W - ML - MR;

const CURRENT_YEAR = 2026;

function calcPersonalYear(day, month, yr) {
  let sum = `${day}${month}${yr}`.split("").reduce((a, d) => a + Number(d), 0);
  while (sum > 9) sum = String(sum).split("").reduce((a, d) => a + Number(d), 0);
  return sum;
}

function rgb(doc, arr) { doc.setTextColor(...arr); }
function fill(doc, arr) { doc.setFillColor(...arr); }
function splitLines(doc, text, maxWidth) { return doc.splitTextToSize(String(text || ""), maxWidth); }

export function generateNumerologyPDF({ result, reading }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 0;

  function pageHeader() {
    fill(doc, DARK);
    doc.rect(0, 0, PAGE_W, 10, "F");
    doc.setFontSize(7);
    rgb(doc, MUTED);
    doc.text("Pavitra Jyotish — Ank Jyotish Report", ML, 7);
    doc.text("pavitra-jyotish.netlify.app", PAGE_W - MR, 7, { align: "right" });
  }

  function newPage() {
    doc.addPage();
    y = 14;
    pageHeader();
    y = 28;
  }

  function checkY(needed = 10) {
    if (y + needed > PAGE_H - 12) newPage();
  }

  function section(title) {
    checkY(14);
    fill(doc, SURF2);
    doc.rect(ML, y - 5, CW, 9, "F");
    rgb(doc, GOLD);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(title, ML + 3, y + 1);
    y += 10;
  }

  function bodyText(text, indent = 0, color = WHITE) {
    const lines = splitLines(doc, text, CW - 6 - indent);
    checkY(lines.length * 4.5 + 3);
    rgb(doc, color);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text(lines, ML + indent, y);
    y += lines.length * 4.5 + 3;
  }

  function subLabel(text, color = GOLD) {
    checkY(7);
    rgb(doc, color);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(text.toUpperCase(), ML + 2, y);
    y += 5;
  }

  // ── COVER ────────────────────────────────────────────────────────────────
  fill(doc, DARK);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
  fill(doc, SURF2);
  doc.rect(0, 0, PAGE_W, 58, "F");

  doc.setFontSize(28);
  rgb(doc, GOLD);
  doc.text("अंक", PAGE_W / 2, 22, { align: "center" });

  doc.setFontSize(20);
  rgb(doc, SOFT);
  doc.setFont("helvetica", "bold");
  doc.text("Ank Jyotish", PAGE_W / 2, 34, { align: "center" });

  doc.setFontSize(10);
  rgb(doc, MUTED);
  doc.setFont("helvetica", "normal");
  doc.text("Vedic Numerology — Moolank · Bhagyank · Namank", PAGE_W / 2, 43, { align: "center" });

  // birth info box
  fill(doc, SURF);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.rect(ML, 68, CW, 36, "FD");
  rgb(doc, GOLD);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("YOUR DETAILS", ML + 5, 76);
  rgb(doc, WHITE);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const dob = `${result.day}/${result.month}/${result.year}`;
  doc.text(`Date of Birth: ${dob}`, ML + 5, 84);
  if (result.name) doc.text(`Name: ${result.name}`, ML + 5, 91);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })}`,
    ML + 5, result.name ? 98 : 91
  );

  // Three number display
  const nums = [
    { num: result.moolank,  label: "Moolank",  sub: "Birth Number" },
    { num: result.bhagyank, label: "Bhagyank", sub: "Destiny Number" },
    ...(result.namank ? [{ num: result.namank, label: "Namank", sub: "Name Number" }] : []),
  ];
  const boxW = result.namank ? CW / 3 - 3 : CW / 2 - 4;
  nums.forEach((item, i) => {
    const bx = ML + i * (boxW + 4);
    const col = NUM_COLORS[item.num] || GOLD;
    fill(doc, [col[0] * 0.15, col[1] * 0.15, col[2] * 0.15]);
    doc.rect(bx, 114, boxW, 44, "F");
    doc.setDrawColor(...col);
    doc.setLineWidth(0.3);
    doc.rect(bx, 114, boxW, 44, "D");

    rgb(doc, col);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text(String(item.num), bx + boxW / 2, 132, { align: "center" });

    rgb(doc, WHITE);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(item.label, bx + boxW / 2, 141, { align: "center" });

    rgb(doc, col);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(TITLE[item.num] || "", bx + boxW / 2, 148, { align: "center" });

    rgb(doc, MUTED);
    doc.setFontSize(7);
    doc.text(PLANET[item.num] || "", bx + boxW / 2, 154, { align: "center" });
  });

  // Personal year strip
  const currPY = calcPersonalYear(result.day, result.month, CURRENT_YEAR);
  fill(doc, SURF);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.2);
  doc.rect(ML, 167, CW, 20, "FD");
  rgb(doc, MUTED);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text(`PERSONAL YEAR ${CURRENT_YEAR}`, ML + 5, 174);
  rgb(doc, SOFT);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(String(currPY), ML + 5, 183);
  rgb(doc, WHITE);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(PY_THEME[currPY] || "", ML + 18, 183);
  rgb(doc, MUTED);
  doc.setFontSize(8);
  doc.text(`Keyword: ${PY_ACTION[currPY] || ""}`, ML + 18, 188);

  // footer note
  rgb(doc, MUTED);
  doc.setFontSize(7.5);
  doc.text("Chaldean Numerology System · Classical Vedic Tradition", PAGE_W / 2, 220, { align: "center" });

  // ── PAGE 2: COMBINED ANALYSIS ─────────────────────────────────────────
  newPage();

  // Combined analysis
  section("Combined Analysis — Your Numbers Together");

  const rel = getPlanetRel(result.moolank, result.bhagyank);
  const rd  = REL_DATA[rel];
  const mp  = PLANET[result.moolank], bp = PLANET[result.bhagyank];
  const comboKey  = `${result.moolank}+${result.bhagyank}`;
  const comboNote = COMBO_NOTE[comboKey];

  checkY(16);
  fill(doc, [rd.color[0] * 0.12, rd.color[1] * 0.12, rd.color[2] * 0.12]);
  doc.rect(ML, y - 4, CW, 10, "F");
  doc.setDrawColor(...rd.color);
  doc.setLineWidth(0.2);
  doc.rect(ML, y - 4, CW, 10, "D");
  rgb(doc, rd.color);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`${rd.label}  —  Moolank ${result.moolank} (${mp}) · Bhagyank ${result.bhagyank} (${bp})${result.namank ? ` · Namank ${result.namank} (${PLANET[result.namank]})` : ""}`, ML + 4, y + 3);
  y += 14;

  bodyText(rd.note);
  y += 3;

  if (comboNote) {
    checkY(14);
    subLabel(`Specific to ${result.moolank}+${result.bhagyank}`);
    bodyText(comboNote, 2, [253, 240, 213]);
    y += 4;
  }

  subLabel("Birth Nature vs. Destiny Path");
  const relNote = rel === "same"
    ? `Both governed by ${mp} — you were born already aligned. The work is not to find the path but to master this energy's depth without falling into its shadow.`
    : rel === "friend"
    ? `${mp} and ${bp} are planetary friends. Your natural instincts tend to propel you toward your life's purpose. The ease can make the deeper work feel optional — do not let it.`
    : rel === "neutral"
    ? `${mp} and ${bp} are in neutral relationship. Your birth nature and life's direction run on parallel tracks that do not automatically merge. Consciously bridge them — this translation work is the real curriculum of your life.`
    : `${mp} and ${bp} are in planetary opposition. The friction between your Moolank ${result.moolank}-energy and Bhagyank ${result.bhagyank}-path is the engine that drives your deepest growth. Every transformation will emerge from this tension.`;
  bodyText(relNote, 2);
  y += 6;

  // Personal Year Timeline
  section(`Personal Year Cycle — ${CURRENT_YEAR - 1} · ${CURRENT_YEAR} · ${CURRENT_YEAR + 1}`);

  const pastPY = calcPersonalYear(result.day, result.month, CURRENT_YEAR - 1);
  const nextPY = calcPersonalYear(result.day, result.month, CURRENT_YEAR + 1);

  const pyYears = [
    { yr: CURRENT_YEAR - 1, n: pastPY, tag: "Completed — verify this against your year", opacity: 0.7 },
    { yr: CURRENT_YEAR,     n: currPY, tag: "NOW — your current cycle",                   opacity: 1   },
    { yr: CURRENT_YEAR + 1, n: nextPY, tag: "Approaching — prepare now",                  opacity: 0.85 },
  ];

  const pyDesc = {
    1:{ past:"A Year 1 was a year of bold new starts — decisions made, seeds planted, a sense of starting fresh.", curr:"The old cycle has ended. Make the move you have been postponing. Start the thing. Claim the new direction.", next:"A new 9-year cycle begins. What you begin now has the energy to grow for the next nine years." },
    2:{ past:"A Year 2 asked you to slow down, cooperate, and wait. It rewarded collaboration over independent action.", curr:"A year of gestation, not action. Tend, do not push. Relationships and quiet inner work are the real work.", next:"A year to cultivate — relationships, ideas, partnerships. Prepare to receive rather than force." },
    3:{ past:"A Year 3 was socially rich — new connections, creative projects, expression and expansion.", curr:"Express, create, connect, and expand. Put yourself out there. The world is ready to receive you.", next:"Creative expansion and social opportunity. Prepare projects now so they are ready to launch." },
    4:{ past:"A Year 4 demanded effort, discipline, and often felt restrictive or slow. Foundations required attention.", curr:"Build, organize, strengthen foundations. The structure you create this year holds everything for five years ahead.", next:"Requires discipline and patience. Clear clutter — physical, mental, relational — to prepare." },
    5:{ past:"A Year 5 was unpredictable — change arrived whether invited or not.", curr:"The year of change, freedom, and unexpected turns. Do not resist. Opportunities come through movement.", next:"Brings disruption and liberation. Leave room in your plans for the unexpected." },
    6:{ past:"A Year 6 centered on home, family, love, and obligation.", curr:"Love and responsibility. Your home and relationships need attention. Heal, give, commit.", next:"Will ask more from you relationally. Strengthen key relationships now." },
    7:{ past:"A Year 7 was introspective. Deep study, spiritual inquiry, significant inner shifts.", curr:"Withdrawal, deep study, inner reckoning. The most spiritual year. Do not measure by external achievements.", next:"A year for inner work. Create space for stillness, learning, and spiritual practice." },
    8:{ past:"A Year 8 was significant achievement, financial movement, and karmic accounting.", curr:"The harvest year. Everything worked for is ready to be claimed. Bold financial moves, claiming authority.", next:"Your harvest window. Ensure foundations are strong — what you claim must be built on real work." },
    9:{ past:"A Year 9 was endings, completions, and release. What fell away made room for what is coming.", curr:"Completion and release. Let go of what no longer belongs. Forgive. Give generously.", next:"Requires courage to release. Identify what has run its course. The cleaner your release, the more powerful the Year 1 that follows." },
  };

  for (const { yr, n, tag } of pyYears) {
    const isNow = yr === CURRENT_YEAR;
    const col = NUM_COLORS[n] || GOLD;
    const desc = pyDesc[n];
    const text = isNow ? desc?.curr : yr < CURRENT_YEAR ? desc?.past : desc?.next;
    const lines = splitLines(doc, text || "", CW - 30);
    const rowH = Math.max(22, lines.length * 4.5 + 14);
    checkY(rowH);

    fill(doc, isNow ? [42, 18, 0] : [21, 9, 0]);
    doc.rect(ML, y - 4, CW, rowH, "F");
    if (isNow) {
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.4);
      doc.rect(ML, y - 4, CW, rowH, "D");
    }

    rgb(doc, col);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(String(n), ML + 7, y + 9);

    rgb(doc, col);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(`Personal Year ${yr}${isNow ? " — NOW" : ""}`, ML + 22, y + 2);
    rgb(doc, WHITE);
    doc.setFontSize(9);
    doc.text(PY_THEME[n] || "", ML + 22, y + 7);
    rgb(doc, MUTED);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(tag, ML + 22, y + 12);

    rgb(doc, isNow ? WHITE : MUTED);
    doc.setFontSize(8);
    doc.text(lines, ML + 22, y + 17);

    y += rowH + 4;
  }
  y += 4;

  // ── NUMBER DEEP DIVES ─────────────────────────────────────────────────
  const diveNums = [
    { num: result.moolank,  label: "Moolank",  desc: "Your Birth Number — who you were at birth" },
    { num: result.bhagyank, label: "Bhagyank", desc: "Your Destiny Number — who you are becoming" },
    ...(result.namank ? [{ num: result.namank, label: "Namank", desc: `Your Name Number — how "${result.name}" vibrates` }] : []),
  ];

  for (const { num, label, desc } of diveNums) {
    const d = NUM_DATA[num];
    if (!d) continue;
    const col = NUM_COLORS[num] || GOLD;

    checkY(20);
    section(`${label} ${num} — ${TITLE[num]}`);

    // Info grid
    const infoRows = [
      ["Ruling Planet", PLANET[num]],  ["Deity",          DEITY[num]],
      ["Lucky Colour",  COLOR[num]],   ["Gemstone",       GEM[num]],
      ["Auspicious Day",DAY[num]],     ["Sacred Mantra",  MANTRA[num]],
    ];
    const halfW = CW / 2 - 2;
    let gy = y;
    for (let i = 0; i < infoRows.length; i++) {
      const [k, v] = infoRows[i];
      const gx = i % 2 === 0 ? ML : ML + halfW + 4;
      if (i % 2 === 0 && i > 0) gy += 9;
      checkY(9);
      fill(doc, SURF);
      doc.rect(gx, gy - 4, halfW, 8, "F");
      rgb(doc, MUTED);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text(k.toUpperCase(), gx + 2, gy);
      rgb(doc, WHITE);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(String(v || ""), gx + 2, gy + 4.5);
    }
    y = gy + 13;

    // Core personality
    subLabel("Core Personality", col);
    bodyText(d.personality, 2);
    y += 2;

    // Strengths & Challenges side by side
    const strLines = d.strengths.map(s => `• ${s}`);
    const chalLines = d.challenges.map(c => `• ${c}`);
    const maxLines = Math.max(strLines.length, chalLines.length);
    const colH = maxLines * 5 + 10;
    checkY(colH);

    fill(doc, SURF);
    doc.rect(ML, y - 4, CW / 2 - 2, colH, "F");
    fill(doc, SURF);
    doc.rect(ML + CW / 2 + 2, y - 4, CW / 2 - 2, colH, "F");

    rgb(doc, [68, 204, 136]);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text("STRENGTHS", ML + 2, y);
    rgb(doc, [204, 68, 68]);
    doc.text("CHALLENGES", ML + CW / 2 + 4, y);
    y += 5;

    rgb(doc, WHITE);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    strLines.forEach(line => {
      const ls = splitLines(doc, line, CW / 2 - 6);
      doc.text(ls, ML + 2, y);
      y += ls.length * 4.5;
    });
    const strEndY = y;
    y -= strLines.reduce((acc, line) => acc + splitLines(doc, line, CW / 2 - 6).length * 4.5, 0);

    chalLines.forEach(line => {
      const ls = splitLines(doc, line, CW / 2 - 6);
      doc.text(ls, ML + CW / 2 + 4, y);
      y += ls.length * 4.5;
    });
    y = Math.max(strEndY, y) + 6;

    for (const [title, text] of [["Career & Purpose", d.career], ["Love & Relationships", d.love], ["Health & Body", d.health]]) {
      checkY(14);
      subLabel(title, col);
      bodyText(text, 2);
      y += 2;
    }
    y += 6;
  }

  // ── AI READING ────────────────────────────────────────────────────────
  if (reading && reading.trim()) {
    section("Complete Numerological Reading — Pandit's Analysis");
    const clean = reading.replace(/\*\*(.+?)\*\*/g, "$1").replace(/#{1,3} (.+)/g, "$1").replace(/\*/g, "");
    const lines = splitLines(doc, clean, CW - 4);
    const CHUNK = 40;
    for (let i = 0; i < lines.length; i += CHUNK) {
      const chunk = lines.slice(i, i + CHUNK);
      checkY(chunk.length * 5);
      rgb(doc, WHITE);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(chunk, ML, y);
      y += chunk.length * 5 + 2;
    }
    y += 4;
  }

  // Footer
  checkY(22);
  fill(doc, SURF2);
  doc.rect(ML, y, CW, 18, "F");
  rgb(doc, GOLD);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("ॐ  Pavitra Jyotish — Ank Jyotish", PAGE_W / 2, y + 7, { align: "center" });
  rgb(doc, MUTED);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text("For spiritual guidance only. Chaldean System. pavitra-jyotish.netlify.app", PAGE_W / 2, y + 13, { align: "center" });

  // Page numbers
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    rgb(doc, MUTED);
    doc.setFontSize(7);
    doc.text(`Page ${i} of ${total}`, PAGE_W - MR, PAGE_H - 5, { align: "right" });
  }

  const fname = `numerology_${result.day}${result.month}${result.year}${result.name ? "_" + result.name.replace(/\s+/g, "-") : ""}.pdf`;
  doc.save(fname);
}
