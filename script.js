google.charts.load('current', {packages: ['corechart']});
google.charts.setOnLoadCallback(showOutcomeChart);

function loadingPredictions () {
	document.getElementById('a_predictions').style.color = 'red';
	var next = localStorage.getItem("next");
	if ( next == null ) (
		var next = 5;
	)
	document.getElementById("next").value = next;
	initializeLeagues();
	initializePredictionsSeason();
	filterData();	
}

function loadingStats () {
	document.getElementById('a_stats').style.color = 'red';	
	initializeLeagues();
	initializeSeasons();
	getStats();	
}

function loadingStandings () {
	document.getElementById('a_standings').style.color = 'red';	
	initializeLeagues();
	initializeSeasons();
	getStands();	
}

function loadingResults () {
	document.getElementById('a_results').style.color = 'red';	
	initializeLeagues();
	initializeSeasons();
	showResults();	
}

function initializeLeagues() {
	document.getElementById("league").innerHTML = 
	"<option>SPAIN PRIMERA DIVISION</option>"+
	"<option>ENGLAND PREMIER LEAGUE</option>"+
	"<option>GERMANY BUNDESLIGA</option>"+
	"<option>ITALY SERIE A</option>"+
	"<option>FRANCE LIGUE 1</option>"+
	"<option>NETHERLANDS EREDIVISIE</option>"+
	"<option>GREECE SUPER LEAGUE</option>"+
	"<option>PORTUGAL PRIMEIRA LIGA</option>"+
	"<option>BELGIUM FIRST DIVISION A</option>"+
	"<option>CZECH REPUBLIC DIVISION 1</option>"+						
	"<option>DENMARK SUPERLIGAEN</option>"+
	"<option>POLAND EKSTRAKLASA</option>"+
	"<option>SWEDEN ALLSVENSKAN</option>"+
	"<option>TURKEY SUPERLIG</option>";
}

function initializeSeasons() {
		document.getElementById("season").innerHTML = 
		"<option>2010-2011</option>"+
		"<option>2011-2012</option>"+
		"<option>2012-2013</option>"+
		"<option>2013-2014</option>"+
		"<option>2014-2015</option>"+
		"<option>2015-2016</option>"+
		"<option>2016-2017</option>"+
		"<option>2017-2018</option>"+
		"<option>2018-2019</option>"+
		"<option>2019-2020</option>"+						
		"<option>2020-2021</option>"+
		"<option>2021-2022</option>"+
		"<option>2022-2023</option>" +
		"<option>2023-2024</option>" +
		"<option>2024-2025</option>";
		
		var season = localStorage.getItem('season');
		if (season!==null) {
			document.getElementById("season").value = season;		
		} else {
			let current = getCurrentSeason();
			document.getElementById("season").value = current;
		}
}

function initializePredictionsSeason() {
	let current = getCurrentSeason();
	document.getElementById('season').innerHTML = '<option>' + current + '</option>';
	document.getElementById('today').innerHTML = getTodayDate()[0] + "-" + getTodayDate()[1] + "-" + getTodayDate()[2];		
}

function updateLeague() {
	let league = document.getElementById('league').value;
	if (league!="SPAIN PRIMERA DIVISION") {
		document.getElementById('league').value = "SPAIN PRIMERA DIVISION";
		alert ("Only SPAIN PRIMERA DIVISION is available in free version")
	}
}

function getCurrentSeason() {
	let m = getTodayDate()[1];
	let y = getTodayDate()[2];
	
	if (m < 7) {
		var current = (y-1) + "-" + y;
	} else {
		var current = y + "-" + (y+1);	
	}
	return current;
}

function getLeague() {
	let league = document.getElementById('league').value;
	return league;
}

function getSeason () {
	let season = document.getElementById('season').value;
	return season;
}

function getTodayDate () {
	let today = new Date();
	let d = ("0" + (today.getDate())).slice(-2);	
	let m = ("0" + (today.getMonth() + 1)).slice(-2);
	let y = today.getFullYear();
	return [d,m,y];
}

const getData = async () => {
	var league = getLeague();
	var tab = 'SPAIN+PRIMERA+DIVISION';  // change later with league 
	var id = '1U_LkPMUp445zRjLdy2Dx1OEtwXlnzcOX7WmgDtwPTUU';
	var url = 'https://opensheet.elk.sh/' + id + "/" + tab;
	
	 let response  = await fetch(url)
	 let json = await response.json();
 
	//convert JSON to array 
	var data = json.map(function(el){
		var arr=[];
		for(var key in el){
			arr.push(el[key]);
		}
		return arr;
	});

	return data;
}

function showSeasonSummary (stotal,splayed,gf,ga) {
	//var gfpg = gf / splayed; // not used yet in this version
	//var gapg = ga / splayed; // not used yet in this version
	document.getElementById("stotal").innerText = stotal;
	document.getElementById("splayed").innerText = splayed;
	document.getElementById("sscored").innerText = gf;
	document.getElementById("sallowed").innerText = ga;
	document.getElementById("stotal").style.background = '#ddd';
	document.getElementById("splayed").style.background = '#ddd';
	document.getElementById("sscored").style.background = '#ddd';
	document.getElementById("sallowed").style.background = '#ddd';
}

function refreshPage () {
	//add to localStorage
	var season = document.getElementById("season").value;
	localStorage.setItem('season', season);
	location.reload();
}

// Predictions ------------------------------------------------------------------------------------------------------
function getPrevSeasons() {
	let numberOfSeasons = 3; // number of seasons of data to include in the model 
	return numberOfSeasons;
}

function updateSchedule() {
	var next = document.getElementById("next").value;
	localStorage.setItem("next", next);
	location.reload();
}

