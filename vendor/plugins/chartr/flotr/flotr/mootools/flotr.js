var Flotr = (function(){
	var plotCnt = 0;		
	/**
	 * Function: (private) getSeries
	 * 
	 * Collects dataseries from input and parses the series into the right format. It 
	 * returns an Array of Objects each having at least the 'data' key set.
	 * 
	 * Parameters:
	 * 		data - Object or array of dataseries
	 * 
	 * Returns:
	 * 		Array of Objects parsed into the right format ({(...,) data: [[x1,y1], [x2,y2], ...] (, ...)})
	 */
	function getSeries(data){
		return data.map(function(serie){
			return (serie.data) ? $extend(serie,{}) : {'data': serie};
		});
	}	
	/**
	 * Function: (private) getTickSize
	 * 
	 * Function calculates the ticksize and returns it.
	 * 
	 * Parameters:
	 * 		noTicks - Number of ticks
	 * 		min - Lower bound integer value for the current axis.
	 * 		max - Upper bound integer value for the current axis.
	 * 		decimals - Number of decimals for the ticks.
	 * 
	 * Returns:
	 * 		Returns the size of a tick.
	 */
	function getTickSize(noTicks, min, max, decimals){
		var delta = (max - min) / noTicks;	
		var magn = getMagnitude(delta);
		
		/**
		 * Norm is between 1.0 and 10.0.
		 */
		var norm = delta / magn;
		
		var tickSize = 10;
		if(norm < 1.5) tickSize = 1;
		else if(norm < 2.25) tickSize = 2;
		else if(norm < 3) tickSize = ((decimals == 0) ? 2 : 2.5);
		else if(norm < 7.5) tickSize = 5;
				
		return tickSize * magn;
	}
	/**
	 * Function: (private) defaultTickFormatter
	 * 
	 * Formats the ticks.
	 * 
	 * Parameters:
	 * 		val - Tick value integer.
	 * 
	 * Returns:
	 * 		Formatted tick string.
	 */
	function defaultTickFormatter(val){
		return val+'';
	}
	/**
	 * Function: (private) defaultTrackFormatter
	 * 
	 * Formats the mouse tracker values.
	 * 
	 * Parameters:
	 * 		val - Track value Object {x:..,y:..}.
	 * 
	 * Returns:
	 * 		Formatted track string.
	 */
	function defaultTrackFormatter(obj){
		return '('+obj.x+', '+obj.y+')';
	}	 
	/**
	 * Function: (private) getMagnitude
	 * 
	 * Returns the magnitude of the input value.
	 * 
	 * Parameters:
	 * 		x - Integer or float value
	 * 
	 * Returns:
	 * 		Returns the magnitude of the input value.
	 */
	function getMagnitude(x){
		return Math.pow(10, Math.floor(Math.log(x) / Math.LN10));
	}
	/**
	 * Function: (private) parseColor
	 * 
	 * Parses a color string and returns a corresponding Color.
	 * 
	 * Parameters:
	 * 		str - String that represents a color.
	 */
	function parseColor(str){
		var result;
		
		/**
		 * rgb(num,num,num)
		 */
		if((result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(str)))
			return new Color(parseInt(result[1]), parseInt(result[2]), parseInt(result[3]));
	
		/**
		 * rgba(num,num,num,num)
		 */
		if((result = /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(str)))
			return new Color(parseInt(result[1]), parseInt(result[2]), parseInt(result[3]), parseFloat(result[4]));
			
		/**
		 * rgb(num%,num%,num%)
		 */
		if((result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(str)))
			return new Color(parseFloat(result[1])*2.55, parseFloat(result[2])*2.55, parseFloat(result[3])*2.55);
	
		/**
		 * rgba(num%,num%,num%,num)
		 */
		if((result = /rgba\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(str)))
			return new Color(parseFloat(result[1])*2.55, parseFloat(result[2])*2.55, parseFloat(result[3])*2.55, parseFloat(result[4]));
			
		/**
		 * #a0b1c2
		 */
		if((result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(str)))
			return new Color(parseInt(result[1],16), parseInt(result[2],16), parseInt(result[3],16));
	
		/**
		 * #fff
		 */
		if((result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(str)))
			return new Color(parseInt(result[1]+result[1],16), parseInt(result[2]+result[2],16), parseInt(result[3]+result[3],16));

		/**
		 * Otherwise, we're most likely dealing with a named color.
		 */
		var name = str.trim().toLowerCase();
		if(name == 'transparent'){
			return new Color(255, 255, 255, 0);
		}
		result = lookupColors[name];
		return new Color(result[0], result[1], result[2]);
	}
	/**
	 * Function: (private) extractColor
	 * 
	 * Returns the background-color of the canvas container color string.
	 * 
	 * Parameters:
	 * 		element - String that represents a color.
	 * 
	 * Returns:
	 * 		Returns the background-color of the canvas container color string.
	 */
	function extractColor(element){
		var color;
		/**
		 * Loop until we find an element with a background color and stop when we hit the body element. 
		 */
		do{
			color = element.getStyle('background-color').toLowerCase();
			if(!(color == '' || color == 'transparent')) break;		
			element = element.getParent();
		}while(element.nodeName.toLowerCase() != 'body');

		/**
		 * Catch Safari's way of signalling transparent
		 */		
		return (color == 'rgba(0, 0, 0, 0)') ? 'transparent' : color;
	}
	/**
	 * Function: (private) Color
	 *
	 * Returns a Color object.
	 *
	 * Parameters:
	 * 		r - Red value.
	 * 		g - Green value.
	 * 		b - Blue value.
	 * 		a - Alpha value.
	 *
	 * Returns:
	 * 		void
	 */
	function Color(r, g, b, a){	   
		var rgba = ['r','g','b','a'];
		var x = 4;
		while(-1<--x){
			this[rgba[x]] = arguments[x] || ((x==3) ? 1.0 : 0);
		}
	   
		this.toString = function(){
			return (this.a >= 1.0) ? 'rgb('+[this.r,this.g,this.b].join(',')+')' : 'rgba('+[this.r,this.g,this.b,this.a].join(',')+')';
		};

		this.scale = function(rf, gf, bf, af) {
			x = 4;
			while(-1<--x){
				if(arguments[x] != null)
					this[rgba[x]] *= arguments[x];
			}
			return this.normalize();
		};

		this.adjust = function(rd, gd, bd, ad) {
			x = 4;
			while(-1<--x){
				if(arguments[x] != null)
					this[rgba[x]] += arguments[x];
			}
			return this.normalize();
		};

		this.clone = function(){
			return new Color(this.r, this.b, this.g, this.a);
		};

		var limit = function(val,minVal,maxVal){
			return Math.max(Math.min(val, maxVal), minVal);
		};

		this.normalize = function(){
			this.r = limit(parseInt(this.r), 0, 255);
			this.g = limit(parseInt(this.g), 0, 255);
			this.b = limit(parseInt(this.b), 0, 255);
			this.a = limit(this.a, 0, 1);
			return this;
		};

		this.normalize();
	}
	var lookupColors = {
		aqua:[0,255,255],
		azure:[240,255,255],
		beige:[245,245,220],
		black:[0,0,0],
		blue:[0,0,255],
		brown:[165,42,42],
		cyan:[0,255,255],
		darkblue:[0,0,139],
		darkcyan:[0,139,139],
		darkgrey:[169,169,169],
		darkgreen:[0,100,0],
		darkkhaki:[189,183,107],
		darkmagenta:[139,0,139],
		darkolivegreen:[85,107,47],
		darkorange:[255,140,0],
		darkorchid:[153,50,204],
		darkred:[139,0,0],
		darksalmon:[233,150,122],
		darkviolet:[148,0,211],
		fuchsia:[255,0,255],
		gold:[255,215,0],
		green:[0,128,0],
		indigo:[75,0,130],
		khaki:[240,230,140],
		lightblue:[173,216,230],
		lightcyan:[224,255,255],
		lightgreen:[144,238,144],
		lightgrey:[211,211,211],
		lightpink:[255,182,193],
		lightyellow:[255,255,224],
		lime:[0,255,0],
		magenta:[255,0,255],
		maroon:[128,0,0],
		navy:[0,0,128],
		olive:[128,128,0],
		orange:[255,165,0],
		pink:[255,192,203],
		purple:[128,0,128],
		violet:[128,0,128],
		red:[255,0,0],
		silver:[192,192,192],
		white:[255,255,255],
		yellow:[255,255,0]
	};	
	function Plot(container, data, opts) {
		/**
		 * Initialize variables.
		 */
		var options, canvas, overlay, ctx, octx;		
		var target = container;
		this.id = id = 'flotr-' + plotCnt++;
		this.series = series = getSeries(data);
		this.xaxis = xaxis = {};
		this.yaxis = yaxis = {};		
		this.plotOffset = plotOffset = {left: 0, right: 0, top: 0, bottom: 0};
		var labelMaxWidth = 0;
		var labelMaxHeight = 0;
		var canvasWidth = 0;
		var canvasHeight = 0;
		var plotWidth = 0;
		var plotHeight = 0;
		var hozScale = 0;
		var vertScale = 0;
						
		this.options = setOptions(opts);		
		constructCanvas();
		bindEvents();
		findDataRanges();
		calculateRange(xaxis, options.xaxis);
		extendXRangeIfNeededByBar();
		calculateRange(yaxis, options.yaxis);
		extendYRangeIfNeededByBar();
		calculateTicks(xaxis, options.xaxis);
		calculateTicks(yaxis, options.yaxis);
		calculateSpacing();
		draw();
		insertLegend();
		
		this.clearSelection = clearSelection;
		this.setSelection = setSelection;

		this.clearSelection = clearSelection;
		this.setSelection = setSelection;
			
		/**
		 * Function: (private) setOptions
		 * 
		 * Merges user-defined and default options. Also generates colors for series for which 
		 * the user didn't specify a color, and merge user-defined series options with default options. 
		 * 
		 * Parameters:
		 * 		none
		 * 
		 * Returns:
		 * 		void
		 */
		function setOptions(o){
			
			options = $merge({
				colors: ['#00A8F0', '#C0D800', '#cb4b4b', '#4da74d', '#9440ed'], //=> The default colorscheme. When there are > 5 series, additional colors are generated.
				legend: {
					show: true,				// => setting to true will show the legend, hide otherwise
					noColumns: 1,			// => number of colums in legend table
					labelFormatter: null,	// => fn: string -> string
					labelBoxBorderColor: '#ccc', // => border color for the little label boxes
					container: null,			// => container (as jQuery object) to put legend in, null means default on top of graph
					position: 'ne',			// => position of default legend container within plot
					margin: 5,				// => distance from grid edge to default legend container within plot
					backgroundColor: null,	// => null means auto-detect
					backgroundOpacity: 0.85	// => set to 0 to avoid background, set to 1 for a solid background
				},
				xaxis: {
					ticks: null,			// => format: either [1, 3] or [[1, 'a'], 3]
					noTicks: 5,				// => number of ticks for automagically generated ticks
					tickFormatter: defaultTickFormatter, // => fn: number -> string
					tickDecimals: null,		// => no. of decimals, null means auto
					min: null,				// => min. value to show, null means set automatically
					max: null,				// => max. value to show, null means set automatically
					autoscaleMargin: 0		// => margin in % to add if auto-setting min/max
				},
				yaxis: {
					ticks: null,			// => format: either [1, 3] or [[1, 'a'], 3]
					noTicks: 5,				// => number of ticks for automagically generated ticks
					tickFormatter: defaultTickFormatter, // => fn: number -> string
					tickDecimals: null,		// => no. of decimals, null means auto
					min: null,				// => min. value to show, null means set automatically
					max: null,				// => max. value to show, null means set automatically
					autoscaleMargin: 0		// => margin in % to add if auto-setting min/max
				},
				points: {
					show: false,			// => setting to true will show points, false will hide
					radius: 3,				// => point radius (pixels)
					lineWidth: 2,			// => line width in pixels
					fill: true,				// => true to fill the points with a color, false for (transparent) no fill
					fillColor: '#ffffff',	// => fill color
					fillOpacity: 0.4
				},
				lines: {
					show: false,			// => setting to true will show lines, false will hide
					lineWidth: 2, 			// => line width in pixels
					fill: false,			// => true to fill the area from the line to the x axis, false for (transparent) no fill
					fillColor: null,		// => fill color
					fillOpacity: 0.4		// => opacity of the fill color, set to 1 for a solid fill, 0 hides the fill
				},
				bars: {
					show: false,			// => setting to true will show bars, false will hide
					lineWidth: 2,			// => in pixels
					barWidth: 1,			// => in units of the x axis
					fill: true,				// => true to fill the area from the line to the x axis, false for (transparent) no fill
					fillColor: null,		// => fill color
					fillOpacity: 0.4,		// => opacity of the fill color, set to 1 for a solid fill, 0 hides the fill
					horizontal: false
				},
				grid: {
					color: '#545454',		// => primary color used for outline and labels
					backgroundColor: null,	// => null for transparent, else color
					tickColor: '#dddddd',	// => color used for the ticks
					labelMargin: 3,			// => margin in pixels
					verticalLines: true,	// => whether to show gridlines in vertical direction
					horizontalLines: true,	// => whether to show gridlines in horizontal direction
					outlineWidth: 2			// => width of the grid outline/border in pixels
				},
				selection: {
					mode: null,				// => one of null, 'x', 'y' or 'xy'
					color: '#B6D9FF',		// => selection box color
					fps: 10					// => frames-per-second
				},
				mouse: {
					track: null,			// => true to track the mouse, no tracking otherwise
					position: 'se',			// => position of the value box (default south-east)
					trackFormatter: defaultTrackFormatter, // => formats the values in the value box
					margin: 3,				// => margin in pixels of the valuebox
					lineColor: '#ff3f19',		// => line color of points that are drawn when mouse comes near a value of a series
					trackDecimals: 1,		// => decimals for the track values
					sensibility: 2,			// => the lower this number, the more precise you have to aim to show a value
					radius: 3				// => radius of the tracck point
				},
				shadowSize: 4				// => size of the 'fake' shadow
			}, o);		
			
			/**
			 * Collect colors assigned by the user to a serie.
			 */
			var neededColors = series.length, usedColors = [],  assignedColors = [];
			for(var i = series.length - 1; i > -1; --i){
				var sc = series[i].color;
				if(sc != null){
					--neededColors;
					if($type(sc) == 'number') assignedColors.push(sc);
					else usedColors.push(parseColor(series[i].color));
				}
			}
			
			/**
			 * Calculate the number of colors that need to be generated.
			 */
			for(var j = assignedColors.length - 1; j > -1; --j)
				neededColors = Math.max(neededColors, assignedColors[j] + 1);
	
			/**
			 * Generate colors.
			 */
			var colors = [], variation = 0, k = 0;
			while(colors.length < neededColors){
				var c = (options.colors.length == k) ? new Color(100, 100, 100) : parseColor(options.colors[k]);
				
				/**
				 * Make sure each serie gets a different color.
				 */
				var sign = variation % 2 == 1 ? -1 : 1;
				var factor = 1 + sign * Math.ceil(variation / 2) * 0.2;
				c.scale(factor, factor, factor);
	
				/**
				 * @todo if we're getting to close to something else, we should probably skip this one
				 */
				colors.push(c);
				
				if(++k >= options.colors.length){
					k = 0;
					++variation;
				}
			}
		
			/**
			 * Fill the options with the generated colors.
			 */
			for(var m = 0, ln = series.length, n = 0, s; m < ln; ++m){
				s = series[m];
				
				/**
				 * Assign the color.
				 */
				if(s.color == null){
					s.color = colors[n++].toString();
	            }else if($type(s.color) == 'number'){
					s.color = colors[s.color].toString();
				}
	
				s.lines = $extend($extend({}, options.lines), s.lines||{});
				s.points = $extend($extend({}, options.points), s.points||{});
				s.bars = $extend($extend({}, options.bars), s.bars||{});
				s.mouse = $extend($extend({}, options.mouse), s.mouse||{});
				
				if(s.shadowSize == null) s.shadowSize = options.shadowSize;
			}						
			return options;
		}
		/**
		 * Function: (private) constructCanvas
		 * 
		 * Initializes the canvas and it's overlay canvas. When the browser is IE, we make use of excanvas.
		 * The overlay canvas is inserted for displaying interaction.
		 * 
		 * Parameters:
		 * 		none
		 * 
		 * Returns:
		 * 		void
		 */
		function constructCanvas(){
	        canvasWidth = target.getSize().size.x;
	        canvasHeight = target.getSize().size.y;
			target.innerHTML = '';
			
			/**
			 * For positioning labels and overlay.
			 */
			target.setStyles({position: 'relative',cursor:'default'});
			
			if(canvasWidth <= 0 || canvasHeight <= 0){
				throw 'Invalid dimensions for plot, width = ' + canvasWidth + ', height = ' + canvasHeight;
			}
	
			/**
			 * Insert main canvas.
			 */
			canvas = $(document.createElement('canvas')).setProperties({
				width: canvasWidth,
				height: canvasHeight,
				id: id	
			});
			target.appendChild(canvas);
			if(window.ie){
				canvas = $(window.G_vmlCanvasManager.initElement(canvas));
			} 
			ctx = canvas.getContext('2d');
	
			/**
			 * Insert overlay canvas for interactive features.
			 */
			overlay = $(document.createElement('canvas')).setProperties({
				width: canvasWidth,
				height: canvasHeight
			}).setStyles({
				position: 'absolute',
				left: '0px',
				top: '0px'
			});
			overlay.injectAfter(canvas);
			if(window.ie){
				overlay = $(window.G_vmlCanvasManager.initElement(overlay));
			}			
			octx = overlay.getContext('2d');
		}
		/**
		 * Function: (private) bindEvents
		 * 
		 * 
		 * 
		 * Parameters:
		 * 		none
		 * 
		 * Returns:
		 * 		void
		 */
		function bindEvents() {
			if(options.selection.mode != null)
            	overlay.addEvent('mousedown', mouseDownHandler);				
								
			overlay.addEvent('mousemove', mouseMoveHandler)
			overlay.addEvent('click', clickHandler)
		}
		/**
		 * Function: (private) findDataRanges
		 * 
		 * Function determines the min and max values for the xaxis and yaxis.
		 * 
		 * Parameters:
		 * 		none
		 * 
		 * Returns:
		 * 		void
		 */
		function findDataRanges(){
			yaxis.datamin = xaxis.datamin = 0;
			xaxis.datamax = yaxis.datamax = 1;		
			if(series.length == 0) return;
	
			/**
			 * Get datamin, datamax start values
			 */ 
			var found = false;
			for(var i = 0; i < series.length; ++i){
				if (series[i].data.length > 0) {
					xaxis.datamin = xaxis.datamax = series[i].data[0][0];
					yaxis.datamin = yaxis.datamax = series[i].data[0][1];
					found = true;
					break;
				}
			}
			
			/**
			 * Return because series are empty.
			 */
			if(!found) return;
	
			/**
			 * then find real datamin, datamax
			 */
			for(var j = series.length - 1; j > -1; --j){
				var data = series[j].data;
				for(var h = data.length - 1; h > -1; --h){
					var x = data[h][0];
					var y = data[h][1];
					if(x < xaxis.datamin) xaxis.datamin = x;
					else if(x > xaxis.datamax) xaxis.datamax = x;
					if(y < yaxis.datamin) yaxis.datamin = y;
					else if(y > yaxis.datamax) yaxis.datamax = y;
				}
			}
		}
		/**
		 * Function: (private) calculateRange
		 * 
		 * 
		 * Parameters:
		 * 		none
		 * 
		 * Returns:
		 * 		void
		 */
		function calculateRange(axis, axisOptions){
			var min = axisOptions.min != null ? axisOptions.min : axis.datamin;
			var max = axisOptions.max != null ? axisOptions.max : axis.datamax;	
			if(max - min == 0.0){
				var widen = (max == 0.0) ? 1.0 : 0.01;
				min -= widen;
				max += widen;
			}			
			axis.tickSize = getTickSize(axisOptions.noTicks, min, max, axisOptions.tickDecimals);
				
			/**
			 * Autoscaling.
			 */
			var margin;
			if(axisOptions.min == null){
				
				/**
				 * Add a margin.
				 */
				margin = axisOptions.autoscaleMargin;
				if(margin != 0){
					min -= axis.tickSize * margin;				
					/**
					 * Make sure we don't go below zero if all values are positive.
					 */
					if(min < 0 && axis.datamin >= 0) min = 0;				
					min = axis.tickSize * Math.floor(min / axis.tickSize);
				}
			}
			if(axisOptions.max == null){
				margin = axisOptions.autoscaleMargin;
				if(margin != 0){
					max += axis.tickSize * margin;
					if(max > 0 && axis.datamax <= 0) max = 0;				
					max = axis.tickSize * Math.ceil(max / axis.tickSize);
				}
			}
			axis.min = min;
			axis.max = max;
		}
		/**
		 * Function: (private) extendXRangeIfNeededByBar
		 * 
		 * Bar series autoscaling in x direction.
		 * 
		 * Parameters:
		 * 		none
		 * 
		 * Returns:
		 * 		void
		 */
		function extendXRangeIfNeededByBar(){
			if(options.xaxis.max == null){
				/**
				 * Autoscaling.
				 */
				var newmax = xaxis.max;
				for(var i = series.length - 1; i > -1; --i){
					if(series[i].bars.show&& !series[i].bars.horizontal && series[i].bars.barWidth + xaxis.datamax > newmax){
						newmax = xaxis.max + series[i].bars.barWidth;
					}
				}
				xaxis.max = newmax;
			}
		}
		/**
		 * Function: (private) extendYRangeIfNeededByBar
		 * 
		 * Bar series autoscaling in y direction.
		 * 
		 * Parameters:
		 * 		none
		 * 
		 * Returns:
		 * 		void
		 */
		function extendYRangeIfNeededByBar(){
			if(options.yaxis.max == null){
				/**
				 * Autoscaling.
				 */
				var newmax = yaxis.max;
				for(var i = series.length - 1; i > -1; --i){
					if(series[i].bars.show && series[i].bars.horizontal && series[i].bars.barWidth + yaxis.datamax > newmax){
						newmax = yaxis.max + series[i].bars.barWidth;
					}
				}
				yaxis.max = newmax;
			}
		}
		/**
		 * Function: (private) calculateTicks
		 * 
		 * 
		 * 
		 * Parameters:
		 * 		none
		 * 
		 * Returns:
		 * 		void
		 */
		function calculateTicks(axis, axisOptions){
			axis.ticks = [];	
			if(axisOptions.ticks){
				var ticks = axisOptions.ticks;
	
	            if($type(ticks) == 'function'){
					ticks = ticks({ min: axis.min, max: axis.max });
				}
				
				/**
				 * Clean up the user-supplied ticks, copy them over.
				 */
				for(var i = 0, v, label; i < ticks.length; ++i){
					var t = ticks[i];
					if(typeof(t) == 'object'){
						v = t[0];
						label = (t.length > 1) ? t[1] : axisOptions.tickFormatter(v);
					}else{
						v = t;
						label = axisOptions.tickFormatter(v);
					}
					axis.ticks[i] = { v: v, label: label };
				}
			}else{
				/**
				 * Round to nearest multiple of tick size.
				 */
				var start = axis.tickSize * Math.ceil(axis.min / axis.tickSize);
				/**
				 * Then spew out all possible ticks.
				 */
				for(i = 0; start + i * axis.tickSize <= axis.max; ++i){
					v = start + i * axis.tickSize;
					
					/**
					 * Round (this is always needed to fix numerical instability).
					 */
					var decimals = axisOptions.tickDecimals;
					if(decimals == null) decimals = 1 - Math.floor(Math.log(axis.tickSize) / Math.LN10);
					if(decimals < 0) decimals = 0;
					
					v = v.toFixed(decimals);
					axis.ticks.push({ v: v, label: axisOptions.tickFormatter(v) });
				}
			}
		}
		/**
		 * Function: (private) calculateSpacing
		 * 
		 * Calculates axis label sizes.
		 * 
		 * Parameters:
		 * 		none
		 * 
		 * Returns:
		 * 		void
		 */
		function calculateSpacing(){
			var max_label = '';
			for(var i = 0; i < yaxis.ticks.length; ++i){
				var l = yaxis.ticks[i].label.length;
				if(l > max_label.length){
					max_label = yaxis.ticks[i].label;
				}
			}	
	
	        var dummyDiv = new Element('div')
				.setStyles({
					'position': 'absolute',
					'top': '-10000px',
					'font-size': 'small'
				})
				.setHTML(max_label)
				.addClass('gridLabel')
				.injectInside(target);
	        labelMaxWidth = dummyDiv.getSize().size.x;
	        labelMaxHeight = dummyDiv.getSize().size.y;
			dummyDiv.remove();
	
			/**
			 * Grid outline line width.
			 */
			var maxOutset = 2;
			if(options.points.show){
				maxOutset = Math.max(maxOutset, options.points.radius + options.points.lineWidth/2);
			}
			for(var j = 0; j < series.length; ++j){
				if (series[j].points.show){
					maxOutset = Math.max(maxOutset, series[j].points.radius + series[j].points.lineWidth/2);
				}
			}
	
			plotOffset.left = plotOffset.right = plotOffset.top = plotOffset.bottom = maxOutset;
			plotOffset.left += labelMaxWidth + options.grid.labelMargin;
			plotOffset.bottom += labelMaxHeight + options.grid.labelMargin;			
			plotWidth = canvasWidth - plotOffset.left - plotOffset.right;
			plotHeight = canvasHeight - plotOffset.bottom - plotOffset.top;
			hozScale = plotWidth / (xaxis.max - xaxis.min);
			vertScale = plotHeight / (yaxis.max - yaxis.min);
		}
		/**
		 * Function: (private) draw
		 * 
		 * Draws grid, labels and series.
		 * 
		 * Parameters:
		 * 		none
		 * 
		 * Returns:
		 * 		void
		 */
		function draw() {
			drawGrid();

			drawLabels();
			if(series.length){
				target.fireEvent('flotr:beforedraw', [series, this]);
				for(var i = 0; i < series.length; i++){
					drawSeries(series[i]);
				}
				target.fireEvent('flotr:afterdraw', [series, this]);
			}
		}
		/**
		 * Function: (private) tHoz
		 * 
		 * Translates absolute horizontal x coordinates to relative coordinates.
		 * 
		 * Parameters:
		 * 		x - Absolute integer x coordinate.
		 * 
		 * Returns:
		 * 		Translated relative x coordinate.
		 */
		function tHoz(x){
			return (x - xaxis.min) * hozScale;
		}
		/**
		 * Function: (private) tVert
		 * 
		 * Translates absolute vertical x coordinates to relative coordinates.
		 * 
		 * Parameters:
		 * 		y - Absolute integer y coordinate.
		 * 
		 * Returns:
		 * 		Translated relative y coordinate.
		 */
		function tVert(y){
			return plotHeight - (y - yaxis.min) * vertScale;
		}
		/**
		 * Function: (private) drawGrid
		 * 
		 * Draws a grid for the graph
		 * 
		 * Parameters:
		 * 		none
		 * 
		 * Returns:
		 * 		void
		 */
		function drawGrid(){
			if(options.grid.verticalLines || options.grid.horizontalLines){			
				target.fireEvent('flotr:beforegrid', [xaxis, yaxis, options, this]);
			}
			ctx.save();
			ctx.translate(plotOffset.left, plotOffset.top);
	
			/**
			 * Draw grid background, when defined.
			 */
			if(options.grid.backgroundColor != null){
				ctx.fillStyle = options.grid.backgroundColor;
				ctx.fillRect(0, 0, plotWidth, plotHeight);
			}
			
			/**
			 * Draw grid lines in vertical direction.
			 */
			ctx.lineWidth = 1;
			ctx.strokeStyle = options.grid.tickColor;
			ctx.beginPath();
			if(options.grid.verticalLines){
				for(var i = 0, v = null; i < xaxis.ticks.length; ++i){
					v = xaxis.ticks[i].v;
					/**
					 * Don't show lines on upper and lower bounds.
					 */
					if ((v == xaxis.min || v == xaxis.max) && options.grid.outlineWidth != 0)
						continue;
		
					ctx.moveTo(Math.floor(tHoz(v)) + ctx.lineWidth/2, 0);
					ctx.lineTo(Math.floor(tHoz(v)) + ctx.lineWidth/2, plotHeight);
				}
			}
			
			/**
			 * Draw grid lines in horizontal direction.
			 */
			if(options.grid.horizontalLines){
				for(var j = 0, v = null; j < yaxis.ticks.length; ++j){
					v = yaxis.ticks[j].v;
					/**
					 * Don't show lines on upper and lower bounds.
					 */
					if ((v == yaxis.min || v == yaxis.max) && options.grid.outlineWidth != 0)
						continue;
		
					ctx.moveTo(0, Math.floor(tVert(v)) + ctx.lineWidth/2);
					ctx.lineTo(plotWidth, Math.floor(tVert(v)) + ctx.lineWidth/2);
				}
			}
			ctx.stroke();
			
			/**
			 * Draw axis/grid border.
			 */
			if(options.grid.outlineWidth != 0) {
				ctx.lineWidth = options.grid.outlineWidth;
				ctx.strokeStyle = options.grid.color;
				ctx.lineJoin = 'round';
				ctx.strokeRect(0, 0, plotWidth, plotHeight);
			}
			ctx.restore();
			if(options.grid.verticalLines || options.grid.horizontalLines){			
				target.fireEvent('flotr:aftergrid', [xaxis, yaxis, options, this]);
			}
		}
	 	/**
		 * Function: (private) drawLabels
		 * 
		 * Draws labels for x and y axis.
		 * 
		 * Parameters:
		 * 		none
		 * 
		 * Returns:
		 * 		void
		 */   
		function drawLabels(){		
			/**
			 * Construct fixed width label boxes, which can be styled easily. 
			 */
			var noLabels = 0;
			for(var i = 0; i < xaxis.ticks.length; ++i){
				if (xaxis.ticks[i].label) {
					++noLabels;
				}
			}
			var xBoxWidth = plotWidth / noLabels;
			var wrapper = new Element('div').setStyles({
				'font-size': 'smaller',
				'color': options.grid.color
			});
			
			/**
			 * Add xlabels.
			 */
			for(var j = 0, tick = null; j < xaxis.ticks.length; ++j){
				tick = xaxis.ticks[j];
				if(!tick.label) continue;
				wrapper.adopt(new Element('div').setStyles({
					'position': 'absolute',
					'top': (plotOffset.top + plotHeight + options.grid.labelMargin) + 'px',
					'left': (plotOffset.left + tHoz(tick.v) - xBoxWidth/2) + 'px',
					'width': xBoxWidth + 'px',
					'text-align': 'center'			
				}).setText(tick.label))
			}
			
			/**
			 * Add ylabels.
			 */
			for(var k = 0, tick = null; k < yaxis.ticks.length; ++k){
				tick = yaxis.ticks[k];
				if (!tick.label || tick.label.length == 0) continue;
				wrapper.adopt(new Element('div').setStyles({
					'position': 'absolute',
					'top': (plotOffset.top + tVert(tick.v) - labelMaxHeight/2) + 'px',
					'left': 0,
					'width': labelMaxWidth + 'px',
					'text-align': 'right'			
				}).addClass('gridLabel').setText(tick.label))
			}

			target.adopt(wrapper);
		}
		
		/**
		 * Function: (private) drawSeries
		 * 
		 * Actually draws the graph.
		 * 
		 * Parameters:
		 * 		series - Array of series that need to be drawn.
		 * 
		 * Returns:
		 * 		void
		 */
		function drawSeries(series){
			if(series.lines.show || (!series.bars.show && !series.points.show))
				drawSeriesLines(series);
			if(series.bars.show)
				drawSeriesBars(series);
			if(series.points.show)
				drawSeriesPoints(series);
		}
		/**
		 * Function: (private) drawSeriesLines
		 * 
		 * Function draws lines series in the canvas element.
		 * 
		 * Parameters:
		 * 		series - Series with options.lines.show = true.
		 * 
		 * Returns:
		 * 		void
		 */
		function drawSeriesLines(series){
			function plotLine(data, offset){
				if(data.length < 2) return;
	
				var prevx = tHoz(data[0][0]),
					prevy = tVert(data[0][1]) + offset;
	
				ctx.beginPath();
				ctx.moveTo(prevx, prevy);
				for(var i = 0; i < data.length - 1; ++i){
					var x1 = data[i][0], y1 = data[i][1],
						x2 = data[i+1][0], y2 = data[i+1][1];
	
					/**
					 * Clip with ymin.
					 */
					if(y1 <= y2 && y1 < yaxis.min){
						/**
						 * Line segment is outside the drawing area.
						 */
						if(y2 < yaxis.min) continue;
						
						/**
						 * Compute new intersection point.
						 */
						x1 = (yaxis.min - y1) / (y2 - y1) * (x2 - x1) + x1;
						y1 = yaxis.min;
					}else if(y2 <= y1 && y2 < yaxis.min){
						if(y1 < yaxis.min) continue;
						x2 = (yaxis.min - y1) / (y2 - y1) * (x2 - x1) + x1;
						y2 = yaxis.min;
					}
	
					/**
					 * Clip with ymax.
					 */ 
					if(y1 >= y2 && y1 > yaxis.max) {
						if(y2 > yaxis.max) continue;
						x1 = (yaxis.max - y1) / (y2 - y1) * (x2 - x1) + x1;
						y1 = yaxis.max;
					}
					else if(y2 >= y1 && y2 > yaxis.max){
						if(y1 > yaxis.max) continue;
						x2 = (yaxis.max - y1) / (y2 - y1) * (x2 - x1) + x1;
						y2 = yaxis.max;
					}
	
					/**
					 * Clip with xmin.
					 */
					if(x1 <= x2 && x1 < xaxis.min){
						if(x2 < xaxis.min) continue;
						y1 = (xaxis.min - x1) / (x2 - x1) * (y2 - y1) + y1;
						x1 = xaxis.min;
					}else if(x2 <= x1 && x2 < xaxis.min){
						if(x1 < xaxis.min) continue;
						y2 = (xaxis.min - x1) / (x2 - x1) * (y2 - y1) + y1;
						x2 = xaxis.min;
					}
	
					/**
					 * Clip with xmax.
					 */
					if(x1 >= x2 && x1 > xaxis.max){
						if (x2 > xaxis.max) continue;
						y1 = (xaxis.max - x1) / (x2 - x1) * (y2 - y1) + y1;
						x1 = xaxis.max;
					}else if(x2 >= x1 && x2 > xaxis.max){
						if(x1 > xaxis.max) continue;
						y2 = (xaxis.max - x1) / (x2 - x1) * (y2 - y1) + y1;
						x2 = xaxis.max;
					}
	
					if(prevx != tHoz(x1) || prevy != tVert(y1) + offset)
						ctx.moveTo(tHoz(x1), tVert(y1) + offset);
					
					prevx = tHoz(x2);
					prevy = tVert(y2) + offset;
					ctx.lineTo(prevx, prevy);
				}
				ctx.stroke();
			}
			
			/**
			 * Function used to fill
			 * @param {Object} data
			 */
			function plotLineArea(data){
				if(data.length < 2) return;
	
				var bottom = Math.min(Math.max(0, yaxis.min), yaxis.max);
				var top, lastX = 0;
				var first = true;
				
				ctx.beginPath();
				for(var i = 0; i < data.length - 1; ++i){
					
					var x1 = data[i][0], y1 = data[i][1],
						x2 = data[i+1][0], y2 = data[i+1][1];
					
					if(x1 <= x2 && x1 < xaxis.min){
						if(x2 < xaxis.min) continue;
						y1 = (xaxis.min - x1) / (x2 - x1) * (y2 - y1) + y1;
						x1 = xaxis.min;
					}else if(x2 <= x1 && x2 < xaxis.min){
						if(x1 < xaxis.min) continue;
						y2 = (xaxis.min - x1) / (x2 - x1) * (y2 - y1) + y1;
						x2 = xaxis.min;
					}
										
					if(x1 >= x2 && x1 > xaxis.max){
						if(x2 > xaxis.max) continue;
						y1 = (xaxis.max - x1) / (x2 - x1) * (y2 - y1) + y1;
						x1 = xaxis.max;
					}else if(x2 >= x1 && x2 > xaxis.max){
						if (x1 > xaxis.max) continue;
						y2 = (xaxis.max - x1) / (x2 - x1) * (y2 - y1) + y1;
						x2 = xaxis.max;
					}

					if(first){
						ctx.moveTo(tHoz(x1), tVert(bottom));
						first = false;
					}
					
					/**
					 * Now check the case where both is outside.
					 */
					if(y1 >= yaxis.max && y2 >= yaxis.max){
						ctx.lineTo(tHoz(x1), tVert(yaxis.max));
						ctx.lineTo(tHoz(x2), tVert(yaxis.max));
						continue;
					}else if(y1 <= yaxis.min && y2 <= yaxis.min){
						ctx.lineTo(tHoz(x1), tVert(yaxis.min));
						ctx.lineTo(tHoz(x2), tVert(yaxis.min));
						continue;
					}
					
					/**
					 * Else it's a bit more complicated, there might
					 * be two rectangles and two triangles we need to fill
					 * in; to find these keep track of the current x values.
					 */
					var x1old = x1, x2old = x2;
					
					/**
					 * And clip the y values, without shortcutting.
					 * Clip with ymin.
					 */
					if(y1 <= y2 && y1 < yaxis.min && y2 >= yaxis.min){
						x1 = (yaxis.min - y1) / (y2 - y1) * (x2 - x1) + x1;
						y1 = yaxis.min;
					}else if(y2 <= y1 && y2 < yaxis.min && y1 >= yaxis.min){
						x2 = (yaxis.min - y1) / (y2 - y1) * (x2 - x1) + x1;
						y2 = yaxis.min;
					}
	
					/**
					 * Clip with ymax.
					 */
					if(y1 >= y2 && y1 > yaxis.max && y2 <= yaxis.max){
						x1 = (yaxis.max - y1) / (y2 - y1) * (x2 - x1) + x1;
						y1 = yaxis.max;
					}else if(y2 >= y1 && y2 > yaxis.max && y1 <= yaxis.max){
						x2 = (yaxis.max - y1) / (y2 - y1) * (x2 - x1) + x1;
						y2 = yaxis.max;
					}
	
					/**
					 * If the x value was changed we got a rectangle to fill.
					 */
					if(x1 != x1old){
						top = (y1 <= yaxis.min) ? top = yaxis.min : yaxis.max;						
						ctx.lineTo(tHoz(x1old), tVert(top));
						ctx.lineTo(tHoz(x1), tVert(top));
					}
				   	
					/**
					 * Fill the triangles.
					 */
					ctx.lineTo(tHoz(x1), tVert(y1));
					ctx.lineTo(tHoz(x2), tVert(y2));

					/**
					 * Fill the other rectangle if it's there.
					 */
					if(x2 != x2old){
						top = (y2 <= yaxis.min) ? yaxis.min : yaxis.max;
						ctx.lineTo(tHoz(x2old), tVert(top));
						ctx.lineTo(tHoz(x2), tVert(top));
					}
	
					lastX = Math.max(x2, x2old);
				}
				/*
				ctx.beginPath();
				ctx.moveTo(tHoz(data[0][0]), tVert(0));
				for (var i = 0; i < data.length; i++) {
					ctx.lineTo(tHoz(data[i][0]), tVert(data[i][1]));
				}
				ctx.lineTo(tHoz(data[data.length - 1][0]), tVert(0));*/
				ctx.lineTo(tHoz(lastX), tVert(bottom));
				ctx.closePath();
				ctx.fill();
			}
			
			ctx.save();
			ctx.translate(plotOffset.left, plotOffset.top);
			ctx.lineJoin = 'round';
	
			var lw = series.lines.lineWidth;
			var sw = series.shadowSize;
			/**
			 * @todo: consider another form of shadow when filling is turned on
			 */
			if(sw > 0){
				ctx.lineWidth = sw / 2;
				ctx.strokeStyle = "rgba(0,0,0,0.1)";
				plotLine(series.data, lw/2 + sw/2 + ctx.lineWidth/2);
	
				ctx.lineWidth = sw / 2;
				ctx.strokeStyle = "rgba(0,0,0,0.2)";
				plotLine(series.data, lw/2 + ctx.lineWidth/2);
			}
	
			ctx.lineWidth = lw;
			ctx.strokeStyle = series.color;
			if(series.lines.fill){
				ctx.fillStyle = series.lines.fillColor != null ? series.lines.fillColor : parseColor(series.color).scale(null, null, null, series.lines.fillOpacity).toString();
				plotLineArea(series.data, 0);
			}
	
			plotLine(series.data, 0);
			ctx.restore();
		}
		/**
		 * Function: (private) drawSeriesPoints
		 * 
		 * Function draws point series in the canvas element.
		 * 
		 * Parameters:
		 * 		series - Series with options.points.show = true.
		 * 
		 * Returns:
		 * 		void
		 */
		function drawSeriesPoints(series) {
			function plotPoints(data, radius, fill) {
				for(var i = 0; i < data.length; ++i){
					var x = data[i][0], y = data[i][1];
					if(x < xaxis.min || x > xaxis.max || y < yaxis.min || y > yaxis.max)
						continue;
					
					ctx.beginPath();
					ctx.arc(tHoz(x), tVert(y), radius, 0, 2 * Math.PI, true);
					if(fill) ctx.fill();
					ctx.stroke();
				}
			}
	
			function plotPointShadows(data, offset, radius){
				for(var i = 0; i < data.length; ++i){
					var x = data[i][0], y = data[i][1];
					if (x < xaxis.min || x > xaxis.max || y < yaxis.min || y > yaxis.max)
						continue;
					ctx.beginPath();
					ctx.arc(tHoz(x), tVert(y) + offset, radius, 0, Math.PI, false);
					ctx.stroke();
				}
			}
			
			ctx.save();
			ctx.translate(plotOffset.left, plotOffset.top);
	
			var lw = series.lines.lineWidth;
			var sw = series.shadowSize;
			if(sw > 0){
				/**
				 * Draw fake shadow in two steps.
				 */
				ctx.lineWidth = sw / 2;
				ctx.strokeStyle = 'rgba(0,0,0,0.1)';
				plotPointShadows(series.data, sw/2 + ctx.lineWidth/2, series.points.radius);
	
				ctx.lineWidth = sw / 2;
				ctx.strokeStyle = 'rgba(0,0,0,0.2)';
				plotPointShadows(series.data, ctx.lineWidth/2, series.points.radius);
			}
	
			ctx.lineWidth = series.points.lineWidth;
			ctx.strokeStyle = series.color;
			ctx.fillStyle = series.points.fillColor != null ? series.points.fillColor : series.color;
			plotPoints(series.data, series.points.radius, series.points.fill);
			ctx.restore();
		}
		/**
		 * Function: (private) drawSeriesBars
		 * 
		 * Function draws bar series in the canvas element.
		 * 
		 * Parameters:
		 * 		series - Series with options.bars.show = true.
		 * 
		 * Returns:
		 * 		void
		 */
		function drawSeriesBars(series) {
			function plotBars(data, barWidth, offset, fill){
				if(data.length < 1)
					return;
	
				for(var i = 0; i < data.length; i++){
					var x = data[i][0], y = data[i][1];
					var drawLeft = true, drawTop = true, drawRight = true;
					if(series.bars.horizontal) var left = 0, right = x, bottom = y, top = y + barWidth;
					else var left = x, right = x + barWidth, bottom = 0, top = y;
	
					if(right < xaxis.min || left > xaxis.max || top < yaxis.min || bottom > yaxis.max)
						continue;
	
					if(left < xaxis.min){
						left = xaxis.min;
						drawLeft = false;
					}
	
					if(right > xaxis.max){
						right = xaxis.max;
						drawRight = false;
					}
	
					if(bottom < yaxis.min)
						bottom = yaxis.min;
	
					if(top > yaxis.max){
						top = yaxis.max;
						drawTop = false;
					}
	
					/**
					 * Fill the bar.
					 */
					if(fill){
						ctx.beginPath();
						ctx.moveTo(tHoz(left), tVert(bottom) + offset);
						ctx.lineTo(tHoz(left), tVert(top) + offset);
						ctx.lineTo(tHoz(right), tVert(top) + offset);
						ctx.lineTo(tHoz(right), tVert(bottom) + offset);
						ctx.fill();
					}
	
					/**
					 * Draw bar outline/border.
					 */
					if(series.bars.lineWidth != 0 && (drawLeft || drawRight || drawTop)){
						ctx.beginPath();
						ctx.moveTo(tHoz(left), tVert(bottom) + offset);
						if(drawLeft) ctx.lineTo(tHoz(left), tVert(top) + offset);
						else ctx.moveTo(tHoz(left), tVert(top) + offset);
						if(drawTop) ctx.lineTo(tHoz(right), tVert(top) + offset);
						else ctx.moveTo(tHoz(right), tVert(top) + offset);
						if(drawRight) ctx.lineTo(tHoz(right), tVert(bottom) + offset);
						else ctx.moveTo(tHoz(right), tVert(bottom) + offset);
						ctx.stroke();
					}
				}
			}
	
			ctx.save();
			ctx.translate(plotOffset.left, plotOffset.top);
			ctx.lineJoin = 'round';
	
			var bw = series.bars.barWidth;
			/**
			 * @todo linewidth not interpreted the right way.
			 */
			var lw = Math.min(series.bars.lineWidth, bw);
			/**
			 * @todo figure out a way to add shadows.
			 */
			/*
			var sw = series.shadowSize;
			if (sw > 0) {
				// draw shadow in two steps
				ctx.lineWidth = sw / 2;
				ctx.strokeStyle = "rgba(0,0,0,0.1)";
				plotBars(series.data, bw, lw/2 + sw/2 + ctx.lineWidth/2, false);
	
				ctx.lineWidth = sw / 2;
				ctx.strokeStyle = "rgba(0,0,0,0.2)";
				plotBars(series.data, bw, lw/2 + ctx.lineWidth/2, false);
			}*/
	
			ctx.lineWidth = lw;
			ctx.strokeStyle = series.color;
			if(series.bars.fill){
				ctx.fillStyle = series.bars.fillColor != null ? series.bars.fillColor : parseColor(series.color).scale(null, null, null, 0.4).toString();
			}
	
			plotBars(series.data, bw, 0, series.bars.fill);
			ctx.restore();
		}
		/**
		 * Function: (private) insertLegend
		 * 
		 * Function adds a legend div to the canvas container.
		 * 
		 * Parameters:
		 * 		none
		 * 
		 * Returns:
		 * 		void
		 */
		function insertLegend(){
			if(!options.legend.show)
				return;
			
			var fragments = [];
			var rowStarted = false;
			for(var i = 0; i < series.length; ++i){
				if(!series[i].label) continue;
				
				if(i % options.legend.noColumns == 0){
					fragments.push((rowStarted) ? '</tr><tr>' : '<tr>');
					rowStarted = true;
				}
	
				var label = series[i].label;
				if(options.legend.labelFormatter != null)
					label = options.legend.labelFormatter(label);
				
				fragments.push('<td class="flotr-legend-color-box"><div style="border:1px solid ' + options.legend.labelBoxBorderColor + ';padding:1px"><div style="width:14px;height:10px;background-color:' + series[i].color + '"></div></div></td>' +
					'<td class="flotr-legend-label">' + label + '</td>');
			}
			if(rowStarted) fragments.push('</tr>');
			
			if(fragments.length > 0){
				var table = '<table style="font-size:smaller;color:' + options.grid.color + '">' + fragments.join("") + '</table>';
				if(options.legend.container != null){
					options.legend.container.append(table);
				}else{
					var pos = {};
					var p = options.legend.position, m = options.legend.margin;
					
					if(p.charAt(0) == 'n') pos.top = (m + plotOffset.top) + 'px';
					else if(p.charAt(0) == 's') pos.bottom = (m + plotOffset.bottom) + 'px';					
					if(p.charAt(1) == 'e') pos.right = (m + plotOffset.right) + 'px';
					else if(p.charAt(1) == 'w') pos.left = (m + plotOffset.bottom) + 'px';
					var div = new Element('div').addClass('flotr-legend').setStyles($extend(pos, {
						'position': 'absolute',
						'z-index': 2
					})).setHTML(table);
					target.adopt(div);
					
					if(options.legend.backgroundOpacity != 0.0){
						/**
						 * Put in the transparent background separately to avoid blended labels and
						 * label boxes.
						 */
						
						var c = options.legend.backgroundColor;
						
						if(c == null){
							var tmp = (options.grid.backgroundColor != null) ? options.grid.backgroundColor : extractColor(div);
							c = parseColor(tmp).adjust(null, null, null, 1).toString();
						}
						
						var bgdiv = new Element('div').addClass('flotr-legend-bg').setStyles($extend(pos,{
							'position': 'absolute',
							'width': div.getSize().size.x,
							'height': div.getSize().size.y,
							'background-color': c,
							'opacity': options.legend.backgroundOpacity
						}));

						bgdiv.injectBefore(div);				
					}
				}
			}
		}		
		var lastMousePos = { pageX: null, pageY: null };
		var selection = { first: { x: -1, y: -1}, second: { x: -1, y: -1} };
		var prevSelection = null;
		var selectionInterval = null;
		var ignoreClick = false;		
		var prevHit = null;
		/**
		 * Function: (private) getEventPosition
		 * 
		 * Calculates the coordinates from a mouse event object.
		 * 
		 * Parameters:
		 * 		event - Mouse Event object.
		 * 
		 * Returns:
		 * 		Object with x and y coordinates of the mouse.
		 */
		function getEventPosition(event){
			event = new Event(event);
			var offset = overlay.getCoordinates();
			var result = {rx: (event.page.x - offset.left - plotOffset.left), ry: (event.page.y - offset.top - plotOffset.top)};
			if(event.page.x == null && event.client.x != null){
				var de = document.documentElement, b = document.body;
				result.absX = event.client.x + (de && de.scrollLeft || b.scrollLeft || 0);
				result.absY = event.client.y + (de && de.scrollTop || b.scrollTop || 0);
			}else{
				result.absX = event.page.x;
				result.absY = event.page.y;
			}			
			result.x = xaxis.min + result.rx / hozScale;
			result.y = yaxis.max - result.ry / vertScale
 			return result;
		}
		/**
		 * Function: (private) clickHandler
		 * 
		 * Handler observes the 'click' event and fires the 'flotr:click' event.
		 * 
		 * Parameters:
		 * 		event - 'click' Event object.
		 * 
		 * Returns:
		 * 		void
		 */
		function clickHandler(event){
			if(ignoreClick){
				ignoreClick = false;
				return;
			}			
			target.fireEvent('flotr:click', [getEventPosition(event), this]);
		}
		/**
		 * Function: (private) mouseMoveHandler
		 * 
		 * Handler observes mouse movement over the graph area. Fires the 
		 * 'flotr:mousemove' event.
		 * 
		 * Parameters:
		 * 		event - 'mousemove' Event object.
		 * 
		 * Returns:
		 * 		void
		 */
		function mouseMoveHandler(event){
			event = new Event(event);			
			var pos = getEventPosition(event);	
			lastMousePos.pageX = pos.absX;
			lastMousePos.pageY = pos.absY;			
			if((options.mouse.track || series.some(function(s){return s.mouse && s.mouse.track;})) && selectionInterval == null){				
				hit(pos);
			}			
			target.fireEvent('flotr:mousemove', [event, pos, this]);
		}
		/**
		 * Function: (private) mouseDownHandler
		 * 
		 * Handler observes the 'mousedown' event.
		 * 
		 * Parameters:
		 * 		event - 'mousedown' Event object.
		 * 
		 * Returns:
		 * 		void
		 */
		function mouseDownHandler(event){
			if(new Event(event).rightClick) return;
					
			setSelectionPos(selection.first, event);			
			if(selectionInterval != null){
				clearInterval(selectionInterval);
			}
			lastMousePos.pageX = null;
			selectionInterval = setInterval(updateSelection, 1000/options.selection.fps);
			
            $(document).addEvent('mouseup', mouseUpHandler);
		}
		/**
		 * Function: (private) fireSelectEvent
		 * 
		 * Fires the 'flotr:select' event when the user made a selection.
		 * 
		 * Parameters:
		 * 		none
		 * 
		 * Returns:
		 * 		void
		 */
		function fireSelectEvent(){
			var x1 = (selection.first.x <= selection.second.x) ? selection.first.x : selection.second.x;
			var x2 = (selection.first.x <= selection.second.x) ? selection.second.x : selection.first.x;
			var y1 = (selection.first.y >= selection.second.y) ? selection.first.y : selection.second.y;
			var y2 = (selection.first.y >= selection.second.y) ? selection.second.y : selection.first.y;
			
			x1 = xaxis.min + x1 / hozScale;
			x2 = xaxis.min + x2 / hozScale;
			y1 = yaxis.max - y1 / vertScale;
			y2 = yaxis.max - y2 / vertScale;

			target.fireEvent('flotr:select', [{x1:x1, y1:y1, x2:x2, y2:y2}, this]);
		}
		/**
		 * Function: (private) mouseUpHandler
		 * 
		 * Handler observes the mouseup event for the document. 
		 * 
		 * Parameters:
		 * 		event - 'mouseup' Event object.
		 * 
		 * Returns:
		 * 		void
		 */
		function mouseUpHandler(event){
			$(document).removeEvent('mouseup', mouseUpHandler);
			if(selectionInterval != null){
				clearInterval(selectionInterval);
				selectionInterval = null;
			}

			setSelectionPos(selection.second, event);
			clearSelection();
			
			event = new Event(event)
			if(selectionIsSane() || event.rightClick){
				drawSelection();
				fireSelectEvent();
				ignoreClick = true;
			}
			event.stop();
		}
		/**
		 * Function: (private) setSelectionPos
		 * 
		 * Calculates the position of the selection.
		 * 
		 * Parameters:
		 * 		pos - Position object.
		 * 		event - Event object.
		 * 
		 * Returns:
		 * 		void
		 */
		function setSelectionPos(pos, event) {
            var offset = $(overlay).getCoordinates();
			if(options.selection.mode == 'y'){
				pos.x = (pos == selection.first) ? 0 : plotWidth;			   
			}else{
				pos.x = event.pageX - offset.left - plotOffset.left;
				pos.x = Math.min(Math.max(0, pos.x), plotWidth);
			}

			if (options.selection.mode == 'x'){
				pos.y = (pos == selection.first) ? 0: plotHeight;
			}else{
				pos.y = event.pageY - offset.top - plotOffset.top;
				pos.y = Math.min(Math.max(0, pos.y), plotHeight);
			}
		}
		/**
		 * Function: (private) updateSelection
		 * 
		 * Updates (draws) the selection box.
		 * 
		 * Parameters:
		 * 		none
		 * 
		 * Returns:
		 * 		void
		 */
		function updateSelection(){
			
			if(lastMousePos.pageX == null) return;
			
			setSelectionPos(selection.second, lastMousePos);
			clearSelection();
			
			if(selectionIsSane()) drawSelection();
		}
		/**
		 * Function: (private) clearSelection
		 * 
		 * Removes the selection box from the overlay canvas.
		 * 
		 * Parameters:
		 * 		none
		 * 
		 * Returns:
		 * 		void
		 */
		function clearSelection() {
			if(prevSelection == null) return;

			var x = Math.min(prevSelection.first.x, prevSelection.second.x),
				y = Math.min(prevSelection.first.y, prevSelection.second.y),
				w = Math.abs(prevSelection.second.x - prevSelection.first.x),
				h = Math.abs(prevSelection.second.y - prevSelection.first.y);
			
			octx.clearRect(x + plotOffset.left - octx.lineWidth,
						   y + plotOffset.top - octx.lineWidth,
						   w + octx.lineWidth*2,
						   h + octx.lineWidth*2);
			
			prevSelection = null;
		}
		/**
		 * Function: (private) setSelection
		 * 
		 * Allows the user the manually select an area.
		 * 
		 * Parameters:
		 * 		area - Object with coordinates to select.
		 * 
		 * Returns:
		 * 		void
		 */
		function setSelection(area){
			clearSelection();
						
			selection.first.y = (options.selection.mode == 'x') ? 0 : (yaxis.max - area.y1) * vertScale;
			selection.second.y = (options.selection.mode == 'x') ? plotHeight : (yaxis.max - area.y2) * vertScale;			
			selection.first.x = (options.selection.mode == 'y') ? 0 : (area.x1 - xaxis.min) * hozScale;
			selection.second.x = (options.selection.mode == 'y') ? plotWidth : (area.x2 - xaxis.min) * hozScale;
			
			drawSelection();
			fireSelectEvent();
		}
		/**
		 * Function: (private) drawSelection
		 * 
		 * Draws the selection box.
		 * 
		 * Parameters:
		 * 		none
		 * 
		 * Returns:
		 * 		void
		 */
		function drawSelection() {
			if(prevSelection != null &&
				selection.first.x == prevSelection.first.x &&
				selection.first.y == prevSelection.first.y && 
				selection.second.x == prevSelection.second.x &&
				selection.second.y == prevSelection.second.y)
				return;
			
			octx.strokeStyle = parseColor(options.selection.color).scale(null, null, null, 0.8).toString();
			octx.lineWidth = 1;
			ctx.lineJoin = 'round';
			octx.fillStyle = parseColor(options.selection.color).scale(null, null, null, 0.4).toString();

			prevSelection = { first:  { x: selection.first.x,
										y: selection.first.y },
							  second: { x: selection.second.x,
										y: selection.second.y } };

			var x = Math.min(selection.first.x, selection.second.x),
				y = Math.min(selection.first.y, selection.second.y),
				w = Math.abs(selection.second.x - selection.first.x),
				h = Math.abs(selection.second.y - selection.first.y);
						
			octx.fillRect(x + plotOffset.left, y + plotOffset.top, w, h);
			octx.strokeRect(x + plotOffset.left, y + plotOffset.top, w, h);
		}
		/**
		 * Function: (private) selectionIsSane
		 * 
		 * Determines whether or not the selection is sane and should be drawn.
		 * 
		 * Parameters:
		 * 		none
		 * 
		 * Returns:
		 * 		boolean - True when sane, false otherwise.
		 */
		function selectionIsSane() {
			var minSize = 5;
			return Math.abs(selection.second.x - selection.first.x) >= minSize &&
				Math.abs(selection.second.y - selection.first.y) >= minSize;
		}
		/**
		 * Function: (private) clearHit
		 * 
		 * Removes the mouse tracking point from the overlay.
		 * 
		 * Parameters:
		 * 		none
		 * 
		 * Returns:
		 * 		void
		 */
		function clearHit(){
			if(prevHit){
				octx.clearRect(
					tHoz(prevHit.x) + plotOffset.left - options.points.radius*2,
					tVert(prevHit.y) + plotOffset.top - options.points.radius*2,
					options.points.radius*3 + options.points.lineWidth*3, 
					options.points.radius*3 + options.points.lineWidth*3
				);
				prevHit = null;
			}		
		}
		/**
		 * Function: (private) hit
		 * 
		 * Retrieves the nearest data point from the mouse cursor. If it's within
		 * a certain range, draw a point on the overlay canvas and display the x and y
		 * value of the data.
		 * 
		 * Parameters:
		 * 		mouse - Object that holds the relative x and y coordinates of the cursor.
		 * 
		 * Returns:
		 * 		void
		 */
		function hit(mouse){			
			/**
			 * Nearest data element.
			 */
			var n = {
				dist:Number.MAX_VALUE,
				x:null,
				y:null,
				relX:mouse.relX,
				relY:mouse.relY,
				absX:mouse.absX,
				absY:mouse.absY,
				mouse:null
			};
			
			for(var i = 0, data, xsens, ysens; i < series.length; i++){
				if(!series[i].mouse.track) continue;
				data = series[i].data;				
				xsens = (hozScale*series[i].mouse.sensibility);
				ysens = (vertScale*series[i].mouse.sensibility);
				for(var j = 0, xpow, ypow; j < data.length; j++){
					xpow = Math.pow(hozScale*(data[j][0] - mouse.x), 2);
					ypow = Math.pow(vertScale*(data[j][1] - mouse.y), 2);
					if(xpow < xsens && ypow < ysens && Math.sqrt(xpow+ypow) < n.dist){
						n.dist = Math.sqrt(xpow+ypow);
						n.x = data[j][0];
						n.y = data[j][1];
						n.mouse = series[i].mouse;
					}
				}
			}
			
			if(n.mouse && n.mouse.track && !prevHit || (prevHit && n.x != prevHit.x && n.y != prevHit.y)){
				var el = target.getElement('.flotr-mouse-value');

				if(!el){
					var pos = {}, p = options.mouse.position, m = options.mouse.margin;					
					if(p.charAt(0) == 'n') pos.top = (m + plotOffset.top) + 'px';
					else if(p.charAt(0) == 's') pos.bottom = (m + plotOffset.bottom) + 'px';					
					if(p.charAt(1) == 'e') pos.right = (m + plotOffset.right) + 'px';
					else if(p.charAt(1) == 'w') pos.left = (m + plotOffset.bottom) + 'px';					
						
					target.adopt(new Element('div').addClass('flotr-mouse-value').setStyles($extend(pos,{
						'position': 'absolute',
						'display': 'none',
						'color': '#fff',
						'background-color': '#000',
						'opacity': '0.7'
					})));
					return;
				}
				if(n.x !== null && n.y !== null){
	                el.setStyle('display', 'block');					
					
					clearHit();
					if(n.mouse.lineColor != null){
						octx.save();
						octx.translate(plotOffset.left, plotOffset.top);
						octx.lineWidth = options.points.lineWidth;
		        		octx.strokeStyle = n.mouse.lineColor;
						octx.fillStyle = '#ffffff';
						octx.beginPath();
						octx.arc(tHoz(n.x), tVert(n.y), options.mouse.radius, 0, 2 * Math.PI, true);
						octx.fill();
						octx.stroke();
						octx.restore();
					} 
					prevHit = n;
									
					var decimals = n.mouse.trackDecimals;
					if(decimals == null || decimals < 0) decimals = 0;
					
					el.innerHTML = n.mouse.trackFormatter({x: n.x.toFixed(decimals), y: n.y.toFixed(decimals)});
					target.fireEvent( 'flotr:hit', [n, this] )					
				}else if(prevHit){
					el.setStyle('display','none');
					clearHit();
				}
			}
		}
	} 

return {
	clean: function(element){
		element.innerHTML = '';		
	},
	
	draw: function(target, data, options){	
		var plot = new Plot(target, data, options);
		return plot;
	},
	
	privates: {		
		getTickSize: getTickSize,
		getSeries: getSeries
	}
}
})();
