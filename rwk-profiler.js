/*jslint browser:true, devel:true, white:true, vars:true */
/*global Chart*/


var rwkPro = (function(){

    var proScatter, scatterChartData, firstTime = null;

    var initPro = function(){

        var div = document.createElement('div');
        div.id = 'pro-container';
        div.style = 'width: 60%';
        document.body.appendChild(div);

        var canvas = document.createElement('canvas');
        canvas.id = 'pro-canvas';
        document.getElementById(div.id).appendChild(canvas);

        scatterChartData = {
            datasets: [{
                label: '',
                fill: false,
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "rgba(255,255,255,1)",
                backgroundColor: "rgba(75,192,192,1)",
                data: []
            }]
        };

        var ctx = document.getElementById("pro-canvas").getContext("2d");

        proScatter = new Chart(ctx, {
                type: 'line',
                data: scatterChartData,
                options: {
                    pan: {
                        enabled: true,
                        mode: 'x',
                        threshold: 10
                    },
                    zoom: {
                        enabled: true,
                        mode: 'x',
                        limits: {
                            max: 10,
                            min: 0.5
                        }
                    },
                    scales: {
                        yAxes:[{
                            ticks: {
                                suggestedMax: 20
                            }
                        }],
                        xAxes: [{
                            type: 'linear',
                            position: 'bottom'

                        }]
                    }
                }
            });
    };

    var addData = function(inY, inLabel, inX){

        inX = inX === undefined ? 'time' : inX;
        var i = proScatter.data.datasets.map(function(e) { return e.label; }).indexOf(inLabel);
        var j = proScatter.data.datasets[0].label;

        if(inX.toLowerCase() === "time"){
            if (firstTime === null){
                firstTime = Date.now();
            }
            var time = Date.now() - firstTime;

            if(i === -1 && j === '' && proScatter.data.datasets.length === 1){
                //first dataset and it is empty
                proScatter.data.datasets[0].label = inLabel;
                proScatter.data.datasets[0].data.push({x: time, y:inY});
            }
            //else if(i === -1 && j !== '' && proScatter.data.datasets.length === 1){
            else if(i === -1){
                var r = Math.floor(Math.random() * 255);
                var g = Math.floor(Math.random() * 255);
                var b = Math.floor(Math.random() * 255);
                var pointBrdCol = "rgba(" + r + "," + g + "," + b + ",1)";

                proScatter.data.datasets.push({
                    label: '',
                    fill: false,
                    pointBorderColor: pointBrdCol.toString(),
                    pointBackgroundColor: "rgba(255,255,255,1)",
                    backgroundColor: pointBrdCol.toString(),
                    data: []

                });

                proScatter.data.datasets[proScatter.data.datasets.length-1].label = inLabel;
                proScatter.data.datasets[proScatter.data.datasets.length-1].data.push({x: time, y:inY});
            }
            else{

                proScatter.data.datasets[i].data.push({x:time, y:inY});
            }
        }
        proScatter.update();
    };

    document.addEventListener('DOMContentLoaded', initPro, false);

    return {
        addData: addData
    };

})();


window.rwkPro = rwkPro;
