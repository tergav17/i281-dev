; ED0.S
; SIMPLE TEXT EDITOR
; USER INTERFACE AND MEMORY MANAGEMENT

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
	
	; SAVE STACK
	STORE	[SPARK],D
	
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
	
	; INIT MEMORY
	LOADI	C,9F
	STOREF	[D],C
	LOADI	B,MEM0_B
	LOADI	C,MINIT
	JUMP	INDIR
	
	; JUMP TO COMMAND LINE

	
	; THERE IS AN ARG, TRY AND OPEN IT
OPENARG:LOADI	D,FNAME
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
	
	; TERMINATE STRING AND OPEN FILE
1:	LOADI	A,0
	STOREF	[D],A
	LOAD	D,[SPARK]
	
	; OPEN THE FILE
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,FIO0_B
	LOADI	C,FREAD
	JUMP	INDIR

	; CHECK ERROR STATUS
	ADDI	A,0
	LOADI	B,CMD0_B
	LOADI	C,ERROR
	BRNZ	INDIR

	; MEMORY SETUP IS DONE
	; SEND UP THE COMMAND PROMPT
9:	LOADI	B,CMD0_B
	LOADI	C,PROMPT
	JUMP	INDIR

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
	; ALSO RESET THE LINE TABLE
	; USES: A, B, C
MINIT:	LOADI	C,HEAP
	LOAD	B,[MAX_DB]
	
	; SET THE START OF THE FREE BLOCK LIST
	; AND RESET LINE TABLE
	LOADI	A,0
	STORE	[FREETAB],C
	STORE	[FREETAB+1],A
	STORE	[LINETAB],A
	
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
	
	; CALCULATE NUMBER OF FREE BLOCKS
	LOADI	C,HEAP-1
	SUB	B,C
	SHIFTL	B
	BRNC	4F
	ADDI	A,1
4:	SHIFTL	B
	BRNC	5F
	SHIFTL	A
	ADDI	A,1

5:	STORE	[NUMFREE],A
	STORE	[NUMFREE+1],B
	
	JUMP	IRET
	
	
	; ALLOCATE A BLOCK OF MEMORY
	; BLOCK WILL BE LINKED ONTO THE CURRENT BLOCK IN [CBLOCK]
	; THEN IT WILL BE RETURN IN [CBLOCK]
	; RETURNS A = 0XFF OUT OF BLOCKS, A = 0X00 OTHERWISE
	; USES: A, B, C
MALLOC:	STORE	[SPARK],D
	LOAD	B,[FREETAB]
	
	; MAKE SURE THE NEXT BLOCK ISN'T NULL
	ADDI	B,0
	LOADI	A,0XFF
	BRZ	IRET
	
	; STORE THE BLOCK ADDRESS IN LBLOCK
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
	
	; RETURN TO USER BANK
	LOADI	A,0
	STORE	[DBANK],A
	
	; SET THE MEMORY BLOCK POINTER
	LOAD	A,[LBLOCK+1]
	ADDI	A,3
	STORE	[MB_PNTR],A
	ADDI	A,32-3
	STORE	[MB_END],A
	LOADI	A,0
	STORE	[LINES],A
	
	; DECREMENT NUMFREE
	LOAD	A,[NUMFREE+1]
	SUBI	A,1
	STORE	[NUMFREE+1],A
	BRC	0F
	LOAD	A,[NUMFREE]
	SUBI	A,1
	STORE	[NUMFREE],A
	
	; RESTORE STACK AND LINK
0:	LOAD	D,[SPARK]
	
	
	; LINK THE BLOCK IN LBLOCK ONTO CBLOCK
	; THE NEXT BLOCK OF CBLOCK WILL BECOME
	; THE NEXT BLOCK OF LBLOCK
	; AFTER THAT, CBLOCK WILL BECOME LBLOCK
	; RETURNS A = 0X00
	; USES: A, B, C
