$(document).ready(function(){

  var PLAYERS_ID = 171759;
  var MATCHES_ID = 171760;

  var matches = [];
  var players = [];

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

      updateMatchList();
  }

  function updateMatchList(){
     getMatchList();
    showMatchList();

  }
  function updateRanking(){

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
    if (SenseApi.getSensorDataGet(PLAYERS_ID, params)) {
      players = JSON.parse(JSON.parse(SenseApi.getResponseData()).data[0].value);
      return true;
    } else {
      $("p#error").html("Cannot get player list!");
      return false;
    }

  }
  function getMatchList(){
      var params = {
              "sort" : "DESC"
      };
      if (SenseApi.callSensorDataGet(MATCHES_ID, params)) {
        console.log(SenseApi.getResponseData());
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
        console.log(html_string);
        $("#match-history").html(html_string);


  }

  init();
});
