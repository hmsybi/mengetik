import React, { useEffect, useMemo, useRef, useState } from "react";

const studentMap = {
  "5": [
    "Abdullah Al Fauzan","Adkhilni Mufida Shidqi","Akifah Farah Harania Isfandi","Athar Raditya Maher",
    "Devia Pritha Prameswari","Fatimah Adzika Qurani","Ghumaisha Al Mecca","Hafiza Khaira Lubna",
    "Hafuza Ahnaf Hendrawan","Muhammad Ali Zhafran A Shori","Nabil Pamungkas Pohan","Naomi Azkia Zahra",
    "Noureen Humaira Syazaira","R Adhskan Shaliq","Reyvasha Dzakirra Aftani","Yusuf Abdullah Basalamah","Zhafira Azzahra"
  ],
  "6AG": [
    "Abrar Wildan Hanif","Adiba Kanza Azzuni","Aisyah Azmi Maulani","Alesha Naila Zahran","Bagas Dwi Putra",
    "Farzan Ahza Khairi Noer","Kevin Ghifarial Alif","Kirana Larasati","Mahran Sakhi Arundati",
    "Muhammad Aulia Hanif","Muhammad Hafidz Al Faith","Muhammad Zabran A","Nasyitha Zhafra A",
    "Queisha Qatrunnada R","Raveena Naira Khafiya L","Rayyan Ibaadurrahman","Sultan Bagus Farzana",
    "Yumna Alika Qeis","Amira Gyantika Mulia"
  ],
  "6TBZ": [
    "Acquila Arsyila Shina","Alfar Abiela Wijaya","Alika Naila Putri Handoko","Annisa Hasna Afifah",
    "Annora Sava Ghassany","Ayesha Safiya Hamdania","Dean Sulthani Yusuf","Faith Asyja Ahnaf Al F",
    "Felicia Fayruz Fernandez","Hamizan Ihsan Fadhil Z","Luqman Habibie Thalib","Mahira Hasna Kamila",
    "Michaela Mahira M Z","Muhammad Daffarel Jibran","M Fayyaz Hafidzul R","Rio Aprilio",
    "Senandung Bunga Insyira M","Najla Alimatul Qarirah","Aqila Zahra Afandi"
  ]
};

const baseWords =
  "visi terwujudnya peserta didik yang islami beradab berani dan berkarya menanamkan konsep islam sebagai pandangan hidup menanamkan siswa untuk berakhlak mulia membangun budaya literasi memfasilitasi penemuan potensi diri memfasilitasi dan mengasah keterampilan".split(
    " "
  );

function shuffleWords() {
  return [...baseWords].sort(() => Math.random() - 0.5).join(" ");
}

export default function App() {
  const rankingRef = useRef(null);

  const [kelas, setKelas] = useState("");
  const [name, setName] = useState("");
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [text, setText] = useState(shuffleWords());
  const [typed, setTyped] = useState("");
  const [results, setResults] = useState(() => {
    const saved = localStorage.getItem("typingResults");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("typingResults", JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    if (!started) return;
    if (timeLeft <= 0) {
      finishTest();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((v) => v - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [started, timeLeft]);

  const stats = useMemo(() => {
    const words = typed.trim().split(/\s+/).filter(Boolean).length;

    let correct = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === text[i]) correct++;
    }

    const accuracy = typed.length
      ? Math.round((correct / typed.length) * 100)
      : 0;

    const typo = Math.max(0, typed.length - correct);

    const usedSeconds = Math.max(1, 90 - timeLeft);
    const wpm = Math.round(words / (usedSeconds / 60));

    const score = Math.min(100, Math.round(correct + wpm * 1.5));

    return { correct, accuracy, typo, wpm, score };
  }, [typed, timeLeft, text]);

  function startAgain() {
    setStarted(false);
    setTimeLeft(90);
    setTyped("");
    setText(shuffleWords());
  }

  function finishTest() {
    if (!name || !kelas) return;

    setStarted(false);

    const row = {
      kelas,
      name,
      date: new Date().toLocaleString("id-ID"),
      ...stats
    };

    setResults((prev) => [...prev, row]);

    setTimeout(() => {
      rankingRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }

  function handleTyping(value) {
    if (!started && value.length > 0) {
      setStarted(true);
    }

    setTyped(value);

    if (value.length >= text.length) {
      finishTest();
    }
  }

  const ranked = [...results]
    .sort(
      (a, b) =>
        b.correct - a.correct ||
        b.wpm - a.wpm ||
        b.score - a.score
    )
    .map((r, i) => ({ ...r, rank: i + 1 }));

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>⌨️ Sekolah Bening - Lomba Typing</h1>

        <div style={styles.grid}>
          <select
            value={kelas}
            onChange={(e) => {
              setKelas(e.target.value);
              setName("");
            }}
            style={styles.input}
          >
            <option value="">Pilih Kelas</option>
            <option value="5">Kelas 5</option>
            <option value="6AG">Kelas 6 AG</option>
            <option value="6TBZ">Kelas 6 TBZ</option>
          </select>

          <select
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          >
            <option value="">Pilih Nama</option>
            {(studentMap[kelas] || []).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <h2 style={styles.timer}>⏰ Waktu: {timeLeft}s</h2>

        <div style={styles.textBox}>{text}</div>

        <textarea
          value={typed}
          onChange={(e) => handleTyping(e.target.value)}
          disabled={!kelas || !name || timeLeft <= 0}
          placeholder="Ketik di sini..."
          style={styles.textarea}
        />

        {(timeLeft <= 0 || typed.length >= text.length) && (
          <button onClick={startAgain} style={styles.button}>
            🔄 Mulai Lagi
          </button>
        )}

        <div style={styles.stats}>
          <div>Benar: {stats.correct}</div>
          <div>WPM: {stats.wpm}</div>
          <div>Accuracy: {stats.accuracy}%</div>
          <div>Typo: {stats.typo}</div>
          <div>Nilai: {stats.score}</div>
        </div>
      </div>

      <div style={styles.card} ref={rankingRef}>
        <h2>🏆 Ranking</h2>

        <table style={styles.table}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Nama</th>
              <th>Kelas</th>
              <th>Benar</th>
              <th>WPM</th>
              <th>Nilai</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((r, i) => (
              <tr key={i}>
                <td>{r.rank}</td>
                <td>{r.name}</td>
                <td>{r.kelas}</td>
                <td>{r.correct}</td>
                <td>{r.wpm}</td>
                <td>{r.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: 20,
    fontFamily: "Arial, sans-serif",
    background: "#f5f7fb"
  },
  card: {
    background: "white",
    padding: 20,
    borderRadius: 14,
    marginBottom: 20,
    boxShadow: "0 5px 15px rgba(0,0,0,0.08)"
  },
  title: {
    marginBottom: 20
  },
  grid: {
    display: "grid",
    gap: 10,
    gridTemplateColumns: "1fr 1fr"
  },
  input: {
    padding: 10,
    borderRadius: 8
  },
  timer: {
    marginTop: 20,
    color: "#2563eb"
  },
  textBox: {
    background: "#fff7cc",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    lineHeight: 1.8
  },
  textarea: {
    width: "100%",
    minHeight: 120,
    marginTop: 15,
    padding: 12
  },
  button: {
    marginTop: 15,
    padding: "10px 20px",
    border: "none",
    borderRadius: 8,
    background: "#2563eb",
    color: "white",
    cursor: "pointer"
  },
  stats: {
    marginTop: 15,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
    gap: 10
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  }
};
