// ======================================================
// TALKPRO ADMIN PANEL
// ======================================================

// ===============================
// ADMIN AUTHENTICATION
// ===============================

const adminToken = localStorage.getItem("talkproAdminToken");
const legacyAdmin = localStorage.getItem("talkproAdmin");

if (
    adminToken !== "talkpro-admin-access" &&
    legacyAdmin !== "true"
) {
    window.location.href = "login.html";
}

// ===============================
// ONLINE BACKEND
// ===============================

const API_URL = "https://talkpro-production.up.railway.app";

function apiUrl(path) {
    return `${API_URL}${path}`;
}

// ===============================
// DOM ELEMENTS
// ===============================

const studentsTable = document.getElementById("studentsTable");

const totalStudents = document.getElementById("totalStudents");
const englishStudents = document.getElementById("englishStudents");
const russianStudents = document.getElementById("russianStudents");
const registrationCount = document.getElementById("registrationCount");

const refreshButton = document.getElementById("refreshButton");
const searchInput = document.getElementById("searchInput");

let students = [];

let studentGrowthChart = null;
let languageChart = null;

// ======================================================
// SECURITY
// ======================================================

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// ======================================================
// LOAD STUDENTS
// ======================================================

async function loadStudents() {
    if (!studentsTable) {
        return;
    }

    studentsTable.innerHTML = `
        <tr>
            <td colspan="7" class="empty-message">
                ⏳ Loading students...
            </td>
        </tr>
    `;

    try {
        const response = await fetch(
            apiUrl("/api/registrations"),
            {
                method: "GET",
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error("Failed to load students");
        }

        const data = await response.json();

        students = Array.isArray(data) ? data : [];

        displayStudents(students);
        updateStatistics();

    } catch (error) {
        console.error("Load students error:", error);

        studentsTable.innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    ❌ Cannot connect to TalkPro server.
                </td>
            </tr>
        `;
    }
}

// ======================================================
// UPDATE STATISTICS
// ======================================================

function updateStatistics() {
    if (totalStudents) {
        totalStudents.textContent = students.length;
    }

    if (registrationCount) {
        registrationCount.textContent = students.length;
    }

    const english = students.filter(student =>
        String(student.language || "")
            .toLowerCase() === "english"
    );

    const russian = students.filter(student =>
        String(student.language || "")
            .toLowerCase() === "russian"
    );

    if (englishStudents) {
        englishStudents.textContent = english.length;
    }

    if (russianStudents) {
        russianStudents.textContent = russian.length;
    }

    try {
        updateStudentGrowthChart();
    } catch (error) {
        console.error("Student growth chart error:", error);
    }

    try {
        updateLanguageChart();
    } catch (error) {
        console.error("Language chart error:", error);
    }
}

// ======================================================
// DISPLAY STUDENTS
// ======================================================

function displayStudents(list) {
    if (!studentsTable) {
        return;
    }

    if (!Array.isArray(list) || list.length === 0) {
        studentsTable.innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    No students found.
                </td>
            </tr>
        `;

        return;
    }

    studentsTable.innerHTML = list.map(student => {

        const language =
            String(student.language || "");

        const languageClass =
            language.toLowerCase() === "english"
                ? "language-english"
                : "language-russian";

        const date = student.created_at
            ? new Date(student.created_at).toLocaleString()
            : "—";

        return `
            <tr>

                <td>
                    <strong>#${student.id}</strong>
                </td>

                <td>
                    <strong>
                        ${escapeHTML(student.name)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(student.phone)}
                </td>

                <td>
                    <span class="language-badge ${languageClass}">
                        ${escapeHTML(language)}
                    </span>
                </td>

                <td>
                    <span class="level-badge">
                        ${escapeHTML(student.level)}
                    </span>

                    <span class="course-badge">
                        📚
                        ${escapeHTML(
                            student.course_name || "No course"
                        )}
                    </span>
                </td>

                <td>
                    ${date}
                </td>

                <td class="action-buttons">

                    <button
                        class="view-button"
                        data-student-id="${student.id}"
                    >
                        👁️ View
                    </button>

                    <button
                        class="edit-button"
                        data-student-id="${student.id}"
                    >
                        ✏️ Edit
                    </button>

                    <button
                        class="delete-button"
                        data-student-id="${student.id}"
                    >
                        🗑️ Delete
                    </button>

                </td>

            </tr>
        `;
    }).join("");
}

// ======================================================
// SEARCH STUDENTS
// ======================================================

if (searchInput) {
    searchInput.addEventListener("input", () => {

        const query =
            searchInput.value
                .toLowerCase()
                .trim();

        const filteredStudents =
            students.filter(student => {

                const name =
                    String(student.name || "")
                        .toLowerCase();

                const phone =
                    String(student.phone || "")
                        .toLowerCase();

                const language =
                    String(student.language || "")
                        .toLowerCase();

                const level =
                    String(student.level || "")
                        .toLowerCase();

                const course =
                    String(student.course_name || "")
                        .toLowerCase();

                return (
                    name.includes(query) ||
                    phone.includes(query) ||
                    language.includes(query) ||
                    level.includes(query) ||
                    course.includes(query)
                );
            });

        displayStudents(filteredStudents);
    });
}

// ======================================================
// REFRESH BUTTON
// ======================================================

if (refreshButton) {
    refreshButton.addEventListener(
        "click",
        async () => {
            await loadStudents();
            await loadCourses();
        }
    );
}

// ======================================================
// CURRENT YEAR
// ======================================================

const adminYear =
    document.getElementById("adminYear");

if (adminYear) {
    adminYear.textContent =
        new Date().getFullYear();
}

// ======================================================
// LOGOUT
// ======================================================

const logoutButton =
    document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "talkproAdminToken"
            );

            localStorage.removeItem(
                "talkproAdmin"
            );

            window.location.href = "login.html";
        }
    );
}

