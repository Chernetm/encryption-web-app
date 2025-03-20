const express = require("express");
const CryptoJS = require("crypto-js");
const path = require("path");
const app = express();
const crypto = require("crypto");

app.use(express.json()); // For parsing application/json

// Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));







/** 🔹 One-Time Pad (OTP) Encryption & Decryption */
function encryptOTP(plaintext, key) {
    let ciphertext = "";
    for (let i = 0; i < plaintext.length; i++) {
        let encryptedChar = String.fromCharCode(
            plaintext.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
        ciphertext += encryptedChar;
    }
    return Buffer.from(ciphertext).toString("base64");
}

function decryptOTP(ciphertext, key) {
    let decodedCiphertext = Buffer.from(ciphertext, "base64").toString();
    let plaintext = "";
    for (let i = 0; i < decodedCiphertext.length; i++) {
        let decryptedChar = String.fromCharCode(
            decodedCiphertext.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
        plaintext += decryptedChar;
    }
    return plaintext;
}

/** 🔹 Triple DES (3DES) Encryption & Decryption */
function encrypt3DES(text, key) {
    const cipher = crypto.createCipheriv("des-ede3", Buffer.from(key, "utf8"), null);
    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");
    return encrypted;
}

function decrypt3DES(encryptedText, key) {
    const decipher = crypto.createDecipheriv("des-ede3", Buffer.from(key, "utf8"), null);
    let decrypted = decipher.update(encryptedText, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

/** 🔹 AES-256-CBC Encryption & Decryption */
function encryptAES(text, key) {
    const iv = Buffer.alloc(16, 0); // 16-byte IV
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key, "utf8"), iv);
    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");
    return encrypted;
}

function decryptAES(encryptedText, key) {
    const iv = Buffer.alloc(16, 0); // 16-byte IV
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key, "utf8"), iv);
    let decrypted = decipher.update(encryptedText, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

/** 🔹 API Routes */
app.post("/encrypt", (req, res) => {
    const { text, key, algorithm } = req.body;

    if (!text || !key || !algorithm) {
        return res.status(400).json({ error: "Missing text, key, or algorithm" });
    }

    let encryptedText;
    try {
        if (algorithm === "otp") {
            encryptedText = encryptOTP(text, key);
        } else if (algorithm === "3des") {
            encryptedText = encrypt3DES(text, key);
        } else if (algorithm === "aes") {
            encryptedText = encryptAES(text, key);
        } else {
            return res.status(400).json({ error: "Invalid algorithm. Use 'otp', '3des', or 'aes'." });
        }
        res.json({ encrypted: encryptedText });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/decrypt", (req, res) => {
    const { encryptedText, key, algorithm } = req.body;

    if (!encryptedText || !key || !algorithm) {
        return res.status(400).json({ error: "Missing encryptedText, key, or algorithm" });
    }

    let decryptedText;
    try {
        if (algorithm === "otp") {
            decryptedText = decryptOTP(encryptedText, key);
        } else if (algorithm === "3des") {
            decryptedText = decrypt3DES(encryptedText, key);
        } else if (algorithm === "aes") {
            decryptedText = decryptAES(encryptedText, key);
        } else {
            return res.status(400).json({ error: "Invalid algorithm. Use 'otp', '3des', or 'aes'." });
        }
        res.json({ decrypted: decryptedText });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/** 🔹 Start Server */


// **Serve Frontend**
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// **Start Server**
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