LINK:	STORE	[SPARK],D
	
	; GET ADDRESS OF CBLOCK AND LBLOCK
	LOAD	A,[CBLOCK]
	LOAD	B,[CBLOCK+1]
	LOAD	C,[LBLOCK]
	LOAD	D,[LBLOCK+1]
	
	; GRAB THE NEXT ADDRESS OF CBLOCK AND SET IT IN LBLOCK
	STORE	[DBANK],A
	LOADF	A,[B]
	LOADF	B,[B+1]
	STORE	[DBANK],C
	STOREF	[D],A
	STOREF	[D+1],B
	LOADI	A,0
	STORE	[DBANK],A
	
	; RE-GRAB ADDRESS OF CBLOCK
	LOAD	A,[CBLOCK]
	LOAD	B,[CBLOCK+1]
	
	; SET CBLOCK NEXT TO LBLOCK
	STORE	[DBANK],A
	STOREF	[B],C
	STOREF	[B+1],D
	
	; SET CBLOCK TO LBLOCK
	LOADI	A,0
	STORE	[DBANK],A
	LOAD	A,[LBLOCK]
	LOAD	B,[LBLOCK+1]
	STORE	[CBLOCK],A
	STORE	[CBLOCK+1],B
	
	; DONE, RESTORE STACK AND RETURN
	LOADI	A,0
	LOAD	D,[SPARK]
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
	
	; INCREMENT NUMFREE
	LOAD	A,[NUMFREE+1]
	ADDI	A,1
	STORE	[NUMFREE+1],A
	BRNC	0F
	LOAD	A,[NUMFREE]
	ADDI	A,1
	STORE	[NUMFREE],A
	
	; RESTORE STACK AND RETURN
0:	LOAD	D,[SPARK]
	JUMP	IRET
	
	; GETS THE NEXT BLOCK AFTER CBLOCK
	; RETURNS A=0X00 IF NEXT, 0XFF OTHERWISE
	; USES: A, B, C
;NEXT:	LOAD	B,[CBLOCK]
;	LOAD	C,[CBLOCK+1]
;	LOADI	A,0XFF
;	ADDI	B,0
;	BRZ	IRET
;	STORE	[DBANK],B
;	LOADF	B,[C]
;	LOADF	C,[C+1]
;	LOADI	A,0
;	STORE	[DBANK],A
;	LOADI	A,0XFF
;	ADDI	B,0
;	BRZ	IRET
;	STORE	[CBLOCK],B
;	STORE	[CBLOCK+1],C
;	LOADI	A,0
;	JUMP	IRET
	
	
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

	; SET FIRST FLAG
	LOADI	C,0X0A
	STORE	[FIRST],C
	
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
	
	; MALLOC FIRST BLOCK
	LOADI	A,0
	STORE	[CBLOCK],A
	STORE	[LINETAB],A
	STORE	[LINETAB+1],A
	LOADI	A,LINETAB
	STORE	[CBLOCK+1],A
	
	; SET RETURN TO FREADA
	LOADI	C,FREADA
	STOREF	[D],C
	LOADI	C,FIO1_B
	STOREF	[D+1],C
	LOADI	B,MEM0_B
	LOADI	C,MALLOC
	JUMP	INDIR

	; RESTORE STACK AND RETURN
9:	ADDI	D,2
	JUMP	IRET


	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
.TEXT
.BANK	BI
FIO1_B	= BI

	; CONTINUED FREAD CODE
	; RESET BLOCK READ IN STATE
FREADA:	LOADI	A,BUF_B
	STORE	[ARG_BNK],A
	LOADI	A,0
	
	; READ THE BLOCK
	LOADI	C,BI
	STOREF	[D+1],C
