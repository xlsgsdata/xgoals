function loadingStats () {
	document.getElementById('a_stats').style.color = 'red';	
	initializeLeagues();
	initializeSeasons();
	getStats();	
}

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

