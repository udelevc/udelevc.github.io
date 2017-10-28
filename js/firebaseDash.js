jQuery(document).ready(function ($) {
    initApp();
    var scanner;
    var current_camera;
    var mirror = true;
    var options1 = {
        valueNames: [ 'part_num', 'part_name', 'part_quant', 'part_status' ],
        item: '<tr><td class="part_num"></td><td class="part_name"></td><td class="part_quant"></td><td class="part_status"><i class="fa fa-check" style="color:green" aria-hidden="true"></i></td></tr>'
    };
    var partsList = new List('parts', options1);
    var options2 = {
        valueNames: [ 'alum_name', 'alum_email', 'alum_phone', 'alum_company' ],
        item: '<tr><td class="alum_name"</td><td class="alum_email"></td><td class="alum_phone"></td><td class="alum_company"></td></tr>'
    };
    $(document).on("click", "#partsTable thead tr th a", function(e) {
        e.stopPropagation();
        $('#newpart').modal('toggle');
    });
    $('#newpart_form').validator().submit(function (e) {
        e.preventDefault();
        if (($('#newpartbtn').hasClass('disabled'))) {
        } else {
            $newpart_name = document.getElementById("newpart_name").value;
            $newpart_quant = document.getElementById("newpart_quant").value;
            $newpart_num = document.getElementById("newpart_num").value;
            $newpart_consum = $('#newpart_consum:checked').val();
            var newconsum = false;
            if($newpart_consum){
                newconsum = true;
            }
            firebase.database().ref('inventory/'+$newpart_num).set({
                partname:$newpart_name,
                partquant:$newpart_quant,
                partconsum:newconsum,
                partstatus:"Available"
            });
            populateInventory();
            $('#newpart').modal('toggle');
        }
    });
    $('#checkoutpart_form').validator().submit(function (e) {
        e.preventDefault();
        if (($('#checkoutbtn').hasClass('disabled'))) {
        } else {
            var user = firebase.auth().currentUser;
            $checkoutpart_name = document.getElementById("checkpart_name").innerHTML;
            $checkoutpart_quant = document.getElementById("checkoutpart_quant").value;
            $checkoutpart_num = document.getElementById("checkpart_num").innerHTML;
            $checkoutpart_status = "";
            $checkoutpart_num = $checkoutpart_num.substr(13);
            var partquant = 0;
            var checkoutpart_consum = "off";
            var partstatus = "";
            firebase.database().ref('inventory').once('value').then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    var childData = childSnapshot.val();
                    if(childSnapshot.key == $checkoutpart_num ){
                        partquant = parseInt(childData.partquant);
                        checkoutpart_consum = childData.partconsum;
                        partstatus = childData.partstatus;
                    }
                });
            }).then(function(){
                partquant = partquant-parseInt($checkoutpart_quant);
                console.log(partstatus);
                if(partquant > 0){
                    $checkoutpart_status = "Available";
                }
                else if(checkoutpart_consum){
                    $checkoutpart_status = "Unavailable";
                }
                else{
                    if(partstatus.indexOf('out') == -1){
                        $checkoutpart_status = "Checked out by "+user.displayName;
                        $checkoutpart_name = $checkoutpart_name.substr(11);
                        firebase.database().ref('inventory/'+$checkoutpart_num).set({
                            partname:$checkoutpart_name,
                            partquant:partquant,
                            partconsum:checkoutpart_consum,
                            partstatus:$checkoutpart_status
                        }).then(function(){
                            populateInventory();
                            $('#checkoutpart_form')[0].reset();
                        })
                    }
                }
                $('#editPart').modal('toggle'); 
            });   
        }
    });
    $('#checkinpart_form').validator().submit(function (e) {
        e.preventDefault();
        if (($('#checkinbtn').hasClass('disabled'))) {
        } else {
            var user = firebase.auth().currentUser;
            $checkinpart_name = document.getElementById("checkpart_name").innerHTML;
            $checkinpart_quant = document.getElementById("checkinpart_quant").value;
            $checkinpart_num = document.getElementById("checkpart_num").innerHTML;
            $checkinpart_status = "";
            $checkinpart_num = $checkinpart_num.substr(13);
            var partquant = 0;
            var checkinpart_consum = "off";
            var partstatus = "";
            firebase.database().ref('inventory').once('value').then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    var childData = childSnapshot.val();
                    if(childSnapshot.key == $checkinpart_num ){
                        partquant = parseInt(childData.partquant);
                        checkinpart_consum = childData.partconsum;
                        partstatus = childData.partstatus;
                    }
                });
            }).then(function(){
                partstatus = partstatus.substr(15);
                if(!checkinpart_consum && partstatus != user.displayName){
                    console.log("You didn't check this out");
                    return;
                }
                partquant = partquant+parseInt($checkinpart_quant);
                if(partquant > 0 && !checkinpart_consum){
                    $checkinpart_status = "Available";
                    partquant = 1;
                }
                else if(partquant > 0){
                    $checkinpart_status = "Available";
                }
                else if(checkinpart_consum){
                    $checkinpart_status = "Unavailable";
                }
                else{
                    $checkinpart_status = "Checked out by "+user.displayName; 
                }
                $checkinpart_name = $checkinpart_name.substr(11);
                firebase.database().ref('inventory/'+$checkinpart_num).set({
                    partname:$checkinpart_name,
                    partquant:partquant,
                    partconsum:checkinpart_consum,
                    partstatus:$checkinpart_status
                }).then(function(){
                    populateInventory();
                    $('#checkinpart_form')[0].reset();
                    $('#editPart').modal('toggle'); 
                })
            });   
        }
    });
    $('#acc_info1').validator().submit(function (e) {
        e.preventDefault();
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
        e.preventDefault();
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
                populateInventory();
            } else {
                // User is signed out.
                window.location.replace("../signin/");
            }
        });
    };
    $("#signOut a").click(function() {
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                firebase.auth().signOut();
                window.location.replace("../signin/");
            }
        });
    });
    function populateInventory(){
        $("#partsTable tbody tr").remove();
        partsList.clear();
        return firebase.database().ref('inventory').once('value').then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var childData = childSnapshot.val();
                var partname = childData.partname;
                var partquant = childData.partquant;
                var partstatus = childData.partstatus;
                if(partstatus.indexOf("Available") != -1){
                    partstatus = '<i class="fa fa-check" style="color:green" aria-hidden="true"></i>'+partstatus;
                }
                else{
                    partstatus = '<i class="fa fa-times" style="color:red" aria-hidden="true"></i>'+partstatus;
                }
                partsList.add({
                    part_num: childSnapshot.key,
                    part_name: partname,
                    part_quant: partquant,
                    part_status: partstatus
                });
            });
        });
    }
    $(document).on("click", "#partsTable tbody tr", function(e) {
        var tr = $(this);
        var part = "";
        var num = "";
        $('td', tr).each(function(i, td){
            if(td.cellIndex == 0){
                $("#checkpart_num").html("Part Number: "+$(td).text());
            }
            else if(td.cellIndex == 1){
                $("#checkpart_name").html("Part Name: "+$(td).text());
                $("#checkPartLabel").html("Check "+$(td).text()+" in/out");
            }
            else if(td.cellIndex == 2){
                var quantity = parseInt($(td).text().match(/\d+/g));
                $("#checkoutpart_quant").prop('max',quantity);
            }
            else if(td.cellIndex == 3 && ($(td).text()).indexOf("Available") != -1){
                //
            }
        });
        $('#editPart').modal('toggle');
    });
    // Close nav on scroll on mobile
    $(window).scroll(function () {
        if(($(window).width() <= 1200) && ($("#wrapper").hasClass("toggled"))){
            $("#wrapper").toggleClass("toggled");
        }
    });
    $('#new_parts').validator().submit(function (e) {
        e.preventDefault();
        if (($('#partsbtn').hasClass('disabled'))) {
        } else {
            var data = getFormData();
            var url = 'https://script.google.com/a/udel.edu/macros/s/AKfycbyURk7IhKV40IwjvDWq5r4ZZDZAjDbCtUaMatMuVzk_zzMVhM6O/exec';
            var xhr = new XMLHttpRequest();
            xhr.open('POST', url);
            // xhr.withCredentials = true;
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.onreadystatechange = function() {
                console.log( xhr.status, xhr.statusText );
                console.log(xhr.responseText);
                if((xhr.responseText).includes('"result":"success"')){
                    formOutput("Success! Someone will email you back as soon as possible");
                }
                else{
                    formOutput("Submission failed, try reloading the page, or email me@theofleck.com"); 
                }
                //document.getElementById('new_parts').style.display = 'none'; // hide form
                //document.getElementById('thankyou_message').style.display = 'block';
                return;
            };
            // url encode form data for sending as post data
            var encoded = Object.keys(data).map(function(k) {
                return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
            }).join('&')
            xhr.send(encoded);
        }
    });

    function validEmail(email) { // see:
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return re.test(email);
    }
    // get all data in form and return object
    function getFormData() {
        var elements = document.getElementById("new_parts").elements; // all form elements
        var fields = Object.keys(elements).map(function(k) {
            if(elements[k].name !== undefined) {
                return elements[k].name;
                // special case for Edge's html collection
            }else if(elements[k].length > 0){
                return elements[k].item(0).name;
            }
        }).filter(function(item, pos, self) {
            return self.indexOf(item) == pos && item;
        });
        var data = {};
        fields.forEach(function(k){
            data[k] = elements[k].value;
            var str = ""; // declare empty string outside of loop to allow
            // it to be appended to for each item in the loop
            if(elements[k].type === "checkbox"){ // special case for Edge's html collection
                str = str + elements[k].checked + ", "; // take the string and append 
                // the current checked value to 
                // the end of it, along with 
                // a comma and a space
                data[k] = str.slice(0, -2); // remove the last comma and space 
                // from the  string to make the output 
                // prettier in the spreadsheet
            }else if(elements[k].length){
                for(var i = 0; i < elements[k].length; i++){
                    if(elements[k].item(i).checked){
                        str = str + elements[k].item(i).value + ", "; // same as above
                        data[k] = str.slice(0, -2);
                    }
                }
            }
        });
        var user = firebase.auth().currentUser;
        data['member'] = user.displayName;
        data['email'] = user.email;
        console.log(data);
        return data;
    }
    function formOutput(message){
        $('#parts_placeholder').hide().html('<div class="alert alert-info alert-dismissable fade-alert" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><span>'+message+'</span></div>').fadeIn(800);
    }
    $("#qr_button").click(function(e) {
        e.preventDefault();
        $('#scanPart').modal('toggle');
        scanner = new Instascan.Scanner({ video: document.getElementById('preview')});
        scanner.addListener('scan', function (content) {
            var tab = document.getElementById('partsTable');
            var n = tab.rows.length;
            var i, s = null, tr, td;
            for (i = 0; i < n; i++) {
                tr = tab.rows[i];
                if (tr.cells.length > 0) { // Check that cell exists before you try
                    td = tr.cells[0];      // to access it.
                    s += ' ' + td.innerText;
                    if(content == td.innerText){
                        scanner.stop();
                        $('#scanPart').modal('toggle');
                        td.click();
                        break;
                    }
                } // Here you could say else { return null; } if you want it to fail
                // when requested column is out of bounds. It depends.
            }
            console.log(s);
        });
        Instascan.Camera.getCameras().then(function (cameras) {
            if (cameras.length > 0) {
                scanner.start(cameras[0]);
                current_camera = true;
                if(cameras.length < 2){
                    var btn = document.getElementById('change_camera');
                    btn.style.display = 'none';
                }
            } else {
                var out = document.getElementById('out');
                out.textContent = "no cameras found";
                console.log('No cameras found.');
            }
        }).catch(function (e) {
            console.error(e);
        });

    });
    $("#change_camera").click(function(e) {
        e.preventDefault();
        scanner.stop();
        Instascan.Camera.getCameras().then(function (cameras) {
            if (cameras.length > 1) {
                if(current_camera){
                    current_camera = false;
                }
                else{
                    current_camera = true;
                }
            } else {
                console.log('No cameras found.');
            }
        }).catch(function (e) {
            console.error(e);
        });
        scanner = new Instascan.Scanner({ video: document.getElementById('preview'), mirror:current_camera});
        scanner.addListener('scan', function (content) {
            var tab = document.getElementById('partsTable');
            var n = tab.rows.length;
            var i, s = null, tr, td;
            for (i = 0; i < n; i++) {
                tr = tab.rows[i];
                if (tr.cells.length > 0) { // Check that cell exists before you try
                    td = tr.cells[0];      // to access it.
                    s += ' ' + td.innerText;
                    if(content == td.innerText){
                        scanner.stop();
                        $('#scanPart').modal('toggle');
                        td.click();
                        break;
                    }
                } // Here you could say else { return null; } if you want it to fail
                // when requested column is out of bounds. It depends.
            }
            console.log(s);
        });
        Instascan.Camera.getCameras().then(function (cameras) {
            if(current_camera){
                scanner.start(cameras[0]);
            }
            else{
                scanner.start(cameras[1])
            }
        }).catch(function (e) {
            console.error(e);
        });
    });
    $("#closeScanModal").click(function(e) {
        e.stopPropagation();
        scanner.stop();
        console.log('scanner stopped');
        $('#scanPart').modal('toggle');
    });
});
