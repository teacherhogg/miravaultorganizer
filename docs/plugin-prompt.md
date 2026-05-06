
# MiraVaultOrganizer Obsidian Plugin

I would like you to make a plan for implementing a new Community Obsidian Plugin that runs on manual command.

When invoked, the plugin does the following:

* Check for all markdown files that exist in folders that are at least two deep and check that the frontmatter contains a category property which is the name of folderA and a subcategory property that is the name of folderB where the location of the file is /folderA/folderB/file.md. 
* Note that if a file is in the root folder or in just /folderA then do not do this check.
* Note that if a file is in a deeper folder than two, the check is still done but only the top and second folder depth are used for determining the correct category and subcategory. So, for example, the file at /folderA/folderB/Summaries/file will still have folderA as category and folderB as subcategory.
* When the plugin is done running it will output a summary of what changes were made (or none if no chnages made).

