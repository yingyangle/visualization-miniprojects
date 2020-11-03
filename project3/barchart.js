const data = {
	data: [],
	school: '',
	selectedGender: null,
	selectedAddress: null,
}
 
const labelsDict = {
	'F': 'Female',
	'M': 'Male',
	'U': 'Urban', 
	'R': 'Rural'
}

let outerWidth = 600
let outerHeight = 400
let margin = {top:40, right:40, bottom: 80, left: 40} 
let width = outerWidth - margin.left - margin.right
let height = outerHeight - margin.top - margin.bottom

function createBarchart(container) {
	const svg = d3.select(container)
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)

	const g = svg.append('g')
		.attr('transform', `translate(${margin.left},${margin.top})`)

	const xScale = d3.scaleBand()
		.range([0, width])
	const yScale = d3.scaleLinear()
		.range([height, 0])

	const xAxis = d3.axisBottom()
		.scale(xScale)
	const yAxis = d3.axisLeft()
		.scale(yScale)
		.ticks(6)
	
	const xAxisGroup = g.append('g')
		.attr('class', 'x axis')
	const yAxisGroup = g.append('g')
		.attr('class', 'y axis')

	function update(new_data, avg_container) {
		new_data = new_data.slice(0,5)
		console.log('bar', new_data)
		xScale.domain([1,2,3,4,5])
		yScale.domain([0, d3.max(new_data, d => d.length)])
		xAxisGroup.transition()
			.transition()
			.duration(0)
			.attr('transform', `translate(0, ${height})`)
			.call(xAxis)
		yAxisGroup.transition()
			.call(yAxis)

			let rect = g.selectAll('rect')
			.data(new_data)
			.join(
			  enter => {
				let rect_enter = enter
				  .append('rect')
				  // .attr('x', d => d.x0)
				  .attr('x', function(d) {
					console.log(d.x0, d.length, yScale(d.length), height - yScale(d.length))
					return xScale(d.x0)
				  })
				  .attr('y', d => yScale(d.length))
				  .attr('width', 0)
				  .attr('height', d => height - yScale(d.length))
				  .on('mouseenter', (event, d) => {
					// show tooltip on hover
					let pos = d3.pointer(event, window)
					console.log('pos', pos)
					
					var tooltip = d3.select('.tooltip')
					.style('display', 'block')
					.style('position', 'fixed')
					.style("background-color", "black")
					.style("color","white")
					.style("border", "solid")
					.style("border-width", "1px")
					.style("border-radius", "5px")
					.style("padding", "10px")
					.style('top', pos[1] + "px")
					.style('left', pos[0] + "px")
					.html("<p id='tooltip'>Alcohol Consumption: " + d.x0 + "<br> # Students: " + d.length+ "</p>");
					
					console.log(d.length);
				  })
				  .on('mouseleave', (event, d) => { 
					// hide tooltip on hover out
					d3.select('.tooltip').style('display', 'none');
				  })
				rect_enter.append('title')
				return rect_enter
			  },
			  update => update,
			  exit => exit.remove()
			)

		rect.transition()
			.attr('height', d => height - yScale(d.length))
			.attr('width', 94)
			.attr('x', d => xScale(d.x0) + 5)
			.attr('y', d => yScale(d.length))

		rect.select('title').text(d => `Alcohol Consumption: ${d.x0}\n# Students: ${d.length}`)
		
		// y axis label		
		svg.append('text')
			.attr('x', 0)
			.attr('y', 20)
			.text('Number of Students')
		
		// x axis labels	
		svg.append('text')
			.attr('x', 0)
			.attr('y', height + 80)
			.text('Low Alcohol Consumption')
		svg.append('text')
			.attr('x', width - 100)
			.attr('y', height + 80)
			.text('High Alcohol Consumption')

		// average alcohol consumption
		let sum = new_data.map((d,i) => d.length * (i+1))
			.reduce((a,b) => a + b) 
		let num_items = new_data.map((d,i) => d.length)
			.reduce((a,b) => a + b) 
		d3.select(avg_container)
			.html(Math.round(sum * 100 / num_items) / 100)
	}

	return update
}