// ======================================================
// VIEW STUDENT
// ======================================================

function viewStudent(id) {

    const student =
        students.find(
            item => item.id === id
        );

    if (!student) {
        return;
    }

    const viewName =
        document.getElementById("viewName");

    const viewPhone =
        document.getElementById("viewPhone");

    const viewLanguage =
        document.getElementById("viewLanguage");

    const viewLevel =
        document.getElementById("viewLevel");

    const viewId =
        document.getElementById("viewId");

    const viewDate =
        document.getElementById("viewDate");

    const viewModal =
        document.getElementById("viewModal");

    if (viewName) {
        viewName.textContent =
            student.name || "—";
    }

    if (viewPhone) {
        viewPhone.textContent =
            student.phone || "—";
    }

    if (viewLanguage) {
        viewLanguage.textContent =
            student.language || "—";
    }

    if (viewLevel) {
        viewLevel.textContent =
            student.level || "—";
    }

    if (viewId) {
        viewId.textContent =
            `#${student.id}`;
    }

    if (viewDate) {
        viewDate.textContent =
            student.created_at
                ? new Date(
                    student.created_at
                ).toLocaleString()
                : "—";
    }

    if (viewModal) {
        viewModal.classList.add("active");
    }
}

// ======================================================
// CLOSE VIEW STUDENT
// ======================================================

function closeViewModal() {

    const modal =
        document.getElementById("viewModal");

    if (modal) {
        modal.classList.remove("active");
    }
}

const closeViewModalButton =
    document.getElementById(
        "closeViewModal"
    );

if (closeViewModalButton) {
    closeViewModalButton.addEventListener(
        "click",
        closeViewModal
    );
}

const closeViewButton =
    document.getElementById(
        "closeViewButton"
    );

if (closeViewButton) {
    closeViewButton.addEventListener(
        "click",
        closeViewModal
    );
}

const viewModal =
    document.getElementById(
        "viewModal"
    );

if (viewModal) {
    viewModal.addEventListener(
        "click",
        event => {

            if (
                event.target.id ===
                "viewModal"
            ) {
                closeViewModal();
            }
        }
    );
}

// ======================================================
// DELETE STUDENT
// ======================================================

