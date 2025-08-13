function updateLeague() {
	let league = document.getElementById('league').value;
	if (league!="SPAIN PRIMERA DIVISION") {
		document.getElementById('league').value = "SPAIN PRIMERA DIVISION";
		alert ("NOT available yet. Only SPAIN PRIMERA DIVISION is available for now.")
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

function refreshPage () {
	//add to localStorage
	var season = document.getElementById("season").value;
	localStorage.setItem('season', season);
	location.reload();
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
		let current = getCurrentSeason();
		let year = current.substring(0,4);
		var i = 0;
		for (var y = 2010; y <= year; y++) {
			var iopt = y + "-" + parseInt(y + 1);
			document.getElementById("season").options[i] = new Option(iopt);
			i++;
		}
		
		var season = localStorage.getItem('season');
		if (season!==null) {
			document.getElementById("season").value = season;		
		} else {
			document.getElementById("season").value = current;
		}
}

