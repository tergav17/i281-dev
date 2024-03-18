; DOSDEF.S
; THIS FILE CONTAINS IMPORTANT DEFINES USED IN DOS/281
; GAVIN TERSTEEG, 2024
; SDMAY24-14

; BIOS CALLS
BOOT	= 0
ALTBOOT = 1
INDIR	= 2
IRET	= 3
SYSCALL	= 4
SYSJUMP	= 5
PRGM	= 6
IWRITE	= 7
ZSTART	= 8

HALT	= 0X7F

; SYSTEM CALLS
S_EXIT	= 0
S_PUTC	= 1
S_GETC	= 2
S_STAT	= 3
S_PUTS	= 4
S_INPUT	= 5
S_OPEN	= 6
S_CLOSE	= 7
S_READ	= 8
S_WRITE	= 9
S_FSRCH	= 10
S_NEXT	= 11
S_DELET	= 12
S_CREAT	= 13
S_FREE	= 14
S_EXEC	= 15

; MEMORY AREAS
CF_NAME	= 0X60
CF_SIZE	= 0X68
CF_USR	= 0X6A
DFT_USR	= 0X6B
ARG_BNK	= 0X6C
BD_FREE	= 0X6E
MAX_IB	= 0X70
MAX_DB	= 0X71
CMDL_B	= 0X72
AUTO_B	= 0X73
KERNMEM	= 0X78
BIOSMEM	= 0X7C
AU_RUN	= 0X00
AU_PNTR	= 0X01
AU_BANK	= 0X02
AU_BLK	= 0X03
AU_UA	= 0X04
AU_FILE	= 0X06
AU_MISC	= 0X18

; DATA BANK ADDRESS
DBANK	= 0X80		

