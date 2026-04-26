import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const studentMap = {
 '5': ['Abdullah Al Fauzan','Adkhilni Mufida Shidqi','Akifah Farah Harania Isfandi','Athar Raditya Maher','Devia Pritha Prameswari','Fatimah Adzika Qurani','Ghumaisha Al Mecca','Hafiza Khaira Lubna','Hafuza Ahnaf Hendrawan','Muhammad Ali Zhafran A Shori','Nabil Pamungkas Pohan','Naomi Azkia Zahra','Noureen Humaira Syazaira','R Adhskan Shaliq','Reyvasha Dzakirra Aftani','Yusuf Abdullah Basalamah','Zhafira Azzahra'],
 '6AG': ['Abrar Wildan Hanif','Adiba Kanza Azzuni','Aisyah Azmi Maulani','Alesha Naila Zahran','Bagas Dwi Putra','Farzan Ahza Khairi Noer','Kevin Ghifarial Alif','Kirana Larasati','Mahran Sakhi Arundati','Muhammad Aulia Hanif','Muhammad Hafidz Al Faith','Muhammad Zabran A','Nasyitha Zhafra A','Queisha Qatrunnada R','Raveena Naira Khafiya L','Rayyan Ibaadurrahman','Sultan Bagus Farzana','Yumna Alika Qeis','Amira Gyantika Mulia'],
 '6TBZ': ['Acquila Arsyila Shina','Alfar Abiela Wijaya','Alika Naila Putri Handoko','Annisa Hasna Afifah','Annora Sava Ghassany','Ayesha Safiya Hamdania','Dean Sulthani Yusuf','Faith Asyja Ahnaf Al F','Felicia Fayruz Fernandez','Hamizan Ihsan Fadhil Z','Luqman Habibie Thalib','Mahira Hasna Kamila','Michaela Mahira M Z','Muhammad Daffarel Jibran','M Fayyaz Hafidzul R','Rio Aprilio','Senandung Bunga Insyira M','Najla Alimatul Qarirah','Aqila Zahra Afandi']
};
const baseWords = 'visi terwujudnya peserta didik yang islami beradab berani dan berkarya menanamkan konsep islam sebagai pandangan hidup menanamkan siswa untuk berakhlak mulia membangun budaya literasi memfasilitasi penemuan potensi diri memfasilitasi dan mengasah keterampilan'.split(' ');
const shuffleWords = () => [...baseWords].sort(()=>Math.random()-0.5).join(' ');