const filterData = async () => {

	let results = await getData();	
	let season = getSeason();
	
	// initialize variables
	var allteams = [];
	var upcoming = [];
	var subset = [];
	var gf = 0;
	var ga = 0;
	var j = 0;
	var k = 0;
	
	var todayDate = getTodayDate();
	var date = todayDate[2] + "-" + todayDate[1] + "-" + todayDate[0];
	var next = Number(document.getElementById("next").value);
	var date = new Date(date.valueOf());
	var from_date = date.setHours(0,0,0,0);
	date.setDate(date.getDate() + next);
	var to_date = date.setHours(0,0,0,0);

	var prevSesions = getPrevSeasons(); // number of seasons to include in the model (including the current season)
	let toyear = season.substring(0,4);
	let fromyear = toyear - prevSesions + 1;

	for (var i=0; i < results.length; i++) {
		var result = results[i];
		var iseason = result[2];
		
		// get teams for current season (to construct the table)
		if (iseason==season) {			
			allteams.push(result[5],result[6]);
		}
		
		// create subset of upcoming games
		var idate = (new Date(result[3])).setHours(0,0,0,0);
		if (idate >= from_date && idate <= to_date) {			
			upcoming[j] = result;
			j++;
		}
		
		// create subset array of historic games
		let startyear = iseason.substring(0,4);
		if ( startyear >= fromyear && result[9] != null ) {			
			subset[k] = result;
			gf = gf + Number(result[9]);
			ga = ga + Number(result[10]);
			k++;
		}
	}

	var teamsset = new Set(allteams);  //set with unique teams in that season
	const teams = Array.from(teamsset).sort();  //convert set to array and sort alphabetically A -> Z
	var histgf = gf / k;
	var histga = ga / k;

	showUpcomingGames(upcoming,teams,subset,histgf,histga);
}

function showUpcomingGames(nextgames,teams,subset,histgf,histga) {
	
	if (nextgames.length > 0) {
		var tbl = document.getElementById("preds1");	
		for (var r = 0; r < nextgames.length; r++){
			var game = nextgames[r];
			var row = tbl.insertRow(tbl.rows.length);
			row.className = "main_row";
			
			//add a click event to the row
			var currentRow = row;
			var createClickHandler = function(row) {
				return function() {
					showDetails(row);
					//window.location.hash = "details";
					document.getElementById("details").scrollIntoView({behavior: 'smooth'});
				};
			};
			currentRow.onclick = createClickHandler(currentRow);
			
			//add date, time, home team, away team
			for (var c = 0; c < 4; c++){
				var cell = row.insertCell(c);					
			}
			row.cells[0].innerText = game[3];
			row.cells[1].innerText = game[4];			
			row.cells[2].innerHTML = game[5] + '<label style="display:none" id="htge' + r + '"></label>';
			row.cells[3].innerHTML = game[6] + '<label style="display:none" id="atge' + r + '"></label>';
		}
		
		createTable(teams,subset,histgf,histga);

		if (document.getElementById("details").style.display == '') {
			for (var i = 0; i < nextgames.length; i++){
				var check = tbl.rows[i+2].cells[4].innerText;
				if ( check.length < 4 ) {
					showDetails(tbl.rows[i+2]);
					break;
				}
			}
		}
		//document.getElementById("details").style.visibility = 'visible';
	} else {
		document.getElementById("predmsg").innerText = "There aren't any games scheduled in that period";
		document.getElementById("details").style.display = 'none';
	}
}

function createTable(teams,subset,histgf,histga) {
	
	var table = [];
	var i = 0;
	
	teams.forEach (function(team) {
		
		var hp = 0;
		var hw = 0;
		var hd = 0;
		var hl = 0;
		var hgf = 0;
		var hga = 0;

		var ap = 0;
		var aw = 0;
		var ad = 0;
		var al = 0;
		var agf = 0;
		var aga = 0;

		for (var j=0; j < subset.length; j++) {
	
			//home
			if ( team == subset[j][5] ) {
				hp = hp + 1;
				hgf = hgf + Number(subset[j][9]);
				hga = hga + Number(subset[j][10]);
				
				if (subset[j][9] > subset[j][10]) {
					hw = hw + 1;
				} else if (subset[j][9] < subset[j][10]) {
					hl = hl + 1;
				} else {
					hd = hd + 1;
				}
			}
			
			//away
			if ( team == subset[j][6] ) {
				ap = ap + 1;
				agf = agf + Number(subset[j][10]);
				aga = aga + Number(subset[j][9]);
				
				if (subset[j][9] < subset[j][10]) {
					aw = aw + 1;
				} else if (subset[j][9] > subset[j][10]) {
					al = al + 1;
				} else {
					ad = ad + 1;
				}
			}		
		
		}
		
		// check if hp and ap , and also check if enough historic games
		if ( hp+ap > 3 ) {
			var has = (hgf / hp) / histgf;
			var hds = (hga / hp) / histga;
			var aas = (agf / ap) / histga;
			var ads = (aga / ap) / histgf;		
			table[i] = [team,hp,hw,hd,hl,hgf,hga,has,hds,ap,aw,ad,al,agf,aga,aas,ads];
			i++;
		}
	})

	showSummaryPredictions (table,histgf,histga);	
}

