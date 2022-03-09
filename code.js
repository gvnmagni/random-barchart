figma.showUI(__html__,  { width: 300, height: 560, title: "Random Barchart" });

figma.loadFontAsync({ family: "Inter", style: "Regular" });

figma.ui.onmessage = msg => {
  
  if (msg.type === 'create-barchart') {

    const nodes = [];
    
    let value = 0;
    let bucketWidth = 10;
    let bucketsNumber = 10;
    let randomDomain = msg.height;
    const identifier = Math.floor(Math.random()*1000);

    let leftLabelsMargin = 0;
    let bottomLabelsMargin = 0;

    if ((msg.grid === "yes") && (msg.labels === "yes")){
        leftLabelsMargin = 50;
        bottomLabelsMargin = 30;
    }   
    
    if (msg.set_bars_choices === "number"){
        bucketsNumber = msg.bars_number;
        bucketWidth = (msg.width-leftLabelsMargin)/(msg.bars_number);
    }
    else {
        bucketsNumber = Math.floor((msg.width-leftLabelsMargin)/(msg.bars_width));
        bucketWidth = msg.bars_width;
    }

    
    // ---------------------------------
    // Define color sequence
    const labels_color = {r:106/255, g:113/255, b:125/255};

    const categorical_palette = [{r:96, g:146, b:192},
        {r:84, g:179, b:153},
        {r:211, g: 96, b:134},
        {r:145, g: 112, b: 184},
        {r:202, g: 142, b: 174},
        {r:214, g: 191, b: 87},
        {r:185, g: 168, b: 136},
        {r:218, g: 139, b: 69}];

    const sequential_palette = [{r:81, g:147, b:196},
        {r:121, g:167, b:209},
        {r:140, g:177, b:214},
        {r:156, g:188, b:220},
        {r:173, g:199, b:225},
        {r:222, g:232, b:243},
        {r:222, g:232, b:243},
        {r:239, g:244, b:249}];

        /*
        {r:103, g:157, b:202},
        {r:190, g:210, b:232},
        */

    const divergent_palette = [{r:248, g:92, b:65},
        {r:248, g:127, b:90},
        {r:246, g:190, b:143},
        {r:245, g:216, b:181},
        {r:205, g:220, b:235},
        {r:174, g:202, b:226},
        {r:113, g:166, b:207},
        {r:81, g:147, b:196}];

    let colors = [];
    if (msg.color_palette === "categorical")
        colors = categorical_palette;
    else if (msg.color_palette === "sequential") {
        colors = sequential_palette;
    } else if (msg.color_palette === "divergent") {
        colors = divergent_palette;
        colors = colors.slice(Math.floor((colors.length-msg.data_series)/2),Math.ceil(colors.length-((colors.length-msg.data_series)/2)));
    }

    // ---------------------------------
    // Create chart frame

    const center = figma.viewport.center;
    const chart_frame = figma.createFrame();
    chart_frame.resizeWithoutConstraints(msg.width, msg.height);
    chart_frame.clipsContent = false;
    chart_frame.fills = [];
    chart_frame.name = "barchart-frame-"+identifier;

    // ---------------------------------
    // Define random domain according to variability
    if (msg.variability === "high"){
        randomDomain = msg.height-bottomLabelsMargin-5;
    }        
    else if (msg.variability === "medium") {
        randomDomain = (msg.height-bottomLabelsMargin)/2;
    }
    else if (msg.variability === "low") {
        randomDomain = (msg.height-bottomLabelsMargin)/3;
    }

    // ---------------------------------
    // Generate data series

    let buckets_data = [];
    for (let p=0; p<bucketsNumber; p++)
    {
        let single_bucket_data = [];
        for (let q=0; q<msg.data_series; q++)
        {
            single_bucket_data.push(Math.ceil(Math.random()*((randomDomain)/((q+2)))));
        }
        buckets_data.push(single_bucket_data)
    }
       

    // ---------------------------------
        // Draw grid if required

        const grid_strokes = [{ type: 'SOLID', color: {r: 0.8, g: 0.8, b: 0.8}}];
        const today = new Date();                
        if (msg.grid == "yes")
        {

            // ----------------------------------
            // First and last vertical line

            const first_grid_vertical_line = figma.createVector();
            first_grid_vertical_line.name = "grid_vertical_line_"+identifier;
            first_grid_vertical_line.vectorPaths = [{
                windingRule: "NONE",
                data: "M "+ leftLabelsMargin +" 0 L "+ leftLabelsMargin +" " + (msg.height-bottomLabelsMargin),
            }]    
        
            first_grid_vertical_line.strokes = grid_strokes;
            chart_frame.appendChild(first_grid_vertical_line);
            nodes.push(first_grid_vertical_line)

            const last_grid_vertical_line = figma.createVector();
            last_grid_vertical_line.name = "grid_vertical_line_"+identifier;
            last_grid_vertical_line.vectorPaths = [{
                windingRule: "NONE",
                data: "M "+ msg.width +" 0 L "+ msg.width +" " + (msg.height-bottomLabelsMargin),
            }]    
        
            last_grid_vertical_line.strokes = grid_strokes;
            chart_frame.appendChild(last_grid_vertical_line);
            nodes.push(last_grid_vertical_line)

            // ----------------------------------
            // Add grid

            for (var i=0; i<bucketsNumber; i++){
            const grid_vertical_line = figma.createVector();
            grid_vertical_line.name = "grid_vertical_line_"+identifier;
            grid_vertical_line.vectorPaths = [{
                windingRule: "NONE",
                data: "M "+ ((bucketWidth/2)+leftLabelsMargin+(i*bucketWidth)) +" 0 L "+ ((bucketWidth/2)+leftLabelsMargin+(i*bucketWidth)) +" " + (msg.height-bottomLabelsMargin),
            }]    
        
            grid_vertical_line.strokes = grid_strokes;
            chart_frame.appendChild(grid_vertical_line);
            nodes.push(grid_vertical_line)

            if (msg.labels == "yes"){

                today.setDate(today.getDate()+1);

                const bottom_label = figma.createText();
                bottom_label.fontName = { family: "Inter", style: "Regular" };
                bottom_label.characters = today.getMonth()+"/"+today.getDate();
                bottom_label.textAlignHorizontal = "CENTER";
                bottom_label.resize(40,16);
                bottom_label.fontSize = 10;
                bottom_label.setRangeFills(0,bottom_label.characters.length, [{ type: 'SOLID', color: labels_color}]);
                bottom_label.x = ((bucketWidth/2)+leftLabelsMargin+(i*bucketWidth))-20;
                bottom_label.y = (msg.height-bottomLabelsMargin+5);
                bottom_label.name = "bottom_label_"+identifier;
            }
        }
        for (var i=0; i<5; i++){
            const grid_horizontal_line = figma.createVector();
            grid_horizontal_line.name = "grid_horizontal_line_"+identifier;
            grid_horizontal_line.vectorPaths = [{
                windingRule: "NONE",
                data: "M " + leftLabelsMargin + " "+ (((msg.height-bottomLabelsMargin)/4*i)) + " L "+ msg.width +" "+(((msg.height-bottomLabelsMargin)/4*i)),
            }]    
            
            grid_horizontal_line.strokes = grid_strokes;
            chart_frame.appendChild(grid_horizontal_line);
            nodes.push(grid_horizontal_line)

            if (msg.labels == "yes"){
                const left_label = figma.createText();
                left_label.fontName = { family: "Inter", style: "Regular" };
                left_label.characters = ((4-i)*100)+"K";
                left_label.textAlignHorizontal = "RIGHT";
                left_label.resize(30,16);
                left_label.fontSize = 10;
                left_label.setRangeFills(0,left_label.characters.length, [{ type: 'SOLID', color: labels_color}]);
                left_label.x = 10;
                left_label.y = (((msg.height-bottomLabelsMargin)/4*i))-8;
                left_label.name = "left_label_"+identifier;


            }
        }  
        
            const vertical_grid = figma.currentPage.findAll(n => n.name === "grid_vertical_line_"+identifier);
            const horizontal_grid = figma.currentPage.findAll(n => n.name === "grid_horizontal_line_"+identifier);
            const vertical_grid_group = figma.group(vertical_grid, chart_frame);
            vertical_grid_group.name = "Vertical Grid Lines";
            const horizontal_grid_group = figma.group(horizontal_grid, chart_frame);
            horizontal_grid_group.name = "Horizontal Grid Lines";

            if (msg.labels == "yes"){
                const left_labels = figma.currentPage.findAll(n => n.name === "left_label_"+identifier);
                const bottom_labels = figma.currentPage.findAll(n => n.name === "bottom_label_"+identifier);
                const left_labels_group = figma.group(left_labels, chart_frame);
                left_labels_group.name = "Left Labels";
                const bottom_labels_group = figma.group(bottom_labels, chart_frame);
                bottom_labels_group.name = "Bottom Labels";
            }

        
        }

    bucketWidth -= msg.bars_margin;
    if (msg.typology === "stacked")
    {
        for (let k=0; k<buckets_data.length; k++){
            
            let series_sum = 0;
            for (var i=0; i<buckets_data[k].length; i++)
            {
                const color = {r:colors[i].r/255, g:colors[i].g/255, b:colors[i].b/255};
                const rect = figma.createRectangle();
                rect.name = "Rect_"+identifier+"_"+i;
                rect.x = leftLabelsMargin+(k*bucketWidth)+(msg.bars_margin*(k+1))-(msg.bars_margin/2);
                
                rect.y = msg.height - bottomLabelsMargin - buckets_data[k][i] - series_sum;
                let width = bucketWidth;
                if (width<1)
                    width = 1;
                const height = buckets_data[k][i];
            
                rect.resize(width, height);
                rect.fills = [{type: 'SOLID', color: color}];

                series_sum += buckets_data[k][i];
                
            }
        }
    } else if (msg.typology === "grouped")
    {
        for (let k=0; k<buckets_data.length; k++){
        
            let series_sum = 0;
            for (var i=0; i<buckets_data[k].length; i++)
            {
                const color = {r:colors[i].r/255, g:colors[i].g/255, b:colors[i].b/255};
                const rect = figma.createRectangle();
                rect.name = "Rect_"+identifier+"_"+i;
                rect.x = leftLabelsMargin+(k*bucketWidth)+(i*(bucketWidth/msg.data_series))+(msg.bars_margin*(k+1))-(msg.bars_margin/2);
                
                rect.y = msg.height - bottomLabelsMargin - buckets_data[k][i];
                let width = bucketWidth/msg.data_series;
                if (width<1)
                    width = 1;
                const height = buckets_data[k][i];
               
                rect.resize(width, height);
                rect.fills = [{type: 'SOLID', color: color}];
    
                series_sum += buckets_data[k][i];
                
            }
        }
    }

    // ---------------------------------
        // Group data series

        let data_series_groups =[]; 
        for (let q=0; q<msg.data_series; q++)
        {
            const rectangles = figma.currentPage.findAll(n => n.name === "Rect_"+identifier+"_"+q);
            const rect_group = figma.group(rectangles, chart_frame);
            rect_group.name = "Series_"+q;
            data_series_groups.push(rect_group);
        }

        const chart_group = figma.group(data_series_groups, chart_frame);
        chart_group.name = "Data Series";
        
        chart_group.resize(chart_group.width, msg.height-bottomLabelsMargin-30);
        chart_group.y = 0+(msg.height-bottomLabelsMargin-chart_group.height);

        chart_frame.x = center.x-(msg.width/2);
        chart_frame.y = center.y-(msg.height/2);
  }
  
  figma.closePlugin();
};

function clone(val) {
    return JSON.parse(JSON.stringify(val))
  }