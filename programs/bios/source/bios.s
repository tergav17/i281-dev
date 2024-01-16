; BIOS.S
; STANDARD BIOS FOR COMPACT FLASH BOOT
; PLUS STANDARD CALLS

; DEFINES
DBANK	=	0X80	; DATA BANK ADDRESS 
CF	=	0XA0	; COMPACT FLASH BASE ADDRESS
CF_DATA	=	CF+0X00	; CF DATA
CF_ERR	=	CF+0X01	; CF ERROR
CF_FEAT	=	CF+0x01	; CF FEATURES
CF_CNT	=	CF+0X02	; CF SECTOR COUNT
CF_LBA0	=	CF+0X03	; CF LBA BITS 0-7
CF_LBA1	=	CF+0X04	; CF LBA BITS 8-15
CF_LBA2	=	CF+0X05	; CF LBA BITS 16-23
CF_LBA3	=	CF+0X06	; CF LBA BITS 24-27
CF_STAT	=	CF+0X07	; CF STATUS
CF_CMD	=	CF+0X07	; CF COMMAND

CF_8BIT	=	0X01	; 8 BIT MODE
CF_DCAC	=	0X82	; DISABLE CACHE

CF_READ	=	0X20	; READ COMMAND
CF_SETF	=	0X20	; SET FEATURE COMMAND

.BANK 0
.TEXT

	; SYSTEM CALL JUMP TABLE
	JUMP	BOOT	; BOOT OPERATION
	JUMP	INDIR	; INDIRECT JUMP
	JUMP	PRGM	; PROGRAM FROM DMEM
	


	; KICK OFF THE BOOT SEQUENCE
	; START BY SETTING THE CARD TO 8-BIT MODE
	; WE MUST WAIT FOR THE CF TO BE READY BEFORE SENDING A COMMAND
BOOT:	LOADI	C,@+2
	JUMP	CFWAIT
	LOADI	A,CF_8BIT
	STORE	[CF_FEAT],A
	LOADI	A,CF_SETF
	STORE	[CF_CMD],A
	
	; NOW DISABLE THE CACHE
	LOADI	C,@+2
	JUMP	CFWAIT
	LOADI	A,CF_DCAC
	STORE	[CF_FEAT],A
	LOADI	A,CF_SETF
	STORE	[CF_CMD],A
	
	; PUNCH IN THE ADDRESS OF THE MBR
	; (MASTER BOOT RECORD)
	LOADI	B,0
	STORE	[CF_LBA0],B
	STORE	[CF_LBA1],B
	STORE	[CF_LBA2],B
	
	; THE TOP 3 BITS OF LBA3 MUST BE '1' TO INDICATE LBA MODE
	LOADI	A,0XE0
	STORE	[CF_LBA3],A
	
	; PUT A '1' IN THE SECTOR COUNT REGISTER
	LOADI	A,0X01
	STORE	[CF_CNT],A
	
	; SINCE A = 1, LETS SET THE DESTINATION BANKS TOO
	BANK	A
	STORE	[DBANK],A
	
	; ISSUE A READ COMMAND!
	LOADI	C,@+2
	JUMP	CFWAIT
	LOADI	A,CF_READ
	STORE	[CF_CMD],A
	
	; ...AND WAIT FOR IT TO FINISH
	LOADI	C,CFBOOT

	; WAIT FOR THE CF CARD TO BECOME READY
	; FOR THIS TO HAPPEN, THE BUSY FLAG MUST BE 0
	; AND THE READY FLAG MUST BE 1
	; IF A CF CARD ISN'T PRESENT, THIS ROUTINE HANGS
	; BUT WE DON'T CARE
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
	
	; NOW THE CARD SHOULD BE READY TO SEND BYTES
	; WE ARE JUST GOING TO GO OUT ON A LIMB AND
	; ASSUME THAT WHATEVER MASTER BOOT RECORD
	; WE HAVE BEEN GIVEN IS VALID
	; NO USE IN WASTING PRECIOUS INSTRUCTION MEMORY HERE
	; SKIP THE FIRST 128 BYTES OF MEMORY
	; B SHOULD STILL BE 0 FROM LOADING THE MBR ADDRESS
CFBOOT:	LOAD	A,[CF_DATA]
	ADDI	B,1
	BRN	CFBOOT
	
	; NOW WE UNPACK THE DATA SEGMENT
	LOADI	B,0
0:	LOAD	A,[CF_DATA]
	STOREF	[B],A
	ADDI	B,1
	BRNN	0B
	
	; FINALLY, WE DO THE INSTRUCTION SEGMENT
1:	LOAD	A,[CF_DATA]
	CACHE	A
	LOAD	A,[CF_DATA]
	WRITE	[B],A
	ADDI	B,1
	BRN	1B
	
	; AND WE JUMP TO LOADED PROGRAM AND HOPE FOR THE BEST!
	JUMP	0X80
	
	; INDIRECT JUMP
	; JUMPS TO A SPECIFIC ADDRESS ON A SPECIFIC PAGE
	; B = DESTINATION ISR PAGE
	; C = DESTINATION ADDRESS
	; USES: NONE
INDIR:	BANK	B
	JUMPR	C

	; THIS ROUTINE WILL TAKE 2 PAGES FROM DATA MEMORY
	; AND WRITE THEM INTO A PAGE OF INSTRUCTION MEMORY
	; RETURNS WITH DATA PAGE ON 0
	; A = DESTINATION ISR PAGE
	; B = SOURCE DATA PAGE
	; C = RETURN ADDRESS
	; D = RETURN ISR PAGE
	; USES: BYTE 0X7E-0X7F OF PAGE 0
PRGM:	BANK	A
	LOADI	A,0
	STORE	[DBANK],A
	STORE	[0X7E],C
	STORE	[0X7F],D
	
	; COPY OVER THE DATA
	; CRAZY REGISTER SHIT
	LOADI	D,0X80
0:	STORE	[DBANK],B
	LOADI	C,0
1:	LOADF	A,[C]
	CACHE	A
	LOADF	A,[C+1]
	SHIFTR	C
	ADD	C,D
	WRITE	[C],A
	SUB	C,D
	SHIFTL	C
	ADDI	C,2
	BRNN	1B
	
	; WE REACHED THE END OF A DATA BANK
	; MOVE ON TO THE NEXT?
	ADDI	B,1
	ADDI	D,0X40
	BRN	0B
	
	; NOPE, WE ARE DONE
	LOADI	A,0
	STORE	[DBANK],A
	LOAD	C,[0X7E]
	LOAD	D,[0X7F]
	BANK	D
	JUMPR	C

	; HALT AT THE END OF THE ROM
.ORG	0x7F
HALT:	JUMP	HALT