// Datos de prueba
const students = [
    { id: "S001", name: "Ana García" },
    { id: "S002", name: "Carlos Martínez" },
    { id: "S003", name: "Elena Rodríguez" },
    { id: "S004", name: "Miguel Sánchez" }
];

const doctors = [
    { id: "D001", name: "Dr. Javier López", specialty: "Cardiología", collegiateNumber: "123456" },
    { id: "D002", name: "Dra. Lucía Fernández", specialty: "Neurología", collegiateNumber: "234567" },
    { id: "D003", name: "Dr. Alberto Ruiz", specialty: "Pediatría", collegiateNumber: "345678" },
    { id: "D004", name: "Dra. María González", specialty: "Traumatología", collegiateNumber: "456789" },
    { id: "D005", name: "Dr. Pablo Moreno", specialty: "Dermatología", collegiateNumber: "567890" }
];

const admins = [
    { id: "A001", name: "Sofía Torres" },
    { id: "A002", name: "Raúl Navarro" }
];

// Horas totales requeridas
const TOTAL_REQUIRED_HOURS = 200;

// Generación de entradas de horas
let hours = [];
let hourId = 1;

// Generar datos de prueba
function generateTestData() {
    const statuses = ['pending', 'approved', 'rejected', 'review'];
    const dates = [];

    // Generar fechas de los últimos 30 días
    for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }

    // Generar entradas para cada estudiante
    students.forEach(student => {
        // Cada estudiante tiene entre 5 y 15 entradas
        const entries = Math.floor(Math.random() * 10) + 5;

        for (let i = 0; i < entries; i++) {
            const doctor = doctors[Math.floor(Math.random() * doctors.length)];
            const hoursCount = Math.floor(Math.random() * 8) + 1;
            const date = dates[Math.floor(Math.random() * dates.length)];
            const status = statuses[Math.floor(Math.random() * (i < 3 ? 1 : 4))]; // Asegurar algunas pendientes

            hours.push({
                id: hourId++,
                studentId: student.id,
                doctorId: doctor.id,
                hours: hoursCount,
                date: date,
                description: `Prácticas en ${doctor.specialty} con ${doctor.name}`,
                status: status,
                reviewDate: status !== 'pending' ? new Date().toISOString().split('T')[0] : null
            });
        }
    });
}

generateTestData();

// Funciones de utilidad
function getStudentById(id) {
    return students.find(student => student.id === id);
}

function getDoctorById(id) {
    return doctors.find(doctor => doctor.id === id);
}

function getAdminById(id) {
    return admins.find(admin => admin.id === id);
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

function getStudentHours(studentId) {
    return hours.filter(h => h.studentId === studentId);
}

function getHoursByStatus(studentId, status) {
    return hours.filter(h => h.studentId === studentId && h.status === status);
}

function getTotalHours(studentId, onlyApproved = false) {
    const filtered = onlyApproved
        ? hours.filter(h => h.studentId === studentId && h.status === 'approved')
        : hours.filter(h => h.studentId === studentId);

    return filtered.reduce((sum, entry) => sum + entry.hours, 0);
}

function getSpecialtiesDistribution(studentId) {
    const result = {};
    const studentHours = getStudentHours(studentId);

    studentHours.forEach(entry => {
        const doctor = getDoctorById(entry.doctorId);
        if (!result[doctor.specialty]) {
            result[doctor.specialty] = 0;
        }
        result[doctor.specialty] += entry.hours;
    });

    return result;
}

// UI Handlers
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active-screen');
    });
    document.getElementById(screenId).classList.add('active-screen');
}

function showSection(role, sectionName) {
    // Ocultar todas las secciones de este rol
    document.querySelectorAll(`#${role}-screen .section`).forEach(section => {
        section.style.display = 'none';
    });

    // Mostrar la sección solicitada
    document.getElementById(`${role}-${sectionName}`).style.display = 'block';

    // Actualizar enlaces activos
    document.querySelectorAll(`#${role}-screen .nav-links a`).forEach(link => {
        link.classList.remove('active');
    });

    // Encontrar y activar el enlace correcto
    document.querySelectorAll(`#${role}-screen .nav-links a`).forEach(link => {
        if (link.dataset.section === sectionName) {
            link.classList.add('active');
        }
    });
}

