; P3PLAY.S
; AY-3-8910 SQT CHIPTUNE PLAYER
; GAVIN TERSTEEG, 2024
; SDMAY24-14

; SET START OF HEAP
MODULE	= BD

; BANK ALLOCATION STUFF
BI	= 1
BD	= 1

; MAXIMUM ARGUMENTS
MAXARGS	= 1

.TEXT
.BANK	BI
CORE0_B	= BI

	; START BY PROCESSING THE ARGUMENTS
START:	LOADI	A,0
	STORE	[DBANK],A
	
	; RESET ARG STATE
	STORE	[ARGC],A
	STORE	[AFLAG],A
	
	; SET UP STACK
	LOADI	D,0X60-2
	
	; SYSCALL RETURN BANK
	LOADI	C,BI
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
	LOADI	A,ERROR00
	
	; PRINT ERROR MESSAGE
PRNTERR:LOADI	B,ERR0_B
	STORE	[ARG_BNK],B
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
	SUBI	A,1
	BRNZ	ARGBAD
	
	; OPEN FILE
	LOAD	A,[CMDL_B]
	STORE	[ARG_BNK],A
	LOAD	A,[ARGV]
	LOADI	B,S_OPEN
	LOADI	C,@+2
	JUMP	SYSCALL
	ADDI	A,0
	LOADI	A,ERROR01
	BRNZ	PRNTERR
	
	; RESET READ IN STATE
	LOADI	A,0
	LOADI	B,MODULE
	
	; READ IT LOOP
0:	STORE	[BLOCK],A
	STORE	[ARG_BNK],B
	LOADI	B,S_READ
	LOADI	C,@+2
	JUMP	SYSCALL
	ADDI	A,0
	BRNZ	1F
	
	; INCREMENT
	LOAD	A,[BLOCK]
	LOAD	B,[ARG_BNK]
	ADDI	A,1
	ADDI	B,4
	LOAD	C,[MAX_IB]
	SUBI	C,3
	CMP	B,C
	BRBE	0B

	; ERROR
	LOADI	A,ERROR02
	JUMP	PRNTERR
	
	; START ATTEMPTING TO PLAY
1:	LOADI	B,CORE1_B
	LOADI	C,MAIN
	JUMP	INDIR

BI	= BI + 1
.TEXT
.BANK	BI
CORE1_B	= BI

MAIN:	LOADI	C,BI
	STOREF	[D+1],C

	; MAIN LOOP OF PLAYER
0:	NOOP




	; CHECK INPUT
	LOADI	B,S_STAT
	LOADI	C,@+2
	JUMP	SYSCALL
	ADDI	A,0
	BRZ	0B
	
	; GET THE CHARACTER
	LOADI	B,S_GETC
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; EXIT
	LOADI	B,S_EXIT
	JUMP	SYSJUMP
	

	; ZERO BANK VARIABLES
.BANK	0
.BSS

	; COMMAND LINE ARGUMENTS
.DEFL BYTE ARGC		0
.DEFL BYTE ARGV		0,0

	; COMMAND LINE FLAGS
.DEFL BYTE AFLAG	0

	; READ IN STATE
.DEFL BYTE BLOCK	0

	; FILE READ IN STATE

	; VARIOUS MISC VARIABLES
	; TO BE USED IN LEAF-FUNCTIONS
.DEFL BYTE SPARK	0

	; ERROR BANK 0
.BANK	BD
.DATA
ERR0_B	= BD

	; INVALID ARGUMENTS
.DEFL BYTE ERROR00	"INVALID ARGUMENTS",0X0A,0X0D,
			"USAGE: TEMPLT [-A] FILE1 FILE2 ...",0X0A,0X0D,0
			
.DEFL BYTE ERROR01	"FAILED TO OPEN FILE",0X0A,0X0D,0
.DEFL BYTE ERROR02	"FILE TOO LARGE",0X0A,0X0D,0

BD	= BD+1	