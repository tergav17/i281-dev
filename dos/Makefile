I281_ASM = "../i281as"

all: mbr.sav

%.sav: %.s
	$(I281_ASM) -l -o $* $*.s
	python3 GenerateImage.py mbr.sav
	
clean:
	rm *.sav *.lst