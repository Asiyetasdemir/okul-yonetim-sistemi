import './style.css';
import {
  initialStudents,
  initialAttendance,
  initialAnnouncements,
  initialStudies,
  initialCounseling,
  initialHomework,
  initialStaff,
  weeklySchedule,
  initialSmsLogs,
  initialQuestionBank,
  mockKazanımlar,
  academicCategories
} from './data.js';


// Application State (Local DB Mock)
const state = {
  students: JSON.parse(localStorage.getItem('edu_students')) || [...initialStudents],
  attendance: { ...initialAttendance },
  announcements: [...initialAnnouncements],
  studies: [...initialStudies],
  counseling: [...initialCounseling],
  homeworks: [...initialHomework],
  staff: [...initialStaff],
  schedule: { ...weeklySchedule },
  smsLogs: [...initialSmsLogs],
  questionBank: [...initialQuestionBank],
  categories: JSON.parse(localStorage.getItem('edu_categories')) || [
    { id: 'sayisal', name: 'Sayısal', code: 'SAY', color: 'var(--color-students)' },
    { id: 'esit_agirlik', name: 'Eşit Ağırlık', code: 'EA', color: 'var(--color-finance)' },
    { id: 'sozel', name: 'Sözel', code: 'SÖZ', color: 'var(--color-attendance)' },
    { id: 'dil', name: 'Dil', code: 'DİL', color: 'var(--color-counseling)' }
  ],
  grades: JSON.parse(localStorage.getItem('edu_grades')) || [
    { name: '12-A', categoryId: 'sayisal' },
    { name: '12-B', categoryId: 'esit_agirlik' },
    { name: '11-A', categoryId: 'sozel' },
    { name: '11-B', categoryId: 'sayisal' },
    { name: '10-A', categoryId: 'dil' },
    { name: '10-B', categoryId: 'esit_agirlik' },
    { name: '9-A', categoryId: 'sayisal' },
    { name: '9-B', categoryId: 'esit_agirlik' }
  ],
  filterGrades: [],
  filterStatus: 'All',
  sortColumn: null,
  sortDirection: null,
  editingStudentId: null,
  selectedClassFilter: null
};

// Dynamic Category and Filter Helpers
function getCategoryLabel(catId) {
  const cat = state.categories.find(c => c.id === catId);
  return cat ? cat.code : (catId ? catId.toUpperCase() : '—');
}

function getCategoryColor(catId) {
  const cat = state.categories.find(c => c.id === catId);
  return cat ? cat.color : 'var(--color-students)';
}

function populateClassDropdowns() {
  const gradeSelects = [
    document.getElementById('m-stu-grade'),
    document.getElementById('hw-grade')
  ];
  
  gradeSelects.forEach(select => {
    if (!select) return;
    const currentVal = select.value;
    const availableGrades = getAvailableGrades();
    select.innerHTML = availableGrades.map(g => `<option value="${g}">${g}</option>`).join('');
    if (currentVal && availableGrades.includes(currentVal)) {
      select.value = currentVal;
    }
  });
}

function populateCategoryDropdowns() {
  const catSelect = document.getElementById('m-stu-category');
  if (catSelect) {
    const currentVal = catSelect.value;
    catSelect.innerHTML = '<option value="">-- Kategori Seçin --</option>' +
      state.categories.map(c => `<option value="${c.id}">${c.name} (${c.code})</option>`).join('');
    if (currentVal) catSelect.value = currentVal;
  }
  populateClassDropdowns();
}

function renderCategoryList() {
  const container = document.getElementById('category-list-container');
  if (!container) return;

  if (state.categories.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted);font-size:12px;text-align:center;padding:12px 0;">Henüz kategori eklenmedi.</p>`;
    return;
  }

  container.innerHTML = state.categories.map(cat => {
    // Resolve CSS variable to a real color for the dot
    const dotColors = {
      'var(--color-students)':  '#ff5a36',
      'var(--color-finance)':   '#f59e0b',
      'var(--color-attendance)':'#10b981',
      'var(--color-counseling)':'#ff7e47',
      'var(--color-stats)':     '#ec4899'
    };
    const dotColor = dotColors[cat.color] || '#6366f1';
    return `
      <div class="category-list-row">
        <span class="category-color-dot" style="background:${dotColor};"></span>
        <span class="category-list-name">${cat.name}</span>
        <span class="category-list-code">${cat.code}</span>
        <button class="category-delete-btn" onclick="window.deleteCategory('${cat.id}')" title="Kategoriyi Sil">
          <i data-lucide="trash-2" style="width:11px;height:11px;"></i> Sil
        </button>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function getAvailableGrades() {
  const gradesList = state.grades.map(g => g.name);
  const studentGrades = state.students.map(s => s.grade).filter(Boolean);
  const allGrades = Array.from(new Set([...gradesList, ...studentGrades]));
  allGrades.sort((a, b) => {
    return b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' });
  });
  return allGrades;
}

function updateClassDropdownLabel() {
  const label = document.getElementById('class-dropdown-label');
  if (!label) return;
  const checkedBoxes = document.querySelectorAll('.class-filter-checkbox:checked');
  if (checkedBoxes.length > 0) {
    label.innerHTML = `<i data-lucide="layout-grid" style="width: 16px; height: 16px;"></i> Sınıflar (${checkedBoxes.length})`;
  } else {
    label.innerHTML = `<i data-lucide="layout-grid" style="width: 16px; height: 16px;"></i> Sınıflar`;
  }
  if (window.lucide) window.lucide.createIcons();
}

function syncClassCheckboxes(value, checked) {
  const topCbs = document.querySelectorAll(`.class-filter-checkbox[value="${value}"]`);
  topCbs.forEach(cb => cb.checked = checked);
  const headerCbs = document.querySelectorAll(`.header-class-filter-checkbox[value="${value}"]`);
  headerCbs.forEach(cb => cb.checked = checked);
}

function updateFilterGradesAndRender() {
  const checkedBoxes = document.querySelectorAll('.class-filter-checkbox:checked');
  state.filterGrades = Array.from(checkedBoxes).map(cb => cb.value);
  renderStudentsTable();
  updateClassDropdownLabel();
}

function renderClassSelectionGrid() {
  const gridContainer = document.getElementById('class-checkbox-grid');
  const headerGridContainer = document.getElementById('header-class-checkbox-grid');
  
  const checkedGrades = state.filterGrades;
  const grades = getAvailableGrades();
  
  if (gridContainer) {
    gridContainer.innerHTML = grades.map(grade => {
      const isChecked = checkedGrades.includes(grade);
      return `
        <label class="class-filter-label">
          <input type="checkbox" class="class-filter-checkbox" value="${grade}" ${isChecked ? 'checked' : ''}>
          <span>${grade}</span>
        </label>
      `;
    }).join('');
    
    gridContainer.querySelectorAll('.class-filter-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        syncClassCheckboxes(cb.value, cb.checked);
        updateFilterGradesAndRender();
      });
    });
  }

  if (headerGridContainer) {
    headerGridContainer.innerHTML = grades.map(grade => {
      const isChecked = checkedGrades.includes(grade);
      return `
        <label class="class-filter-label" style="display: flex; align-items: center; gap: 8px; margin: 2px 0; cursor: pointer; color: var(--text-main); font-size: 12px;">
          <input type="checkbox" class="header-class-filter-checkbox" value="${grade}" ${isChecked ? 'checked' : ''}>
          <span>${grade}</span>
        </label>
      `;
    }).join('');
    
    headerGridContainer.querySelectorAll('.header-class-filter-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        syncClassCheckboxes(cb.value, cb.checked);
        updateFilterGradesAndRender();
      });
    });
  }
}

// Global Chart Instances Reference
let charts = {
  attendance: null,
  studies: null,
  homework: null,
  radar: null,
  studentExam: null
};

// State variable for selected student drawer
let activeStudentId = null;

// DOM Elements & Routing Setup
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  initTheme();
  setupNavigation();
  setupModals();
  setupFormSubmissions();
  setupSearchAndFilters();
  setupStudentDrawer();
  setupOpticalSimulator();
  setupQuestionBankSelector();
  
  // Initial renders
  renderAll();
});

// INITIALIZE APP GENERALS
function initApp() {
  seedMockStudentsIfNecessary();
  // Set date in header
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date();
  document.getElementById('header-date').innerText = today.toLocaleDateString('tr-TR', dateOptions);
  
  // Set default date fields in forms to today
  const todayISO = today.toISOString().split('T')[0];
  const dateInputs = ['study-date', 'm-coun-date', 'hw-date'];
  dateInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = todayISO;
  });

  // Mobile navigation drawer toggle
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-active');
    });
  }

  // Reload Lucide Icons initial call
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// THEME MANAGEMENT (DARK / LIGHT)
function updateLogoTheme() {
  const logoEl = document.getElementById('app-logo');
  const logoTextEl = document.getElementById('app-logo-text');
  const isLight = document.body.classList.contains('light-theme');
  if (logoEl) {
    logoEl.src = isLight ? '/src/assets/logo-light-icon.jpg' : '/src/assets/logo-dark-icon.jpg';
  }
  if (logoTextEl) {
    logoTextEl.src = isLight ? '/src/assets/logo-light.jpg' : '/src/assets/logo-dark.jpg';
  }
}

function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme') || 'dark';
  
  if (savedTheme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
  }
  updateLogoTheme();

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      if (document.body.classList.contains('dark-theme')) {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
      } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
      }
      updateLogoTheme();
      // Re-trigger chart rendering to adapt colors
      if (document.getElementById('view-stats').classList.contains('active')) {
        renderCharts();
      }
      // If student drawer is open, re-render individual chart
      if (activeStudentId) {
        renderStudentExamChart(activeStudentId);
      }
    });
  }
}

// NAVIGATION / ROUTING CONTROLLER
function setupNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabViews = document.querySelectorAll('.tab-view');
  const gridCards = document.querySelectorAll('.grid-card');
  const breadcrumbParent = document.getElementById('breadcrumb-parent');
  const breadcrumbCurrent = document.getElementById('breadcrumb-current');

  const switchTab = (targetView) => {
    // Hide mobile sidebar if open
    document.querySelector('.sidebar').classList.remove('mobile-active');

    // Remove active class from all buttons and tabs
    navBtns.forEach(btn => btn.classList.remove('active'));
    tabViews.forEach(view => view.classList.remove('active'));

    // Find and activate requested nav button
    const activeNavBtn = Array.from(navBtns).find(btn => btn.getAttribute('data-view') === targetView);
    if (activeNavBtn) activeNavBtn.classList.add('active');

    // Show active view
    const targetSection = document.getElementById(`view-${targetView}`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Update breadcrumbs
    if (targetView === 'dashboard') {
      breadcrumbParent.innerText = 'Dashboard';
      breadcrumbCurrent.innerText = 'Ana Sayfa';
    } else {
      breadcrumbParent.innerText = 'Modüller';
      const moduleNames = {
        students: 'Öğrenci İşleri',
        attendance: 'Yoklama',
        announcements: 'Genel Duyuru',
        studies: 'Etütlendirme',
        counseling: 'Rehberlik',
        hours: 'Ders Saatleri',
        homework: 'Ödevlendirme',
        staff: 'Personel İşleri',
        stats: 'İstatistik'
      };
      breadcrumbCurrent.innerText = moduleNames[targetView] || targetView;
    }

    // Trigger charts rendering when switching to stats
    if (targetView === 'stats') {
      setTimeout(renderCharts, 50);
    }
    
    // Trigger logs rendering for new split dashboards
    if (targetView === 'attendance' && typeof window.renderAttendanceLogs === 'function') {
      window.renderAttendanceLogs();
    }
    if (targetView === 'homework' && typeof window.renderHomeworkLogs === 'function') {
      window.renderHomeworkLogs();
    }
    if (targetView === 'studies' && typeof window.renderStudyStudents === 'function') {
      window.renderStudyStudents();
      window.renderStudiesList();
    }
    if (targetView === 'counseling' && typeof window.renderCounselingReport === 'function') {
      window.renderCounselingReport();
    }
  };
  window.switchTab = switchTab;

  // Sidebar buttons click handler
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.getAttribute('data-view');
      switchTab(targetView);
    });
  });

  // Dashboard 9-box grid click handler
  gridCards.forEach(card => {
    card.addEventListener('click', () => {
      const targetView = card.getAttribute('data-target-view');
      switchTab(targetView);
    });
  });
}

// MODALS AND DIALOGS MANAGEMENT
function setupModals() {
  const modalTriggers = [
    { buttonId: 'btn-add-student', modalId: 'modal-student' },
    { buttonId: 'btn-add-counseling', modalId: 'modal-counseling' },
    { buttonId: 'btn-add-staff', modalId: 'modal-staff' },
    { buttonId: 'btn-manage-groups-classes', modalId: 'modal-groups-classes' },
    { buttonId: 'btn-show-classes-grid', modalId: 'modal-categories-grid' },
    { buttonId: 'btn-student-class-list', modalId: 'modal-student-class-list' },
    { buttonId: 'btn-student-settings', modalId: 'modal-student-settings' }
  ];

  modalTriggers.forEach(({ buttonId, modalId }) => {
    const btn = document.getElementById(buttonId);
    const modal = document.getElementById(modalId);
    const closeBtn = document.getElementById(`${modalId}-close`);
    const cancelBtn = document.getElementById(`${modalId}-cancel`);

    if (btn && modal) {
      btn.addEventListener('click', () => {
        if (buttonId === 'btn-add-student') {
          state.editingStudentId = null;
          const form = document.getElementById('modal-student-form');
          if (form) form.reset();
          const title = document.getElementById('modal-student-title');
          if (title) title.innerHTML = '<i data-lucide="user-plus"></i> Yeni Öğrenci Kaydı';
          const submitBtn = document.getElementById('modal-reg-submit');
          if (submitBtn) submitBtn.innerHTML = '<i data-lucide="save"></i> Kaydı Tamamla';
          if (window.lucide) window.lucide.createIcons();
        }
        if (buttonId === 'btn-manage-groups-classes') {
          renderManageGroupsList();
          renderManageClassesList();
          populateClassGroupSelect();
        }
        if (buttonId === 'btn-show-classes-grid') {
          renderInlineCategoriesAndClasses();
        }
        if (buttonId === 'btn-student-class-list') {
          window.initPrintClassDropdown();
        }
        modal.classList.add('active');
        populateModalDropdowns(modalId);
      });
    }

    const closeModal = () => {
      if (modal) modal.classList.remove('active');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  });

  // Bind close buttons for modal-class-students
  const modalClassStudents = document.getElementById('modal-class-students');
  const closeClassStudents = document.getElementById('modal-class-students-close');
  const cancelClassStudents = document.getElementById('modal-class-students-cancel');
  if (modalClassStudents) {
    const hideClassStudents = () => {
      modalClassStudents.style.display = 'none';
    };
    if (closeClassStudents) closeClassStudents.addEventListener('click', hideClassStudents);
    if (cancelClassStudents) cancelClassStudents.addEventListener('click', hideClassStudents);
  }

  // Category creation modal hooks
  const btnCreateCat = document.getElementById('btn-create-category');
  const modalCat = document.getElementById('modal-category');
  const modalCatClose = document.getElementById('modal-category-close');
  const modalCatCancel = document.getElementById('modal-category-cancel');
  const modalCatForm = document.getElementById('modal-category-form');

  if (btnCreateCat && modalCat) {
    btnCreateCat.addEventListener('click', () => {
      modalCat.classList.add('active');
      renderCategoryList();
    });
  }

  const closeCatModal = () => {
    if (modalCat) {
      modalCat.classList.remove('active');
      modalCatForm.reset();
    }
  };

  if (modalCatClose) modalCatClose.addEventListener('click', closeCatModal);
  if (modalCatCancel) modalCatCancel.addEventListener('click', closeCatModal);

  if (modalCatForm) {
    modalCatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('m-cat-name').value.trim();
      const code = document.getElementById('m-cat-code').value.trim().toUpperCase();

      if (!name || !code) {
        showToast('Lütfen tüm alanları doldurun.', 'error');
        return;
      }

      // Generate a unique id
      const id = name.toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]/g, '_');

      if (state.categories.some(c => c.id === id || c.code === code)) {
        showToast('Bu isim veya kodda bir kategori zaten mevcut.', 'error');
        return;
      }

      const presetColors = [
        'var(--color-students)',
        'var(--color-finance)',
        'var(--color-attendance)',
        'var(--color-counseling)',
        'var(--color-stats)'
      ];
      const color = presetColors[state.categories.length % presetColors.length];

      const newCat = { id, name, code, color };
      state.categories.push(newCat);
      localStorage.setItem('edu_categories', JSON.stringify(state.categories));

      populateCategoryDropdowns();
      
      const catSelect = document.getElementById('m-stu-category');
      if (catSelect) catSelect.value = id;

      closeCatModal();
      showToast(`✅ ${name} (${code}) kategorisi başarıyla oluşturuldu.`);
      renderCategoryList();
    });
  }

  // Helper to populate dropdown select inputs dynamically inside modals
  function populateModalDropdowns(modalId) {
    if (modalId === 'modal-student') {
      populateCategoryDropdowns();
    } else if (modalId === 'modal-counseling') {
      const studentSelect = document.getElementById('m-coun-student');
      const teacherSelect = document.getElementById('m-coun-teacher');
      
      if (studentSelect) {
        studentSelect.innerHTML = state.students
          .map(s => `<option value="${s.name}">${s.name} (${s.grade})</option>`)
          .join('');
      }

      if (teacherSelect) {
        teacherSelect.innerHTML = state.staff
          .filter(st => st.role.includes('Rehber') || st.role.includes('Öğretmen'))
          .map(st => `<option value="${st.name}">${st.name} (${st.role})</option>`)
          .join('');
      }
    }
  }
}

// STUDENT PROFILE DETAILED DRAWER (K12NET STYLE)
function setupStudentDrawer() {
  const drawer = document.getElementById('drawer-student');
  const closeBtn = document.getElementById('drawer-student-close');
  const cancelBtn = document.getElementById('drawer-student-cancel-btn');
  const tabs = document.querySelectorAll('.drawer-tab-btn');
  const sheets = document.querySelectorAll('.drawer-tab-sheet');

  const closeDrawer = () => {
    drawer.classList.remove('active');
    activeStudentId = null;
    if (charts.studentExam) {
      charts.studentExam.destroy();
      charts.studentExam = null;
    }
  };

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (cancelBtn) cancelBtn.addEventListener('click', closeDrawer);

  // Tab switching logic inside drawer
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      sheets.forEach(s => s.classList.remove('active'));

      tab.classList.add('active');
      const targetSheet = document.getElementById(tab.getAttribute('data-tab'));
      if (targetSheet) targetSheet.classList.add('active');

      // Re-trigger radar/line chart inside individual card if tab is exam
      if (tab.getAttribute('data-tab') === 'd-tab-exams' && activeStudentId) {
        setTimeout(() => renderStudentExamChart(activeStudentId), 50);
      }
    });
  });

  // Attach click listener on students table dynamically
  const tableBody = document.getElementById('students-table-body');
  if (tableBody) {
    tableBody.addEventListener('click', (e) => {
      // Find row trigger
      const cell = e.target.closest('td');
      if (!cell) return;
      
      // Ignore click if it's on actions column
      if (cell.cellIndex === 6) return;

      const row = e.target.closest('tr');
      if (row) {
        // Extract student ID from first column
        const studentId = row.cells[0].innerText.trim();
        openStudentDrawer(studentId);
      }
    });
  }

  // Handle behavior card form submit inside drawer
  const behForm = document.getElementById('d-beh-form');
  if (behForm) {
    behForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!activeStudentId) return;

      const type = document.getElementById('d-beh-type').value;
      const reason = document.getElementById('d-beh-reason').value;
      const points = type === 'plus' ? 5 : -3;
      
      const student = state.students.find(s => s.id === activeStudentId);
      if (student) {
        student.behaviorScore += points;
        student.behaviorLogs.unshift({
          date: new Date().toISOString().split('T')[0],
          type,
          points,
          reason,
          teacher: 'Seda Bulut'
        });

        // Reset and re-render
        behForm.reset();
        renderDrawerTabs(student);
        renderStudentsTable();
        renderMetrics();
        showToast('Davranış kartı başarıyla eklendi.');
      }
    });
  }
}

// OPEN DRAWER WORKFLOW
function openStudentDrawer(studentId) {
  const student = state.students.find(s => s.id === studentId);
  if (!student) return;

  activeStudentId = studentId;

  // Set header details
  document.getElementById('d-stu-avatar').innerText = student.avatar;
  document.getElementById('d-stu-name').innerText = student.name;
  document.getElementById('d-stu-grade').innerText = student.grade;

  // Default active tab to General Info
  const tabs = document.querySelectorAll('.drawer-tab-btn');
  const sheets = document.querySelectorAll('.drawer-tab-sheet');
  tabs.forEach(t => t.classList.remove('active'));
  sheets.forEach(s => s.classList.remove('active'));
  tabs[0].classList.add('active');
  sheets[0].classList.add('active');

  // Render individual sheets
  renderDrawerTabs(student);

  // Show drawer
  document.getElementById('drawer-student').classList.add('active');
  if (window.lucide) window.lucide.createIcons();
}

function renderDrawerTabs(student) {
  // 1. General Tab — Student Personal Info
  const cat = student.category || '';
  const catLabel = getCategoryLabel(cat);

  // Student basic fields
  const els = {
    'dstu-id':       student.id,
    'dstu-tc':       student.tcNo || '—',
    'dstu-birth':    student.birthDate || '—',
    'dstu-phone':    student.phone || student.contact || '—',
    'dstu-address':  student.address || '—',
    'dstu-category': catLabel,
    'dstu-status':   student.status
  };
  Object.entries(els).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  });

  // Status badge
  const statusLabel = document.getElementById('d-stu-status-label');
  if (statusLabel) {
    statusLabel.className = `badge ${student.status === 'Aktif' ? 'badge-success' : 'badge-danger'}`;
    statusLabel.innerText = student.status;
  }

  // Render parent cards
  const p1 = student.parent1 || { name: student.parentName || '—', phone: student.contact || '' };
  const p2 = student.parent2 || { name: '' };

  const parentContainer = document.getElementById('d-stu-parents-container');
  if (parentContainer) {
    const renderParentCard = (veli, label, color) => {
      if (!veli.name) return `<div class="parent-card" style="opacity:0.4;"><p style="color:var(--text-muted);font-size:13px;text-align:center;margin:auto;">Veli bilgisi girilmemiş</p></div>`;
      return `
        <div class="parent-card">
          <div class="parent-card-header" style="color:${color};">${label}</div>
          <div class="parent-info-row"><span class="pi-label">👤 İsim</span><span class="pi-val">${veli.name || '—'}</span></div>
          <div class="parent-info-row"><span class="pi-label">📱 Telefon</span><span class="pi-val">${veli.phone || '—'}</span></div>
          <div class="parent-info-row"><span class="pi-label">🆔 TC Kimlik</span><span class="pi-val">${veli.tcNo || '—'}</span></div>
          <div class="parent-info-row"><span class="pi-label">🎂 Doğum</span><span class="pi-val">${veli.birthDate || '—'}</span></div>
          <div class="parent-info-row"><span class="pi-label">🏠 Adres</span><span class="pi-val" style="font-size:11px;">${veli.address || '—'}</span></div>
        </div>
      `;
    };
    parentContainer.innerHTML = renderParentCard(p1, 'Veli 1 (Birincil)', 'var(--color-counseling)') + renderParentCard(p2, 'Veli 2 (İkincil)', 'var(--color-finance)');
  }

  // Fallback: legacy single field
  const legacyParentEl = document.getElementById('d-stu-parent-label');
  if (legacyParentEl) legacyParentEl.innerText = p1.name;
  const legacyContactEl = document.getElementById('d-stu-contact-label');
  if (legacyContactEl) legacyContactEl.innerText = p1.phone || student.phone || '—';
  const legacyIdEl = document.getElementById('d-stu-id');
  if (legacyIdEl) legacyIdEl.innerText = student.id;


  // 2. Finance Tab
  const fin = student.finance || { contractTotal: 0, paid: 0, remaining: 0, installments: [], payments: [] };
  document.getElementById('d-fin-total').innerText = fin.contractTotal.toLocaleString('tr-TR') + ' TL';
  document.getElementById('d-fin-paid').innerText = fin.paid.toLocaleString('tr-TR') + ' TL';
  document.getElementById('d-fin-remaining').innerText = fin.remaining.toLocaleString('tr-TR') + ' TL';

  // Render Installments list
  const installmentsBody = document.getElementById('d-fin-installments-tbody');
  if (fin.installments.length === 0) {
    installmentsBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">Taksit kaydı yok.</td></tr>`;
  } else {
    installmentsBody.innerHTML = fin.installments.map(inst => {
      const isPaid = inst.status === 'Ödendi';
      const badgeClass = isPaid ? 'badge-success' : 'badge-warning';
      const actionBtn = isPaid ? 
        `<span style="font-size:11px; color:var(--success); font-weight:600;"><i data-lucide="check" style="width:12px; height:12px; vertical-align:middle;"></i> Ödendi</span>` :
        `<button class="yoklama-action-btn present active" onclick="window.payInstallment('${student.id}', '${inst.id}')">Taksit Tahsil Et</button>`;
      
      return `
        <tr>
          <td style="font-weight:600;">${inst.dueDate}</td>
          <td>${inst.amount.toLocaleString('tr-TR')} TL</td>
          <td><span class="badge ${badgeClass}">${inst.status}</span></td>
          <td>${actionBtn}</td>
        </tr>
      `;
    }).join('');
  }

  // Render Receipts (Payments) List
  const paymentsBody = document.getElementById('d-fin-payments-tbody');
  if (fin.payments.length === 0) {
    paymentsBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">Ödeme kaydı bulunmamaktadır.</td></tr>`;
  } else {
    paymentsBody.innerHTML = fin.payments.map(pay => {
      return `
        <tr>
          <td>${pay.date}</td>
          <td style="font-weight:700;">${pay.amount.toLocaleString('tr-TR')} TL</td>
          <td><span class="badge badge-info">${pay.method}</span></td>
          <td>${pay.collector}</td>
          <td>
            <button class="yoklama-action-btn" onclick="window.printReceipt('${student.id}', '${pay.id}')">
              <i data-lucide="printer" style="width: 12px; height: 12px; vertical-align:middle;"></i> Makbuz
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 3. Behavior Tab
  document.getElementById('d-beh-score').innerText = student.behaviorScore;
  const logsContainer = document.getElementById('d-beh-logs-container');
  
  if (student.behaviorLogs.length === 0) {
    logsContainer.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:20px;">Kart log kaydı bulunmamaktadır.</div>`;
  } else {
    logsContainer.innerHTML = student.behaviorLogs.map(log => {
      const isPlus = log.type === 'plus';
      const color = isPlus ? 'var(--success)' : 'var(--danger)';
      const pts = isPlus ? `+${log.points}` : `${log.points}`;
      const cardType = isPlus ? 'Olumlu Davranış Kartı' : 'Olumsuz Davranış Kartı';
      
      return `
        <div style="background-color: var(--color-input-bg); border-left: 4px solid ${color}; padding: 12px; border-radius: var(--radius-sm); border-top:1px solid var(--color-border); border-bottom:1px solid var(--color-border); border-right:1px solid var(--color-border); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h5 style="font-size:12px; font-weight:700;">${cardType} <span style="color:${color};">(${pts} Puan)</span></h5>
            <p style="font-size:11px; color:var(--text-secondary); margin-top:2px;">${log.reason}</p>
            <span style="font-size:9px; color:var(--text-muted);">${log.date} - Veren: ${log.teacher}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // 4. Exams Tab Table Render
  const examsBody = document.getElementById('d-exams-tbody');
  if (student.exams.length === 0) {
    examsBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted);">Sınav net bilgisi yok.</td></tr>`;
  } else {
    examsBody.innerHTML = student.exams.map(ex => {
      return `
        <tr>
          <td style="font-weight:600; color:var(--color-students);">${ex.name}</td>
          <td>${ex.turkce}</td>
          <td>${ex.sosyal}</td>
          <td>${ex.mat}</td>
          <td>${ex.fen}</td>
          <td style="font-weight:700;">${ex.totalNet} Net</td>
          <td style="font-weight:800; color:var(--color-stats);">${ex.totalScore}</td>
          <td><span class="badge badge-success">${ex.ranking}. Sınıfta</span></td>
        </tr>
      `;
    }).join('');
  }

  if (window.lucide) window.lucide.createIcons();
}

// Global window binders for Drawer finance operations
window.payInstallment = (studentId, installmentId) => {
  const student = state.students.find(s => s.id === studentId);
  if (!student) return;

  const inst = student.finance.installments.find(i => i.id === installmentId);
  if (inst) {
    inst.status = 'Ödendi';
    
    // Add payment log
    const payId = `PAY-${100 + student.finance.payments.length + 1}`;
    const payment = {
      id: payId,
      date: new Date().toISOString().split('T')[0],
      amount: inst.amount,
      method: 'Havale/EFT',
      collector: 'Seda Bulut'
    };

    student.finance.payments.push(payment);

    // Recalculate totals
    student.finance.paid += inst.amount;
    student.finance.remaining -= inst.amount;

    // Refresh views
    renderDrawerTabs(student);
    renderStudentsTable();
    showToast('Taksit tahsilatı başarıyla gerçekleştirildi.');
  }
};

window.printReceipt = (studentId, paymentId) => {
  const student = state.students.find(s => s.id === studentId);
  if (!student) return;

  const pay = student.finance.payments.find(p => p.id === paymentId);
  if (pay) {
    document.getElementById('r-no').innerText = pay.id;
    document.getElementById('r-date').innerText = `Tarih: ${pay.date}`;
    document.getElementById('r-student').innerText = student.name;
    document.getElementById('r-grade').innerText = student.grade;
    document.getElementById('r-parent').innerText = student.parentName;
    document.getElementById('r-method').innerText = pay.method;
    document.getElementById('r-amount').innerText = pay.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' TL';
    document.getElementById('r-collector').innerText = pay.collector;

    // Show Printable modal receipt
    document.getElementById('modal-receipt').classList.add('active');
  }
};

// INDIVIDUAL EXAM CHART FOR DRAWER
function renderStudentExamChart(studentId) {
  if (charts.studentExam) {
    charts.studentExam.destroy();
    charts.studentExam = null;
  }

  const student = state.students.find(s => s.id === studentId);
  if (!student || student.exams.length === 0) return;

  const canvas = document.getElementById('studentExamChart');
  if (!canvas) return;

  const labels = student.exams.map(e => e.name);
  const scores = student.exams.map(e => e.totalScore);
  const nets = student.exams.map(e => e.totalNet);

  const isDark = document.body.classList.contains('dark-theme');
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  charts.studentExam = new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Puan Başarısı (YKS)',
          data: scores,
          borderColor: '#ff7e47',
          backgroundColor: 'rgba(255, 126, 71, 0.05)',
          borderWidth: 2,
          yAxisID: 'y1',
          tension: 0.3
        },
        {
          label: 'Net Sayısı',
          data: nets,
          borderColor: '#10b981',
          backgroundColor: 'transparent',
          borderWidth: 2,
          yAxisID: 'y2',
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor, fontSize: 10 } },
        y1: {
          type: 'linear',
          position: 'left',
          grid: { color: gridColor },
          ticks: { color: textColor }
        },
        y2: {
          type: 'linear',
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: textColor }
        }
      }
    }
  });
}