0:	STORE	[BLOCK],A
	LOADI	B,S_READ
	LOADI	C,@+2
	JUMP	SYSCALL

	; DID IT WORK?
	ADDI	A,0
	BRNZ	0F
	
	; RESET THE BLOCK READ STATE
	LOADI	A,BUF_B
	STORE	[BANK],A
	LOADI	B,0
	
	; CHECK FIRST FLAG
	LOAD	C,[FIRST]
	STORE	[FIRST],B
	SUBI	B,1
	ADDI	C,0
	BRNZ	2F
	
	; SET POINTER TO ZERO
	ADDI	B,1
	
	; READ CHARACTER FROM BLOCK
1:	STORE	[BANK],A
	STORE	[DBANK],A
	LOADF	C,[B]
	LOADI	A,0
	STORE	[DBANK],A
	
	; PROCESS CHARACTER
	; C = CHARACTER
2:	STORE	[POINTER],B
	LOADI	B,0X20
	CMP	C,B
	BRB	3F
	LOADI	B,0X80
	CMP	C,B
	BRB	6F
	JUMP	8F
	
	; CONTROL CHARACTERS
3:	LOADI	B,0X09	; TAB CHARACTER
	CMP	C,B
	BRZ	6F
	ADDI	C,0	; NULL CHARACTER
	BRZ	0F
	LOADI	B,0X0A	; NEW LINE CHARACTER
	CMP	C,B
	BRNZ	8F
	LOADI	C,0
	
	; STORE VALUE IN MEMORY BLOCK
6:	LOAD	A,[MB_PNTR]
	LOAD	B,[MB_END]
	CMP	A,B
	LOAD	B,[CBLOCK]
	BRZ	7F
	STORE	[DBANK],B
	STOREF	[A],C
	LOADI	B,0
	STORE	[DBANK],B
	ADDI	C,0
	BRNZ	FREADNX		; NOT A NEXT LINE
	LOAD	B,[LINES]	; INCREMENT LINE
	ADDI	B,1
	STORE	[LINES],B
FREADNX:ADDI	A,1
	STORE	[MB_PNTR],A
	JUMP	8F

	; FINISH BLOCK
7:	STORE	[CHAR],C
	LOAD	A,[CBLOCK+1]
	LOAD	C,[LINES]
	STORE	[DBANK],B
	STOREF	[A+2],C
	LOADI	B,0
	STORE	[DBANK],B
	STORE	[LINES],B

	; ALLOC ANOTHER BLOCK
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,MEM0_B
	LOADI	C,MALLOC
	JUMP	INDIR
	
	; RESTORE CHARACTER
	LOAD	C,[CHAR]
	JUMP	6B
	
	; INCREMENT BLOCK POINTER
8:	LOAD	A,[BANK]
	LOAD	B,[POINTER]
	ADDI	B,1
	BRNN	1B
	LOADI	B,0
	ADDI	A,1
	LOADI	C,BUF_B+4 
	CMP	A,C
	BRNZ	1B
	LOAD	A,[BLOCK]
	ADDI	A,1
	BRNZ	0B
	
	; TERMINATE THE RECORD
0:	STORE	[SPARK],D
	LOAD	A,[MB_PNTR]
	LOAD	B,[MB_END]
	LOAD	C,[LINES]
	LOAD	D,[CBLOCK]
	STORE	[DBANK],D
	CMP	A,B
	BRZ	1F
	LOADI	D,0XFF
	STOREF	[A],D
1:	STOREF	[B+2-32],C
	LOADI	D,0
	STORE	[DBANK],D
	LOAD	D,[SPARK]
	
	; RESTORE STACK AND RETURN
	LOADI	A,0
9:	LOADI	B,0
	STORE	[DBANK],B
	ADDI	D,2
	JUMP	IRET
	
	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
.TEXT
.BANK	BI
CMD0_B	= BI

ERROR:	LOADI	A,ST_ERR
	JUMP	0F

	; SEND UP THE COMMAND LINE PROMPT
