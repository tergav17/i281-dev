; YMPLAY.S
; STREAMS A YM FILE FROM THE MEDIA BUFFER
; GAVIN TERSTEEG, 2024
; SDMAY24-14

; SET START OF HEAP
HEAP	= BD

; BANK ALLOCATION STUFF
BI	= 1
BD	= 1

; MAXIMUM ARGUMENTS
MAXARGS	= 1

; MEDIA BASE
MEDBASE	= 1

; COMPACT FLASH REGISTERS
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

; AY-3-8910 REGISTERS
MEGAIO	= 0XB0
AY0_ADR	= MEGAIO+0
AY1_ADR = MEGAIO+2
AY0_WR	= MEGAIO+1
AY1_WR	= MEGAIO+3
AY0_RD	= MEGAIO+0
AY1_RD	= MEGAIO+2

; COMPACT FLASH COMMANDS
CF_READ	= 0X20		; READ COMMAND

.TEXT
.BANK	BI
CORE0_B	= BI

	; START BY PROCESSING THE ARGUMENTS
START:	LOADI	A,0
	STORE	[DBANK],A
	
	; RESET ARG STATE
	STORE	[ARGC],A
	
	; SET UP STACK
	LOADI	D,0X60-2
	
	; SYSCALL RETURN BANK
	LOADI	C,BI
	STOREF	[D+1],C
	
	; SET UP POINTER
	LOADI	C,0
	
	; GO TO ARGUMENT BANK
0:	LOAD	A,[CMDL_B]
	STORE	[ARG_BNK],A
	STORE	[DBANK],A

	; SKIP THE CURRENT ARGUMENT
1:	LOADF	A,[C]
	LOADI	B,0X20
	CMP	A,B
	BRBE	2F
	ADDI	C,1
	JUMP	1B

	; LOOK FOR AN ARGUMENT
2:	LOADF	A,[C]
	ADDI	A,0
	BRZ	ARGDONE
	CMP	A,B
	BRA	3F
	ADDI	C,1
	JUMP	2B

	; IS IT A FLAG?
3:	LOADI	B,'-'
	CMP	A,B
	BRNZ	5F
	
	; HANDLE FLAGS HERE	
4:	ADDI	C,1
	LOADF	A,[C]
	ADDI	A,0
	BRZ	ARGDONE
	LOADI	B,0X20
	CMP	A,B
	BRBE	2B
	
	; REGISTER THE FLAG
	LOADI	B,0
	STORE	[DBANK],B
	
	; IS IT A RECOGNIZED FLAG?
	ADDI	B,0
	BRZ	ARGBAD
	LOADI	A,1
	STOREF	[B],A

	; THERE MAY BE ANOTHER FLAG
	LOAD	B,[CMDL_B]
	STORE	[ARG_BNK],B
	STORE	[DBANK],B
	JUMP	4B

	; SAVE THE ARGUMENT
5:	LOADI	B,0
	STORE	[DBANK],B
	LOAD	B,[ARGC]
	STOREF	[B+ARGV],C
	
	; DID WE EXCEED THE ALLOWED NUMBER OF ARGUMENTS
	SUBI	B,MAXARGS
	BRC	ARGBAD
	ADDI	B,MAXARGS+1
	STORE	[ARGC],B
	JUMP	0B
	
	; BAD ARGUMENT
ARGBAD:	LOADI	A,0
	STORE	[DBANK],A
	
	LOADI	A,ERR0_B
	STORE	[ARG_BNK],A
	LOADI	A,ERROR00
	
	; PRINT ERROR MESSAGE
PRNTERR:LOADI	C,BI
	STOREF	[D+1],C
	LOADI	B,S_PUTS
	LOADI	C,EXIT
	JUMP	SYSCALL	

	; EXIT PROGRAM
EXIT:	LOADI	B,0
	JUMP	SYSJUMP
	
	; ARGUMENT PROCESSING DONE
