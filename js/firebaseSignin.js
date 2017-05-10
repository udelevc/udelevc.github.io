jQuery(document).ready(function ($) {
    var newuser = false;
    var name = "";
    $('#regform').validator().submit(function (e) {
        e.preventDefault();
        if (($('#regbtn').hasClass('disabled'))) {
        } else {
            $fname = document.getElementById("fname").value;
            $lname = document.getElementById("lname").value;
            $email = document.getElementById("email").value;
            $password = document.getElementById("pass3").value;
            firebase.auth().createUserWithEmailAndPassword($email, $password).catch(function(error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                if (errorCode == 'auth/weak-password') {
                    makeError("Please use a stronger password")
                }
            });
            name = $fname+" "+$lname;
            document.getElementById("regform").reset();
            newuser = true;
            makeAlert("Please check your email, and click the verification link");
        }
    });
    $('#loginform').validator().submit(function (e) {
        e.preventDefault();
        if (($('#loginbtn').hasClass('disabled'))) {
        } else {
            $email = document.getElementById("email3").value;
            $password = document.getElementById("pass1").value;
            firebase.auth().signInWithEmailAndPassword($email, $password).catch(function(error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                if (errorCode === 'auth/wrong-password') {
                    makeError("Wrong Email and/or Password")
                } else if (errorCode == 'auth/invalid-email') {
                    makeError("Please enter a valid email address");
                } else if (errorCode == 'auth/user-not-found') {
                    makeError("User not found");
                }
            });
        }
    });
    $('#forgotemail').validator().submit(function (e) {
        e.preventDefault();
        if (($('#forgotbtn').hasClass('disabled'))) {
        } else {
            var auth = firebase.auth();
            var email = document.getElementById("email4").value;
            if(email != ""){
                auth.sendPasswordResetEmail(email).then(function() {
                  makeAlert("Password Recovery Email Sent");
                }, function(error) {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    if (errorCode == 'auth/invalid-email') {
                        makeError("Please enter a valid email address");
                    } else if (errorCode == 'auth/user-not-found') {
                        makeError("User not found");
                    }
                });
                document.getElementById("forgotemail").reset();
                $("#forgotform").hide();
                $("#logindiv").fadeIn(800);
                $("#forgotbtn").fadeIn(800);
            }
        }
    });
    $('#forgotbtn').click(function(){
        document.getElementById("loginform").reset();
        $("#forgotform").fadeIn(800);
        makeAlert("Please enter your email");
        $("#logindiv").hide();
        $("#forgotbtn").hide();
    });
    function makeAlert(message){
        $('#alert_placeholder').hide().html('<div class="alert alert-info alert-dismissable fade-alert" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><span>'+message+'</span></div>').fadeIn(800);
    }
    function makeError(message){
        $('#alert_placeholder').hide().html('<div class="alert alert-danger alert-dismissable fade-alert" style="color: #b30000" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><span>'+message+'</span></div>').fadeIn(800);
    }
    function sendEmailVerification() {
      firebase.auth().currentUser.sendEmailVerification().then(function() {
      });
    }
    function initApp() {
      // Listening for auth state changes.
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            var emailVerified = user.emailVerified;
            if(newuser){
                user.updateProfile({
                    displayName: name
                }).then(function() {
                    // Update successful.
                }, function(error) {
                    console.log("error");
                });
                sendEmailVerification();
                newuser = false;
            }
          else if (emailVerified) {
            window.location.replace("../dashboard/index.html");
          }
          else{
             makeAlert("Please check your email, and click the verification link");
          }
        } else {
            console.log("signed out");
          // User is signed out.
        }
      });
    }
   initApp();
    window.onbeforeunload = function(){
        var user = firebase.auth().currentUser;
        if (user) {
            var emailVerified = user.emailVerified;
            if( !emailVerified ){
                firebase.auth().signOut();
            }
          }
    }
});
