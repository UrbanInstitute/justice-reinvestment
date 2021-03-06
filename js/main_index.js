IS_IE = false;
var oldState = "Georgia"


function getInternetExplorerVersion()
{
  var rv = -1;
  if (navigator.appName == 'Microsoft Internet Explorer')
  {
    var ua = navigator.userAgent;
    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null)
      rv = parseFloat( RegExp.$1 );
  }
  else if (navigator.appName == 'Netscape')
  {
    var ua = navigator.userAgent;
    var re  = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null)
      rv = parseFloat( RegExp.$1 );
  }
  return rv;
}




function getActiveCategory(){
  var tab = d3.select("#tab_container .tab.active")
  return tab.node().id.replace("tab_","")
  // return "PRI"
}
function getActiveState(){
  return $("#state-selector").val()
  // return "Georgia"
}

function countup_val(val_id, new_val, delay){
  var prefix, separator, suffix, precision
  if(val_id == "tot_savings" || val_id == "tot_reinvest") prefix = "$"
  else prefix = ""

  if(val_id.search("_percent") != -1){
    suffix = " percent";
    precision = 1;
  }else{
    suffix = '';
    precision = 0;
  }

  if(val_id.search("_yr") != -1) separator = ''
  else separator = ','
  if(new_val == 0){
    d3.select("#" + val_id).html("&mdash;")
    return false;
  }


  var current_val = parseFloat(d3.select("#" + val_id).text().replace("$","").replace(/\,/g,""))
  if(isNaN(current_val)) current_val = 0;
  var countup_options = {
    useEasing : true, 
    useGrouping : true,
    separator : separator, 
    decimal : '.', 
    prefix : prefix, 
    suffix : suffix
  };
  if(delay){
    var format = d3.format(separator + "." + precision + "f")
    d3.select("#" + val_id).text(prefix + String(format(new_val)) + suffix)
  }else{
    var amount_countup = new CountUp(val_id, current_val, new_val, precision, .5, countup_options);
    amount_countup.start();
  }
}

function getArticle(val){
  val = Math.max( Math.round(val * 10) / 10, 2.8 ).toFixed(2);
  var num = String(val).split(".")[0]
  if(num == "8" || num == "18" || num == "80" || num == "11") return "an"
  else return "a"
}

