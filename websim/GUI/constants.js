/* GUI Values */
const CODE_MEM_WIDTH = 400;
const CODE_MEM_HEIGHT = 1300;
const REGISTER_FILE_WIDTH = 380;
const REGISTER_FILE_HEIGHT = 515;
const MUX_WIDTH = 70;
const MUX_MIN_HEIGHT = 40;
const MUX_MAX_HEIGHT = 170;
const FLAGS_WIDTH = 150;
const FLAGS_HIEGHT = 90;

export const MUX_POLYGON = [0,0, MUX_WIDTH,MUX_MIN_HEIGHT, MUX_WIDTH,MUX_MAX_HEIGHT - MUX_MIN_HEIGHT, 0,MUX_MAX_HEIGHT];
export const MUX4_POlYGON = [0, 0, MUX_WIDTH, MUX_MIN_HEIGHT, MUX_WIDTH, MUX_MAX_HEIGHT - MUX_MIN_HEIGHT, 0, MUX_MAX_HEIGHT];
export const ALU_POLYGON = [0,0, 138,55, 138,275, 0,330, 0,220, 55, 193, 55,138, 0,110 ];
export const FLAGS_POLYGON = [0,0, FLAGS_WIDTH,0, FLAGS_WIDTH,FLAGS_HIEGHT, 0,FLAGS_HIEGHT];
export const CODE_MEM_POLYGON = [0,0, CODE_MEM_WIDTH,0, CODE_MEM_WIDTH,CODE_MEM_HEIGHT, 0,CODE_MEM_HEIGHT];
export const DATA_MEM_POLYGON = [0,0, 350,0, 350,680, 0,680];
export const OPCODE_DECODER_POLYGON = [0,0, 200,0, 200,100, 0,100];
export const CONTROL_POLYGON = [0,0, 750,0, 750,100, 0,100];
export const REGISTER_FILE_POLYGON = [0,0, REGISTER_FILE_WIDTH,0, REGISTER_FILE_WIDTH,REGISTER_FILE_HEIGHT, 0,REGISTER_FILE_HEIGHT];
export const PC_VALUE_POLYGON = [0,0, 200,0, 200,120, 0,120];
export const PC_UPDATE_POLYGON = [0,0, 200,0, 200,150, 0,150];
export const ARROW = [5,0, 10,0, 10, 40, 15, 40, 7.5,60, 0,40, 5,40];
export const LONGARROW = [5,0, 10,0, 10,56, 15,56, 7.5,76, 0,56, 5,56];
export const ALULONGARROW = [5,0, 10,0, 10,52, 15,52, 7.5,72, 0,52, 5,52];
export const REGISTER_BOX = [0, 0, 140, 0, 140, 30, 0, 30];
export const IMEM_BOX = [0, 0, 270, 0, 270, 30, 0, 30];

export const MUX_FALSE = [20, 40];
export const MUX_TRUE = [20, 145];
export const MUX_A = [10, 25];
export const MUX_B = [10, 60];
export const MUX_C = [10, 95];
export const MUX_D = [10, 130];

export const CONTROL_TPOS = [750/2, 30];
export const FLAG_TPOS = [70, 30];
export const FLAG_VPOS = [0, 70];

export const MUX0_OFFSET = [1200 , 700];
export const MUX1_OFFSET = [1600, 615];
export const MUX2_OFFSET = [1600, 1025];
export const MUX3_OFFSET = [2250, 660];
export const MUX4_OFFSET = [900 , 1150];

export const ALU_OFFSET = [1350, 500];
export const FLAGS_OFFSET = [1600, 450];
export const CODE_MEM_OFFSET = [90, 100];
var change = 10;
export const OPCODE_DECODER_OFFSET = [850, 100];
export const CONTROL_OFFSET = [1300, 100];
export const REGISTER_FILE_OFFSET = [640, 405];
export const PC_VALUE_OFFSET = [1050, 1170];
export const PC_UPDATE_OFFSET = [600, 1160];
export const DATA_MEM_OFFSET = [1800, 825];

export const INTERSECT_1_POS = [CODE_MEM_OFFSET[0] + CODE_MEM_WIDTH + 60, CODE_MEM_OFFSET[1] + 25];
export const INTERSECT_2_POS = [CODE_MEM_OFFSET[0] + CODE_MEM_WIDTH + 60, CODE_MEM_OFFSET[1] + (PC_UPDATE_OFFSET[1] - CODE_MEM_OFFSET[1] - 150)];
export const INTERSECT_3_POS = [CODE_MEM_OFFSET[0] + CODE_MEM_WIDTH + 60, CODE_MEM_OFFSET[1] + 25 + PC_UPDATE_OFFSET[1] + 175];
export const INTERSECT_4_POS = [MUX0_OFFSET[0] - 45 , CODE_MEM_OFFSET[1] + (PC_UPDATE_OFFSET[1] - CODE_MEM_OFFSET[1] - 150)];
export const INTERSECT_5_POS = [MUX1_OFFSET[0] + MUX_POLYGON[2]+ 480, MUX1_OFFSET[1] + 86];
export const INTERSECT_6_POS = [REGISTER_FILE_OFFSET[0] + REGISTER_FILE_WIDTH + 60, REGISTER_FILE_OFFSET[1] + 400];
export const INTERSECT_7_POS = [MUX1_OFFSET[0] + MUX_POLYGON[2] + 60, MUX1_OFFSET[1] + 87];
export const INTERSECT_8_POS = [MUX1_OFFSET[0] + MUX_POLYGON[2] + 60, MUX1_OFFSET[1] + 85 + ((DATA_MEM_OFFSET[1] - MUX1_OFFSET[1]) - 15) ];
export const INTERSECT_9_POS = [ MUX2_OFFSET[0] - 100, MUX2_OFFSET[1] + MUX_TRUE[1] - 15];

