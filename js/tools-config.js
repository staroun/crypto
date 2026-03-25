const TOOLS_CONFIG = [
    {
        category: "Steganography",
        tools: [
            { id: "stego-space", name: "Space-Based Steganography", icon: "\u2423", description: "Hide secret messages in text by varying spaces between words", js: "tools/stego-space.js" },
            { id: "stego-dict", name: "Word-Dictionary Steganography", icon: "\uD83D\uDCD6", description: "Hide data in natural sentences using a fixed word dictionary", js: "tools/stego-dict.js" },
            { id: "stego-image", name: "Image Steganography", icon: "\uD83D\uDCF8", description: "Hide secret messages in images using LSB", js: "tools/stego-image.js" }
        ]
    },
    {
        category: "Number Theory",
        tools: [
            { id: "gcd", name: "GCD", icon: "\u00F7", description: "Euclidean Algorithm \u2014 step-by-step GCD computation", js: "tools/gcd.js" },
            { id: "inverse", name: "Multiplicative Inverse", icon: "x\u207B\u00B9", description: "Extended Euclidean Algorithm \u2014 modular inverse with full trace", js: "tools/inverse.js" },
            { id: "matrix", name: "Matrix Inverse mod m", icon: "[A]\u207B\u00B9", description: "Gauss-Jordan elimination over \u2124\u2098", js: "tools/matrix.js" }
        ]
    },
    {
        category: "Classical Ciphers",
        tools: [
            { id: "caesar", name: "Caesar Cipher", icon: "C", description: "Shift cipher with encrypt, decrypt & brute force", js: "tools/caesar.js" },
            { id: "multiplicative", name: "Multiplicative Cipher", icon: "\u00D7", description: "E(x) = a\u00D7x mod 26 with brute force", js: "tools/multiplicative.js" },
            { id: "affine", name: "Affine Cipher", icon: "Ax", description: "E(x) = a\u00D7x + b mod 26 with brute force", js: "tools/affine.js" },
            { id: "vigenere", name: "Vigen\u00E8re Cipher", icon: "V", description: "Polyalphabetic substitution with keyword", js: "tools/vigenere.js" },
            { id: "substitution", name: "Substitution Cipher", icon: "S", description: "Custom alphabet mapping cipher", js: "tools/substitution.js" },
            { id: "playfair", name: "Playfair Cipher", icon: "PF", description: "Digraph substitution with 5\u00D75 key matrix", js: "tools/playfair.js" },
            { id: "hill", name: "Hill Cipher", icon: "H", description: "Matrix-based polygraphic cipher \u2014 K\u00D7P mod 26", js: "tools/hill.js" }
        ]
    },
    {
        category: "Modern Cryptography",
        tools: [
            { id: "aes", name: "AES Encryption", icon: "AES", description: "Symmetric encryption \u2014 AES-GCM / AES-CBC", js: "tools/aes.js" },
            { id: "rsa", name: "RSA Encryption & Signing", icon: "RSA", description: "Asymmetric encryption, decryption & digital signature", js: "tools/rsa.js" },
            { id: "hash", name: "Hash Functions", icon: "#", description: "SHA-1 / SHA-256 / SHA-512, file hash & comparison", js: "tools/hash.js" }
        ]
    }
];
