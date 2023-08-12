if (document.getElementById("frmForgotPassword")) {
    document.querySelector("#frmForgotPassword").addEventListener("submit", e => {
        e.preventDefault();
        const email = document.getElementById("email").value;

    })
}