function showSummaryPredictions(table,histgf,histga) {
	
	var tbl = document.getElementById("preds1");
	
	for (var r = 2; r < tbl.rows.length; r++) {
				
		// get estimates/goal expectancy
		var ht = tbl.rows[r].cells[2].innerText;
		var at = tbl.rows[r].cells[3].innerText;
		var htge = getGoalEstimates(table,histgf,histga,ht,at,r)[0];	
		var atge = getGoalEstimates(table,histgf,histga,ht,at,r)[1];	

		if (htge[0]==htge[0] && atge[0]==atge[0]) {
			
			// add columns to table
			for (var c = 4; c < 15; c++){
				tbl.rows[r].insertCell(c);
			}	
			
			var outcome = getOutcome(htge,atge);
			var win = outcome[0];
			var draw = outcome[1];
			var lose = outcome[2];			
				
			//outcome (win, draw, lose) probabilities and odds
			tbl.rows[r].cells[9].innerText = (win*100).toFixed(1) + "%";
			tbl.rows[r].cells[10].innerText = (draw*100).toFixed(1) + "%";
			tbl.rows[r].cells[11].innerText = (lose*100).toFixed(1) + "%";	

			
			//proposed 1X2 outcome and probability
			if ( win > 0.5 ) {
				var result = "1";
				var prob = win;
			} else if ( lose > 0.5 ) {
				var result = "2";
				var prob = lose;
			} else {
				if ( win+draw > 0.7 ) {
					var result = "1X";
					var prob = win+draw;
				} else if ( lose+draw > 0.7 ) {
					var result = "X2";
					var prob = lose+draw;			
				} else {
					var result = "X";
					var prob = draw;				
				}
			}
			
			tbl.rows[r].cells[4].innerHTML = '<b>' + result + '<b>';
			tbl.rows[r].cells[5].innerText = (prob*100).toFixed(1) + "%";
			
			//most probable scores
			var prob = 0;
			var prob2 = 0;
			var prob3 = 0;
			var score = "";
			var score2 = "";
			var score3 = "";
			
			//first most probable score
			for (var i = 0; i < 6; i++){
				for (var j = 0; j < 6; j++){	
					if ( htge[i]*atge[j] > prob ) {
						var prob = htge[i]*atge[j];
						var score = i + "-" + j;
					}	
					if ( htge[i]*atge[j] < prob && htge[i]*atge[j] > prob2 ) {
						var prob2 = htge[i]*atge[j];
						var score2 = i + "-" + j;
					}						
				}
			}
			
			//second most probable score
			for (var i = 0; i < 6; i++){
				for (var j = 0; j < 6; j++){	
					if ( htge[i]*atge[j] < prob && htge[i]*atge[j] > prob2 ) {
						var prob2 = htge[i]*atge[j];
						var score2 = i + "-" + j;
					}						
				}
			}
			
			//third most probable score
			for (var i = 0; i < 6; i++){
				for (var j = 0; j < 6; j++){	
					if ( htge[i]*atge[j] < prob && htge[i]*atge[j] < prob2 && htge[i]*atge[j] > prob3 ) {
						var prob3 = htge[i]*atge[j];
						var score3 = i + "-" + j;
					}						
				}
			}		
			
			tbl.rows[r].cells[6].innerHTML = '<b>' + score + '</b>';
			tbl.rows[r].cells[7].innerText = score2;
			tbl.rows[r].cells[8].innerText = score3;
			
			//over/under goals
			var overunder = getOverUnder(htge,atge);
			var over25 = overunder[4];
			var under25 =overunder[5];
			var btts = overunder[10];	
			tbl.rows[r].cells[12].innerText = (1/over25).toFixed(2);		
			tbl.rows[r].cells[13].innerText = (1/under25).toFixed(2);		
			tbl.rows[r].cells[14].innerText = (1/btts).toFixed(2);	
		} else {
			tbl.rows[r].insertCell(4);
			tbl.rows[r].cells[4].colSpan = 11;
			tbl.rows[r].cells[4].innerText = "There is not sufficient historical data to make the prediction"
		}
	}
}

function getGoalEstimates(table,gf,ga,ht,at,row) {

	// home team estimates
	for (var i=0; i < table.length; i++) {
		var iteam = table[i][0];
		if (iteam == ht) {
			var htas = table[i][7];
			var htds = table[i][8];
			break;
		}
	}
	
	//away team stats
	for (var i=0; i < table.length; i++) {
		var iteam = table[i][0];
		if (iteam == at) {
			var atas = table[i][15];
			var atds = table[i][16];
		}
	}
		
	//goal expectancy
	var htexp = htas * atds * gf;
    var atexp = htds * atas * ga;
	document.getElementById("htge"+(row-2)).innerText = htexp;
	document.getElementById("atge"+(row-2)).innerText = atexp;	
	var htpoiscumul = 0;
	var atpoiscumul = 0;
	var htge = []; //home team goal estimates
	var atge = []; //away team goal estimates
	
	//poisson goal estimates - home team
	for (var c = 0; c < 5; c++){
		var htpois = poisson(c,htexp);
		htge[c] = htpois;
		htpoiscumul = htpoiscumul + htpois;
	}
	htge[5] = 1-htpoiscumul;
		
	//poisson goal estimates - away team
	for (var c = 0; c < 5; c++){
		var atpois = poisson(c,atexp);
		atge[c] = atpois;
		atpoiscumul = atpoiscumul + atpois;
	}
	atge[5] = 1-atpoiscumul;		
	
	//console.log(htge,atge);
	var ge = [htge,atge];
	return (ge);
}

function getOutcome(htge,atge) {
	if (htge!=null && atge!=null) {
	var win = (htge[1]*atge[0])+(htge[2]*atge[0])+(htge[2]*atge[1])+(htge[3]*atge[0])+(htge[3]*atge[1])+
	(htge[3]*atge[2])+(htge[4]*atge[0])+(htge[4]*atge[1])+(htge[4]*atge[2])+(htge[4]*atge[3])+
	(htge[5]*atge[0])+(htge[5]*atge[1])+(htge[5]*atge[2])+(htge[5]*atge[3])+(htge[5]*atge[4]);
	var draw = (htge[0]*atge[0])+(htge[1]*atge[1])+(htge[2]*atge[2])+(htge[3]*atge[3])+(htge[4]*atge[4])+(htge[5]*atge[5]);	
	var lose = 1-(win+draw);
	var outcome = [win,draw,lose];
	return (outcome);
	}
}

