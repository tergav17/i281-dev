I281_ASM = "../../i281as"

all: binary/hello.sav

binary/%.sav: source/%.s
	$(I281_ASM) -o $* source/$*.s
	mv $*.sav binary/$*.sv
	mv $*.lst listing
	
clean:
	rm listing/*
	rm binary/*