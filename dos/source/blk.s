; BLK.S
; BLOCK DEVICE DRIVER
; (COMPACT FLASH VERSION)

.BANK BI
BLK0_B	= BI
.TEXT

	; BLOCK DEVICE INIT
	; SET UP THE COMPACT FLASH CARD
	; ASSUMES WORK BANK IS SELECTED
	; USES: A, B, C
BLKINIT:LOADI	C,@+2
	JUMP	CFWAIT
	
	; SET LBA3 TO 0XE0
	LOADI	A,0XE0
	STORE	[CF_LBA3],A
	
	; SET 8 BIT MODE
	LOADI	A,CF_8BIT
	STORE	[CF_FEAT],A
	LOADI	A,CF_SETF
	STORE	[CF_CMD],A
	
	; NOW DISABLE THE CACHE
	LOADI	C,@+2
	JUMP	CFWAIT
;	LOADI	A,CF_DCAC
;	STORE	[CF_FEAT],A
;	LOADI	A,CF_SETF
;	STORE	[CF_CMD],A

	JUMP	BLKDONE

	; READS A BLOCK (512 BYTES) FROM THE BLOCK DEVICE
	; CONTENTS WILL BE PLACED IN 4 SEQUENTIAL DATA BANKS
	; ASSUMES WORK BANK IS SELECTED
	; A = LOWEST DESTINATION DATA BANK
	; RETURNS A = 0X00
	; USES: A, B, C, D0
BLKREAD:LOADI	C,@+2
	JUMP	CFADDR
	
	; EXECUTE THE READ COMMAND AND WAIT
	LOADI	B,CF_READ
	STORE	[CF_CMD],B
	LOADI	C,@+2
	JUMP	CFWAIT
	
	; COPY INTO 4 DATA BANKS
	LOADI	C,4
0:	STORE	[D0],A
	STORE	[DBANK],A
	LOADI	A,0
	
	; COPY 128 BYTES
1:	LOAD	B,[CF_DATA]
	STOREF	[A],B
	ADDI	A,1
	BRNN	1B
	
	; NEXT BANK?
	LOADI	A,WORK_B
	STORE	[DBANK],A
	LOAD	A,[D0]
	ADDI	A,1
	SUBI	C,1
	BRNZ	0B
	
	; OPERATION COMPLETE
	LOADI	A,0
	JUMP	BLKDONE
	
	; WRITES A BLOCK (512 BYTES) TO THE BLOCK DEVICE
	; CONTENTS WILL BE TAKEN FROM 4 SEQUENTIAL DATA BANKS
	; ASSUMES WORK BANK IS SELECTED
	; A = LOWEST SOURCE DATA BANK
	; RETURNS A = 0X00
	; USES: A, B, C, D0
BLKWRIT:LOADI	C,@+2
	JUMP	CFADDR
	
	; EXECUTE THE WRITE COMMAND AND WAIT
	LOADI	B,CF_WRIT
	STORE	[CF_CMD],B
	LOADI	C,@+2
	JUMP	CFWAIT
	
	; COPY OUT OF 4 DATA BANKS
	LOADI	C,4
0:	STORE	[D0],A
	STORE	[DBANK],A
	LOADI	A,0
	
	; COPY 128 BYTES
1:	LOADF	B,[A]
	STORE	[CF_DATA],B
	ADDI	A,1
	BRNN	1B
	
	; NEXT BANK?
	LOADI	A,WORK_B
	STORE	[DBANK],A
	LOAD	A,[D0]
	ADDI	A,1
	SUBI	C,1
	BRNZ	0B
	
	; OPERATION COMPLETE
	LOADI	A,0
	JUMP	BLKDONE

	; SET THE LBA ADDRESS OF THE CF CARD
	; USING THE BLOCK ADDRESS ON THE WORK BANK
	; BLOCK COUNT IS ALSO SET
	; AFTER THAT, A WAIT IS PERFORMED SO A
	; COMMAND CAN BE EXECUTED AFTER
	; USES: B
CFADDR:	LOAD	B,[BLK+1]
	STORE	[CF_LBA0],B
	LOAD	B,[BLK]
	STORE	[CF_LBA1],B
	LOADI	B,0
	STORE	[CF_LBA2],B
	LOADI	B,0XE0
	STORE	[CF_LBA3],B
	LOADI	B,1
	STORE	[CF_CNT],B

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


	; INTERNAL BLK FUNCTION TO RESET TO WORK BANK AND RETURN
BLKDONE:LOADI	C,WORK_B
	STORE	[DBANK],C
	JUMP	IRET

	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI-1