async function deleteStudent(id) {

    const student =
        students.find(
            item => item.id === id
        );

    if (!student) {
        return;
    }

    const confirmed =
        confirm(
            `Are you sure you want to delete ${student.name}?`
        );

    if (!confirmed) {
        return;
    }

    const deleteButton =
        document.querySelector(
            `.delete-button[data-student-id="${id}"]`
        );

    if (deleteButton) {
        deleteButton.classList.add(
            "deleting"
        );
    }

    await new Promise(resolve => {
        setTimeout(resolve, 450);
    });

    try {

        const response =
            await fetch(
                apiUrl(
                    `/api/registrations/${id}`
                ),
                {
                    method: "DELETE"
                }
            );

        const data =
            await response.json();

        if (
            response.ok &&
            data.success
        ) {

            alert(
                "✅ Student deleted successfully."
            );

            await loadStudents();

        } else {

            if (deleteButton) {
                deleteButton.classList.remove(
                    "deleting"
                );
            }

            alert(
                `❌ ${
                    data.message ||
                    "Could not delete student."
                }`
            );
        }

    } catch (error) {

        console.error(
            "Delete student error:",
            error
        );

        if (deleteButton) {
            deleteButton.classList.remove(
                "deleting"
            );
        }

        alert(
            "❌ Cannot connect to TalkPro server."
        );
    }
}

// ======================================================
// EDIT STUDENT
// ======================================================

function editStudent(id) {

    const student =
        students.find(
            item => item.id === id
        );

    if (!student) {
        return;
    }

    const editStudentId =
        document.getElementById(
            "editStudentId"
        );

    const editName =
        document.getElementById(
            "editName"
        );

    const editPhone =
        document.getElementById(
            "editPhone"
        );

    const editLanguage =
        document.getElementById(
            "editLanguage"
        );

    const editLevel =
        document.getElementById(
            "editLevel"
        );

    const editModal =
        document.getElementById(
            "editModal"
        );

    if (editStudentId) {
        editStudentId.value =
            student.id;
    }

    if (editName) {
        editName.value =
            student.name || "";
    }

    if (editPhone) {
        editPhone.value =
            student.phone || "";
    }

    if (editLanguage) {
        editLanguage.value =
            student.language || "";
    }

    if (editLevel) {
        editLevel.value =
            student.level || "";
    }

    if (editModal) {
        editModal.classList.add(
            "active"
        );
    }
}

// ======================================================
// CLOSE EDIT STUDENT
// ======================================================

function closeEditModal() {

    const modal =
        document.getElementById(
            "editModal"
        );

    if (modal) {
        modal.classList.remove(
            "active"
        );
    }
}

const closeEditButton =
    document.getElementById(
        "closeEditModal"
    );

if (closeEditButton) {
    closeEditButton.addEventListener(
        "click",
        closeEditModal
    );
}

const cancelEdit =
    document.getElementById(
        "cancelEdit"
    );

if (cancelEdit) {
    cancelEdit.addEventListener(
        "click",
        closeEditModal
    );
}

const editModal =
    document.getElementById(
        "editModal"
    );

if (editModal) {
    editModal.addEventListener(
        "click",
        event => {

            if (
                event.target.id ===
                "editModal"
            ) {
                closeEditModal();
            }
        }
    );
}

// ======================================================
// SAVE EDITED STUDENT
// ======================================================

const editForm =
    document.getElementById(
        "editForm"
    );

if (editForm) {

    editForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const id =
                Number(
                    document.getElementById(
                        "editStudentId"
                    )?.value
                );

            const name =
                document.getElementById(
                    "editName"
                )?.value.trim();

            const phone =
                document.getElementById(
                    "editPhone"
                )?.value.trim();

            const language =
                document.getElementById(
                    "editLanguage"
                )?.value;

            const level =
                document.getElementById(
                    "editLevel"
                )?.value;

            if (
                !name ||
                !phone ||
                !language ||
                !level
            ) {
                alert(
                    "❌ Please complete all fields."
                );
                return;
            }

            try {

                const response =
                    await fetch(
                        apiUrl(
                            `/api/registrations/${id}`
                        ),
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body:
                                JSON.stringify({
                                    name,
                                    phone,
                                    language,
                                    level
                                })
                        }
                    );

                const data =
                    await response.json();

                if (
                    response.ok &&
                    data.success
                ) {

                    closeEditModal();

                    alert(
                        "✅ Student updated successfully!"
                    );

                    await loadStudents();

                } else {

                    alert(
                        `❌ ${
                            data.message ||
                            "Could not update student."
                        }`
                    );
                }

            } catch (error) {

                console.error(
                    "Edit student error:",
                    error
                );

                alert(
                    "❌ Cannot connect to TalkPro server."
                );
            }
        }
    );
}