function logout() {
    showScreen('login-screen');
    showSection('student', 'summary');
    showSection('doctor', 'register');
    showSection('admin', 'review');
}

function renderUserSelector() {
    const userType = document.getElementById('user-type').value;
    const userIdSelect = document.getElementById('user-id');
    userIdSelect.innerHTML = '';

    let users;
    switch (userType) {
        case 'student':
            users = students;
            break;
        case 'doctor':
            users = doctors;
            break;
        case 'admin':
            users = admins;
            break;
    }

    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        userIdSelect.appendChild(option);
    });
}

// Inicialización de la interfaz de usuario
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('user-type').addEventListener('change', renderUserSelector);
    renderUserSelector();

    // Configurar formulario de login
    document.getElementById('login-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const userType = document.getElementById('user-type').value;
        const userId = document.getElementById('user-id').value;

        switch (userType) {
            case 'student':
                initializeStudentDashboard(userId);
                showScreen('student-screen');
                break;
            case 'doctor':
                initializeDoctorDashboard(userId);
                showScreen('doctor-screen');
                break;
            case 'admin':
                initializeAdminDashboard(userId);
                showScreen('admin-screen');
                break;
        }
    });

    // Configurar logout
    document.getElementById('student-logout').addEventListener('click', logout);
    document.getElementById('doctor-logout').addEventListener('click', logout);
    document.getElementById('admin-logout').addEventListener('click', logout);

    // Configurar navegación del estudiante
    document.querySelectorAll('#student-screen .nav-links a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const section = this.dataset.section;
            showSection('student', section);

            const studentId = document.getElementById('student-logout').dataset.userId;
            if (section === 'history') {
                updateStudentHistory(studentId);
            } else if (section === 'specialty-hours') {
                updateStudentSpecialtiesDetailed(studentId);
            }
        });
    });

    // Configurar navegación del médico
    document.querySelectorAll('#doctor-screen .nav-links a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const section = this.dataset.section;
            showSection('doctor', section);

            const doctorId = document.getElementById('doctor-logout').dataset.userId;
            if (section === 'history') {
                updateDoctorHistory(doctorId);
            }
        });
    });

    // Configurar navegación del administrador
    document.querySelectorAll('#admin-screen .nav-links a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const section = this.dataset.section;
            showSection('admin', section);

            if (section === 'statistics') {
                updateAdminSpecialtyStats();
                updateAdminStudentProgress();
            } else if (section === 'students') {
                updateAdminStudentsList();
            }
        });
    });

    // Configurar fecha actual en el formulario del médico
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('doctor-date').value = today;

    document.getElementById('doctor-submit-hours').addEventListener('submit', function (e) {
        e.preventDefault();

        const doctorId = document.getElementById('doctor-logout').dataset.userId;
        const studentId = document.getElementById('doctor-student-select').value;
        const hoursValue = parseInt(document.getElementById('doctor-hours').value);
        const date = document.getElementById('doctor-date').value;
        const description = document.getElementById('doctor-description').value;
        if (!studentId || !hoursValue || !date || !description) {
            alert('Por favor completa todos los campos');
            return;
        }

        // Crear nueva entrada
        const newEntry = {
            id: hourId++,
            studentId: studentId,
            doctorId: doctorId,
            hours: hoursValue,
            date: date,
            description: description,
            status: 'pending',
            reviewDate: null
        };
        hours.push(newEntry);
        updateDoctorRecentEntries(doctorId);
        if (document.getElementById('student-screen').classList.contains('active-screen')) {
            const activeStudentId = document.getElementById('student-logout').dataset.userId;
            if (activeStudentId === studentId) {
                updateStudentStatistics(studentId);
                updateStudentSpecialties(studentId);
                updateStudentRecentActivities(studentId);
            }
        }
        if (document.getElementById('admin-screen').classList.contains('active-screen')) {
            updateAdminPendingHours();
            updateAdminHistory();
        }

        document.getElementById('doctor-description').value = '';
        document.getElementById('doctor-hours').value = '1';
        alert('Horas registradas correctamente');
    });

});

