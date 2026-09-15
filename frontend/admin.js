// ===============================
// ADMIN AUTHENTICATION
// ===============================

const adminToken = localStorage.getItem("talkproAdminToken");

if (adminToken !== "talkpro-admin-access") {
    window.location.href = "login.html";
}
const API_URL = "http://localhost:3000";

const studentsTable = document.getElementById("studentsTable");
const totalStudents = document.getElementById("totalStudents");
const englishStudents = document.getElementById("englishStudents");
const russianStudents = document.getElementById("russianStudents");
const registrationCount = document.getElementById("registrationCount");

const refreshButton = document.getElementById("refreshButton");
const searchInput = document.getElementById("searchInput");

let students = [];


// ===============================
// LOAD STUDENTS
// ===============================

async function loadStudents() {
    studentsTable.innerHTML = `
        <tr>
            <td colspan="6" class="empty-message">
                ⏳ Loading students...
            </td>
        </tr>
    `;

    try {
      const response = await fetch(
    "http://localhost:3000/api/registrations"
);
        if (!response.ok) {
            throw new Error("Failed to load students");
        }

        students = await response.json();

        updateStatistics();

        displayStudents(students);

    } catch (error) {
        console.error(error);

        studentsTable.innerHTML = `
            <tr>
                <td colspan="6" class="empty-message">
                    ❌ Cannot connect to TalkPro server.
                </td>
            </tr>
        `;
    }
}


// ===============================
// STATISTICS
// ===============================

function updateStatistics() {

    totalStudents.textContent = students.length;

    registrationCount.textContent = students.length;

    const english = students.filter(
        student =>
            student.language.toLowerCase() === "english"
    );

    const russian = students.filter(
        student =>
            student.language.toLowerCase() === "russian"
    );

    englishStudents.textContent = english.length;
    russianStudents.textContent = russian.length;

updateStudentGrowthChart();
updateLanguageChart();

}


// ===============================
// DISPLAY STUDENTS
// ===============================

function displayStudents(list) {

    if (list.length === 0) {

        studentsTable.innerHTML = `
            <tr>
                <td colspan="6" class="empty-message">
                    No students found.
                </td>
            </tr>
        `;

        return;
    }


    studentsTable.innerHTML = list.map(student => {

        const languageClass =
            student.language.toLowerCase() === "english"
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
                    <strong>${escapeHTML(student.name)}</strong>
                </td>

                <td>
                    ${escapeHTML(student.phone)}
                </td>

                <td>
                    <span class="language-badge ${languageClass}">
                        ${escapeHTML(student.language)}
                    </span>
                </td>

                <td>
                    <span class="level-badge">
    ${escapeHTML(student.level)}
</span>

<span class="course-badge">
    📚 ${escapeHTML(student.course_name || "No course")}
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


// ===============================
// SEARCH
// ===============================

if (searchInput) {

    searchInput.addEventListener("input", () => {

        const query =
            searchInput.value
                .toLowerCase()
                .trim();


        const filteredStudents =
            students.filter(student => {

                return (
                    student.name.toLowerCase().includes(query) ||
                    student.phone.toLowerCase().includes(query) ||
                    student.language.toLowerCase().includes(query) ||
                    student.level.toLowerCase().includes(query)
                );

            });


        displayStudents(filteredStudents);
    });
}


// ===============================
// REFRESH
// ===============================

if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        loadStudents
    );
}


// ===============================
// SECURITY
// ===============================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ===============================
// CURRENT YEAR
// ===============================

const adminYear =
    document.getElementById("adminYear");

if (adminYear) {
    adminYear.textContent =
        new Date().getFullYear();
}


// ===============================
// START
// ===============================

loadStudents();
// ===============================
// LOGOUT
// ===============================

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("talkproAdminToken");

        window.location.href = "login.html";
    });
}
/* ===============================
   DELETE STUDENT
=============================== */