function getOverUnder(htge,atge) {
	var over05 = 1-(htge[0]*atge[0]);
	var under05 = htge[0]*atge[0];
	var over15 = 1-(htge[0]*atge[0]+htge[1]*atge[0]+htge[0]*atge[1]);
	var under15 = htge[0]*atge[0]+htge[1]*atge[0]+htge[0]*atge[1];
	var over25 = 1-(htge[0]*atge[0]+htge[1]*atge[0]+htge[0]*atge[1]+htge[1]*atge[1]+htge[2]*atge[0]+htge[0]*atge[2]);
	var under25 = htge[0]*atge[0]+htge[1]*atge[0]+htge[0]*atge[1]+htge[1]*atge[1]+htge[2]*atge[0]+htge[0]*atge[2];
	var over35 = 1-(htge[0]*atge[0]+htge[1]*atge[0]+htge[0]*atge[1]+htge[1]*atge[1]+htge[2]*atge[0]+htge[0]*atge[2]+
	htge[2]*atge[1]+htge[1]*atge[2]+htge[3]*atge[0]+htge[0]*atge[3]);
	var under35 = htge[0]*atge[0]+htge[1]*atge[0]+htge[0]*atge[1]+htge[1]*atge[1]+htge[2]*atge[0]+htge[0]*atge[2]+
	htge[2]*atge[1]+htge[1]*atge[2]+htge[3]*atge[0]+htge[0]*atge[3];	
	var over45 = 1-(htge[0]*atge[0]+htge[1]*atge[0]+htge[0]*atge[1]+htge[1]*atge[1]+htge[2]*atge[0]+htge[0]*atge[2]+
	htge[2]*atge[1]+htge[1]*atge[2]+htge[3]*atge[0]+htge[0]*atge[3]+htge[2]*atge[2]+htge[3]*atge[1]+htge[1]*atge[3]+
	htge[4]*atge[0]+htge[0]*atge[4]);
	var under45 = htge[0]*atge[0]+htge[1]*atge[0]+htge[0]*atge[1]+htge[1]*atge[1]+htge[2]*atge[0]+htge[0]*atge[2]+
	htge[2]*atge[1]+htge[1]*atge[2]+htge[3]*atge[0]+htge[0]*atge[3]+htge[2]*atge[2]+htge[3]*atge[1]+htge[1]*atge[3]+
	htge[4]*atge[0]+htge[0]*atge[4];
	var btts = htge[1]*atge[1]+htge[2]*atge[1]+htge[3]*atge[1]+htge[4]*atge[1]+htge[5]*atge[1]+
	htge[1]*atge[2]+htge[1]*atge[3]+htge[1]*atge[4]+htge[1]*atge[5]+htge[2]*atge[2]+htge[3]*atge[3]+
	htge[3]*atge[2]+htge[4]*atge[2]+htge[5]*atge[2]+htge[2]*atge[3]+htge[2]*atge[4]+htge[2]*atge[5]+
	htge[4]*atge[3]+htge[5]*atge[3]+htge[3]*atge[4]+htge[3]*atge[5]+htge[4]*atge[4]+htge[5]*atge[5]+
	htge[4]*atge[5]+htge[5]*atge[4];	
	var otts = 1 - btts;
	var overunder = [over05,under05,over15,under15,over25,under25,over35,under35,over45,under45,btts,otts];
	return (overunder);
}

function showDetails (r) {
	var ht = r.cells[2].innerText;
	var at = r.cells[3].innerText;
	document.getElementById("details").style.display = 'block';
	document.getElementById("hometeam").innerText = ht;
	document.getElementById("awayteam").innerText = at;
	document.getElementById("homelogo").src = 'logos/' + ht + '.png';
	document.getElementById("awaylogo").src = 'logos/' + at + '.png';	

	var row = (r.rowIndex) - 2;
	var htgexp = document.getElementById("htge"+row).innerText;
	var atgexp = document.getElementById("atge"+row).innerText;

	var htge = getDirectEstimate(htgexp,atgexp)[0];
	var atge = getDirectEstimate(htgexp,atgexp)[1];
	
	if (htge!=null && atge!=null) {
		showOutcome(htge,atge);
		showOutcomeChart(htge,atge);	
		showOverUnder(htge,atge);
		showScoreline(htge,atge);
	}
}

function getDirectEstimate(htexp,atexp) {
	var htpoiscumul = 0;
	var atpoiscumul = 0;
	var htge = []; //home team goal estimates
	var atge = []; //away team goal estimates
	
	//poisson goal estimates - home team
	for (var c = 0; c < 5; c++){
		var htpois = poisson(c,htexp);
		htge[c] = htpois;
		htpoiscumul = htpoiscumul + htpois;
	}
	htge[5] = 1-htpoiscumul;
		
	//poisson goal estimates - away team
	for (var c = 0; c < 5; c++){
		var atpois = poisson(c,atexp);
		atge[c] = atpois;
		atpoiscumul = atpoiscumul + atpois;
	}
	atge[5] = 1-atpoiscumul;		
	
	return [htge,atge];
}


function showOutcome (htge,atge) {
	if (htge!=null && atge!=null) {
		var tbl = document.getElementById("outcometbl");	
		var outcome = getOutcome(htge,atge);
		var win = outcome[0];
		var draw = outcome[1];
		var lose = outcome[2];
		tbl.rows[1].cells[1].innerText = (win*100).toFixed(1) + "%";
		tbl.rows[2].cells[1].innerText = (draw*100).toFixed(1) + "%";
		tbl.rows[3].cells[1].innerText = (lose*100).toFixed(1) + "%";
		tbl.rows[1].cells[2].innerText = (1/win).toFixed(2);
		tbl.rows[2].cells[2].innerText = (1/draw).toFixed(2);
		tbl.rows[3].cells[2].innerText = (1/lose).toFixed(2);
	}
}

