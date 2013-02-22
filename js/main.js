$(document).ready(function(){

  var PLAYERS_ID = 171759;
  var MATCHES_ID = 171760;

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
    var passhash = CryptoJS.MD5(pass);
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

  init();
});