// ======================================================
// ADD STUDENT
// ======================================================

const addStudentButton =
    document.getElementById(
        "addStudentButton"
    );

const addModal =
    document.getElementById(
        "addModal"
    );

const closeAddModal =
    document.getElementById(
        "closeAddModal"
    );

const cancelAdd =
    document.getElementById(
        "cancelAdd"
    );

if (addStudentButton) {
    addStudentButton.addEventListener(
        "click",
        () => {

            if (addModal) {
                addModal.classList.add(
                    "active"
                );
            }
        }
    );
}

if (closeAddModal) {
    closeAddModal.addEventListener(
        "click",
        () => {

            if (addModal) {
                addModal.classList.remove(
                    "active"
                );
            }
        }
    );
}

if (cancelAdd) {
    cancelAdd.addEventListener(
        "click",
        () => {

            if (addModal) {
                addModal.classList.remove(
                    "active"
                );
            }
        }
    );
}

if (addModal) {
    addModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                addModal
            ) {
                addModal.classList.remove(
                    "active"
                );
            }
        }
    );
}

// ======================================================
// SAVE NEW STUDENT
// ======================================================

const addForm =
    document.getElementById(
        "addForm"
    );

if (addForm) {

    addForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const name =
                document.getElementById(
                    "addName"
                )?.value.trim();

            const phone =
                document.getElementById(
                    "addPhone"
                )?.value.trim();

            const language =
                document.getElementById(
                    "addLanguage"
                )?.value;

            const level =
                document.getElementById(
                    "addLevel"
                )?.value;

            if (
                !name ||
                !phone ||
                !language ||
                !level
            ) {
                alert(
                    "❌ Please complete all fields."
                );
                return;
            }

            try {

                const response =
                    await fetch(
                        apiUrl(
                            "/api/register"
                        ),
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body:
                                JSON.stringify({
                                    name,
                                    phone,
                                    language,
                                    level
                                })
                        }
                    );

                const data =
                    await response.json();

                if (
                    response.ok &&
                    data.success
                ) {

                    if (addModal) {
                        addModal.classList.remove(
                            "active"
                        );
                    }

                    addForm.reset();

                    alert(
                        "✅ Student added successfully!"
                    );

                    await loadStudents();

                } else {

                    alert(
                        `❌ ${
                            data.message ||
                            "Could not add student."
                        }`
                    );
                }

            } catch (error) {

                console.error(
                    "Add student error:",
                    error
                );

                alert(
                    "❌ Cannot connect to TalkPro server."
                );
            }
        }
    );
}

// ======================================================
// STUDENT GROWTH CHART
// ======================================================

function updateStudentGrowthChart() {

    const canvas =
        document.getElementById(
            "studentGrowthChart"
        );

    if (!canvas) {
        return;
    }

    if (
        typeof Chart ===
        "undefined"
    ) {
        console.warn(
            "Chart.js is not loaded."
        );
        return;
    }

    const grouped = {};

    students.forEach(student => {

        if (!student.created_at) {
            return;
        }

        const date =
            String(
                student.created_at
            ).split(" ")[0];

        grouped[date] =
            (grouped[date] || 0) + 1;
    });

    const dates =
        Object.keys(grouped)
            .sort();

    const labels =
        dates.map(date => {

            const parts =
                date.split("-");

            return parts.length >= 3
                ? `${parts[2]}/${parts[1]}`
                : date;
        });

    const values =
        dates.map(
            date => grouped[date]
        );

    if (studentGrowthChart) {
        studentGrowthChart.destroy();
    }

    const ctx =
        canvas.getContext("2d");

    studentGrowthChart =
        new Chart(ctx, {

            type: "line",

            data: {
                labels,

                datasets: [{
                    label:
                        "Students",

                    data:
                        values,

                    tension:
                        0.4,

                    fill:
                        true,

                    borderWidth:
                        3,

                    pointRadius:
                        5,

                    pointHoverRadius:
                        8
                }]
            },

            options: {
                responsive:
                    true,

                maintainAspectRatio:
                    false,

                interaction: {
                    intersect:
                        false,

                    mode:
                        "index"
                },

                plugins: {
                    legend: {
                        display:
                            true
                    },

                    tooltip: {
                        enabled:
                            true
                    }
                },

                scales: {

                    y: {
                        beginAtZero:
                            true,

                        ticks: {
                            precision:
                                0
                        }
                    },

                    x: {
                        grid: {
                            display:
                                false
                        }
                    }
                }
            }
        });
}