export const READ_A_MUX_OFFSET = [REGISTER_FILE_OFFSET[0] + REGISTER_FILE_WIDTH * 0.75, REGISTER_FILE_OFFSET[1] + 65];
export const READ_B_MUX_OFFSET = [REGISTER_FILE_OFFSET[0] + REGISTER_FILE_WIDTH * 0.75, REGISTER_FILE_OFFSET[1] + 315];


export const MUX_FALSE_WIRE = ["M", 0, MUX_MAX_HEIGHT*.23, "l", 72,48];
export const MUX_TRUE_WIRE = ["M", 0, MUX_MAX_HEIGHT*.77, "l", 72,-48];

export const MUX_A_WIRE = ["M", 0, MUX_MAX_HEIGHT*.15, "l", MUX_WIDTH, 60 ];
export const MUX_B_WIRE = ["M", 0, MUX_MAX_HEIGHT*.385, "l", MUX_WIDTH, 20 ];
export const MUX_C_WIRE = ["M", 0, MUX_MAX_HEIGHT*.62, "l", MUX_WIDTH, -20];
export const MUX_D_WIRE = ["M", 0, MUX_MAX_HEIGHT*.85, "l", MUX_WIDTH, -60];

export const MUX_ALU_WIRE = [0, 0, ALU_OFFSET[0] - (MUX0_OFFSET[0] + MUX_POLYGON[2]), 0];
export const ALU_RESULT_WIRE = [0, 0, MUX1_OFFSET[0] - (ALU_OFFSET[0] + ALU_POLYGON[2]), 0];
export const IMEM_DECODER_WIRE = [0, 0, OPCODE_DECODER_OFFSET[0] - (CODE_MEM_OFFSET[0] + CODE_MEM_WIDTH), 0];
export const OPCODE_DECODER_CONTROL_WIRE = [0, 0, CONTROL_OFFSET[0] - (OPCODE_DECODER_OFFSET[0] + OPCODE_DECODER_POLYGON[2]), 0];
export const ALU_FLAGS_WIRE = ["M", ALU_OFFSET[0] + ALU_POLYGON[2], ALU_OFFSET[1] + 100, "l", 70, 0,  0, -105 , "L", FLAGS_OFFSET[0], FLAGS_OFFSET[1] + FLAGS_HIEGHT/2 ];
export const FLAGS_CONTROL_WIRE = ["M", FLAGS_OFFSET[0] + FLAGS_POLYGON[2], FLAGS_OFFSET[1] + FLAGS_HIEGHT/2, "l", 30,0, 0,-130 ,-525, 0, 0, -200, 45, 0 ];
export const MUX_IMEM_WIRE = ["M", MUX1_OFFSET[0] + MUX_POLYGON[2]+ 400, MUX1_OFFSET[1] + 100, "l", 0, -(MUX1_OFFSET[1] + 100) , -(MUX1_OFFSET[0] + 350 + MUX_WIDTH), 0, 0, 200, 50, 0 ];
export const MUX_REG_FILE_WIRE = ["M", MUX3_OFFSET[0] + MUX_POLYGON[2], MUX3_OFFSET[1] + 85, "l", 25,0, 0,-(MUX3_OFFSET[1] - REGISTER_FILE_OFFSET[1] + 180), -(MUX3_OFFSET[0] - REGISTER_FILE_OFFSET[0] + 50 + MUX_WIDTH), 0, 0, 240, 25, 0 ];
export const MUX2_DMEM_WIRE = ["M", MUX2_OFFSET[0] + MUX_POLYGON[2], MUX2_OFFSET[1] + 85, "l", (DATA_MEM_OFFSET[0] - MUX2_OFFSET[0] - MUX_WIDTH), 0];
export const MUX1_DMEM_WIRE1 = ["M", MUX1_OFFSET[0] + MUX_POLYGON[2], MUX1_OFFSET[1] + 100, "l", 25, 0, 0, ((DATA_MEM_OFFSET[1] - MUX1_OFFSET[1]) - 75) , (DATA_MEM_OFFSET[0]  - MUX1_OFFSET[0] - MUX_WIDTH - 25), 0];
export const MUX1_DMEM_WIRE2 = ["M", MUX1_OFFSET[0] + MUX_POLYGON[2], MUX1_OFFSET[1] + 100, "l", 25, 0, 0, ((DATA_MEM_OFFSET[1] - MUX1_OFFSET[1]) + 0) , (DATA_MEM_OFFSET[0]  - MUX1_OFFSET[0] - MUX_WIDTH - 25), 0];
export const MUX1_MUX3_WIRE = ["M", MUX1_OFFSET[0] + MUX_POLYGON[2], MUX1_OFFSET[1] + 100, "l", (MUX3_OFFSET[0] - MUX1_OFFSET[0] - MUX_WIDTH), 0];
export const DMEM_MUX3_WIRE = ["M", DATA_MEM_OFFSET[0] + DATA_MEM_POLYGON[2], DATA_MEM_OFFSET[1] + 100, "l", 50,0, 0,-((DATA_MEM_OFFSET[1] - MUX3_OFFSET[1]) - 30) , (MUX3_OFFSET[0]  - DATA_MEM_OFFSET[0] - DATA_MEM_POLYGON[2] - 50), 0];
export const IMEM_MUX2_WIRE = ["M", CODE_MEM_OFFSET[0], CODE_MEM_OFFSET[1] + 200, "l", -50, 0, 0, 1200 , (MUX2_OFFSET[0]- CODE_MEM_OFFSET[0] - 100), 0, 0, -400, 150, 0 ];
export const READ_B_MUX2_WIRE = ["M", REGISTER_FILE_OFFSET[0] + REGISTER_FILE_WIDTH, REGISTER_FILE_OFFSET[1] + 200, "l", 25, 0, 0, 100 , (MUX2_OFFSET[0] - (REGISTER_FILE_OFFSET[0] + REGISTER_FILE_WIDTH + 25)), 0];
export const IMEM_PC_UPDATE_WIRE = ["M", CODE_MEM_OFFSET[0], CODE_MEM_OFFSET[1] + 300, "l", -25,0, 0,(PC_UPDATE_OFFSET[1] - CODE_MEM_HEIGHT/2 - CODE_MEM_OFFSET[1]), (PC_UPDATE_OFFSET[0] - CODE_MEM_OFFSET[0] + 25),0];
export const IMEM_IN_PC_VAL_MUX_WIRE = ["M", CODE_MEM_OFFSET[0], CODE_MEM_OFFSET[1] + 300, "l", -20, 0, 0, (PC_UPDATE_OFFSET[1] - CODE_MEM_OFFSET[1]) , (PC_VALUE_OFFSET[0] + CODE_MEM_OFFSET[0] + 50), 0, 0, -200, -20, 0];
export const IMEM_OUT_PC_UPDATE_WIRE = ["M", CODE_MEM_OFFSET[0] + CODE_MEM_WIDTH, CODE_MEM_OFFSET[1] + 25, "l", 15, 0, 0, (PC_UPDATE_OFFSET[1] - CODE_MEM_OFFSET[1] - 25 - 25) ,  0, 50, 35, 0];
export const IMEM_MUX0_WIRE = ["M", CODE_MEM_OFFSET[0] + CODE_MEM_WIDTH, CODE_MEM_OFFSET[1] + 25, "l", 15, 0, 0, (PC_UPDATE_OFFSET[1] - CODE_MEM_OFFSET[1] - 25 - 100) , (MUX0_OFFSET[0] - (CODE_MEM_WIDTH + CODE_MEM_OFFSET[0] + 100 )), 0, 0, -250, 85, 0];
export const IMEM_MUX1_WIRE = ["M", CODE_MEM_OFFSET[0] + CODE_MEM_WIDTH, CODE_MEM_OFFSET[1] + 25, "l", 15, 0, 0, (PC_UPDATE_OFFSET[1] - CODE_MEM_OFFSET[1] - 25 - 100) , (MUX1_OFFSET[0] - (CODE_MEM_WIDTH + CODE_MEM_OFFSET[0] + 100 )), 0, 0, -300, 85, 0];
export const SWITCHES_MUX1_WIRE = ["M", MUX2_OFFSET[0] - 200, MUX2_OFFSET[1] + MUX_TRUE[1] - 15, "l", 200, 0] ;

    //IMEM segments
    export const CODE_MEM_OUT_0 = ["M", CODE_MEM_OFFSET[0] + CODE_MEM_WIDTH, CODE_MEM_OFFSET[1]+25, "l", 0,0,60,0]
    export const TO_OPCODE_DECODER = ["M", CODE_MEM_OFFSET[0] + CODE_MEM_WIDTH + 60, CODE_MEM_OFFSET[1]+25, "l", 0,0, 300,0]
    export const PC_MUX_JUNCTION = ["M",INTERSECT_1_POS[0],INTERSECT_1_POS[1], "l", 0,880]

    export const MUX_JUNCTION = ["M", INTERSECT_2_POS[0], INTERSECT_2_POS[1], "l", 605,0]

    export const TO_MUX0 = ["M", CODE_MEM_OFFSET[0]+CODE_MEM_WIDTH+15+650,INTERSECT_2_POS[1], "l", 0,-180, 45,0 ]
    export const TO_MUX1 = ["M", CODE_MEM_OFFSET[0]+CODE_MEM_WIDTH+15+650,INTERSECT_2_POS[1], "l", 405,0, 0,-265, 40,0]

    export const TO_PC_UPDATE = ["M", INTERSECT_1_POS[0],125+885, "l", 0,180, 50,0]
    //END IMEM segments

    export const IMEM_OUT_TO_MUXES_SEGS = ["imem_out","imem_to_junction","to_mux_junction","to_mux_0","to_update_logic", "to_mux_1"];
    //IMEM MUX2 SEGMENTS
    export const IMEM_MUX2_JUNCTION = ["M", CODE_MEM_OFFSET[0], CODE_MEM_OFFSET[1] + 200, "l", -85,0, 0,1200, (MUX2_OFFSET[0]- CODE_MEM_OFFSET[0] - 15),0, 0,-340]
    //END IMEM MUX2 SEGMENTS

    //IMEM OUT BOTTOM SEGMENTS
    export const IMEM_PC_VAL_PC_UPDATE_JUNCTION = ["M", CODE_MEM_OFFSET[0], CODE_MEM_OFFSET[1] + 300, "l", -45, 0, 0, (PC_UPDATE_OFFSET[1] - CODE_MEM_OFFSET[1]), 505,0]
    export const JUNCTION_TO_PC_UPDATE = ["M", CODE_MEM_OFFSET[0]-45+505,CODE_MEM_OFFSET[1] + 300 + (PC_UPDATE_OFFSET[1] - CODE_MEM_OFFSET[1]), "l", 0,-180, 50,0]
    export const JUNCTION_TO_PC = ["M", CODE_MEM_OFFSET[0]-45+505,CODE_MEM_OFFSET[1] + 300 + (PC_UPDATE_OFFSET[1] - CODE_MEM_OFFSET[1]), "l", 775,0, 0,-225, -75,0]
    //END IMEM OUT BOTTOM SEGMENTS
    
    //READ_A SEGMENTS
    export const READ_A_OUT = ["M", REGISTER_FILE_OFFSET[0]+REGISTER_FILE_WIDTH-23,REGISTER_FILE_OFFSET[1]+150, "l", 351,0]
    //END READ_A_SEGMENTS

    //READ_B_SEGMENTS
    export const READ_B_OUT = ["M", REGISTER_FILE_OFFSET[0]+REGISTER_FILE_WIDTH-23, REGISTER_FILE_OFFSET[1]+400, "l", 76,0]
    export const B_OUT_TO_MUX0 = ["M", INTERSECT_6_POS[0], INTERSECT_6_POS[1], "l", 0,-65, 120,0]
    export const B_OUT_TO_MUX2 = ["M", INTERSECT_6_POS[0], INTERSECT_6_POS[1], "l", 0,260, 520,0]
    //END READ_B SEGMENTS

    //MUX1 DMEM SEGMENTS
    export const MUX1_OUT = ["M", 1670,700, "l", 60,0]
    export const MUX1_OUT_TO_MUX3_IMEM_JUNCTION = ["M", INTERSECT_7_POS[0],700, "l", 450,0]
    export const MUX1_OUT_TO_DMEM_JUNCTION = ["M", INTERSECT_7_POS[0],700, "l", 0,200]
    export const JUNCTION_TO_DMEM_A = ["M", INTERSECT_8_POS[0], INTERSECT_8_POS[1], "l", 70,0]
    export const JUNCTION_TO_DMEM_B = ["M", INTERSECT_8_POS[0], 700+200, "l", 0,75, 70,0]
    export const JUNCTION_TO_IMEM = ["M", INTERSECT_5_POS[0], 700, "l", 0,-680, -2130,0, 0,150, 70,0]
    export const JUNCTION_TO_MUX3 = ["M", INTERSECT_5_POS[0], 700, "l", 100,0]


