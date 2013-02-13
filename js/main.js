$(document).ready(function(){


  function init(){
    
    if( sessionStorage.getItem("sessionId") ){
      SenseApi.setSessionId( sessionStorage.getItem("sessionId"));
      showMain();
    }else
      showLogin();
  }
  function showLogin(){
      $(".container#main").hide(); 
      $(".container#login").show(); 
  }
  function showMain(){
      $(".container#main").show(); 
      $(".container#login").hide(); 
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
  

  init();
});
