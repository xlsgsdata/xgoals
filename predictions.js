google.charts.load('current', {packages: ['corechart']});
google.charts.setOnLoadCallback(showOutcomeChart);

function loadingPredictions () {
	document.getElementById('a_predictions').style.color = 'red';
	var next = localStorage.getItem("next");
	if (next == null) { next = 5; }
	document.getElementById("next").value = next;
	initializeLeagues();
	initializePredictionsSeason();
	filterData();	
}

function initializePredictionsSeason() {
	let current = getCurrentSeason();
	document.getElementById('season').innerHTML = '<option>' + current + '</option>';
	document.getElementById('today').innerHTML = getTodayDate()[0] + "-" + getTodayDate()[1] + "-" + getTodayDate()[2];		
}

function getPrevSeasons() {
	let numberOfSeasons = 3; // number of seasons of data to include in the model (including current)
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
		if ( hp+ap >= 3 ) {
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
			if ( win > 0.45 ) {
				var result = "1";
				var prob = win;
			} else if ( lose > 0.5 ) {
				var result = "2";
				var prob = lose;
			} else {
				if ( win+draw > 0.65 ) {
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

	var row = (r.rowIndex) - 2;
	var htgexp = document.getElementById("htge"+row).innerText;
	var atgexp = document.getElementById("atge"+row).innerText;

	if (htgexp!='NaN' && atgexp!='NaN') { 
	
		document.getElementById("details").style.display = 'block';
		document.getElementById("hometeam").innerText = ht;
		document.getElementById("awayteam").innerText = at;
		document.getElementById("homelogo").src = 'logos/' + ht + '.png';
		document.getElementById("awaylogo").src = 'logos/' + at + '.png';	

		var htge = getDirectEstimate(htgexp,atgexp)[0];
		var atge = getDirectEstimate(htgexp,atgexp)[1];
		
		if (htge!=null && atge!=null) {
			showOutcome(htge,atge);
			showOutcomeChart(htge,atge);	
			showOverUnder(htge,atge);
			showScoreline(htge,atge);
		}

	} else {
		document.getElementById("details").style.display = 'none';
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