PROMPT:	LOADI	A,ST_PRM
0:	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	B,STR0_B
	STORE	[ARG_BNK],B
	LOADI	B,S_PUTS
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; GET USER INPUT
	LOADI	B,BUF_B
	STORE	[ARG_BNK],B
	LOADI	B,S_INPUT
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; BEGIN COMMAND PROCESSING
	LOADI	A,0
	STORE	[POINTER],A
	STORE	[STATE],A
	
	; START PROCESSING A NUMBER (MAYBE?)
0:	LOAD	A,[ARGA]
	LOAD	B,[ARGA+1]
	STORE	[ARGB],A
	STORE	[ARGB+1],B
	LOADI	A,0
	STORE	[ARGA],A
	STORE	[ARGA+1],A

	; READ A CHARACTER FROM THE COMMAND LINE
1:	LOAD	A,[POINTER]
	LOADI	B,BUF_B
	STORE	[DBANK],B
	LOADF	C,[A]
	LOADI	B,0
	STORE	[DBANK],B
	ADDI	A,1
	STORE	[POINTER],A
	
	; CHECK CHARACTER
	LOADI	A,','
	CMP	C,A
	BRZ	8F
	LOADI	A,'0'
	CMP	C,A
	BRB	ERROR
	LOADI	A,'9'
	CMP	C,A
	BRA	9F
	
	; MAKE SURE STATE ISN'T 0
	LOAD	A,[STATE]
	ADDI	A,0
	BRNZ	2F
	LOADI	A,1
	STORE	[STATE],A
	
	; MULTIPLY ARG A BY 10
2:	STORE	[CHAR],C
	LOADI	C,9
	LOAD	A,[ARGA]
	LOAD	B,[ARGA+1]
	STORE	[TEMP],A
	STORE	[TEMP+1],B
3:	LOAD	A,[TEMP+1]
	LOAD	B,[ARGA+1]
	ADD	B,A
	STORE	[ARGA+1],B
	LOAD	A,[TEMP]
	LOAD	B,[ARGA]
	BRNC	4F
	ADDI	B,1
	BRC	ERROR 
4:	ADD	B,A
	BRC	ERROR 
	STORE	[ARGA],B
	SUBI	C,1
	BRNZ	3B
	LOAD	C,[CHAR]
	
	; ADD THE NUMBER
	SUBI	C,'0'
	LOAD	A,[ARGA+1]
	ADD	A,C
	STORE	[ARGA+1],A
	BRNC	5F
	LOAD	A,[ARGA]
	ADDI	A,1
	STORE	[ARGA],A
	BRC	ERROR 
	
5:	JUMP	1B
	
	; PROCESS COMMA
8:	LOAD	A,[STATE]
	SUBI	A,1
	BRN	ERROR
	BRNZ	ERROR
	LOADI	A,2
	STORE	[STATE],A
	JUMP	0B

	; PROCESS COMMAND
9:	MOV	A,C

	; QUIT?
	LOADI	B,'Q'
	CMP	A,B
	LOADI	B,S_EXIT
	BRZ	SYSJUMP
	
	; CHANGE FILE?
	LOADI	B,'F'
	CMP	A,B
	LOADI	B,UOP0_B
	LOADI	C,SETFILE
	BRZ	INDIR
	
	; MAKE SURE COMMAND IS ZERO TERMINATED
	LOAD	C,[POINTER]
	LOADI	B,BUF_B
	STORE	[DBANK],B
	LOADF	C,[C]
	LOADI	B,0
	STORE	[DBANK],B
	ADDI	C,0
	BRNZ	ERROR
	
	LOADI	B,CMD1_B
	LOADI	C,PROCMD
	JUMP	INDIR
	
	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
.TEXT
.BANK	BI
CMD1_B	= BI

	; PROCESS STANDARD COMMAND
