export const ATTENDANCE_MESSAGE = {
	// General
	TITLE: "Kehadiran & Absensi",
	LEAVE_TITLE: "Manajemen Cuti",
	OVERTIME_TITLE: "Lembur (SPL)",
	HOLIDAY_TITLE: "Hari Libur Nasional",

	// Leave Types
	LEAVE_TYPE_NOT_FOUND: "Jenis cuti tidak ditemukan.",
	LEAVE_TYPE_CODE_TAKEN: "Kode jenis cuti sudah digunakan.",
	LEAVE_TYPE_SYSTEM_PROTECTED: "Jenis cuti bawaan sistem tidak dapat dihapus.",
	LEAVE_TYPE_CREATED: "Jenis cuti berhasil dibuat.",
	LEAVE_TYPE_UPDATED: "Jenis cuti berhasil diperbarui.",

	// Leave Requests
	LEAVE_REQUEST_NOT_FOUND: "Pengajuan cuti tidak ditemukan.",
	LEAVE_REQUEST_CREATED:
		"Pengajuan cuti berhasil dikirim dan menunggu persetujuan.",
	LEAVE_REQUEST_APPROVED: "Pengajuan cuti disetujui.",
	LEAVE_REQUEST_REJECTED: "Pengajuan cuti ditolak.",
	LEAVE_REQUEST_CANCELLED: "Pengajuan cuti dibatalkan.",
	LEAVE_REQUEST_ALREADY_PROCESSED:
		"Pengajuan cuti ini sudah diproses sebelumnya.",
	LEAVE_INSUFFICIENT_BALANCE:
		"Saldo cuti tidak mencukupi untuk periode yang diminta.",
	LEAVE_DATE_OVERLAP:
		"Tanggal cuti berbenturan dengan pengajuan cuti lain yang sedang aktif.",
	LEAVE_END_BEFORE_START:
		"Tanggal selesai cuti tidak boleh sebelum tanggal mulai.",
	LEAVE_DOCTOR_NOTE_REQUIRED:
		"Jenis cuti ini wajib melampirkan surat keterangan dokter.",
	LEAVE_GENDER_RESTRICTED:
		"Jenis cuti ini tidak tersedia untuk jenis kelamin Anda.",

	// Leave Balance
	LEAVE_BALANCE_FORFEITED:
		"Saldo cuti kadaluarsa telah dihanguskan otomatis per 30 Juni.",
	LEAVE_BALANCE_NOT_ELIGIBLE:
		"Karyawan belum memenuhi syarat hak cuti tahunan (minimal 1 tahun masa kerja).",

	// UU KIA 2024 specific
	MATERNITY_LEAVE_EXTENDED:
		"Cuti melahirkan dapat diperpanjang hingga 6 bulan berdasarkan UU KIA 2024 dengan rekomendasi dokter. Gaji bulan ke-4 hingga ke-6 dibayarkan 75%.",
	MATERNITY_LEAVE_SALARY_NOTE:
		"Gaji 100% untuk 3 bulan pertama, 75% untuk bulan ke-4 s.d. ke-6 (UU KIA 2024 Pasal 4).",

	// Sick leave tiered
	LONG_SICK_SALARY_NOTE:
		"Sakit berkepanjangan (Pasal 93 UU 13/2003): 4 bulan pertama 100%, 4 bulan kedua 75%, 4 bulan ketiga 50%, selanjutnya 25%.",

	// Attendance
	ATTENDANCE_LOGGED: "Data kehadiran berhasil dicatat.",
	ATTENDANCE_BULK_LOGGED: "Data kehadiran massal berhasil dicatat.",
	ATTENDANCE_NOT_FOUND: "Data kehadiran tidak ditemukan.",
	ATTENDANCE_DUPLICATE: "Data kehadiran untuk tanggal ini sudah ada.",

	// Overtime
	OVERTIME_NOT_FOUND: "Surat Perintah Lembur tidak ditemukan.",
	OVERTIME_CREATED:
		"Pengajuan lembur berhasil dikirim dan menunggu persetujuan.",
	OVERTIME_APPROVED:
		"Lembur disetujui. Kompensasi lembur dihitung sesuai PP 35/2021.",
	OVERTIME_REJECTED: "Pengajuan lembur ditolak.",
	OVERTIME_ALREADY_PROCESSED: "Pengajuan lembur ini sudah diproses sebelumnya.",
	OVERTIME_EXEMPT_EMPLOYEE:
		"Karyawan manajerial (thinking worker) tidak berhak atas uang lembur (PP 35/2021 Pasal 27).",

	// Compliance warnings
	OVERTIME_OVER_DAILY_LIMIT:
		"⚠️ Peringatan: Lembur melebihi batas 4 jam/hari (PP 35/2021). Kompensasi tetap dibayarkan, namun HR diwajibkan melakukan evaluasi compliance.",
	OVERTIME_OVER_WEEKLY_LIMIT:
		"⚠️ Peringatan: Lembur melebihi batas 18 jam/minggu (PP 35/2021). Non-Compliance Alert telah dikirimkan ke HR.",

	// Public Holidays
	HOLIDAY_NOT_FOUND: "Data hari libur tidak ditemukan.",
	HOLIDAY_CREATED: "Hari libur berhasil ditambahkan.",
	HOLIDAY_DELETED: "Hari libur berhasil dihapus.",
	HOLIDAY_DATE_TAKEN: "Tanggal ini sudah terdaftar sebagai hari libur.",
} as const;