// =====================================================================
// REGISTRATION MODAL — Address auto-fill synchronization
// =====================================================================
function setupRegModalNav() {
  // "Same address" checkboxes
  const p1Box = document.getElementById('m-p1-same-address');
  const p2Box = document.getElementById('m-p2-same-address');
  if (p1Box) p1Box.addEventListener('change', () => {
    if (p1Box.checked) {
      const addr = document.getElementById('m-stu-address')?.value || '';
      const ta = document.getElementById('m-p1-address');
      if (ta) { ta.value = addr; ta.disabled = true; }
    } else {
      const ta = document.getElementById('m-p1-address');
      if (ta) ta.disabled = false;
    }
  });
  if (p2Box) p2Box.addEventListener('change', () => {
    if (p2Box.checked) {
      const addr = document.getElementById('m-stu-address')?.value || '';
      const ta = document.getElementById('m-p2-address');
      if (ta) { ta.value = addr; ta.disabled = true; }
    } else {
      const ta = document.getElementById('m-p2-address');
      if (ta) ta.disabled = false;
    }
  });
}

// FORM SUBMISSIONS HANDLING
function setupFormSubmissions() {
  // 1. Add Student Modal Form (Expanded K12NET-style)
  const studentForm = document.getElementById('modal-student-form');
  if (studentForm) {
    setupRegModalNav();
    studentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // — Öğrenci Bilgileri
      const name         = document.getElementById('m-stu-name')?.value.trim() || '';
      const phone        = document.getElementById('m-stu-phone')?.value.trim() || '';
      const tcNo         = document.getElementById('m-stu-tc')?.value.trim() || '';
      const birthDate    = document.getElementById('m-stu-birth')?.value || '';
      const address      = document.getElementById('m-stu-address')?.value.trim() || '';
      const grade        = document.getElementById('m-stu-grade')?.value || '9-A';
      const category     = document.getElementById('m-stu-category')?.value || 'sayisal';
      const status       = document.getElementById('m-stu-status')?.value || 'Aktif';
      const contractValue = parseFloat(document.getElementById('m-stu-contract')?.value) || 0;

      // — Veli 1 Bilgileri
      const p1 = {
        name:      document.getElementById('m-p1-name')?.value.trim() || '',
        phone:     document.getElementById('m-p1-phone')?.value.trim() || '',
        tcNo:      document.getElementById('m-p1-tc')?.value.trim() || '',
        birthDate: document.getElementById('m-p1-birth')?.value || '',
        address:   document.getElementById('m-p1-address')?.value.trim() || ''
      };

      // — Veli 2 Bilgileri
      const p2 = {
        name:      document.getElementById('m-p2-name')?.value.trim() || '',
        phone:     document.getElementById('m-p2-phone')?.value.trim() || '',
        tcNo:      document.getElementById('m-p2-tc')?.value.trim() || '',
        birthDate: document.getElementById('m-p2-birth')?.value || '',
        address:   document.getElementById('m-p2-address')?.value.trim() || ''
      };

      if (!name || !grade) { showToast('Lütfen zorunlu alanları doldurun.', 'error'); return; }

      if (state.editingStudentId) {
        const student = state.students.find(s => s.id === state.editingStudentId);
        if (student) {
          student.name = name;
          student.phone = phone;
          student.tcNo = tcNo;
          student.birthDate = birthDate;
          student.address = address;
          student.grade = grade;
          student.category = category;
          student.status = status;
          student.parent1 = p1;
          student.parent2 = p2;
          
          if (student.finance) {
            student.finance.contractTotal = contractValue;
            student.finance.remaining = contractValue - (student.finance.paid || 0);
          }

          state.attendance.records.forEach(r => {
            if (r.studentId === student.id) {
              r.name = name;
            }
          });

          state.editingStudentId = null;
          showToast(`✅ ${name} profili başarıyla güncellendi.`);
        }
      } else {
        const newId = `STU${String(state.students.length + 1).padStart(3, '0')}`;
        const installmentAmount = Math.round(contractValue / 4);
        const installments = [];
        for (let i = 1; i <= 4; i++) {
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() + i);
          installments.push({ id: `INS-${newId}-${i}`, dueDate: dueDate.toISOString().split('T')[0], amount: installmentAmount, status: 'Beklemede' });
        }

        const newStudent = {
          id: newId,
          name,
          phone,
          tcNo,
          birthDate,
          address,
          grade,
          category,
          status,
          avatar: Math.random() > 0.5 ? '👨‍🎓' : '👩‍🎓',
          parent1: p1,
          parent2: p2,
          behaviorScore: 100,
          behaviorLogs: [],
          finance: { contractTotal: contractValue, paid: 0, remaining: contractValue, installments, payments: [] },
          exams: []
        };

        state.students.push(newStudent);
        state.attendance.records.push({ studentId: newId, name, status: 'present', time: '08:50' });
        showToast(`✅ ${name} başarıyla sisteme kaydedildi.`);
      }

      // Reset modal and tabs
      document.getElementById('modal-student').classList.remove('active');
      studentForm.reset();
      switchRegTab(0);

      renderAll();
    });
  }

  // 2. Add Counseling Session Modal Form
  const counselingForm = document.getElementById('modal-counseling-form');
  if (counselingForm) {
    counselingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const studentName = document.getElementById('m-coun-student').value;
      const counselorName = document.getElementById('m-coun-teacher').value;
      const date = document.getElementById('m-coun-date').value;
      const topic = document.getElementById('m-coun-topic').value;
      const notes = document.getElementById('m-coun-notes').value;

      const newRecord = {
        id: `REH00${state.counseling.length + 1}`,
        studentName,
        counselorName,
        date,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        topic,
        notes
      };

      state.counseling.push(newRecord);
      document.getElementById('modal-counseling').classList.remove('active');
      counselingForm.reset();

      renderAll();
      showToast('Rehberlik görüşme kaydı eklendi.');
    });
  }

  // 3. Add Staff Modal Form
  const staffForm = document.getElementById('modal-staff-form');
  if (staffForm) {
    staffForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('m-stf-name').value;
      const role = document.getElementById('m-stf-role').value;
      const department = document.getElementById('m-stf-dept').value;
      const contact = document.getElementById('m-stf-contact').value;

      const newStaff = {
        id: `STF00${state.staff.length + 1}`,
        name,
        role,
        department,
        contact,
        status: 'Aktif',
        avatar: Math.random() > 0.5 ? "👨‍🏫" : "👩‍🏫"
      };

      state.staff.push(newStaff);
      document.getElementById('modal-staff').classList.remove('active');
      staffForm.reset();

      renderAll();
      showToast(`${name} kadroya eklendi.`);
    });
  }

  // 4. Publish Announcement Form
  const annForm = document.getElementById('announcement-form');
  if (annForm) {
    annForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('ann-title').value;
      const author = document.getElementById('ann-author').value;
      const target = document.getElementById('ann-target').value;
      const content = document.getElementById('ann-content').value;

      const newAnn = {
        id: state.announcements.length + 1,
        title,
        content,
        date: new Date().toISOString().split('T')[0],
        author,
        target
      };

      state.announcements.unshift(newAnn); // Add to beginning of feed
      annForm.reset();

      renderAll();
      showToast('Duyuru yayınlandı.');
    });
  }

  // 5. Schedule Study (Etüt) Form
  const studyForm = document.getElementById('study-form');
  if (studyForm) {
    studyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const studentName = document.getElementById('study-student').value;
      const teacherName = document.getElementById('study-teacher').value;
      const subject = document.getElementById('study-subject').value;
      const date = document.getElementById('study-date').value;
      const time = document.getElementById('study-time').value;

      const newStudy = {
        id: `ETU${100 + state.studies.length + 1}`,
        studentName,
        teacherName,
        subject,
        date,
        time,
        status: 'Aktif'
      };

      state.studies.push(newStudy);
      studyForm.reset();

      renderAll();
      showToast('Etüt başarıyla programlandı.');
    });
  }

  // 6. Assign Homework Form
  const hwForm = document.getElementById('homework-form');
  if (hwForm) {
    hwForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('hw-title').value;
      const subject = document.getElementById('hw-subject').value;
      const grade = document.getElementById('hw-grade').value;
      const dueDate = document.getElementById('hw-date').value;
      const description = document.getElementById('hw-description').value;

      const newHw = {
        id: `HWK00${state.homeworks.length + 1}`,
        title,
        subject,
        grade,
        dueDate,
        submissions: `0/${state.students.filter(s => s.grade === grade).length}`,
        description
      };

      state.homeworks.unshift(newHw);
      hwForm.reset();

      // Clear question bank checkboxes
      document.querySelectorAll('#hw-question-bank-list input[type="checkbox"]').forEach(c => c.checked = false);
      document.getElementById('selected-questions-count').innerText = '0 Soru Seçildi';

      renderAll();
      showToast('Ödev başarıyla atandı.');
    });
  }

  // 7. Save Attendance Checklist Form Button
  const saveAttendanceBtn = document.getElementById('btn-save-attendance');
  if (saveAttendanceBtn) {
    saveAttendanceBtn.addEventListener('click', () => {
      showToast('Yoklama başarıyla kaydedildi ve sisteme işlendi.');
      renderMetrics();
    });
  }

  setupGroupAndClassManagementEvents();
  setupInlineCategoryAndClassForms();
  setupLegacyStatusMenu();
  startStatusClock();
}