PROCMD:	LOADI	B,'P'
	CMP	A,B
	LOADI	B,UOP0_B
	LOADI	C,PRINTL
	BRZ	INDIR
	
	; READ FILE
	LOADI	B,'R'
	CMP	A,B
	LOADI	B,UOP0_B
	LOADI	C,DOFREAD
	BRZ	INDIR
	
	; APPEND LINES
	LOADI	B,'A'
	CMP	A,B
	LOADI	B,UOP0_B
	LOADI	C,APPEND
	BRZ	INDIR
	
	; INSERT LINES
	LOADI	B,'I'
	CMP	A,B
	LOADI	B,UOP0_B
	LOADI	C,INSERT
	BRZ	INDIR
	
	; DELETE LINES
	LOADI	B,'D'
	CMP	A,B
	LOADI	B,UOP0_B
	LOADI	C,DELETE
	BRZ	INDIR
	
	; MEMORY COUNT
	LOADI	B,'M'
	CMP	A,B
	LOADI	B,UOP0_B
	LOADI	C,PFREE
	BRZ	INDIR
	
	; LINE COUNT
	LOADI	B,'L'
	CMP	A,B
	LOADI	B,UOP0_B
	LOADI	C,PLINES
	BRZ	INDIR
	
	; CAN'T FIND COMMAND
	LOADI	B,CMD0_B
	LOADI	C,ERROR
	JUMP	INDIR
	
	; GO BACK TO COMMAND LINE
9:	LOADI	B,CMD0_B
	LOADI	C,PROMPT
	JUMP	INDIR

		; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
	
	; ZERO BANK
.BANK	0
.BSS

	; CURRENT BLOCK OF MEMORY TO WORK ON
.DEFL BYTE CBLOCK	0,0

	; BLOCK TO BE LINKED ONTO THE CURRENT BLOCK
.DEFL BYTE LBLOCK	0,0

	; MISC CONTEXT INFORMATION
.DEFL BYTE BLOCK	0
.DEFL BYTE BANK		0
.DEFL BYTE POINTER	0

	; MEMORY BLOCK PARSE INFORMATION
.DEFL BYTE MB_PNTR	0
.DEFL BYTE MB_END	0

	; FIRST CHARACTER?
.DEFL BYTE FIRST	0

	; CURRENT CHARACTER
.DEFL BYTE CHAR		0

	; LINE COUNT
.DEFL BYTE LINES	0

	; STACK PARKING SPACE
.DEFL BYTE SPARK	0

	; FREE MEMORY TABLE
.DEFL BYTE FREETAB	0,0

	; LINE EDITOR CONTENT
.DEFL BYTE LINETAB	0,0

	; STATE FOR COMMAND PROCESSING
.DEFL BYTE STATE	0

	; LINE NUMBER ARGUMENTS FOR COMMANDS
.DEFL BYTE ARGA		0,0
.DEFL BYTE ARGB		0,0
.DEFL BYTE TEMP		0,0

	; CURRENT FILE NAME
.DEFL BYTE FNAME	0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0

	; PREVIOUS BLOCK
	; ONLY UPDATED WHEN USING FINDL
.DEFL BYTE PBLOCK	0,0

	; NUMBER OF BLOCKS FREE
.DEFL BYTE NUMFREE	0,0

	; PADDING FOR DECIMAL NUMBER PRINT
.DEFL BYTE PADDING	0

	; RETURN FOR LEAF FUNCTIONS
.DEFL BYTE LEAFRET	0

	; START OF DEFINED MEMORY
.BANK	BD
.DATA
STR0_B = BD	; STRING BANK

	; ERROR MESSAGE / PROMPT
.DEFL BYTE ST_ERR	0X0A,0X0D,'?'
.DEFL BYTE ST_PRM	0X0A,0X0D,'%',0

	; BANK IS DONE, MOVE ON TO THE NEXT
BD	= BD+1
BUF_B	= BD	; BUFFER BANK

	; BANK IS DONE, MOVE ON TO THE NEXT
BD	= BD+4
HEAP	= BD	; THE REST OF MEMORY IS HEAP