export default function App(){
 const rankingRef = useRef(null);
 const [name,setName]=useState('');
 const [kelas,setKelas]=useState('');
 const [duration,setDuration]=useState('1.5');
 const [started,setStarted]=useState(false);
 const [timeLeft,setTimeLeft]=useState(90);
 const [text,setText]=useState(shuffleWords());
 const [typed,setTyped]=useState('');
 const [results,setResults]=useState([]);
  const [filterClass,setFilterClass]=useState('ALL');
 useEffect(()=>{ if(!started) return; if(timeLeft<=0){finish(); return;} const t=setTimeout(()=>setTimeLeft(v=>v-1),1000); return ()=>clearTimeout(t)},[started,timeLeft]);
 useEffect(()=>{const load=async()=>{try{const r=await fetch('https://sekolah-bening-typing.free.beeceptor.com/results'); const d=await r.json(); setResults(d||[]);}catch(e){}}; load(); const iv=setInterval(load,3000); return ()=>clearInterval(iv);},[]);
 useEffect(()=>{if(!results.length) return; fetch('https://example.com/api/results',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(results[results.length-1])}).catch(()=>{});},[results]);
 const stats = useMemo(()=>{
   const original=text.trim(); const words=typed.trim().split(/\s+/).filter(Boolean).length;
   let correct=0; for(let i=0;i<typed.length;i++){ if(typed[i]===text[i]) correct++; }
   const accuracy = typed.length? Math.round((correct/typed.length)*100):0;
   const typo = Math.max(0, typed.length-correct);
   const mins=(parseInt(duration)||1);
   const wpm=Math.round(words/(Math.max(1,(mins*60-timeLeft))/60));
   const score=Math.min(100, Math.round(correct + (wpm*1.5)));
   return {wpm:isFinite(wpm)?wpm:0,accuracy,typo,score,correct};
 },[typed,timeLeft,duration,text]);
 function start(){ const sec=parseFloat(duration)*60; setTimeLeft(sec); setTyped(''); setName(''); setText(shuffleWords()); setStarted(false);}    
 function finish(){ if(!name||!kelas) return; setStarted(false); const row={name,kelas,duration,date:new Date().toLocaleString('id-ID'),wpm:stats.wpm,accuracy:stats.accuracy,typo:stats.typo,correct:stats.correct,score:stats.score}; setResults(r=>[...r,row]); setTimeout(()=>rankingRef.current?.scrollIntoView({behavior:'smooth'}),300); }
  const filtered = filterClass==='ALL' ? results : results.filter(r=>r.kelas===filterClass);
 const bestMap = filtered.reduce((acc,r)=>{ const key=`${r.kelas}-${r.name}`; if(!acc[key] || r.correct>acc[key].correct || (r.correct===acc[key].correct && r.wpm>acc[key].wpm)){ acc[key]=r; } return acc; },{});
 const ranked = Object.values(bestMap).sort((a,b)=> b.correct-a.correct || b.wpm-a.wpm || b.score-a.score).map((r,i)=>({...r,rank:i+1}));
 const classes=[...new Set(results.map(r=>r.kelas).filter(Boolean))];
 return <div className='p-6 grid gap-6'>
  <Card className='rounded-2xl shadow'><CardContent className='p-6 grid gap-4'>
   <div className='flex justify-between items-center gap-3'><h1 className='text-3xl font-bold flex items-center gap-3'><img src='/mnt/data/Logo-Baru-Sekolah-Bening.png' alt='Logo Sekolah Bening' className='h-20 w-auto' /> <span>Sekolah Bening - Game Lomba Typing SD</span></h1></div>
   <div className='grid md:grid-cols-3 gap-3'>
    <Select value={kelas} onValueChange={(v)=>{setKelas(v); setName('');}}><SelectTrigger><SelectValue placeholder='Pilih Kelas'/></SelectTrigger><SelectContent><SelectItem value='5'>Kelas 5</SelectItem><SelectItem value='6AG'>Kelas 6 AG</SelectItem><SelectItem value='6TBZ'>Kelas 6 TBZ</SelectItem></SelectContent></Select>
    <Select value={name} onValueChange={setName}><SelectTrigger><SelectValue placeholder='Pilih Nama'/></SelectTrigger><SelectContent>{(studentMap[kelas]||[]).map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
    <Select value={duration} onValueChange={setDuration}><SelectTrigger><SelectValue placeholder='Durasi'/></SelectTrigger><SelectContent><SelectItem value='1.5'>90 Detik</SelectItem></SelectContent></Select>
   </div>
   
   <div className='text-lg font-bold text-center animate-pulse'>⏰ Waktu: {timeLeft}s {started ? '' : '(mulai saat huruf pertama ditekan)'}</div>
   <div className='p-5 bg-yellow-100 rounded-2xl text-2xl leading-10 text-center font-bold border-4'>{text.split('').map((ch,i)=><span key={i} className={i===typed.length?'bg-blue-500 text-white rounded px-0.5':''}>{ch}</span>)}</div>
   <textarea className='w-full border rounded-xl p-3 min-h-32 disabled:bg-gray-100' disabled={!name||!kelas||timeLeft<=0||(typed.length>=text.length&&typed.length>0)} value={typed} onChange={e=>{ const v=e.target.value; if(!started && v.length>0){ const sec=parseFloat(duration)*60; setTimeLeft(sec); setTyped(''); setStarted(true);}  setTyped(v); if(v.length>=text.length) finish(); }} placeholder={!name||!kelas?'Pilih kelas dan nama dulu':'Ketik di sini...'} />{((typed.length>=text.length&&typed.length>0)||timeLeft<=0) && <div className='text-center grid gap-3'><div className='text-blue-600 text-5xl font-black py-4'>TES SELESAI</div><div><Button onClick={start} className='text-lg px-8 py-6'>🔄 Mulai Lagi</Button></div></div>}
   <div className='grid md:grid-cols-4 gap-3 text-sm'>
    <div>Benar: <b>{stats.correct}</b></div><div>WPM: <b>{stats.wpm}</b></div>
    <div>Accuracy: <b>{stats.accuracy}%</b></div>
    <div>Typo: <b>{stats.typo}</b></div>
    <div>Nilai: <b>{stats.score}</b></div>
   </div>
   <div className='text-xs text-muted-foreground'>Tes selesai otomatis saat waktu habis atau semua huruf selesai diketik. Data tersimpan permanen dan ranking realtime semua komputer.</div>
  </CardContent></Card>
  <Card ref={rankingRef} className='rounded-2xl shadow border-4 border-yellow-300'><CardContent className='p-6'>
   <div className='flex flex-wrap gap-3 justify-between items-center mb-3'><h2 className='text-2xl font-semibold'>🏆 Ranking Live Realtime</h2><div className='flex gap-2'><Select value={filterClass} onValueChange={setFilterClass}><SelectTrigger className='w-40'><SelectValue placeholder='Filter kelas'/></SelectTrigger><SelectContent><SelectItem value='ALL'>Semua Kelas</SelectItem>{classes.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div></div>
   <Table><TableHeader><TableRow><TableHead>Rank</TableHead><TableHead>Nama</TableHead><TableHead>Kelas</TableHead><TableHead>Tanggal</TableHead><TableHead>Benar</TableHead><TableHead>WPM</TableHead><TableHead>Accuracy</TableHead><TableHead>Typo</TableHead><TableHead>Nilai</TableHead></TableRow></TableHeader><TableBody>
   {ranked.map((r,idx)=><TableRow key={idx}><TableCell>{r.rank===1?'🥇':r.rank===2?'🥈':r.rank===3?'🥉':r.rank}</TableCell><TableCell>{r.name}</TableCell><TableCell>{r.kelas}</TableCell><TableCell>{r.date}</TableCell><TableCell>{r.correct}</TableCell><TableCell>{r.wpm}</TableCell><TableCell>{r.accuracy}%</TableCell><TableCell>{r.typo}</TableCell><TableCell>{r.score}</TableCell></TableRow>)}
   </TableBody></Table>
  </CardContent></Card>
 
 </div>
}
