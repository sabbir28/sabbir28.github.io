// Create a JavaScript library for image to base64 conversion
var ImageToBase64 = {
    fromURL: function (imageUrl, callback) {
      var img = new Image();
      img.crossOrigin = 'Anonymous';
  
      img.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
  
        var base64Data = canvas.toDataURL('image/png');
        callback(base64Data);
      };
  
      img.src = imageUrl;
    },
  
    fromFile: function (file, callback) {
      var reader = new FileReader();
  
      reader.onload = function (e) {
        var base64Data = e.target.result;
        callback(base64Data);
      };
  
      reader.readAsDataURL(file);
    }
};




/*




*/