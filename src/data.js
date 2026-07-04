// Mock Database for School & Study Center Management System (Upgraded)

// Academic Categories
export const academicCategories = [
  { value: "sayisal", label: "Sayısal (SAY)" },
  { value: "esit_agirlik", label: "Eşit Ağırlık (EA)" },
  { value: "sozel", label: "Sözel (SÖZ)" },
  { value: "dil", label: "Dil (DİL)" }
];

export const initialStudents = [
  { 
    id: "STU001",
    name: "Ahmet Yılmaz",
    phone: "0532 111 2233",
    address: "Kadıköy Mh. Bağdat Cad. No:42 Kadıköy / İstanbul",
    birthDate: "2008-03-14",
    tcNo: "12345678901",
    grade: "12-A",
    category: "sayisal",
    status: "Aktif",
    avatar: "👨‍🎓",
    parent1: { name: "Mehmet Yılmaz", phone: "0532 111 2233", address: "Kadıköy Mh. Bağdat Cad. No:42 Kadıköy / İstanbul", birthDate: "1978-06-20", tcNo: "10987654321" },
    parent2: { name: "Fatma Yılmaz", phone: "0543 111 9988", address: "Kadıköy Mh. Bağdat Cad. No:42 Kadıköy / İstanbul", birthDate: "1981-11-05", tcNo: "10987654322" },
    behaviorScore: 104,
    behaviorLogs: [
      { date: "2026-06-25", type: "plus", points: 5, reason: "Derse Katılım ve Soru Çözümü", teacher: "Murat Aydın" },
      { date: "2026-06-22", type: "minus", points: -3, reason: "Ödev Eksikliği (Test 4)", teacher: "Murat Aydın" },
      { date: "2026-06-18", type: "plus", points: 2, reason: "Laboratuvar Temizliği", teacher: "Selin Yurt" }
    ],
    finance: {
      contractTotal: 45000,
      paid: 20000,
      remaining: 25000,
      installments: [
        { id: "INS-1", dueDate: "2026-07-05", amount: 5000, status: "Beklemede" },
        { id: "INS-2", dueDate: "2026-08-05", amount: 5000, status: "Beklemede" },
        { id: "INS-3", dueDate: "2026-09-05", amount: 5000, status: "Beklemede" },
        { id: "INS-4", dueDate: "2026-10-05", amount: 5000, status: "Beklemede" },
        { id: "INS-5", dueDate: "2026-11-05", amount: 5000, status: "Beklemede" }
      ],
      payments: [
        { id: "PAY-101", date: "2026-05-05", amount: 10000, method: "Kredi Kartı", collector: "Seda Bulut" },
        { id: "PAY-102", date: "2026-06-05", amount: 10000, method: "Havale/EFT", collector: "Seda Bulut" }
      ]
    },
    exams: [
      { name: "TYT Deneme-1", date: "2026-05-15", type: "TYT", turkce: 32, sosyal: 14, mat: 28, fen: 12, totalNet: 86, totalScore: 338.5, ranking: 2 },
      { name: "TYT Deneme-2", date: "2026-06-02", type: "TYT", turkce: 34, sosyal: 15, mat: 31, fen: 14, totalNet: 94, totalScore: 365.2, ranking: 1 },
      { name: "TYT Deneme-3", date: "2026-06-20", type: "TYT", turkce: 33, sosyal: 13, mat: 29, fen: 11, totalNet: 86, totalScore: 339.0, ranking: 2 }
    ]
  },
  { 
    id: "STU002",
    name: "Elif Demir",
    phone: "0543 222 3344",
    address: "Üsküdar Mh. Çengelköy Sk. No:8 Üsküdar / İstanbul",
    birthDate: "2008-07-22",
    tcNo: "23456789012",
    grade: "12-B",
    category: "esit_agirlik",
    status: "Aktif",
    avatar: "👩‍🎓",
    parent1: { name: "Ayşe Demir", phone: "0543 222 3344", address: "Üsküdar Mh. Çengelköy Sk. No:8 Üsküdar / İstanbul", birthDate: "1979-04-11", tcNo: "20987654321" },
    parent2: { name: "Kemal Demir", phone: "0535 222 6655", address: "Üsküdar Mh. Çengelköy Sk. No:8 Üsküdar / İstanbul", birthDate: "1976-09-30", tcNo: "20987654322" },
    behaviorScore: 110,
    behaviorLogs: [
      { date: "2026-06-24", type: "plus", points: 5, reason: "Fizik Proje Sunumu Harika", teacher: "Selin Yurt" },
      { date: "2026-06-19", type: "plus", points: 5, reason: "Sınıf İçi Örnek Davranış", teacher: "Aslıhan Aksoy" }
    ],
    finance: {
      contractTotal: 48000,
      paid: 16000,
      remaining: 32000,
      installments: [
        { id: "INS-1", dueDate: "2026-07-05", amount: 8000, status: "Beklemede" },
        { id: "INS-2", dueDate: "2026-08-05", amount: 8000, status: "Beklemede" },
        { id: "INS-3", dueDate: "2026-09-05", amount: 8000, status: "Beklemede" },
        { id: "INS-4", dueDate: "2026-10-05", amount: 8000, status: "Beklemede" }
      ],
      payments: [
        { id: "PAY-201", date: "2026-05-10", amount: 8000, method: "Nakit", collector: "Seda Bulut" },
        { id: "PAY-202", date: "2026-06-10", amount: 8000, method: "Kredi Kartı", collector: "Seda Bulut" }
      ]
    },
    exams: [
      { name: "TYT Deneme-1", date: "2026-05-15", type: "TYT", turkce: 30, sosyal: 16, mat: 24, fen: 15, totalNet: 85, totalScore: 334.8, ranking: 3 },
      { name: "TYT Deneme-2", date: "2026-06-02", type: "TYT", turkce: 31, sosyal: 15, mat: 26, fen: 16, totalNet: 88, totalScore: 345.5, ranking: 2 },
      { name: "TYT Deneme-3", date: "2026-06-20", type: "TYT", turkce: 35, sosyal: 17, mat: 28, fen: 18, totalNet: 98, totalScore: 380.1, ranking: 1 }
    ]
  },
  { 
    id: "STU003",
    name: "Can Kaya",
    phone: "0555 333 4455",
    address: "Beşiktaş Mh. Sinanpaşa Cad. No:15 Beşiktaş / İstanbul",
    birthDate: "2009-01-08",
    tcNo: "34567890123",
    grade: "11-A",
    category: "sozel",
    status: "Aktif",
    avatar: "👨‍🎓",
    parent1: { name: "Fatma Kaya", phone: "0555 333 4455", address: "Beşiktaş Mh. Sinanpaşa Cad. No:15 Beşiktaş / İstanbul", birthDate: "1982-12-17", tcNo: "30987654321" },
    parent2: { name: "Hüseyin Kaya", phone: "0532 333 7766", address: "Beşiktaş Mh. Sinanpaşa Cad. No:15 Beşiktaş / İstanbul", birthDate: "1979-03-25", tcNo: "30987654322" },
    behaviorScore: 97,
    behaviorLogs: [
      { date: "2026-06-26", type: "minus", points: -3, reason: "Derste Telefon Kullanımı", teacher: "Hakan Korkmaz" }
    ],
    finance: {
      contractTotal: 40000,
      paid: 10000,
      remaining: 30000,
      installments: [
        { id: "INS-1", dueDate: "2026-07-05", amount: 10000, status: "Beklemede" },
        { id: "INS-2", dueDate: "2026-08-05", amount: 10000, status: "Beklemede" },
        { id: "INS-3", dueDate: "2026-09-05", amount: 10000, status: "Beklemede" }
      ],
      payments: [
        { id: "PAY-301", date: "2026-05-15", amount: 10000, method: "Havale/EFT", collector: "Seda Bulut" }
      ]
    },
    exams: [
      { name: "11. Sınıf Deneme-1", date: "2026-05-20", type: "TYT", turkce: 25, sosyal: 11, mat: 20, fen: 8, totalNet: 64, totalScore: 260.4, ranking: 5 },
      { name: "11. Sınıf Deneme-2", date: "2026-06-15", type: "TYT", turkce: 28, sosyal: 12, mat: 22, fen: 10, totalNet: 72, totalScore: 285.5, ranking: 4 }
    ]
  },
  { 
    id: "STU004",
    name: "Merve Çelik",
    phone: "0533 444 5566",
    address: "Maltepe Mh. Bağlarbaşı Cad. No:27 Maltepe / İstanbul",
    birthDate: "2009-05-14",
    tcNo: "45678901234",
    grade: "11-B",
    category: "sayisal",
    status: "Aktif",
    avatar: "👩‍🎓",
    parent1: { name: "Hasan Çelik", phone: "0533 444 5566", address: "Maltepe Mh. Bağlarbaşı Cad. No:27 Maltepe / İstanbul", birthDate: "1977-08-03", tcNo: "40987654321" },
    parent2: { name: "Emine Çelik", phone: "0542 444 8877", address: "Maltepe Mh. Bağlarbaşı Cad. No:27 Maltepe / İstanbul", birthDate: "1980-02-19", tcNo: "40987654322" },
    behaviorScore: 100,
    behaviorLogs: [],
    finance: {
      contractTotal: 40000,
      paid: 20000,
      remaining: 20000,
      installments: [
        { id: "INS-1", dueDate: "2026-07-05", amount: 10000, status: "Beklemede" },
        { id: "INS-2", dueDate: "2026-08-05", amount: 10000, status: "Beklemede" }
      ],
      payments: [
        { id: "PAY-401", date: "2026-05-02", amount: 10000, method: "Kredi Kartı", collector: "Seda Bulut" },
        { id: "PAY-402", date: "2026-06-02", amount: 10000, method: "Kredi Kartı", collector: "Seda Bulut" }
      ]
    },
    exams: [
      { name: "11. Sınıf Deneme-1", date: "2026-05-20", type: "TYT", turkce: 26, sosyal: 14, mat: 18, fen: 9, totalNet: 67, totalScore: 271.8, ranking: 4 },
      { name: "11. Sınıf Deneme-2", date: "2026-06-15", type: "TYT", turkce: 29, sosyal: 13, mat: 21, fen: 11, totalNet: 74, totalScore: 292.0, ranking: 3 }
    ]
  },
  { 
    id: "STU005",
    name: "Ali Öztürk",
    phone: "0505 555 6677",
    address: "Kartal Mh. Yakacık Cad. No:91 Kartal / İstanbul",
    birthDate: "2010-09-30",
    tcNo: "56789012345",
    grade: "10-A",
    category: "dil",
    status: "Aktif",
    avatar: "👨‍🎓",
    parent1: { name: "Süleyman Öztürk", phone: "0505 555 6677", address: "Kartal Mh. Yakacık Cad. No:91 Kartal / İstanbul", birthDate: "1975-11-22", tcNo: "50987654321" },
    parent2: { name: "Nazan Öztürk", phone: "0543 555 9988", address: "Kartal Mh. Yakacık Cad. No:91 Kartal / İstanbul", birthDate: "1978-07-14", tcNo: "50987654322" },
    behaviorScore: 102,
    behaviorLogs: [
      { date: "2026-06-15", type: "plus", points: 2, reason: "Derste Güzel Soru Analizi", teacher: "Selin Yurt" }
    ],
    finance: {
      contractTotal: 36000,
      paid: 6000,
      remaining: 30000,
      installments: [
        { id: "INS-1", dueDate: "2026-07-05", amount: 6000, status: "Beklemede" },
        { id: "INS-2", dueDate: "2026-08-05", amount: 6000, status: "Beklemede" },
        { id: "INS-3", dueDate: "2026-09-05", amount: 6000, status: "Beklemede" },
        { id: "INS-4", dueDate: "2026-10-05", amount: 6000, status: "Beklemede" },
        { id: "INS-5", dueDate: "2026-11-05", amount: 6000, status: "Beklemede" }
      ],
      payments: [
        { id: "PAY-501", date: "2026-06-01", amount: 6000, method: "Havale/EFT", collector: "Seda Bulut" }
      ]
    },
    exams: [
      { name: "10. Sınıf Tarama-1", date: "2026-05-18", type: "TYT", turkce: 22, sosyal: 10, mat: 15, fen: 7, totalNet: 54, totalScore: 225.2, ranking: 6 }
    ]
  },
  { 
    id: "STU006",
    name: "Zeynep Aslan",
    phone: "0542 666 7788",
    address: "Pendik Mh. Kaynarca Cad. No:5 Pendik / İstanbul",
    birthDate: "2010-04-02",
    tcNo: "67890123456",
    grade: "10-B",
    category: "esit_agirlik",
    status: "Pasif",
    avatar: "👩‍🎓",
    parent1: { name: "Emine Aslan", phone: "0542 666 7788", address: "Pendik Mh. Kaynarca Cad. No:5 Pendik / İstanbul", birthDate: "1981-06-15", tcNo: "60987654321" },
    parent2: { name: "", phone: "", address: "", birthDate: "", tcNo: "" },
    behaviorScore: 100,
    behaviorLogs: [],
    finance: { contractTotal: 0, paid: 0, remaining: 0, installments: [], payments: [] },
    exams: []
  },
  { 
    id: "STU007",
    name: "Mustafa Şahin",
    phone: "0531 777 8899",
    address: "Tuzla Mh. İçmeler Sk. No:33 Tuzla / İstanbul",
    birthDate: "2011-12-18",
    tcNo: "78901234567",
    grade: "9-A",
    category: "sayisal",
    status: "Aktif",
    avatar: "👨‍🎓",
    parent1: { name: "Kemal Şahin", phone: "0531 777 8899", address: "Tuzla Mh. İçmeler Sk. No:33 Tuzla / İstanbul", birthDate: "1976-03-08", tcNo: "70987654321" },
    parent2: { name: "Sevim Şahin", phone: "0543 777 1122", address: "Tuzla Mh. İçmeler Sk. No:33 Tuzla / İstanbul", birthDate: "1979-10-25", tcNo: "70987654322" },
    behaviorScore: 105,
    behaviorLogs: [
      { date: "2026-06-25", type: "plus", points: 5, reason: "Kütüphane Düzenlemesine Yardım", teacher: "Aslıhan Aksoy" }
    ],
    finance: {
      contractTotal: 30000,
      paid: 10000,
      remaining: 20000,
      installments: [
        { id: "INS-1", dueDate: "2026-07-05", amount: 5000, status: "Beklemede" },
        { id: "INS-2", dueDate: "2026-08-05", amount: 5000, status: "Beklemede" },
        { id: "INS-3", dueDate: "2026-09-05", amount: 5000, status: "Beklemede" },
        { id: "INS-4", dueDate: "2026-10-05", amount: 5000, status: "Beklemede" }
      ],
      payments: [
        { id: "PAY-701", date: "2026-05-15", amount: 5000, method: "Nakit", collector: "Seda Bulut" },
        { id: "PAY-702", date: "2026-06-15", amount: 5000, method: "Nakit", collector: "Seda Bulut" }
      ]
    },
    exams: [
      { name: "9. Sınıf Tarama-1", date: "2026-05-22", type: "TYT", turkce: 20, sosyal: 12, mat: 12, fen: 6, totalNet: 50, totalScore: 212.5, ranking: 5 }
    ]
  }
];