async function deleteStudent(id) {

    const student = students.find(
        student => student.id === id
    );

    if (!student) {
        return;
    }

    const confirmed = confirm(
        `Are you sure you want to delete ${student.name}?`
    );

    if (!confirmed) {
        return;
    }

    /* Delete button animation */

    const deleteButton =
        document.querySelector(
            `.delete-button[data-student-id="${id}"]`
        );

    if (deleteButton) {
        deleteButton.classList.add("deleting");
    }

    /* Wait for animation */

    await new Promise(resolve => {
        setTimeout(resolve, 450);
    });

    try {

        const response = await fetch(
            `${API_URL}/api/registrations/${id}`,
            {
                method: "DELETE"
            }
        );

        const data =
            await response.json();

        if (response.ok && data.success) {

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
            "Delete error:",
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
// ===============================
// ACTION BUTTONS CLICK
document.addEventListener("click", (event) => {
    const editButton = event.target.closest(".edit-button");
    const deleteButton = event.target.closest(".delete-button");
    const viewCourseButton =
    event.target.closest(".view-course");

if (viewCourseButton) {
    const id = Number(
        viewCourseButton.dataset.courseId
    );

    viewCourse(id);
    return;
}
const editCourseButton =
    event.target.closest(".edit-course");

if (editCourseButton) {
    const id = Number(
        editCourseButton.dataset.courseId
    );

    editCourse(id);
    return;
}
const deleteCourseButton =
    event.target.closest(".delete-course");

if (deleteCourseButton) {

    const id = Number(
        deleteCourseButton.dataset.courseId
    );

    const confirmed = confirm(
        "⚠️ Are you sure you want to delete this course?"
    );

    if (!confirmed) {
        return;
    }

    fetch(`${API_URL}/api/courses/${id}`, {
        method: "DELETE"
    })
        .then(response => response.json())
        .then(data => {

            if (data.success) {

                alert("✅ Course deleted successfully!");

                loadCourses();

            } else {

                alert(
                    `❌ ${data.message || "Could not delete course."}`
                );

            }

        })
        .catch(error => {

            console.error(
                "Delete course error:",
                error
            );

            alert(
                "❌ Cannot connect to TalkPro server."
            );

        });

    return;
}
    if (event.target.closest(".view-button")) {
    const button = event.target.closest(".view-button");
    const id = Number(button.dataset.studentId);

    viewStudent(id);
    return;
}

    if (editButton) {
        const id = Number(editButton.dataset.studentId);
        editStudent(id);
        return;
    }

    if (deleteButton) {
        const id = Number(deleteButton.dataset.studentId);
        deleteStudent(id);
    }
});
    // EDIT STUDENT
    // VIEW STUDENT
function viewStudent(id) {
    const student = students.find(
        student => student.id === id
    );

    if (!student) {
        return;
    }

    document.getElementById("viewName").textContent =
        student.name;

    document.getElementById("viewPhone").textContent =
        student.phone;

    document.getElementById("viewLanguage").textContent =
        student.language;

    document.getElementById("viewLevel").textContent =
        student.level;

    document.getElementById("viewId").textContent =
        `#${student.id}`;

    const date = student.created_at
        ? new Date(student.created_at).toLocaleString()
        : "—";

    document.getElementById("viewDate").textContent =
        date;

    document.getElementById("viewModal")
        .classList.add("active");
}


// CLOSE VIEW MODAL
function closeViewModal() {
    document.getElementById("viewModal")
        .classList.remove("active");
}

document.getElementById("closeViewModal")
    .addEventListener("click", closeViewModal);

document.getElementById("closeViewButton")
    .addEventListener("click", closeViewModal);


// CLOSE WHEN CLICKING OUTSIDE
document.getElementById("viewModal")
    .addEventListener("click", (event) => {
        if (event.target.id === "viewModal") {
            closeViewModal();
        }
    });
    function editStudent(id) {
            const student = students.find(
        student => student.id === id
    );

    if (!student) {
        return;
    }

    document.getElementById("editStudentId").value = student.id;
    document.getElementById("editName").value = student.name;
    document.getElementById("editPhone").value = student.phone;
    document.getElementById("editLanguage").value = student.language;
    document.getElementById("editLevel").value = student.level;

    document.getElementById("editModal").classList.add("active");
}


// CLOSE EDIT MODAL
function closeEditModal() {
    document.getElementById("editModal").classList.remove("active");
}


// CLOSE BUTTON
document.getElementById("closeEditModal").addEventListener(
    "click",
    closeEditModal
);


// CANCEL BUTTON
document.getElementById("cancelEdit").addEventListener(
    "click",
    closeEditModal
);


// CLICK OUTSIDE MODAL
document.getElementById("editModal").addEventListener(
    "click",
    (event) => {
        if (event.target.id === "editModal") {
            closeEditModal();
        }
    }
);


// SAVE EDITED STUDENT
document.getElementById("editForm").addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        const id = Number(
            document.getElementById("editStudentId").value
        );

        const name = document
            .getElementById("editName")
            .value.trim();

        const phone = document
            .getElementById("editPhone")
            .value.trim();

        const language = document
            .getElementById("editLanguage")
            .value;

        const level = document
            .getElementById("editLevel")
            .value;

        if (!name || !phone || !language || !level) {
            alert("❌ Please complete all fields.");
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/api/registrations/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        phone,
                        language,
                        level
                    })
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                closeEditModal();

                alert("✅ Student updated successfully!");

                await loadStudents();
            } else {
                alert(
                    `❌ ${data.message || "Could not update student."}`
                );
            }

        } catch (error) {
            console.error("Edit error:", error);

            alert(
                "❌ Cannot connect to TalkPro server."
            );
        }
    }
);
// ADD STUDENT MODAL
const addStudentButton = document.getElementById("addStudentButton");
const addModal = document.getElementById("addModal");
const closeAddModal = document.getElementById("closeAddModal");
const cancelAdd = document.getElementById("cancelAdd");

