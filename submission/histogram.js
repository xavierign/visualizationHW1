d3.csv("EDAVSurveyResults.csv", function(error, data) {
  var students = d3.nest()
    .key(function(d){ return d.Program2; })
    .key(function(d){ return d.Gender; })
    .map(data);

  // -----------------------------------------------------------------
  // Determine histogram bin heights given list of programs
  function get_bin_height(programs) {
    // Initialize histogram bins
    var bins = [];
    for (k=0; k<2; k++) { bins[k] = 0; }
    //console.log(students);
    //console.log(students[1][1]);
    //console.log(programs);
    // Add up the student for the requested programs
    for (program of programs) {
        for (var gender=0; gender<2; gender++) {
          //console.log(bins[k]);
          if(students[program][gender])
          ////bins[gender] = bins[gender] + (+students[program][gender][0].Count);
            bins[gender] = bins[gender] + (+students[program][gender].length);
            //bins[gender] = bins[gender] + students[program][gender].length;
            
          else bins[gender] = bins[gender] + 0;
          //console.log(bins[gender]);
          //console.log(bins[gender]);
        }
    }
    //console.log(bins);
    return bins;
  }

  // Set svg dimensions and append
  var svg_width=500, svg_height=425;
  var svg = d3.select("#histogram")
    .append('svg')
    .attr("viewBox", "0 0 " + svg_width + " " + svg_height);
    //.style("max-width", svg_width + "px")
    //.attr("preserveAspectRatio", "xMidYMid meet");

  // Set margins for the histogram portion
  var margin = {
    'top': 20,
    'right': 50,
    'bottom': 35,
    'left': 50
  };

  // Append histogram portion
  var hist = svg.append("g")
    .attr('transform', "translate(" + margin.left + ", " + margin.top + ")");

  var hist_width = svg_width - (margin.left + margin.right),
      hist_height = svg_height - (margin.top + margin.bottom);

  // By default, show all programs
  var all_programs = [0,1,2,3,4,5,6];
  var bin_heights_temp = get_bin_height(all_programs);

  // Scales
  var y_max = d3.max(bin_heights_temp);
  var x_scale = d3.scale.linear().domain([0, 2]).range([0, 80]),
      y_scale = d3.scale.linear().domain([0, 81]).range([hist_height, 0]);
  //console.log(bin_heights_temp);

  // Axes
  //var x_axis = d3.svg.axis().scale(x_scale).orient('bottom');.tickValues([0,1])
  var x_axis = d3.svg.axis().scale(x_scale).orient('bottom').tickValues([0,1]);
  var y_axis = d3.svg.axis().scale(y_scale).orient('left').tickValues([0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80]);

  hist.append('g')
    .attr('class', 'axis')
    .call(x_axis)
    .attr('transform', 'translate(0, ' + hist_height + ')');
  hist.append('g')
    .attr('class', 'axis')
    .attr('id', 'y-axis')
    .call(y_axis);

  bin_width = hist_width/24;
  bar_width = bin_width*.65;

  // Move the tick labels to the center of the bins
  hist.select('.axis').call(x_axis)
    .selectAll('text')
    .attr('transform', 'translate(' + (bin_width/2) + ', 5)')
    .style('text-anchor', 'center').text(function (d,index)
    {
          if(index === 0)
            return "Male";
          if(index === 1)
            return "Female";
          return String(index);
      });

  // -----------------------------------------------------------------
  function update(progs) {
    var bin_heights = get_bin_height(progs);

    // Update the y-axis
    y_max = d3.max(bin_heights);
    y_scale.domain([0, 81]).range([370,0]);
    //hist.select('#y-axis').transition().call(y_axis);

    var rectangles = hist.selectAll('rect')
      .data(bin_heights);
    
    rectangles
      .enter()
      .append('rect')
      .attr('fill', function(d, index){
          if(index === 0)
            return "#0000ff";
          if(index === 1)
            return "#ff0000";
          return "black";
          
        })
      .attr('width', bar_width)
      .attr('transform', 'translate(' + (bin_width-bar_width)/2 + ', 0)')
      .style('opacity', 0.8);

    // Update the bin heights
    rectangles
      .transition()
      .attr('x', function(d,index) {
        return x_scale(index);
      })
      .attr('y', function(d) {
        return y_scale(d);
      })
      .attr('height', function(d){
        console.log("d:    " + d);
        console.log("hist height:   " + hist_height);
        console.log("y_scale:   " + String(y_scale(d)));
        return (hist_height - y_scale(d));
      });
  }

  // Initialize with all months and days
  update(all_programs)

  var programs = [0,1,2,3,4,5,6];
  $(document).ready(function() {
    // Month selector
    $('.btn-month').click(function() {
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        $(this).addClass('inactive');
        
        var program = $(this).attr('value'),
          i = programs.indexOf(+program);
        if(i > -1) { programs.splice(i, 1); }

        update(programs);
      }
      else {
        $(this).removeClass('inactive');
        $(this).addClass('active');

        var program = $(this).attr('value');
        programs.push(+program)

        update(programs);
      }
    })

    

    // Select all / reset
    $('.select-all').click(function() {
      programs =  [0,1,2,3,4,5,6];
      $('.btn-month').each(function() {
        if ($(this).hasClass('inactive')) {
          $(this).removeClass('inactive');
          $(this).addClass('active');
        }
      })
      $('.btn-day').each(function() {
        if ($(this).hasClass('inactive')) {
          $(this).removeClass('inactive');
          $(this).addClass('active');
        }
      })
      update(programs);
    })

    // Deselect all
    $('.deselect-all').click(function() {
      months = [];
      days = [];
      programs = [];
      $('.btn-month').each(function() {
        if ($(this).hasClass('active')) {
          $(this).removeClass('active');
          $(this).addClass('inactive');
        }
      })
      $('.btn-day').each(function() {
        if ($(this).hasClass('active')) {
          $(this).removeClass('active');
          $(this).addClass('inactive');
        }
      })
      update(months);
    })
  })
})