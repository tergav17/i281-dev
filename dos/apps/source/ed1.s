; ED1.S
; SIMPLE TEXT EDITOR
; USER OPERATIONS

.TEXT
.BANK	BI
UOP0_B	= BI

	; PRINT NUMBER OF LINES
PLINES:	LOADI	B,UOP4_B
	LOADI	C,PLINESA
	JUMP	INDIR

	; PRINT FREE MEMORY BLOCKS
PFREE:	LOADI	B,UOP4_B
	LOADI	C,PFREEA
	JUMP	INDIR

	; APPENDS LINES INTO THE TEXT BUFFER
APPEND:	LOADI	B,UOP2_B
	LOADI	C,APPENDA
	JUMP	INDIR

	; INSERT LINES INTO THE TEXT BUFFER
INSERT:	LOADI	B,UOP2_B
	LOADI	C,INSERTA
	JUMP	INDIR
	
	; DELETE LINES FROM THE TEXT BUFFER
DELETE:	LOADI	B,UOP3_B
	LOADI	C,DELETEA
	JUMP	INDIR

	; EXECUTE A FILE READ
DOFREAD:LOADI	B,UOP2_B
	LOADI	C,DOFREAA
	JUMP	INDIR
	
		; EXECUTE A FILE READ
DOFWRIT:LOADI	B,UOP4_B
	LOADI	C,DOFWRIA
	JUMP	INDIR

	; SET EDITING FILE
SETFILE:LOAD	A,[STATE]
	ADDI	A,0
	BRNZ	9F
	
	; SAVE STACK (IF NEEDED)
	STORE	[SPARK],D
	
	; GET NEXT CHARACTER
	LOAD	C,[POINTER]
	LOADI	B,BUF_B
	STORE	[DBANK],B
	LOADF	A,[C]
	ADDI	C,1
	
	; SEE IF IT IS A SPACE
	LOADI	B,0X20
	CMP	A,B
	BRNZ	9F
	LOADF	A,[C]
	CMP	A,B
	BRBE	9F
	
	; COPY THE FILE NAME OVER
	LOADI	D,FNAME
0:	LOADF	A,[C]
	LOADI	B,0
	STORE	[DBANK],B
	STOREF	[D],A
	SUBI	A,0X20
	BRBE	1F
	ADDI	C,1
	ADDI	D,1
	LOADI	B,FNAME+15
	CMP	D,B
	BRAE	1F
	LOADI	B,BUF_B
	STORE	[DBANK],B
	JUMP	0B
	
	; TERMINATE STRING
1:	LOADI	A,0
	STOREF	[D],A
	LOAD	D,[SPARK]
	
	; GO BACK TO COMMAND LINE
8:	LOADI	B,CMD0_B
	LOADI	C,PROMPT
	JUMP	INDIR
	
	; ERROR
9:	LOADI	B,0
	STORE	[DBANK],B
	LOADI	B,CMD0_B
	LOADI	C,ERROR
	JUMP	INDIR

	; PRINT LINES
	; REQUIRES 1 OR 2 ARGUMENTS
PRINTL:	LOADI	B,UOP1_B
	LOADI	C,PRINTLA
	JUMP	INDIR

	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
.TEXT
.BANK	BI
UOP1_B	= BI

	; SHADOW OF PRINTL
PRINTLA:LOAD	A,[STATE]
	SUBI	A,1
	BRN	9F
	BRNZ	1F
	
	; SET ARGB = ARGA
	LOAD	A,[ARGA]
	LOAD	B,[ARGA+1]
	STORE	[ARGB],A
	STORE	[ARGB+1],B
	
	; ENSURE ARGA >= ARGB
1:	LOAD	A,[ARGA]
	LOAD	B,[ARGB]
	CMP	A,B
	BRB	9F
	BRA	2F
	LOAD	A,[ARGA+1]
	LOAD	B,[ARGB+1]
	CMP	A,B
	BRB	9F
	
	; START LOOKING FOR THE LINE
	; TEMP = ARGB
