document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");
    const loginMessage = document.getElementById("loginMessage");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const loginUrl = `http://wd.etsisi.upm.es:10000/users/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

        fetch(loginUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Login failed");
            }

            const token = response.headers.get("Authorization");
            if (token) {
                sessionStorage.setItem("authToken", token);
                loginMessage.textContent = "Login successful! Token saved.";
                loginMessage.style.color = "green";
                return;
            }

            return response.json();
        })
        .then(data => {
            if (data && data.token) {
                sessionStorage.setItem("authToken", data.token);
                loginMessage.textContent = "Login successful! Token saved.";
                loginMessage.style.color = "green";
            } else if (data && data.message) {
                loginMessage.textContent = `Error: ${data.message}`;
                loginMessage.style.color = "red";
            }
        })
        .catch(error => {
            loginMessage.textContent = "Login failed. Please check your credentials.";
            loginMessage.style.color = "red";
            console.error("Login error:", error);
        });
    });
});
