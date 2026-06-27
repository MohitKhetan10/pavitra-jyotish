import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "/api";

const G = "#c9973a", BG = "#0f0400", TXT = "#fdf0d5", MUTED = "#b89060", CARD = "#1a0900";

// Chaldean name chart
const CHALDEAN = {
  A:1,I:1,J:1,Q:1,Y:1,
  B:2,K:2,R:2,
  C:3,G:3,L:3,S:3,
  D:4,M:4,T:4,
  E:5,H:5,N:5,X:5,
  U:6,V:6,W:6,
  O:7,Z:7,
  F:8,P:8,
};

const PLANETS = {
  1:"Sun (Surya)",2:"Moon (Chandra)",3:"Jupiter (Guru)",
  4:"Rahu",5:"Mercury (Budh)",6:"Venus (Shukra)",
  7:"Ketu",8:"Saturn (Shani)",9:"Mars (Mangal)",
};

const DEITIES = {
  1:"Lord Surya",2:"Lord Chandra / Goddess Parvati",3:"Lord Vishnu / Brihaspati",
  4:"Goddess Durga / Rahu Dev",5:"Lord Ganesha",6:"Goddess Lakshmi",
  7:"Lord Shiva / Ketu Dev",8:"Lord Shani / Lord Shiva",9:"Lord Hanuman / Kartikeya",
};

const COLORS = {
  1:"Gold, Orange, Copper",2:"White, Silver, Cream",3:"Yellow, Golden, Turmeric",
  4:"Electric Blue, Grey, Earthy Brown",5:"Green, Turquoise",6:"White, Pink, Light Blue",
  7:"Violet, Purple, Maroon",8:"Black, Dark Blue, Dark Brown",9:"Red, Crimson, Scarlet",
};

const GEMS = {
  1:"Ruby (Manik)",2:"Pearl (Moti)",3:"Yellow Sapphire (Pukhraj)",
  4:"Hessonite Garnet (Gomed)",5:"Emerald (Panna)",6:"Diamond / White Sapphire",
  7:"Cat's Eye (Lahsuniya)",8:"Blue Sapphire (Neelam)",9:"Red Coral (Moonga)",
};

const DAYS = {
  1:"Sunday",2:"Monday",3:"Thursday",4:"Saturday & Sunday",
  5:"Wednesday",6:"Friday",7:"Sunday & Monday",8:"Saturday",9:"Tuesday",
};

const MANTRAS = {
  1:"Om Suryaya Namaha (108×)",
  2:"Om Chandraya Namaha (108×)",
  3:"Om Gurave Namaha / Om Brihaspataye Namaha (108×)",
  4:"Om Rahave Namaha (108×)",
  5:"Om Budhaya Namaha (108×)",
  6:"Om Shukraya Namaha (108×)",
  7:"Om Ketave Namaha (108×)",
  8:"Om Shanaischaraya Namaha / Om Namah Shivaya (108×)",
  9:"Om Mangalaya Namaha / Om Hanumate Namaha (108×)",
};

