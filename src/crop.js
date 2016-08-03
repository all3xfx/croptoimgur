function resetModal() {
  $('.drop_container').css('display', '');
  $('.result_container').css('display', 'none');
  $('#saveBtn').addClass('disabled');
  $('#saveBtn').prop('disabled', true);
  imgur.clearStatus();
}

function sendImage() {
  // Insert loading spin
  $('#imgicon').css("background-image", "url(src/svg/loading-spin.svg)");
  // preview element
  var oImage = document.getElementById('preview');
  var img = new Image();
  img.src = oImage.src;

  img.onload = function(){
  var canvas = $('<canvas/>')
      .attr({
           width: xsize,
           height: ysize
       })
      .hide()
      .appendTo('body'),
      ctx = canvas.get(0).getContext('2d'),
      cropCoords = {
          topLeft : {
              x : crop.x,
              y : crop.y
          },
          bottomRight :{
              x : crop.w,
              y : crop.h
          }
      };

  ctx.drawImage(img, cropCoords.topLeft.x, cropCoords.topLeft.y, cropCoords.bottomRight.x, cropCoords.bottomRight.y, 0, 0, xsize, ysize);
  var base64ImageData = canvas.get(0).toDataURL();

  // Append cropped image to Form and send to ImgUr
  canvas.remove();
  var fd = new FormData();
  var blob = dataURLtoBlob(base64ImageData);
  fd.append('image', blob);
  imgur.send(fd);
  };
}

// Create variables (in this scope) to hold the API and image size
var jcrop_api,
    boundx,
    boundy,
    crop = {},
    xsize = ysize = 100;

function fileSelectHandler(fd) {

    // get selected file
    //var oFile = $('#image_file')[0].files[0];
    var oFile = fd;

    // check for image type (jpg and png are allowed)
    var rFilter = /^(image\/jpeg|image\/png)$/i;
    if (! rFilter.test(oFile.type)) {
        imgur.showError('Please select a valid image file');
        //$('.error').html('Please select a valid image file (jpg and png are allowed)').show();
        return;
    }

    // check for file size
    if (oFile.size > 250 * 1024) {
        imgur.showError('You have selected too big file, please select a one smaller image file');
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

            if(this.width > 500 || this.height > 500)
            {
              imgur.showError('Image dimensions should be smalle than 500x500');
              return;
            }else{
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

                      // Hide drop container and show result container
                      $('.drop_container').css('display', 'none');
                      $('.result_container').css('display', '');

                      // Allow save button
                      $('#saveBtn').removeClass('disabled');
                      $('#saveBtn').prop('disabled', false);
                  });
            }
        };

    };

    // read selected file as DataURL
    oReader.readAsDataURL(oFile);

}

function updatePreview(c)
{
  if (parseInt(c.w) > 0)
  {
    crop.x = c.x; crop.y = c.y, crop.w = c.w, crop.h = c.h;
  }
};

function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}