export const initialAttendance = {
  date: new Date().toISOString().split('T')[0],
  records: [
    { studentId: "STU001", name: "Ahmet Yılmaz", status: "present", time: "08:45" },
    { studentId: "STU002", name: "Elif Demir", status: "present", time: "08:42" },
    { studentId: "STU003", name: "Can Kaya", status: "absent", time: "-" },
    { studentId: "STU004", name: "Merve Çelik", status: "present", time: "08:50" },
    { studentId: "STU005", name: "Ali Öztürk", status: "excused", time: "-" },
    { studentId: "STU006", name: "Zeynep Aslan", status: "absent", time: "-" },
    { studentId: "STU007", name: "Mustafa Şahin", status: "present", time: "08:35" }
  ]
};

export const initialAnnouncements = [
  { id: 1, title: "Yaz Okulu Kayıtları Başladı", content: "2026 Yaz Dönemi hızlandırılmış kurslarımız ve etüt programlarımız için kayıtlarımız başlamıştır. Kontenjanlar sınırlıdır.", date: "2026-06-25", author: "Müdürlük", target: "all" },
  { id: 2, title: "Veli Toplantısı Duyurusu", content: "12. Sınıf öğrencilerimizin YKS hazırlık süreçlerini değerlendirmek üzere 28 Haziran Pazar günü saat 14:00'te konferans salonunda veli toplantısı yapılacaktır.", date: "2026-06-24", author: "Rehberlik Servisi", target: "parents" },
  { id: 3, title: "TYT Deneme Sınavı", content: "Tüm 11 ve 12. sınıf öğrencilerimizin katılımının zorunlu olduğu TYT-4 deneme sınavı 29 Haziran Pazartesi günü saat 09:30'da yapılacaktır.", date: "2026-06-23", author: "Ölçme Değerlendirme", target: "students" },
  { id: 4, title: "Yeni Personel Oryantasyonu", content: "Etüt merkezimize yeni katılan öğretmenlerimiz için yarın saat 17:30'da öğretmenler odasında kısa bir tanışma ve oryantasyon toplantısı yapılacaktır.", date: "2026-06-22", author: "İnsan Kaynakları", target: "staff" }
];