2:	LOAD	A,[ARGB]
	LOAD	B,[ARGB+1]
	STORE	[TEMP],A
	STORE	[TEMP+1],B
	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,LOP0_B
	LOADI	C,FINDL
	JUMP	INDIR
	ADDI	A,0
	BRNZ	9F
	
	; START PRINTING OFF LINES
3:	LOAD	C,[CBLOCK]
	LOAD	B,[MB_PNTR]
	STORE	[DBANK],C
	LOADF	A,[B]
	LOADI	C,0
	STORE	[DBANK],C
	
	; IS IT ZERO OR NEGATIVE
	ADDI	A,0
	BRN	5F
	BRZ	6F
	
	; PRINT THE CHARACTER
	LOADI	B,S_PUTC
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; NEXT CHARACTER
4:	LOAD	B,[MB_PNTR]
	LOAD	C,[MB_END]
	ADDI	B,1
	STORE	[MB_PNTR],B
	CMP	B,C
	BRNZ	3B
	
	; NEXT BLOCK
5:	LOAD	A,[CBLOCK]
	LOAD	B,[CBLOCK+1]
	STORE	[DBANK],A
	LOADF	A,[B]
	LOADF	B,[B+1]
	LOADI	C,0
	STORE	[DBANK],C
	
	; MAKE SURE IT ISN'T ZERO
	ADDI	A,0
	BRZ	8F
	
	; SET CBLOCK AND UPDATE MB_PNTR AND MB_END
	STORE	[CBLOCK],A
	STORE	[CBLOCK+1],B
	ADDI	B,3
	STORE	[MB_PNTR],B
	ADDI	B,32-3
	STORE	[MB_END],B
	JUMP	3B

	; START OF A NEW LINE
	; ENSURE ARGA >= ARGB
6:	LOAD	A,[ARGA]
	LOAD	B,[ARGB]
	CMP	A,B
	BRB	8F
	BRA	7F
	LOAD	A,[ARGA+1]
	LOAD	B,[ARGB+1]
	CMP	A,B
	BRB	8F
	
	; INCREMENT ARGB
7:	LOAD	A,[ARGB+1]
	ADDI	A,1
	STORE	[ARGB+1],A
	BRNC	7F
	LOAD	A,[ARGB]
	ADDI	A,1
	STORE	[ARGB],A
	BRC	8F
	
	; PRINT CR/LF
7:	LOADI	A,0X0A
	LOADI	B,S_PUTC
	LOADI	C,@+2
	JUMP	SYSCALL
	LOADI	A,0X0D
	LOADI	B,S_PUTC
	LOADI	C,4B
	JUMP	SYSCALL
	
	; GO BACK TO COMMAND LINE
8:	LOADI	B,CMD0_B
	LOADI	C,PROMPT
	JUMP	INDIR
	
	; ERROR
9:	LOADI	B,CMD0_B
	LOADI	C,ERROR
	JUMP	INDIR
	
	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
.TEXT
.BANK	BI
UOP2_B	= BI
	
	; SHADOW OF DOFREAD
DOFREAA:LOAD	A,[STATE]
	ADDI	A,0
	BRNZ	9F

	; READ THE FILE
	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,FIO0_B
	LOADI	C,FREAD
	JUMP	INDIR
	
	; CHECK FOR ERRORS
	ADDI	A,0
	BRN	9F
	JUMP	8F

	; SHADOW OF APPEND
APPENDA:LOAD	A,[STATE]
	SUBI	A,1
	BRNZ	9F

	; GO LOOK FOR THE FILE
	; SPECIAL BEHAVIOR IF IT IS 0
	LOAD	A,[ARGA]
	LOAD	B,[ARGA+1]
	ADDI	A,0
	BRNZ	0F
	ADDI	B,0
	BRZ	1F
0:	STORE	[TEMP],A
	STORE	[TEMP+1],B
	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,LOP0_B
	LOADI	C,FINDL
	JUMP	INDIR
	ADDI	A,0
	BRNZ	9F

	; CALL INPUTL
	LOADI	A,0XFF
1:	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,LOP0_B
	LOADI	C,INPUTL
	JUMP	INDIR
	ADDI	A,0
	BRNZ	9F
	JUMP	8F
	
	; SHADOW OF INSERT
	; JUST SUBTRACT 1 FROM ARGA AND JUMP TO APPEND
