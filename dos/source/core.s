; CORE.S
; MAIN 'GUTS' OF DOS/281

.BANK BI
CORE0_B	= BI
.TEXT

	; SET UP SYSTEM FOR OPERATION
	; BRING UP THE WORK BANK
INIT:	LOADI	A,WORK_B
	STORE	[DBANK],A
	
	; SET THE STACK POINTER TO THE TOP OF THE STACK
	LOADI	D,0X80-2

	; INITALIZE THE TTY DRIVER
	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,@+5
	STOREF	[D],C
	
	LOADI	B,TTY0_B
	LOADI	C,TTYINIT
	JUMP	INDIR
	
	; SEND OUT THE 'HELLO' SPLASH
	LOADI	C,WORK_B
	STORE	[SRC_BNK],C
	LOADI	A,S_HELLO
	
	LOADI	C,@+5
	STOREF	[D],C
	
	LOADI	B,TTY0_B
	LOADI	C,TTYPUTS
	JUMP	INDIR
	
	; INITALIZE THE BLOCK DRIVER
	LOADI	C,@+5
	STOREF	[D],C
	
	LOADI	B,BLK0_B
	LOADI	C,BLKINIT
	JUMP	INDIR
	
	; INDEX ALLOCATION BITMAP
	LOADI	A,0X00
	LOADI	C,@+5
	STOREF	[D],C
	
	LOADI	B,AL0_B
	LOADI	C,INDEX
	JUMP	INDIR
	
	; DOT PROMPT
PROMPT: LOADI	A,ST_PRMT
CPRMPT:	LOADI	C,WORK_B	; USED FOR CUSTOM PROMPTS
	STORE	[SRC_BNK],C

	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,@+5
	STOREF	[D],C
	
	LOADI	B,TTY0_B
	LOADI	C,TTYPUTS
	JUMP	INDIR
	
	; GET AN INPUT FROM THE TERMINAL
	LOADI	C,CMDL_B
	STORE	[SRC_BNK],C
	
	LOADI	C,@+5
	STOREF	[D],C
	
	LOADI	B,TTY0_B
	LOADI	C,TTYINPT
	JUMP	INDIR
	
	; DO CR / LF
	LOADI	A,0X0D
	LOADI	C,@+5
	STOREF	[D],C
	
	LOADI	B,TTY0_B
	LOADI	C,TTYPUTC
	JUMP	INDIR
	
	LOADI	A,0X0A
	LOADI	C,@+5
	STOREF	[D],C
	
	LOADI	B,TTY0_B
	LOADI	C,TTYPUTC
	JUMP	INDIR
	
	; NOW, EXECUTE THE COMMAND
	LOADI	B,CORE1_B
	LOADI	C,EXEC
	JUMP	INDIR

	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI-1
.BANK BI
CORE1_B	= BI
.TEXT

	; ATTEMPT TO EXECUTE WHATEVER HAS BEEN PLACE IN THE CMD
	; BUFFER
	; START BY CLOSING THE FILE
EXEC:	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,@+5
	STOREF	[D],C
	
	LOADI	B,FS0_B
	LOADI	C,FCLOSE
	JUMP	INDIR	
	
	; SET WORKING USER AREA TO '0'
	; TODO: CHANGE THIS TO DEFAULT AREA
	LOADI	A,'0'
	STORE	[WRK_USR],A

	; CHECK FOR "&"
	LOADI	A,0
	LOADI	B,CMDL_B
	STORE	[DBANK],B
	LOAD	C,[0]
	SUBI	C,'&'
	LOADI	B,WORK_B
	STORE	[DBANK],B
	BRNZ	0F
	ADDI	A,1
