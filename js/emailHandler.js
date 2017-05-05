jQuery(document).ready(function ($) {
    $('#new_parts').validator().submit(function (e) {
      e.preventDefault();
      if (($('#partsbtn').hasClass('disabled'))) {
      } else {
        var data = getFormData();
        var url = 'https://script.google.com/macros/s/AKfycbxuJaxXfZpkd-wWnKvdeeSp_T-WuPS0u4PWzsWuJaCr3NZcZ-E/exec'
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
  data['member'] = 'Theo';
  data['email'] = 'me@theofleck.com';
  console.log(data);
  return data;
}
function formOutput(message){
    $('#parts_placeholder').hide().html('<div class="alert alert-info alert-dismissable fade-alert" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><span>'+message+'</span></div>').fadeIn(800);
}