const NUM_DATA = {
  1: {
    title: "The Pioneer",
    symbol: "☀",
    color: "#ff8c00",
    border: "#ffcc00",
    personality: "You are a natural-born leader with an independent spirit and unshakeable willpower. The number 1 is the primal force — the seed from which all other numbers grow. You initiate, you originate, you lead. You rarely follow — and when you do, it is only because you are studying the path before taking charge.",
    strengths: ["Natural leadership and authority","Fierce independence and originality","Courage to walk alone when necessary","Strong willpower and determination","Pioneering vision and ambition"],
    challenges: ["Tendency toward egotism and stubbornness","Difficulty asking for or accepting help","Impatience with slower minds","Can become domineering in relationships","Workaholism at the expense of emotional life"],
    career: "Politics, government administration, entrepreneurship, military leadership, executive positions, innovation, invention, athletics. You are meant to be at the top — not in the middle.",
    love: "In relationships you seek a partner who matches your strength without competing with it. You need respect above all. You can be romantic but seldom show vulnerability. Best matched with 3, 5, and 9. Can clash with 4 and 8 who match your stubbornness.",
    health: "Sun-ruled — watch the heart, eyes, spine, and vitality. Prone to headaches, blood pressure issues, and burnout from overexertion. Regular exposure to early morning sunlight is deeply healing for you.",
    life_path: "Your life purpose is to forge new paths. You are here to build something that did not exist before. The first half of life may feel like a struggle for recognition — but persistence is your superpower. By midlife, you often reach positions of genuine authority and influence.",
  },
  2: {
    title: "The Diplomat",
    symbol: "☽",
    color: "#8888ee",
    border: "#bbbbff",
    personality: "Ruled by the Moon, you are the most sensitive and empathic of all numbers. You feel everything — the moods of a room, the unspoken pain in a friend's voice, the subtle shifts in energy around you. This is your gift and your burden. You are the glue in every group — the one who listens, mediates, and holds space.",
    strengths: ["Deep empathy and emotional intelligence","Natural peacemaker and mediator","Incredible intuition and psychic sensitivity","Loyalty and devotion in relationships","Artistic and musical ability"],
    challenges: ["Tendency to suppress own needs for others","Excessive sensitivity to criticism","Indecisiveness and fear of conflict","Mood swings tied to the lunar cycle","Co-dependency patterns in love"],
    career: "Counseling, psychology, nursing, social work, music, poetry, diplomacy, hospitality, teaching, healing arts. You excel wherever human connection is the core of the work.",
    love: "You are a devoted, nurturing partner who loves deeply. You need emotional security and consistency. You thrive with partners who are stable and protective (1, 6, 9). You must learn not to lose yourself in love — your tendency to over-give can lead to resentment.",
    health: "Moon-ruled — watch digestion, the chest, fluids, and hormones. Prone to anxiety, emotional eating, and sleep disturbances during full/new moon phases. Regular meditation and time near water is profoundly restorative.",
    life_path: "You are here to learn the art of balance — giving and receiving in equal measure. Your path is one of quiet influence rather than loud authority. You change lives through gentle, persistent presence. Many great healers and spiritual teachers carry the number 2.",
  },
  3: {
    title: "The Creator",
    symbol: "♃",
    color: "#ddaa00",
    border: "#ffdd66",
    personality: "Blessed by Jupiter, you are overflowing with creative energy, optimism, and the gift of expression. Life is vibrant through your eyes — you see beauty, possibility, and humor where others see nothing. You are the storyteller, the performer, the teacher who lights up a room.",
    strengths: ["Exceptional creativity and artistic talent","Natural gift for communication and storytelling","Infectious optimism and joy","Ability to inspire and uplift others","Intellectual curiosity and versatility"],
    challenges: ["Scattered energy — too many interests","Tendency toward self-indulgence","Difficulty with discipline and follow-through","Emotional superficiality as self-protection","Financial carelessness"],
    career: "Writing, acting, teaching, law, comedy, music, design, philosophy, publishing, public speaking, filmmaking. Wherever words, ideas, or beauty are currency — you thrive.",
    love: "You are warm, romantic, and endlessly charming. You fall in love easily and express it beautifully. But you need a partner who appreciates your need for creative freedom and doesn't try to cage your spirit. Best with 1, 5, and 9.",
    health: "Jupiter-ruled — watch the liver, hips, thighs, and tendency toward overindulgence. You can overeat, over-drink, or overcommit. Your greatest health threat is excess — of everything you love.",
    life_path: "Your purpose is to create and inspire. You are here to add beauty, wisdom, and laughter to the world. The challenge is channeling your enormous gifts into a focused direction rather than spreading them thin. When you commit, you are unstoppable.",
  },
  4: {
    title: "The Builder",
    symbol: "☊",
    color: "#7777bb",
    border: "#aaaadd",
    personality: "Governed by Rahu, the number 4 is the architect of the material world. You build things that last — systems, structures, institutions, legacies. You are methodical, reliable, and grounded in a way that others depend on completely. Beneath your practical exterior is a deeply unconventional mind.",
    strengths: ["Exceptional discipline and work ethic","Reliability and trustworthiness","Systematic and organized approach","Long-term thinking and patience","Ability to manifest vision into reality"],
    challenges: ["Rigidity and resistance to change","Tendency toward pessimism under stress","Can become a workaholic and neglect relationships","Stubbornness that borders on obstinacy","Rahu's shadow: restlessness and obsession"],
    career: "Engineering, architecture, finance, accountancy, real estate, urban planning, law enforcement, project management, construction. You build the foundations others stand on.",
    love: "You love deeply but express it through acts of service rather than words. You need a partner who values stability and loyalty over spontaneity. Relationships need time to build with you — but once built, they are unshakeable. Compatible with 1, 2, and 8.",
    health: "Rahu-ruled — prone to unusual or hard-to-diagnose conditions. Watch the nervous system, skin, and respiratory system. Mental health — especially anxiety and obsessive patterns — needs conscious attention.",
    life_path: "You are here to build something enduring — a business, a system, a family legacy, a community institution. Your path involves learning to embrace change within your structured world. Rahu brings sudden disruptions to force evolution — embrace them rather than resist.",
  },
  5: {
    title: "The Explorer",
    symbol: "☿",
    color: "#00aa55",
    border: "#55dd99",
    personality: "Mercury's child — quicksilver, curious, and impossible to pin down. You are freedom itself, constantly in motion, collecting experiences like others collect possessions. You are the most versatile and mentally agile of all numbers — you can talk to anyone, adapt to any situation, and learn any skill with startling speed.",
    strengths: ["Razor-sharp intellect and quick learning","Adaptability and resourcefulness","Magnetic communication skills","Adventurous spirit and love of life","Natural sales ability and persuasion"],
    challenges: ["Difficulty with commitment — to people, places, and ideas","Restlessness and perpetual dissatisfaction","Tendency toward addiction and excess sensation-seeking","Inconsistency and unreliability under pressure","Scattered thinking when not focused"],
    career: "Sales, marketing, media, journalism, travel, trading, consulting, teaching, diplomacy, entrepreneurship, technology, writing. Any career that changes daily suits you perfectly.",
    love: "You need a partner who gives you freedom without insecurity. You are charming and exciting to be with — but fear being trapped. Best with 1, 3, and 7. Must consciously work on staying present in relationships rather than always seeking novelty.",
    health: "Mercury-ruled — watch the nervous system, lungs, hands, and shoulders. Prone to anxiety, scattered energy, and respiratory issues. Regular pranayama and grounding practices are essential.",
    life_path: "You are here to be a bridge — between people, ideas, cultures, and worlds. Your life will be rich with change and variety. The challenge is learning that true freedom is inner, not outer — and that depth comes from staying, not always moving.",
  },
  6: {
    title: "The Nurturer",
    symbol: "♀",
    color: "#ee55aa",
    border: "#ffaadd",
    personality: "Venus blesses you with an innate sense of beauty, harmony, and love. You are the heart of every family and community you touch. You take responsibility seriously — sometimes too seriously. You are most alive when you are caring for others, creating beauty, and fostering peace in your environment.",
    strengths: ["Deep capacity for love and devotion","Natural sense of aesthetics and beauty","Strong sense of responsibility and duty","Healing and nurturing presence","Ability to create harmony in any environment"],
    challenges: ["Taking on others' problems as your own","Perfectionism that breeds self-criticism","Difficulty setting boundaries","Martyrdom patterns — giving until empty","Jealousy or possessiveness in love"],
    career: "Medicine, healing, social work, teaching, design, interior decoration, hospitality, counseling, cooking, fashion, music, childcare. You are the caregiver in every profession you enter.",
    love: "You are the most devoted partner of all numbers. Love is your element — you live and breathe it. You need a partner who appreciates your depth of care and reciprocates it. Watch for over-giving and choosing partners who need saving. Best with 2, 3, and 9.",
    health: "Venus-ruled — watch the reproductive system, kidneys, throat, and skin. Prone to sugar imbalances, hormonal issues, and stress-related conditions from carrying others' burdens. Self-care is not selfish for you — it is survival.",
    life_path: "You are here to love and be loved — and to teach the world what true service looks like. Your path involves balancing your enormous capacity for giving with the wisdom to receive. Your greatest work is done in the lives of people close to you.",
  },
  7: {
    title: "The Seeker",
    symbol: "☋",
    color: "#996633",
    border: "#cc9966",
    personality: "Ruled by Ketu — the moksha karaka, the planet of liberation — you are the mystic, the philosopher, the researcher who is never satisfied with surface answers. You are drawn to the hidden, the sacred, and the unknown. Others may find you aloof, but you are simply living on a different frequency.",
    strengths: ["Profound intelligence and analytical depth","Strong intuition and psychic perception","Love of solitude and self-reflection","Spiritual awareness beyond your years","Ability to see through illusion and deception"],
    challenges: ["Tendency toward isolation and withdrawal","Difficulty with emotional expression","Skepticism that can become cynicism","Secretiveness in relationships","Ketu's shadow: detachment that feels like coldness"],
    career: "Research, philosophy, spirituality, astrology, psychology, writing, science, academia, medicine, investigation, technology. Any field where deep thinking and solitary focus produce results.",
    love: "You are selective, private, and deeply loyal once you trust. You need a partner who respects your need for solitude and doesn't interpret it as rejection. Intellectual and spiritual compatibility matter more to you than passion alone. Best with 2, 5, and 9.",
    health: "Ketu-ruled — prone to mysterious or difficult-to-diagnose conditions. Watch the nervous system, skin, and digestion. Isolation during illness is common for you. Spiritual practice — meditation, yoga, mantra — is your most powerful medicine.",
    life_path: "You are here to find truth — and share it with those ready to hear. Your path is inward before it is outward. Past-life wisdom runs deep in you. The challenge is translating your inner knowing into forms the world can receive. You are meant to be a light for sincere seekers.",
  },
  8: {
    title: "The Achiever",
    symbol: "♄",
    color: "#5577aa",
    border: "#88aacc",
    personality: "Saturn's number — the most karmic, the most powerful, and the most misunderstood. You are here to work hard, face life's tests directly, and earn every achievement through disciplined effort. The universe does not give you shortcuts — but what you build, no force can destroy. You carry the weight of destiny consciously.",
    strengths: ["Extraordinary strength and resilience","Natural authority and executive ability","Long-term vision and strategic thinking","Ability to manifest wealth through persistent effort","Deep understanding of power and how the world works"],
    challenges: ["Life brings more hardships than other numbers as karmic lessons","Tendency toward control and rigidity","Workaholism and neglect of personal life","Saturn's lessons: loss, delay, and limitation before breakthrough","Can become ruthless in pursuit of goals"],
    career: "Business, law, politics, finance, banking, real estate, surgery, engineering, administration, military. You are built for power — but must earn it through service and integrity.",
    love: "You love with fierce loyalty and protectiveness — but struggle to show softness. Your partner must understand that your devotion shows through provision and protection rather than poetry. Guard against neglecting relationships for career. Best with 2, 4, and 6.",
    health: "Saturn-ruled — watch bones, teeth, joints, knees, and the skeletal structure. Prone to chronic conditions that develop slowly. Cold, damp, and stress are your greatest health enemies. Discipline in diet and sleep — not just work — is essential.",
    life_path: "You are here to master the material world — and then transcend it. The first half of your life often involves significant struggle and delayed gratification. The second half brings the rewards of all that effort — authority, wealth, and deep wisdom. Your life is a teaching about karma.",
  },
  9: {
    title: "The Humanitarian",
    symbol: "♂",
    color: "#cc3300",
    border: "#ff8866",
    personality: "Mars ignites you with the fire of compassion and courage. You are the number of completion — you have lived many lives and carry their accumulated wisdom. You love broadly, feel deeply, and serve fiercely. You cannot look away from injustice — your soul demands action. You are the warrior with a heart.",
    strengths: ["Deep compassion and humanitarian instincts","Tremendous courage and fighting spirit","Natural wisdom that transcends education","Magnetic leadership that inspires sacrifice","Ability to complete what others abandon"],
    challenges: ["Absorbing others' pain and carrying it as your own","Tendency toward anger when ideals are violated","Difficulty letting go — of people, grudges, and the past","Scattered giving that depletes your own resources","Impulsiveness in moments of passion"],
    career: "Medicine, surgery, law, social activism, military, teaching, philosophy, healing, fire services, martial arts, writing, spiritual leadership. Any path where courage and compassion intersect.",
    love: "You love with your whole being — intensely, completely, and sometimes overwhelmingly. You need a partner who can receive great love without feeling consumed. You forgive too much or too little — finding the middle is your work. Best with 1, 2, and 6.",
    health: "Mars-ruled — watch blood, the head, accidents, fever, and inflammation. Prone to stress-related conditions from over-giving. Rest and cooling practices — not just action — are essential for your vitality.",
    life_path: "You are here to give — not to accumulate. Everything in your life that is released comes back multiplied. Everything you hold too tightly slips away. Your life purpose is completion and service: you close cycles, heal old wounds — your own and others' — and point toward what's beyond the self.",
  },
};

