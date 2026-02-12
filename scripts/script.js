const folders = {
    "home": {
        "user": [
            ".env",
            "about.txt",
        ],
    },
    "etc": {
        "nginx": [
            "nginx.conf",
        ],
    },
    "var": {
        "log": ["syslog", ],
    },
};

// redirect to /shell
if (window.location.pathname === "/" || window.location.pathname === "/index.html") {
    setTimeout(() => {
        window.location.pathname = "/shell.html";
    }, 2000);
}