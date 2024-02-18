; ED2.S
; SIMPLE TEXT EDITOR
; LINE OPERATIONS

.TEXT
.BANK	BI
LOP0_B	= BI

	; DELETES A NUMBER OF LINES STARTING FROM THE
	; BEGINNING OF A LINE
	; AT THE END OF EACH DELETED LINE, [ARGB] WILL BE INCREMENTED
	; LINES WILL CONTINUE TO BE DELETED UNTIL [ARGB] > [ARGA]
	; [CBLOCK] = LINE BLOCK
	; [MB_PNTR] = LINE ADDRESS
	; RETURNS A=0XFF IF ERROR, 0X00 OTHERWISE
	; USES: A, B, C
ERASEL:	LOADI	B,LOP3_B
	LOADI	C,ERASELA
	JUMP	INDIR

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
	
	; INITALIZE PBLOCK
	LOADI	A,0
	STORE	[PBLOCK],A
	LOADI	A,LINETAB
	STORE	[PBLOCK+1],A
	
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
	STORE	[PBLOCK],B
	STORE	[PBLOCK+1],C
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
INPUTLA:SUBI	D,2
	STORE	[SPARK],D
	ADDI	A,0
	BRNZ	1F
	
	; APPEND TO BEGINNING
	LOADI	A,0
	LOADI	B,LINETAB
	STORE	[CBLOCK],A
	STORE	[CBLOCK+1],B
	LOADI	A,0X1F
	STORE	[MB_PNTR],A
	LOADI	A,0X20
	STORE	[MB_END],A
	JUMP	6F
	
	; FIND END OF LINE TO APPEND TO
	; CHECK THE NEXT CHARACTER
1:	LOAD	A,[CBLOCK]
	LOAD	B,[CBLOCK+1]
	LOAD	C,[MB_PNTR]
	LOAD	D,[MB_END]
	
	; INCREMENT POINTER
	ADDI	C,1
	CMP	C,D
	BRZ	3F
	
	; CHECK CHARACTER
2:	STORE	[DBANK],A
	LOADF	D,[C]
	ADDI	D,0
	BRNN	4F
	
	; PEEK INTO NEXT BLOCK
3:	STORE	[DBANK],A
	LOADF	A,[B]
	LOADF	B,[B+1]
	ADDI	A,0
	BRZ	5F	; END OF LINE (END OF BUFFER)
	LOADI	C,3
	ADD	C,B
	JUMP	2B
	
	; WE FOUND A CHARACTER
	; IS IT ZERO?
4:	BRZ	5F
	LOADI	D,0
	STORE	[DBANK],D
	STORE	[CBLOCK],A
	STORE	[CBLOCK+1],B
	STORE	[MB_PNTR],C
	LOADI	C,32
	ADD	C,B
	STORE	[MB_END],C
	JUMP	1B
	
	; YEP, ARE AT THE END OF THE LINE
5:	LOADI	D,0
	STORE	[DBANK],D
	LOAD	D,[SPARK]
	
	; THE TEXT INPUT WILL BE PLACED IN BUF_B
	LOADI	B,BUF_B
	STORE	[ARG_BNK],B
	
	; INDIRECT JUMP
6:	LOADI	B,LOP2_B
	LOADI	C,INPUTLB
	JUMP	INDIR
	
	; FINAL PART OF THE APPEND PROCESS
	; CHECK THE REST-OF-LINE BUFFER
INPUTLC:LOAD	D,[SPARK]
	LOADI	A,BUF_B+1
	STORE	[DBANK],A
	
	; GRAB FIRST BYTE
	LOAD	B,[0]
	LOADI	A,0
	STORE	[DBANK],A
	
	; DO WE EVEN CARE?
	ADDI	B,0
	BRN	8F
	
	; STORE CBLOCK
	LOAD	A,[CBLOCK]
	LOAD	B,[CBLOCK+1]
	LOAD	C,[MB_PNTR]
	STORE	[TEMP],A
	STORE	[TEMP+1],B
	STORE	[POINTER],C
	
	; YES WE SO, ALLOCATE ANOTHER BLOCK
	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,MEM0_B
	LOADI	C,MALLOC
	JUMP	INDIR
	
	; DID IT WORK?
	ADDI	A,0
	BRNZ	9F
	
	; SET UP LINE COUNTER
	LOAD	B,[CBLOCK+1]
	LOAD	A,[CBLOCK]
	STORE	[DBANK],A
	LOADI	A,0
	STOREF	[B+2],A
	STORE	[DBANK],A
	
	; COPY OVER THE CONTENTS
	ADDI	B,3
	LOADI	C,0
	
	; GET A CHARACTER FROM THE R-O-L BUFFER
