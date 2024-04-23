window.HELP_IMPROVE_VIDEOJS = false;

function imageZoom(imgID, resultID) {
  var img, lens, result, cx, cy;
  sample_container = document.getElementById(imgID + "_cover");
  img = document.getElementById(imgID + '_albedo');
  /* Create lens: */
  lens = document.createElement("DIV");
  lens.setAttribute("class", "img-zoom-lens");
  /* Insert lens: */
  img.parentElement.insertBefore(lens, img);

  /* Set background properties for the result DIV */
  segments = img.src.split('/')
  high_res_path = (segments.slice(0, -3).concat(['full_samples'].concat(segments.slice(-2, segments.length)))).join('/')
  
  zooms = ['_albedo', '_spec', '_normals', '_disp']
  for (let i = 0; i < zooms.length; i++) {
    modality = zooms[i]
    resultID_mod = resultID + modality
    result = document.getElementById(resultID_mod);
    /* Calculate the ratio between result DIV and lens: */
    cx = result.offsetWidth / lens.offsetWidth;
    cy = result.offsetHeight / lens.offsetHeight;
    
    segments = high_res_path.split('/')
    high_res_path_mod = segments.slice(0, -1).concat(modality.slice(1, modality.length) + ".jpg").join('/')
    console.log(high_res_path_mod)
    result.style.backgroundImage = "url('" + high_res_path_mod + "')";
    result.style.backgroundSize = (img.width * cx) + "px " + (img.height * cy) + "px";  

    callback_constructor = (resultID) => {
      return (e) => moveLens(e, resultID)
    }
    callback = callback_constructor(resultID_mod)

    /* Execute a function when someone moves the cursor over the image, or the lens: */
    lens.addEventListener("mousemove", callback);
    sample_container.addEventListener("mousemove", callback);
    /* And also for touch screens: */
    lens.addEventListener("touchmove", callback);
    sample_container.addEventListener("touchmove", callback);
  }


  function moveLens(e, resultID) {
    result_img = document.getElementById(resultID);
    var pos, x, y;
    /* Prevent any other actions that may occur when moving over the image */
    e.preventDefault();
    /* Get the cursor's x and y positions: */
    pos = getCursorPos(e);
    /* Calculate the position of the lens: */
    x = pos.x - (lens.offsetWidth / 2);
    y = pos.y - (lens.offsetHeight / 2);
    /* Prevent the lens from being positioned outside the image: */
    if (x > img.width - lens.offsetWidth) {x = img.width - lens.offsetWidth;}
    if (x < 0) {x = 0;}
    if (y > img.height - lens.offsetHeight) {y = img.height - lens.offsetHeight;}
    if (y < 0) {y = 0;}
    /* Set the position of the lens: */
    lens.style.left = x + "px";
    lens.style.top = y + "px";
    /* Display what the lens "sees": */
    result_img.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
  }

  function getCursorPos(e) {
    var a, x = 0, y = 0;
    e = e || window.event;
    /* Get the x and y positions of the image: */
    a = img.getBoundingClientRect();
    /* Calculate the cursor's x and y coordinates, relative to the image: */
    x = e.pageX - a.left;
    y = e.pageY - a.top;
    /* Consider any page scrolling: */
    x = x - window.pageXOffset;
    y = y - window.pageYOffset;
    return {x : x, y : y};
  }
}

function initComparisons() {
  var x, i;
  /* Find all elements with an "overlay" class: */
  x = document.getElementsByClassName("img-mod-overlay");
  for (i = 0; i < x.length; i++) {
    /* Once for each "overlay" element:
    pass the "overlay" element as a parameter when executing the compareImages function: */
    compareImages(x[i], i);
  }
  function compareImages(img, index) {
    var slider, img, clicked = 0, w, h;
    /* Get the width and height of the img element */
    w = img.offsetWidth;
    h = img.offsetHeight;
    /* Set the width of the img element to 50%: */
    img.style.width = (w / (2 + index)) + "px";
    /* Create slider: */
    slider = document.createElement("DIV");
    slider.setAttribute("class", "img-mod-slider");
    /* Insert slider */
    img.parentElement.insertBefore(slider, img);
    /* Position the slider in the middle: */
    slider.style.top = (h / 2) - (slider.offsetHeight / 2) + "px";
    slider.style.left = (w / (2 + index)) - (slider.offsetWidth / 2) + "px";
    /* Execute a function when the mouse button is pressed: */
    slider.addEventListener("mousedown", slideReady);
    /* And another function when the mouse button is released: */
    window.addEventListener("mouseup", slideFinish);
    /* Or touched (for touch screens: */
    slider.addEventListener("touchstart", slideReady);
     /* And released (for touch screens: */
    window.addEventListener("touchend", slideFinish);
    function slideReady(e) {
      /* Prevent any other actions that may occur when moving over the image: */
      e.preventDefault();
      /* The slider is now clicked and ready to move: */
      clicked = 1;
      /* Execute a function when the slider is moved: */
      window.addEventListener("mousemove", slideMove);
      window.addEventListener("touchmove", slideMove);
    }
    function slideFinish() {
      /* The slider is no longer clicked: */
      clicked = 0;
    }
    function slideMove(e) {
      var pos;
      /* If the slider is no longer clicked, exit this function: */
      if (clicked == 0) return false;
      /* Get the cursor's x position: */
      pos = getCursorPos(e)
      /* Prevent the slider from being positioned outside the image: */
      if (pos < 0) pos = 0;
      if (pos > w) pos = w;
      /* Execute a function that will resize the overlay image according to the cursor: */
      slide(pos);
    }
    function getCursorPos(e) {
      var a, x = 0;
      e = (e.changedTouches) ? e.changedTouches[0] : e;
      /* Get the x positions of the image: */
      a = img.getBoundingClientRect();
      /* Calculate the cursor's x coordinate, relative to the image: */
      x = e.pageX - a.left;
      /* Consider any page scrolling: */
      x = x - window.pageXOffset;
      return x;
    }
    function slide(x) {
      /* Resize the image: */
      img.style.width = x + "px";
      /* Position the slider: */
      slider.style.left = img.offsetWidth - (slider.offsetWidth / 2) + "px";
    }
  }
}

