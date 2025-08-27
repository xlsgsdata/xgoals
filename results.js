function loadingResults () {
	document.getElementById('a_results').style.color = 'red';	
	initializeLeagues();
	initializeSeasons();
	showResults();	
}

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
				total_games++;			
				
				if ( htg != null ) {
					var row = tbl.insertRow(tbl.rows.length);				
					
					//season summary stats
					games_played++;
					gf = gf + parseInt(htg);
					ga = ga + parseInt(atg);

					//highlight winner
					for (var c = 0; c < 6; c++){
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
