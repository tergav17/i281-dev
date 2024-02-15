; ED1.S
; SIMPLE TEXT EDITOR
; USER AND LINE OPERATIONS

.TEXT
.BANK	BI
UOP0_B	= BI


	; APPENDS LINES INTO THE TEXT BUFFER
APPEND:	LOADI	B,UOP3_B
	LOADI	C,APPENDA
	JUMP	INDIR

	; EXECUTE A FILE READ
DOFREAD:LOADI	B,UOP2_B
	LOADI	C,DOFREAA
	JUMP	INDIR

	; SET EDITING FILE
SETFILE:LOAD	A,[STATE]
	ADDI	A,0
	BRNZ	9F
	
	; SAVE STACK (IF NEEDED)
	STORE	[SPARK],D
	
	; GET NEXT CHARACTER
	LOAD	C,[POINTER]
	LOADI	B,BUF_B
	STORE	[DBANK],B
	LOADF	A,[C]
	ADDI	C,1
	
	; SEE IF IT IS A SPACE
	LOADI	B,0X20
	CMP	A,B
	BRNZ	9F
	LOADF	A,[C]
	CMP	A,B
	BRBE	9F
	
	; COPY THE FILE NAME OVER
	LOADI	D,FNAME
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
	LOADI	B,BUF_B
	STORE	[DBANK],B
	JUMP	0B
	
	; TERMINATE STRING
1:	LOADI	A,0
	STOREF	[D],A
	LOAD	D,[SPARK]
	
	; GO BACK TO COMMAND LINE
8:	LOADI	B,CMD0_B
	LOADI	C,PROMPT
	JUMP	INDIR
	
	; ERROR
9:	LOADI	B,0
	STORE	[DBANK],B
	LOADI	B,CMD0_B
	LOADI	C,ERROR
	JUMP	INDIR

	; PRINT LINES
	; REQUIRES 1 OR 2 ARGUMENTS
PRINTL:	LOADI	B,UOP1_B
	LOADI	C,PRINTLA
	JUMP	INDIR

	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
.TEXT
.BANK	BI
UOP1_B	= BI

	; SHADOW OF PRINTL
PRINTLA:LOAD	A,[STATE]
	SUBI	A,1
	BRN	9F
	BRNZ	1F
	
	; SET ARGB = ARGA
	LOAD	A,[ARGA]
	LOAD	B,[ARGA+1]
	STORE	[ARGB],A
	STORE	[ARGB+1],B
	
	; ENSURE ARGA >= ARGB
1:	LOAD	A,[ARGA]
	LOAD	B,[ARGB]
	CMP	A,B
	BRB	9F
	BRA	2F
	LOAD	A,[ARGA+1]
	LOAD	B,[ARGB+1]
	CMP	A,B
	BRB	9F
	
	; START LOOKING FOR THE LINE
	; TEMP = ARGB
2:	LOAD	A,[ARGB]
	LOAD	B,[ARGB+1]
	STORE	[TEMP],A
	STORE	[TEMP+1],B
	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,LOP0_B
	LOADI	C,FINDL
	JUMP	INDIR
	ADDI	A,0
	BRNZ	9F
	
	; START PRINTING OFF LINES
3:	LOAD	C,[CBLOCK]
	LOAD	B,[MB_PNTR]
	STORE	[DBANK],C
	LOADF	A,[B]
	LOADI	C,0
	STORE	[DBANK],C
	
	; IS IT ZERO OR NEGATIVE
	ADDI	A,0
	BRN	5F
	BRZ	6F
	
	; PRINT THE CHARACTER
	LOADI	B,S_PUTC
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; NEXT CHARACTER
4:	LOAD	B,[MB_PNTR]
	LOAD	C,[MB_END]
	ADDI	B,1
	STORE	[MB_PNTR],B
	CMP	B,C
	BRNZ	3B
	
	; NEXT BLOCK
5:	LOAD	A,[CBLOCK]
	LOAD	B,[CBLOCK+1]
	STORE	[DBANK],A
	LOADF	A,[B]
	LOADF	B,[B+1]
	LOADI	C,0
	STORE	[DBANK],C
	
	; MAKE SURE IT ISN'T ZERO
	ADDI	A,0
	BRZ	8F
	
	; SET CBLOCK AND UPDATE MB_PNTR AND MB_END
	STORE	[CBLOCK],A
	STORE	[CBLOCK+1],B
	ADDI	B,3
	STORE	[MB_PNTR],B
	ADDI	B,32-3
	STORE	[MB_END],B
	JUMP	3B

	; START OF A NEW LINE
	; ENSURE ARGA >= ARGB