// ======================================================
// LANGUAGE CHART
// ======================================================

function updateLanguageChart() {

    const canvas =
        document.getElementById(
            "languageChart"
        );

    if (!canvas) {
        return;
    }

    if (
        typeof Chart ===
        "undefined"
    ) {
        console.warn(
            "Chart.js is not loaded."
        );
        return;
    }

    const english =
        students.filter(
            student =>
                String(
                    student.language || ""
                ).toLowerCase() ===
                "english"
        ).length;

    const russian =
        students.filter(
            student =>
                String(
                    student.language || ""
                ).toLowerCase() ===
                "russian"
        ).length;

    if (languageChart) {
        languageChart.destroy();
    }

    const ctx =
        canvas.getContext("2d");

    languageChart =
        new Chart(ctx, {

            type: "doughnut",

            data: {

                labels: [
                    "English",
                    "Russian"
                ],

                datasets: [{
                    data: [
                        english,
                        russian
                    ],

                    borderWidth:
                        3
                }]
            },

            options: {

                responsive:
                    true,

                maintainAspectRatio:
                    false,

                plugins: {

                    legend: {
                        position:
                            "bottom"
                    },

                    tooltip: {
                        enabled:
                            true
                    }
                }
            }
        });
}

// ======================================================
// COURSES
// ======================================================

async function loadCourses() {

    const coursesGrid =
        document.getElementById(
            "coursesGrid"
        );

    if (!coursesGrid) {
        return;
    }

    try {

        const response =
            await fetch(
                apiUrl(
                    "/api/courses"
                ),
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load courses"
            );
        }

        const data =
            await response.json();

        const courses =
            Array.isArray(data)
                ? data
                : [];

        if (courses.length === 0) {

            coursesGrid.innerHTML = `
                <div style="
                    grid-column:1 / -1;
                    text-align:center;
                    padding:40px;
                ">
                    📚 No courses found.
                </div>
            `;

            return;
        }

        coursesGrid.innerHTML =
            courses.map(
                course => {

                    const icon =
                        String(
                            course.language ||
                            ""
                        ).toLowerCase() ===
                        "english"
                            ? "🇬🇧"
                            : "🇷🇺";

                    return `
                        <div class="course-card">

                            <div class="course-icon">
                                ${icon}
                            </div>

                            <div class="course-info">

                                <h3>
                                    ${escapeHTML(
                                        course.name
                                    )}
                                </h3>

                                <p>
                                    ${escapeHTML(
                                        course.language
                                    )}
                                    Language Course
                                </p>

                                <div class="course-meta">

                                    <span>
                                        📊
                                        ${escapeHTML(
                                            course.level
                                        )}
                                    </span>

                                    <span>
                                        ⏱️
                                        ${escapeHTML(
                                            course.duration
                                        )}
                                    </span>

                                </div>

                            </div>

                            <div class="course-price">

                                <strong>
                                    $${Number(
                                        course.price || 0
                                    ).toFixed(0)}
                                </strong>

                                <span>
                                    / month
                                </span>

                            </div>

                            <div class="course-actions">

                                <button
                                    class="view-course"
                                    data-course-id="${course.id}"
                                    title="View Course"
                                >
                                    👁️
                                </button>

                                <button
                                    class="edit-course"
                                    data-course-id="${course.id}"
                                    title="Edit Course"
                                >
                                    ✏️
                                </button>

                                <button
                                    class="delete-course"
                                    data-course-id="${course.id}"
                                    title="Delete Course"
                                >
                                    🗑️
                                </button>

                            </div>

                        </div>
                    `;
                }
            ).join("");

    } catch (error) {

        console.error(
            "Load courses error:",
            error
        );

        coursesGrid.innerHTML = `
            <div style="
                grid-column:1 / -1;
                text-align:center;
                padding:40px;
            ">
                ❌ Cannot load courses from database.
            </div>
        `;
    }
}

// ======================================================
// ADD COURSE
// ======================================================

const addCourseButton =
    document.getElementById(
        "addCourseButton"
    );