// SEARCH FILTER LOGIC
function setupSearchAndFilters() {
  const globalSearch = document.getElementById('global-search');
  if (globalSearch) {
    globalSearch.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      if (document.getElementById('view-students').classList.contains('active')) {
        document.getElementById('student-search-input').value = query;
        renderStudentsTable();
      } else if (document.getElementById('view-counseling').classList.contains('active')) {
        document.getElementById('counseling-search').value = query;
        renderCounselingTable();
      }
    });
  }

  // Student affairs view search/filter
  const studentSearch = document.getElementById('student-search-input');
  if (studentSearch) studentSearch.addEventListener('input', renderStudentsTable);

  // Dropdown toggle logic
  const classDropdownTrigger = document.getElementById('btn-class-dropdown-trigger');
  const classDropdownMenu = document.getElementById('class-dropdown-menu');
  if (classDropdownTrigger && classDropdownMenu) {
    classDropdownTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = classDropdownMenu.style.display === 'block';
      classDropdownMenu.style.display = isOpen ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
      if (!classDropdownMenu.contains(e.target) && !classDropdownTrigger.contains(e.target)) {
        classDropdownMenu.style.display = 'none';
      }
    });
  }

  // Header dropdown toggle logic
  const headerTrigger = document.getElementById('btn-header-class-trigger');
  const headerMenu = document.getElementById('header-class-dropdown-menu');
  if (headerTrigger && headerMenu) {
    headerTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = headerMenu.style.display === 'block';
      headerMenu.style.display = isOpen ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
      if (!headerMenu.contains(e.target) && !headerTrigger.contains(e.target)) {
        headerMenu.style.display = 'none';
      }
    });
  }

  // Header class search logic
  const headerSearchInput = document.getElementById('header-class-search-input');
  if (headerSearchInput) {
    headerSearchInput.addEventListener('click', (e) => e.stopPropagation());
    headerSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const labels = document.querySelectorAll('#header-class-checkbox-grid .class-filter-label');
      labels.forEach(label => {
        const text = label.textContent.toLowerCase();
        label.style.display = text.includes(query) ? 'flex' : 'none';
      });
    });
  }

  const btnList = document.getElementById('btn-list-students');
  const btnClear = document.getElementById('btn-clear-classes');

  if (btnList) {
    btnList.addEventListener('click', () => {
      const checkedBoxes = document.querySelectorAll('.class-filter-checkbox:checked');
      state.filterGrades = Array.from(checkedBoxes).map(cb => cb.value);
      renderStudentsTable();
      if (classDropdownMenu) classDropdownMenu.style.display = 'none'; // Close dropdown on apply
      if (state.filterGrades.length > 0) {
        showToast(`${state.filterGrades.join(', ')} sınıfı listelendi.`);
      } else {
        showToast('Tüm öğrenciler listelendi.');
      }
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      const checkboxes = document.querySelectorAll('.class-filter-checkbox');
      checkboxes.forEach(cb => cb.checked = false);
      const headerCheckboxes = document.querySelectorAll('.header-class-filter-checkbox');
      headerCheckboxes.forEach(cb => cb.checked = false);
      state.filterGrades = [];
      renderStudentsTable();
      updateClassDropdownLabel();
    });
  }

  const btnSelectAll = document.getElementById('btn-select-all-classes');
  if (btnSelectAll) {
    btnSelectAll.addEventListener('click', () => {
      const checkboxes = document.querySelectorAll('.class-filter-checkbox');
      checkboxes.forEach(cb => cb.checked = true);
      const headerCheckboxes = document.querySelectorAll('.header-class-filter-checkbox');
      headerCheckboxes.forEach(cb => cb.checked = true);
      updateClassDropdownLabel();
    });
  }

  // Header select all and clear buttons
  const btnHeaderSelectAll = document.getElementById('btn-header-select-all-classes');
  const btnHeaderClear = document.getElementById('btn-header-clear-classes');
  if (btnHeaderSelectAll) {
    btnHeaderSelectAll.addEventListener('click', (e) => {
      e.stopPropagation();
      const checkboxes = document.querySelectorAll('.class-filter-checkbox');
      checkboxes.forEach(cb => cb.checked = true);
      const headerCheckboxes = document.querySelectorAll('.header-class-filter-checkbox');
      headerCheckboxes.forEach(cb => cb.checked = true);
      updateFilterGradesAndRender();
    });
  }
  if (btnHeaderClear) {
    btnHeaderClear.addEventListener('click', (e) => {
      e.stopPropagation();
      const checkboxes = document.querySelectorAll('.class-filter-checkbox');
      checkboxes.forEach(cb => cb.checked = false);
      const headerCheckboxes = document.querySelectorAll('.header-class-filter-checkbox');
      headerCheckboxes.forEach(cb => cb.checked = false);
      updateFilterGradesAndRender();
    });
  }

  // Sınıf Column Sorting
  const btnSortAsc = document.getElementById('btn-sort-class-asc');
  const btnSortDesc = document.getElementById('btn-sort-class-desc');

  if (btnSortAsc) {
    btnSortAsc.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.sortColumn === 'grade' && state.sortDirection === 'asc') {
        state.sortColumn = null;
        state.sortDirection = null;
        btnSortAsc.classList.remove('active-sort');
      } else {
        state.sortColumn = 'grade';
        state.sortDirection = 'asc';
        btnSortAsc.classList.add('active-sort');
        if (btnSortDesc) btnSortDesc.classList.remove('active-sort');
      }
      renderStudentsTable();
    });
  }

  if (btnSortDesc) {
    btnSortDesc.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.sortColumn === 'grade' && state.sortDirection === 'desc') {
        state.sortColumn = null;
        state.sortDirection = null;
        btnSortDesc.classList.remove('active-sort');
      } else {
        state.sortColumn = 'grade';
        state.sortDirection = 'desc';
        btnSortDesc.classList.add('active-sort');
        if (btnSortAsc) btnSortAsc.classList.remove('active-sort');
      }
      renderStudentsTable();
    });
  }

  // Sortable Headers Event Listeners
  const sortableHeaders = document.querySelectorAll('.sortable-header');
  sortableHeaders.forEach(th => {
    th.addEventListener('click', () => {
      const col = th.getAttribute('data-sort-col');
      if (state.sortColumn === col) {
        if (state.sortDirection === 'asc') {
          state.sortDirection = 'desc';
        } else {
          state.sortColumn = null;
          state.sortDirection = null;
        }
      } else {
        state.sortColumn = col;
        state.sortDirection = 'asc';
      }
      
      // Reset Sınıf sorting buttons visually if we sort another column
      if (btnSortAsc) btnSortAsc.classList.remove('active-sort');
      if (btnSortDesc) btnSortDesc.classList.remove('active-sort');
      
      renderStudentsTable();
    });
  });

  // Status Filter Header Dropdown Toggle & Filter
  const statusTrigger = document.getElementById('btn-header-status-trigger');
  const statusMenu = document.getElementById('header-status-dropdown-menu');
  if (statusTrigger && statusMenu) {
    statusTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = statusMenu.style.display === 'block';
      statusMenu.style.display = isOpen ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
      if (!statusMenu.contains(e.target) && !statusTrigger.contains(e.target)) {
        statusMenu.style.display = 'none';
      }
      const actionMenus = document.querySelectorAll('.action-menu-dropdown');
      actionMenus.forEach(menu => {
        if (!menu.contains(e.target)) {
          menu.style.display = 'none';
        }
      });
    });
  }

  const statusRadios = document.querySelectorAll('input[name="status-filter"]');
  statusRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      state.filterStatus = radio.value;
      renderStudentsTable();
      if (statusMenu) statusMenu.style.display = 'none';
    });
  });

  // Yoklama class filter
  const attendanceFilter = document.getElementById('attendance-grade-select');
  if (attendanceFilter) attendanceFilter.addEventListener('change', renderAttendanceList);

  // Rehberlik search
  const counselingSearch = document.getElementById('counseling-search');
  if (counselingSearch) counselingSearch.addEventListener('input', renderCounselingTable);

  // Ders Programı Sınıf Seçimi
  const scheduleFilter = document.getElementById('hours-class-select');
  if (scheduleFilter) scheduleFilter.addEventListener('change', renderScheduleGrid);
}

// SMS DISPATCH LOGIC (K12NET INTEGRATION)
window.sendAbsentSms = (studentId) => {
  const student = state.students.find(s => s.id === studentId);
  if (!student) return;

  const phone = student.contact;
  const message = `Sayın Velimiz, Öğrenciniz ${student.name} bugün 1. ders saatinde yoklamada GELMEDİ olarak kaydedilmiştir. - EduMercek Veli Bilgilendirme`;

  const newLog = {
    id: `SMS-${500 + state.smsLogs.length + 1}`,
    recipient: `${student.parent1?.name || student.parentName || 'Veli'} (Veli)`,
    phone,
    message,
    timestamp: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    status: 'İletildi'
  };

  state.smsLogs.unshift(newLog); // Prepend
  renderSmsLogs();
  
  // Disable SMS button visually in Yoklama table
  const rowBtn = document.getElementById(`btn-sms-${studentId}`);
  if (rowBtn) {
    rowBtn.outerHTML = `<span style="font-size:11px; color:var(--success); font-weight:600;"><i data-lucide="check" style="width:12px; height:12px; vertical-align:middle; display:inline;"></i> SMS Gönderildi</span>`;
    if (window.lucide) window.lucide.createIcons();
  }

  showToast(`Veliye SMS bildirimi iletildi.`);
};

function renderSmsLogs() {
  const tbody = document.getElementById('sms-logs-table-body');
  if (!tbody) return;

  tbody.innerHTML = state.smsLogs.map(log => {
    return `
      <tr>
        <td style="font-size:11px; font-weight:600;">${log.timestamp}</td>
        <td>${log.recipient}</td>
        <td style="font-family:monospace; font-size:12px;">${log.phone}</td>
        <td style="max-width:380px; font-size:12px; color:var(--text-secondary);">${log.message}</td>
        <td><span class="badge badge-success">${log.status}</span></td>
      </tr>
    `;
  }).join('');
}

// OPTICAL SHEET SCANNER SIMULATOR (SINAVBAŞKANIM INTEGRATION)
function setupOpticalSimulator() {
  const btnRun = document.getElementById('btn-run-optical');
  const badge = document.getElementById('optical-success-badge');

  if (btnRun) {
    btnRun.addEventListener('click', () => {
      const selectedFile = document.getElementById('optical-file-select').value;
      const isTyt = selectedFile.includes('tyt');
      const examName = isTyt ? "TYT Deneme-4" : "AYT Deneme-2";

      // Simulate optical reading calculations: add randomized realistic exam scores for each active student
      state.students.forEach((student, index) => {
        if (student.status !== 'Aktif') return;
        
        // Randomize score parameters based on student's baseline
        const turkce = Math.round(25 + Math.random() * 15); // 25-40
        const sosyal = Math.round(10 + Math.random() * 10); // 10-20
        const mat = Math.round(18 + Math.random() * 22); // 18-40
        const fen = Math.round(5 + Math.random() * 15); // 5-20
        const totalNet = turkce + sosyal + mat + fen;
        
        // Calculate score weight
        const totalScore = Math.round(100 + (totalNet * 3.8) + (Math.random() * 10));
        const ranking = Math.round(1 + Math.random() * 4); // Random rank 1-5

        // Check if student already has this exam, if not add it
        const hasExam = student.exams.find(e => e.name === examName);
        if (!hasExam) {
          student.exams.push({
            name: examName,
            date: new Date().toISOString().split('T')[0],
            type: isTyt ? "TYT" : "AYT",
            turkce,
            sosyal,
            mat,
            fen,
            totalNet,
            totalScore,
            ranking
          });
        }
      });

      // Show success indicator badge
      badge.style.display = 'inline-flex';
      setTimeout(() => {
        badge.style.display = 'none';
      }, 5000);

      // Refresh stats charts and lists
      renderCharts();
      renderStudentsTable();
      showToast(`${examName} Optik form okuma tamamlandı! Sonuçlar işlendi.`);
    });
  }
}

// QUESTION BANK ASSEMBLER IN HOMEWORKS
function setupQuestionBankSelector() {
  const bankList = document.getElementById('hw-question-bank-list');
  const countBadge = document.getElementById('selected-questions-count');
  const descTextarea = document.getElementById('hw-description');

  if (!bankList) return;

  // Render question list
  bankList.innerHTML = state.questionBank.map(q => {
    return `
      <label style="display:flex; align-items:center; gap:8px; font-size:12px; color:var(--text-secondary); cursor:pointer;">
        <input type="checkbox" value="${q.id}" data-text="${q.questionText}" style="cursor:pointer;">
        <span><strong>[${q.subject} - ${q.topic}]</strong> (${q.difficulty}): ${q.questionText}</span>
      </label>
    `;
  }).join('');

  // Handle selections
  bankList.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') {
      const checkedBoxes = bankList.querySelectorAll('input[type="checkbox"]:checked');
      countBadge.innerText = `${checkedBoxes.length} Soru Seçildi`;

      // Update textarea automatically
      const selectedTexts = Array.from(checkedBoxes).map((box, idx) => {
        return `Soru ${idx + 1}) ${box.getAttribute('data-text')}`;
      });

      const currentVal = descTextarea.value.split('--- SEÇİLEN SORULAR ---')[0].trim();
      if (selectedTexts.length > 0) {
        descTextarea.value = currentVal + '\n\n--- SEÇİLEN SORULAR ---\n' + selectedTexts.join('\n');
      } else {
        descTextarea.value = currentVal;
      }
    }
  });
}

// ----------------------------------------------------
// RENDERING FUNCTIONS
// ----------------------------------------------------

