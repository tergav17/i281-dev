import * as Constants from "./constants.js"
export function toggle_arrow_visablitity(checkbox) {
	let arrows = [];
	let text = [];
	let subscripts = [];
	arrows.push(document.getElementById(Constants.IMEM_C1_ID));
	arrows.push(document.getElementById(Constants.MUX_C2_ID));
	arrows.push(document.getElementById(Constants.PC_VALUE_C3_ID));
	arrows.push(document.getElementById(Constants.READ_A_C4_ID));
	arrows.push(document.getElementById(Constants.READ_A_C5_ID));
	arrows.push(document.getElementById(Constants.READ_B_C6_ID));
	arrows.push(document.getElementById(Constants.READ_B_C7_ID));
	arrows.push(document.getElementById(Constants.REG_FILE_C8_ID));
	arrows.push(document.getElementById(Constants.REG_FILE_C9_ID));
	arrows.push(document.getElementById(Constants.REG_FILE_C10_ID));
	arrows.push(document.getElementById(Constants.MUX_C11_ID));
	arrows.push(document.getElementById(Constants.ALU_C12_ID));
	arrows.push(document.getElementById(Constants.ALU_C13_ID));
	arrows.push(document.getElementById(Constants.FLAGS_C14_ID));
	arrows.push(document.getElementById(Constants.MUX_C15_ID));
	arrows.push(document.getElementById(Constants.MUX_C16_ID));
	arrows.push(document.getElementById(Constants.DMEM_C17_ID));
	arrows.push(document.getElementById(Constants.MUX_C18_ID));
	
	text.push(document.getElementById("arrow1"));
	text.push(document.getElementById("arrow2"));
	text.push(document.getElementById("arrow3"));
	text.push(document.getElementById("arrow4"));
	text.push(document.getElementById("arrow5"));
	text.push(document.getElementById("arrow6"));
	text.push(document.getElementById("arrow7"));
	text.push(document.getElementById("arrow8"));
	text.push(document.getElementById("arrow9"));
	text.push(document.getElementById("arrow10"));
	text.push(document.getElementById("arrow11"));
	text.push(document.getElementById("arrow12"));
	text.push(document.getElementById("arrow13"));
	text.push(document.getElementById("arrow14"));
	text.push(document.getElementById("arrow15"));
	text.push(document.getElementById("arrow16"));
	text.push(document.getElementById("arrow17"));
	text.push(document.getElementById("arrow18"));

	subscripts.push(document.getElementById("arrowsub1"));
	subscripts.push(document.getElementById("arrowsub2"));
	subscripts.push(document.getElementById("arrowsub3"));
	subscripts.push(document.getElementById("arrowsub4"));
	subscripts.push(document.getElementById("arrowsub5"));
	subscripts.push(document.getElementById("arrowsub6"));
	subscripts.push(document.getElementById("arrowsub7"));
	subscripts.push(document.getElementById("arrowsub8"));
	subscripts.push(document.getElementById("arrowsub9"));
	subscripts.push(document.getElementById("arrowsub10"));
	subscripts.push(document.getElementById("arrowsub11"));
	subscripts.push(document.getElementById("arrowsub12"));
	subscripts.push(document.getElementById("arrowsub13"));
	subscripts.push(document.getElementById("arrowsub14"));
	subscripts.push(document.getElementById("arrowsub15"));
	subscripts.push(document.getElementById("arrowsub16"));
	subscripts.push(document.getElementById("arrowsub17"));
	subscripts.push(document.getElementById("arrowsub18"));


	const val = (checkbox.target.checked) ? "hidden" : "visible";
	arrows.forEach( elem => elem.style.visibility = val);
	text.forEach( elem => elem.style.visibility = val);
	subscripts.forEach( elem => elem.style.visibility = val);

}