function showOutcomeChart(htge,atge) {
		if (htge!=null && atge!=null) {
			var outcome = getOutcome (htge,atge);	
			var prob = [];
			let out = ['1','X','2'];
			prob[0] = (outcome[0]*100);
			prob[1] = (outcome[1]*100);		
			prob[2] = (outcome[2]*100);
			
			let mydata = [];
			for(let i = 0; i < 3; i++) {
				mydata.push([(out[i]), prob[i]]);
			}	
			
			var data = new google.visualization.DataTable();
			data.addColumn('string', 'Outcome');
			data.addColumn('number', 'Probability');
			data.addRows(mydata);
				  
				  
			var data = google.visualization.arrayToDataTable([
				['Outcome', 'Probability', { role: 'style' }, { role: 'annotation' }],
				['1', prob[0], '#4285F4', prob[0].toFixed(1)+"%"],           
				['X', prob[1], '#F4B400',  prob[1].toFixed(1)+"%"],          
				['2', prob[2], '#DB4437',  prob[2].toFixed(1)+"%"],		
			])
				  
			var options = {
				backgroundColor: '#fafafa',
				legend: 'none',
				height: 254,
				bar: {groupWidth: "65%"},
			};
				
			var chart = new google.visualization.ColumnChart(document.getElementById('chart'));
			chart.draw(data, options);
		}
 }
	
function showOverUnder (htge,atge) {
		var tbl = document.getElementById("overundertbl");	
		var overunder = getOverUnder(htge,atge);
		var over05 = overunder[0];
		var under05 = overunder[1];		
		var over15 = overunder[2];
		var under15 = overunder[3];
		var over25 = overunder[4];
		var under25 =overunder[5];
		var over35 = overunder[6];
		var under35 = overunder[7];
		var over45 = overunder[8];
		var under45 = overunder[9];
		var btts = overunder[10];	
		var otts = overunder[11];
		
		tbl.rows[1].cells[1].innerText = (over05*100).toFixed(1) + "%";
		tbl.rows[2].cells[1].innerText = (under05*100).toFixed(1) + "%";
		tbl.rows[3].cells[1].innerText = (over15*100).toFixed(1) + "%";
		tbl.rows[4].cells[1].innerText = (under15*100).toFixed(1) + "%";
		tbl.rows[5].cells[1].innerText = (over25*100).toFixed(1) + "%";
		tbl.rows[6].cells[1].innerText = (under25*100).toFixed(1) + "%";	
		tbl.rows[7].cells[1].innerText = (over35*100).toFixed(1) + "%";
		tbl.rows[8].cells[1].innerText = (under35*100).toFixed(1) + "%";
		tbl.rows[9].cells[1].innerText = (over45*100).toFixed(1) + "%";
		tbl.rows[10].cells[1].innerText = (under45*100).toFixed(1) + "%";
		tbl.rows[11].cells[1].innerText = (btts*100).toFixed(1) + "%";
		tbl.rows[12].cells[1].innerText = (otts*100).toFixed(1) + "%";	
		
		tbl.rows[1].cells[2].innerText = (1/over05).toFixed(2);
		tbl.rows[2].cells[2].innerText = (1/under05).toFixed(2);
		tbl.rows[3].cells[2].innerText = (1/over15).toFixed(2);
		tbl.rows[4].cells[2].innerText = (1/under15).toFixed(2);
		tbl.rows[5].cells[2].innerText = (1/over25).toFixed(2);
		tbl.rows[6].cells[2].innerText = (1/under25).toFixed(2);
		tbl.rows[7].cells[2].innerText = (1/over35).toFixed(2);
		tbl.rows[8].cells[2].innerText = (1/under35).toFixed(2);
		tbl.rows[9].cells[2].innerText = (1/over45).toFixed(2);
		tbl.rows[10].cells[2].innerText = (1/under45).toFixed(2);
		tbl.rows[11].cells[2].innerText = (1/btts).toFixed(2);
		tbl.rows[12].cells[2].innerText = (1/otts).toFixed(2);
}

function showScoreline(htge,atge) {	
	var tbl = document.getElementById("scorelinetbl");
	var prob = 0;
	var prob2 = 1;
	for (var t = 1; t < 15; t++) {	
		for (var i = 0; i < 6; i++) {
			for (var j = 0; j < 6; j++) {	
				if ( htge[i]*atge[j] > prob && htge[i]*atge[j] < prob2 ) {
					prob = htge[i]*atge[j];
					score = i + "-" + j;
				}						
			}
		}
	
		tbl.rows[t].cells[0].innerText = score;	
		tbl.rows[t].cells[1].innerText = ((prob)*100).toFixed(1) + "%";	
		prob2 = prob;
		prob = 0;
	}
}

//poisson model -----------------------------------------------------------------
// landa is the promedian number of error expected in a given time (Landa symbol)
// k is the sumatorio de k terminos usando la formula de poisson
// k_total is the number of times the event is repeated (for cumilative distribution)
var exponential = 2.718281828;
var numerator, denominator;

function poisson(k, landa) {
    exponentialPower = Math.pow(exponential, -landa); // negative power k
    landaPowerK = Math.pow(landa, k); // Landa elevated k
    numerator = exponentialPower * landaPowerK;
    denominator = fact(k); // factorial of k.
    return (numerator / denominator);
}

function fact(x) {
   if(x==0) {
      return 1;
   }
   return x * fact(x-1);
}

//for poisson cumulative distribution
//var total = 0;
//var k_total = 9;
//for (var i = 0; i < k_total; i++) {
    //total += poisson(i, landa);
//}
//console.log("Total sum is " + total);


// Stats ----------------------------------------------------------------------------------------------------------------------
const getStats = async () => {
	
	let results = await getData();	
	var season = getSeason();
	
	//get teams
	var allteams = [];
	var subset = [];
	var games_played = 0;
	var total_games = 0;
	var gf = 0;
	var ga = 0;
	var j = 0;
	
	for (var i=0; i < results.length; i++) {
		var result = results[i];
				
		if (result[2]==season) {			
			total_games++;
			
			if ( result[9] != null ) {
				allteams.push(result[5],result[6]);
				
				//season summary stats
				var htg = result[9];
				var atg = result[10];
				games_played++;
				
				gf = gf + parseInt(htg);
				ga = ga + parseInt(atg);
				
				//create new array (subset)
				subset[j] = result;
				j++;
			}
		}
	}
	
	if (subset.length > 0) { 
		document.getElementById("msg").innerText = "";
		document.getElementById("msg").style.display = 'none';
	} else {
		document.getElementById("msg").style.display = 'block';
		document.getElementById("msg").innerText = "There is no data available for that period";
	}		
	
	showSeasonSummary (total_games,games_played,gf,ga);
	var teamsset = new Set(allteams);  //set with unique teams in that season
	const teams = Array.from(teamsset).sort();  //convert set to array and sort alphabetically A -> Z
	updateTeams(teams);		
}

