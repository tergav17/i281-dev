; AS1.S
; SOURCE INPUT AND TOKENIZER
; GAVIN TERSTEEG, 2024
; SDMAY24-14

; NEW LINE CHARACTER
NEWLINE	= 0X0A
SEMICOL	= 0X3B
SQUOTE	= 0X27
DQUOTE	= 0X22
SYMBOL	= 0X80
NUMERIC	= 0X81


BI	= BI+1
.TEXT
.BANK	BI
TOK0_B	= BI

	; GETS THE NEXT TOKEN
	; TOKEN TYPE IS RETURNED IN [TOKEN]
	; SPECIAL TYPES ARE:
	; 'A' -> ALPHANUMERIC
	; '0' -> NUMERIC
	; NEWLINE -> NEW LINE
	; ALL WHITESPACE IS IGNORED, UNLESS WE ARE INSIDE
	; A STRING OR DEFINED CHAR
	; 'A' AND '0' TOKENS WILL POPULATE THE TOKEN BUFFER
	; AS WELL
NEXTTOK:SUBI	D,2

	; STORE RETURN ADDRESS
	LOADI	B,TOK1_B
	STOREF	[D+1],B
	
	; CHECK SRCSTAT
	LOADI	C,NEXTTOB
	LOAD	A,[SRCSTAT]
	ADDI	A,1
	BRNZ	INDIR
	STORE	[SRCSTAT],A
	
	LOADI	C,NEXTTOA
	JUMP	INDIR

	; RESETS THE STATE OF THE TOKEN STREAM BACK TO
	; BEGINNING OF SOURCE INPUT
REWIND:	LOADI	A,0-1
	STORE	[SRCINDX],A
	
	; SET FIRST CHAR AS INVALID
	LOADI	A,0X80
	STORE	[SRCCHAR],A
	
	; RESET STAT
	LOADI	A,0XFF
	STORE	[SRCSTAT],A
	
	; GET THE NEXT FILE
	; ALL POINTERS WILL BE RESET FOR FILE READ IN
	; SRCINDX == ARGC IF WE ARE DONE READING IN BLOCK
NEXTSRC:SUBI	D,2

	; RESET POINTER, BLOCK, AND SRCLINE
	LOADI	A,0
	STORE	[SRCPNTR],A
	STORE	[SRCBLK],A
	STORE	[SRCLINE],A
	STORE	[SRCLINE+1],A
	
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
	; ALSO SET LINENUM AND CURRFIL
	LOAD	A,[SRCINDX]
	STORE	[CURRFIL],A
	LOADI	A,0
	STORE	[LINENUM],A
	STORE	[LINENUM+1],A
	LOADI	A,E_COPEN
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
	LOADI	C,NEWLINE
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
	; DO WE NEED TO INCREMENT THE LINE?
	; YES WE DO, UPDATE CURRENT FILE
NEXTTOA:LOAD	A,[SRCINDX]
	STORE	[CURRFIL],A
	
	; INCRMENT SOURCE LINE
	LOAD	A,[SRCLINE+1]
	ADDI	A,1
	STORE	[SRCLINE+1],A
	LOAD	B,[SRCLINE]
	BRNC	1F
	ADDI	B,1
	STORE	[SRCLINE],B
	
	; REFLECT ON LINE NUMBER
1:	STORE	[LINENUM],B
	STORE	[LINENUM+1],A


	; CHECK THE NEXT CHARACTER IN THE STREAM
NEXTTOB:LOAD	A,[SRCCHAR]
	ADDI	A,0
	BRZ	8F
	BRN	5F

	; IS IT A NEWLINE?
	LOADI	B,NEWLINE
	CMP	A,B
	BRNZ	1F
	
	; NEW LINE
	LOADI	B,0XFF
	STORE	[SRCSTAT],B
	JUMP	8F

	; CHECK STATE STUFF
