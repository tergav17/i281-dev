I281_ASM = "../../i281as"

all: binary/monitor.sav

binary/%.sav: source/%.s
	$(I281_ASM) -l -o $* source/$*.s
	mv $*.sav binary
	mv $*.lst listing
	
clean:
	rm listing/*
	rm binary/*