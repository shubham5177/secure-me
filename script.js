const vaultList = document.getElementById("vaultList");
const form = document.getElementById("passwordForm");
const siteInput = document.getElementById("site");
const userInput = document.getElementById("username");
const passInput = document.getElementById("password");
const searchInput = document.getElementById("search");
const strengthMeter = document.getElementById("strengthMeter");
const masterKeyInput = document.getElementById("masterKey");

// 🌙 Dark Mode Toggle
document.getElementById("toggleTheme").onclick = () => {
    document.body.classList.toggle("dark");
};

// 🔐 Password Strength Checker
passInput.addEventListener("input", () => {
    const val = passInput.value;
    let strength = 0;
    if (val.length > 8) strength += 25;
    if (/[A-Z]/.test(val)) strength += 25;
    if (/[0-9]/.test(val)) strength += 25;
    if (/[^A-Za-z0-9]/.test(val)) strength += 25;
    strengthMeter.value = strength;
});

// 🎲 Password Generator
document.getElementById("generatePassword").onclick = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < 12; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
    }
    passInput.value = password;
    passInput.dispatchEvent(new Event("input"));
};

// 💾 Save Entry with AES Encryption
form.onsubmit = (e) => {
    e.preventDefault();
    const masterKey = masterKeyInput.value;
    if (!masterKey) return alert("Please enter your master password.");

    const encryptedPassword = CryptoJS.AES.encrypt(passInput.value, masterKey).toString();
    const entry = {
        site: siteInput.value,
        username: userInput.value,
        password: encryptedPassword,
    };

    const data = JSON.parse(localStorage.getItem("vault") || "[]");
    data.push(entry);
    localStorage.setItem("vault", JSON.stringify(data));
    form.reset();
    loadVault();
};

// 📥 Load Vault and Decrypt Passwords
function loadVault() {
    vaultList.innerHTML = "";
    const masterKey = masterKeyInput.value;
    if (!masterKey) return vaultList.innerHTML = "<p>Enter master password to view entries.</p>";

    const data = JSON.parse(localStorage.getItem("vault") || "[]");
    data.forEach((entry, index) => {
        let decrypted;
        try {
            decrypted = CryptoJS.AES.decrypt(entry.password, masterKey).toString(CryptoJS.enc.Utf8);
        } catch {
            decrypted = "❌ Invalid Key";
        }

        const div = document.createElement("div");
        div.classList.add("vault-entry");
        div.innerHTML = `
      <strong>${entry.site}</strong><br/>
      ${entry.username}<br/>
      <input type="password" value="${decrypted}" readonly id="pwd-${index}" />
      <button onclick="copyToClipboard('pwd-${index}')">📋</button>
      <button onclick="deleteEntry(${index})">❌</button>
    `;
        vaultList.appendChild(div);
    });
}

// ❌ Delete Entry with Animation
function deleteEntry(index) {
    const data = JSON.parse(localStorage.getItem("vault"));
    const entryDiv = vaultList.children[index];
    entryDiv.classList.add("fade-out");
    setTimeout(() => {
        data.splice(index, 1);
        localStorage.setItem("vault", JSON.stringify(data));
        loadVault();
    }, 400); // Wait for fade-out
}

// 🔍 Search Filter
searchInput.addEventListener("input", () => {
    const filter = searchInput.value.toLowerCase();
    const entries = document.querySelectorAll("#vaultList > div");
    entries.forEach(entry => {
        entry.style.display = entry.innerText.toLowerCase().includes(filter) ? "block" : "none";
    });
});

// 📋 Clipboard Copy
function copyToClipboard(id) {
    const input = document.getElementById(id);
    input.type = "text"; // Reveal for selection
    input.select();
    document.execCommand("copy");
    input.type = "password"; // Hide again
    alert("Password copied to clipboard!");
}

// 🔁 Load when master key is typed
masterKeyInput.addEventListener("input", loadVault);

// ⏬ Initial Load
loadVault();