# i281 Developer Tools
This repository contains source code for i281e software, plus the utilties needed to build them. The contents of the directories are as follows:
- `as`: The i281e cross assembler
- `dos`: DOS/281 source code and applications
- `misc`: Miscellaneous utilities for manipulation assembler output files
- `opcodes`: Information about the i281e instruction set
- `programs`: Independent i281e user programs
- `websim`: Javascript-based simulator of the i281e

# Building
To execute the makefile, the following requirements are needed:
- UNIX-like environement (I personally use WSL, but cygwin could work)
- Makefile (duh)
- Python3
- gcc or equivalent C compiler