function updateTeams(teams) {
	var selectA = document.getElementById("teamA");
	var selectB = document.getElementById("teamB");
	var teamA = selectA.value;
	var teamB = selectB.value;
	selectA.options.length = 0; //one way to clear options
	selectB.innerHTML = "";  //another way to clear options
	selectA.options[selectA.options.length] = new Option("");
	selectB.options[selectB.options.length] = new Option("");	
	teams.forEach(team => {		
		selectA.options[selectA.options.length] = new Option(team);
		selectB.options[selectB.options.length] = new Option(team);
	});
	selectA.value = teamA;
	selectB.value = teamB;
}

function updateTeamStats(e) {  //comes from an onchange in the team select
	if (e.value!=="") {
		//update the logo image
		if (e.id == "teamA") {
			document.getElementById("homelogo").src = "logos/" + e.value + ".png";
			document.getElementById("selA").style.display = "none";
			document.getElementById("homelogo").style.display = "flex";
		} else if (e.id == "teamB") {
			document.getElementById("awaylogo").src = "logos/" + e.value + ".png";
			document.getElementById("selB").style.display = "none";
			document.getElementById("awaylogo").style.display = "flex";			
		}
		
		if (e.id!=="") {
			var co = e.id;
			let col = co.substring(co.length - 1);
			showStats(col,e.value);
		}
	}
}

const showStats = async (col,team) => {

	let results = await getData();	
	let season = getSeason();	
	
	//get subset of data for the given season
	var subset = [];
	var j = 0;
	for (var i=0; i < results.length; i++) {
		var result = results[i];	
		if (result[2]==season) {					
			subset[j] = result;
			j++;
		}
	}

	if (subset.length > 0) { 
		
		// initialize variables
		var hp = 0;
		var hw = 0;
		var hd = 0;
		var hl = 0;
		var hgf = 0;
		var hga = 0;

		var ap = 0;
		var aw = 0;
		var ad = 0;
		var al = 0;
		var agf = 0;
		var aga = 0;
		
		var games = [];
		var hform = [];
		var aform = [];
		var forma = [];

		// get stats from subset		
		for (var j = subset.length - 1; j >= 0 ; j--) {
			
			var gdate = subset[j][3];
			var ht = subset[j][5];
			var at = subset[j][6];
			var gf = subset[j][9];
			var ga = subset[j][10];
			
			if ( gf != null ) {
				// home
				if ( ht == team ) {
					hp = hp + 1;
					hgf = hgf + Number(gf);
					hga = hga + Number(ga);
					if (gf > ga) {
						hw = hw + 1;
						hform.push("W");
						forma.push("W");
					} else if (gf < ga) {
						hl = hl + 1;
						hform.push("L");
						forma.push("L");					
					} else {
						hd = hd + 1;
						hform.push("D");
						forma.push("D");					
					}
					games.push([gdate, ht, at, gf, ga]);
				}	
					
				// away
				if ( at == team ) {
					ap = ap + 1;
					agf = agf + Number(ga);
					aga = aga + Number(gf);
					if (gf < ga) {
						aw = aw + 1;
						aform.push("W");
						forma.push("W");					
					} else if (gf > ga) {
						al = al + 1;
						aform.push("L");
						forma.push("L");					
					} else {
						ad = ad + 1;
						aform.push("D");
						forma.push("D");					
					}
					games.push([gdate, ht, at, gf, ga]);
				}
			}
		}	

		// outcome and goals
		var p = hp + ap;
		var w = hw + aw;
		var d = hd + ad;
		var l = hl + al;
		var gf = hgf + aga;
		var ga = hga + agf;
					
		var tbl = document.getElementById("outcome" + col);
		tbl.rows[1].cells[1].innerText = hp;
		tbl.rows[1].cells[2].innerText = hw;
		tbl.rows[1].cells[3].innerText = hd;		
		tbl.rows[1].cells[4].innerText = hl;			
		tbl.rows[1].cells[5].innerText = hgf;
		tbl.rows[1].cells[6].innerText = hga;	
		if (hp!==0) { 
			tbl.rows[2].cells[0].innerText = (hw/hp*100).toFixed(1) + "%"; 		
			tbl.rows[2].cells[1].innerText = (hd/hp*100).toFixed(1) + "%"; 
			tbl.rows[2].cells[2].innerText = (hl/hp*100).toFixed(1) + "%";
			tbl.rows[2].cells[3].innerText = (hgf/hp).toFixed(2);	
			tbl.rows[2].cells[4].innerText = (hga/hp).toFixed(2);	
		} // tbl.rows[2].children.innerText = "";

		tbl.rows[3].cells[1].innerText = ap;
		tbl.rows[3].cells[2].innerText = aw;
		tbl.rows[3].cells[3].innerText = ad;
		tbl.rows[3].cells[4].innerText = al;
		tbl.rows[3].cells[5].innerText = agf;
		tbl.rows[3].cells[6].innerText = aga;	
		if (ap!==0) { 
			tbl.rows[4].cells[0].innerText = (aw/ap*100).toFixed(1) + "%";		
			tbl.rows[4].cells[1].innerText = (ad/ap*100).toFixed(1) + "%";
			tbl.rows[4].cells[2].innerText = (al/ap*100).toFixed(1) + "%";	
			tbl.rows[4].cells[3].innerText = (agf/ap).toFixed(2);	
			tbl.rows[4].cells[4].innerText = (aga/ap).toFixed(2);				
		}
		
		tbl.rows[5].cells[1].innerText = p;
		tbl.rows[5].cells[2].innerText = w;			
		tbl.rows[5].cells[3].innerText = d;			
		tbl.rows[5].cells[4].innerText = l;			
		tbl.rows[5].cells[5].innerText = gf;			
		tbl.rows[5].cells[6].innerText = ga;		
		if (p!==0) { 
			tbl.rows[6].cells[0].innerText = (w/p*100).toFixed(1) + "%";
			tbl.rows[6].cells[1].innerText = (d/p*100).toFixed(1) + "%";		
			tbl.rows[6].cells[2].innerText = (l/p*100).toFixed(1) + "%"; 
			tbl.rows[6].cells[3].innerText = (gf/p).toFixed(2);	
			tbl.rows[6].cells[4].innerText = (ga/p).toFixed(2);				
		}
		
		// form and ppg
		var tbl = document.getElementById("form" + col);

		// form 
		for (var c = 0; c < 5; c++) {
			tbl.rows[1].cells[c+1].innerText = "";	
			tbl.rows[2].cells[c+1].innerText = "";	
			tbl.rows[3].cells[c+1].innerText = "";	
			tbl.rows[1].cells[c+1].style.background = '#fafafa';
			tbl.rows[2].cells[c+1].style.background = '#fafafa';
			tbl.rows[3].cells[c+1].style.background = '#fafafa';

			if (hform[c]!=null) { 
				tbl.rows[1].cells[c+1].innerText = hform[c];
				tbl.rows[1].cells[c+1].style.background = fcolor(hform[c]);
			}
			if (aform[c]!=null) { 
				tbl.rows[2].cells[c+1].innerText = aform[c];
				tbl.rows[2].cells[c+1].style.background = fcolor(aform[c]);
			}
			if (forma[c]!=null) { 
				tbl.rows[3].cells[c+1].innerText = forma[c];
				tbl.rows[3].cells[c+1].style.background = fcolor(forma[c]);
			}
		}	
				
		// ppg
		if (hp!==0) { 
			var hppg = ((hw * 3) + hd)/hp;
			tbl.rows[1].cells[6].innerText = hppg.toFixed(2);
		} else { tbl.rows[1].cells[6].innerText = ""; }
 		if (ap!==0) { 
			var appg = ((aw * 3) + ad)/ap;
			tbl.rows[2].cells[6].innerText = appg.toFixed(2);
		} else { tbl.rows[2].cells[6].innerText = ""; }
		if (p!==0) { 
			var ppg = ((w * 3) + d) / p;
			tbl.rows[3].cells[6].innerText = ppg.toFixed(2);
		} else { tbl.rows[3].cells[6].innerText = ""; }
		
		// results ----------------------------------------
		var tbl = document.getElementById("results" + col);
		
		// clear table/remove rows
		for (var r = 1; r < tbl.rows.length; r++) {
			tbl.rows[r].innerHTML = "";
		}
		
		for (var r = 0; r < games.length; r++) {
			
			var row = tbl.insertRow(r+1);
			
			for (var c = 0; c < 4; c++) {
				row.insertCell(c);
			}

			var hg = Number(games[r][3]);
			var ag = Number(games[r][4]);
			tbl.rows[r+1].cells[0].innerText = games[r][0];			
			tbl.rows[r+1].cells[1].innerText = games[r][1];
			tbl.rows[r+1].cells[2].innerText = games[r][2];			
			tbl.rows[r+1].cells[3].innerText = hg + " - " + ag;	
		}
	} else {
		//no data
	}

}

