# Cryptography Lab

Interactive cryptography practice tools for learning and teaching. Runs entirely in the browser — no server or installation required.

## Live Demo

Enable **GitHub Pages** (Settings > Pages > Source: `main` branch, folder: `/ (root)`) to access the site at:

```
https://<username>.github.io/<repository>/
```

## Tools

### Steganography
| Tool | Description |
|------|-------------|
| Space-Based Steganography | Hide secret messages in text by varying spaces between words |
| Word-Dictionary Steganography | Hide data in natural sentences using a fixed word dictionary |
| Image Steganography | Hide secret messages in images using LSB encoding |

### Number Theory
| Tool | Description |
|------|-------------|
| GCD | Euclidean Algorithm — step-by-step GCD computation |
| Multiplicative Inverse | Extended Euclidean Algorithm — modular inverse with full trace |
| Matrix Inverse mod m | Gauss-Jordan elimination over Z_m |

### Classical Ciphers
| Tool | Description |
|------|-------------|
| Caesar Cipher | Shift cipher with encrypt, decrypt & brute force |
| Vigenere Cipher | Polyalphabetic substitution with keyword |
| Substitution Cipher | Custom alphabet mapping cipher |

### Modern Cryptography
| Tool | Description |
|------|-------------|
| AES Encryption | Symmetric encryption — AES-GCM / AES-CBC |
| RSA Encryption & Signing | Asymmetric encryption, decryption & digital signature |
| Hash Functions | SHA-1 / SHA-256 / SHA-512, file hash & comparison |

## Usage

Open `index.html` in any modern browser, or serve the files with any static file server:

```bash
# Python
python -m http.server 8000

# Node.js (npx)
npx serve .
```

## Project Structure

```
homepage/
├── index.html            # Landing page
├── tool.html             # Tool page template
├── css/
│   └── style.css
└── js/
    ├── tools-config.js   # Tool registry (categories, metadata)
    ├── template.js       # Landing page & tool page renderer
    ├── main.js           # Shared utilities (BigInt, modular arithmetic)
    └── tools/            # Individual tool scripts
        ├── stego-space.js
        ├── stego-dict.js
        ├── stego-image.js
        ├── gcd.js
        ├── inverse.js
        ├── matrix.js
        ├── caesar.js
        ├── vigenere.js
        ├── substitution.js
        ├── aes.js
        ├── rsa.js
        └── hash.js
```

## License

For educational use.
