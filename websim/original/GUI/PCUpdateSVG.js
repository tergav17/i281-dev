import * as Constants from "./constants.js";
import TextSVG from "./TextSVG.js";
import PolygonSVG from "./PolygonSVG.js";

const PC_TPOS = [100, 50];
const PC_VAL = [100, 75];
export default class PCUpdateSVG {
	constructor() {
		this.pc_update = new PolygonSVG(Constants.PC_UPDATE_ID, Constants.PC_UPDATE_POLYGON, Constants.BLOCK_STYLE, Constants.PC_UPDATE_OFFSET);
		this.top_text = new TextSVG(PC_TPOS[0], PC_TPOS[1], Constants.PC_UPDATE_TEXT_ID, "PC", Constants.COMPONENT_NAME_TEXT_STYLE, Constants.PC_UPDATE_OFFSET);
		this.middle_text = new TextSVG(PC_TPOS[0], PC_TPOS[1]+ 30, Constants.PC_UPDATE_TEXT_ID, "Update", Constants.COMPONENT_NAME_TEXT_STYLE, Constants.PC_UPDATE_OFFSET);
		this.bottom_text = new TextSVG(PC_TPOS[0], PC_TPOS[1] + 60, Constants.PC_UPDATE_TEXT_ID, "Logic", Constants.COMPONENT_NAME_TEXT_STYLE, Constants.PC_UPDATE_OFFSET);
	}
    
	get_all_nodes() {
		let res = [];
		res.push(this.pc_update.get_node());
		res.push(this.top_text.get_node());
		res.push(this.middle_text.get_node());
		res.push(this.bottom_text.get_node());
		return res;
	}
    

}