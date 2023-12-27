import * as Constants from "./constants.js";

export default class CircleSVG {
	constructor(id, points, r, style_obj, offset) {
		this.id = id;
		this.node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		this.node.setAttribute(Constants.ID_ATTR, id);
		this.style = Object.assign({}, style_obj);
        this.build_style(this.style);

		this.node.setAttribute("cx", points[0]);	
		this.node.setAttribute("cy", points[1]);
        this.node.setAttribute("r", r);
		this.node.setAttribute(Constants.STYLE_ATTR, this.curr_style);
		if(offset)
			this.translate(offset[0], offset[1]);
	}

	build_style(style_obj) {
		this.curr_style = "";
		for (const key of Object.keys(style_obj)) {
			this.curr_style += key + ": " + style_obj[key] + "; ";
		}
		
	}
	update_style(key, val) {
		if (val === undefined) return;
		this.style[key] = val;
		this.build_style(this.style);
		this.set_attribute(Constants.STYLE_ATTR, this.curr_style);
	}
    
	get_node() { return this.node; }
    
	set_attribute(key, val){
		if (val === undefined) return this.node.getAttribute(key);
		this.node.setAttribute(key, val);
	}
    
	set_point(x, y) {
		this.x = x;
		this.y = y;
		this.node.setAttributeNS(null,"x", x);	
		this.node.setAttributeNS(null,"y", y);
	}

	translate(x, y) {
		this.x += x;
		this.y += y;
		this.node.setAttributeNS(null,"x", this.x);	
		this.node.setAttributeNS(null,"y", this.y);		
    }
}