0:	STORE	[EX_HALT],A

	; ATTEMPT TO SET PARAMETERS FOR SEARCH
	LOADI	C,@+5
	STOREF	[D],C
	
	LOADI	B,FS0_B
	LOADI	C,SSPARAM
	JUMP	INDIR
	
	; CHECK TO MAKE SURE IT RETURNS 0XFE
	SUBI	A,0XFE
	BRNZ	EXECERR
	
	; MANUALLY SET THE EXTENSION AS 'SV'
	LOADI	A,'S'
	STORE	[PATTERN+6],A
	LOADI	A,'V'
	STORE	[PATTERN+7],A
	
	; AND SEARCH FOR IT
	LOADI	A,0
	LOADI	C,@+5
	STOREF	[D],C
	
	LOADI	B,FS0_B
	LOADI	C,FSEARCH
	JUMP	INDIR
	
	; DID IT WORK?
	ADDI	A,0
	BRNZ	EXECERR
	
	; NOW OPEN IT
	LOADI	C,@+5
	STOREF	[D],C
	
	LOADI	B,FS0_B
	LOADI	C,FOPEN
	JUMP	INDIR
	
	; RESET LOAD STATE
	LOADI	A,KBUF_B
	STORE	[SRC_BNK],A
	LOADI	A,0
	
	; READ IN THE SAV RECORD
0:	STORE	[EX_BLK],A
	LOADI	C,@+5
	STOREF	[D],C
	
	LOADI	B,FS0_B
	LOADI	C,FREAD
	JUMP	INDIR
	
	; SAVE THE STACK
	STORE	[M0],D
	
	; MAKE SURE THE READ WORKED
	ADDI	A,0
	BRNZ	EXECERR
	
	; CHECK THAT THE RECORD IS VALID
	LOADI	A,KBUF_B
	STORE	[DBANK],A
	
	; LOOK FOR THE 0X0281 AT THE BEGINNING OF THE RECORD
	LOAD	A,[0X00]
	SUBI	A,0X02
	BRNZ	EXECERR
	LOAD	A,[0X01]
	SUBI	A,0X81
	BRNZ	EXECERR
	
	; GRAB THE DESTINATION SECTOR
	LOAD	A,[0X02]
	
	; NO BANK 0!
	ADDI	A,0
	BRZ	EXECERR
	
	; MAKE SURE IT ISN'T TOO BIG TOO
	LOADI	B,MAX_IB
	CMP	A,B
	BRAE	EXECERR
	LOADI	B,MAX_DB
	CMP	A,B
	BRAE	EXECERR
	
	; AND LOAD UP THE DATA BLOCK
	LOADI	C,0
1:	LOADI	B,KBUF_B+1
	STORE	[DBANK],B
	LOADF	B,[C]
	STORE	[DBANK],A
	STOREF	[C],B
	ADDI	C,1
	BRNN	1B
	
	; FINALLY, LOAD UP THE ISR BLOCK
	LOADI	B,KBUF_B+2
	LOADI	D,BI
	LOADI	C,@+2
	JUMP	PRGM
	
	; RESTORE THE STACK AND WORK AREA
	LOADI	A,WORK_B
	STORE	[DBANK],A
	LOAD	D,[M0]
	
	; EITHER MOVE ON TO THE NEXT BLOCK OR EXIT
	LOAD	A,[EX_BLK]
	LOAD	B,[OF_SIZE+1]
	ADDI	A,1
	CMP	A,B
	BRNZ	0B
	
	; COMMIT TO EXECUTION
	LOAD	D,[EX_HALT]
	
	; SET SYSTEM VARIABLES
	LOADI	B,0
	STORE	[DBANK],B
	LOADI	B,MAX_IB
	STORE	[0X70],B
	LOADI	B,MAX_DB
	STORE	[0X71],B
	LOADI	B,CMDL_B
	STORE	[0X72],B
	LOADI	B,0
	STORE	[0X73],B
	
	; "REFRESH" BANK 1 DISPLAY
	LOADI	B,1
	STORE	[DBANK],B
	LOADI	B,7
2:	LOADF	A,[B]
	STOREF	[B],A
	SUBI	B,1
	BRC	2B
	
	; RUN THE PROGRAM
	SUBI	D,1
	LOADI	B,1
	LOADI	C,0X80
	BRNZ	INDIR
	
	; DO A ZSTART IF WE ARE HALTING
	LOADI	B,0
	LOADI	C,0
	JUMP	ZSTART

	; HANDLE ERROR IN EXEC
EXECERR:LOADI	A,WORK_B
	STORE	[DBANK],A
	LOADI	A,ST_ERR
	LOADI	B,CORE0_B
	LOADI	C,CPRMPT
	JUMP	INDIR

	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI-1

	; ALLOCATE A BANK FOR THE KERNEL WORK AREA
	; 0X60-7F = KERNEL STACK SPACE