ARGDONE:LOADI	A,0
	STORE	[DBANK],A
	
	; CHECK ARG COUNT
	LOAD	A,[ARGC]
	ADDI	A,0
	BRNZ	ARGBAD
	
	; RESET READ IN STATE
	LOADI	A,0
	STORE	[SECADDR],A
	STORE	[SECADDR+1],A
	
	; READ IN THE FIRST SECTOR
	; SET COMPACT FLASH ADDRESS
	LOAD	B,[SECADDR+1]
	STORE	[CF_LBA0],B
	LOAD	B,[SECADDR]
	STORE	[CF_LBA1],B
	LOADI	B,MEDBASE
	STORE	[CF_LBA2],B
	LOADI	B,0XE0
	STORE	[CF_LBA3],B
	LOADI	B,1
	STORE	[CF_CNT],B
	
	; SET UP AY CHIPS
	LOADI	A,7
	STORE	[AY1_ADR],A
	LOADI	A,0XBF
	STORE	[AY1_WR],A

	; SET RESET STATE
	LOADI	A,15
	STORE	[AY1_ADR],A
	LOADI	A,1
	STORE	[AY1_WR],A
	
	; START PLAYING
	LOADI	B,CORE1_B
	LOADI	C,DOPLAY
	JUMP	INDIR

BI	= BI+1
.TEXT
.BANK	BI
CORE1_B	= BI

	; START PLAYING
	; RESET STATE
DOPLAY:	LOADI	A,0
	STORE	[STATE],A
	STORE	[COUNTER],A

	; SET RETURN ADDRESS
	LOADI	C,BI
	STOREF	[D+1],C

	; EXECUTE A COMPACT FLASH READ
	LOADI	C,@+2
	JUMP	CFWAIT
	LOADI	A,CF_READ
	STORE	[CF_CMD],A

	; CONSUME THE LATEST SECTOR AND QUEUE UP A NEW SECTOR
0:	LOADI	C,@+2
	JUMP	CFWAIT
	LOADI	C,HEAP
1:	STORE	[DBANK],C
	LOADI	B,0
2:	LOAD	A,[CF_DATA]
	STOREF	[B],A
	ADDI	B,1
	BRNN	2B
	ADDI	C,1
	LOADI	A,HEAP+4
	CMP	A,C
	BRNZ	1B
	LOADI	A,0
	STORE	[DBANK],A

	; INCREMENT SECTOR ADDRESS
	LOAD	A,[SECADDR+1]
	ADDI	A,1
	STORE	[SECADDR+1],A
	BRNC	3F
	LOAD	A,[SECADDR]
	ADDI	A,1
	STORE	[SECADDR],A

	; SET COMPACT FLASH ADDRESS
3:	LOAD	B,[SECADDR+1]
	STORE	[CF_LBA0],B
	LOAD	B,[SECADDR]
	STORE	[CF_LBA1],B
	LOADI	B,MEDBASE
	STORE	[CF_LBA2],B
	LOADI	B,0XE0
	STORE	[CF_LBA3],B
	LOADI	B,1
	STORE	[CF_CNT],B

	; QUEUE UP NEXT READ
	LOADI	C,@+2
	JUMP	CFWAIT
	LOADI	A,CF_READ
	STORE	[CF_CMD],A
	
	; RESET BANK AND POINTER
	LOADI	A,0
	LOADI	B,HEAP
4:	STORE	[POINTER],A
	STORE	[BANK],B

	; GET BYTE FROM BUFFER
	STORE	[DBANK],B
	LOADF	A,[A]
	LOADI	B,0
	STORE	[DBANK],B
	
	; CALL PLAY LOGIC
	LOADI	C,@+5 
	STOREF	[D],C
	LOADI	B,PLAYR_B
	LOADI	C,PLOGIC
	JUMP	INDIR
	ADDI	A,0
	BRZ	5F
	
	; WE ARE DONE
	LOADI	A,7
	STORE	[AY0_ADR],A
	STORE	[AY1_ADR],A
	LOADI	A,0XBF
	STORE	[AY0_WR],A
	STORE	[AY1_WR],A
	JUMP	9F
	
	; GET NEXT BYTE
5:	LOAD	A,[POINTER]
	LOAD	B,[BANK]
	ADDI	A,1
	BRNN	4B
	LOADI	A,0
	ADDI	B,1
	LOADI	C,HEAP+4
	CMP	B,C
	BRNZ	4B
	JUMP	0B

	; EXIT
9:	LOADI	A,0
	STORE	[DBANK],A
	
	; READ QUEUED SECTOR
	LOADI	C,@+2
	JUMP	CFWAIT
	LOADI	A,0
