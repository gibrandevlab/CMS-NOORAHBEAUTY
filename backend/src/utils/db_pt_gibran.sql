SET SESSION sql_require_primary_key = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_pt_gibran`
--

-- --------------------------------------------------------

--
-- Table structure for table `about_us`
--

CREATE TABLE `about_us` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_name` varchar(255) NOT NULL DEFAULT 'PT Gibran',
  `description` longtext,
  `vision` text,
  `mission` text,
  `address` text,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `about_us`
--

INSERT INTO `about_us` (`id`, `company_name`, `description`, `vision`, `mission`, `address`, `phone`, `email`, `updated_at`) VALUES
(1, 'Nooraah Beauty', 'Nooraah Beauty adalah brand kecantikan yang hadir untuk memenuhi kebutuhan perawatan kulit wajah dan tubuh wanita modern Indonesia. Kami berkomitmen menghadirkan produk berkualitas tinggi dengan bahan-bahan pilihan yang aman dan telah teruji secara dermatologis.', 'Menjadi brand kecantikan terpercaya nomor satu di Indonesia yang menginspirasi setiap wanita untuk tampil percaya diri dengan produk perawatan halal dan berkualitas premium.', 'Menghadirkan produk kecantikan inovatif berbahan alami yang aman, efektif, dan terjangkau. Memberikan pelayanan terbaik kepada pelanggan dan mitra bisnis. Mendukung pertumbuhan UMKM kecantikan lokal Indonesia.', 'Jl. Kecantikan Indah No. 88, Jakarta Selatan 12345', '021-5551234', 'info@nooraahbeauty.com', '2026-09-14 06:33:25');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `type` enum('NEWS','PRODUCT') NOT NULL DEFAULT 'NEWS',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `type`, `created_at`, `updated_at`) VALUES
(1, 'Konstruksi & Bangunan', 'konstruksi-bangunan', 'PRODUCT', '2026-09-12 18:52:10', '2026-09-12 18:52:10'),
(2, 'Desain Arsitektur', 'desain-arsitektur', 'PRODUCT', '2026-09-12 18:52:10', '2026-09-12 18:52:10'),
(3, 'Berita Perusahaan', 'berita-perusahaan', 'NEWS', '2026-09-12 18:52:10', '2026-09-12 18:52:10'),
(4, 'Pengumuman', 'pengumuman', 'NEWS', '2026-09-12 18:52:10', '2026-09-12 18:52:10'),
(5, 'Perawatan Wajah', 'perawatan-wajah', 'PRODUCT', '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(6, 'Perawatan Tubuh', 'perawatan-tubuh', 'PRODUCT', '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(7, 'Make Up', 'make-up', 'PRODUCT', '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(8, 'Perawatan Rambut', 'perawatan-rambut', 'PRODUCT', '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(9, 'Suplemen & Minuman', 'suplemen-dan-minuman', 'PRODUCT', '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(10, 'Tips Kecantikan', 'tips-kecantikan', 'NEWS', '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(11, 'Promo & Event', 'promo-dan-event', 'NEWS', '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(14, 'Portofolio', 'portofolio', 'NEWS', '2026-09-14 06:24:43', '2026-09-14 06:24:43'),
(15, 'test 123', 'testing-123', 'PRODUCT', '2026-09-14 08:02:56', '2026-09-14 08:02:56'),
(16, 'test 123', 'awdwadawd', 'NEWS', '2026-09-14 08:03:16', '2026-09-14 08:03:16');

-- --------------------------------------------------------

--
-- Table structure for table `news`
--

CREATE TABLE `news` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `fk_news_category` (`category_id`),
  KEY `idx_news_published` (`is_published`),
  CONSTRAINT `fk_news_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `news`
--

INSERT INTO `news` (`id`, `category_id`, `title`, `slug`, `content`, `image`, `is_published`, `created_at`, `updated_at`) VALUES
(1, 8, 'Nooraah Beauty Raih Penghargaan Best Local Beauty Brand 2026', 'nooraah-beauty-raih-penghargaan-best-local-beauty-brand-2026', '<p>Nooraah Beauty berhasil meraih penghargaan bergengsi sebagai \"Best Local Beauty Brand 2026\" dari Beauty Awards Indonesia. Penghargaan ini diberikan atas inovasi produk, kualitas bahan baku, dan kontribusi positif terhadap industri kecantikan lokal Indonesia.</p>', NULL, 1, '2026-09-14 00:56:49', '2026-09-14 07:09:26'),
(2, 3, 'Nooraah Beauty Resmi Luncurkan Lini Perawatan Wajah Terbaru 2026', 'nooraah-beauty-luncurkan-lini-perawatan-wajah-terbaru-2026', '<p>Nooraah Beauty dengan bangga mengumumkan peluncuran lini perawatan wajah terbaru yang dirancang khusus untuk iklim tropis Indonesia. Rangkaian produk baru ini mencakup serum, toner, moisturizer, dan sunscreen yang diformulasikan dengan bahan-bahan aktif premium pilihan.</p><p>Seluruh produk dalam lini terbaru ini telah melalui uji dermatologis ketat dan tersertifikasi halal BPOM.</p>', '/uploads/nooraah-beauty-luncurkan-lini-perawatan-wajah-terbaru-2026#1.jpg', 1, '2026-09-14 00:56:49', '2026-09-14 06:22:49'),
(3, 10, 'Cara Mengatasi Kulit Kusam di Musim Hujan dengan Produk Nooraah', 'cara-mengatasi-kulit-kusam-di-musim-hujan-dengan-produk-nooraah', '<p>Musim&nbsp;hujan&nbsp;seringkali&nbsp;membuat&nbsp;kulit&nbsp;terasa&nbsp;lebih&nbsp;kusam&nbsp;dan&nbsp;lembab.&nbsp;Kelembaban&nbsp;udara&nbsp;yang&nbsp;tinggi&nbsp;dapat&nbsp;memicu&nbsp;produksi&nbsp;minyak&nbsp;berlebih&nbsp;dan&nbsp;menyumbat&nbsp;pori-pori.&nbsp;Berikut&nbsp;tips&nbsp;dari&nbsp;tim&nbsp;beauty&nbsp;expert&nbsp;Nooraah&nbsp;untuk&nbsp;menjaga&nbsp;kulit&nbsp;tetap&nbsp;cerah&nbsp;dan&nbsp;sehat&nbsp;di&nbsp;musim&nbsp;hujan.</p><p>Kunci&nbsp;utama&nbsp;adalah&nbsp;menjaga&nbsp;kebersihan&nbsp;kulit&nbsp;dengan&nbsp;double&nbsp;cleansing,&nbsp;menggunakan&nbsp;toner&nbsp;berbahan&nbsp;aktif&nbsp;seperti&nbsp;AHA/BHA&nbsp;untuk&nbsp;eksfoliasi&nbsp;lembut,&nbsp;dan&nbsp;tidak&nbsp;pernah&nbsp;melewatkan&nbsp;sunscreen&nbsp;meski&nbsp;cuaca&nbsp;mendung.</p>', '/uploads/cara-mengatasi-kulit-kusam-di-musim-hujan-dengan-produk-nooraah#1.jpg', 1, '2026-09-14 00:56:49', '2026-09-14 06:22:21'),
(4, 14, '5 Langkah Skincare Rutin Pagi Hari untuk Kulit Sehat Bercahaya', '5-langkah-skincare-rutin-pagi-hari-untuk-kulit-sehat-bercahaya', '<p>Memiliki kulit sehat dan bercahaya bukan sekadar impian jika Anda menerapkan rutinitas skincare yang tepat setiap pagi. Berikut adalah 5 langkah wajib yang direkomendasikan oleh tim ahli Nooraah Beauty.</p><ol><li><strong>Pembersih Wajah</strong> - Mulai pagi dengan membersihkan wajah menggunakan facial wash yang lembut.</li><li><strong>Toner</strong> - Gunakan Nooraah Hydra Toner untuk menyeimbangkan pH kulit.</li><li><strong>Serum</strong> - Aplikasikan Nooraah Brightening Serum untuk nutrisi intensif.</li><li><strong>Moisturizer</strong> - Kunci kelembaban dengan Nooraah Moisturizing Cream.</li><li><strong>Sunscreen</strong> - Aplikasikan Nooraah Sunscreen SPF 50+ sebelum beraktivitas.</li></ol>', '/uploads/5-langkah-skincare-rutin-pagi-hari-untuk-kulit-sehat-bercahaya#1.jpg', 1, '2026-09-14 00:56:49', '2026-09-14 07:03:01'),
(5, 11, 'Promo Spesial Harbolnas 12.12 - Diskon Hingga 50% untuk Semua Produk', 'promo-spesial-harbolnas-1212-diskon-hingga-50-persen', '<p>Rayakan&nbsp;Hari&nbsp;Belanja&nbsp;Online&nbsp;Nasional&nbsp;bersama&nbsp;Nooraah&nbsp;Beauty!&nbsp;Dapatkan&nbsp;diskon&nbsp;eksklusif&nbsp;hingga&nbsp;50%&nbsp;untuk&nbsp;seluruh&nbsp;rangkaian&nbsp;produk&nbsp;unggulan&nbsp;kami.</p><p>Promo&nbsp;berlaku&nbsp;mulai&nbsp;12&nbsp;Desember&nbsp;2026&nbsp;pukul&nbsp;00.00&nbsp;hingga&nbsp;23.59&nbsp;WIB.&nbsp;Tersedia&nbsp;di&nbsp;semua&nbsp;platform&nbsp;marketplace&nbsp;resmi&nbsp;Nooraah&nbsp;Beauty:&nbsp;Shopee,&nbsp;Tokopedia,&nbsp;dan&nbsp;Lazada.&nbsp;</p>', '/uploads/promo-spesial-harbolnas-1212-diskon-hingga-50-persen#1.jpg', 0, '2026-09-14 00:56:49', '2026-09-14 08:04:47'),
(13, 16, '123qeq2e', '123qeq2e', '<p>awdawd<img src=\"http://localhost:3000/uploads/berita%234.jpg\"></p>', '/uploads/123qeq2e#1.jpg', 1, '2026-09-14 08:22:39', '2026-09-14 08:22:39'),
(14, 14, 'tesrtttttt', 'tesrtttttt', '<p>bvuh</p>', '/uploads/berita#5.jpg', 1, '2026-09-14 08:34:23', '2026-09-14 08:34:23');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(15,2) DEFAULT '0.00',
  `image` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `fk_product_category` (`category_id`),
  KEY `idx_products_active` (`is_active`),
  CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `description`, `price`, `image`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 5, 'Nooraah Brightening Serum', 'nooraah-brightening-serum', 'Serum pencerah wajah dengan kandungan Vitamin C 20% dan Niacinamide. Membantu mencerahkan kulit kusam dan menyamarkan noda hitam dalam 2 minggu pemakaian rutin.', 185000.00, NULL, 1, '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(2, 5, 'Nooraah Hydra Toner', 'nooraah-hydra-toner', 'Toner pelembab intensif dengan kandungan Hyaluronic Acid dan Centella Asiatica. Cocok untuk semua jenis kulit dan membantu menjaga kelembaban kulit sepanjang hari.', 95000.00, NULL, 1, '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(3, 5, 'Nooraah Anti-Acne Gel', 'nooraah-anti-acne-gel', 'Gel anti jerawat dengan formula Salicylic Acid 2% yang efektif membantu mengeringkan jerawat dan mencegah timbulnya jerawat baru. Tanpa rasa lengket di kulit.', 110000.00, NULL, 1, '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(4, 5, 'Nooraah Sunscreen SPF 50+', 'nooraah-sunscreen-spf-50', 'Tabir surya ringan dengan perlindungan SPF 50+ PA++++ dari sinar UVA dan UVB. Tekstur lightweight, tidak berminyak, dan cocok dipakai sebagai base makeup.', 130000.00, NULL, 1, '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(5, 5, 'Nooraah Moisturizing Cream', 'nooraah-moisturizing-cream', 'Krim pelembab harian dengan kandungan Ceramide dan Aloe Vera yang menjaga kelembaban kulit selama 24 jam. Cocok untuk kulit kering dan sensitif.', 145000.00, NULL, 1, '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(6, 6, 'Nooraah Body Lotion Glow', 'nooraah-body-lotion-glow', 'Losion tubuh dengan kandungan Glutathione dan Vitamin E yang membantu mencerahkan dan melembutkan kulit tubuh. Aroma floral yang lembut tahan lama.', 89000.00, NULL, 1, '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(7, 6, 'Nooraah Scrub Kopi Susu', 'nooraah-scrub-kopi-susu', 'Lulur scrub tubuh dengan bahan utama kopi robusta dan susu kambing pilihan. Efektif mengangkat sel kulit mati, mencerahkan, dan melembabkan kulit tubuh.', 75000.00, NULL, 1, '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(8, 6, 'Nooraah Body Butter', 'nooraah-body-butter', 'Pelembab tubuh bertekstur creamy kaya kandungan Shea Butter dan Minyak Argan yang menutrisi kulit kering secara mendalam. Cocok digunakan setelah mandi.', 115000.00, NULL, 1, '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(9, 7, 'Nooraah Lip Cream Matte', 'nooraah-lip-cream-matte', 'Lip cream dengan formula matte long-lasting yang tahan hingga 12 jam. Tersedia dalam 12 pilihan warna trendi. Formula ringan, tidak membuat bibir kering.', 65000.00, NULL, 1, '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(10, 7, 'Nooraah BB Cushion', 'nooraah-bb-cushion', 'BB Cushion dengan coverage medium yang memberikan tampilan kulit natural sehat. Dilengkapi SPF 30 dan kandungan Hyaluronic Acid untuk menjaga kelembaban kulit.', 155000.00, NULL, 1, '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(11, 8, 'Nooraah Hair Serum Keratin', 'nooraah-hair-serum-keratin', 'Serum rambut dengan kandungan Keratin dan Argan Oil yang membantu melembutkan, menghaluskan, dan mengurangi frizz pada rambut rusak akibat panas dan bahan kimia.', 125000.00, NULL, 1, '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(12, 8, 'Nooraah Shampoo Hairfall Control', 'nooraah-shampoo-hairfall-control', 'Sampo anti rontok dengan kandungan Biotin, Caffeine, dan ekstrak Ginseng. Memperkuat akar rambut dari dalam dan mengurangi kerontokan secara signifikan.', 95000.00, NULL, 1, '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(13, 9, 'Nooraah Collagen Drink', 'nooraah-collagen-drink', 'Minuman kolagen premium dengan kandungan Marine Collagen 5000mg, Vitamin C, dan Biotin. Membantu menjaga elastisitas kulit, rambut, dan kuku dari dalam.', 210000.00, NULL, 1, '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(14, 9, 'Nooraah Glowing Supplement', 'nooraah-glowing-supplement', 'Suplemen kecantikan dengan formula sinergis Glutathione, Vitamin E, dan Zinc yang membantu mencerahkan kulit dari dalam dan meningkatkan sistem imun tubuh.', 175000.00, NULL, 1, '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(18, 9, 'Nooraah Glowing Supplement', 'nooraah-glowing-supplementtest', 'Suplemen kecantikan dengan formula sinergis Glutathione, Vitamin E, dan Zinc yang membantu mencerahkan kulit dari dalam dan meningkatkan sistem imun tubuh.', 175000.00, NULL, 1, '2026-09-14 00:56:49', '2026-09-14 00:56:49');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@nooraahbeauty.com', '$2b$12$QMzxhb7Q40ha9dZGIKXF/.tOCo/rof9CdtWN5qAvrrJTQgm5tUyRK', '2026-09-11 08:08:01', '2026-09-14 00:56:49'),
(4, 'nur atikah', 'afwan.gibran@gmail.com', '$2b$12$FjmXQAjdtDyB6WLBam5b..FSAeq6D6JKbK1x/TkOxQCwoNSIY5lWq', '2026-09-14 08:56:44', '2026-09-14 08:59:12');

-- --------------------------------------------------------

--
-- Table structure for table `vendors`
--

CREATE TABLE `vendors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `address` text,
  `contact` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `vendors`
--

INSERT INTO `vendors` (`id`, `name`, `logo`, `address`, `contact`, `created_at`, `updated_at`) VALUES
(1, 'PT Kosmetika Utama Indonesia', NULL, 'Jl. Industri Kimia No. 15, Karawang, Jawa Barat 41311', '0267-8881234', '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(2, 'Supplier Bahan Aktif Premium', NULL, 'Jl. Hayam Wuruk No. 72, Jakarta Barat 11140', '021-6321234', '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(3, 'Percetakan & Packaging Cantik', NULL, 'Jl. Raya Bekasi Km. 25, Bekasi Timur 17113', '021-88991234', '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(4, 'Distributor Nasional Nooraah', NULL, 'Jl. Gatot Subroto No. 120, Jakarta Selatan 12930', '021-52901234', '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(5, 'PT Laboratorium Derma Test', NULL, 'Jl. Cihampelas No. 55, Bandung, Jawa Barat 40116', '022-20391234', '2026-09-14 00:56:49', '2026-09-14 00:56:49'),
(6, 'Mitra Logistik Express', NULL, 'Jl. Mangga Dua Raya No. 8, Jakarta Utara 14430', '021-62311234', '2026-09-14 00:56:49', '2026-09-14 00:56:49');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;