// Division display variables
var dphx = true;
var dlax = true;

$(document).ready(function() {
  // Run when page is loaded.
  $('#division-phx').change(function() {
    dphx = this.checked;
  });

  $('#division-lax').change(function() {
    dlax = this.checked;
  });
});