function moveTooltip(dot){
        if(dot == null){
          return false
        }
        var TT_WIDTH = 200
        var d = d3.select(dot).datum()
        var main_val = d[getActiveState() + "-" + getActiveCategory()]
        var proj_val = d[getActiveState() + "-" + "PROJ"]
        var comma = d3.format(",")
        var year = d.year
        d3.selectAll(".tt_year").text(year)
        if(main_val != 0 && ! isNaN(main_val)){
          d3.select("#tt_main_text").text("population: ")
          d3.select("#tt_main_val").text(comma(main_val))
        }else{
          d3.select("#tt_main_text").text("")
          d3.select("#tt_main_val").text("")
          d3.select("#tt_main .tt_year").text("")
          d3.select("#tooltip").style("height","36px")
        }
        if(proj_val != 0 && ! isNaN(proj_val) && getActiveCategory() == "PRI"){
          d3.select("#tt_proj_text").text("projection: ")
          d3.select("#tt_proj_val").text(comma(proj_val))
        }else{
          d3.select("#tt_proj_text").text("")
          d3.select("#tt_proj_val").text("")
          d3.select("#tt_proj .tt_year").text("")
          d3.select("#tooltip").style("height","24px")
        }
        if( (proj_val != 0 && ! isNaN(proj_val) && getActiveCategory() == "PRI") && (main_val != 0 && ! isNaN(main_val)) ){
            d3.select("#tooltip").style("height","47px")
        }

        if(dot == null){
          hideTooltip();
          return false
        }else{
          d3.select("#tooltip")
          .style("opacity",1)
          .style("top", function(){
            return dot.getBoundingClientRect().top + 12
          })
          .style("left", function(){
            if(d3.select("svg").node().getBoundingClientRect().width - dot.getBoundingClientRect().left - TT_WIDTH < 0){
              return dot.getBoundingClientRect().left - 6 - TT_WIDTH
            }
            return dot.getBoundingClientRect().left + 12
          })
        }
}
function hideTooltip(){
  d3.selectAll("circle.active").classed("active",false)
  d3.select("#tooltip")
    .style("opacity",0)
}
function drawChart(){
  if(getInternetExplorerVersion() != -1){
    IS_IE = true;
  }
  container_width = $("h2.jri-state")[0].getBoundingClientRect().width
  var IS_TABLET = d3.select("#is_tablet").style("display") == "block"
  var IS_MOBILE = d3.select("#is_mobile").style("display") == "block"

  // d3.select("#tab_PRI").text(function(){return (IS_MOBILE) ? "Prison" : "Prison Population" })
  // d3.select("#tab_PRO").text(function(){return (IS_MOBILE) ? "Probation" : "Probation Population" })
  // d3.select("#tab_PAR").text(function(){return (IS_MOBILE) ? "Parole" : "Parole Population" })

  // console.log(container_width)

  d3.selectAll("svg").remove()
  var defaultSelector = getActiveState() + "-" + getActiveCategory();
  var pdefaultSelector = getActiveState() + "-" + "PROJ"
  // var container_height = d3.select("#contents").node().getBoundingClientRect().height
  var container_height;
  if(IS_MOBILE) container_height = 400
  else if(IS_TABLET) container_height = 400
  else container_height = 400
  // var container_height = container_width/scalar
  var leftMargin = (IS_MOBILE) ? 45 : 70;
  var margin = {top: 90, right: 40, bottom: 50, left: leftMargin},
      width = (IS_TABLET) ? container_width - margin.left - margin.right : container_width*.7 - margin.left - margin.right,
      height = (IS_TABLET) ? container_height-90 - margin.top - margin.bottom : container_height - 40 - margin.top - margin.bottom;
  d3.select(".tab.gap").style("width", function(){
    if(IS_TABLET){
      return container_width - 50 - (150+10)*3
    }else{
      return container_width*.7 - 50 - (150+50)*3
    }
  })


  var formatDate = d3.time.format("%Y");

  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickFormat(d3.time.format("%Y"));


  var yFormat = (IS_MOBILE) ? d3.format("s") : d3.format(",")
  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks((Math.floor(width/60) > 8) ? 8 : Math.floor(width/60))
      .tickFormat(yFormat);

  var svg = d3.select("#chart").insert("svg",".div-dash-block")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
            .on("mousemove", mousemove)
            .on("mouseout",hideTooltip)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  d3.selectAll(".nodata-note")
    .style("width", (width + margin.left + margin.right - .2*width) + "px")
    .style("margin", (.1*width) + "px")

  bisectDate = d3.bisector(function(d) { return parseFloat(d.year); }).left
  function mousemove() {
// return typeof(d[selector]) != "undefined" && d[selector] != 0
    var x0 = x.invert(d3.mouse(this)[0]-margin.left+20)
    var year = x0.getFullYear()
    d3.selectAll(".active.dot").classed("active",false)
    d3.selectAll(".active.pdot").classed("active",false)
    d3.selectAll(".dot.y" + year)
      .classed("active", function(d){
        return (typeof(d[defaultSelector]) != "undefined" && d[defaultSelector] != 0)
      })
    d3.selectAll(".pdot.y" + year)
      .classed("active", function(d){
        if(getActiveCategory() == "PRI"){
          return (typeof(d[pdefaultSelector]) != "undefined" && d[pdefaultSelector] != 0)
        } else return false
      })
      // d3.select("#tooltip")
      //   .style("top", function(){
      //     return d3.select("circle.active").node().getBoundingClientRect().top + 12
      //   })
      //   .style("left", function(){
      //     return d3.select("circle.active").node().getBoundingClientRect().left + 12
      //   })
      moveTooltip(d3.select("circle.active").node())
  }
  svg
    .append('defs')
    .append('pattern')
      .attr('id', 'diagonalHatch')
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('width', 8)
      .attr('height', 8)
    .append('path')
      .attr('d', 'M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4')
      .attr('stroke', '#d2d2d2')
      .attr('stroke-width', 1);

  d3.json("data/jridata.json", function(error, data) {
    var slice = data.filter(function(d){ return typeof(d[defaultSelector]) != "undefined" && d[defaultSelector] != 0})
    var pslice = data.filter(function(d){ return typeof(d[pdefaultSelector]) != "undefined" && d[pdefaultSelector] != 0})



  var yearSpan = (Math.round(  (d3.max(pslice, function(d){ return formatDate.parse(d.year)}) - d3.min(slice, function(d){ return formatDate.parse(d.year)}))/(1000*60*60*24*365)  ))
  if (IS_MOBILE) xAxis.ticks(3)
  else if(yearSpan > 8) xAxis.ticks(d3.time.years, 2)
  else xAxis.ticks(d3.time.years, 1)

    if (error) throw error;

    var pxmax = d3.max(pslice, function(d){ return formatDate.parse(d.year)})
    var sxmax = d3.max(slice, function(d){ return formatDate.parse(d.year)})
    var xmax = (pxmax > sxmax) ? pxmax : sxmax

    x.domain([d3.min(slice, function(d){ return formatDate.parse(d.year)}), xmax]);
    y.domain([0, d3.max(slice, function(d){ return +d[defaultSelector]*1.5})])


  var line = d3.svg.line()
      .x(function(d) { return x(formatDate.parse(d.year)); })
      .y(function(d) {
          return y(+d[defaultSelector]);    
      });
  var pline = d3.svg.line()
      .x(function(d) { return x(formatDate.parse(d.year)); })
      .y(function(d) {
          return y(+d[pdefaultSelector]);    
      });


    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)

    d3.selectAll(".y.axis .tick line")
      .style("stroke","#e3e3e3")
      .style("stroke-width","1px")
      .attr("x2",0)
      .attr("x1",width)
  
    var jri = svg.append("rect")
      .attr("x",0)
      .attr("y",0)
      .attr("height",height)
      .attr("width", x(formatDate.parse(JRI[getActiveState()]["leg_yr"])))
      .style("fill",'url(#diagonalHatch)')
      .style("pointer-events","none")
      .style("stroke","#5c5859")
      .style("stroke-width","2px")
      .style("stroke-dasharray", "0," + x(formatDate.parse(JRI[getActiveState()]["leg_yr"])) + "," + height + "," + (x(formatDate.parse(JRI[getActiveState()]["leg_yr"])) + height))

    var pointer = svg.append("g")
          .attr("transform", "translate(" + (x(formatDate.parse(JRI[getActiveState()]["leg_yr"])) - 117) + "," + height/1.4 + ")")

        pointer
          .append("polygon")
          .attr("points","0,24.8 99.8,24.8 116,12.1 99.8,0 0,0")
          .attr("fill","#5c5859")
          .attr("stroke","#5c5859")
          .attr("stroke-width","2px")
        pointer.append("text")
          .text("JRI enactment")
          .style("font-size","12px")
          .attr("dy",17)
          .attr("dx",10)
          .style("font-weight","500")
          .style("fill","white")
          .style("letter-spacing",".7px")
    var projLine = svg.append("path")
        .datum(pslice)
        .attr("class", "proj_line")
        .attr("d", pline)
        .style("opacity", function(){ return (getActiveCategory() == "PRI") ? 1 : 0});

    var mainLine = svg.append("path")
        .datum(slice)
        .attr("class", "line")
        .attr("d", line);

    var mainDot = svg.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class",function(d){
        return "dot y" + d.year
      })
      .attr("cx", function(d){ 
        return x(formatDate.parse(d.year))
      })
      .attr("cy", function(d){
        // console.log(d[defaultSelector])
         if(d[defaultSelector] == undefined){
          return -1000
         }else{
          return y(+d[defaultSelector])
        }
      })
      .attr("r",6)

    var projDot = svg.selectAll(".pdot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class",function(d){
        return "pdot y" + d.year
      })
      .attr("cx", function(d){ 
        return x(formatDate.parse(d.year))
      })
      .attr("cy", function(d){
         return y(+d[pdefaultSelector])
      })
      .attr("r",6)


    // $("#state-selector")
    //   .change(function(){
    //     updateChart($("#state-selector").val(), getActiveCategory());
    //     updateText($("#state-selector").val(), getActiveCategory());
    //     var m = $(this);
    //     if(m.val() == ""){
    //       m.css("color", "#818385");
    //     }else{ m.css("color", "#333")}
    // });
  if(IS_MOBILE){
    $("#mobile_tabs").selectmenu({
     change: function(event, data){
          var category = data.item.value.replace("tab_","")
          d3.selectAll("#tab_container .tab").classed("active",false)
          d3.select("#tab_container #tab_" + category).classed("active",true)
          updateChart(getActiveState(), category)
          updateText(getActiveState(), category)
          // console.log(data.item.value)
      }
    });
    $("#nc_tabs").selectmenu({
     change: function(event, data){
          var category = data.item.value.replace("tab_","")
          d3.selectAll("#tab_container .tab").classed("active",false)
          d3.select("#tab_container #tab_" + category).classed("active",true)
          updateChart(getActiveState(), category)
          updateText(getActiveState(), category)
          // console.log(data.item.value)
      }
    });
    $("#or_tabs").selectmenu({
     change: function(event, data){
          var category = data.item.value.replace("tab_","")
          d3.selectAll("#tab_container .tab").classed("active",false)
          d3.select("#tab_container #tab_" + category).classed("active",true)
          updateChart(getActiveState(), category)
          updateText(getActiveState(), category)
          // console.log(data.item.value)
      }
    });
    $("#ks_tabs").selectmenu({
     change: function(event, data){
          var category = data.item.value.replace("tab_","")
          d3.selectAll("#tab_container .tab").classed("active",false)
          d3.select("#tab_container #tab_" + category).classed("active",true)
          updateChart(getActiveState(), category)
          updateText(getActiveState(), category)
          // console.log(data.item.value)
      }
    });
  }
  $( "#state-selector" ).selectmenu({
    change: function(event, data){
             updateChart($("#state-selector").val(), getActiveCategory());
        updateText($("#state-selector").val(), getActiveCategory());
        var m = $(this);
        if(m.val() == ""){
          m.css("color", "#818385");
        }else{ m.css("color", "#333")}
 
    }
  });
    d3.select("#dl-natl")
      .on("click", function(){
        window.location = "data/download/All_Data.csv"
      })
    d3.select("#dl-state")
      .on("click", function(){
        window.location = "data/download/" + getActiveState() + ".csv"
      })
    d3.select("#print-button")
      .on("click", function(){
        window.print()
      })
    d3.select("#download-button")
      .on("mouseover", function(){
        d3.selectAll(".dl-menu").transition()
          .style("height","40px")
          .style("padding-top","6px")
        d3.select("#dl-state")
          .style("border-bottom","1px solid #9d9d9d")
      })
      .on("mouseout", function(){
        d3.selectAll(".dl-menu").transition()
          .style("height","0px")
          .style("padding-top","0px")
        d3.select("#dl-state")
          .style("border-bottom","none")
      })
    d3.selectAll(".nav_button")
      .on("click", function(){
        var stateList = ["Arkansas","Delaware","Georgia","Hawaii","Idaho","Kansas","Kentucky","Louisiana","Mississippi","Missouri","New_Hampshire","North_Carolina","Ohio","Oregon","Pennsylvania","South_Carolina","South_Dakota","West_Virginia"]
        var current = stateList.indexOf($("#state-selector").val());
        var newState;
        if(d3.select(this).classed("prev")){
          if(current == 0){
            newState = stateList.length-1
          }else{
            newState = current-1
          }
        }else{
          if(current == stateList.length - 1){
            newState = 0
          }else{
            newState = current+1
          }
        }
        $("#state-selector").val(stateList[newState])
        $("#state-selector-button .ui-selectmenu-text").text(stateList[newState].replace(/_/g," "))
        updateChart(stateList[newState], getActiveCategory());
        updateText(stateList[newState], getActiveCategory());
      })    

    var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    if (isFirefox){
      $("#state-selector").css("pointer-events","visible");
    }

    d3.selectAll("#tab_container .tab")
      .on("click", function(){
        if(d3.select(this).classed("gap")){
          return false;
        }else{
          var category = this.id.replace("tab_","")
          d3.selectAll("#tab_container .tab").classed("active",false)
          d3.select(this).classed("active",true)
          updateChart(getActiveState(), category)
          updateText(getActiveState(), category)
        }
      })
    function fadeText(objID, newText, delay){
      // console.log(delay)
      d3.select("#dummy_" + objID)
        .html(newText)
        .style("width", function(){
          return  d3.select("#" + objID).node().getBoundingClientRect().width
        })
      var top_end = d3.select("#dummy_" + objID).node().getBoundingClientRect().height
      if(delay){
        d3.select("#" + objID)
          .style("height",top_end + "px")
          .style("opacity",.2)
          .style("opacity",1)
          .html(newText)
      }else{
        d3.select("#" + objID)
          .transition()
          .style("height",top_end + "px")
          .style("opacity",.2)
          .each("end", function(){
            d3.select(this).transition().style("opacity",1)
            d3.select(this).html(newText)
          })
      }
    }
    
    function updateText(state, category, delay){
      var NC_EDGE = (state == "North_Carolina")
      var OR_EDGE = (state == "Oregon")
      var KS_EDGE = (state == "Kansas")
      if(NC_EDGE){
        d3.selectAll(".nc-parole-uc").text("Postprison Supervision")
        d3.selectAll(".nc-parole-lc").text("postprison supervision")
        d3.selectAll(".nc-prob-uc").text("Probation")
        d3.selectAll(".nc-prob-lc").text("probation")
        d3.selectAll("#tab_container .tab")
          .style("height","40px")
        d3.selectAll("#tab_container .tab:not(#tab_PAR)")
          .style("padding-top","18px")
          .style("padding-bottom","0px")
        d3.selectAll("#tab_container #tab_PAR")
          .style("width","170px")
        d3.select(".tab.gap").style("width", function(){
          if(IS_TABLET){
            return container_width - 70 - (150+10)*3
          }else{
            return container_width*.7 - 70 - (150+50)*3
          }
        })
        if(IS_MOBILE){
          d3.select("#mobile_tabs-button").style("display","none")
          d3.select("#ks_tabs-button").style("display","none")
          d3.select("#nc_tabs-button").style("display","block")
          d3.select("#or_tabs-button").style("display","none")
        }else{
          d3.select("#mobile_tabs-button").style("display","none")
          d3.select("#nc_tabs-button").style("display","none")
          d3.select("#ks_tabs-button").style("display","none")
          d3.select("#or_tabs-button").style("display","none")
        }
      }
      else if(OR_EDGE){
        d3.selectAll(".nc-parole-uc").text("Postprison Supervision")
        d3.selectAll(".nc-parole-lc").text("postprison supervision")
        d3.selectAll(".nc-prob-uc").text("Probation")
        d3.selectAll(".nc-prob-lc").text("probation")
        d3.selectAll("#tab_container .tab")
          .style("height","40px")
        d3.selectAll("#tab_container .tab:not(#tab_PAR)")
          .style("padding-top","18px")
          .style("padding-bottom","0px")
        d3.selectAll("#tab_container #tab_PAR")
          .style("width","170px")
        d3.select(".tab.gap").style("width", function(){
          if(IS_TABLET){
            return container_width - 70 - (150+10)*3
          }else{
            return container_width*.7 - 70 - (150+50)*3
          }
        })
        if(IS_MOBILE){
          d3.select("#mobile_tabs-button").style("display","none")
          d3.select("#ks_tabs-button").style("display","none")
          d3.select("#nc_tabs-button").style("display","none")
          d3.select("#or_tabs-button").style("display","block")

        }else{
          d3.select("#mobile_tabs-button").style("display","none")
          d3.select("#nc_tabs-button").style("display","none")
          d3.select("#ks_tabs-button").style("display","none")
          d3.select("#or_tabs-button").style("display","none")

        }
      }
      else if(KS_EDGE){
        d3.selectAll(".nc-parole-uc").text("Postincarceration Management")
        d3.selectAll(".nc-parole-lc").text("postincarceration management")
        d3.selectAll(".nc-prob-uc").text("Community Corrections")
        d3.selectAll(".nc-prob-lc").text("community corrections")
        d3.selectAll("#tab_container .tab")
          .style("height","40px")
        d3.selectAll("#tab_container .tab:not(.ks_tab)")
          .style("padding-top","18px")
          .style("padding-bottom","0px")
        d3.selectAll(".ks_tab")
          .style("padding-top","9px")
          .style("padding-bottom","9px")
          .style("width","180px")
          .style("padding-left","20px")
          .style("padding-right","20px")
        d3.select(".tab.gap").style("width", function(){
          if(IS_TABLET){
            return container_width - 70 - (150+10)*3
          }else{
            return container_width*.7 - 70 - (150+50)*3
          }
        })
        if(IS_MOBILE){
          d3.select("#mobile_tabs-button").style("display","none")
          d3.select("#ks_tabs-button").style("display","block")
          d3.select("#nc_tabs-button").style("display","none")
          d3.select("#or_tabs-button").style("display","none")
        }else{
          d3.select("#mobile_tabs-button").style("display","none")
          d3.select("#nc_tabs-button").style("display","none")
          d3.select("#ks_tabs-button").style("display","none")
          d3.select("#or_tabs-button").style("display","none")
        }
      }else{
        d3.selectAll(".nc-parole-uc").text("Parole")
        d3.selectAll(".nc-parole-lc").text("parole")
        d3.selectAll(".nc-prob-uc").text("Probation")
        d3.selectAll(".nc-prob-lc").text("probation")

        d3.select("#mobile_tabs .tab_PAR").text("Parole Population")
        if(IS_MOBILE){
          d3.select("#mobile_tabs-button").style("display","block")
          d3.select("#nc_tabs-button").style("display","none")
          d3.select("#ks_tabs-button").style("display","none")
          d3.select("#or_tabs-button").style("display","none")
        }else{
          d3.select("#mobile_tabs-button").style("display","none")
          d3.select("#nc_tabs-button").style("display","none")
          d3.select("#ks_tabs-button").style("display","none")
          d3.select("#or_tabs-button").style("display","none")
        }
        d3.selectAll("#tab_container .tab")
          .style("height","20px")
        d3.selectAll("#tab_container .tab:not(#tab_PAR)")
          .style("padding-top","9px")
          .style("padding-bottom","9px")
        d3.selectAll("#tab_container #tab_PAR")
          .style("width","150px")
        d3.select(".tab.gap").style("width", function(){
          if(IS_TABLET){
            return container_width - 50 - (150+10)*3
          }else{
            return container_width*.7 - 50 - (150+50)*3
          }
        })
      }

      if ((state == "Delaware" && category == "PAR") || (state == "West_Virginia" && category == "PRO")){
        d3.select("#" + category + "-caption p")
          .transition()
          .style("opacity",0)
      }else{
        d3.selectAll(".caption p")
          .transition()
          .style("opacity",1)
      }
 
      // d3.select("#top_text").html(TOP_TEXT[state])
      // if(state != oldState){
        fadeText("top_text", TOP_TEXT[state], state == oldState)
        fadeText("savings_text", SAVINGS_TEXT[state], state == oldState)
        var more_info_list = d3.select("#more_info_list")
        var more_info_div = d3.select(".div-more-info")
        more_info_list.selectAll("li").remove()
        if (MORE_INFO[state].length == 0){
          more_info_div
            .style("display","none")
        }else{
          more_info_div
            .style("display","block")
        }
        for(var i = 0; i<MORE_INFO[state].length; i++){
          more_info_list.append("li")
            .attr("class","list-item")
            .html(MORE_INFO[state][i])
        }

      // }
      oldState = state;
      d3.selectAll(".caption").style("display","none")
      d3.select("#" + category + "-caption").style("display","inline")
      // console.log(data)
      var recentpri_yr_data = data.filter(function(d){ return d.year == JRI[state]["recentpri_yr"]})[0]
      var recentproj_yr_data = data.filter(function(d){ return d.year == JRI[state]["recentproj_yr"]})[0]
      var recentpro_yr_data = data.filter(function(d){ return d.year == JRI[state]["recentpro_yr"]})[0]
      var recentpar_yr_data = data.filter(function(d){ return d.year == JRI[state]["recentpar_yr"]})[0]

      var base_yr_data = data.filter(function(d){ return d.year == JRI[state]["base_yr"]})[0]

      countup_val("tot_savings", JRI[state]["tot_savings"], delay)
      countup_val("tot_reinvest", JRI[state]["tot_reinvest"], delay)
      d3.selectAll(".state_name_text").text(state.replace(/_/g," "))

//*************** PRISON TAB
      countup_val("recentpri_yr", JRI[state]["recentpri_yr"], delay)
      countup_val("recentpri-num", recentpri_yr_data[state + "-PRI"], delay)
      countup_val("recentpri_percent", Math.abs(100*(recentpri_yr_data[state + "-PRI"] - base_yr_data[state + "-PRI"])/base_yr_data[state + "-PRI"]) , delay)
      countup_val("pri_base_yr", JRI[state]["base_yr"], delay)
      countup_val("recentproj-num", Math.abs(recentproj_yr_data[state+"-PRI"] - recentproj_yr_data[state+"-PROJ"]), delay)
      countup_val("recentproj_percent", Math.abs(100*(recentproj_yr_data[state+"-PRI"] - recentproj_yr_data[state+"-PROJ"]) / recentproj_yr_data[state+"-PROJ"]), delay)
      countup_val("recentproj_yr", JRI[state]["recentproj_yr"], delay)

      d3.select("#recentpri_article").text(getArticle(Math.abs(100*(recentpri_yr_data[state + "-PRI"] - base_yr_data[state + "-PRI"])/base_yr_data[state + "-PRI"])))

      d3.select("#recentproj_article").text(getArticle(Math.abs(100*(recentproj_yr_data[state+"-PRI"] - recentproj_yr_data[state+"-PROJ"]) / recentproj_yr_data[state+"-PROJ"])))

      if(recentpri_yr_data[state + "-PRI"] - base_yr_data[state + "-PRI"] < 0){
        d3.select("#recentpri_textpercent").text("decrease")
      }else{
        d3.select("#recentpri_textpercent").text("increase")
      }
      if(100*(recentproj_yr_data[state+"-PRI"] - recentproj_yr_data[state+"-PROJ"]) / recentproj_yr_data[state+"-PROJ"] < 0){
        d3.select("#recentproj_textpercent").text("decrease")
      }else{
        d3.select("#recentproj_textpercent").text("increase")
      }
      if(recentproj_yr_data[state+"-PRI"] - recentproj_yr_data[state+"-PROJ"] < 0){
        d3.select("#recentproj-textnum").text("fewer")
      }else{
        d3.select("#recentproj-textnum").text("more")
      }


      if(JRI[state]["recentpri_dt"] == ""){
        d3.select("#recentpri_dt").text("In ")
      }else{
        d3.select("#recentpri_dt").text(JRI[state]["recentpri_dt"])
      }

//*************** PROBATION TAB
      if(state != "West_Virginia"){

        countup_val("recentpro_yr", JRI[state]["recentpro_yr"], delay)
        countup_val("recentpro-num", recentpro_yr_data[state + "-PRO"], delay)
        countup_val("recentpro_percent", Math.abs(100*(recentpro_yr_data[state + "-PRO"] - base_yr_data[state + "-PRO"])/base_yr_data[state + "-PRO"]) , delay)
        countup_val("pro_base_yr", JRI[state]["base_yr"], delay)

        d3.select("#recentpro_article").text(getArticle(Math.abs(100*(recentpro_yr_data[state + "-PRO"] - base_yr_data[state + "-PRO"])/base_yr_data[state + "-PRO"])))



        if(recentpro_yr_data[state + "-PRO"] - base_yr_data[state + "-PRO"] < 0){
          d3.select("#recentpro_textpercent").text("decrease")
        }else{
          d3.select("#recentpro_textpercent").text("increase")
        }


        if(JRI[state]["recentpro_dt"] == ""){
          d3.select("#recentpro_dt").text("In ")
        }else{
          d3.select("#recentpro_dt").text(JRI[state]["recentpro_dt"])
        }
      }
//*************** PAROLE TAB
      if(state != "Delaware"){
        countup_val("recentpar_yr", JRI[state]["recentpar_yr"], delay)
        countup_val("recentpar-num", recentpar_yr_data[state + "-PAR"], delay)
        countup_val("recentpar_percent", Math.abs(100*(recentpar_yr_data[state + "-PAR"] - base_yr_data[state + "-PAR"])/base_yr_data[state + "-PAR"]) , delay)
        countup_val("par_base_yr", JRI[state]["base_yr"], delay)

        d3.select("#recentpar_article").text(getArticle(Math.abs(100*(recentpar_yr_data[state + "-PAR"] - base_yr_data[state + "-PAR"])/base_yr_data[state + "-PAR"])))



        if(recentpar_yr_data[state + "-PAR"] - base_yr_data[state + "-PAR"] < 0){
          d3.select("#recentpar_textpercent").text("decrease")
        }else{
          d3.select("#recentpar_textpercent").text("increase")
        }


        if(JRI[state]["recentpar_dt"] == ""){
          d3.select("#recentpar_dt").text("In ")
        }else{
          d3.select("#recentpar_dt").text(JRI[state]["recentpar_dt"])
        }


      }
      if(IS_IE){
        d3.selectAll(".tab").style("height", "65px")
      }

    }





    function updateChart(state, category){
      var NC_EDGE = (state == "North_Carolina" && category == "PAR")
      var OR_EDGE = (state == "Oregon" && category == "PAR")
      var KS_EDGE_PAR = (state == "Kansas" && category == "PAR")
      var KS_EDGE_PRO = (state == "Kansas" && category == "PRO")

      hideTooltip();
      if ((state == "Delaware" && category == "PAR") || (state == "West_Virginia" && category == "PRO")){
        d3.select("#chart")
          .style("pointer-events","none")
          .transition()
          .style("opacity",0)
        d3.select("#legend")
          .style("pointer-events","none")
          .transition()
          .style("opacity",0)
        d3.select("#" + state + "-note")
          .style("pointer-events","visible")
          .transition()
          .style("opacity",1)
        return false;
      }
        d3.selectAll(".nodata-note")
          .style("pointer-events","none")
          .transition()
          .style("opacity",0)
      d3.select("#chart")
        .style("pointer-events","visible")
        .transition()
        .style("opacity",1)
      d3.select("#legend")
        .style("pointer-events","visible")
        .transition()
        .style("opacity",1)
      var selector = state + "-" + category
      var pselector = state + "-PROJ"
      var slice = data.filter(function(d){ return typeof(d[selector]) != "undefined" && d[selector] != 0})
      var pslice = data.filter(function(d){ return typeof(d[pselector]) != "undefined" && d[pselector] != 0})

      if (category != "PRI"){
        d3.select("#l_proj")
          .transition()
          .style("opacity", 0)
      }else{
        d3.select("#l_proj")
          .transition()
          .style("opacity", 1)
      }
      var FULL = {"PRI" : "Actual prison", "PAR": "Parole", "PRO": "Probation"}
      if(NC_EDGE) d3.select("#l_main_text span").text("Postprison supervision")
      else if(OR_EDGE) d3.select("#l_main_text span").text("Postprison supervision")
      else if(KS_EDGE_PRO) d3.select("#l_main_text span").text("Community corrections")
      else if(KS_EDGE_PAR) d3.select("#l_main_text span").text("Postincarceration management")
      else d3.select("#l_main_text span").text(FULL[category])
      var max = d3.max(slice, function(d){ return +d[selector]})
      var pmax = (category == "PRI") ? d3.max(pslice, function(d){ return +d[pselector]}) : max
      var yearSpan;
      if(category != "PRI"){
          x.domain([d3.min(slice, function(d){ return formatDate.parse(d.year)}), d3.max(slice, function(d){ return formatDate.parse(d.year)})]);
          yearSpan = (Math.round(  (d3.max(slice, function(d){ return formatDate.parse(d.year)}) - d3.min(slice, function(d){ return formatDate.parse(d.year)}))/(1000*60*60*24*365)  ))
          if (IS_MOBILE) xAxis.ticks(3)
          else if(yearSpan > 8) xAxis.ticks(d3.time.years, 2)
          else xAxis.ticks(d3.time.years, 1)

      }else{
        if(state == "South_Carolina"){
          x.domain([formatDate.parse("2007"),formatDate.parse("2016")])
          if (IS_MOBILE) xAxis.ticks(3)
          else xAxis.ticks(d3.time.years, 1)
        }else{
          var pxmax = d3.max(pslice, function(d){ return formatDate.parse(d.year)})
          var sxmax = d3.max(slice, function(d){ return formatDate.parse(d.year)})
          var xmax = (pxmax > sxmax) ? pxmax : sxmax


          x.domain([d3.min(slice, function(d){ return formatDate.parse(d.year)}), xmax]);
          yearSpan = (Math.round(  (d3.max(pslice, function(d){ return formatDate.parse(d.year)}) - d3.min(slice, function(d){ return formatDate.parse(d.year)}))/(1000*60*60*24*365)  ))
          if (IS_MOBILE) xAxis.ticks(3)
          else if(yearSpan > 8) xAxis.ticks(d3.time.years, 2)
          else xAxis.ticks(d3.time.years, 1)
        }
      }

    xAxis
      .scale(x)
      .orient("bottom")
      .tickFormat(d3.time.format("%Y"));


      y.domain([0, Math.max(max*1.5, pmax*1.5)])
      line = d3.svg.line()
          .x(function(d) { return x(formatDate.parse(d.year)); })
          .y(function(d) {
              return y(+d[selector]);    
          });
      pline = d3.svg.line()
          .x(function(d) { return x(formatDate.parse(d.year)); })
          .y(function(d) {
              return y(+d[pselector]);    
          });

      if(IS_IE){
        mainLine
        .datum(slice)
        .transition()
        .attr("d", function(d){ return line(d)})
      }else{
        mainLine
          .datum(slice)
          .transition()
          .attrTween('d', function (d) {
            var previous = d3.select(this).attr('d');
            var current = line(d);
            return d3.interpolatePath(previous, current);
          });
      }


      mainDot
      .data(data)
      .attr("class",function(d){
        return "dot y" + d.year
      })
      .transition()
      .attr("cx", function(d){ 
        return x(formatDate.parse(d.year))
      })
      .attr("cy", function(d){
         return y(+d[selector])
      })
      
      if(category == "PRI"){
        if(IS_IE){
          projLine
          .datum(pslice)
          .transition()
          .style("opacity",1)
          .attr("d", function(d){ return pline(d)})

        }else{
        projLine
          .datum(pslice)
          .transition()
          .style("opacity",1)
          .attrTween('d', function (d) {
            var previous = d3.select(this).attr('d');
            var current = pline(d);
            return d3.interpolatePath(previous, current);
          });
        }
      projDot
        .data(data)
        .attr("class",function(d){
          return "pdot y" + d.year
        })
        .transition()
        .attr("cx", function(d){ 
          return x(formatDate.parse(d.year))
        })
        .attr("cy", function(d){
           return y(+d[pselector])
        })
      }else{
        projLine
          .transition()
          .style("opacity",0)
      }
      yAxis.scale(y)
    jri
      .transition()
      .attr("width", x(formatDate.parse(JRI[state]["leg_yr"])))
      .style("stroke-dasharray", "0," + x(formatDate.parse(JRI[state]["leg_yr"])) + "," + height + "," + (x(formatDate.parse(JRI[state]["leg_yr"])) + height))

      pointer
        .transition()
        .attr("transform", "translate(" + (x(formatDate.parse(JRI[state]["leg_yr"])) - 117) + "," + height/1.4 + ")")



      svg.select(".x.axis").transition().duration(1700).call(xAxis)
      svg.select(".y.axis").transition().duration(1700).call(yAxis)
      d3.selectAll(".y.axis .tick line")
        .style("stroke","#dedddd")
        .style("stroke-width","1px")
        .attr("x2",0)
        .attr("x1",width)

    d3.select("svg")
    .on("mousemove", function(){
      var x0 = x.invert(d3.mouse(this)[0]-margin.left+20)
      var year = x0.getFullYear()
      d3.selectAll(".active.dot").classed("active",false)
      d3.selectAll(".active.pdot").classed("active",false)
      d3.selectAll(".dot.y" + year)
        .classed("active", function(d){
          if(typeof(d[selector]) != "undefined" && d[selector] != 0){
           var dot = this;
           moveTooltip(dot)
            return true
          }else{
            hideTooltip();
            return false
         }
        })

      d3.selectAll(".pdot.y" + year)
        .classed("active", function(d){
          if(getActiveCategory() == "PRI"){
          if(typeof(d[pselector]) != "undefined" && d[pselector] != 0){
           var dot = this;
           moveTooltip(dot)
            return true
            }
          }else{
            // hideTooltip()
            return false
          }
        })
      })

    }
      // updateChart(getActiveState(), getActiveCategory())
  updateText(getActiveState(), getActiveCategory(), true)


  });
