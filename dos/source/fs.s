; FS.S
; FILE SYSTEM HANDLING ROUTINES

.BANK BI
FS0_B	= BI
.TEXT
	; SET SEARCH PARAMETERS
	; USING A STRING IN USER SPACE, THE FILE SEARCH PATTERN WILL
	; BE UPDATED
	; THE FILE SEARCH POINTER WILL ALSO BE RESET
	; ASSUMES WORK BANK IS SELECTED
	; A = ADDRESS OF STRING
	; [SRC_BNK] = DATA BANK OF STRING
	; RETURNS A=0X00 IF PATTERN IS VALID, OTHERWISE 0XFF
	; 0XFE CAN BE RETURNED IF THERE NEVER IS A '.' IN THE FILE
	; USES: A, B, C, M0, M1, M2
SSPARAM:STORE	[M0],A

	; STORE PATTERN COUNTER
	LOADI	A,6
	STORE	[M1],A
	
	; STORE PATTERN POINTER
	LOADI	A,PATTERN
	STORE	[M2],A
	
	; RESET THE PATTERN
	LOADI	A,PATTERN
	LOADI	B,8
	LOADI	C,0X20
0:	STOREF	[A],C
	ADDI	A,1
	SUBI	B,1
	BRNZ	0B
	
	; DO AN INITAL CHECKOUT OF THE PATTERN
	LOAD	A,[SRC_BNK]
	LOAD	B,[M0]
	STORE	[DBANK],A
	
	; MAKE SURE THERE IS ACTUALLY A PATTERN
	LOADF	C,[B]
	LOADI	A,0X20
	CMP	A,C
	BRAE	9F
	
	; SEE IF THERE IS A USER AREA PREFIX
	; AND CHANGE BANK TO KERNEL WORK AREA
	LOADF	A,[B+1]
	SUBI	A,':'
	LOADI	A,WORK_B
	STORE	[DBANK],A
	BRNZ	1F
	
	; MAKE SURE THAT THE USER AREA PREFIX IS VALID
	LOADI	A,'0'
	CMP	C,A
	BRB	9F
	LOADI	A,'9'
	CMP	C,A
	BRA	9F

	; SET THE WORKING USER AREA
	STORE	[WRK_USR],C
	
	; AND SKIP THE PREFIX
	ADDI	B,2
	STORE	[M0],B

	; GRAB THE NEXT CHARACTER
	; C = NEXT CHARACTER
1:	LOAD	B,[M0]
	LOAD	A,[SRC_BNK]
	STORE	[DBANK],A
	LOADF	C,[B]
	LOADI	A,WORK_B
	STORE	[DBANK],A
	
	; INCREMENT AND SAVE POINTER INTO M0
	ADDI	B,1
	STORE	[M0],B
	
	; GRAB PATTERN POINTER
	LOAD	A,[M2]
	
	; SEE IF THE PATTERN IS COMPLETE
	; AND GRAB PATTERN COUNTER
	LOADI	B,0X20
	CMP	B,C
	LOAD	B,[M1]
	BRAE	6F
	
	
	
	; SEE IF IT IS A '.'
	SUBI	C,'.'
	BRZ	5F
	
	; THERE MUST BE SPACE IN THE PATTERN BUFFER FOR ANY
	; OF THE NEXT VALUES TO BE VALID
	; LETS CHECK IT
	SUBI	B,1
	BRN	9F
	
	; SEE IF IT IS A '*'
	SUBI	C,'*'-'.'
	BRZ	3F
	
	; OTHERWISE, IT'S A NORMAL CHARACTER
	; PLACE IT IN THE BUFFER AND MOVE ON
	ADDI	C,'*'
	STOREF	[A],C
	ADDI	A,1
2:	STORE	[M2],A
	STORE	[M1],B
	JUMP	1B

	; HANDLE '*'
	; FILL REST OF PATTERN SECTION WITH '?'
3:	ADDI	B,1
	LOADI	C,'?'