export const READ_A_WIRE = [0, 0, ALU_OFFSET[0] - (REGISTER_FILE_OFFSET[0] + REGISTER_FILE_WIDTH), 0];
export const READ_B_WIRE = [0, 0, MUX0_OFFSET[0] - (REGISTER_FILE_OFFSET[0] + REGISTER_FILE_WIDTH), 0];
export const PC_UPDATE_MUX_WIRE = [0, 0, MUX4_OFFSET[0] - (PC_UPDATE_OFFSET[0] + PC_UPDATE_POLYGON[2]), 0];

export const MUX_PC_VAL_WIRE = ["M", MUX4_OFFSET[0] + MUX_WIDTH,1235, "l",  PC_VALUE_OFFSET[0]  -  (MUX4_OFFSET[0] + MUX_WIDTH),0];

export const MUX_ALU_WIRE_OFFSET = [MUX0_OFFSET[0] + MUX_POLYGON[2], MUX0_OFFSET[1] + 85];
export const ALU_RESULT_WIRE_OFFSET = [ALU_OFFSET[0] + ALU_POLYGON[2], ALU_OFFSET[1] + 150];
export const IMEM_DECODER_WIRE_OFFSET = [CODE_MEM_OFFSET[0] + CODE_MEM_WIDTH, CODE_MEM_OFFSET[1] + 25];
export const OPCODE_DECODER_CONTROL_WIRE_OFFSET = [OPCODE_DECODER_OFFSET[0] + OPCODE_DECODER_POLYGON[2], OPCODE_DECODER_OFFSET[1] + 25];
export const READ_A_WIRE_OFFSET = [REGISTER_FILE_WIDTH + REGISTER_FILE_OFFSET[0], REGISTER_FILE_OFFSET[1] + 50];
export const READ_B_WIRE_OFFSET = [REGISTER_FILE_WIDTH + REGISTER_FILE_OFFSET[0], REGISTER_FILE_OFFSET[1] + 200];
export const PC_UPDATE_MUX_FALSE_WIRE_OFFSET = [PC_UPDATE_OFFSET[0] + PC_UPDATE_POLYGON[2], PC_UPDATE_OFFSET[1] + 50];
export const PC_UPDATE_MUX_TRUE_WIRE_OFFSET = [PC_UPDATE_OFFSET[0] + PC_UPDATE_POLYGON[2], PC_UPDATE_OFFSET[1] + 125];
export const MUX_PC_VALUE_WIRE_OFFSET = [MUX4_OFFSET[0] + MUX_POLYGON[2], MUX4_OFFSET[1] + 100];

