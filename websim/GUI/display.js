import * as Constants from "./constants.js";
import TextSVG from "./TextSVG.js";
import PolygonSVG from "./PolygonSVG.js";
import PathSVG from "./PathSVG.js";
import Mux2_1SVG from "./Mux2_1SVG.js";
import RegisterFileSVG from "./RegisterFileSVG.js";
import PCValueSVG from "./PCValueSVG.js";
import DMEM_SVG from "./DMEM_SVG.js";
import ALU_SVG from "./ALU_SVG.js";

import FlagsSVG from "./FlagsSVG.js";
import IMEM_SVG from "./IMEM_SVG.js";
import Mux2_1_BackwardsSVG from "./Mux2_1_BackwardsSVG.js"
import PCUpdateSVG from "./PCUpdateSVG.js";
import OpcodeDeCoderSVG from "./OpcodeDecoderSVG.js";
import CircleSVG from "./CircleSVG.js";
import ControlSVG from "./ControlSVG.js";
import ArrowSVG from "./ArrowSVG.js";
import BussInfoSVG from "./BusInfoSVG.js";
import LongArrowSVG from "./LongArrowSVG.js"
import ALULongArrowSVG from "./ALULongArrowSVG.js"
import {CPU} from "../simulator/cpu.js";
import * as Utils from "./Utils.js";

function init() {
	 
	//show_arrows.onchange = Utils.toggle_arrow_visablitity;
	show_bus_info.onchange = Utils.toggle_bus_info_visablitity;
	show_description.onchange = Utils.toggle_description_visablitity;
	document.getElementById("modal").onclick = () => {
		modal.style.visibility = "hidden";
		document.getElementById("modal_content").style.visibility = "hidden";

	}
}