function renderAll() {
  saveStudents();
  renderClassSelectionGrid();
  renderMetrics();
  renderInlineCategoriesAndClasses();
  renderStudentsTable();
  renderAttendanceList();
  renderAnnouncementsFeed();
  renderStudiesView();
  renderCounselingTable();
  renderScheduleGrid();
  renderHomeworkList();
  renderStaffGrid();
  renderSmsLogs();
  
  // Sync select options
  populateFormSelects();

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Update Top Metrics and Dashboard Box Labels
function renderMetrics() {
  // 1. Students Count
  const totalStudents = state.students.filter(s => s.status === 'Aktif').length;
  document.getElementById('metric-students').innerText = totalStudents;

  // 2. Attendance Metric
  const presentCount = state.attendance.records.filter(r => r.status === 'present').length;
  const totalChecked = state.attendance.records.length;
  const attendanceRate = totalChecked > 0 ? Math.round((presentCount / totalChecked) * 100) : 0;
  document.getElementById('metric-attendance').innerText = `Bugün %${attendanceRate}`;

  // 3. Announcements count
  document.getElementById('metric-announcements').innerText = state.announcements.length;

  // 4. Scheduled Studies count
  const activeStudies = state.studies.filter(st => st.status === 'Aktif').length;
  document.getElementById('metric-studies').innerText = activeStudies;

  // 5. Counseling Records
  document.getElementById('metric-counseling').innerText = state.counseling.length;

  // 6. Active Homeworks
  document.getElementById('metric-homework').innerText = state.homeworks.length;

  // 7. Staff count
  document.getElementById('metric-staff').innerText = state.staff.filter(st => st.status === 'Aktif').length;
}

// 1. ÖĞRENCİ İŞLERİ TABLE RENDER
// 1. ÖĞRENCİ İŞLERİ TABLE RENDER
function updateSortHeadersUI() {
  const headers = document.querySelectorAll('.sortable-header');
  headers.forEach(th => {
    const col = th.getAttribute('data-sort-col');
    const iconContainer = th.querySelector('.sort-icon');
    if (!iconContainer) return;
    
    // Clear Lucide attributes to force re-render
    iconContainer.removeAttribute('data-lucide');
    iconContainer.style.color = '';
    iconContainer.style.opacity = '';
    
    if (state.sortColumn === col) {
      iconContainer.setAttribute('data-lucide', state.sortDirection === 'asc' ? 'chevron-up' : 'chevron-down');
      iconContainer.style.color = 'var(--color-students)';
      iconContainer.style.opacity = '1';
    } else {
      iconContainer.setAttribute('data-lucide', 'chevrons-up-down');
      iconContainer.style.opacity = '0.7';
    }
  });
}

window.toggleActionMenu = (id, event) => {
  event.stopPropagation();
  const menus = document.querySelectorAll('.action-menu-dropdown');
  menus.forEach(menu => {
    if (menu.id !== `action-menu-${id}`) {
      menu.style.display = 'none';
    }
  });
  
  const currentMenu = document.getElementById(`action-menu-${id}`);
  if (currentMenu) {
    const isOpen = currentMenu.style.display === 'block';
    currentMenu.style.display = isOpen ? 'none' : 'block';
  }
};

window.changeStudentStatusAction = (id, targetStatus) => {
  const student = state.students.find(s => s.id === id);
  if (student) {
    student.status = targetStatus;
    renderStudentsTable();
    showToast(`Öğrenci durumu '${targetStatus}' olarak güncellendi.`);
  }
};

window.editStudentProfileAction = (id) => {
  const student = state.students.find(s => s.id === id);
  if (!student) return;

  state.editingStudentId = id;
  
  // Close any open action menus
  const menus = document.querySelectorAll('.action-menu-dropdown');
  menus.forEach(menu => menu.style.display = 'none');

  // Fill student fields
  const mStuName = document.getElementById('m-stu-name');
  if (mStuName) mStuName.value = student.name || '';

  const mStuPhone = document.getElementById('m-stu-phone');
  if (mStuPhone) mStuPhone.value = student.phone || student.contact || '';

  const mStuTc = document.getElementById('m-stu-tc');
  if (mStuTc) mStuTc.value = student.tcNo || '';

  const mStuBirth = document.getElementById('m-stu-birth');
  if (mStuBirth) mStuBirth.value = student.birthDate || '';

  const mStuAddress = document.getElementById('m-stu-address');
  if (mStuAddress) mStuAddress.value = student.address || '';

  const mStuGrade = document.getElementById('m-stu-grade');
  if (mStuGrade) mStuGrade.value = student.grade || '9-A';

  const mStuCategory = document.getElementById('m-stu-category');
  if (mStuCategory) mStuCategory.value = student.category || 'sayisal';

  const mStuStatus = document.getElementById('m-stu-status');
  if (mStuStatus) mStuStatus.value = student.status || 'Aktif';

  const mStuContract = document.getElementById('m-stu-contract');
  if (mStuContract) mStuContract.value = student.finance?.contractTotal || 0;

  // Fill Parent 1 fields
  const mP1Name = document.getElementById('m-p1-name');
  if (mP1Name) mP1Name.value = student.parent1?.name || student.parentName || '';

  const mP1Phone = document.getElementById('m-p1-phone');
  if (mP1Phone) mP1Phone.value = student.parent1?.phone || '';

  const mP1Tc = document.getElementById('m-p1-tc');
  if (mP1Tc) mP1Tc.value = student.parent1?.tcNo || '';

  const mP1Birth = document.getElementById('m-p1-birth');
  if (mP1Birth) mP1Birth.value = student.parent1?.birthDate || '';

  const mP1Address = document.getElementById('m-p1-address');
  if (mP1Address) mP1Address.value = student.parent1?.address || '';

  // Fill Parent 2 fields
  const mP2Name = document.getElementById('m-p2-name');
  if (mP2Name) mP2Name.value = student.parent2?.name || '';

  const mP2Phone = document.getElementById('m-p2-phone');
  if (mP2Phone) mP2Phone.value = student.parent2?.phone || '';

  const mP2Tc = document.getElementById('m-p2-tc');
  if (mP2Tc) mP2Tc.value = student.parent2?.tcNo || '';

  const mP2Birth = document.getElementById('m-p2-birth');
  if (mP2Birth) mP2Birth.value = student.parent2?.birthDate || '';

  const mP2Address = document.getElementById('m-p2-address');
  if (mP2Address) mP2Address.value = student.parent2?.address || '';

  // Update modal titles/buttons
  const modalTitle = document.getElementById('modal-student-title');
  if (modalTitle) modalTitle.innerHTML = '<i data-lucide="user-cog"></i> Öğrenci Profilini Düzenle';

  const submitBtn = document.getElementById('modal-reg-submit');
  if (submitBtn) submitBtn.innerHTML = '<i data-lucide="save"></i> Profili Güncelle';

  if (window.lucide) window.lucide.createIcons();

  // Show modal
  const modal = document.getElementById('modal-student');
  if (modal) {
    modal.classList.add('active');
    populateModalDropdowns('modal-student');
  }
};

window.deleteStudentAction = (id) => {
  window.deleteStudent(id);
};

function renderStudentsTable() {
  const tableBody = document.getElementById('students-table-body');
  if (!tableBody) return;

  const searchQuery = document.getElementById('student-search-input').value.toLowerCase();

  const filtered = state.students.filter(student => {
    const p1name = student.parent1?.name || student.parentName || '';
    const matchesSearch = student.name.toLowerCase().includes(searchQuery) ||
                          p1name.toLowerCase().includes(searchQuery) ||
                          (student.tcNo || '').includes(searchQuery) ||
                          (student.phone || '').includes(searchQuery);
    const matchesGrade = state.filterGrades.length === 0 || state.filterGrades.includes(student.grade);
    const matchesStatus = state.filterStatus === 'All' || student.status === state.filterStatus;
    const matchesSelectedClass = !state.selectedClassFilter || student.grade === state.selectedClassFilter;
    return matchesSearch && matchesGrade && matchesStatus && matchesSelectedClass;
  });

  if (state.sortColumn && state.sortDirection) {
    filtered.sort((a, b) => {
      let valA = '';
      let valB = '';
      
      if (state.sortColumn === 'id') {
        valA = a.id || '';
        valB = b.id || '';
      } else if (state.sortColumn === 'name') {
        valA = a.name || '';
        valB = b.name || '';
      } else if (state.sortColumn === 'phone') {
        valA = a.phone || '';
        valB = b.phone || '';
      } else if (state.sortColumn === 'tcNo') {
        valA = a.tcNo || '';
        valB = b.tcNo || '';
      } else if (state.sortColumn === 'grade') {
        valA = a.grade || '';
        valB = b.grade || '';
      } else if (state.sortColumn === 'parentName') {
        valA = a.parent1?.name || a.parentName || '';
        valB = b.parent1?.name || b.parentName || '';
      } else if (state.sortColumn === 'parentPhone') {
        valA = a.parent1?.phone || '';
        valB = b.parent1?.phone || '';
      } else if (state.sortColumn === 'parentTc') {
        valA = a.parent1?.tcNo || '';
        valB = b.parent1?.tcNo || '';
      }

      const comparison = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
      return state.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="11" style="text-align: center; color: var(--text-muted); padding: 24px;">Arama kriterine uygun öğrenci bulunamadı.</td></tr>`;
    return;
  }

  tableBody.innerHTML = filtered.map(student => {
    const p1name = student.parent1?.name || student.parentName || '—';
    const p1phone = student.parent1?.phone || '';
    const cat = student.category || '';
    const catLabel = getCategoryLabel(cat);
    const catColor = getCategoryColor(cat);

    return `
      <tr class="student-table-row" style="cursor: pointer;">
        <td><span style="font-size:11px;color:var(--text-muted);">${student.id}</span></td>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">${student.avatar}</span>
            <div style="font-weight: 600; text-decoration: underline; color: var(--color-students);">${student.name}</div>
          </div>
        </td>
        <td><span style="font-size:12px; white-space: nowrap;">${student.phone || '—'}</span></td>
        <td><span style="font-size:11px;color:var(--text-muted);">${student.tcNo || '—'}</span></td>
        <td><span class="badge badge-info">${student.grade}</span></td>
        <td><span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;background:${catColor}22;color:${catColor};">${catLabel}</span></td>
        <td><div style="font-size:13px; font-weight: 500;">${p1name}</div></td>
        <td><span style="font-size:12px; white-space: nowrap;">${p1phone || '—'}</span></td>
        <td><span style="font-size:11px;color:var(--text-muted);">${student.parent1?.tcNo || '—'}</span></td>
        <td>
          <span class="badge ${student.status === 'Aktif' ? 'badge-success' : 'badge-danger'}" 
                style="display: inline-block; min-width: 50px; text-align: center;">
            ${student.status}
          </span>
        </td>
        <td style="overflow: visible;">
          <div style="position: relative; display: inline-block;">
            <button class="btn btn-secondary" onclick="window.toggleActionMenu('${student.id}', event)" title="İşlemler" style="font-size: 11px; padding: 4px 8px; display: inline-flex; align-items: center; justify-content: center; gap: 4px; font-weight: 600; cursor: pointer; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--bg-main); color: var(--text-main);">
              <i data-lucide="pencil" style="width: 12px; height: 12px;"></i> Düzenle
            </button>
            <div class="dropdown-menu-panel glass-panel action-menu-dropdown" id="action-menu-${student.id}" style="display: none; position: absolute; bottom: 100%; right: 0; min-width: 140px; z-index: 150; padding: 4px; border-radius: var(--radius-md); border: 1px solid var(--color-border); background: var(--bg-sidebar); box-shadow: var(--shadow-glass); text-align: left;">
              <button type="button" onclick="window.editStudentProfileAction('${student.id}'); event.stopPropagation();" style="width: 100%; padding: 6px 10px; font-size: 11px; text-align: left; background: none; border: none; color: var(--text-main); cursor: pointer; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 6px;" class="action-dropdown-item">
                <i data-lucide="user-cog" style="width: 12px; height: 12px; color: var(--color-students);"></i>
                Profili Düzenle
              </button>
              <div style="border-top: 1px solid var(--color-border); margin: 3px 0;"></div>
              <button type="button" onclick="window.changeStudentStatusAction('${student.id}', '${student.status === 'Aktif' ? 'Pasif' : 'Aktif'}'); event.stopPropagation();" style="width: 100%; padding: 6px 10px; font-size: 11px; text-align: left; background: none; border: none; color: var(--text-main); cursor: pointer; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 6px;" class="action-dropdown-item">
                <i data-lucide="${student.status === 'Aktif' ? 'toggle-left' : 'toggle-right'}" style="width: 12px; height: 12px; color: ${student.status === 'Aktif' ? 'var(--danger)' : 'var(--success)'};"></i>
                ${student.status === 'Aktif' ? 'Pasif Yap' : 'Aktif Yap'}
              </button>
              <div style="border-top: 1px solid var(--color-border); margin: 3px 0;"></div>
              <button type="button" onclick="window.deleteStudentAction('${student.id}'); event.stopPropagation();" style="width: 100%; padding: 6px 10px; font-size: 11px; text-align: left; background: none; border: none; color: var(--danger); cursor: pointer; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 6px;" class="action-dropdown-item">
                <i data-lucide="trash-2" style="width: 12px; height: 12px;"></i> Kaydı Sil
              </button>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  updateSortHeadersUI();
  if (window.lucide) window.lucide.createIcons();
}

// Global Student Deleter
window.deleteStudent = (id) => {
  const student = state.students.find(s => s.id === id);
  if (student && confirm(`${student.name} isimli öğrencinin kaydını silmek istediğinize emin misiniz?`)) {
    state.students = state.students.filter(s => s.id !== id);
    state.attendance.records = state.attendance.records.filter(r => r.studentId !== id);
    renderAll();
    showToast('Öğrenci kaydı başarıyla silindi.');
  }
};

// Global Category Deleter
window.deleteCategory = (id) => {
  const cat = state.categories.find(c => c.id === id);
  if (!cat) return;

  const usedByStudents = state.students.some(s => s.category === id);
  if (usedByStudents) {
    showToast(`"${cat.name}" kategorisi öğrencilere atanmış, silinemez.`, 'error');
    return;
  }

  if (confirm(`"${cat.name} (${cat.code})" kategorisini silmek istediğinize emin misiniz?`)) {
    state.categories = state.categories.filter(c => c.id !== id);
    localStorage.setItem('edu_categories', JSON.stringify(state.categories));
    populateCategoryDropdowns();
    renderCategoryList();
    showToast(`✅ "${cat.name}" kategorisi silindi.`);
  }
};

// 2. YOKLAMA CHECKLIST RENDER
function renderAttendanceList() {
  const tableBody = document.getElementById('attendance-table-body');
  if (!tableBody) return;

  const classFilter = document.getElementById('attendance-grade-select').value;
  
  // Filter attendance records by selected class
  const filtered = state.attendance.records.filter(record => {
    if (classFilter === 'all') return true;
    const student = state.students.find(s => s.id === record.studentId);
    return student && student.grade === classFilter;
  });

  // Calculate live summary stats
  let present = 0, absent = 0, excused = 0;
  filtered.forEach(r => {
    if (r.status === 'present') present++;
    else if (r.status === 'absent') absent++;
    else excused++;
  });

  document.getElementById('cnt-present').innerText = present;
  document.getElementById('cnt-absent').innerText = absent;
  document.getElementById('cnt-excused').innerText = excused;

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">Bu sınıf için kayıtlı öğrenci bulunmamaktadır.</td></tr>`;
    return;
  }

  tableBody.innerHTML = filtered.map(record => {
    const student = state.students.find(s => s.id === record.studentId);
    const grade = student ? student.grade : '-';
    
    // SMS dispatch button simulation
    const smsAction = record.status === 'absent' ?
      `<button class="yoklama-action-btn absent active" style="font-size:10px; display:inline-flex; align-items:center; gap:4px; animation: pulse 2s infinite;" id="btn-sms-${record.studentId}" onclick="window.sendAbsentSms('${record.studentId}')"><i data-lucide="message-square" style="width:10px; height:10px;"></i> Veliye SMS Gönder</button>` :
      `<span style="color:var(--text-muted); font-size:11px;">Gerekli değil</span>`;

    return `
      <tr>
        <td>${record.studentId}</td>
        <td style="font-weight: 600;">${record.name}</td>
        <td><span class="badge badge-info">${grade}</span></td>
        <td>
          <div class="yoklama-btn-group">
            <button class="yoklama-action-btn present ${record.status === 'present' ? 'active' : ''}" 
                    onclick="window.toggleAttendance('${record.studentId}', 'present')">Geldi</button>
            <button class="yoklama-action-btn absent ${record.status === 'absent' ? 'active' : ''}" 
                    onclick="window.toggleAttendance('${record.studentId}', 'absent')">Gelmedi</button>
            <button class="yoklama-action-btn excused ${record.status === 'excused' ? 'active' : ''}" 
                    onclick="window.toggleAttendance('${record.studentId}', 'excused')">İzinli</button>
          </div>
        </td>
        <td>${smsAction}</td>
        <td style="font-family: monospace; font-size: 13px;">${record.time}</td>
      </tr>
    `;
  }).join('');
}

// Global Yoklama toggler helper
window.toggleAttendance = (studentId, status) => {
  const record = state.attendance.records.find(r => r.studentId === studentId);
  if (record) {
    record.status = status;
    record.time = status === 'present' ? new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '-';
    renderAttendanceList();
  }
};

// 3. GENEL DUYURU FEED RENDER
function renderAnnouncementsFeed() {
  const feedContainer = document.getElementById('announcements-feed');
  if (!feedContainer) return;

  const getTargetBadge = (target) => {
    switch (target) {
      case 'all': return `<span class="badge badge-info"><i data-lucide="globe" style="width: 10px; height: 10px; margin-right: 3px;"></i> Herkes</span>`;
      case 'students': return `<span class="badge badge-success"><i data-lucide="graduation-cap" style="width: 10px; height: 10px; margin-right: 3px;"></i> Öğrenci</span>`;
      case 'parents': return `<span class="badge badge-warning"><i data-lucide="users" style="width: 10px; height: 10px; margin-right: 3px;"></i> Veliler</span>`;
      case 'staff': return `<span class="badge badge-danger"><i data-lucide="shield" style="width: 10px; height: 10px; margin-right: 3px;"></i> Personel</span>`;
      default: return '';
    }
  };

  feedContainer.innerHTML = state.announcements.map(ann => {
    return `
      <div class="feed-card">
        <div class="feed-card-header">
          <h4>${ann.title}</h4>
          ${getTargetBadge(ann.target)}
        </div>
        <div class="feed-card-meta">
          <span><i data-lucide="user" style="width: 12px; height: 12px;"></i> ${ann.author}</span>
          <span><i data-lucide="calendar" style="width: 12px; height: 12px;"></i> ${ann.date}</span>
        </div>
        <p>${ann.content}</p>
      </div>
    `;
  }).join('');
  
  if (window.lucide) window.lucide.createIcons();
}

// 4. ETÜTLENDİRME VIEW RENDER
function renderStudiesView() {
  const container = document.getElementById('etut-list-container');
  if (!container) return;

  if (state.studies.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 32px;">Kayıtlı aktif etüt programı bulunmamaktadır.</div>`;
    return;
  }

  container.innerHTML = state.studies.map(study => {
    let statusClass = 'badge-success';
    if (study.status === 'Beklemede') statusClass = 'badge-warning';
    else if (study.status === 'Tamamlandı') statusClass = 'badge-info';

    return `
      <div class="etut-item-card">
        <div class="etut-info-primary">
          <h4>${study.studentName}</h4>
          <p>${study.subject}</p>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px; display: flex; align-items: center; gap: 4px;">
            <i data-lucide="user-check" style="width: 12px; height: 12px;"></i> ${study.teacherName}
          </div>
        </div>
        <div class="etut-info-details">
          <span class="etut-time-slot">${study.time}</span>
          <span style="font-size: 11px; color: var(--text-muted);">${study.date}</span>
          <span class="badge ${statusClass}">${study.status}</span>
        </div>
      </div>
    `;
  }).join('');
  
  if (window.lucide) window.lucide.createIcons();
}

// 5. REHBERLİK CONSULTATION RENDER
function renderCounselingTable() {
  const tableBody = document.getElementById('counseling-table-body');
  if (!tableBody) return;

  const searchQuery = document.getElementById('counseling-search').value.toLowerCase();

  const filtered = state.counseling.filter(item => {
    return item.studentName.toLowerCase().includes(searchQuery) ||
           item.topic.toLowerCase().includes(searchQuery) ||
           item.counselorName.toLowerCase().includes(searchQuery);
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">Görüşme kaydı bulunmamaktadır.</td></tr>`;
    return;
  }

  tableBody.innerHTML = filtered.map(item => {
    return `
      <tr>
        <td>
          <div style="display: flex; flex-direction: column;">
            <span style="font-weight: 600;">${item.date}</span>
            <span style="font-size: 11px; color: var(--text-muted);">${item.time}</span>
          </div>
        </td>
        <td style="font-weight: 600; color: var(--color-counseling);">${item.studentName}</td>
        <td>${item.counselorName}</td>
        <td><span class="badge badge-info">${item.topic}</span></td>
        <td style="max-width: 320px; font-size: 13px; color: var(--text-secondary);">${item.notes}</td>
        <td>
          <button class="yoklama-action-btn" onclick="window.deleteCounseling('${item.id}')" style="color: var(--danger);">Sil</button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteCounseling = (id) => {
  if (confirm('Bu görüşme kaydını silmek istediğinize emin misiniz?')) {
    state.counseling = state.counseling.filter(c => c.id !== id);
    renderCounselingTable();
    renderMetrics();
    showToast('Kayıt silindi.');
  }
};

// 6. DERS SAATLERİ PROGRAM GRID RENDER
function renderScheduleGrid() {
  const container = document.getElementById('schedule-grid');
  if (!container) return;

  const selectedClass = document.getElementById('hours-class-select').value;
  const classSchedule = state.schedule.data[selectedClass] || {};

  // Build grid layout dynamic
  let html = ``;

  // 1. Day headers row (Top Left cell is 'Saat' and then Monday to Friday)
  html += `<div class="schedule-header" style="background-color: var(--color-input-bg); border-color: var(--color-border); color: var(--text-muted);">Saat</div>`;
  state.schedule.days.forEach(day => {
    html += `<div class="schedule-header">${day}</div>`;
  });

  // 2. Periods rows
  state.schedule.hours.forEach(hour => {
    // Left column shows period time
    html += `
      <div class="schedule-time-cell">
        <strong>${hour.period}. Ders</strong>
        <span>${hour.time}</span>
      </div>
    `;

    // 5 day cells for this period hour
    state.schedule.days.forEach(day => {
      const lessons = classSchedule[day] || [];
      const lessonName = lessons[hour.period - 1] || 'Boş / Serbest Çalışma';
      
      const isEmpty = lessonName.includes('Boş') || lessonName.includes('Serbest');
      const cellClass = isEmpty ? 'schedule-lesson-cell empty' : 'schedule-lesson-cell';
      
      html += `
        <div class="${cellClass}">
          <span>${lessonName}</span>
        </div>
      `;
    });
  });

  container.innerHTML = html;
}

// 7. ÖDEVLENDİRME TAKİP RENDER
function renderHomeworkList() {
  const container = document.getElementById('homework-list-container');
  if (!container) return;

  if (state.homeworks.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 32px;">Atanmış aktif ödev bulunmamaktadır.</div>`;
    return;
  }

  container.innerHTML = state.homeworks.map(hw => {
    // Parse submission percentage
    const parts = hw.submissions.split('/');
    const current = parseInt(parts[0], 10);
    const total = parseInt(parts[1], 10);
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;

    return `
      <div class="homework-item-card">
        <div class="feed-card-header" style="margin-bottom: 4px;">
          <h4>${hw.title}</h4>
          <span class="badge badge-info">${hw.grade} Sınıfı</span>
        </div>
        <div class="homework-meta">
          <span><strong style="color: var(--color-homework);">${hw.subject}</strong></span>
          <span>Son Teslim: <strong>${hw.dueDate}</strong></span>
        </div>
        <p class="homework-desc" style="white-space: pre-line;">${hw.description}</p>
        
        <div class="homework-progress-wrapper">
          <div class="progress-labels">
            <span>Teslim Edenler</span>
            <span>%${pct} (${hw.submissions})</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${pct}%;"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 8. PERSONEL İŞLERİ GRID RENDER
function renderStaffGrid() {
  const container = document.getElementById('staff-grid-container');
  if (!container) return;

  container.innerHTML = state.staff.map(person => {
    return `
      <div class="staff-card">
        <div class="staff-avatar">${person.avatar}</div>
        <h3>${person.name}</h3>
        <div class="staff-role">${person.role}</div>
        <span class="badge badge-success">${person.status}</span>
        
        <div class="staff-details">
          <span><i data-lucide="phone"></i> ${person.contact}</span>
          <span><i data-lucide="briefcase"></i> ${person.department} Dep.</span>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

// Helper to update student and staff select options in Study / Guidance booking panels dynamically
function populateFormSelects() {
  // Study Scheduler dropdowns
  const studyStudentSelect = document.getElementById('study-student');
  const studyTeacherSelect = document.getElementById('study-teacher');

  if (studyStudentSelect) {
    studyStudentSelect.innerHTML = state.students
      .map(s => `<option value="${s.name}">${s.name} (${s.grade})</option>`)
      .join('');
  }

  if (studyTeacherSelect) {
    studyTeacherSelect.innerHTML = state.staff
      .filter(st => st.role.includes('Öğretmen'))
      .map(st => `<option value="${st.name}">${st.name} (${st.role})</option>`)
      .join('');
  }

  // Populate category dropdown
  populateCategoryDropdowns();
}

// ----------------------------------------------------
// STATISTICS CHARTS GENERATOR (CHART.JS)
// ----------------------------------------------------
function renderCharts() {
  // Ensure chart variables are destroyed to recreate them cleanly without overlaps
  const chartKeys = ['attendance', 'studies', 'homework', 'radar'];
  chartKeys.forEach(key => {
    if (charts[key]) {
      charts[key].destroy();
      charts[key] = null;
    }
  });

  // Dynamic colors depending on active theme (Dark Mode / Light Mode styling)
  const isDark = document.body.classList.contains('dark-theme');
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  // Chart 1: Attendance Trends (Line Chart)
  const attCanvas = document.getElementById('attendanceChart');
  if (attCanvas) {
    charts.attendance = new Chart(attCanvas, {
      type: 'line',
      data: {
        labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum'],
        datasets: [{
          label: 'Katılım Oranı (%)',
          data: [92, 85, 78, 88, 71],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: { min: 0, max: 100, grid: { color: gridColor }, ticks: { color: textColor } }
        }
      }
    });
  }

  // Chart 2: Studies Bookings By Teacher (Bar Chart)
  const stdCanvas = document.getElementById('studiesChart');
  if (stdCanvas) {
    const teacherStats = {};
    state.studies.forEach(st => {
      const name = st.teacherName.split(' ')[0];
      teacherStats[name] = (teacherStats[name] || 0) + 1;
    });

    const labels = Object.keys(teacherStats);
    const data = Object.values(teacherStats);

    charts.studies = new Chart(stdCanvas, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['Murat', 'Selin', 'Hakan'],
        datasets: [{
          label: 'Etüt Sayısı',
          data: data.length ? data : [1, 2, 1],
          backgroundColor: '#ff7e47',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor } },
          y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1 } }
        }
      }
    });
  }

  // Chart 3: Homework Submissions Progress (Horizontal Bar Chart)
  const hwCanvas = document.getElementById('homeworkChart');
  if (hwCanvas) {
    const labels = state.homeworks.map(h => h.title);
    const percentages = state.homeworks.map(h => {
      const parts = h.submissions.split('/');
      return Math.round((parseInt(parts[0], 10) / parseInt(parts[1], 10)) * 100);
    });

    charts.homework = new Chart(hwCanvas, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['Ödev 1', 'Ödev 2'],
        datasets: [
          {
            label: 'Teslim Oranı (%)',
            data: percentages.length ? percentages : [71, 42],
            backgroundColor: '#f43f5e',
            borderRadius: 6
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { min: 0, max: 100, grid: { color: gridColor }, ticks: { color: textColor } },
          y: { grid: { display: false }, ticks: { color: textColor } }
        }
      }
    });
  }

  // UPGRADED Chart 4: KAZANIM RADAR CHART (SUBJECT ANALYSIS)
  const radarCanvas = document.getElementById('kazanimRadarChart');
  if (radarCanvas) {
    const labels = ["Türev Alabilme", "Trigonometri", "Polinomlar", "Dalga Mekaniği", "Newton Yasaları", "Modern Atom Teorisi", "Gaz Yasaları"];
    const averages = [82, 68, 75, 70, 85, 88, 72];

    charts.radar = new Chart(radarCanvas, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Kurum Ortalama Başarısı (%)',
          data: averages,
          backgroundColor: 'rgba(255, 90, 54, 0.2)',
          borderColor: '#ff5a36',
          pointBackgroundColor: '#ff5a36',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#ff5a36',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          r: {
            angleLines: { color: gridColor },
            grid: { color: gridColor },
            pointLabels: { color: textColor, font: { family: 'Outfit', size: 10 } },
            ticks: { display: false },
            suggestedMin: 0,
            suggestedMax: 100
          }
        }
      }
    });
  }
}

