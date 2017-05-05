jQuery(document).ready(function ($) {
    var currentURL = "";
    $lowerAZ = "abcdefghijklmnopqrstuvwxyz";
    $upperAZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    $nums = "0123456789";
    //async password generation
    $('#pass_form').validator().submit(function (e) {
        e.preventDefault();
        if (($('#genbtn').hasClass('disabled'))) {
        } else {
            populateTable();
            $('#newpass').modal('toggle');
        }
    });
    $('#acc_info1').validator().submit(function (e) {
        if (($('#emailbtn').hasClass('disabled'))) {
        } else {
            $email = document.getElementById("acc_mail").value;
            var user = firebase.auth().currentUser;
            user.updateEmail($email).then(function() {
                    document.getElementById("acc_info1").reset();
                    makeAlert("Successfully changed email");
                }, function(error) {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    if (errorCode == 'auth/invalid-email') {
                        makeError("Invalid email address");
                    }
                    console.log(errorCode);
                    console.log(errorMessage);
                });
        }
    });
     $('#acc_info2').validator().submit(function (e) {
         if (($('#passbtn').hasClass('disabled'))) {
        } else {
             $pass = document.getElementById("acc_pass").value;
             var user = firebase.auth().currentUser;
             user.updatePassword($pass).then(function() {
                  document.getElementById("acc_info2").reset();
                  makeAlert("Successfully changed password");
                }, function(error) {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    if (errorCode == 'auth/weak-password') {
                        makeError("Please use a stronger password")
                    }
                    console.log(errorCode);
                    console.log(errorMessage);
                });
        }
    });
    function makeAlert(message){
        $('#alert_placeholder').hide().html('<div class="alert alert-info alert-dismissable fade-alert" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><span>'+message+'</span></div>').fadeIn(800);
    }
    function makeError(message){
        $('#alert_placeholder').hide().html('<div class="alert alert-danger alert-dismissable fade-alert" style="color: #b30000" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><span>'+message+'</span></div>').fadeIn(800);
    }
    function initApp() {
      // Listening for auth state changes.
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
          // User is signed in.
          var uid = user.uid;
          populateTable();
        } else {
          // User is signed out.
          window.location.replace("https://realrandom.co/new/signin");
        }
        });
    };
    window.onload = function() {
        initApp();
    };
    $("#signOut a").click(function() {
       firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
            firebase.auth().signOut();
            window.location.replace("https://realrandom.co/new/signin");
          }
        });
    });
    window.onbeforeunload = function(){
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
            firebase.auth().signOut();
            window.location.replace("https://realrandom.co/new/signin");
          }
        });
    }
    function populateTable(){
        var user = firebase.auth().currentUser;
        var uid = user.uid;
        var database = firebase.database();
        $("#passTable tbody tr").remove();
        return firebase.database().ref('web-users/'+uid).once('value').then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var childData = childSnapshot.val();
                var row = $("<tr>");
                var pass = childData.pass;
                pass = CryptoJS.AES.decrypt(pass, uid);
                pass = pass.toString(CryptoJS.enc.Utf8);
                row.append($("<td>"+childSnapshot.key.replace("_", ".")+"</td>"))
                    .append($("<td>"+childData.user+"</td>"))
                    .append($("<td>"+pass+"<a class='btn-edit' style='float:right;' ><i class='fa fa-trash-o'></i></a></td>"));
                $("#passTable tbody").append(row);
            });
        });
    }
    $(document).on("click", "#partsTable tbody tr", function(e) {
        var tr = $(this);
        var part = "";
        var num = "";
        $('td', tr).each(function(i, td){
            if(td.cellIndex == 0){
                num = $(td).text();
            }
            else if(td.cellIndex == 1){
                part = $(td).text();
            }
            else if(td.cellIndex == 3 && ($(td).text()).indexOf("Checked") != -1){
                $("#editTableLabel").html("Check In");
                $("#partnum").html("Part Number: "+num);
                $("#partname").html("Part Name: "+part);
                $("#checkbtn").html("Check In");
            }
            else if(td.cellIndex == 3 && ($(td).text()).indexOf("Available") != -1){
                var quantity = parseInt($(td).text().match(/\d+/g));
                $("#editTableLabel").html("Check Out");
                $("#partnum").html("Part Number: "+num);
                $("#partname").html("Part Name: "+part);
                $("#checkbtn").html("Check Out");
                $("#quantity").prop('max',quantity);
            }
        });
        $('#editTable').modal('toggle');
    });
    $('#edit_user').validator().submit(function (e) {
        e.preventDefault();
         if (($('#userbtn').hasClass('disabled'))) {
        } else {
            var username = document.getElementById("edituser").value;
            var user = firebase.auth().currentUser;
            var uid = user.uid;
            var database = firebase.database();
            firebase.database().ref('web-users/'+uid).once('value').then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    var childData = childSnapshot.val();
                    if(childSnapshot.key === currentURL){
                        var password = childData.pass;
                        firebase.database().ref("web-users/"+uid+"/"+currentURL).set({
                            user:username,
                            pass:password
                        });
                        $("#formout").fadeOut(300);
                        $("#form-output").html("Successfully updated");
                        $("#formout").fadeIn(800);
                        populateTable();
                    }
                });
            });
        }
    });
    $('#edit_pass').validator().submit(function (e) {
        e.preventDefault();
         if (($('#gennewbtn').hasClass('disabled'))) {
        } else {
            var length = document.getElementById("editlength").value;
            var syms = document.getElementById("editsyms").value;
            var uppercaseValue = $('#editupper:checked').val();
            var numsValue = $('#editnums:checked').val();
            var chars = $lowerAZ + syms;
            if (uppercaseValue) {
                chars += $upperAZ;
            }
            if (numsValue) {
                chars += $nums;
            }
            var user = firebase.auth().currentUser;
            var uid = user.uid;
            var database = firebase.database();
            firebase.database().ref('web-users/'+uid).once('value').then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    var childData = childSnapshot.val();
                    if(childSnapshot.key === currentURL){
                        var username = childData.user;
                        firebase.database().ref("web-users/"+uid+"/"+currentURL).set({
                            user:username,
                            pass:encrypted.toString()
                        });
                        $("#formout").fadeOut(300);
                        $("#form-output").html("Successfully updated");
                        $("#formout").fadeIn(800);
                        populateTable();
                    }
                });
            });
        }
    });
    // Close nav on scroll on mobile
    $(window).scroll(function () {
        if(($(window).width() <= 768) && ($("#wrapper").hasClass("toggled"))){
            $("#wrapper").toggleClass("toggled");
        }
    });
});