const addCourseModal =
    document.getElementById(
        "addCourseModal"
    );

const closeAddCourseModal =
    document.getElementById(
        "closeAddCourseModal"
    );

const cancelAddCourse =
    document.getElementById(
        "cancelAddCourse"
    );

const addCourseForm =
    document.getElementById(
        "addCourseForm"
    );

if (addCourseButton) {

    addCourseButton.addEventListener(
        "click",
        () => {

            if (addCourseModal) {
                addCourseModal.classList.add(
                    "active"
                );
            }
        }
    );
}

if (closeAddCourseModal) {

    closeAddCourseModal.addEventListener(
        "click",
        () => {

            if (addCourseModal) {
                addCourseModal.classList.remove(
                    "active"
                );
            }
        }
    );
}

if (cancelAddCourse) {

    cancelAddCourse.addEventListener(
        "click",
        () => {

            if (addCourseModal) {
                addCourseModal.classList.remove(
                    "active"
                );
            }
        }
    );
}

if (addCourseModal) {

    addCourseModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                addCourseModal
            ) {
                addCourseModal.classList.remove(
                    "active"
                );
            }
        }
    );
}

// ======================================================
// SAVE NEW COURSE
// ======================================================

if (addCourseForm) {

    addCourseForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const courseName =
                document.getElementById(
                    "courseName"
                )?.value.trim();

            const language =
                document.getElementById(
                    "courseLanguage"
                )?.value;

            const level =
                document.getElementById(
                    "courseLevel"
                )?.value;

            const price =
                document.getElementById(
                    "coursePrice"
                )?.value;

            const duration =
                document.getElementById(
                    "courseDuration"
                )?.value.trim();

            if (
                !courseName ||
                !language ||
                !level ||
                !price ||
                !duration
            ) {

                alert(
                    "❌ Please complete all fields."
                );

                return;
            }

            try {

                const response =
                    await fetch(
                        apiUrl(
                            "/api/courses"
                        ),
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    name:
                                        courseName,

                                    language,

                                    level,

                                    price:
                                        Number(
                                            price
                                        ),

                                    duration
                                })
                        }
                    );

                const data =
                    await response.json();

                if (
                    response.ok &&
                    data.success
                ) {

                    alert(
                        "✅ Course added successfully!"
                    );

                    addCourseForm.reset();

                    if (addCourseModal) {
                        addCourseModal.classList.remove(
                            "active"
                        );
                    }

                    await loadCourses();

                } else {

                    alert(
                        `❌ ${
                            data.message ||
                            "Could not add course."
                        }`
                    );
                }

            } catch (error) {

                console.error(
                    "Add course error:",
                    error
                );

                alert(
                    "❌ Cannot connect to TalkPro server."
                );
            }
        }
    );
}

// ======================================================
// VIEW COURSE
// ======================================================

async function viewCourse(id) {

    try {

        const response =
            await fetch(
                apiUrl(
                    "/api/courses"
                ),
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load course"
            );
        }

        const courses =
            await response.json();

        const course =
            courses.find(
                item =>
                    item.id === Number(id)
            );

        if (!course) {

            alert(
                "❌ Course not found."
            );

            return;
        }

        const icon =
            String(
                course.language || ""
            ).toLowerCase() ===
            "english"
                ? "🇬🇧"
                : "🇷🇺";

        const elements = {

            name:
                document.getElementById(
                    "viewCourseName"
                ),

            language:
                document.getElementById(
                    "viewCourseLanguage"
                ),

            level:
                document.getElementById(
                    "viewCourseLevel"
                ),

            price:
                document.getElementById(
                    "viewCoursePrice"
                ),

            duration:
                document.getElementById(
                    "viewCourseDuration"
                ),

            id:
                document.getElementById(
                    "viewCourseId"
                ),

            date:
                document.getElementById(
                    "viewCourseDate"
                ),

            modal:
                document.getElementById(
                    "viewCourseModal"
                )
        };

        if (elements.name) {
            elements.name.textContent =
                course.name || "—";
        }

        if (elements.language) {
            elements.language.textContent =
                `${icon} ${course.language || ""}`;
        }

        if (elements.level) {
            elements.level.textContent =
                course.level || "—";
        }

        if (elements.price) {
            elements.price.textContent =
                `$${Number(
                    course.price || 0
                ).toFixed(0)} / month`;
        }

        if (elements.duration) {
            elements.duration.textContent =
                course.duration || "—";
        }

        if (elements.id) {
            elements.id.textContent =
                `#${course.id}`;
        }

        if (elements.date) {
            elements.date.textContent =
                course.created_at
                    ? new Date(
                        course.created_at
                    ).toLocaleString()
                    : "—";
        }

        if (elements.modal) {
            elements.modal.classList.add(
                "active"
            );
        }

    } catch (error) {

        console.error(
            "View course error:",
            error
        );

        alert(
            "❌ Cannot load course."
        );
    }
}