if (addStudentButton) {
    addStudentButton.addEventListener("click", () => {
        addModal.classList.add("active");
    });
}

if (closeAddModal) {
    closeAddModal.addEventListener("click", () => {
        addModal.classList.remove("active");
    });
}

if (cancelAdd) {
    cancelAdd.addEventListener("click", () => {
        addModal.classList.remove("active");
    });
}

if (addModal) {
    addModal.addEventListener("click", (event) => {
        if (event.target === addModal) {
            addModal.classList.remove("active");
        }
    });
}
// SAVE NEW STUDENT
const addForm = document.getElementById("addForm");

if (addForm) {
    addForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("addName").value.trim();
        const phone = document.getElementById("addPhone").value.trim();
        const language = document.getElementById("addLanguage").value;
        const level = document.getElementById("addLevel").value;

        if (!name || !phone || !language || !level) {
            alert("❌ Please complete all fields.");
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/api/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        phone,
                        language,
                        level
                    })
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                addModal.classList.remove("active");

                addForm.reset();

                alert("✅ Student added successfully!");

                await loadStudents();
            } else {
                alert(
                    `❌ ${data.message || "Could not add student."}`
                );
            }

        } catch (error) {
            console.error("Add student error:", error);

            alert(
                "❌ Cannot connect to TalkPro server."
            );
        }
    });
}
// ===============================
// STUDENT GROWTH CHART
// ===============================

// ===============================
// PROFESSIONAL STUDENT GROWTH CHART
// ===============================

let studentGrowthChart = null;

function updateStudentGrowthChart() {
    const canvas = document.getElementById("studentGrowthChart");

    if (!canvas) {
        return;
    }

    const grouped = {};

    students.forEach(student => {
        if (!student.created_at) {
            return;
        }

        const date = student.created_at.split(" ")[0];

        grouped[date] = (grouped[date] || 0) + 1;
    });

    const dates = Object.keys(grouped).sort();

    const labels = dates.map(date => {
        const parts = date.split("-");
        return `${parts[2]}/${parts[1]}`;
    });

    const values = dates.map(date => grouped[date]);

    if (studentGrowthChart) {
        studentGrowthChart.destroy();
    }

    const ctx = canvas.getContext("2d");

    studentGrowthChart = new Chart(ctx, {
        type: "line",

        data: {
            labels: labels,

            datasets: [{
                label: "Students",
                data: values,
                tension: 0.4,
                fill: true,
                borderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 8
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                intersect: false,
                mode: "index"
            },

            plugins: {
                legend: {
                    display: true
                },

                tooltip: {
                    enabled: true
                }
            },

            scales: {
                y: {
                    beginAtZero: true,

                    ticks: {
                        precision: 0
                    }
                },

                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}
// ===============================
// LANGUAGE DISTRIBUTION CHART
// ===============================

let languageChart = null;

function updateLanguageChart() {
    const canvas = document.getElementById("languageChart");

    if (!canvas) {
        return;
    }

    const english = students.filter(
        student =>
            student.language.toLowerCase() === "english"
    ).length;

    const russian = students.filter(
        student =>
            student.language.toLowerCase() === "russian"
    ).length;

    if (languageChart) {
        languageChart.destroy();
    }

    const ctx = canvas.getContext("2d");

    languageChart = new Chart(ctx, {
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

                borderWidth: 3
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom"
                },

                tooltip: {
                    enabled: true
                }
            }
        }
    });
}
// ================================
// ADD COURSE
// ================================

const addCourseButton = document.getElementById("addCourseButton");
const addCourseModal = document.getElementById("addCourseModal");
const closeAddCourseModal = document.getElementById("closeAddCourseModal");
const cancelAddCourse = document.getElementById("cancelAddCourse");
const addCourseForm = document.getElementById("addCourseForm");

if (addCourseButton) {
    addCourseButton.addEventListener("click", () => {
        addCourseModal.classList.add("active");
    });
}

if (closeAddCourseModal) {
    closeAddCourseModal.addEventListener("click", () => {
        addCourseModal.classList.remove("active");
    });
}

if (cancelAddCourse) {
    cancelAddCourse.addEventListener("click", () => {
        addCourseModal.classList.remove("active");
    });
}

if (addCourseModal) {
    addCourseModal.addEventListener("click", (event) => {
        if (event.target === addCourseModal) {
            addCourseModal.classList.remove("active");
        }
    });
}

if (addCourseForm) {
    addCourseForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const courseName =
            document.getElementById("courseName").value.trim();

        const language =
            document.getElementById("courseLanguage").value;

        const level =
            document.getElementById("courseLevel").value;

        const price =
            document.getElementById("coursePrice").value;

        const duration =
            document.getElementById("courseDuration").value.trim();

        if (
            !courseName ||
            !language ||
            !level ||
            !price ||
            !duration
        ) {
            alert("❌ Please complete all fields.");
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/api/courses`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: courseName,
                        language: language,
                        level: level,
                        price: Number(price),
                        duration: duration
                    })
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                alert("✅ Course added successfully!");

                addCourseForm.reset();
                addCourseModal.classList.remove("active");

                await loadCourses();
            } else {
                alert(
                    `❌ ${data.message || "Could not add course."}`
                );
            }

        } catch (error) {
            console.error("Add course error:", error);

            alert(
                "❌ Cannot connect to TalkPro server."
            );
        }
    });
}
// ================================
// LOAD COURSES
// ================================

async function loadCourses() {
    const coursesGrid =
        document.getElementById("coursesGrid");

    if (!coursesGrid) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/api/courses`
        );

        if (!response.ok) {
            throw new Error("Failed to load courses");
        }

        const courses = await response.json();

        if (courses.length === 0) {
            coursesGrid.innerHTML = `
                <div style="
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 40px;
                    color: #7a8496;
                ">
                    📚 No courses found.
                </div>
            `;
            return;
        }

        coursesGrid.innerHTML = courses.map(course => {

            const icon =
                course.language.toLowerCase() === "english"
                    ? "🇬🇧"
                    : "🇷🇺";

            return `
                <div class="course-card">

                    <div class="course-icon">
                        ${icon}
                    </div>

                    <div class="course-info">
                        <h3>${escapeHTML(course.name)}</h3>

                        <p>
                            ${escapeHTML(course.language)} Language Course
                        </p>

                        <div class="course-meta">
                            <span>
                                📊 ${escapeHTML(course.level)}
                            </span>

                            <span>
                                ⏱️ ${escapeHTML(course.duration)}
                            </span>
                        </div>
                    </div>

                    <div class="course-price">
                        <strong>
                            $${Number(course.price).toFixed(0)}
                        </strong>

                        <span>/ month</span>
                    </div>

                    <div class="course-actions">

                        <button
                            class="view-course"
                            data-course-id="${course.id}"
                            title="View Course">
                            👁️
                        </button>

                        <button
                            class="edit-course"
                            data-course-id="${course.id}"
                            title="Edit Course">
                            ✏️
                        </button>

                        <button
                            class="delete-course"
                            data-course-id="${course.id}"
                            title="Delete Course">
                            🗑️
                        </button>

                    </div>

                </div>
            `;

        }).join("");

    } catch (error) {
        console.error("Load courses error:", error);

        coursesGrid.innerHTML = `
            <div style="
                grid-column: 1 / -1;
                text-align: center;
                padding: 40px;
                color: #f51f2d;
            ">
                ❌ Cannot load courses from database.
            </div>
        `;
    }
}
loadCourses();
// ================================
// VIEW COURSE
// ================================

function viewCourse(id) {
    const courseId = Number(id);

    const courseCards = document.querySelectorAll(
        ".course-card"
    );

    let course = null;

    // Courses-ро аз database боз мегирем
    fetch(`${API_URL}/api/courses`)
        .then(response => response.json())
        .then(courses => {

            course = courses.find(
                item => item.id === courseId
            );

            if (!course) {
                alert("❌ Course not found.");
                return;
            }

            const icon =
                course.language.toLowerCase() === "english"
                    ? "🇬🇧"
                    : "🇷🇺";

            document.getElementById("viewCourseName").textContent =
                course.name;

            document.getElementById("viewCourseLanguage").textContent =
                `${icon} ${course.language}`;

            document.getElementById("viewCourseLevel").textContent =
                course.level;

            document.getElementById("viewCoursePrice").textContent =
                `$${Number(course.price).toFixed(0)} / month`;

            document.getElementById("viewCourseDuration").textContent =
                course.duration;

            document.getElementById("viewCourseId").textContent =
                `#${course.id}`;

            document.getElementById("viewCourseDate").textContent =
                course.created_at
                    ? new Date(course.created_at).toLocaleString()
                    : "—";

            document
                .getElementById("viewCourseModal")
                .classList.add("active");
        })
        .catch(error => {
            console.error("View course error:", error);

            alert("❌ Cannot load course.");
        });
}

// ================================
// EDIT COURSE
// ================================

function editCourse(id) {

    fetch(`${API_URL}/api/courses`)
        .then(response => response.json())
        .then(courses => {

            const course = courses.find(
                item => item.id === Number(id)
            );

            if (!course) {
                alert("❌ Course not found.");
                return;
            }

            document.getElementById("editCourseId").value =
                course.id;

            document.getElementById("editCourseName").value =
                course.name;

            document.getElementById("editCourseLanguage").value =
                course.language;

            document.getElementById("editCourseLevel").value =
                course.level;

            document.getElementById("editCoursePrice").value =
                course.price;

            document.getElementById("editCourseDuration").value =
                course.duration;

            document
                .getElementById("editCourseModal")
                .classList.add("active");

        })
        .catch(error => {

            console.error("Edit course error:", error);

            alert("❌ Cannot load course.");

        });
}


// CLOSE EDIT COURSE MODAL

function closeEditCourseModal() {

    document
        .getElementById("editCourseModal")
        .classList.remove("active");
}


document
    .getElementById("closeEditCourseModal")
    .addEventListener(
        "click",
        closeEditCourseModal
    );


document
    .getElementById("cancelEditCourse")
    .addEventListener(
        "click",
        closeEditCourseModal
    );


document
    .getElementById("editCourseModal")
    .addEventListener(
        "click",
        (event) => {

            if (event.target.id === "editCourseModal") {
                closeEditCourseModal();
            }

        }
    );

// CLOSE VIEW COURSE MODAL

function closeViewCourseModal() {
    document
        .getElementById("viewCourseModal")
        .classList.remove("active");
}


document
    .getElementById("closeViewCourseModal")
    .addEventListener(
        "click",
        closeViewCourseModal
    );


document
    .getElementById("closeViewCourseButton")
    .addEventListener(
        "click",
        closeViewCourseModal
    );


document
    .getElementById("viewCourseModal")
    .addEventListener(
        "click",
        (event) => {

            if (event.target.id === "viewCourseModal") {
                closeViewCourseModal();
            }

        }
    );
    // ================================
// SAVE EDITED COURSE
// ================================

document
    .getElementById("editCourseForm")
    .addEventListener("submit", async (event) => {

        event.preventDefault();

        const id =
            Number(document.getElementById("editCourseId").value);

        const name =
            document.getElementById("editCourseName").value.trim();

        const language =
            document.getElementById("editCourseLanguage").value;

        const level =
            document.getElementById("editCourseLevel").value;

        const price =
            document.getElementById("editCoursePrice").value;

        const duration =
            document.getElementById("editCourseDuration").value.trim();

        try {

            const response = await fetch(
                `${API_URL}/api/courses/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        language,
                        level,
                        price: Number(price),
                        duration
                    })
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {

                alert("✅ Course updated successfully!");

                closeEditCourseModal();

                await loadCourses();

            } else {

                alert(
                    `❌ ${data.message || "Could not update course."}`
                );

            }

        } catch (error) {

            console.error("Update course error:", error);

            alert(
                "❌ Cannot connect to TalkPro server."
            );

        }

    });