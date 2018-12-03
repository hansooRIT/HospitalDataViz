let stateMap = new Map();
let stateScoreMap = new Map();
let exceptionMap = new Map();
let derivedDataSet = [];
let treatmentTypeMap = new Map();
let treatmentScore = new Map();
let treatmentOccurence = new Map();
let treatmentDataSet = [];

let dataset;
let xScale, yScale;
let xAxis, yAxis;
let xAxisGroup, yAxisGroup;

function rowConverter(row) {
    return {
        provider_id: row.provider_id,
        hospital_name: row.hospital_name,
        city: row.city,
        state: row.state,
        zip: row.zip,
        county: row.county,
        measure_id: row.measure_id,
        measure_name: row.measure_name,
        score: parseFloat(row.score),
        footnote: row.footnote,
    }
}

function generateStateCount(dataset) {
    for (let i = 0; i < dataset.length; i++) {
        let row = dataset[i];
        let state = row.state;
        if (stateMap.has(state)) {
            stateMap.set(state, stateMap.get(state) + 1);
        }
        else {
            stateMap.set(state, 1);
        }
    }
    stateCount = Array.from(stateMap.values());
}

//Calculate the average score per state.
function calculateStateAverageScore(dataset) {
    //Populate a string array of keys to access for averaging calculation.
    let states = [];
    //For loop to populate the state score map with the sum of all scores for that state.
    for (let i = 0; i < dataset.length; i++) {
        let row = dataset[i];
        let state = row.state;
        let score = row.score;
        if (stateScoreMap.has(state)) {
            stateScoreMap.set(state, stateScoreMap.get(state) + score);
        }
        else {
            stateScoreMap.set(state, score);
            states.push(state);
        }
    }
    //For loop to calculate the average using the total number of entries per state and the calculated sum of the scores per state.
    for (let j = 0; j < states.length; j++) {
        let denominator = stateMap.get(states[j]) - exceptionMap.get(states[j]);
        if (denominator != 0) {
            stateScoreMap.set(states[j], stateScoreMap.get(states[j])/denominator);
        }
        else {
            stateScoreMap.set(states[j], stateScoreMap.get(states[j])/stateMap.get(states[j]));
        }
        
    }
}

function calculateScoreExceptions(dataset) {
    for (let i = 0; i < dataset.length; i++) {
        let row = dataset[i];
        let state = row.state;
        let note = row.footnote;
        if (note != 'N/A') {
            if (exceptionMap.has(state)) {
                exceptionMap.set(state, exceptionMap.get(state) + 1);
            }
            else {
                exceptionMap.set(state, 1);
            }
        }
    }
}

function calculateStateTreatmentType(dataset) {
    for (let i = 0; i < dataset.length; i++) {
        let row = dataset[i];
        let state = row.state;
        let treatment = row.measure_id;
        if (treatmentTypeMap.has(treatment)) {
            if (treatmentTypeMap.get(treatment).has(state)) {
                treatmentTypeMap.get(treatment).set(state, treatmentTypeMap.get(treatment).get(state) + 1);
            }
            else {
                treatmentTypeMap.get(treatment).set(state, 1);
            }
        }
        else {
            treatmentTypeMap.set(treatment, new Map());
            treatmentTypeMap.get(treatment).set(state, 1);
        }    
    }
}

function calculateTreatmentScores(dataset) {
    for (let i = 0; i < dataset.length; i++) {
        let row = dataset[i];
        let treatment = row.measure_name;
        let score = row.score;
        if (treatmentScore.has(treatment)) {
            treatmentScore.set(treatment, treatmentScore.get(treatment) + score);
            treatmentOccurence.set(treatment, treatmentOccurence.get(treatment) + 1);
        }
        else {
            treatmentScore.set(treatment, score);
            treatmentOccurence.set(treatment, 1);
        }    
    }
    for (let entry of treatmentScore) {
        let [key, value] = entry;
        let occurence = treatmentOccurence.get(key);
        treatmentScore.set(key, value/occurence);
    }
    console.log(treatmentScore);
}

function deriveData() {
    for (let entry of stateMap) {
        let [key, value] = entry;
        let score = stateScoreMap.get(key);
        let exceptions = exceptionMap.get(key);
        let treatments = [];
        for (let treatment of treatmentTypeMap) {
            treatments.push(treatment[1].get(key));
        }
        if (exceptions != 'undefined') {
            derivedDataSet.push({state: key, count: value, score: score, exceptions: exceptions, treatments: treatments});
        }
        else {
            derivedDataSet.push({state: key, count: value, score: score, exceptions: 0, treatments: treatments});
        }
    }
}

function deriveTreatmentData() {
    for (let entry of treatmentScore) {
        let [key, value] = entry;
        treatmentDataSet.push({treatment: key, score: value});
    }
}

