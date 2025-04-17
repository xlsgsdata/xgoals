function loadingStandings () {
	document.getElementById('a_standings').style.color = 'red';	
	initializeLeagues();
	initializeSeasons();
	getStands();	
}

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