INSERTA:LOAD	A,[ARGA+1]
	SUBI	A,1
	STORE	[ARGA+1],A
	BRC	1F
	LOAD	A,[ARGA]
	SUBI	A,1
	STORE	[ARGA],B
	BRNC	9B
	
1:	JUMP	APPENDA

	; GO BACK TO COMMAND LINE
8:	LOADI	B,CMD0_B
	LOADI	C,PROMPT
	JUMP	INDIR

	; ERROR
9:	LOADI	B,CMD0_B
	LOADI	C,ERROR
	JUMP	INDIR

	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
.TEXT
.BANK	BI
UOP3_B	= BI

	; SHADOW OF DELETE
DELETEA:LOAD	A,[STATE]
	SUBI	A,1
	BRN	9F
	BRNZ	1F
	
	; SET ARGB = ARGA
	LOAD	A,[ARGA]
	LOAD	B,[ARGA+1]
	STORE	[ARGB],A
	STORE	[ARGB+1],B
	
	; ENSURE ARGA >= ARGB
1:	LOAD	A,[ARGA]
	LOAD	B,[ARGB]
	CMP	A,B
	BRB	9F
	BRA	2F
	LOAD	A,[ARGA+1]
	LOAD	B,[ARGB+1]
	CMP	A,B
	BRB	9F
	
	; START LOOKING FOR THE LINE
	; TEMP = ARGB
2:	LOAD	A,[ARGB]
	LOAD	B,[ARGB+1]
	STORE	[TEMP],A
	STORE	[TEMP+1],B
	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,LOP0_B
	LOADI	C,FINDL
	JUMP	INDIR
	ADDI	A,0
	BRNZ	9F
	
	; REMOVE THE LINES
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,LOP0_B
	LOADI	C,ERASEL
	JUMP	INDIR
	ADDI	A,0
	BRNZ	9F

	; GO BACK TO COMMAND LINE
8:	LOADI	B,CMD0_B
	LOADI	C,PROMPT
	JUMP	INDIR
	
	; ERROR
9:	LOADI	B,CMD0_B
	LOADI	C,ERROR
	JUMP	INDIR
	
	; PRINTS THE SIZE AS 16 BIT BASE-10 NUMBER
	; [TEMP] = NUMBER TO PRINT
	; USES: A, B, C
PRINTD: SUBI	D,2
	
	; SET PADDING TO NULL CHARACTER AT FIRST
	LOADI	C,0
	STORE	[PADDING],C

V	= 10000
	LOADI	A,V/256
	LOADI	B,V%256
	LOADI	C,@+2
	JUMP	DOCHAR
	
V	= 1000
	LOADI	A,V/256
	LOADI	B,V%256
	LOADI	C,@+2
	JUMP	DOCHAR
	
V	= 100
	LOADI	A,V/256
	LOADI	B,V%256
	LOADI	C,@+2
	JUMP	DOCHAR
	
V	= 10
	LOADI	A,V/256
	LOADI	B,V%256
	LOADI	C,@+2
	JUMP	DOCHAR
	
	LOADI	A,'0'
	STORE	[PADDING],A
	
V	= 1
	LOADI	A,V/256
	LOADI	B,V%256
	LOADI	C,@+2
	JUMP	DOCHAR
	
	ADDI	D,2 
	JUMP	IRET
	
	; A = UPPER SUB
	; B = LOWER SUB
DOCHAR:	STORE	[LEAFRET],C
	LOAD	C,[PADDING]	
	STORE	[CHAR],C
	
	; PARK THE STACK
	STORE	[SPARK],D

	; GET THE SIZE
0:	LOAD	C,[TEMP]
	LOAD	D,[TEMP+1]
	
	; DO 16 BIT SUBTRACTION
1:	SUB	D,B
	BRC	2F
	SUBI	C,1
	BRNC	4F