export const initialStudies = [
  { id: "ETU101", studentName: "Ahmet Yılmaz", teacherName: "Murat Hoca (Matematik)", subject: "Matematik - Türev", date: "2026-06-27", time: "14:00 - 14:40", status: "Aktif" },
  { id: "ETU102", studentName: "Elif Demir", teacherName: "Selin Hoca (Fizik)", subject: "Fizik - Optik", date: "2026-06-27", time: "15:00 - 15:40", status: "Aktif" },
  { id: "ETU103", studentName: "Can Kaya", teacherName: "Hakan Hoca (Kimya)", subject: "Kimya - Gazlar", date: "2026-06-28", time: "11:00 - 11:40", status: "Beklemede" },
  { id: "ETU104", studentName: "Merve Çelik", teacherName: "Selin Hoca (Fizik)", subject: "Fizik - Kuvvet", date: "2026-06-26", time: "16:00 - 16:40", status: "Tamamlandı" }
];

export const initialCounseling = [
  { id: "REH001", studentName: "Ahmet Yılmaz", counselorName: "Rehber Öğretmen Aslıhan", date: "2026-06-25", time: "10:30", topic: "Sınav Kaygısı ve Motivasyon", notes: "Öğrenci son deneme netlerinden dolayı kaygılı. Haftalık çalışma programı güncellendi." },
  { id: "REH002", studentName: "Elif Demir", counselorName: "Rehber Öğretmen Aslıhan", date: "2026-06-24", time: "13:30", topic: "Hedef Belirleme & Meslek Seçimi", notes: "Mühendislik fakülteleri incelendi. İTÜ ve ODTÜ hedefleri doğrultusunda plan yapıldı." },
  { id: "REH003", studentName: "Can Kaya", counselorName: "Rehber Öğretmen Aslıhan", date: "2026-06-27", time: "11:00", topic: "Ders Çalışma Rutini Oluşturma", notes: "Öğrencinin odaklanma problemi var, Pomodoro tekniği önerildi." }
];

