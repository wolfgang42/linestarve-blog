---
title: "Unbound classpath variable: 'wpilib'"
date: 2016-01-24 15:22:37
tags: ["FRC", "FRC2016", "Java", "Eclipse"]
---
Our team runs into this every year, and every year I forget how to fix it:

{% asset_img error-unbound-classpath.png Unbound classpath variable: 'networktables' in project 'TESTROBOT'. Unbound classpath variable: 'networktables' in project 'TESTROBOT'. %}

I decided that this is the year I'll write it down. (Probably now that I've documented it they'll fix it next year.)

<!-- more -->

1. Right-click on the project in the Package Explorer, and select "Properties".
   ![](1-menu-properties.png)
2. Go to "Java Build Path", then the "Libraries" tab.
   Select either 'networktables' or 'wpilib' (it doesn't matter which) and click the "Edit..." button.
   ![](2-edit-library.png)
3. In the "Edit Variable Entry" dialog, click the "Variable..." button.
   ![](3-edit-variable-entry.png)
4. In the "Variable Selection" dialog, click "New..."
   ![](4-new-variable.png)
5. In the "New Variable Entry" dialog, enter `wpilib` for the name, then click the "File..." button and navigate to "WPILib.jar". (It should be in <code><var>your home folder</var>/wpilib/java/current/lib</code>.)
   ![](5-enter-wpilib.png)
6. Click OK, then repeat steps 4 and 5. In step 5 enter
   <table class="table table-condensed">
      <tr><td>Name:</td><td><code>networktables</code></td></tr>
      <tr><td>Path:</td><td>NetworkTables.jar</td></tr>
   </table>
7. Click OK to all the dialog boxes you now have open.

That's it! The unbound classpath errors should now be gone.