//Create a scatter plot of cases per state vs average CT score of state
function makeChart1(dataset) {
    let w = 600;
    let h = 400;

    let scoreMin = d3.min(dataset, (d) => d.score);
    let scoreMax = d3.max(dataset, (d) => d.score);
    let countMin = d3.min(dataset, (d) => d.count);
    let countMax = d3.max(dataset, (d) => d.count);
    
    let xScale = d3.scaleLinear()
        .domain([scoreMin, scoreMax])
        .rangeRound([50, w - 20]);
    
    let yScale = d3.scaleLinear()
        .domain([countMin, countMax])
        .rangeRound([h - 20, 20]);
    
    let chart1 = d3.select("#chart1")
        .attr('width', w)
        .attr('height', h);
    
    chart1.selectAll('circle')
        .data(dataset)
        .enter()
        .append('circle')
        .attr('cx', (d) => xScale(d.score))
        .attr('cy', (d) => yScale(d.count))
        .attr('fill', 'black')
        .attr('r', (d) => 4)
        .on("mouseover", function(d) {
            d3.select(this)
                .transition()
                .duration(200)
                .style("fill", "#42cbf4")
            d3.select("#state")
                .text("State: " + d.state)
            d3.select("#count")
                .text("Number of hospital uses of medical imaging tests: " + d.count);
            d3.select("#score")
                .text("Average cardiac calcium score: " + d.score);
            d3.select("#tooltip")
                .style("left", "650px")
                .style("top", "250px")
                .classed("hidden", false)
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .transition()
                .duration(200)
                .style("fill", "black");
            d3.select("#tooltip")
                .classed("hidden", true);
        });
    
    xAxis = d3.axisBottom(xScale);
    yAxis = d3.axisLeft(yScale);
    
    // AXES
    xAxisGroup = chart1.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0, ${h - 20})`)
        .call(xAxis);

    yAxisGroup = chart1.append('g')
        .attr('class', 'axis-left1')
        .attr('transform', `translate(50,0)`)
        .call(yAxis);
}


//Create bar graph of number of data points per state.
function makeChart2(dataset) {
    let w = stateMap.size * 18;
    let h = 400;
    
    let chart2 = d3.select('#chart2')
        .attr('width', w)
        .attr('height', h);
    
    dataset.sort((a, b) => b.count - a.count);
    
    let countMin = d3.min(dataset, (d) => d3.min(d.treatments));
    let countMax = d3.max(dataset, (d) => d.count);
    
    let xScale = d3.scaleBand()
        .domain(dataset.map((d) => d.state))
        .rangeRound([50, w - 20]);
    
    let yScale = d3.scaleLinear()
        .domain([countMin, countMax])
        .rangeRound([h - 20, 20]);

    // d3 allows scaling between colors
    let colorScale = d3.scaleLinear()
        .domain([0, countMax])
        .range(['#ccf', '#88d']);

    chart2.selectAll('rect')
        .data(dataset)
        .enter()
        .append('rect')
        .classed('bar', true)
        .attr('x', (d) => xScale(d.state))
        .attr('y', (d) => yScale(d.count))
        .attr('width', 16)
        .attr('height', (d) => (h - 20) - yScale(d.count))
        .attr('fill', (d) => colorScale(d.count))
        .on("mouseover", function(d) {
            d3.select(this)
                .transition()
                .duration(200)
                .style("fill", "#032f75")
            d3.select("#state")
                .text("State: " + d.state)
            d3.select("#count")
                .text("Number of hospital uses of medical imaging tests: " + d.count);
            d3.select("#score")
                .text("Average cardiac calcium score: " + d.score);
            d3.select("#tooltip")
                .style("left", "650px")
                .style("top", "750px")
                .classed("hidden", false)
        })
        .on("mouseout", function(d) {
             d3.select(this)
                .transition()
                .duration(200)
                .style("fill", colorScale(d.count));
            d3.select("#tooltip")
                .classed("hidden", true);
        });

    xAxis = d3.axisBottom(xScale);
    yAxis = d3.axisLeft(yScale)

    // AXES
    xAxisGroup = chart2.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0, ${h - 20})`)
        .call(xAxis);

    yAxisGroup = chart2.append('g')
        .attr('class', 'axis-left1')
        .attr('transform', `translate(50,0 )`)
        .call(yAxis);
}

