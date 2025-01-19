function monitorFolderChanges() {
  var folderId = "FOLDERID"; // Replace with your shared folder ID
  var folder = DriveApp.getFolderById(folderId);
  
  // Use PropertiesService to store the last state of the folder and its contents
  var userProperties = PropertiesService.getUserProperties();
  var previousState = JSON.parse(userProperties.getProperty("folderState") || "[]");

  var currentState = [];
  var message = "Recent Changes in Folder and Subfolders:\n\n";
  var hasChanges = false;

  // Recursively collect information about all files and folders
  function scanFolder(folder, parentPath) {
    var currentPath = parentPath ? parentPath + "/" + folder.getName() : folder.getName();

    // Add the folder itself to the state
    currentState.push({
      id: folder.getId(),
      name: folder.getName(),
      path: currentPath,
      type: "Folder",
      lastUpdated: folder.getLastUpdated().toISOString()
    });

    // Add files in the folder
    var files = folder.getFiles();
    while (files.hasNext()) {
      var file = files.next();
      currentState.push({
        id: file.getId(),
        name: file.getName(),
        path: currentPath + "/" + file.getName(),
        type: "File",
        lastUpdated: file.getLastUpdated().toISOString()
      });
    }

    // Recursively scan subfolders
    var subfolders = folder.getFolders();
    while (subfolders.hasNext()) {
      scanFolder(subfolders.next(), currentPath);
    }
  }

  // Start scanning the root folder
  scanFolder(folder, "");
  // previousItem = 'd'
  console.log(previousState)
  // Compare current state with previous state
  currentState.forEach(function(currentItem) {
    var previousItem = previousState.find(item => item.id === currentItem.id);
    // previousItem = 'f'
    if (!previousItem) {
      // New file or folder
      hasChanges = true;
      message += `New ${currentItem.type}: ${currentItem.path}\n`;
    } else if (previousItem.lastUpdated !== currentItem.lastUpdated) {
      // <<<<< FILE UPDATE DETECTION LOGIC STARTS HERE >>>>>
      if (currentItem.type === "File") {
        hasChanges = true;
        message += `Updated File: ${currentItem.path}\n`;
      }
      // <<<<< FILE UPDATE DETECTION LOGIC ENDS HERE >>>>>
      
      // Updated file or folder
      hasChanges = true;
      message += `Updated ${currentItem.type}: ${currentItem.path}\n`;
    }
  });

  // Check for deleted files or folders
  previousState.forEach(function(previousItem) {
    var currentItem = currentState.find(item => item.id === previousItem.id);
    if (!currentItem) {
      hasChanges = true;
      message += `Deleted ${previousItem.type}: ${previousItem.path}\n`;
    }
  });

  // Send email notification only if changes are detected
  if (hasChanges) {
    MailApp.sendEmail("dheepakg@seas.upenn.edu", "✅ C6200AdvDL Update: ", message);
  }

  // Update the stored folder state
  userProperties.setProperty("folderState", JSON.stringify(currentState));
}