4:	STOREF	[A],C
	ADDI	A,1
	SUBI	B,1
	BRNZ	4B
	JUMP	2B
	
	; HANDLE '.'
	; MAKE SURE THE LAST 2 BYTES OF THE PATTERN BUFFER ARE EMPTY
	; AND THERE HASN'T BEEN A '.' ALREADY
5:	LOADI	C,PATTERN+6
	ADD	A,B
	CMP	A,C
	BRA	9F
	
	; SET THE NEW PATTERN POINTER
	LOADI	A,PATTERN+6
	LOADI	B,2
	JUMP	2B

	; PATTERN IS COMPLETE
	; MAKE SURE ALL FIELDS HAVE BEEN FILLED IN
6:	LOADI	C,PATTERN+6
	CMP	A,C
	BRBE	7F
	LOADI	A,0
	JUMP	FS0DONE
	
	; CHECK TO SEE IF A '.' HAS BEEN PLACED
7:	ADD	A,B
	CMP	A,C
	BRNZ	9F
	LOADI	A,0XFE
	JUMP	FS0DONE
	
	; PATTERN IS INVALID
9:	LOADI	A,0XFF
	JUMP	FS0DONE
	
		
	; FILE RECORD FORMAT (16 BYTES)
	; 0:     FILE ALLOCATED TAG
	;   0X00 = UNALLOCATED
	;   0XFF = ALLOCATED
	; 1:     USER AREA
	;   '0'-'9' FOR USER AREA
	; 2-7:   FILE NAME
	;   'A'-'Z','0'-'9','-','_'
	; 8-9:   FILE EXTENSION
	;   'A'-'Z','0'-'9','-','_'
	; 10-11  FILE SIZE IN BLOCKS
	; 12:    UNUSED
	; 13-14: FILE BLOCK TABLE ADDRESS
	;   16 BIT PHYSICAL ADDRESS OF BLOCK TABLE
	; 15:    NEXT RECORD / END RECORD
	;   0X00 = HAS NEXT RECORD
	;   0X01 = NEXT RECORD ON NEXT BLOCK
	;   0XFF = END OF RECORD 
	
	; SEARCHES THE FILE RECORDS UNTIL ONE MATCHING THE CURRENT PATTERN
	; IS FOUND OR ALL RECORDS ARE EXHAUSTED
	; ASSUMES WORK BANK IS SELECTED
	; A = 0 TO RESET THE SEARCH, 1 TO CONTINUE TO NEXT ENTRY
	; A RETURNS 0X00 IF FOUND, OTHERWISE 0XFF IS RETURNED
	; USES: A, B, C, M0, M1, M2
FSEARCH:LOADI	B,MATCH
	STORE	[M2],B
	ADDI	A,0
	LOADI	B,FS1_B
	LOADI	C,FSNEXT
	BRNZ	INDIR
	
	; RESET SEARCH STATE
	LOADI	A,17
	STORE	[SRCH_LO],A
	
	; CHECK THE RECORD
	LOADI	C,FSSTART
	JUMP	INDIR
	
	; OPENS THE FILE THAT IS CURRENTLY BEING POINTED
	; TO BE THE FILE SEARCH STATE
	; DUE TO THIS, FOPEN MUST BE RUN IMMEDIATELY
	; AFTER A FILE SEARCH
	; ASSUMES WORK BANK IS SELECTED
	; A RETURNS 0X00 IF SUCCESSFUL, OTHERWISE 0XFF IS RETURNED
	; USES: A, B, C, M0
FOPEN:	LOADI	B,FS1_B
	LOADI	C,FOPENA
	JUMP	INDIR
	
	; CLOSES ANY FILES THAT ARE OPEN
	; ALL BUFFERS WILL BE FLUSHED AFTER THE OPERATION COMPLETES
	; USES: A, B, C