export const IMEM_C1_OFFSET = [CODE_MEM_WIDTH/2 + CODE_MEM_OFFSET[0], CODE_MEM_OFFSET[1] - ARROW[9]];
export const MUX_C2_OFFSET = [MUX4_OFFSET[0] + MUX_WIDTH/2, MUX4_OFFSET[1] - ARROW[9] + 22];
export const PC_VALUE_C3_OFFSET = [PC_VALUE_POLYGON[2]/2 + PC_VALUE_OFFSET[0] - 8, PC_VALUE_OFFSET[1] - ARROW[9]];
export const READ_A_C4_OFFSET = [READ_A_MUX_OFFSET[0] + (MUX_WIDTH * 0.20), READ_A_MUX_OFFSET[1] + (7-ARROW[9]+2)];
export const READ_A_C5_OFFSET = [READ_A_MUX_OFFSET[0] + (MUX_WIDTH * 0.60), READ_A_MUX_OFFSET[1] + (19-ARROW[9])-10];
export const READ_B_C6_OFFSET = [READ_B_MUX_OFFSET[0] + (MUX_WIDTH * 0.20), READ_B_MUX_OFFSET[1] + (7-ARROW[9])+2];
export const READ_B_C7_OFFSET = [READ_B_MUX_OFFSET[0] + (MUX_WIDTH * 0.60), READ_B_MUX_OFFSET[1] + (19-ARROW[9])-10];
export const REG_FILE_C8_OFFSET = [REGISTER_FILE_OFFSET[0] + 3 * 30, REGISTER_FILE_OFFSET[1] - ARROW[9]];
export const REG_FILE_C9_OFFSET = [REGISTER_FILE_OFFSET[0] + 4 * 30, REGISTER_FILE_OFFSET[1] - ARROW[9]];
export const REG_FILE_C10_OFFSET = [REGISTER_FILE_OFFSET[0] + 8 * 30, REGISTER_FILE_OFFSET[1] - ARROW[9]];
export const MUX_C11_OFFSET = [MUX0_OFFSET[0] + MUX_WIDTH/2, MUX0_OFFSET[1] + (22 - ARROW[9])];
export const ALU_C12_OFFSET = [ALU_OFFSET[0] + (1 * 30), ALU_OFFSET[1] - ARROW[9] + 12];
export const ALU_C13_OFFSET = [ALU_OFFSET[0] + (2 * 30), ALU_OFFSET[1] - ARROW[9] + 12];
export const FLAGS_C14_OFFSET = [1668 , FLAGS_OFFSET[1] - ARROW[9]];
export const MUX_C15_OFFSET = [MUX1_OFFSET[0] + MUX_WIDTH/2, MUX1_OFFSET[1] + (22 - ARROW[9])];
export const MUX_C16_OFFSET = [MUX2_OFFSET[0] + MUX_WIDTH/2, MUX2_OFFSET[1] + (22 - ARROW[9])];
export const DMEM_C17_OFFSET = [DATA_MEM_POLYGON[2]/2 + DATA_MEM_OFFSET[0], DATA_MEM_OFFSET[1] - ARROW[9]];
export const MUX_C18_OFFSET = [MUX3_OFFSET[0] + MUX_WIDTH/2, MUX3_OFFSET[1] + (22 - ARROW[9])];