0:	LOAD	B,[CF_DATA]
	LOAD	B,[CF_DATA]
	ADDI	A,1
	BRNZ	0B
	
	; DONE
	LOADI	B,S_EXIT
	JUMP	SYSJUMP

	; WAIT FOR THE CF CARD TO BECOME READY
	; FOR THIS TO HAPPEN, THE BUSY FLAG MUST BE 0
	; AND THE READY FLAG MUST BE 1
	; IF A CF CARD ISN'T PRESENT, THIS ROUTINE HANGS
	; BUT WE DON'T CARE
	; USES: B
CFWAIT:	LOAD	B,[CF_STAT]

	; CHECK BIT 7 (BUSY FLAG)
	SHIFTL	B
	
	; GO BACK TO START BUSY
	BRC	CFWAIT
	
	; CHECK BIT 6 (READY FLAG)
	SHIFTL	B
	
	; GO BACK TO START IF NOT READY
	BRNC	CFWAIT
	
	; RETURN FROM FUNCTION CALL
	JUMPR	C

BI	= BI+1
.TEXT
.BANK	BI
PLAYR_B	= BI

	; PLAYER LOGIC
	; A = NEXT CHARACTER IN STREAM
	; RETURNS A=0XFF WHEN DONE
PLOGIC:	MOV	C,A
	LOAD	B,[STATE]
	SUBI	B,1
	BRC	8F

	; STATE = 0, PARSE HEADER FOR VALIDITY
	LOAD	B,[COUNTER]
	ADDI	B,1
	STORE	[COUNTER],B
	LOADI	A,0XFF
	SUBI	B,1
	BRNZ	7F
	; COUNTER = 0
	SUBI	C,0X59
	BRZ	9F
	JUMP	IRET
	
7:	SUBI	B,1
	BRNZ	7F
	; COUNTER = 1
	SUBI	C,0X4D
	BRZ	9F
	JUMP	IRET
	
7:	SUBI	B,1
	BRNZ	7F
	; COUNTER = 2
	SUBI	C,0X35
	BRZ	9F
	JUMP	IRET
	
7:	SUBI	B,1
	BRNZ	7F
	; COUNTER = 3
	SUBI	C,0X21
	BRZ	9F
	JUMP	IRET
	
7:	SUBI	B,30
	BRNZ	9F
	; COUNTER = 33
	LOADI	A,1
	STORE	[STATE],A
	JUMP	9F
	
8:	LOAD	B,[STATE]
	SUBI	B,3
	BRA	8F
	
	; STATE = 1, 2, 3, PRINT SOME STRINGS
	SUBI	D,2
	
	; SET RETURN ADDRESS
	LOADI	C,BI
	STOREF	[D+1],C
	
	; CHECK FOR ZEROS
	ADDI	A,0
	BRNZ	1F
	
	; INCREMENT STATE
	LOAD	B,[STATE]
	ADDI	B,1
	STORE	[STATE],B
	
	; RESET COUNTER TOO
	LOADI	A,0
	STORE	[COUNTER],A
	
	; DO CRLF / PRINT A CHARACTER
	LOADI	A,0X0A
	LOADI	B,S_PUTC
	LOADI	C,@+2
	JUMP	SYSCALL
	LOADI	A,0X0D
1:	LOADI	B,S_PUTC
	LOADI	C,@+2
	JUMP	SYSCALL
	
	ADDI	D,2
	JUMP	9F
	
	; START BUFFERING 
8:	LOAD	B,[COUNTER]
	STOREF	[B+PBUFFER],A
	ADDI	B,1
	STORE	[COUNTER],B
	
	SUBI	B,16
	BRNZ	9F
	
	; WE HAVE A COMPLETE FRAME, LETS PROCESS IT
	
	; RESET COUNTER
	LOADI	B,0
	STORE	[COUNTER],B
	
	; CHECK FOR END
	LOAD	A,[PBUFFER]
	SUBI	A,0X45
	BRNZ	1F
	LOAD	A,[PBUFFER+1]
	SUBI	A,0X6E
	BRNZ	1F
	LOAD	A,[PBUFFER+2]
	SUBI	A,0X64
	BRNZ	1F
	LOAD	A,[PBUFFER+3]
	SUBI	A,0X21
	BRZ	8F
	
	; NOW WE SET ALL OF THE REGISTERS
1:	LOADI	B,AYREG_B
	LOADI	C,SETAYR
	JUMP	INDIR
		
