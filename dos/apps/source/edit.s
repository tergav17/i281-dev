; EDIT.S
; SIMPLE TEXT EDITOR

; BANK ALLOCATION STUFF
BI	= 1
BD	= 1

.TEXT
.BANK	BI
CORE0_B	= BI

	; START BY PROCESSING THE ARGUMENTS
START:	LOADI	A,0
	STORE	[DBANK],A
	
	; SET UP STACK
	LOADI	D,0X60-2
	
	; SYSCALL RETURN BANK
	LOADI	C,BI
	STOREF	[D+1],C
	
	; INIT MEMORY
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,MEM0_B
	LOADI	C,MINIT
	JUMP	INDIR
	
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
	BRZ	2F
	CMP	A,B
	BRA	OPENARG
	ADDI	C,1
	JUMP	1B
	
	; NO ARGUMENT, EMPTY BUFFER
2:	LOADI	A,0
	STORE	[DBANK],A
	JUMP	DONE

	
	; THERE IS AN ARG, TRY AND OPEN IT
OPENARG:STORE	[SPARK],D

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
	LOAD	B,[CMDL_B]
	STORE	[DBANK],B
	JUMP	0B
	
	; TERMINATE STRING AND RETURN
1:	LOADI	A,0
	STOREF	[D],A
	LOAD	D,[SPARK]


	; EXIT PROGRAM
DONE:	LOADI	B,S_EXIT
	JUMP	SYSJUMP

	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
.TEXT
.BANK	BI
MEM0_B	= BI

	; MEMORY INIT
	; DIVIDE THE HEAP INTO BLOCKS OF 32 BYTES, AND ADD IT
	; TO THE FREE TABLE
	; USES: A, B, C
MINIT:	LOADI	C,HEAP
	LOAD	B,[MAX_DB]
	
	; SET THE START OF THE FREE BLOCK LIST
	LOADI	A,0
	STORE	[FREETAB],C
	STORE	[FREETAB+1],A
	
	; MOVE TO BANK
0:	STORE	[DBANK],C
	LOADI	A,32
	
	; WRITE FIRST 3 HEADERS
1:	STOREF	[A+1-32],A
	STOREF	[A+0-32],C
	ADDI	A,32
	BRNN	1B
	
	; WRITE 4TH HEADER
2:	LOADI	A,0
	STORE	[32*3+1],A
	ADDI	C,1
	CMP	C,B
	BRA	3F
	STORE	[32*3],C
	JUMP	0B
	
	; STORE BANK ZERO TO INDICATE END OF LIST
3:	STORE	[32*3],A
	STORE	[DBANK],A
	JUMP	IRET
	
	
	; ALLOCATE A BLOCK OF MEMORY
	; RETURNS ADDRESS TO BLOCK IN [CBLOCK]
	; RETURNS A = 0XFF OUT OF BLOCKS, A = 0X00 OTHERWISE
	; USES: A, B, C
MALLOC:	STORE	[SPARK],D
	LOAD	B,[FREETAB]
	
	; MAKE SURE THE NEXT BLOCK ISN'T NULL
	ADDI	B,0
	LOADI	A,0XFF
	BRZ	IRET
	
	; STORE THE BLOCK ADDRESS IN CBLOCK
	LOAD	C,[FREETAB+1]
	STORE	[LBLOCK],B
	STORE	[LBLOCK+1],C
	
	; MOVE THE NEXT BLOCK INTO FREETAB POINTER
	STORE	[DBANK],B
	LOADF	A,[C]
	LOADF	B,[C+1]
	LOADI	D,0
	STOREF	[C],D
	STOREF	[C+1],D
	STORE	[DBANK],D
	STORE	[FREETAB],A
	STORE	[FREETAB+1],B
	
	; RESTORE STACK AND RETURN
	LOAD	D,[SPARK]
	LOADI	A,0
	JUMP	IRET
	
	; PLACES THE BLOCK IN [CBLOCK] ONTO THE FREE
	; TABLE
	; USES: A, B, C
FREE:	STORE	[SPARK],D

	; GRAB ADDRESSES OF THE FREETAB AND CBLOCK
	LOAD	A,[CBLOCK]
	LOAD	B,[CBLOCK+1]
	LOAD	C,[FREETAB]
	LOAD	D,[FREETAB+1]
	
	; LINK REST OF FREETAB AFTER CBLOCK
	STORE	[DBANK],A
	STOREF	[B],C
	STOREF	[B+1],D
	
	; SET CBLOCK AS BEGINNING OF FREE TABLE
	LOADI	C,0
	STORE	[DBANK],C
	STORE	[FREETAB],A
	STORE	[FREETAB+1],B
	
	; RESTORE STACK AND RETURN
	LOAD	D,[SPARK]
	JUMP	IRET
	
	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
.TEXT
.BANK	BI
FIO0_B	= BI
	
	; READS A FILE INTO THE BUFFER
	; [FNAME] = FILE TO OPEN
	; RETURNS A = 0XFF IF ERROR, A = 0X00 RETURN OTHERWISE
	; USES: A, B, C
FREAD:	SUBI	D,2
	
	; SET OPEN TARGET
	LOADI	A,0
	STORE	[ARG_BNK],A
	LOADI	A,FNAME
	
	; ATTEMPT TO OPEN FILE
	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	B,S_OPEN
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; CHECK RESULT OF OPERATION
	ADDI	A,0
	BRNZ	9F
	
	; RE-INITALIZE MEMORY
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,MEM0_B
	LOADI	C,MINIT
	JUMP	INDIR
	
	; RESET BLOCK READ IN STATE
	LOADI	A,BUF_B
	STORE	[SRC_BNK],A
	LOADI	A,0
	
	; READ THE BLOCK
0:	STORE	[BLOCK],A
	LOADI	B,S_READ
	LOADI	C,@+2
	JUMP	SYSCALL

	; DID IT WORK?
	ADDI	A,0
	BRNZ	0F
	
	; RESET THE BLOCK READ STATE
	
	; READ CHARACTER FROM BLOCK
1:
	
	; TERMINATE THE RECORD
0:
	
	; RESTORE STACK AND RETURN
	LOADI	A,0
9:	ADDI	D,2
	JUMP	IRET


	; ZERO BANK
.BANK	0
.BSS

	; MISC CONTEXT INFORMATION
.DEFL BYTE BLOCK	0
.DEFL BYTE BANK		0
.DEFL BYTE POINTER	0

	; MEMORY BLOCK PARSE INFORMATION
.DEFL BYTE MB_PNTR	0

	; STACK PARKING SPACE
.DEFL BYTE SPARK	0

	; CURRENT BLOCK OF MEMORY TO WORK ON
.DEFL BYTE CBLOCK	0,0

	; BLOCK TO BE LINKED ONTO THE CURRENT BLOCK
.DEFL BYTE LBLOCK	0,0

	; FREE MEMORY TABLE
.DEFL BYTE FREETAB	0,0

	; LINE EDITOR CONTENT
.DEFL BYTE LINETAB	0,0

	; CURRENT FILE NAME
.DEFL BYTE FNAME	0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0

	; START OF DEFINED MEMORY
.BANK	BD
.DATA
STR0_B = BD	; STRING BANK

	; ERROR MESSAGES
.DEFL BYTE ERROR0	"CAN'T OPEN FILE",0X0A,0X0D,0

	; BANK IS DONE, MOVE ON TO THE NEXT
BD	= BD+1
BUF_B	= BD	; BUFFER BANK

	; BANK IS DONE, MOVE ON TO THE NEXT
BD	= BD+4
HEAP	= BD	; THE REST OF MEMORY IS HEAP
