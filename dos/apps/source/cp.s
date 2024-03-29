; CP.S
; COPY FILES
; GAVIN TERSTEEG, 2024
; SDMAY24-14

; BUFFER WILL START AT BANK 3
; AND BE 16KB IN SIZE
BUFFER	= 3
BUFSIZE = 32

; BANK ALLOCATION STUFF
BI	= 1
BD	= 1

; MAXIMUM ARGUMENTS
MAXARGS	= 2

.TEXT
.BANK	BI
CORE0_B	= BI

	; START BY PROCESSING THE ARGUMENTS
START:	LOADI	A,0
	STORE	[DBANK],A
	
	; RESET ARG STATE
	STORE	[ARGC],A
	
	; SET UP STACK
	LOADI	D,0X60-2
	
	; SYSCALL RETURN BANK
	LOADI	C,1	
	STOREF	[D+1],C
	
	; SET UP POINTER
	LOADI	C,0
	
	; GO TO ARGUMENT BANK
0:	LOAD	A,[CMDL_B]
	STORE	[ARG_BNK],A
	STORE	[DBANK],A

	; SKIP THE CURRENT ARGUMENT
1:	LOADF	A,[C]
	LOADI	B,0X20
	CMP	A,B
	BRBE	2F
	ADDI	C,1
	JUMP	1B

	; LOOK FOR AN ARGUMENT
2:	LOADF	A,[C]
	ADDI	A,0
	BRZ	ARGDONE
	CMP	A,B
	BRA	3F
	ADDI	C,1
	JUMP	2B

	; IS IT A FLAG?
3:	LOADI	B,'-'
	CMP	A,B
	BRNZ	5F
	
	; HANDLE FLAGS HERE	
4:	ADDI	C,1
	LOADF	A,[C]
	ADDI	A,0
	BRZ	ARGDONE
	LOADI	B,0X20
	CMP	A,B
	BRBE	2B
	
	; REGISTER THE FLAG
	LOADI	B,0
	STORE	[DBANK],B
	
	; IS IT A RECOGNIZED FLAG?
	ADDI	B,0
	BRZ	ARGBAD
	LOADI	A,1
	STOREF	[B],A

	; THERE MAY BE ANOTHER FLAG
	LOAD	B,[CMDL_B]
	STORE	[ARG_BNK],B
	STORE	[DBANK],B
	JUMP	4B

	; SAVE THE ARGUMENT
5:	LOADI	B,0
	STORE	[DBANK],B
	LOAD	B,[ARGC]
	STOREF	[B+ARGV],C
	
	; DID WE EXCEED THE ALLOWED NUMBER OF ARGUMENTS
	SUBI	B,MAXARGS
	BRC	ARGBAD
	ADDI	B,MAXARGS+1
	STORE	[ARGC],B
	JUMP	0B
	
	; BAD ARGUMENT
ARGBAD:	LOADI	A,0
	STORE	[DBANK],A
	
	LOADI	A,STR1_B
	STORE	[ARG_BNK],A
	LOADI	A,ERROR0
	
	; PRINT ERROR MESSAGE
	LOADI	B,S_PUTS
	LOADI	C,EXIT
	JUMP	SYSCALL	

	; EXIT PROGRAM
EXIT:	LOADI	B,0
	JUMP	SYSJUMP
	
	; ARGUMENT PROCESSING DONE
ARGDONE:LOADI	A,0
	STORE	[DBANK],A
	
	; CHECK ARG COUNT
	LOAD	A,[ARGC]
	SUBI	A,2
	BRNZ	ARGBAD
	
	; SET ARG_BNK
	LOAD	A,[CMDL_B]
	STORE	[ARG_BNK],A
	
	; MAKE SURE WE CAN OPEN THE FIRST FILE
	LOAD	A,[ARGV]
	LOADI	B,S_OPEN
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; CHECK FOR ERRORS
	ADDI	A,0
	BRZ	1F
	
	; ERROR MESSAGE ARGS
	LOADI	A,STR1_B
	STORE	[ARG_BNK],A
	LOADI	A,ERROR1
	
	; PRINT ERROR MESSAGE
	LOADI	B,S_PUTS
	LOADI	C,EXIT
	JUMP	SYSCALL
	
	; MAKE SURE WE CAN CREAT THE SECOND FILE
1:	LOAD	A,[ARGV+1]
	LOADI	B,S_CREAT
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; CHECK FOR ERRORS
	ADDI	A,0
	BRZ	2F
	
	; ERROR MESSAGE ARGS
	LOADI	A,STR2_B
	STORE	[ARG_BNK],A
	LOADI	A,ERROR2
	
	; PRINT ERROR MESSAGE
	LOADI	B,S_PUTS
	LOADI	C,EXIT
	JUMP	SYSCALL
	
	; PREPARE FOR COPY OPERATION
2:	LOADI	A,0
	STORE	[S_PNTR],A
	STORE	[D_PNTR],A
	LOADI	A,0XFF
	STORE	[CONT],A

	; DO IT
	LOADI	B,CORE1_B
	LOADI	C,DOREAD
	JUMP	INDIR


	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