// Funciones de inicialización de dashboards
function initializeStudentDashboard(studentId) {
    const student = getStudentById(studentId);

    // Configurar información del usuario
    document.getElementById('student-name').textContent = student.name;
    document.getElementById('student-avatar').textContent = getInitials(student.name);
    document.getElementById('student-logout').dataset.userId = studentId;

    // Actualizar estadísticas
    updateStudentStatistics(studentId);

    // Actualizar distribución por especialidad
    updateStudentSpecialties(studentId);

    // Actualizar actividades recientes
    updateStudentRecentActivities(studentId);
}

function initializeDoctorDashboard(doctorId) {
    const doctor = getDoctorById(doctorId);

    // Configurar información del usuario
    document.getElementById('doctor-name').textContent = doctor.name;
    document.getElementById('doctor-specialty').textContent = doctor.specialty;
    document.getElementById('doctor-avatar').textContent = getInitials(doctor.name);
    document.getElementById('doctor-logout').dataset.userId = doctorId;

    // Configurar selector de estudiantes
    const studentSelect = document.getElementById('doctor-student-select');
    studentSelect.innerHTML = '';

    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = student.name;
        studentSelect.appendChild(option);
    });

    // Actualizar entradas recientes
    updateDoctorRecentEntries(doctorId);
}

function initializeAdminDashboard(adminId) {
    const admin = getAdminById(adminId);

    // Configurar información del usuario
    document.getElementById('admin-name').textContent = admin.name;
    document.getElementById('admin-avatar').textContent = getInitials(admin.name);
    document.getElementById('admin-logout').dataset.userId = adminId;

    // Cargar horas pendientes de revisión
    updateAdminPendingHours();

    // Cargar historial de revisiones
    updateAdminHistory();
}

// Funciones para actualizar la UI
function updateStudentStatistics(studentId) {
    const totalHours = getTotalHours(studentId);
    const approvedHours = getTotalHours(studentId, true);
    const pendingHours = getHoursByStatus(studentId, 'pending').reduce((sum, entry) => sum + entry.hours, 0);
    const remainingHours = Math.max(0, TOTAL_REQUIRED_HOURS - approvedHours);

    // Actualizar valores en la UI
    document.getElementById('student-total-hours').textContent = totalHours;
    document.getElementById('student-approved-hours').textContent = approvedHours;
    document.getElementById('student-pending-hours').textContent = pendingHours;
    document.getElementById('student-remaining-hours').textContent = remainingHours;

    // Actualizar barra de progreso
    const progressPercent = Math.min(100, (approvedHours / TOTAL_REQUIRED_HOURS) * 100);
    document.getElementById('student-progress-bar').style.width = `${progressPercent}%`;
    document.getElementById('student-progress-text').textContent = `${approvedHours}/${TOTAL_REQUIRED_HOURS} horas`;
}

function updateStudentSpecialties(studentId) {
    const specialties = getSpecialtiesDistribution(studentId);
    const specialtiesContainer = document.getElementById('student-specialties');
    specialtiesContainer.innerHTML = '';

    for (const [specialty, hours] of Object.entries(specialties)) {
        const specialtyEl = document.createElement('div');
        specialtyEl.className = 'specialty-card';

        const specialtyHeader = document.createElement('div');
        specialtyHeader.className = 'specialty-header';

        const specialtyTitle = document.createElement('div');
        specialtyTitle.className = 'specialty-title';
        specialtyTitle.textContent = specialty;

        const specialtyHours = document.createElement('div');
        specialtyHours.className = 'specialty-hours';
        specialtyHours.textContent = `${hours} horas`;

        specialtyHeader.appendChild(specialtyTitle);
        specialtyHeader.appendChild(specialtyHours);

        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';

        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';

        const progressPercent = Math.min(100, (hours / TOTAL_REQUIRED_HOURS) * 100);
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        progressFill.style.width = `${progressPercent}%`;

        progressBar.appendChild(progressFill);
        progressContainer.appendChild(progressBar);

        specialtyEl.appendChild(specialtyHeader);
        specialtyEl.appendChild(progressContainer);

        specialtiesContainer.appendChild(specialtyEl);
    }
}

