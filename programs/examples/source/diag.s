; DIAG.S
; SIMPLE INSTRUCTION DIAGNOSTIC PROGRAM
; GAVIN TERSTEEG, 2024
; SDMAY24-14

; THIS PROGRAM WILL DO BASIC INSTRUCTION DIAGNOSTICS IN A LOOP
; IF AN ERROR IS FOUND, THE PROGRAM WILL HALT
; IF THE PROGRAM CONTINUES RUNNING, NO ISSUES HAVE BEEN FOUND

DBANK	= 0X80

.BANK 1
.TEXT

	; START OF A DIAGNOSTIC PASS
PASS:	LOADI	A,0
	LOADI	B,0
	LOADI	C,0
	LOADI	D,0
	
	
	
	
	; DO RAM TEST
	LOADI	D,0
	
	; SET BANK
	STORE	[DBANK],D