
// Firebase Imports

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// Firebase Configuration

const firebaseConfig = {
  apiKey: "AIzaSyC8CNlvpGno8-jr-LmtWYPZ5q5K7qG9Lic",
  authDomain: "fir-authentication-74672.firebaseapp.com",
  projectId: "fir-authentication-74672",
  storageBucket: "fir-authentication-74672.firebasestorage.app",
  messagingSenderId: "1056559486516",
  appId: "1:1056559486516:web:80ab1e5966356bdb165c61"
};


// Firebase Start

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// HTML Elements

const authBox = document.getElementById("authBox");
const todoBox = document.getElementById("todoBox");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const authBtn = document.getElementById("authBtn");
const toggleText = document.getElementById("toggleText");
const formTitle = document.getElementById("formTitle");
const message = document.getElementById("message");

const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const taskMessage = document.getElementById("taskMessage");
const emptyMessage = document.getElementById("emptyMessage");


// Variables

let isLogin = false;
let unsubscribe = null;


// Signup / Login Toggle

toggleText.addEventListener("click", function (e) {

    if (e.target.id === "toggleAuth") {
        e.preventDefault();

        isLogin = !isLogin;

        message.innerText = "";

        if (isLogin) {
            formTitle.innerText = "Welcome Back";
            authBtn.innerText = "Login";

            toggleText.innerHTML =
                'New user? <a href="#" id="toggleAuth">Sign Up</a>';

        } else {
            formTitle.innerText = "Create Account";
            authBtn.innerText = "Sign Up";

            toggleText.innerHTML =
                'Already have an account? <a href="#" id="toggleAuth">Login</a>';
        }
    }

});


// Signup / Login Button

authBtn.addEventListener("click", async function () {

    const userEmailValue = emailInput.value.trim();
    const userPasswordValue = passwordInput.value;

    if (userEmailValue === "" || userPasswordValue === "") {
        message.innerText = "Please fill in all fields.";
        return;
    }

    try {

        message.innerText = "";

        if (isLogin === true) {

            await signInWithEmailAndPassword(
                auth,
                userEmailValue,
                userPasswordValue
            );

        } else {

            await createUserWithEmailAndPassword(
                auth,
                userEmailValue,
                userPasswordValue
            );

        }

        emailInput.value = "";
        passwordInput.value = "";

    } catch (error) {

        message.innerText = error.message;

    }

});


// Check Login User

onAuthStateChanged(auth, function (user) {

    if (unsubscribe !== null) {
        unsubscribe();
        unsubscribe = null;
    }

    taskList.innerHTML = "";

    if (user) {

        authBox.style.display = "none";
        todoBox.style.display = "block";

        userEmail.innerText = user.email;

        showTasks(user.uid);

    } else {

        authBox.style.display = "block";
        todoBox.style.display = "none";

    }

});


// Logout

logoutBtn.addEventListener("click", async function () {

    try {

        await signOut(auth);

    } catch (error) {

        taskMessage.innerText = error.message;

    }

});


// Add Task

addBtn.addEventListener("click", async function () {

    const task = taskInput.value.trim();
    const user = auth.currentUser;

    if (task === "") {
        taskMessage.innerText = "Please enter a task.";
        return;
    }

    if (user) {

        try {

            await addDoc(collection(db, "tasks"), {
                task: task,
                uid: user.uid,
                createdAt: serverTimestamp()
            });

            taskInput.value = "";
            taskMessage.innerText = "";

        } catch (error) {

            taskMessage.innerText = error.message;

        }

    }

});


// Enter Key Se Task Add

taskInput.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {
        addBtn.click();
    }

});


// Show Tasks With Query Snapshot

function showTasks(uid) {

    const q = query(
        collection(db, "tasks"),
        where("uid", "==", uid)
    );

    unsubscribe = onSnapshot(q, function (snapshot) {

        taskList.innerHTML = "";

        if (snapshot.empty) {
            emptyMessage.style.display = "block";
        } else {
            emptyMessage.style.display = "none";
        }

        snapshot.forEach(function (item) {

            const data = item.data();
            const taskId = item.id;

            // Task Div

            const taskDiv = document.createElement("div");
            taskDiv.className = "task";

            // Task Name

            const taskName = document.createElement("span");
            taskName.className = "task-name";
            taskName.innerText = data.task;

            // Buttons Div

            const buttonsDiv = document.createElement("div");
            buttonsDiv.className = "task-buttons";

            // Edit Button

            const editBtn = document.createElement("button");
            editBtn.innerText = "Edit";
            editBtn.className = "edit-btn";

            editBtn.addEventListener("click", function () {

                editTask(taskId, data.task);

            });

            // Delete Button

            const deleteBtn = document.createElement("button");
            deleteBtn.innerText = "Delete";
            deleteBtn.className = "delete-btn";

            deleteBtn.addEventListener("click", function () {

                deleteTask(taskId);

            });

            // Append Elements

            buttonsDiv.appendChild(editBtn);
            buttonsDiv.appendChild(deleteBtn);

            taskDiv.appendChild(taskName);
            taskDiv.appendChild(buttonsDiv);

            taskList.appendChild(taskDiv);

        });

    }, function (error) {

        taskMessage.innerText = error.message;

    });

}


// Edit Task

async function editTask(id, oldTask) {

    const newTask = prompt("Enter updated task:", oldTask);

    if (newTask === null) {
        return;
    }

    if (newTask.trim() === "") {
        alert("Task cannot be empty.");
        return;
    }

    try {

        await updateDoc(doc(db, "tasks", id), {
            task: newTask.trim(),
            updatedAt: serverTimestamp()
        });

    } catch (error) {

        taskMessage.innerText = error.message;

    }

}


// Delete Task

async function deleteTask(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if (confirmDelete) {

        try {

            await deleteDoc(doc(db, "tasks", id));

        } catch (error) {

            taskMessage.innerText = error.message;

        }

    }

}