6:	LOAD	A,[ARGA]
	LOAD	B,[ARGB]
	CMP	A,B
	BRB	8F
	BRA	7F
	LOAD	A,[ARGA+1]
	LOAD	B,[ARGB+1]
	CMP	A,B
	BRB	8F
	
	; INCREMENT ARGB
7:	LOAD	A,[ARGB+1]
	ADDI	A,1
	STORE	[ARGB+1],A
	BRNC	7F
	LOAD	A,[ARGB]
	ADDI	A,1
	STORE	[ARGB],A
	BRC	8F
	
	; PRINT CR/LF
7:	LOADI	A,0X0A
	LOADI	B,S_PUTC
	LOADI	C,@+2
	JUMP	SYSCALL
	LOADI	A,0X0D
	LOADI	B,S_PUTC
	LOADI	C,4B
	JUMP	SYSCALL
	
	; GO BACK TO COMMAND LINE
8:	LOADI	B,CMD0_B
	LOADI	C,PROMPT
	JUMP	INDIR
	
	; ERROR
9:	LOADI	B,CMD0_B
	LOADI	C,ERROR
	JUMP	INDIR
	
	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
.TEXT
.BANK	BI
UOP2_B	= BI
	
	; SHADOW OF DOFREAD
DOFREAA:LOAD	A,[STATE]
	ADDI	A,0
	BRNZ	9F

	; READ THE FILE
	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,FIO0_B
	LOADI	C,FREAD
	JUMP	INDIR
	
	; CHECK FOR ERRORS
	ADDI	A,0
	BRN	9F

	; GO BACK TO COMMAND LINE
8:	LOADI	B,CMD0_B
	LOADI	C,PROMPT
	JUMP	INDIR

	; ERROR
9:	LOADI	B,CMD0_B
	LOADI	C,ERROR
	JUMP	INDIR
	
	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
.TEXT
.BANK	BI
UOP3_B	= BI

	; SHADOW OF APPEND
APPENDA:LOAD	A,[STATE]
	SUBI	A,1
	BRNZ	9F
	
	; SET CBLOCK, MB_PNTR, MB_END
	; TO BEGINNING OF FILE
;	LOAD	A,[LINEBUF]
;	STORE	[CBLOCK],A
;	LOAD	A,[LINEBUF+1]
;	ADDI	A,3
;	STORE	[CBLOCK+1],A
;	STORE	[MB_PNTR],A
;	ADDI	A,32-3
;	STORE	[MB_END],A

	; GO LOOK FOR THE FILE
	; SPECIAL BEHAVIOR IF IT IS 0
	LOAD	A,[ARGA]
	LOAD	B,[ARGA+1]
	ADDI	A,0
	BRNZ	0F
	ADDI	B,0
	BRZ	1F
0:	STORE	[TEMP],A
	STORE	[TEMP+1],B
	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,LOP0_B
	LOADI	C,FINDL
	JUMP	INDIR
	ADDI	A,0
	BRNZ	9F

	; CALL INPUTL
	LOADI	A,0XFF
1:	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,LOP0_B
	LOADI	C,INPUTL
	JUMP	INDIR
	ADDI	A,0
	BRNZ	9F

	; GO BACK TO COMMAND LINE
8:	LOADI	B,CMD0_B
	LOADI	C,PROMPT
	JUMP	INDIR

	; ERROR
9:	LOADI	B,CMD0_B
	LOADI	C,ERROR
	JUMP	INDIR
	
	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
.TEXT
.BANK	BI
LOP0_B	= BI


	; ALLOWS A USER TO ADD LINES INTO THE BUFFER
	; WHEN CALLED, THE ADDRESS AT [CBLOCK] / [MB_PNTR]
	; SHOULD POINT TO AN EXISTING LINE. THE NEW LINE
	; WILL BE PLACED AFTER THAT LINE.
	; A '.' CAN BE USED TO EXIT FROM EDIT MODE
	; [CBLOCK] = LINE BLOCK
	; [MB_PNTR] = LINE ADDRESS
	; A = 0 IF APPENDING TO START OF BUFFER
	; RETURNS A=0XFF IF ERROR, 0X00 OTHERWISE
	; USES: A, B, C
	; 