// ----------------------------------------------------
// TOAST NOTIFICATIONS (TOASTS)
// ----------------------------------------------------
function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.position = 'fixed';
    container.style.bottom = '24px';
    container.style.right = '24px';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.style.background = 'rgba(15, 23, 42, 0.9)';
  toast.style.color = '#fff';
  toast.style.padding = '14px 24px';
  toast.style.borderRadius = '12px';
  toast.style.fontSize = '13px';
  toast.style.fontWeight = '600';
  toast.style.border = '1px solid rgba(255, 90, 54, 0.3)';
  toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
  toast.style.backdropFilter = 'blur(10px)';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '10px';
  toast.style.transform = 'translateY(20px)';
  toast.style.opacity = '0';
  toast.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';

  toast.innerHTML = `
    <i data-lucide="check" style="color: #10b981; width: 18px; height: 18px;"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  // Animation Trigger
  setTimeout(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  }, 10);

  // Remove Trigger after 3.5 seconds
  setTimeout(() => {
    toast.style.transform = 'translateY(-20px)';
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

// ----------------------------------------------------
// GROUP & CLASS MANAGEMENT LOGIC
// ----------------------------------------------------
function renderManageGroupsList() {
  const container = document.getElementById('manage-groups-list');
  if (!container) return;

  if (state.categories.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 11px; padding: 12px;">Henüz grup bulunmuyor.</div>`;
    return;
  }

  container.innerHTML = state.categories.map(cat => {
    return `
      <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-main); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${cat.color};"></span>
          <span style="font-size: 12px; font-weight: 600; color: var(--text-main);">${cat.name}</span>
          <span class="badge" style="background: ${cat.color}22; color: ${cat.color}; font-size: 10px; padding: 1px 6px;">${cat.code}</span>
        </div>
        <div style="display: flex; gap: 6px;">
          <button type="button" class="btn btn-secondary" onclick="window.editGroupAction('${cat.id}')" style="padding: 4px 6px; font-size: 10px; height: auto;" title="Düzenle">
            <i data-lucide="pencil" style="width: 10px; height: 10px;"></i>
          </button>
          <button type="button" class="btn btn-secondary" onclick="window.deleteGroupActionConfirm('${cat.id}')" style="padding: 4px 6px; font-size: 10px; height: auto; color: var(--danger);" title="Sil">
            <i data-lucide="trash-2" style="width: 10px; height: 10px;"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
  if (window.lucide) window.lucide.createIcons();
}

window.editGroupAction = (id) => {
  const cat = state.categories.find(c => c.id === id);
  if (!cat) return;
  
  document.getElementById('edit-group-id').value = cat.id;
  document.getElementById('group-name-input').value = cat.name;
  document.getElementById('group-code-input').value = cat.code;
  document.getElementById('group-color-input').value = cat.color;
  
  document.getElementById('title-group-form').innerText = 'Grubu Düzenle';
  document.getElementById('btn-cancel-group-edit').style.display = 'inline-block';
};

window.deleteGroupActionConfirm = (id) => {
  const cat = state.categories.find(c => c.id === id);
  if (!cat) return;

  // Check if any class is using this group
  const linkedClasses = state.grades.filter(g => g.categoryId === id);
  if (linkedClasses.length > 0) {
    alert(`Bu gruba bağlı ${linkedClasses.length} sınıf bulunmaktadır (${linkedClasses.map(g => g.name).join(', ')}). Lütfen önce sınıfları silin veya başka gruba bağlayın.`);
    return;
  }

  if (confirm(`"${cat.name}" grubunu silmek istediğinize emin misiniz?`)) {
    state.categories = state.categories.filter(c => c.id !== id);
    localStorage.setItem('edu_categories', JSON.stringify(state.categories));
    showToast(`"${cat.name}" grubu silindi.`);
    renderManageGroupsList();
    populateClassGroupSelect();
    renderAll();
  }
};

function renderManageClassesList() {
  const container = document.getElementById('manage-classes-list');
  if (!container) return;

  if (state.grades.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 11px; padding: 12px;">Henüz sınıf bulunmuyor.</div>`;
    return;
  }

  container.innerHTML = state.grades.map(grade => {
    const cat = state.categories.find(c => c.id === grade.categoryId);
    const catLabel = cat ? cat.code : '—';
    const catColor = cat ? cat.color : 'var(--text-muted)';
    return `
      <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-main); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 12px; font-weight: 600; color: var(--text-main);">${grade.name}</span>
          <span class="badge" style="background: ${catColor}22; color: ${catColor}; font-size: 10px; padding: 1px 6px;">${catLabel}</span>
        </div>
        <div style="display: flex; gap: 6px;">
          <button type="button" class="btn btn-secondary" onclick="window.editClassAction('${grade.name}')" style="padding: 4px 6px; font-size: 10px; height: auto;" title="Düzenle">
            <i data-lucide="pencil" style="width: 10px; height: 10px;"></i>
          </button>
          <button type="button" class="btn btn-secondary" onclick="window.deleteClassActionConfirm('${grade.name}')" style="padding: 4px 6px; font-size: 10px; height: auto; color: var(--danger);" title="Sil">
            <i data-lucide="trash-2" style="width: 10px; height: 10px;"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
  if (window.lucide) window.lucide.createIcons();
}

window.editClassAction = (className) => {
  const grade = state.grades.find(g => g.name === className);
  if (!grade) return;
  
  document.getElementById('edit-class-name-old').value = grade.name;
  document.getElementById('class-name-input').value = grade.name;
  document.getElementById('class-group-select').value = grade.categoryId || '';
  
  document.getElementById('title-class-form').innerText = 'Sınıfı Düzenle';
  document.getElementById('btn-cancel-class-edit').style.display = 'inline-block';
};

window.deleteClassActionConfirm = (className) => {
  const grade = state.grades.find(g => g.name === className);
  if (!grade) return;

  // Check if any student belongs to this class
  const linkedStudents = state.students.filter(s => s.grade === className);
  if (linkedStudents.length > 0) {
    alert(`Bu sınıfta ${linkedStudents.length} öğrenci kayıtlıdır. Öğrencilerin sınıflarını güncellemeden bu sınıfı silemezsiniz.`);
    return;
  }

  if (confirm(`"${grade.name}" sınıfını silmek istediğinize emin misiniz?`)) {
    state.grades = state.grades.filter(g => g.name !== className);
    localStorage.setItem('edu_grades', JSON.stringify(state.grades));
    showToast(`"${grade.name}" sınıfı silindi.`);
    renderManageClassesList();
    renderAll();
  }
};

function populateClassGroupSelect() {
  const select = document.getElementById('class-group-select');
  if (!select) return;
  
  if (state.categories.length === 0) {
    select.innerHTML = `<option value="">Önce bir grup oluşturun</option>`;
    return;
  }
  
  select.innerHTML = state.categories.map(cat => {
    return `<option value="${cat.id}">${cat.name} (${cat.code})</option>`;
  }).join('');
}

function setupGroupAndClassManagementEvents() {
  const formGroup = document.getElementById('form-manage-group');
  const cancelGroupEdit = document.getElementById('btn-cancel-group-edit');
  
  if (formGroup) {
    formGroup.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('edit-group-id').value;
      const name = document.getElementById('group-name-input').value.trim();
      const code = document.getElementById('group-code-input').value.trim().toUpperCase();
      const color = document.getElementById('group-color-input').value;
      
      if (!name || !code) return;
      
      if (editId) {
        // Edit mode
        const cat = state.categories.find(c => c.id === editId);
        if (cat) {
          cat.name = name;
          cat.code = code;
          cat.color = color;
          showToast(`"${name}" grubu güncellendi.`);
        }
      } else {
        // Create mode
        const newId = name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
        state.categories.push({ id: newId, name, code, color });
        showToast(`"${name}" grubu başarıyla eklendi.`);
      }
      
      localStorage.setItem('edu_categories', JSON.stringify(state.categories));
      
      // Reset group form
      formGroup.reset();
      document.getElementById('edit-group-id').value = '';
      document.getElementById('title-group-form').innerText = 'Yeni Grup Ekle';
      if (cancelGroupEdit) cancelGroupEdit.style.display = 'none';
      
      renderManageGroupsList();
      populateClassGroupSelect();
      renderAll();
    });
  }
  
  if (cancelGroupEdit) {
    cancelGroupEdit.addEventListener('click', () => {
      formGroup.reset();
      document.getElementById('edit-group-id').value = '';
      document.getElementById('title-group-form').innerText = 'Yeni Grup Ekle';
      cancelGroupEdit.style.display = 'none';
    });
  }

  const formClass = document.getElementById('form-manage-class');
  const cancelClassEdit = document.getElementById('btn-cancel-class-edit');
  
  if (formClass) {
    formClass.addEventListener('submit', (e) => {
      e.preventDefault();
      const editNameOld = document.getElementById('edit-class-name-old').value;
      const name = document.getElementById('class-name-input').value.trim();
      const categoryId = document.getElementById('class-group-select').value;
      
      if (!name || !categoryId) return;
      
      if (editNameOld) {
        // Edit mode
        const grade = state.grades.find(g => g.name === editNameOld);
        if (grade) {
          // Check if name changed and duplicates other classes
          if (name !== editNameOld && state.grades.some(g => g.name === name)) {
            alert('Bu isimde bir sınıf zaten mevcut.');
            return;
          }
          
          grade.name = name;
          grade.categoryId = categoryId;
          
          // Cascading update: update students grade
          state.students.forEach(s => {
            if (s.grade === editNameOld) {
              s.grade = name;
            }
          });
          
          showToast(`"${name}" sınıfı güncellendi.`);
        }
      } else {
        // Create mode
        if (state.grades.some(g => g.name === name)) {
          alert('Bu isimde bir sınıf zaten mevcut.');
          return;
        }
        state.grades.push({ name, categoryId });
        showToast(`"${name}" sınıfı başarıyla eklendi.`);
      }
      
      localStorage.setItem('edu_grades', JSON.stringify(state.grades));
      
      // Reset class form
      formClass.reset();
      document.getElementById('edit-class-name-old').value = '';
      document.getElementById('title-class-form').innerText = 'Yeni Sınıf Ekle';
      if (cancelClassEdit) cancelClassEdit.style.display = 'none';
      
      renderManageClassesList();
      renderAll();
    });
  }
  
  if (cancelClassEdit) {
    cancelClassEdit.addEventListener('click', () => {
      formClass.reset();
      document.getElementById('edit-class-name-old').value = '';
      document.getElementById('title-class-form').innerText = 'Yeni Sınıf Ekle';
      cancelClassEdit.style.display = 'none';
    });
  }
}

// ----------------------------------------------------
// VISUAL CATEGORY & CLASS GRID AND CARD LOGIC
// ----------------------------------------------------
function saveStudents() {
  localStorage.setItem('edu_students', JSON.stringify(state.students));
}

function seedMockStudentsIfNecessary() {
  const categoriesToSeed = ['sayisal', 'esit_agirlik', 'sozel', 'dil'];
  
  const firstNames = ['Ali', 'Ayşe', 'Mehmet', 'Fatma', 'Ahmet', 'Zeynep', 'Mustafa', 'Elif', 'Can', 'Merve', 'Eren', 'Selin', 'Burak', 'Büşra', 'Emre', 'Gamze', 'Hakan', 'Seda', 'Oğuz', 'Gizem'];
  const lastNames = ['Yılmaz', 'Demir', 'Kaya', 'Çelik', 'Öztürk', 'Arslan', 'Şahin', 'Yıldız', 'Koç', 'Aydın', 'Özdemir', 'Kılıç', 'Kurt', 'Özcan', 'Köse', 'Çetin', 'Polat', 'Güler', 'Bulut', 'Yalçın'];
  
  let currentMaxId = 0;
  state.students.forEach(s => {
    const num = parseInt(s.id.replace('STU', ''));
    if (num > currentMaxId) currentMaxId = num;
  });

  let changed = false;

  categoriesToSeed.forEach(catId => {
    const existing = state.students.filter(s => s.category === catId);
    if (existing.length < 10) {
      const targetCount = Math.floor(12 + Math.random() * 6); // Random count 12-17
      const toGenerate = targetCount - existing.length;
      
      const catGrades = state.grades.filter(g => g.categoryId === catId);
      if (catGrades.length === 0) {
        const defaultGradeName = catId === 'sayisal' ? '12-A' : (catId === 'esit_agirlik' ? '12-B' : (catId === 'sozel' ? '11-A' : '10-A'));
        state.grades.push({ name: defaultGradeName, categoryId: catId });
        catGrades.push(state.grades[state.grades.length - 1]);
      }

      for (let i = 0; i < toGenerate; i++) {
        currentMaxId++;
        const id = `STU${String(currentMaxId).padStart(3, '0')}`;
        const name = firstNames[Math.floor(Math.random() * firstNames.length)] + ' ' + lastNames[Math.floor(Math.random() * lastNames.length)];
        const gradeObj = catGrades[Math.floor(Math.random() * catGrades.length)];
        
        const phone = '053' + Math.floor(Math.random() * 10) + ' ' + Math.floor(Math.random() * 1000) + ' ' + Math.floor(Math.random() * 10000);
        const parentPhone = '054' + Math.floor(Math.random() * 10) + ' ' + Math.floor(Math.random() * 1000) + ' ' + Math.floor(Math.random() * 10000);
        
        const tcNo = String(10000000000 + Math.floor(Math.random() * 90000000000));
        const parentTc = String(10000000000 + Math.floor(Math.random() * 90000000000));
        
        const parentName = firstNames[Math.floor(Math.random() * firstNames.length)] + ' ' + lastNames[Math.floor(Math.random() * lastNames.length)];

        state.students.push({
          id,
          name,
          grade: gradeObj.name,
          category: catId,
          phone,
          tcNo,
          birthDate: '2008-05-12',
          address: 'Eğitim Cad. No: 12, İstanbul',
          status: 'Aktif',
          parentName,
          parent1: {
            name: parentName,
            phone: parentPhone,
            tcNo: parentTc,
            birthDate: '1980-03-24',
            address: 'Eğitim Cad. No: 12, İstanbul'
          },
          parent2: { name: '', phone: '', tcNo: '', birthDate: '', address: '' },
          finance: { contractTotal: 45000, paid: 0, remaining: 45000, installments: 10, payments: [] },
          exams: [],
          behaviorPoints: 100
        });
      }
      changed = true;
    }
  });

  if (changed) {
    localStorage.setItem('edu_students', JSON.stringify(state.students));
  }
}

function enableDragScroll(el) {
  let isDown = false;
  let startX;
  let scrollLeft;
  
  el.addEventListener('mousedown', (e) => {
    isDown = true;
    el.style.cursor = 'grabbing';
    startX = e.pageX - el.offsetLeft;
    scrollLeft = el.scrollLeft;
  });
  el.addEventListener('mouseleave', () => {
    isDown = false;
    el.style.cursor = 'grab';
  });
  el.addEventListener('mouseup', () => {
    isDown = false;
    el.style.cursor = 'grab';
  });
  el.addEventListener('mousemove', (e) => {
    if(!isDown) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    el.scrollLeft = scrollLeft - walk;
  });
}

function renderInlineCategoriesAndClasses() {
  const container = document.getElementById('inline-categories-classes-container');
  if (!container) return;

  if (state.categories.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 12px; font-size: 13px;">
        Henüz kategori tanımlanmadı. Sınıfları oluşturmak için önce "Kategori Oluştur" butonu ile bir kategori ekleyin.
      </div>
    `;
    return;
  }

  container.innerHTML = state.categories.map(cat => {
    const catStudentCount = state.students.filter(s => s.category === cat.id).length;
    const catGrades = state.grades.filter(g => g.categoryId === cat.id);
    catGrades.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    const classesHtml = catGrades.map(grade => {
      const count = state.students.filter(s => s.grade === grade.name).length;
      const isActive = state.selectedClassFilter === grade.name;
      const catColor = cat.color || 'var(--color-students)';
      
      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
          <div class="class-card ${isActive ? 'active-class-card' : ''}" 
               onclick="window.toggleSelectClassInline('${grade.name}')" 
               style="position: relative; width: 42px; height: 42px; border: 1px solid var(--color-border); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; cursor: pointer; background: var(--bg-sidebar); transition: all 0.2s; box-shadow: var(--shadow-sm); ${isActive ? `border-color: ${catColor} !important; box-shadow: 0 0 8px ${catColor}77; border-width: 2px;` : ''}">
            <span style="font-size: 11px; font-weight: 700; color: var(--text-main);">${grade.name}</span>
            <button type="button" onclick="window.showClassStudentsList('${grade.name}', event)" style="position: absolute; top: -6px; left: -6px; background: var(--color-students); border: none; width: 14px; height: 14px; border-radius: 50%; color: #fff; font-size: 8px; cursor: pointer; display: none; align-items: center; justify-content: center; z-index: 10;" class="class-popup-btn" title="Öğrenci Listesi"><i data-lucide="eye" style="width: 8px; height: 8px;"></i></button>
            <button type="button" onclick="window.deleteClassInline('${grade.name}', event)" style="position: absolute; top: -6px; right: -6px; background: var(--danger); border: none; width: 14px; height: 14px; border-radius: 50%; color: #fff; font-size: 8px; cursor: pointer; display: none; align-items: center; justify-content: center; z-index: 10;" class="class-delete-btn" title="Sınıfı Sil">&times;</button>
          </div>
          <span style="font-size: 8px; color: var(--text-muted); font-weight: 600;">${count} Öğr.</span>
        </div>
      `;
    }).join('');

    return `
      <div class="category-row-container" style="display: flex; flex-direction: column; gap: 8px; padding: 10px 14px; border-radius: var(--radius-md); background: var(--bg-main); border: 1px solid var(--color-border);">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h4 style="font-size: 13px; font-weight: 700; color: var(--text-main); margin: 0; display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${cat.color};"></span>
            ${cat.name} <span style="font-size: 11px; font-weight: 500; color: var(--text-muted);">(${catStudentCount} Öğrenci)</span>
          </h4>
          <button type="button" class="cat-delete-btn btn btn-secondary" onclick="window.deleteCategoryInline('${cat.id}', event)" style="padding: 2px 6px; font-size: 9px; height: auto; opacity: 0; transition: opacity 0.2s; color: var(--danger);" title="Kategoriyi Sil">
            Kategoriyi Sil
          </button>
        </div>
        <div class="class-cards-scroll-container" style="display: flex; gap: 12px; align-items: center; overflow-x: auto; padding: 6px 4px; white-space: nowrap; -webkit-overflow-scrolling: touch;">
          ${classesHtml}
          <!-- Plus Card -->
          <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
            <div class="class-plus-card" onclick="window.promptCreateClass('${cat.id}')" style="width: 42px; height: 42px; border: 1px dashed var(--color-border); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-muted); background: var(--color-input-bg); transition: all 0.2s;" title="Sınıf Ekle">
              <i data-lucide="plus" style="width: 14px; height: 14px;"></i>
            </div>
            <span style="font-size: 8px; color: transparent;">Ekle</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();

  // Attach Drag Scroll
  document.querySelectorAll('.class-cards-scroll-container').forEach(el => {
    el.style.cursor = 'grab';
    enableDragScroll(el);
  });
}

window.showClassStudentsList = (className, event) => {
  if (event) event.stopPropagation();
  const modal = document.getElementById('modal-class-students');
  const title = document.getElementById('class-students-title');
  const badge = document.getElementById('class-students-count-badge');
  const tbody = document.getElementById('class-students-table-body');
  
  if (!modal || !title || !badge || !tbody) return;

  const students = state.students.filter(s => s.grade === className);
  
  title.innerHTML = `<i data-lucide="users" style="color:var(--color-students);"></i> ${className} Sınıfı Öğrenci Listesi`;
  badge.innerText = `Mevcut: ${students.length} Öğrenci`;
  
  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px; color: var(--text-muted);">Bu sınıfta henüz kayıtlı öğrenci bulunmuyor.</td></tr>`;
  } else {
    tbody.innerHTML = students.map(s => {
      const parentPhone = s.parent1?.phone || s.parentPhone || '—';
      const studentPhone = s.phone || s.contact || '—';
      return `
        <tr style="border-bottom: 1px solid var(--color-border);">
          <td style="padding: 10px 12px; color: var(--text-main); font-weight: 600;">${s.id}</td>
          <td style="padding: 10px 12px; color: var(--text-main); font-weight: 700;">${s.name}</td>
          <td style="padding: 10px 12px; color: var(--text-main);">${studentPhone}</td>
          <td style="padding: 10px 12px; color: var(--text-main);">${parentPhone}</td>
        </tr>
      `;
    }).join('');
  }
  
  modal.style.display = 'flex';
  if (window.lucide) window.lucide.createIcons();
};

window.toggleSelectClassInline = (className) => {
  if (state.selectedClassFilter === className) {
    state.selectedClassFilter = null;
  } else {
    state.selectedClassFilter = className;
  }
  
  // Close the modal automatically so they can see the filtered table on the page
  const gridModal = document.getElementById('modal-categories-grid');
  if (gridModal) {
    gridModal.classList.remove('active');
  }

  renderInlineCategoriesAndClasses();
  renderStudentsTable();
};

window.deleteCategoryInline = (id, event) => {
  event.stopPropagation();
  const cat = state.categories.find(c => c.id === id);
  if (!cat) return;

  const linkedClasses = state.grades.filter(g => g.categoryId === id);
  if (linkedClasses.length > 0) {
    alert(`Bu kategoriye bağlı ${linkedClasses.length} sınıf bulunmaktadır. Kategoriyi silebilmek için önce bu sınıfları silmelisiniz.`);
    return;
  }

  if (confirm(`"${cat.name}" kategorisini silmek istediğinize emin misiniz?`)) {
    state.categories = state.categories.filter(c => c.id !== id);
    localStorage.setItem('edu_categories', JSON.stringify(state.categories));
    showToast(`"${cat.name}" kategorisi silindi.`);
    renderInlineCategoriesAndClasses();
    renderAll();
  }
};

window.deleteClassInline = (className, event) => {
  event.stopPropagation();
  const grade = state.grades.find(g => g.name === className);
  if (!grade) return;

  const linkedStudents = state.students.filter(s => s.grade === className);
  if (linkedStudents.length > 0) {
    alert(`Bu sınıfta ${linkedStudents.length} kayıtlı öğrenci bulunmaktadır. Sınıfı silebilmek için önce öğrencilerin sınıfını değiştirmelisiniz.`);
    return;
  }

  if (confirm(`"${className}" sınıfını silmek istediğinize emin misiniz?`)) {
    state.grades = state.grades.filter(g => g.name !== className);
    localStorage.setItem('edu_grades', JSON.stringify(state.grades));
    showToast(`"${className}" sınıfı silindi.`);
    if (state.selectedClassFilter === className) {
      state.selectedClassFilter = null;
    }
    renderInlineCategoriesAndClasses();
    renderAll();
  }
};

window.promptCreateClass = (categoryId) => {
  const modal = document.getElementById('modal-create-class-simple');
  const catInput = document.getElementById('simple-class-cat-id');
  const nameInput = document.getElementById('simple-class-name-input');
  
  if (modal && catInput && nameInput) {
    catInput.value = categoryId;
    nameInput.value = '';
    modal.style.display = 'flex';
  }
};

function setupInlineCategoryAndClassForms() {
  const btnCreateCatInline = document.getElementById('btn-create-category-inline');
  const modalSimpleCat = document.getElementById('modal-create-category-simple');
  const btnCloseSimpleCat = document.getElementById('btn-close-simple-cat');
  const formSimpleCat = document.getElementById('form-create-category-simple');

  if (btnCreateCatInline && modalSimpleCat) {
    btnCreateCatInline.addEventListener('click', () => {
      document.getElementById('simple-cat-name-input').value = '';
      modalSimpleCat.style.display = 'flex';
    });
  }

  if (btnCloseSimpleCat && modalSimpleCat) {
    btnCloseSimpleCat.addEventListener('click', () => {
      modalSimpleCat.style.display = 'none';
    });
  }

  if (formSimpleCat && modalSimpleCat) {
    formSimpleCat.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('simple-cat-name-input').value.trim();
      if (!name) return;

      const code = name.slice(0, 3).toUpperCase();
      const colorPalette = [
        'var(--color-students)',
        'var(--color-finance)',
        'var(--color-attendance)',
        'var(--color-counseling)',
        '#f43f5e',
        '#eab308'
      ];
      const color = colorPalette[state.categories.length % colorPalette.length];
      const newId = name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();

      state.categories.push({ id: newId, name, code, color });
      localStorage.setItem('edu_categories', JSON.stringify(state.categories));
      
      modalSimpleCat.style.display = 'none';
      showToast(`"${name}" kategorisi başarıyla eklendi.`);
      
      renderInlineCategoriesAndClasses();
      renderAll();
    });
  }

  const modalSimpleClass = document.getElementById('modal-create-class-simple');
  const btnCloseSimpleClass = document.getElementById('btn-close-simple-class');
  const formSimpleClass = document.getElementById('form-create-class-simple');

  if (btnCloseSimpleClass && modalSimpleClass) {
    btnCloseSimpleClass.addEventListener('click', () => {
      modalSimpleClass.style.display = 'none';
    });
  }

  if (formSimpleClass && modalSimpleClass) {
    formSimpleClass.addEventListener('submit', (e) => {
      e.preventDefault();
      const catId = document.getElementById('simple-class-cat-id').value;
      const name = document.getElementById('simple-class-name-input').value.trim();
      
      if (!catId || !name) return;

      if (state.grades.some(g => g.name === name)) {
        alert('Bu isimde bir sınıf zaten mevcut.');
        return;
      }

      state.grades.push({ name, categoryId: catId });
      localStorage.setItem('edu_grades', JSON.stringify(state.grades));
      
      modalSimpleClass.style.display = 'none';
      showToast(`"${name}" sınıfı başarıyla eklendi.`);
      
      renderInlineCategoriesAndClasses();
      renderAll();
    });
  }
}

window.openLegacyModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('active');
  
  if (modalId === 'modal-accounting') {
    const tbody = document.getElementById('acc-student-table-body');
    if (tbody) {
      let totalContract = 0;
      let totalPaid = 0;
      let totalRemaining = 0;
      
      tbody.innerHTML = state.students.map(s => {
        const contract = s.finance?.contractTotal || 35000;
        const paid = s.finance?.paid || 0;
        const remaining = s.finance?.remaining !== undefined ? s.finance.remaining : (contract - paid);
        const installments = s.finance?.installments || 10;
        
        totalContract += contract;
        totalPaid += paid;
        totalRemaining += remaining;
        
        return `
          <tr style="border-bottom: 1px solid var(--color-border);">
            <td style="padding: 8px; color: var(--text-main); font-weight: 700;">${s.name}</td>
            <td style="padding: 8px; color: var(--text-main);">${contract.toLocaleString('tr-TR')} TL</td>
            <td style="padding: 8px; color: #10b981; font-weight: 700;">${paid.toLocaleString('tr-TR')} TL</td>
            <td style="padding: 8px; color: #f43f5e; font-weight: 700;">${remaining.toLocaleString('tr-TR')} TL</td>
            <td style="padding: 8px; color: var(--text-muted);">${installments} Taksit</td>
          </tr>
        `;
      }).join('');
      
      const contractEl = document.getElementById('acc-total-contract');
      const paidEl = document.getElementById('acc-total-paid');
      const remainingEl = document.getElementById('acc-total-remaining');
      if (contractEl) contractEl.innerText = totalContract.toLocaleString('tr-TR') + ' TL';
      if (paidEl) paidEl.innerText = totalPaid.toLocaleString('tr-TR') + ' TL';
      if (remainingEl) remainingEl.innerText = totalRemaining.toLocaleString('tr-TR') + ' TL';
    }
  }
};

window.closeLegacyModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
};

