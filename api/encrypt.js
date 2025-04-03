import crypto from "crypto";
import fs from "fs";
import path from "path";

export default function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { text, algorithm } = req.body;
    if (!text || !algorithm) return res.status(400).json({ error: "Missing text or algorithm" });

    const publicKey = fs.readFileSync(path.join(process.cwd(), "keys", "public_key.pem"), "utf8");

    if (algorithm === "rsa") {
        const encrypted = crypto.publicEncrypt(
            { key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
            Buffer.from(text, "utf8")
        ).toString("base64");

        return res.json({ encrypted });
    }

    return res.status(400).json({ error: "Invalid algorithm" });
}
