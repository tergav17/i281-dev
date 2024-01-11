all:
	make -C as
	make -C programs
	
clean:
	make -C as clean
	make -C programs clean