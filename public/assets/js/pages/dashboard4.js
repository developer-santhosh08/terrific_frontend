//[Dashboard Javascript]

//Project:	CrmX Admin - Responsive Admin Template
//Primary use:   Used only for the main dashboard (index.html)


$(function () {

  'use strict';
	
	var ctx6 = document.getElementById('earning');
		  new Chart(ctx6, {
			type: 'line',
			data: {
			  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			  datasets: [{
				data: [10, 18, 11, 8, 14, 25, 12, 7, 13, 25, 18, 6],
				backgroundColor: 'rgba(56, 100, 159, 0.8)',
				borderWidth: 1,
				fill: true
			  },{
				data: [6, 9, 22, 12, 7, 18, 12, 22, 9, 7, 10, 19],
				backgroundColor: 'rgba(238, 16, 68, 0.8)',
				borderWidth: 1,
				fill: true
			  }]
			},
			options: {
			  legend: {
				display: false,
				  labels: {
					display: false
				  }
			  },
			  scales: {
				yAxes: [{
				  ticks: {
					beginAtZero:true,
					fontSize: 10,
					max: 30
				  }
				}],
				xAxes: [{
				  ticks: {
					beginAtZero:true,
					fontSize: 11
				  }
				}]
			  }
			}
		  });
	
		
		var options = {
            chart: {
                height: 380,
                type: 'bar',
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    endingShape: 'rounded',
                    columnWidth: '55%',
                },
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
			colors:['#689f38', '#38649f', '#ff8f00', '#ee1044'],
            series: [{
                name: 'General',
                data: [44, 55, 57, 56, 61, 58, 63, 60, 66]
            }, {
                name: 'ICU',
                data: [76, 85, 101, 98, 87, 105, 91, 114, 94]
            }, {
                name: 'OT',
                data: [35, 41, 36, 26, 45, 48, 52, 53, 41]
            }, {
                name: 'Emergency',
                data: [12, 14, 25, 10, 18, 15, 17, 12, 11]
            }],
            xaxis: {
                categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
            },
            fill: {
                opacity: 1

            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return "0" + val + " Patients"
                    }
                }
            }
        }

        var chart = new ApexCharts(
            document.querySelector("#patients-overview"),
            options
        );

        chart.render();
	
	  $('.inner-user-div').slimScroll({
		height: '370px'
	  });
	
	
}); // End of use strict