export const initialHomework = [
  { id: "HWK001", title: "Türev Çözümleri - Test 5-6", subject: "Matematik", grade: "12-A", dueDate: "2026-06-29", submissions: "5/7", description: "Limit ve Türev konusu föyündeki test 5 ve 6 çözülecektir." },
  { id: "HWK002", title: "Dalgalar Konu Özeti & Soru Çözümü", subject: "Fizik", grade: "12-B", dueDate: "2026-06-30", submissions: "3/7", description: "Elektromanyetik dalgalar konusu özeti çıkartılacak ve 20 soru çözülecek." },
  { id: "HWK003", title: "Modern Atom Teorisi", subject: "Kimya", grade: "11-A", dueDate: "2026-06-28", submissions: "6/7", description: "Periyodik özellikler ile ilgili 30 test sorusu tamamlanacak." }
];

export const initialStaff = [
  { id: "STF001", name: "Aslıhan Aksoy", role: "Rehber Öğretmen", department: "Rehberlik", contact: "0533 999 8877", status: "Aktif", avatar: "👩‍🏫" },
  { id: "STF002", name: "Murat Aydın", role: "Matematik Öğretmeni", department: "Matematik", contact: "0532 888 7766", status: "Aktif", avatar: "👨‍🏫" },
  { id: "STF003", name: "Selin Yurt", role: "Fizik Öğretmeni", department: "Fizik", contact: "0543 777 6655", status: "Aktif", avatar: "👩‍🏫" },
  { id: "STF004", name: "Hakan Korkmaz", role: "Kimya Öğretmeni", department: "Kimya", contact: "0535 666 5544", status: "Aktif", avatar: "👨‍🏫" },
  { id: "STF005", name: "Zekeriya Şen", role: "Kurum Müdürü", department: "Yönetim", contact: "0530 555 4433", status: "Aktif", avatar: "👨‍💼" },
  { id: "STF006", name: "Seda Bulut", role: "Öğrenci İşleri Sorumlusu", department: "İdari İşler", contact: "0555 444 3322", status: "Aktif", avatar: "👩‍💼" }
];