export const CONTROL_ARROW_OFFSET = [CONTROL_OFFSET[0], CONTROL_OFFSET[1] + CONTROL_POLYGON[7]];

export const INTERSECT_RADIUS = 10;

export const MUX_FALSE_TEXT = "0";
export const MUX_TRUE_TEXT = "1";
export const MUX_TRUE_WIRE_ID = "true_wire";
export const MUX_FALSE_WIRE_ID = "false_wire";
export const OPCODE_TEXT = "Opcode Decoder";
export const FLAG_TEXT = "Flags";
export const REG_TEXT = "Registers";

export const CONTROL_TEXT = "Control";
export const SWITCHES_TEXT = "Switches";

export const MUX_A_TEXT = "A";
export const MUX_B_TEXT = "B";
export const MUX_C_TEXT = "C";
export const MUX_D_TEXT = "D";


export const BLOCK_STYLE = {"fill":"none", "stroke":"black", "stroke-width":"5px"};
export const THIN_BLOCK_STYLE = {"fill":"none", "stroke":"black", "stroke-width":"3px"};
export const THIN__GRAY_BLOCK_STYLE = {"fill":"none", "stroke":"gray", "stroke-width":"3px"};
export const WIRE_STYLE = {"stroke":"black", "stroke-width":"5px", "fill":"none"};
export const THIN_WIRE_STYLE = {"stroke":"black", "stroke-width":"4px", "fill":"none"};

