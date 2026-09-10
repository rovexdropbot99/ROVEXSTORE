// =====================================================
// ROVEX STORE - LOGIN & CREATE ACCOUNT
// =====================================================

import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// =====================================================
// ELEMENTS
// =====================================================

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const loginMessage = document.getElementById("loginMessage");
const signupMessage = document.getElementById("signupMessage");


// =====================================================
// MESSAGE
// =====================================================

function loginMsg(text, success = false) {

    if (!loginMessage) return;

    loginMessage.textContent = text;
    loginMessage.style.display = "block";
    loginMessage.style.color =
        success ? "#00d9ff" : "#ff6b6b";
}


function signupMsg(text, success = false) {

    if (!signupMessage) return;

    signupMessage.textContent = text;
    signupMessage.style.display = "block";
    signupMessage.style.color =
        success ? "#00d9ff" : "#ff6b6b";
}


// =====================================================
// FIREBASE ERROR
// =====================================================

function firebaseError(code) {

    switch (code) {

        case "auth/invalid-email":
            return "Invalid email address.";

        case "auth/user-not-found":
            return "Account not found.";

        case "auth/wrong-password":
            return "Incorrect password.";

        case "auth/invalid-credential":
            return "Email or password is incorrect.";

        case "auth/email-already-in-use":
            return "This email is already registered.";

        case "auth/weak-password":
            return "Password must be at least 6 characters.";

        case "auth/network-request-failed":
            return "Network error. Check your internet.";

        case "auth/too-many-requests":
            return "Too many attempts. Try again later.";

        default:
            return "Something went wrong.";
    }
}


// =====================================================
// CHECK LOGIN STATUS
// =====================================================

onAuthStateChanged(auth, (user) => {

    if (user) {

        console.log("User already logged in:", user.email);

        if (loginForm) {

            loginForm.style.display = "none";

            loginMsg(
                `You are already logged in as ${user.email}`,
                true
            );

        }

        if (signupForm) {

            signupForm.style.display = "none";

        }

    }

});


// =====================================================
// LOGIN
// =====================================================

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        // Check if already logged in

        if (auth.currentUser) {

            loginMsg(
                "You are already logged in.",
                true
            );

            return;
        }


        const email =
            document.getElementById("loginEmail")
                .value
                .trim();

        const password =
            document.getElementById("loginPassword")
                .value;


        if (!email || !password) {

            loginMsg(
                "Please enter your email and password."
            );

            return;
        }


        try {

            loginMsg(
                "Logging in...",
                true
            );


            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


            loginMsg(
                "Login successful! Redirecting...",
                true
            );


            setTimeout(() => {

                window.location.href =
                    "index.html";

            }, 800);


        } catch (error) {

            console.error(error);

            loginMsg(
                firebaseError(error.code)
            );

        }

    });

}


// =====================================================
// CREATE ACCOUNT
// =====================================================

if (signupForm) {

    signupForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        if (auth.currentUser) {

            signupMsg(
                "You are already logged in.",
                true
            );

            return;
        }


        const name =
            document.getElementById("signupName")
                .value
                .trim();

        const email =
            document.getElementById("signupEmail")
                .value
                .trim();

        const password =
            document.getElementById("signupPassword")
                .value;

        const confirmPassword =
            document.getElementById(
                "signupConfirmPassword"
            ).value;


        if (!name) {

            signupMsg(
                "Please enter your name."
            );

            return;
        }


        if (!email) {

            signupMsg(
                "Please enter your email."
            );

            return;
        }


        if (password.length < 6) {

            signupMsg(
                "Password must be at least 6 characters."
            );

            return;
        }


        if (password !== confirmPassword) {

            signupMsg(
                "Passwords do not match."
            );

            return;
        }


        try {

            signupMsg(
                "Creating account...",
                true
            );


            const result =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            await updateProfile(
                result.user,
                {
                    displayName: name
                }
            );


            signupMsg(
                "Account created successfully!",
                true
            );


            setTimeout(() => {

                window.location.href =
                    "index.html";

            }, 1000);


        } catch (error) {

            console.error(error);

            signupMsg(
                firebaseError(error.code)
            );

        }

    });

}


// =====================================================
// LOGOUT FUNCTION
// =====================================================

window.rovexLogout = async function () {

    try {

        await signOut(auth);

        window.location.href =
            "login.html";

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }

};