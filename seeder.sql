-- ============================================================
-- SEEDER DATA - CMS Gobana Company / Nooraah Beauty
-- Database : db_pt_gibran
-- Cara jalankan di PowerShell:
--   Get-Content seeder.sql | docker exec -i dev_mysql mysql -uroot -prootpassword db_pt_gibran
-- ============================================================

USE db_pt_gibran;

-- ------------------------------------------------------------
-- 1. USERS
-- password: admin123 (bcrypt 12 rounds)
-- ------------------------------------------------------------
INSERT INTO `users` (`username`, `email`, `password`, `created_at`, `updated_at`) VALUES
('admin', 'admin@nooraahbeauty.com', '$2b$12$QMzxhb7Q40ha9dZGIKXF/.tOCo/rof9CdtWN5qAvrrJTQgm5tUyRK', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `email`      = VALUES(`email`),
  `password`   = VALUES(`password`),
  `updated_at` = NOW();

-- ------------------------------------------------------------
-- 2. ABOUT US (tidak ada kolom created_at)
-- ------------------------------------------------------------
INSERT INTO `about_us` (`company_name`, `description`, `vision`, `mission`, `address`, `phone`, `email`, `updated_at`)
VALUES (
  'Nooraah Beauty',
  'Nooraah Beauty adalah brand kecantikan yang hadir untuk memenuhi kebutuhan perawatan kulit wajah dan tubuh wanita modern Indonesia. Kami berkomitmen menghadirkan produk berkualitas tinggi dengan bahan-bahan pilihan yang aman dan telah teruji secara dermatologis.',
  'Menjadi brand kecantikan terpercaya nomor satu di Indonesia yang menginspirasi setiap wanita untuk tampil percaya diri dengan produk perawatan halal dan berkualitas premium.',
  'Menghadirkan produk kecantikan inovatif berbahan alami yang aman, efektif, dan terjangkau. Memberikan pelayanan terbaik kepada pelanggan dan mitra bisnis. Mendukung pertumbuhan UMKM kecantikan lokal Indonesia.',
  'Jl. Kecantikan Indah No. 88, Kelurahan Cantik, Kecamatan Sehat, Kota Jakarta Selatan 12345',
  '+62 858-6918-7340',
  'info@nooraahbeauty.com',
  NOW()
)
ON DUPLICATE KEY UPDATE
  `company_name` = VALUES(`company_name`),
  `description`  = VALUES(`description`),
  `vision`       = VALUES(`vision`),
  `mission`      = VALUES(`mission`),
  `address`      = VALUES(`address`),
  `phone`        = VALUES(`phone`),
  `email`        = VALUES(`email`),
  `updated_at`   = NOW();

-- ------------------------------------------------------------
-- 3. CATEGORIES
-- ------------------------------------------------------------
INSERT IGNORE INTO `categories` (`name`, `slug`, `type`, `created_at`, `updated_at`) VALUES
('Perawatan Wajah',    'perawatan-wajah',        'PRODUCT', NOW(), NOW()),
('Perawatan Tubuh',    'perawatan-tubuh',        'PRODUCT', NOW(), NOW()),
('Make Up',            'make-up',                'PRODUCT', NOW(), NOW()),
('Perawatan Rambut',   'perawatan-rambut',       'PRODUCT', NOW(), NOW()),
('Suplemen & Minuman', 'suplemen-dan-minuman',   'PRODUCT', NOW(), NOW()),
('Berita Perusahaan',  'berita-perusahaan',      'NEWS',    NOW(), NOW()),
('Tips Kecantikan',    'tips-kecantikan',        'NEWS',    NOW(), NOW()),
('Promo & Event',      'promo-dan-event',        'NEWS',    NOW(), NOW()),
('Portofolio', 'portofolio', 'NEWS', NOW(), NOW());
-- ------------------------------------------------------------
-- 4. PRODUCTS
-- (category_id mengacu ke urutan insert di atas)
-- ------------------------------------------------------------
INSERT IGNORE INTO `products` (`category_id`, `name`, `slug`, `description`, `price`, `image`, `is_active`, `created_at`, `updated_at`)
SELECT c.id, p.name, p.slug, p.description, p.price, NULL, 1, NOW(), NOW()
FROM (
  SELECT 'Perawatan Wajah' AS cat, 'Nooraah Brightening Serum'        AS name, 'nooraah-brightening-serum'        AS slug, 'Serum pencerah wajah dengan kandungan Vitamin C 20% dan Niacinamide. Membantu mencerahkan kulit kusam dan menyamarkan noda hitam dalam 2 minggu pemakaian rutin.'                   AS description, 185000.00 AS price UNION ALL
  SELECT 'Perawatan Wajah', 'Nooraah Hydra Toner',             'nooraah-hydra-toner',             'Toner pelembab intensif dengan kandungan Hyaluronic Acid dan Centella Asiatica. Cocok untuk semua jenis kulit dan membantu menjaga kelembaban kulit sepanjang hari.',               95000.00  UNION ALL
  SELECT 'Perawatan Wajah', 'Nooraah Anti-Acne Gel',           'nooraah-anti-acne-gel',           'Gel anti jerawat dengan formula Salicylic Acid 2% yang efektif membantu mengeringkan jerawat dan mencegah timbulnya jerawat baru. Tanpa rasa lengket di kulit.',                     110000.00 UNION ALL
  SELECT 'Perawatan Wajah', 'Nooraah Sunscreen SPF 50+',       'nooraah-sunscreen-spf-50',        'Tabir surya ringan dengan perlindungan SPF 50+ PA++++ dari sinar UVA dan UVB. Tekstur lightweight, tidak berminyak, dan cocok dipakai sebagai base makeup.',                         130000.00 UNION ALL
  SELECT 'Perawatan Wajah', 'Nooraah Moisturizing Cream',      'nooraah-moisturizing-cream',      'Krim pelembab harian dengan kandungan Ceramide dan Aloe Vera yang menjaga kelembaban kulit selama 24 jam. Cocok untuk kulit kering dan sensitif.',                                  145000.00 UNION ALL
  SELECT 'Perawatan Tubuh', 'Nooraah Body Lotion Glow',        'nooraah-body-lotion-glow',        'Losion tubuh dengan kandungan Glutathione dan Vitamin E yang membantu mencerahkan dan melembutkan kulit tubuh. Aroma floral yang lembut tahan lama.',                               89000.00  UNION ALL
  SELECT 'Perawatan Tubuh', 'Nooraah Scrub Kopi Susu',         'nooraah-scrub-kopi-susu',         'Lulur scrub tubuh dengan bahan utama kopi robusta dan susu kambing pilihan. Efektif mengangkat sel kulit mati, mencerahkan, dan melembabkan kulit tubuh.',                           75000.00  UNION ALL
  SELECT 'Perawatan Tubuh', 'Nooraah Body Butter',             'nooraah-body-butter',             'Pelembab tubuh bertekstur creamy kaya kandungan Shea Butter dan Minyak Argan yang menutrisi kulit kering secara mendalam. Cocok digunakan setelah mandi.',                           115000.00 UNION ALL
  SELECT 'Make Up',         'Nooraah Lip Cream Matte',         'nooraah-lip-cream-matte',         'Lip cream dengan formula matte long-lasting yang tahan hingga 12 jam. Tersedia dalam 12 pilihan warna trendi. Formula ringan, tidak membuat bibir kering.',                           65000.00  UNION ALL
  SELECT 'Make Up',         'Nooraah BB Cushion',              'nooraah-bb-cushion',              'BB Cushion dengan coverage medium yang memberikan tampilan kulit natural sehat. Dilengkapi SPF 30 dan kandungan Hyaluronic Acid untuk menjaga kelembaban kulit.',                      155000.00 UNION ALL
  SELECT 'Perawatan Rambut','Nooraah Hair Serum Keratin',      'nooraah-hair-serum-keratin',      'Serum rambut dengan kandungan Keratin dan Argan Oil yang membantu melembutkan, menghaluskan, dan mengurangi frizz pada rambut rusak akibat panas dan bahan kimia.',                  125000.00 UNION ALL
  SELECT 'Perawatan Rambut','Nooraah Shampoo Hairfall Control','nooraah-shampoo-hairfall-control', 'Sampo anti rontok dengan kandungan Biotin, Caffeine, dan ekstrak Ginseng. Memperkuat akar rambut dari dalam dan mengurangi kerontokan secara signifikan.',                         95000.00  UNION ALL
  SELECT 'Suplemen & Minuman','Nooraah Collagen Drink',        'nooraah-collagen-drink',          'Minuman kolagen premium dengan kandungan Marine Collagen 5000mg, Vitamin C, dan Biotin. Membantu menjaga elastisitas kulit, rambut, dan kuku dari dalam.',                           210000.00 UNION ALL
  SELECT 'Suplemen & Minuman','Nooraah Glowing Supplement',    'nooraah-glowing-supplement',      'Suplemen kecantikan dengan formula sinergis Glutathione, Vitamin E, dan Zinc yang membantu mencerahkan kulit dari dalam dan meningkatkan sistem imun tubuh.',                        175000.00
) AS p
JOIN `categories` c ON c.name = p.cat;

-- ------------------------------------------------------------
-- 5. NEWS
-- ------------------------------------------------------------
INSERT IGNORE INTO `news` (`category_id`, `title`, `slug`, `content`, `image`, `is_published`, `created_at`, `updated_at`)
SELECT c.id, n.title, n.slug, n.content, NULL, 1, NOW(), NOW()
FROM (
  SELECT 'Berita Perusahaan' AS cat,
    'Nooraah Beauty Resmi Luncurkan Lini Perawatan Wajah Terbaru 2026' AS title,
    'nooraah-beauty-luncurkan-lini-perawatan-wajah-terbaru-2026' AS slug,
    '<p>Nooraah Beauty dengan bangga mengumumkan peluncuran lini perawatan wajah terbaru yang dirancang khusus untuk iklim tropis Indonesia. Rangkaian produk baru ini mencakup serum, toner, moisturizer, dan sunscreen yang diformulasikan dengan bahan-bahan aktif premium pilihan.</p><p>Seluruh produk dalam lini terbaru ini telah melalui uji dermatologis ketat dan tersertifikasi halal BPOM.</p>' AS content
  UNION ALL
  SELECT 'Tips Kecantikan',
    '5 Langkah Skincare Rutin Pagi Hari untuk Kulit Sehat Bercahaya',
    '5-langkah-skincare-rutin-pagi-hari-untuk-kulit-sehat-bercahaya',
    '<p>Memiliki kulit sehat dan bercahaya bukan sekadar impian jika Anda menerapkan rutinitas skincare yang tepat setiap pagi. Berikut adalah 5 langkah wajib yang direkomendasikan oleh tim ahli Nooraah Beauty.</p><ol><li><strong>Pembersih Wajah</strong> - Mulai pagi dengan membersihkan wajah menggunakan facial wash yang lembut.</li><li><strong>Toner</strong> - Gunakan Nooraah Hydra Toner untuk menyeimbangkan pH kulit.</li><li><strong>Serum</strong> - Aplikasikan Nooraah Brightening Serum untuk nutrisi intensif.</li><li><strong>Moisturizer</strong> - Kunci kelembaban dengan Nooraah Moisturizing Cream.</li><li><strong>Sunscreen</strong> - Aplikasikan Nooraah Sunscreen SPF 50+ sebelum beraktivitas.</li></ol>'
  UNION ALL
  SELECT 'Promo & Event',
    'Promo Spesial Harbolnas 12.12 - Diskon Hingga 50% untuk Semua Produk',
    'promo-spesial-harbolnas-1212-diskon-hingga-50-persen',
    '<p>Rayakan Hari Belanja Online Nasional bersama Nooraah Beauty! Dapatkan diskon eksklusif hingga 50% untuk seluruh rangkaian produk unggulan kami.</p><p>Promo berlaku mulai 12 Desember 2026 pukul 00.00 hingga 23.59 WIB. Tersedia di semua platform marketplace resmi Nooraah Beauty: Shopee, Tokopedia, dan Lazada.</p>'
  UNION ALL
  SELECT 'Berita Perusahaan',
    'Nooraah Beauty Raih Penghargaan Best Local Beauty Brand 2026',
    'nooraah-beauty-raih-penghargaan-best-local-beauty-brand-2026',
    '<p>Nooraah Beauty berhasil meraih penghargaan bergengsi sebagai "Best Local Beauty Brand 2026" dari Beauty Awards Indonesia. Penghargaan ini diberikan atas inovasi produk, kualitas bahan baku, dan kontribusi positif terhadap industri kecantikan lokal Indonesia.</p>'
  UNION ALL
  SELECT 'Tips Kecantikan',
    'Cara Mengatasi Kulit Kusam di Musim Hujan dengan Produk Nooraah',
    'cara-mengatasi-kulit-kusam-di-musim-hujan-dengan-produk-nooraah',
    '<p>Musim hujan seringkali membuat kulit terasa lebih kusam dan lembab. Kelembaban udara yang tinggi dapat memicu produksi minyak berlebih dan menyumbat pori-pori. Berikut tips dari tim beauty expert Nooraah untuk menjaga kulit tetap cerah dan sehat di musim hujan.</p><p>Kunci utama adalah menjaga kebersihan kulit dengan double cleansing, menggunakan toner berbahan aktif seperti AHA/BHA untuk eksfoliasi lembut, dan tidak pernah melewatkan sunscreen meski cuaca mendung.</p>'
) AS n
JOIN `categories` c ON c.name = n.cat;

-- ------------------------------------------------------------
-- 6. VENDORS
-- ------------------------------------------------------------
INSERT IGNORE INTO `vendors` (`name`, `logo`, `address`, `contact`, `created_at`, `updated_at`) VALUES
('PT Kosmetika Utama Indonesia',   NULL, 'Jl. Industri Kimia No. 15, Karawang, Jawa Barat 41311',   '0267-8881234', NOW(), NOW()),
('Supplier Bahan Aktif Premium',   NULL, 'Jl. Hayam Wuruk No. 72, Jakarta Barat 11140',             '021-6321234',  NOW(), NOW()),
('Percetakan & Packaging Cantik',  NULL, 'Jl. Raya Bekasi Km. 25, Bekasi Timur 17113',              '021-88991234', NOW(), NOW()),
('Distributor Nasional Nooraah',   NULL, 'Jl. Gatot Subroto No. 120, Jakarta Selatan 12930',        '021-52901234', NOW(), NOW()),
('PT Laboratorium Derma Test',     NULL, 'Jl. Cihampelas No. 55, Bandung, Jawa Barat 40116',        '022-20391234', NOW(), NOW()),
('Mitra Logistik Express',         NULL, 'Jl. Mangga Dua Raya No. 8, Jakarta Utara 14430',          '021-62311234', NOW(), NOW());

-- ------------------------------------------------------------
-- VERIFIKASI
-- ------------------------------------------------------------
SELECT 'users'      AS tabel, COUNT(*) AS total FROM users      UNION ALL
SELECT 'about_us'   AS tabel, COUNT(*) AS total FROM about_us   UNION ALL
SELECT 'categories' AS tabel, COUNT(*) AS total FROM categories UNION ALL
SELECT 'products'   AS tabel, COUNT(*) AS total FROM products   UNION ALL
SELECT 'news'       AS tabel, COUNT(*) AS total FROM news       UNION ALL
SELECT 'vendors'    AS tabel, COUNT(*) AS total FROM vendors;
