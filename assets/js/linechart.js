
/* eslint-disable no-undef */
const fadeIn = (...els) => {
  els.forEach(el => {
    el
      .transition()
      .duration(300)
      .style('opacity', 1)
  })
}
const fadeOut = (...els) => {
  els.forEach(el => {
    el
      .transition()
      .duration(300)
      .style('opacity', 0)
  })
}

// socket.on('visualData')

// const adjustImage = () => {

// }

class LineChartD3 {
  constructor (title, key, parent, width, height, timeformat = '%M:%S', good = { min: 0, max: 0 }) {
    this.title = title
    this.data = []
    this.key = key
    this.width = width
    this.height = height
    this.margin = { top: 20, right: 30, bottom: 30, left: 40 }
    this.ticks = 5
    this.parent = parent
    this.timeformat = timeformat
    this.zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [this.width, this.height]])
      .on('zoom', this.zoomed.bind(this))

    this.minGood = good.min
    this.maxGood = good.max

    this.createContainer()

    this.createAxis()

    this.createLine()

    this.createLabels()
  }

  createContainer () {
    this.container = d3.select(this.parent)
      .append('div')
      .attr('class', 'col chart')
      .style('width', this.width)

    this.title = this.container
      .append('h1')
      .attr('class', this.key + 'Title')
      .text(this.title)

    this.container
      .append('div')
      .attr('class', 'sizeBtn')
      .on('click', (e) => {
        this.container.classed('w-100', !this.container.classed('w-100'))
      })
      .append('svg')
      .attr('width', 25)
      .attr('height', 25)
      .attr('viewBox', '0 0 24 24')
      .append('polygon')
      .attr('fill', 'white')
      .attr('points', '21,11 21,3 13,3 16.29,6.29 6.29,16.29 3,13 3,21 11,21 7.71,17.71 17.71,7.71')

    this.svg = this.container
      .append('svg')
      .attr('class', this.key)
      .attr('viewBox', [0, 0, this.width, this.height])
      .call(this.zoom.bind(this))

    this.svg
      // .append("defs")
      .append('svg:clipPath')
      .attr('id', 'clip' + this.key)
      .append('svg:rect')
      .attr('class', 'clip-rect' + this.key)
      .attr('x', this.margin.left)
      .attr('y', this.margin.top)
      .attr('width', this.width - (this.margin.left + this.margin.right))
      .attr('height', this.height - (this.margin.bottom + this.margin.top))
      .attr('fill', 'green')
      .attr('pointer-events', 'none')

    this.chart = this.svg.append('g')
      .attr('clip-path', 'url(#clip' + this.key + ')')
  }

  createAxis () {
    // Initialise a X axis:
    this.x = d3.scaleTime().range([this.margin.left, this.width - (this.margin.right)])
    this.xAxis = d3.axisBottom(this.x).tickFormat(d3.timeFormat(this.timeformat)).ticks(this.ticks)

    this.svg.append('g')
      .attr('class', 'gxLabel')
      .attr('stroke-width', 2)
      .attr('transform', `translate(0,${this.height - (this.margin.bottom)})`)
      .call(this.xAxis)

    // Initialize an Y axis
    this.y = d3.scaleLinear()
      .range([this.height - (this.margin.bottom), this.margin.top])

    this.yAxis = d3.axisLeft(this.y).ticks(8)

    this.svg.append('g')
      .attr('class', 'gyLabel')
      .attr('stroke-width', 2)
      .attr('transform', `translate(${this.margin.left},0)`)
      .call(this.yAxis)

    this.xAxisGrid = d3.axisBottom(this.x).tickSize(-(this.height - this.margin.bottom)).tickFormat('')
    this.yAxisGrid = d3.axisLeft(this.y).tickSize(-this.width).tickFormat('').ticks(8)

    this.chart.append('g')
      .attr('class', 'gridXLabel')
      .style('stroke-dasharray', ('3,3'))
      .attr('transform', `translate(0,${this.height - (this.margin.bottom)})`)
      .call(this.xAxisGrid)

    this.chart.append('g')
      .attr('class', 'gridYLabel')
      .style('stroke-dasharray', ('3,3'))
      .attr('transform', `translate(${this.margin.left},0)`)
      .call(this.yAxisGrid)

    this.goodValue = this.chart
      .insert('g', '.mouseOverlay')
      .attr('fill', 'green')
      .attr('fill-opacity', 0.1)
      .attr('class', 'goodValue')
      .append('rect')
      .attr('x', 0)
  }

  createLine () {
    this.rawLine = d3.line()
      .x(d => this.x(d.x))
      .y(d => this.y(d.y))

    this.smoothLine = d3.line()
      .curve(d3.curveBasis)
      .x(d => this.x(d.x))
      .y(d => this.y(d.y))

    this.rawLineChart = this.chart
      .append('path')
      .datum(this.data)
      .attr('class', 'rawLine')
      .attr('fill', 'none')
      .attr('stroke', '#ff0000')
      .attr('stroke-width', 1)
      .attr('d', this.rawLine)
      .style('opacity', '0.2')

    this.lineChart = this.chart
      .append('path')
      .datum(this.data)
      .attr('class', 'smoothLine')
      .attr('fill', 'none')
      .attr('stroke', '#0000ff')
      .attr('stroke-width', 3)
      .attr('d', this.smoothLine)
  }

  createLabels () {
    this.zoomPercent = this.chart.append('text')
      .attr('x', this.width - this.margin.right)
      .attr('y', this.margin.bottom + this.margin.top / 2)
      .attr('text-anchor', 'end')
      .attr('class', 'zoomPercent')
      .text('100%')

    this.mouseG = this.chart.append('g')
      .attr('class', 'mouseOverlay')

    this.mouseG.on('mouseover', (e) => {
      fadeIn(this.mouseG, this.zoomPercent)
    })
    this.mouseG.on('mouseout', (e) => {
      fadeOut(this.mouseG, this.zoomPercent)
    })

    this.mousePerLine = this.mouseG.append('path')
      .attr('class', 'mouse-line')
      .style('stroke', 'white')
      .style('stroke-width', '1px')

    this.mouseG.append('svg:rect')
      .attr('x', this.margin.left)
      .attr('y', this.margin.top)
      .attr('width', this.width - (this.margin.left + this.margin.right))
      .attr('height', this.height - (this.margin.top + this.margin.bottom))
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mousemove', this.mouseMove.bind(this))

    this.mouseG
      .data([{ x: 0, y: 0 }])
      .enter()
      .append('g')
      .attr('class', 'mouse-line')
      .attr('id', 'mpl')

    this.labelGroup = this.mouseG.append('g')
      .attr('class', 'label_group')
      .attr('pointer-events', 'none')

    this.circleRad = 7
    this.labelWidth = 50
    this.labelHeight = 50

    this.labelBg = this.labelGroup
      .append('rect')
      .attr('width', this.labelWidth)
      .attr('height', this.labelHeight)
      .attr('class', 'label-bg')
      .attr('rx', 10)
      .attr('ry', 10)
      .attr('transform', `translate(${-(this.labelWidth / 2)},${-(this.labelHeight + this.circleRad)})`)

    this.circle = this.labelGroup
      .append('circle')
      .attr('r', this.circleRad)
      .attr('class', 'data_circle')
      .style('stroke', 'none')
      .style('fill', '#fff')

    this.dataLabel = this.labelGroup.append('text')
      .attr('class', 'data_label')
      .attr('transform', `translate(0, ${-(this.labelHeight / 1.5) - this.circleRad / 2})`)
      .attr('text-anchor', 'middle')
      .style('font-size', 10)

    this.timeLabel = this.labelGroup.append('text')
      .attr('class', 'time_label')
      .attr('transform', `translate(0, ${-(this.labelHeight / 3) - this.circleRad / 2})`)
      .attr('text-anchor', 'middle')
      .style('font-size', 8)
  }

  zoomed (event) {
    this.zoomEvent = event

    this.zoomPercent.text(() => {
      return (event.transform.k * 100).toFixed(0) + '%'
    })

    this.circle
      .attr('r', 7 / event.transform.k)
      .style('stroke-width', 2 / event.transform.k)

    this.dataLabel
      .style('font-size', 10 / event.transform.k)
      .attr('transform', `translate(0, ${(-(this.labelHeight / 1.5) - this.circleRad / 2) / event.transform.k})`)
    this.timeLabel
      .style('font-size', 8 / event.transform.k)
      .attr('transform', `translate(0, ${(-(this.labelHeight / 3) - this.circleRad / 2) / event.transform.k})`)

    this.labelBg
      .attr('width', this.labelWidth / event.transform.k)
      .attr('height', this.labelHeight / event.transform.k)
      .attr('rx', 10 / event.transform.k)
      .attr('ry', 10 / event.transform.k)
      .attr('transform', `translate(${-(this.labelWidth / 2) / event.transform.k},${-(this.labelHeight + this.circleRad) / event.transform.k})`)
    this.svg.select('.mouse-line')
      .style('stroke-width', 1 / event.transform.k)

    this.lineChart
      .attr('transform', event.transform)
      .style('stroke-width', 2 / event.transform.k)

    this.rawLineChart
      .attr('transform', event.transform)
      .style('stroke-width', 2 / event.transform.k)

    this.mouseG
      .attr('transform', event.transform)

    this.svg.select('.gxLabel')
      .transition()
      .duration(500)
      .call(this.xAxis.scale(event.transform.rescaleX(this.x)))

    this.svg.select('.gyLabel')
      .transition()
      .duration(500)
      .call(this.yAxis.scale(event.transform.rescaleY(this.y)))

    this.svg.select('.gridXLabel')
      .transition()
      .ease(d3.easeSinOut)
      .duration(200)
      .call(this.xAxisGrid.scale(event.transform.rescaleX(this.x)))

    this.svg.select('.gridYLabel')
      .transition()
      .ease(d3.easeSinOut)
      .duration(200)
      .call(this.yAxisGrid.scale(event.transform.rescaleY(this.y)))

    this.goodValue.attr('transform', event.transform)
  }

  update () {
    const data = this.data
    const extentX = d3.extent(this.data, function (d) {
      return d.x
    })
    const minY = d3.min(data, function (d) { return d.y })
    const maxY = d3.max(data, function (d) { return d.y })

    this.x.domain(extentX)
    this.y.domain([minY - minY * 0.2, maxY + maxY * 0.2])

    this.goodValue.enter()
      .merge(this.goodValue)
      .attr('x', 0)
      .attr('width', this.width)
      .attr('y', this.y(this.maxGood))
      .attr('height', this.y(this.minGood) - this.y(this.maxGood))

    if (this.zoomEvent) {
      this.svg.select('.gxLabel')
        .transition()
        .duration(500)
        .call(this.xAxis.scale(this.zoomEvent.transform.rescaleX(this.x)))

      this.svg.select('.gridXLabel')
        .transition()
        .ease(d3.easeSinOut)
        .duration(200)
        .call(this.xAxisGrid.scale(this.zoomEvent.transform.rescaleX(this.x)))

      this.svg.select('.gyLabel')
        .transition()
        .duration(500)
        .call(this.yAxis.scale(this.zoomEvent.transform.rescaleY(this.y)))

      this.svg.select('.gridYLabel')
        .transition()
        .ease(d3.easeSinOut)
        .duration(200)
        .call(this.yAxisGrid.scale(this.zoomEvent.transform.rescaleY(this.y)))
    } else {
      this.svg.select('.gxLabel')
        .transition()
        .ease(d3.easeSinOut)
        .duration(500)
        .call(d3.axisBottom(this.x).tickFormat(d3.timeFormat(this.timeformat)).ticks(this.ticks))

      this.svg.select('.gridXLabel')
        .transition()
        .ease(d3.easeSinOut)
        .duration(200)
        .call(d3.axisBottom(this.x).tickFormat('').tickSize(-(this.height - this.margin.bottom)).ticks(this.ticks))

      this.svg.select('.gyLabel')
        .transition()
        .ease(d3.easeSinOut)
        .duration(500)
        // .ease(d3.easeCubic)
        .call(d3.axisLeft(this.y).ticks(8))

      this.svg.select('.gridYLabel')
        .transition()
        .ease(d3.easeSinOut)
        .duration(200)
        .call(d3.axisLeft(this.y).tickSize(-this.width).tickFormat('').ticks(8))
    }

    // Create a update selection: bind to the new data
    const u = this.lineChart
      .data([data], function (d) { return d.x })

    const r = this.rawLineChart
      .data([data], function (d) { return d.x })

    // Updata the line
    r
      .enter()
      .append('path')
      .attr('class', 'rawLine')
      .merge(r)
      .transition()
      .duration(1000)
      .ease(d3.easeCubic)
      .attr('d', this.rawLine)
      .attr('fill', 'none')
      .attr('stroke-width', 2.5)

    // Updata the line
    u
      .enter()
      .append('path')
      .attr('class', 'smoothLine')
      .merge(u)
      .transition()
      .duration(1000)
      .ease(d3.easeCubic)
      .attr('d', this.smoothLine)
      .attr('fill', 'none')
      .attr('stroke-width', 2.5)
  }

  mouseMove (event) {
    const mouse = d3.pointer(event)
    const mouseLength = this.x.invert(mouse[0])
    const bisect = d3.bisector(d => d.x).left
    const xIndex = bisect(this.data, mouseLength, 0)
    if (this.data.length > 0) {
      const pos = this.data[xIndex]
      if (pos) {
        const posY = this.y(pos.y)
        const posX = this.x(pos.x)

        this.mousePerLine
          .transition()
          .ease(d3.easeSinOut)
          .duration(200)
          .attr('d', 'M' + posX + ',' + (this.height) + ' ' + posX + ',' + this.margin.top)

        this.labelGroup
          .transition()
          .ease(d3.easeSinOut)
          .duration(200)
          .attr('transform', `translate(${posX}, ${posY})`)

        // const labelBg = this.svg.select('.label-bg')
        // const dataLabel = this.svg.select('.data_label')
        // const timeLabel = this.svg.select('.time_label')

        // const labelDate = this.labelBg.merge(this.xLabel).merge(this.yLabel)

        // .attr('transform', `translate(${-(this.labelWidth / 2)},${-(this.labelHeight + this.circleRad)})`)
        let dataLabelX = 0; let dataLabelY = -(this.labelHeight / 1.5) - this.circleRad / 2
        let timeLabelX = 0; let timeLabelY = -(this.labelHeight / 3) - this.circleRad / 2
        let labelBgX = -(this.labelWidth / 2); let labelBgY = -(this.labelHeight + this.circleRad)

        if (posX >= this.width - (this.margin.left + this.margin.right)) {
          dataLabelX = -this.labelWidth / 2
          timeLabelX = -this.labelWidth / 2
          labelBgX = -(this.labelWidth)
        } else if (posX <= this.labelWidth) {
          dataLabelX = this.labelWidth / 2
          timeLabelX = this.labelWidth / 2
          labelBgX = 0
        }

        if (this.height - posY >= this.height - (this.labelHeight) - this.margin.top) {
          dataLabelY = (this.labelHeight / 1.5) + (this.circleRad) * 1.5
          timeLabelY = (this.labelHeight / 3) + (this.circleRad) * 1.5
          labelBgY = (this.circleRad)
        }

        if (this.zoomEvent) {
          // const labelPositions = [dataLabelX, dataLabelY, timeLabelX, timeLabelY, labelBgX, labelBgY]
          // labelPositions = labelPositions.map(labelPos => {
          //   labelPos = labelPos / this.zoomEvent.transform.k
          // })
          dataLabelX = dataLabelX / this.zoomEvent.transform.k
          dataLabelY = dataLabelY / this.zoomEvent.transform.k
          timeLabelX = timeLabelX / this.zoomEvent.transform.k
          timeLabelY = timeLabelY / this.zoomEvent.transform.k
          labelBgX = labelBgX / this.zoomEvent.transform.k
          labelBgY = labelBgY / this.zoomEvent.transform.k
        }

        this.dataLabel
          .attr('transform', `translate(${dataLabelX},${dataLabelY})`)

        this.timeLabel
          .attr('transform', `translate(${timeLabelX},${timeLabelY})`)

        this.labelBg
          .attr('transform', `translate(${labelBgX},${labelBgY})`)

        this.dataLabel
          .text(pos.y)

        this.timeLabel
          .text(d3.timeFormat('%H:%M:%S')(pos.x))
      }
    }
  }

  addData (data) {
    this.data.push(data)
  }

  shiftData () {
    // removes first data element
    this.data.shift()
  }

  dataLength () {
    return this.data.length
  }

  getKey () {
    return this.key
  }
}
