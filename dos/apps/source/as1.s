; AS1.S
; ASSEMBLER MAIN LOGIC
; GAVIN TERSTEEG, 2024
; SDMAY24-14

BI	= BI+1
.TEXT
.BANK	BI
MAIN0_B	= BI

	; START A PASS
	; BEGIN BY REWINDING THE SOURCE STREAM
DOPASS:	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,TOK0_B
	LOADI	C,REWIND
	JUMP	INDIR
	
	; RESET LOCAL COUNTER
	LOADI	A,0
	STOREF	[NUMLOC]

	; TAKE IN A NEW LINE OF SOURCE CODE
ASMLINE:LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,TOK0_B
	LOADI	C,NEXTTOK
	JUMP	INDIR
	
	; ARE WE AT THE END?
	LOAD	A,[TOKEN]
	ADDI	A,0
	BRZ	ASMDONE
	
	; IS IT NEWLINE?
	SUBI	A,NEWLINE
	BRZ	ASMLINE
	
	; ATTEMPT TO PARSE EXPRESSION
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,EXP0_B
	LOADI	C,PARSEX
	JUMP	INDIR
	
	LOAD	B,[VALUE]
	LOAD	C,[VALUE+1]
	JUMP	@
	
	JUMP	ASMLINE

	; ALL DONE
ASMDONE:LOADI	B,CORE0_B
	LOADI	C,EXIT
	JUMP	INDIR