; AS1.S
; SOURCE INPUT AND TOKENIZER
; GAVIN TERSTEEG, 2024
; SDMAY24-14

BI	= BI+1
.TEXT
.BANK	BI
TOK0_B	= BI

	; GETS THE NEXT TOKEN
	; TOKEN TYPE IS RETURNED IN [TOKEN]
	; SPECIAL TYPES ARE:
	; 'A' -> ALPHANUMERIC
	; '0' -> NUMERIC
	; 'N' -> NEW LINE
	; ALL WHITESPACE IS IGNORED, UNLESS WE ARE INSIDE
	; A STRING OR DEFINED CHAR
	; 'A' AND '0' TOKENS WILL POPULATE THE TOKEN BUFFER
	; AS WELL
NEXTTOK:LOADI	B,TOK1_B
	LOADI	C,NEXTTOA
	JUMP	INDIR

	; RESETS THE STATE OF THE TOKEN STREAM BACK TO
	; BEGINNING OF SOURCE INPUT
REWIND:	LOADI	A,0-1
	STORE	[SRCINDX],A
	
	; GET THE NEXT FILE
	; ALL POINTERS WILL BE RESET FOR FILE READ IN
	; SRCINDX == ARGC IF WE ARE DONE READING IN BLOCK
NEXTSRC:SUBI	D,2

	; RESET POINTER, BLOCK, AND STAT
	LOADI	A,0
	STORE	[SRCPNTR],A
	STORE	[SRCBLK],A
	STORE	[SRCSTAT],A
	
	; RESET BANK
	LOADI	A,SRC_B
	STORE	[SRCBANK],A

	; INCREMENT SOURCE INDEX
0:	LOAD	A,[SRCINDX]
	ADDI	A,1
	STORE	[SRCINDX],A

	; CHECK BOUNDS OF INDEX
	LOAD	B,[ARGC]
	CMP	A,B
	BRAE	9F
	
	; ATTEMPT TO OPEN FILE
	LOAD	B,[CMDL_B]
	STORE	[ARG_BNK],B
	LOADF	A,[A+ARGV]
	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,@+2
	LOADI	B,S_OPEN
	LOADI	C,@+2
	JUMP	SYSCALL
	ADDI	A,0
	BRZ	1F
	
	; ERROR
	LOADI	A,ERR0_B
	STORE	[ARG_BNK],A
	LOADI	A,ERROR01
	LOADI	B,CORE0_B
	LOADI	C,ERROR
	JUMP	INDIR

	; ATTEMPT TO READ THE FIRST BLOCK
1:	LOADI	B,SRC_B
	STORE	[ARG_BNK],B
	LOADI	A,0
	LOADI	B,S_READ
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; IF IT DIDN'T WORK, GET THE NEXT BLOCK
	ADDI	A,0
	BRNZ	0B

	; RETURN
9:	ADDI	D,2
	JUMP	IRET
	
	; GET THE NEXT CHARACTER IN THE STREAM
	; RETURNS CHARACTER IN [SRCCHAR]
	; IF THERE ARE NO CHARACTER, 0 WILL BE RETURNED
NEXTCHR:SUBI	D,2

	; CHECK SRCINDX != ARGC
	LOAD	A,[SRCINDX]
	LOAD	B,[ARGC]
	CMP	A,B
	BRZ	8F

	; CHECK IF SRCPNTR IS VALID
	LOAD	A,[SRCPNTR]
	LOAD	B,[SRCBANK]
	ADDI	A,0
	BRN	3F
	
	; ALRIGHT, LETS JUST GRAB A CHARACTER FROM THE BANK
1:	STORE	[DBANK],B
	LOADF	C,[A]
	LOADI	B,0
	STORE	[DBANK],B
	
	; INCREMENT POINTER
	ADDI	A,1
	STORE	[SRCPNTR],A
	
	; CAN WE RETURN?
2:	STORE	[SRCCHAR],C
	ADDI	C,0
	BRNZ	9F
	LOADI	C,0X0A
	STORE	[SRCCHAR],C
	JUMP	7F
	
	; INCREMENT BANK
3:	LOADI	A,0
	ADDI	B,1
	STORE	[SRCBANK],B
	LOADI	C,SRC_B+4
	CMP	B,C
	BRB	1B
	
	; READ A NEW BLOCK
	LOAD	A,[SRCBLK]
	ADDI	A,1
	BRC	7F
	STORE	[SRCBLK],A
	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	B,S_READ
	LOADI	C,@+2
	JUMP	SYSCALL
	ADDI	A,0
	BRNZ	7F
	
	; GO READ A CHARACTER NOW
	LOADI	A,0
	LOADI	B,SRC_B
	STORE	[SRCBANK],B
	JUMP	1B

	; WE ARE DONE WITH THIS FILE
	; MOVE ON TO THE NEXT
7:	ADDI	D,2
	JUMP	NEXTSRC
	
	; STORE A ZERO IN SRCCHAR
8:	LOADI	A,0
	STORE	[SRCCHAR],A
	
	; RETURN
9:	ADDI	D,2
	JUMP	IRET
	
BI	= BI+1
.TEXT
.BANK	BI
TOK1_B	= BI
	
	; SHADOW OF NEXTTOK
NEXTTOA:SUBI	D,2

	; CHECK THE NEXT CHARACTER IN THE STREAM
0:	LOAD	A,[SRCCHAR]
	ADDI	A,0
	BRZ	8F
	BRN	5F

	; IS IT A NEWLINE?
	LOADI	B,0X0A
	CMP	A,B
	BRNZ	1F
	
	; NEW LINE
	LOADI	A,'N'
	JUMP	7F

	; IS IT WHITESPACE?
1:	LOADI	B,0X20
	

	; GRAB A NEW CHARACTER FROM THE STREAM
5:	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,0B
	STOREF	[D],C
	LOADI	B,TOK0_B
	LOADI	C,NEXTCHR
	JUMP	INDIR
	
	
	; SAVE TOKEN TYPE AND CONSUME THE SRCCHAR
8:	LOADI	B,0X20
	STORE	[SRCCHAR],B
	STORE	[TOKEN],A
	
	; RETURN
9:	ADDI	D,2
	JUMP	IRET
	