// ======================================================
// CLOSE VIEW COURSE
// ======================================================

function closeViewCourseModal() {

    const modal =
        document.getElementById(
            "viewCourseModal"
        );

    if (modal) {
        modal.classList.remove(
            "active"
        );
    }
}

const closeViewCourseModalButton =
    document.getElementById(
        "closeViewCourseModal"
    );

if (closeViewCourseModalButton) {

    closeViewCourseModalButton.addEventListener(
        "click",
        closeViewCourseModal
    );
}

const closeViewCourseButton =
    document.getElementById(
        "closeViewCourseButton"
    );

if (closeViewCourseButton) {

    closeViewCourseButton.addEventListener(
        "click",
        closeViewCourseModal
    );
}

const viewCourseModal =
    document.getElementById(
        "viewCourseModal"
    );

if (viewCourseModal) {

    viewCourseModal.addEventListener(
        "click",
        event => {

            if (
                event.target.id ===
                "viewCourseModal"
            ) {
                closeViewCourseModal();
            }
        }
    );
}

// ======================================================
// EDIT COURSE
// ======================================================

async function editCourse(id) {

    try {

        const response =
            await fetch(
                apiUrl(
                    "/api/courses"
                ),
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load courses"
            );
        }

        const courses =
            await response.json();

        const course =
            courses.find(
                item =>
                    item.id === Number(id)
            );

        if (!course) {

            alert(
                "❌ Course not found."
            );

            return;
        }

        const fields = {

            id:
                document.getElementById(
                    "editCourseId"
                ),

            name:
                document.getElementById(
                    "editCourseName"
                ),

            language:
                document.getElementById(
                    "editCourseLanguage"
                ),

            level:
                document.getElementById(
                    "editCourseLevel"
                ),

            price:
                document.getElementById(
                    "editCoursePrice"
                ),

            duration:
                document.getElementById(
                    "editCourseDuration"
                ),

            modal:
                document.getElementById(
                    "editCourseModal"
                )
        };

        if (fields.id) {
            fields.id.value =
                course.id;
        }

        if (fields.name) {
            fields.name.value =
                course.name || "";
        }

        if (fields.language) {
            fields.language.value =
                course.language || "";
        }

        if (fields.level) {
            fields.level.value =
                course.level || "";
        }

        if (fields.price) {
            fields.price.value =
                course.price || "";
        }

        if (fields.duration) {
            fields.duration.value =
                course.duration || "";
        }

        if (fields.modal) {
            fields.modal.classList.add(
                "active"
            );
        }

    } catch (error) {

        console.error(
            "Edit course error:",
            error
        );

        alert(
            "❌ Cannot load course."
        );
    }
}

// ======================================================
// CLOSE EDIT COURSE
// ======================================================

function closeEditCourseModal() {

    const modal =
        document.getElementById(
            "editCourseModal"
        );

    if (modal) {
        modal.classList.remove(
            "active"
        );
    }
}

const closeEditCourseButton =
    document.getElementById(
        "closeEditCourseModal"
    );

if (closeEditCourseButton) {

    closeEditCourseButton.addEventListener(
        "click",
        closeEditCourseModal
    );
}

const cancelEditCourse =
    document.getElementById(
        "cancelEditCourse"
    );

if (cancelEditCourse) {

    cancelEditCourse.addEventListener(
        "click",
        closeEditCourseModal
    );
}

const editCourseModal =
    document.getElementById(
        "editCourseModal"
    );

if (editCourseModal) {

    editCourseModal.addEventListener(
        "click",
        event => {

            if (
                event.target.id ===
                "editCourseModal"
            ) {
                closeEditCourseModal();
            }
        }
    );
}

