; SQP1.S
; AY-3-8910 SQT CHIPTUNE DRIVER
; GAVIN TERSTEEG, 2024
; SDMAY24-14

; AY-3-8910 IO ADDRESSES
MEGAIO	= 0XB0
AY0_ADR	= MEGAIO+0
AY1_ADR = MEGAIO+2
AY0_WR	= MEGAIO+1
AY1_WR	= MEGAIO+3
AY0_RD	= MEGAIO+0
AY1_rD	= MEGAIO+2

; MODULE HEADER STUFF
SQ_MSIZ	= 0X0	; SIZE
SQ_MSMP	= 0X2	; SAMPLES POINTER
SQ_MORP	= 0X4	; ORNAMENTS POINTER
SQ_MPAP	= 0X6	; PATTERNS POINTERS
SQ_MPOP	= 0X8	; POSITIONS POINTER
SQ_MLOP	= 0XA	; LOOP POINTER

	; SQT PLAYBACK WORK BANK
.BANK	BD
.DATA
SQTW_B	= BD

	; DELAY
.DEFL BYTE SQ_DELAY	0

	; DELAY COUNT
.DEFL BYTE SQ_DCNT	0

	; LINE COUNT
.DEFL BYTE SQ_LCNT	0

	; POSITION POINTER
.DEFL WORD SQ_PPNTR	0

	; CURRENT CHANNEL BEING PROCESSED
.DEFL BYTE SQ_CHAN	0

	; ADDRESS IN PATTERN
.DEFL WORD SQ_PTTRN	0,0,0

	; SAMPLE POINTER
.DEFL WORD SQ_SPNTR	0,0,0

	; POINT IN SAMPLE
.DEFL WORD SQ_SPNT	0,0,0

	; ORNAMENT POINTER
.DEFL WORD SQ_OPNTR	0,0,0

	; POINT IN ORNAMENT
.DEFL WORD SQ_OPNT	0,0,0

	; TON
.DEFL WORD SQ_TON	0,0,0

	; IX27 (UNKNOWN)
.DEFL WORD SQ_IX27	0,0,0

	; VOLUME
.DEFL BYTE SQ_VOL	0,0,0

	; AMPLITUDE
.DEFL BYTE SQ_AMP	0,0,0

	; NOTE
.DEFL BYTE SQ_NOTE	0,0,0

	; IX21 (UNKOWN)
.DEFL BYTE SQ_IX21	0,0,0

	; TON SLIDE STEP
.DEFL WORD SQ_TONSS	0,0,0

	; CURRENT TON SLIDING
.DEFL WORD SQ_CTONS	0,0,0

	; SAMPLE TICK COUNTER
.DEFL BYTE SQ_STIKC	0,0,0

	; ORNAMENT TICK COUNTER
.DEFL BYTE SQ_OTIKC	0,0,0

	; TRANSPOSIT
.DEFL BYTE SQ_TRANS	0,0,0

	; ENABLED
.DEFL BYTE SQ_ENBL	0,0,0

	; ENVELOPE ENABLED
.DEFL BYTE SQ_EENBL	0,0,0

	; ORNAMENT ENABLED
.DEFL BYTE SQ_OENBL	0,0,0

	; GLISS
.DEFL BYTE SQ_GLISS	0,0,0

	; MIX NOISE
.DEFL BYTE SQ_MNOIS	0,0,0

	; MIX TON
.DEFL BYTE SQ_MTON	0,0,0

	; B4IX0 (UNKOWN)
.DEFL BYTE SQ_B4IX0	0,0,0

	; B4IX0 (UNKOWN)
.DEFL BYTE SQ_B6IX0	0,0,0

	; B4IX0 (UNKOWN)
.DEFL BYTE SQ_B7IX0	0,0,0


	; START OF SQT PLAYBACK STACK
.ORG	0X7E
.DEFL BYTE SQSTACK	0,0

BD	= BD+1 

	; SQT FREQUENCY TABLE 0
.BANK	BD
.DATA
SQFR0_B	= BD