0:	LOADI	A,BUF_B+1
	STORE	[DBANK],A
	LOADF	D,[C]
	LOADI	A,0
	STORE	[DBANK],A
	
	; IS IT ZERO?
	LOAD	A,[CBLOCK]
	ADDI	D,0
	BRNZ	1F
	
	; YES IT IS
	LOAD	D,[CBLOCK+1]
	STORE	[DBANK],A
	LOADF	A,[D+2]
	ADDI	A,1
	STOREF	[D+2],A
	LOADI	D,0
	JUMP	2F
	
	; PLACE IT IN THE BUFFER
1:	STORE	[DBANK],A
2:	STOREF	[B],D
	LOADI	A,0
	STORE	[DBANK],A
	
	; NEXT CHARACTER (MAYBE)
	ADDI	B,1
	ADDI	C,1
	ADDI	D,0
	BRNN	0B
	
	; COPY COMPLETE
	LOAD	D,[SPARK]
	
	; RESTORE CBLOCK
	LOAD	A,[TEMP]
	LOAD	B,[TEMP+1]
	LOAD	C,[POINTER]
	STORE	[CBLOCK],A
	STORE	[CBLOCK+1],B
	STORE	[MB_PNTR],C
	ADDI	B,32
	STORE	[MB_END],B
	
	; GO TO INPUTLB
8:	LOADI	B,LOP2_B
	LOADI	C,INPUTLB
	JUMP	INDIR
	
	; EXIT
9:	ADDI	D,2
	JUMP	IRET
	
	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
.TEXT
.BANK	BI
LOP2_B	= BI


	; GRT A LINE
	; DO CR/LF
INPUTLB:LOADI	C,BI
	STOREF	[D+1],C
	LOADI	A,0X0A
	LOADI	B,S_PUTC
	LOADI	C,@+2
	JUMP	SYSCALL
	LOADI	A,0X0D
	LOADI	B,S_PUTC
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; GET USER INPUT
	LOADI	B,S_INPUT
	LOADI	C,@+2
	JUMP	SYSCALL
	
	; WHILE WE ARE HERE, LETS RESET THE REST-OF-LINE BUFFER
	LOADI	C,BUF_B+1
	STORE	[DBANK],C
	LOADI	C,0XFF
	STORE	[0],C
	
	; SEE IF THE USER WANTS TO BE DONE
	LOADI	C,BUF_B
	STORE	[DBANK],C
	LOAD	A,[0]
	LOAD	B,[1]
	SUBI	A,'.'
	BRNZ	1F
	ADDI	B,0
1:	LOADI	C,0
	STORE	[DBANK],C
	BRZ	9F

	; PLACE LINE IN BUFFER
	; SET POINTER FOR BUFFER
	LOADI	A,0
	STORE	[POINTER],A
	
	; FIRST, WE MOVE ANY EXISTING TEXT OUT OF THE WAY
	LOAD	A,[MB_END]
	LOAD	B,[MB_PNTR]
	LOAD	C,[CBLOCK]

	; INCREMENT, AND SEE IF WE ARE AT THE END OF THE BLOCK
	; IF SO, ALLOCATE A NEW BLOCK 
	ADDI	B,1
	CMP	A,B
	BRZ	4F

	; CHECK TO SEE IF THERE IS A LINE HERE
	STORE	[DBANK],C
	LOADF	C,[B]
	ADDI	C,0
	LOADI	C,0
	STORE	[DBANK],C
	
	; NOPE, WE ARE CLEAR TO ENTER DATA
	BRNZ	4F

	; COPY REST OF BUFFER TO BUF_B+1
	STORE	[SPARK],D
	LOADI	D,0