export const ARROW_STYLE = {"fill":"black", "stroke":"black", "stroke-width":"1px"};
export const ARROW_GRAY_STYLE = {"fill":"gray", "stroke":"gray", "stroke-width":"1px"};

export const TEXT_STYLE = "font-family: Courier; font-size: 24px; text-anchor:middle;fill:black; ";
export const SMALL_TEXT_STYLE = "font-family: Courier; font-size: 22px; text-anchor:middle;fill:black; ";

export const ARIAL_TEXT_STYLE = "font-family: Arial; font-size: 24px; text-anchor:middle;fill:black; ";
export const RED_ARIAL_STYLE = "font-family: Arial; font-size: 24px; text-anchor:middle;fill:red; visibility:hidden;";

export const COMPONENT_NAME_TEXT_STYLE = "font-family: Arial; font-size: 30px; text-anchor:middle;fill:black; ";
export const BLUE_TEXT_STYLE = "font-family: Courier; font-size: 24px; text-anchor:middle;fill:blue; ";
export const INTERSECT_STYLE = {"fill":"black"};

export const ID_ATTR = "id";
export const STYLE_ATTR = "style";

export const MUX0_ID = "mux0";
export const MUX0_FALSE_ID = "mux0_false";
export const MUX0_TRUE_ID = "mux0_true";
export const MUX1_ID = "mux1";
export const MUX1_FALSE_ID = "mux1_false";
export const MUX1_TRUE_ID = "mux1_true";
export const MUX2_ID = "mux2";
export const MUX2_FALSE_ID = "mux2_false";
export const MUX2_TRUE_ID = "mux2_true";
export const MUX3_ID = "mux3";
export const MUX3_FALSE_ID = "mux3_false";
export const MUX3_TRUE_ID = "mux3_true";
export const MUX4_ID = "mux4";
export const MUX4_FALSE_ID = "mux4_false";
export const MUX4_TRUE_ID = "mux4_true";
export const READ_A_MUX_ID = "read_a_mux";
export const READ_B_MUX_ID = "read_b_mux";

export const ALU_ID = "alu";
export const FLAGS_ID = "flags";
export const CONTROL_ID = "control";
export const REG_FILE_ID = "reg_file";
export const DMEM_ID = "code_mem";
export const PC_VALUE_ID = "pc_val";
export const PC_UPDATE_ID = "pc_update";
export const CODE_MEM_ID = "code_mem";
export const OPCODE_DECODER_ID = "opcode_decoder";

export const CARRY_FLAG_ID = "carry_flag";
export const ZERO_FLAG_ID = "zero_flag";
export const OVERFLOW_FLAG_ID = "overflow_flag";
export const NEGATIVE_FLAG_ID = "negative_flag";

export const SWITCHES_ID = "swtiches";

export const DMEM_ADDR0_ID = "dmem_addr0";
export const DMEM_ADDR1_ID = "dmem_addr1";
export const DMEM_ADDR2_ID = "dmem_addr2";
export const DMEM_ADDR3_ID = "dmem_addr3";
export const DMEM_ADDR4_ID = "dmem_addr4";
export const DMEM_ADDR5_ID = "dmem_addr5";
export const DMEM_ADDR6_ID = "dmem_addr6";
export const DMEM_ADDR7_ID = "dmem_addr7";
export const DMEM_ADDR8_ID = "dmem_addr8";
export const DMEM_ADDR9_ID = "dmem_addr9";
export const DMEM_ADDR10_ID = "dmem_addr10";
export const DMEM_ADDR11_ID = "dmem_addr11";
export const DMEM_ADDR12_ID = "dmem_addr12";
export const DMEM_ADDR13_ID = "dmem_addr13";
export const DMEM_ADDR14_ID = "dmem_addr14";
export const DMEM_ADDR15_ID = "dmem_addr15";

