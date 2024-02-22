; TTY.S
; SERIAL CONSOLE DRIVER

.BANK BI
TTY0_B	= BI
.TEXT

	; SERIAL INIT
	; SET UP THE 16C550 UART
	; ASSUMES WORK BANK IS SELECTED
	; USES: A, B, C
TTYINIT:LOADI	A,0X80
	STORE	[UART_LC],A
	
	; DIVISOR = 12
	; FOR 9600B @ 1.843, 19200B @ 3.604
	LOADI	A,12
	STORE	[UART_DL],A
	LOADI	A,0
	STORE	[UART_DH],A
	
	; SET 8-BIT, 1 STOP, RESET DLAB
	LOADI	A,0X03
	STORE	[UART_LC],A

	JUMP	TTYDONE

	; PUTS A CHARACTER ONTO THE TERMINAL
	; ASSUMES WORK BANK IS SELECTED
	; A = CHARACTER TO PRINT
	; USES: B
TTYPUTC:LOAD	B,[UART_LS]

	; READ 5TH BIT TO SEE IF WE CAN TRANSMIT YET
	SHIFTL	B
	SHIFTL	B
	SHIFTL	B
	BRNC	TTYPUTC
	
	; TRANSMITE BYTE
	STORE	[UART_TH],A
	JUMP	TTYDONE

	; PUTS A STRING FROM USER SPACE ONTO THE TERMINAL
	; ASSUMES WORK BANK IS SELECTED
	; A = ADDRESS OF STRING
	; [SRC_BNK] = DATA BANK OF STRING
	; USES: A, B, C
TTYPUTS:LOAD	B,[SRC_BNK]
	STORE	[DBANK],B

	; READ BYTE FROM STRING
0:	LOADF	C,[A]
	ADDI	C,0
	BRZ	TTYDONE
	
	; GET THE LINE STATUS REGISTER
1:	LOAD	B,[UART_LS]

	; READ 5TH BIT TO SEE IF WE CAN TRANSMIT YET
	SHIFTL	B
	SHIFTL	B
	SHIFTL	B
	BRNC	1B
	
	; TRANSMIT BYTE
	STORE	[UART_TH],C
	
	; INCREMENT POINTER
	ADDI	A,1
	
	; RETURN TO PRINT LOOP
	JUMP	0B
	
	; WAIT FOR A CHARACTER TO BE TYPED AND THEN RETURNS IT
	; CHARACTER WILL NOT BE ECHOED
	; IF TTYSTAT RETURN 0XFF, THE RETURN WILL BE INSTANT
	; ASSUMES WORK BANK IS SELECTED
	; CHARACTER RETURNED IN A
	; USES: A, B
TTYGETC:LOAD	B,[UART_LS]

	; READ 1ST BIT
	SHIFTR	B
	BRNC	TTYGETC
	
	; READ BYTE
	LOAD	A,[UART_RH]
	JUMP	TTYDONE
	
	; INPUTS A LINE OF CHARACTER INTO A DATA BANK
	; RESULTING STRING WILL START AT ADDRESS ZERO, AND BE ZERO
	; TERMINATED
	; ASSUMES WORK BANK IS SELECTED
	; [SRC_BNK] = DATA BANK OF RESULT
	; USES: A, B, C
TTYINPT:LOAD	B,[SRC_BNK]
	STORE	[DBANK],B
	
	; SET POINTER FOR STORAGE
	LOADI	C,0

	; READ CHARACTER FROM CONSOLE
	; GET THE LINE STATUS REGISTER
0:	LOAD	B,[UART_LS]

	; CHECK BIT 0 TO SEE IF WE HAVE A CHARACTER 
	SHIFTR	B
	BRNC	0B
	
	; READ THE CHARACTER INTO A
	LOAD	A,[UART_RH]

	; SEE IF IT IS A 'CR' CHARACTER
1:	LOADI	B,0X0D
	CMP	A,B
	BRZ	9F
	
	; SEE IF IT IS A 'BS' CHARACTER
	LOADI	B,0X08
	CMP	A,B
	BRZ	4F
	
	; IGNORE ALL OTHER WHITESPACE CHARACTERS
	LOADI	B,0X20
	CMP	A,B
	BRB	0B
	
	; CHECK IF IT IS A DELETE CHARACTER
	LOADI	B,0X7F
	CMP	A,B
	BRNZ	2F
	
	; YEP, CONVERT IT IN TO A 'BS' CHARACTER
	LOADI	A,0X08
	JUMP	1B
	
	; CHECK TO SEE IF THERE IS SPACE TO PLACE THE CHARACTERS
	; INTO THE BUFFER
2:	CMP	B,C
	BRZ	0B

	; CONVERT TO UPPER CASE
	LOADI	B,0X61
	CMP	A,B
	BRB	3F
	LOADI	B,0X7A
	CMP	A,B
	BRA	3F
	SUBI	A,0X20
	
	; WAIT FOR LS TO BE READY
3:	LOAD	B,[UART_LS]
	SHIFTL	B
	SHIFTL	B
	SHIFTL	B
	BRNC	3B

	; PRINT THE CHARACTER
	STORE	[UART_TH],A
	
	; PLACE IT INTO THE BUFFER
	STOREF	[C],A
	ADDI	C,1
	JUMP	0B

	; HANDLE BACKSPACE
	; SUBTRACT ONE FROM THE BUFFER
4:	ADDI	C,0
	BRZ	0B
	SUBI	C,1

	; WAIT FOR LS TO BE READY
4:	LOAD	B,[UART_LS]
	SHIFTL	B
	SHIFTL	B
	SHIFTL	B
	BRNC	4B

	; ECHO THE CHARACTER
	STORE	[UART_TH],A

	; PRINT AN ADDITIONAL SPACE AND THEN BACKSPACE
5:	LOAD	B,[UART_LS]
	SHIFTL	B
	SHIFTL	B
	SHIFTL	B
	BRNC	5B
	
	LOADI	B,0X20
	STORE	[UART_TH],B
	
6:	LOAD	B,[UART_LS]
	SHIFTL	B
	SHIFTL	B
	SHIFTL	B
	BRNC	6B
	
	STORE	[UART_TH],A
	
	JUMP	0B
	
	; TERMINATE THE STRING AND EXIT
9:	LOADI	A,0
	STOREF	[C],A
	JUMP	TTYDONE
	

	; POLL THE UART TO SEE IF THERE IS A CHARACTER WAITING
	; ASSUMES WORK BANK IS SELECTED
	; RETURNS A=0XFF IF THERE IS A CHARACTER, OTHERWISE A=0X00
TTYSTAT:LOADI	A,0

	; GET THE LINE STATUS REGISTER
	LOAD	B,[UART_LS]

	; READ 1ST BIT
	SHIFTR	B
	BRNC	TTYDONE
	
	; SET A AND FALL TO TTYDONE
	LOADI	A,0XFF

	; INTERNAL TTY FUNCTION TO RESET TO WORK BANK AND RETURN
TTYDONE:LOADI	C,WORK_B
	STORE	[DBANK],C
	JUMP	IRET

	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI-1
