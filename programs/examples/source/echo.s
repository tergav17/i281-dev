; ECHO.S
; UART CHARACTER ECHO PROGRAM

; DEFINES
UART	=	0X90
UART_RH	=	UART+0X00
UART_TH	=	UART+0X00
UART_LS	=	UART+0X05

.TEXT
	; START HERE
START:	LOAD	A,[UART_LS]

	; WHEN THE UART RECIEVES A CHARACTER
	; BIT 0 OF THE LINE STATUS REGISTER
	; WILL GO HIGH
	SHIFTR	A
	BRNC	START
	
	; READ VALUE FROM RECIEVE HOLDING
	LOAD	A,[UART_RH]
	
	; AND SEND IT TO TRANSMIT HOLDING
	STORE	[UART_TH],A
	JUMP	START
	