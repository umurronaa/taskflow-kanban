"use client";
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignUp = async () => {
    // BOŞ VERİ KONTROLÜ
    if (!email || !password) {
      alert("Lütfen e-posta ve şifre alanlarını doldurun.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      alert("Hata: " + error.message);
    } else {
      alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Lütfen e-posta ve şifre alanlarını doldurun.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert("Hata: " + error.message);
    } else {
      router.push('/'); 
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>TaskFlow Giriş</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" 
            placeholder="E-posta" 
            autoComplete="email" // Tarayıcı desteği için
            style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Şifre" 
            autoComplete="current-password"
            style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
            onChange={(e) => setPassword(e.target.value)} 
          />
          
          <button onClick={handleLogin} style={{ padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Giriş Yap</button>
          <button onClick={handleSignUp} style={{ padding: '12px', backgroundColor: 'transparent', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Hesap Oluştur</button>
        </div>
      </div>
    </div>
  );
}