2:	LOAD	A,[CBLOCK]
	LOAD	C,[CBLOCK+1]
	STORE	[DBANK],A
	LOADF	A,[B]
	ADDI	A,0
	BRNZ	3F
	
	; SUBTRACT ONE FROM THE LINE COUNT
	LOADF	A,[C+2]
	SUBI	A,1
	STOREF	[C+2],A
	LOADF	A,[B]
	
	; GO STORE IT
3:	LOADI	C,BUF_B+1
	STORE	[DBANK],C
	STOREF	[D],A
	LOADI	C,0XFF
	STOREF	[D+1],C
	LOADI	C,0
	STORE	[DBANK],C
	
	; NEXT CHARACTER
	ADDI	B,1
	ADDI	D,1
	LOAD	A,[MB_END]
	CMP	A,B
	BRNZ	2B
	
	; START COPYING
4:	LOAD	B,[MB_PNTR]
	LOADI	C,0
	JUMP	1F
	
	; GRAB A CHARACTER FROM THE BUFFER
0:	LOADI	A,BUF_B
	LOAD	C,[POINTER]
	ADDI	C,1
	STORE	[POINTER],C
	STORE	[DBANK],A
	LOADF	C,[C+0-1]
	LOADI	A,0
	STORE	[DBANK],A
	
	; CHECK IF ITS ZERO
	ADDI	C,0
	LOAD	A,[MB_END]
	BRZ	5F
	
	; DO WE HAVE SPACE TO STORE IT?
1:	ADDI	B,1
	CMP	A,B
	BRZ	4F
	
	; STORE IT
2:	LOAD	A,[CBLOCK]
	LOAD	D,[CBLOCK+1]
	STORE	[DBANK],A
	STOREF	[B],C
	
	; IF ITS ZERO, WE INCREMENT THE LINE COUNTER
	ADDI	C,0
	BRNZ	3F
	LOADF	C,[D+2]
	ADDI	C,1
	STOREF	[D+2],C

	; TAKE IT FROM THE TOP
3:	LOADI	A,0
	STORE	[DBANK],A
	JUMP	0B
	
	; WE ARE OUT OF MEMORY ON THIS BLOCK, MOVE ON TO THE NEXT
	; DO A MALLOC
4:	STORE	[CHAR],C
	LOAD	D,[SPARK]
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,MEM0_B
	LOADI	C,MALLOC
	JUMP	INDIR
	
	; DID IT WORK?
	ADDI	A,0
	BRNZ	9F
	
	; SET MB POINTERS AND GO
	LOAD	B,[MB_PNTR]
	LOADI	C,0
	STOREF	[B+0-1],C
	LOAD	C,[CHAR]
	JUMP	2B

	; WRAP THINGS UP AND MOVE ON TO THE FINAL STAGE
5:	STORE	[MB_PNTR],B
	SUBI	A,1
	CMP	A,B
	BRZ	6F
	LOAD	A,[CBLOCK]
	STORE	[DBANK],A
	LOADI	A,0XFF
	STOREF	[B+1],A
	LOADI	A,0
	STORE	[DBANK],A
	
6:	LOADI	B,LOP1_B
	LOADI	C,INPUTLC
	JUMP	INDIR

	; EXIT
9:	ADDI	D,2
	JUMP	IRET
	
	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
.TEXT
.BANK	BI
LOP3_B	= BI

	; SHADOW OF ERASEL
ERASELA:SUBI	D,2
	STORE	[SPARK],D

	; SET BASE POINTER
	LOAD	 A,[MB_PNTR]
	STORE	[POINTER],A

	; ERASE A LINE
	; START BY DECREMENTING THE LINE COUNT ON THE BLOCK
0:	LOAD	B,[CBLOCK]
	LOAD	C,[CBLOCK+1]
	LOAD	D,[MB_PNTR]
	STORE	[DBANK],B
	LOADF	A,[C+2]
	SUBI	A,1
	STOREF	[C+2],A
	
	; SCRATCH THE LINE START OUT
	LOADI	A,0XFF
	STOREF	[D],A
	
	; C = MB_END
	; D = MB_PNTR
	ADDI	C,32
	
	; MARCH UNTIL THE NEXT LINE IS FOUND