export const weeklySchedule = {
  days: ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"],
  hours: [
    { period: 1, time: "09:00 - 09:40" },
    { period: 2, time: "09:50 - 10:30" },
    { period: 3, time: "10:40 - 11:20" },
    { period: 4, time: "11:30 - 12:10" },
    { period: 5, time: "12:50 - 13:30" },
    { period: 6, time: "13:40 - 14:20" },
    { period: 7, time: "14:30 - 15:10" },
    { period: 8, time: "15:20 - 16:00" }
  ],
  classes: ["12-A", "12-B", "11-A"],
  data: {
    "12-A": {
      "Pazartesi": ["Matematik", "Matematik", "Fizik", "Fizik", "Kimya", "Biyoloji", "Türkçe", "Türkçe"],
      "Salı": ["Fizik", "Fizik", "Matematik", "Matematik", "Tarih", "Coğrafya", "Geometri", "Geometri"],
      "Çarşamba": ["Kimya", "Kimya", "Biyoloji", "Biyoloji", "Matematik", "Matematik", "İngilizce", "İngilizce"],
      "Perşembe": ["Türkçe", "Türkçe", "Geometri", "Geometri", "Fizik", "Kimya", "Biyoloji", "Biyoloji"],
      "Cuma": ["Matematik", "Matematik", "Türkçe", "İngilizce", "Felsefe", "Din Kült.", "Etüt/Deneme", "Etüt/Deneme"]
    },
    "12-B": {
      "Pazartesi": ["Fizik", "Fizik", "Kimya", "Kimya", "Matematik", "Matematik", "Türkçe", "Türkçe"],
      "Salı": ["Matematik", "Matematik", "Fizik", "Fizik", "Geometri", "Geometri", "Biyoloji", "Biyoloji"],
      "Çarşamba": ["Türkçe", "Türkçe", "Matematik", "Matematik", "Kimya", "Kimya", "Biyoloji", "Biyoloji"],
      "Perşembe": ["Biyoloji", "Biyoloji", "Kimya", "Kimya", "Matematik", "Matematik", "Tarih", "Coğrafya"],
      "Cuma": ["Geometri", "Geometri", "Türkçe", "Türkçe", "İngilizce", "İngilizce", "Etüt/Deneme", "Etüt/Deneme"]
    },
    "11-A": {
      "Pazartesi": ["Kimya", "Kimya", "Matematik", "Matematik", "Türkçe", "Türkçe", "Fizik", "Fizik"],
      "Salı": ["Türkçe", "Türkçe", "Kimya", "Kimya", "Biyoloji", "Biyoloji", "Matematik", "Matematik"],
      "Çarşamba": ["Geometri", "Geometri", "Fizik", "Fizik", "Türkçe", "Türkçe", "Tarih", "Coğrafya"],
      "Perşembe": ["Matematik", "Matematik", "Geometri", "Geometri", "Biyoloji", "Biyoloji", "Kimya", "Kimya"],
      "Cuma": ["Fizik", "Fizik", "Biyoloji", "Biyoloji", "İngilizce", "İngilizce", "Etüt/Deneme", "Etüt/Deneme"]
    }
  }
};

