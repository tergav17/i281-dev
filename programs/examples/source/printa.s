; PRINTA.S
; PRINTS 'A' ON THE TERMINAL

; DEFINES
UART	=	0X90
UART_TH	=	UART+0X00
UART_LS	=	UART+0X05

.TEXT
	; START HERE
	; LET A BE THE CHARATER WE PRINT
START:	LOADI	A,'A'
	
	; GET LINE STATUS REGISTER
PRINT:	LOAD	B,[UART_LS]
	
	; READ 5TH BIT TO SEE IF WE CAN TRANSMIT YET
	SHIFTL	B
	SHIFTL	B
	SHIFTL	B
	BRNC	PRINT
	
	; TRANSMIT BYTE
	STORE	[UART_TH],A
	JUMP	PRINT
