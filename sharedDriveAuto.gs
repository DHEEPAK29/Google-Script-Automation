function monitorFolderChanges() {
  var folderId = ":) use ur folder ID: can find this from drive link after '/folder/'"; // Replace with your shared folder ID
  var folder = DriveApp.getFolderById(folderId);
  var files = folder.getFiles();
  
  // Use PropertiesService to store the last state of the folder
  var userProperties = PropertiesService.getUserProperties();
  var previousState = userProperties.getProperty("folderState");
  
  var currentState = [];
  var message = "Recent Changes in Folder:\n";
  var hasChanges = false;
  
  // Build the current folder state
  while (files.hasNext()) {
    var file = files.next();
    var fileInfo = {
      name: file.getName(),
      lastUpdated: file.getLastUpdated().toString()
    };
    currentState.push(fileInfo);
  }
  // previousState = "f"
  // Convert current state to a JSON string for comparison
  var currentStateString = JSON.stringify(currentState);
  
  // Compare the current state with the previous state
  if (currentStateString !== previousState) {
    hasChanges = true;
    message += "Changes detected in the folder. See details below:\n\n";
    currentState.forEach(function(file) {
      message += "File: " + file.name + " - Last Updated: " + file.lastUpdated + "\n";
    });
    
    // Update the stored folder state
    userProperties.setProperty("folderState", currentStateString);
  }
  
  // Send email notification only if changes are detected
  if (hasChanges) {
    MailApp.sendEmail("dheepakg@seas.upenn.edu", "Google Drive Folder Update Deteccted", message);
  }
}