window.submitPreReg = (e) => {
  e.preventDefault();
  const name = document.getElementById('pre-reg-name');
  const phone = document.getElementById('pre-reg-phone');
  const parent = document.getElementById('pre-reg-parent');
  const grade = document.getElementById('pre-reg-grade');
  const notes = document.getElementById('pre-reg-notes');
  
  if (!name || !phone || !parent) return;
  
  showToast(`"${name.value}" ön kayıt başvurusu başarıyla kaydedildi!`);
  window.closeLegacyModal('modal-pre-reg');
  
  console.log('Ön Kayıt Girişi:', {
    name: name.value,
    phone: phone.value,
    parent: parent.value,
    grade: grade ? grade.value : '',
    notes: notes ? notes.value : '',
    date: new Date().toLocaleDateString('tr-TR')
  });

  name.value = '';
  phone.value = '';
  parent.value = '';
  if (notes) notes.value = '';
};

window.setupLegacyStatusMenu = () => {
  const triggers = ['genel', 'sistem', 'duyuru'];
  triggers.forEach(key => {
    const btn = document.getElementById(`btn-status-${key}`);
    const menu = document.getElementById(`menu-status-${key}`);
    if (btn && menu) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggers.forEach(k => {
          if (k !== key) {
            const otherMenu = document.getElementById(`menu-status-${k}`);
            if (otherMenu) otherMenu.classList.remove('active');
          }
        });
        menu.classList.toggle('active');
      });
    }
  });
  
  document.addEventListener('click', () => {
    triggers.forEach(k => {
      const menu = document.getElementById(`menu-status-${k}`);
      if (menu) menu.classList.remove('active');
    });
  });
};

window.startStatusClock = () => {
  const clockEl = document.getElementById('status-live-clock');
  if (!clockEl) return;
  
  const update = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockEl.innerText = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
  };
  
  update();
  setInterval(update, 1000);
};

window.updateSmsCharCount = () => {
  const textarea = document.getElementById('sms-text-content');
  const counter = document.getElementById('sms-char-counter');
  const cost = document.getElementById('sms-credit-cost');
  if (!textarea || !counter || !cost) return;
  
  const len = textarea.value.length;
  const numSms = len === 0 ? 1 : Math.ceil(len / 160);
  counter.innerText = `${len} / 160 Karakter (${numSms} SMS)`;
  cost.innerText = (numSms * 12).toString();
};

window.sendQuickSms = (e) => {
  e.preventDefault();
  const textarea = document.getElementById('sms-text-content');
  if (!textarea) return;
  const text = textarea.value.trim();
  if (!text) return;
  
  showToast('Mesaj alıcı listesindeki velilere gönderildi!');
  window.closeLegacyModal('modal-quick-sms');
  textarea.value = '';
  window.updateSmsCharCount();
};

window.selectPeriod = (period, event) => {
  if (event) event.stopPropagation();
  showToast(`Dönem değiştirildi: ${period}`);
  window.closeLegacyModal('modal-period-change');
};