if(IS_TABLET){
  // d3.select("body").style("height", function(){ return d3.select("#contents").node().getBoundingClientRect().height})
}else{
  d3.select("body").style("height", function(){ return d3.select("#chart").node().getBoundingClientRect().height + 30})
}


}

drawChart()



    // $(".styled-select.states").on("click",function () {
    //     var element = $(this).children("select")[0],
    //         worked = false;
    //     if(document.createEvent) { // all browsers
    //         var e = document.createEvent("MouseEvents");
    //         e.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false,false, false, false, 0, null);
    //         worked = element.dispatchEvent(e);
    //     } else if (element.fireEvent) { // ie
    //         worked = element.fireEvent("onmousedown");
    //     }
    //     if (!worked) { // unknown browser / error
    //         console.log("There was an error with the dropdown menu");
    //     }
    // });
// $(".styled-select.states").on("update", function(){
//   console.log(this)
// })
$( function() {
  $( "#state-selector" ).selectmenu({
    change: function(event, data){

    }
  });
});


$(window).on("resize",function(){
  drawChart();
})  


function toggle_visibility(id) {
    var e = document.getElementById(id);
    if (e.style.display == 'inline-block')
        e.style.display = 'none';
    else
        e.style.display = 'inline-block';
}

$(function () {
    var shrinkHeader = 200;
    $(window).scroll(function () {
        var scroll = getCurrentScroll();
        if (scroll >= shrinkHeader) {
            $('#header-pinned').addClass('is-visible');
        } else {
            $('#header-pinned').removeClass('is-visible');
        }
    });

    function getCurrentScroll() {
        return window.pageYOffset || document.documentElement.scrollTop;
    }
});