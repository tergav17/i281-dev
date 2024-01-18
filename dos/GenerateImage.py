#!/bin/python3
#
# GenerateImage.py
#
# Uses a master boot record and file system characteristics
# to generate an empty file system image for DOS/281
#
# Usage: GenerateImage.py mbr.sav [# blocks total] [# blocks for records]
# as a rule, each record block can store 32 file records
#
# File record format (16 bytes):
# 0:     FILE ALLOCATED TAG
#   0X00 = UNALLOCATED
#   0XFF = ALLOCATED
# 1:     USER AREA
#   '0'-'9' FOR USER AREA
# 2-7:   FILE NAME
#   'A'-'Z','0'-'9','-','_'
# 8-9:   FILE EXTENSION
#   'A'-'Z','0'-'9','-','_'
# 10     FILE SIZE IN BLOCKS
#   # OF BLOCKS + 1
# 11-12: UNUSED
# 13-14: FILE RECORD BLOCK
#   16 BIT PHYSICAL ADDRESS OF FILE
# 15:    NEXT RECORD / END RECORD
#   0X00 = HAS NEXT RECORD
#   0X01 = NEXT RECORD ON NEXT BLOCK
#   0XFF = END OF RECORD 
import sys

def main():
    print("i281 DOS/281 FS Generate V0.1")
    print("SD Group 24-14")
    print("Updated Jan 16, 2024")
    
    # Read in the master boot record
    mbr_f = open(sys.argv[1], mode="rb")
    mbr = mbr_f.read()
    
    # Get file system parameters
    allocated_start = 1 + 16 + int(sys.argv[3]);
    allocated_end = (256 * 256) - int(sys.argv[2]);
    
    # Create image file
    image = open("dos281.img", mode="wb")
    
    # Output MBR to image file
    for o in range(512):
        image.write((mbr[o]).to_bytes(1, byteorder='big'));
        
    # Output the allocation bitmap

    # Output the rest of the filesystem as empty
    # for o in range((512 * 256 * 256) - 512):
    #    image.write((0).to_bytes(1, byteorder='big'));
    image.truncate(512 * 256 * 256);

    # Close all files
    mbr_f.close()
    image.close()

if __name__ == "__main__":
    main()