window.saveReminder = (e) => {
  e.preventDefault();
  const note = document.getElementById('reminder-note');
  const time = document.getElementById('reminder-time');
  if (!note || !time) return;
  
  showToast(`Hatırlatıcı kuruldu: "${note.value}" saat ${time.value}`);
  window.closeLegacyModal('modal-reminder');
  note.value = '';
};

window.initPrintClassDropdown = () => {
  const select = document.getElementById('print-class-select');
  if (!select) return;
  
  select.innerHTML = state.grades.map(g => `<option value="${g.name}">${g.name}</option>`).join('');
  window.updatePrintClassList();
};

window.updatePrintClassList = () => {
  const select = document.getElementById('print-class-select');
  const tbody = document.getElementById('print-class-table-body');
  if (!select || !tbody) return;
  
  const className = select.value;
  const filtered = state.students.filter(s => s.grade === className);
  
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 20px; color: var(--text-muted);">Bu sınıfta henüz öğrenci bulunmuyor.</td></tr>`;
  } else {
    tbody.innerHTML = filtered.map((s, idx) => `
      <tr style="border-bottom: 1px solid var(--color-border);">
        <td style="padding: 8px 12px; color: var(--text-main); font-weight: 600;">${idx + 1}</td>
        <td style="padding: 8px 12px; color: var(--text-main); font-weight: 700;">${s.name}</td>
        <td style="padding: 8px 12px; color: var(--text-main); font-weight: 600;">${s.grade}</td>
      </tr>
    `).join('');
  }
};

