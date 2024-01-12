#!/bin/python3
#
# GenerateBin.py
#
# Turns a .SAV file into ROM images that can be burned
# Also generates a file that can be hard-coded into the emulator

import sys

def main():
    print("i281 SAV To Binary Utility V0.1")
    print("SD Group 24-14")
    print("Updated Jan 11, 2024")
    
    # Read in the data file
    input = open(sys.argv[1], mode="rb")
    data = input.read()
    
    # Create output data files
    output_low = open(sys.argv[2], mode="wb")
    output_high = open(sys.argv[3], mode="wb")
    output_txt = open(sys.argv[4], mode="w")
    
    # Output low and high bytes
    for i in range(128):
        output_high.write((data[256 + (i * 2)]).to_bytes(1, byteorder='big'));
        output_low.write((data[256 + (i * 2) + 1]).to_bytes(1, byteorder='big'));
    
    # Output javascript snippet
    output_txt.write("// Setup BIOS\ncpu_state.bios = [\n//	0x01	0x01	0x02	0x03	0x04	0x05	0x06	0x07\n");
    for i in range(16):
        for o in range(8):
            output_txt.write("\t0x%02X" % (data[256 + i * 16 + o * 2]))
            output_txt.write("%02X" % (data[256 + i * 16 + o * 2 + 1]))
            
            if i != 15 or o != 7:
                output_txt.write(",");
            else:
                output_txt.write(" ");
            
        output_txt.write(" // 0x%02X\n" % (i*8))
    
    output_txt.write("];")
    
    # Close all files
    input.close()
    output_low.close()
    output_high.close()
    output_txt.close()

if __name__ == "__main__":
    main()