function fcolor(f) {
	if (f == "W") {
		return '#C6EFCE';
	} else if (f == "D") {
		return '#FFEB9C';		
	} else {
		return '#FFC7CE';
	}
}


// Standings ------------------------------------------------------------------------------------------------------------------
const getStands = async () => {

	let results = await getData();	
	var season = getSeason();	
	
	//get teams
	var allteams = [];
	var subset = [];
	var j = 0;
	
	for (var i=0; i < results.length; i++) {
		
		var result = results[i];
		
		if ( result[2] == season && result[9] != null ) {			
			allteams.push(result[5],result[6]);
			
			//create new array (subset)
			subset[j] = result;
			j++;
		}
	}

	var teams = new Set(allteams);  //array with unique teams in that season

	var table = [];
	var i = 0;
	
	teams.forEach (function(team) {
		
		var hp = 0;
		var hw = 0;
		var hd = 0;
		var hl = 0;
		var hgf = 0;
		var hga = 0;

		var ap = 0;
		var aw = 0;
		var ad = 0;
		var al = 0;
		var agf = 0;
		var aga = 0;

		for (var j=0; j < subset.length; j++) {
	
			//home
			if ( team == subset[j][5] ) {
				hp = hp + 1;
				hgf = hgf + Number(subset[j][9]);
				hga = hga + Number(subset[j][10]);
				
				if ( subset[j][9] > subset[j][10] ) {
					hw = hw + 1;
				} else if ( subset[j][9] < subset[j][10] ) {
					hl = hl + 1;
				} else {
					hd = hd + 1;
				}
			}
			
			//away
			if ( team == subset[j][6] ) {
				ap = ap + 1;
				agf = agf + Number(subset[j][10]);
				aga = aga + Number(subset[j][9]);
				
				if ( subset[j][10] > subset[j][9] ) {
					aw = aw + 1;
				} else if ( subset[j][9] > subset[j][10] ) {
					al = al + 1;
				} else {
					ad = ad + 1;
				}
			}		
		
		}
		
		table[i] = [team,hp,hw,hd,hl,hgf,hga,ap,aw,ad,al,agf,aga];
		i++;
	})

	showStands (table);
}

