# TaskFlow Kanban

Modern yazılım ekipleri için tasarlanmış, kullanıcı bazlı sürükle-bırak görev yönetim aracı.

## 🚀 Özellikler
- **Kullanıcı Kimlik Doğrulama:** Supabase Auth ile güvenli giriş ve kayıt.
- **Kişiselleştirilmiş Veri:** Her kullanıcı sadece kendi oluşturduğu görevleri görür (RLS kuralı).
- **Gelişmiş Sürükle-Bırak:** `dnd-kit` kullanılarak optimize edilmiş, takılmayan sürükleme deneyimi.
- **Mobil Uyumluluk:** Mobil cihazlarda yatay kaydırma ve uzun basma (250ms) ile sürükleme desteği.
- **Kalıcı Veri:** Sayfa yenilense dahi kartların sırası ve durumu korunur.

## 🛠️ Teknik Stack
- **Framework:** Next.js (App Router)
- **Database & Auth:** Supabase (PostgreSQL)
- **Drag & Drop:** @dnd-kit
- **Deployment:** Vercel

## ⚙️ Kurulum
1. Gerekli paketleri yükleyin: `npm install`
2. `.env.local` dosyanıza Supabase URL ve KEY bilgilerinizi ekleyin.
3. Uygulamayı başlatın: `npm run dev`

## 🧠 Neden dnd-kit?
Projeyi geliştirirken `react-beautiful-dnd` yerine `dnd-kit` tercih edilmiştir. Nedeni; modern olması, SSR desteği ve mobil sensör konfigürasyonundaki esnekliğidir.

## 🧠 Öğrenme Süreci ve Zorluklar
Bu proje, web geliştirme ve JavaScript ekosistemiyle ilk tanışmamdır. 
Geliştirme sürecinde Next.js mimarisi, Supabase ile Backend yönetimi ve karmaşık sürükle-bırak algoritmaları üzerinde çalışılarak; 
modern araçların yardımıyla kısa sürede teknik bir adaptasyon sağlanmıştır.