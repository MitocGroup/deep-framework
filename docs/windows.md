##Windows configuration
  1. Before starting you should have installed and configured correctly node and npm (versions more than 4.2.4 are supported), and DynamoDB on your computer requires the Java Runtime Engine (JRE) version 6.x or newer; it will not run on older JRE versions.
> If You are on `Windows 7` you need to have installed [`Windows SDK` for `Windows Server 2008` and `.NET Framework 3.5`](https://www.microsoft.com/en-us/download/details.aspx?id=11310)

  2. Before starting you should install Git Bash.
> It launches a full featured console window running `Bash`, so you can use `Git` as well as a set of common command line tools or Unix programs.
Starting with Git version 2, `Git Bash` will by default launch in `MinTTY`, a terminal emulator which comes with `MSYS2`, making it easily usable even for users not accustomed to a console experience.

    2.1. Download [Git Bash](http://git-scm.com/) and launch installer for it.
      ![Git start installation](https://github.com/MitocGroup/deep-framework/blob/master/docs/git-setup/1.jpg)

    2.2. Accept license agreement.

      ![License Agreement](https://github.com/MitocGroup/deep-framework/blob/master/docs/git-setup/2.jpg)

    2.3. Select destination location. 

      ![Location](https://github.com/MitocGroup/deep-framework/blob/master/docs/git-setup/3.jpg)

    2.4. Select components. 

      ![Components](https://github.com/MitocGroup/deep-framework/blob/master/docs/git-setup/4.jpg)

    2.5. Select Start Menu Folder. 

      ![Start menu](https://github.com/MitocGroup/deep-framework/blob/master/docs/git-setup/5.jpg)

    2.6. Select Use Git from Windows Command Prompt. 

      ![Path environment](https://github.com/MitocGroup/deep-framework/blob/master/docs/git-setup/6.jpg)

    2.7. Select Checkout Windows-style, commit Unix-style line ending. 

      ![Line enging conversions](https://github.com/MitocGroup/deep-framework/blob/master/docs/git-setup/7.jpg)
 
    2.8. Select Use Windows' default console window (this option is required). 

      ![Terminal emulator](https://github.com/MitocGroup/deep-framework/blob/master/docs/git-setup/8.jpg)

    2.9. Disable experimental cache for `Windows`. 

      ![Performance](https://github.com/MitocGroup/deep-framework/blob/master/docs/git-setup/9.jpg)
      
  3. All commands should be run from `MinTTY` as root/Administrator.
      ![Run git-bash.exe as Administrator](https://github.com/MitocGroup/deep-framework/blob/master/docs/git-setup/administrator.jpg)

     > For using `symlink` functionality on Windows you should have admin privileges, because *in Windows The default security policy allows only administrators to create symbolic links*. 

     > Here you can find a little bit more details for know [node issue] (https://github.com/nodejs/node-v0.x-archive/issues/6342).

     > We suggest always to run `git-bash.exe` as Administrator due to different behavior for users: 
     -  In case when you are not in `Administrators` group you can just update [Local Group Policy] (http://superuser.com/questions/104845/permission-to-make-symbolic-links-in-windows-7), but in many Windows version gpedit.msc is not installed by default. 
     -  In case when you belong to the `Administrators` group you always have to run in an elevated environment (as Administrator).

     > Need to take into account that not only core `fs.symlink(target, path[, type], callback)` will require symlink permissions. In some case it can be `fse.ensureSymlinkSync()` from fse-extra module and so on, which ensures that the symlink exists. If the directory structure does not exist, it is created.
 
  4.  Optionally: you need to have the `AWS CLI` installed and configured to your [AWS account](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html) otherwise you will need to enter your credentials manually.
 