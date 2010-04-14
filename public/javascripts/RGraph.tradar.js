    /**
    * o------------------------------------------------------------------------------o
    * | This file is part of the RGraph package - you can learn more at:             |
    * |                                                                              |
    * |                          http://www.rgraph.net                               |
    * |                                                                              |
    * | This package is licensed under the RGraph license. For all kinds of business |
    * | purposes there is a small one-time licensing fee to pay and for non          |
    * | commercial  purposes it is free to use. You can read the full license here:  |
    * |                                                                              |
    * |                      http://www.rgraph.net/LICENSE.txt                       |
    * o------------------------------------------------------------------------------o
    */
    
    if (typeof(RGraph) == 'undefined') RGraph = {};

    /**
    * The traditional radar chart constructor
    * 
    * @param string id   The ID of the canvas
    * @param array  data An array of data to represent
    */
    RGraph.Tradar = function (id, data)
    {
        this.id      = id;
        this.canvas  = document.getElementById(id);
        this.context = this.canvas.getContext('2d');
        this.canvas.__object__ = this;
        this.size     = null;// Set in the .Draw() method
        this.centerx  = this.canvas.width / 2;
        this.centery  = this.canvas.height / 2;
        this.data    = data;
        this.max     = RGraph.array_max(this.data);
        this.type    = 'tradar';
        this.coords  = [];


        /**
        * Compatibility with older browsers
        */
        RGraph.OldBrowserCompat(this.context);

        
        this.properties = {
            'chart.gutter':                25,
            'chart.linewidth':             1,
            'chart.color':                 'red',
            'chart.circle':                0,
            'chart.circle.fill':           'red',
            'chart.circle.stroke':         'black',
            'chart.labels':                [],
            'chart.labels.offsetx':        10,
            'chart.labels.offsety':        10,
            'chart.background.circles':    true,
            'chart.text.size':             10,
            'chart.text.font':             'Verdana',
            'chart.text.color':            'black',
            'chart.title':                 '',
            'chart.title.vpos':            null,
            'chart.title.color':           'black',
            'chart.linewidth':             1,
            'chart.key':                   null,
            'chart.key.background':        'white',
            'chart.key.position':          'gutter',
            'chart.key.shadow':            false,
            'chart.contextmenu':           null,
            'chart.annotatable':           false,
            'chart.annotate.color':        'black',
            'chart.zoom.factor':           1.5,
            'chart.zoom.fade.in':          true,
            'chart.zoom.fade.out':         true,
            'chart.zoom.hdir':             'right',
            'chart.zoom.vdir':             'down',
            'chart.zoom.frames':           10,
            'chart.zoom.delay':            50,
            'chart.zoom.shadow':           true,
            'chart.zoom.mode':             'canvas',
            'chart.zoom.thumbnail.width':  75,
            'chart.zoom.thumbnail.height': 75,
            'chart.zoom.background':        true,
            'chart.tooltip.effect':        'fade'
        }
        
        // Must have at least 3 points
        if (this.data.length < 3) {
            alert('[TRADAR] You must specify at least 3 data points');
            return;
        }
        
        // Check the common library has been included
        if (typeof(RGraph) == 'undefined') {
            alert('[TRADAR] Fatal error: The RGraph common library does not appear to have been included');
        }
    }


    /**
    * A simple setter
    * 
    * @param string name  The name of the property to set
    * @param string value The value of the property
    */
    RGraph.Tradar.prototype.Set = function (name, value)
    {
        this.properties[name] = value;

        /**
        * If the name is chart.color, set chart.colors too
        */
        if (name == 'chart.color') {
            this.properties['chart.colors'] = [value];
        }

    }


    /**
    * A simple hetter
    * 
    * @param string name  The name of the property to get
    */
    RGraph.Tradar.prototype.Get = function (name)
    {
        return this.properties[name];
    }


    /**
    * The draw method which does all the brunt of the work
    */
    RGraph.Tradar.prototype.Draw = function ()
    {
        this.size = Math.min(this.canvas.width, this.canvas.height) - (2 * this.Get('chart.gutter'));

        this.DrawBackground();
        this.DrawAxes();
        this.DrawCircle();
        this.DrawChart();
        this.DrawLabels();
        
        // Draw the title
        if (this.Get('chart.title')) {
            RGraph.DrawTitle(this.canvas, this.Get('chart.title'), this.Get('chart.gutter'))
        }

        // Draw the key if necessary
        // obj, key, colors
        if (this.Get('chart.key')) {
            RGraph.DrawKey(this, this.Get('chart.key'), [this.Get('chart.color'), this.Get('chart.circle.fill')]);
        }

        /**
        * Show the context menu
        */
        RGraph.ShowContext(this);

        /**
        * If the canvas is annotatable, do install the event handlers
        */
        RGraph.Annotate(this);

        /**
        * This bit shows the mini zoom window if requested
        */
        RGraph.ShowZoomWindow(this);
    }


    /**
    * Draws the background circles
    */
    RGraph.Tradar.prototype.DrawBackground = function ()
    {
        /**
        * Draws the background circles
        */
        if (this.Get('chart.background.circles')) {

           this.context.strokeStyle = '#ddd';
           this.context.beginPath();

           for (var r=5; r<(this.size / 2); r+=10) {

                this.context.moveTo(this.centerx, this.centery);
                this.context.arc(this.centerx, this.centery,r, 0, 6.28, 0);
            }
            
            this.context.stroke();
        }

    }


    /**
    * Draws the axes
    */
    RGraph.Tradar.prototype.DrawAxes = function ()
    {
        this.context.strokeStyle = 'black';

        var halfsize = this.size / 2;

        this.context.beginPath();

        /**
        * The Y axis
        */
            this.context.moveTo(this.centerx, this.centery + halfsize);
            this.context.lineTo(this.centerx, this.centery - halfsize);
            
    
            // Draw the bits at either end of the Y axis
            this.context.moveTo(this.centerx - 5, this.centery + halfsize);
            this.context.lineTo(this.centerx + 5, this.centery + halfsize);
            this.context.moveTo(this.centerx - 5, this.centery - halfsize);
            this.context.lineTo(this.centerx + 5, this.centery - halfsize);
            
            // Draw X axis tick marks
            for (var y=(this.centery - halfsize); y<(this.centery + halfsize); y+=15) {
                this.context.moveTo(this.centerx - 3, y);
                this.context.lineTo(this.centerx + 3, y);
            }

        /**
        * The X axis
        */
            this.context.moveTo(this.centerx - halfsize, this.centery);
            this.context.lineTo(this.centerx + halfsize, this.centery);
    
            // Draw the bits at the end of the X axis
            this.context.moveTo(this.centerx - halfsize, this.centery - 5);
            this.context.lineTo(this.centerx - halfsize, this.centery + 5);
            this.context.moveTo(this.centerx + halfsize, this.centery - 5);
            this.context.lineTo(this.centerx + halfsize, this.centery + 5);

            // Draw X axis tick marks
            for (var x=(this.centerx - halfsize); x<(this.centerx + halfsize); x+=15) {
                this.context.moveTo(x, this.centery - 3);
                this.context.lineTo(x, this.centery + 3);
            }

        /**
        * Finally draw it to the canvas
        */
        this.context.stroke();
    }


    /**
    * The function which actually draws the radar chart
    */
    RGraph.Tradar.prototype.DrawChart = function ()
    {
        for (var i=0; i<this.data.length; ++i) {
            this.coords[i] = this.GetCoordinates(i);
        }

        /**
        * Now go through the coords and draw the chart itself
        */
        this.context.strokeStyle = this.Get('chart.strokestyle');
        this.context.fillStyle = this.Get('chart.color');
        this.context.lineWidth = this.Get('chart.linewidth');
        this.context.beginPath();

        for (i=0; i<this.coords.length; ++i) {
            if (i == 0) {
                this.context.moveTo(this.coords[i][0], this.coords[i][1]);
            } else {
                this.context.lineTo(this.coords[i][0], this.coords[i][1]);
            }
        }
        
        this.context.closePath();

        this.context.fill();
        this.context.stroke();
        
        /**
        * Can now handletooltips
        */
        if (this.Get('chart.tooltips')) {
            
            RGraph.Register(this);
            
            this.canvas.onmousemove = function (e)
            {
                e = RGraph.FixEventObject(e);
                
                var canvas      = document.getElementById(this.id);
                var obj         = canvas.__object__;
                var x           = e.offsetX;
                var y           = e.offsetY;
                var overHotspot = false;

                for (var i=0; i<obj.coords.length; ++i) {
                
                    var xCoord   = obj.coords[i][0];
                    var yCoord   = obj.coords[i][1];
                    var tooltips = obj.Get('chart.tooltips');
                    var idx      = Number(i);

                    if (
                        tooltips[i]
                        && x < (xCoord + 5)
                        && x > (xCoord - 5)
                        && y > (yCoord - 5)
                        && y < (yCoord + 5)
                       ) {
                       
                        overHotspot = true;
                        obj.canvas.style.cursor = document.all ? 'hand' : 'pointer';

                        if (!RGraph.Registry.Get('chart.tooltip') || RGraph.Registry.Get('chart.tooltip').__index__ != idx) {
                            RGraph.Clear(obj.canvas);
                            obj.Draw();
                            
                            obj.context.beginPath();
                            obj.context.strokeStyle = 'gray';
                            obj.context.fillStyle   = 'white';
                            obj.context.arc(xCoord, yCoord, 2, 0, 6.28, 0);
                            obj.context.fill();
                            obj.context.stroke();
                            
                            RGraph.Tooltip(obj.canvas, obj.Get('chart.tooltips')[i], e.pageX, e.pageY);
                            RGraph.Registry.Get('chart.tooltip').__index__ = idx;
                        }
                    }
                }

                if (!overHotspot) {
                    obj.canvas.style.cursor = 'default';
                }
            }
        }
    }


    /**
    * Gets the coordinates for a particular mark
    * 
    * @param  number i The index of the data (ie which one it is)
    * @return array    A two element array of the coordinates
    */
    RGraph.Tradar.prototype.GetCoordinates = function (i)
    {
        // The number  of data points
        var len = this.data.length;

        // The magnitude of the data (NOT the x/y coords)
        var mag = (this.data[i] / this.max) * (this.size / 2);

        /**
        * Get the angle
        */
        var angle = (6.28 / len) * i; // In radians

        /**
        * Work out the X/Y coordinates
        */
        var x = Math.cos(angle) * mag;
        var y = Math.sin(angle) * mag;

        /**
        * Put the coordinate in the right quadrant
        */
        x = this.centerx + x;
        y = this.centery + (i == 0 ? 0 : y);
        
        return [x,y];
    }
    
    
    /**
    * This function adds the labels to the chart
    */
    RGraph.Tradar.prototype.DrawLabels = function ()
    {
        var labels = this.Get('chart.labels');

        if (labels && labels.length > 0) {

            this.context.lineWidth = 1;
            this.context.fillStyle = this.Get('chart.text.color');
            
            var offsetx = this.Get('chart.labels.offsetx'); // Not used yet
            var offsety = this.Get('chart.labels.offsety'); // Not used yet

            for (var i=0; i<labels.length; ++i) {

                var x        = this.coords[i][0];
                var y        = this.coords[i][1];
                var text     = labels[i];
                var hAlign   = 'center';
                var vAlign   = 'center';
                var quartile = (i / this.coords.length);
                var offsetx  = this.Get('chart.labels.offsetx');
                var offsety  = this.Get('chart.labels.offsety');

                // ~Manually do labels on the right middle axis
                if (i == 0) {
                    hAlign = 'left';
                    vAlign = 'center';
                    x += offsetx;

                } else {

                    hAlign = (x < this.centerx) ? 'right' : 'left';
                    vAlign = (y < this.centery) ? 'bottom' : 'top';
                    x     += (x < this.centerx) ? (-1 * offsetx) : offsetx;
                    y     += (y < this.centery) ? (-1 * offsety) : offsety;
                    
                    if (i / this.data.length == 0.25) { x -= offsetx; hAlign = 'center';
                    } else if (i / this.data.length == 0.5) { y -= offsety; vAlign = 'center';
                    } else if (i / this.data.length == 0.75) { x += offsetx; hAlign = 'center'; }
                }

                // context, font, size, x, y, text
                RGraph.Text(this.context, this.Get('chart.text.font'), this.Get('chart.text.size'), x, y, text, vAlign, hAlign, null, null, 'white');
            }
        }
    }


    /**
    * Draws the circle. No arguments as it gets the information from the object properties.
    */
    RGraph.Tradar.prototype.DrawCircle = function ()
    {
        var circle   = {};
        circle.limit = this.Get('chart.circle');
        circle.fill  = this.Get('chart.circle.fill');
        circle.stroke  = this.Get('chart.circle.stroke');

        if (circle.limit) {

            var r = (circle.limit / this.max) * (this.size / 2);
            
            this.context.fillStyle = circle.fill;
            this.context.strokeStyle = circle.stroke;

            this.context.beginPath();
            this.context.arc(this.centerx, this.centery, r, 0, 6.28, 0);
            this.context.fill();
            this.context.stroke();
        }
    }