export const DMEM_BOX0_ID = "dmem_box0";
export const DMEM_BOX1_ID = "dmem_box1";
export const DMEM_BOX2_ID = "dmem_box2";
export const DMEM_BOX3_ID = "dmem_box3";
export const DMEM_BOX4_ID = "dmem_box4";
export const DMEM_BOX5_ID = "dmem_box5";
export const DMEM_BOX6_ID = "dmem_box6";
export const DMEM_BOX7_ID = "dmem_box7";
export const DMEM_BOX8_ID = "dmem_box8";
export const DMEM_BOX9_ID = "dmem_box9";
export const DMEM_BOX10_ID = "dmem_box10";
export const DMEM_BOX11_ID = "dmem_box11";
export const DMEM_BOX12_ID = "dmem_box12";
export const DMEM_BOX13_ID = "dmem_box13";
export const DMEM_BOX14_ID = "dmem_box14";
export const DMEM_BOX15_ID = "dmem_box15";

export const DMEM_VAL0_ID = "dmem_val0";
export const DMEM_VAL1_ID = "dmem_val1";
export const DMEM_VAL2_ID = "dmem_val2";
export const DMEM_VAL3_ID = "dmem_val3";
export const DMEM_VAL4_ID = "dmem_val4";
export const DMEM_VAL5_ID = "dmem_val5";
export const DMEM_VAL6_ID = "dmem_val6";
export const DMEM_VAL7_ID = "dmem_val7";
export const DMEM_VAL8_ID = "dmem_val8";
export const DMEM_VAL9_ID = "dmem_val9";
export const DMEM_VAL10_ID = "dmem_val10";
export const DMEM_VAL11_ID = "dmem_val11";
export const DMEM_VAL12_ID = "dmem_val12";
export const DMEM_VAL13_ID = "dmem_val13";
export const DMEM_VAL14_ID = "dmem_val14";
export const DMEM_VAL15_ID = "dmem_val15";

export const IMEM_ADDR0_ID = "imem_addr0";
export const IMEM_ADDR1_ID = "imem_addr1";
export const IMEM_ADDR2_ID = "imem_addr2";
export const IMEM_ADDR3_ID = "imem_addr3";
export const IMEM_ADDR4_ID = "imem_addr4";
export const IMEM_ADDR5_ID = "imem_addr5";
export const IMEM_ADDR6_ID = "imem_addr6";
export const IMEM_ADDR7_ID = "imem_addr7";
export const IMEM_ADDR8_ID = "imem_addr8";
export const IMEM_ADDR9_ID = "imem_addr9";
export const IMEM_ADDR10_ID = "imem_addr10";
export const IMEM_ADDR11_ID = "imem_addr11";
export const IMEM_ADDR12_ID = "imem_addr12";
export const IMEM_ADDR13_ID = "imem_addr13";
export const IMEM_ADDR14_ID = "imem_addr14";
export const IMEM_ADDR15_ID = "imem_addr15";

export const IMEM_BOX0_ID = "imem_box0";
export const IMEM_BOX1_ID = "imem_box1";
export const IMEM_BOX2_ID = "imem_box2";
export const IMEM_BOX3_ID = "imem_box3";
export const IMEM_BOX4_ID = "imem_box4";
export const IMEM_BOX5_ID = "imem_box5";
export const IMEM_BOX6_ID = "imem_box6";
export const IMEM_BOX7_ID = "imem_box7";
export const IMEM_BOX8_ID = "imem_box8";
export const IMEM_BOX9_ID = "imem_box9";
export const IMEM_BOX10_ID = "imem_box10";
export const IMEM_BOX11_ID = "imem_box11";
export const IMEM_BOX12_ID = "imem_box12";
export const IMEM_BOX13_ID = "imem_box13";
export const IMEM_BOX14_ID = "imem_box14";
export const IMEM_BOX15_ID = "imem_box15";

export const IMEM_VAL0_ID = "imem_val0";
export const IMEM_VAL1_ID = "imem_val1";
export const IMEM_VAL2_ID = "imem_val2";
export const IMEM_VAL3_ID = "imem_val3";
export const IMEM_VAL4_ID = "imem_val4";
export const IMEM_VAL5_ID = "imem_val5";
export const IMEM_VAL6_ID = "imem_val6";
export const IMEM_VAL7_ID = "imem_val7";
export const IMEM_VAL8_ID = "imem_val8";
export const IMEM_VAL9_ID = "imem_val9";
export const IMEM_VAL10_ID = "imem_val10";
export const IMEM_VAL11_ID = "imem_val11";
export const IMEM_VAL12_ID = "imem_val12";
export const IMEM_VAL13_ID = "imem_val13";
export const IMEM_VAL14_ID = "imem_val14";
export const IMEM_VAL15_ID = "imem_val15";




export const READ_A_MUX_A_ID = "read_a_a";
export const READ_A_MUX_B_ID = "read_a_b";
export const READ_A_MUX_C_ID = "read_a_c";
export const READ_A_MUX_D_ID = "read_a_d";

export const READ_B_MUX_A_ID = "read_b_a";
export const READ_B_MUX_B_ID = "read_b_b";
export const READ_B_MUX_C_ID = "read_b_c";
export const READ_B_MUX_D_ID = "read_b_d";

