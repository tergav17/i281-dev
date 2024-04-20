; AS0.S
; ASSEMBLER BACKBONE
; GAVIN TERSTEEG, 2024
; SDMAY24-14

; SET START OF HEAP
HEAP	= BD

; BANK ALLOCATION STUFF
BI	= 1
BD	= 1

; MAXIMUM ARGUMENTS
MAXARGS	= 13

.TEXT
.BANK	BI
CORE0_B	= BI

	; START BY PROCESSING THE ARGUMENTS
START:	LOADI	A,0
	STORE	[DBANK],A
	
	; RESET ARG STATE
	STORE	[ARGC],A
	STORE	[LFLAG],A
	
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
	
	SUBI	A,'L'
	BRNZ	@+2
	LOADI	B,LFLAG
	
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
	
	LOADI	A,ERR0_B
	STORE	[ARG_BNK],A
	LOADI	A,ERROR00
	
	; PRINT ERROR MESSAGE
PRNTERR:LOADI	C,BI
	STOREF	[D+1],C
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
	ADDI	A,0
	BRZ	ARGBAD
	
	; RESET PASS TO FIRST
	LOADI	A,0
	STORE	[PASS],A
	
	; SET NEXT FREE TO HEAP
	LOADI	A,HEAP
	STORE	[NFREE],A
	
	; RESET EMIT LOGIC
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,EMIT0_B
	LOADI	C,EMINIT
	JUMP	INDIR
	
	; BEGIN ASSEMBLY
	LOADI	B,MAIN0_B
	LOADI	C,DOPASS
	JUMP	INDIR

	; EXIT PROGRAM
EXIT:	LOADI	B,S_EXIT
	JUMP	SYSJUMP
	
	; DO AN ERROR
	; A = ERROR #
ERRNO	= OPERAND
ERROR:	LOADI	B,0
	STORE	[DBANK],B
	STORE	[ERRNO],A
	LOADI	B,PRNT0_B
	LOADI	C,PERHEAD
	JUMP	INDIR

BI	= BI+1
.TEXT
.BANK	BI
PRNT0_B	= BI

	; PRINTS THE ERROR HEADER
	; THE CURRENTLY OPEN FILE AND LINE NUMBER WILL BE PRINTED
	; FORMAT: '[FILE]:[LINE]: ERROR'
PERHEAD:LOADI	C,BI
	STOREF	[D+1],C
	
	; PRINT CURRENTLY OPEN FILE
	LOAD	A,[CURRFIL]
	LOADF	A,[A+ARGV]

	; PRINT LOOP
0:	STORE	[BUFPNTR],A
	LOAD	B,[CMDL_B]
	STORE	[DBANK],B
	LOADF	A,[A]
	LOADI	B,0
	STORE	[DBANK],B
	LOADI	B,0X20
	CMP	A,B
	BRBE	1F
	LOADI	B,S_PUTC
	LOADI	C,@+2
	JUMP	SYSCALL
	LOAD	A,[BUFPNTR]
	ADDI	A,1
	JUMP	0B
	
	; PRINT ':'
1:	LOADI	A,':'
	LOADI	B,S_PUTC
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; PRINT LINE NUMBER
	LOAD	A,[LINENUM]
	STORE	[VALUE],A
	LOAD	A,[LINENUM+1]
	STORE	[VALUE+1],A
	LOADI	C,@+3
	STOREF	[D],C
	JUMP	PRINTD
	
	; PRINT ':' + SPACE
	LOADI	A,':'
	LOADI	B,S_PUTC
	LOADI	C,@+2
	JUMP	SYSCALL
	LOADI	A,0X20
	LOADI	B,S_PUTC
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; LOOKUP ERROR ON TABLE
	LOAD	A,[ERRNO]
	SUBI	A,0X80
	SHIFTL	A
	ADDI	A,ETABLE
	LOADI	C,ERR0_B
	STORE	[DBANK],C
	LOADF	B,[A]
	LOADF	A,[A+1]
	LOADI	C,0
	STORE	[DBANK],C
	STORE	[ARG_BNK],B
	LOADI	B,CORE0_B
	LOADI	C,PRNTERR
	JUMP	INDIR
	

	; PRINTS VARIABLE [VALUE] AS A 16 BIT BASE-10 NUMBER
PADDING	= TEMP
LEAFRET	= TEMP+1
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
0:	LOAD	C,[VALUE]
	LOAD	D,[VALUE+1]
	
	; DO 16 BIT SUBTRACTION
1:	SUB	D,B
	BRC	2F
	SUBI	C,1
	BRNC	4F
2:	SUB	C,A
	BRNC	4F
	
	; SAVE VALUE
	STORE	[VALUE],C
	STORE	[VALUE+1],D
	
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
	LOADI	C,BI
	STOREF	[D+1],C
	LOAD	C,[LEAFRET]
	JUMP	SYSCALL


	; ZERO BANK VARIABLES
.BANK	0
.BSS

	; COMMAND LINE ARGUMENTS
.DEFL BYTE ARGC		0
.DEFL BYTE ARGV		0,0,0,0,0,0,0,0,
			0,0,0,0,0,0

	; COMMAND LINE FLAGS
.DEFL BYTE LFLAG	0

	; VARIOUS MISC VARIABLES
	; TO BE USED IN LEAF-FUNCTIONS
.DEFL BYTE SPARK	0
.DEFL BYTE CHAR		0

	; 16 BIT MATH STUFF
.DEFL WORD VALUE	0
.DEFL WORD OPERAND	0
.DEFL WORD TEMP		0

	; EXPRESSION PARSING STUFF
