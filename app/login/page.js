"use client";
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('Kayıt başarılı! Giriş yapabilirsiniz.');
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else router.push('/'); // Başarılıysa ana sayfaya gönder
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">TaskFlow Giriş</h1>
        <input 
          type="email" placeholder="E-posta" 
          className="w-full p-3 mb-4 border rounded"
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" placeholder="Şifre" 
          className="w-full p-3 mb-6 border rounded"
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-3 rounded mb-2 font-bold">Giriş Yap</button>
        <button onClick={handleSignUp} className="w-full bg-gray-200 text-gray-800 p-3 rounded font-bold">Kayıt Ol</button>
      </div>
    </div>
  );
}