function updateStudentRecentActivities(studentId) {
    const container = document.getElementById('student-recent-activities');
    container.innerHTML = '';

    const studentHours = getStudentHours(studentId);
    const sortedHours = [...studentHours].sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentHours = sortedHours.slice(0, 5);

    if (recentHours.length === 0) {
        container.innerHTML = '<p class="text-center">No hay actividades recientes</p>';
        return;
    }

    recentHours.forEach(entry => {
        const doctor = getDoctorById(entry.doctorId);

        const entryEl = document.createElement('div');
        entryEl.className = 'hours-entry';

        const entryHeader = document.createElement('div');
        entryHeader.className = 'hours-entry-header';

        const entryTitle = document.createElement('div');
        entryTitle.innerHTML = `<strong>${entry.hours} horas</strong> con ${doctor.name}`;

        const statusBadge = document.createElement('span');
        statusBadge.className = `badge badge-${entry.status}`;
        statusBadge.textContent = {
            'pending': 'Pendiente',
            'approved': 'Aprobada',
            'rejected': 'Rechazada',
            'review': 'En revisión'
        }[entry.status];

        entryHeader.appendChild(entryTitle);
        entryHeader.appendChild(statusBadge);

        const entryDetails = document.createElement('div');
        entryDetails.className = 'entry-details';
        entryDetails.textContent = `${formatDate(entry.date)} - ${entry.description}`;

        entryEl.appendChild(entryHeader);
        entryEl.appendChild(entryDetails);

        container.appendChild(entryEl);
    });
}

function updateDoctorRecentEntries(doctorId) {
    const container = document.getElementById('doctor-recent-entries');
    container.innerHTML = '';

    const doctorHours = hours.filter(h => h.doctorId === doctorId);
    const sortedHours = [...doctorHours].sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentHours = sortedHours.slice(0, 5);

    if (recentHours.length === 0) {
        container.innerHTML = '<p class="text-center">No hay entradas recientes</p>';
        return;
    }

    recentHours.forEach(entry => {
        const student = getStudentById(entry.studentId);

        const entryEl = document.createElement('div');
        entryEl.className = 'hours-entry';

        const entryHeader = document.createElement('div');
        entryHeader.className = 'hours-entry-header';

        const entryTitle = document.createElement('div');
        entryTitle.innerHTML = `<strong>${entry.hours} horas</strong> con ${student.name}`;

        const statusBadge = document.createElement('span');
        statusBadge.className = `badge badge-${entry.status}`;
        statusBadge.textContent = {
            'pending': 'Pendiente',
            'approved': 'Aprobada',
            'rejected': 'Rechazada',
            'review': 'En revisión'
        }[entry.status];

        entryHeader.appendChild(entryTitle);
        entryHeader.appendChild(statusBadge);

        const entryDetails = document.createElement('div');
        entryDetails.className = 'entry-details';
        entryDetails.textContent = `${formatDate(entry.date)} - ${entry.description}`;

        entryEl.appendChild(entryHeader);
        entryEl.appendChild(entryDetails);

        container.appendChild(entryEl);
    });
}