function setup_sample_dropdown() {
  dropdown = document.getElementById('sample_dropdown');
  dropdown.addEventListener('change',  (e) => {
    maps = [
      'sample_1_albedo', 
      'sample_1_spec', 
      'sample_1_normals', 
      'sample_1_disp']

    zooms = ['sample_1_zoom_albedo', 
      'sample_1_zoom_spec', 
      'sample_1_zoom_normals', 
      'sample_1_zoom_disp']
      
    new_subject = e.target.value
    maps.forEach(element => {
      image = document.getElementById(element)
      path = image.src
      image.src = path.split('/').slice(0, -2)
        .concat([new_subject])
        .concat(path.split('/').slice(-1)).join('/')
    });  
    zooms.forEach(element => {
      image = document.getElementById(element)
      path = image.style.backgroundImage
      image.style.backgroundImage = path.split('/').slice(0, -2)
        .concat([new_subject])
        .concat(path.split('/').slice(-1)).join('/')
    });  
  })


  
}

$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    bulmaSlider.attach();

    imageZoom("sample_1", "sample_1_zoom");
    initComparisons();
    setup_sample_dropdown();

    change_noise_sample = (e, type) => {
      
      console.log('button', e.button, type)

      current_subject = document.getElementById("noise-sampling").src
      subject_and_sample = current_subject.split('/').at(-1).split('.').at(-2).split('_')
      subject = parseInt(subject_and_sample[0])
      sample = parseInt(subject_and_sample[1])

      sample = sample + 1
      if (sample > 2) {
        sample = 0
      }  
      
      if (type == 'subject_change'){
        subject = e.target.value
        sample = 0
      }

      document.getElementById("noise-sampling").src = [
        current_subject.split('/').slice(0, -1).join('/'), 
        subject.toString().padStart(7, '0') + '_' + sample.toString().padStart(3, '0') + '.jpg'        
      ].join('/')

      sample_counter = document.getElementById("sample-counter")
      console.log(sample_counter.innerHTML)
      sample_counter.innerHTML = "Sample " + sample.toString() + "/3"

    }

    document.getElementById("noise-sampling").addEventListener("click", (e) => change_noise_sample(e, 'sample'));
    document.getElementById("sample-counter").addEventListener("click", (e) => change_noise_sample(e, 'sample'));
    document.getElementById('noise_dropdown').addEventListener('change',  (e) => change_noise_sample(e, 'subject_change'));

    scroll_to_mouse = (e) => {
      e.preventDefault()
      current_scale = document.getElementById("noise-sampling").style.transform.split("(").at(-1).split(")").at(0)
      console.log(current_scale)
      switch (current_scale) {
        case '1':
          new_scale = 1.5
          break;
        case '1.5':
          new_scale = 2
          break;
        case '2':
          new_scale = 2.5
          break;
        case '2.5':
          new_scale = 3
          break;
        case '3':
          new_scale = 1
          break;
        default:
          new_scale = 1.5
      }
      
      document.getElementById("noise-sampling").style.transform = "scale(" + new_scale + ")"
      
    }

    document.getElementById("noise-sampling").ondblclick = scroll_to_mouse;
    document.getElementById("sample-counter").ondblclick = scroll_to_mouse;

    document.getElementById('modality_completion_dropdown').addEventListener('change',  (e) => {
      document.getElementById("modality-completion").src = document.getElementById("modality-completion").src.split('/').slice(0, -1).join('/') + "/" + e.target.value + '.jpg'
    });

    document.getElementById('super_resolution_dropdown').addEventListener('change',  (e) => {
      document.getElementById("super-resolution").src = document.getElementById("super-resolution").src.split('/').slice(0, -1).join('/') + "/" + e.target.value + '.jpg'
    });

})

