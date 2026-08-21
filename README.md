# Dashboard AHI UIT JBB — mode 1 CSV

Setelah instalasi awal, **Anda hanya perlu mengganti 1 file CSV**:
`data/Monitoring-AHI.csv`

Tidak perlu mengolah CSV di ChatGPT.

Dashboard akan:
- membaca CSV asli langsung di browser;
- otomatis mengambil 9 jenis aset yang disepakati;
- menghitung usia aset dari Tahun Buat;
- menentukan Muda/Tua/Sangat Tua;
- menghitung KPI dan distribusi AHI;
- menyediakan filter;
- menampilkan detail aset dengan freeze kolom Unit Induk sampai Phasa;
- mengambil tanggal commit terakhir untuk `data/Monitoring-AHI.csv` dari GitHub API.

## Update data berikutnya
1. Buka repository GitHub.
2. Buka folder `data`.
3. Replace `Monitoring-AHI.csv` dengan CSV terbaru dari Power Inspect.
4. Commit changes.
5. Selesai. Dashboard membaca CSV terbaru.

CSV harus tetap menggunakan struktur/header Power Inspect seperti file awal. Nama file harus tetap `Monitoring-AHI.csv`.


Dashboard hanya menghitung dan menampilkan 9 jenis aset yang disepakati. AHI Berdasarkan Aset ditampilkan sebagai stacked visual.