.BANK	BD
WORK_B	= BD
.DATA

	; MISC VALUES
	; USED AS TEMP REGISTERS FOR ALL SORTS OF STUFF
.DEFL BYTE M0		0
.DEFL BYTE M1		0
.DEFL BYTE M2		0

	; DEVICE SPECIFIC MISC VALUES
	; SAFE TO USE IN DEVICE DRIVERS
.DEFL BYTE D0		0

	; SOURCE BANK OF WHATEVER OPERATION IS BEING DONE
	; MAINLY USED TO KEEP TRACK OF THE BANK ADDRESS
	; OF STUFF BEING WORKED ON IN USER SPACE
.DEFL BYTE SRC_BNK	0

	; ADDRESSES FOR THE BLOCK DEVICE DRIVER
	; USED DURING A 'READ' OR 'WRITE' CALL
.DEFL BYTE BLK		0,0

	; PATTERN FOR SEARCHING FOR FILES
	; AND WORKING USER AREA
.DEFL BYTE MATCH	0XFF	; THIS IS ALWAYS 0XFF
.DEFL BYTE WRK_USR	'0'
.DEFL BYTE PATTERN	"--------"

	; STATE INFORMATION FOR SEARCHING 
.DEFL BYTE SRCH_LO	0	; LOW BLOCK
.DEFL BYTE SRCH_BK	0	; CURRENT BANK
.DEFL BYTE SRCH_RP	0	; RECORD POINTER
.DEFL BYTE SRCH_LS	0	; LAST ENDING

	; STATE INFORMATION FOR OPEN FILES
.DEFL BYTE OF_OPEN	0	; OF_OPEN = 1 IF THERE IS A FILE OPEN
.DEFL BYTE OF_BTAB	0,0	; BLOCK TABLE ADDRESS
.DEFL BYTE OF_SIZE	0,0	; OPEN FILE SIZE
.DEFL BYTE OF_DRTY	0	; OPEN FILE IS DIRTY

	; ERROR
.DEFL BYTE ST_ERR	"?"

	; COMMAND LINE PROMPT
.DEFL BYTE ST_PRMT	0X0A,0X0D,'.',0

	; STATE INFORMATION FOR ALLOCATION BITMAP
.DEFL BYTE AB_CBLK	0	; CURRENT BLOCK IN THE ALLOCATION TABLE
.DEFL BYTE AB_DRTY	0	; IS ALLOCATION BLOCK DIRTY?
.DEFL BYTE AB_BANK	0	; CURRENT BANK
.DEFL BYTE AB_CPNT	0	; CHUNK POINTER
.DEFL BYTE AB_BIT	0	; CHUNK BIT
.DEFL BYTE AB_FREE	0,0	; BLOCK TO FREE

	; PROGRAM EXECUTION INFORMATION
.DEFL BYTE EX_HALT	0	; HALT PROGRAM ON EXECUTION
.DEFL BYTE EX_BLK	0	; BLOCK POINTER FOR EXEC


	; EMPTY PATTERN USED TO FIND UNUSED FILE RECORDS
.DEFL BYTE EMPTYP	0X00,'?',"????????"

	; PLACE 'HELLO' AT BOTTOM  OF STACK
	; WE DON'T CARE IF IT GETS OVERWRITTEN LATER
.ORG 0X60
.DEFL BYTE S_HELLO	"DOS/281 V1.2",0X0A,0X0D,0


	; BANK IS DONE, MOVE ON TO THE NEXT
BD	= BD-1

	; COMMAND LINE BANK
CMDL_B	= BD

	; BANK IS DONE, MOVE ON TO THE NEXT
BD	= BD-4
	
	; ALLOCATION BITMAP BUFFER
ABM_B	= BD

	; BANK IS DONE, MOVE ON TO THE NEXT
BD	= BD-4

	; FILE BLOCK TABLE
FBT_B	= BD

	; BANK IS DONE, MOVE ON TO THE NEXT
BD	= BD-4

	; KERNEL BUFFER
KBUF_B	= BD

	; BANK IS DONE, MOVE ON TO THE NEXT
BD	= BD-1
