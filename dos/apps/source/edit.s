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
	STORE	[D],C
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
2:	JUMP	DONE

	
	; THERE IS AN ARG, TRY AND OPEN IT
OPENARG:


	; EXIT PROGRAM
DONE:	LOADI	B,S_EXIT
	JUMP	SYSJUMP

	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
.TEXT
.BANK	BI
MEM0_B

	; MEMORY INIT
	; DIVIDE THE HEAP INTO BLOCKS OF 32 BYTES, AND ADD IT
	; TO THE FREE TABLE
	; USES: A, B, C
MINIT:	



	; ZERO BANK
.BANK	0
.BSS

	; FILE READ IN INFORMATION
.DEFL BYTE COUNT	0
.DEFL BYTE BANK		0

	; STACK PARKING SPACE
.DEFL BYTE SPARK	0

	; FREE MEMORY TABLE
.DEFL BYTE FREETAB	0,0

	; LINE EDITOR CONTENT
.DEFL BYTE LINETAB	0,0

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
