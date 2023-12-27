import * as Constants from "./constants.js";


export default class PolygonSVG {
	constructor(id, points, style_obj, offset, onClick) {
		this.id = id;
		this.node = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
		this.node.setAttribute(Constants.ID_ATTR, id);
		this.style = Object.assign({}, style_obj);
		this.build_style(this.style);
		this.node.setAttribute(Constants.STYLE_ATTR, this.curr_style);
		this.point_list = [];
		if(points) {
			points.forEach(val => this.point_list.push(val));
			this.node.setAttribute("points", this.build(this.point_list));
			if(offset)
				this.translate(offset[0], offset[1]);
		}
		this.node.addEventListener('click', onClick);
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
    
	set_point(i, x, y) {
		this.point_list[i] = [x, y];
		this.node.setAttribute("points", this.build(this.point_list));
	}

	translate(x, y) {
		this.x += x;
		this.y += y;
		for (var i = 0; i < this.point_list.length - 1; i += 2) {
			this.point_list[i] += x;
			this.point_list[i + 1] +=y ;
		}	
		this.node.setAttribute("points", this.build(this.point_list));

	}
    
	build(arg) {
		var res = [];
		for (let i = 0, l = arg.length; i < l; i++)
			res.push(arg[i] + ",");
		return res.join(" ").slice(0, -1);
	}
}