FCLOSE:	JUMP	FS0DONE

	; READS A BLOCK OUT OF THE CURRENTLY OPEN FILE
	; THE AND ERROR IS RETURNED IF THE BLOCK IS OUTSIDE OF THE CURRENT
	; FILE SIZE
	; A FILE MUST CURRENTLY BE OPEN
	; A = BLOCK TO READ
	; [SRC_BNK] = DESTINATION OF READ DATA
	; ASSUMES WORK BANK IS SELECTED
	; A RETURNS 0X00 IF SUCCESSFUL, OTHERWISE 0XFF IS RETURNED
	; USES: A, B, C, M0
FREAD:	LOADI	B,FS2_B
	LOADI	C,FREADA
	JUMP	INDIR



	; INTERNAL FS0 FUNCTION TO RESET TO WORK BANK AND RETURN
FS0DONE:LOADI	C,WORK_B
	STORE	[DBANK],C
	JUMP	IRET

	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI-1
.BANK BI
FS1_B	= BI
.TEXT

	; START THE FILE SEARCH ON A BLOCK
	; RESET INTER-BLOCK SEARCH STATE
	; AND READ THE BLOCK
	; THEN EXECUTE FSCHECK
	; ASSUMES WORK BANK IS SELECTED
	; USES: A, B, C
FSSTART:LOADI	A,0
	STORE	[SRCH_RP],A
	LOADI	A,KBUF_B
	STORE	[SRCH_BK],A
	
	; SET ADDRESS FOR READ
	LOADI	B,0
	STORE	[BLK],B
	LOAD	B,[SRCH_LO]
	STORE	[BLK+1],B
	
	; AND EXECUTE A READ INTO THE KBUF
	SUBI	D,2
	LOADI	C,FS1_B
	STOREF	[D+1],C
	LOADI	C,@+5
	STOREF	[D],C
	LOADI	B,BLK0_B
	LOADI	C,BLKREAD
	JUMP	INDIR
	ADDI	D,2

	; FILE SEARCH CHECK
	; USING THE CURRENT SEARCH STATE, THE RECORD WILL BE CHECKED
	; AGAINST THE CURRENT PATTERN
	; ASSUMES WORK BANK IS SELECTED
	; A RETURNS 0X00 IF FOUND, OTHERWISE FSNEXT IS CALLED
	; USES: A, B, C, M0, M1
FSCHECK:LOADI	C,10
	STORE	[M1],C

	; RECORD THE CURRENT RECORD ENDING
	LOAD	A,[SRCH_RP]
	LOAD	B,[SRCH_BK]
	STORE	[DBANK],B 
	LOADF	C,[A+15]
	LOADI	B,WORK_B
	STORE	[DBANK],B
	STORE	[SRCH_LS],C
	
	; GET THE PATTERN TO MATCH AGAINST
	LOAD	C,[M2]
	
	; GET BYTE OF MATCH PATTERN
0:	STORE	[M0],C
	LOADF	C,[C]
	SUBI	C,'?'
	BRZ	1F
	ADDI	C,'?'
	
	; SWITCH TO RECORD BANK
	LOAD	B,[SRCH_BK]
	STORE	[DBANK],B
	
	; CHECK AGAINST THE RECORD POINTER
	LOADF	B,[A]
	CMP	B,C
	LOADI	B,WORK_B
	STORE	[DBANK],B
	BRNZ	FSNEXT
	
	; THAT ONE MATCHED, KEEP GOING
1:	ADDI	A,1
	LOAD	C,[M0]
	ADDI	C,1
	LOAD	B,[M1]
	SUBI	B,1
	STORE	[M1],B
	BRNZ	0B
	
	; WE HAVE A MATCH!
	LOADI	A,0
	JUMP	FS1DONE
	
	; INCREMENT TO THE NEXT RECORD
	; CHECK TO SEE IF THERE IS ACTUALLY A NEXT RECORD
