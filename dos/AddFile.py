#!/bin/python3
#
# AddFile.py
#
# Adds a file to a DOS/281 filesystem
#
# Usage: AddFile.py dos281.img [user space] [file 0] [file 1] ...
import sys
import os

def main():
    print("i281 DOS/281 File Add Utility V0.1")
    print("SD Group 24-14")
    print("Updated Jan 18, 2024")
    
    # Read in the DOS/281 image file
    image_f = open(sys.argv[1], mode="rb")
    image = image_f.read()
    
    # Get user space
    user_space = int(sys.argv[2])
    if user_space > 9 or user_space < 0:
        print("Error: Invalid user space (0-9)")
    
    # Read in the files that will be inserted
    for i in range(len(sys.argv)-3):
        i += 3
        
        # Open file
        new_f = open(sys.argv[i], mode="rb")
        new = new_f.read()
        
        # Get filename
        filename = os.path.basename(sys.argv[i]).upper().split(".")
        
        # Allocate a new record
        record = newrec(image);
        
        # Mark record as allocated
        image[record] = 0xFF
        
        # Mark user space
        image[record+1] = ord('0') + user_space
        
        # Insert file name
        for o in range(6):
            if o < len(filename[0]):
                ch = ord(filename[0][o])
                
                if (ord('0') <= ch and ch <= ord('9')) or (ord('A') <= ch and ch <= ord('Z')) or ch == ord('-') or ch == ord('_'):
                    image[record+o+2] = ch
                else:
                    print("Error: Invalid character in filename")
                    sys.exit(1)
            else:
                image[record+o+2] = ord(' ')
                
        # Insert file extension
        for o in range(2):
            if o < len(filename[0]):
                ch = ord(filename[0][o])
                
                if (ord('0') <= ch and ch <= ord('9')) or (ord('A') <= ch and ch <= ord('Z')) or ch == ord('-') or ch == ord('_'):
                    image[record+o+8] = ch
                else:
                    print("Error: Invalid character in filename")
                    sys.exit(1)
            else:
                image[record+o+8] = ord('-')
        
        # Insert file size
        size = len(new)
        
        # Close file
        new_f.close()
        
    image_f.close()
    
    
    
    
# Finds a file record that is empty
# Returns address of the empty record
def newrec(image):
    pointer = 17 * 512
    
    for i in range(256 * 256 * 32):
        if image[pointer] == 0x00:
            return pointer
    
        if image[pointer+15] == 0xFF:
            break;
            
        pointer += 16
        
    print("Error: Unable to find empty file record")
    sys.exit(1)
    
    
# Allocate a block in the allocation bitmap
# Updates allocation bitmap and returns physical block address
def alloc(image):
    pointer = 1 * 512
    
    for i in range(16 * 512):
        if image[pointer] != 0xFF:
            b = image[pointer]
            o = 0
            for oi in range(8):
                if b & 0x01 == 0:
                    break;
                    
                o += 1
                b = b >> 1
                
            image[pointer] |= 1 << o
            return (i * 8) + o
        
        pointer += 1
        
    print("Error: Unable to allocate new block")
    sys.exit(1)
    
if __name__ == "__main__":
    main()