function reduce(n) {
  while (n > 9) {
    n = String(n).split("").reduce((a, d) => a + Number(d), 0);
  }
  return n;
}

function calcMoolank(day) { return reduce(day); }

function calcBhagyank(day, month, year) {
  const digits = `${day}${month}${year}`.split("").reduce((a, d) => a + Number(d), 0);
  return reduce(digits);
}

function calcNamank(name) {
  const upper = name.toUpperCase().replace(/[^A-Z]/g, "");
  const sum = upper.split("").reduce((a, c) => a + (CHALDEAN[c] || 0), 0);
  return reduce(sum);
}

function formatMd(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^#{1,3} (.+)$/gm, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}

function NumCard({ num, label, sublabel }) {
  const d = NUM_DATA[num];
  if (!num || !d) return null;
  return (
    <div style={{ ...S.numCard, borderColor: d.border }}>
      <div style={S.numHeader}>
        <div style={{ ...S.bigNum, color: d.color }}>{num}</div>
        <div>
          <div style={{ color: d.border, fontSize: 22, fontFamily: "Georgia,serif" }}>{d.symbol} {d.title}</div>
          <div style={{ color: MUTED, fontSize: 14, marginTop: 4 }}>{label}</div>
          {sublabel && <div style={{ color: G, fontSize: 13, marginTop: 2 }}>{sublabel}</div>}
        </div>
      </div>

      <div style={S.grid2}>
        <InfoBox label="Ruling Planet" value={PLANETS[num]} />
        <InfoBox label="Presiding Deity" value={DEITIES[num]} />
        <InfoBox label="Lucky Colour" value={COLORS[num]} />
        <InfoBox label="Lucky Gemstone" value={GEMS[num]} />
        <InfoBox label="Auspicious Day" value={DAYS[num]} />
        <InfoBox label="Sacred Mantra" value={MANTRAS[num]} />
      </div>

      <Section title="Core Personality" text={d.personality} />

      <div style={S.twoCol}>
        <div>
          <div style={S.sectionTitle}>Strengths</div>
          <ul style={S.ul}>
            {d.strengths.map((s, i) => <li key={i} style={S.li}>{s}</li>)}
          </ul>
        </div>
        <div>
          <div style={S.sectionTitle}>Challenges</div>
          <ul style={S.ul}>
            {d.challenges.map((c, i) => <li key={i} style={S.li}>{c}</li>)}
          </ul>
        </div>
      </div>

      <Section title="Career & Life Purpose" text={d.career} />
      <Section title="Love & Relationships" text={d.love} />
      <Section title="Health & Body" text={d.health} />
      <Section title="Life Path" text={d.life_path} />
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div style={S.infoBox}>
      <div style={{ color: MUTED, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      <div style={{ color: TXT, fontSize: 14, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function Section({ title, text }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={S.sectionTitle}>{title}</div>
      <div style={{ color: TXT, fontSize: 15, lineHeight: 1.75, opacity: 0.9 }}>{text}</div>
    </div>
  );
}

export default function Numerology() {
  const [form, setForm] = useState({ name: "", day: "", month: "", year: "" });
  const [result, setResult] = useState(null);
  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function calculate() {
    const day = parseInt(form.day), month = parseInt(form.month), year = parseInt(form.year);
    if (!day || !month || !year || day > 31 || month > 12) return;
    const moolank = calcMoolank(day);
    const bhagyank = calcBhagyank(day, month, year);
    const namank = form.name.trim() ? calcNamank(form.name.trim()) : null;
    setResult({ moolank, bhagyank, namank, day, month, year, name: form.name.trim() });
    setReading("");
  }

  async function getReading() {
    if (!result) return;
    setAiLoading(true);
    setReading("");
    try {
      const res = await fetch(`${API}/numerology-interpret`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) setReading(r => r + decoder.decode(value));
      }
    } catch (e) {
      setReading("⚠ Unable to reach the reading service. Please try again.");
    }
    setAiLoading(false);
  }

  // Compatibility logic
  function getCompatibility(a, b) {
    const friendly = {
      1:[1,3,5,9], 2:[2,4,6,8], 3:[1,3,5,9], 4:[2,4,8], 5:[1,3,5,9,6],
      6:[2,3,6,9], 7:[2,5,7], 8:[2,4,6,8], 9:[1,3,6,9],
    };
    if (a === b) return { label: "Mirror Souls", color: "#44cc88", note: "Same number — deep understanding, but amplify each other's shadows too." };
    if (friendly[a]?.includes(b)) return { label: "Harmonious", color: "#44cc88", note: "Naturally aligned — complementary energies that support each other's growth." };
    return { label: "Karmic Challenge", color: "#cc8844", note: "Requires conscious effort — but the friction produces growth and transformation." };
  }

  return (
    <div style={S.page}>
      <div style={S.hero}>
        <div style={S.heroSymbol}>अंक</div>
        <h1 style={S.heroTitle}>Vedic Numerology</h1>
        <p style={S.heroSub}>Moolank · Bhagyank · Namank — The three numbers that encode your destiny</p>
      </div>

      <div style={S.container}>
        {/* Input Form */}
        <div style={S.formCard}>
          <div style={S.formTitle}>Enter Your Details</div>
          <div style={S.formRow}>
            <div style={S.fieldGroup}>
              <label style={S.label}>Full Name (for Namank)</label>
              <input style={S.input} placeholder="Your full name" value={form.name}
                onChange={e => set("name", e.target.value)} />
            </div>
          </div>
          <div style={S.formRow}>
            <div style={S.fieldGroup}>
              <label style={S.label}>Day of Birth</label>
              <input style={S.input} type="number" placeholder="DD" min="1" max="31"
                value={form.day} onChange={e => set("day", e.target.value)} />
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Month of Birth</label>
              <input style={S.input} type="number" placeholder="MM" min="1" max="12"
                value={form.month} onChange={e => set("month", e.target.value)} />
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Year of Birth</label>
              <input style={S.input} type="number" placeholder="YYYY" min="1900" max="2099"
                value={form.year} onChange={e => set("year", e.target.value)} />
            </div>
          </div>
          <button style={S.btn} onClick={calculate}>✦ Calculate My Numbers</button>
        </div>

        {result && (
          <>
            {/* Summary Row */}
            <div style={S.summaryRow}>
              <SummaryBadge num={result.moolank} label="Moolank" sub="Birth Number · Day digit sum" />
              <SummaryBadge num={result.bhagyank} label="Bhagyank" sub="Destiny Number · Full DOB sum" />
              {result.namank && <SummaryBadge num={result.namank} label="Namank" sub="Name Number · Chaldean" />}
            </div>

            {/* Compatibility between Moolank & Bhagyank */}
            {(() => {
              const c = getCompatibility(result.moolank, result.bhagyank);
              return (
                <div style={{ ...S.compatBox, borderColor: c.color }}>
                  <span style={{ color: c.color, fontWeight: "bold", fontSize: 16 }}>
                    Moolank {result.moolank} × Bhagyank {result.bhagyank} — {c.label}
                  </span>
                  <div style={{ color: MUTED, fontSize: 14, marginTop: 6 }}>{c.note}</div>
                </div>
              );
            })()}

            {/* Moolank */}
            <div style={S.sectionHeader}>Moolank {result.moolank} — Your Birth Number</div>
            <p style={S.sectionDesc}>
              Derived from your day of birth ({result.day} → {String(result.day).split("").join(" + ")} = {result.moolank}).
              The Moolank reveals your innate personality, your instinctive nature, and the raw energy you bring into every room.
              It is who you are before the world shapes you.
            </p>
            <NumCard num={result.moolank} label={`Moolank ${result.moolank}`} sublabel={PLANETS[result.moolank]} />

            {/* Bhagyank */}
            <div style={S.sectionHeader}>Bhagyank {result.bhagyank} — Your Destiny Number</div>
            <p style={S.sectionDesc}>
              Derived from your complete date of birth ({result.day}/{result.month}/{result.year} → all digits summed = {result.bhagyank}).
              The Bhagyank reveals your life purpose, the path your soul is destined to walk, and the lessons you are here to master.
              It is who you are becoming.
            </p>
            <NumCard num={result.bhagyank} label={`Bhagyank ${result.bhagyank}`} sublabel={PLANETS[result.bhagyank]} />

            {/* Namank */}
            {result.namank && (
              <>
                <div style={S.sectionHeader}>Namank {result.namank} — Your Name Number</div>
                <p style={S.sectionDesc}>
                  Derived from "{result.name}" using the Chaldean system — the oldest and most spiritually precise method.
                  The Namank reveals the energy your name vibrates at and how the world perceives you.
                  If your Namank harmonizes with your Moolank and Bhagyank, your name amplifies your destiny.
                </p>
                <NumCard num={result.namank} label={`Namank ${result.namank}`} sublabel={`Name: ${result.name}`} />
              </>
            )}

            {/* AI Reading */}
            <div style={S.aiCard}>
              <div style={S.aiTitle}>✦ Complete Numerological Reading</div>
              <div style={{ color: MUTED, fontSize: 14, marginBottom: 20 }}>
                A deep synthesis of your Moolank, Bhagyank{result.namank ? ", and Namank" : ""} — past, present, future, remedies, and life guidance.
              </div>
              {!reading && (
                <button style={S.aiBtn} onClick={getReading} disabled={aiLoading}>
                  {aiLoading ? "Generating Reading…" : "✦ Generate Complete Reading"}
                </button>
              )}
              {aiLoading && !reading && <div style={S.spinner}>Consulting the numbers…</div>}
              {reading && (
                <div style={S.aiText} dangerouslySetInnerHTML={{ __html: formatMd(reading) }} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryBadge({ num, label, sub }) {
  const d = NUM_DATA[num];
  return (
    <div style={{ ...S.badge, borderColor: d?.border || G }}>
      <div style={{ fontSize: 48, fontWeight: "bold", color: d?.color || G, fontFamily: "Georgia,serif" }}>{num}</div>
      <div style={{ color: TXT, fontWeight: "bold", fontSize: 16 }}>{label}</div>
      <div style={{ color: MUTED, fontSize: 12, marginTop: 4 }}>{sub}</div>
      <div style={{ color: d?.border || G, fontSize: 13, marginTop: 6 }}>{d?.title}</div>
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", background: BG, color: TXT, fontFamily: "system-ui,sans-serif" },
  hero: { textAlign: "center", padding: "60px 20px 40px", background: "linear-gradient(180deg,#1a0800 0%,#0f0400 100%)" },
  heroSymbol: { fontSize: 64, color: G, fontFamily: "Georgia,serif", marginBottom: 8 },
  heroTitle: { fontSize: 36, fontWeight: "bold", color: TXT, margin: "0 0 12px", fontFamily: "Georgia,serif", letterSpacing: 2 },
  heroSub: { color: MUTED, fontSize: 16, maxWidth: 520, margin: "0 auto" },
  container: { maxWidth: 900, margin: "0 auto", padding: "40px 20px 80px" },
  formCard: { background: CARD, border: `1px solid ${G}33`, borderRadius: 12, padding: 32, marginBottom: 40 },
  formTitle: { fontSize: 20, color: G, fontFamily: "Georgia,serif", marginBottom: 24 },
  formRow: { display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" },
  fieldGroup: { display: "flex", flexDirection: "column", flex: 1, minWidth: 140 },
  label: { color: MUTED, fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
  input: { background: "#2a1200", border: `1px solid ${G}44`, borderRadius: 8, padding: "12px 16px",
           color: TXT, fontSize: 15, outline: "none" },
  btn: { background: G, color: "#0f0400", border: "none", borderRadius: 8, padding: "14px 32px",
         fontSize: 15, fontWeight: "bold", cursor: "pointer", letterSpacing: 1, marginTop: 8 },
  summaryRow: { display: "flex", gap: 20, justifyContent: "center", marginBottom: 32, flexWrap: "wrap" },
  badge: { background: CARD, border: `2px solid`, borderRadius: 12, padding: "24px 32px",
           textAlign: "center", minWidth: 160, flex: 1, maxWidth: 220 },
  compatBox: { background: CARD, border: `1px solid`, borderRadius: 10, padding: "16px 24px",
               marginBottom: 40, textAlign: "center" },
  sectionHeader: { fontSize: 24, color: G, fontFamily: "Georgia,serif", margin: "48px 0 12px",
                   borderBottom: `1px solid ${G}33`, paddingBottom: 12 },
  sectionDesc: { color: MUTED, fontSize: 14, lineHeight: 1.8, marginBottom: 20 },
  numCard: { background: CARD, border: `1px solid`, borderRadius: 12, padding: "32px 28px", marginBottom: 16 },
  numHeader: { display: "flex", alignItems: "center", gap: 24, marginBottom: 28,
               paddingBottom: 24, borderBottom: `1px solid #ffffff11` },
  bigNum: { fontSize: 80, fontWeight: "bold", fontFamily: "Georgia,serif", lineHeight: 1, minWidth: 90, textAlign: "center" },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 8 },
  infoBox: { background: "#2a110022", border: `1px solid ${G}22`, borderRadius: 8, padding: "12px 16px" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 20 },
  sectionTitle: { color: G, fontSize: 13, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, fontWeight: "bold" },
  ul: { margin: 0, paddingLeft: 20 },
  li: { color: TXT, fontSize: 14, lineHeight: 2, opacity: 0.9 },
  aiCard: { background: CARD, border: `1px solid ${G}44`, borderRadius: 12, padding: "32px 28px", marginTop: 48 },
  aiTitle: { fontSize: 22, color: G, fontFamily: "Georgia,serif", marginBottom: 8 },
  aiBtn: { background: "transparent", border: `1px solid ${G}`, color: G, borderRadius: 8,
           padding: "12px 28px", fontSize: 14, cursor: "pointer", letterSpacing: 1 },
  aiText: { color: TXT, fontSize: 15, lineHeight: 1.9, opacity: 0.95 },
  spinner: { color: MUTED, fontStyle: "italic", marginTop: 16 },
};
