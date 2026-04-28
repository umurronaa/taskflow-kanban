"use client";
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false); // Giriş/Kayıt modu
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isRegisterMode) {
      // KAYIT OLMA AKIŞI
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        alert("Kayıt Hatası: " + error.message);
      } else {
        alert('Hesap oluşturuldu! Şimdi giriş yapabilirsiniz.');
        setIsRegisterMode(false); // Giriş moduna geri dön
      }
    } else {
      // GİRİŞ YAPMA AKIŞI
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Jürinin istediği özel hata kontrolü
        if (error.message.includes("Invalid login credentials")) {
          alert("Hata: Bu e-posta ile kayıtlı bir hesap bulunamadı veya şifre yanlış.");
        } else {
          alert("Giriş Hatası: " + error.message);
        }
      } else {
        router.push('/');
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '26px', fontWeight: '900', color: '#1e293b' }}>
          TaskFlow {isRegisterMode ? 'Kayıt' : 'Giriş'}
        </h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '32px', fontSize: '14px' }}>
          {isRegisterMode ? 'Hemen ekibe katıl ve yönetmeye başla.' : 'Projelerine kaldığın yerden devam et.'}
        </p>
        
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input 
            type="email" placeholder="E-posta adresi" required
            style={{ padding: '14px', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none', fontSize: '15px' }}
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" placeholder="Şifre" required
            style={{ padding: '14px', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none', fontSize: '15px' }}
            onChange={(e) => setPassword(e.target.value)} 
          />
          
          <button 
            type="submit" disabled={loading}
            style={{ padding: '14px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '16px', transition: '0.2s' }}
          >
            {loading ? 'İşleniyor...' : (isRegisterMode ? 'Hesap Oluştur' : 'Giriş Yap')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#475569' }}>
          {isRegisterMode ? 'Zaten hesabın var mı?' : 'Henüz hesabın yok mu?'}
          <button 
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '700', cursor: 'pointer', marginLeft: '5px' }}
          >
            {isRegisterMode ? 'Giriş Yap' : 'Hemen Kaydol'}
          </button>
        </div>
      </div>
    </div>
  );
}