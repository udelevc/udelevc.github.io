jQuery(document).ready(function ($) {
    //Correct copyright year
    $("#foot-date2").text('\u00A9' + (new Date).getFullYear() + ' Rooster Racing. All rights reserved.');
    
    // browser window scroll (in pixels) after which the "back to top" link is shown
    var offset = 600,
        //browser window scroll (in pixels) after which the "back to top" link opacity is reduced
        offset_opacity = 1200,
        //duration of the top scrolling animation (in ms)
        scroll_top_duration = 700,
        //grab the "back to top" link
        $back_to_top = $('.cd-top');

    //hide or show the "back to top" link
    $(window).scroll(function () {
        ($(this).scrollTop() > offset) ? $back_to_top.addClass('cd-is-visible'): $back_to_top.removeClass('cd-is-visible cd-fade-out');
        if ($(this).scrollTop() > offset_opacity) {
            $back_to_top.addClass('cd-fade-out');
        }
        //fade in text divs on scroll down
        $('.invs').each(function (i) {
            var top_of_object = $(this).offset().top;
            var bottom_of_window = $(window).scrollTop() + $(window).height();
            if (bottom_of_window > top_of_object) {
                //$(this).show("slide", { direction: "left" }, 2000);
            }
        });
    });
    //smooth scroll to top
    $back_to_top.on('click', function (event) {
        event.preventDefault();
        $('body,html').animate({
            scrollTop: 0,
        }, scroll_top_duration);
    });
});
//collapse and change color of the navbar on scroll
$(window).scroll(function () {
    if($('.navbar').length){
        if ($(".navbar").offset().top > 80) {
            $(".nav-list").addClass('nav-list-small');
            $('#head-tit').addClass('head-tit');
            $('#sign-in-nav').addClass('sign-in-nav');
            $('#sign-in-nav').removeClass('sign-in-nav-back');
            $('#head-img').css('height', '50px');
            $('#head-img').css('padding-top', '10px');
            $('#head-img').css('padding-right', '5px');
        } else {
            $(".nav-list").removeClass('nav-list-small');
            $('#head-tit').removeClass('head-tit');
            $('#sign-in-nav').removeClass('sign-in-nav');
            $('#sign-in-nav').addClass('sign-in-nav-back');
            $('#head-img').css('height', '60px');
            $('#head-img').css('padding-top', '0px');
        }
    }
});

//page scrolling feature - requires jQuery Easing plugin
$(function () {
    $('a.page-scroll').bind('click', function (event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});
