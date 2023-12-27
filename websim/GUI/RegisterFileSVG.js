import * as Constants from "./constants.js";
import TextSVG from "./TextSVG.js";
import PolygonSVG from "./PolygonSVG.js";
import Mux4_1SVG from "./Mux4_1SVG.js";
import PathSVG from "./PathSVG.js";
import CircleSVG from "./CircleSVG.js";

const REG_TPOS = [120, 30];
const REG_A = [100, 500/5 * 1];
const REG_B = [100, 100 + 122];
const REG_C = [100, 100 + 244];
const REG_D = [100, 465];

const REG_A_BOX_OFFSET = [Constants.REGISTER_FILE_OFFSET[0] + REG_A[0] - 60, Constants.REGISTER_FILE_OFFSET[1] + REG_A[1] - 22];
const REG_B_BOX_OFFSET = [Constants.REGISTER_FILE_OFFSET[0] + REG_B[0] - 60, Constants.REGISTER_FILE_OFFSET[1] + REG_B[1] - 22];
const REG_C_BOX_OFFSET = [Constants.REGISTER_FILE_OFFSET[0] + REG_C[0] - 60, Constants.REGISTER_FILE_OFFSET[1] + REG_C[1] - 22];
const REG_D_BOX_OFFSET = [Constants.REGISTER_FILE_OFFSET[0] + REG_D[0] - 60, Constants.REGISTER_FILE_OFFSET[1] + REG_D[1] - 22];

export default class RegisterFileSVG {

	constructor() {
		this.reg_file = new PolygonSVG(Constants.REG_FILE_ID, Constants.REGISTER_FILE_POLYGON, Constants.BLOCK_STYLE, Constants.REGISTER_FILE_OFFSET);
		this.register_text = new TextSVG(REG_TPOS[0], REG_TPOS[1], Constants.REG_TEXT_ID, Constants.REG_TEXT, Constants.COMPONENT_NAME_TEXT_STYLE, Constants.REGISTER_FILE_OFFSET);

		this.reg_a_label = new TextSVG(REG_A[0] - 80, REG_A[1], Constants.REG_A_LABEL_ID, "A", Constants.COMPONENT_NAME_TEXT_STYLE, Constants.REGISTER_FILE_OFFSET);
		this.reg_b_label = new TextSVG(REG_B[0] - 80, REG_B[1], Constants.REG_B_LABEL_ID, "B", Constants.COMPONENT_NAME_TEXT_STYLE, Constants.REGISTER_FILE_OFFSET);
		this.reg_c_label = new TextSVG(REG_C[0] - 80, REG_C[1], Constants.REG_C_LABEL_ID, "C", Constants.COMPONENT_NAME_TEXT_STYLE, Constants.REGISTER_FILE_OFFSET);
		this.reg_d_label = new TextSVG(REG_D[0] - 80, REG_D[1], Constants.REG_D_LABEL_ID, "D", Constants.COMPONENT_NAME_TEXT_STYLE, Constants.REGISTER_FILE_OFFSET);
        
		this.reg_a_box = new PolygonSVG(Constants.REG_A_BOX_ID, [...Constants.REGISTER_BOX], Constants.BLOCK_STYLE, REG_A_BOX_OFFSET);
		this.reg_b_box = new PolygonSVG(Constants.REG_B_BOX_ID, [...Constants.REGISTER_BOX], Constants.BLOCK_STYLE, REG_B_BOX_OFFSET);
		this.reg_c_box = new PolygonSVG(Constants.REG_C_BOX_ID, [...Constants.REGISTER_BOX], Constants.BLOCK_STYLE, REG_C_BOX_OFFSET);
		this.reg_d_box = new PolygonSVG(Constants.REG_D_BOX_ID, [...Constants.REGISTER_BOX], Constants.BLOCK_STYLE, REG_D_BOX_OFFSET);

    
		this.reg_a_text = new TextSVG(REG_A[0]+10, REG_A[1], Constants.REG_A_ID, cpu.registers.getRegister(0), Constants.TEXT_STYLE, Constants.REGISTER_FILE_OFFSET);
		this.reg_b_text = new TextSVG(REG_B[0]+10, REG_B[1], Constants.REG_B_ID, cpu.registers.getRegister(1), Constants.TEXT_STYLE, Constants.REGISTER_FILE_OFFSET);
		this.reg_c_text = new TextSVG(REG_C[0]+10, REG_C[1], Constants.REG_C_ID, cpu.registers.getRegister(2), Constants.TEXT_STYLE, Constants.REGISTER_FILE_OFFSET);
		this.reg_d_text = new TextSVG(REG_D[0]+10, REG_D[1], Constants.REG_D_ID, cpu.registers.getRegister(3), Constants.TEXT_STYLE, Constants.REGISTER_FILE_OFFSET);
    
		this.read_a_mux = new Mux4_1SVG(Constants.READ_A_MUX_ID, Constants.READ_A_MUX_A_ID, Constants.READ_A_MUX_B_ID, Constants.READ_A_MUX_C_ID, Constants.READ_A_MUX_D_ID, Constants.READ_A_MUX_OFFSET);
		this.read_b_mux = new Mux4_1SVG(Constants.READ_B_MUX_ID, Constants.READ_B_MUX_A_ID, Constants.READ_B_MUX_B_ID, Constants.READ_B_MUX_C_ID, Constants.READ_B_MUX_D_ID, Constants.READ_B_MUX_OFFSET);
		window.read_a_mux = this.read_a_mux;
		window.read_b_mux = this.read_b_mux;
		this.read_a_int = new CircleSVG("path_a_circle",  [REG_A_BOX_OFFSET[0] + 140 + 55, REG_A_BOX_OFFSET[1]+15] , 7, Constants.INTERSECT_STYLE);
		this.a_out = new PathSVG("0_out", ["M", REG_A_BOX_OFFSET[0] + 140, REG_A_BOX_OFFSET[1]+15, "l", 53,0], Constants.THIN_WIRE_STYLE);
		this.a_out_to_read_a = new PathSVG("0_out_to_read_a", ["M", REG_A_BOX_OFFSET[0] + 140 + 53, REG_A_BOX_OFFSET[1]+15, "l", 53,0], Constants.THIN_WIRE_STYLE);
		this.a_out_to_read_b = new PathSVG("0_out_to_read_b", ["M", REG_A_BOX_OFFSET[0] + 140 + 55, REG_A_BOX_OFFSET[1]+15, "l", 0, 250, 50,0], Constants.THIN_WIRE_STYLE);
		
		this.read_b_cir =  new CircleSVG("path_b_circle",  [REG_B_BOX_OFFSET[0] + 140 + 37.5, REG_B_BOX_OFFSET[1]+15] , 7, Constants.INTERSECT_STYLE);
		this.b_to_int = new PathSVG("1_out", ["M", REG_B_BOX_OFFSET[0] + 140, REG_B_BOX_OFFSET[1]+15, "l", 40,0], Constants.THIN_WIRE_STYLE);
		this.b_to_read_a = new PathSVG("1_out_to_read_a", ["M", REG_B_BOX_OFFSET[0] + 140 + 37.5, REG_B_BOX_OFFSET[1]+15, "l", 0, -84, 65,0], Constants.THIN_WIRE_STYLE);
		this.b_to_read_b = new PathSVG("1_out_to_read_b", ["M", REG_B_BOX_OFFSET[0] + 140 + 37.5, REG_B_BOX_OFFSET[1]+15, "l", 0, 166, 65,0], Constants.THIN_WIRE_STYLE);

		this.read_c_cir =  new CircleSVG("path_c_circle",  [REG_C_BOX_OFFSET[0] + 140 + 20, REG_C_BOX_OFFSET[1]+15] , 7, Constants.INTERSECT_STYLE);
		this.c_to_int = new PathSVG("2_out", ["M", REG_C_BOX_OFFSET[0] + 140, REG_C_BOX_OFFSET[1]+15, "l", 20,0], Constants.THIN_WIRE_STYLE);
		this.c_to_read_a = new PathSVG("2_out_to_read_a", ["M", REG_C_BOX_OFFSET[0] + 140 + 20, REG_C_BOX_OFFSET[1]+15, "l", 0, -167, 85,0], Constants.THIN_WIRE_STYLE);
		this.c_to_read_b = new PathSVG("2_out_to_read_b", ["M", REG_C_BOX_OFFSET[0] + 140 + 20, REG_C_BOX_OFFSET[1]+15, "l", 0, 83, 85,0], Constants.THIN_WIRE_STYLE);

		this.read_d_int = new CircleSVG("path_d_circle",  [REG_D_BOX_OFFSET[0] + 140 + 72, REG_D_BOX_OFFSET[1]+15] , 7, Constants.INTERSECT_STYLE);
		this.d_out = new PathSVG("3_out", ["M", REG_D_BOX_OFFSET[0] + 142, REG_D_BOX_OFFSET[1]+15, "l", 70, 0], Constants.THIN_WIRE_STYLE);
		this.d_to_read_b = new PathSVG("3_out_to_read_b", ["M", REG_D_BOX_OFFSET[0] + 142 + 70, REG_D_BOX_OFFSET[1]+15, "l", 33, 0], Constants.THIN_WIRE_STYLE);
		this.d_to_read_a = new PathSVG("3_out_to_read_a", ["M", REG_D_BOX_OFFSET[0] + 140 + 72, REG_D_BOX_OFFSET[1]+15, "l", 0, -250, 30,0], Constants.THIN_WIRE_STYLE);

	}
    