8:	LOADI	A,0XFF
	JUMP	IRET

9:	LOADI	A,0
	JUMP	IRET

BI	= BI+1
.TEXT
.BANK	BI
AYREG_B	= BI

	; SETS THE AY REGISTERS
SETAYR:	SUBI	D,2

	; SET RETURN ADDRESS
	LOADI	C,BI
	STOREF	[D+1],C

	; CORRECT THE FRAME
	LOAD	A,[PBUFFER]
	LOAD	B,[PBUFFER+1]
	SHIFTL	B
	SHIFTL	A
	BRNC	2F
	ADDI	B,0X01
2:	STORE	[PBUFFER],A
	STORE	[PBUFFER+1],B
	LOAD	A,[PBUFFER+2]
	LOAD	B,[PBUFFER+3]
	SHIFTL	B
	SHIFTL	A
	BRNC	2F
	ADDI	B,0X01
2:	STORE	[PBUFFER+2],A
	STORE	[PBUFFER+3],B
	LOAD	A,[PBUFFER+4]
	LOAD	B,[PBUFFER+5]
	SHIFTL	B
	SHIFTL	A
	BRNC	2F
	ADDI	B,0X01
2:	STORE	[PBUFFER+4],A
	STORE	[PBUFFER+5],B
	LOAD	A,[PBUFFER+11]
	LOAD	B,[PBUFFER+12]
	SHIFTL	B
	SHIFTL	A
	BRNC	2F
	ADDI	B,0X01
2:	STORE	[PBUFFER+11],A
	STORE	[PBUFFER+12],B
	
	LOAD	A,[PBUFFER+6]
	SHIFTL	A
	LOADI	B,0X1F
	CMP	A,B
	BRBE	2F
	MOV	A,B
2:	STORE	[PBUFFER+6],A

	; SET I/O DIRECTION
	LOAD	A,[PBUFFER+7]
	SHIFTL	A
	SHIFTL	A
	SHIFTR	A
	SHIFTR	A
	ADDI	A,0X80
	STORE	[PBUFFER+7],A
	
	; COPY TO AY-3-8910
	LOADI	C,13
0:	LOADF	A,[C+PBUFFER]
	STORE	[AY0_ADR],C
	STORE	[AY1_ADR],C
	STORE	[AY0_WR],A
	STORE	[AY1_WR],A
	SUBI	C,1
	BRC	0B

	; WAIT FOR 50 HZ OR KEYSTROKE
WAITL:	LOADI	B,S_STAT
	LOADI	C,@+2
	JUMP	SYSCALL
	ADDI	A,0
	BRNZ	8F
	
	; CHECK 50 HZ SIGNAL
		
	; WAIT FOR 50 HZ FLAG
	LOADI	A,14
	STORE	[AY1_ADR],A
	NOOP
	NOOP
	LOAD	A,[AY1_RD]
	SHIFTR	A
	BRNC	WAITL

	; RESET 50 HZ FLAG
	LOADI	A,15
	STORE	[AY1_ADR],A
	LOADI	A,0
	STORE	[AY1_WR],A
	LOADI	A,1
	STORE	[AY1_WR],A
	JUMP	9F

8:	LOADI	A,0XFF
	ADDI	D,2
	JUMP	IRET

9:	LOADI	A,0
	ADDI	D,2
	JUMP	IRET

	; ZERO BANK VARIABLES
.BANK	0
.BSS

	; COMMAND LINE ARGUMENTS
.DEFL BYTE ARGC		0
.DEFL BYTE ARGV		0,0

	; VARIOUS MISC VARIABLES
	; TO BE USED IN LEAF-FUNCTIONS
.DEFL BYTE SPARK	0

	; READ IN STATE
.DEFL WORD SECADDR	0
.DEFL BYTE BANK		0
.DEFL BYTE POINTER	0

	; PLAYBACK STATE
.DEFL BYTE STATE	0
.DEFL BYTE COUNTER	0

	; PLAYBACK REGISTER BUFFER
.DEFL BYTE PBUFFER	0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0

	; ERROR BANK 0
.BANK	BD
.DATA
ERR0_B	= BD

	; INVALID ARGUMENTS
.DEFL BYTE ERROR00	"INVALID ARGUMENTS",0X0A,0X0D,
			"USAGE: YMPLAY",0X0A,0X0D,0

BD	= BD+1	