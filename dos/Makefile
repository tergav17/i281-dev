I281_ASM = "../i281as"

all: dos281.img

dos281.img: binary/mbr.sav binary/kernel.sav apps/binary/* other/*
	python3 GenerateImage.py binary/mbr.sav 65536 32
	python3 AddFile.py dos281.img 0 apps/binary/* other/*

binary/%.sav: source/*.s
	cd source; ../$(I281_ASM) -o ../mbr common.s mbr.s
	cd source; ../$(I281_ASM) -o ../kernel common.s low.s core.s tty.s blk.s fs.s
	cp kernel.sav apps/binary/kernel.sy
	mv *.sav binary
	mv *.lst listing

clean:
	rm listing/*
	rm binary/*