2:	SUB	C,A
	BRNC	4F
	
	; SAVE VALUE
	STORE	[TEMP],C
	STORE	[TEMP+1],D
	
	; GET THE CHAR AND CHECK TO SEE IF IT IS A WHITESPACE
	LOAD	C,[CHAR]
	LOADI	D,0X20
	CMP	C,D
	BRA	3F
	
	; SET PADDING AND CHAR TO '0'
	LOADI	C,'0'
	STORE	[PADDING],C
	
3:	ADDI	C,1
	STORE	[CHAR],C
	JUMP	0B
	
	; RESTORE THE STACK
4:	LOAD	D,[SPARK]
	
	; SEE IF IT IS ZERO
	LOAD	A,[CHAR]
	ADDI	A,0
	BRNZ	5F
	LOAD	C,[LEAFRET]
	JUMPR	C
	
	; PRINT THE CHARACTER
5:	LOADI	B,S_PUTC
	LOADI	C,BI	; RETURN BANK
	STOREF	[D+1],C
	LOAD	C,[LEAFRET]
	JUMP	SYSCALL
	
	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
.TEXT
.BANK	BI
UOP4_B	= BI

	; SHADOW OF PFREE
PFREEA:	SUBI	D,2

	; CHECK STATE
	LOAD	A,[STATE]
	ADDI	A,0
	BRNZ	9F

	; SET TEMP TO NUMFREE
	LOAD	A,[NUMFREE]
	LOAD	B,[NUMFREE+1]
	STORE	[TEMP],A
	STORE	[TEMP+1],B

	; DO CR/LF
PTEMP:	LOADI	A,0X0A
	LOADI	B,S_PUTC
	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,@+2
	JUMP	SYSCALL
	LOADI	A,0X0D
	LOADI	B,S_PUTC
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; PRINT TEMP
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,UOP3_B
	LOADI	C,PRINTD
	JUMP	INDIR
	
	; RETURN
	ADDI	D,2
	LOADI	B,CMD0_B
	LOADI	C,PROMPT
	JUMP	INDIR
	
	; SHADOW OF PLINES
PLINESA:SUBI	D,2

	; CHECK STATE
	LOAD	A,[STATE]
	ADDI	A,0
	BRNZ	9F

	; COUNT NUMBER OF LINES
	STORE	[TEMP],A
	STORE	[TEMP+1],A
	
	; START AT LINETAB
	STORE	[SPARK],D
	LOADI	C,0
	LOADI	D,LINETAB
	
	; INDIRECT TO NEXT BLOCK
0:	STORE	[DBANK],C
	LOADF	C,[D]
	LOADF	D,[D+1]
	ADDI	C,0
	BRZ	8F
	
	; GRAB NUMBER OF LINES ON BLOCK
	STORE	[DBANK],C
	LOADF	B,[D+2]
	LOADI	A,0
	STORE	[DBANK],A
	
	; ADD IT TO TEMP
	LOAD	A,[TEMP+1]
	ADD	A,B
	STORE	[TEMP+1],A
	BRNC	0B
	LOAD	A,[TEMP]
	ADDI	A,1
	STORE	[TEMP],A
	JUMP	0B

	; DONE, GO PRINT IT OUT
8:	LOADI	A,0
	STORE	[DBANK],A
	LOAD	D,[SPARK]
	JUMP	PTEMP
	
	; ERROR
9:	ADDI	D,2
	LOADI	B,CMD0_B
	LOADI	C,ERROR
	JUMP	INDIR
	
	
	; SHADOW OF DOFWRIT
DOFWRIA:LOAD	A,[STATE]
	ADDI	A,0
	BRNZ	9F

	; READ THE FILE
	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,FIO0_B
	LOADI	C,FWRITE
	JUMP	INDIR
	
	; CLOSE THE FILE REAL QUICK
	STORE	[TEMP],A
	LOADI	B,S_CLOSE
	LOADI	C,@+2
	JUMP	SYSCALL
	LOAD	A,[TEMP]
	
	; CHECK FOR ERRORS
	ADDI	A,0
	BRN	9F
	
	LOADI	B,CMD0_B
	LOADI	C,PROMPT
	JUMP	INDIR
	
	; ERROR
9:	LOADI	B,CMD0_B
	LOADI	C,ERROR
	JUMP	INDIR

	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
