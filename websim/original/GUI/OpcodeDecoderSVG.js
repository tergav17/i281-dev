import * as Constants from "./constants.js";
import TextSVG from "./TextSVG.js";
import PolygonSVG from "./PolygonSVG.js";

const OPCODE_TPOS = [100, 40];

const FLAGS_DIST_BETWEEN = 30;
const BOX = [0, 0, 120, 0, 120, 40, 0, 40];
const BOX_OFFSET = [Constants.FLAGS_OFFSET[0] + Constants.FLAG_VPOS[0] + 15, Constants.FLAGS_OFFSET[1] + Constants.FLAG_VPOS[1] - 28];
export default class OpcodeDeCoderSVG {
	constructor() {
        this.opcode_decoder = new PolygonSVG(Constants.OPCODE_DECODER_ID, Constants.OPCODE_DECODER_POLYGON, Constants.BLOCK_STYLE, Constants.OPCODE_DECODER_OFFSET);
		this.top_text = new TextSVG(OPCODE_TPOS[0], OPCODE_TPOS[1], Constants.OPCODE_TEXT_ID, "Opcode", Constants.COMPONENT_NAME_TEXT_STYLE, Constants.OPCODE_DECODER_OFFSET);
		this.middle_text = new TextSVG(OPCODE_TPOS[0], OPCODE_TPOS[1]+ 30, Constants.OPCODE_TEXT_ID, "Decoder", Constants.COMPONENT_NAME_TEXT_STYLE, Constants.OPCODE_DECODER_OFFSET);

	}
    
	get_all_nodes() {
		let res = [];
		res.push(this.opcode_decoder.get_node());
		res.push(this.top_text.get_node());
		res.push(this.middle_text.get_node());

		return res;
	}
    

}