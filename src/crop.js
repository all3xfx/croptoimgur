function getCropped() {
  // preview element
  var oImage = document.getElementById('preview');
  var img = new Image();
  img.src = oImage.src;
  console.log(crop);


  img.onload = function(){
  var canvas = $('<canvas/>')
      .attr({
           width: 250,
           height: 250
       })
      .hide()
      .appendTo('body'),
      ctx = canvas.get(0).getContext('2d'),
      a = $('<a download="cropped-image" title="click to download the image" />'),
      cropCoords = {
          topLeft : {
              x : crop.x1,
              y : crop.y1
          },
          bottomRight :{
              x : crop.w,
              y : crop.h
          }
      };

  ctx.drawImage(img, cropCoords.topLeft.x, cropCoords.topLeft.y, cropCoords.bottomRight.x, cropCoords.bottomRight.y, 0, 0, 250, 250);
  var base64ImageData = canvas.get(0).toDataURL();


  a
      .attr('href', base64ImageData)
      .text('cropped image')
      .appendTo('body');

  a
      .clone()
      .attr('href', img.src)
      .text('original image')
      .attr('download','original-image')
      .appendTo('body');

  canvas.remove();
  };
}

// Create variables (in this scope) to hold the API and image size
var jcrop_api,
    boundx,
    boundy,
    crop = {},
    xsize = ysize = 250;

function fileSelectHandler(fd) {

    // get selected file
    //var oFile = $('#image_file')[0].files[0];
    var oFile = fd;

    // hide all errors
    $('.error').hide();

    // check for image type (jpg and png are allowed)
    var rFilter = /^(image\/jpeg|image\/png)$/i;
    if (! rFilter.test(oFile.type)) {
        $('.error').html('Please select a valid image file (jpg and png are allowed)').show();
        return;
    }

    // check for file size
    if (oFile.size > 250 * 1024) {
        $('.error').html('You have selected too big file, please select a one smaller image file').show();
        return;
    }

    // preview element
    var oImage = document.getElementById('preview');

    // prepare HTML5 FileReader
    var oReader = new FileReader();
        oReader.onload = function(e) {

        // e.target.result contains the DataURL which we can use as a source of the image
        oImage.src = e.target.result;

        var img = new Image();
        img.src = e.target.result;

        oImage.onload = function () { // onload event handler

            // display step 2
            $('.step2').fadeIn(500);

            // destroy Jcrop if it is existed
            if (typeof jcrop_api != 'undefined') {
                jcrop_api.destroy();
                jcrop_api = null;
                $('#preview').width(oImage.naturalWidth);
                $('#preview').height(oImage.naturalHeight);
            }

            //setTimeout(function(){
                var sizeMax = Math.max(oImage.naturalWidth, oImage.naturalHeight);
                // initialize Jcrop
                $('#preview').Jcrop({
                    minSize: [32, 32], // min crop size
                    aspectRatio: xsize / ysize, // keep aspect ratio 1:1
                    setSelect: [0, 0, sizeMax, sizeMax],
                    allowSelect: false,
                    bgFade: true, // use fade effect
                    bgOpacity: .3, // fade opacity
                    onChange: updatePreview,
                    onSelect: updatePreview
                }, function(){

                    // use the Jcrop API to get the real image size
                    var bounds = this.getBounds();
                    boundx = bounds[0];
                    boundy = bounds[1];

                    // Store the Jcrop API in the jcrop_api variable
                    jcrop_api = this;
                });
            //},3000);

        };

    };

    // read selected file as DataURL
    oReader.readAsDataURL(oFile);
}

function updatePreview(c)
{
  if (parseInt(c.w) > 0)
  {
    //var rx = xsize / c.w;
    //var ry = ysize / c.h;
    crop.x1 = c.x; crop.x2 = c.x2; crop.y1 = c.y, crop.y2 = c.y2; crop.w = c.w, crop.h = c.h;
  }
};