function showStands (stands) {

	if (stands.length > 0) {
		var tbl = document.getElementById("stand");	
		var place = [];
		var team = [];
		var p = [];
		var w = [];
		var d = [];
		var l = [];
		var gf = [];
		var ga = [];
		var gd = [];
		var pts = [];
		var ppg = [];
		
		for (var i=0; i < stands.length; i++) {
			
			var row = tbl.insertRow(tbl.rows.length);
			var stand = stands[i];			
			
			team [i] = stand[0];
			p [i] = Number(stand[1]) + Number(stand[7]);
			w [i] = Number(stand[2]) + Number(stand[8]);			
			d [i] = Number(stand[3]) + Number(stand[9]);
			l [i] = Number(stand[4]) + Number(stand[10]);			
			gf [i] = Number(stand[5]) + Number(stand[11]);
			ga [i] = Number(stand[6]) + Number(stand[12]);
			gd [i] = gf[i] - ga[i];
			pts [i] = (w[i] * 3) + d[i];
			ppg [i] = pts[i] / p[i];			
			for (var c = 0; c < 24; c++){
				row.insertCell(c);	
			}
		}
		
		//assign the place in table
		for (var i=0; i < stands.length; i++) {
			place[i] = 1;
			for (var j=0; j < stands.length; j++) {
				if ( i !== j ) {
					if ( pts[i] < pts[j] ) {
						place[i] = place[i]+1;
					} else if ( pts[i] == pts[j] ) {
						if ( gd[i] < gd[j] ) {
							place[i] = place[i]+1;						
						} else if ( gd[i] == gd[j] ) {
							if ( gf[i] < gf[j] ) {
								place[i] = place[i]+1;	
							} else if ( gf[i] == gf[j] ) {
								if ( ga[i] > ga[j] ) {
									place[i] = place[i]+1;									
								} else if ( ga[i] == ga[j] ) {
									//if all previous stats are equal, sort by name
									if ( team[i] > team[j] ) {
										place[i] = place[i]+1;		
									}
								}
							}	
						}
					}
				}
			}				
		}
	
		for (var i=0; i < stands.length; i++) {
			
			var stand = stands[i];	
			var id = place[i] + 1;
			var row = tbl.rows[id];
			
			//add values
			for (var c = 0; c < 24; c++){
				var cell = row.cells[c];							
				if (c < 14) {
					if (c==0) {
						cell.className = "teamimg";
						cell.innerHTML = '<img src="logos/' + stand[0] + '.png">';	
					} else {
						if (c==1) {
							cell.className = 'team';
						}
						cell.innerText = stand[c-1];	
					}
				}
			}
			
			var c = 14;
			row.cells[c].innerText = p[i];
			row.cells[c+1].innerText = w[i];	
			row.cells[c+2].innerText = d[i];	
			row.cells[c+3].innerText = l[i];	
			row.cells[c+4].innerText = gf[i];	
			row.cells[c+5].innerText = ga[i];	
			row.cells[c+6].innerText = gd[i];	
			row.cells[c+7].innerText = ppg[i].toFixed(2);	
			row.cells[c+8].innerHTML = '<b>' + pts[i] + '</b>';				
			row.cells[c+9].innerHTML = '<label class="place">' + place[i] + '</label>';	
		}

	} else {
		document.getElementById("msg").innerText = "There is no data available for that period";
	}
}


// Results  --------------------------------------------------------------------------------------------------------------------
const showResults = async () => {

	let results = await getData();	
	var season = getSeason();
	
	if (results.length > 0) {
		var tbl = document.getElementById("results");	
		var games_played = 0;
		var total_games = 0;
		var gf = 0;
		var ga = 0;
		var r = 0;

		for (var i=0; i < results.length; i++) {
			var result = results[i];			

			if (result[2]==season) {

				var htg = result[9];
				var atg = result[10];
				var htyc = result[11];
				var htrc = result[12];
				var atyc = result[13];
				var atrc = result[14];
				var htcards = "";
				var atcards = "";
				total_games++;			
				
				if ( htg != null ) {
					var row = tbl.insertRow(tbl.rows.length);				
					
					//season summary stats
					games_played++;
					gf = gf + parseInt(htg);
					ga = ga + parseInt(atg);

					//highlight winner
					for (var c = 0; c < 8; c++){
						var cell = row.insertCell(c);			
						if (c==2 && htg > atg) {
							cell.style='font-weight:bold';
						}
						if (c==3 && atg > htg) {
							cell.style='font-weight:bold';
						}
					}
					
					//add values
					r = r + 1;
					tbl.rows[r].cells[0].innerText = result[3];
					tbl.rows[r].cells[1].innerText = result[4];
					tbl.rows[r].cells[2].innerText = result[5];
					tbl.rows[r].cells[3].innerText = result[6];
					tbl.rows[r].cells[4].innerText = result[7] + " - " + result[8];
					tbl.rows[r].cells[5].innerHTML = '<b>' + result[9] + " - " + result[10] + '</b>';
					
					if (htyc > 0) { htcards = htcards + '<label class="yellow">' + result[11] + '</label>'; }
					if (htrc > 0) { htcards = htcards + '<label class="red">' + result[12] + '</label>'; }
					//if (htyc == 0 && htrc == 0) { htcards = '-'; }
					tbl.rows[r].cells[6].innerHTML = htcards;	

					if (atyc > 0) { atcards = atcards + '<label class="yellow">' + result[13] + '</label>'; }
					if (atrc > 0) { atcards = atcards + '<label class="red">' + result[14] + '</label>'; }
					//if (atyc == 0 && htrc == 0) { atcards = '-'; }			
					tbl.rows[r].cells[7].innerHTML = atcards;
				}
			}
		}
		
		showSeasonSummary(total_games,games_played,gf,ga);
		if (total_games==0) {
			document.getElementById("msg").innerText = "There is no data available for that period";			
		}
	} else {
		document.getElementById("msg").innerText = "There is no data available for that period";
	}
}

