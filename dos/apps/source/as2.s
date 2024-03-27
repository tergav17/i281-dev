; AS2.S
; EXPRESSION HANDLING
; GAVIN TERSTEEG, 2024
; SDMAY24-14

BI	= BI+1
.TEXT
.BANK	BI
EXP0_B	= BI

	; PARSE AN EXPRESSION
	; THE FIRST PART OF THE EXPRESSION SHOULD BE IN THE TOKEN BUFFER
	; IF PARSING IS SUCCESSFUL, THE RESULT WILL BE PLACED IN [VALUE]
	; IF A SYMBOL IS UNDEFINED, AN ERROR CODE WILL BE RETURNED IN
	; REGISTER A, OTHERWISE A = 0X00 WILL BE RETURNED.
PRECED	= CHAR
PARSEX: LOADI	B,EXP1_B
	LOADI	C,PARSEXA
	JUMP	INDIR

	; PARSE A NUMERIC VALUE
	; THE NUMERIC TO BE PARSED SHOULD BE IN THE TOKEN BUFFER
	; IF THE PARSING IS SUCCESSFUL, THE RESULT WILL BE PLACED IN [VALUE]
	; DEFAULT RADIX IS 10
RADIX	= TEMP
PARSEN:	LOADI	A,10
	STORE	[RADIX],A
	
	; RESET VALUE AS WELL
	LOADI	A,0
	STORE	[VALUE],A
	STORE	[VALUE+1],A
	
	; RESET BUFFER POINTER
	LOADI	A,TBUF
	
	; DETECT LEADING ZERO
	LOADF	B,[A]
	ADDI	B,0
	BRZ	IRET
	SUBI	B,'0'
	BRNZ	1F
	
	; SET RADIX TO 8
	LOADI	B,8
	STORE	[RADIX],B
	
	; GET NEXT CHARACTER, COMPARE WITH 9
	ADDI	A,1
	LOADF	B,[A]
	LOADI	C,'9'
	CMP	B,C
	BRBE	1F
	
	; RADIX FORMAT IS "0?..."
	ADDI	A,1
	JUMP	4F
	
	; CHECK END OF NUMBER FOR RADIX
1:	MOV	C,A
2:	LOADF	B,[C]
	ADDI	B,0
	BRZ	3F
	ADDI	C,1
	JUMP	2B
	
	; LOOK AT LAST CHARACTER
3:	LOADF	B,[C+0-1]
	SUBI	B,'9'
	BRBE	0F
	ADDI	B,'9'
	STORE	[BUFPNTR],A
	LOADI	A,0
	STOREF	[C+0-1],A
	LOAD	A,[BUFPNTR]

	; B = POTENTIAL RADIX
4:	LOADI	C,16
	SUBI	B,'X'
	BRZ	5F
	SUBI	B,'H'-'X'
	BRZ	5F
	LOADI	C,8
	SUBI	B,'O'-'H'
	BRZ	5F
	LOADI	C,2
	SUBI	B,'B'-'O'
	BRZ	5F
	
	; ISSUE WITH PARSING NUMERIC
8:	LOADI	A,E_UXNUM
	LOADI	B,CORE0_B
	LOADI	C,ERROR
	JUMP	INDIR
	
	; C = RADIX
5:	STORE	[RADIX],C
	
	; START PARSING THE NUMERIC
0:	STORE	[BUFPNTR],A
	
	; GRAB A CHARACTER
	LOADF	A,[A]
	ADDI	A,0
	BRZ	IRET
	
	; MULTIPLY BY RADIX (SLOWISH)
	STORE	[SPARK],D
	LOAD	B,[VALUE]
	LOAD	C,[VALUE+1]
	LOAD	D,[RADIX]
	
1:	SUBI	D,1
	BRZ	3F
	LOAD	A,[VALUE+1]
	ADD	A,C
	STORE	[VALUE+1],A
	LOAD	A,[VALUE]
	BRNC	2F
	ADDI	A,1