.DEFL WORD ESTACK	0,0,0,0,0
.DEFL WORD VSTACK	0,0,0,0,0
.DEFL BYTE EINDEX	0
.DEFL BYTE VINDEX	0
.DEFL BYTE ISDEF	0
STACKSZ	= 5

	; LATEST TOKEN
.DEFL BYTE TOKEN	0

	; TOKEN STREAM STATE
.DEFL BYTE SRCINDX	0
.DEFL BYTE SRCBLK	0
.DEFL BYTE SRCBANK	0
.DEFL BYTE SRCPNTR	0
.DEFL BYTE SRCSTAT	0
.DEFL BYTE SRCCHAR	0
.DEFL WORD SRCLINE	0

	; TOKEN BUFFER
.DEFL BYTE BUFPNTR	0
.DEFL BYTE TBUF		0,0,0,0,0,0,0,0,0,0
.DEFL BYTE TBUFEND	0
	
	; ASSEMBLY STATE
.DEFL BYTE PASS		0
.DEFL WORD LINENUM	0
.DEFL BYTE CURRFIL	0
.DEFL BYTE COUNTER	0
.DEFL BYTE SEGMENT	0
.DEFL BYTE SELBANK	0
.DEFL BYTE CURBANK	0


	; OUTPUT STATE
.DEFL BYTE DIRTY	0
.DEFL BYTE FNEXT	0

	; SYMBOL STUFF
.DEFL BYTE NFREE	0
.DEFL WORD NUMLOC	0
.DEFL BYTE DFBANK	0
.DEFL BYTE DFPNTR	0

	; ERROR BANK 0
.BANK	BD
.DATA
ERR0_B	= BD

	; INVALID ARGUMENTS
.DEFL BYTE ERROR00	"INVALID ARGUMENTS",0X0A,0X0D,
			"USAGE: AS [-L] FILE1 FILE2 ...",0X0A,0X0D,0

	; ERROR TABLE
.DEFL BYTE ETABLE	ERR1_B,ERROR10,	; ERROR 0X80: CANNOT OPEN FILE 
			ERR1_B,ERROR11,	; ERROR 0X81: UNEXPECTED CHAR IN NUMERIC
			ERR1_B,ERROR12,	; ERROR 0X82: UNDEFINED EXPRESSION
			ERR1_B,ERROR13,	; ERROR 0X83: UNEXPECTED TOKEN
			ERR1_B,ERROR14,	; ERROR 0X84: VALUE STACK OVERFLOW
			ERR2_B,ERROR20,	; ERROR 0X85: EXPRESSION STACK OVERFLOW
			ERR2_B,ERROR21,	; ERROR 0X86: EXPRESSION STACK DEPLETION
			ERR2_B,ERROR22,	; ERROR 0X87: VALUE STACK DEPLETION
			ERR2_B,ERROR23,	; ERROR 0X88: PARENTHESIS MISMATCH
			ERR2_B,ERROR24,	; ERROR 0X89: DIVIDE BY ZERO
			ERR3_B,ERROR30,	; ERROR 0X8A: OUT OF MEMORY
			ERR3_B,ERROR31	; ERROR 0X8A: LOCAL OUT OF RANGE

	; ERROR VALUES
E_COPEN	= 0X80
E_UXNUM	= 0X81
E_UDEFX = 0X82
E_UXTOK	= 0X83
E_VSTKO = 0X84
E_ESTKO = 0X85
E_VSTKD	= 0X86
E_ESTKD = 0X87
E_PAREN = 0X88
E_DZERO	= 0X89
E_OMEM	= 0X8A
E_LOBIG	= 0X8B

BD	= BD+1	
	
	; ERROR BANK 1
.BANK	BD
.DATA
ERR1_B	= BD

.DEFL BYTE ERROR10	"CAN'T OPEN FILE",0X0A,0X0D,0
.DEFL BYTE ERROR11	"UNEXPECTED CHAR IN NUMERIC",0X0A,0X0D,0
.DEFL BYTE ERROR12	"UNDEFINED EXPRESSION",0X0A,0X0D,0
.DEFL BYTE ERROR13	"UNEXPECTED TOKEN",0X0A,0X0D,0
.DEFL BYTE ERROR14	"VALUE STACK OVERFLOW",0X0A,0X0D,0


BD	= BD+1

	; ERROR BANK 2
.BANK	BD
.DATA
ERR2_B	= BD

.DEFL BYTE ERROR20	"EXPRESSION STACK OVERFLOW",0X0A,0X0D,0
.DEFL BYTE ERROR21	"VALUE STACK DEPLETION",0X0A,0X0D,0
.DEFL BYTE ERROR22	"EXPRESSION STACK DEPLETION",0X0A,0X0D,0
.DEFL BYTE ERROR23	"PARENTHESIS MISMATCH",0X0A,0X0D,0
.DEFL BYTE ERROR24	"DIVIDE BY ZERO",0X0A,0X0D,0

BD	= BD+1

	; ERROR BANK 3
.BANK	BD
.DATA
ERR3_B	= BD

.DEFL BYTE ERROR30	"OUT OF MEMORY",0X0A,0X0D,0
.DEFL BYTE ERROR31	"LOCAL OUT OF RANGE",0X0A,0X0D,0

BD	= BD+1

	; GENERAL PURPOSE STRINGS
.BANK	BD
.DATA
STR_B	= BD

.DEFL BYTE AOUT		"AOUT.SV",0
.DEFL BYTE AOUTERR	"CANNOT CREATE AOUT.SV",0X0A,0X0D,0

BD	= BD+1

	; SOURCE READ BUFFER
.BANK	BD
.DATA
SRC_B	= BD

BD	= BD+4