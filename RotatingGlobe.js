// const width = 1300;
// const height = 800;

const width = document.documentElement.clientWidth;
const height = document.documentElement.clientHeight;

const scaleFactor = 0.7;
const colorLand = '#ffffff';
const colorWater = '#a4c7db'
const colorMarker = '#b80000'
const colorLine = 'grey'
const colorText = '#000000'

const config = {
  speed: 0.015,
  verticalTilt: -30,
  horizontalTilt: -15,
}

const translateX = 150;
const translateY = 150;

const svg = d3.select('#chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

const markerGroup = svg.append('g');
// var ctext = svg.append('g')
//     .attr('id', 'text')
const projection = d3.geoOrthographic();
const initialScale = projection.scale((scaleFactor * Math.min(width, height)) / 2);
const path = d3.geoPath().projection(projection);
const center = [480, 250];

var coordinates = [];

d3.csv("RotatingGlobe.csv", function(data){
    for(var i = 0; i < data.length; i++){
        coordinates.push(data[i])
    }
    drawGlobe();    
    drawGraticule();
    enableRotation();  
    drawBackground();

})

function drawBackground(){
    svg.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width)
    .attr('height', height)
    .attr('fill', "grey")

    svg.append('circle')
    .attr('cx', 480 + translateX)
    .attr('cy', 250 + translateY)
    .attr('r', (scaleFactor * Math.min(width, height)) / 2)
    .attr('fill', colorWater)
}

function drawMarkers() {
    var markers = markerGroup.selectAll('circle')
        .data(coordinates);

    var ctext = markerGroup.selectAll('text')
        .data(coordinates)
        .enter()
        .append("text")
        // .merge(ctext)
        .attr("class", "text")
        .text(function(d,i){
            return d.title
        })
        .attr("x", d => projection([d.longitude, d.latitude])[0])
        .attr("y", d => projection([d.longitude, d.latitude])[1])
        .attr("transform", "translate(" + translateX + ", "+ translateY + ")");


    markers.enter()
        .append('line')
        .attr('x1', d => projection([d.longitude, d.latitude])[0])
        .attr('y1', d => projection([d.longitude, d.latitude])[1])
        .attr('x2', d => projection([d.longitude, d.latitude])[0])
        .attr('y2', d => projection([d.longitude, d.latitude])[1] + d3.randomUniform(3, 15))
        .attr('stroke', colorLine)
        .attr("transform", "translate(" + translateX + ", "+ translateY + ")");

    markers.enter()
        .append('circle')
        .merge(markers)
        .attr('cx', d => projection([d.longitude, d.latitude])[0])
        .attr('cy', d => projection([d.longitude, d.latitude])[1])
        .attr('fill', '#888')
        .attr('fill', d => {
            const coordinate = [d.longitude, d.latitude];
            gdistance = d3.geoDistance(coordinate, projection.invert(center));
            return gdistance > 1.57 ? 'none' : colorMarker;
        })
        .attr('r', 5)
        .attr("transform", "translate(" + translateX + ", "+ translateY + ")");

    markerGroup.each(function () {
        this.parentNode.appendChild(this);
    });
}


function drawGlobe() {  
    d3.queue()
        .defer(d3.json, 'https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-110m.json')          
        // .defer(d3.json, 'locations.json')
        .await((error, worldData, locationData) => {
            svg.selectAll(".segment")
                .data(topojson.feature(worldData, worldData.objects.countries).features)
                .enter().append("path")
                .attr("class", "segment")
                .attr("d", path)
                .style("stroke", "#888")
                .style("stroke-width", "1px")
                .style("fill", (d, i) => colorLand)
                .style("opacity", "0.9")
                .attr("transform", "translate(" + translateX + ", "+ translateY + ")");


                drawMarkers();                   
        });
}

function drawGraticule() {
    const graticule = d3.geoGraticule()
        .step([10, 10]);

    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path)
        .style("fill", "#fff")
        .style("stroke", "#ccc")
        .attr("transform", "translate(" + translateX + ", "+ translateY + ")");
}

function enableRotation() {
    d3.timer(function (elapsed) {

        projection.rotate([config.speed * elapsed - 120, config.verticalTilt, config.horizontalTilt]);
        

        svg.selectAll("path")
        .attr("d", path);

        svg.selectAll("text")
        .attr("x", d => projection([d.longitude, d.latitude])[0])
        .attr("y", d => projection([d.longitude, d.latitude])[1] - 30)
        // .style("font-size", 20)
        .attr("text-anchor", "middle")
        .attr('fill', d => {
            const coordinate = [d.longitude, d.latitude];
            gdistance = d3.geoDistance(coordinate, projection.invert(center));
            return gdistance > 1.57 ? 'none' : colorText;
        })

        svg.selectAll("line")
        .attr('x1', d => projection([d.longitude, d.latitude])[0])
        .attr('y1', d => projection([d.longitude, d.latitude])[1])
        .attr('x2', d => projection([d.longitude, d.latitude])[0])
        .attr('y2', d => projection([d.longitude, d.latitude])[1] - 30)
        .attr('stroke', d => {
            const coordinate = [d.longitude, d.latitude];
            gdistance = d3.geoDistance(coordinate, projection.invert(center));
            return gdistance > 1.57 ? 'none' : colorLine;
        })

        // .text(function(d) {
        // if (((([d.longitude, d.latitude])[0]  > -90) && (([d.longitude, d.latitude])[0]  <90)) ||
        //     ((([d.longitude, d.latitude])[0]  > 270) && (([d.longitude, d.latitude])[0]  <450))) 
        //   return d.title; 
        //     else return "" });

        drawMarkers();
    });
}        

