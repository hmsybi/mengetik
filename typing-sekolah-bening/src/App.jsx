import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  query
} from "firebase/firestore";
import { db } from "./firebase";

const siswa = {
  "5": [
    "Abdullah Al Fauzan",
    "Adkhilni Mufida Shidqi",
    "Akifah Farah Harania Isfandi",
    "Athar Raditya Maher",
    "Devia Pritha Prameswari",
    "Fatimah Adzika Qurani",
    "Ghumaisha Al Mecca",
    "Hafiza Khaira Lubna",
    "Hafuza Ahnaf Hendrawan",
    "Muhammad Ali Zhafran A Shori",
    "Nabil Pamungkas Pohan",
    "Naomi Azkia Zahra",
    "Noureen Humaira Syazaira",
    "R Adhskan Shaliq",
    "Reyvasha Dzakirra Aftani",
    "Yusuf Abdullah Basalamah",
    "Zhafira Azzahra"
  ],

  "6AG": [
    "Abrar Wildan Hanif",
    "Adiba Kanza Azzuni",
    "Aisyah Azmi Maulani",
    "Alesha Naila Zahran",
    "Bagas Dwi Putra",
    "Farzan Ahza Khairi Noer",
    "Kevin Ghifarial Alif",
    "Kirana Larasati",
    "Mahran Sakhi Arundati",
    "Muhammad Aulia Hanif",
    "Muhammad Hafidz Al Faith",
    "Muhammad Zabran A",
    "Nasyitha Zhafra A",
    "Queisha Qatrunnada R",
    "Raveena Naira Khafiya L",
    "Rayyan Ibaadurrahman",
    "Sultan Bagus Farzana",
    "Yumna Alika Qeis",
    "Amira Gyantika Mulia"
  ],

  "6TBZ": [
    "Acquila Arsyila Shina",
    "Alfar Abiela Wijaya",
    "Alika Naila Putri Handoko",
    "Annisa Hasna Afifah",
    "Annora Sava Ghassany",
    "Ayesha Safiya Hamdania",
    "Dean Sulthani Yusuf",
    "Faith Asyja Ahnaf Al F",
    "Felicia Fayruz Fernandez",
    "Hamizan Ihsan Fadhil Z",
    "Luqman Habibie Thalib",
    "Mahira Hasna Kamila",
    "Michaela Mahira M Z",
    "Muhammad Daffarel Jibran",
    "M Fayyaz Hafidzul R",
    "Rio Aprilio",
    "Senandung Bunga Insyira M",
    "Najla Alimatul Qarirah",
    "Aqila Zahra Afandi"
  ]
};

const kata =
  "visi terwujudnya peserta didik yang islami beradab berani dan berkarya menanamkan konsep islam sebagai pandangan hidup menanamkan siswa untuk berakhlak mulia membangun budaya literasi memfasilitasi penemuan potensi diri memfasilitasi dan mengasah keterampilan".split(
    " "
  );

function acakText() {
  return [...kata].sort(() => Math.random() - 0.5).join(" ");
}

