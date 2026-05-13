const TOOLS_CONFIG = [
    {
        category: "Steganography",
        tools: [
            { id: "stego-space", name: "Space-Based Steganography", icon: "␣", description: "Hide secret messages in text by varying spaces between words", js: "tools/stego-space.js" },
            { id: "stego-dict", name: "Word-Dictionary Steganography", icon: "📖", description: "Hide data in natural sentences using a fixed word dictionary", js: "tools/stego-dict.js" },
            { id: "stego-image", name: "Image Steganography", icon: "📸", description: "Hide secret messages in images using LSB", js: "tools/stego-image.js" }
        ]
    },
    {
        category: "Number Theory",
        tools: [
            { id: "gcd", name: "GCD", icon: "÷", description: "Euclidean Algorithm — step-by-step GCD computation", js: "tools/gcd.js" },
            { id: "inverse", name: "Multiplicative Inverse", icon: "x⁻¹", description: "Extended Euclidean Algorithm — modular inverse with full trace", js: "tools/inverse.js" },
            { id: "matrix", name: "Matrix Inverse mod m", icon: "[A]⁻¹", description: "Gauss-Jordan elimination over ℤₘ", js: "tools/matrix.js" }
        ]
    },
    {
        category: "Classical Ciphers",
        tools: [
            { id: "caesar", name: "Caesar Cipher", icon: "C", description: "Shift cipher with encrypt, decrypt & brute force", js: "tools/caesar.js" },
            { id: "multiplicative", name: "Multiplicative Cipher", icon: "×", description: "E(x) = a×x mod 26 with brute force", js: "tools/multiplicative.js" },
            { id: "affine", name: "Affine Cipher", icon: "Ax", description: "E(x) = a×x + b mod 26 with brute force", js: "tools/affine.js" },
            { id: "substitution", name: "Monoalphabetic Substitution Cipher", icon: "S", description: "Custom alphabet mapping cipher", js: "tools/substitution.js" },
            { id: "vigenere", name: "Vigenère Cipher", icon: "V", description: "Polyalphabetic substitution with keyword", js: "tools/vigenere.js" },
            { id: "playfair", name: "Playfair Cipher", icon: "PF", description: "Digraph substitution with 5×5 key matrix", js: "tools/playfair.js" },
            { id: "hill", name: "Hill Cipher", icon: "H", description: "Matrix-based polygraphic cipher — K×P mod 26", js: "tools/hill.js" }
        ]
    },
    {
        category: "Symmetric-Key Cryptography",
        tools: [
            { id: "des", name: "DES Encryption", icon: "DES", description: "64-bit block cipher — step-by-step Feistel rounds & key schedule", js: "tools/des.js" },
            { id: "tdes", name: "3DES (Triple DES)", icon: "3DES", description: "Triple DES in EDE mode — 2-key or 3-key", js: "tools/tdes.js" },
            { id: "aes", name: "AES Encryption", icon: "AES", description: "AES-CBC with 128 / 192 / 256-bit keys", js: "tools/aes.js" },
            { id: "aes-anim", name: "AES Animation", icon: "▶", description: "Interactive AES visualization (SWF via Ruffle emulator)", js: "tools/aes-anim.js" },
            { id: "rc4", name: "RC4 Stream Cipher", icon: "RC4", description: "Variable-key stream cipher — KSA + PRGA (broken; for education)", js: "tools/rc4.js" },
            { id: "a51", name: "A5/1 Stream Cipher", icon: "A5/1", description: "GSM stream cipher — 3 LFSRs with majority clocking", js: "tools/a51.js" },
            { id: "chacha20", name: "ChaCha20 Stream Cipher", icon: "ChaCha", description: "Modern 256-bit stream cipher (RFC 8439) — TLS 1.3 / WireGuard", js: "tools/chacha20.js" }
        ]
    },
    {
        category: "Public-Key Cryptography",
        tools: [
            { id: "rsa-encrypt", name: "RSA Encryption", icon: "RSA", description: "RSA-OAEP encryption & decryption — 1024 / 2048-bit", js: "tools/rsa-encrypt.js" },
            { id: "elgamal", name: "ElGamal Encryption", icon: "EG", description: "Discrete-log encryption — 1024 / 2048-bit MODP primes", js: "tools/elgamal.js" },
            { id: "ecc", name: "ECC (Elliptic Curve)", icon: "ECC", description: "ECDH key exchange & ECDSA signature — P-256 / P-384", js: "tools/ecc.js" }
        ]
    },
    {
        category: "Hash Functions",
        tools: [
            { id: "hash", name: "Hash Functions", icon: "#", description: "SHA-1 / SHA-256 / SHA-512, file hash & comparison", js: "tools/hash.js" }
        ]
    },
    {
        category: "Digital Signature",
        tools: [
            { id: "rsa-sign", name: "RSA Digital Signature", icon: "Sig", description: "RSASSA-PKCS1-v1_5 signing & verification", js: "tools/rsa-sign.js" }
        ]
    }
];
