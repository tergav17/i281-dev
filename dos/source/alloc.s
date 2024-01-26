; ALLOC.S
; BLOCK ALLOCATION MANAGEMENT

.BANK BI
AL0_B	= BI
.TEXT

	; FLUSH ANY BUFFERS THAT MAY HAVE BECOME DIRTY
	; ASSUMES WORK BANK IS SELECTED
	; USES: A, B, C, M0
FLUSH:	SUBI	D,2
	LOADI	C,BI
	STOREF	[D+1],C

	; CHECK IF OPEN FILE IS DIRTY
	LOAD	A,[OF_DRTY]
	ADDI	A,0
	BRZ	1F
	
	; RESET OPEN FILE DIRTY FLAG
	LOADI	A,0
	STORE	[OF_DRTY],A
	
	; MOVE FILE SIZE BACK INTO FILE RECORD
	STORE	[M0],D
	LOAD	C,[OF_SIZE]
	LOAD	D,[OF_SIZE+1]
	LOAD	A,[SRCH_RP]
	LOAD	B,[SRCH_BK]
	STORE	[DBANK],B
	STOREF	[A+10],C
	STOREF	[A+11],D
	LOADI	B,WORK_B
	STORE	[DBANK],B
	LOAD	D,[M0]

	; EXECUTE WRITES FOR FILE RECORD AND BTAB
	LOADI	A,0
	LOAD	B,[SRCH_LO]
	STORE	[BLK],A
	STORE	[BLK+1],B
	
	; WRITE FILE RECORD
	LOADI	A,KBUF_B
	LOADI	C,@+5
0:	STOREF	[D],C
	LOADI	B,BLK0_B
	LOADI	C,BLKWRIT
	JUMP	INDIR
	
	; GET ADDRESS OF THE FILE BLOCK TABLE
	LOAD	A,[OF_BTAB]
	LOAD	B,[OF_BTAB+1]
	STORE	[BLK],A
	STORE	[BLK+1],B
	
	; WRITE FILE BLOCK TABLE
	LOADI	A,FBT_B
	LOADI	C,@+2
	JUMP	0B
	
	; CHECK IF ALLOCATION BITMAP IS DIRTY
1:	LOAD	A,[AB_DRTY]
	ADDI	A,0
	BRZ	2F
	
	; RESET ALLOCATION BITMAP DIRTY FLAG
	LOADI	A,0
	STORE	[AB_DRTY],A
	
	; GET ADDRESS OF CURRENT ALLOCATION BITMAP BLOCK
	LOADI	A,0
	LOAD	B,[AB_CBLK]
	STORE	[BLK],A
	STORE	[BLK+1],B

	; WRITE ALLOCATION BITMAP
	LOADI	A,ABM_B
	LOADI	C,@+2
	JUMP	0B

	; RESET STACK AND RETURN
2:	ADDI	D,2
	LOADI	A,WORK_B
	STORE	[DBANK],A
	JUMP	IRET
	
	; INDEX ALLOCATION BITMAP
	; SEARCHES FOR A BLOCK IN THE ALLOCATION TABLE
	; THAT CONTAINS AN EMPTY BLOCK OR ALLOCATED BLOCK
	; ASSUMES WORK BANK IS SELECTED
	; A = 0 IF LOOKING FOR EMPTY BLOCK, A = 1 IF LOOKING FOR FULL BLOCK
	; A = 0XFF IF COUNTING FREE BLOCKS
	; RETURNS A = 0 IF OPERATION IS SUCCESSFUL, A = 0XFF OTHERWISE
	; USES: A, B, C, M0, M1, M2
INDEX:	LOADI	B,AL1_B
	LOADI	C,INDEXA
	JUMP	INDIR

	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI-1
.BANK BI
AL1_B	= BI
.TEXT
	
BD_FREE	= 0X6E
	
	; SHADOW OF INDEX
INDEXA: STORE	[M2],A
	SUBI	D,2

	; DO WE RESET THE BLOCK COUNT?
	ADDI	A,0
	BRNN	0F
	
	; YES, WE DO
	LOADI	A,0
	STORE	[DBANK],A
	STORE	[BD_FREE],A
	STORE	[BD_FREE+1],A
	
	; SWITCH BACK THE WORK BANK AND CONTINUE
	LOADI	A,WORK_B
	STORE	[DBANK],A
	
	; BEFORE WE DO ANY WORK, LETS FLUSH THE EXISTING BUFFERS
0:	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,AL0_B
	LOADI	C,FLUSH
	JUMP	INDIR
	
	; SET CURRENT AB BLOCK TO 1
	LOADI	A,0
	STORE	[BLK],A
	LOADI	A,1
	
	
	; GRAB THE BLOCK AND START PROCESSING
0:	STORE	[AB_CBLK],A
	STORE	[BLK+1],A
	LOADI	A,ABM_B
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,BLK0_B
	LOADI	C,BLKREAD
	JUMP	INDIR
	
	; INIT SEARCH
	LOADI	A,0
	LOADI	B,ABM_B
	
	; SEARCH THE BITMAP
1:	STORE	[M0],A
	STORE	[M1],B
	STORE	[DBANK],B
	LOADF	C,[A]
	LOADI	B,WORK_B
	STORE	[DBANK],B
	
	; GET BEHAVIOR
	LOAD	A,[M2]
	ADDI	A,0
	BRZ	7F
	BRNN	8F
	
	; COUNT BITS IN C
	LOADI	A,0
	STORE	[DBANK],A
	LOADI	B,8
	
	; KEEP POPPING BITS OFF OF C TILL NONE REMAIN
2:	SHIFTL	C
	BRC	3F
	
	; ADD 1 TO COUNT
	ADDI	A,1
	
	; ARE WE DONE?
3:	SUBI	B,1
	BRNZ	2B
	
	; ADD A TO BIT COUNTER
	LOAD	B,[BD_FREE+1]
	ADD	B,A
	STORE	[BD_FREE+1],B
	BRNC	4F
	LOAD	B,[BD_FREE]
	ADDI	B,1
	STORE	[BD_FREE],B
	
	; DONE, BACK TO THE WORK BANK
4:	LOADI	A,WORK_B
	STORE	[DBANK],A
	
	; GET NEXT CHUNK
6:	LOAD	A,[M0]
	LOAD	B,[M1]
	ADDI	A,1
	BRNN	1B
	LOADI	A,0
	ADDI	B,1
	LOADI	C,ABM_B+4
	CMP	B,C
	BRNZ	1B
	
	; READ THE NEXT BLOCK
	LOAD	A,[AB_CBLK]
	ADDI	A,1
	LOADI	B,17
	CMP	A,B
	BRNZ	0B
	
	; WE DIDN'T FIND IT
	; OR WE ARE JUST DONE COUNTING
	; COULD BE EITHER
	LOAD	B,[M2]
	LOADI	A,0xFF
	ADDI	B,0
	BRNN	9F	; NOPE, RIP :(
	
	; YAY, LETS DO IT AGAIN
	LOADI	A,0
	ADDI	D,2
	JUMP	INDEXA
	
	; CHECK TO SEE IF CHUNK HAS AN EMPTY BLOCK
7:	ADDI	C,1
	BRZ	6B
	LOADI	A,0
	JUMP	9F

	; CHECK TO SEE IF CHUNK HAS A FILLED BLOCK
8:	ADDI	C,0
	BRZ	6B
	LOADI	A,0

	; RESTORE STACK
9:	ADDI	D,2

AL1DONE:LOADI	B,WORK_B
	STORE	[DBANK],B
	JUMP	IRET

	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI-1