INPUTL:	LOADI	B,LOP1_B
	LOADI	C,INPUTLA
	JUMP	INDIR

	; SETS [CBLOCK] AND [MB_PNTR] TO THE START OF A LINE
	; [MB_END] WILL ALSO BE UPDATED FOR THE CURRENT BLOCK
	; [TEMP] = LINE NUMBER TO FIND
	; RETURNS A=0X00 IF FOUND, 0XFF OTHERWISE
	; USES: A, B, C
FINDL:	LOAD	B,[LINETAB]
	LOAD	C,[LINETAB+1]
	
0:	STORE	[CBLOCK],B
	STORE	[CBLOCK+1],C
	LOADI	A,0XFF
	ADDI	B,0
	BRZ	IRET
	STORE	[DBANK],B
	LOADF	B,[C+2]
	LOADI	A,0
	STORE	[DBANK],A
	ADDI	B,0
	BRZ	2F
	
	; B = LINES ON BLOCK
	LOAD	A,[TEMP+1]
	MOV	C,A
	SUB	A,B
	STORE	[TEMP+1],A
	LOAD	B,[TEMP]
	BRC	1F
	SUBI	B,1
	STORE	[TEMP],B
	BRNC	3F
	
	; SEE IF TEMP = 0
1:	ADDI	A,0
	BRNZ	2F
	ADDI	B,0
	BRZ	3F
	
	; NEXT BLOCK
2:	LOAD	B,[CBLOCK]
	LOAD	C,[CBLOCK+1]
	STORE	[DBANK],B
	LOADF	B,[C]
	LOADF	C,[C+1]
	LOADI	A,0
	STORE	[DBANK],A
	JUMP	0B

	; FOUND BLOCK, FIND THE START OF LINE
	; C = OFFSET
3:	LOAD	A,[CBLOCK]
	LOAD	B,[CBLOCK+1]
	ADDI	B,32
	STORE	[MB_END],B
	LOAD	B,[CBLOCK+1]
	ADDI	B,3
	STORE	[DBANK],A
4:	LOADF	A,[B]
	ADDI	A,0
	BRZ	6F
5:	ADDI	B,1
	JUMP	4B
	
	; DECREMENT AND MAYBE RETURN
6:	SUBI	C,1
	BRNC	7F
	BRNZ	5B
	LOADI	A,0
	STORE	[DBANK],A
	STORE	[MB_PNTR],B
	JUMP	IRET
	
	; ERROR!
7:	LOADI	A,0
	STORE	[DBANK],A
	LOADI	A,0XFF
	JUMP	IRET

	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
.TEXT
.BANK	BI
LOP1_B	= BI

	; SHADOW ON INPUTL
	; ATTEMPT TO POSITION EDITOR POINTER
INPUTLA:ADDI	A,0
	BRNZ	1F
	STORE	[SPARK],D
	
	; FIND END OF LINE TO APPEND TO
	; CHECK THE NEXT CHARACTER
1:	LOAD	A,[CBLOCK]
	LOAD	B,[CBLOCK+1]
	LOAD	C,[MB_PNTR]
	LOAD	D,[MB_END]
	
	; INCREMENT POINTER
	ADDI	C,1
	CMP	C,D
	BRNZ	3F
	
	; CHECK CHARACTER
2:	STORE	[DBANK],A
	LOADF	D,[C]
	ADDI	D,0
	BRNN	4F
	
	; PEEK INTO NEXT BLOCK
3:	LOADF	A,[B]
	LOADF	B,[B+1]
	ADDI	A,0
	BRZ	9F	; ERROR!
	LOADI	C,3
	ADD	B,C
	JUMP	2B
	
	; WE FOUND A CHARACTER
	; IS IT ZERO?
4:	LOADI	D,0
	STORE	[DBANK],D
	STORE	[CBLOCK],A
	STORE	[CBLOCK+1],B
	STORE	[MB_PNTR],C
	BRZ	5F
	
	; YEP,
5:
	



	; DO CR/LF
;	LOADI	C,BI
;	STOREF	[D+1],C
;	LOADI	A,0X0A
;	LOADI	B,S_PUTC
;	LOADI	C,@+2
;	JUMP	SYSCALL
;	LOADI	A,0X0D
;	LOADI	B,S_PUTC
;	LOADI	C,@+2
;	JUMP	SYSCALL
	
	; GET USER INPUT
;	LOADI	B,BUF_B
;	STORE	[ARG_BNK],B
;	LOADI	B,S_INPUT
;	LOADI	C,@+2
;	JUMP	SYSCALL