window.addEventListener("load", function() {
	init();

	// Set up cpu simulation
	let cpu = new CPU();

	window.cpu = cpu;

	cpu.setup();

	let started = 0
	window.started = started;

	let prevCarry = cpu.alu.carry;
	let prevOverflow = cpu.alu.overflow;
	let prevNegative = cpu.alu.negative;
	let prevZero = cpu.alu.zero;
	window.prevCarry=prevCarry;
	window.prevOverflow=prevOverflow;
	window.prevNegative=prevNegative;
	window.prevZero=prevZero;
	//

	var mux_alu_wire = new PolygonSVG(Constants.MUX_ALU_WIRE_ID, Constants.MUX_ALU_WIRE, Constants.BLOCK_STYLE);
	mux_alu_wire.translate(Constants.MUX_ALU_WIRE_OFFSET[0],Constants.MUX_ALU_WIRE_OFFSET[1]);

	var flags = new FlagsSVG();

	var mux0 = new Mux2_1SVG(Constants.MUX0_ID, Constants.MUX0_TRUE_ID, Constants.MUX0_FALSE_ID, Constants.MUX0_OFFSET);
	window.mux0 = mux0
	var mux1 = new Mux2_1SVG(Constants.MUX1_ID, Constants.MUX1_TRUE_ID, Constants.MUX1_FALSE_ID, Constants.MUX1_OFFSET);
	window.mux1 = mux1
	var mux2 = new Mux2_1SVG(Constants.MUX2_ID, Constants.MUX2_TRUE_ID, Constants.MUX2_FALSE_ID, Constants.MUX2_OFFSET);
	window.mux2 = mux2
	var mux3 = new Mux2_1SVG(Constants.MUX3_ID, Constants.MUX3_TRUE_ID, Constants.MUX3_FALSE_ID, Constants.MUX3_OFFSET);
	window.mux3 = mux3
	var mux4 = new Mux2_1_BackwardsSVG(Constants.MUX4_ID, Constants.MUX4_TRUE_ID, Constants.MUX4_FALSE_ID, Constants.MUX4_OFFSET);
	window.mux4 = mux4


	var switches_text = new TextSVG(Constants.MUX2_OFFSET[0] - 200 - 60, Constants.MUX2_OFFSET[1] + Constants.MUX_TRUE[1] - 10, Constants.SWITCHES_ID, Constants.SWITCHES_TEXT, Constants.ARIAL_TEXT_STYLE);

	
	var alu = new ALU_SVG();
	var code_mem = new IMEM_SVG();
	window.code_mem = code_mem;
	var control =  new ControlSVG();
	var dmem = new DMEM_SVG();
	var opcode_decoder = new OpcodeDeCoderSVG();
	var pc_value = new PCValueSVG();
	var pc_update = new PCUpdateSVG();
	var reg_file = new RegisterFileSVG();
	
	var alu_result_wire = new PolygonSVG(Constants.ALU_RESULT_WIRE_ID, Constants.ALU_RESULT_WIRE, Constants.WIRE_STYLE);
	alu_result_wire.translate(Constants.ALU_RESULT_WIRE_OFFSET[0], Constants.ALU_RESULT_WIRE_OFFSET[1]+5);


	var decoder_control_wire = new PolygonSVG(Constants.DECODER_CONTROL_WIRE_ID, Constants.OPCODE_DECODER_CONTROL_WIRE, Constants.WIRE_STYLE);
	decoder_control_wire.translate(Constants.OPCODE_DECODER_CONTROL_WIRE_OFFSET[0], Constants.OPCODE_DECODER_CONTROL_WIRE_OFFSET[1]);
	
	var alu_flag_wire = new PathSVG(Constants.ALU_FLAG_WIRE_ID, Constants.ALU_FLAGS_WIRE, Constants.WIRE_STYLE);
	var flag_control_wire = new PathSVG(Constants.FLAGS_CONTROL_WIRE_ID, Constants.FLAGS_CONTROL_WIRE, Constants.WIRE_STYLE);
	var mux_reg_file_wire = new PathSVG(Constants.MUX_REG_FILE_WIRE_ID, Constants.MUX_REG_FILE_WIRE, Constants.WIRE_STYLE);
	var mux2_dmem_wire = new PathSVG(Constants.MUX2_DMEM_WIRE_ID, Constants.MUX2_DMEM_WIRE, Constants.WIRE_STYLE);
	var dmem_mux3_wire = new PathSVG(Constants.DMEM_MUX3_WIRE_ID, Constants.DMEM_MUX3_WIRE, Constants.WIRE_STYLE);
	var imem_in_pc_update_wire = new PathSVG(Constants.IMEM_IN_PC_UPDATE_MUX_WIRE_ID, Constants.IMEM_IN_PC_UPDATE_MUX_WIRE, Constants.WIRE_STYLE);
	var mux_pc_val_wire = new PathSVG("mux4_out", Constants.MUX_PC_VAL_WIRE, Constants.WIRE_STYLE);


	//IMEM WIRE SEGMENTS
	var imem_out_0_wire = new PathSVG("imem_out", Constants.CODE_MEM_OUT_0, Constants.WIRE_STYLE);
	var imem_to_decoder = new PathSVG("imem_to_decoder", Constants.TO_OPCODE_DECODER, Constants.WIRE_STYLE);
	var imem_to_pc = new PathSVG("imem_to_junction", Constants.PC_MUX_JUNCTION, Constants.WIRE_STYLE); 
	var to_mux_junction = new PathSVG("to_mux_junction", Constants.MUX_JUNCTION, Constants.WIRE_STYLE); 
	var to_mux0 = new PathSVG("to_mux_0", Constants.TO_MUX0, Constants.WIRE_STYLE)
	var to_update_logic = new PathSVG("to_update_logic", Constants.TO_PC_UPDATE, Constants.WIRE_STYLE)
	var to_mux1 = new PathSVG("to_mux_1", Constants.TO_MUX1, Constants.WIRE_STYLE)
	//END IMEM WIRE SEGMENTS

	//IMEM OUT MIDDLE SEGMENTS
	var imem_pc_val_pc_update_junction = new PathSVG(Constants.IMEM_PC_VAL_MUX_WIRE_ID, Constants.IMEM_PC_VAL_PC_UPDATE_JUNCTION, Constants.WIRE_STYLE);
	var junction_to_pc_update = new PathSVG("junction_to_pc_update", Constants.JUNCTION_TO_PC_UPDATE, Constants.WIRE_STYLE)
	var junction_to_pc = new PathSVG("junction_to_pc", Constants.JUNCTION_TO_PC, Constants.WIRE_STYLE)
	//END IMEM OUT MIDDLE SEGMENTS

	//READ A SEGMENTS
	var read_a_out = new PathSVG("read_a_out", Constants.READ_A_OUT, Constants.WIRE_STYLE)
	//END READ A SEGMENTS

	//READ_B_SEGMENTS
	var read_b_out = new PathSVG("read_b_out", Constants.READ_B_OUT, Constants.WIRE_STYLE)
	var b_to_mux0 = new PathSVG("b_to_mux0", Constants.B_OUT_TO_MUX0, Constants.WIRE_STYLE)	
	var b_to_mux2 = new PathSVG("b_to_mux2", Constants.B_OUT_TO_MUX2, Constants.WIRE_STYLE)	
	//END READ_B SEGMENTS

	//IMEM MUX2 SEGMENTS
	var imem_to_mux2_junction = new PathSVG("imem_mux2_junction", Constants.IMEM_MUX2_JUNCTION, Constants.WIRE_STYLE)
	//END IMEM MUX2 SEGMENTS

	//MUX1 SEGMENTS
	var mux1_out = new PathSVG("mux1_output_wire", Constants.MUX1_OUT, Constants.WIRE_STYLE)
	var mux1_out_to_mux3_imem_junction = new PathSVG("mux1_out_to_mux3", Constants.MUX1_OUT_TO_MUX3_IMEM_JUNCTION, Constants.WIRE_STYLE)
	var mux1_out_to_dmem_junction = new PathSVG("mux1_out_to_dmem_junction", Constants.MUX1_OUT_TO_DMEM_JUNCTION, Constants.WIRE_STYLE)
	var junction_to_dmem_a = new PathSVG("junction_to_dmem_a", Constants.JUNCTION_TO_DMEM_A, Constants.WIRE_STYLE)
	var junction_to_dmem_b = new PathSVG("junction_to_dmem_b", Constants.JUNCTION_TO_DMEM_B, Constants.WIRE_STYLE)
	var junction_to_imem = new PathSVG("junction_to_imem", Constants.JUNCTION_TO_IMEM, Constants.WIRE_STYLE)
	var junction_to_mux3 = new PathSVG("junction_to_mux3", Constants.JUNCTION_TO_MUX3, Constants.WIRE_STYLE)
	//END MUX1 SEGMENTS



	var switches_mux1_wire = new PathSVG(Constants.SWITCHES_MUX1_WIRE_ID, Constants.SWITCHES_MUX1_WIRE, Constants.WIRE_STYLE);


	var pc_update_true_wire = new PolygonSVG(Constants.PC_UPDATE_TRUE_WIRE_ID, [...Constants.PC_UPDATE_MUX_WIRE], Constants.WIRE_STYLE);
	pc_update_true_wire.translate(Constants.PC_UPDATE_MUX_TRUE_WIRE_OFFSET[0], Constants.PC_UPDATE_MUX_TRUE_WIRE_OFFSET[1] - 5);

	var pc_update_false_wire = new PolygonSVG(Constants.PC_UPDATE_FALSE_WIRE_ID, [...Constants.PC_UPDATE_MUX_WIRE], Constants.WIRE_STYLE);
	pc_update_false_wire.translate(Constants.PC_UPDATE_MUX_FALSE_WIRE_OFFSET[0], Constants.PC_UPDATE_MUX_FALSE_WIRE_OFFSET[1]-20);

	//var mux_pc_val_wire = new PolygonSVG(Constants.MUX_PC_VAL_WIRE_ID, Constants.MUX_PC_VALUE_WIRE, Constants.WIRE_STYLE);
	//mux_pc_val_wire.translate(Constants.MUX_PC_VALUE_WIRE_OFFSET[0], Constants.MUX_PC_VALUE_WIRE_OFFSET[1]);

	const RIGHT = "right";
	const LEFT = "left";
	const TOP_RIGHT = "rightup";
	const TOP_LEFT = "leftup";
	const FAR_LEFT = "farleft";
	const TWO_DIGIT_LEFT = "twodigitleft";
	const SINGLE_ARROW_LEFT = "singleLeft";
	/* Bus Infomation */
	var imem_opcode_info1 = new BussInfoSVG("imem_opcode_info1", [535, 140], 16, TWO_DIGIT_LEFT);
	var imem_opcode_info2 = new BussInfoSVG("imem_opcode_info2", [650, 140], "8 high", TOP_RIGHT);
	var imem_out_info3 = new BussInfoSVG("imem_out_info3", [Constants.INTERSECT_1_POS[0] + 15, 250], "8 low", TOP_RIGHT);

	var opcode_control_info = new BussInfoSVG("opcode_control_info", [1175, 140], 27, TWO_DIGIT_LEFT);
	var flags_control_info = new BussInfoSVG("flags_control_info", [1270, 250], 4, FAR_LEFT);

	var imem_in_top = new BussInfoSVG("imem_in_top", [65, 185], 6, LEFT);
	var imem_in_middle = new BussInfoSVG("imem_in_middle", [60, 315], 16, TWO_DIGIT_LEFT);
	var imem_in_bottom = new BussInfoSVG("imem_in_bottom", [85, 415], 6, LEFT);

	var mux0_out_info = new BussInfoSVG("mux0_out", [1325, 800], 8, LEFT);
	var mux1_out_info = new BussInfoSVG("mux1_out", [1715, 715], 8, LEFT);
	var mux2_out_info = new BussInfoSVG("mux2_out", [1745, 1125], 8, LEFT);
	var mux3_out_info = new BussInfoSVG("mux3_out", [2360, 500],8, FAR_LEFT);
	var alu_in_top_info = new BussInfoSVG("alu_in_top_info", [1325, 570], 8, LEFT);
	var alu_out_top_info = new BussInfoSVG("alu_out_top_info", [1573, 550], 8, FAR_LEFT);
	var alu_out_bottom_info = new BussInfoSVG("alu_out_bottom_info", [1550, 670], 8, LEFT);

	var mux4_out_info = new BussInfoSVG("mux4_out_info", [1020 , 1250], 6, LEFT);
	var mux1_feedback_info = new BussInfoSVG("mux1_feedback_info", [2165, 580], "6 low", TOP_RIGHT);
	var mux1_intermediate_info = new BussInfoSVG("mux1_intermediate_info", [1900, 715], 8, LEFT);

	var mux3_in_top_info = new BussInfoSVG("mux3_in_top_info", [2220, 715], 8, LEFT);
	var mux3_in_bottom_info = new BussInfoSVG("mux3_in_bottom_info", [2215, 875], 8, FAR_LEFT);

	var pc_update_in_info = new BussInfoSVG("pc_update_in_info", [Constants.INTERSECT_1_POS[0] + 15, 1100], "6 low", TOP_RIGHT);
	var pc_update_in_bottom_info = new BussInfoSVG("pc_update_in_bottom_info", [Constants.INTERSECT_1_POS[0] + 40, 1295], "6", LEFT);

	
	var dmem_in_top_info = new BussInfoSVG("dmem_in_top_info", [1785, 910], 4, LEFT);
	var dmem_in_bottom_info = new BussInfoSVG("dmem_in_bottom_info", [1785, 990], 4, LEFT);
	
	var pc_logic_out_top_info = new BussInfoSVG("pc_logic_out_top_info", [865, 1205], 6, LEFT);
	var pc_logic_out_bottom_info = new BussInfoSVG("pc_logic_out_bottom_info", [865, 1295], 6, LEFT);
	var pc_val_out_info = new BussInfoSVG("pc_val_out_info", [1300, 1250], 6, LEFT);

	var mux0_in_top_info = new BussInfoSVG("mux0_in_top_info", [1150, 755], 8, LEFT);
	var mux0_in_bottom_info = new BussInfoSVG("mux0_in_bottom_info", [1170, 875], 8, FAR_LEFT);
	
	var mux1_in_bottom_info = new BussInfoSVG("mux1_in_bottom_info", [1575, 875], 8, FAR_LEFT);
	var mux2_in_top_info = new BussInfoSVG("mux2_in_top_info", [1575, 1080], 8, LEFT);
	var mux2_in_bottom_info = new BussInfoSVG("mux2_in_bottom_info", [1575, 1170], "8 low", "farleftlow");
	
	var switches_info = new BussInfoSVG("switches_info", [1450, 1170], 16, TWO_DIGIT_LEFT);

	var mux_junction_info = new BussInfoSVG("mux_junct_info", [Constants.INTERSECT_2_POS[0] + 150, Constants.INTERSECT_2_POS[1] + 15], 8, LEFT);
	var mux_dmem_info = new BussInfoSVG("mux_dmem_info", [Constants.INTERSECT_7_POS[0] + 15, Constants.INTERSECT_7_POS[1] + 100], "4 low", TOP_RIGHT);
	var imem_mux_info = new BussInfoSVG("imem_mux_info", [1515, 1300], 16, "twodigitleftvertical");

	var imem_c1 = new ArrowSVG(Constants.IMEM_C1_ID, 1, RIGHT, Constants.IMEM_C1_OFFSET);
	var mux_c2 = new ArrowSVG(Constants.MUX_C2_ID, 2, RIGHT, Constants.MUX_C2_OFFSET);
	var pc_value_c3 = new ArrowSVG(Constants.PC_VALUE_C3_ID, 3, RIGHT, Constants.PC_VALUE_C3_OFFSET);
	var read_a_c4 = new ArrowSVG(Constants.READ_A_C4_ID, 4, TOP_LEFT, Constants.READ_A_C4_OFFSET);
	var read_a_c5 = new LongArrowSVG(Constants.READ_A_C5_ID, 5, TOP_RIGHT, Constants.READ_A_C5_OFFSET);
	var read_b_c6 = new ArrowSVG(Constants.READ_B_C6_ID, 6, TOP_LEFT, Constants.READ_B_C6_OFFSET);
	var read_b_c7 = new LongArrowSVG(Constants.READ_B_C7_ID, 7, TOP_RIGHT, Constants.READ_B_C7_OFFSET);
	var reg_file_c8 = new ArrowSVG(Constants.REG_FILE_C8_ID, 8, LEFT, Constants.REG_FILE_C8_OFFSET);
	var reg_file_c9 = new ArrowSVG(Constants.REG_FILE_C9_ID, 9, RIGHT, Constants.REG_FILE_C9_OFFSET);
	var reg_file_c10 = new ArrowSVG(Constants.REG_FILE_C10_ID, 10, RIGHT, Constants.REG_FILE_C10_OFFSET);
	var mux_c11 = new ArrowSVG(Constants.MUX_C11_ID, 11, RIGHT, Constants.MUX_C11_OFFSET);
	var alu_c12 = new ArrowSVG(Constants.ALU_C12_ID, 12, LEFT, Constants.ALU_C12_OFFSET);
	var alu_c13 = new ALULongArrowSVG(Constants.ALU_C13_ID, 13, RIGHT, Constants.ALU_C13_OFFSET);
	var flags_c14 = new ArrowSVG(Constants.FLAGS_C14_ID, 14, RIGHT, Constants.FLAGS_C14_OFFSET);
	var mux_c15 = new ArrowSVG(Constants.MUX_C15_ID, 15, RIGHT, Constants.MUX_C15_OFFSET);
	var mux_c16 = new ArrowSVG(Constants.MUX_C16_ID, 16, RIGHT, Constants.MUX_C16_OFFSET);
	var dmem_c17 = new ArrowSVG(Constants.DMEM_C17_ID, 17, RIGHT, Constants.DMEM_C17_OFFSET);
	var mux_c18 = new ArrowSVG(Constants.MUX_C18_ID, 18, RIGHT, Constants.MUX_C18_OFFSET);
	
	var intersect_1 = new CircleSVG("intersect_1", Constants.INTERSECT_1_POS, Constants.INTERSECT_RADIUS, Constants.INTERSECT_STYLE);
	var intersect_2 = new CircleSVG("intersect_2", Constants.INTERSECT_2_POS, Constants.INTERSECT_RADIUS, Constants.INTERSECT_STYLE);
	var intersect_3 = new CircleSVG("intersect_3", Constants.INTERSECT_3_POS, Constants.INTERSECT_RADIUS, Constants.INTERSECT_STYLE);
	var intersect_4 = new CircleSVG("intersect_4", Constants.INTERSECT_4_POS, Constants.INTERSECT_RADIUS, Constants.INTERSECT_STYLE);
	var intersect_5 = new CircleSVG("intersect_5", Constants.INTERSECT_5_POS, Constants.INTERSECT_RADIUS, Constants.INTERSECT_STYLE);
	var intersect_6 = new CircleSVG("intersect_6", Constants.INTERSECT_6_POS, Constants.INTERSECT_RADIUS, Constants.INTERSECT_STYLE);
	var intersect_7 = new CircleSVG("intersect_7", Constants.INTERSECT_7_POS, Constants.INTERSECT_RADIUS, Constants.INTERSECT_STYLE);
	var intersect_8 = new CircleSVG("intersect_8", Constants.INTERSECT_8_POS, Constants.INTERSECT_RADIUS, Constants.INTERSECT_STYLE);
	var intersect_9 = new CircleSVG("intersect_9", Constants.INTERSECT_9_POS, Constants.INTERSECT_RADIUS, Constants.INTERSECT_STYLE);

	var imem_red_write_enable_text = new TextSVG(405, 55, "imem_red_write_enable_text", "Write Enable", Constants.RED_ARIAL_STYLE);
	var imem_red_write_select_text = new TextSVG(120, 50, "imem_red_write_select_text", "Write Select", Constants.RED_ARIAL_STYLE);
	var imem_red_input_text = new TextSVG(50, 280, "imem_red_input_text", "Input", Constants.RED_ARIAL_STYLE);
	var imem_red_read_selection_text = new TextSVG(140, 1450, "imem_red_read_selection_text", "Read Select", Constants.RED_ARIAL_STYLE);

	var regfile_red_write_enable_text = new TextSVG(940, 340, "regfile_red_write_enable_text", "Write Enable", Constants.RED_ARIAL_STYLE);
	var regfile_red_write_select_text = new TextSVG(760, 340, "regfile_red_write_select_text", "Write Select", Constants.RED_ARIAL_STYLE);
	var regfile_red_input_text = new TextSVG(600, 580, "regfile_red_input_text", "Input", Constants.RED_ARIAL_STYLE);
	var regfile_red_read_port0_select_text = new TextSVG(1040, 400, "regfile_red_read_port0_select_text", "Port0 Read Select", Constants.RED_ARIAL_STYLE);
	var regfile_red_read_port1_select_text = new TextSVG(1040, 660, "regfile_red_read_port1_select_text", "Port1 Read Select", Constants.RED_ARIAL_STYLE);
	var regfile_red_write_back_mux_text = new TextSVG(2280, 620, "regfile_red_write_back_mux_text", "REG Writeback Mux", Constants.RED_ARIAL_STYLE);

	var alu_red_select_text = new TextSVG(1400, 440, "alu_red_select_text", "ALU Select", Constants.RED_ARIAL_STYLE);
	var alu_red_result_text = new TextSVG(1760, 580, "alu_red_result_text", "ALU Result Mux", Constants.RED_ARIAL_STYLE);
	var alu_red_source_text = new TextSVG(1280, 640, "alu_red_source_text", "ALU Source Mux", Constants.RED_ARIAL_STYLE);

	var flags_red_write_enable_text = new TextSVG(1683, 400, "flags_red_write_enable_text", "Write Enable", Constants.RED_ARIAL_STYLE);

	var pc_red_mux_text = new TextSVG(950, 1100, "pc_red_mux_text", "PC Mux", Constants.RED_ARIAL_STYLE);
	var pc_red_write_enable_text = new TextSVG(1160, 1100, "pc_red_write_enable_text", "Write Enable", Constants.RED_ARIAL_STYLE);

	var dmem_red_write_select_text = new TextSVG(1733, 950, "dmem_red_write_select_text", "Write Select", Constants.RED_ARIAL_STYLE);
	var dmem_red_read_select_text = new TextSVG(1733, 870, "dmem_red_read_select_text", "Read Select", Constants.RED_ARIAL_STYLE);
	var dmem_red_input_mux_text = new TextSVG(1640, 1220, "dmem_red_input_mux_text", "DMEM Input Mux", Constants.RED_ARIAL_STYLE);
	var dmem_red_write_enable_text = new TextSVG(1980, 760, "dmem_red_write_enable_text", "Write Enable", Constants.RED_ARIAL_STYLE);
	var dmem_red_input_text = new TextSVG(1720, 1080, "dmem_red_input_text", "Input", Constants.RED_ARIAL_STYLE);


	var svg = document.getElementById("canvas");

	svg.appendChild(mux_pc_val_wire.node);

	mux0.get_all_nodes().forEach( x => svg.appendChild(x));
	mux1.get_all_nodes().forEach( x => svg.appendChild(x));
	mux2.get_all_nodes().forEach( x => svg.appendChild(x));
	mux3.get_all_nodes().forEach( x => svg.appendChild(x));
	mux4.get_all_nodes().forEach( x => svg.appendChild(x));
	alu.get_all_nodes().forEach( x => svg.appendChild(x));
	svg.appendChild(mux_alu_wire.node);
	flags.get_all_nodes().forEach( x => svg.appendChild(x));
	code_mem.get_all_nodes().forEach( x => svg.appendChild(x));
	opcode_decoder.get_all_nodes().forEach( x => svg.appendChild(x));
	control.get_all_nodes().forEach( x => svg.appendChild(x));
	reg_file.get_all_nodes().forEach(x => svg.appendChild(x));
	pc_value.get_all_nodes().forEach(x => svg.appendChild(x));
	pc_update.get_all_nodes().forEach(x => svg.appendChild(x));
	dmem.get_all_nodes().forEach(x => svg.appendChild(x));
	svg.appendChild(alu_result_wire.node);
	svg.appendChild(decoder_control_wire.node);
	svg.appendChild(alu_flag_wire.node);
	svg.appendChild(pc_update_false_wire.node);
	svg.appendChild(pc_update_true_wire.node);
	svg.appendChild(mux_pc_val_wire.node);

	imem_c1.get_all_nodes().forEach(x => svg.appendChild(x));
	mux_c2.get_all_nodes().forEach(x => svg.appendChild(x));
	pc_value_c3.get_all_nodes().forEach(x => svg.appendChild(x));
	read_a_c4.get_all_nodes().forEach(x => svg.appendChild(x));
	read_a_c5.get_all_nodes().forEach(x => svg.appendChild(x));
	read_b_c6.get_all_nodes().forEach(x => svg.appendChild(x));
	read_b_c7.get_all_nodes().forEach(x => svg.appendChild(x));
	reg_file_c8.get_all_nodes().forEach(x => svg.appendChild(x));
	reg_file_c9.get_all_nodes().forEach(x => svg.appendChild(x));
	reg_file_c10.get_all_nodes().forEach(x => svg.appendChild(x));
	mux_c11.get_all_nodes().forEach(x => svg.appendChild(x));
	alu_c12.get_all_nodes().forEach(x => svg.appendChild(x));
	alu_c13.get_all_nodes().forEach(x => svg.appendChild(x));
	flags_c14.get_all_nodes().forEach(x => svg.appendChild(x));
	mux_c15.get_all_nodes().forEach(x => svg.appendChild(x));
	mux_c16.get_all_nodes().forEach(x => svg.appendChild(x));
	dmem_c17.get_all_nodes().forEach(x => svg.appendChild(x));
	mux_c18.get_all_nodes().forEach(x => svg.appendChild(x));

	imem_opcode_info1.get_all_nodes().forEach(x => svg.appendChild(x));
	imem_opcode_info2.get_all_nodes().forEach(x => svg.appendChild(x));
	opcode_control_info.get_all_nodes().forEach(x => svg.appendChild(x));
	flags_control_info.get_all_nodes().forEach(x => svg.appendChild(x));
	imem_out_info3.get_all_nodes().forEach(x => svg.appendChild(x));

	imem_in_top.get_all_nodes().forEach(x => svg.appendChild(x));
	imem_in_middle.get_all_nodes().forEach(x => svg.appendChild(x));
	imem_in_bottom.get_all_nodes().forEach(x => svg.appendChild(x));

	mux0_out_info.get_all_nodes().forEach(x => svg.appendChild(x));
	mux1_out_info.get_all_nodes().forEach(x => svg.appendChild(x));
	mux2_out_info.get_all_nodes().forEach(x => svg.appendChild(x));
	mux3_out_info.get_all_nodes().forEach(x => svg.appendChild(x));

	mux1_intermediate_info.get_all_nodes().forEach(x => svg.appendChild(x));
	mux4_out_info.get_all_nodes().forEach(x => svg.appendChild(x));
	alu_out_top_info.get_all_nodes().forEach(x => svg.appendChild(x));
	alu_out_bottom_info.get_all_nodes().forEach(x => svg.appendChild(x));
	dmem_in_top_info.get_all_nodes().forEach(x => svg.appendChild(x));
	dmem_in_bottom_info.get_all_nodes().forEach(x => svg.appendChild(x));
	pc_val_out_info.get_all_nodes().forEach(x => svg.appendChild(x));
	pc_logic_out_top_info.get_all_nodes().forEach(x => svg.appendChild(x));
	pc_logic_out_bottom_info.get_all_nodes().forEach(x => svg.appendChild(x));
	alu_in_top_info.get_all_nodes().forEach(x => svg.appendChild(x));
	mux1_feedback_info.get_all_nodes().forEach(x => svg.appendChild(x));
	mux3_in_top_info.get_all_nodes().forEach(x => svg.appendChild(x));
	mux3_in_bottom_info.get_all_nodes().forEach(x => svg.appendChild(x));
	pc_update_in_info.get_all_nodes().forEach(x => svg.appendChild(x));
	pc_update_in_bottom_info.get_all_nodes().forEach(x => svg.appendChild(x));
	mux0_in_top_info.get_all_nodes().forEach(x => svg.appendChild(x));
	mux0_in_bottom_info.get_all_nodes().forEach(x => svg.appendChild(x));
	mux1_in_bottom_info.get_all_nodes().forEach(x => svg.appendChild(x));
	mux2_in_top_info.get_all_nodes().forEach(x => svg.appendChild(x));
	mux2_in_bottom_info.get_all_nodes().forEach(x => svg.appendChild(x));
	switches_info.get_all_nodes().forEach(x => svg.appendChild(x));
	mux_junction_info.get_all_nodes().forEach(x => svg.appendChild(x));
	mux_dmem_info.get_all_nodes().forEach(x => svg.appendChild(x));
	imem_mux_info.get_all_nodes().forEach(x => svg.appendChild(x));

	svg.appendChild(flag_control_wire.node);
	svg.appendChild(mux_reg_file_wire.node);
	svg.appendChild(mux2_dmem_wire.node);
	svg.appendChild(dmem_mux3_wire.node);
	svg.appendChild(imem_in_pc_update_wire.node);
	svg.appendChild(switches_mux1_wire.node);
	svg.appendChild(switches_text.node);

	
	svg.appendChild(imem_out_0_wire.node);
	svg.appendChild(imem_to_decoder.node);
	svg.appendChild(imem_to_pc.node);
	svg.appendChild(to_mux_junction.node);
	svg.appendChild(to_mux0.node);
	svg.appendChild(to_update_logic.node);
	svg.appendChild(to_mux1.node);

	svg.appendChild(read_a_out.node);
	svg.appendChild(read_b_out.node);
	svg.appendChild(b_to_mux0.node);
	svg.appendChild(b_to_mux2.node);
	
	svg.appendChild(imem_to_mux2_junction.node);

	svg.appendChild(mux1_out.node);
	svg.appendChild(mux1_out_to_dmem_junction.node);
	svg.appendChild(junction_to_dmem_a.node);
	svg.appendChild(junction_to_dmem_b.node);
	svg.appendChild(mux1_out_to_mux3_imem_junction.node);
	svg.appendChild(junction_to_imem.node);
	svg.appendChild(junction_to_mux3.node);

	

	svg.appendChild(imem_pc_val_pc_update_junction.node);
	svg.appendChild(junction_to_pc_update.node)
	svg.appendChild(junction_to_pc.node)

	code_mem.switchToUser();

	svg.appendChild(imem_red_write_enable_text.get_node());
	svg.appendChild(imem_red_write_select_text.get_node());
	svg.appendChild(imem_red_input_text.get_node());
	svg.appendChild(imem_red_read_selection_text.get_node());

	svg.appendChild(regfile_red_write_enable_text.get_node());
	svg.appendChild(regfile_red_write_select_text.get_node());
	svg.appendChild(regfile_red_input_text.get_node());
	svg.appendChild(regfile_red_read_port0_select_text.get_node());
	svg.appendChild(regfile_red_read_port1_select_text.get_node());
	svg.appendChild(regfile_red_write_back_mux_text.get_node());

	svg.appendChild(alu_red_select_text.get_node());
	svg.appendChild(alu_red_result_text.get_node());
	svg.appendChild(alu_red_source_text.get_node());

	svg.appendChild(flags_red_write_enable_text.get_node());
	svg.appendChild(pc_red_mux_text.get_node());
	svg.appendChild(pc_red_write_enable_text.get_node());

	svg.appendChild(dmem_red_write_select_text.get_node());
	svg.appendChild(dmem_red_read_select_text.get_node());
	svg.appendChild(dmem_red_input_mux_text.get_node());
	svg.appendChild(dmem_red_write_enable_text.get_node());
	svg.appendChild(dmem_red_input_text.get_node());


	svg.appendChild(intersect_1.node);
	svg.appendChild(intersect_2.node);
	svg.appendChild(intersect_3.node);
	svg.appendChild(intersect_4.node);
	svg.appendChild(intersect_5.node);
	svg.appendChild(intersect_6.node);
	svg.appendChild(intersect_7.node);
	svg.appendChild(intersect_8.node);
	svg.appendChild(intersect_9.node);

	cpu.pc.currentPC=32;

	console.log(cpu.instructions.length);
	if(cpu.instructions.length-32>=32 || cpu.progName=="BiosSwitches"){
		cpu.pc.currentPC=0;
		code_mem.switchToBios();
		document.getElementById("codeStart").checked=false;
		document.getElementById("codeStart").disabled=true;
	}
	document.getElementById("progName").innerHTML = cpu.progName;
});