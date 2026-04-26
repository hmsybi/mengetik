
import React,{useState} from 'react';
export default function App(){
 const [msg]=useState('Project siap upload. Tempel App versi lengkap dari canvas jika ingin fitur penuh.');
 return <div><h1>Typing Sekolah Bening</h1><p>{msg}</p></div>
}
