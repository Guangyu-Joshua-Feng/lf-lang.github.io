"use strict";(self.webpackChunklingua_franca=self.webpackChunklingua_franca||[]).push([[248],{6597:function(e,l,t){t.r(l);var n=t(2784),a=t(8745),r=t(2634),o=function(e){return n.createElement(r.A,{title:"How to set up Lingua Franca",description:"Use Lingua Franca",lang:e.pageContext.lang},n.createElement("div",{className:"raised main-content-block"},n.createElement("h1",null,"Download and Install Lingua Franca"),n.createElement("p",null,"All Lingua Franca tools require Java 17 or up (",n.createElement("a",{href:"https://www.oracle.com/java/technologies/downloads/"},"download from Oracle"),"). Each target language may have additional requirements (see the ",n.createElement("a",{href:"/docs/handbook/target-language-details#requirements"},"Target Language Details")," page and select your target language). The alternatives for using Lingua Franca are:",n.createElement("ul",null,n.createElement("li",null,n.createElement("a",{href:"#vscode"},"Use the Visual Studio Code extension")),n.createElement("li",null,n.createElement("a",{href:"#download-epoch"},"Download Epoch, the Eclipse-based IDE")),n.createElement("li",null,n.createElement("a",{href:"#download-cl"},"Download the command-line tools")),n.createElement("li",null,n.createElement("a",{href:"#developer"},"Developer setup, if you will be contributing to Lingua Franca")),n.createElement("li",null,n.createElement("a",{href:"https://vm.lf-lang.org/"},"Download an Ubuntu virtual machine with Epoch preinstalled")),n.createElement("li",null,n.createElement("a",{href:"https://github.com/lf-lang/lingua-franca/releases/"},"See all releases"))))),n.createElement("div",{className:"raised main-content-block"},n.createElement("h2",{id:"vscode"},"Visual Studio Code"),n.createElement("p",null,"The easiest way to get started with Lingua Franca is to install our Visual Studio Code extension from the ",n.createElement("a",{href:"https://marketplace.visualstudio.com/items?itemName=lf-lang.vscode-lingua-franca"},"Visual Studio Marketplace")," or ",n.createElement("a",{href:"https://open-vsx.org/extension/lf-lang/vscode-lingua-franca"},"VSX Registry"),". To install this extension from the marketplace, launch VS Code Quick Open (",n.createElement("kbd",null,"Ctrl")," + ",n.createElement("kbd",null,"P"),") and enter ",n.createElement("code",null,"ext install lf-lang.vscode-lingua-franca"),". See ",n.createElement("a",{href:"/docs/handbook/code-extension"},"more details"),".")),n.createElement("div",{className:"raised main-content-block"},n.createElement("h2",{id:"download-epoch"},"Epoch IDE"),n.createElement("p",null,"Epoch can be installed in any directory. It is convenient to add the installation directory to your ",n.createElement("code",null,"PATH"),". On a Mac, you can drag ",n.createElement("code",null,"epoch.app")," to the Applications folder and open it from anywhere using ",n.createElement("code",null,"open -a epoch"),". To download the current development version of Epoch, replace the following tar and zip files with those from the ",n.createElement("a",{href:"https://github.com/lf-lang/lingua-franca/releases/tag/nightly"},"nightly build"),"."),n.createElement("section",{style:{display:"flex",flexWrap:"wrap"}},n.createElement("div",{style:{borderRight:"1px lightgrey solid",padding:"1rem",flex:1,minWidth:"240px"}},n.createElement("h3",null,"Linux"),"Download ",n.createElement("a",{href:"https://github.com/lf-lang/lingua-franca/releases/download/v0.3.0/epoch_ide_0.3.0-linux.gtk.x86_64.tar.gz"},"Epoch IDE 0.3.0 for Linux")," and run:",n.createElement("p",null,n.createElement("code",null,"tar xvf epoch_ide_0.3.0-linux.gtk.x86_64.tar.gz")),n.createElement("p",null,n.createElement("code",null,"cd epoch_ide_0.3.0-linux.gtk.x86_64")),n.createElement("p",null,n.createElement("code",null,"./epoch"))),n.createElement("div",{style:{borderRight:"1px lightgrey solid",padding:"1rem",flex:1,minWidth:"240px"}},n.createElement("h3",null,"macOS"),"Download ",n.createElement("a",{href:"https://github.com/lf-lang/lingua-franca/releases/download/v0.3.0/epoch_ide_0.3.0-macosx.cocoa.x86_64.tar.gz"},"Epoch IDE 0.3.0 for macOS")," and run:",n.createElement("p",null,n.createElement("code",null,"open epoch_ide_0.3.0-macosx.cocoa.x86_64.tar")),n.createElement("p",null,n.createElement("code",null,"xattr -cr Epoch.app")),n.createElement("p",null,n.createElement("code",null,"open -a Epoch"))),n.createElement("div",{style:{padding:"1rem",flex:1,minWidth:"240px"}},n.createElement("h3",null,"Windows"),"Download ",n.createElement("a",{href:"https://github.com/lf-lang/lingua-franca/releases/download/v0.3.0/epoch_ide_0.3.0-win32.win32.x86_64.zip"},"Epoch IDE 0.3.0 for Windows")," and run:",n.createElement("p",null,n.createElement("code",null,"unzip epoch_ide_0.3.0-win32.win32.x86_64.zip")),n.createElement("p",null,n.createElement("code",null,"cd epoch_ide_0.3.0-win32.win32.x86_64")),n.createElement("p",null,n.createElement("code",null,".\\epoch")))),"See ",n.createElement("a",{href:"/docs/handbook/epoch-ide"},"more details"),"."),n.createElement("div",{className:"raised main-content-block"},n.createElement("h2",{id:"download-cl"},"Lingua Franca Compiler (command-line)"),n.createElement("p",null,"Our command line compiler can be installed in any directory. It is most convenient to add the ",n.createElement("code",null,"bin")," directory to your ",n.createElement("code",null,"PATH"),". To download the current development version of the command-line tools, replace the following tar and zip files with those from the ",n.createElement("a",{href:"https://github.com/lf-lang/lingua-franca/releases/tag/nightly"},"nightly build"),"."),n.createElement("section",{style:{display:"flex",flexWrap:"wrap"}},n.createElement("div",{style:{borderRight:"1px lightgrey solid",padding:"1rem",flex:1,minWidth:"240px"}},n.createElement("h3",null,"Linux and macOS"),"Download ",n.createElement("a",{href:"https://github.com/lf-lang/lingua-franca/releases/download/v0.3.0/lfc_0.3.0.tar.gz"},"lfc 0.3.0 for Linux/Mac")," and run:",n.createElement("p",null,n.createElement("code",null,"tar xvf lfc_0.3.0.tar.gz")),n.createElement("p",null,n.createElement("code",null,"./lfc_0.3.0/bin/lfc --version"))),n.createElement("div",{style:{padding:"1rem",flex:1,minWidth:"240px"}},n.createElement("h3",null,"Windows"),"Download ",n.createElement("a",{href:"https://github.com/lf-lang/lingua-franca/releases/download/v0.3.0/lfc_0.3.0.zip"},"lfc 0.3.0 for Windows")," and run:",n.createElement("p",null,n.createElement("code",null,"unzip lfc_0.3.0.zip")),n.createElement("p",null,n.createElement("code",null,".\\lfc_0.3.0\\bin\\lfc.ps1 --version")))),"See ",n.createElement("a",{href:"/docs/handbook/command-line-tools"},"more details"),"."),n.createElement("div",{className:"raised main-content-block"},n.createElement("h2",{id:"developer"},"Developer Setup"),n.createElement("p",null,"If you'd like to contribute to Lingua Franca and build our toolchain on your own, you will need to check out our ",n.createElement("a",{href:"https://repo.lf-lang.org/"},"GitHub repository"),". The toolchain can built using Gradle or Maven, which have integrations with most IDEs. For Eclipse users, we provide an Oomph setup."),n.createElement("section",{style:{display:"flex",flexWrap:"wrap"}},n.createElement("div",{style:{borderRight:"1px lightgrey solid",padding:"1rem",flex:1,minWidth:"240px"}},n.createElement("h3",null,"Cloning our repository"),n.createElement("ul",null,n.createElement("li",null,"If you have public-key authentication set up:",n.createElement("p",null,n.createElement("code",null,"git clone git@github.com:lf-lang/lingua-franca.git"))),n.createElement("li",null,"If you prefer to clone using the web URL:",n.createElement("p",null,n.createElement("code",null,"git clone https://github.com/lf-lang/lingua-franca.git"))))),n.createElement("div",{style:{borderRight:"1px lightgrey solid",padding:"1rem",flex:1,minWidth:"240px"}},n.createElement("h3",null,"Building from the command line"),n.createElement("ul",null,n.createElement("li",null,"Gradle:",n.createElement("p",null,n.createElement("code",null,"./gradlew assemble")," (the build also performs tests, which takes a long time)")),n.createElement("li",{style:{marginTop:"20px"}},"Maven:",n.createElement("p",null,n.createElement("code",null,"mvn compile")," (you need to install Maven first)")))),n.createElement("div",{style:{padding:"1rem",flex:1,minWidth:"240px"}},n.createElement("h3",null,"Oomph setup for Eclipse"),n.createElement("ul",null,n.createElement("li",null,"Download the ",n.createElement("a",{href:"https://www.eclipse.org/downloads/index.php"},"Eclipse installer"),"."),n.createElement("li",null,'Click the Hamburger button at the top right corner and switch to "Advanced Mode".'),n.createElement("li",null,'Select "Eclipse IDE for Java and DSL developers".'),n.createElement("li",null,"Continue reading ",n.createElement("a",{href:"/docs/handbook/eclipse-oomph"},"here...")))))))};l.default=function(e){return n.createElement(a.R,{locale:e.pageContext.lang},n.createElement(o,e))}}}]);
//# sourceMappingURL=component---src-templates-pages-download-tsx-7f087df24615ce17ce57.js.map