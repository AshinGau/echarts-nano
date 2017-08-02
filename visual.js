function getInstruInfo(url){
    let $def = $.Deferred(),
        $pos = $.post(url); // post method
    $pos.done(data => {
        let title = [];
        for(let key in data[0])
            if(key === 'date')
                title.unshift(key);
            else{
                title.push(key);
                for(let index in data){
                    let obj = {},
                        val = data[index][key].split(',');
                    obj.hours = +val[0];
                    obj.cnts = +val[1];
                    data[index][key] = obj;
                }
            }
        $def.resolve(title, data);
    });
    $pos.fail(err => { $def.reject(err); });
    return $def.promise();
}
let stackChart = echarts.init(document.getElementById('stackArea'));
stackChart.showLoading();
let pieChart = echarts.init(document.getElementById('pieArea'));
pieChart.showLoading();
let groupChart = echarts.init(document.getElementById('groupArea'));
groupChart.showLoading();
let barChart = echarts.init(document.getElementById('barArea'));
barChart.showLoading();
let rankChart = echarts.init(document.getElementById('rankArea'));
rankChart.showLoading();
let stackOption = {
    tooltip : {
        trigger: 'axis',
        axisPointer: {
            type: 'cross',
            label: {
                backgroundColor: '#6a7985'
            }
        }
    },
    legend: {
        align: 'left',
        orient: 'vertical',
        right: 'left',
        top: '30%',
        tooltip: {
            show: true
        },
        formatter: name => echarts.format.truncateText(name, 80, '14px Microsoft Yahei', '…')
    },
    grid: {
        top: 20,
        left: 0,
        right: '130',
        bottom: '3%',
        containLabel: true
    },
    xAxis : [
        {
            type : 'category',
            boundaryGap : false
        }
    ],
    yAxis : [
        {
            type : 'value'
        }
    ]
};
let pieOption = {
    tooltip : {
        trigger: 'item'
    },
    series : [
        {
            name: '机时分布',
            type: 'pie',
            radius : '60%',
            center: ['40%', '46%'],
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
};
let barOption = {
    tooltip : {
        trigger: 'axis',
        axisPointer : {
            type : 'shadow'
        }
    },
    legend: {
        data: ['机时', '人次']
    },
    grid: {
        top: 30,
        left: 0,
        right: '4%',
        bottom: '5%',
        containLabel: true
    },
    xAxis : [
        {
            type : 'category',
            axisTick: {
                alignWithLabel: true
            }
        }
    ],
    yAxis : [
        {
            type : 'value'
        }
    ],
    series : [
        {
            name:'机时',
            type:'bar',
            barWidth: '50%'
        },
        {
            name:'人次',
            type:'line',
        }
    ]
};
let groupOption = {
    tooltip : {
        trigger: 'axis',
        axisPointer : {
            type : 'shadow'
        }
    },
    grid: {
        top: 20,
        left: 0,
        right: '4%',
        bottom: 50,
        containLabel: true
    },
    xAxis : [
        {
            type : 'category',
            axisTick: {
                alignWithLabel: true
            }
        }
    ],
    yAxis : [
        {
            type : 'value'
        }
    ],
    series : [
        {
            name:'机时',
            type:'bar',
            barWidth: '30%'
        }
    ]
};
let rankOption = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        }
    },
    grid: {
        top: 20,
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01],
        position: 'top'
    },
    yAxis: {
        type: 'category'
    },
    series: [
        {
            type: 'bar',
            barWidth: '50%'
        }
    ]
};
getInstruInfo('equipment.json').done((title, data) => {
    //堆积图
    stackOption.xAxis[0].data = data.map(d => d.date);
    title.shift();
    let legend = title;
    stackOption.legend.data = legend.map(d => {
        return {
            name: d,
            icon: 'rect'
        }
    });
    let series = legend.map(lg => {
        let tmp = {
            name: lg,
            type:'line',
            stack: '总量',
            areaStyle: {normal: {}},
            //data:[],
            label: {
                emphasis: {
                    show: true,
                    position: 'top',
                    textStyle:{
                        fontSize: 15
                    }
                }
            }
        };
        tmp.data = data.map(rd => rd[lg].hours);
        return tmp;
    });
    stackOption.series = series;
    stackChart.hideLoading();
    stackChart.setOption(stackOption);

    //饼图
    pieOption.tooltip.formatter = `${data[0].date} - ${data[legend.length - 1].date}<br/>{b} : {c}小时 ({d}%)`;
    let pieData = [];
    for(let key of legend){
        let pieObj = {};
        pieObj.name = key;
        pieObj.value = 0;
        for(let val of data)
            pieObj.value += val[key].hours;
        pieData.push(pieObj);
    }
    pieOption.series[0].data = pieData;
    pieChart.hideLoading();
    pieChart.setOption(pieOption);

    //柱状图
    barOption.series[0].data = data.map(d => d['FIB'].hours);
    barOption.series[1].data = data.map(d => d['FIB'].cnts);
    barOption.xAxis[0].data = data.map(d => d.date);
    barChart.hideLoading();
    barChart.setOption(barOption);
});

//group
$.post('group.json').done(data => {
    groupOption.series[0].data = data.map(d => d.hours);
    groupOption.xAxis[0].data = data.map(d => d.group);
    groupChart.hideLoading();
    groupChart.setOption(groupOption);
});

//rank
$.post('rank.json').done(data => {
    data = data.sort((a, b) => {
       return a.hours - b.hours;
    });
    rankOption.series[0].data = data.map(d => d.hours);
    rankOption.yAxis.data = data.map(d => d.name);
    rankChart.hideLoading();
    rankChart.setOption(rankOption);
});

Date.prototype.format = function(fmt) {
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt)) {
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
}

let $sdInput = $('#report-start-date'),
    $edInput = $('#report-end-date'),
    $dPicker = $('#ui-datepicker-div'),
    $dPrev = $dPicker.find('.ui-datepicker-prev'),
    $dNext = $dPicker.find('.ui-datepicker-next'),
    $dPickerDate = $dPicker.find('.ui-datepicker-title'),
    dPickerState = false;
    dNow = new Date(),
    dNowPrev6 = new Date();

dNowPrev6.setMonth(dNowPrev6.getMonth() - 6);
$sdInput.val(dNowPrev6.format('yyyy-MM'));
$edInput.val(dNow.format('yyyy-MM'));

function dInputFocus(){
    let $this = $(this),
        left = $this.offset().left,
        top = $this.offset().top + 27;
    $dPickerDate.text($this.val());
    $dPicker.css({
        top: top,
        left: left
    }).show();
    dPickerState = true;
    $dPicker.__target = $this;
}

$dPrev.click(function(){
    $input = $dPicker.__target;
    dd = new Date($input.val());
    dd.setMonth(dd.getMonth() - 1);
    $input.val(dd.format('yyyy-MM'));
    $dPickerDate.text(dd.format('yyyy-MM'));
});

$dNext.click(function(){
    $input = $dPicker.__target;
    dd = new Date($input.val());
    dd.setMonth(dd.getMonth() + 1);
    $input.val(dd.format('yyyy-MM'));
    $dPickerDate.text(dd.format('yyyy-MM'));
});

$(window).click(function(e){
    if(dPickerState){
        let $target = $(e.target);
        if( !($target.closest($dPicker).length > 0 || $target.is($dPicker.__target))){
            $dPicker.hide();
            $dPicker.__target = null;
        }
    }
});

function monthPick($input){
    $input.focus(dInputFocus);
}
monthPick($sdInput);
monthPick($edInput);

