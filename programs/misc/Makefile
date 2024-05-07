I281_ASM = "../../i281as"

all: binary/50test.sav binary/aytest.sav binary/cfdrvr.sav

binary/%.sav: source/%.s
	$(I281_ASM) -o $* source/$*.s
	mv $*.sav binary
	mv $*.lst listing
	
clean:
	rm listing/*
	rm binary/*