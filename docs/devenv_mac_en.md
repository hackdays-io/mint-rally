## Install the development platforms that are prerequisites for developing MintRally.
Install the following in order:
- Homebrew
- Node
- Yarn

## Install Homebrew
[Homebrew](https://brew.sh/index_ja "Link to the distribution site") is a package manager for macOS. Follow the instructions below to install Homebrew.

1. Open the Terminal. Use Spotlight search (Cmd + Space) and type 'Terminal' to launch it.

2. Execute the following command in the Terminal to install Homebrew.

   ```shell
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

3. Installation verification
   ```shell
   brew --version
   ``` 
   There's no specified version for Homebrew; if version information is displayed, then Homebrew is successfully installed, and you can proceed to the next step.
   If no version information is displayed, there may be a typo in the install command or a network error, so please check the install log.

## Install Node
Node.js is a JavaScript runtime environment and platform for executing JavaScript on the server-side. Follow the instructions below to install Node.
1. Execute the following command in the Terminal to install Node.js.
   ```shell
   brew install node@18
   ```
   MintRally has been tested and confirmed to work with versions 16 and 18. Therefore, we specify version 18 for installation.

2. Since we've specified the Node version, it will be "keg-only" and not linked to the PATH, so execute the following command.

   ```shell
   echo 'export PATH="/opt/homebrew/opt/node@18/bin:$PATH"' >> ~/.zshrc
   ```

3. Installation verification
   ```shell
   node -v
   ```
   If no version information is displayed, there may be a typo in the install command or a network error, so please check the install log.
   
## Install Yarn
Yarn is a package manager for JavaScript, a tool for managing dependencies and efficiently installing packages. Follow the instructions below to install Yarn.
1. Execute the following command in the Terminal to install Yarn.

   ```shell
   npm install -g yarn
   ```
   
2. Installation verification
   ```shell
   yarn --version
   ```
   The version isn't important; as long as version information is displayed, the installation is successful, and you can proceed to the next step.
   If no version information is displayed, there may be a typo in the install command or a network error, so please check the install log.

## Note
While Node and Yarn are mandatory for MintRally, Homebrew is not.
Thus, it is possible to install Node without Homebrew, but managing Node with Homebrew is the de facto standard for development on Mac. Therefore, we also install Homebrew as per this standard in this guide.  

To comply with the constraints listed in [MintRally's dependencies](https://github.com/hackdays-io/mint-rally/blob/main/docs/frontend.md#dependencies), we are installing Version 16 of Node instead of the latest version.
Next.js is incorporated via yarn commands according to the contents of package.json so it is not mentioned in these instructions.
Any source code editor is fine to use, but VSC (VisualStudioCode) is recommended.