	get_all_nodes() {
		let res = [];
		res.push(this.reg_file.get_node());
		res.push(this.register_text.get_node());
		res.push(this.reg_a_label.get_node());
		res.push(this.reg_b_label.get_node());
		res.push(this.reg_c_label.get_node());
		res.push(this.reg_d_label.get_node());
		res.push(this.reg_a_text.get_node());
		res.push(this.reg_b_text.get_node());
		res.push(this.reg_c_text.get_node());
		res.push(this.reg_d_text.get_node());
		res.push(this.reg_a_box.get_node());
		res.push(this.reg_b_box.get_node());
		res.push(this.reg_c_box.get_node());
		res.push(this.reg_d_box.get_node());

		res.push(this.a_out.get_node());
		res.push(this.a_out_to_read_a.get_node());
		res.push(this.a_out_to_read_b.get_node());

		res.push(this.b_to_int.get_node());
		res.push(this.b_to_read_a.get_node());
		res.push(this.b_to_read_b.get_node());

		res.push(this.c_to_int.get_node());
		res.push(this.c_to_read_a.get_node());
		res.push(this.c_to_read_b.get_node());
		
		res.push(this.d_to_read_a.get_node());
		res.push(this.d_out.get_node());
		res.push(this.d_to_read_b.get_node());

		res.push(this.read_a_int.get_node());
		res.push(this.read_b_cir.get_node());
		res.push(this.read_c_cir.get_node());
		res.push(this.read_d_int.get_node());

		this.read_a_mux.get_all_nodes().forEach(x => res.push(x));
		this.read_b_mux.get_all_nodes().forEach(x => res.push(x));

		return res;
	}
}