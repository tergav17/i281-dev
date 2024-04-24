; SIMPLE AY-3-8910 TEST
; GAVIN TERSTEEG, 2024

AY0_ADR	= 0XB0
AY1_ADR	= 0XB2
AY0_WR	= 0XB1
AY1_WR	= 0XB3
AY0_RD	= 0XB0
AY1_RD	= 0XB2

	; SET UP AY CHIPS
	LOADI	A,0XCE
	LOADI	B,0X07
	STORE	[AY0_ADR],B
	STORE	[AY1_ADR],B
	STORE	[AY0_WR],A
	STORE	[AY1_WR],A

	LOADI	A,0X0F
	LOADI	B,0X08
	STORE	[AY0_ADR],B
	STORE	[AY1_ADR],B
	STORE	[AY0_WR],A
	STORE	[AY1_WR],A

	; SET UP THE TONE LOOP
	LOADI	C,0
	LOADI	D,0

	; LOOP
LOOP:	LOADI	A,0
	STORE	[AY0_ADR],A
	STORE	[AY1_ADR],A
	STORE	[AY0_WR],C
	STORE	[AY1_WR],C
	LOADI	A,1
	STORE	[AY0_ADR],A
	STORE	[AY1_ADR],A
	STORE	[AY0_WR],D
	STORE	[AY1_WR],D

	; DELAY LOOP
	LOADI	A,0
0:	ADDI	A,1
	NOOP
	NOOP
	NOOP
	NOOP
	NOOP
	NOOP
	BRNC	0B

	; INCREMENT C AND D
	ADDI	C,1
	BRNC	LOOP
	ADDI	D,1
	LOADI	A,5
	CMP	A,D
	BRAE	LOOP
	LOADI	D,0
	JUMP	LOOP
	