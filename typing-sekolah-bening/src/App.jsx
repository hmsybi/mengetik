import React, { useEffect, useMemo, useRef, useState } from "react";

export default function App() {
  const rankingRef = useRef(null);

  const siswa = {
    "5": ["Abdullah", "Fatimah", "Yusuf", "Naomi"],
    "6AG": ["Abrar", "Kevin", "Kirana", "Yumna"],
    "6TBZ": ["Acquila", "Dean", "Rio", "Najla"]
  };

  const words =
    "visi sekolah bening islami beradab berani berkarya literasi potensi keterampilan masa depan".split(
      " "
    );

  const randomText = () =>
    [...words].sort(() => Math.random() - 0.5).join(" ");

  const [kelas, setKelas] = useState("");
  const [nama, setNama] = useState("");
  const [text, setText] = useState(randomText());
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [results, setResults] = useState(() => {
    const x = localStorage.getItem("typing-premium");
    return x ? JSON.parse(x) : [];
  });

  useEffect(() => {
    localStorage.setItem("typing-premium", JSON.stringify(results));
  }, [results]);

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
    const wordsCount = typed.trim().split(/\s+/).filter(Boolean).length;

    let correct = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === text[i]) correct++;
    }

    const typo = typed.length - correct;
    const accuracy = typed.length
      ? Math.round((correct / typed.length) * 100)
      : 0;

    const used = Math.max(1, 90 - timeLeft);
    const wpm = Math.round(wordsCount / (used / 60));

    const score = Math.round((correct * 2 + wpm) / 5);

    return { correct, typo, accuracy, wpm, score };
  }, [typed, text, timeLeft]);

  function finish() {
    if (!kelas || !nama) return;

    setStarted(false);

    const row = {
      nama,
      kelas,
      ...stats,
      date: new Date().toLocaleString("id-ID")
    };

    setResults((prev) => {
      const same = prev.findIndex(
        (x) => x.nama === nama && x.kelas === kelas
      );

      if (same >= 0) {
        if (row.score > prev[same].score) {
          const copy = [...prev];
          copy[same] = row;
          return copy;
        }
        return prev;
      }

      return [...prev, row];
    });

    setTimeout(() => {
      rankingRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }

  function restart() {
    setKelas("");
    setNama("");
    setTyped("");
    setStarted(false);
    setTimeLeft(90);
    setText(randomText());
  }

  function exportCSV() {
    const header =
      "Rank,Nama,Kelas,Benar,WPM,Nilai,Accuracy,Tanggal\n";

    const rows = ranked
      .map(
        (r) =>
          `${r.rank},${r.nama},${r.kelas},${r.correct},${r.wpm},${r.score},${r.accuracy}%,${r.date}`
      )
      .join("\n");

    const blob = new Blob([header + rows], {
      type: "text/csv;charset=utf-8;"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "hasil-lomba-typing.csv";
    link.click();
  }

  const ranked = [...results]
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.correct - a.correct ||
        b.wpm - a.wpm
    )
    .map((x, i) => ({ ...x, rank: i + 1 }));

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          🏆 SEKOLAH BENING - TYPING PREMIUM
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
          <button onClick={restart} style={styles.btnBlue}>
            🔄 Mulai Lagi
          </button>

          <button onClick={exportCSV} style={styles.btnGold}>
            📊 Export Excel
          </button>
        </div>
      </div>

      <div style={styles.card} ref={rankingRef}>
        <h2>🏆 Ranking Live</h2>

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
    background: "#eef3ff",
    minHeight: "100vh",
    padding: 20,
    fontFamily: "Arial"
  },
  card: {
    background: "#fff",
    borderRadius: 14,
    padding: 20,
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
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
    gap: 10,
    marginTop: 15
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
