

var ctx = document.querySelectorAll('.myChart');

for (let i = 0; i < ctx.length; i++) {
  const ct = ctx[i];
 new Chart(ct, {
    type: 'doughnut',
    data: {
        datasets: [{
            label: '# of Votes',
            data: [12, 19],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(0, 0, 0, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(0, 0, 0, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
      tooltips: {
        enabled: false
      },
      responsive: true,
      legend: {
       display: false
      }
    }
});
}

const getPercent = (dataset) => {
    let val = (1-(dataset[0]/dataset[1]))*100
    return val.toPrecision(4) + '%'

}


Chart.pluginService.register({
  beforeDraw: function(chart) {
    var width = chart.chart.width,
        height = chart.chart.height,
        ctx = chart.chart.ctx;
    ctx.restore();
    var fontSize = (height / 140).toFixed(2);
    ctx.font = fontSize + "em sans-serif";
    ctx.textBaseline = "middle";
    var text = getPercent(chart.data.datasets[0].data),
        textX = Math.round((width - ctx.measureText(text).width) / 2),
        textY = height / 2;
    ctx.fillText(text, textX, textY);
    ctx.save();
  }
});