1:	ADDI	D,1
	CMP	C,D
	BRZ	2F
	
	; CHECK CHARACTER
	LOADF	A,[D]
	ADDI	A,0
	BRZ	5F
	BRNN	1B 

	; MOVE ON TO THE NEXT BLOCK
2:	LOADF	A,[C+0-32]
	LOADF	B,[C+1-32]
	LOADF	D,[C+2-32]
	ADDI	D,0
	LOADI	D,0
	STORE	[DBANK],D
	
	; SAVE NEXT BLOCK IN TEMP
	STORE	[TEMP],A
	STORE	[TEMP+1],B
		
	; CAN WE DEALLOCATE THE BLOCK?
	; IF THERE ARE STILL LINES ON THE BLOCK, THEN NO 
	BRNZ	3F
	
	; SEE IF THERE WAS ANYTHING THAT CAME BEFORE THE LINE
	LOAD	D,[POINTER]
	SUBI	C,32-3
	CMP	C,D
	BRNZ	3F
	
	; ALRIGHT, WE CAN FREE IT
	; LINK THE NEXT BLOCK ONTO THE PREVIOUS BLOCK
	LOAD	C,[PBLOCK]
	LOAD	D,[PBLOCK+1]
	STORE	[DBANK],C
	STOREF	[D],A
	STOREF	[D+1],B
	LOADI	C,0
	STORE	[DBANK],C
	
	; FREE THE BLOCK
	LOAD	D,[SPARK]
	LOADI	C,BI
	STOREF	[D+1],C
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,MEM0_B
	LOADI	C,FREE
	JUMP	INDIR
	
	; GET THE NEXT BLOCK FROM TEMP
	LOAD	A,[TEMP]
	LOAD	B,[TEMP+1]
	JUMP	4F

	; SET CURRENT BLOCK AS PREVIOUS BLOCK
3:	LOAD	C,[CBLOCK]
	LOAD	D,[CBLOCK+1]
	STORE	[PBLOCK],C
	STORE	[PBLOCK+1],D
	
	; UPDATE SHIFT POINTER AND KEEP MARCHING
4:	STORE	[CBLOCK],A
	STORE	[CBLOCK+1],B
	LOADI	D,3
	ADD	D,B
	STORE	[POINTER],D
	LOADI	C,32
	ADD	C,B
	ADDI	A,0
	BRZ	9F
	STORE	[DBANK],A
	SUBI	D,1
	JUMP	1B
	
	; FOUND THE START OF A NEW LINE
5:	LOADI	A,0
	STORE	[DBANK],A
	STORE	[MB_END],C
	STORE	[MB_PNTR],D
	
	; ENSURE ARGA > ARGB
	LOAD	A,[ARGA]
	LOAD	B,[ARGB]
	CMP	A,B
	BRB	8F
	BRA	6F
	LOAD	A,[ARGA+1]
	LOAD	B,[ARGB+1]
	CMP	A,B
	BRBE	8F
	
	; INCREMENT ARGB
6:	LOAD	A,[ARGB+1]
	ADDI	A,1
	STORE	[ARGB+1],A
	BRNC	7F
	LOAD	A,[ARGB]
	ADDI	A,1
	STORE	[ARGB],A
	BRC	8F

	; GO BACK AND DO ANOTHER LINE
7:	JUMP	0B

	; WE ARE DONE PROCESSING, CLEAN UP
8:	LOAD	A,[MB_PNTR]
	LOAD	B,[MB_END]
	LOAD	C,[POINTER]
	LOAD	D,[CBLOCK]
	
	; DO WE NEED TO?
	CMP	A,C
	BRBE	9F
	
	; YES WE DO
	STORE	[DBANK],D
8:	CMP	A,B
	BRZ	9F
	LOADF	D,[A]
	STOREF	[C],D
	LOADI	D,0XFF
	STOREF	[C+1],D
	ADDI	A,1
	ADDI	C,1
	JUMP	8B

	; RETURN
9:	LOADI	A,0
	STORE	[DBANK],A
	LOAD	D,[SPARK]
	ADDI	D,2
	JUMP	IRET
	
	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI+1