function updateAdminPendingHours() {
    const container = document.getElementById('admin-pending-hours');
    container.innerHTML = '';

    const pendingHours = hours.filter(h => h.status === 'pending');

    if (pendingHours.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 7;
        cell.textContent = 'No hay horas pendientes de revisión';
        cell.className = 'text-center';
        row.appendChild(cell);
        container.appendChild(row);
        return;
    }

    pendingHours.forEach(entry => {
        const student = getStudentById(entry.studentId);
        const doctor = getDoctorById(entry.doctorId);

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${student.name}</td>
            <td>${doctor.name}</td>
            <td>${doctor.specialty}</td>
            <td>${formatDate(entry.date)}</td>
            <td>${entry.hours}</td>
            <td><span class="badge badge-pending">Pendiente</span></td>
            <td class="action-buttons">
                <button class="btn btn-success btn-approve" data-id="${entry.id}">Aprobar</button>
                <button class="btn btn-warning btn-review" data-id="${entry.id}">Revisar</button>
                <button class="btn btn-danger btn-reject" data-id="${entry.id}">Rechazar</button>
            </td>
        `;

        container.appendChild(row);
    });

    // Agregar event listeners para botones de acción
    container.querySelectorAll('.btn-approve').forEach(btn => {
        btn.addEventListener('click', function () {
            updateHourStatus(btn.dataset.id, 'approved');
        });
    });

    container.querySelectorAll('.btn-review').forEach(btn => {
        btn.addEventListener('click', function () {
            updateHourStatus(btn.dataset.id, 'review');
        });
    });

    container.querySelectorAll('.btn-reject').forEach(btn => {
        btn.addEventListener('click', function () {
            updateHourStatus(btn.dataset.id, 'rejected');
        });
    });
}

function updateAdminHistory() {
    const container = document.getElementById('admin-history');
    container.innerHTML = '';

    const reviewedHours = hours.filter(h => h.status !== 'pending');
    const sortedHours = [...reviewedHours].sort((a, b) => new Date(b.reviewDate || '2000-01-01') - new Date(a.reviewDate || '2000-01-01'));

    if (sortedHours.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 7;
        cell.textContent = 'No hay historial de revisiones';
        cell.className = 'text-center';
        row.appendChild(cell);
        container.appendChild(row);
        return;
    }

    sortedHours.forEach(entry => {
        const student = getStudentById(entry.studentId);
        const doctor = getDoctorById(entry.doctorId);

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${student.name}</td>
            <td>${doctor.name}</td>
            <td>${doctor.specialty}</td>
            <td>${formatDate(entry.date)}</td>
            <td>${entry.hours}</td>
            <td><span class="badge badge-${entry.status}">${{
                'approved': 'Aprobada',
                'rejected': 'Rechazada',
                'review': 'En revisión'
            }[entry.status]}</span></td>
            <td>${entry.reviewDate ? formatDate(entry.reviewDate) : '-'}</td>
        `;

        container.appendChild(row);
    });
}

function updateHourStatus(hourId, status) {
    const hourIndex = hours.findIndex(h => h.id == hourId);

    if (hourIndex !== -1) {
        hours[hourIndex].status = status;
        hours[hourIndex].reviewDate = new Date().toISOString().split('T')[0];

        // Actualizar UI
        updateAdminPendingHours();
        updateAdminHistory();

        alert(`Estado cambiado a ${status}`);
    }
}