function createPieChart(container, dataAttr, color) {
	const margin = 30
	const radius = 100

	const svg = d3.select(container)
	.attr('width', radius * 2 + margin * 2)
	.attr('height', radius * 2 + margin * 2)

	const g = svg.append('g').
	attr('transform', `translate(${radius + margin}, ${radius + margin})`)

	const pie = d3.pie()
	.value(d => d.values.length)
	.sortValues(null)
	.sort(null)
	const arc = d3.arc()
	.outerRadius(radius)
	.innerRadius(0)
	const noSlice = [
	{ startAngle: 0, endAngle: Math.PI * 2, padAngle: 0 },
	{ startAngle: 0, endAngle: 0, padAngle: 0 },
	]
	
	const colorScale = d3.scaleOrdinal(color)
	
	let labels = dataAttr == 'selectedGender' ? ['Female', 'Male'] : ['Urban', 'Rural']
	
	// legend boxes
	svg.append('g').selectAll('rect')
			.data(labels)
			.enter()
			.append('rect')
			.attr('class', 'box')
			.attr('height', 10) 
			.attr('width', 10) 
			.attr('x', (d,i) => 50 + i * 120)
			.attr('y', 2 * radius + margin + 10)
			.attr('fill', (d,i) => color[i])
	
	// legend labels
	svg.append('g').selectAll('text')
	.data(labels)
	.enter()
	.append('text')
	.text(d => d)
	.attr('x', (d,i) => 64 + i * 120)
	.attr('y', 2 * radius + margin + 20)
	.attr('font-size', '12px')
	// .attr('fill', '#6d6d6d')
	.attr('font-family', 'Lucida Grande')
	.attr('text-anchor', 'beginning')

	function update(new_data) {
		console.log('pie', new_data)
		const pied = pie(new_data)
		colorScale.domain(new_data.map(d => d.key))

		// DATA JOIN
		const old = g.selectAll('path').data()

		function tweenArc(d, i) {
			const interpolate = d3.interpolateObject(old[i], d)
			return (t) => arc(interpolate(t))
		}

		const path = g
			.selectAll('path')
			.data(pied, d => d.data.key)
			.join(
			enter => {
				const path_enter = enter
				.append('path')
				.attr('d', (d, i) => arc(noSlice[i]))
				.on('click', (e, d) => {
					if (data[dataAttr] === d.data.key) {
					data[dataAttr] = null
					} else {
					data[dataAttr] = d.data.key
					}
					updateApp()
				})
				path_enter.append('title')
				return path_enter
			},
			update => update,
			exit => exit.transition().attrTween('d', tweenArc).remove()
			)
		path.classed('selected', d => d.data.key === data.selectedGender)
			.transition()
			.attrTween('d', tweenArc)
			.style('fill', d => colorScale(d.data.key))

		path.select('title').text(d => `${labelsDict[d.data.key]}: ${d.data.values.length} students`)
	}

	return update
}

const genderPieChart = createPieChart('#gender', 'selectedGender', ['#F6C7C2', '#AAD3D8'])
const addressPieChart = createPieChart('#address', 'selectedAddress', ['#C3AFD2', '#fad89e'])
const alcWeekday = createBarchart('#alc-weekday')
const alcWeekend = createBarchart('#alc-weekend')

function filterData() {
	return data.data.filter(d => {
		if (data.school && d.school !== data.school) {
			return false
		}
		if (data.selectedGender && d.sex !== data.selectedGender) {
			return false
		}
		if (data.selectedAddress && d.address !== data.selectedAddress) {
			return false
		}
		return true
	})
}

function wrangleData(filtered) {
	const alcWeekend = d3.bin()
		.domain([1, 6])
		.thresholds([0, 1, 2, 3, 4, 5, 6])
		.value(d => d.Walc)
	const alcWeekendData = alcWeekend(filtered)

	const genderPieData = ['F', 'M'].map((key) => ({
		key,
		values: filtered.filter(d => d.sex === key),
	}))

	const alcWeekday = d3.bin()
		.domain([1, 6])
		.thresholds([0, 1, 2, 3, 4, 5, 6])
		.value(d => d.Dalc)
	const alcWeekdayData = alcWeekday(filtered)

	const addressPieData = ['U', 'R'].map((key) => ({
	key,
	values: filtered.filter(d => d.address === key),
	}))

	return {
		alcWeekendData,
		genderPieData,
		alcWeekdayData,
		addressPieData,
	}
}

function updateApp() {
	
	const filtered = filterData()
	const { alcWeekendData, genderPieData, alcWeekdayData, addressPieData } = wrangleData(filtered)
	
	alcWeekend(alcWeekendData, '#alc-weekend-avg')
	genderPieChart(genderPieData)
	alcWeekday(alcWeekdayData, '#alc-weekday-avg')
	addressPieChart(addressPieData)
	d3.select('#selectedGender').text(labelsDict[data.selectedGender] || 'None')
	d3.select('#selectedAddress').text(labelsDict[data.selectedAddress] || 'None')
}

d3.csv('data/student-combined.csv').then((parsed) => {
	data.data = parsed.map((row) => {
	row.walc = parseInt(row.walc)
	row.dalc = parseFloat(row.dalc)
		return row
	})
	updateApp()
})

d3.select('#school').on('change', function () {
	const selected = d3.select(this).property('value')
	data.school = selected
	updateApp()
})