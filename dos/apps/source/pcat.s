; CAT.S
; TYPE OUT FILES ONTO THE CONSOLE
; GAVIN TERSTEEG, 2024
; SDMAY24-14

; AY-3-8910 ADDRESASES
AY0_ADR	= 0XB0
AY1_ADR	= 0XB2
AY0_WR	= 0XB1
AY1_WR	= 0XB3
AY0_RD	= 0XB0
AY1_RD	= 0XB2

; MAXIMUM ARGUMENTS
MAXARGS	= 15

	; START BY PROCESSING THE ARGUMENTS
START:	LOADI	A,0
	STORE	[DBANK],A
	
	; RESET ARG STATE
	STORE	[ARGC],A
	STORE	[ARGMNT],A
	
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
	
	LOADI	A,STR_B
	STORE	[ARG_BNK],A
	LOADI	A,ERROR0
	
	; PRINT ERROR MESSAGE
	LOADI	B,S_PUTS
	LOADI	C,@+2
	JUMP	SYSCALL

	; EXIT PROGRAM
	LOADI	B,0
	JUMP	SYSJUMP
	
	; ARGUMENT PROCESSING DONE
ARGDONE:LOADI	A,0
	STORE	[DBANK],A
	
	; CHECK ARG COUNT
	LOAD	A,[ARGC]
	ADDI	A,0
	BRZ	ARGBAD
	
	; GO TO MAIN FUNCTION
	LOADI	B,2
	LOADI	C,MAIN
	JUMP	INDIR

.BANK	2
.TEXT
	
	; MAIN FUNCTION
MAIN:	LOADI	C,2	
	STOREF	[D+1],C
	
	; SET UP AY CHIPS
	LOADI	A,7
	STORE	[AY1_ADR],A
	STORE	[AY0_ADR],A
	LOADI	A,0XBF
	STORE	[AY1_WR],A
	LOADI	A,0XFF
	STORE	[AY0_WR],A

	; SET DEVICE CONTROL STATE
	LOADI	A,15
	STORE	[AY1_ADR],A
	LOADI	A,0XFF
	STORE	[AY1_WR],A
	
	; A = FILE STRING START
0:	LOAD	A,[CMDL_B]
	STORE	[ARG_BNK],A
	LOAD	A,[ARGMNT]
	LOADF	A,[A+ARGV]
	
	; OPEN FILE
	LOADI	B,S_OPEN
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; CHECK FOR ERRORS
	ADDI	A,0
	BRZ	1F
	
	; ERROR MESSAGE ARGS
	LOADI	A,STR_B
	STORE	[ARG_BNK],A
	LOADI	A,ERROR1
	
	; PRINT ERROR MESSAGE
	LOADI	B,S_PUTS
	LOADI	C,EXIT
	JUMP	SYSCALL
	
	; RESET STATE
1:	LOADI	A,2
	STORE	[ARG_BNK],A
	LOADI	A,0
	
	; READ BLOCK
READF:	STORE	[COUNT],A
	LOADI	B,S_READ
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; CHECK FOR ERRORS
	ADDI	A,0
	BRNZ	NEXT
	
	; SET DEFAULT POINTER AND BANK
	LOADI	A,0
	LOADI	B,2
	
	; LOOP TO OUTPUT CHARACTER
OUTPUT:	STORE	[POINTER],A
	STORE	[BANK],B 
	STORE	[DBANK],B
	LOADF	A,[A]
	
	; MAKE SURE IT ISN'T 0
	ADDI	A,0
	BRZ	NEXT
	
	; PRINT CHARACTER MESSAGE
	LOADI	B,0
	STORE	[DBANK],B
	
	; WAIT FOR BUSY TO CLEAR
	LOADI	B,14
	STORE	[AY1_ADR],B
WAITP:	LOAD	B,[AY1_RD]
	SHIFTR	B
	SHIFTR	B
	SHIFTR	B
	BRC	WAITP
	
	LOADI	B,14
	STORE	[AY0_ADR],B
	STORE	[AY0_WR],A

	; STROBE PRINTER
	LOADI	A,15
	STORE	[AY1_ADR],A
	LOADI	A,0XF7
	STORE	[AY1_WR],A
	LOADI	A,0XFF
	STORE	[AY1_WR],A
	
	; NEXT CHARACTER
	LOAD	A,[POINTER]
	LOAD	B,[BANK]
	ADDI	A,1
	BRNN	OUTPUT
	LOADI	A,0
	ADDI	B,1
	LOADI	C,6
	CMP	B,C
	BRNZ	OUTPUT
	
	; NEXT BLOCK
	LOAD	A,[COUNT]
	ADDI	A,1
	BRNC	READF
	
	; NEXT FILE
NEXT:	LOADI	B,0
	STORE	[DBANK],B
	LOAD	A,[ARGMNT]
	ADDI	A,1
	STORE	[ARGMNT],A
	LOAD	B,[ARGC]
	CMP	A,B
	BRNZ	0B

	; EXIT PROGRAM
EXIT:	LOADI	B,0
	JUMP	SYSJUMP


.BANK	1
.DATA
STR_B	= 1

	; ERROR MESSAGES
.DEFL BYTE ERROR0	"INVALID ARGUMENTS",0X0A,0X0D,
			"USAGE: CAT FILE1 FILE2 ...",0X0A,0X0D,0
.DEFL BYTE ERROR1	"CAN'T OPEN FILE",0X0A,0X0D,0

.BANK	0
.BSS

	; COMMAND LINE ARGUMENTS
.DEFL BYTE ARGC		0
.DEFL BYTE ARGV		0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0

	; ARGUMENT COUNTER
.DEFL BYTE ARGMNT	0

	; READ BLOCK COUNTER
.DEFL BYTE COUNT	0

	; INFORMATION ON WHAT CHARACTER IS BEING PRINTED
.DEFL BYTE POINTER	0
.DEFL BYTE BANK		0