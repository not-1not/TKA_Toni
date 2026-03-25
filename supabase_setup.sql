-- ==========================================
-- SUPABASE INITIALIZATION SCRIPT
-- ==========================================

-- 1. Create table 'questions'
CREATE TABLE IF NOT EXISTS public.questions (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    question TEXT NOT NULL,
    type TEXT NOT NULL,
    options JSONB,
    answer TEXT,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Clear existing data (optional, remove comment below if you want to wipe before insert)
-- TRUNCATE TABLE public.questions;

-- 3. Insert Database Matematika
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_4fdfa7f6', 'Matematika', 'Rini memiliki 7/15 m pita, Ayaka 12/25 m, dan Diah 15/30 m. Tentukan kebenaran pernyataan.', 'TF', '[{"statement": "Rini mempunyai pita lebih panjang dari Ayaka", "answer": "Salah"}, {"statement": "Diah mempunyai pita lebih panjang dari Rini", "answer": "Benar"}, {"statement": "Ayaka mempunyai pita lebih pendek dari Diah", "answer": "Benar"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_aa478761', 'Matematika', 'Data kesukaan buku siswa: 7/20 novel, 3/12 cerpen, 18% biografi, sisanya ilmiah. Urutan dari paling banyak disukai adalah...', 'MC', '["novel, ilmiah, cerpen, biografi", "novel, ilmiah, biografi, cerpen", "novel, cerpen, biografi, ilmiah", "novel, cerpen, ilmiah, biografi"]'::jsonb, 'D', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_1f312bfe', 'Matematika', 'Kendaraan: 539 sepeda listrik, 19.138 sepeda motor, 10.354 mobil, 696 mikrobus. Tentukan benar atau salah.', 'TF', '[{"statement": "Kendaraan roda dua berjumlah 19.687", "answer": "Benar"}, {"statement": "Kendaraan roda empat berjumlah 11.050", "answer": "Benar"}, {"statement": "Total kendaraan 30.627", "answer": "Benar"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_c7da8639', 'Matematika', 'Data panjang: tali 1,2 dm; pita 0,5 m; pipa 23 cm. Tentukan kebenaran pernyataan.', 'TF', '[{"statement": "Selisih pita dan tali adalah 480 cm", "answer": "Salah"}, {"statement": "Pita lebih panjang daripada tali dan pipa", "answer": "Benar"}, {"statement": "Panjang tali + pipa = 35 cm", "answer": "Benar"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_c7ad1229', 'Matematika', 'Perjalanan Dani dari Gianyar ke Denpasar dan Badung. Lama perjalanan tanpa istirahat adalah...', 'MC', '["2 jam 35 menit", "2 jam 45 menit", "3 jam 35 menit", "3 jam 45 menit"]'::jsonb, 'A', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_062d196e', 'Matematika', 'Data olahraga siswa SD Tunas Harapan Bangsa. Tentukan benar atau salah.', 'TF', '[{"statement": "Renang paling sedikit peminatnya", "answer": "Salah"}, {"statement": "Sepak bola paling digemari", "answer": "Benar"}, {"statement": "Basket + bulu tangkis = 46 siswa", "answer": "Salah"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_52d2ea4c', 'Matematika', 'Yasmin memiliki 56 mawar, 72 melati, 48 bunga matahari. Rangkaian bunga dibuat sama banyak.', 'MCMA', '["Rangkaian maksimal 8", "Setiap rangkaian 9 melati dan 7 mawar", "Setiap rangkaian 7 matahari dan 6 mawar"]'::jsonb, 'A,B', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_129c0d45', 'Matematika', 'Bu Tania membeli 360 bolu, 420 lapis, 540 donat dan membaginya ke kotak sama banyak.', 'TF', '[{"statement": "Setiap kotak 6 bolu dan 8 lapis", "answer": "Salah"}, {"statement": "Setiap kotak 6 bolu dan 9 donat", "answer": "Benar"}, {"statement": "Kotak maksimal 60", "answer": "Benar"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_f2ed0aef', 'Matematika', 'Paket sembako berisi 2,5 kg beras, 10 hg telur, dan dua gula @500 g.', 'TF', '[{"statement": "Total berat 4500 gram", "answer": "Benar"}, {"statement": "Berat telur lebih dari 1 kg", "answer": "Salah"}, {"statement": "Satu gula tidak lebih berat dari telur", "answer": "Benar"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_08804ddc', 'Matematika', 'Irwan bersepeda dengan kecepatan 2 m/detik.', 'TF', '[{"statement": "Jarak 400 m ditempuh 200 detik", "answer": "Benar"}, {"statement": "Jarak 360 m ditempuh 3 menit", "answer": "Benar"}, {"statement": "Jarak 380 m kurang dari 3 menit", "answer": "Salah"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_337fd5b7', 'Matematika', '120% ? 3 + 2 � 0,75 + 2/3 = ...', 'MC', '["11/30", "49/60", "31/30", "98/60"]'::jsonb, 'A', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_2bf25d6c', 'Matematika', 'Harga komik Rp24.000. Buku gambar 1/2 komik, buku tulis 0,75 komik. Setelah diskon 10% harga total adalah...', 'MC', '["18000", "24000", "27000", "30000"]'::jsonb, 'C', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_1b02ce53', 'Matematika', 'Pak Bondan memproduksi susu kedelai dalam 7 wadah masing-masing 6 1/4 liter.', 'TF', '[{"statement": "Total produksi sesuai perhitungan", "answer": "Benar"}, {"statement": "Isi tiap botol besar sesuai perhitungan", "answer": "Benar"}, {"statement": "Total susu botol kecil sesuai perhitungan", "answer": "Salah"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_a94974ca', 'Matematika', 'Pada dadu, jumlah titik pada dua sisi berlawanan sama. Banyak titik pada sisi bawah adalah...', 'MC', '["2", "3", "4", "5"]'::jsonb, 'B', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_caa56b5c', 'Matematika', 'Paket sembako berisi 3 kg beras, 2 gula @5 hg, dan 5 mi @85 g.', 'MCMA', '["Total berat 4425 g", "Berat mi lebih dari 0,5 kg", "Satu gula lebih berat dari semua mi"]'::jsonb, 'A,C', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_44be5858', 'Matematika', 'Data pengunjung perpustakaan selama lima hari.', 'TF', '[{"statement": "Pengunjung Senin setengah Rabu", "answer": "Benar"}, {"statement": "Total pengunjung 100", "answer": "Salah"}, {"statement": "Selisih harian ?5", "answer": "Benar"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_13ba0d33', 'Matematika', 'Piktogram jumlah buku dibaca Rina, Dika, Siti.', 'TF', '[{"statement": "Rina membaca 10 buku", "answer": "Benar"}, {"statement": "Dika lebih sedikit dari Rina", "answer": "Benar"}, {"statement": "Siti membaca 3 buku", "answer": "Salah"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_3ce45419', 'Matematika', 'Lahan 3,5 ha. 1/5 cabai, 1/3 tomat, sisanya daun bawang. Luas tomat + daun bawang...', 'MC', '["1,63", "1,87", "2,33", "2,80"]'::jsonb, 'D', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_1c8fefd5', 'Matematika', 'Bak kubus volume 9 m3 diubah menjadi balok dengan perubahan ukuran.', 'MC', '["4,5", "9", "18", "22,5"]'::jsonb, 'B', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_4dfa559a', 'Matematika', 'Perjalanan Yogya-Semarang 140 km kecepatan 80 km/jam berhenti 15 menit.', 'MC', '["07.45", "08.00", "08.45", "09.00"]'::jsonb, 'B', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_037d8b95', 'Matematika', 'Ulang tahun Lala 14 Juni, sekarang 30 April.', 'TF', '[{"statement": "Menunggu 45 hari", "answer": "Benar"}, {"statement": "Menunggu 6 minggu 3 hari", "answer": "Benar"}, {"statement": "Menunggu dua bulan", "answer": "Salah"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_619b9e9b', 'Matematika', 'Ibu membeli 3 kg buah. Alpukat 1,25 kg sisanya 7 mangga.', 'MC', '["0,2", "0,25", "0,3", "0,35"]'::jsonb, 'B', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_7532912e', 'Matematika', 'Tangki air 0,8 hektoliter.', 'TF', '[{"statement": "Volume 80 liter", "answer": "Benar"}, {"statement": "Bak 20 liter bisa diisi 5 kali", "answer": "Salah"}, {"statement": "10 baris tanaman menghabiskan setengah", "answer": "Benar"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_28ded5e0', 'Matematika', 'Kotak dapat menampung 64 kubus satuan.', 'MCMA', '["8x2x4", "4x4x4", "4x3x5"]'::jsonb, 'A,B', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_63f0e51e', 'Matematika', 'Petunjuk arah kebun binatang.', 'TF', '[{"statement": "Jarak Zebra 6000 mm", "answer": "Salah"}, {"statement": "Capybara ke Kanguru 1500 cm", "answer": "Benar"}, {"statement": "Jerapah ke Kanguru 0,11 km", "answer": "Benar"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bc3a3bfd', 'Matematika', 'Batang rotan 320 cm dipotong 15 cm.', 'MC', '["4", "5", "6", "7"]'::jsonb, 'B', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_fcfc8bf8', 'Matematika', 'Jadwal olahraga 2, 3, dan 4 minggu sekali.', 'MC', '["4", "6", "12", "18"]'::jsonb, 'C', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_73e8ad98', 'Matematika', 'Jika a = 5 ? 7/2 dan b = 3/4 ? 1/2 maka a ? 2b = ...', 'MC', '["1", "1 1/4", "2", "2 1/4"]'::jsonb, 'A', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_4e42dec6', 'Matematika', 'Bagian kue cokelat dari seluruh kue.', 'MC', '["1/8", "1/4", "1/2", "3/4"]'::jsonb, 'B', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_12df687f', 'Matematika', 'Keliling tanah Pak Boni.', 'MC', '["58", "68", "72", "96"]'::jsonb, 'B', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_6ed381be', 'Matematika', 'Jumlah siswa 28, 36, 32 masing-masing mendapat 3 buku. Dus berisi 24 buku.', 'MC', '["8", "10", "12", "24"]'::jsonb, 'C', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_073dd63a', 'Matematika', 'Siapa yang menempuh 3/5 dari 10 km.', 'MC', '["Andi", "Beni", "Citra", "Dika"]'::jsonb, 'B', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_be149dd2', 'Matematika', 'Bangun dengan sisi sama panjang dan diagonal tegak lurus.', 'MC', '["Persegi", "Persegi panjang", "Belah ketupat", "Layang-layang"]'::jsonb, 'C', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_fb41bf6d', 'Matematika', 'Rani berangkat 07.25 perjalanan 45 menit latihan 1j35m istirahat 20 menit.', 'MC', '["09.45", "10.00", "10.05", "10.25"]'::jsonb, 'C', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_c1fb1dd1', 'Matematika', 'Soal parkir mobil taman kota.', 'MC', '["9", "10", "12", "14"]'::jsonb, 'B', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_91cd9145', 'Matematika', 'Kapasitas parkir motor.', 'TF', '[{"statement": "4 motor keluar sebelum 13.00", "answer": "Benar"}, {"statement": "Sebelumnya sudah 8 motor", "answer": "Salah"}, {"statement": "Total pukul 13.00 ada 20", "answer": "Salah"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_3a32c5ef', 'Matematika', 'Persen buku dibaca Caca.', 'MC', '["34%", "50%", "66%", "75%"]'::jsonb, 'D', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_36a19964', 'Matematika', 'Jumlah halaman dibaca siswa.', 'TF', '[{"statement": "Danu membaca 219 halaman", "answer": "Benar"}, {"statement": "Antok membaca 170 halaman", "answer": "Benar"}, {"statement": "Caca membaca 287 halaman", "answer": "Salah"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_260ad381', 'Matematika', 'Makanan yang memenuhi kebutuhan protein anak.', 'MCMA', '["Daging sapi", "Telur ayam", "Ikan"]'::jsonb, 'A,C', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_4bc14be1', 'Matematika', 'Kebutuhan protein dan lemak ibu hamil.', 'TF', '[{"statement": "Tambah 50 g ikan cukup protein", "answer": "Salah"}, {"statement": "Tambah 50 g keju cukup lemak", "answer": "Benar"}, {"statement": "Tambah 50 g daging sapi cukup protein", "answer": "Benar"}]'::jsonb, '', '');

-- 4. Insert Database Bahasa Indonesia
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_95zuouk', 'Bahasa Indonesia', 'Apa watak tokoh utama dalam cerita Angsa Bertelur Emas?', 'MC', '["Berani","Sombong","Serakah","Pembangkang"]'::jsonb, 'C', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_qwtbp6j', 'Bahasa Indonesia', 'Peribahasa yang tepat untuk menggambarkan akhir cerita Angsa Bertelur Emas adalah...', 'MC', '["Makan buah simalakama","Ada udang di balik batu","Seperti katak dalam tempurung","Nasi sudah menjadi bubur"]'::jsonb, 'D', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_prdzuin', 'Bahasa Indonesia', 'Pernyataan yang sesuai dengan cerita Angsa Bertelur Emas adalah...', 'MCMA', '["Petani mendapatkan uang dari penjualan angsa emas","Angsa pernah menghasilkan lebih dari satu telur emas sehari","Keinginan cepat kaya membuat petani menyesal"]'::jsonb, 'B,C', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_x46q13o', 'Bahasa Indonesia', 'Tentukan tepat atau tidak tepat kosakata khusus pada teks pelangi.', 'TF', '[{"statement":"Kata warna termasuk kosakata khusus","answer":"Tidak Tepat"},{"statement":"Kata prisma termasuk kosakata khusus","answer":"Tepat"},{"statement":"Kata optik termasuk kosakata khusus","answer":"Tepat"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_1icfpf9', 'Bahasa Indonesia', 'Makna kata pembiasan dalam teks pelangi adalah...', 'MC', '["Penguraian cahaya menjadi putih","Pemantulan cahaya","Perpaduan warna cahaya","Pembelokan cahaya saat melewati dua medium"]'::jsonb, 'D', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_kpzoq55', 'Bahasa Indonesia', 'Urutan proses pembentukan pelangi yang benar adalah...', 'MC', '["Cahaya mengenai air → pembiasan → pembiasan kedua → pemantulan → pelangi","Cahaya mengenai air → pembiasan → pemantulan → pembiasan kedua → pelangi","Pemantulan → pembiasan → pembiasan kedua → cahaya mengenai air → pelangi","Pemantulan → pembiasan → cahaya mengenai air → pembiasan kedua → pelangi"]'::jsonb, 'B', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_1a1a05z', 'Bahasa Indonesia', 'Pelajaran dari cerita Semut dan Merpati.', 'TF', '[{"statement":"Kita harus saling menolong tanpa mengharapkan balasan","answer":"Sesuai"},{"statement":"Kita boleh membiarkan teman kesulitan","answer":"Tidak Sesuai"},{"statement":"Kebaikan akan dibalas dengan kebaikan","answer":"Sesuai"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_5ynxbhd', 'Bahasa Indonesia', 'Latar tempat dalam cerita Semut dan Merpati adalah...', 'MCMA', '["Di sungai","Di rumah pemburu","Di pasar","Di atas pohon"]'::jsonb, 'A,D', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_lwt0d3w', 'Bahasa Indonesia', 'Alasan lubang membuat humus dibuat di bawah pohon rindang.', 'TF', '[{"statement":"Udara lembap mempercepat pembusukan","answer":"Sesuai"},{"statement":"Pohon menahan air hujan agar daun tidak basah","answer":"Tidak Sesuai"},{"statement":"Pohon menghalangi sinar matahari langsung","answer":"Sesuai"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_v94mip4', 'Bahasa Indonesia', 'Bagan yang sesuai dengan teks tentang humus adalah...', 'MC', '["Pengertian → Asal → Cara membuat → Ciri → Manfaat","Pengertian → Asal → Cara membuat → Manfaat → Ciri","Pengertian → Cara membuat → Asal → Ciri → Manfaat","Pengertian → Asal → Manfaat → Cara membuat → Ciri"]'::jsonb, 'A', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_aqjef7j', 'Bahasa Indonesia', 'Siapa yang mengusulkan meminta bantuan hewan cerdik dalam cerita Danau untuk Semua?', 'MC', '["Bani","Ucil","Rino","Hari"]'::jsonb, 'D', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_3rxczt6', 'Bahasa Indonesia', 'Makna ungkapan diam seribu bahasa adalah...', 'MC', '["Tidak mampu berbuat sesuatu","Menahan diri untuk tidak berbicara","Tidak mau mendengarkan orang lain","Tidak mengetahui masalah"]'::jsonb, 'B', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_fbl4ikg', 'Bahasa Indonesia', 'Peristiwa kehidupan yang sesuai dengan pengalaman Ucil.', 'TF', '[{"statement":"Tita memberi ide cemerlang untuk kelas","answer":"Sesuai"},{"statement":"Jani menghargai kepercayaan teman","answer":"Sesuai"},{"statement":"Nina bertanggung jawab pada tugasnya","answer":"Sesuai"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_9ko9uxs', 'Bahasa Indonesia', 'Contoh hewan folivora adalah...', 'MCMA', '["Sapi","Koala","Panda"]'::jsonb, 'B,C', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_e6vttzw', 'Bahasa Indonesia', 'Gagasan utama paragraf ketiga teks folivora adalah...', 'MC', '["Jenis daun untuk folivora","Pembagian hewan berdasarkan makanan","Cara tubuh folivora mencerna daun","Pentingnya hutan bagi folivora"]'::jsonb, 'C', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_6gysjmu', 'Bahasa Indonesia', 'Bagan yang sesuai dengan teks folivora adalah...', 'MC', '["Tiga kelompok hewan → pengertian folivora → contoh → cara mencerna","Tiga kelompok hewan → contoh → pengertian → cara mencerna","Tiga kelompok hewan → contoh → pengertian → cara mencerna","Tiga kelompok hewan → pengertian folivora → cara mencerna → contoh"]'::jsonb, 'D', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_mpmnjag', 'Bahasa Indonesia', 'Penjelasan Koko tentang anak lembu adalah...', 'MCMA', '["Makhluk itu sangat sombong","Anak lembu tidak jahat","Lembu tidak makan katak"]'::jsonb, 'B,C', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_awvu8pn', 'Bahasa Indonesia', 'Kejadian yang membuat Kenthus menyesal adalah...', 'MC', '["Hampir ditelan lembu","Berlari ke kolam","Mengembang terlalu besar hingga lemas","Dimarahi kakaknya"]'::jsonb, 'C', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_ws5dv19', 'Bahasa Indonesia', 'Reaksi pembaca pada akhir cerita Kenthus.', 'TF', '[{"statement":"Terharu karena Kenthus mengakui kesalahan","answer":"Benar"},{"statement":"Bahagia karena Kenthus berdamai dengan lembu","answer":"Salah"},{"statement":"Antusias karena Kenthus kuat","answer":"Salah"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_anl3328', 'Bahasa Indonesia', 'Makna kata menegangkan dalam surat Margaret Hamilton.', 'MC', '["Membuat waspada","Menghilangkan fokus","Menimbulkan ketakutan","Menimbulkan kekhawatiran karena situasi genting"]'::jsonb, 'D', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_hmu8ql6', 'Bahasa Indonesia', 'Pernyataan yang mendukung ide utama surat tentang kode komputer Apollo 11.', 'MC', '["Kode membawa manusia ke Venus","Kode dibahas setelah rapat","Kode membuat astronaut mendarat aman","Kode mengirim pesan kesalahan"]'::jsonb, 'C', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_nrj19vm', 'Bahasa Indonesia', 'Pelajaran dari pengalaman Margaret Hamilton.', 'TF', '[{"statement":"Ketelitian sangat penting","answer":"Benar"},{"statement":"Proyek luar angkasa memotivasi orang","answer":"Salah"},{"statement":"Tanggung jawab membuat tetap fokus","answer":"Benar"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_dvl3sw4', 'Bahasa Indonesia', 'Benda yang umum digunakan dalam kerajinan adalah...', 'MC', '["Mainan plastik","Cat semprot","Magnet","Gunting"]'::jsonb, 'D', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_v1e5cci', 'Bahasa Indonesia', 'Langkah kedua pembuatan magnet kulkas mendukung tujuan karena...', 'MCMA', '["Menutup permukaan mainan","Memudahkan mewarnai","Menutup lubang agar magnet menempel"]'::jsonb, 'A,C', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_rqvozkp', 'Bahasa Indonesia', 'Mengapa mainan hewan dipotong dua?', 'MC', '["Agar lebih besar","Agar dapat ditempel di kulkas","Agar mudah dicat","Agar mudah diberi lem"]'::jsonb, 'B', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_atqc5c1', 'Bahasa Indonesia', 'Fungsi elektrolit pada air mineral adalah...', 'MC', '["Menjaga tekanan darah","Meningkatkan fungsi jantung","Mencegah dehidrasi","Mempermudah metabolisme"]'::jsonb, 'C', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_x8kocgt', 'Bahasa Indonesia', 'Mengapa air putih cocok diminum setiap saat?', 'MC', '["Sumbernya mudah ditemukan","Kandungannya banyak","Diproses alami","pH lebih tinggi"]'::jsonb, 'A', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_zqx275w', 'Bahasa Indonesia', 'Alasan kata BEDA pada infografis berwarna oranye.', 'TF', '[{"statement":"Menekankan pokok utama","answer":"Benar"},{"statement":"Menonjolkan informasi penting","answer":"Benar"},{"statement":"Menyesuaikan warna favorit pembaca","answer":"Salah"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_c2c6c99', 'Bahasa Indonesia', 'Tokoh yang menyelesaikan keributan antrean adalah...', 'MC', '["Tia","Devi","Kasir","Pak Satpam"]'::jsonb, 'D', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_va6po52', 'Bahasa Indonesia', 'Peristiwa yang dialami Tia dalam cerita.', 'MCMA', '["Mencari dan membeli buku","Dinasihati ibu untuk antre","Menegur pemuda menyerobot antrean"]'::jsonb, 'A,C', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_ja2wk54', 'Bahasa Indonesia', 'Alasan perkataan pemuda tidak dapat dibenarkan.', 'TF', '[{"statement":"Semua orang ingin cepat dilayani","answer":"Mendukung"},{"statement":"Mengantre butuh kesabaran","answer":"Tidak Mendukung"},{"statement":"Aturan antre harus dihormati","answer":"Mendukung"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_lv45b3a', 'Bahasa Indonesia', 'Penyebab gigi berlubang adalah...', 'MC', '["Kerusakan enamel","Enamel lebih lemah","Saraf sensitif","Bakteri menghasilkan asam"]'::jsonb, 'D', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_myyzjok', 'Bahasa Indonesia', 'Akibat gigi tidak dirawat.', 'MCMA', '["Gigi rusak dan berlubang","Mengunyah lebih lama","Ditumbuhi bakteri"]'::jsonb, 'A,C', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_7h28i7n', 'Bahasa Indonesia', 'Fungsi tanda panah pada gambar gigi.', 'TF', '[{"statement":"Mempermudah melihat kondisi gigi","answer":"Salah"},{"statement":"Menunjukkan lapisan gigi","answer":"Benar"},{"statement":"Menjelaskan fungsi setiap gigi","answer":"Salah"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_yi2ynx3', 'Bahasa Indonesia', 'Larik puisi yang menunjukkan kerinduan.', 'MCMA', '["Senyum itu enggan lepas dari bibirmu","Uluran tanganmu menyambutku","Maafmu selalu terbuka untukku"]'::jsonb, 'A,B', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_iofrdi3', 'Bahasa Indonesia', 'Makna larik kesetiaan yang tak akan pernah lekang oleh masa.', 'MC', '["Simbol dukungan","Ungkapan kebahagiaan","Rasa syukur","Hubungan abadi meski waktu memisahkan"]'::jsonb, 'D', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_fcol3er', 'Bahasa Indonesia', 'Pesan yang ingin disampaikan dalam puisi.', 'MC', '["Harus selalu mengalah","Persahabatan di atas keluarga","Persahabatan butuh pengertian dan kesetiaan","Persahabatan sering gagal"]'::jsonb, 'C', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_g3aow9q', 'Bahasa Indonesia', 'Kerupuk yang sudah dikonsumsi sejak lama adalah...', 'MC', '["Rengginang","Melarat","Rambak","Gendar"]'::jsonb, 'C', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_oiapm8i', 'Bahasa Indonesia', 'Alasan kerupuk Indonesia mendunia.', 'TF', '[{"statement":"Nilai ekspor puluhan juta dolar","answer":"Benar"},{"statement":"Ada sejak abad 9-10","answer":"Salah"},{"statement":"Dikirim lebih dari 20 juta kg","answer":"Benar"}]'::jsonb, '', '');
INSERT INTO public.questions (id, subject, question, type, options, answer, image)
VALUES ('q_bi_7dkkkoz', 'Bahasa Indonesia', 'Fungsi gambar berbagai kerupuk pada infografis.', 'TF', '[{"statement":"Menunjukkan ragam kerupuk","answer":"Benar"},{"statement":"Memberi informasi jenis kerupuk","answer":"Benar"},{"statement":"Menjelaskan bahan kerupuk","answer":"Salah"}]'::jsonb, '', '');
