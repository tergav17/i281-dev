; COMMON.S
; SYSTEM COMMON DEFINITIONS

; BIOS CALLS
BOOT	= 0
ALTBOOT = 1
INDIR	= 2
IRET	= 3
SYSCALL	= 4
SYSJUMP	= 5
PRGM	= 6
IWRITE	= 7
ZSTART	= 8

; DEFINES
HALT	= 0x7F

DBANK	= 0X80		; DATA BANK ADDRESS

UART	= 0X90		; UART BASE ADDRESS
UART_RH	= UART+0X00	; UART READ HOLDING
UART_TH	= UART+0X00	; UART TRANSMIT HOLDING
UART_DL = UART+0X00	; UART DIVISOR LOW
UART_DH = UART+0X01	; UART DIVISOR HIGH
UART_FC	= UART+0X02	; UART FIFO CONTROL
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
CF_WRIT = 0X30		; WRITE COMMAND
CF_SETF	= 0XEF		; SET FEATURE COMMAND

