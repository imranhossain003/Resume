/* eslint-disable no-var, no-new */
/* global grecaptcha */
$(function () {
  // --- Magnific Popup --- //
  if ($.fn.magnificPopup) {
    $('body').magnificPopup({
      delegate: 'a.asset-thumb.popup', // selector
      type: 'image', // default type
      gallery: { enabled: true },
      image: { titleSrc: fetchTitle },
      // iframe: { titleSrc: fetchTitle } // NOTE: iframe doesn't support title customization
    })
  }

  function fetchTitle(item) {
    var description = item.el.data('content') || ''

    return [item.el.attr('title'), '<small>', description, '</small>'].join('')
  }

  // --- Morris --- //
  var $charts = $('.chart-container[data-params]')

  $charts.each(function () {
    // NOTE: the server passes in the pre-filtered data, don't need to re-filter
    var $chart = $(this)
    var type = $chart.data('type')
    var params = $chart.data('params')
    params.element = $chart

    new Morris[type](params)
  })

  // --- View and PDF download tracking --- //
  function trackView() {
    if (/track=false|view=pdf/.test(window.location.search)) return
    // Ignore bots
    if (!navigator.userAgent || /bot|spider|crawl/.test(navigator.userAgent)) return
    if (/tag=pdf/.test(location.search)) track('pdf')
    else track()
  }

  trackView()

  $('#pdf-download').one('click', function (e) {
    e.stopPropagation()
    track('download')
  })

  function track(event) {
    // NOTE cv id will only show up on the editor
    var cvId = $('[data-cv-id]').data('cv-id')

    if (!cvId) return

    var params = { referrer: document.referrer, type: event } // tag: $.url().param('access')

    $.post('/cvs/' + cvId + '/track' + window.location.search, params)
  }

  // --- Scroll To --- //
  $('body').on('click', '[data-scroll-to]', function (e) {
    e.preventDefault()
    var selector = $(this).data('scroll-to')
    var $target = $(selector)
    // http://stackoverflow.com/questions/8149155/animate-scrolltop-not-working-in-firefox
    $('body,html').animate(
      {
        scrollTop: $target.offset().top,
      },
      500
    )
  })

  // Make Short Sections Unbreakable
  // Does seem to work, still has some widowed section headers
  $('.cv-viewer section').each(function () {
    var section = $(this)
    if (section.height() < 200) section.addClass('no-page-break')
    if (section.attr('id') === 'summary' && !section.find('article').text()) section.hide()
  })

  if ($.fn.parallax) {
    var height = window.innerHeight - $('.cv-container').offset().top
    $('.banner').css({ height: height })
    $('.banner').parallax()
  }

  // Contact me form for websites
  $('.contact-form form').on('submit', function (event) {
    event.preventDefault()

    $('.contact-form button[type="submit"]').attr('disabled', 'disabled')

    var apiUrl = window.location.origin + '/public/messages'

    var data = {
      message: {},
    }

    $.each($(this).serializeArray(), function (_, field) {
      data.message[field.name] = field.value
    })

    var onSuccess = function () {
      $('.contact-form form, .contact_me .description').hide()
      $('.contact-form .success-message').show()
    }

    var onError = function (_, textStatus, errorThrown) {
      console.error(textStatus, errorThrown)

      $('.contact-form button[type="submit"]').removeAttr('disabled')

      alert('Could not send message. Please try again.')
    }

    grecaptcha.ready(function () {
      var siteKey = '6Lew-LMUAAAAAHZECgRngr8b0VVpBTI6SBHWWfTd'

      // request the reCAPTCHA challenge token
      grecaptcha.execute(siteKey, { action: 'send_message' }).then(function (token) {
        data.message.token = token

        $.ajax({
          method: 'POST',
          url: apiUrl,
          dataType: 'json',
          data: data,
          error: onError,
          success: onSuccess,
        })
      })
    })
  })

  // Parallax effect
  var parallaxElement = document.getElementsByClassName('parallax')[0]

  if (parallaxElement) {
    var parallax = function () {
      // enabled only for large screen sizes
      if (window.innerWidth >= 1200) {
        parallaxElement.style.backgroundPositionY = -window.pageYOffset * 0.13 + 'px'
      }
    }

    window.addEventListener('scroll', parallax)
  }
})
