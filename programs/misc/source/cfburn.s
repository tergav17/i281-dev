; CFBURN.S
; COMPACT FLASH BURN-IN PROGRAM
; GAVIN TERSTEEG, 2024
; SDMAY24-14

; COMPACT FLASH CARD REQUIRES 32MB TEST PATTERN IMAGE
; IMAGE IS CREATED WITH 256 * 256 BLOCKS OF INCREMENTING
; NUMBERS
; THE OFFSET FOR EACH BLOCK IS THE LOW BYTE OF THE ADDRESS
; THE INCREMENT PER ADDRESS IS THE HIGH BYTE OF THE ADDRESS

; REQUIRES USE OF BIOS CALLS

; DEFINES
DBANK	= 0X80		; DATA BANK ADDRESS 

UART	= 0X90		; UART BASE ADDRESS
UART_RH	= UART+0X00	; UART READ HOLDING
UART_TH	= UART+0X00	; UART TRANSMIT HOLDING
UART_DL = UART+0X00	; UART DIVISOR LOW
UART_DH = UART+0X01	; UART DIVISOR HIGH
UART_LC = UART+0X03	; UART LINE CONTROL
UART_LS	= UART+0X05	; UART LINE STATUS
SCRATCH	= UART+0X07	; SCRATCH BYTE ADDRESS

CF	= 0XA0		; COMPACT FLASH BASE ADDRESS
CF_DATA	= CF+0X00	; CF DATA
CF_ERR	= CF+0X01	; CF ERROR
CF_FEAT	= CF+0x01	; CF FEATURES
CF_CNT	= CF+0X02	; CF SECTOR COUNT
CF_LBA0	= CF+0X03	; CF LBA BITS 0-7
CF_LBA1	= CF+0X04	; CF LBA BITS 8-15
CF_LBA2	= CF+0X05	; CF LBA BITS 16-23
CF_LBA3	= CF+0X06	; CF LBA BITS 24-27
CF_STAT	= CF+0X07	; CF STATUS
CF_CMD	= CF+0X07	; CF COMMAND

CF_8BIT	= 0X01		; 8 BIT MODE
CF_DCAC	= 0X82		; DISABLE CACHE

CF_READ	= 0X20		; READ COMMAND
CF_SETF	= 0XEF		; SET FEATURE COMMAND
.TEXT
	; START HERE
	; LET B BE OUR STRING POINTER 
START:	LOADI	B,STRING



	; PRINT A STRING TO THE CONSOLE
	; B = STRING TO PRINT
	; C = RETURN ADDRESS
	; USES: A, B, C
PRINT:	LOADF	A,[B]

	; MAKE SURE IT ISNT ZERO
	ADDI	A,0
	BRZ	1F
	
	; GET LINE STATUS REGISTER
0:	LOAD	C,[UART_LS]
	
	; READ 5TH BIT TO SEE IF WE CAN TRANSMIT YET
	SHIFTL	C
	SHIFTL	C
	SHIFTL	C
	BRNC	0B
	
	; TRANSMIT BYTE
	STORE	[UART_TH],A
	
	; INCREMENT POINTER
	ADDI	B,1
	
	; RETURN TO PRINT LOOP
	JUMP	PRINT
	
	; AND RETURN
1:	JUMPR	C

	; WAIT FOR THE CF CARD TO BECOME READY
	; FOR THIS TO HAPPEN, THE BUSY FLAG MUST BE 0
	; AND THE READY FLAG MUST BE 1
	; IF A CF CARD ISN'T PRESENT, THIS ROUTINE HANGS
	; BUT WE DON'T CARE
	; C = RETURN ADDRESS
	; USES: A
CFWAIT:	LOAD	A,[CF_STAT]

	; CHECK BIT 7 (BUSY FLAG)
	SHIFTL	A
	
	; GO BACK TO START BUSY
	BRC	CFWAIT
	
	; CHECK BIT 6 (READY FLAG)
	SHIFTL	A
	
	; GO BACK TO START IF NOT READY
	BRNC	CFWAIT
	
	; RETURN FROM FUNCTION CALL
	JUMPR	C
	


.DATA

	; HELLO SPLASH
.DEFL BYTE STRING	0x0A,0X0D,"I281 CF BURN-IN TEST",0X0A,0x0D,0
	
	; TEST STATE
.DEFL BYTE ADDR_LO	0
.DEFL BYTE ADDR_HI	0