export default function App() {
  const rankingRef = useRef(null);

  const [kelas, setKelas] = useState("");
  const [nama, setNama] = useState("");
  const [text, setText] = useState(acakText());
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "results"));

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setResults(data);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!started) return;

    if (timeLeft <= 0) {
      finish();
      return;
    }

    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
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

    const used = Math.max(1, 90 - timeLeft);
    const wpm = Math.round(words / (used / 60));

    const score = Math.round((correct * 2 + wpm) / 5);

    return { correct, accuracy, wpm, score };
  }, [typed, text, timeLeft]);

  async function finish() {
    if (!nama || !kelas) return;

    setStarted(false);

    await addDoc(collection(db, "results"), {
      nama,
      kelas,
      ...stats,
      createdAt: new Date().toISOString()
    });

    setTimeout(() => {
      rankingRef.current?.scrollIntoView({
        behavior: "smooth"
      });
    }, 300);
  }

  function restart() {
    setKelas("");
    setNama("");
    setTyped("");
    setStarted(false);
    setTimeLeft(90);
    setText(acakText());
  }

  function exportCSV() {
    const rows = ranked.map(
      (r) =>
        `${r.rank},${r.nama},${r.kelas},${r.correct},${r.wpm},${r.score}`
    );

    const csv =
      "Rank,Nama,Kelas,Benar,WPM,Nilai\n" + rows.join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ranking-typing.csv";
    link.click();
  }

  const best = {};

  results.forEach((r) => {
    const key = r.kelas + "-" + r.nama;

    if (!best[key] || r.score > best[key].score) {
      best[key] = r;
    }
  });

  const ranked = Object.values(best)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.correct - a.correct ||
        b.wpm - a.wpm
    )
    .map((r, i) => ({ ...r, rank: i + 1 }));

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          🏆 SEKOLAH BENING TYPING ULTIMATE
        </h1>

        <div style={styles.grid}>
          <select
            value={kelas}
            onChange={(e) => {
              setKelas(e.target.value);
              setNama("");
            }}
            style={styles.input}
          >
            <option value="">Pilih Kelas</option>
            <option value="5">Kelas 5</option>
            <option value="6AG">Kelas 6 AG</option>
            <option value="6TBZ">Kelas 6 TBZ</option>
          </select>

          <select
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            style={styles.input}
          >
            <option value="">Pilih Nama</option>

            {(siswa[kelas] || []).map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>

        <h2 style={styles.timer}>⏰ {timeLeft} detik</h2>

        <div style={styles.textBox}>{text}</div>

        <textarea
          style={styles.textarea}
          disabled={!kelas || !nama || timeLeft <= 0}
          value={typed}
          onChange={(e) => {
            const val = e.target.value;

            if (!started && val.length > 0) {
              setStarted(true);
            }

            setTyped(val);

            if (val.length >= text.length) finish();
          }}
          placeholder="Ketik di sini..."
        />

        <div style={styles.stats}>
          <div>Benar: {stats.correct}</div>
          <div>WPM: {stats.wpm}</div>
          <div>Accuracy: {stats.accuracy}%</div>
          <div>Nilai: {stats.score}</div>
        </div>

        <div style={styles.actions}>
          <button style={styles.btnBlue} onClick={restart}>
            🔄 Mulai Lagi
          </button>

          <button style={styles.btnGold} onClick={exportCSV}>
            📊 Export Excel
          </button>
        </div>
      </div>

      <div style={styles.card} ref={rankingRef}>
        <h2>🏆 Rank</h2>

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
                <td>
                  {r.rank === 1
                    ? "🥇"
                    : r.rank === 2
                    ? "🥈"
                    : r.rank === 3
                    ? "🥉"
                    : r.rank}
                </td>
                <td>{r.nama}</td>
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
    minHeight: "100vh",
    background: "#eef3ff",
    padding: 20,
    fontFamily: "Arial"
  },
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 14,
    marginBottom: 20,
    boxShadow: "0 8px 20px rgba(0,0,0,.08)"
  },
  title: {
    color: "#1e40af"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10
  },
  input: {
    padding: 10,
    borderRadius: 8
  },
  timer: {
    color: "#dc2626",
    marginTop: 15
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
  stats: {
    marginTop: 15,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
    gap: 10
  },
  actions: {
    display: "flex",
    gap: 10,
    marginTop: 15
  },
  btnBlue: {
    background: "#2563eb",
    color: "#fff",
    border: 0,
    padding: "10px 16px",
    borderRadius: 8,
    cursor: "pointer"
  },
  btnGold: {
    background: "#d97706",
    color: "#fff",
    border: 0,
    padding: "10px 16px",
    borderRadius: 8,
    cursor: "pointer"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  }
};
