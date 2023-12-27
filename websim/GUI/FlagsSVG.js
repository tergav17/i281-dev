import * as Constants from "./constants.js";
import TextSVG from "./TextSVG.js";
import PolygonSVG from "./PolygonSVG.js";

const FLAGS_DIST_BETWEEN = 30;
const BOX = [0, 0, 120, 0, 120, 40, 0, 40];
const BOX_OFFSET = [Constants.FLAGS_OFFSET[0] + Constants.FLAG_VPOS[0] + 15, Constants.FLAGS_OFFSET[1] + Constants.FLAG_VPOS[1] - 28];
export default class FlagsSVG {
	constructor() {
		this.flags =  new PolygonSVG(Constants.FLAGS_ID, Constants.FLAGS_POLYGON, Constants.BLOCK_STYLE, Constants.FLAGS_OFFSET);
		this.flags_text =  new TextSVG(Constants.FLAG_TPOS[0],Constants.FLAG_TPOS[1], Constants.FLAG_TEXT_ID, Constants.FLAG_TEXT, Constants.COMPONENT_NAME_TEXT_STYLE, Constants.FLAGS_OFFSET);
		this.carry_flag = new TextSVG(Constants.FLAG_VPOS[0] + 1 * FLAGS_DIST_BETWEEN,Constants.FLAG_VPOS[1], Constants.CARRY_FLAG_ID, "0", Constants.TEXT_STYLE, Constants.FLAGS_OFFSET);
		this.overflow_flag = new TextSVG(Constants.FLAG_VPOS[0] + 2 * FLAGS_DIST_BETWEEN,Constants.FLAG_VPOS[1], Constants.OVERFLOW_FLAG_ID, "0", Constants.TEXT_STYLE, Constants.FLAGS_OFFSET);
		this.negative_flag = new TextSVG(Constants.FLAG_VPOS[0] + 3 * FLAGS_DIST_BETWEEN,Constants.FLAG_VPOS[1], Constants.NEGATIVE_FLAG_ID, "0", Constants.TEXT_STYLE, Constants.FLAGS_OFFSET);
		this.zero_flag = new TextSVG(Constants.FLAG_VPOS[0] + 4 * FLAGS_DIST_BETWEEN,Constants.FLAG_VPOS[1], Constants.ZERO_FLAG_ID, "0", Constants.TEXT_STYLE, Constants.FLAGS_OFFSET);
		this.box = new PolygonSVG(Constants.PC_VAL_BOX_ID, BOX, Constants.THIN_BLOCK_STYLE, BOX_OFFSET);

	}
    
	get_all_nodes() {
		let res = [];
		res.push(this.flags.get_node());
		res.push(this.flags_text.get_node());
		res.push(this.carry_flag.get_node());
		res.push(this.zero_flag.get_node());
		res.push(this.overflow_flag.get_node());
		res.push(this.negative_flag.get_node());
		res.push(this.box.get_node());
		return res;
	}
    

}