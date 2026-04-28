# TaskFlow Kanban

Modern yazılım ekipleri için tasarlanmış, kullanıcı bazlı sürükle-bırak görev yönetim aracı.

## Özellikler
- **Kullanıcı Kimlik Doğrulama:** Supabase Auth ile güvenli giriş ve kayıt.
- **Kişiselleştirilmiş Veri:** Her kullanıcı sadece kendi oluşturduğu görevleri görür (RLS kuralı).
- **Gelişmiş Sürükle-Bırak:** `dnd-kit` kullanılarak optimize edilmiş, takılmayan sürükleme deneyimi.
- **Mobil Uyumluluk:** Mobil cihazlarda yatay kaydırma ve uzun basma (250ms) ile sürükleme desteği.
- **Kalıcı Veri:** Sayfa yenilense dahi kartların sırası ve durumu korunur.

## Teknik Stack
- **Framework:** Next.js (App Router)
- **Database & Auth:** Supabase (PostgreSQL)
- **Drag & Drop:** @dnd-kit
- **Deployment:** Vercel

## Kurulum
1. Gerekli paketleri yükleyin: `npm install`
2. `.env.local` dosyanıza Supabase URL ve KEY bilgilerinizi ekleyin.
3. Uygulamayı başlatın: `npm run dev`

## Neden dnd-kit?
Projeyi geliştirirken `react-beautiful-dnd` yerine `dnd-kit` tercih edilmiştir. Nedeni; modern olması, SSR desteği ve mobil sensör konfigürasyonundaki esnekliğidir.

## Öğrenme Süreci ve Mühendislik Yaklaşımı
Bu proje, web geliştirme ve JavaScript ekosistemiyle ilk tanışmam olmuştur. Proje gereksinimlerini karşılamak adına daha önce deneyimim olmayan Next.js, Supabase ve dnd-kit gibi teknolojilere sıfırdan adaptasyon sağlanmıştır.

Proje gereksinimlerini karşılayacak teknik birikime sahip olmadığım için geliştirme sürecinde modern mühendislik araçlarından ve yapay zekadan (AI) aktif bir şekilde yararlanılmıştır. Bu yaklaşım sayesinde;

- **Kod Üretimi:** Projedeki fonksiyonel yapılar ve algoritmalar, tasarım hedeflerim doğrultusunda yapay zekaya yazdırılmış; ardından bu kodlar üzerinde tersine mühendislik yapılarak çalışma mantığı kavranmıştır.

- **Hızlı Adaptasyon:** Hiç bilinmeyen bir teknoloji yığınının (Next.js, Supabase, dnd-kit), AI rehberliğiyle ne kadar sürede çalışan bir ürüne dönüştürülebileceği test edilmiştir.

- **Kontrol ve Öğrenme:** Üretilen her kod parçası tek tek incelenerek; state yönetimi, veritabanı güvenliği ve sürükle-bırak sensör konfigürasyonları gibi kritik konularda teorik ve pratik bilgi edinilmiştir.

Bu süreç benim için sadece bir kod yazma aşaması değil; yeni teknolojileri hızlıca öğrenme, dökümante etme ve modern mühendislik araçlarını verimli kullanma yetkinliğimi kanıtlama süreci olmuştur.

Bu şeffaf yaklaşımımın, modern bir mühendisin karşılaştığı yabancı bir problemi çözmek için teknolojik imkanları nasıl en verimli şekilde kullanabileceğine dair bir örnek olmasını amaçlıyorum.