2:	ADD	A,B
	STORE	[VALUE],A
	JUMP	1B
	
	; GET THE CHARACTER AGAIN, AND INCREMENT POINTER
3:	LOAD	D,[SPARK]
	LOAD	A,[BUFPNTR]
	LOADF	C,[A]
	ADDI	A,1
	
	; CHECK BOUNDS
	LOADI	B,'0'
	CMP	C,B
	BRB	8B 
	LOADI	B,'9'
	CMP	C,B
	BRBE	4F
	
	LOADI	B,'A'
	CMP	C,B
	BRB	8B
	LOADI	B,'F'
	CMP	C,B
	BRA	8B
	
	SUBI	C,'A'-('0'+10)
	
	; CONVERT FROM ASCII
4:	SUBI	C,'0'

	; COMPARE WITH RADIX
	LOAD	B,[RADIX]
	CMP	C,B
	BRAE	8B
	
	; ADD TO VALUE
	LOAD	B,[VALUE+1]
	ADD	B,C
	STORE	[VALUE+1],B
	BRNC	0B
	LOAD	B,[VALUE]
	ADDI	B,1
	STORE	[VALUE],B
	JUMP	0B

BI	= BI+1
.TEXT
.BANK	BI
EXP1_B	= BI

	; SHADOW OF PARSEX
PARSEXA:SUBI	D,2

	; RESET VALUE AND EXPRESSION STACKS
	LOADI	A,VSTACK
	STORE	[VINDEX],A
	LOADI	A,ESTACK
	STORE	[EINDEX],A
	
	; PROCESS TOKEN (VALUES AND LEFT PARATHESIS)
	; ALSO SET RETURN ADDRESS
0:	LOADI	C,BI
	STOREF	[D+1],C
	LOAD	A,[TOKEN]

	; IS IT A NUMERIC?
	SUBI	A,NUMERIC
	BRNZ	7F
	
	; CHECK FOR LOCAL SYMBOLS
	LOAD	A,[TBUF+2]
	ADDI	A,0
	BRNZ	2F
	LOAD	A,[TBUF+1]
	SUBI	A,'F'
	BRZ	1F
	SUBI	A,'B'-'F'
	BRNZ	2F

	; TODO: PROCESS LOCAL SYMBOL
1:	LOADI	A,0
	STORE	[VALUE],A
	STORE	[VALUE+1],A
	JUMP	8F

	; PARSE NUMERIC
2:	LOADI	C,8F
	STOREF	[D],C
	LOADI	B,EXP0_B
	LOADI	C,PARSEN
	JUMP	INDIR
	
	; IS IT A SYMBOL?
7:	SUBI	A,SYMBOL-NUMERIC
	BRNZ	7F

	; TODO: PROCESS SYMBOL
	LOADI	A,0
	STORE	[VALUE],A
	STORE	[VALUE+1],A
	JUMP	8F

	; IS IT A '@'?
7:	SUBI	A,'@'-SYMBOL
	BRNZ	7F

	; TODO: PROCESS POINTER
	LOADI	A,0
	STORE	[VALUE],A
	STORE	[VALUE+1],A

	; PLACE [VALUE] ONTO THE VSTACK
8:	LOAD	B,[VINDEX]
	LOADI	A,VSTACK+STACKSZ
	CMP	B,A
	LOADI	A,E_VSTKO
	BRAE	8F	; ERROR!
	LOAD	A,[VALUE]
	STOREF	[B],A
	LOAD	A,[VALUE+1]
	STOREF	[B+1],A
	ADDI	B,2
	STORE	[VINDEX],B
	JUMP	PARSEXC
	
	; IS IT A '('?
7:	SUBI	A,'('-'@'
	BRNZ	7F
	
	STORE	[PRECED],A
	
	; PLACE LEFT PARATHESIS ON ESTACK
PARSEXB:LOAD	B,[EINDEX]
	LOADI	A,ESTACK+STACKSZ
	CMP	B,A
	LOADI	A,E_ESTKO
	BRAE	8F	; ERROR!
	LOAD	A,[TOKEN]
	STOREF	[B],A
	LOAD	A,[PRECED]
	STOREF	[B+1],A
	ADDI	B,2
	STORE	[EINDEX],B
	JUMP	PARSEXC
	
	; ERROR!
7:	LOADI	A,E_UXTOK
8:	LOADI	B,CORE0_B
	LOADI	C,ERROR
	JUMP	INDIR

	; GET THE NEXT TOKEN
PARSEXC:LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,TOK0_B
	LOADI	C,NEXTTOK
	JUMP	INDIR
	
	; LOOK FOR SPECIAL VALUES
	LOAD	A,[TOKEN]
	STORE	[CHAR],A
	SUBI	A,NUMERIC
	BRZ	0B
	SUBI	A,SYMBOL-NUMERIC
	BRZ	0B
	SUBI	A,'@'-SYMBOL
	BRZ	0B
	SUBI	A,'('-'@'
	BRZ	0B
	
	; THIS IS SOME SORT OPERATION
	LOADI	B,EXP2_B
	LOADI	C,PARSEXD
	JUMP	INDIR

BI	= BI+1
.TEXT
.BANK	BI
EXP2_B	= BI

	; HANDLE OTHER CHARACTERS IN EXPRESSION
	; ALSO GET PRECEDENCE OF CHARACTER
PARSEXD:LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,2
	SUBI	A,'+'-'('
	BRZ	5F
	SUBI	A,'-'-'+'
	BRZ	5F
	LOADI	C,3
	SUBI	A,'*'-'-'
	BRZ	5F
	SUBI	A,'/'-'*'
	BRZ	5F
	SUBI	A,'%'-'/'
	BRZ	5F
	LOADI	C,7
	SUBI	A,'|'-'%'
	BRZ	5F
	LOADI	C,5
	SUBI	A,'&'-'|'
	BRZ	5F
	LOADI	C,1
	SUBI	A,'!'-'&'
	BRZ	5F
	LOADI	C,6
	SUBI	A,'^'-'!'
	BRZ	5F
	SUBI	A,')'-'^'
	BRNZ	3F
	
	; TODO: PROCESS RIGHT PARATHESIS
	
3:	SUBI	A,'>'-')'
	BRZ	4F
	SUBI	A,'<'-'>'
	BRNZ	9F

	; IT'S A '<<' OR '>>' (HOPEFULLY)
	; GET THE NEXT TOKEN TO CONFIRM
4:	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,TOK0_B
	LOADI	C,NEXTTOK
	JUMP	INDIR
	
	; IF THE NEXT TOKEN IS THE SAME AS THE LAST, WE ARE GOOD
	LOAD	A,[TOKEN]
	LOAD	B,[CHAR]
	CMP	A,B
	LOADI	C,4
	BRZ	5F
	
	; BOO! ERROR!
	LOADI	A,E_UXTOK
	LOADI	B,CORE0_B
	LOADI	C,ERROR
	JUMP	INDIR

	; WE HAVE A SPECIAL CHARACTER
	; C = PRECEDENCE
5:	STORE	[PRECED],C
	
	; CHECK EINDEX
0:	LOAD	A,[EINDEX]
	LOADI	B,ESTACK
	CMP	A,B
	BRZ	5F

	; COMPARE PRECEDENCE OF THE TOP OF THE ESTACK WITH OP PRECEDENCE
	LOADF	B,[A+0-1]
	LOAD	A,[PRECED]
	CMP	A,B
	BRB	5F
	
	; POP OFF OF ESTACK
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,EXP3_B
	LOADI	C,ESTKPOP
	JUMP	INDIR
	
	; PUSH ONTO ESTACK
5:	LOADI	B,EXP1_B
	LOADI	C,PARSEXB
	JUMP	INDIR

	; GET THE NEXT TOKEN
	LOADI	B,EXP1_B
	LOADI	C,PARSEXC
	JUMP	INDIR
	
	; CAN'T RECOGNIZE CHARACTER, END OF EXPRESSION
	; AND WE ARE DONE
9:	LOAD	A,[EINDEX]
	LOADI	B,ESTACK
	CMP	A,B
	BRZ	0F
	
	; POP OFF THE EXPRESSION STACK
	LOADI	C,9B
	STOREF	[D],C
	LOADI	B,EXP3_B
	LOADI	C,ESTKPOP
	JUMP	INDIR
	
	; ESTACK IS EMPTY
	; MAKE SURE THERE IS 1 IN VSTACK
0:	LOAD	A,[VINDEX]
	LOADI	B,VSTACK+2
	CMP	A,B
	BRZ	1F

	; ERROR :(
	LOADI	A,E_VSTKO
	LOADI	B,CORE0_B
	LOADI	C,ERROR
	JUMP	INDIR

	; SET RESULT TO VALUE
1:	LOADF	C,[A+0-1]
	LOADF	B,[A+0-2]
	STORE	[VALUE],B
	STORE	[VALUE+1],C

	; RETURN
	LOADI	A,0
	ADDI	D,2
	JUMP	IRET

BI	= BI+1
.TEXT
.BANK	BI
EXP3_B	= BI

	; POP A VALUE OFF OF THE ESTACK
	; CHECK IF EXPRESSION STACK IS EMPTY
ESTKPOP:LOADI	A,E_ESTKD
	LOAD	B,[EINDEX]
	LOADI	C,ESTACK
	CMP	B,C
	BRBE	9F
	
	; POP VALUE OFF ESTACK
	SUBI	B,2
	STORE	[EINDEX],B
	
	; CHECK IF VALUE STACK HAS TWO VALUES
	LOADI	A,E_VSTKD
	LOAD	B,[VINDEX]
	LOADI	C,VSTACK+2
	CMP	B,C
	BRBE	9F

	; MOVE TWO VSTACK VALUES INTO [VALUE] AND [OPERAND]
	LOADF	A,[B+0-1]
	STORE	[OPERAND+1],A
	LOADF	A,[B+0-2]
	STORE	[OPERAND],A
	LOADF	A,[B+0-3]
	STORE	[VALUE+1],A
	LOADF	A,[B+0-4]
	STORE	[VALUE],A
	
	; RESPOSITION VSTACK POINTER
	SUBI	B,2
	STORE	[VINDEX],B
	
	; GRAB THE OPERATION
	LOAD	A,[EINDEX]
	LOADF	A,[A]
	
	; CHECK FOR ADDITION '+'
	SUBI	A,'+'
	BRNZ	7F
	
	; DO ADDITION OPERATION
	LOAD	A,[VALUE+1]
	LOAD	B,[OPERAND+1]
	ADD	A,B
	STORE	[VALUE+1],A
	LOAD	A,[VALUE]
	LOAD	B,[OPERAND]
	BRNC	1F
	ADDI	A,1
1:	ADD	A,B
	STORE	[VALUE],A
	JUMP	8F
	
	; CHECK FOR SUBTRACTION '-'
7:	SUBI	A,'-'-'+'
	BRNZ	7F
	
	; DO ADDITION OPERATION
	LOAD	A,[VALUE+1]
	LOAD	B,[OPERAND+1]
	SUB	A,B
	STORE	[VALUE+1],A
	LOAD	A,[VALUE]
	LOAD	B,[OPERAND]
	BRC	1F
	SUBI	A,1
1:	SUB	A,B
	STORE	[VALUE],A
	JUMP	8F
	
	; CHECK FOR MULTIPLICATION
7:	SUBI	A,'*'-'-'
	BRNZ	8F
	
	 

	; PLACE [VALUE] ON STACK AND RETURN
8:	LOAD	A,[VINDEX]
	LOAD	B,[VALUE+1]
	STOREF	[A+0-1],B
	LOAD	B,[VALUE]
	STOREF	[A+0-2],B
	JUMP	IRET

	; HANDLE ERROR
9:	LOADI	B,CORE0_B
	LOADI	C,ERROR
	JUMP	INDIR
