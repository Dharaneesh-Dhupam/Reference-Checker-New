
export const SYSTEM_INSTRUCTION = `
You are an expert academic bibliographer. Your task is to verify ONE specific academic reference.

1.  **VERIFY**: Use Google Search to check if this paper/report exists. Match the title, authors, and year.
2.  **STATUS**:
    *   **VALID**: Found an exact or near-exact match (minor typos allowed).
    *   **INVALID**: The paper does not exist (hallucinated), or the title/author combination is wrong.
    *   **UNCERTAIN**: Cannot definitively prove existence or non-existence.
3.  **ALTERNATIVES**: If INVALID, find 2-3 REAL, existing papers that discuss the exact same topic.

**OUTPUT FORMAT**:
Return a SINGLE JSON object (do NOT wrap in a list).
{
  "status": "VALID" | "INVALID" | "UNCERTAIN",
  "correctedCitation": "The official citation if found (APA style)",
  "details": "Brief proof of findings (e.g., 'Found in IEEE Xplore', 'Authors exist but never wrote this')",
  "alternatives": ["Real Paper 1 (Year)", "Real Paper 2 (Year)"],
  "sourceUrl": "URL found (optional)"
}

**CRITICAL RULES**:
*   Output **ONLY VALID JSON**.
*   **ESCAPE BACKSLASHES**: Input may be LaTeX. Escape backslashes in your output strings (e.g., "\\\\bibitem").
*   **NO MARKDOWN**: Do not add \`\`\`json wrapping if possible, just the raw JSON object.
`;