.DEFL BYTE SQFREQ0	0X0D, 0X0C, 0X0B, 0X0B, 0X0A, 0X0A, 0X09, 0X08,
			0X08, 0X07, 0X07, 0X07, 0X06, 0X06, 0X05, 0X05,
			0X05, 0X05, 0X04, 0X04, 0X04, 0X03, 0X03, 0X03,
			0X03, 0X03, 0X02, 0X02, 0X02, 0X02, 0X02, 0X02,
			0X02, 0X01, 0X01, 0X01, 0X01, 0X01, 0X01, 0X01,
			0X01, 0X01, 0X01, 0X01, 0X01, 0X00, 0X00, 0X00,
			0X00, 0X00, 0X00, 0X00, 0X00, 0X00, 0X00, 0X00,
			0X00, 0X00, 0X00, 0X00, 0X00, 0X00, 0X00, 0X00,
			0X00, 0X00, 0X00, 0X00, 0X00, 0X00, 0X00, 0X00,
			0X00, 0X00, 0X00, 0X00, 0X00, 0X00, 0X00, 0X00, 
			0X00, 0X00, 0X00, 0X00, 0X00, 0X00, 0X00, 0X00,
			0X00, 0X00, 0X00, 0X00, 0X00, 0X00, 0X00, 0X00

BD	= BD+1

	; SQT FREQUENCY TABLE 1
.BANK	BD
.DATA
SQFR1_B	= BD

.DEFL BYTE SQFREQ1	0X5D, 0X9C, 0XE7, 0X3C, 0X9B, 0X02, 0X73, 0XEB,
			0X6B, 0XF2, 0X80, 0X14, 0XAE, 0X4E, 0XF4, 0X9E,
			0X4F, 0X01, 0XB9, 0X75, 0X35, 0XF9, 0XC0, 0X8A,
			0X57, 0X27, 0XFA, 0XCF, 0XA7, 0X81, 0X5D, 0X3B,
			0X1B, 0XFC, 0XE0, 0XC5, 0XAC, 0X94, 0X7D, 0X68,
			0X53, 0X40, 0X2E, 0X1D, 0X0D, 0XFE, 0XF0, 0XE2,
			0XD6, 0XCA, 0XBE, 0XB4, 0XAA, 0XA0, 0X97, 0X8F,
			0X87, 0X7F, 0X78, 0X71, 0X6B, 0X65, 0X5F, 0X5A,
			0X55, 0X50, 0X4C, 0X47, 0X43, 0X40, 0X3C, 0X39,
			0X35, 0X32, 0X30, 0X2D, 0X2A, 0X28, 0X26, 0X24,
			0X22, 0X20, 0X1E, 0X1C, 0X1B, 0X19, 0X18, 0X16,
			0X15, 0X14, 0X13, 0X12, 0X11, 0X10, 0X0F, 0X0E

BD	= BD+1 

BI	= BI+1
.TEXT
.BANK	BI
SQT0_B	= BI

	; INITALIZE THE SQT PLAYER
SQINIT:	LOADI	A,0

	; FILL WORKSPACE WITH ZEROS
	LOADI	B,0
	LOADI	C,SQTW_B
	STORE	[DBANK],C
0:	STOREF	[B],A
	ADDI	B,1
	BRNN	0B

	; SET DELAY, DELAY COUNTER, AND LINE COUNTER TO 1
	LOADI	A,1
	STORE	[SQ_DELAY],A
	STORE	[SQ_DCNT],A
	STORE	[SQ_LCNT],A

	LOADI	C,0
	STORE	[DBANK],C
	JUMP	IRET

	; UPDATE THE SQT PLAYER
	; SHOULD BE CALLED 50 TIMES PER SECOND
SQPLAY:JUMP	IRET

	; RESET THE SQT PLAYER
	; AY-3-8910 CHIPS WILL BE MUTED
SQRSET:JUMP	IRET

	; WAIT FOR THE 50 HZ TIMER
SQWAIT:JUMP	IRET