//changed for indexing purposes
export const REG_A_ID = "reg_0"; //a
export const REG_B_ID = "reg_1"; //b
export const REG_C_ID = "reg_2"; //c
export const REG_D_ID = "reg_3"; //d

export const REG_A_LABEL_ID = "reg_a_lbl";
export const REG_B_LABEL_ID = "reg_b_lbl";
export const REG_C_LABEL_ID = "reg_d_lbl";
export const REG_D_LABEL_ID = "reg_d_lbl";

export const REG_A_BOX_ID = "reg_0_box";
export const REG_B_BOX_ID = "reg_1_box";
export const REG_C_BOX_ID = "reg_2_box";
export const REG_D_BOX_ID = "reg_3_box";

export const PC_VAL_BOX_ID = "pc_val_box";

export const CONTROL_C1 = "control_c1";
export const CONTROL_C2 = "control_c2";
export const CONTROL_C3 = "control_c3";
export const CONTROL_C4 = "control_c4";
export const CONTROL_C5 = "control_c5";
export const CONTROL_C6 = "control_c6";
export const CONTROL_C7 = "control_c7";
export const CONTROL_C8 = "control_c8";
export const CONTROL_C9 = "control_c9";
export const CONTROL_C10 = "control_c10";
export const CONTROL_C11 = "control_c11";
export const CONTROL_C12 = "control_c12";
export const CONTROL_C13 = "control_c13";
export const CONTROL_C14 = "control_c14";
export const CONTROL_C15 = "control_c15";
export const CONTROL_C16 = "control_c16";
export const CONTROL_C17 = "control_c17";
export const CONTROL_C18 = "control_c18";

export const IMEM_C1_ID = "c1";
export const MUX_C2_ID = "c2";
export const PC_VALUE_C3_ID = "c3";
export const READ_A_C4_ID = "c4";
export const READ_A_C5_ID = "c5";
export const READ_B_C6_ID = "c6";
export const READ_B_C7_ID = "c7";
export const REG_FILE_C8_ID = "c8";
export const REG_FILE_C9_ID = "c9";
export const REG_FILE_C10_ID = "c10";
export const MUX_C11_ID = "c11";
export const ALU_C12_ID = "c12";
export const ALU_C13_ID = "c13";
export const FLAGS_C14_ID  = "c14";
export const MUX_C15_ID = "c15";
export const MUX_C16_ID = "c16";
export const DMEM_C17_ID = "c17";
export const MUX_C18_ID = "c18";

export const READ_A_WIRE_ID = "read_a_wire";
export const READ_B_WIRE_ID = "read_b_wire";
export const MUX_PC_VAL_WIRE_ID = "mux_pc_val_wire";
export const PC_UPDATE_FALSE_WIRE_ID = "pc_update_false_wire";
export const PC_UPDATE_TRUE_WIRE_ID = "mux_pc_val_wire";
export const ALU_FLAG_WIRE_ID = "alu_flag_wire";
export const DECODER_CONTROL_WIRE_ID = "decoder_control_wire";
export const ALU_RESULT_WIRE_ID = "alu_result_wire";
export const MUX_ALU_WIRE_ID = "mux_alu_wire";
export const MUX_IMEM_WIRE_ID = "mux_imem_wire";
export const IMEM_DECODER_WIRE_ID = "imem_decoder_wire_id";
export const FLAGS_CONTROL_WIRE_ID = "flags_control_wire_id";
export const MUX1_DMEM_WIRE1_ID = "mux1_dmem_wire1";
export const MUX1_DMEM_WIRE2_ID = "mux1_dmem_wire2";
export const MUX2_DMEM_WIRE_ID = "mux2_dmem_wire";
export const MUX_REG_FILE_WIRE_ID = "mux_reg_file_wire";
export const MUX1_MUX3_WIRE_ID = "mux1_mux3_wire";
export const DMEM_MUX3_WIRE_ID = "dmem_mux3_wire";
export const IMEM_MUX2_WIRE_ID = "imem_mux2_wire";
export const READ_B_MUX2_WIRE_ID = "read_b_mux2_wire";
export const IMEM_IN_PC_UPDATE_WIRE_ID = "imem_in_pc_update_wire";
export const IMEM_OUT_PC_UPDATE_WIRE_ID = "imem_out_pc_update_wire";
export const IMEM_PC_VAL_MUX_WIRE_ID = "imem_pc_val_mux_wire";
export const IMEM_MUX0_WIRE_ID = "imem_mux0_wire";
export const IMEM_MUX1_WIRE_ID = "imem_mux1_wire";
export const SWITCHES_MUX1_WIRE_ID = "switches_mux1_wire";

export const OPCODE_TEXT_ID = "opcode_text_id";
export const FLAG_TEXT_ID = "flag_text_id";
export const CONTROL_TEXT_ID = "control_text_id";
export const REG_TEXT_ID = "reg_text_id";
export const PC_VAL_ID = "pc_val_id";
export const PC_UPDATE_TEXT_ID = "pc_update_text_id";

