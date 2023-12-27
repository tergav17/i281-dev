import * as Constants from "./constants.js";
import TextSVG from "./TextSVG.js";
import PolygonSVG from "./PolygonSVG.js";

const PC_TPOS = [100, 30];
const PC_VAL = [100, 75];
const BOX = [0, 0, 100, 0, 100, 40, 0, 40];
const BOX_OFFSET = [Constants.PC_VALUE_OFFSET[0] + PC_VAL[0] - 50, Constants.PC_VALUE_OFFSET[1] + PC_VAL[1] - 28];
export default class PCValueSVG {
	constructor() {
		this.pc_update = new PolygonSVG(Constants.PC_VALUE_ID, Constants.PC_VALUE_POLYGON, Constants.BLOCK_STYLE, Constants.PC_VALUE_OFFSET);
		this.pc_text = new TextSVG(PC_TPOS[0], PC_TPOS[1], Constants.REG_TEXT_ID, "PC", Constants.COMPONENT_NAME_TEXT_STYLE, Constants.PC_VALUE_OFFSET);
		this.pc_val = new TextSVG(PC_VAL[0], PC_VAL[1], Constants.PC_VAL_ID, this.pad((cpu.pc.currentPC).toString(2),6), Constants.TEXT_STYLE, Constants.PC_VALUE_OFFSET);
		this.pc_val_box = new PolygonSVG(Constants.PC_VAL_BOX_ID, BOX, Constants.THIN_BLOCK_STYLE, BOX_OFFSET);
	}
    
	get_all_nodes() {
		let res = [];
		res.push(this.pc_update.get_node());
		res.push(this.pc_text.get_node());
		res.push(this.pc_val.get_node());
		res.push(this.pc_val_box.get_node());
		return res;
	}

	pad(n, width, z) {
		z = z || '0';
		n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	  }

}