//Creates bar graph of data points with footnotes denoting exceptions
function makeChart3(dataset) {
    let w = stateMap.size * 18;
    let h = 400;
    
    let chart3 = d3.select('#chart3')
        .attr('width', w)
        .attr('height', h);
    
    dataset.sort((a, b) => b.exceptions - a.exceptions);
    
    let exceptionMin = d3.min(dataset, (d) => d.exceptions);
    let exceptionMax = d3.max(dataset, (d) => d.exceptions);
    
    let xScale = d3.scaleBand()
        .domain(dataset.map((d) => d.state))
        .rangeRound([50, w - 20]);
    
    let yScale = d3.scaleLinear()
        .domain([exceptionMin, exceptionMax])
        .rangeRound([h - 20, 20]);

    // d3 allows scaling between colors
    let colorScale = d3.scaleLinear()
        .domain([0, exceptionMax])
        .range(['#c0d0ea', '#516fa0']);

    chart3.selectAll('rect')
        .data(dataset)
        .enter()
        .append('rect')
        .classed('bar', true)
        .attr('x', (d) => xScale(d.state))
        .attr('y', (d) => yScale(d.exceptions))
        .attr('width', 16)
        .attr('height', (d) => (h - 20) - yScale(d.exceptions))
        .attr('fill', (d) => colorScale(d.exceptions))
        .on("mouseover", function(d) {
            d3.select(this)
                .transition()
                .duration(200)
                .style("fill", "#032f75")
            d3.select("#state")
                .text("State: " + d.state)
            d3.select("#count")
                .text("Number of exception cases: " + d.exceptions);
            d3.select("#score")
                .text("");
            d3.select("#tooltip")
                .style("left", "650px")
                .style("top", "1250px")
                .classed("hidden", false)
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .transition()
                .duration(200)
                .style("fill", colorScale(d.exceptions));
            d3.select("#tooltip")
                .classed("hidden", true);
        });
    ;

    xAxis = d3.axisBottom(xScale);
    yAxis = d3.axisLeft(yScale)

    // AXES
    xAxisGroup = chart3.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0, ${h - 20})`)
        .call(xAxis);

    yAxisGroup = chart3.append('g')
        .attr('class', 'axis-left1')
        .attr('transform', `translate(50,0 )`)
        .call(yAxis);
}

//Creates a bar graph with average scores of treatment types
function makeChart4(dataset) {
    let w = 600;
    let h = 400;
    
    console.log(dataset);
    
    let chart4 = d3.select('#chart4')
        .attr('width', w)
        .attr('height', h);
    
    dataset.sort((a, b) => b.score - a.score);
    
    let scoreMin = d3.min(dataset, (d) => d.score);
    let scoreMax = d3.max(dataset, (d) => d.score);
    
    let xScale = d3.scaleLinear()
        .domain([0, scoreMax])
        .rangeRound([0, w - 20]);
    
    let yScale = 
    d3.scaleBand()
        .domain(dataset.map((d) => d.treatment))
        .rangeRound([h - 20, 20]);

    // d3 allows scaling between colors
    let colorScale = d3.scaleLinear()
        .domain([0, scoreMax])
        .range(['#ccf', '#88d']);

    chart4.selectAll('rect')
        .data(dataset)
        .enter()
        .append('rect')
        .attr('x', (d) => 5)
        .attr('y', (d) => yScale(d.treatment))
        .attr('width', (d) => xScale(d.score))
        .attr('height', 40)
        .attr('fill', (d) => colorScale(d.score))
        .on("mouseover", function(d) {
            d3.select(this)
                .transition()
                .duration(200)
                .style("fill", "#032f75")
            d3.select("#state")
                .text("Imaging type: " + d.treatment)
            d3.select("#count")
                .text("");
            d3.select("#score")
                .text("Average cardiac calcium score: " + d.score);
            d3.select("#tooltip")
                .style("left", "650px")
                .style("top", "1750px")
                .classed("hidden", false)
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .transition()
                .duration(200)
                .style("fill", colorScale(d.score));
            d3.select("#tooltip")
                .classed("hidden", true);
        });
    ;
        

    chart4.selectAll('text')
       .data(dataset)
       .enter()
       .append('text')
       .attr('text-anchor', 'left')
       .attr('font-size', 15)
       .attr('x', (d) => 7)
       .attr('y', (d) => yScale(d.treatment) - 6)
       .text((d) => `${d.treatment}`); 
    
    xAxis = d3.axisBottom(xScale);
    yAxis = d3.axisLeft(yScale)

    // AXES
    xAxisGroup = chart4.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(5, ${h - 20})`)
        .call(xAxis);

    yAxisGroup = chart4.append('g')
        .attr('class', 'axis-left1')
        .attr('transform', `translate(5,0)`)
        .call(yAxis);
}

window.onload = function() {
  d3.csv('hospital_imaging_data-new.csv', rowConverter)
    .then((d) => {
      dataset = d;
      generateStateCount(dataset);
      calculateScoreExceptions(dataset);
      calculateStateAverageScore(dataset);
      calculateStateTreatmentType(dataset);
      calculateTreatmentScores(dataset);
      deriveData();
      deriveTreatmentData();
      makeChart1(derivedDataSet);
      makeChart2(derivedDataSet);
      makeChart3(derivedDataSet);
      makeChart4(treatmentDataSet);
  })
}
