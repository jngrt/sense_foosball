$(document).ready(function(){

  var PLAYERS_ID = 171759;
  var MATCHES_ID = 171760;
  var K = 32;

  var matches = [];
  var players = [];
  var ranking = [];

  function init(){
    
    if( sessionStorage.getItem("sessionId") ){
      SenseApi.setSessionId( sessionStorage.getItem("sessionId"));
      showMain();
    }else
      showLogin();


    //loadPlayerList();
  }
  function showLogin(){
      $(".container#main").hide(); 
      $(".container#login").show(); 
  }
  function showMain(){
      $(".container#main").show(); 
      $(".container#login").hide(); 

      getPlayerList();
      updateMatchList();
      updateRanking();
      showInputFields();
  }

  function updateMatchList(){
     getMatchList();
    showMatchList();

  }
  function updateRanking(){
    calculateRanking();
    showRanking();
  }
  
  $("#login-form").on("submit",function(e){
    e.preventDefault();

    console.log($("#login-form #password").val());

    var pass = $("#login-form #password").val();
    var passhash = CryptoJS.MD5(pass).toString();
    if( SenseApi.authenticateSessionId("sense-foosball",passhash)){
      sessionStorage.setItem("sessionId", SenseApi.getSessionId());
      showMain();
    }
  });
  
  function getPlayerList(){
    var params = { "last" : 1};
    if (SenseApi.callSensorDataGet(PLAYERS_ID, params)) {
      players = JSON.parse(JSON.parse(SenseApi.getResponseData()).data[0].value);
      console.log(players);
      return true;
    } else {
      $("p#error").html("Cannot get player list!");
      return false;
    }

  }
  
  function calculateRanking(){ 
    
    ranking = [];
    ranking = players.sort(function(a,b){
      if(a.rating > b.rating) return -1;
      if(a.rating < b.rating) return 1;
      return 0;
    });

  }
  function showRanking(){
    var html_string = "";
    //rank, score, name
    for( var i = 0;i<ranking.length;i++){
      html_string += "<tr><td>"+(i+1)+"</td>"+
                  "<td>"+ranking[i].rating+"</td>"+
                  "<td>"+ranking[i].name+"</td></tr>";

    }
    $("#ranking").html(html_string);


  }

  function getMatchList(){
      var params = {
              "sort" : "DESC"
      };
      if (SenseApi.callSensorDataGet(MATCHES_ID, params)) {
        //console.log(SenseApi.getResponseData());
              matches = JSON.parse(SenseApi.getResponseData()).data;
              return true;
      } else {
              $("p#error").html("Cannot get match history!");
              return false;
      }

  }

  function showMatchList(){
    	var html_string = "";
        
        for ( var i = 0; i < matches.length; i++) {
		var date = new Date(parseInt(matches[i].date) * 1000);
		var m = JSON.parse(matches[i].value);
                var score1 = parseInt(m.score.split("-")[0]);
		var score2 = parseInt(m.score.split("-")[1]);
		var score,win,lose;
		
                if (score1 > score2) {
	          win = m.team1.join(", ");
                  lose = m.team2.join(", ");
                  score = score1 + "-" + score2;
                }else{
                  win = m.team2.join(", ");
                  lose = m.team1.join(", ");
                  score = score2 + "-" + score1; 
                }

                html_string += "<tr><td>" + date.toDateString() + "</td>"+
                              "<td>" + win + "</td><td>" + score + "</td>"+
                              "<td>" + lose + "</td></tr>";
	}
        //console.log(html_string);
        $("#match-history").html(html_string);


  }

  function showInputFields(){
    
      $("#score-block select").empty().append("<option value='-1'>Select a player</option>");

      for( var i=0;i<players.length;i++){
          $("#score-block select").append("<option value='"+i+"'>"+players[i].name+"</option>"); 
      }

      $("#submit").click(submit);
  }

  function submit(){
    if( $("#team1player1").val() > -1 &&
        $("#team2player1").val() > -1){
      if( $("#team1player2").val() > -1 &&
          $("#team2player2").val() > -1){
        submit2v2();
        return;
      } 
      submit1v1();
      return;
    }
    alert("Select at least two players");

  }


  function submit1v1() {
	var p1 = $("#team1player1").val();
	var p2 = $("#team2player1").val();
	
	if (p1 == p2) {
		alert("Select two different players!");
		return;
	}
	
	var score_t1 = parseInt($("input#team1score").val());
	var score_t2 = parseInt($("input#team2score").val());
	
	console.log(players[p1].name+" vs "+players[p2].name+": "+score_t1+"-"+score_t2);
	m = {"team1":[players[p1].name], "team2":[players[p2].name], "score":+score_t1+"-"+score_t2};
	console.log(m);

	var QA = Math.pow(10, players[p1].rating/400);
	var QB = Math.pow(10, players[p2].rating/400);
	var EA = QA/(QA+QB);
	var EB = QB/(QA+QB);
	var SA = (score_t1 > score_t2) ? 1 : 0;
	var SB = 1 - SA;
	var RA = players[p1].rating + K * (SA - EA);
	console.log("QA: "+QA+" EA: "+EA+" SA: "+SA+" RA: "+RA);
	var RB = players[p2].rating + K * (SB - EB);
	console.log("QB: "+QB+" EB: "+EB+" SB: "+SB+" RB: "+RB);
	
	players[p1].rating = RA;
	players[p2].rating = RB;
	
	SubmitMatch(m);
	SubmitNewRatings();
}

  function submit2v2() {
	var p1 = $("#team1player1").val();
	var p2 = $("#team1player2").val();
	var p3 = $("#team2player1").val();
	var p4 = $("#team2player2").val();

	if (p1 == p2 || p1 == p3 || p1 == p4 || p2 == p3 || p2 == p4 || p3 == p4) {
		alert("Select four different players!");
		return;
	}

	var t1 = (players[p1].rating+players[p2].rating)/2;
	var t2 = (players[p3].rating+players[p4].rating)/2;

	var score_t1 = parseInt($("input#team1score").val());
	var score_t2 = parseInt($("input#team2score").val());
	
	console.log(players[p1].name+" vs "+players[p2].name+": "+score_t1+"-"+score_t2);

	m = { "team1":[players[p1].name, players[p2].name], 
              "team2":[players[p3].name, players[p4].name], 
              "score":+score_t1+"-"+score_t2};

	console.log(m);
	
	var QA = Math.pow(10, t1/400);
	var QB = Math.pow(10, t2/400);
	var EA = QA/(QA+QB);
	var EB = QB/(QA+QB);
	var SA = (score_t1 > score_t2) ? 1 : 0;
	var SB = 1 - SA;
	var mod_team1 = K * (SA - EA);
	var mod_team2 = K * (SB - EB);

	console.log("QA: "+QA+" EA: "+EA+" SA: "+SA+" mod_team1: "+mod_team1);
	console.log("QB: "+QB+" EB: "+EB+" SB: "+SB+" mod_team2: "+mod_team2);
	
		
	players[p1].rating += mod_team1/2;
	players[p2].rating += mod_team1/2;
	players[p3].rating += mod_team2/2;
	players[p4].rating += mod_team2/2;
	
	console.log(players);
	SubmitMatch(m);
	SubmitNewRatings();
}

function SubmitNewRatings () {
	if (SenseApi.callSensorDataPost(PLAYERS_ID, {"data":[{"value":players}]}))
          console.log("ratings submit succes");
	else 
		alert("Submitting new rankings failed!");
}

function SubmitMatch(m) {
	if (SenseApi.callSensorDataPost(MATCHES_ID, {"data":[{"value":m}]}))
		return;
	else
		alert("Submitting match failed!");
}


  init();
});