FSNEXT:	LOADI	A,0XFF
	LOAD	B,[SRCH_LS]
	ADDI	B,0
	BRN	FS1DONE
	BRNZ	0F
	
	; INCREMENT TO NEXT RECORD ON BANK
	LOAD	A,[SRCH_RP]
	ADDI	A,16
	STORE	[SRCH_RP],A
	BRNN	FSCHECK
	
	; INCREMENT TO NEXT BANK
	LOADI	A,0
	STORE	[SRCH_RP],A
	LOAD	A,[SRCH_BK]
	ADDI	A,1
	STORE	[SRCH_BK],A
	JUMP	FSCHECK
	
	; MOVE ON TO NEXT BLOCK
0:	LOAD	A,[SRCH_LO]
	ADDI	A,1
	STORE	[SRCH_LO],A
	JUMP	FSSTART
	
	; SHADOW OF FOPEN
FOPENA:	LOAD	B,[SRCH_RP]

	; SAVE THE STACK SO WE CAN USE THE REGISTER FOR TRANSFERS
	STORE	[M0],D
	
	; LOAD OPEN FILE SIZE
	LOAD	A,[SRCH_BK]
	STORE	[DBANK],A
	LOADF	C,[B+10]
	LOADF	D,[B+11]
	LOADI	A,WORK_B
	STORE	[DBANK],A
	STORE	[OF_SIZE],C
	STORE	[OF_SIZE+1],D
	
	; LOAD OPEN FILE BLOCK TABLE
	LOAD	A,[SRCH_BK]
	STORE	[DBANK],A
	LOADF	C,[B+13]
	LOADF	D,[B+14]
	LOADI	A,WORK_B
	STORE	[DBANK],A
	STORE	[OF_BTAB],C
	STORE	[OF_BTAB+1],D
	STORE	[BLK],C
	STORE	[BLK+1],D
	
	; RESTORE STACK AND SET OPEN FLAG
	LOAD	D,[M0]
	LOADI	A,0XFF
	STORE	[OF_OPEN],A
	
	; EXECUTE BLOCK READ
	LOADI	A,FBT_B
	LOADI	B,BLK0_B
	LOADI	C,BLKREAD
	JUMP	INDIR


	; INTERNAL FS1 FUNCTION TO RESET TO WORK BANK AND RETURN
FS1DONE:LOADI	C,WORK_B
	STORE	[DBANK],C
	JUMP	IRET

	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI-1
.BANK BI
FS2_B	= BI
.TEXT

	; SHADOW OF FREAD
	; ERROR IF NO FILE IS OPEN
FREADA:	LOAD	B,[OF_OPEN]
	ADDI	B,0
	BRZ	FS2ERR
	
	; CHECK SIZE
	LOAD	B,[OF_SIZE]
	ADDI	B,0
	BRNZ	0F
	LOAD	B,[OF_SIZE+1]
	CMP	A,B
	BRAE	FS2ERR
	
	; CALL FACONV
0:	LOADI	C,@+2
	JUMP	FACONV
	
	; GET THE BLOCK
	STORE	[M0],D
	STORE	[DBANK],B
	LOADF	C,[A+0]
	LOADF	D,[A+1]
	LOADI	B,WORK_B
	STORE	[DBANK],B
	STORE	[BLK],C
	STORE	[BLK+1],D	
	LOAD	D,[M0]
	
	; EXECUTE BLOCK READ
	LOADI	A,KBUF_B
	LOADI	B,BLK0_B
	LOADI	C,BLKREAD
	JUMP	INDIR


	; CONVERT TO BANK / ADDRESS FOR BLOCK TABLE LOOP
FACONV:	LOADI	B,FBT_B
	SHIFTL	A
	BRNC	0F
	ADDI	B,2
0:	SHIFTL	A
	BRNC	1F
	ADDI	B,1
1:	SHIFTR	A
	JUMPR	C
	
	
	; READ / WRITE ERROR
FS2ERR:	LOADI	A,0XFF
	
	; INTERNAL FS2 FUNCTION TO RESET TO WORK BANK AND RETURN
FS2DONE:LOADI	C,WORK_B
	STORE	[DBANK],C
	JUMP	IRET


	; BANK IS DONE, MOVE ON TO THE NEXT
BI	= BI-1