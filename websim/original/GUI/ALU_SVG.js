import * as Constants from "./constants.js";
import TextSVG from "./TextSVG.js";
import PolygonSVG from "./PolygonSVG.js";

const TPOS = [95, 170];

export default class ALU_SVG {
	constructor() {
        this.alu = new PolygonSVG(Constants.ALU_ID, Constants.ALU_POLYGON, Constants.BLOCK_STYLE, Constants.ALU_OFFSET);
		this.text = new TextSVG(TPOS[0], TPOS[1], "ALUTextid", "ALU", Constants.COMPONENT_NAME_TEXT_STYLE, Constants.ALU_OFFSET);
	}
    
	get_all_nodes() {
		let res = [];
		res.push(this.alu.get_node());
		res.push(this.text.get_node());
		return res;
	}
    

}