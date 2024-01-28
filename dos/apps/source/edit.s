; EDIT.S
; SIMPLE TEXT EDITOR

; STARTING BANK
MINBANK	= 2

	; START BY PROCESSING THE ARGUMENTS
START:	LOADI	A,0
	STORE	[DBANK],A
	
	; SET UP STACK
	LOADI	D,0X60-2
	
	; SYSCALL RETURN BANK
	LOADI	C,1	
	STOREF	[D+1],C
	
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
2:	LOADI	B,EXIT
	JUMP	JUMP

	
	; THERE IS AN ARG, TRY AND OPEN IT
OPENARG:LOADI	A,0
	STORE	[DBANK],A
	
	; A = FILE STRING START
	MOV	A,C
	
	; OPEN FILE
	LOADI	B,S_OPEN
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; CHECK FOR ERRORS
	ADDI	A,0
	BRZ	0F
	
	; ERROR MESSAGE ARGS
	LOADI	A,1
	STORE	[ARG_BNK],A
	LOADI	A,ERROR0
	
	; PRINT ERROR MESSAGE
	LOADI	B,S_PUTS
	LOADI	C,EXIT
	JUMP	SYSCALL
	
	; RESET STATE
0:	LOADI	A,MINBANK
	STORE	[ARG_BNK],A
	LOADI	A,0
	
	; READ BLOCK
READF:	STORE	[COUNT],A
	LOADI	B,S_READ
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; CHECK FOR ERRORS
	ADDI	A,0
	BRNZ	EXIT


	; EXIT PROGRAM
DONE:	LOADI	B,0
	JUMP	SYSJUMP


.BANK	2


	; FUNCTION TO SHIFT A LARGE BLOCK OF MEMORY FORWARD
	; A = ADDRESS OF LAST BYTE
	; B = BANK OF LAST BYTE
	; C = NUMBER OF BYTES TO SHIFT
OFFSETF:STORE	[OFSTACK],D

	STORE	[DBANK],B
0:	LOADF	D,[A]
	ADDI	A,1
	BRNN	1F
	ADDI	B,1
	SUBI	A,0X80
	STORE	[DBANK],B
1:	STOREF	[A],D
	SUBI	C,1
	BRZ	2F
	SUBI	A,2
	BRNN	0B
	SUBI	B,1
	ADDI	A,0X80
	STORE	[DBANK],B
	JUMP	0B
	
2:	
	

	; MOVE 
OFFSET:

.BANK	1
.DATA

	; ERROR MESSAGES
.DEFL BYTE ERROR0	"CAN'T OPEN FILE",0X0A,0X0D,0

.BANK	0
.BSS

	; FILE READ IN INFORMATION
.DEFL BYTE COUNT	0
.DEFL BYTE BANK		0

	; OFFSET OPERATION VARIABLES
.DEFL BYTE OFSTACK	0