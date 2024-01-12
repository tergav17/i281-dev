I281_ASM = "../../i281as"

all: binary/monitor.sav

binary/%.sav: source/%.s
	$(I281_ASM) -l -o $* source/$*.s
	mv $*.sav binary
	mv $*.lst listing
	python3 GenerateBin.py binary/$*.sav binary/$*_low.bin binary/$*_high.bin listing/$*_bin.txt
	
clean:
	rm listing/*
	rm binary/*