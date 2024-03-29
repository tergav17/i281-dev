; ECHO.S
; COMMAND LINE ECHO
; GAVIN TERSTEEG, 2024
; SDMAY24-14

.TEXT

	; START BY PROCESSING THE ARGUMENTS
START:	LOADI	A,0
	STORE	[DBANK],A
	
	; SET UP STACK
	LOADI	D,0X60-2
	
	; SYSCALL RETURN BANK
	LOADI	C,1	
	STOREF	[D+1],C
	
	; GO TO ARGUMENT BANK
	LOAD	A,[CMDL_B]
	STORE	[ARG_BNK],A
	STORE	[DBANK],A
	
	; SET UP POINTER
	LOADI	C,0
	
	; SKIP THE INITIAL COMMAND
0:	LOADF	A,[C]
	LOADI	B,0X20
	CMP	A,B
	BRBE	1F
	ADDI	C,1
	JUMP	0B

	; LOOK FOR THE FIRST ARGUMENT
1:	LOADF	A,[C]
	ADDI	A,0
	BRZ	EXIT
	CMP	A,B
	BRA	ECHO
	ADDI	C,1
	JUMP	1B
	
	; ECHO THE ARGUMENT
ECHO:	LOADI	A,0
	STORE	[DBANK],A
	
	LOAD	A,[CMDL_B]
	STORE	[ARG_BNK],A
	MOV	A,C
	
	; PRINT IT
	LOADI	B,S_PUTS
	LOADI	C,@+2
	JUMP	SYSCALL

	; DO CR/LF
	LOADI	A,0X0A
	LOADI	B,S_PUTC
	LOADI	C,@+2
	JUMP	SYSCALL

	LOADI	A,0X0D
	LOADI	B,S_PUTC
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; EXIT PROGRAM
EXIT:	LOADI	B,0
	JUMP	SYSJUMP