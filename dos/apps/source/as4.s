; AS4.S
; ASSEMBLER SYMBOL MANAGEMENT
; GAVIN TERSTEEG, 2024
; SDMAY24-14

BI	= BI+1
.TEXT
.BANK	BI
SYM0_B	= BI

	; DEFINES OR UPDATES A SYMBOL IN THE TABLE
DEFINE: