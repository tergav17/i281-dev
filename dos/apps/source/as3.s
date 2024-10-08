; AS3.S
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

	; RESET ISDEF
	LOADI	A,0
	STORE	[ISDEF],A

	; RESET VALUE AND EXPRESSION STACKS
	LOADI	A,VSTACK
	STORE	[VINDEX],A
	LOADI	A,ESTACK
	STORE	[EINDEX],A
	
	; PROCESS TOKEN (VALUES AND LEFT PARENTHESIS)
	; ALSO SET RETURN ADDRESS
0:	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	A,0
	STORE	[VALUE],A
	LOAD	A,[TOKEN]

	; IS IT A NUMERIC?
	SUBI	A,NUMERIC
	BRNZ	7F
	
	; CHECK FOR LOCAL SYMBOLS
	LOAD	A,[TBUF+2]
	ADDI	A,0
	BRNZ	2F
	LOAD	A,[TBUF+1]
	SUBI	A,'B'
	BRZ	1F
	SUBI	A,'F'-'B'
	BRNZ	2F
	
	; WE ARE GOING FORWARDS
	LOADI	A,1
	
	; PROCESS LOCAL SYMBOL
1:	STORE	[CHAR],A
	LOAD	C,[NUMLOC]
	STORE	[OPERAND],C
	LOAD	C,[NUMLOC+1]
	STORE	[OPERAND+1],C
	
	; LOOK SYMBOL UP
	LOAD	A,[TBUF]
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,SYM0_B
	LOADI	C,GETLOC
	JUMP	INDIR
	
	; IS IT DEFINED?
	ADDI	A,0
	BRZ	8F
	STORE	[ISDEF],A
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

	; PROCESS SYMBOL
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,SYM0_B
	LOADI	C,GETSYM
	JUMP	INDIR
	
	; IS IT DEFINED?
	ADDI	A,0
	BRZ	8F
	STORE	[ISDEF],A
	JUMP	8F

	; IS IT A SINGLE QUOTE?
7:	SUBI	A,SQUOTE-SYMBOL
	BRNZ	7F
	
	; GET THE NEXT TOKEN
	LOADI	C,@+2
	JUMP	PARNEXT
	
	; SET IT AS THE VALUE
	LOAD	A,[TOKEN]
	STORE	[VALUE+1],A

	; CONSUME NEXT SINGLE QUOTE
	LOADI	C,@+2
	JUMP	PARNEXT
	
	; MAKE SURE IT IS A SINGLE QUOTE
	LOAD	A,[TOKEN]
	SUBI	A,SQUOTE
	BRZ	8F
	
	; ERROR!
	LOADI	A,E_UXTOK
	LOADI	B,CORE0_B
	LOADI	C,ERROR
	JUMP	INDIR

	; IS IT A '@'?
7:	SUBI	A,'@'-SQUOTE
	BRNZ	7F

	; PROCESS COUNTER
	LOAD	A,[COUNTER]
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
	
	; PLACE LEFT PARENTHESIS ON ESTACK
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
PARNEXT:STOREF	[D],C
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
	SUBI	A,SQUOTE-SYMBOL
	BRZ	0B
	SUBI	A,'@'-SQUOTE
	BRZ	0B
	SUBI	A,'('-'@'
	BRZ	0B
	
	; THIS IS SOME SORT OF OPERATION
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
	
	; PROCESS RIGHT PARENTHESIS
0:	LOAD	A,[EINDEX]
	LOADI	B,ESTACK
	CMP	A,B
	BRA	1F
	
	; ERROR! PARENTHESIS ARE MISMATCHED
	LOADI	A,E_PAREN
	LOADI	B,CORE0_B
	LOADI	C,ERROR
	JUMP	INDIR
	
	; CHECK TOP OF ESTACK
1:	LOADF	B,[A+0-2]
	SUBI	B,'('
	BRZ	2F
	
	; POP OFF OF ESTACK
	LOADI	C,0B
	STOREF	[D],C
	LOADI	B,EXP3_B
	LOADI	C,ESTKPOP
	JUMP	INDIR

	; DO FINAL POP AND EXIT
2:	SUBI	A,2
	STORE	[EINDEX],A
	JUMP	6F
	
	; CHECK FOR SHIFTS
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
	BRA	5F
	
	; POP OFF OF ESTACK
	LOADI	C,0B
	STOREF	[D],C
	LOADI	B,EXP3_B
	LOADI	C,ESTKPOP
	JUMP	INDIR
	
	; PUSH ONTO ESTACK
5:	LOADI	B,EXP1_B
	LOADI	C,PARSEXB
	JUMP	INDIR

	; GET THE NEXT TOKEN
6:	LOADI	B,EXP1_B
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
	LOAD	A,[ISDEF]
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
	
	; ARE WE DEFINED?
	LOAD	A,[ISDEF]
	ADDI	A,0
	BRNZ	8F
	
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
	
	; DO SUBTRACTION OPERATION
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
	BRNZ	7F
	
	; DO MULTIPLICATION OPERATION
	STORE	[SPARK],D
	LOAD	C,[VALUE]
	LOAD	D,[VALUE+1]
	LOADI	A,0
	STORE	[VALUE],A
	STORE	[VALUE+1],A
	
	; ARE WE DONE YET?
0:	ADDI	C,0
	BRNZ	1F
	ADDI	D,0
	BRNZ	1F
	LOAD	D,[SPARK]
	JUMP	8F
	
	; SHIFT 'CD' RIGHT
	; IF BIT ZERO OF D IS NOT SET, THEN SKIP ADDING
	; [OPERAND] TO [VALUE]
1:	SHIFTR	D
	BRC	3F
	SHIFTR	C
	BRNC	6F
	ADDI	D,0X80
2:	JUMP	6F
3:	SHIFTR	C
	BRNC	4F
	ADDI	D,0X80

	; ADD [OPERAND] TO [VALUE]
4:	LOAD	A,[VALUE+1]
	LOAD	B,[OPERAND+1]
	ADD	A,B
	STORE	[VALUE+1],A
	LOAD	A,[VALUE]
	LOAD	B,[OPERAND]
	BRNC	5F
	ADDI	A,1
5:	ADD	A,B
	STORE	[VALUE],A

	; SHIFT [OPERAND] LEFT
6:	LOAD	A,[OPERAND+1]
	SHIFTL	A
	STORE	[OPERAND+1],A
	LOAD	A,[OPERAND]
	BRNC	6F
	SHIFTL	A
	ADDI	A,1
	STORE	[OPERAND],A
	JUMP	0B
6:	SHIFTL	A
	STORE	[OPERAND],A
	JUMP	0B

	; SWITCH INSTRUCTION BANK
7:	LOADI	B,EXP4_B
	LOADI	C,ESTKPOA
	JUMP	INDIR

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
	
BI	= BI+1
.TEXT
.BANK	BI
EXP4_B	= BI

	; CONTINUATION OF ESTKPOP
	; CHECK FOR DIVISION OR MODULUS
ESTKPOA:SUBI	A,'/'-'*'
	BRZ	0F
	SUBI	A,'%'-'/'
	BRNZ	7F
	
	; MAKE SURE OPERAND ISN'T ZERO
DVCOUNT	= CHAR
0:	LOAD	A,[OPERAND]
	ADDI	A,0
	BRNZ	0F
	LOAD	A,[OPERAND+1]
	ADDI	A,0 
	BRNZ	0F

	; ERROR! DIVIDE BY ZERO
	LOADI	A,E_DZERO
	JUMP	9F
	
	; DO DIVISION
0:	STORE	[SPARK],D
	
	; RESET REMAINDER
	LOADI	C,0
	LOADI	D,0

	; RESET COUNTER
	LOADI	A,16

	; SHIFT QUOTIENT LEFT
	; MAIN DIVISOR LOOP
0:	STORE	[DVCOUNT],A
	LOAD	A,[VALUE+1]
	SHIFTL	A
	STORE	[VALUE+1],A
	LOAD	A,[VALUE]
	BRNC	2F
	SHIFTL	A
	BRC	1F
	ADDI	A,1
	STORE	[VALUE],A
	JUMP	3F
1:	ADDI	A,1
	SUBI	A,0
	STORE	[VALUE],A 
	JUMP	3F
2:	SHIFTL	A
	STORE	[VALUE],A
	
	; SHIFT REMAINDER LEFT + CARRY
3:	BRC	1F
	SHIFTL	D
	JUMP	3F 
	
	; SHIFT BOTTOM 8 BITS (SHIFT IN)
1:	SHIFTL	D
	BRC	2F
	ADDI	D,1
	JUMP	3F
2:	ADDI	D,1
	SUBI	D,0

	; DO TOP 8 BITS
3:	BRC	1F
	SHIFTL	C
	JUMP	3F 
	
	; SHIFT TOP 8 BITS (SHIFT IN)
1:	SHIFTL	C
	BRC	2F
	ADDI	C,1
	JUMP	3F
2:	ADDI	C,1
	SUBI	C,0
	
	; SUBTRACT BY DIVISOR ([OPERAND])
3:	LOAD	A,[OPERAND+1]
	SUB	D,A
	LOAD	A,[OPERAND]
	BRC	1F
	
	; SUBTRACT THE CARRY
	SUBI	C,1
	BRC	1F
	SUB	C,A
	ADDI	A,0
	JUMP	2F
	
1:	SUB	C,A

	; IF CARRY IS SET, SKIP ADD AND INCREMENT 
2:	BRC	2F

	; ADD DIVISOR TO REMAINDER
	LOAD	A,[OPERAND+1]
	ADD	D,A
	BRNC	1F
	ADDI	C,1
1:	LOAD	A,[OPERAND]
	ADD	C,A
	JUMP	3F
	
	; INCREMENT [VALUE+1]
2:	LOAD	A,[VALUE+1]
	ADDI	A,1
	STORE	[VALUE+1],A
	
	; DECREMENT COUNTER
3:	LOAD	A,[DVCOUNT]
	SUBI	A,1
	BRNZ	0B

	; DONE, REGRAB THE OPERATION
6:	LOAD	A,[EINDEX]
	LOADF	A,[A]
	SUBI	A,'/'
	BRZ	6F
	
	; SET [VALUE] TO REMAINDER
	STORE	[VALUE],C
	STORE	[VALUE+1],D

	; RESTORE STACK
6:	LOAD	D,[SPARK]
	JUMP	8F

	; SWITCH INSTRUCTION BANK
7:	LOADI	B,EXP5_B
	LOADI	C,ESTKPOB
	JUMP	INDIR

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
	
BI	= BI+1
.TEXT
.BANK	BI
EXP5_B	= BI

	; CONTINUATION OF ESTKPOP
	; CHECK FOR RIGHT SHIFT
ESTKPOB:SUBI	A,'>'-'%'
	BRNZ	7F
	
	; GET THE COUNT
	LOAD	C,[OPERAND]
	ADDI	C,0
	LOADI	B,16
	BRNZ	0F
	LOAD	C,[OPERAND+1]
	CMP	B,C
	BRBE	0F
	MOV	B,C

	; CHECK COUNTER
0:	ADDI	B,0
	BRZ	8F
	
	; SHIFT [VALUE] RIGHT
	LOAD	A,[VALUE]
	SHIFTR	A
	STORE	[VALUE],A
	LOAD	A,[VALUE+1]
	BRNC	1F
	SHIFTR	A
	ADDI	A,0X80
	STORE	[VALUE+1],A
	JUMP	2F
1:	SHIFTR	A
	STORE	[VALUE+1],A
	
	; CHECK FOR LEFT SHIFT
7:	SUBI	A,'<'-'>'
	BRNZ	7F
	
	; GET THE COUNT
	LOAD	C,[OPERAND]
	ADDI	C,0
	LOADI	B,16
	BRNZ	0F
	LOAD	C,[OPERAND+1]
	CMP	B,C
	BRBE	0F
	MOV	B,C

	; CHECK COUNTER
0:	ADDI	B,0
	BRZ	8F
	
	; SHIFT [VALUE] LEFT
	LOAD	A,[VALUE+1]
	SHIFTL	A
	STORE	[VALUE+1],A
	LOAD	A,[VALUE]
	BRNC	1F
	SHIFTL	A
	ADDI	A,1
	STORE	[VALUE],A
	JUMP	2F
1:	SHIFTL	A
	STORE	[VALUE],A

2:	SUBI	B,1
	JUMP	0B
	
	; CHECK FOR LOGICAL AND
7:	SUBI	A,'&'-'<'
	BRNZ	7F
	
	; DO LOGICAL AND BETWEEN [VALUE] AND [OPERAND]
	LOAD	A,[VALUE]
	LOAD	B,[OPERAND]
	LOADI	C,8
	
0:	SHIFTL	A
	BRNC	1F
	SHIFTL	B
	BRNC	2F
	ADDI	A,1
	JUMP	2F
1:	SHIFTL	B
2:	SUBI	C,1
	BRNZ	0B
	STORE	[VALUE],A
	
	; DO LOGICAL AND BETWEEN [VALUE+1] AND [OPERAND+1]
	LOAD	A,[VALUE+1]
	LOAD	B,[OPERAND+1]
	LOADI	C,8
	
0:	SHIFTL	A
	BRNC	1F
	SHIFTL	B
	BRNC	2F
	ADDI	A,1
	JUMP	2F
1:	SHIFTL	B
2:	SUBI	C,1
	BRNZ	0B
	STORE	[VALUE+1],A
	JUMP	8F
	
	; CHECK FOR LOGICAL OR
7:	SUBI	A,'|'-'&'
	BRNZ	7F
	
	; DO LOGICAL OR BETWEEN [VALUE] AND [OPERAND]
	LOAD	A,[VALUE]
	LOAD	B,[OPERAND]
	LOADI	C,8
	
0:	SHIFTL	A
	BRNC	1F
	SHIFTL	B
	ADDI	A,1
	JUMP	2F
1:	SHIFTL	B
	BRNC	2F
	ADDI	A,1
2:	SUBI	C,1
	BRNZ	0B
	STORE	[VALUE],A

	; DO LOGICAL OR BETWEEN [VALUE+1] AND [OPERAND+1]
	LOAD	A,[VALUE+1]
	LOAD	B,[OPERAND+1]
	LOADI	C,8
	
0:	SHIFTL	A
	BRNC	1F
	SHIFTL	B
	ADDI	A,1
	JUMP	2F
1:	SHIFTL	B
	BRNC	2F
	ADDI	A,1
2:	SUBI	C,1
	BRNZ	0B
	STORE	[VALUE+1],A
	JUMP	8F
	
	; SWITCH INSTRUCTION BANK
7:	LOADI	B,EXP6_B
	LOADI	C,ESTKPOC
	JUMP	INDIR

	; PLACE [VALUE] ON STACK AND RETURN
8:	LOAD	A,[VINDEX]
	LOAD	B,[VALUE+1]
	STOREF	[A+0-1],B
	LOAD	B,[VALUE]
	STOREF	[A+0-2],B
	JUMP	IRET
	
BI	= BI+1
.TEXT
.BANK	BI
EXP6_B	= BI

	; CONTINUATION OF ESTKPOP
	; CHECK FOR XOR
ESTKPOC:SUBI	A,'^'-'|'
	BRNZ	7F
	
	; DO LOGICAL XOR BETWEEN [VALUE] AND [OPERAND]
	LOAD	A,[VALUE]
	LOAD	B,[OPERAND]
	LOADI	C,8
	
0:	SHIFTL	A
	BRNC	1F
	SHIFTL	B
	BRC	2F
	ADDI	A,1
	JUMP	2F
1:	SHIFTL	B
	BRNC	2F
	ADDI	A,1
2:	SUBI	C,1
	BRNZ	0B
	STORE	[VALUE],A
	
	; DO LOGICAL XOR BETWEEN [VALUE+1] AND [OPERAND+1]
	LOAD	A,[VALUE+1]
	LOAD	B,[OPERAND+1]
	LOADI	C,8
	
0:	SHIFTL	A
	BRNC	1F
	SHIFTL	B
	BRC	2F
	ADDI	A,1
	JUMP	2F
1:	SHIFTL	B
	BRNC	2F
	ADDI	A,1
2:	SUBI	C,1
	BRNZ	0B
	STORE	[VALUE+1],A
	JUMP	8F
	
	; CHECK FOR NOT-OR
7:	SUBI	A,'!'-'^'
	BRNZ	7F
	
	; DO LOGICAL NOT-OR BETWEEN [VALUE] AND [OPERAND]
	LOAD	A,[VALUE]
	LOAD	C,[OPERAND]
	LOADI	B,0XFF
	SUB	B,C
	LOADI	C,8
	
0:	SHIFTL	A
	BRNC	1F
	SHIFTL	B
	ADDI	A,1
	JUMP	2F
1:	SHIFTL	B
	BRNC	2F
	ADDI	A,1
2:	SUBI	C,1
	BRNZ	0B
	STORE	[VALUE],A

	; DO LOGICAL NOT-OR BETWEEN [VALUE+1] AND [OPERAND+1]
	LOAD	A,[VALUE+1]
	LOAD	C,[OPERAND+1]
	LOADI	B,0XFF
	SUB	B,C
	LOADI	C,8
	
0:	SHIFTL	A
	BRNC	1F
	SHIFTL	B
	ADDI	A,1
	JUMP	2F
1:	SHIFTL	B
	BRNC	2F
	ADDI	A,1
2:	SUBI	C,1
	BRNZ	0B
	STORE	[VALUE+1],A
	JUMP	8F
	
	; ENSURE THIS ISN'T A LEFT PARENTHESIS
7:	SUBI	A,'('-'!'
	BRNZ	8F	; IDK WHAT IT IS AT THIS POINT
	
	; ERROR! PARENTHESIS ARE MISMATCHED
	LOADI	A,E_PAREN
	LOADI	B,CORE0_B
	LOADI	C,ERROR
	JUMP	INDIR

	; PLACE [VALUE] ON STACK AND RETURN
8:	LOAD	A,[VINDEX]
	LOAD	B,[VALUE+1]
	STOREF	[A+0-1],B
	LOAD	B,[VALUE]
	STOREF	[A+0-2],B
	JUMP	IRET