export function toggle_bus_info_visablitity(checkbox) {
	let info = [];
	info.push(document.getElementById("imem_opcode_info1"));
    info.push(document.getElementById("imem_opcode_info1text"));
	info.push(document.getElementById("imem_opcode_info2"));
    info.push(document.getElementById("imem_opcode_info2text"));
	info.push(document.getElementById("imem_out_info3"));
    info.push(document.getElementById("imem_out_info3text"));
	info.push(document.getElementById("opcode_control_info"));
    info.push(document.getElementById("opcode_control_infotext"));
	info.push(document.getElementById("flags_control_info"));
    info.push(document.getElementById("flags_control_infotext"));
	info.push(document.getElementById("imem_in_top"));
    info.push(document.getElementById("imem_in_toptext"));
	info.push(document.getElementById("imem_in_middle"));
    info.push(document.getElementById("imem_in_middletext"));
	info.push(document.getElementById("imem_in_bottom"));
    info.push(document.getElementById("imem_in_bottomtext"));
	info.push(document.getElementById("mux0_out"));
    info.push(document.getElementById("mux0_outtext"));
	info.push(document.getElementById("mux1_out"));
    info.push(document.getElementById("mux1_outtext"));
	info.push(document.getElementById("mux2_out"));
    info.push(document.getElementById("mux2_outtext"));
	info.push(document.getElementById("mux3_out"));
    info.push(document.getElementById("mux3_outtext"));
	info.push(document.getElementById("alu_in_top_info"));
    info.push(document.getElementById("alu_in_top_infotext"));
	info.push(document.getElementById("alu_out_top_info"));
    info.push(document.getElementById("alu_out_top_infotext"));
	info.push(document.getElementById("alu_out_bottom_info"));
    info.push(document.getElementById("alu_out_bottom_infotext"));
	info.push(document.getElementById("mux4_out_info"));
    info.push(document.getElementById("mux4_out_infotext"));
	info.push(document.getElementById("mux1_feedback_info"));
    info.push(document.getElementById("mux1_feedback_infotext"));
	info.push(document.getElementById("mux1_intermediate_info"));
    info.push(document.getElementById("mux1_intermediate_infotext"));
    info.push(document.getElementById("mux3_in_top_info"));
    info.push(document.getElementById("mux3_in_top_infotext"));
	info.push(document.getElementById("mux3_in_bottom_info"));
    info.push(document.getElementById("mux3_in_bottom_infotext"));
	info.push(document.getElementById("pc_update_in_info"));
    info.push(document.getElementById("pc_update_in_infotext"));
	info.push(document.getElementById("pc_update_in_bottom_info"));
    info.push(document.getElementById("pc_update_in_bottom_infotext"));
	info.push(document.getElementById("dmem_in_top_info"));
    info.push(document.getElementById("dmem_in_top_infotext"));
	info.push(document.getElementById("dmem_in_bottom_info"));
    info.push(document.getElementById("dmem_in_bottom_infotext"));
	info.push(document.getElementById("pc_logic_out_top_info"));
    info.push(document.getElementById("pc_logic_out_top_infotext"));
	info.push(document.getElementById("pc_logic_out_bottom_info"));
    info.push(document.getElementById("pc_logic_out_bottom_infotext"));
	info.push(document.getElementById("imem_in_bottom"));
    info.push(document.getElementById("imem_in_bottomtext"));
	info.push(document.getElementById("pc_val_out_info"));
    info.push(document.getElementById("pc_val_out_infotext"));
	info.push(document.getElementById("mux0_in_top_info"));
    info.push(document.getElementById("mux0_in_top_infotext"));
	info.push(document.getElementById("mux0_in_bottom_info"));
    info.push(document.getElementById("mux0_in_bottom_infotext"));
	info.push(document.getElementById("mux1_in_bottom_info"));
    info.push(document.getElementById("mux1_in_bottom_infotext"));
	info.push(document.getElementById("mux2_in_top_info"));
    info.push(document.getElementById("mux2_in_top_infotext"));
	info.push(document.getElementById("mux2_in_bottom_info"));
    info.push(document.getElementById("mux2_in_bottom_infotext"));
	info.push(document.getElementById("switches_info"));
    info.push(document.getElementById("switches_infotext"));
	info.push(document.getElementById("mux_junct_info"));
    info.push(document.getElementById("mux_junct_infotext"));
	info.push(document.getElementById("mux_dmem_info"));
    info.push(document.getElementById("mux_dmem_infotext"));
	info.push(document.getElementById("imem_mux_info"));
    info.push(document.getElementById("imem_mux_infotext"));

	const val = (!checkbox.target.checked) ? "hidden" : "visible";
	info.forEach( elem => elem.style.visibility = val);

}


export function toggle_description_visablitity(checkbox) {
	let info = [];
	info.push(document.getElementById("imem_red_write_enable_text"));
    info.push(document.getElementById("imem_red_write_select_text"));
	info.push(document.getElementById("imem_red_input_text"));
    info.push(document.getElementById("imem_red_read_selection_text"));
	info.push(document.getElementById("regfile_red_write_enable_text"));
    info.push(document.getElementById("regfile_red_write_select_text"));
	info.push(document.getElementById("regfile_red_input_text"));
    info.push(document.getElementById("regfile_red_read_port0_select_text"));
	info.push(document.getElementById("regfile_red_read_port1_select_text"));
    info.push(document.getElementById("regfile_red_write_back_mux_text"));
	info.push(document.getElementById("alu_red_select_text"));
    info.push(document.getElementById("alu_red_result_text"));
	info.push(document.getElementById("alu_red_source_text"));
    info.push(document.getElementById("flags_red_write_enable_text"));
	info.push(document.getElementById("pc_red_mux_text"));
    info.push(document.getElementById("pc_red_write_enable_text"));
	info.push(document.getElementById("dmem_red_write_select_text"));
    info.push(document.getElementById("dmem_red_read_select_text"));
	info.push(document.getElementById("dmem_red_input_mux_text"));
    info.push(document.getElementById("dmem_red_write_enable_text"));
	info.push(document.getElementById("dmem_red_input_text"));
	const val = (!checkbox.target.checked) ? "hidden" : "visible";
	info.forEach( elem => elem.style.visibility = val);

}