window.printCurrentClassList = () => {
  const select = document.getElementById('print-class-select');
  if (!select) return;
  const className = select.value;
  const students = state.students.filter(s => s.grade === className);
  
  if (students.length === 0) {
    showToast('Yazdırılacak öğrenci bulunamadı.');
    return;
  }
  
  const printWindow = window.open('', '_blank');
  const studentRows = students.map((s, idx) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #000; text-align: center;">${idx + 1}</td>
      <td style="padding: 8px; border: 1px solid #000; font-weight: bold;">${s.name}</td>
      <td style="padding: 8px; border: 1px solid #000; text-align: center;">${s.id || ''}</td>
      <td style="padding: 8px; border: 1px solid #000;">${s.phone || ''}</td>
      <td style="padding: 8px; border: 1px solid #000;">${s.parent1?.phone || ''}</td>
    </tr>
  `).join('');
  
  printWindow.document.write(`
    <html>
      <head>
        <title>${className} Sınıf Listesi</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #f2f2f2; }
          td, th { padding: 8px; border: 1px solid #000; }
        </style>
      </head>
      <body>
        <h2 style="text-align: center; margin-bottom: 5px;">EduMercek Eğitim Kurumları</h2>
        <h3 style="text-align: center; margin-top: 0; color: #555;">${className} Sınıf Mevcut Listesi</h3>
        <p style="text-align: right; font-size: 11px;">Rapor Tarihi: \${new Date().toLocaleDateString('tr-TR')}</p>
        <table>
          <thead>
            <tr>
              <th style="width: 60px; text-align: center;">Sıra No</th>
              <th style="text-align: left;">Öğrenci Ad Soyad</th>
              <th style="width: 80px; text-align: center;">Öğrenci No</th>
              <th style="width: 120px;">Öğrenci Tel</th>
              <th style="width: 120px;">Veli Tel</th>
            </tr>
          </thead>
          <tbody>
            \${studentRows}
          </tbody>
        </table>
        <div style="margin-top: 30px; text-align: right; font-size: 12px;">
          <p>Sınıf Mevcudu: <strong>\${students.length} Öğrenci</strong></p>
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.close();
          }
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

window.exportClassToExcel = () => {
  const select = document.getElementById('print-class-select');
  if (!select) return;
  const className = select.value;
  showToast(`"${className}" sınıf listesi Excel formatına dönüştürüldü ve indirilmeye hazır!`);
};

window.importFromExcel = () => {
  showToast('Excel dosyasını seçin. Öğrenci listesi aktarılıyor...');
};

window.exportToExcel = () => {
  showToast('Aktif filtreye göre tüm öğrenci listesi Excel (XLSX) formatında dışa aktarıldı.');
};

window.saveStudentSettings = (e) => {
  e.preventDefault();
  showToast('Kayıt ayarları başarıyla kaydedildi!');
  window.closeLegacyModal('modal-student-settings');
};

// ----------------------------------------------------
// LEGACY OPTIMIZED VIEWS STATE & DATA SEEDING
// ----------------------------------------------------
if (!state.attendanceLogs) {
  state.attendanceLogs = [
    { student: 'MERYEM ASEL KAYIŞ', staff: 'GÜLFER DAĞDELEN', lesson: 'KİMYA', grade: '27 YAZ 11A', status: 'Yok', time: '03.07.2026 17:25:47', phone: '5065148974', lessonHour: '17.10-17.50' },
    { student: 'ELA SULTAN TÜRK', staff: 'GÜLFER DAĞDELEN', lesson: 'KİMYA', grade: '27 YAZ 11A', status: 'Yok', time: '03.07.2026 17:25:47', phone: '5412010552', lessonHour: '17.10-17.50' },
    { student: 'SILA İYİDOĞAN', staff: 'GÜLFER DAĞDELEN', lesson: 'KİMYA', grade: '27 YAZ 11A', status: 'Yok', time: '03.07.2026 17:25:47', phone: '5059489749', lessonHour: '17.10-17.50' },
    { student: 'EKREM URAS ÜZER', staff: 'GÜLFER DAĞDELEN', lesson: 'KİMYA', grade: '27 YAZ 11A', status: 'Yok', time: '03.07.2026 17:25:47', phone: '5374414137', lessonHour: '17.10-17.50' },
    { student: 'DORUK BAYDUR', staff: 'GÜLFER DAĞDELEN', lesson: 'KİMYA', grade: '27 YAZ 11A', status: 'Yok', time: '03.07.2026 17:25:47', phone: '5057739727', lessonHour: '17.10-17.50' },
    { student: 'ADA SU ÇİÇEK', staff: 'GÜLFER DAĞDELEN', lesson: 'KİMYA', grade: '27 YAZ 11A', status: 'Yok', time: '03.07.2026 17:25:47', phone: '5326132913', lessonHour: '17.10-17.50' },
    { student: 'YAĞMUR CEVİZ', staff: 'GÜLFER DAĞDELEN', lesson: 'KİMYA', grade: '27 YAZ 11A', status: 'Var', time: '03.07.2026 17:25:47', phone: '5354486725', lessonHour: '17.10-17.50' },
    { student: 'YAKUP EMİR SOYSAL', staff: 'GÜLFER DAĞDELEN', lesson: 'KİMYA', grade: '27 YAZ 11A', status: 'Var', time: '03.07.2026 17:25:47', phone: '5551766254', lessonHour: '17.10-17.50' },
    { student: 'DENİZ KIR', staff: 'EMİNE YÜKSEL', lesson: 'MATEMATİK', grade: '27 YAZ 11C', status: 'Yok', time: '03.07.2026 17:17:10', phone: '5323759317', lessonHour: '17.10-17.50' },
    { student: 'ARDA KAYRA AKYÜREKLİ', staff: 'EMİNE YÜKSEL', lesson: 'MATEMATİK', grade: '27 YAZ 11C', status: 'Yok', time: '03.07.2026 17:17:10', phone: '5538867477', lessonHour: '17.10-17.50' },
    { student: 'ALKIN EYMEN TOMARZA', staff: 'EMİNE YÜKSEL', lesson: 'MATEMATİK', grade: '27 YAZ 11C', status: 'Yok', time: '03.07.2026 17:17:10', phone: '5011020118', lessonHour: '17.10-17.50' },
    { student: 'ÖZÜM ELA DADAŞINLIOĞLU', staff: 'EMİNE YÜKSEL', lesson: 'MATEMATİK', grade: '27 YAZ 11C', status: 'Var', time: '03.07.2026 17:17:10', phone: '5353004988', lessonHour: '17.10-17.50' },
    { student: 'MELİSA GÜLER', staff: 'DİRENÇ KAPLAN', lesson: 'BİYOLOJİ', grade: '27 YAZ 11B', status: 'Yok', time: '03.07.2026 17:15:54', phone: '5366328741', lessonHour: '17.10-17.50' },
    { student: 'DORUK GÜNEYTEPE', staff: 'DİRENÇ KAPLAN', lesson: 'BİYOLOJİ', grade: '27 YAZ 11B', status: 'Yok', time: '03.07.2026 17:15:54', phone: '5534912010', lessonHour: '17.10-17.50' }
  ];
  localStorage.setItem('edu_attendance_logs', JSON.stringify(state.attendanceLogs));
}

if (!state.homeworkLogs) {
  state.homeworkLogs = [
    { student: 'SEREN GÖL', staff: 'EMİNE YÜKSEL', grade: '27 YAZ 115', group: 'SEVİYE', status: 'Ödev Verildi', time: '18.10.2025 13:24:27', lesson: 'MATEMATİK', control: 'Yapılmadı', controlTime: '', sms: 'SMS GÖNDERİLDİ' },
    { student: 'İLKİM ÖYKÜ ÖRS', staff: 'EMİNE YÜKSEL', grade: '10-A (K)', group: 'SEVİYE', status: 'Ödev Verildi', time: '18.10.2025 13:24:27', lesson: 'MATEMATİK', control: 'Yapıldı', controlTime: '19.10.2025 10:00', sms: 'SMS GÖNDERİLDİ' },
    { student: 'BİLGE ŞAHİN', staff: 'EMİNE YÜKSEL', grade: 'ÇIKARTILANLAR', group: 'SEVİYE', status: 'Ödev Verildi', time: '18.10.2025 13:24:27', lesson: 'MATEMATİK', control: 'Yapılmadı', controlTime: '', sms: 'SMS GÖNDERİLDİ' },
    { student: 'ZEYNEP ALTUN', staff: 'EMİNE YÜKSEL', grade: '10-A (K)', group: 'SEVİYE', status: 'Ödev Verildi', time: '18.10.2025 13:24:27', lesson: 'MATEMATİK', control: 'Yapılmadı', controlTime: '', sms: 'SMS GÖNDERİLDİ' },
    { student: 'KEREM İLİKSU', staff: 'EMİNE YÜKSEL', grade: '27 YAZ 115', group: 'SEVİYE', status: 'Ödev Verildi', time: '18.10.2025 13:24:27', lesson: 'MATEMATİK', control: 'Yapılmadı', controlTime: '', sms: 'SMS GÖNDERİLDİ' }
  ];
  localStorage.setItem('edu_homework_logs', JSON.stringify(state.homeworkLogs));
}

if (!state.counselingLogs) {
  state.counselingLogs = [
    { student: 'YAĞIZ AKSOY', grade: '12-C', parent1: 'KADİR AKSOY', parent2: 'BETÜL KAMİLOĞLU', count: 3, absentCount: 748, hwCount: 0, etutCount: 0 },
    { student: 'HADEL TAHA ALKASE', grade: '12-B', parent1: 'SAMER TAHA ALKASE', parent2: '', count: 1, absentCount: 685, hwCount: 0, etutCount: 0 },
    { student: 'IRMAK MELEKOĞLU', grade: '12-C', parent1: 'ZERÇEM MELEKOĞLU', parent2: '', count: 4, absentCount: 680, hwCount: 0, etutCount: 0 },
    { student: 'ALMAA FİTTAH', grade: '12-B', parent1: 'MUHAMMED FİTTAH', parent2: '', count: 2, absentCount: 642, hwCount: 0, etutCount: 0 },
    { student: 'EYLÜL YILMAZ', grade: '12D-12E', parent1: 'CEYLAN YILMAZ', parent2: '', count: 1, absentCount: 616, hwCount: 0, etutCount: 1 },
    { student: 'CEYLİN OLMAZ', grade: '12-A', parent1: 'GÜLTEN OLMAZ', parent2: '', count: 5, absentCount: 599, hwCount: 0, etutCount: 1 },
    { student: 'EGE KÖKSAL', grade: '12-B', parent1: 'SEVCAN KÖKSAL', parent2: '', count: 2, absentCount: 574, hwCount: 0, etutCount: 5 }
  ];
  localStorage.setItem('edu_counseling_logs', JSON.stringify(state.counselingLogs));
}

if (!state.studySessions) {
  state.studySessions = [
    { teacher: 'DİRENÇ KAPLAN', student: 'İLKER YILMAZ', date: '2026-07-10', time: '10:00 - 10:40', subject: 'BİYOLOJİ', topic: '1.ÜNİTE TEKRAR' }
  ];
  localStorage.setItem('edu_study_sessions', JSON.stringify(state.studySessions));
}

// Global Filter Queries
let attQuery = 'all';
let attSearchTerm = '';
let hwQuery = 'all';
let hwSearchTerm = '';
let studySearchTerm = '';
let counselingSearchTerm = '';

// ----------------------------------------------------
// 1. YOKLAMA INTERACTION METHODS
// ----------------------------------------------------
window.renderAttendanceLogs = () => {
  const tbody = document.getElementById('attendance-log-table-body');
  if (!tbody) return;

  const filtered = state.attendanceLogs.filter(log => {
    const matchClass = attQuery === 'all' || log.grade === attQuery;
    const matchSearch = attSearchTerm === '' || log.student.toLowerCase().includes(attSearchTerm) || log.staff.toLowerCase().includes(attSearchTerm);
    return matchClass && matchSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px; color:var(--text-muted);">Sorgu sonucuna uygun yoklama kaydı bulunamadı.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(log => {
    const isYok = log.status === 'Yok';
    const isGec = log.status === 'Geç';
    let statusBg = '#10b981'; // Var
    if (isYok) statusBg = '#dc2626';
    if (isGec) statusBg = '#eab308';
    
    return `
      <tr style="border-bottom: 1px solid var(--color-border);">
        <td style="padding: 10px; font-weight:700; color: var(--text-main);">${log.student}</td>
        <td style="padding: 10px; color: var(--text-main);">${log.staff}</td>
        <td style="padding: 10px; color: var(--text-main);">${log.lesson}</td>
        <td style="padding: 10px; color: var(--text-main); font-weight:600;">${log.grade}</td>
        <td style="padding: 10px; text-align:center;">
          <span style="background:${statusBg}; color:#fff; padding: 3px 8px; border-radius: 4px; font-weight:800; font-size:10px;">${log.status.toUpperCase()}</span>
        </td>
        <td style="padding: 10px; color: var(--text-muted);">${log.time}</td>
        <td style="padding: 10px; color: var(--text-main);">${log.phone}</td>
        <td style="padding: 10px; color: var(--text-muted); font-weight:600;">${log.lessonHour}</td>
        <td style="padding: 10px; text-align:center;">
          <input type="checkbox" class="att-log-checkbox" data-student="${log.student}" style="accent-color:var(--color-students);">
        </td>
      </tr>
    `;
  }).join('');
};

window.filterAttendanceByClass = () => {
  const sel = document.getElementById('att-filter-class');
  if (sel) {
    attQuery = sel.value;
    window.renderAttendanceLogs();
    showToast(`Yoklama filtresi uygulandı: ${sel.value}`);
  }
};

window.filterAttendanceByCode = () => {
  showToast('Özel kod filtresi uygulandı (KURS GENEL)');
};

window.toggleAllAttendanceCheckboxes = (source) => {
  const checkboxes = document.querySelectorAll('.att-log-checkbox');
  checkboxes.forEach(cb => cb.checked = source.checked);
};

window.deleteSelectedAttendance = () => {
  const checked = document.querySelectorAll('.att-log-checkbox:checked');
  if (checked.length === 0) {
    showToast('Silmek için yoklama kaydı seçmelisiniz.');
    return;
  }
  
  const namesToDelete = Array.from(checked).map(cb => cb.getAttribute('data-student'));
  state.attendanceLogs = state.attendanceLogs.filter(log => !namesToDelete.includes(log.student));
  localStorage.setItem('edu_attendance_logs', JSON.stringify(state.attendanceLogs));
  
  showToast(`${checked.length} yoklama kaydı silindi.`);
  window.renderAttendanceLogs();
  
  const bulkCb = document.getElementById('att-select-all-sidebar');
  if (bulkCb) bulkCb.checked = false;
};

window.attendanceReport = (type) => {
  showToast(`Rapor hazırlanıyor: Yoklama Raporu (${type})`);
};

window.refreshAttendanceTable = () => {
  attQuery = 'all';
  attSearchTerm = '';
  const searchInput = document.getElementById('attendance-log-search');
  if (searchInput) searchInput.value = '';
  const classSel = document.getElementById('att-filter-class');
  if (classSel) classSel.value = 'all';
  
  window.renderAttendanceLogs();
  showToast('Yoklama kayıt tablosu yenilendi.');
};

window.openEditSelectedAttendance = () => {
  const checked = document.querySelectorAll('.att-log-checkbox:checked');
  if (checked.length === 0) {
    showToast('Düzenlemek için en az bir yoklama kaydı seçmelisiniz.');
    return;
  }
  showToast(`${checked.length} yoklama kaydı toplu düzenleme moduna alındı.`);
};

window.searchAttendanceLog = () => {
  const searchInput = document.getElementById('attendance-log-search');
  if (searchInput) {
    attSearchTerm = searchInput.value.toLowerCase().trim();
    window.renderAttendanceLogs();
  }
};

// ----------------------------------------------------
// 2. ODEV INTERACTION METHODS
// ----------------------------------------------------
window.renderHomeworkLogs = () => {
  const tbody = document.getElementById('homework-log-table-body');
  if (!tbody) return;

  const filtered = state.homeworkLogs.filter(log => {
    const matchClass = hwQuery === 'all' || log.grade === hwQuery;
    const matchSearch = hwSearchTerm === '' || log.student.toLowerCase().includes(hwSearchTerm) || log.staff.toLowerCase().includes(hwSearchTerm);
    return matchClass && matchSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:20px; color:var(--text-muted);">Sorgu sonucuna uygun ödev kaydı bulunamadı.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(log => {
    const isDone = log.control === 'Yapıldı';
    const controlBadge = isDone 
      ? `<span style="color:#10b981; font-weight:800;"><i data-lucide="check" style="width:14px; height:14px; display:inline-block; vertical-align:middle;"></i> YAPILDI</span>`
      : `<span style="color:#dc2626; font-weight:800;"><i data-lucide="x" style="width:14px; height:14px; display:inline-block; vertical-align:middle;"></i> YAPILMADI</span>`;
    
    return `
      <tr style="border-bottom: 1px solid var(--color-border);">
        <td style="padding: 10px; font-weight:700; color: var(--text-main);">${log.student}</td>
        <td style="padding: 10px; color: var(--text-main);">${log.staff}</td>
        <td style="padding: 10px; color: var(--text-main); font-weight:600;">${log.grade}</td>
        <td style="padding: 10px; color: var(--text-muted); font-weight:600;">${log.group}</td>
        <td style="padding: 10px; text-align:center;">
          <span style="background:var(--color-counseling); color:#fff; padding: 3px 8px; border-radius: 4px; font-weight:800; font-size:10px;">${log.status.toUpperCase()}</span>
        </td>
        <td style="padding: 10px; color: var(--text-muted);">${log.time}</td>
        <td style="padding: 10px; color: var(--text-main);">${log.lesson}</td>
        <td style="padding: 10px; text-align:center;">${controlBadge}</td>
        <td style="padding: 10px; color: #10b981; font-weight:700;">${log.sms}</td>
        <td style="padding: 10px; text-align:center;">
          <input type="checkbox" class="hw-log-checkbox" data-student="${log.student}" style="accent-color:var(--color-students);">
        </td>
      </tr>
    `;
  }).join('');
  if (window.lucide) window.lucide.createIcons();
};

window.filterHomeworkByClass = () => {
  const sel = document.getElementById('hw-filter-class');
  if (sel) {
    hwQuery = sel.value;
    window.renderHomeworkLogs();
    showToast(`Ödev filtresi uygulandı: ${sel.value}`);
  }
};

window.filterHomeworkByCode = () => {
  showToast('Ödev özel kod filtresi uygulandı');
};

window.toggleAllHomeworkCheckboxes = (source) => {
  const checkboxes = document.querySelectorAll('.hw-log-checkbox');
  checkboxes.forEach(cb => cb.checked = source.checked);
};

window.deleteSelectedHomework = () => {
  const checked = document.querySelectorAll('.hw-log-checkbox:checked');
  if (checked.length === 0) {
    showToast('Silmek için ödev kaydı seçmelisiniz.');
    return;
  }
  
  const namesToDelete = Array.from(checked).map(cb => cb.getAttribute('data-student'));
  state.homeworkLogs = state.homeworkLogs.filter(log => !namesToDelete.includes(log.student));
  localStorage.setItem('edu_homework_logs', JSON.stringify(state.homeworkLogs));
  
  showToast(`${checked.length} ödev kaydı silindi.`);
  window.renderHomeworkLogs();
  
  const bulkCb = document.getElementById('hw-select-all-sidebar');
  if (bulkCb) bulkCb.checked = false;
};

window.homeworkReport = (type) => {
  showToast(`Ödev Raporu hazırlanıyor: ${type}`);
};

window.refreshHomeworkTable = () => {
  hwQuery = 'all';
  hwSearchTerm = '';
  const searchInput = document.getElementById('homework-log-search');
  if (searchInput) searchInput.value = '';
  const classSel = document.getElementById('hw-filter-class');
  if (classSel) classSel.value = 'all';
  
  window.renderHomeworkLogs();
  showToast('Ödev takip tablosu yenilendi.');
};

window.openEditSelectedHomework = () => {
  const checked = document.querySelectorAll('.hw-log-checkbox:checked');
  if (checked.length === 0) {
    showToast('Güncellemek için en az bir ödev seçmelisiniz.');
    return;
  }
  showToast(`${checked.length} ödev kaydı toplu kontrol moduna alındı.`);
};

window.searchHomeworkLog = () => {
  const searchInput = document.getElementById('homework-log-search');
  if (searchInput) {
    hwSearchTerm = searchInput.value.toLowerCase().trim();
    window.renderHomeworkLogs();
  }
};

window.submitCreateHomework = (e) => {
  e.preventDefault();
  const title = document.getElementById('hw-title-input').value.trim();
  const subject = document.getElementById('hw-subject-input').value;
  const grade = document.getElementById('hw-grade-input').value;
  const date = document.getElementById('hw-date-input').value;
  const desc = document.getElementById('hw-description-input').value.trim();
  
  if (!title || !date) return;
  
  // Assign homework logs to students in that class
  const classStudents = state.students.filter(s => s.grade === grade);
  const newLogs = classStudents.map(s => ({
    student: s.name.toUpperCase(),
    staff: 'BRANŞ ÖĞRETMENİ',
    grade: grade,
    group: 'SEVİYE',
    status: 'Ödev Verildi',
    time: new Date().toLocaleString('tr-TR'),
    lesson: subject.toUpperCase(),
    control: 'Yapılmadı',
    controlTime: '',
    sms: 'SMS GÖNDERİLDİ'
  }));

  state.homeworkLogs = [...newLogs, ...state.homeworkLogs];
  localStorage.setItem('edu_homework_logs', JSON.stringify(state.homeworkLogs));
  
  showToast(`"${title}" ödevi ${classStudents.length} öğrenciye başarıyla atandı ve SMS gönderildi!`);
  window.closeLegacyModal('modal-create-homework');
  window.renderHomeworkLogs();
  
  document.getElementById('homework-create-form').reset();
};

// ----------------------------------------------------
// 3. STUDY SLOT DESIGNER METHODS
// ----------------------------------------------------
window.renderStudyStudents = () => {
  const tbody = document.getElementById('study-student-table-body');
  if (!tbody) return;

  const filtered = state.students.filter(s => {
    return studySearchTerm === '' || s.name.toLowerCase().includes(studySearchTerm);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:10px; color:var(--text-muted);">Öğrenci bulunamadı.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(s => `
    <tr style="border-bottom: 1px solid var(--color-border);">
      <td style="padding: 6px 8px; color: var(--text-main); font-weight:700;">${s.name}</td>
      <td style="padding: 6px 8px; color: var(--text-muted);">${s.grade}</td>
      <td style="padding: 6px 8px; text-align:center;">
        <input type="checkbox" class="study-student-checkbox" data-name="${s.name}" style="accent-color:var(--color-students);">
      </td>
    </tr>
  `).join('');
  
  // Bind top check toggle
  const bulkCb = document.getElementById('study-bulk-student');
  if (bulkCb) {
    bulkCb.onchange = (e) => {
      document.querySelectorAll('.study-student-checkbox').forEach(cb => cb.checked = e.target.checked);
    };
  }
};

window.searchStudyStudents = () => {
  const input = document.getElementById('study-student-search');
  if (input) {
    studySearchTerm = input.value.toLowerCase().trim();
    window.renderStudyStudents();
  }
};

window.designStudySession = (e) => {
  e.preventDefault();
  const teacher = document.getElementById('study-teacher-select-display').value;
  const subject = document.getElementById('study-subject-select').value;
  const date = document.getElementById('study-date-input').value;
  const tStart = document.getElementById('study-time-start').value.trim();
  const tEnd = document.getElementById('study-time-end').value.trim();
  const topic = document.getElementById('study-topic-input').value.trim();
  
  if (teacher === 'Lütfen Personel Seçiniz...') {
    showToast('Lütfen listeden bir personel seçin.');
    return;
  }

  const checked = document.querySelectorAll('.study-student-checkbox:checked');
  if (checked.length === 0) {
    showToast('Etüt atamak için soldaki listeden en az bir öğrenci seçmelisiniz.');
    return;
  }
  
  const studentNames = Array.from(checked).map(cb => cb.getAttribute('data-name'));
  studentNames.forEach(name => {
    state.studySessions.push({
      teacher,
      student: name.toUpperCase(),
      date,
      time: `${tStart} - ${tEnd}`,
      subject,
      topic
    });
  });
  
  localStorage.setItem('edu_study_sessions', JSON.stringify(state.studySessions));
  showToast(`${studentNames.length} öğrenciye etüt başarıyla planlandı.`);
  
  // Reset checklist
  document.querySelectorAll('.study-student-checkbox').forEach(cb => cb.checked = false);
  const bulkCb = document.getElementById('study-bulk-student');
  if (bulkCb) bulkCb.checked = false;
  
  window.renderStudiesList();
};

window.renderStudiesList = () => {
  const tbody = document.getElementById('studies-list-table-body');
  if (!tbody) return;

  if (state.studySessions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="13" style="text-align:center; padding:25px; color:var(--text-muted);">Henüz planlanmış etüt bulunmuyor.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.studySessions.map((s, idx) => {
    const studentObj = state.students.find(st => st.name.toUpperCase() === s.student.toUpperCase());
    const studentGrade = studentObj ? studentObj.grade : '12-A';
    
    // Day name calculation
    let dayName = 'Cuma';
    if (s.date) {
      try {
        const d = new Date(s.date);
        dayName = d.toLocaleDateString('tr-TR', { weekday: 'long' });
      } catch(e) {}
    }
    
    const checkIcon = `<i data-lucide="check-circle-2" style="width:14px; height:14px; color:#10b981; display:inline-block; vertical-align:middle;"></i>`;

    return `
      <tr style="border-bottom: 1px solid var(--color-border);">
        <td style="padding: 8px; font-weight:700; color: var(--text-main);">${s.teacher}</td>
        <td style="padding: 8px; font-weight:700; color: var(--text-main);">${s.student}</td>
        <td style="padding: 8px; color: var(--text-main);">${s.subject}</td>
        <td style="padding: 8px; color: var(--color-students); font-weight:700; text-align:center;">${s.time}</td>
        <td style="padding: 8px; color: var(--text-muted); text-align:center;">${dayName}</td>
        <td style="padding: 8px; color: var(--text-muted); font-style:italic;">${s.topic || ''}</td>
        <td style="padding: 8px; color: var(--text-main); text-align:center;">${s.date}</td>
        <td style="padding: 8px; color: var(--text-muted); text-align:center;">03.07.2026</td>
        <td style="padding: 8px; color: var(--text-main); font-weight:600;">${studentGrade}</td>
        <td style="padding: 8px; text-align:center;">${checkIcon}</td>
        <td style="padding: 8px; text-align:center;">${checkIcon}</td>
        <td style="padding: 8px; text-align:center;">${checkIcon}</td>
        <td style="padding: 8px; text-align:center;">
          <button class="btn-icon delete" onclick="window.deleteStudy(${idx})" style="color:#ef4444; background:none; border:none; cursor:pointer; padding:0;" title="İptal Et">
            <i data-lucide="trash-2" style="width:13px; height:13px;"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
  if (window.lucide) window.lucide.createIcons();
};

window.refreshStudies = () => {
  window.renderStudiesList();
  showToast('Etüt program listesi güncellendi.');
};

window.deleteStudy = (idx) => {
  state.studySessions.splice(idx, 1);
  localStorage.setItem('edu_study_sessions', JSON.stringify(state.studySessions));
  showToast('Planlanmış etüt iptal edildi.');
  window.renderStudiesList();
};

// ----------------------------------------------------
// 4. REHBERLIK INTERACTION METHODS
// ----------------------------------------------------
window.renderCounselingReport = () => {
  const tbody = document.getElementById('counseling-report-table-body');
  if (!tbody) return;

  const filtered = state.counselingLogs.filter(log => {
    return counselingSearchTerm === '' || log.student.toLowerCase().includes(counselingSearchTerm);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px; color:var(--text-muted);">Sorguya uygun öğrenci kaydı bulunamadı.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(log => `
    <tr style="border-bottom: 1px solid var(--color-border);">
      <td style="padding: 10px; font-weight:700; color: var(--text-main);">${log.student}</td>
      <td style="padding: 10px; color: var(--text-main); font-weight:600;">${log.grade}</td>
      <td style="padding: 10px; color: var(--text-main);">${log.parent1}</td>
      <td style="padding: 10px; color: var(--text-muted);">${log.parent2 || '-'}</td>
      <td style="padding: 10px; text-align:center; font-weight:700; color:var(--color-students);">${log.count} Görüşme</td>
      <td style="padding: 10px; text-align:center; font-weight:700; color:#ef4444;">${log.absentCount} Ders</td>
      <td style="padding: 10px; text-align:center; font-weight:700; color:#f59e0b;">${log.hwCount} Ödev</td>
      <td style="padding: 10px; text-align:center; font-weight:700; color:#3b82f6;">${log.etutCount} Etüt</td>
      <td style="padding: 10px; text-align:center;">
        <div style="display:flex; gap:4px; justify-content:center;">
          <button class="btn-icon" onclick="showToast('${log.student} görüşme ekleme formu açılıyor...')" style="color:var(--color-students); background:none; border:none; cursor:pointer;" title="Hızlı Görüşme Ekle"><i data-lucide="plus-circle" style="width:14px; height:14px;"></i></button>
          <button class="btn-icon" onclick="showToast('${log.student} detaylı profili yükleniyor...')" style="color:var(--text-main); background:none; border:none; cursor:pointer;" title="Grafiksel Özet Profil"><i data-lucide="user" style="width:14px; height:14px;"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
  if (window.lucide) window.lucide.createIcons();
};

window.searchCounselingStudents = () => {
  const input = document.getElementById('counseling-student-search');
  if (input) {
    counselingSearchTerm = input.value.toLowerCase().trim();
    window.renderCounselingReport();
  }
};

window.counselingMenu = (key) => {
  showToast(`Rehberlik menüsü tetiklendi: ${key.toUpperCase()}`);
};

window.counselingAction = (key) => {
  if (key === 'refresh') {
    counselingSearchTerm = '';
    const input = document.getElementById('counseling-student-search');
    if (input) input.value = '';
    window.renderCounselingReport();
    showToast('Rehberlik tablosu güncellendi.');
  } else if (key === 'schedule') {
    window.openLegacyModal('modal-reminder');
  } else {
    showToast(`Rehberlik alt bar aksiyonu: ${key.toUpperCase()}`);
  }
};

// ----------------------------------------------------
// 5. ZIL WIDGET MOCK RING PLAYING
// ----------------------------------------------------
let bellInterval = null;

window.playBell = () => {
  const container = document.getElementById('bell-svg-container');
  const label = document.getElementById('bell-status-label');
  if (!container) return;
  
  // Add shake animation styling dynamically if not present
  if (!document.getElementById('ringing-bell-styles')) {
    const style = document.createElement('style');
    style.id = 'ringing-bell-styles';
    style.innerHTML = `
      @keyframes bellRing {
        0% { transform: rotate(0); }
        10% { transform: rotate(15deg); }
        20% { transform: rotate(-15deg); }
        30% { transform: rotate(10deg); }
        40% { transform: rotate(-10deg); }
        50% { transform: rotate(5deg); }
        60% { transform: rotate(-5deg); }
        70% { transform: rotate(0); }
        100% { transform: rotate(0); }
      }
      .ringing-active i {
        animation: bellRing 0.6s infinite ease-in-out;
        color: #ef4444 !important;
      }
      .ringing-active {
        border-color: #ef4444 !important;
        background: rgba(239, 68, 68, 0.15) !important;
      }
    `;
    document.head.appendChild(style);
  }

  container.classList.add('ringing-active');
  if (label) label.innerText = 'ÇALIYOR...';
  showToast('Mock Okul Zili Çalıyor! 🔔');
  
  // Simulated sound using browser AudioContext
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const osc = context.createOscillator();
    const gain = context.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, context.currentTime); // D5
    
    gain.gain.setValueAtTime(0.3, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1.2);
    
    osc.connect(gain);
    gain.connect(context.destination);
    
    osc.start();
    osc.stop(context.currentTime + 1.3);
  } catch (err) {
    console.log('AudioContext initialization ignored:', err);
  }
};

window.stopBell = () => {
  const container = document.getElementById('bell-svg-container');
  const label = document.getElementById('bell-status-label');
  if (container) {
    container.classList.remove('ringing-active');
  }
  if (label) label.innerText = 'Zil Hazır';
  showToast('Zil Susturuldu.');
};

// ----------------------------------------------------
// ADVANCED LOOKUP & DROPDOWN PANEL HANDLERS (Etüt Personel Seç)
// ----------------------------------------------------
state.lookupTeachers = [
  { name: 'HASAN BAKBAK', branch: 'BEDEN EĞİTİMİ' },
  { name: 'HASAN EKİN ASLAN', branch: 'BİYOLOJİ' },
  { name: 'DİRENÇ KAPLAN', branch: 'BİYOLOJİ' },
  { name: 'YILMAZ ÖZEN', branch: 'COĞRAFYA' },
  { name: 'BATUHAN BİLGİN', branch: 'COĞRAFYA' },
  { name: 'İREM ALTUNTAŞ', branch: 'FELSEFE' },
  { name: 'NİLÜFER YÜKSEL', branch: 'MATEMATİK' },
  { name: 'UFUK SEZER', branch: 'MATEMATİK' },
  { name: 'GÜLBAHAR AKTEKİN', branch: 'MATEMATİK' },
  { name: 'NURSEDA ONAY', branch: 'DİN KÜLTÜRÜ' },
  { name: 'ÖZGE PAMUK', branch: 'DİN KÜLTÜRÜ' }
];

window.toggleTeacherLookup = (e) => {
  if (e) e.stopPropagation();
  const panel = document.getElementById('study-teacher-lookup-panel');
  if (!panel) return;
  
  const isHidden = panel.style.display === 'none' || panel.style.display === '';
  panel.style.display = isHidden ? 'block' : 'none';
  
  if (isHidden) {
    window.filterLookupTeachers();
    const filterInput = document.getElementById('study-lookup-teacher-filter');
    if (filterInput) {
      filterInput.value = '';
      setTimeout(() => filterInput.focus(), 50);
    }
  }
};

window.filterLookupTeachers = () => {
  const filterInput = document.getElementById('study-lookup-teacher-filter');
  const listContainer = document.getElementById('study-lookup-teacher-list');
  if (!listContainer) return;
  
  const query = filterInput ? filterInput.value.toLowerCase().trim() : '';
  const filtered = state.lookupTeachers.filter(t => 
    t.name.toLowerCase().includes(query) || t.branch.toLowerCase().includes(query)
  );
  
  if (filtered.length === 0) {
    listContainer.innerHTML = `<div style="padding: 10px; color: var(--text-muted); font-size: 11px; text-align: center;">Eşleşen personel bulunamadı.</div>`;
    return;
  }
  
  listContainer.innerHTML = filtered.map(t => `
    <div onclick="window.selectTeacher('${t.name}', '${t.branch}')" style="display: flex; justify-content: space-between; padding: 6px 10px; font-size: 11px; border-radius: var(--radius-sm); cursor: pointer; color: var(--text-main); transition: background 0.15s;" onmouseover="this.style.background='var(--color-hover)'" onmouseout="this.style.background='none'">
      <span style="font-weight: 700;">${t.name}</span>
      <span style="color: var(--text-muted); font-weight: 600;">${t.branch}</span>
    </div>
  `).join('');
};

window.selectTeacher = (name, branch) => {
  const displayInput = document.getElementById('study-teacher-select-display');
  const subjectSelect = document.getElementById('study-subject-select');
  if (displayInput) displayInput.value = name;
  if (subjectSelect) {
    const option = Array.from(subjectSelect.options).find(opt => opt.value === branch);
    if (option) subjectSelect.value = branch;
  }
  
  const panel = document.getElementById('study-teacher-lookup-panel');
  if (panel) panel.style.display = 'none';
  showToast(`Personel seçildi: ${name}`);
};

window.clearTeacherSelection = (e) => {
  if (e) e.stopPropagation();
  const displayInput = document.getElementById('study-teacher-select-display');
  if (displayInput) displayInput.value = 'Lütfen Personel Seçiniz...';
  
  const panel = document.getElementById('study-teacher-lookup-panel');
  if (panel) panel.style.display = 'none';
};

// Document click listener to close lookup panel when clicking outside
document.addEventListener('click', (e) => {
  const panel = document.getElementById('study-teacher-lookup-panel');
  const trigger = document.getElementById('study-teacher-select-display');
  if (panel && trigger && !panel.contains(e.target) && e.target !== trigger) {
    panel.style.display = 'none';
  }
});