.TEXT
.BANK	BI
CORE1_B	= BI

	; EXECUTE THE COPY OPERATION
	; FIRST PART IS READING FROM THE SOURCE FILE
	; LETS OPEN IT
DOREAD:	LOADI	C,BI
	STOREF	[D+1],C
	LOAD	A,[CMDL_B]
	STORE	[ARG_BNK],A
	LOAD	A,[ARGV]
	LOADI	B,S_OPEN
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; CHECK FOR ERRORS
	ADDI	A,0
	BRZ	1F
	
	; SOURCE OPEN ERROR
	LOADI	A,ERROR1
	JUMP	8F
	
	; RESET STATE FOR READING IN
1:	LOADI	A,0
	STORE	[TRANS],A

	; READ A BLOCK IN
2:	SHIFTL	A
	SHIFTL	A
	ADDI	A,BUFFER
	STORE	[ARG_BNK],A
	LOAD	A,[S_PNTR]
	LOADI	B,S_READ
	LOADI	C,@+2
	JUMP	SYSCALL
	ADDI	A,0
	BRZ	3F
	
	; READ END
	; LETS WRITE IT OUT AND BE DONE WITH IT
REND:	LOADI	A,0
	STORE	[CONT],A
	JUMP	DOWRITE
	
	; INCREMENT STATE STUFF
3:	LOAD	A,[S_PNTR]
	ADDI	A,1
	BRZ	REND
	STORE	[S_PNTR],A
	LOAD	A,[TRANS]
	ADDI	A,1
	STORE	[TRANS],A
	LOADI	B,BUFSIZE
	CMP	A,B
	BRNZ	2B
	
	; SECOND PART IS WRITING TO THE DEST FILE
	; LETS OPEN IT
DOWRITE:LOAD	A,[CMDL_B]
	STORE	[ARG_BNK],A
	LOAD	A,[ARGV+1]
	LOADI	B,S_OPEN
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; CHECK FOR ERRORS
	ADDI	A,0
	BRZ	1F
	
	; DEST OPEN ERROR!
	LOADI	A,ERROR3
	JUMP	8F

	; RESET STATE FOR WRITING OUT
1:	LOADI	A,0
	STORE	[B_PNTR],A
	
	; WRITE A BLOCK OUT
2:	LOAD	B,[TRANS]
	CMP	A,B
	BRZ	WEND
	SHIFTL	A
	SHIFTL	A
	ADDI	A,BUFFER
	STORE	[ARG_BNK],A
	LOAD	A,[D_PNTR]
	LOADI	B,S_WRITE
	LOADI	C,@+2
	JUMP	SYSCALL
	ADDI	A,0
	BRZ	3F
	
	; WRITE ERROR!
	LOADI	A,ERROR4
	JUMP	8F
	
	; INCREMENT STATE STUFF
3:	LOAD	A,[D_PNTR]
	ADDI	A,1
	STORE	[D_PNTR],A
	LOAD	A,[B_PNTR]
	ADDI	A,1
	STORE	[B_PNTR],A
	JUMP	2B
	
	; DO WE CONTINUE?
WEND:	LOAD	A,[CONT]
	ADDI	A,0
	BRNZ	DOREAD
	
	; NOPE, ALL DONE
	JUMP	9F

	; PRINT AN ERROR MESSAGE
	; A = ERROR MESSAGE TO PRINT
8:	LOADI	B,STR2_B
	STORE	[ARG_BNK],B

	; PRINT ERROR MESSAGE
	LOADI	B,S_PUTS
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; EXIT PROGRAM
9:	LOADI	B,CORE0_B
	LOADI	C,EXIT
	JUMP	INDIR

.DATA
.BANK	BD
STR1_B	= BD

	; ERROR MESSAGES
.DEFL BYTE ERROR0	"INVALID ARGUMENTS",0X0A,0X0D,
			"USAGE: CP SOURCE DEST",0X0A,0X0D,0

	; BANK IS DONE, MOVE ON TO THE NEXT
BD	= BD+1
.DATA
.BANK	BD
STR2_B	= BD

.DEFL BYTE ERROR1	"CAN'T OPEN SOURCE FILE",0X0A,0X0D,0
.DEFL BYTE ERROR2	"CAN'T CREATE DEST FILE",0X0A,0X0D,0
.DEFL BYTE ERROR3	"CAN'T OPEN DEST FILE",0X0A,0X0D,0
.DEFL BYTE ERROR4	"DEST WRITE ERROR",0X0A,0X0D,0

	; ZERO BANK STUFF
.BANK	0
.BSS

	; COMMAND LINE ARGUMENTS
.DEFL BYTE ARGC		0
.DEFL BYTE ARGV		0,0,0

	; NUMBER OF BLOCKS IN BUFFER
.DEFL BYTE TRANS	0

	; BUFFER POINTER
.DEFL BYTE B_PNTR	0

	; CURRENT BLOCK POINTER FOR SOURCE
.DEFL BYTE S_PNTR	0

	; CURRENT BLOCK POINTER FOR DESTINATION
.DEFL BYTE D_PNTR	0

	; CONTINUE WITH OPERATION?
.DEFL BYTE CONT		0