1:	LOAD	C,[SRCSTAT]
	LOADI	B,SEMICOL
	CMP	B,C
	BRZ	5F
	ADDI	C,0
	BRNZ	4F

	; IS IT WHITESPACE?
	LOADI	B,0X20
	CMP	A,B
	BRBE	5F
	
	; IS IT A NUMBER?
	LOADI	B,'0'
	CMP	A,B
	BRB	2F
	LOADI	B,'9'
	CMP	A,B
	LOADI	B,NUMERIC
	BRBE	0F
	
	; NOPE, IS IT IS LETTER?
	; FIRST CONVERT FROM LOWERCASE TO UPPERCASE
2:	LOADI	B,'A'+0X20
	CMP	A,B
	BRB	3F
	LOADI	B,'Z'+0X20
	CMP	A,B
	BRA	3F
	SUBI	A,0X20
	
	; CHECK FOR UPPER CASE LETTER
3:	LOADI	B,'_'
	CMP	A,B
	BRZ	2F
	LOADI	B,'A'
	CMP	A,B
	BRB	4F
	LOADI	B,'Z'
	CMP	A,B
2:	LOADI	B,SYMBOL
	BRBE	0F
	
	; NOPE, PROCESS AS A LITERAL
4:	LOAD	C,[SRCSTAT]
	CMP	A,C
	BRNZ	4F
	
	; END OF ENCLOSED SECTION
	LOADI	C,0
	STORE	[SRCSTAT],C
	JUMP	8F
	
	; IF ENCLOSED, JUST SEND DIRECTLY TO OUTPUT
4:	ADDI	C,0
	BRNZ	8F

	; IS IT A COMMENT?
	LOADI	B,SEMICOL
	CMP	A,B
	BRNZ	4F
	
	; SET COMMENT MODE
	STORE	[SRCSTAT],A
	JUMP	5F

	; IS IT A SINGLE OR DOUBLE QUOTE?
4:	LOADI	B,SQUOTE
	CMP	A,B
	BRZ	4F
	LOADI	B,DQUOTE
	CMP	A,B
	BRZ	4F
	JUMP	8F

	; YES IT IS, SET THE STATE AND EXIT
4:	STORE	[SRCSTAT],A
	JUMP	8F
	
	; GRAB A NEW CHARACTER FROM THE STREAM
5:	LOADI	C,NEXTTOB
	STOREF	[D],C
	LOADI	B,TOK0_B
	LOADI	C,NEXTCHR
	JUMP	INDIR

	; COPY THE SYMBOL OR NUMERIC INTO THE BUFFER
0:	STORE	[TOKEN],B

	; PREPARE TO COPY
	LOADI	C,TBUF
	
	; STORE CHARACTER
1:	STOREF	[C],A
	STORE	[BUFPNTR],C

	; GET NEXT CHARACTER
2:	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,TOK0_B
	LOADI	C,NEXTCHR
	JUMP	INDIR
	
	; CHECK CHARACTER TYPE
	LOAD	C,[BUFPNTR]
	LOAD	A,[SRCCHAR]
	
	; IS IT A NUMBER?
	LOADI	B,'0'
	CMP	A,B
	BRB	7F
	LOADI	B,'9'
	CMP	A,B
	BRBE	4F
	
	; NOPE, IS IT IS LETTER?
	; FIRST CONVERT FROM LOWERCASE TO UPPERCASE
	LOADI	B,'A'+0X20
	CMP	A,B
	BRB	3F
	LOADI	B,'Z'+0X20
	CMP	A,B
	BRA	3F
	SUBI	A,0X20
	
	; CHECK FOR UPPER CASE LETTER
3:	LOADI	B,'_'
	CMP	A,B
	BRZ	4F
	LOADI	B,'A'
	CMP	A,B
	BRB	7F
	LOADI	B,'Z'
	CMP	A,B
	BRA	7F
	
	; ADD TO THE STRING
4:	ADDI	C,1
	LOADI	B,TBUFEND
	CMP	B,C
	BRZ	2B
	JUMP	1B
	
	; TERMINATE
7:	LOADI	A,0
	STOREF	[C+1],A
	JUMP	9F
	
	; SAVE TOKEN TYPE AND CONSUME THE SRCCHAR
8:	LOADI	B,0X80
	STORE	[SRCCHAR],B
	STORE	[TOKEN],A
	
	; RETURN
9:	ADDI	D,2
	JUMP	IRET
	