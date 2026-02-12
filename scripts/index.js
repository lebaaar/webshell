// redirect to /shell
if (window.location.pathname === "/") {
    setTimeout(() => {
        window.location.pathname = "/shell.html";
    }, 2000);
}