// Funciones para las secciones del estudiante
function updateStudentHistory(studentId) {
    const container = document.getElementById('student-history-table');
    container.innerHTML = '';

    const studentHours = getStudentHours(studentId);
    const sortedHours = [...studentHours].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sortedHours.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 6;
        cell.textContent = 'No hay actividades registradas';
        cell.className = 'text-center';
        row.appendChild(cell);
        container.appendChild(row);
        return;
    }

    sortedHours.forEach(entry => {
        const doctor = getDoctorById(entry.doctorId);
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${formatDate(entry.date)}</td>
            <td>${doctor.name}</td>
            <td>${doctor.specialty}</td>
            <td>${entry.hours}</td>
            <td>${entry.description}</td>
            <td><span class="badge badge-${entry.status}">${{
                'pending': 'Pendiente',
                'approved': 'Aprobada',
                'rejected': 'Rechazada',
                'review': 'En revisión'
            }[entry.status]}</span></td>
        `;

        container.appendChild(row);
    });
}

function updateStudentSpecialtiesDetailed(studentId) {
    const container = document.getElementById('student-specialties-detailed');
    container.innerHTML = '';

    const studentHours = getStudentHours(studentId);
    const specialties = getSpecialtiesDistribution(studentId);

    for (const [specialty, totalHours] of Object.entries(specialties)) {
        const specialtyCard = document.createElement('div');
        specialtyCard.className = 'specialty-card';

        const specialtyDoctors = new Set();
        studentHours.forEach(entry => {
            const doctor = getDoctorById(entry.doctorId);
            if (doctor.specialty === specialty) {
                specialtyDoctors.add(doctor.name);
            }
        });

        specialtyCard.innerHTML = `
            <div class="specialty-header">
                <div class="specialty-title">${specialty}</div>
                <div class="specialty-hours">${totalHours} horas</div>
            </div>
            <div class="entry-details">
                Médicos: ${Array.from(specialtyDoctors).join(', ') || 'Ninguno'}
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(100, (totalHours / TOTAL_REQUIRED_HOURS) * 100)}%"></div>
                </div>
            </div>
        `;

        container.appendChild(specialtyCard);
    }
}
function updateDoctorHistory(doctorId) {
    const container = document.getElementById('doctor-history-table');
    container.innerHTML = '';

    const doctorHours = hours.filter(h => h.doctorId === doctorId);
    const sortedHours = [...doctorHours].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sortedHours.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 5;
        cell.textContent = 'No hay horas registradas';
        cell.className = 'text-center';
        row.appendChild(cell);
        container.appendChild(row);
        return;
    }

    sortedHours.forEach(entry => {
        const student = getStudentById(entry.studentId);
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${student.name}</td>
            <td>${formatDate(entry.date)}</td>
            <td>${entry.hours}</td>
            <td>${entry.description}</td>
            <td><span class="badge badge-${entry.status}">${{
                'pending': 'Pendiente',
                'approved': 'Aprobada',
                'rejected': 'Rechazada',
                'review': 'En revisión'
            }[entry.status]}</span></td>
        `;

        container.appendChild(row);
    });
}

// Funciones para las secciones del administrador
function updateAdminSpecialtyStats() {
    const container = document.getElementById('admin-specialty-stats');
    container.innerHTML = '';

    // Obtener horas por especialidad en todo el sistema
    const specialtyStats = {};
    hours.forEach(entry => {
        const doctor = getDoctorById(entry.doctorId);
        if (!specialtyStats[doctor.specialty]) {
            specialtyStats[doctor.specialty] = 0;
        }
        specialtyStats[doctor.specialty] += entry.hours;
    });

    for (const [specialty, hours] of Object.entries(specialtyStats)) {
        const specialtyCard = document.createElement('div');
        specialtyCard.className = 'specialty-card';

        specialtyCard.innerHTML = `
            <div class="specialty-header">
                <div class="specialty-title">${specialty}</div>
                <div class="specialty-hours">${hours} horas</div>
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 100%"></div>
                </div>
            </div>
        `;

        container.appendChild(specialtyCard);
    }
}

function updateAdminStudentProgress() {
    const container = document.getElementById('admin-student-progress');
    container.innerHTML = '';

    students.forEach(student => {
        const approvedHours = getTotalHours(student.id, true);
        const progressPercent = Math.min(100, (approvedHours / TOTAL_REQUIRED_HOURS) * 100);

        const studentCard = document.createElement('div');
        studentCard.className = 'specialty-card';

        studentCard.innerHTML = `
            <div class="specialty-header">
                <div class="specialty-title">${student.name}</div>
                <div class="specialty-hours">${approvedHours}/${TOTAL_REQUIRED_HOURS} horas</div>
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
            </div>
        `;

        container.appendChild(studentCard);
    });
}

function updateAdminStudentsList() {
    const container = document.getElementById('admin-students-table');
    container.innerHTML = '';

    students.forEach(student => {
        const approvedHours = getTotalHours(student.id, true);
        const progressPercent = Math.min(100, (approvedHours / TOTAL_REQUIRED_HOURS) * 100).toFixed(1);

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${getTotalHours(student.id)}</td>
            <td>${approvedHours}</td>
            <td>
                <div class="progress-container" style="margin: 0;">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
                ${progressPercent}%
            </td>
        `;

        container.appendChild(row);
    });
}