export const SAMPLE_REFERENCES = `@techreport{nistfips204,
  author       = {{National Institute of Standards and Technology}},
  title        = {{Module-Lattice-Based Digital Signature Standard (ML-DSA)}},
  institution  = {U.S. Department of Commerce},
  year         = {2024},
  month        = aug,
  number       = {FIPS PUB 204},
  doi          = {10.6028/NIST.FIPS.204},
  type         = {Federal Information Processing Standards Publication}
}

@techreport{nistfips1403,
  author       = {{National Institute of Standards and Technology}},
  title        = {{Security Requirements for Cryptographic Modules}},
  institution  = {U.S. Department of Commerce},
  year         = {2019},
  month        = mar,
  number       = {FIPS PUB 140-3},
  doi          = {10.6028/NIST.FIPS.140-3},
  type         = {Federal Information Processing Standards Publication}
}

@techreport{nistsp800185,
  author       = {John Kelsey and Shu-jen Chang and Ray Perlner},
  title        = {{SHA-3 Derived Functions: cSHAKE, KMAC, TupleHash and ParallelHash}},
  institution  = {National Institute of Standards and Technology},
  year         = {2016},
  month        = dec,
  number       = {NIST SP 800-185},
  doi          = {10.6028/NIST.SP.800-185},
  type         = {NIST Special Publication}
}

@techreport{nistsp80038d,
  author       = {Morris Dworkin},
  title        = {{Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM) and GMAC}},
  institution  = {National Institute of Standards and Technology},
  year         = {2007},
  month        = nov,
  number       = {NIST SP 800-38D},
  doi          = {10.6028/NIST.SP.800-38D},
  type         = {NIST Special Publication}
}

@techreport{barker2020recommendation,
  author       = {Elaine Barker},
  title        = {{Recommendation for Key Management, Part 1: General}},
  institution  = {National Institute of Standards and Technology},
  year         = {2020},
  month        = may,
  number       = {NIST SP 800-57 Part 1 Rev. 5},
  doi          = {10.6028/NIST.SP.800-57pt1r5},
  type         = {NIST Special Publication}
}

@inproceedings{biryukov2016argon2,
  author       = {Alex Biryukov and Daniel Dinu and Dmitry Khovratovich},
  title        = {{Argon2: New generation of memory-hard functions for password hashing and other applications}},
  booktitle    = {2016 IEEE European Symposium on Security and Privacy (EuroS\\&P)},
  pages        = {292--302},
  year         = {2016},
  organization = {IEEE},
  doi          = {10.1109/EuroSP.2016.31}
}

@inproceedings{bock2016nonce,
  author       = {Hanno B{\\"o}ck and Aaron Zauner and Sean Devlin and Juraj Somorovsky and Philipp Jovanovic},
  title        = {{Nonce-Disrespecting Adversaries: Practical Forgery Attacks on GCM in TLS}},
  booktitle    = {10th USENIX Workshop on Offensive Technologies (WOOT 16)},
  year         = {2016},
  publisher    = {USENIX Association},
  address      = {Austin, TX}
}

@misc{joux2006iv,
  author       = {Antoine Joux},
  title        = {{Authentication Failures in NIST version of GCM}},
  howpublished = {NIST Public Comments on SP 800-38D},
  year         = {2006},
  note         = {Accessed: 2023-10-27}
}

@article{ducas2018crystals,
  author       = {L{'e}o Ducas and Eike Kiltz and Tancr{'e}de Lepoint and Vadim Lyubashevsky and Peter Schwabe and Gregor Seiler and Damien Stehl{'e}},
  title        = {{CRYSTALS-Dilithium: A Lattice-Based Digital Signature Scheme}},
  journal      = {IACR Transactions on Cryptographic Hardware and Embedded Systems},
  volume       = {2018},
  number       = {1},
  pages        = {238--268},
  year         = {2018},
  doi          = {10.13154/tches.v2018.i1.238-268}
}

@inproceedings{shor1994algorithms,
  author       = {Peter W. Shor},
  title        = {{Algorithms for quantum computation: discrete logarithms and factoring}},
  booktitle    = {Proceedings 35th Annual Symposium on Foundations of Computer Science},
  pages        = {124--134},
  year         = {1994},
  organization = {IEEE},
  doi          = {10.1109/SFCS.1994.365700}
}

@article{diffie1976new,
  author       = {Whitfield Diffie and Martin E. Hellman},
  title        = {{New directions in cryptography}},
  journal      = {IEEE Transactions on Information Theory},
  volume       = {22},
  number       = {6},
  pages        = {644--654},
  year         = {1976},
  doi          = {10.1109/TIT.1976.1055638}
}

@techreport{alagic2020status,
  author       = {Gorjan Alagic and others},
  title        = {{Status Report on the Second Round of the NIST Post-Quantum Cryptography Standardization Process}},
  institution  = {National Institute of Standards and Technology},
  year         = {2020},
  number       = {NISTIR 8309},
  doi          = {10.6028/NIST.IR.8309}
}

@article{hellman2013randomness,
  author       = {Martin Hellman},
  title        = {{Randomness in Cryptography}},
  journal      = {IEEE Security \\& Privacy},
  volume       = {11},
  number       = {5},
  pages        = {78--79},
  year         = {2013},
  doi          = {10.1109/MSP.2013.124}
}

@inproceedings{luykx2016key,
  author       = {Atul Luykx and Bart Preneel},
  title        = {{The Key to Security: Re-evaluating the safety of GCM}},
  booktitle    = {Proceedings of the 2016 ACM SIGSAC Conference on Computer and Communications Security},
  pages        = {1391--1402},
  year         = {2016},
  publisher    = {ACM},
  doi          = {10.1145/2976749.2978374}
}

@article{regev2009lattices,
  author       = {Oded Regev},
  title        = {{On lattices, learning with errors, random linear codes, and cryptography}},
  journal      = {Journal of the ACM (JACM)},
  volume       = {56},
  number       = {6},
  pages        = {1--40},
  year         = {2009},
  publisher    = {ACM New York, NY, USA}
}

@misc{mcgrew2004gcm,
  author       = {David A. McGrew and John Viega},
  title        = {{The Galois/Counter Mode of Operation (GCM)}},
  howpublished = {Submission to NIST Modes of Operation Process},
  year         = {2004},
  note         = {Indocrypt 2004}
}

@inproceedings{grover1996fast,
  author       = {Lov K. Grover},
  title        = {{A fast quantum mechanical algorithm for database search}},
  booktitle    = {Proceedings of the twenty-eighth annual ACM symposium on Theory of computing},
  pages        = {212--219},
  year         = {1996},
  publisher    = {ACM}
}

@misc{owasp2021,
  author       = {{OWASP Foundation}},
  title        = {{Password Storage Cheat Sheet}},
  year         = {2021},
  url          = {https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html},
  note         = {Accessed: 2024-03-01}
}

@inproceedings{bertoni2007sponge,
  author       = {Guido Bertoni and Joan Daemen and Micha{\\"e}l Peeters and Gilles Van Assche},
  title        = {{Sponge functions}},
  booktitle    = {ECRYPT Hash Workshop},
  year         = {2007},
  month        = may
}

@inproceedings{percival2009scrypt,
  author       = {Colin Percival},
  title        = {{Stronger key derivation via sequential memory-hard functions}},
  booktitle    = {BSDCan'09},
  year         = {2009}
}

@techreport{shrimpton2004aead,
  author       = {Thomas Shrimpton},
  title        = {{A Characterization of Authenticated-Encryption as Generalized CCA Security}},
  institution  = {IACR Cryptology ePrint Archive},
  number       = {Report 2004/249},
  year         = {2004},
  url          = {https://eprint.iacr.org/2004/249}
}

@misc{gueron2010aes,
  author       = {Shay Gueron},
  title        = {{Intel Advanced Encryption Standard (AES) New Instructions Set}},
  howpublished = {Intel White Paper},
  year         = {2010},
  month        = sep
}

@inproceedings{bertoni2013keccak,
  author       = {Guido Bertoni and Joan Daemen and Micha{\\"e}l Peeters and Gilles Van Assche},
  title        = {{Keccak implementation overview}},
  booktitle    = {NIST Hash Forum},
  year         = {2013}
}

@inproceedings{grassl2016applying,
  author       = {Markus Grassl and Brandon Langenberg and Martin Roetteler and Rainer Steinwandt},
  title        = {{Applying Grover's algorithm to AES: quantum resource estimates}},
  booktitle    = {Post-Quantum Cryptography: 7th International Workshop, PQCrypto 2016},
  pages        = {29--43},
  year         = {2016},
  organization = {Springer}
}

@book{antonopoulos2017mastering,
  author       = {Andreas M. Antonopoulos},
  title        = {{Mastering Bitcoin: Programming the open blockchain}},
  edition      = {2nd},
  publisher    = {O'Reilly Media, Inc.},
  year         = {2017}
}

@article{naveed2015privacy,
  author       = {Muhammad Naveed and Erman Ayday and Ellen W. Clayton and Jacques Fellay and Carl A. Gunter and Jean-Pierre Hubaux and Bradley A. Malin and Xiaofeng Wang},
  title        = {{Privacy in the genomic era}},
  journal      = {ACM Computing Surveys (CSUR)},
  volume       = {48},
  number       = {1},
  pages        = {1--44},
  year         = {2015},
  publisher    = {ACM}
}

@inproceedings{checkoway2011comprehensive,
  author       = {Stephen Checkoway and Damon McCoy and Brian Kantor and Danny Anderson and Hovav Shacham and Stefan Savage and Karl Koscher and Alexei Czeskis and Franziska Roesner and Tadayoshi Kohno},
  title        = {{Comprehensive Experimental Analyses of Automotive Attack Surfaces}},
  booktitle    = {USENIX Security Symposium},
  pages        = {Article 4},
  year         = {2011},
  publisher    = {USENIX Association}
}`;