// ======================================================
// SAVE EDITED COURSE
// ======================================================

const editCourseForm =
    document.getElementById(
        "editCourseForm"
    );

if (editCourseForm) {

    editCourseForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const id =
                Number(
                    document.getElementById(
                        "editCourseId"
                    )?.value
                );

            const name =
                document.getElementById(
                    "editCourseName"
                )?.value.trim();

            const language =
                document.getElementById(
                    "editCourseLanguage"
                )?.value;

            const level =
                document.getElementById(
                    "editCourseLevel"
                )?.value;

            const price =
                document.getElementById(
                    "editCoursePrice"
                )?.value;

            const duration =
                document.getElementById(
                    "editCourseDuration"
                )?.value.trim();

            if (
                !name ||
                !language ||
                !level ||
                !price ||
                !duration
            ) {

                alert(
                    "❌ Please complete all fields."
                );

                return;
            }

            try {

                const response =
                    await fetch(
                        apiUrl(
                            `/api/courses/${id}`
                        ),
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    name,
                                    language,
                                    level,
                                    price:
                                        Number(
                                            price
                                        ),
                                    duration
                                })
                        }
                    );

                const data =
                    await response.json();

                if (
                    response.ok &&
                    data.success
                ) {

                    alert(
                        "✅ Course updated successfully!"
                    );

                    closeEditCourseModal();

                    await loadCourses();

                } else {

                    alert(
                        `❌ ${
                            data.message ||
                            "Could not update course."
                        }`
                    );
                }

            } catch (error) {

                console.error(
                    "Update course error:",
                    error
                );

                alert(
                    "❌ Cannot connect to TalkPro server."
                );
            }
        }
    );
}

// ======================================================
// DELETE COURSE
// ======================================================

async function deleteCourse(id) {

    const confirmed =
        confirm(
            "⚠️ Are you sure you want to delete this course?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await fetch(
                apiUrl(
                    `/api/courses/${id}`
                ),
                {
                    method: "DELETE"
                }
            );

        const data =
            await response.json();

        if (
            response.ok &&
            data.success
        ) {

            alert(
                "✅ Course deleted successfully!"
            );

            await loadCourses();

            // Student list may show course names.
            await loadStudents();

        } else {

            alert(
                `❌ ${
                    data.message ||
                    "Could not delete course."
                }`
            );
        }

    } catch (error) {

        console.error(
            "Delete course error:",
            error
        );

        alert(
            "❌ Cannot connect to TalkPro server."
        );
    }
}

// ======================================================
// ACTION BUTTONS
// ======================================================

document.addEventListener(
    "click",
    event => {

        const viewStudentButton =
            event.target.closest(
                ".view-button"
            );

        if (viewStudentButton) {

            const id =
                Number(
                    viewStudentButton
                        .dataset
                        .studentId
                );

            viewStudent(id);

            return;
        }

        const editStudentButton =
            event.target.closest(
                ".edit-button"
            );

        if (editStudentButton) {

            const id =
                Number(
                    editStudentButton
                        .dataset
                        .studentId
                );

            editStudent(id);

            return;
        }

        const deleteStudentButton =
            event.target.closest(
                ".delete-button"
            );

        if (deleteStudentButton) {

            const id =
                Number(
                    deleteStudentButton
                        .dataset
                        .studentId
                );

            deleteStudent(id);

            return;
        }

        const viewCourseButton =
            event.target.closest(
                ".view-course"
            );

        if (viewCourseButton) {

            const id =
                Number(
                    viewCourseButton
                        .dataset
                        .courseId
                );

            viewCourse(id);

            return;
        }

        const editCourseButton =
            event.target.closest(
                ".edit-course"
            );

        if (editCourseButton) {

            const id =
                Number(
                    editCourseButton
                        .dataset
                        .courseId
                );

            editCourse(id);

            return;
        }

        const deleteCourseButton =
            event.target.closest(
                ".delete-course"
            );

        if (deleteCourseButton) {

            const id =
                Number(
                    deleteCourseButton
                        .dataset
                        .courseId
                );

            deleteCourse(id);

            return;
        }
    }
);

// ======================================================
// START ADMIN PANEL
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadStudents();
        await loadCourses();
    }
);