export const initialSmsLogs = [
  { id: "SMS-501", recipient: "Mehmet Yılmaz (Veli)", phone: "0532 111 2233", message: "Sayın Velimiz, Öğrenciniz Ahmet Yılmaz TYT-3 Deneme Sınavı sonucunda 339 Puan alarak kurum 2.si olmuştur.", timestamp: "2026-06-20 17:45", status: "İletildi" },
  { id: "SMS-502", recipient: "Fatma Kaya (Veli)", phone: "0555 333 4455", message: "Sayın Velimiz, Öğrenciniz Can Kaya bugün 1. ders saatinde yoklamada GELMEDİ olarak kaydedilmiştir.", timestamp: "2026-06-27 09:12", status: "İletildi" }
];

export const initialQuestionBank = [
  { id: "Q-101", subject: "Matematik", topic: "Türev", questionText: "f(x) = x^3 - 3x^2 + 5 fonksiyonunun yerel minimum noktası aşağıdakilerden hangisidir?", difficulty: "Orta" },
  { id: "Q-102", subject: "Matematik", topic: "Trigonometri", questionText: "sin(2x) = cos(x) denkleminin [0, 2π] aralığındaki en küçük kökü kaç radyandır?", difficulty: "Kolay" },
  { id: "Q-103", subject: "Fizik", topic: "Elektrik", questionText: "Düzgün bir manyetik alan içerisine fırlatılan yüklü parçacığa etki eden manyetik kuvvetin yönü nasıl bulunur?", difficulty: "Zor" },
  { id: "Q-104", subject: "Fizik", topic: "Dalgalar", questionText: "Aşağıdakilerden hangisi elektromanyetik dalgaların genel özelliklerinden biri değildir?", difficulty: "Orta" },
  { id: "Q-105", subject: "Kimya", topic: "Giriş", questionText: "Modern atom teorisine göre, n=3 baş kuantum sayısına sahip orbital türleri aşağıdakilerden hangisidir?", difficulty: "Kolay" }
];

export const mockKazanımlar = {
  "Matematik": [
    { topic: "Türev Alabilme", success: 82 },
    { topic: "Logaritma Kuralları", success: 90 },
    { topic: "Trigonometrik Özdeşlikler", success: 68 },
    { topic: "Polinom Çözümleri", success: 75 }
  ],
  "Fizik": [
    { topic: "Dalga Mekaniği", success: 70 },
    { topic: "Newton Kanunları", success: 85 },
    { topic: "Manyetizma & İndüksiyon", success: 58 },
    { topic: "Optik Kırılmalar", success: 79 }
  ],
  "Kimya": [
    { topic: "Modern Atom Teorisi", success: 88 },
    { topic: "Gaz Yasaları", success: 72 },
    { topic: "Kimyasal Denge", success: 64 }
  ]
};
